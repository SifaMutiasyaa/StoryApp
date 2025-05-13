import Auth from '../../utils/auth';
import {
  subscribe,
  unsubscribe,
  isCurrentPushSubscriptionAvailable,
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

    const updateButtonVisibility = (subscribed) => {
      subscribeBtn.style.display = subscribed ? 'none' : 'inline-block';
      unsubscribeBtn.style.display = subscribed ? 'inline-block' : 'none';
    };

    let subscribed = await isCurrentPushSubscriptionAvailable();
    updateButtonVisibility(subscribed);

    subscribeBtn.addEventListener('click', async () => {
      const result = await subscribe();
      if (result) {
        subscribed = true;
        updateButtonVisibility(true);
        alert('Berhasil berlangganan notifikasi!');
      } else {
        alert('Gagal berlangganan notifikasi.');
      }
    });

    unsubscribeBtn.addEventListener('click', async () => {
      const result = await unsubscribe();
      if (result) {
        subscribed = false;
        updateButtonVisibility(false);
        alert('Berhasil berhenti langganan notifikasi.');
      } else {
        alert('Gagal berhenti langganan notifikasi.');
      }
    });
  },
};

export default ProfilePresenter;
