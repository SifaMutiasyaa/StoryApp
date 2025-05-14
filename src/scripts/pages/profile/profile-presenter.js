import Auth from '../../utils/auth';
import {
  subscribe,
  unsubscribe,
  isCurrentPushSubscriptionAvailable,
  NotificationHelper,
  ensureServiceWorkerExists
} from '../../utils/notification-helper.js';

const ProfilePresenter = {
  async init() {
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn?.addEventListener('click', () => {
      Auth.clearToken();
      Auth.clearUser();
      window.location.hash = '#/login';
      window.location.reload();
    });

    const subscribeBtn = document.getElementById('subscribe-button');
    const unsubscribeBtn = document.getElementById('unsubscribe-button');

    if (!subscribeBtn || !unsubscribeBtn) return;

    // Pastikan service worker siap terlebih dahulu
    await ensureServiceWorkerExists();

    // Fungsi untuk memperbarui tampilan dan teks tombol berdasarkan status langganan
    const updateButtons = (isSubscribed) => {
      // Tampilan tombol
      subscribeBtn.style.display = isSubscribed ? 'none' : 'inline-block';
      unsubscribeBtn.style.display = isSubscribed ? 'inline-block' : 'none';
      
      // Pastikan teks tombol selalu sesuai
      subscribeBtn.textContent = 'Langganan';
      subscribeBtn.innerHTML = '<i class="fas fa-bell"></i> Langganan';
      
      unsubscribeBtn.textContent = 'Berhenti Langganan';
      unsubscribeBtn.innerHTML = '<i class="fas fa-bell-slash"></i> Berhenti Langganan';
    };

    // Periksa apakah notifikasi didukung
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notification tidak didukung');
      subscribeBtn.innerHTML = '<i class="fas fa-bell-slash"></i> Notifikasi tidak didukung';
      subscribeBtn.disabled = true;
      unsubscribeBtn.style.display = 'none';
      return;
    }

    try {
      // Periksa status langganan saat ini
      let isSubscribed = await isCurrentPushSubscriptionAvailable();
      updateButtons(isSubscribed);

      // Event listener untuk tombol langganan
      subscribeBtn.addEventListener('click', async () => {
        if (subscribeBtn.disabled) return; // Prevent double click
        
        try {
          // Disable button while processing
          subscribeBtn.disabled = true;
          subscribeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
          
          const result = await subscribe();
          
          if (result) {
            isSubscribed = true;
            updateButtons(isSubscribed);
            
            // Tunggu sebentar sebelum menampilkan notifikasi (hindari konflik dengan alert)
            setTimeout(() => {
              try {
                NotificationHelper.sendPushNotification(
                  'Notifikasi berhasil diaktifkan!',
                  { body: 'Anda akan menerima update terbaru dari StoryApp' }
                );
              } catch (notifError) {
                console.error('Error showing notification:', notifError);
              }
            }, 1000);
          }
        } catch (error) {
          console.error('Error subscribing:', error);
          // Don't show another alert since subscribe() already shows one
        } finally {
          // Re-enable button dengan tampilan yang benar
          subscribeBtn.disabled = false;
          updateButtons(isSubscribed);
        }
      });

      // Event listener untuk tombol berhenti langganan
      unsubscribeBtn.addEventListener('click', async () => {
        if (unsubscribeBtn.disabled) return; // Prevent double click
        
        try {
          // Disable button while processing
          unsubscribeBtn.disabled = true;
          unsubscribeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
          
          const result = await unsubscribe();
          
          if (result) {
            isSubscribed = false;
            updateButtons(isSubscribed);
          }
        } catch (error) {
          console.error('Error unsubscribing:', error);
          // Don't show another alert since unsubscribe() already shows one
        } finally {
          // Re-enable button dengan tampilan yang benar
          unsubscribeBtn.disabled = false;
          updateButtons(isSubscribed);
          
          // Verifikasi status langganan setelah beberapa saat
          setTimeout(async () => {
            try {
              const currentStatus = await isCurrentPushSubscriptionAvailable();
              if (currentStatus !== isSubscribed) {
                console.log('Status langganan berubah, memperbarui tampilan...');
                isSubscribed = currentStatus;
                updateButtons(isSubscribed);
              }
            } catch (statusError) {
              console.error('Error checking subscription status:', statusError);
            }
          }, 1000);
        }
      });
    } catch (error) {
      console.error('Error initializing push notification UI:', error);
      subscribeBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Gagal memuat status notifikasi';
      subscribeBtn.disabled = true;
    }
  },
};

export default ProfilePresenter;
