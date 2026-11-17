// lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

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

const REQUIRED_KEYS = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
] as const;

function assertConfig(): void {
  const missing = REQUIRED_KEYS.filter((key) => !firebaseConfig[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required Firebase env vars: ${missing
        .map((key) => `NEXT_PUBLIC_FIREBASE_${key.replace(/[A-Z]/g, (c) => `_${c}`).toUpperCase()}`)
        .join(", ")}. See .env.example.`
    );
  }
}

// Initialise lazily rather than at module scope. Client components are also
// rendered on the server, and a preview build without the public Firebase
// values should still be able to prerender the auth pages. The error now fires
// only when a session or Firestore call actually needs Firebase.
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

function getFirebaseApp(): FirebaseApp {
  if (app) return app;

  assertConfig();
  app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  return app;
}

export function getFirebaseAuth(): Auth {
  if (auth) return auth;

  const instance = getAuth(getFirebaseApp());
  auth = instance;

  // Keep the account signed in across reloads. This only touches the browser,
  // but guard it so importing the module during SSR stays side-effect free.
  if (typeof window !== "undefined") {
    setPersistence(instance, browserLocalPersistence).catch((error) => {
      console.error("❌ Failed to set auth persistence:", error);
    });
  }

  return instance;
}

export function getFirebaseDb(): Firestore {
  db ??= getFirestore(getFirebaseApp());
  return db;
}

export function getFirebaseStorage(): FirebaseStorage {
  storage ??= getStorage(getFirebaseApp());
  return storage;
}

// Helper function to check if Firebase is initialized
export function isFirebaseInitialized(): boolean {
  return getApps().length > 0;
}

// Helper to get current user safely
export function getCurrentUser() {
  return getFirebaseAuth().currentUser;
}

// Helper to check if user is authenticated
export function isAuthenticated(): boolean {
  const user = getCurrentUser();
  return !!user && !user.isAnonymous;
}

// Helper to check if user is anonymous
export function isAnonymous(): boolean {
  return !!getCurrentUser()?.isAnonymous;
}
