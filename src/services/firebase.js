import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

//PRD
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};


//DEV
// const firebaseConfig = {
//   apiKey: "AIzaSyCJv1CMvVjhobMZ6x-1vCHexynI4xGX9hg",
//   authDomain: "sentinela-app-dev.firebaseapp.com",
//   projectId: "sentinela-app-dev",
//   storageBucket: "sentinela-app-dev.firebasestorage.app",
//   messagingSenderId: "97627603867",
//   appId: "1:97627603867:web:4f3c8daa0112b78d46d73e",
//   measurementId: "G-72VSD1MGCB"
// };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);