const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const imageSize = require('next/dist/compiled/image-size');
const {parse} = require('next/dist/compiled/node-html-parser');
const renderRelease = require('./helpers/render-artist-release.cjs');
const {registry, renderArtist} = require('./fixtures/current-artist-pages.cjs');
const load = require('./helpers/public-artist-loader.cjs');
const {artistReturnLabel, safeArtistReturn} = load('lib/idol/artist-navigation.ts');
const content = require('../data/itzy-artist.json');

const artist = registry.find(item => item.slug === 'itzy');
const albumId = 'source-itzy-r4uyqzku';
const release = content.releases.find(item => item.id === albumId);
const albumPath = '/artists/itzy/releases/kill-my-doubt';
const coverPath = '/artist/itzy/kill-my-doubt/cover-480.webp';
const sourceSet = coverPath + ' 480w, /artist/itzy/kill-my-doubt/cover-720.webp 720w';

test('the existing ITZY directory card opens the album locally and the other covers retain their destinations', async () => {
  const page = parse(await renderArtist(artist, {section:'records'}));
  const grid = page.querySelector('.iz-discography');
  const covers = grid.querySelectorAll('a');
  assert.deepEqual(covers.map(card => card.querySelector('h3').text), content.releases.map(item => item.title));
  for (const [index,item] of content.releases.entries()) {
    const card = covers[index];
    if (item.id === albumId) {
      assert.equal(card.id, albumId);
      assert.equal(card.getAttribute('href'), albumPath);
      assert.equal(card.getAttribute('target'), undefined);
      assert.equal(card.querySelector('img').getAttribute('src'), coverPath);
      assert.equal(card.querySelector('img').getAttribute('srcset'), sourceSet);
      assert.match(card.text, /2023-07-31/);
    } else {
      assert.equal(card.getAttribute('href'), item.sourceUrl, item.title);
      assert.equal(card.getAttribute('target'), '_blank', item.title);
      assert.equal(card.querySelector('img').getAttribute('src'), item.image, item.title);
    }
  }
});

test('the KILL MY DOUBT document has the published tracks, exact MV and return links, and complete original', () => {
  const album = renderRelease('app/artists/itzy/releases/kill-my-doubt/page.tsx');
  assert.equal(album.querySelector('h1').text, 'KILL MY DOUBT');
  assert.equal(album.querySelector('.kmd-heading time').getAttribute('datetime'), '2023-07-31');
  assert.equal(album.querySelector('nav a:last-child').getAttribute('href'), '/artists/itzy?section=records#' + albumId);
  assert.equal(album.querySelector('.kmd-source').getAttribute('href'), release.sourceUrl);
  const tracks = album.querySelectorAll('ol li');
  assert.deepEqual(tracks.map(row => row.querySelector('.kmd-track-name').firstChild.text),
    ['BET ON ME','CAKE','None of My Business','Bratty (나쁜 애)','Psychic Lover','Kill Shot']);
  assert.deepEqual(tracks.flatMap((row, i) => row.querySelector('small') ? [i] : []), [1]);
  const links = album.querySelectorAll('ol a[data-member-work-trigger]');
  const originals = ['recvxyOz5XJvBE','recvxyOz5X64xs','recvxyOz5Xk9CH'];
  assert.deepEqual(links.map(link => link.getAttribute('data-member-work-trigger')), originals);
  for (const [i,link] of links.entries()) {
    const work = new URL(link.getAttribute('href'), 'https://site.invalid');
    const returnTo = albumPath + '#track-' + originals[i];
    assert.equal(work.searchParams.get('work'), originals[i]);
    assert.equal(work.searchParams.get('returnTo'), returnTo);
    assert.equal(safeArtistReturn(returnTo), returnTo);
    assert.equal(artistReturnLabel(returnTo), '《KILL MY DOUBT》');
  }
  assert.equal(safeArtistReturn(albumPath + '#track-recvxyOz5X0dv0'), null);
  assert.deepEqual(album.querySelectorAll('figure a[data-original-photo]').map(link => link.getAttribute('href')),
    [release.image, release.image]);
  assert.equal(album.querySelector('figure img').getAttribute('srcset'), sourceSet);
  for (const [side,img] of [[480,coverPath],[720,'/artist/itzy/kill-my-doubt/cover-720.webp'],[1200,release.image]]) {
    const {width,height} = imageSize(fs.readFileSync('public' + img));
    assert.deepEqual([width,height], [side,side]);
  }
});
