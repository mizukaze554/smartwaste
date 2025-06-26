// utils/main.js
import { setCookie, getCookie } from '../cookie/main.js';
import { loadRoute } from './routes.js';

window.addEventListener('DOMContentLoaded', () => {
  const route = getCookie('route');

  if (route) {
    document.body.innerHTML = '';
    loadRoute(route);
  }
});

// Optional: basic login logic
const loginBtn = document.querySelectorAll('.login');
if (loginBtn) {
  loginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const path = '/users/dashboard';
    setCookie('route', path, 7);
    loadRoute(path);
  });
}
