import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { app } from '../firebase/main.js';
import { db } from '../firebase/db.js';
import { renderNavbar, bindNavEvents } from './nav.js';

export class History {
  constructor() {
    this.render();
  }

  async render() {
    const auth = getAuth(app);

    onAuthStateChanged(auth, async user => {
      if (!user) {
        document.body.innerHTML = '<p class="text-center mt-40 text-xl font-semibold text-red-500">Please sign in.</p>';
        return;
      }

      const userEmail = user.email.toLowerCase();
      const historyRef = doc(db, 'history', userEmail);
      const historySnap = await getDoc(historyRef);
      const log = historySnap.exists() ? historySnap.data().log || [] : [];

      document.body.innerHTML = `
        ${renderNavbar()}

        <main class="pt-36 px-6 max-w-4xl mx-auto space-y-10">
          <h2 class="text-3xl font-extrabold text-gray-900">Sent Points History</h2>
          <div class="space-y-6">
            ${
              log.length === 0
                ? `<p class="text-gray-500">No transactions found.</p>`
                : log.map(entry => `
                  <div class="bg-white p-5 shadow-md rounded-xl border border-green-200">
                    <div class="text-lg font-semibold text-gray-800">Sent to: ${entry.receiver}</div>
                    <div class="text-green-600 font-bold text-xl">+${entry.points} pts</div>
                    <div class="text-sm text-gray-500 mt-1">${new Date(entry.timestamp).toLocaleString()}</div>
                  </div>
                `).join('')
            }
          </div>
        </main>
      `;

      bindNavEvents();
    });
  }
}
