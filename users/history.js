import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
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

      if (unifiedLog.length === 0) {
        return `<p class="text-gray-500 text-center text-base md:text-lg">No transactions yet.</p>`;
      }

      return unifiedLog.map(entry => `
        <div class="bg-white p-4 sm:p-5 md:p-6 shadow-md rounded-2xl border ${entry.cssBorder} flex items-center gap-4 sm:gap-6">
          <i class="bi ${entry.icon} text-2xl sm:text-3xl md:text-4xl ${entry.cssText} flex-shrink-0"></i>
          <div class="flex-1 min-w-0">
            <div class="text-base sm:text-lg md:text-xl font-semibold text-gray-800 truncate">
              ${entry.directionText}: <span class="break-words">${entry.party}</span>
            </div>
            <div class="text-xs sm:text-sm text-gray-500 mt-1">${new Date(entry.timestamp).toLocaleString()}</div>
          </div>
          <div class="text-sm sm:text-base md:text-lg font-bold ${entry.cssText} whitespace-nowrap">${entry.sign}${entry.points} pts</div>
        </div>
      `).join('');

    } catch (err) {
      console.error("[History] Error fetching:", err);
      return `<p class="text-red-500 font-semibold text-center text-base md:text-lg">Failed to load transaction history.</p>`;
    }
  }
}
