import { isAdmin } from '../middleware/admin.js';
import { db } from '../firebase/db.js';
import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { renderNavbar, bindNavEvents } from '../users/nav.js';

export class AdminScanner {
  constructor() {
    this.render();
  }

  render() {
    document.body.innerHTML = `
      ${renderNavbar()}

      <main class="pt-36 px-6 max-w-2xl mx-auto space-y-10 text-center">
        <h2 class="text-4xl font-extrabold text-gray-900">Scan User QR Code</h2>
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

    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    video.srcObject = stream;
    video.setAttribute("playsinline", true); // iOS fix
    video.play();

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
          status.textContent = `QR Code: ${code.data}`;
          await this.awardPointsToUser(code.data);
        }
      }
      requestAnimationFrame(detectQR);
    };

    requestAnimationFrame(detectQR);
  }

  async awardPointsToUser(userKey) {
    const userDocRef = doc(db, 'users', userKey);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      alert("User not found.");
      return;
    }

    const prevTotal = userSnap.data().total || 0;
    const newTotal = prevTotal + 100; // award 100 points

    await updateDoc(userDocRef, { total: newTotal });
    alert(`✅ 100 points added! New total: ${newTotal}`);
  }
}
