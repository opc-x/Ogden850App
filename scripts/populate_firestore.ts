import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

// Initialize Firebase
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

// Initialize Gemini SDK
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ 缺少 GEMINI_API_KEY！请在 .env.local 中配置。");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const promptTemplate = `
You are an expert in Ogden's Basic English (BE850).
Please generate exactly 5 perfect example sentences for the word "{word}" and provide a concise learning hook.

Rules for "hook":
- Format MUST be exactly: 
【为什么用】...
【什么时候用】...
【怎么用】...
- Keep it extremely concise and direct.

Rules for "sentences":
- Generate EXACTLY 5 sentences.
- Use only BE850 words.
- Provide Chinese translation ("cn").
- Provide syntactic parsing ("parts"), breaking the sentence into words and roles.
Roles: "op" (Operator 18 verbs), "dir" (direction), "n" (noun), "adj" (quality), "pron" (pronoun), "det", "conj", "neg".

Output ONLY valid JSON without Markdown block markers. Output format:
{
  "hook": "【为什么用】...\\n【什么时候用】...\\n【怎么用】...",
  "sentences": [
    {
      "en": "...",
      "cn": "...",
      "parts": [{"chunk": "word", "role": "role"}]
    }
  ]
}
`;

async function processWord(word: string, category: string) {
  console.log(`[Processing] ${word}...`);
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptTemplate.replace('{word}', word),
      config: {
        responseMimeType: "application/json",
      }
    });
    
    let text = response.text || '{}';
    const data = JSON.parse(text);
    
    // Save to Firestore
    await setDoc(doc(db, 'ogden_word_guides', word.toLowerCase()), {
      word: word,
      category: category,
      hook: data.hook,
      sentences: data.sentences,
      updatedAt: new Date().toISOString()
    });
    
    console.log(`✅ Saved ${word} to Firestore.`);
  } catch (err) {
    console.error(`❌ Failed for ${word}:`, err);
  }
}

async function main() {
  const guidesPath = path.join(process.cwd(), 'src/data/word-guides.json');
  const fileContent = fs.readFileSync(guidesPath, 'utf8');
  const guides = JSON.parse(fileContent);
  
  const words = Object.keys(guides).map(w => ({
    word: w,
    category: guides[w].method || 'generals'
  }));

  console.log(`Total words found: ${words.length}`);
  
  for (let i = 0; i < words.length; i++) {
    await processWord(words[i].word, words[i].category);
    await new Promise(r => setTimeout(r, 4100)); // ~15 RPM limit
  }
  
  console.log("🎉 All words processed and saved to Firebase!");
}

main();
