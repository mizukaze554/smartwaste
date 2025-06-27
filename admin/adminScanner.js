import { getAuth } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { db } from '../firebase/db.js';
import {
  doc,
  runTransaction,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { renderNavbar, bindNavEvents } from '../users/nav.js';
import { loadRoute } from '../utils/routes.js';

// Make sure you have jsQR loaded globally in your HTML

export class AdminScanner {
  constructor() {
    this.pointsToGive = 0;
    this.render();
  }

  render() {
    const input = prompt("Enter the number of points to give:");
    const points = Number(input);
    if (isNaN(points) || points <= 0) {
      this.showResult('Invalid points entered.', 'fail');
      return;
    }
    this.pointsToGive = points;

    document.body.innerHTML = `
      ${renderNavbar()}

      <main class="pt-36 px-6 max-w-2xl mx-auto text-center space-y-10">
        <h2 class="text-4xl font-extrabold text-gray-900">Scan User QR Code</h2>
        <p class="text-lg text-gray-700 mb-4">Points to give: <strong>${this.pointsToGive}</strong></p>
        <video id="scanner" class="mx-auto w-full max-w-xs border-4 border-green-600 rounded-xl shadow-lg"></video>
        <p id="status" class="text-lg text-gray-700 mt-6">Waiting for scan...</p>

        <!-- Result box: To, Amount, Status -->
        <div id="result-box" class="grid grid-cols-1 gap-4 max-w-md mx-auto mt-10"></div>
      </main>
    `;

    bindNavEvents();
    this.initScanner();
  }

  showResult(message, type = 'fail', receiverEmail = '', amount = '') {
    // Clear video and status when showing result
    const video = document.getElementById('scanner');
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach(track => track.stop());
      video.remove();
    }
    const status = document.getElementById('status');
    if (status) status.textContent = '';

    // Show a clean UI with To, Amount, and Success/Fail message in center
    const resultBox = document.getElementById('result-box');
    if (!resultBox) return;

    // Clear previous
    resultBox.innerHTML = '';

    // Container div for message with bg color depending on type
    const bgColor = type === 'success' ? 'bg-green-100' : 'bg-red-100';
    const textColor = type === 'success' ? 'text-green-700' : 'text-red-700';

    const container = document.createElement('div');
    container.className = `${bgColor} ${textColor} rounded-xl p-6 shadow-lg`;

    // Content
    container.innerHTML = `
      <p class="text-lg font-semibold mb-2">To: <span class="font-normal">${receiverEmail || '-'}</span></p>
      <p class="text-lg font-semibold mb-2">Amount: <span class="font-normal">${amount || '-'}</span></p>
      <p class="text-xl font-bold">${message}</p>
    `;

    resultBox.appendChild(container);
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
      this.showResult('Camera access denied or not available.', 'fail');
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
      this.showResult('You must be signed in.', 'fail');
      return;
    }

    const senderEmail = sender.email.toLowerCase();
    const receiverEmail = userEmail.trim().toLowerCase();

    if (senderEmail === receiverEmail) {
      this.showResult('You cannot send points to yourself.', 'fail', receiverEmail, this.pointsToGive);
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

      // Play success sound from local /public/success.mp3
      const successAudio = new Audio('/public/success.mp3');
      successAudio.play();

      this.showResult('Success! Points sent.', 'success', receiverEmail, this.pointsToGive);

      // After sound ends, redirect to /users/dashboard
      successAudio.addEventListener('ended', () => {
        loadRoute('/users/dashboard');
      });

      // Fallback redirect after 3.5 seconds
      setTimeout(() => {
        loadRoute('/users/dashboard');
      }, 3500);

    } catch (error) {
      console.error("Transaction failed:", error);
      this.showResult('Error: ' + error.message, 'fail', receiverEmail, this.pointsToGive);
    }
  }
}
