// src/lib/firebaseAdmin.ts
import admin, { app as firebaseApp } from "firebase-admin";

// ✅ Validate required environment variables
const requiredEnvVars = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
];

const missingEnvVars = requiredEnvVars.filter((name) => !process.env[name]);

if (missingEnvVars.length > 0) {
  console.error("❌ Missing Firebase Admin environment variables:", missingEnvVars);
  throw new Error(`Missing Firebase Admin environment variables: ${missingEnvVars.join(", ")}`);
}

// ✅ Initialize Firebase Admin SDK only once
if (admin.apps.length === 0) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replaceAll("\\n", "\n");
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });
    console.log("✅ Firebase Admin initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize Firebase Admin:", error);
    throw new Error(
      `Firebase Admin initialization failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
} else {
  console.log("ℹ️ Firebase Admin already initialized");
}

// ✅ Get Firestore instance
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

// ✅ Export admin services
export { admin, db };

// ✅ Helper functions
export function isAdminInitialized(): boolean {
  return admin.apps.length > 0;
}

export function getAdminApp(): firebaseApp.App {
  if (!isAdminInitialized()) {
    throw new Error("Firebase Admin is not initialized");
  }
  // TypeScript now knows this will not be null
  return admin.apps[0]!;
}