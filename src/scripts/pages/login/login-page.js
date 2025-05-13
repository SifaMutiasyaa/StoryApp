import Auth from '../../utils/auth';
import LoginPresenter from '../login/login-presenter.js';

export default class LoginPage {
  async render() {
    const token = Auth.getToken();
    const userInfo = Auth.getUser();

    if (token && userInfo) {
      window.location.hash = '#/profile';
      return '';
    }

    return `
      <style>
        .container {
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .form-box {
          background-color: white;
          padding: 2rem;
          border-radius: 20px;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
          animation: fadeIn 0.6s ease;
        }

        .form-box h1 {
          text-align: center;
          color: #333;
          margin-bottom: 1.5rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.4rem;
          color: #444;
          font-weight: 600;
        }

        .form-group input {
          width: 100%;
          padding: 10px;
          border: 2px solid #AFDDFF;
          border-radius: 8px;
          font-size: 1rem;
          background-color: #f9f9f9;
        }

        .form-group input:focus {
          outline: none;
          border-color: #60B5FF;
          background-color: #fff;
        }

        .btn {
          width: 100%;
          padding: 12px;
          background-color: #60B5FF;
          color: white;
          font-weight: bold;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: background-color 0.3s ease, transform 0.2s ease;
        }

        .btn:hover {
          background-color: #409fe2;
          transform: scale(1.03);
        }

        .form-box p {
          text-align: center;
          margin-top: 1rem;
          font-size: 0.95rem;
        }

        .form-box a {
          color: #FF9149;
          text-decoration: none;
          font-weight: 600;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media screen and (max-width: 768px) {
       .container {
        padding: 1rem;
        }

       .form-box {
        padding: 1.5rem;
        border-radius: 16px;
        }

        .form-box h1 {
          font-size: 1.8rem;
          }

        .form-group input {
        padding: 9px;
        font-size: 0.95rem;
          }

      .btn {
      padding: 10px;
      font-size: 0.95rem;
      }

      .form-box p {
      font-size: 0.9rem;
      }
}
      </style>

      <div class="container">
        <div class="form-box">
          <h1 tabindex="0">Login</h1>
          <form id="login-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" required />
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" required />
            </div>
            <button type="submit" class="btn">Login</button>
            <p>Don't have an account? <a href="#/register">Register</a></p>
          </form>
        </div>
      </div>
    `;
  }

  async afterRender() {
    const form = document.getElementById('login-form');
    LoginPresenter.init({ formElement: form });
  }
}
