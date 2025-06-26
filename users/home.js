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
        }
        /* Inner part with transition */
        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
          cursor: pointer;
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
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        /* Front: QR code */
        .flip-card-front {
          background: white;
        }
        /* Back: total points */
        .flip-card-back {
          background: #d1fae5; /* Tailwind green-100 */
          color: #16a34a; /* Tailwind green-600 */
          font-weight: 700;
          font-size: 2rem;
          transform: rotateY(180deg);
          flex-direction: column;
          gap: 0.5rem;
        }
      </style>

      <nav class="fixed top-0 w-full bg-white border-b shadow-sm z-50">
        <div class="max-w-7xl mx-auto px-6 flex justify-between items-center h-16">
          <div class="flex items-center space-x-3">
            <img src="../public/logo.png" alt="Logo" class="h-10 w-10" />
            <span class="text-xl font-bold tracking-wide text-gray-900">SmartWaste+</span>
          </div>
          <div class="hidden md:flex space-x-8">
            <a href="#profile" class="hover:underline text-gray-700 font-medium">Profiles</a>
            <button class="logout bg-red-600 text-white px-5 py-2 rounded-md hover:bg-red-700 transition font-semibold">Logout</button>
          </div>
          <button id="mobile-menu-button" class="md:hidden focus:outline-none focus:ring-2 focus:ring-green-600 rounded">
            <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <div id="mobile-menu" class="hidden md:hidden bg-white border-t border-gray-200">
          <a href="#profile" class="block px-6 py-3 hover:bg-gray-100 font-medium">Profiles</a>
          <button class="logout block w-full text-left px-6 py-3 bg-red-600 text-white rounded-b-md hover:bg-red-700 transition font-semibold">Logout</button>
        </div>
      </nav>

      <main class="pt-32 px-6 max-w-4xl mx-auto space-y-20">
        <!-- Hero Card -->
        <section class="bg-white shadow-xl rounded-2xl p-8 space-y-8">
          <h2 class="text-3xl font-bold text-gray-900 text-center tracking-tight">Your Waste Card</h2>

          <div class="flex flex-col md:flex-row justify-center items-center gap-12 px-6">
            <!-- Flip card container -->
            <div class="flip-card" id="flip-card">
              <div class="flip-card-inner">
                <div class="flip-card-front">
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=SmartWasteUser" 
                    alt="QR Code" 
                    class="w-full h-full rounded-lg"
                  />
                </div>
                <div class="flip-card-back">
                  <div>Total Points</div>
                  <div class="text-4xl font-extrabold tracking-wide">420 pts</div>
                </div>
              </div>
            </div>

            <div class="text-center md:text-left">
              <div class="text-xl font-semibold text-gray-900 mb-2">Total Points</div>
              <div class="text-5xl font-extrabold text-green-600 tracking-wide">420 pts</div>
            </div>
          </div>
        </section>

        <!-- History Section -->
        <section class="space-y-8">
          <h2 class="text-3xl font-bold text-gray-900 tracking-tight">Collection History</h2>
          
          <!-- Example Entry -->
          <div class="flex items-start gap-6 p-6 rounded-xl shadow-lg bg-white hover:shadow-2xl transition">
            <i class="bi bi-shop text-4xl text-green-600 flex-shrink-0"></i>
            <div class="grid grid-cols-1 w-full gap-1">
              <div class="text-xl font-semibold text-gray-900">GreenMart</div>
              <div class="text-base text-gray-600">Recycled 5 plastic bottles and 2 cans</div>
            </div>
            <div class="ml-auto font-extrabold text-green-600 text-lg">+120 pts</div>
          </div>

          <div class="flex items-start gap-6 p-6 rounded-xl shadow-lg bg-white hover:shadow-2xl transition">
            <i class="bi bi-shop text-4xl text-green-600 flex-shrink-0"></i>
            <div class="grid grid-cols-1 w-full gap-1">
              <div class="text-xl font-semibold text-gray-900">EcoStore</div>
              <div class="text-base text-gray-600">Recycled small electronics</div>
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
    });

    // Logout buttons
    document.querySelectorAll('.logout').forEach(btn => {
      btn.addEventListener('click', () => {
        document.cookie = 'route=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        window.location.href = '/';
      });
    });

    // Mobile menu toggle
    document.getElementById('mobile-menu-button')?.addEventListener('click', () => {
      document.getElementById('mobile-menu')?.classList.toggle('hidden');
    });
  }
}
