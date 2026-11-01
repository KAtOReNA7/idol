const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), {createHash} = require('node:crypto');
const receipt = require('../../../../docs/codex/evidence/20261029-heygabby-complete/formal-adoption.json');
const {beforeV202Supplements,beforeV202SupplementsBytes}=require('./v202-followup-evidence.cjs');
const {beforePassword,beforePasswordBytes}=require('./password-formal-baseline.cjs');
const app = path.resolve(__dirname, '../..');
const sha = value => createHash('sha256').update(value).digest('hex');
const bytes = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');
const baselines = {
  stageVideos: 'b8e276f3772c64c74095d5a363ce2b1d186a421854408677a91a478b2edd2bac',
  stageStatuses: '70a4dbdfd0ae7adc928441b472e74c02498c8b5bf4c65bd11fef4d6f134aa4fa',
  poster: '6759153aec18d27f128a654aa75fe75fc5b8ee6f9f5c7c5b7f349377ea860138',
  supplementsUpdate: 'b6b1d18c415a1a97cf0a14d54e11e34ce86daa7d64a86da4cec57390ff89bdc7',
};

function restore(kind, current) {
  if(['stageVideos','stageStatuses'].includes(kind))current=beforePassword(kind,current);
  if(kind==='supplementsUpdate')current=beforeV202Supplements(current);
  const proof = receipt[kind], id = receipt.workId;
  assert.equal(id, 'recvxyOz5Xo5fW'); assert.equal(receipt.sourceId, 'XSpYaEdpKxY');
  assert.equal(proof.beforeFileSha256, baselines[kind]);
  if (kind === 'poster') assert.deepEqual(current.entries.at(-1), proof.addedEntry, 'complete current formal poster row');
  else assert.deepEqual(kind === 'stageVideos' ? current[id] : current.works[id], proof.afterRow,
    'complete current Hey Gabby formal ' + kind + ' row');
  assert.equal(sha(bytes(current)), proof.afterFileSha256, kind === 'supplementsUpdate'
    ? 'all other supplements and metadata preserved' : 'complete current formal ' + kind + ' object');
  const out = structuredClone(current);
  if (kind === 'stageVideos') {
    assert.equal(Object.keys(out).length, proof.afterCount); assert.equal(proof.beforeRow, null);
    delete out[id]; assert.equal(Object.keys(out).length, proof.beforeCount);
  } else if (kind === 'stageStatuses') {
    assert.equal(out.updatedAt, proof.afterUpdatedAt);
    out.works[id] = structuredClone(proof.beforeRow); out.updatedAt = proof.beforeUpdatedAt;
  } else if (kind === 'poster') {
    assert.equal(out.entries.length, proof.afterEntries); out.entries.pop();
    assert.equal(out.entries.length, proof.beforeEntries);
  } else out.works[id] = structuredClone(proof.beforeRow);
  assert.equal(sha(bytes(out)), baselines[kind], 'exact before-formal ' + kind + ' bytes');
  return out;
}

function beforeHeyGabbyFormalBytes(relative, currentBytes) {
  currentBytes=beforePasswordBytes(relative,currentBytes);
  const kind = Object.keys(baselines).find(key => receipt[key].path === 'apps/idol-site/' + relative);
  if (!kind) return Buffer.from(currentBytes);
  if(kind==='supplementsUpdate')currentBytes=beforeV202SupplementsBytes(currentBytes);
  const proof = receipt[kind], text = currentBytes.toString('utf8');
  assert.equal(sha(text), proof.afterFileSha256, kind === 'supplementsUpdate'
    ? 'complete current supplements bytes' : 'complete current formal ' + kind + ' bytes');
  const restored = restore(kind, JSON.parse(text));
  if (kind !== 'supplementsUpdate') return bytes(restored);
  assert.deepEqual(JSON.parse(proof.afterWorkText), proof.afterRow);
  assert.deepEqual(JSON.parse(proof.beforeWorkText), proof.beforeRow);
  assert.equal(text.split(proof.afterWorkText).length, 2, 'unique complete formal work replacement');
  const original = Buffer.from(text.replace(proof.afterWorkText, proof.beforeWorkText));
  assert.equal(sha(original), baselines[kind]); assert.deepEqual(JSON.parse(original), restored);
  return original;
}

let historicalStage;
function beforeFormalStageForWork(id) {
  if (!historicalStage) {
    const ts = require('typescript'), load = require('./public-artist-loader.cjs');
    const code = ts.transpileModule(fs.readFileSync(path.join(app, 'lib/idol/stage.ts'), 'utf8'),
      {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true}}).outputText;
    const compiled = {exports: {}}, dependencies = {
      '@/data/stage-videos.json': restore('stageVideos', require('../../data/stage-videos.json')),
      '@/data/stages/status.json': restore('stageStatuses', require('../../data/stages/status.json')),
      './values': load('lib/idol/values.ts'), './stage-source': load('lib/idol/stage-source.ts'),
    };
    new Function('require', 'module', 'exports', code)(name => {
      assert.ok(Object.hasOwn(dependencies, name), 'known historical stage dependency: ' + name);
      return dependencies[name];
    }, compiled, compiled.exports);
    historicalStage = compiled.exports;
  }
  return historicalStage.stageForWork(id);
}

module.exports = {
  beforeHeyGabbyFormalBytes, beforeFormalStageForWork, heyGabbyFormalAdoption: receipt,
  beforeHeyGabbyFormalStages: current => restore('stageVideos', current),
  beforeHeyGabbyFormalStatuses: current => restore('stageStatuses', current),
  beforeHeyGabbyFormalPosters: current => restore('poster', current),
  beforeHeyGabbyFormalSupplements: current => restore('supplementsUpdate', current),
};
