const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const receipt = require('../../../../docs/codex/evidence/20261029-heygabby-complete/viewing-adoption.json');
const {beforeHeyGabbyFormalBytes, beforeHeyGabbyFormalSupplements} = require('./heygabby-formal-baseline.cjs');
const app = path.resolve(__dirname, '../..');
const sha = value => createHash('sha256').update(value).digest('hex');
const baselineSha = '6085ec68c7a4223a45fd9f571375a773f01e5c77876cb0f0821cf17ac34614c2';

function beforeHeyGabbyViewingBytes(currentText) {
  currentText = beforeHeyGabbyFormalBytes('data/stages/supplements.json', currentText).toString('utf8');
  assert.equal(receipt.beforeFileSha256, baselineSha);
  assert.equal(sha(currentText), receipt.afterFileSha256, 'complete current supplements bytes');
  assert.deepEqual(JSON.parse(receipt.afterWorkText), receipt.after);
  assert.deepEqual(JSON.parse(receipt.expectedBeforeWorkText), receipt.expectedBefore);
  assert.equal(currentText.split(receipt.afterWorkText).length, 2, 'unique complete work replacement');
  const historical = currentText.replace(receipt.afterWorkText, receipt.expectedBeforeWorkText);
  assert.equal(sha(historical), baselineSha, 'exact before-viewing supplement bytes');
  return Buffer.from(historical, 'utf8');
}

function beforeHeyGabbyViewing(source) {
  source = beforeHeyGabbyFormalSupplements(source);
  assert.equal(receipt.workId, 'recvxyOz5Xo5fW'); assert.equal(receipt.sourceId, 'XSpYaEdpKxY');
  assert.deepEqual(source.works[receipt.workId], receipt.after, 'complete current Hey Gabby viewing row');
  const restored = structuredClone(source);
  restored.works[receipt.workId] = structuredClone(receipt.expectedBefore);
  const bytes = beforeHeyGabbyViewingBytes(fs.readFileSync(path.join(app, 'data/stages/supplements.json'), 'utf8'));
  assert.deepEqual(restored, JSON.parse(bytes), 'all other supplements and metadata preserved');
  return restored;
}

function beforeHeyGabbyViewingNotes(current) {
  assert.equal(receipt.viewingNote.beforeFileSha256, '9d3878feb57124271036fc60dc179250a4410ee4c6510a965df73b7a77b2ffbd');
  assert.deepEqual(current[receipt.workId], receipt.viewingNote.afterRow, 'complete current Hey Gabby viewing note');
  assert.equal(sha(JSON.stringify(current, null, 2) + '\n'), receipt.viewingNote.afterFileSha256);
  const restored = structuredClone(current);
  if (receipt.viewingNote.beforeRow === null) delete restored[receipt.workId];
  else restored[receipt.workId] = structuredClone(receipt.viewingNote.beforeRow);
  assert.equal(sha(JSON.stringify(restored, null, 2) + '\n'), receipt.viewingNote.beforeFileSha256, 'all other viewing notes preserved');
  return restored;
}

let historicalRuntime;
function historicalHeyGabbySupplement(workId) {
  if (!historicalRuntime) {
    const metadata = beforeHeyGabbyViewing(JSON.parse(fs.readFileSync(path.join(app, 'data/stages/supplements.json'), 'utf8')));
    // Production projection code, with only its exactly restored JSON dependency.
    const ts = require('typescript');
    const output = ts.transpileModule(fs.readFileSync(path.join(app, 'lib/idol/supplements.ts'), 'utf8'),
      {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true}}).outputText;
    const compiled = {exports: {}};
    const dependency = name => {
      if (name === '@/data/stages/supplements.json') return metadata;
      if (name === './stage-public-research') return require('./public-artist-loader.cjs')('lib/idol/stage-public-research.ts');
      throw new Error('Unexpected historical supplement dependency: ' + name);
    };
    new Function('require', 'module', 'exports', output)(dependency, compiled, compiled.exports);
    historicalRuntime = compiled.exports;
  }
  return historicalRuntime.stageSupplementForWork(workId);
}

module.exports = {beforeHeyGabbyViewingBytes, beforeHeyGabbyViewing, beforeHeyGabbyViewingNotes,
  historicalHeyGabbySupplement, heyGabbyViewingAdoption: receipt};
