const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const {buildSync} = require('esbuild');
const {parse} = require('next/dist/compiled/node-html-parser');
const {artistCatalog, registry, renderArtist} = require('./fixtures/current-artist-pages.cjs');
const load = require('./helpers/public-artist-loader.cjs');
const records = require('../data/aespa-artist.json').releases;
const {safeArtistReturn, artistReturnLabel} = load('lib/idol/artist-navigation.ts');
const {readRoute} = load('lib/idol/journey.ts');

const releasePath = '/artists/aespa/releases/armageddon';
const releaseId = 'aespa-release-armageddon';
const aespa = registry.find(group => group.slug === 'aespa');
const tracks = ['Supernova', 'Armageddon', 'Set The Tone', 'Mine', 'Licorice', 'BAHAMA', 'Long Chat (#♥)', 'Prologue', 'Live My Life', 'Melody'];
const originals = [
  ['Supernova', 'recvxyHuKM4BvC', 'phuiiNCxRMg'],
  ['Armageddon', 'recvxyHuKMKPod', 'nFYwcndNuOY'],
  ['Live My Life', 'recvxyHuKMKGBh', 'YEA1ROHi0Eg'],
];
const build = buildSync({
  entryPoints:['app/artists/aespa/releases/armageddon/page.tsx'], bundle:true, write:false,
  platform:'node', format:'cjs', jsx:'automatic', external:['react','react/*','next/navigation'],
  loader:{'.css':'empty'}, logLevel:'silent',
});
const compiled = new Module(__filename);
compiled.require = require;
compiled._compile(build.outputFiles[0].text, __filename);
const release = parse(renderToStaticMarkup(React.createElement(compiled.exports.default)));

test('only the matched aespa cover opens a same-tab album and its return lands on that exact card', async () => {
  const page = parse(await renderArtist(aespa, {section:'records'}));
  const cards = page.querySelectorAll('.nx-releases a');
  assert.equal(cards.length, records.length);
  for (const item of records) {
    const card = cards.find(node => node.querySelector('h3').text === item.title);
    assert.ok(card, item.title);
    if (item.id === releaseId) {
      assert.equal(card.getAttribute('href'), releasePath);
      assert.equal(card.getAttribute('target'), undefined);
      assert.equal(card.getAttribute('id'), item.id);
      assert.equal(card.getAttribute('data-member-work-trigger'), 'release:'+item.id);
      assert.equal(release.querySelector('.arm-back').getAttribute('href'), '/artists/aespa?section=records#'+item.id);
    } else {
      assert.equal(card.getAttribute('href'), item.sourceUrl, item.title);
      assert.equal(card.getAttribute('target'), '_blank', item.title);
    }
  }
  const xg = registry.find(group => group.slug === 'xg');
  const xgPage = parse(await renderArtist(xg, {section:'records'}));
  const xgCard = xgPage.querySelectorAll('.nx-releases a').find(n => n.querySelector('h3').text === 'NEW DNA');
  assert.equal(xgCard.getAttribute('href'), 'https://xgalx.com/en/xg/discography/');
  assert.equal(xgCard.getAttribute('target'), '_blank');
});

test('album server HTML exposes the complete official order, double lead tracks, cover and sources', () => {
  assert.equal(release.querySelector('h1').text, 'Armageddon');
  assert.equal(release.querySelector('time').getAttribute('datetime'), '2024-05-27');
  assert.match(release.querySelector('.arm-heading').text, /首张正规专辑/);
  const rows = release.querySelectorAll('ol li');
  assert.deepEqual(rows.map(row => row.querySelector('.arm-track-name').firstChild.text), tracks);
  assert.deepEqual(rows.filter(row => row.querySelector('small')).map(row => row.querySelector('.arm-track-name').firstChild.text), tracks.slice(0,2));
  const cover = release.querySelector('figure img');
  assert.equal(cover.getAttribute('src'), '/artist/aespa/cover-armageddon.webp');
  assert.equal(cover.getAttribute('width'), '640');
  assert.equal(cover.getAttribute('height'), '640');
  assert.deepEqual(release.querySelectorAll('figcaption a').map(a => a.getAttribute('href')), [
    'https://aespa-official.jp/discography/armageddon/', 'https://sp.wmg.jp/aespa_Armageddon/',
  ]);
  assert.equal(release.querySelectorAll('input, textarea, iframe').length, 0);
});

test('the three watchable rows lead to the original album videos and preserve a round trip', () => {
  const links = release.querySelectorAll('ol li a');
  assert.equal(links.length, originals.length);
  const catalog = artistCatalog(aespa);
  for (const [i, [title, id, video]] of originals.entries()) {
    const link = links[i];
    const route = readRoute(link.getAttribute('href'));
    assert.equal(link.querySelector('.arm-track-name').firstChild.text, title);
    assert.equal(link.getAttribute('target'), undefined);
    assert.equal(link.getAttribute('data-member-work-trigger'), id);
    assert.equal(route.work, id);
    assert.equal(route.nav, 'works');
    assert.equal(route.video, 'mv');
    assert.equal(route.artistReturn, releasePath);
    const work = catalog.works.find(work => work.id === route.work);
    assert.equal(work.song, title);
    assert.equal(work.videoType, '官方MV');
    assert.equal(new URL(work.url).searchParams.get('v'), video);
  }
  assert.equal(artistReturnLabel(releasePath), '《Armageddon》');
});

test('only the published album path is accepted as a return destination', () => {
  assert.equal(safeArtistReturn(releasePath), releasePath);
  for (const path of [releasePath+'/', releasePath+'?q=1', releasePath+'#track', releasePath+'-remix',
    'https://example.com'+releasePath, '/artists/xg/releases/armageddon']) {
    assert.equal(safeArtistReturn(path), null, path);
  }
});
