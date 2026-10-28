const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const evidence = JSON.parse(fs.readFileSync(path.resolve(__dirname,
  '../../../../docs/codex/evidence/20261028-v200/statistics/user-x-observations.json'), 'utf8'));

// Reconstruct v199 for historical cohort tests without replacing their frozen hashes.
// The exact current five objects must match this reviewed increment before restoration.
function beforeUserXObservations(current) {
  const restored = structuredClone(current);
  for (const change of evidence.changes) {
    const slug = change.key.split('.')[0];
    const index = change.accountIndex;
    assert.deepEqual(restored.groups[slug].social[index], change.proposedAfter);
    restored.groups[slug].social[index] = structuredClone(change.expectedBefore);
  }
  assert.deepEqual(restored.summary, evidence.proposedAfterSummary);
  restored.summary = structuredClone(evidence.expectedBeforeSummary);
  return restored;
}

module.exports = {beforeUserXObservations, userXObservationEvidence: evidence};
