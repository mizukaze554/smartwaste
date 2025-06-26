// auth/google.js
import { app } from '../firebase/main.js';
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { setCookie } from '../cookie/main.js';
import { loadRoute } from '../utils/routes.js';

const provider = new GoogleAuthProvider();
const auth = getAuth(app);

export function signInWithGoogle() {
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      console.log("User signed in:", user);

      // Example: Store route in cookie and load dashboard
      setCookie('route', '/users/dashboard', 7);
      loadRoute('/users/dashboard');
    })
    .catch((error) => {
      console.error("Google Sign-In error:", error);
    });
}
