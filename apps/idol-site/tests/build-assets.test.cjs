/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
const root = path.resolve(__dirname, '..'), cache = new Map();
function load(file, stubs = {}) {
 const resolved = path.resolve(root, file);
 if (!Object.keys(stubs).length && cache.has(resolved)) return cache.get(resolved);
 const exports = {};
 const context = {Uint8Array, DataView, Request, Response, URL, ReadableStream, crypto: globalThis.crypto, setTimeout, clearTimeout};
 const code = ts.transpileModule(fs.readFileSync(resolved, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true}}).outputText;
 vm.runInNewContext('(function(require, exports){' + code + '\n})', context, {filename: resolved})(name => {
  if (name in stubs) return stubs[name];
  if (name.endsWith('.json')) return JSON.parse(fs.readFileSync(path.resolve(path.dirname(resolved), name)));
  if (name.startsWith('.')) return load(path.relative(root, path.resolve(path.dirname(resolved), name + '.ts')));
  throw new Error('Unexpected dependency ' + name);
 }, exports);
 if (!Object.keys(stubs).length) cache.set(resolved, exports);
 return exports;
}
const format = load('lib/idol/build-asset-format.ts');
const {createBuildAssetService, buildAssetFailure, unsupportedBuildAssetMethod} = load('lib/idol/build-asset-service.ts');
const {BUILD_ASSETS, assetUrl, BuildAssetError, verifyBuildAsset} = format;
const bytes = new Map(BUILD_ASSETS.map(asset => [asset.id, new Uint8Array(fs.readFileSync(path.join(root, 'public', asset.sourceUrl)))]));
const origin = 'https://site.example';
const request = (asset = BUILD_ASSETS[0], manage = false, method = 'GET', body = bytes.get(asset.id), extra = {}) => new Request(origin + assetUrl(asset, manage), {
 method, ...(method === 'PUT' ? {body, headers: {origin, 'content-type': 'application/octet-stream', 'content-length': String(body.length)}} : {}), ...extra,
});
function fixture(overrides = {}) {
 const objects = new Map(); let attempts = 0, creates = 0, reads = 0, owners = 0;
 const store = {async get(key) { reads++; const value = objects.get(key); return value ? {size: value.bytes.length, mime: value.mime, body: new Blob([value.bytes]).stream()} : null; },
  async putIfAbsent(key, value, mime) { attempts++; if (objects.has(key)) return null; creates++; objects.set(key, {bytes: new Uint8Array(value), mime}); return {}; }, ...overrides.store};
 const service = createBuildAssetService({store, requireOwner: async () => { owners++; if (overrides.deny) throw new BuildAssetError(overrides.deny, overrides.deny === 'AUTH_REQUIRED' ? 401 : 403); }, timeoutMs: overrides.ms ?? 100, ...overrides.config});
 return {service, store, objects, counts: () => ({attempts, creates, reads, owners})};
}
const rejectsCode = (promise, code) => assert.rejects(promise, error => error.code === code);
test('four fixed byte-identical JPEG originals verify, manifest deeply frozen', async () => {
 assert.equal(BUILD_ASSETS.length, 4); assert.equal(BUILD_ASSETS.reduce((n, a) => n + a.bytes, 0), 6004463);
 assert.ok(Object.isFrozen(BUILD_ASSETS)); assert.ok(BUILD_ASSETS.every(Object.isFrozen));
 for (const asset of BUILD_ASSETS) await verifyBuildAsset(asset, bytes.get(asset.id), asset.mime);
});
test('anonymous GET needs no owner, is fixed/no-store and does zero writes', async () => {
 const f = fixture({deny: 'AUTH_REQUIRED'}), a = BUILD_ASSETS[0];
 f.objects.set(`${format.BUILD_ASSET_NAMESPACE}/${a.id}/${a.sha256}.jpg`, {bytes: bytes.get(a.id), mime: a.mime});
 const response = await f.service.read(request(a));
 assert.equal(response.status, 200); assert.equal(response.headers.get('cache-control'), 'no-store');
 assert.equal(response.headers.get('cross-origin-resource-policy'), 'same-origin'); assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
 await verifyBuildAsset(a, new Uint8Array(await response.arrayBuffer()), response.headers.get('content-type'));
 assert.deepEqual(f.counts(), {attempts: 0, creates: 0, reads: 1, owners: 0});
});
test('all four owner uploads verify readback, are idempotent and do not overwrite', async () => {
 const f = fixture();
 for (const a of BUILD_ASSETS) {
  assert.equal((await f.service.upload(request(a, true, 'PUT'))).state, 'verified');
  assert.equal((await f.service.upload(request(a, true, 'PUT'))).state, 'verified');
  assert.equal((await f.service.status(request(a, true))).state, 'verified');
 }
 assert.equal(f.counts().creates, 4); assert.equal(f.counts().attempts, 4);
});
test('anonymous, other login and other durable owner rejected before bucket access', async () => {
 for (const deny of ['AUTH_REQUIRED', 'OWNER_ONLY']) {
  const f = fixture({deny});
  await rejectsCode(f.service.upload(request(undefined, true, 'PUT')), deny);
  await rejectsCode(f.service.status(request(undefined, true)), deny);
  assert.equal(f.counts().attempts, 0); assert.equal(f.counts().reads, 0);
 }
});
test('unknown IDs/version, duplicates, extra key/url/owner/snapshot, paths, methods fail closed', async () => {
 const f = fixture(), a = BUILD_ASSETS[0];
 for (const suffix of ['&key=abc', '&url=https://evil.test', '&ownerId=owner', '&snapshot=x', '&id='+a.id, '&version='+a.sha256]) {
  await assert.rejects(f.service.read(new Request(origin + assetUrl(a) + suffix)));
  await assert.rejects(f.service.upload(new Request(origin + assetUrl(a, true) + suffix, {method: 'PUT'})));
 }
 for (const url of ['/api/build-assets', '/api/build-assets?id=bad&version='+a.sha256, '/api/build-assets?id='+a.id+'&version=bad', '/api/other?id='+a.id+'&version='+a.sha256])
  await assert.rejects(f.service.read(new Request(origin + url)));
 await rejectsCode(f.service.read(request(a, false, 'HEAD')), 'METHOD_NOT_ALLOWED');
 assert.equal(f.counts().attempts, 0); assert.equal(f.counts().reads, 0);
 assert.equal(unsupportedBuildAssetMethod().status, 405);
});
test('cross-origin, missing origin, wrong MIME, encoding and lengths are zero-write', async () => {
 const f = fixture(), a = BUILD_ASSETS[0], base = {origin, 'content-type': 'application/octet-stream', 'content-length': String(a.bytes)};
 for (const patch of [{origin: 'https://evil.test'}, {origin: ''}, {'content-type': 'image/jpeg'}, {'content-encoding': 'gzip'}, {'content-length': '0'}, {'content-length': '0'+a.bytes}, {'content-length': String(a.bytes+1)}])
  await assert.rejects(f.service.upload(request(a, true, 'PUT', bytes.get(a.id), {headers: {...base, ...patch}})));
 assert.equal(f.counts().attempts, 0); assert.equal(f.counts().reads, 0);
});
test('wrong body SHA/header/geometry/oversize/short payload never writes', async () => {
 const f = fixture(), a = BUILD_ASSETS[0], source = bytes.get(a.id);
 const hashBad = new Uint8Array(source); hashBad[hashBad.length - 20] ^= 1;
 const headerBad = new Uint8Array(source); headerBad[0] = 0;
 const geometryBad = new Uint8Array(source);
 let marker = 2; while (marker < geometryBad.length) { while (geometryBad[marker] === 255) marker++; const code = geometryBad[marker++]; const length = (geometryBad[marker] << 8) + geometryBad[marker+1]; if ([0xc0, 0xc1, 0xc2].includes(code)) { geometryBad[marker+5] ^= 1; break; } marker += length; }
 for (const body of [hashBad, headerBad, geometryBad, new Uint8Array(a.bytes+1), source.slice(0,-1)])
  await assert.rejects(f.service.upload(request(a, true, 'PUT', body, {headers: {origin, 'content-type': 'application/octet-stream', 'content-length': String(a.bytes)}})));
 assert.equal(f.counts().attempts, 0); assert.equal(f.counts().reads, 0);
});
test('corrupt size/MIME/hash/geometry in storage blocks public reads and upload, no overwrite', async () => {
 const a = BUILD_ASSETS[0], key = `${format.BUILD_ASSET_NAMESPACE}/${a.id}/${a.sha256}.jpg`;
 const bad = new Uint8Array(bytes.get(a.id)); bad[bad.length-20] ^= 1;
 for (const object of [{bytes: new Uint8Array(12), mime: a.mime}, {bytes: bytes.get(a.id), mime: 'text/html'}, {bytes: bad, mime: a.mime}]) {
  const f = fixture(); f.objects.set(key, object);
  await rejectsCode(f.service.read(request(a)), 'BUILD_ASSET_CONFLICT');
  assert.equal((await f.service.upload(request(a, true, 'PUT'))).state, 'conflict'); assert.equal(f.counts().attempts, 0);
 }
});
test('same-isolate concurrent uploads create only once; separate isolates rely on atomic create-only', async () => {
 const f = fixture(), a = BUILD_ASSETS[0];
 const result = await Promise.all([f.service.upload(request(a, true, 'PUT')), f.service.upload(request(a, true, 'PUT'))]);
 assert.ok(result.every(x => ['unknown', 'verified'].includes(x.state))); assert.equal(f.counts().creates, 1); assert.equal(f.counts().attempts, 1);
 const g = fixture(); const other = createBuildAssetService({store: g.store, requireOwner: async () => {}});
 const both = await Promise.all([g.service.upload(request(a, true, 'PUT')), other.upload(request(a, true, 'PUT'))]);
 assert.ok(both.every(x => x.state === 'verified')); assert.equal(g.counts().creates, 1);
});
test('uncertain PUT absent readback stays unknown, does not blindly retry', async () => {
 let attempts = 0; const f = fixture({store: {async putIfAbsent() { attempts++; throw new Error('uncertain'); }}}), a = BUILD_ASSETS[0];
 assert.equal((await f.service.upload(request(a, true, 'PUT'))).state, 'unknown');
 assert.equal((await f.service.status(request(a, true))).state, 'unknown');
 assert.equal((await f.service.upload(request(a, true, 'PUT'))).state, 'unknown'); assert.equal(attempts, 1);
});
test('timed-out write retains reservation; late successful readback resolves without retry', async () => {
 let finish, attempts = 0; const f = fixture({ms: 30, store: {putIfAbsent(key, value, mime) { attempts++; return new Promise(resolve => { finish = () => {f.objects.set(key, {bytes: value, mime}); resolve({});}; }); }}}), a = BUILD_ASSETS[0];
 assert.equal((await f.service.upload(request(a, true, 'PUT'))).state, 'unknown');
 assert.equal((await f.service.status(request(a, true))).state, 'unknown');
 assert.equal((await f.service.upload(request(a, true, 'PUT'))).state, 'unknown');
 finish(); await new Promise(resolve => setTimeout(resolve, 0));
 assert.equal((await f.service.status(request(a, true))).state, 'verified'); assert.equal(attempts, 1);
});
test('read timeout/body timeout are bounded, zero-write and sanitized', async () => {
 const f = fixture({ms: 10, store: {get: () => new Promise(() => {})}});
 await rejectsCode(f.service.read(request()), 'BUILD_ASSET_UNKNOWN');
 const a = BUILD_ASSETS[0]; let cancelled = false;
 const body = new ReadableStream({cancel() {cancelled = true;}});
 const req = new Request(origin+assetUrl(a,true), {method: 'PUT', body, duplex: 'half', headers: {origin,'content-type':'application/octet-stream','content-length':String(a.bytes)}});
 await rejectsCode(f.service.upload(req), 'BUILD_ASSET_TIMEOUT'); assert.equal(cancelled, true); assert.equal(f.counts().attempts, 0);
 const response = buildAssetFailure(new Error('SECRET SQL key credential'));
 assert.equal(await response.text(), '{"error":"BUILD_ASSET_UNAVAILABLE"}');
});
test('owner host requires true site identity and durable matching control, writes only fixed R2 create', async () => {
 class AppError extends Error { constructor(code, status) {super(code);this.code=code;this.status=status;} }
 let who = {userId: 'owner'}, control = {owner_id: 'owner'}, fail;
 const host = load('lib/idol/build-asset-host.ts', {'server-only': {}, 'cloudflare:workers': {env: {}}, './http': {requireUser: async () => { if (fail) throw fail; return who;}}, './native-storage': {ownControl: async () => control}, './feishu': {AppError}});
 await host.requireBuildAssetOwner();
 for (const next of [null,{owner_id:'other'}]) {control=next; await rejectsCode(host.requireBuildAssetOwner(),'OWNER_ONLY');}
 fail = new AppError('AUTH_REQUIRED',401); await rejectsCode(host.requireBuildAssetOwner(),'AUTH_REQUIRED');
 const text = fs.readFileSync(path.join(root,'lib/idol/build-asset-host.ts'),'utf8');
 assert.match(text,/onlyIf: \{etagDoesNotMatch: '\*'\}/); assert.doesNotMatch(text,/\.delete\(|\.list\(|\.prepare\(|fetch\(/);
 assert.match(fs.readFileSync(path.join(root,'lib/idol/http.ts'),'utf8'), /user.email.toLowerCase\(\)!==/);
});
test('all four public originals can be read concurrently', async () => {
 const f = fixture();
 for (const a of BUILD_ASSETS) f.objects.set(`${format.BUILD_ASSET_NAMESPACE}/${a.id}/${a.sha256}.jpg`,{bytes:bytes.get(a.id),mime:a.mime});
 const results = await Promise.all(BUILD_ASSETS.map(a => f.service.read(request(a)))); assert.ok(results.every(r => r.status === 200)); assert.equal(f.counts().attempts,0);
});
test('timed-out R2 reads retain a bounded unsettled IO budget', async () => {
 let calls = 0; const f = fixture({ms:5,store:{get:()=>{calls++;return new Promise(()=>{});}}});
 for (let i=0;i<10;i++) await assert.rejects(f.service.read(request()));
 assert.equal(calls,6); assert.equal(f.counts().attempts,0);
});
test('UI persistent attempt fence precedes PUT and local validation alone cannot enable upload', () => {
 const text=fs.readFileSync(path.join(root,'app/manage/build-assets/client.tsx'),'utf8');
 assert.ok(text.indexOf("localStorage.setItem(fenceKey, 'attempted')")<text.indexOf("method: 'PUT'"));
 assert.match(text,/setFile\(next\); setCanUpload\(false\)/); assert.match(text,/result.state === 'missing' && !attempted.current/);
 assert.match(text,/window.addEventListener\('storage', sync\)/); assert.doesNotMatch(text,/localStorage\.removeItem|setInterval|setTimeout/);
});
test('empty-chunk stream is rejected without growing memory or starving timeout', async () => {
 const f=fixture({ms:10}),a=BUILD_ASSETS[0];let reads=0;
 const body=new ReadableStream({pull(controller){reads++;controller.enqueue(new Uint8Array());}});
 const req=new Request(origin+assetUrl(a,true),{method:'PUT',body,duplex:'half',headers:{origin,'content-type':'application/octet-stream','content-length':String(a.bytes)}});
 await rejectsCode(f.service.upload(req),'BUILD_ASSET_STREAM_INVALID'); assert.ok(reads<=3);assert.equal(f.counts().attempts,0);
});
