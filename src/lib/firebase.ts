// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDPTPNoo6HpU7LZeUj-XRWGgIoFZNwHkes",
  authDomain: "i-feel-therefore-i-write.firebaseapp.com",
  projectId: "i-feel-therefore-i-write",
  storageBucket: "i-feel-therefore-i-write.firebasestorage.app",
  messagingSenderId: "944118167142",
  appId: "1:944118167142:web:188d900e91dc3a7fe2dfa7",
  measurementId: "G-Z8FP693QGW"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Set auth persistence to local (browser) so user remains logged in across reloads
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch(console.error);
}

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage, onAuthStateChanged };
