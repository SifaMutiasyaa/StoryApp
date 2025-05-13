import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import AddStoryPresenter from '../add-story/add-story-presenter';

export default class AddStoryPage {
  constructor() {
    this._presenter = new AddStoryPresenter(this);
  }

  async render() {
    return `
      <style>
        .container {
          padding: 2rem;
        }

        .form-wrapper {
          background-color: #AFDDFF;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .form-wrapper h1 {
          text-align: center;
          color: #004AAD;
          margin-bottom: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        label {
          font-weight: bold;
          display: block;
          margin-bottom: 0.5rem;
          color: #004AAD;
        }

        textarea, input, button, select {
          width: 100%;
          padding: 0.8rem;
          font-size: 1rem;
          border-radius: 8px;
          border: 1px solid #ccc;
        }

        textarea:focus, input:focus {
          outline: none;
          border-color: #60B5FF;
        }

        button {
          background-color: #60B5FF;
          color: white;
          border: none;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        button:hover {
          background-color: #FF9149;
        }

        #photo-preview {
          margin-top: 1rem;
          position: relative;
        }

        .photo-preview-image {
          max-width: 100%;
          max-height: 250px;
          border-radius: 8px;
          margin-top: 0.5rem;
          object-fit: cover;
        }

        .remove-photo-button {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 28px;
          height: 28px;
          background-color: rgba(255, 0, 0, 0.8);
          color: white;
          border: none;
          border-radius: 50%;
          font-size: 1.2rem;
          font-weight: bold;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        .remove-photo-button:hover {
          background-color: rgba(255, 0, 0, 1);
        }

        #map {
          height: 300px;
          border-radius: 8px;
        }

        .modal {
          display: none;
          position: fixed;
          z-index: 1000;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          overflow: auto;
          background-color: rgba(0, 0, 0, 0.5);
        }

        .modal-content {
          background-color: #FFFECB;
          margin: 5% auto;
          padding: 20px;
          border-radius: 8px;
          max-width: 480px;
          width: 90%;
          position: relative;
        }

        .camera-container video {
          width: 100%;
          border-radius: 8px;
        }

        .camera-controls {
          display: flex;
          justify-content: space-between;
          margin-top: 1rem;
        }

        .camera-button {
          background-color: #60B5FF;
          color: white;
          padding: 0.6rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .camera-button:hover {
          background-color: #FF9149;
        }

        .close-modal {
          position: absolute;
          top: 10px;
          right: 16px;
          font-size: 1.5rem;
          cursor: pointer;
        }
        @media screen and (max-width: 768px) {
       .container {
        padding: 1rem;
        }

        .form-wrapper {
        padding: 1.2rem;
        }

      .form-wrapper h1 {
        font-size: 1.4rem;
      }

      label {
        font-size: 0.95rem;
        }

      textarea, input, button, select {
      font-size: 0.95rem;
      padding: 0.7rem;
        }

      .photo-preview-image {
        max-height: 200px;
      }

      .modal-content {
      margin: 10% auto;
      padding: 16px;
      }

      .camera-controls {
        flex-direction: column;
        gap: 0.5rem;
      }

      .camera-button {
      width: 100%;
      padding: 0.8rem;
      }
      }
      </style>

      <section class="container">
        <div class="form-wrapper">
          <h1><i class="fas fa-plus-circle"></i> Add New Story</h1>
          <form id="story-form">
            <div class="form-group">
              <label for="description">Description</label>
              <textarea id="description" rows="3" required placeholder="Write something..."></textarea>
            </div>

            <div class="form-group">
              <label for="photo">Photo</label>
              <input type="file" id="photo" accept="image/*" />
              <button type="button" id="open-camera">Take Photo</button>
              <div id="photo-preview"></div>
            </div>

            <div class="form-group">
              <label for="map">Choose Location</label>
              <div id="map"></div>
              <button type="button" id="get-location" style="margin-top: 0.5rem;">Use Current Location</button>
            </div>

            <button type="submit">Submit Story</button>
          </form>
        </div>

        <div id="camera-modal" class="modal">
          <div class="modal-content">
            <span class="close-modal">&times;</span>
            <div class="camera-container">
              <video id="camera-view" autoplay playsinline></video>
              <canvas id="camera-canvas" style="display:none;"></canvas>
              <div class="camera-controls">
                <button id="switch-camera" class="camera-button">Switch</button>
                <button id="capture-btn" class="camera-button">Take Photo</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    await this._presenter.init();
  }

  destroy() {
    this._presenter.destroy();
  }
}
