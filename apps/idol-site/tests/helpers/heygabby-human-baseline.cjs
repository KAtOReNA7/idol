const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const receipt = require('../../../../docs/codex/evidence/20261029-group-advance/heygabby-human-adoption.json');
const sha = value => createHash('sha256').update(value).digest('hex');
const baselineSha = '0ea798e6e9bfe21de5ebeb583d15b9a83e0002b621682ffbcef0fc1bd6ae2512';
const sourceFile = path.resolve(__dirname, '../../data/stages/supplements.json');
const {beforeHeyGabbyViewingBytes,beforeHeyGabbyViewing} = require('./heygabby-viewing-baseline.cjs');

function beforeHeyGabbyHumanBytes(currentText) {
  currentText = beforeHeyGabbyViewingBytes(currentText).toString('utf8');
  assert.equal(receipt.beforeFileSha256, baselineSha);
  assert.equal(sha(currentText), receipt.afterFileSha256, 'complete current supplements bytes');
  assert.deepEqual(JSON.parse(receipt.afterReviewText), receipt.after.searchReview);
  assert.deepEqual(JSON.parse(receipt.expectedBeforeReviewText), receipt.expectedBefore.searchReview);
  assert.equal(currentText.split(receipt.afterReviewText).length, 2, 'unique reviewed text replacement');
  const historical = currentText.replace(receipt.afterReviewText, receipt.expectedBeforeReviewText);
  assert.equal(sha(historical), baselineSha, 'only the exact Hey Gabby review bytes changed');
  return Buffer.from(historical, 'utf8');
}

function beforeHeyGabbyHuman(source) {
  source = beforeHeyGabbyViewing(source);
  assert.equal(receipt.workId, 'recvxyOz5Xo5fW');
  assert.equal(receipt.candidateVideoId, 'XSpYaEdpKxY');
  assert.deepEqual(source.works[receipt.workId], receipt.after, 'complete human-reviewed Hey Gabby row');
  const historical = structuredClone(source);
  historical.works[receipt.workId] = structuredClone(receipt.expectedBefore);
  const historicalBytes = beforeHeyGabbyHumanBytes(fs.readFileSync(sourceFile, 'utf8'));
  assert.deepEqual(historical, JSON.parse(historicalBytes), 'all other supplements and metadata preserved');
  return historical;
}

module.exports = {beforeHeyGabbyHuman, beforeHeyGabbyHumanBytes, heyGabbyHumanAdoption: receipt};
