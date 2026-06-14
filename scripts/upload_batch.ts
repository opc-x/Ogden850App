import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const databaseId = '(default)';
const db = getFirestore(app, databaseId);

async function main() {
  const batchPath = path.join(process.cwd(), 'batch.json');
  if (!fs.existsSync(batchPath)) {
    console.error('batch.json not found');
    return;
  }
  
  const data = JSON.parse(fs.readFileSync(batchPath, 'utf8'));
  
  for (const word of Object.keys(data)) {
    console.log(`Uploading ${word}...`);
    await setDoc(doc(db, 'ogden_word_guides', word.toLowerCase()), {
      word: word,
      category: data[word].category,
      hook: data[word].hook,
      sentences: data[word].sentences,
      updatedAt: new Date().toISOString()
    });
  }
  
  console.log("Batch upload complete!");
}

main();
