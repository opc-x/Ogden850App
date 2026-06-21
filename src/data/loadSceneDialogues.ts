import sceneDialogues from './sceneDialogues.json';
import type { StoryBeat } from '../types/scene';

export interface SceneDialogueRow {
  id: number;
  scene: string;
  seq: number;
  speaker: 'A' | 'B';
  sentence: string;
  zh: string;
  beat: StoryBeat;
  source: string;
}

const rows = sceneDialogues as SceneDialogueRow[];

const bySceneKey = new Map<string, SceneDialogueRow[]>();

for (const row of rows) {
  const list = bySceneKey.get(row.scene) ?? [];
  list.push(row);
  bySceneKey.set(row.scene, list);
}

for (const list of bySceneKey.values()) {
  list.sort((a, b) => a.seq - b.seq);
}

export function getDialogueRowsBySceneKey(sceneKey: string): SceneDialogueRow[] {
  return bySceneKey.get(sceneKey) ?? [];
}

export function countTurnsBySceneKey(sceneKey: string): number {
  return bySceneKey.get(sceneKey)?.length ?? 0;
}

export function getTotalDialogueCount(): number {
  return rows.length;
}
