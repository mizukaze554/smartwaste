import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import {
  doc,
  collection,
  getDoc,
  getDocs
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
      let sentLog = [];
      let receivedLog = [];

      try {
        // Fetch user's sent transactions
        const sentRef = doc(db, 'history', userEmail);
        const sentSnap = await getDoc(sentRef);
        if (sentSnap.exists()) {
          sentLog = sentSnap.data().log || [];
        }

        // Fetch all histories to find received ones
        const historyCollection = collection(db, 'history');
        const allHistories = await getDocs(historyCollection);

        allHistories.forEach(docSnap => {
          const senderEmail = docSnap.id.toLowerCase();
          const log = docSnap.data().log || [];
          log.forEach(entry => {
            if (entry.receiver?.toLowerCase() === userEmail) {
              receivedLog.push({
                ...entry,
                sender: senderEmail
              });
            }
          });
        });

        // Merge & decorate logs
        const unifiedLog = [
          ...sentLog.map(entry => ({
            ...entry,
            type: 'sent',
            party: entry.receiver,
            icon: 'bi-shop',
            sign: '-',
            cssBorder: 'border-green-200',
            cssText: 'text-green-600',
            directionText: 'To'
          })),
          ...receivedLog.map(entry => ({
            ...entry,
            type: 'received',
            party: entry.sender,
            icon: 'bi-person',
            sign: '+',
            cssBorder: 'border-blue-200',
            cssText: 'text-blue-600',
            directionText: 'From'
          }))
        ];

        // Sort by newest first
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
