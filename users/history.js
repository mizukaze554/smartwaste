import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { app } from '../firebase/main.js';
import { db } from '../firebase/db.js';

export class History {
  constructor(userEmail) {
    this.userEmail = userEmail.toLowerCase();
  }

  async getHistoryHTML() {
    const unifiedLog = [];

    try {
      const userRef = doc(db, 'history', this.userEmail);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const log = userSnap.data().log || [];

        log.forEach((entry, index) => {
          if (!entry.timestamp) return;

          const isReceived = !!entry.sender;

          if (isReceived && !entry.sender) return;

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

      unifiedLog.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return unifiedLog.length === 0
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
          `).join('');

    } catch (err) {
      console.error("[History] Error fetching:", err);
      return `<p class="text-red-500 font-semibold">Failed to load transaction history.</p>`;
    }
  }
}
