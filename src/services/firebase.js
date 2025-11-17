import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
	apiKey: "AIzaSyC1cvylIl46k9TY1M8THQkTwC_Lw3xpdME",
	authDomain: "sentinela-app-a6056.firebaseapp.com",
	projectId: "sentinela-app-a6056",
	storageBucket: "sentinela-app-a6056.firebasestorage.app",
	messagingSenderId: "404143209455",
	appId: "1:404143209455:web:a8392e10e27bf36a4fd41a",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
