import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ProgressProvider } from './contexts/ProgressContext.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { WordsProvider } from './contexts/WordsContext.tsx';
import './index.css';

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
