import assert from 'node:assert/strict';
import { computeScenePracticeStats } from '../src/lib/scenePracticeStats';
import type { SceneCatalogItem } from '../src/types/scene';

function scene(
  sceneKey: string,
  sentenceCount: number,
  freqRank = 99,
  status: SceneCatalogItem['status'] = 'ready',
): SceneCatalogItem {
  return {
    slug: sceneKey.toLowerCase(),
    sceneKey,
    titleZh: sceneKey,
    titleEn: sceneKey,
    tier: 'P0',
    emoji: '📍',
    freqRank,
    gradient: 'linear-gradient(135deg,#fff,#eee)',
    storyHook: '',
    illustrationLabel: '',
    storyOutline: [],
    sentenceCount,
    status,
  };
}

const catalog = [
  scene('Shopping', 110, 1),
  scene('Restaurant', 110, 2),
  scene('Building', 0, 3, 'building'),
];

const practiced = { Shopping: true };

const stats = computeScenePracticeStats(catalog, practiced);

assert.equal(stats.totalSceneCount, 2, 'building / 0-sentence scenes excluded');
assert.equal(stats.practicedSceneCount, 1);
assert.equal(stats.totalSentenceCount, 220);
assert.equal(stats.practicedSentenceCount, 110, 'sentence count follows scene batch mark');
assert.equal(stats.scenePercent, 50);
assert.equal(stats.sentencePercent, 50);
assert.equal(stats.top10Total, 2);
assert.equal(stats.top10Practiced, 1);

const cleared = computeScenePracticeStats(catalog, {});
assert.equal(cleared.practicedSentenceCount, 0);
assert.equal(cleared.sentencePercent, 0);

console.log('✓ scene practice stats:', stats);
