// auth/google.js
import { app } from '../firebase/main.js';
import { getAuth, signInWithPopup, signOut, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { setCookie } from '../cookie/main.js';
import { loadRoute } from '../utils/routes.js';

const provider = new GoogleAuthProvider();
const auth = getAuth(app);

export function signInWithGoogle() {
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      console.log("User signed in:", user);

      // Store route and login state in cookie
      setCookie('route', '/users/dashboard', 7);
      setCookie('loggedIn', 'true', 7);

      loadRoute('/users/dashboard');
    })
    .catch((error) => {
      console.error("Google Sign-In error:", error);
    });
}

export function signOutUser() {
  signOut(auth)
    .then(() => {
      // Clear cookies
      document.cookie = 'route=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'loggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

      // Redirect to home/login
      window.location.href = '/';
    })
    .catch((error) => {
      console.error("Logout error:", error);
    });
}

// Utility: Check if user is logged in via cookie
export function isUserLoggedIn() {
  return document.cookie.includes('loggedIn=true');
}
