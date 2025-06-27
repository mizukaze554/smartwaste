import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { app } from '../firebase/main.js';
import { db } from '../firebase/db.js';
import { renderNavbar, bindNavEvents } from './nav.js';

export class History {
  constructor() {
    this.auth = getAuth(app);
    this.init();
  }

  async init() {
    onAuthStateChanged(this.auth, async (user) => {
      if (!user) {
        document.body.innerHTML = `
          <main class="pt-36 text-center">
            <p class="text-xl font-semibold text-red-500">Please sign in to view your history.</p>
          </main>
        `;
        return;
      }

      const userEmail = user.email.toLowerCase();
      let unifiedLog = [];

      try {
        const historyRef = doc(db, 'history', userEmail);
        const historySnap = await getDoc(historyRef);

        if (historySnap.exists()) {
          const rawLog = historySnap.data().log || [];

          rawLog.forEach(entry => {
            if (entry.sender?.toLowerCase() === userEmail) {
              // User received points
              unifiedLog.push({
                ...entry,
                type: 'received',
                party: entry.sender,
                icon: 'bi-person',
                sign: '+',
                cssBorder: 'border-blue-200',
                cssText: 'text-blue-600',
                directionText: 'From'
              });
            } else if (entry.receiver?.toLowerCase() === userEmail) {
              // User sent points
              unifiedLog.push({
                ...entry,
                type: 'sent',
                party: entry.receiver,
                icon: 'bi-shop',
                sign: '-',
                cssBorder: 'border-green-200',
                cssText: 'text-green-600',
                directionText: 'To'
              });
            }
          });
        }

        // Sort by most recent first
        unifiedLog.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Render
        document.body.innerHTML = `
          ${renderNavbar()}
          <main class="pt-36 px-6 max-w-4xl mx-auto space-y-16">
            <section>
              <h2 class="text-3xl font-extrabold text-gray-900 mb-6">Full Transaction History</h2>
              <div class="space-y-6">
                ${
                  unifiedLog.length === 0
                    ? `<p class="text-gray-500">No transactions yet.</p>`
                    : unifiedLog.map(entry => `
                      <div class="bg-white p-5 shadow-md rounded-xl border ${entry.cssBorder} flex items-center gap-6">
                        <i class="bi ${entry.icon} text-3xl ${entry.cssText}"></i>
                        <div class="flex-1 text-left">
                          <div class="text-lg font-semibold text-gray-800">${entry.directionText}: ${entry.party}</div>
                          <div class="text-sm text-gray-500 mt-1">${new Date(entry.timestamp).toLocaleString()}</div>
                        </div>
                        <div class="font-bold text-xl ${entry.cssText}">${entry.sign}${entry.points} pts</div>
                      </div>
                    `).join('')
                }
              </div>
            </section>
          </main>
        `;

        bindNavEvents();

      } catch (error) {
        console.error("Error loading history:", error);
        document.body.innerHTML = `
          ${renderNavbar()}
          <main class="pt-36 text-center">
            <p class="text-xl font-semibold text-red-500">Error loading history: ${error.message}</p>
          </main>
        `;
        bindNavEvents();
      }
    });
  }
}
