const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const sort = value => Array.isArray(value) ? value.map(sort) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, sort(value[key])])) : value;
const sha = value => crypto.createHash('sha256').update(JSON.stringify(sort(value))).digest('hex');
const evidence = read('../../docs/codex/evidence/20261028-continuous/stage-replacement-adoption.json');
const receipt = read('../../docs/codex/evidence/20261028-continuous/stage-replacement-receipt.json');
const batch = read('../../docs/codex/evidence/20261028-continuous/stage-replacements-normalized.json');
const stages = read('data/stage-videos.json');
const statuses = read('data/stages/status.json');
const expected = {
  recvxyOz5XmoUV: ['1m67ssYnOU4', 'zdnssWkl8-w', 'practice_room'],
  recvxyOz5XiuDr: ['d-dktScWxKo', 'OeBUwbPVvkc', 'practice_room'],
  recvxyOz5XmIH0: ['DZgK9S4pliA', 'EhLxzdiOVN0', 'practice_room'],
  recvxyH5pzbUId: ['wuICiuOUFGE', 'kFw7ZWRydwU', 'practice_room'],
  recvxyH5pz62TB: ['OTLdHfo0hTc', 'epOtB2VfTm0', 'practice_room'],
  recvxDMFHNzaOb: ['BWASDZZtO6w', 'ai2QKOrTnjs', 'practice_room'],
  recvxDMwzBm3rz: ['vJ1Yrh7_SSw', 'DZhqZ1SA2Q8', 'music_program'],
  rec28ldfRTrKtW: ['a2AvaSdqN28', '00IPFnp2Tdg', 'music_program'],
};

test('exactly eight current-policy replacements retain the frozen source and status cohorts', () => {
  assert.equal(evidence.baselineCommit, '95fff6d6335cb683022d857727225d235a8882f2');
  assert.equal(evidence.preservation.stageCanonicalBefore, 'd2d872a018a0af7b091faf1adda7215a5e6fe4e970b967380785c03874f17d2e');
  assert.equal(evidence.preservation.statusCanonicalBefore, 'e3e52c58679acb158bd048076c9189e4e516c731f523f2e76f2e7d2b3edc795b');
  assert.equal(evidence.items.length, 8);
  assert.deepEqual(new Set(evidence.items.map(item => item.recordId)), new Set(Object.keys(expected)));
  assert.deepEqual(new Set(receipt.replacedUnscoredSources), new Set(Object.keys(expected)));
  assert.equal(receipt.newSources, 0);
  assert.deepEqual(receipt.sourceIds, []);
  assert.equal(Object.keys(stages).length, 493);
  assert.equal(Object.keys(statuses.works).length, 614);
  assert.equal(Object.keys(evidence.preservation.unchangedStageHashes).length, 485);
  assert.equal(Object.keys(evidence.preservation.unchangedStatusHashes).length, 606);
  assert.equal(sha(stages), evidence.preservation.stageCanonicalAfter);
  assert.equal(sha(statuses), evidence.preservation.statusCanonicalAfter);
  const restoredStages = structuredClone(stages);
  const restoredStatuses = { ...structuredClone(evidence.preservation.statusMetadataBefore), works: structuredClone(statuses.works) };
  for (const item of evidence.items) {
    assert.equal(sha(item.before), item.beforeSha256, item.recordId);
    assert.equal(sha(item.beforeStatus), item.beforeStatusSha256, item.recordId);
    assert.equal(sha(stages[item.recordId]), item.afterSha256, item.recordId);
    assert.equal(sha(statuses.works[item.recordId]), item.afterStatusSha256, item.recordId);
    restoredStages[item.recordId] = structuredClone(item.before);
    restoredStatuses.works[item.recordId] = structuredClone(item.beforeStatus);
  }
  for (const [id, hash] of Object.entries(evidence.preservation.unchangedStageHashes)) {
    assert.equal(id in expected, false);
    assert.equal(sha(stages[id]), hash, id);
  }
  for (const [id, hash] of Object.entries(evidence.preservation.unchangedStatusHashes)) {
    assert.equal(id in expected, false);
    assert.equal(sha(statuses.works[id]), hash, id);
  }
  assert.equal(sha(restoredStages), evidence.preservation.stageCanonicalBefore);
  assert.equal(sha(restoredStatuses), evidence.preservation.statusCanonicalBefore);
});

