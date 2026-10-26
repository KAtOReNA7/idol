// Offline admission/fixture tests. Storage uses an in-memory bucket and synthetic
// owner/rows only: no production API, D1 write, network, or upload is performed.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const ts = require('typescript');
const sharp = require('sharp');

const root = process.cwd();
const evidenceRoot = 'evidence/mv-poster-batch2';
const fixtureRoot = 'tests/fixtures/mv-poster-batch2';
const upstreamSHA = 'd93b40e1e98790447308e4aa559684cfcd6a5c55e4614824e21ff5d151d63755';
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const plain = value => JSON.parse(JSON.stringify(value));
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const admission = read(`${evidenceRoot}/admission.json`);
const baseline = read(admission.pilotBaselineFile);
const live = read(admission.liveCatalogFile);
const proofs = admission.items.map(item => ({entry: item, proof: read(item.evidenceFile)}));
class AppError extends Error {
  constructor(code, message, status = 409) { super(message); this.code = code; this.status = status; }
}
function loader(stubs = {}) {
  const modules = new Map();
  function load(relative) {
    const file = path.resolve(root, relative);
    if (modules.has(file)) return modules.get(file);
    const out = {};
    modules.set(file, out);
    const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022},
    }).outputText;
    vm.runInNewContext('(function(require,exports){' + js + '})', {
      crypto: globalThis.crypto, TextEncoder, TextDecoder, Uint8Array, DataView,
      Response, Request, URL, Blob, Date, Map, Set, Number, JSON, encodeURIComponent,
    })(name => {
      if (name in stubs) return stubs[name];
      if (name === 'server-only') return {};
      if (name === './feishu') return {AppError};
      if (name.startsWith('./')) return load(path.resolve(path.dirname(file), name) + '.ts');
      throw Error('Unexpected module: ' + name);
    }, out);
    return out;
  }
  return load;
}
const load = loader();
const registryModule = load('lib/idol/mv-poster-registry.ts');
const registry = plain(registryModule.mvPosterRegistry);
const imageHeader = load('lib/idol/image-integrity.ts').imageHeader;
const slug = (group, song) => `${group} ${song}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
function description(facts) {
  return `Bugs regular full-length MV listing, ${facts.group} ${facts.song}, ${facts.sourceRegistrationDate}, ${facts.duration}, category ${facts.sourceType}; ` +
    `exact existing official-MV work/video tuple checked against the live catalog capture at ${facts.liveEvidenceCapturedAt}. ` +
    `Original ${facts.width}x${facts.height} Bugs preview, native aspect ratio preserved. ` +
    'Admitted as a Bugs-source work preview; no direct Bugs-to-YouTube bridge, video-edit equality, YouTube-thumbnail, HD or frame-accurate playback claim. ' +
    'Historical download hash equality is unverified.';
}
function expectedCandidate(entry, proof) {
  const f = proof.approvedFacts;
  return {
    candidateId: `${slug(f.group, f.song)}-${f.sha256.slice(0, 12)}`,
    candidateVersion: 'mv-poster-20261019-batch2', evidenceId: sha(fs.readFileSync(entry.evidenceFile)),
    label: f.label, workId: f.workId, videoId: f.videoId, videoType: f.videoType,
    kind: 'mv_preview_poster', view: 'mv', snapshotId: baseline.snapshotId, epoch: baseline.epoch,
    sha256: f.sha256, byteLength: f.bytes, mime: f.mime, width: f.width, height: f.height,
    decodedPixelsVerified: f.fullDecode, sourcePageUrl: f.sourcePage, sourceImageUrl: f.originalUrl,
    sourceSnapshotSha256: f.sourceHTMLSha256, sourceDescription: description(f), verifiedAt: proof.reviewedAtUTC,
  };
}
function assertRepoFile(file) {
  assert.equal(path.isAbsolute(file), false);
  assert.equal(file.split('/').includes('..'), false);
  assert.equal(file.startsWith('public/'), false);
  assert.ok(fs.statSync(file).isFile(), file);
}

test('portable approval summaries are hash-pinned and retain the independently approved boundary', () => {
  assert.equal(sha(fs.readFileSync(`${evidenceRoot}/admission.json`)), 'aa8d6eec60a77981549c6b33bf1c7b6de6e354637d4ea152b2ce621e5969986a');
  assert.equal(sha(fs.readFileSync(admission.pilotBaselineFile)), 'e0aaf10170c3c6ea2b22c89a14a75c6be684f5b0e982d120080a809cc3c0bde9');
  assert.equal(admission.upstreamAdmission.sha256, upstreamSHA);
  assert.equal(admission.approvedCount, 9);
  assert.equal(admission.heldCount, 0);
  assert.equal(admission.totalOriginalBytes, 536205);
  assert.deepEqual(admission.holds, []);
  assert.equal(admission.admissionBoundary.directYouTubeBridgeVerified, false);
  assert.equal(admission.admissionBoundary.videoOrFramePixelIdentityVerified, false);
  assert.equal(admission.admissionBoundary.youtubeThumbnailClaimAllowed, false);
  assert.equal(admission.admissionBoundary.HDClaimAllowed, false);
  assert.equal(admission.admissionBoundary.historicalDownloadHashEqualityVerified, false);
  assert.equal(admission.admissionBoundary.nativeAspectRatioMustBePreserved, true);
  assert.equal(admission.admissionBoundary.originalBytesMustBePreserved, true);
  assert.equal(admission.admissionBoundary.soBadPilotExcluded, true);
  assert.equal(sha(fs.readFileSync(admission.liveCatalogFile)), admission.inputs.liveCatalogEvidence.sha256);
  for (const name of ['repositorySnapshot', 'repositoryInventory']) {
    assertRepoFile(admission.inputs[name].file);
    assert.equal(sha(fs.readFileSync(admission.inputs[name].file)), admission.inputs[name].sha256);
  }
  for (const {entry, proof} of proofs) {
    assertRepoFile(entry.evidenceFile);
    assertRepoFile(entry.originalFile);
    assert.equal(sha(fs.readFileSync(entry.evidenceFile)), entry.evidenceSHA256);
    assert.equal(proof.upstreamAdmissionSHA256, upstreamSHA);
    assert.equal(proof.reviewedAtUTC, admission.reviewedAtUTC);
    assert.equal(proof.reviewer, admission.reviewer);
    assert.equal(proof.decision, admission.decision);
    assert.deepEqual(proof.admissionBoundary, admission.admissionBoundary);
    assert.equal(proof.originalFile, entry.originalFile);
    assert.equal(proof.candidateId, entry.candidateId);
    assert.doesNotMatch(JSON.stringify(proof), /\/workspace\/|\/tmp\//);
    const f = proof.approvedFacts;
    assert.equal(f.approved, true);
    assert.equal(f.status, admission.decision);
    assert.equal(f.label, 'MV 预览图（Bugs 来源）');
    assert.equal(f.sourceProvider, 'Bugs');
    assert.equal(f.sourceType, '정규');
    assert.equal(f.selectedTitleHasNoTeaserOrPerformanceQualifier, true);
    assert.equal(f.visualInspection.passed, true);
    assert.equal(f.liveCatalogVerified, true);
    assert.equal(f.liveEvidenceCapturedAt, live.capturedAt);
    assert.deepEqual(f.liveTuple, live.works.find(work => work.id === f.workId));
    assert.equal(f.liveTuple.videoType, f.videoType);
    assert.equal(new URL(f.liveTuple.url).searchParams.get('v'), f.videoId);
    assert.equal(f.historicalOriginalHashEqualityVerified, false);
    assert.equal(f.priorExpectedSHA256, null);
    assert.equal(f.crossPlatformVideoByteEqualityVerified, false);
    assert.equal(f.crossPlatformFramePixelIdentityVerified, false);
    assert.equal(f.directBugsToYouTubeLinkFound, false);
    assert.equal(f.reviewerModifiedOriginal, false);
    assert.deepEqual(f.issues, []);
    assert.equal(proof.provenance.sourceHTML.sourceUrl, f.sourcePage);
    assert.equal(proof.provenance.sourceHTML.sha256, f.sourceHTMLSha256);
    assert.equal(proof.provenance.durationHTML.sha256, f.durationEvidenceSHA256);
    assert.equal(proof.provenance.imageHeaders.sha256, f.imageHeadersSHA256);
    assert.equal(proof.provenance.imageHeaders.sourceUrl, f.originalUrl);
    assert.equal(proof.provenance.researchEvidence.sha256, f.researchEvidenceSHA256);
  }
});

test('every new registry field matches its independently approved evidence with no extra fields', () => {
  assert.deepEqual(registry.candidates.slice(1).map(candidate => candidate.candidateId), admission.items.map(item => item.candidateId));
  for (const {entry, proof} of proofs) {
    const candidate = registry.candidates.find(item => item.candidateId === entry.candidateId);
    assert.deepEqual(candidate, expectedCandidate(entry, proof));
    assert.equal(candidate.candidateVersion, proof.candidateVersion);
    assert.match(candidate.candidateId, /^[a-z0-9-]+$/);
    assert.ok(candidate.candidateId.length <= 160);
    assert.match(candidate.evidenceId, /^[a-f0-9]{64}$/);
    assert.notEqual(candidate.candidateVersion, baseline.candidates[0].candidateVersion);
  }
});

test('SO BAD entire historical object, literal, manifest version and scope remain unchanged', () => {
  assert.equal(registry.manifestVersion, baseline.manifestVersion);
  assert.equal(registry.snapshotId, baseline.snapshotId);
  assert.equal(registry.epoch, baseline.epoch);
  assert.deepEqual(registry.candidates[0], baseline.candidates[0]);
  const text = fs.readFileSync('lib/idol/mv-poster-registry.ts', 'utf8');
  const source = ts.createSourceFile('registry.ts', text, ts.ScriptTarget.Latest, true);
  let literal;
  function visit(node) {
    if (ts.isObjectLiteralExpression(node) && node.properties.some(property =>
      property.name?.getText(source) === 'candidateId' && property.initializer?.text === baseline.candidates[0].candidateId)) literal = node.getText(source);
    ts.forEachChild(node, visit);
  }
  visit(source);
  assert.equal(sha(literal), baseline.pilotLiteralSHA256);
  assert.equal(baseline.pilotLiteralSHA256, 'a174402b3db0f16ae57ab53bd66a92723d31c7ee777156bd4c47d5956304ce88');
  assert.equal(registry.candidates[0].sourceSnapshotSha256, '69b1428a2153326f32875fed0ab7976a3e4a2a1cec7eade46354a61445ea1106');
  assert.equal(registry.candidates[0].verifiedAt, '2026-10-18T15:55:57.046948+00:00');
});

test('append-only ledger has exactly ten unique entries and 606608 bytes within unchanged budgets', () => {
  assert.equal(registry.candidates.length, 10);
  assert.equal(new Set(registry.candidates.map(candidate => candidate.candidateId)).size, 10);
  assert.equal(new Set(registry.candidates.map(candidate => candidate.sha256)).size, 10);
  assert.equal(new Set(registry.candidates.map(candidate => candidate.workId)).size, 10);
  assert.equal(registry.candidates.reduce((total, candidate) => total + candidate.byteLength, 0), 606608);
  assert.equal(registry.candidates.slice(1).reduce((total, candidate) => total + candidate.byteLength, 0), 536205);
  assert.equal(registryModule.MV_POSTER_MAX_CANDIDATES, 10);
  assert.equal(registryModule.MV_POSTER_MAX_BYTES, 8000000);
  assert.equal(registryModule.MV_POSTER_MAX_FILE_BYTES, 3000000);
  for (const candidate of registry.candidates) assert.ok(candidate.byteLength <= registryModule.MV_POSTER_MAX_FILE_BYTES);
  assert.ok(Object.isFrozen(registryModule.mvPosterRegistry));
  assert.ok(Object.isFrozen(registryModule.mvPosterRegistry.candidates));
});

test('exactly nine untouched originals pass complete strict RGB decode and approved pixel hashes', async () => {
  assert.deepEqual(fs.readdirSync(fixtureRoot).sort(), admission.items.map(item => path.basename(item.originalFile)).sort());
  for (const {entry, proof} of proofs) {
    assert.ok(entry.originalFile.startsWith(fixtureRoot + '/'));
    const bytes = fs.readFileSync(entry.originalFile);
    const f = proof.approvedFacts;
    assert.equal(bytes.length, f.bytes);
    assert.equal(sha(bytes), f.sha256);
    assert.equal(f.capturedImageHTTPStatus, 200);
    assert.equal(f.capturedImageContentType, f.mime);
    assert.equal(f.capturedImageContentLength, f.bytes);
    assert.equal(f.mime, 'image/jpeg');
    assert.equal(f.format, 'JPEG');
    assert.equal(f.mode, 'RGB');
    assert.equal(f.fullDecode, true);
    assert.deepEqual(plain(imageHeader(new Uint8Array(bytes))), {mime: f.mime, width: f.width, height: f.height});
    const {data, info} = await sharp(bytes, {failOn: 'warning'}).raw().toBuffer({resolveWithObject: true});
    assert.deepEqual([info.width, info.height], f.dimensions);
    assert.equal(info.channels, 3);
    assert.equal(data.length, f.width * f.height * 3);
    // Sharp's complete RGB decode matches the independent Pillow RGB digest.
    assert.equal(sha(data), f.decodedPixelSHA256);
  }
  const midas = registry.candidates.find(candidate => candidate.candidateId.startsWith('kiss-of-life-midas-touch-'));
  assert.deepEqual([midas.width, midas.height], [500, 348]);
});

function storageHarness(ledger, objects = new Map()) {
  const owner = 'synthetic-offline-owner';
  const stats = {puts: 0, getKeys: []};
  const rows = new Map(ledger.candidates.map(candidate => [candidate.workId, {
    snapshot_id: ledger.snapshotId, table_key: 'works', record_id: candidate.workId,
    fields_json: JSON.stringify({fldhBWXBZE: {link: `https://www.youtube.com/watch?v=${candidate.videoId}`}, fld1vZ4MUc: candidate.videoType, score: 9, notes: 'synthetic personal note', viewed: true}),
  }]));
  const control = {owner_id: owner, mode: 'native', active_snapshot: ledger.snapshotId, epoch: ledger.epoch};
  const bucket = {
    async get(key) {
      stats.getKeys.push(key);
      const object = objects.get(key);
      return object ? {size: object.bytes.length, httpMetadata: {contentType: object.mime}, body: new Blob([object.bytes]).stream()} : null;
    },
    async put(key, bytes, options) {
      stats.puts++;
      assert.equal(options.onlyIf.etagDoesNotMatch, '*');
      assert.equal(options.sha256, sha(bytes));
      if (objects.has(key)) return null;
      objects.set(key, {bytes: Buffer.from(bytes), mime: options.httpMetadata.contentType});
      return {key};
    },
  };
  const stubs = {
    'cloudflare:workers': {env: {BUCKET: bucket}},
    './mv-poster-registry': {...registryModule, mvPosterRegistry: ledger},
    './native-format': {bytesHash: async bytes => sha(bytes)},
    './native-storage': {
      ownControl: async userId => {assert.equal(userId, owner); return control;},
      nativeRow: async (snapshot, table, id) => {assert.equal(snapshot, ledger.snapshotId); assert.equal(table, 'works'); return rows.get(id);},
      nativeSchema: async () => [{field_id: 'fldhBWXBZE', type: 15}, {field_id: 'fld1vZ4MUc', type: 3}],
      nativeDb: () => ({prepare(sql) {
        assert.equal(sql, 'SELECT owner_id FROM idol_native_snapshots WHERE id=?');
        return {bind(snapshot) {assert.equal(snapshot, ledger.snapshotId); return this;}, async first() {return {owner_id: owner};}};
      }}),
    },
  };
  return {api: loader(stubs)('lib/idol/mv-poster-storage.ts'), owner, objects, stats, rows};
}
function uploadRequest(bytes) {
  return new Request('https://synthetic.test/api/manage/posters', {method: 'PUT', headers: {'Content-Type': 'application/octet-stream', 'Content-Length': String(bytes.length)}, body: bytes});
}

