import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { app } from '../firebase/main.js';
import { db } from '../firebase/db.js';

export class History {
  constructor() {
    console.log("[History] Constructor called.");
    this.auth = getAuth(app);
    this.init();
  }

  async init() {
    console.log("[History] Init called, waiting for auth state...");

    onAuthStateChanged(this.auth, async (user) => {
      console.log("[Auth] State changed.");

      if (!user) {
        console.warn("[Auth] No user is signed in.");
        document.body.innerHTML = `
          <main class="pt-36 text-center">
            <p class="text-xl font-semibold text-red-500">Please sign in to view your history.</p>
          </main>
        `;
        return;
      }

      console.log("[Auth] User signed in:", user.email);

      const userEmail = user.email.toLowerCase();
      const unifiedLog = [];

      try {
        const userRef = doc(db, 'history', userEmail);
        console.log("[Firestore] Fetching document:", `history/${userEmail}`);

        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          console.warn("[Firestore] No history document found for user.");
        } else {
          const log = userSnap.data().log || [];
          console.log(`[Firestore] Loaded ${log.length} log entries.`);

          log.forEach((entry, index) => {
            console.log(`[Log Entry ${index}] Raw data:`, entry);

            if (!entry.timestamp) {
              console.warn(`[Log Entry ${index}] Skipped: Missing timestamp.`);
              return;
            }

            const isReceived = !!entry.sender;

            if (isReceived && !entry.sender) {
              console.warn(`[Log Entry ${index}] Skipped: Invalid received entry (missing sender).`);
              return;
            }

            const logEntry = {
              ...entry,
              type: isReceived ? 'received' : 'sent',
              party: isReceived ? entry.sender : entry.receiver,
              icon: isReceived ? 'bi-person' : 'bi-shop',
              sign: isReceived ? '+' : '-',
              cssBorder: isReceived ? 'border-blue-200' : 'border-green-200',
              cssText: isReceived ? 'text-blue-600' : 'text-green-600',
              directionText: isReceived ? 'From' : 'To'
            };

            console.log(`[Log Entry ${index}] Final parsed entry:`, logEntry);
            unifiedLog.push(logEntry);
          });
        }

        unifiedLog.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        console.log("[History] Sorted unified log:", unifiedLog);

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

        console.log("[History] Render complete.");

      } catch (err) {
        console.error("[Error] While loading transaction history:", err);

        document.body.innerHTML = `
          <main class="pt-36 text-center">
            <p class="text-xl font-semibold text-red-500">Error loading history: ${err.message}</p>
          </main>
        `;
      }
    });
  }
}
