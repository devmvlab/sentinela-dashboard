import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

//PRD
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
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