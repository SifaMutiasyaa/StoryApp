import StoryApi from '../../data/api';
import Auth from '../../utils/auth';
import Swal from 'sweetalert2';
import L from 'leaflet';
import { NotificationHelper } from '../../utils/notification-helper.js';

export default class AddStoryPresenter {
  constructor(view) {
    this._view = view;
    this._photoFile = null;
    this._map = null;
    this._marker = null;
    this._lat = null;
    this._lon = null;
    this._stream = null;
    this._usingRearCamera = false;
  }

  async renderHTML() {
    return `<!-- salin seluruh HTML + <style> dari versi sebelumnya -->`;
  }

  async init() {
    this._initMap();
    this._setupEventListeners();
  }

  _initMap() {
    this._map = L.map('map').setView([-2.5489, 118.0149], 5);
  
    // Definisikan base layer sama seperti di detail story
    const baseLayers = {
      "OpenStreetMap": L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { attribution: '&copy; OpenStreetMap contributors' }
      ),
      "Esri WorldImagery": L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX' }
      )
    };
    baseLayers["OpenStreetMap"].addTo(this._map);
    L.control.layers(baseLayers).addTo(this._map);
    this._map.on('click', (e) => this._updateLocation(e.latlng.lat, e.latlng.lng));
  }
  
  _updateLocation(lat, lon) {
    this._lat = lat;
    this._lon = lon;
    if (this._marker) this._map.removeLayer(this._marker);
    this._marker = L.marker([lat, lon]).addTo(this._map).bindPopup('Story location').openPopup();
  }

  _setupEventListeners() {
    document.getElementById('photo').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this._photoFile = file;
        this._showPhotoPreview(URL.createObjectURL(file));
      }
    });

    document.getElementById('open-camera').addEventListener('click', () => this._openCameraModal());
    document.querySelector('.close-modal').addEventListener('click', () => this._closeCameraModal());
    document.getElementById('switch-camera').addEventListener('click', () => {
      this._usingRearCamera = !this._usingRearCamera;
      this._initCameraStream();
    });
    document.getElementById('capture-btn').addEventListener('click', () => this._capturePhoto());

    document.getElementById('get-location').addEventListener('click', () => {
      navigator.geolocation?.getCurrentPosition((pos) => {
        this._updateLocation(pos.coords.latitude, pos.coords.longitude);
        this._map.setView([this._lat, this._lon], 15);
      });
    });

    document.getElementById('story-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this._handleFormSubmit();
    });
  }

  async _openCameraModal() {
    document.getElementById('camera-modal').style.display = 'block';
    await this._initCameraStream();
  }

  _closeCameraModal() {
    document.getElementById('camera-modal').style.display = 'none';
    this._stopCameraStream();
  }

  async _initCameraStream() {
    try {
      if (this._stream) this._stopCameraStream();
      const constraints = {
        video: {
          facingMode: this._usingRearCamera ? 'environment' : 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      };
      this._stream = await navigator.mediaDevices.getUserMedia(constraints);
      document.getElementById('camera-view').srcObject = this._stream;
    } catch (err) {
      console.error('Camera error:', err);
      alert('Unable to access camera.');
    }
  }

  _stopCameraStream() {
    this._stream?.getTracks().forEach((track) => track.stop());
    document.getElementById('camera-view').srcObject = null;
    this._stream = null;
  }

  _capturePhoto() {
    const video = document.getElementById('camera-view');
    const canvas = document.getElementById('camera-canvas');
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      this._photoFile = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
      this._showPhotoPreview(URL.createObjectURL(blob));
      this._closeCameraModal();
    }, 'image/jpeg', 0.95);
  }

  _showPhotoPreview(url) {
    const previewContainer = document.getElementById('photo-preview');
    previewContainer.innerHTML = '';

    const img = document.createElement('img');
    img.src = url;
    img.alt = 'Preview';
    img.className = 'photo-preview-image';

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-photo-button';
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', () => {
      this._photoFile = null;
      previewContainer.innerHTML = '';
    });

    previewContainer.appendChild(img);
    previewContainer.appendChild(removeBtn);
  }

  async _handleFormSubmit() {
    const submitBtn = document.querySelector('#story-form button[type="submit"]');
    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

      const description = document.getElementById('description').value.trim();
      if (!description) throw new Error('Description is required.');
      if (!this._photoFile) throw new Error('Please select or take a photo.');

      const formData = new FormData();
      formData.append('description', description);
      formData.append('photo', this._photoFile);
      if (this._lat && this._lon) {
        formData.append('lat', this._lat);
        formData.append('lon', this._lon);
      }

      const token = Auth.getToken();
      const response = token
        ? await StoryApi.addStory({ token, data: formData })
        : await StoryApi.addStoryGuest(formData);

      if (response.error) throw new Error(response.message || 'Failed to submit.');

      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Story has been submitted!',
        timer: 2000,
        showConfirmButton: false,
      });

      // ✅ Kirim push notification setelah story sukses dikirim
NotificationHelper.sendPushNotification('Story berhasil dikirim!', {
  body: 'Terima kasih sudah membagikan ceritamu.',
});


      window.location.hash = '#/';
    } catch (err) {
      console.error(err);
      Swal.fire('Oops!', err.message || 'Error submitting story.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Story';
    }
  }

  destroy() {
    this._stopCameraStream();
    if (this._map) {
      this._map.remove();
      this._map = null;
      this._marker = null;
    }
  }
}

