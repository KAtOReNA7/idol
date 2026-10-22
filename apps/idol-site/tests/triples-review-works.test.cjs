'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const root = path.resolve(__dirname, '..');
// Works both in the standalone overlay and after copying it into the host tree.
const base = process.env.TRIPLES_REVIEW_BASE || (fs.existsSync(path.join(root, 'node_modules/esbuild')) ? root : path.resolve(root, '../idol-day19-restored'));
const esbuild = require(path.join(base, 'node_modules/esbuild'));
const source = process.env.TRIPLES_REVIEW_SOURCE || path.resolve(root, '../astra-triples-v2-intake/merged-preview');
const loaded = esbuild.build({
  entryPoints: [path.join(__dirname, 'fixtures/triples-review-works-harness.tsx')],
  bundle: true, write: false, platform: 'node', format: 'cjs', jsx: 'automatic',
  nodePaths: [path.join(base, 'node_modules')],
  alias: {
    '@/components/design-review/triples-visual-works': path.join(root, 'components/design-review/triples-visual-works.tsx'),
    '@/lib/idol/design-review/triples-visual-model': path.join(root, 'lib/idol/design-review/triples-visual-model.ts'),
    '@': base,
  },
  plugins: [{name: 'read-only-host-fallback', setup(build) {
    build.onResolve({filter: /^\.\.?\//}, args => {
      if (!args.importer.startsWith(root + path.sep) || base === root) return;
      const candidate = path.resolve(path.dirname(args.importer), args.path);
      if (!candidate.startsWith(root + path.sep)) return;
      for (const extension of ['', '.ts', '.tsx', '.json', '/index.ts']) {
        if (fs.existsSync(candidate + extension)) return;
        const host = base + candidate.slice(root.length) + extension;
        if (fs.existsSync(host)) return {path: host};
      }
    });
  }}],
}).then(result => {
  const compiled = new Module(path.join(root, 'tests/.triples-review-works-memory.cjs'), module);
  compiled.paths = Module._nodeModulePaths(base);
  compiled._compile(result.outputFiles[0].text, path.join(root, 'tests/.triples-review-works-memory.cjs'));
  return compiled.exports;
});
function links(html) {return [...html.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map(match => match[1].replace(/&amp;/g, '&'));}
function member(id, sNumber) {return {id, sNumber, name: `Member ${sNumber}`, stageName: `Member ${sNumber}`, image: null, sourceUrl: null, member: {}};}
function runtimeCatalog(h, item) {
  const group = h.identities.groups.triples;
  const mapping = group.media.find(row => row.key === item.key && row.kind === item.kind);
  assert(mapping?.workId && mapping.videoId && mapping.url, 'Test media must have an exact production identity mapping');
  const work = {id: mapping.workId, groupIds: [group.groupId], url: item.kind === 'mv' ? mapping.url : '', stage: item.kind === 'stage' ? {url: mapping.url, videoId: mapping.videoId, scoreBinding: null} : null};
  return {scope: {type: 'artist', groupId: group.groupId}, groups: [{id: group.groupId}], members: [], works: [work]};
}

test('catalogue uses canonical counts, class hierarchy, and valid review links', async () => {
  const h = await loaded;
  const html = h.renderCatalogue(h.readTriplesReviewRoute('/design-review/triples-v2?section=works&sort=oldest'));
  assert.equal((html.match(/class="release-tile"/g) || []).length, h.triplesReviewReleases.length);
  for (const name of ['works-page page-shell', 'works-types', 'works-layout', 'works-index', 'works-main', 'works-feature', 'works-feature-copy', 'works-catalogue', 'release-grid works-catalogue-grid']) assert(html.includes(`class="${name}"`), name);
  for (const href of links(html)) assert(h.canonicalReviewUrl(href), href);
  assert(!html.includes('detail-record-actions'));
});

test('tabs retain query, unit, and sort but clear participants for MV and stage', async () => {
  const h = await loaded;
  const participant = h.triplesReviewReleases.find(row => row.participationStatus.startsWith('official_') && row.participantIds.length).participantIds[0];
  const route = h.readTriplesReviewRoute(`/design-review/triples-v2?section=works&q=Girls&unit=lovelution&participant=${participant}&sort=oldest`);
  assert(route.valid);
  const hrefs = links(h.renderCatalogue(route));
  for (const format of ['mv', 'stage']) {
    const href = hrefs.find(value => new URL(value, 'https://review.invalid').searchParams.get('format') === format);
    assert(href);
    const params = new URL(href, 'https://review.invalid').searchParams;
    assert.equal(params.get('q'), 'Girls');
    assert.equal(params.get('unit'), 'lovelution');
    assert.equal(params.get('sort'), 'oldest');
    assert(!params.has('participant'));
    assert(h.canonicalReviewUrl(href));
  }
});

test('feature sequence uses only verified IDs matched to supplied runtime S numbers', async () => {
  const h = await loaded;
  const feature = h.triplesReviewReleases.find(row => row.key === 'assemble24');
  assert(feature.participationStatus.startsWith('official_'));
  const members = [member(feature.participantIds[0], 17), member(feature.participantIds[1], 2), member('foreign-member', 24)];
  const route = h.readTriplesReviewRoute('/design-review/triples-v2?section=works');
  assert.match(h.renderCatalogue(route, members), /class="sequence-rail" data-sequence="2,17"/);
  assert(!h.renderCatalogue(route, [member('foreign-member', 24)]).includes('sequence-rail'));
  assert(!h.renderCatalogue(h.readTriplesReviewRoute('/design-review/triples-v2?section=works&format=mv'), members).includes('sequence-rail'));
});

test('release roster requires official verification and never becomes a media cast', async () => {
  const h = await loaded;
  const release = h.triplesReviewReleases.find(row => row.participationStatus.startsWith('official_') && row.participantIds.length);
  const members = release.participantIds.map((id, index) => member(id, index + 1));
  assert(h.renderDetail(release, {members}).includes('detail-roster'));
  assert(!h.renderDetail({...release, participationStatus: 'not_verified'}, {members}).includes('detail-roster'));
  for (const media of [h.triplesReviewVideos[0], h.triplesReviewStages[0]]) {
    assert(!h.renderDetail({...media, participantIds: release.participantIds, participationStatus: 'official_verified'}, {members}).includes('detail-roster'));
  }
});

test('MV and stage actions require exact runtime source/work binding and reject ambiguity', async () => {
  const h = await loaded;
  for (const item of [h.triplesReviewVideos[0], h.triplesReviewStages[0]]) {
    const catalog = runtimeCatalog(h, item);
    assert(h.renderDetail(item, {catalog}).includes('detail-record-actions'), item.key);
    const unbound = h.renderDetail(item);
    assert(!unbound.includes('detail-record-actions'));
    assert(unbound.includes('noopener noreferrer'));
    assert(!h.renderDetail({...item, officialUrl: 'https://www.youtube.com/watch?v=aaaaaaaaaaa'}, {catalog}).includes('detail-record-actions'));
    assert(!h.renderDetail(item, {catalog: {...catalog, works: [...catalog.works, {...catalog.works[0], id: 'duplicate'}]}}).includes('detail-record-actions'));
    assert(!h.renderDetail(item, {catalog: {...catalog, scope: {type: 'artist', groupId: 'foreign'}}}).includes('detail-record-actions'));
  }
});

test('nested detail links remain canonical and drop release-only participant on media', async () => {
  const h = await loaded;
  const release = h.triplesReviewReleases.find(row => row.participationStatus.startsWith('official_') && row.participantIds.length && h.triplesReviewVideos.some(video => video.releaseKey === row.key));
  const route = h.readTriplesReviewRoute(`/design-review/triples-v2?section=works&q=Girls&participant=${release.participantIds[0]}&sort=oldest&release=${release.key}`);
  assert(route.valid);
  const html = h.renderDetail(release, {route});
  for (const href of links(html).filter(href => href.startsWith('/'))) {
    assert(h.canonicalReviewUrl(href), href);
    const params = new URL(href, 'https://review.invalid').searchParams;
    if (params.has('media')) {
      assert(!params.has('participant'));
      assert.equal(params.get('q'), 'Girls');
      assert.equal(params.get('sort'), 'oldest');
    }
  }
});

test('production title helper changes presentation only, preserving stored public titles and keys', async () => {
  const h = await loaded;
  const before = JSON.stringify(h.triplesReviewVideos);
  const wrapped = h.triplesReviewVideos.filter(row => /^tripleS\(/.test(row.title));
  assert(wrapped.length > 0);
  const html = h.renderCatalogue(h.readTriplesReviewRoute('/design-review/triples-v2?section=works&format=mv'));
  for (const item of wrapped) {
    assert.notEqual(h.triplesPublicTitle(item), item.title);
    assert(html.includes(`data-video-key="${item.key}"`));
    const detail = h.renderDetail(item);
    assert(!detail.includes('Official MV'));
    assert(detail.includes(h.triplesPublicTitle(item).replace(/&/g, '&amp;')));
  }
  assert.equal(JSON.stringify(h.triplesReviewVideos), before);
});

test('unsafe external URLs produce no source link or fabricated media action', async () => {
  const h = await loaded;
  const html = h.renderDetail({...h.triplesReviewVideos[0], officialUrl: 'javascript:alert(1)', sourceUrl: 'https://user:password@example.com/'});
  assert(!html.includes('detail-primary-link'));
  assert(!html.includes('detail-record-actions'));
  assert(!html.includes('javascript:'));
});

test('source adapter places its rail on the feature and source public titles remain compatible', {skip: !fs.existsSync(path.join(source, 'triples-visual.js'))}, async () => {
  const h = await loaded;
  const adapter = fs.readFileSync(path.join(source, 'triples-visual.js'), 'utf8');
  assert(adapter.includes("rail(feature.querySelector('.works-feature-copy')"));
  assert(!adapter.includes("rail(detail.querySelector('.detail-identity')"));
  const fixture = JSON.parse(fs.readFileSync(path.join(source, 'triples-public-fixture.json'), 'utf8'));
  for (const item of h.triplesReviewVideos) assert.equal(fixture.musicVideos.find(row => row.key === item.key)?.title, item.title);
  const component = fs.readFileSync(path.join(root, 'components/design-review/triples-visual-works.tsx'), 'utf8');
  assert(!/dangerouslySetInnerHTML|TripleSViews|triples-public-fixture|fetch\(/.test(component));
});
