// lib/firebase.ts
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  Auth
} from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";

// Firebase configuration with fallback values
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDPTPNoo6HpU7LZeUj-XRWGgIoFZNwHkes",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "i-feel-therefore-i-write.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "i-feel-therefore-i-write",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "i-feel-therefore-i-write.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "944118167142",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:944118167142:web:188d900e91dc3a7fe2dfa7",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-Z8FP693QGW",
};

// Warn in development if using fallback values
if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  console.warn('⚠️ Using hardcoded Firebase config. For production, please set environment variables.');
}

// Initialize Firebase (prevent multiple initializations)
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  // Check if Firebase is already initialized
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully');
  } else {
    app = getApps()[0];
    console.log('ℹ️ Firebase already initialized');
  }

  // Initialize Firebase services
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  // Set auth persistence to local (browser) so user remains logged in across reloads
  if (typeof window !== 'undefined') {
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        console.log('✅ Auth persistence set to local');
      })
      .catch((error) => {
        console.error('❌ Failed to set auth persistence:', error);
      });
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  throw new Error(
    `Firebase initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
  );
}

// Helper function to check if Firebase is initialized
export function isFirebaseInitialized(): boolean {
  return getApps().length > 0;
}

// Helper to get current user safely
export function getCurrentUser() {
  return auth.currentUser;
}

// Helper to check if user is authenticated
export function isAuthenticated(): boolean {
  return !!auth.currentUser && !auth.currentUser.isAnonymous;
}

// Helper to check if user is anonymous
export function isAnonymous(): boolean {
  return !!auth.currentUser?.isAnonymous;
}

export { app, auth, db, storage, onAuthStateChanged };