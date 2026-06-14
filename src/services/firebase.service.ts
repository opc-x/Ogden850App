import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const fetchWordGuide = async (wordId: string): Promise<any> => {
  try {
    const docRef = doc(db, 'ogden_word_guides', wordId.toLowerCase());
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching word guide from Firebase:", error);
    return null;
  }
};
