import 'regenerator-runtime';
import '../styles/styles.css';
import routes from './routes/routes';
import UrlParser from './routes/url-parser';
import Auth from './utils/auth';
import { subscribe, unsubscribe } from './utils/notification-helper';

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

// 🧹 Hindari duplikasi DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  app = document.querySelector('#app');
  renderPage();

  const logoutLink = document.querySelector('#logout-link');
  logoutLink?.addEventListener('click', () => {
    Auth.deleteToken();
    window.location.hash = '#/login';
    updateAuthUI();
  });

  const subscribeButton = document.querySelector('#subscribe-button');
  subscribeButton?.addEventListener('click', subscribe);

  const unsubscribeButton = document.querySelector('#unsubscribe-button');
  unsubscribeButton?.addEventListener('click', unsubscribe);

  // ⬇️ Install PWA prompt event
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

// ⬇️ Navigasi dinamis
window.addEventListener('hashchange', renderPage);
