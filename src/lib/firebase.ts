import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || '(default)';

let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app, databaseId);
} catch (error) {
  console.warn("Firebase config is missing or invalid. Please check .env.local");
}

export { db };
