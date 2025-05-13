import Auth from '../utils/auth';

// Fungsi untuk mengonversi Base64 ke Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
}

// Public key VAPID
const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

// Fungsi untuk mengecek apakah notifikasi tersedia
export function isNotificationAvailable() {
  return 'Notification' in window;
}

// Fungsi untuk mengecek apakah izin notifikasi telah diberikan
export function isNotificationGranted() {
  return Notification.permission === 'granted';
}

// Fungsi untuk meminta izin notifikasi
export async function requestNotificationPermission() {
  if (!isNotificationAvailable()) {
    console.error('Notification API unsupported.');
    return false;
  }

  if (isNotificationGranted()) {
    return true;
  }

  const status = await Notification.requestPermission();

  if (status === 'denied') {
    alert('Izin notifikasi ditolak.');
    return false;
  }

  if (status === 'default') {
    alert('Izin notifikasi ditutup atau diabaikan.');
    return false;
  }

  return true;
}

// Fungsi untuk mendapatkan subscription push saat ini
export async function getPushSubscription() {
  const registration = await navigator.serviceWorker.getRegistration();
  return await registration?.pushManager.getSubscription();
}

// Fungsi untuk mengecek apakah sudah ada subscription push saat ini
export async function isCurrentPushSubscriptionAvailable() {
  return !!(await getPushSubscription());
}

// Fungsi untuk mengonfigurasi opsi subscribe
export function generateSubscribeOptions() {
  return {
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  };
}

// Fungsi untuk subscribe ke push notification
export async function subscribe() {
  if (!(await requestNotificationPermission())) {
    return false;
  }

  if (await isCurrentPushSubscriptionAvailable()) {
    alert('Sudah berlangganan push notification.');
    return true;
  }

  const failureSubscribeMessage = 'Langganan push notification gagal diaktifkan.';
  const successSubscribeMessage = 'Langganan push notification berhasil diaktifkan.';

  let pushSubscription;
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    pushSubscription = await registration.pushManager.subscribe(generateSubscribeOptions());

    const { endpoint, keys } = pushSubscription.toJSON();
    const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Auth.getToken()}`,
      },
      body: JSON.stringify({ endpoint, keys }),
    });

    if (!response.ok) {
      console.error('subscribe: response:', response);
      alert(failureSubscribeMessage);
      await pushSubscription.unsubscribe();
      return false;
    }

    alert(successSubscribeMessage);
    return true;
  } catch (error) {
    console.error('subscribe: error:', error);
    alert(failureSubscribeMessage);
    if (pushSubscription) {
      await pushSubscription.unsubscribe();
    }
    return false;
  }
}

// Fungsi untuk unsubscribe dari push notification
export async function unsubscribe() {
  const failureUnsubscribeMessage = 'Langganan push notification gagal dinonaktifkan.';
  const successUnsubscribeMessage = 'Langganan push notification berhasil dinonaktifkan.';

  try {
    const pushSubscription = await getPushSubscription();

    if (!pushSubscription) {
      alert('Tidak bisa memutus langganan push notification karena belum berlangganan sebelumnya.');
      return false;
    }

    const { endpoint } = pushSubscription.toJSON();
    const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
      method: 'DELETE', // Ganti method ke DELETE
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Auth.getToken()}`, // Tambahkan header auth
      },
      body: JSON.stringify({ endpoint }),
    });

    if (!response.ok) {
      alert(failureUnsubscribeMessage);
      console.error('unsubscribe: response:', response);
      return false;
    }

    const unsubscribed = await pushSubscription.unsubscribe();
    if (!unsubscribed) {
      alert(failureUnsubscribeMessage);
      return false;
    }

    alert(successUnsubscribeMessage);
    return true;
  } catch (error) {
    alert(failureUnsubscribeMessage);
    console.error('unsubscribe: error:', error);
    return false;
  }
}

// 🔔 Fungsi untuk memunculkan notifikasi lokal
export const NotificationHelper = {
  sendPushNotification(title, options = {}) {
    if (!('Notification' in window)) return;

    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, {
        ...options,
        icon: '/images/icon-192x192.png',
        badge: '/images/icon-512x512.png',
        vibrate: [100, 50, 100],
      });
    });
  },
};
