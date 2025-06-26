import { renderNavbar, bindNavEvents } from './nav.js';
import { signOutUser } from '../auth/google.js';

export class Profile {
  constructor() {
    this.render();
  }

  render() {
    const savedName = localStorage.getItem('userName') || '';
    const savedPic = localStorage.getItem('userPic') || ''; // can be URL or base64

    document.body.innerHTML = `
      ${renderNavbar()}

      <main class="pt-36 px-6 max-w-2xl mx-auto space-y-12">
        <section class="bg-white shadow-2xl rounded-3xl p-10 space-y-8">
          <h2 class="text-4xl font-extrabold text-gray-900 text-center tracking-tight select-none">
            Your Profile
          </h2>

          <form id="profile-form" class="space-y-6">
            <div>
              <label for="name" class="block text-lg font-semibold text-gray-700 mb-2">Name</label>
              <input type="text" id="name" name="name" value="${savedName}" placeholder="Your full name" required
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>

            <div>
              <label for="profile-pic-url" class="block text-lg font-semibold text-gray-700 mb-2">Profile Picture URL (optional)</label>
              <input type="url" id="profile-pic-url" name="profile-pic-url" value="${savedPic.startsWith('data:') ? '' : savedPic}" placeholder="Image URL"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>

            <div>
              <label for="profile-pic-upload" class="block text-lg font-semibold text-gray-700 mb-2">Or Upload Profile Picture</label>
              <input type="file" id="profile-pic-upload" accept="image/*"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>

            <div class="flex justify-center">
              <button type="submit"
                class="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold shadow hover:bg-green-700 transition">
                Save Profile
              </button>
            </div>
          </form>

          <div class="text-center">
            <h3 class="text-xl font-semibold mb-2">Preview</h3>
            <img id="profile-preview" src="${savedPic || 'https://via.placeholder.com/160'}" alt="Profile Picture Preview"
              class="mx-auto rounded-full w-40 h-40 object-cover border-4 border-green-600 shadow-lg" />
            <p id="name-preview" class="mt-4 text-2xl font-bold text-gray-900">${savedName || 'Your Name'}</p>
          </div>
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
    const previewName = document.getElementById('name-preview');

    // When user selects a file, convert it to Base64 and preview
    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        previewImg.src = base64;

        // Clear URL input to avoid conflicts
        urlInput.value = '';
      };
      reader.readAsDataURL(file);
    });

    // When user edits URL input, update preview (if URL given)
    urlInput.addEventListener('input', () => {
      if (urlInput.value.trim()) {
        previewImg.src = urlInput.value.trim();
        // Clear file input to avoid conflicts
        fileInput.value = '';
      } else if (!fileInput.files.length) {
        previewImg.src = 'https://via.placeholder.com/160';
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = nameInput.value.trim();
      const picUrl = urlInput.value.trim();
      const fileSelected = fileInput.files.length > 0;

      if (!name) {
        alert('Please enter your name.');
        return;
      }

      if (!picUrl && !fileSelected && !previewImg.src.startsWith('data:')) {
        alert('Please provide a profile picture URL or upload an image.');
        return;
      }

      // Save name
      localStorage.setItem('userName', name);

      // Save profile pic: priority to file upload (base64), else URL
      if (fileSelected) {
        // We already updated previewImg.src with base64 on file select,
        // so just save that
        localStorage.setItem('userPic', previewImg.src);
      } else {
        localStorage.setItem('userPic', picUrl);
      }

      previewName.textContent = name;

      alert('Profile saved!');
    });

    // Logout buttons in navbar
    document.querySelectorAll('.logout').forEach(btn => {
      btn.addEventListener('click', signOutUser);
    });

    // Mobile menu toggle
    document.getElementById('mobile-menu-button')?.addEventListener('click', () => {
      document.getElementById('mobile-menu')?.classList.toggle('hidden');
    });
  }
}
