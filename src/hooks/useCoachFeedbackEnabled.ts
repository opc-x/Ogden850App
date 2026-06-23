import { useCallback, useState } from 'react';

const STORAGE_KEY = 'ogden850_coach_feedback';

function readStored(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === null ? true : raw === 'true';
  } catch {
    return true;
  }
}

export function useCoachFeedbackEnabled() {
  const [enabled, setEnabled] = useState(readStored);

  const setFeedbackEnabled = useCallback((next: boolean) => {
    setEnabled(next);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      /* ignore */
    }
  }, []);

  const toggleFeedbackEnabled = useCallback(() => {
    setFeedbackEnabled(!enabled);
  }, [enabled, setFeedbackEnabled]);

  return { feedbackEnabled: enabled, setFeedbackEnabled, toggleFeedbackEnabled };
}
