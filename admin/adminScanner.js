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

  async awardPointsToUser(userEmail) {
  const auth = getAuth();
  const admin = auth.currentUser;
  if (!admin) {
    alert("Admin not authenticated.");
    return;
  }

  const senderEmail = admin.email.toLowerCase();
  const receiverEmail = userEmail.trim().toLowerCase();

  if (senderEmail === receiverEmail) {
    alert("Cannot send points to yourself.");
    return;
  }

  const senderRef = doc(db, 'users', senderEmail);
  const receiverRef = doc(db, 'users', receiverEmail);
  const senderHistoryRef = doc(db, 'history', senderEmail);
  const receiverHistoryRef = doc(db, 'history', receiverEmail);

  const senderIsAdmin = await isAdmin();

  try {
    await runTransaction(db, async (transaction) => {
      const senderDoc = await transaction.get(senderRef);
      const receiverDoc = await transaction.get(receiverRef);
      const senderHistoryDoc = await transaction.get(senderHistoryRef);
      const receiverHistoryDoc = await transaction.get(receiverHistoryRef);

      const senderTotal = senderDoc.exists() ? senderDoc.data().total || 0 : 0;
      const receiverTotal = receiverDoc.exists() ? receiverDoc.data().total || 0 : 0;

      if (!senderIsAdmin && senderTotal < this.pointsToGive) {
        throw new Error(`Not enough points to send. You have ${senderTotal}, tried to send ${this.pointsToGive}.`);
      }

      // Update sender balance
      if (!senderIsAdmin) {
        transaction.set(senderRef, { total: senderTotal - this.pointsToGive }, { merge: true });
      }

      // Update receiver balance
      transaction.set(receiverRef, { total: receiverTotal + this.pointsToGive }, { merge: true });

      const timestamp = new Date().toISOString();

      // Update sender's history (as "sent")
      const senderLog = senderHistoryDoc.exists() ? senderHistoryDoc.data().log || [] : [];
      senderLog.push({
        receiver: receiverEmail,
        points: this.pointsToGive,
        timestamp: timestamp,
        type: "sent"
      });
      transaction.set(senderHistoryRef, { log: senderLog }, { merge: true });

      // Update receiver's history (as "received")
      const receiverLog = receiverHistoryDoc.exists() ? receiverHistoryDoc.data().log || [] : [];
      receiverLog.push({
        sender: senderEmail,
        points: this.pointsToGive,
        timestamp: timestamp,
        type: "received"
      });
      transaction.set(receiverHistoryRef, { log: receiverLog }, { merge: true });
    });

    alert(`✅ Sent ${this.pointsToGive} pts to ${receiverEmail}`);
  } catch (error) {
    console.error("Transaction failed:", error);
    alert("Error sending points: " + error.message);
  }
}


}
