import Auth from '../utils/auth';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
}

const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';


export async function ensureServiceWorkerExists() {
  if (!('serviceWorker' in navigator)) {
    console.error('Service Worker tidak didukung browser ini');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      console.log('Service Worker sudah terdaftar dengan scope:', registration.scope);
      return true;
    }

    const newRegistration = await navigator.serviceWorker.register('/service-worker.js');
    console.log('Service Worker berhasil didaftarkan dengan scope:', newRegistration.scope);
 
    if (newRegistration.installing) {
      console.log('Menunggu service worker selesai instalasi...');
      await new Promise(resolve => {
        newRegistration.installing.addEventListener('statechange', e => {
          if (e.target.state === 'activated') {
            console.log('Service Worker aktif');
            resolve();
          }
        });
      });
    }
    
    return true;
  } catch (error) {
    console.error('Gagal mendaftarkan Service Worker:', error);
    return false;
  }
}

export function isNotificationAvailable() {
  return 'Notification' in window;
}

export function isNotificationGranted() {
  return Notification.permission === 'granted';
}


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

export async function getPushSubscription() {
  try {
    const serviceWorkerReady = await ensureServiceWorkerExists();
    if (!serviceWorkerReady) {
      console.error('Service worker tidak terdaftar dan gagal didaftarkan');
      return null;
    }
    
    await navigator.serviceWorker.ready;
    
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      console.error('Service worker tidak terdaftar setelah diperiksa kembali');
      return null;
    }
    
    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error('Error getting push subscription:', error);
    return null;
  }
}

export async function isCurrentPushSubscriptionAvailable() {
  return !!(await getPushSubscription());
}

export function generateSubscribeOptions() {
  return {
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  };
}

export async function subscribe() {
  try {
    const serviceWorkerReady = await ensureServiceWorkerExists();
    if (!serviceWorkerReady) {
      alert('Service worker tidak dapat didaftarkan. Push notification tidak akan berfungsi.');
      return false;
    }

    if (!(await requestNotificationPermission())) {
      return false;
    }

    if (await isCurrentPushSubscriptionAvailable()) {
      console.log('Sudah berlangganan push notification.');
      return true;
    }

    const failureSubscribeMessage = 'Langganan push notification gagal diaktifkan.';
    const successSubscribeMessage = 'Langganan push notification berhasil diaktifkan.';

    await navigator.serviceWorker.ready;
    
    let pushSubscription;
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        console.error('Service worker tidak terdaftar setelah diperiksa kembali');
        alert(failureSubscribeMessage);
        return false;
      }
      
      if (!registration.pushManager) {
        console.error('PushManager tidak tersedia di browser ini');
        alert('Push notification tidak didukung oleh browser Anda.');
        return false;
      }

      pushSubscription = await registration.pushManager.subscribe(generateSubscribeOptions());
      
      if (!pushSubscription) {
        console.error('Gagal mendapatkan push subscription');
        alert(failureSubscribeMessage);
        return false;
      }

      const subscriptionData = pushSubscription.toJSON();
      const { endpoint, keys } = subscriptionData;
      
      console.log('Push subscription berhasil dibuat:', subscriptionData);
      
      const token = Auth.getToken();
      if (!token) {
        console.error('Token tidak tersedia');
        alert('Anda perlu login untuk berlangganan notifikasi');
        await pushSubscription.unsubscribe();
        return false;
      }

      const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ endpoint, keys }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Subscribe API error:', responseData);
        alert(`${failureSubscribeMessage} (${responseData.message || response.status})`);
        await pushSubscription.unsubscribe();
        return false;
      }

      console.log('Subscription berhasil disimpan di server:', responseData);
      alert(successSubscribeMessage);
      return true;
    } catch (error) {
      console.error('Subscribe error:', error);
    
      if (error.name === 'NotAllowedError') {
        alert('Izin push notification ditolak. Silakan aktifkan izin notifikasi di pengaturan browser.');
      } else {
        alert(`${failureSubscribeMessage} (${error.message})`);
      }
      
      if (pushSubscription) {
        await pushSubscription.unsubscribe();
      }
      return false;
    }
  } catch (generalError) {
    console.error('General subscribe error:', generalError);
    alert('Terjadi kesalahan saat berlangganan notifikasi.');
    return false;
  }
}

let isAlertShown = false;

export async function unsubscribe() {
  const failureUnsubscribeMessage = 'Langganan push notification gagal dinonaktifkan.';
  const successUnsubscribeMessage = 'Langganan push notification berhasil dinonaktifkan.';

  isAlertShown = false;

  try {
    const pushSubscription = await getPushSubscription();

    if (!pushSubscription) {
      if (!isAlertShown) {
        isAlertShown = true;
        alert('Tidak bisa memutus langganan push notification karena belum berlangganan sebelumnya.');
      }
      return false;
    }

    let endpoint;
    try {
      endpoint = pushSubscription.toJSON().endpoint;
    } catch (err) {
      console.error('Error mendapatkan endpoint:', err);
    }
    try {
      const unsubscribed = await pushSubscription.unsubscribe();
      if (!unsubscribed) {
        console.error('Gagal berhenti langganan pada level browser');
        if (!isAlertShown) {
          isAlertShown = true;
          alert(failureUnsubscribeMessage);
        }
        return false;
      }
      console.log('Berhasil unsubscribe di level browser');
    } catch (browserError) {
      console.error('Error saat unsubscribe di level browser:', browserError);
      if (!isAlertShown) {
        isAlertShown = true;
        alert(failureUnsubscribeMessage);
      }
      return false;
    }

    if (endpoint) {
      try {
        const token = Auth.getToken();
        
        if (!token) {
          console.log('Token tidak tersedia untuk unsubscribe dari server, tapi unsubscribe lokal berhasil');
          if (!isAlertShown) {
            isAlertShown = true;
            alert(successUnsubscribeMessage);
          }
          return true;
        }
        
        const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ endpoint }),
        });

        if (!response.ok) {
          console.error('Unsubscribe API error:', response.status);
          console.log('Unsubscribe lokal berhasil tapi API gagal');
          if (!isAlertShown) {
            isAlertShown = true;
            alert(successUnsubscribeMessage);
          }
          return true;
        }
        
        console.log('Unsubscribe berhasil di server dan lokal');
      } catch (apiError) {
        console.error('Error saat menghapus subscription dari server:', apiError);
        if (!isAlertShown) {
          isAlertShown = true;
          alert(successUnsubscribeMessage);
        }
        return true;
      }
    }

    if (!isAlertShown) {
      isAlertShown = true;
      alert(successUnsubscribeMessage);
    }
    return true;
  } catch (error) {
    console.error('Unsubscribe error:', error);
    if (!isAlertShown) {
      isAlertShown = true;
      alert(failureUnsubscribeMessage);
    }
    return false;
  }
}


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
