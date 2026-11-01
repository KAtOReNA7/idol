const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {beforeGroupAdvanceStatistics} = require('./group-advance-evidence.cjs');
const base = path.resolve(__dirname, '../../../../docs/codex/evidence/20261028-post-v200/statistics');
const changes = ['geenius', 'triples'].map(slug => JSON.parse(fs.readFileSync(path.join(base, slug + '-adoption.json'), 'utf8')));
const followupChanges = ['triples', 'vvup', 'udtt'].map(slug => JSON.parse(fs.readFileSync(path.join(base, slug + '-followup-adoption.json'), 'utf8')));

function beforeFollowupStatistics(current) {
  const restored = beforeGroupAdvanceStatistics(current);
  for (const change of [...followupChanges].reverse()) {
    const [slug, field] = change.change.split('.');
    assert.deepEqual(restored.groups[slug][field], change.after);
    restored.groups[slug][field] = structuredClone(change.expectedBefore);
    if (change.afterSummary) {
      assert.deepEqual(restored.summary, change.afterSummary);
      restored.summary = structuredClone(change.expectedBeforeSummary);
    }
  }
  return restored;
}

// Preserve historical cohort hashes while checking every later changed object first.
function beforePostV200Statistics(current) {
  const restored = beforeFollowupStatistics(current);
  for (const change of [...changes].reverse()) {
    const [slug, field] = change.change.split('.');
    assert.deepEqual(restored.groups[slug][field], change.after);
    restored.groups[slug][field] = structuredClone(change.expectedBefore);
    if (change.afterSummary) {
      assert.deepEqual(restored.summary, change.afterSummary);
      restored.summary = structuredClone(change.expectedBeforeSummary);
    }
  }
  return restored;
}
module.exports = {beforePostV200Statistics, beforeFollowupStatistics, beforeGroupAdvanceStatistics, postV200StatisticChanges: changes, followupStatisticChanges: followupChanges};
