'use strict';

// Tests the real artist serializer and safe return validator. The finite,
// explicitly approved fixture journey adapter only satisfies an unused import;
// this suite never treats it as global journey/dirty-save authorization.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const esbuild = require('esbuild');
const crypto = require('node:crypto');
const registry = require('../HANDOFF/artist-registry51.json');
const {sourceRoot, explicitTestAliases, assertExplicitTestInputs, publicNavigationInputs, assertPublicNavigationContent} = require('./fixtures/timeline-host/explicit-test-aliases.cjs');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'timeline-navigation-'));
const defaults = {type: 'all', importance: 'major', order: 'recent'};
// Explicit rollout, also covered by newjeans-independent.test.cjs legacy returns.
const historyPaths = new Set(['/artists/loona', '/artists/everglow', '/artists/kep1er', '/artists/newjeans']);
const noFormatPaths = new Set(['/artists/babymonster', '/artists/illit', '/artists/xg', '/artists/aespa']);
let api, proof;
const local = value => new URL(value, 'https://test.invalid');
const params = value => local(value).searchParams;

test.before(async () => {
  const aliases = [];
  const output = path.join(temporary, 'navigation.cjs');
  const result = await esbuild.build({stdin: {
    contents: "export {artistRoute,artistRouteUrl} from './lib/idol/artist-preview'; export {safeArtistReturn,groupArtistUrl} from './lib/idol/artist-navigation';",
    resolveDir: sourceRoot, sourcefile: 'timeline-navigation-entry.ts', loader: 'ts',
  }, bundle: true, outfile: output, absWorkingDir: sourceRoot, platform: 'node', format: 'cjs',
  nodePaths: process.env.NODE_PATH ? process.env.NODE_PATH.split(path.delimiter) : [],
  plugins: [explicitTestAliases(aliases)], metafile: true, logLevel: 'silent'});
  proof = assertExplicitTestInputs(result.metafile, aliases);
  api = require(output);
});
test.after(() => fs.rmSync(temporary, {recursive: true, force: true}));

test('actual artist routing modules are bundled with only the finite unused journey import adapter', () => {
  for (const file of ['lib/idol/artist-preview.ts', 'lib/idol/artist-navigation.ts', 'lib/idol/timeline/route.ts']) assert.ok(proof.inputs.includes(file), file);
  assert.equal(proof.aliases.length, 1);
  assert.equal(proof.aliases[0].original, './journey');
  assert.ok(proof.aliases[0].replacement.endsWith('/tests/fixtures/timeline-host/journey-route-adapter.ts'));
  assert.ok(!proof.inputs.some(file => /app\/api\/|data\/snapshot|use-browse-journey/.test(file)));
});

test('only seven reviewed public navigation inputs pass the strict provenance boundary', () => {
  assert.deepEqual(publicNavigationInputs.map(row => row.path).sort(), [...['badvillain','billlie','hearts2hearts','idle','ive','triples'].map(slug => `data/${slug}-navigation-keys.json`), 'data/public-artist-navigation-keys.json'].sort());
  const meta = (file, importer) => ({inputs: {[file]: {}, ...importer ? {[importer]: {imports: [{path: file}]}} : {}}});
  for (const row of publicNavigationInputs) {
    assert.ok(proof.inputs.includes(row.path), row.path);
    assert.doesNotThrow(() => assertExplicitTestInputs(meta(row.path, row.importer), []));
    assert.throws(() => assertExplicitTestInputs(meta(row.path), []), /Unauthorized public navigation importer/);
    assert.throws(() => assertExplicitTestInputs(meta(row.path, 'lib/idol/unrelated.ts'), []), /Unauthorized public navigation importer/);
    const content = fs.readFileSync(path.join(sourceRoot, row.path), 'utf8');
    assert.throws(() => assertPublicNavigationContent(row, content + ' '), /differs from reviewed bytes/);
    // Even a newly pinned digest cannot admit catalog prose or private fields.
    for (const mutate of [value => {value.note = 'not a routing key';}, value => {value[Object.keys(row.shape)[0]][0] = {id: 'x', note: 'not a routing key'};}]) {
      const value = JSON.parse(content); mutate(value);
      const changed = JSON.stringify(value);
      const repinned = {...row, sha256: crypto.createHash('sha256').update(changed).digest('hex')};
      assert.throws(() => assertPublicNavigationContent(repinned, changed), /Unexpected public navigation fields|Non-key public navigation payload/);
    }
  }
  for (const file of ['data/snapshot.json', 'data/billlie-navigation-keys-extra.json', 'data/billlie-artist.json', 'data/triples/identity-evidence.json']) {
    assert.throws(() => assertExplicitTestInputs(meta(file, 'lib/idol/artist-navigation.ts'), []), /Unauthorized actual data imported/);
  }
});

