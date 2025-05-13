const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

const Auth = {
  saveToken(token) {
    localStorage.setItem('auth_token', token);
  },
  getToken() {
    return localStorage.getItem('auth_token');
  },
  clearToken() {
    localStorage.removeItem('auth_token');
  },
  saveUser(user) {
    localStorage.setItem('auth_user', JSON.stringify(user));
  },
  getUser() {
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
  },
  clearUser() {
    localStorage.removeItem('auth_user');
  },
};

export default Auth;
