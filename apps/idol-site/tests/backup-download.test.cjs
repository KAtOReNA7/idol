// Independent, local-only backup regressions. Copy to tests/ or run from repo root:
// node --test /workspace/shared/backup-download-review.test.cjs
// Set IDOL_REPO only when the current directory is not the repository root.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const root = process.env.IDOL_REPO || process.cwd();
const ts = require('node:module').createRequire(path.join(root, 'package.json'))('typescript');
const ID = '11111111-1111-4111-8111-111111111111';
const HASH = 'a'.repeat(64);
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const checksumBuffer = hex => Uint8Array.from(Buffer.from(hex, 'hex')).buffer;
class AppError extends Error {
  constructor(code, message, status = 502) { super(message); Object.assign(this, {code, status}); }
}
function load(file, deps = {}) {
  const out = {};
  const js = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022},
  }).outputText;
  vm.runInNewContext(`(function(require,exports){${js}})`, {
    TextEncoder, Uint8Array, Uint32Array, DataView, ReadableStream, Response, Request,
    Blob, URL, Error, Set, Map, JSON, Number, String, encodeURIComponent,
    // Deliberately no fetch, Cloudflare binding, or production network capability.
  })(name => {
    if (!Object.hasOwn(deps, name)) throw Error('Unexpected dependency: ' + name);
    return deps[name];
  }, out);
  return out;
}
const zip = load('lib/idol/zip.ts');
function harness() {
  const data = Buffer.from([31, 139, 8, 0, 0, 1, 2, 3]);
  const photo = Buffer.from('synthetic original image bytes');
  const photoSha = digest(photo), dataSha = digest(data);
  const manifest = {
    formatVersion: 'idol.full-backup.v1', id: ID, complete: true,
    expectedPhotoTokens: 1, capturedAt: '2026-10-13T12:00:00.000Z',
    data: {path: 'data.json.gz', sha256: dataSha, byteLength: data.length},
    photos: [{fileToken: 'tokenOne', path: 'photos/' + photoSha, sha256: photoSha,
      byteLength: photo.length, contentType: 'image/png'}],
    references: [], manifestHash: HASH,
  };
  const objects = new Map([
    ['archives/final/data.json.gz', {bytes: data, size: data.length, sha: dataSha}],
    ['photos/' + photoSha, {bytes: photo, size: photo.length, sha: photoSha}],
  ]);
  const stats = {gets: [], manifestReads: 0, cancelled: [], queries: []};
  let control = {owner_id: 'owner', mode: 'native', active_snapshot: ID};
  const native = {
    ownControl: async user => {
      if (user !== control.owner_id) throw new AppError('OWNER_ONLY', 'owner only', 403);
      return {...control};
    },
    nativeDb: () => ({prepare: sql => {
      assert.match(sql, /^SELECT manifest_json FROM idol_native_snapshots/);
      return {bind: (id, owner) => ({first: async () => {
        assert.equal(id, ID); assert.equal(owner, 'owner'); stats.queries.push(sql);
        return {manifest_json: JSON.stringify({finalKey: 'archives/final/data.json.gz'})};
      }})};
    }}),
  };
  const api = load('lib/idol/backup-download.ts', {
    'cloudflare:workers': {env: {BUCKET: {get: async key => {
      stats.gets.push(key);
      const object = objects.get(key);
      if (!object) return null;
      return {
        size: object.size,
        checksums: object.sha === null ? {} : {sha256: checksumBuffer(object.sha)},
        body: new ReadableStream({
          start(c) { c.enqueue(new Uint8Array(object.bytes)); c.close(); },
          cancel() { stats.cancelled.push(key); },
        }),
      };
    }}}},
    './feishu': {AppError}, './native-storage': native,
    './cutover': {finalBackupManifest: async (user, id) => {
      assert.equal(user, 'owner'); assert.equal(id, control.active_snapshot);
      stats.manifestReads++; return structuredClone(manifest);
    }},
    './zip': zip,
  });
  return {api, manifest, objects, stats, data, photo,
    setControl: next => control = {...control, ...next},
    download: (part = 1) => api.backupDownload('owner', part, ID, HASH)};
}
function unzip(bytes) {
  return JSON.parse(cp.execFileSync('python3', ['-c',
    "import sys,base64,zipfile,io,json;z=zipfile.ZipFile(io.BytesIO(base64.b64decode(sys.stdin.read())));assert z.testzip() is None;print(json.dumps({n:base64.b64encode(z.read(n)).decode() for n in z.namelist()}))",
  ], {input: bytes.toString('base64'), encoding: 'utf8'}));
}
async function failedDownload(h, code) {
  const response = await h.download();
  await assert.rejects(response.arrayBuffer(), e => e.code === code);
}

