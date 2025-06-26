import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { app } from '../firebase/main.js';
import { db } from '../firebase/db.js';
import { signOutUser } from '../auth/google.js';
import { renderNavbar, bindNavEvents } from './nav.js';
import { isAdmin } from '../middleware/admin.js';
import { AdminScanner } from '../admin/adminScanner.js';
import { History } from './history.js';

export class Home {
  constructor() {
    this.render();
  }

  async render() {
    const auth = getAuth(app);

    onAuthStateChanged(auth, async user => {
      if (!user) {
        document.body.innerHTML = '<p class="text-center mt-40 text-2xl font-semibold text-red-500">Please sign in to continue.</p>';
        return;
      }

      const userId = `${user.displayName}${user.email}`;
      const qrData = encodeURIComponent(userId);
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${qrData}`;

      const isAdminUser = await isAdmin();
      let totalPoints = 0;

      if (!isAdminUser) {
        const userDoc = await getDoc(doc(db, 'users', userId));
        totalPoints = userDoc.exists() ? userDoc.data().total || 0 : 0;
      }

      // Get user's transaction history
      let historyHTML = '<p class="text-gray-500">No transactions yet.</p>';
      try {
        const historyRef = doc(db, 'history', userId);
        const historySnap = await getDoc(historyRef);
        const historyData = historySnap.exists() ? historySnap.data().log || [] : [];

        if (historyData.length > 0) {
          historyHTML = historyData.reverse().map(entry => `
            <div class="flex items-start gap-6 p-6 rounded-2xl shadow-lg bg-white hover:shadow-2xl transition">
              <i class="bi bi-shop text-5xl text-green-600 flex-shrink-0"></i>
              <div class="grid grid-cols-1 w-full gap-1">
                <div class="text-xl font-semibold text-gray-900">To: ${entry.receiver}</div>
                <div class="text-base text-gray-600 leading-relaxed">Sent points to user</div>
              </div>
              <div class="ml-auto font-extrabold text-green-600 text-lg">-${entry.points} pts</div>
            </div>
          `).join('');
        }
      } catch (error) {
        console.error('Error loading history:', error);
      }

      document.body.innerHTML = `
        <style>
          .flip-card {
            perspective: 1000px;
            width: 160px;
            height: 160px;
            cursor: pointer;
          }
          .flip-card-inner {
            position: relative;
            width: 100%;
            height: 100%;
            transition: transform 0.6s;
            transform-style: preserve-3d;
            border-radius: 0.75rem;
            box-shadow: 0 10px 15px -3px rgba(22, 163, 74, 0.3), 0 4px 6px -2px rgba(22, 163, 74, 0.2);
            background: white;
          }
          .flip-card.flipped .flip-card-inner {
            transform: rotateY(180deg);
          }
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
          .flip-card-front {
            background: white;
            overflow: hidden;
          }
          .flip-card-back {
            background: white;
            color: #16a34a;
            font-weight: 700;
            transform: rotateY(180deg);
            flex-direction: column;
            gap: 0.5rem;
            text-align: center;
            padding: 1rem;
            box-sizing: border-box;
          }
          @media (min-width: 768px) {
            .flip-card {
              width: 200px;
              height: 200px;
            }
            .flip-card-back {
              font-size: 2.25rem;
            }
          }
        </style>

        ${renderNavbar()} 

        <main class="pt-36 px-6 max-w-4xl mx-auto space-y-24">
          <section class="bg-white shadow-2xl rounded-3xl p-10 space-y-10">
            <h2 class="text-4xl font-extrabold text-gray-900 text-center tracking-tight select-none">Your Waste Card</h2>

            <div class="flex flex-col md:flex-row justify-center items-center gap-14 px-6">
              <div class="flip-card" id="flip-card" role="button" tabindex="0" aria-pressed="false" aria-label="Flip waste card to see total points">
                <div class="flip-card-inner">
                  <div class="flip-card-front">
                    <img src="${qrUrl}" alt="QR Code" class="w-full h-full rounded-lg object-contain" />
                  </div>
                  <div class="flip-card-back" aria-hidden="true">
                    ${
                      isAdminUser
                        ? `<i class="bi bi-infinity text-6xl text-green-600"></i>`
                        : `
                          <div class="text-lg font-semibold">Total Points</div>
                          <div class="text-5xl font-extrabold tracking-wide">${totalPoints} pts</div>
                        `
                    }
                  </div>
                </div>
              </div>
            </div>

            ${
              isAdminUser
                ? `
                  <div class="text-center pt-8">
                    <button id="open-scanner" class="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition">
                      Open Scanner
                    </button>
                  </div>
                `
                : ''
            }
          </section>

          <section class="space-y-12">
            <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight select-none">Collection History</h2>
            ${historyHTML}
          </section>
        </main>
      `;

      bindNavEvents();
      this.bindEvents();
    });
  }

  bindEvents() {
    const flipCard = document.getElementById('flip-card');
    flipCard?.addEventListener('click', () => {
      flipCard.classList.toggle('flipped');
      flipCard.setAttribute('aria-pressed', flipCard.classList.contains('flipped'));
    });

    flipCard?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        flipCard.click();
      }
    });

    document.getElementById('open-scanner')?.addEventListener('click', () => {
      new AdminScanner();
    });

    document.querySelectorAll('.logout').forEach(btn => {
      btn.addEventListener('click', signOutUser);
    });

    document.getElementById('mobile-menu-button')?.addEventListener('click', () => {
      document.getElementById('mobile-menu')?.classList.toggle('hidden');
    });
  }
}
