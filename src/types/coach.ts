import type { DialogueTurn, SceneCatalogItem } from './scene';

export type CoachPhase = 'pick' | 'briefing' | 'practice' | 'complete';
export type UserRole = 'A' | 'B';

export interface CoachEvalResult {
  score: number;
  passed: boolean;
  encouragement: string;
  correction: string | null;
  analysis: string;
  tip: string;
  mood: 'great' | 'good' | 'retry';
  offlineFallback?: boolean;
}

export interface CoachThreadItem {
  id: string;
  kind: 'partner' | 'user' | 'feedback' | 'system';
  en?: string;
  zh?: string;
  speaker?: 'A' | 'B';
  dialogueTurnId?: number;
  eval?: CoachEvalResult;
  userRaw?: string;
}

export interface CoachSession {
  scene: SceneCatalogItem;
  userRole: UserRole;
  turns: DialogueTurn[];
  playhead: number;
  completedUserTurns: number;
  totalUserTurns: number;
}
