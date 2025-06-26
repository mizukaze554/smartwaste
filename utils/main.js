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
