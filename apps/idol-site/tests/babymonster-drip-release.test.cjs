const test = require('node:test');
const assert = require('node:assert/strict');
const {parse} = require('next/dist/compiled/node-html-parser');
const {withQuery} = require('./helpers/render-artist-release.cjs');
const {registry, renderArtist} = require('./fixtures/current-artist-pages.cjs');
const load = require('./helpers/public-artist-loader.cjs');
const official = require('../data/babymonster-artist.json');
const {artistReturnLabel, safeArtistReturn} = load('lib/idol/artist-navigation.ts');
const {readRoute} = load('lib/idol/journey.ts');

const home = '/artists/babymonster';
const release = home + '/releases/drip';
const photo = '/artist/babymonster/cover-drip';
const card = 'babymonster-release-drip';
const originals = [
  ['CLIK CLAK','rec28ldfRTrALg','o0oW3lPoOXM','官方MV'],
  ['DRIP','rec28ldfRTrAPA','Zp-Jhuhq0bQ','官方MV'],
  ['Really Like You','rec28ldfRTrAYJ','XShaIZs7J7M','官方MV'],
  ['BILLIONAIRE','rec28ldfRTrLku','Gz_yRl6703c','特别表演视频'],
  ['Love In My Heart','rec28ldfRTrAUD','1kXLsrun51s','官方MV'],
  ['FOREVER','rec28ldfRTrAGW','eJCHKjt0MPw','官方MV'],
];

test('DRIP uses nine official tracks and links only the six corresponding videos', async () => {
  for (const overview of [false,true]) {
    const album = await withQuery('app/artists/babymonster/releases/drip/page.tsx', overview ? {from:'overview'} : {});
    const origin = overview ? release + '?from=overview' : release;
    assert.equal(album.querySelector('h1').text,'DRIP');
    assert.equal(album.querySelector('time').getAttribute('datetime'),'2024-11-01');
    assert.equal(album.querySelector('figure img').getAttribute('src'),photo+'.webp');
    const zoom = album.querySelector('figure a[data-original-photo]');
    assert.equal(zoom.getAttribute('href'),photo+'.jpg');
    assert.equal(zoom.getAttribute('aria-haspopup'),'dialog');
    assert.equal(album.querySelector('.bm-drip-source').getAttribute('href'),'https://www.ygfamily.com/en/artists/babymonster/discography/1615');
    assert.equal(album.querySelector('nav a:last-child').getAttribute('href'),home+(overview?'':'?section=records')+'#'+card);
    const tracks = album.querySelectorAll('ol li .bm-drip-song');
    assert.deepEqual(tracks.map(row=>row.firstChild.text),[
      'CLIK CLAK','DRIP','Love, Maybe','Really Like You','BILLIONAIRE','Love In My Heart',
      'Woke Up In Tokyo (RUKA & ASA)','FOREVER','BATTER UP (Remix)',
    ]);
    assert.deepEqual(tracks.flatMap((row,i)=>row.querySelector('small')?[i+1]:[]),[1,2]);
    const links = album.querySelectorAll('ol a');
    assert.equal(links.length,originals.length);
    for (const [i,[title,id,video,type]] of originals.entries()) {
      const expectedBack = origin+'#track-'+id;
      const result = readRoute(links[i].getAttribute('href'));
      assert.deepEqual([result.work,result.video,result.artistReturn],[id,'mv',expectedBack]);
      assert.equal(links[i].id,'track-'+id);
      assert.equal(links[i].getAttribute('aria-label'),title+(type==='官方MV'?' · 查看 MV':' · 看表演视频'));
      assert.equal(artistReturnLabel(expectedBack),'《DRIP》');
      const work = official.directory.works.find(item=>item.id===id);
      assert.deepEqual([work.song,work.videoId,work.videoType],[title,video,type]);
    }
    assert.equal(safeArtistReturn(origin+'#track-rec28ldfRTrArg'),null);
  }
});

test('BABYMONSTER release cards open the matching local DRIP origin', async () => {
  const artist = registry.find(item=>item.slug==='babymonster');
  for (const overview of [true,false]) {
    const page = parse(await renderArtist(artist, overview ? {} : {section:'records'}));
    const drip = page.querySelector('#'+card);
    assert.ok(drip);
    assert.equal(drip.getAttribute('href'),release+(overview?'?from=overview':''));
    assert.equal(drip.getAttribute('target'),undefined);
    assert.equal(drip.getAttribute('data-member-work-trigger'),'release:drip');
    const other = page.querySelectorAll('.as-releases a').filter(link=>link.id!==card);
    assert.ok(other.length>0);
    assert.ok(other.every(link=>link.getAttribute('target')==='_blank'));
  }
});
