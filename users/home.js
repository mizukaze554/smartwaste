import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { app } from '../firebase/main.js';
import { signOutUser } from '../auth/google.js';
import { renderNavbar } from './nav.js';

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

      ${renderNavbar()} 

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

    bindEvents();
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
      btn.addEventListener('click', signOutUser);
    });

    // Mobile menu toggle
    document.getElementById('mobile-menu-button')?.addEventListener('click', () => {
      document.getElementById('mobile-menu')?.classList.toggle('hidden');
    });
  }
}
