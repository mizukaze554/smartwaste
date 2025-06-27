import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { app } from '../firebase/main.js';
import { db } from '../firebase/db.js';

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

      try {
        const unifiedLog = [];

        const userRef = doc(db, 'history', userEmail);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const log = userSnap.data().log || [];

          log.forEach(entry => {
            const isReceived = !!entry.sender;

            unifiedLog.push({
              ...entry,
              type: isReceived ? 'received' : 'sent',
              party: isReceived ? entry.sender : entry.receiver,
              icon: isReceived ? 'bi-person' : 'bi-shop',
              sign: isReceived ? '+' : '-',
              cssBorder: isReceived ? 'border-blue-200' : 'border-green-200',
              cssText: isReceived ? 'text-blue-600' : 'text-green-600',
              directionText: isReceived ? 'From' : 'To'
            });
          });
        }

        // Sort newest first
        unifiedLog.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Render UI
        document.body.innerHTML = `
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


      } catch (error) {
        console.error("Error loading history:", error);
        document.body.innerHTML = `
          ${renderNavbar()}
          <main class="pt-36 text-center">
            <p class="text-xl font-semibold text-red-500">Error loading history: ${error.message}</p>
          </main>
        `;
      }
    });
  }
}
