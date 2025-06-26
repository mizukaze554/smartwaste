// firebase/main.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyBfQNl_0bqtQs4cknvA8Otk_VWqIP58Jcs",
  authDomain: "smartwastes.firebaseapp.com",
  projectId: "smartwastes",
  storageBucket: "smartwastes.firebasestorage.app",
  messagingSenderId: "135483104260",
  appId: "1:135483104260:web:dff6edb63b45a872c0e951",
  measurementId: "G-B3GZ28XKX6"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app };
