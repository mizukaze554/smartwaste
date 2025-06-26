// users/profile.js
import { renderNavbar } from './nav.js';
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
              <label for="profile-pic" class="block text-lg font-semibold text-gray-700 mb-2">Profile Picture URL</label>
              <input type="url" id="profile-pic" name="profile-pic" value="${savedPic}" placeholder="Image URL" required
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

    this.bindEvents();
  }

  bindEvents() {
    const form = document.getElementById('profile-form');
    const nameInput = form.querySelector('#name');
    const picInput = form.querySelector('#profile-pic');
    const previewImg = document.getElementById('profile-preview');
    const previewName = document.getElementById('name-preview');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = nameInput.value.trim();
      const pic = picInput.value.trim();

      if (!name || !pic) {
        alert('Please enter both name and profile picture URL.');
        return;
      }

      // Save to localStorage
      localStorage.setItem('userName', name);
      localStorage.setItem('userPic', pic);

      // Update preview
      previewImg.src = pic;
      previewName.textContent = name;

      alert('Profile saved!');
    });

    // Update preview live when URL changes
    picInput.addEventListener('input', () => {
      const url = picInput.value.trim();
      previewImg.src = url || 'https://via.placeholder.com/160';
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
