import { app } from '../firebase/main.js';
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const auth = getAuth(app);
const ADMIN_EMAIL = 'linhtetln67@gmail.com';

/**
 * Checks if the current logged-in user is the admin.
 * @returns {Promise<boolean>} true if admin, false otherwise
 */
export function isAdmin() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user && user.email === ADMIN_EMAIL) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}
