import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { app } from '../firebase/main.js';

export class Home {
  constructor() {
    this.render();
  }

  render() {
    document.body.innerHTML = `
      <style>
        /* Flip card container */
        .flip-card {
          perspective: 1000px;
          width: 160px;
          height: 160px;
          cursor: pointer;
        }
        /* Inner part with transition */
        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
          border-radius: 0.75rem; /* Rounded corners */
          box-shadow: 0 10px 15px -3px rgba(22, 163, 74, 0.3), 0 4px 6px -2px rgba(22, 163, 74, 0.2);
          background: white;
        }
        /* Flip the card when toggled */
        .flip-card.flipped .flip-card-inner {
          transform: rotateY(180deg);
        }
        /* Front and back faces */
        .flip-card-front, .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 0.75rem;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        /* Front: QR code */
        .flip-card-front {
          background: white;
          overflow: hidden;
        }
        /* Back: total points */
        .flip-card-back {
          background: white;
          color: #16a34a; /* Tailwind green-600 */
          font-weight: 700;
          font-size: 1.875rem; /* text-3xl */
          transform: rotateY(180deg);
          flex-direction: column;
          gap: 0.5rem;
          text-align: center;
          padding: 1rem;
          box-sizing: border-box;
        }
        /* Responsive adjustments */
        @media (min-width: 768px) {
          .flip-card {
            width: 200px;
            height: 200px;
          }
          .flip-card-back {
            font-size: 2.25rem; /* text-4xl */
          }
        }
      </style>

      <nav class="fixed top-0 w-full bg-white border-b shadow-md z-50">
        <div class="max-w-7xl mx-auto px-6 md:px-8 flex justify-between items-center h-16">
          <div class="flex items-center space-x-3">
            <img src="../public/logo.png" alt="Logo" class="h-10 w-10 object-contain" />
            <span class="text-xl font-extrabold tracking-wide text-gray-900 select-none">SmartWaste+</span>
          </div>
          <div class="hidden md:flex space-x-10 items-center">
            <a href="#profile" class="hover:underline text-gray-700 font-semibold transition">Profiles</a>
            <button class="logout bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-semibold shadow-sm">Logout</button>
          </div>
          <button id="mobile-menu-button" aria-label="Toggle Menu" class="md:hidden focus:outline-none focus:ring-2 focus:ring-green-600 rounded">
            <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <div id="mobile-menu" class="hidden md:hidden bg-white border-t border-gray-200 shadow-lg">
          <a href="#profile" class="block px-6 py-4 hover:bg-gray-100 font-semibold text-gray-700 transition">Profiles</a>
          <button class="logout block w-full text-left px-6 py-4 bg-red-600 text-white hover:bg-red-700 transition font-semibold rounded-b-lg shadow-sm">Logout</button>
        </div>
      </nav>

      <main class="pt-36 px-6 max-w-4xl mx-auto space-y-24">
        <!-- Hero Card -->
        <section class="bg-white shadow-2xl rounded-3xl p-10 space-y-10">
          <h2 class="text-4xl font-extrabold text-gray-900 text-center tracking-tight select-none">Your Waste Card</h2>

          <div class="flex flex-col md:flex-row justify-center items-center gap-14 px-6">
            <!-- Flip card container -->
            <div class="flip-card" id="flip-card" role="button" tabindex="0" aria-pressed="false" aria-label="Flip waste card to see total points">
              <div class="flip-card-inner">
                <div class="flip-card-front">
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=SmartWasteUser" 
                    alt="QR Code" 
                    class="w-full h-full rounded-lg object-contain"
                  />
                </div>
                <div class="flip-card-back" aria-hidden="true">
                  <div class="text-lg font-semibold">Total Points</div>
                  <div class="text-5xl font-extrabold tracking-wide">420 pts</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- History Section -->
        <section class="space-y-12">
          <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight select-none">Collection History</h2>
          
          <!-- Example Entry -->
          <div class="flex items-start gap-6 p-6 rounded-2xl shadow-lg bg-white hover:shadow-2xl transition">
            <i class="bi bi-shop text-5xl text-green-600 flex-shrink-0"></i>
            <div class="grid grid-cols-1 w-full gap-1">
              <div class="text-xl font-semibold text-gray-900">GreenMart</div>
              <div class="text-base text-gray-600 leading-relaxed">Recycled 5 plastic bottles and 2 cans</div>
            </div>
            <div class="ml-auto font-extrabold text-green-600 text-lg">+120 pts</div>
          </div>

          <div class="flex items-start gap-6 p-6 rounded-2xl shadow-lg bg-white hover:shadow-2xl transition">
            <i class="bi bi-shop text-5xl text-green-600 flex-shrink-0"></i>
            <div class="grid grid-cols-1 w-full gap-1">
              <div class="text-xl font-semibold text-gray-900">EcoStore</div>
              <div class="text-base text-gray-600 leading-relaxed">Recycled small electronics</div>
            </div>
            <div class="ml-auto font-extrabold text-green-600 text-lg">+300 pts</div>
          </div>
        </section>
      </main>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Flip card toggle
    const flipCard = document.getElementById('flip-card');
    flipCard.addEventListener('click', () => {
      flipCard.classList.toggle('flipped');
      // Update aria-pressed for accessibility
      const pressed = flipCard.classList.contains('flipped');
      flipCard.setAttribute('aria-pressed', pressed);
    });

    // Also allow flipping via keyboard (space or enter)
    flipCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        flipCard.click();
      }
    });

    // Logout buttons
    document.querySelectorAll('.logout').forEach(btn => {
      btn.addEventListener('click', () => {
        const auth = getAuth(app);

        signOut(auth)
          .then(() => {
            // Clear any cookies or local routing info
            document.cookie = 'route=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            // Redirect to home/login
            window.location.href = '/';
          })
          .catch((error) => {
            console.error("Logout error:", error);
          });
      });
    });

    // Mobile menu toggle
    document.getElementById('mobile-menu-button')?.addEventListener('click', () => {
      document.getElementById('mobile-menu')?.classList.toggle('hidden');
    });
  }
}
