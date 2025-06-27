import { loadRoute } from '../utils/routes.js';
import { setCookie } from '../cookie/main.js';
import { signOutUser } from '../auth/google.js';

export function renderNavbar() {
  return `
    <nav class="fixed top-0 w-full bg-white border-b shadow-md z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex items-center space-x-2">
          <img src="../public/logo.png" alt="Logo" class="h-8 w-8 object-contain" />
          <span class="text-lg font-bold text-gray-900 select-none">SmartWaste+</span>
        </div>

        <!-- Nav Items -->
        <div class="flex space-x-4 items-center text-sm md:text-base">
          <a href="#" id="nav-home" class="text-gray-700 font-semibold hover:underline">Home</a>
          <a href="#" id="nav-profile" class="text-gray-700 font-semibold hover:underline">Profile</a>
          <button class="logout bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm font-semibold">Logout</button>
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
    btn.addEventListener('click', signOutUser);
  });
}
