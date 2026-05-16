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

// NEXT_PUBLIC_* vars must be referenced statically so Next.js can inline them
// into the client bundle at build time. Dynamic lookups (e.g. process.env[name])
// are not replaced, which is why a helper function won't work here.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const missing = (
  ["apiKey", "authDomain", "projectId", "storageBucket", "messagingSenderId", "appId"] as const
).filter((k) => !firebaseConfig[k]);
if (missing.length > 0) {
  throw new Error(
    `Missing required Firebase env vars: ${missing
      .map((k) => `NEXT_PUBLIC_FIREBASE_${k.replace(/[A-Z]/g, (c) => `_${c}`).toUpperCase()}`)
      .join(", ")}. See .env.example.`
  );
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