test('owner and native-mode gates prevent archive reads', async () => {
  const h = harness();
  await assert.rejects(h.api.backupOptions('other'), e => e.code === 'OWNER_ONLY');
  await assert.rejects(h.api.backupDownload('other', 1, ID, HASH), e => e.code === 'OWNER_ONLY');
  for (const mode of ['feishu', 'frozen']) {
    h.setControl({mode});
    assert.equal((await h.api.backupOptions('owner')).ready, false);
    await assert.rejects(h.download(), e => e.code === 'BACKUP_NOT_READY');
  }
  assert.equal(h.stats.manifestReads, 0); assert.equal(h.stats.gets.length, 0);
});

test('download URLs carry exact immutable snapshot and manifest identity', async () => {
  const h = harness(), options = await h.api.backupOptions('owner');
  const url = new URL(options.parts[0].url, 'https://local.test');
  assert.equal(url.searchParams.get('snapshot'), ID);
  assert.equal(url.searchParams.get('manifest'), HASH);
  assert.equal(url.searchParams.get('part'), '1');
  for (const [id, hash] of [['', HASH], [ID, ''], [ID, 'b'.repeat(64)]])
    await assert.rejects(h.api.backupDownload('owner', 1, id, hash), e => e.code === 'BACKUP_CHANGED');
  h.setControl({active_snapshot: '22222222-2222-4222-8222-222222222222'});
  await assert.rejects(h.download(), e => e.code === 'BACKUP_CHANGED');
  assert.equal(h.stats.gets.length, 0);
});

test('invalid part values reject before any object stream opens', async () => {
  const h = harness();
  for (const part of [0, -1, 1.5, Infinity, Number.MAX_SAFE_INTEGER + 1, 2])
    await assert.rejects(h.download(part), e => e.code === 'INVALID_PART');
  assert.equal(h.stats.gets.length, 0);
});

