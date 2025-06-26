// utils/main.js
import { setCookie, getCookie } from '../cookie/main.js';
import { Home } from '../users/home.js';

// Check if user is already logged in
window.addEventListener('DOMContentLoaded', () => {
  const route = getCookie('route');
  if (route === '/users/dashboard') {
    document.body.innerHTML = '';
    Home();
  }
});

// Handle login click
const loginBtn = document.getElementById('login');
if (loginBtn) {
  loginBtn.addEventListener('click', (e) => {
    e.preventDefault();

    // Clear existing DOM content
    document.body.innerHTML = '';

    // Save cookie and show Home UI
    const path = '/users/dashboard';
    setCookie('route', path, 7); // cookie expires in 7 days
    Home();
  });
}
