import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearProgressForUser,
  migrateLegacyProgressToUser,
  progressStorageKey,
  readProgressJson,
  writeProgressJson,
} from './progressStorage';

describe('progressStorage', () => {
  const userA = 'user-a';
  const userB = 'user-b';

  beforeEach(() => {
    localStorage.clear();
  });

  it('scopes keys by user id', () => {
    expect(progressStorageKey('learningStatus', userA)).toBe('ogden850_learning_status:user-a');
    writeProgressJson('learningStatus', userA, { hand: 'mastered' });
    writeProgressJson('learningStatus', userB, { warm: 'learning' });

    expect(readProgressJson('learningStatus', userA)).toEqual({ hand: 'mastered' });
    expect(readProgressJson('learningStatus', userB)).toEqual({ warm: 'learning' });
  });

  it('migrates legacy global keys once', () => {
    localStorage.setItem('ogden850_learning_status', JSON.stringify({ go: 'mastered' }));
    migrateLegacyProgressToUser(userA);

    expect(readProgressJson('learningStatus', userA)).toEqual({ go: 'mastered' });
    expect(localStorage.getItem('ogden850_learning_status')).toBeNull();
  });

  it('clears only the target user bucket', () => {
    writeProgressJson('starred', userA, { a: true });
    writeProgressJson('starred', userB, { b: true });
    clearProgressForUser(userA);

    expect(readProgressJson('starred', userA)).toBeNull();
    expect(readProgressJson('starred', userB)).toEqual({ b: true });
  });
});
