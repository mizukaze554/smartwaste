import { loadRoute } from '../utils/routes.js';
import { setCookie } from '../cookie/main.js';

export function renderNavbar() {
  return `
    <nav class="fixed top-0 w-full bg-white border-b shadow-md z-50">
      <div class="max-w-7xl mx-auto px-6 md:px-8 flex justify-between items-center h-16">
        <div class="flex items-center space-x-3">
          <img src="../public/logo.png" alt="Logo" class="h-10 w-10 object-contain" />
          <span class="text-xl font-extrabold tracking-wide text-gray-900 select-none">SmartWaste+</span>
        </div>
        <div class="flex space-x-6 items-center">
          <a href="#" id="nav-home" class="hover:underline text-gray-700 font-semibold transition">Home</a>
          <a href="#" id="nav-profile" class="hover:underline text-gray-700 font-semibold transition">Profile</a>
          <button class="logout bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition font-semibold shadow-sm">Logout</button>
        </div>
      </div>
    </nav>
  `;
}


// After rendering, call this to bind nav events
export function bindNavEvents() {
  const navHome = document.getElementById('nav-home');
  const navProfile = document.getElementById('nav-profile');
  const logoutButtons = document.querySelectorAll('.logout');

  if (navHome) {
    navHome.addEventListener('click', e => {
      e.preventDefault();
      setCookie('route', '/users/dashboard', 7);
      loadRoute('/users/dashboard');
    });
  }

  if (navProfile) {
    navProfile.addEventListener('click', e => {
      e.preventDefault();
      setCookie('route', '/users/profile', 7);
      loadRoute('/users/profile');
    });
  }

  logoutButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Your logout function here
      // Example: signOutUser();
    });
  });
}