test('each complete old public source reconstructs from its archive without dropping fields or source history', () => {
  for (const item of evidence.items) {
    const stage = stages[item.recordId];
    const history = stage.previousSources;
    assert.equal(history.length, item.before.previousSources.length + 1);
    assert.deepEqual(history.slice(0, -1), item.before.previousSources);
    assert.equal(item.archiveIndex, history.length - 1);
    const archive = history[item.archiveIndex];
    const { changedAt, reason, preference, previousOccasionReview, ...old } = archive;
    assert.equal(changedAt, item.archivedAt);
    assert.equal(changedAt, statuses.updatedAt);
    assert.match(reason, /完整保存日志/);
    assert.equal(preference, 'excluded_historical_occasion');
    assert.equal(previousOccasionReview.previousVideoId, expected[item.recordId][0]);
    assert.equal(previousOccasionReview.previousSha256, sha(item.before));
    assert.ok(['concert', 'festival', 'showcase', 'tour'].includes(previousOccasionReview.occasion));
    assert.deepEqual({ ...old, previousSources: history.slice(0, -1) }, item.before);
  }
});

test('replacement bindings use the exact new video and fresh initialization time while status keeps source observation time', () => {
  assert.equal(evidence.initializedAt, '2026-10-28T09:19:46.252Z');
  assert.equal(evidence.initializedAt, receipt.freshPreimageAt);
  for (const item of evidence.items) {
    const stage = stages[item.recordId];
    const input = batch.items.find(row => row.recordId === item.recordId);
    const [oldVideoId, newVideoId, occasion] = expected[item.recordId];
    assert.equal(item.oldVideoId, oldVideoId);
    assert.equal(item.before.videoId, oldVideoId);
    assert.equal(item.newVideoId, newVideoId);
    assert.equal(stage.videoId, newVideoId);
    const url = new URL(stage.url);
    assert.equal(url.origin, 'https://www.youtube.com');
    assert.equal(url.pathname, '/watch');
    assert.equal(url.searchParams.get('v'), newVideoId);
    assert.equal(stage.url, input.selected.url);
    assert.equal(input.selectedVideoId, newVideoId);
    assert.equal(input.selected.videoId, newVideoId);
    assert.deepEqual(stage.scoreBinding, { videoId: newVideoId, sourceKey: newVideoId, initializedAt: evidence.initializedAt, initialScore: null });
    assert.equal(stage.selection.occasion, occasion);
    assert.equal(stage.sourceClass, 'official');
    assert.equal(stage.completeness, 'full');
    assert.equal(stage.likes.precision, 'exact');
    assert.equal(stage.likes.value, input.selected.likes);
    assert.deepEqual(statuses.works[item.recordId], { status: 'verified', reason: input.reason, checkedAt: input.selected.checkedAt });
    assert.equal(item.sourceCheckedAt, input.selected.checkedAt);
    assert.notEqual(item.sourceCheckedAt, evidence.initializedAt);
    assert.equal(input.selected.fullPlaybackVerified, false);
    assert.equal(input.selected.actualAudioComparison, false);
    assert.match(stage.verificationNote, /未完整播放/);
  }
  const beforeMetadata = { ...evidence.preservation.statusMetadataBefore };
  const afterMetadata = Object.fromEntries(Object.entries(statuses).filter(([key]) => key !== 'works'));
  assert.deepEqual(afterMetadata, evidence.preservation.statusMetadataAfter);
  delete beforeMetadata.updatedAt;
  delete afterMetadata.updatedAt;
  assert.deepEqual(afterMetadata, beforeMetadata);
});

test('a lower-like compliant practice replaces the excluded showcase without rewriting the old comparison', () => {
  const item = evidence.items.find(row => row.recordId === 'recvxyH5pz62TB');
  const current = stages[item.recordId];
  assert.equal(item.before.likes.value, 4592);
  assert.equal(current.likes.value, 3605);
  assert.ok(current.likes.value < item.before.likes.value);
  assert.equal(current.selection.occasion, 'practice_room');
  assert.equal(current.previousSources.at(-1).previousOccasionReview.occasion, 'showcase');
  assert.deepEqual(current.previousSources.at(-1).candidates, item.before.candidates);
  assert.equal(current.previousSources.at(-1).selectionNote, item.before.selectionNote);
  assert.equal(current.previousSources.at(-1).comparisonNote, item.before.comparisonNote);
});
