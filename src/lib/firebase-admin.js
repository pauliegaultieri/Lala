import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getFirebaseAdmin() {
  if (getApps().length === 0) {
    // Load service account credentials from environment variables
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const storageBucket =
      process.env.FIREBASE_STORAGE_BUCKET ||
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        "Missing Firebase Admin credentials. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your .env.local file"
      );
    }

    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      ...(storageBucket ? { storageBucket } : {}),
    });
  }

  return getFirestore();
}

const adminDb = getFirebaseAdmin();

export { adminDb };
