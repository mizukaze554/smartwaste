import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import {
  doc,
  getDoc,
  collection,
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

      try {
        const userEmail = user.email.toLowerCase();

        // Sent transactions (your own document)
        const sentRef = doc(db, 'history', userEmail);
        const sentSnap = await getDoc(sentRef);
        const sentLog = sentSnap.exists() ? sentSnap.data().log || [] : [];

        // Received transactions (search others' logs)
        const historyCollection = collection(db, 'history');
        const allHistories = await getDocs(historyCollection);

        const receivedLog = [];
        allHistories.forEach(docSnap => {
          const log = docSnap.data().log || [];
          log.forEach(entry => {
            if (entry.receiver?.toLowerCase() === userEmail) {
              receivedLog.push({
                sender: docSnap.id,
                ...entry
              });
            }
          });
        });

        // Sort both lists (most recent first)
        sentLog.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        receivedLog.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        document.body.innerHTML = `
          ${renderNavbar()}
          <main class="pt-36 px-6 max-w-4xl mx-auto space-y-16">
            <section>
              <h2 class="text-3xl font-extrabold text-gray-900 mb-6">Sent Points</h2>
              <div class="space-y-6">
                ${
                  sentLog.length === 0
                    ? `<p class="text-gray-500">No points sent.</p>`
                    : sentLog.map(entry => `
                        <div class="bg-white p-5 shadow-md rounded-xl border border-green-200">
                          <div class="text-lg font-semibold text-gray-800">To: ${entry.receiver}</div>
                          <div class="text-green-600 font-bold text-xl">- ${entry.points} pts</div>
                          <div class="text-sm text-gray-500 mt-1">${new Date(entry.timestamp).toLocaleString()}</div>
                        </div>
                      `).join('')
                }
              </div>
            </section>

            <section>
              <h2 class="text-3xl font-extrabold text-gray-900 mb-6">Received Points</h2>
              <div class="space-y-6">
                ${
                  receivedLog.length === 0
                    ? `<p class="text-gray-500">No points received.</p>`
                    : receivedLog.map(entry => `
                        <div class="bg-white p-5 shadow-md rounded-xl border border-blue-200">
                          <div class="text-lg font-semibold text-gray-800">From: ${entry.sender}</div>
                          <div class="text-blue-600 font-bold text-xl">+ ${entry.points} pts</div>
                          <div class="text-sm text-gray-500 mt-1">${new Date(entry.timestamp).toLocaleString()}</div>
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
          <main class="pt-36 text-center">
            <p class="text-xl font-semibold text-red-500">Error loading history: ${error.message}</p>
          </main>
        `;
      }
    });
  }
}
