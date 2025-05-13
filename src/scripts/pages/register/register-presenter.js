import Swal from 'sweetalert2';
import StoryApi from '../../data/api';


export default class RegisterPagePresenter {
  constructor(view) {
    this.view = view;
    this.view.presenter = this;
  }

  async handleSubmit(name, email, password) {
    if (!name || !email || !password) {
      Swal.fire({
        icon: 'warning',
        title: 'Oops!',
        text: 'Please fill in all fields!',
      });
      return;
    }

    try {
      const response = await StoryApi.register({ name, email, password });

      if (response.error) {
        throw new Error(response.message || 'Unknown error');
      }

      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Registration successful! Please login.',
        confirmButtonColor: '#60B5FF',
      });

      window.location.hash = '#/login';
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: err.message,
      });
    }
  }
}


