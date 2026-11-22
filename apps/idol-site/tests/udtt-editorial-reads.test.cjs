const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const esbuild = require('esbuild');
const originals = require('../scripts/udtt-private-build-assets-manifest.json');
const root = path.join(__dirname, '..');
const bundle = esbuild.buildSync({
  stdin: {resolveDir:root, contents:[
    "export * from './lib/idol/editorial-asset-registry';",
    "export {createEditorialAssetService,editorialFailure} from './lib/idol/editorial-asset-service';",
    "export {AssetError,assetUrl} from './lib/idol/editorial-asset-format';",
  ].join('\n')},
  bundle:true, platform:'node', format:'cjs', external:['server-only'], write:false, logLevel:'silent',
}).outputFiles[0].text;
const modulePort = new Module(__filename, module);
modulePort.require = name => name === 'server-only' ? {} : require(name);
modulePort._compile(bundle, __filename);
const api = modulePort.exports;
const manifest = api.editorialCandidateManifest;
const files = new Map([...originals.files, ...originals.retainedShared].map(file => [file.sha256, file.path]));
const entries = manifest.active.map(ref => manifest.entries.find(item => item.assetId === ref.assetId && item.version === ref.version));
const origin = 'https://idol.test';
function imageRoute(service, publicRead) {
  const filename = path.join(root, 'app/api/editorial-assets/route.ts');
  const route = new Module(filename, module);
  const dependencies = {
    '@/lib/idol/public-images':{readPublishedEditorial:publicRead},
    '@/lib/idol/editorial-asset-service':api,
    '@/lib/idol/editorial-asset-host':{editorialAssetService:async () => service},
  };
  route.require = key => {assert.ok(Object.hasOwn(dependencies, key), key);return dependencies[key];};
  route._compile(esbuild.transformSync(fs.readFileSync(filename, 'utf8'), {loader:'ts', format:'cjs'}).code, filename);
  return route.exports.GET;
}

async function setup(overrides = {}) {
  const control = {ownerId:'owner', snapshotOwnerId:'owner', mode:'native', ...manifest.scope};
  const service = await api.createEditorialAssetService({
    manifest, lineage:api.editorialAssetLineage, limits:api.editorialAssetLimits, policy:api.editorialAssetPolicy,
    requireOwner:async () => 'owner', readControl:async () => control, resolveTarget:async target => target,
    store:{get:() => assert.fail('Unexpected original read'), putIfAbsent:() => assert.fail('Unexpected write')},
    timeoutMs:2500, maxConcurrent:2, ...overrides,
  });
  return {service, request:(entry, options) => new Request(origin + api.assetUrl(service.budget.manifestHash, entry), options)};
}

test('UDTT queues a cold group page of exact originals behind two live reads, cancels abandoned reads and keeps writes bounded', async () => {
  const ids = ['udtt-hero','udtt-risako','udtt-han-chaehee','udtt-gu-hanna','udtt-really-really-mv',
    'udtt-retry-cover','udtt-school-rush-cover','udtt-viper-cover','udtt-kwon-yejin'];
  let release, capacityReached;
  const hold = new Promise(resolve => {release = resolve;});
  const occupied = new Promise(resolve => {capacityReached = resolve;});
  let active = 0, maximum = 0, authenticated = 0;
  const reads = [];
  const {service, request} = await setup({
    requireOwner:async () => {authenticated++;return 'owner';},
    store:{
      async get(key) {
        const hash = key.split('/').at(-1);
        const entry = entries.find(item => item.original.sha256 === hash);
        const bytes = fs.readFileSync(path.join(root, 'public', files.get(hash)));
        reads.push(entry.assetId);
        maximum = Math.max(maximum, ++active);
        if (active === 2) capacityReached();
        await hold;
        active--;
        return {size:bytes.length, mime:entry.original.mime, body:new Response(bytes).body};
      },
      putIfAbsent:() => assert.fail('Read-only example wrote an original'),
    },
  });
  const group = ids.map(id => entries.find(entry => entry.assetId === id));
  const get = imageRoute(service, () => assert.fail('Authenticated read changed catalog'));
  const pending = Promise.all(group.map(entry => get(request(entry))));
  let viewer;
  try {
    await occupied;
    viewer = service.viewer(new Request(origin + '/api/manage/editorial-assets/viewer'));
    const abandoned = new AbortController();
    const dropped = service.read(request(group[1], {signal:abandoned.signal}));
    abandoned.abort();
    await assert.rejects(dropped, {code:'ASSET_BUSY'});
    const write = new Request(origin + '/api/manage/editorial-assets', {method:'PUT'});
    await assert.rejects(service.upload(write), {code:'ASSET_BUSY'});
    assert.equal(reads.length, 2);
  } finally {
    release();
  }
  const responses = await pending;
  assert.equal((await viewer).entries.length, 11);
  for (const [i, response] of responses.entries()) {
    assert.equal(response.status, 200);
    assert.match(response.headers.get('Cache-Control'), /private, no-store/);
    assert.equal(response.headers.get('Content-Type'), group[i].original.mime);
    const original = fs.readFileSync(path.join(root, 'public', files.get(group[i].original.sha256)));
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), original);
  }
  assert.equal(maximum, 2);
  assert.deepEqual(reads.toSorted(), ids.toSorted());
  assert.equal(authenticated, ids.length + 2);
});

test('only an unauthenticated or nonowner identity uses the approved public reader, before any private scope access', async () => {
  for (const [code, status] of [['AUTH_REQUIRED',401], ['OWNER_ONLY',403]]) {
    const {service, request} = await setup({
      requireOwner:async () => {throw new api.AssetError(code, status);},
      readControl:() => assert.fail('Guest accessed private scope'),
    });
    let publicCalls = 0;
    const input = request(entries[0]);
    const get = imageRoute(service, req => {publicCalls++;assert.equal(req, input);return Response.json({});});
    const response = await get(input);
    assert.equal(response.status, 200);
    assert.equal(publicCalls, 1);
  }
  const changed = await setup({readControl:async () => null});
  await assert.rejects(changed.service.read(changed.request(entries[0]), () => assert.fail('Storage ownership failure used the public reader')), {code:'OWNER_ONLY'});
});

test('waiting originals have a bounded queue and deadline without consuming another storage read', async t => {
  let enter, release;
  const occupied = new Promise(resolve => {enter = resolve;});
  const hold = new Promise(resolve => {release = resolve;});
  let now = Date.now(), reads = 0;
  t.mock.method(Date, 'now', () => now);
  const {service, request} = await setup({maxConcurrent:1, store:{
    async get() {reads++;enter();await hold;return null;},
    putIfAbsent:() => assert.fail('Waiting readers wrote an original'),
  }});
  const first = assert.rejects(service.read(request(entries[0])), {code:'ASSET_MISSING'});
  await occupied;
  try {
    const waiting = Array.from({length:manifest.entries.length}, () => assert.rejects(service.read(request(entries[1])), {code:'ASSET_BUSY'}));
    await new Promise(resolve => setImmediate(resolve));
    await assert.rejects(service.read(request(entries[2])), {code:'ASSET_BUSY'});
    now += 3000;
    await Promise.all(waiting);
    assert.equal(reads, 1);
  } finally {release();}
  await first;
});
