// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBqKT1K2WNUaMBNNr-gb5T0jIK7YMPm2nc",
  authDomain: "paper-ms.firebaseapp.com",
  projectId: "paper-ms",
  storageBucket: "paper-ms.firebasestorage.app",
  messagingSenderId: "131317648054",
  appId: "1:131317648054:web:b74cd5f211dcb3869bf417"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
