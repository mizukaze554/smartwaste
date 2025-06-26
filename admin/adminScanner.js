import { getAuth } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { isAdmin } from '../middleware/admin.js';
import { db } from '../firebase/db.js';
import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { renderNavbar, bindNavEvents } from '../users/nav.js';

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
      // Optionally redirect or reload to go back
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

        // Use jsQR to decode
        const code = jsQR(imageData.data, canvas.width, canvas.height);
        if (code) {
          status.textContent = `QR Code detected: ${code.data}`;
          // Stop video stream after scan
          video.srcObject.getTracks().forEach(track => track.stop());

          // Award points
          await this.awardPointsToUser(code.data);

          // Optionally reset or reload to scan again
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
    const receiverId = userKey; // scanned QR must encode user.uid

    if (senderId === receiverId) {
      alert("Cannot send points to yourself.");
      return;
    }

    const senderRef = doc(db, 'users', senderId);
    const receiverRef = doc(db, 'users', receiverId);

    const [senderSnap, receiverSnap] = await Promise.all([getDoc(senderRef), getDoc(receiverRef)]);

    if (!receiverSnap.exists()) {
      alert("Receiver not found.");
      return;
    }

    const senderTotal = senderSnap.exists() ? senderSnap.data().total || 0 : 0;
    const receiverTotal = receiverSnap.exists() ? receiverSnap.data().total || 0 : 0;

    const amount = this.pointsToGive;
    if (senderTotal < amount) {
      alert(`❌ Not enough points to send. You have ${senderTotal} pts, tried to send ${amount} pts.`);
      return;
    }

    await updateDoc(senderRef, { total: senderTotal - amount });
    await updateDoc(receiverRef, { total: receiverTotal + amount });

    // Log history under sender
    const historyRef = doc(db, `history/${senderId}`);
    const historySnap = await getDoc(historyRef);
    const history = historySnap.exists() ? historySnap.data().log || [] : [];

    history.push({
      receiver: receiverId,
      points: amount,
      timestamp: new Date().toISOString()
    });

    await setDoc(historyRef, { log: history }, { merge: true });

    alert(`✅ Sent ${amount} pts to ${receiverId}`);
  }
}