test('repeated downloads produce identical ZIP bytes, valid CRC, hashes, and private headers', async () => {
  const h = harness(), first = await h.download();
  assert.equal(first.headers.get('cache-control'), 'private, no-store');
  assert.equal(first.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(first.headers.get('content-type'), 'application/zip');
  const bytes = Buffer.from(await first.arrayBuffer());
  assert.equal(bytes.length, Number(first.headers.get('content-length')));
  assert.deepEqual(Buffer.from(await (await h.download()).arrayBuffer()), bytes);
  const entries = unzip(bytes), manifest = JSON.parse(Buffer.from(entries['manifest.json'], 'base64'));
  assert.deepEqual(Buffer.from(entries['data.json.gz'], 'base64'), h.data);
  assert.equal(digest(Buffer.from(entries['data.json.gz'], 'base64')), manifest.data.sha256);
  assert.deepEqual(Buffer.from(entries[manifest.photos[0].path], 'base64'), h.photo);
  assert.equal(digest(Buffer.from(entries[manifest.photos[0].path], 'base64')), manifest.photos[0].sha256);
  const readme = Buffer.from(entries['README.txt'], 'base64').toString();
  assert.ok(readme.includes(h.manifest.capturedAt));
  assert.ok(readme.includes('之后的修改不在这份文件内'));
});

test('duplicate photo tokens sharing one SHA produce one ZIP photo entry', async () => {
  const h = harness();
  h.manifest.photos.push({...h.manifest.photos[0], fileToken: 'tokenTwo'});
  const entries = unzip(Buffer.from(await (await h.download()).arrayBuffer()));
  assert.equal(Object.keys(entries).filter(name => name.startsWith('photos/')).length, 1);
  assert.equal(h.stats.gets.filter(name => name.startsWith('photos/')).length, 1);
});

test('missing or mismatched R2 SHA metadata rejects both data and photo streams', async () => {
  for (const keyKind of ['data', 'photo']) for (const sha of [null, '0'.repeat(64)]) {
    const h = harness(), key = keyKind === 'data' ? 'archives/final/data.json.gz' : h.manifest.photos[0].path;
    h.objects.get(key).sha = sha;
    await failedDownload(h, 'BACKUP_CHECKSUM_MISMATCH');
  }
});

test('missing or wrong-size R2 objects fail without a completed ZIP', async () => {
  for (const kind of ['missing', 'wrong-size']) {
    const h = harness(), key = h.manifest.photos[0].path;
    if (kind === 'missing') h.objects.delete(key); else h.objects.get(key).size++;
    await failedDownload(h, 'BACKUP_MISSING');
  }
});

test('body truncation or excess bytes cannot pass even when R2 metadata matches', async () => {
  for (const bytes of [Buffer.from('x'), Buffer.alloc(100)]) {
    const h = harness(); h.objects.get(h.manifest.photos[0].path).bytes = bytes;
    await assert.rejects((await h.download()).arrayBuffer(), /truncated|size mismatch/);
  }
});

test('16 MB data plus 85 MB photos splits and each advertised ZIP is below 100 MB', async () => {
  const h = harness(); h.manifest.data.byteLength = 16000000;
  h.manifest.photos = Array.from({length: 17}, (_, i) => {
    const sha = i.toString(16).padStart(64, '0');
    return {fileToken: 'token' + i, path: 'photos/' + sha, sha256: sha, byteLength: 5000000, contentType: 'image/png'};
  });
  const options = await h.api.backupOptions('owner');
  assert.ok(options.parts.length > 1);
  for (const part of options.parts) {
    const response = await h.download(part.part);
    assert.ok(Number(response.headers.get('content-length')) < 100000000);
    await response.body.cancel();
  }
  assert.equal(h.stats.gets.length, 0, 'planning and unconsumed download cancellation read no R2 bodies');
});

test('24 MB data and many near-limit images produce only bounded ZIPs', async () => {
  const h = harness(); h.manifest.data.byteLength = 24000000;
  h.manifest.photos = Array.from({length: 40}, (_, i) => {
    const sha = i.toString(16).padStart(64, '0');
    return {fileToken: 'token' + i, path: 'photos/' + sha, sha256: sha, byteLength: 16000000, contentType: 'image/png'};
  });
  const options = await h.api.backupOptions('owner');
  for (const part of options.parts) {
    const response = await h.download(part.part);
    assert.ok(Number(response.headers.get('content-length')) < 100000000);
    await response.body.cancel();
  }
  assert.equal(h.stats.gets.length, 0);
});

test('route passes pinned download identity and rejects malformed parts before dispatch', async () => {
  const calls = [];
  const route = load('app/api/manage/backup/route.ts', {
    '@/lib/idol/http': {requireUser: async () => ({userId: 'owner'}),
      json: (value, status = 200) => Response.json(value, {status}), failure: e => Response.json({error: e.code}, {status: e.status || 500})},
    '@/lib/idol/backup-download': {backupOptions: async user => { calls.push(['options', user]); return {ready: true}; },
      backupDownload: async (...args) => { calls.push(['download', ...args]); return new Response('synthetic'); }},
  });
  for (const part of ['', '0', '-1', '1.5', 'NaN', '01'])
    assert.equal((await route.GET(new Request('https://local.test/api/manage/backup?part=' + part))).status, 400);
  assert.equal(calls.length, 0);
  await route.GET(new Request(`https://local.test/api/manage/backup?part=2&snapshot=${ID}&manifest=${HASH}`));
  assert.deepEqual(calls[0], ['download', 'owner', 2, ID, HASH]);
});