test('all 51 artist updates paths roundtrip every supported timeline filter combination', () => {
  assert.equal(registry.length, 51);
  for (const group of registry) for (const type of ['all', 'members', 'release', 'organization']) for (const importance of ['major', 'all']) for (const order of ['recent', 'earliest']) {
    const filters = {type, importance, order};
    const query = new URLSearchParams({section: 'updates', queue: 'rewatch', q: '同名 A & B /?=…', timelineType: type, timelineImportance: importance, timelineOrder: order});
    const source = group.path + '?' + query;
    const route = api.artistRoute(source);
    assert.deepEqual(route.timeline, filters, source);
    const written = api.artistRouteUrl(route, group.path);
    assert.equal(local(written).pathname, group.path);
    assert.deepEqual(api.artistRoute(written).timeline, filters);
    assert.equal(params(written).get('section'), 'updates');
    assert.equal(params(written).get('queue'), 'rewatch');
    assert.equal(params(written).get('q'), '同名 A & B /?=…');
    assert.ok(api.safeArtistReturn(written), written);
    for (const [key, value, fallback] of [['timelineType', type, 'all'], ['timelineImportance', importance, 'major'], ['timelineOrder', order, 'recent']]) assert.equal(params(written).has(key), value !== fallback);
    assert.equal(api.groupArtistUrl(group.groupId), group.path);
  }
});

test('default updates filters remain implicit and old section=updates links stay valid', () => {
  for (const group of registry) {
    const value = group.path + '?section=updates';
    const route = api.artistRoute(value);
    assert.deepEqual(route.timeline, defaults);
    assert.equal(api.artistRouteUrl(route, group.path), value);
    assert.equal(api.safeArtistReturn(value), value);
  }
});

test('timeline parameters are rejected outside the authoritative 51 updates sections', () => {
  for (const base of ['/artists/unknown', '/preview/babymonster', '/', '/artists/loona/', '/artists/meovv/works']) {
    const value = base + '?section=updates&timelineType=release';
    assert.equal(api.artistRoute(value).timeline, null, value);
    assert.equal(api.safeArtistReturn(value), null, value);
  }
  for (const section of ['', 'overview', 'works', 'members', 'records', 'timeline']) {
    const value = '/artists/loona?' + new URLSearchParams({...section ? {section} : {}, timelineImportance: 'all'});
    assert.equal(api.artistRoute(value).timeline, null, value);
    assert.equal(api.safeArtistReturn(value), null, value);
  }
  // Existing preview navigation remains compatible when it carries no new filter.
  assert.equal(api.safeArtistReturn('/preview/babymonster?section=updates'), '/preview/babymonster?section=updates');
});

test('duplicate, empty, malformed and unknown timeline values fail both parsing and safe returns', () => {
  for (const suffix of [
    'timelineType=release&timelineType=members', 'timelineImportance=all&timelineImportance=all',
    'timelineOrder=earliest&timelineOrder=earliest', 'timelineType=', 'timelineImportance=', 'timelineOrder=',
    'timelineType=works', 'timelineType=Release', 'timelineImportance=hold', 'timelineOrder=ascending',
    'timelineType=release%0A', 'timelineImportance=%20all', 'timelineOrder=recent%00',
    'section=updates', 'section=works',
  ]) {
    const value = '/artists/loona?section=updates&' + suffix;
    assert.equal(api.artistRoute(value).timeline, null, value);
    assert.equal(api.safeArtistReturn(value), null, value);
  }
});

