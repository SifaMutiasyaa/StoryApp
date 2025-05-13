// scripts/pages/profile-page.js
import Auth from '../../utils/auth';
import ProfilePresenter from '../profile/profile-presenter';

export default class ProfilePage {
  async render() {
    const user = Auth.getUser();
    const token = Auth.getToken();

    if (!token || !user) {
      window.location.hash = '#/login';
      return '<p>Redirecting to login...</p>';
    }

    return `
      <style>
        .container {
          max-width: 500px;
          margin: 60px auto;
          padding: 2rem;
          background: linear-gradient(135deg, #f6f9fc, #e9f0ff);
          border-radius: 10px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          animation: fadeInUp 0.5s ease-in-out;
        }

        .container h1 {
          text-align: center;
          margin-bottom: 1.2rem;
          font-size: 2.2rem;
          color: #333;
        }

        .avatar {
          display: block;
          margin: 0 auto 1rem;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid #fff;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
          background-color: #eee;
        }

        .badge {
          display: block;
          text-align: center;
          background: linear-gradient(to right, #4facfe, #00f2fe);
          color: #fff;
          padding: 6px 16px;
          font-size: 0.85rem;
          border-radius: 20px;
          font-weight: 600;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          margin: 0 auto 1.5rem;
          width: fit-content;
        }

        .container p {
          font-size: 1.1rem;
          margin: 0.8rem 0;
          color: #555;
          text-align: center;
        }

        .container strong {
          color: #222;
        }

        #logout-btn {
          margin-top: 2rem;
          padding: 12px 24px;
          width: 100%;
          font-size: 1rem;
          font-weight: bold;
          background-color: #ff4d4d;
          color: #fff;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.3s ease, transform 0.2s ease;
        }

        #logout-btn:hover {
          background-color: #e60000;
          transform: scale(1.03);
        }

        #logout-btn:active {
          background-color: #cc0000;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
          .notif-buttons {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .notif-btn {
        padding: 10px 16px;
        font-size: 0.95rem;
        font-weight: 600;
        border-radius: 6px;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        background-color: #0077ff;
        color: white;
        transition: background-color 0.3s ease, transform 0.2s ease;
        box-shadow: 0 2px 6px rgba(0, 119, 255, 0.3);
      }

      .notif-btn:hover {
      background-color: #005ec2;
      transform: scale(1.03);
      }

      .notif-btn:active {
      background-color: #004799;
      }

      .notif-btn.unsub {
      background-color: #ccc;
      color: #333;
      }

      .notif-btn.unsub:hover {
      background-color: #999;
      transform: scale(1.03);
      }


        @media screen and (max-width: 768px) {
          .container {
            margin: 40px 1rem;
            padding: 1.5rem;
          }

          .container h1 {
            font-size: 1.8rem;
          }

          .avatar {
            width: 100px;
            height: 100px;
          }

          .badge {
            font-size: 0.8rem;
            padding: 5px 14px;
          }

          .container p {
            font-size: 1rem;
          }

          #logout-btn {
            padding: 10px 20px;
            font-size: 0.95rem;
          }
        }
      </style>

      <section class="container">
        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=128" alt="${user.name}" class="avatar" />
        <h1 tabindex="0">${user.name}</h1>
        <span class="badge">Active User</span>
        <p><strong>Email:</strong> ${user.email}</p>
        <div class="notif-buttons">
        <button id="subscribe-button" class="notif-btn" title="Langganan Notifikasi" aria-label="Langganan">
         🔔 Langganan
        </button>
        <button id="unsubscribe-button" class="notif-btn unsub" style="display:none;" title="Berhenti Langganan" aria-label="Berhenti Langganan">
          🔕 Berhenti
        </button>
        </div>
        <button id="logout-btn">Logout</button>

      </section>
    `;
  }

  async afterRender() {
    ProfilePresenter.init();
  }
}
