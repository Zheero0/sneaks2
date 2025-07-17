// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add your web app's Firebase configuration here
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDiDoZkKvj59xyqaP6fTNroXkEg-gKyB4c",
  authDomain: "sneaks-demo.firebaseapp.com",
  projectId: "sneaks-demo",
  storageBucket: "sneaks-demo.firebasestorage.app",
  messagingSenderId: "673820386953",
  appId: "1:673820386953:web:20283c3e5cbe0ef6c7c858"
};


// Initialize Firebase
// We check if an app is already initialized to prevent errors during hot-reloads.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
