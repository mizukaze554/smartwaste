// users/home.js
export class Home {
  constructor() {
    this.render();
  }

  render() {
    document.body.innerHTML = `
      <nav class="fixed top-0 w-full bg-white border-b shadow-sm z-50">
        <div class="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
          <div class="flex items-center space-x-3">
            <img src="./public/logo.png" alt="Logo" class="h-10 w-10" />
            <span class="text-xl font-bold">SmartWaste+</span>
          </div>
          <div class="hidden md:flex space-x-6">
            <a href="#profile" class="hover:underline">Profiles</a>
            <button class="logout bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 transition">Logout</button>
          </div>
          <button id="mobile-menu-button" class="md:hidden focus:outline-none focus:ring-2 focus:ring-green-600">
            <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <div id="mobile-menu" class="hidden md:hidden bg-white border-t border-gray-200">
          <a href="#profile" class="block px-4 py-3 hover:bg-gray-100">Profiles</a>
          <button class="logout block w-full text-left px-4 py-3 bg-red-600 text-white text-center rounded-b hover:bg-red-700 transition">Logout</button>
        </div>
      </nav>
      <main class="pt-20 px-6">
        <h1 class="text-3xl font-bold text-gray-800">Welcome to the Dashboard</h1>
      </main>
    `;

    this.bindEvents();
  }

  bindEvents() {
    document.querySelectorAll('.logout').forEach(btn => {
      btn.addEventListener('click', () => {
        document.cookie = 'route=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        window.location.href = '/';
      });
    });

    document.getElementById('mobile-menu-button')?.addEventListener('click', () => {
      document.getElementById('mobile-menu')?.classList.toggle('hidden');
    });
  }
}
