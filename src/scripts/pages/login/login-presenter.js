// scripts/presenters/login-presenter.js
import StoryApi from '../../data/api';
import Auth from '../../utils/auth';
import Swal from 'sweetalert2';

const LoginPresenter = {
  init({ formElement }) {
    this._form = formElement;
    this._registerEvent();
  },

  _registerEvent() {
    this._form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = this._form.email.value.trim();
      const password = this._form.password.value.trim();

      try {
        const response = await StoryApi.login({ email, password });
        if (response.error) throw new Error(response.message);

        Auth.saveToken(response.loginResult.token);
        Auth.saveUser({
          name: response.loginResult.name,
          email,
        });

        Swal.fire({
          icon: 'success',
          title: 'Login Successful!',
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          window.location.hash = '#/profile';
          window.location.reload();
        });
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: err.message,
        });
      }
    });
  },
};

export default LoginPresenter;
