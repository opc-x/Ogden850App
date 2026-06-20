import { supabase } from '../lib/supabase';

export const fetchWordGuide = async (wordId: string): Promise<any> => {
  try {
    // 2-second timeout to handle GFW blocks or network issues
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('timeout')), 2000)
    );

    const fetchPromise = supabase
      .from('ogden_word_guides')
      .select('*')
      .eq('id', wordId.toLowerCase())
      .single();

    const { data, error } = (await Promise.race([
      fetchPromise, 
      timeoutPromise
    ])) as any;

    if (error) {
      if (error.code !== 'PGRST116') {
        // PGRST116 is the code for "JSON object requested, multiple (or no) rows returned" (No data)
        console.warn(`Supabase fetch error for ${wordId}:`, error.message);
      }
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching word guide from Supabase:", error);
    return null;
  }
};
