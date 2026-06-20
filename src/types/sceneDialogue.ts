export interface SceneDialogueRecord {
  id: number;
  scene: string;
  seq: number;
  speaker: 'A' | 'B';
  sentence: string;
  zh: string;
  beat: '开场' | '进行' | '收束';
  source: 'curated' | 'generated';
}
