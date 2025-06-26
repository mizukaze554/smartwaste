import { getFirestore } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { app } from './main.js';

// Initialize Firestore database instance
const db = getFirestore(app);

export { db };
