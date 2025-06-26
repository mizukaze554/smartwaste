// utils/main.js
import { setCookie, getCookie } from '../cookie/main.js';
import { Home } from '../users/home.js';

window.addEventListener('DOMContentLoaded', () => {
  const route = getCookie('route');
  if (route === '/users/dashboard') {
    document.body.innerHTML = '';
    history.replaceState({}, '', route);
    new Home();
  }
});

const loginBtn = document.querySelector('.login');
if (loginBtn) {
  loginBtn.addEventListener('click', (e) => {
    e.preventDefault();

    document.body.innerHTML = '';
    const path = '/users/dashboard';
    setCookie('route', path, 7);
    history.pushState({}, '', path);
    new Home();
  });
}
