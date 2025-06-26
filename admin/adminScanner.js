import { getAuth } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { isAdmin } from '../middleware/admin.js';
import { db } from '../firebase/db.js';
import {
  doc,
  getDoc,
  setDoc,
  runTransaction,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { renderNavbar, bindNavEvents } from '../users/nav.js';

// Make sure you have jsQR loaded globally in your HTML for QR decoding

export class AdminScanner {
  constructor() {
    this.pointsToGive = 0;
    this.render();
  }

  async render() {
    // Ask how many points to give BEFORE camera starts
    const input = prompt("Enter the number of points to give:");
    const points = Number(input);
    if (isNaN(points) || points <= 0) {
      alert("Please enter a valid positive number of points.");
      window.history.back();
      return;
    }
    this.pointsToGive = points;

    document.body.innerHTML = `
      ${renderNavbar()}

      <main class="pt-36 px-6 max-w-2xl mx-auto space-y-10 text-center">
        <h2 class="text-4xl font-extrabold text-gray-900">Scan User QR Code</h2>
        <p class="text-lg text-gray-700 mb-4">Points to give: <strong>${this.pointsToGive}</strong></p>
        <video id="scanner" class="mx-auto w-full max-w-xs border-4 border-green-600 rounded-xl shadow-lg"></video>
        <p id="status" class="text-lg text-gray-700 mt-6">Waiting for scan...</p>
      </main>
    `;

    bindNavEvents();
    this.initScanner();
  }

  async initScanner() {
    const status = document.getElementById('status');
    const video = document.getElementById('scanner');

    if (!(await isAdmin())) {
      status.textContent = "Access denied. Admins only.";
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      video.srcObject = stream;
      video.setAttribute("playsinline", true); // iOS fix
      video.play();
    } catch (err) {
      status.textContent = "Camera access denied or not available.";
      console.error(err);
      return;
    }

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    const detectQR = async () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        // Decode QR code with jsQR (make sure jsQR is included in your project)
        const code = jsQR(imageData.data, canvas.width, canvas.height);
        if (code) {
          status.textContent = `QR Code detected: ${code.data}`;
          // Stop video stream after scan
          video.srcObject.getTracks().forEach(track => track.stop());

          // Award points
          await this.awardPointsToUser(code.data);

          // Optionally reload page or close scanner
          // window.location.reload();
          return; // stop scanning after one detection
        }
      }
      requestAnimationFrame(detectQR);
    };

    requestAnimationFrame(detectQR);
  }

  async awardPointsToUser(userKey) {
    const auth = getAuth();
    const admin = auth.currentUser;
    if (!admin) {
      alert("Admin not authenticated.");
      return;
    }

    const senderId = admin.uid;
    const receiverId = userKey; // QR must encode uid exactly

    if (senderId === receiverId) {
      alert("Cannot send points to yourself.");
      return;
    }

    const senderRef = doc(db, 'users', senderId);
    const receiverRef = doc(db, 'users', receiverId);
    const historyRef = doc(db, 'history', senderId);

    try {
      await runTransaction(db, async (transaction) => {
        const senderDoc = await transaction.get(senderRef);
        const receiverDoc = await transaction.get(receiverRef);
        const historyDoc = await transaction.get(historyRef);

        if (!receiverDoc.exists()) {
          throw new Error("Receiver not found.");
        }

        const senderTotal = senderDoc.exists() ? senderDoc.data().total || 0 : 0;
        const receiverTotal = receiverDoc.exists() ? receiverDoc.data().total || 0 : 0;

        if (senderTotal < this.pointsToGive) {
          throw new Error(`Not enough points to send. You have ${senderTotal} pts, tried to send ${this.pointsToGive} pts.`);
        }

        // Update sender and receiver totals atomically
        transaction.update(senderRef, { total: senderTotal - this.pointsToGive });
        transaction.update(receiverRef, { total: receiverTotal + this.pointsToGive });

        // Append to history log
        const history = historyDoc.exists() ? historyDoc.data().log || [] : [];
        history.push({
          receiver: receiverId,
          points: this.pointsToGive,
          timestamp: new Date().toISOString()
        });

        transaction.set(historyRef, { log: history }, { merge: true });
      });

      alert(`✅ Sent ${this.pointsToGive} pts to ${receiverId}`);

    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Error sending points: " + error.message);
    }
  }
}
