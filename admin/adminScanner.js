import { getAuth } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { db } from '../firebase/db.js';
import {
  doc,
  runTransaction,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { renderNavbar, bindNavEvents } from '../users/nav.js';

// Make sure you have jsQR loaded globally in your HTML

export class AdminScanner {
  constructor() {
    this.pointsToGive = 0;
    this.render();
  }

  renderToastContainer() {
    if (!document.getElementById('toast-container')) {
      const container = document.createElement('div');
      container.id = 'toast-container';
      container.style.position = 'fixed';
      container.style.top = '1rem';
      container.style.right = '1rem';
      container.style.zIndex = '9999';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '0.5rem';
      document.body.appendChild(container);
    }
  }

  showToast(message, type = 'info', duration = 3000) {
    this.renderToastContainer();

    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '10px';
    toast.style.color = 'white';
    toast.style.fontWeight = '600';
    toast.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    toast.style.minWidth = '250px';
    toast.style.maxWidth = '300px';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';

    switch(type) {
      case 'success':
        toast.style.backgroundColor = '#22c55e'; // green-500
        break;
      case 'error':
        toast.style.backgroundColor = '#ef4444'; // red-500
        break;
      case 'warning':
        toast.style.backgroundColor = '#facc15'; // yellow-400
        toast.style.color = '#000';
        break;
      default:
        toast.style.backgroundColor = '#3b82f6'; // blue-500
    }

    document.getElementById('toast-container').appendChild(toast);

    // Fade in
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
    });

    // Remove after duration
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.addEventListener('transitionend', () => toast.remove());
    }, duration);
  }

  async render() {
    const input = prompt("Enter the number of points to give:");
    const points = Number(input);
    if (isNaN(points) || points <= 0) {
      this.showToast("Please enter a valid positive number of points.", "error");
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

    status.textContent = "Point scanner ready. Hold a QR code in front of the camera.";

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      video.srcObject = stream;
      video.setAttribute("playsinline", true);
      video.play();
    } catch (err) {
      status.textContent = "Camera access denied or not available.";
      console.error(err);
      this.showToast("Camera access denied or not available.", "error");
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

        const code = jsQR(imageData.data, canvas.width, canvas.height);
        if (code) {
          status.textContent = `QR Code detected: ${code.data}`;
          video.srcObject.getTracks().forEach(track => track.stop());
          await this.awardPointsToUser(code.data);
          return;
        }
      }
      requestAnimationFrame(detectQR);
    };

    requestAnimationFrame(detectQR);
  }

  async awardPointsToUser(userEmail) {
    const auth = getAuth();
    const sender = auth.currentUser;
    if (!sender) {
      this.showToast("You must be signed in.", "error");
      return;
    }

    const senderEmail = sender.email.toLowerCase();
    const receiverEmail = userEmail.trim().toLowerCase();

    if (senderEmail === receiverEmail) {
      this.showToast("You cannot send points to yourself.", "warning");
      return;
    }

    const senderRef = doc(db, 'users', senderEmail);
    const receiverRef = doc(db, 'users', receiverEmail);
    const senderHistoryRef = doc(db, 'history', senderEmail);
    const receiverHistoryRef = doc(db, 'history', receiverEmail);

    const admins = ['linhtetln67@gmail.com', 'kingsoccer367@gmail.com'];

    try {
      await runTransaction(db, async (transaction) => {
        const senderDoc = await transaction.get(senderRef);
        const receiverDoc = await transaction.get(receiverRef);
        const senderHistoryDoc = await transaction.get(senderHistoryRef);
        const receiverHistoryDoc = await transaction.get(receiverHistoryRef);

        const senderTotal = senderDoc.exists() ? senderDoc.data().total || 0 : 0;
        const receiverTotal = receiverDoc.exists() ? receiverDoc.data().total || 0 : 0;

        if (!admins.includes(senderEmail)) {
          if (senderTotal < this.pointsToGive) {
            throw new Error(`Not enough points to send. You have ${senderTotal}, tried to send ${this.pointsToGive}.`);
          }
          transaction.set(senderRef, { total: senderTotal - this.pointsToGive }, { merge: true });
        }

        transaction.set(receiverRef, { total: receiverTotal + this.pointsToGive }, { merge: true });

        const timestamp = new Date().toISOString();

        const senderLog = senderHistoryDoc.exists() ? senderHistoryDoc.data().log || [] : [];
        senderLog.push({ receiver: receiverEmail, points: this.pointsToGive, timestamp, type: "sent" });
        transaction.set(senderHistoryRef, { log: senderLog }, { merge: true });

        const receiverLog = receiverHistoryDoc.exists() ? receiverHistoryDoc.data().log || [] : [];
        receiverLog.push({ sender: senderEmail, points: this.pointsToGive, timestamp, type: "received" });
        transaction.set(receiverHistoryRef, { log: receiverLog }, { merge: true });
      });

      // Play success sound
      const successAudio = new Audio('https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg');
      successAudio.play();

      this.showToast(`✅ Sent ${this.pointsToGive} pts to ${receiverEmail}`, 'success');

      successAudio.addEventListener('ended', () => {
        location.reload();
      });

      setTimeout(() => {
        location.reload();
      }, 4000);

    } catch (error) {
      console.error("Transaction failed:", error);
      this.showToast("Error sending points: " + error.message, 'error');
    }
  }
}
