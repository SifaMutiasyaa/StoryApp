import 'regenerator-runtime';
import '../styles/styles.css';
import routes from './routes/routes';
import UrlParser from './routes/url-parser';
import Auth from './utils/auth';
import { subscribe, unsubscribe, NotificationHelper, ensureServiceWorkerExists } from './utils/notification-helper';

let app = null;

const updateAuthUI = () => {
  const loginLink = document.querySelector('#login-link');
  const logoutLink = document.querySelector('#logout-link');
  if (loginLink && logoutLink) {
    if (Auth.isAuthenticated()) {
      loginLink.style.display = 'none';
      logoutLink.style.display = 'inline';
    } else {
      loginLink.style.display = 'inline';
      logoutLink.style.display = 'none';
    }
  }
};

const renderPage = async () => {
  if (!app) {
    console.error('Element #app not found.');
    return;
  }

  const url = UrlParser.parseActiveUrlWithCombiner();
  const page = routes[url];

  if (!page) {
    app.innerHTML = '<h2>Page Not Found</h2>';
    return;
  }

  try {
    if (typeof page.init === 'function') {
      await page.init(app);
    } else if (typeof page === 'function') {
      const pageInstance = new page();
      if (typeof pageInstance.render === 'function') {
        app.innerHTML = await pageInstance.render();
        if (typeof pageInstance.afterRender === 'function') {
          await pageInstance.afterRender();
        }
      } else {
        app.innerHTML = '<h2>Invalid Page Component</h2>';
      }
    } else {
      app.innerHTML = '<h2>Page Not Found</h2>';
    }
  } catch (error) {
    app.innerHTML = `<h2>Error: ${error.message}</h2>`;
  }

  updateAuthUI();
};

const updateNotificationButtons = async () => {
  const subscribeButton = document.querySelector('#subscribe-button');
  const unsubscribeButton = document.querySelector('#unsubscribe-button');
  
  if (!subscribeButton || !unsubscribeButton) return;
  
  try {
    const { isCurrentPushSubscriptionAvailable } = await import('./utils/notification-helper');
    const isSubscribed = await isCurrentPushSubscriptionAvailable();
    
    subscribeButton.style.display = isSubscribed ? 'none' : 'inline-block';
    unsubscribeButton.style.display = isSubscribed ? 'inline-block' : 'none';
    
    // Konsistensi pada teks dan icon
    subscribeButton.innerHTML = '<i class="fas fa-bell"></i> Langganan';
    unsubscribeButton.innerHTML = '<i class="fas fa-bell-slash"></i> Berhenti Langganan';
  } catch (error) {
    console.error('Error updating notification buttons:', error);
  }
};


document.addEventListener('DOMContentLoaded', async () => {
  app = document.querySelector('#app');
  renderPage();

  if ('serviceWorker' in navigator) {
    try {
      await ensureServiceWorkerExists();
    
      if (window.Notification && Notification.permission === 'granted') {
        setTimeout(() => {
          NotificationHelper.sendPushNotification(
            'StoryApp siap digunakan!', 
            { body: 'Aplikasi telah siap digunakan dalam mode offline' }
          );
        }, 1000);
      }
    } catch (error) {
      console.error('Gagal memastikan Service Worker:', error);
    }
  }

  const logoutLink = document.querySelector('#logout-link');
  logoutLink?.addEventListener('click', () => {
    Auth.deleteToken();
    window.location.hash = '#/login';
    updateAuthUI();
  });

  const subscribeButton = document.querySelector('#subscribe-button');
  subscribeButton?.addEventListener('click', async () => {
    if (subscribeButton.disabled) return;
    
    try {
      subscribeButton.disabled = true;
      subscribeButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
      
      await subscribe();
 
      await updateNotificationButtons();
    } catch (error) {
      console.error('Error subscribing:', error);
    } finally {
      subscribeButton.disabled = false;
      subscribeButton.innerHTML = '<i class="fas fa-bell"></i> Langganan';
    }
  });

  const unsubscribeButton = document.querySelector('#unsubscribe-button');
  unsubscribeButton?.addEventListener('click', async () => {
    if (unsubscribeButton.disabled) return;
    
    try {
      unsubscribeButton.disabled = true;
      unsubscribeButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
      
      await unsubscribe();
      
      await updateNotificationButtons();
    } catch (error) {
      console.error('Error unsubscribing:', error);
    } finally {
      unsubscribeButton.disabled = false;
      unsubscribeButton.innerHTML = '<i class="fas fa-bell-slash"></i> Berhenti Langganan';
    }
  });

  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installButton = document.querySelector('#install-button');
    if (installButton) {
      installButton.style.display = 'inline-block';
      installButton.addEventListener('click', async () => {
        installButton.style.display = 'none';
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);
        deferredPrompt = null;
      });
    }
  });
});

window.addEventListener('hashchange', renderPage);
