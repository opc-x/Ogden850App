export const PROGRESS_STORAGE_BASE = {
  learningStatus: 'ogden850_learning_status',
  starred: 'ogden850_starred',
  practicedScenes: 'ogden850_practiced_scenes',
} as const;

export type ProgressStorageBaseKey = keyof typeof PROGRESS_STORAGE_BASE;

export function progressStorageKey(base: ProgressStorageBaseKey, userId: string): string {
  return `${PROGRESS_STORAGE_BASE[base]}:${userId}`;
}

export function readProgressJson<T>(base: ProgressStorageBaseKey, userId: string): T | null {
  try {
    const raw = localStorage.getItem(progressStorageKey(base, userId));
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeProgressJson(base: ProgressStorageBaseKey, userId: string, value: unknown): void {
  localStorage.setItem(progressStorageKey(base, userId), JSON.stringify(value));
}

export function clearProgressForUser(userId: string): void {
  for (const base of Object.keys(PROGRESS_STORAGE_BASE) as ProgressStorageBaseKey[]) {
    localStorage.removeItem(progressStorageKey(base, userId));
  }
}

/** 将旧版全局进度迁移到首个登录用户 */
export function migrateLegacyProgressToUser(userId: string): void {
  for (const base of Object.keys(PROGRESS_STORAGE_BASE) as ProgressStorageBaseKey[]) {
    const legacyKey = PROGRESS_STORAGE_BASE[base];
    const scopedKey = progressStorageKey(base, userId);
    const legacy = localStorage.getItem(legacyKey);
    const scoped = localStorage.getItem(scopedKey);
    if (legacy && !scoped) {
      localStorage.setItem(scopedKey, legacy);
      localStorage.removeItem(legacyKey);
    }
  }
}
