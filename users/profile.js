import { renderNavbar, bindNavEvents } from './nav.js';
import { signOutUser } from '../auth/google.js';

export class Profile {
  constructor() {
    this.render();
  }

  render() {
    const savedName = localStorage.getItem('userName') || '';
    const savedPic = localStorage.getItem('userPic') || '';

    document.body.innerHTML = `
      ${renderNavbar()}

      <main class="pt-36 px-4 max-w-xl mx-auto">
        <section class="bg-white shadow-xl rounded-3xl p-8 space-y-10">
          <h2 class="text-3xl font-bold text-center text-gray-800 select-none">Edit Profile</h2>

          <form id="profile-form" class="grid grid-cols-1 gap-8">
            <!-- Profile Picture Circle -->
            <div class="flex justify-center">
              <label for="profile-pic-upload" class="cursor-pointer group relative">
                <img id="profile-preview" 
                     src="${savedPic || 'https://via.placeholder.com/160'}" 
                     alt="Profile Picture" 
                     class="rounded-full w-40 h-40 object-cover border-4 border-green-600 shadow-lg transition-transform group-hover:scale-105" />
                <div class="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-semibold">
                  Change
                </div>
              </label>
              <input type="file" id="profile-pic-upload" accept="image/*" class="hidden" />
            </div>

            <!-- Name Field -->
            <div>
              <label for="name" class="block text-lg font-medium text-gray-700 mb-2">Name</label>
              <input type="text" id="name" value="${savedName}" placeholder="Your full name"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" required />
            </div>

            <!-- Submit Button -->
            <div class="text-center">
              <button type="submit"
                class="bg-green-600 text-white px-10 py-3 rounded-xl font-semibold shadow hover:bg-green-700 transition">
                Save Changes
              </button>
            </div>
          </form>
        </section>
      </main>
    `;

    bindNavEvents();
    this.bindEvents();
  }

  bindEvents() {
    const form = document.getElementById('profile-form');
    const nameInput = form.querySelector('#name');
    const urlInput = form.querySelector('#profile-pic-url');
    const fileInput = form.querySelector('#profile-pic-upload');
    const previewImg = document.getElementById('profile-preview');

    // File Upload: Base64 conversion
    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        previewImg.src = base64;
        urlInput.value = ''; // clear url input
      };
      reader.readAsDataURL(file);
    });

    // URL input updates preview
    urlInput.addEventListener('input', () => {
      const url = urlInput.value.trim();
      if (url) {
        previewImg.src = url;
        fileInput.value = ''; // clear file input
      } else {
        previewImg.src = 'https://via.placeholder.com/160';
      }
    });

    // Form submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = nameInput.value.trim();
      const picUrl = urlInput.value.trim();
      const isBase64 = previewImg.src.startsWith('data:');

      if (!name) return alert('Please enter your name.');

      localStorage.setItem('userName', name);
      localStorage.setItem('userPic', isBase64 ? previewImg.src : picUrl || previewImg.src);

      alert('Profile updated!');
    });

    // Logout buttons in navbar
    document.querySelectorAll('.logout').forEach(btn =>
      btn.addEventListener('click', signOutUser)
    );

    // Mobile menu
    document.getElementById('mobile-menu-button')?.addEventListener('click', () => {
      document.getElementById('mobile-menu')?.classList.toggle('hidden');
    });
  }
}
