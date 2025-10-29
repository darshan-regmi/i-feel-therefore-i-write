// lib/firebaseAdmin.ts
import admin from "firebase-admin";

// Validate required environment variables
const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(
    '❌ Missing required Firebase Admin environment variables:',
    missingEnvVars.join(', ')
  );
  throw new Error(
    `Missing Firebase Admin environment variables: ${missingEnvVars.join(', ')}`
  );
}

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n');

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });

    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error);
    throw new Error(
      `Firebase Admin initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
} else {
  console.log('ℹ️ Firebase Admin already initialized');
}

// Get Firestore instance
const db = admin.firestore();

// Optional: Set Firestore settings for better performance
db.settings({
  ignoreUndefinedProperties: true,
});

// Export admin services
export { admin, db };

// Helper function to verify admin is initialized
export function isAdminInitialized(): boolean {
  return admin.apps.length > 0;
}

// Helper function to get admin app
export function getAdminApp(): admin.app.App {
  if (!admin.apps.length) {
    throw new Error('Firebase Admin is not initialized');
  }
  return admin.apps[0];
}