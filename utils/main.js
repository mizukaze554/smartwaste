// utils/main.js
import { setCookie, getCookie } from '../cookie/main.js';

// Check if user is already logged in
window.addEventListener('DOMContentLoaded', () => {
  const route = getCookie('route');
  if (route) {
    console.log('Saved route:', route);
    // Optional: You can log it or highlight UI, but don't redirect.
    // window.location.href = route; // <-- removed
  }
});

// Handle login click
const loginBtn = document.getElementsByClassName('login');
if (loginBtn) {
  loginBtn.addEventListener('click', (e) => {
    e.preventDefault();

    // Clear existing DOM content
    document.body.innerHTML = '';

    // Save cookie only, don't redirect
    const path = '/users/dashboard';
    setCookie('route', path, 7);
    // window.location.href = path; // <-- removed
  });
}
