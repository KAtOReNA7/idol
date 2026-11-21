const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {registry, nativeSlugs, artistCatalog, loadArtistTimeline, prepareTimelinePresentation} = require('./fixtures/current-artist-pages.cjs');
const heroes = require('./fixtures/approved-artist-heroes.json');
const delivery = require('../data/production-asset-delivery.json');
const recognition = require('../data/recognition-asset-delivery.json');
const restricted = require('../scripts/udtt-private-build-assets-manifest.json');
const root = path.resolve(__dirname, '..');
const byPath = new Map([...delivery.assets, ...recognition.assets].map(asset => [asset.path, asset]));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

for (const {slug, groupId} of registry) {
 test(`${slug} resolves the canonical timeline through its production loader`, async () => {
  const {input} = await loadArtistTimeline(slug);
  const document = require(`../data/artist-timelines/${slug}.json`);
  assert.deepEqual(input, document);
  assert.equal(input.groupId, groupId);
  assert.equal(input.slug, slug);
  const presentation = prepareTimelinePresentation(input, artistCatalog({groupId}), registry);
  assert.ok(['ready','empty','context-unavailable'].includes(presentation.state), JSON.stringify(presentation.issues));
  assert.deepEqual(presentation.timeline.events, document.events);
  for (const issue of presentation.identityIssues) {
   assert.ok(document.events.some(event => event.id === issue.eventId && event.reviewStatus === 'ready'));
  }
 });

 test(`${slug} preserves the delivery identity of its approved images`, () => {
  if (slug === 'udtt') {
   for (const asset of restricted.files) {
    const bytes = fs.readFileSync(path.join(root, 'public', asset.path));
    assert.equal(bytes.length, asset.bytes);
    assert.equal(hash(bytes), asset.sha256);
    assert.ok(![...byPath.values()].some(row => row.sha256 === asset.sha256 || row.path === asset.path));
   }
   return;
  }
  // The native resolver accepts only assets with explicit group and display identity.
  const assets = nativeSlugs.has(slug) ? require(`../data/${slug}-assets.json`) : [{url: heroes[slug], groupId}];
  assert.ok(assets.length);
  for (const asset of assets) {
   assert.equal(asset.groupId, groupId);
   const pin = byPath.get(asset.url);
   assert.ok(pin, asset.url);
   if (asset.sha256) assert.equal(asset.sha256, pin.sha256);
   const bytes = fs.readFileSync(path.join(root, 'public', asset.url));
   assert.equal(bytes.length, pin.bytes);
   assert.equal(hash(bytes), pin.sha256);
  }
 });
}

test('the published timeline schema retains its handoff digest and unknown routes are rejected', async () => {
 assert.equal(hash(fs.readFileSync(path.join(root, 'HANDOFF/timeline-event.schema.json'))),
  'f71721b2d445d1e04f659ce40d0bf42d4dc3a43a2b712c22acba405cfa7c80bc');
 assert.equal(registry.length, 51);
 assert.equal(Object.keys(heroes).length, 48);
 for (const slug of ['__proto__','unknown','']) await assert.rejects(loadArtistTimeline(slug));
});