test('real registry passes backend admission and preserves the exact historical pilot storage key', async () => {
  const old = storageHarness(baseline);
  const pilot = baseline.candidates[0];
  const bytes = fs.readFileSync('tests/fixtures/mv-posters/stayc-so-bad-original-579650.jpg');
  assert.equal((await old.api.uploadPoster(old.owner, pilot.candidateId, uploadRequest(bytes))).status, 'verified');
  const oldKey = [...old.objects.keys()][0];
  const current = storageHarness(registry, old.objects);
  const beforeRows = JSON.stringify([...current.rows]);
  const status = await current.api.posterStatus(current.owner);
  assert.equal(status.candidates.length, 10);
  assert.equal(status.budget.approvedBytes, 606608);
  assert.equal(status.budget.accountRemainingBytes, null);
  assert.equal(status.candidates[0].status, 'verified');
  assert.ok(status.candidates.slice(1).every(candidate => candidate.status === 'missing'));
  assert.equal(current.stats.getKeys[0], oldKey);
  assert.equal(current.stats.puts, 0);
  assert.deepEqual(plain(status.recoveryManifest), registry.candidates);
  assert.equal(status.archive.includedInNativeArchive, false);
  const response = await current.api.readPoster(current.owner, pilot.candidateId);
  assert.equal(sha(Buffer.from(await response.arrayBuffer())), pilot.sha256);
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
  for (const {entry} of proofs) {
    const original = fs.readFileSync(entry.originalFile);
    assert.equal((await current.api.uploadPoster(current.owner, entry.candidateId, uploadRequest(original))).status, 'verified');
    assert.equal((await current.api.uploadPoster(current.owner, entry.candidateId, uploadRequest(original))).status, 'verified');
  }
  assert.equal(current.stats.puts, 9);
  assert.equal(current.objects.size, 10);
  assert.equal(sha(current.objects.get(oldKey).bytes), pilot.sha256);
  assert.equal(JSON.stringify([...current.rows]), beforeRows);
  assert.ok((await current.api.posterStatus(current.owner)).candidates.every(candidate => candidate.status === 'verified'));
});

// Optional admission-time audit reads the original external reviewer artifact;
// ordinary repo tests remain self-contained through the pinned portable evidence.
test('portable facts match every non-path field of the exact upstream approval artifact', {
  skip: !process.env.MV_POSTER_APPROVAL_SOURCE,
}, () => {
  const bytes = fs.readFileSync(process.env.MV_POSTER_APPROVAL_SOURCE);
  assert.equal(sha(bytes), upstreamSHA);
  const source = JSON.parse(bytes);
  assert.equal(source.items.length, proofs.length);
  assert.equal(source.reviewedAtUTC, admission.reviewedAtUTC);
  for (const {proof} of proofs) {
    const item = source.items.find(candidate => candidate.workId === proof.approvedFacts.workId);
    assert.ok(item);
    const normalized = Object.fromEntries(Object.entries(item).filter(([key]) => !key.endsWith('File')));
    normalized.excludedObservedVariants = item.excludedObservedVariants.map(variant => Object.fromEntries(Object.entries(variant).filter(([key]) => key !== 'observedInFile')));
    assert.deepEqual(proof.approvedFacts, normalized);
  }
});
