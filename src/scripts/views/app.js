import 'regenerator-runtime';
import '../styles/styles.css';
import routes from '../routes/routes.js';
import UrlParser from '../routes/url-parser.js';
import Auth from '../utils/auth';
import AddStoryPresenter from '../pages/add-story/add-story-presenter';
import { subscribe, unsubscribe, ensureServiceWorkerExists } from '../utils/notification-helper';

const app = {
  _currentPresenter: null,
  _currentPageInstance: null,

  async renderPage() {
    const url = UrlParser.parseActiveUrlWithCombiner();
    const PageComponent = routes[url];
    const appContainer = document.querySelector('#app');

    try {
      this._cleanUpPreviousPage();

      if (!PageComponent) {
        appContainer.innerHTML = `
          <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="font-size: 50px; color: #FF6347;">404 - Page Not Found</h1>
            <p style="font-size: 20px;">Sorry, the page you are looking for doesn't exist.</p>
            <p><a href="#/home" style="font-size: 18px; color: #008CBA; text-decoration: none;">Go back to Home</a></p>
          </div>
        `;
        return;
      }

      this._currentPageInstance = new PageComponent();
      const htmlContent = await this._currentPageInstance.render();

      await this._animatePageTransition(appContainer, htmlContent);

      if (url === '/add-story') {
        this._currentPresenter = new AddStoryPresenter(this._currentPageInstance);
        await this._currentPresenter.init();
      } else if (typeof this._currentPageInstance.afterRender === 'function') {
        await this._currentPageInstance.afterRender();
      }

      updateAuthUI();
    } catch (error) {
      console.error('Render error:', error);
      appContainer.innerHTML = '<h1>An Error Occurred</h1>';
    }
  },

  _cleanUpPreviousPage() {
    if (this._currentPresenter) {
      this._currentPresenter.destroy();
      this._currentPresenter = null;
    }

    if (this._currentPageInstance && typeof this._currentPageInstance.destroy === 'function') {
      this._currentPageInstance.destroy();
    }

    this._currentPageInstance = null;
  },

  async _animatePageTransition(container, newContent) {
    if (document.startViewTransition) {
      await document.startViewTransition(() => {
        container.innerHTML = newContent;
      }).finished;
    } else {
      await container.animate(
        [
          { opacity: 1, transform: 'scale(1)' },
          { opacity: 0, transform: 'scale(0.95)' }
        ],
        { duration: 300, easing: 'ease-in-out' }
      ).finished;

      container.innerHTML = newContent;

      await container.animate(
        [
          { opacity: 0, transform: 'scale(1.05)' },
          { opacity: 1, transform: 'scale(1)' }
        ],
        { duration: 300, easing: 'ease-in-out' }
      ).finished;
    }
  },

  async init() {
    window.addEventListener('hashchange', () => this.renderPage());
    window.addEventListener('load', () => this.renderPage());
    await this._preloadResources();
  },

  async _preloadResources() {
    const preloadList = [
      '/images/logo.png',
      '/styles/styles.css',
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css'
    ];

    await Promise.all(preloadList.map(res => fetch(res).catch(() => {})));
  }
};

function updateAuthUI() {
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
}

document.addEventListener('DOMContentLoaded', async () => {
  const logoutLink = document.querySelector('#logout-link');
  logoutLink?.addEventListener('click', () => {
    Auth.deleteToken();
    window.location.hash = '#/login';
    updateAuthUI();
  });

  const updateNotificationButtons = async () => {
    const subscribeButton = document.querySelector('#subscribe-button');
    const unsubscribeButton = document.querySelector('#unsubscribe-button');
    
    if (!subscribeButton || !unsubscribeButton) return;
    
    try {
      const { isCurrentPushSubscriptionAvailable } = await import('../utils/notification-helper');
      const isSubscribed = await isCurrentPushSubscriptionAvailable();
      
      subscribeButton.style.display = isSubscribed ? 'none' : 'inline-block';
      unsubscribeButton.style.display = isSubscribed ? 'inline-block' : 'none';
  
      subscribeButton.innerHTML = '<i class="fas fa-bell"></i> Langganan';
      unsubscribeButton.innerHTML = '<i class="fas fa-bell-slash"></i> Berhenti Langganan';
    } catch (error) {
      console.error('Error updating notification buttons:', error);
    }
  };

  await updateNotificationButtons();
 
  let isProcessing = false;

  const subscribeButton = document.querySelector('#subscribe-button');
  subscribeButton?.addEventListener('click', async () => {
    if (isProcessing) return;
    isProcessing = true;
    
    try {
      await ensureServiceWorkerExists();
      
      if (subscribeButton) {
        subscribeButton.disabled = true;
        subscribeButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
      }
      
      await subscribe();
      
      await updateNotificationButtons();
    } catch (error) {
      console.error('Error subscribing:', error);
    } finally {
      if (subscribeButton) {
        subscribeButton.disabled = false;
        subscribeButton.innerHTML = '<i class="fas fa-bell"></i> Langganan';
      }
      isProcessing = false;
    }
  });

  const unsubscribeButton = document.querySelector('#unsubscribe-button');
  unsubscribeButton?.addEventListener('click', async () => {
    if (isProcessing) return;
    isProcessing = true;
    
    try {
      await ensureServiceWorkerExists();
      
      if (unsubscribeButton) {
        unsubscribeButton.disabled = true;
        unsubscribeButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
      }
      
      await unsubscribe();
 
      await updateNotificationButtons();
    } catch (error) {
      console.error('Error unsubscribing:', error);
    } finally {
      if (unsubscribeButton) {
        unsubscribeButton.disabled = false;
        unsubscribeButton.innerHTML = '<i class="fas fa-bell-slash"></i> Berhenti Langganan';
      }
      isProcessing = false;
    }
  });
});

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const installBtn = document.getElementById('install-button');
  if (installBtn) installBtn.style.display = 'block';

  installBtn?.addEventListener('click', async () => {
    installBtn.style.display = 'none';
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    deferredPrompt = null;
  });
});

export default app;
