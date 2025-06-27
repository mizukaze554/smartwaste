import { loadRoute } from '../utils/routes.js';
import { setCookie } from '../cookie/main.js';
import { signOutUser } from '../auth/google.js';

export function renderNavbar() {
  return `
    <nav class="fixed top-0 w-full bg-white border-b shadow-md z-50">
      <div class="max-w-7xl mx-auto px-6 md:px-8 flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex items-center space-x-3">
          <img src="../public/logo.png" alt="Logo" class="h-10 w-10 object-contain" />
          <span class="text-xl font-extrabold tracking-wide text-gray-900 select-none">SmartWaste+</span>
        </div>

        <!-- Desktop nav -->
        <div class="hidden md:flex space-x-6 items-center">
          <a href="#" id="nav-home" class="hover:underline text-gray-700 font-semibold transition">Home</a>
          <a href="#" id="nav-profile" class="hover:underline text-gray-700 font-semibold transition">Profile</a>
          <button class="logout bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition font-semibold shadow-sm">Logout</button>
        </div>

        <!-- Mobile menu button -->
        <button id="mobile-menu-button" class="md:hidden focus:outline-none focus:ring-2 focus:ring-green-600 rounded p-2" aria-label="Toggle navigation">
          <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
      </div>

      <!-- Mobile dropdown -->
      <div id="mobile-menu" class="hidden md:hidden bg-white border-t border-gray-200 shadow-lg px-6 py-4 space-y-4">
        <a href="#" id="mobile-nav-home" class="block text-gray-700 font-semibold hover:underline">Home</a>
        <a href="#" id="mobile-nav-profile" class="block text-gray-700 font-semibold hover:underline">Profile</a>
        <button class="logout w-full text-left bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition font-semibold shadow-sm">Logout</button>
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
  const logoutButtons = document.querySelectorAll('.logout');
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');

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
      mobileMenu?.classList.toggle('hidden');
    });
  }

  logoutButtons.forEach(btn => {
    btn.addEventListener('click', signOutUser);
  });
}