test('LOONA EVERGLOW Kep1er and NewJeans historical roster and existing work query state survive filter roundtrip', () => {
  for (const base of historyPaths) {
    const value = base + '?' + new URLSearchParams({section: 'updates', roster: 'history', member: 'recFixtureFormerA', queue: 'tonight', q: '同一首歌的现场版', format: 'stage', timelineType: 'members', timelineImportance: 'all', timelineOrder: 'earliest'});
    const route = api.artistRoute(value), before = structuredClone(route);
    Object.freeze(route.timeline); Object.freeze(route);
    const written = api.artistRouteUrl(route, base), returned = api.artistRoute(api.safeArtistReturn(written));
    assert.deepEqual(route, before, 'serialization leaves the caller object unchanged');
    assert.equal(returned.roster, 'history'); assert.equal(returned.member, 'recFixtureFormerA');
    assert.equal(returned.queue, 'tonight'); assert.equal(returned.search, '同一首歌的现场版'); assert.equal(returned.format, 'stage');
    assert.deepEqual(returned.timeline, {type: 'members', importance: 'all', order: 'earliest'});
  }
});

test('existing format and historical roster authorization stays path-specific', () => {
  for (const group of registry) {
    const base = group.path;
    const formatReturn = base + '?section=updates&format=stage&timelineType=release';
    assert.equal(api.safeArtistReturn(formatReturn) !== null, !noFormatPaths.has(base), base);
    const historyReturn = base + '?section=updates&roster=history&timelineType=members';
    assert.equal(api.safeArtistReturn(historyReturn) !== null, historyPaths.has(base), base);
    if (!historyPaths.has(base)) assert.equal(api.artistRoute(historyReturn).roster, undefined);
  }
});

test('leaving updates omits timeline parameters while preserving member/work/roster state', () => {
  const parsed = api.artistRoute('/artists/loona?section=updates&roster=history&queue=unrated&q=MV%20live&format=mv&timelineType=release&timelineImportance=all&timelineOrder=earliest');
  for (const section of ['members', 'works', 'records', 'overview']) {
    const value = api.artistRouteUrl({...parsed, section, member: section === 'members' ? 'recFixtureMemberA' : null}, '/artists/loona');
    for (const key of ['timelineType', 'timelineImportance', 'timelineOrder']) assert.equal(params(value).has(key), false);
    assert.equal(params(value).get('roster'), 'history'); assert.equal(params(value).get('queue'), 'unrated');
    assert.equal(params(value).get('q'), 'MV live'); assert.equal(params(value).get('format'), 'mv');
    assert.equal(api.artistRoute(value).timeline, null); assert.ok(api.safeArtistReturn(value));
  }
});

test('safe return rejects external, injected, duplicate and overlong old query fields alongside timeline fields', () => {
  for (const value of [
    'https://evil.example/artists/loona?section=updates&timelineType=members',
    '//evil.example/artists/loona?section=updates&timelineType=members',
    '/artists/loona?section=updates&timelineType=members#event',
    '/artists/loona?section=updates&timelineType=members&unknown=1',
    '/artists/loona?section=updates&timelineType=members&queue=all&queue=all',
    '/artists/loona?section=updates&timelineType=members&q=a&q=b',
    '/artists/loona?section=updates&timelineType=members&roster=history&roster=history',
    '/artists/loona?section=updates&timelineType=members&member=foreign',
    '/artists/loona?section=updates&timelineType=members&queue=broken',
    '/artists/loona?section=updates&timelineType=members&format=broken',
    '/artists/loona?section=updates&timelineType=members&roster=current',
    '/artists/loona?section=updates&timelineType=members&q=' + 'x'.repeat(201),
    '/artists/loona?section=updates&timelineType=members&q=' + 'x'.repeat(4096),
  ]) assert.equal(api.safeArtistReturn(value), null, value);
});

test('preexisting work section parsing retains default/fallback semantics without timeline contamination', () => {
  const value = '/artists/meovv?section=works&member=bad&queue=unknown&format=unknown&q=' + 'x'.repeat(220);
  const route = api.artistRoute(value);
  assert.equal(route.section, 'works'); assert.equal(route.member, null); assert.equal(route.queue, 'all');
  assert.equal(route.format, 'all'); assert.equal(route.search.length, 200); assert.equal(route.timeline, null);
  const written = api.artistRouteUrl(route, '/artists/meovv');
  assert.equal(params(written).get('q').length, 200); assert.ok(api.safeArtistReturn(written));
  assert.equal(params(written).has('member'), false); assert.equal(params(written).has('queue'), false);
});
