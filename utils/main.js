// utils/main.js
import { setCookie, getCookie } from '../cookie/main.js';
import { Home } from '../users/home.js';

window.addEventListener('DOMContentLoaded', () => {
  const route = getCookie('route');
  if (route === '/users/dashboard') {
    document.body.innerHTML = '';
    new Home(); // instantiate the UI
  }
});

const loginBtn = document.querySelector('.login');
if (loginBtn) {
  loginBtn.addEventListener('click', (e) => {
    e.preventDefault();

    document.body.innerHTML = '';
    setCookie('route', '/users/dashboard', 7);
    new Home(); // instantiate the UI
  });
}
