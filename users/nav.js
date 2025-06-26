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
        <div class="hidden md:flex space-x-10 items-center">
          <a href="#" id="nav-home" class="hover:underline text-gray-700 font-semibold transition">Home</a>
          <a href="#" id="nav-profile" class="hover:underline text-gray-700 font-semibold transition">Profile</a>
          <button class="logout bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-semibold shadow-sm">Logout</button>
        </div>
        <button id="mobile-menu-button" aria-label="Toggle Menu" class="md:hidden focus:outline-none focus:ring-2 focus:ring-green-600 rounded">
          <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      <div id="mobile-menu" class="hidden md:hidden bg-white border-t border-gray-200 shadow-lg">
        <a href="#" id="mobile-nav-home" class="block px-6 py-4 hover:bg-gray-100 font-semibold text-gray-700 transition">Home</a>
        <a href="#" id="mobile-nav-profile" class="block px-6 py-4 hover:bg-gray-100 font-semibold text-gray-700 transition">Profile</a>
        <button class="logout block w-full text-left px-6 py-4 bg-red-600 text-white hover:bg-red-700 transition font-semibold rounded-b-lg shadow-sm">Logout</button>
      </div>
    </nav>
  `;
}

// After rendering, call this to bind nav events
export function bindNavEvents() {
  const navHome = document.getElementById('nav-home');
  const navProfile = document.getElementById('nav-profile');
  const mobileNavHome = document.getElementById('mobile-nav-home');
  const mobileNavProfile = document.getElementById('mobile-nav-profile');
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
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

  if (mobileNavHome) {
    mobileNavHome.addEventListener('click', e => {
      e.preventDefault();
      setCookie('route', '/users/dashboard', 7);
      loadRoute('/users/dashboard');
      if (mobileMenu) mobileMenu.classList.add('hidden');
    });
  }

  if (mobileNavProfile) {
    mobileNavProfile.addEventListener('click', e => {
      e.preventDefault();
      setCookie('route', '/users/profile', 7);
      loadRoute('/users/profile');
      if (mobileMenu) mobileMenu.classList.add('hidden');
    });
  }

  if (mobileMenuButton) {
    mobileMenuButton.addEventListener('click', () => {
      if (mobileMenu) mobileMenu.classList.toggle('hidden');
    });
  }

  logoutButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Your logout function here
      // Example: signOutUser();
    });
  });
}
