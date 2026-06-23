import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ProgressProvider } from './contexts/ProgressContext.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { WordsProvider } from './contexts/WordsContext.tsx';
import { repairSupabaseAuthStorage } from './services/auth.service';
import { initAppViewport } from './lib/appViewport';
import './index.css';

initAppViewport();

const GUIDE_DATA_VERSION = '2026-06-21';
const guideDataVersionKey = 'ogden850_guide_data_version';

async function clearStaleClientCaches() {
  if ('serviceWorker' in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((reg) => reg.unregister()));
  }
  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  }
}

if (import.meta.env.DEV) {
  void clearStaleClientCaches();
} else if (localStorage.getItem(guideDataVersionKey) !== GUIDE_DATA_VERSION) {
  localStorage.setItem(guideDataVersionKey, GUIDE_DATA_VERSION);
  void clearStaleClientCaches();
}

void repairSupabaseAuthStorage().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <WordsProvider>
        <AuthProvider>
          <ProgressProvider>
            <App />
          </ProgressProvider>
        </AuthProvider>
      </WordsProvider>
    </StrictMode>,
  );
});
