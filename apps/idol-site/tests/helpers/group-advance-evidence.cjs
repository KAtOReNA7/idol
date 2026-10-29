const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const statisticsAdoption = require('../../../../docs/codex/evidence/20261029-group-advance/statistics-adoption.json');
const timelineAdoption = require('../../../../docs/codex/evidence/20261029-group-advance/timeline-adoption.json');

const sha = value => createHash('sha256').update(value).digest('hex');
const statisticsBaselineSha = 'd9cbdd9d3f58d5da5b4c6535824a5dfcdd0cdc08761081d8436e1e55111b6a97';
const timelineBaselineSha = '309d0ab6b726119eb87787afec9267d19409329c7e1d6f63a790428020729f5c';

// Validate the complete reviewed object before reconstructing the earlier cohort.
// A frozen whole-file hash also rejects unreviewed changes outside that object.
function beforeGroupAdvanceStatistics(current) {
  assert.equal(statisticsAdoption.change, 'triples.sales');
  assert.equal(statisticsAdoption.beforeFileSha256, statisticsBaselineSha);
  assert.deepEqual(current.groups.triples.sales, statisticsAdoption.after, 'complete group-advance sales object');
  const restored = structuredClone(current);
  restored.groups.triples.sales = structuredClone(statisticsAdoption.expectedBefore);
  assert.equal(sha(JSON.stringify(restored, null, 2) + '\n'), statisticsBaselineSha, 'complete pre-advance statistics');
  return restored;
}

function beforeGroupAdvanceTimelineRecords(current) {
  assert.equal(timelineAdoption.beforeFileSha256, timelineBaselineSha);
  assert.equal(sha(timelineAdoption.expectedBeforeText), timelineBaselineSha, 'original timeline bytes');
  assert.deepEqual(timelineAdoption.changes.map(row => row.eventId).sort(), [
    'e-atheart-aurora-second-hiatus-announcement',
    'e-bewave-six-member-phase-end-announcement',
  ]);
  const restored = structuredClone(current);
  for (const change of timelineAdoption.changes) {
    const matches = restored.records.filter(row => row.eventId === change.eventId);
    assert.equal(matches.length, 1, 'unique reviewed timeline record');
    assert.deepEqual(matches[0], change.after, 'complete group-advance announcement ' + change.eventId);
    restored.records[restored.records.indexOf(matches[0])] = structuredClone(change.expectedBefore);
  }
  assert.deepEqual(restored, JSON.parse(timelineAdoption.expectedBeforeText), 'complete pre-advance timeline');
  return restored;
}

function beforeGroupAdvanceTimelineBytes(current) {
  beforeGroupAdvanceTimelineRecords(current);
  return Buffer.from(timelineAdoption.expectedBeforeText, 'utf8');
}

module.exports = {beforeGroupAdvanceStatistics, beforeGroupAdvanceTimelineRecords, beforeGroupAdvanceTimelineBytes,
  statisticsAdoption, timelineAdoption};
