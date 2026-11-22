const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const {parse} = require('next/dist/compiled/node-html-parser');
const renderRelease = require('./helpers/render-artist-release.cjs');
const {artistCatalog,registry,renderArtist} = require('./fixtures/current-artist-pages.cjs');
const load = require('./helpers/public-artist-loader.cjs');
const {artistReturnLabel,safeArtistReturn} = load('lib/idol/artist-navigation.ts');
const {readRoute} = load('lib/idol/journey.ts');
const content = require('../data/xg-artist.json');

const path = '/artists/xg/releases/new-dna';
const xg = registry.find(group => group.slug === 'xg');
const release = renderRelease('app/artists/xg/releases/new-dna/page.tsx');
const otherAlbum = renderRelease('app/artists/aespa/releases/armageddon/page.tsx');
const originals = [
  ['GRL GVNG','recvxDMFHN9v3k','Xiai4BRzZpU'],
  ['TGIF','recvxDMFHNk8MX','IPxDgf-g9Kw'],
  ['NEW DANCE','recvxDMFHNLljT','cQTo9O85Zro'],
  ['PUPPET SHOW','recvxDMFHNonmf','VFeRPM7Sm6c'],
];

test('the XG directory and exact cover return retain every other album, film and solo release link', async () => {
  const records = [...content.releases,...content.memberSoloReleases,...content.videoReleases];
  const directory = parse(await renderArtist(xg,{section:'records'}));
  const cards = directory.querySelectorAll('.nx-releases a');
  assert.equal(cards.length,records.length);
  for (const item of records) {
    const card = cards.find(card => card.querySelector('h3').text === item.title);
    const matched = item.id === 'xg-directory-20';
    assert.equal(card.getAttribute('href'),matched ? path : item.sourceUrl,item.title);
    assert.equal(card.getAttribute('target'),matched ? undefined : '_blank',item.title);
    if (matched) {
      assert.equal(card.id,item.id);
      assert.equal(card.getAttribute('data-member-work-trigger'),'release:'+item.id);
      assert.equal(release.querySelector('nav a:last-child').getAttribute('href'),'/artists/xg?section=records#'+item.id);
    }
  }
});

test('server HTML includes the six tracks, date, full X-edition package and both source links', () => {
  assert.equal(release.querySelector('h1').text,'NEW DNA');
  assert.equal(release.querySelector('time').getAttribute('datetime'),'2023-09-27');
  assert.deepEqual(release.querySelectorAll('.xg-dna-name').map(n => n.text),['HESONOO','X-GENE',...originals.map(data=>data[0])]);
  assert.equal(release.querySelectorAll('ol a').length,4);
  const cover = release.querySelector('figure img');
  assert.equal(cover.getAttribute('src'),'/artist/xg/cover-newdna.webp');
  assert.equal(cover.getAttribute('width'),'640');
  assert.equal(cover.getAttribute('height'),'641');
  assert.equal(release.querySelector('figcaption').text,'X 版官方包装');
  assert.deepEqual(release.querySelectorAll('.xg-dna-sources a').map(a=>a.getAttribute('href')),[
    'https://xgalx.com/en/xg/discography/','https://xg-newdna.com/en/',
  ]);
});

test('only the August NEW DANCE is used by its album and both editions remain in the song search', async () => {
  const works=artistCatalog(xg).works;
  const links=release.querySelectorAll('ol a');
  for(const [index,[name,id,video]] of originals.entries()){
    const link=links[index], route=readRoute(link.getAttribute('href'));
    assert.equal(link.id,'track-'+id);
    assert.equal(link.getAttribute('data-member-work-trigger'),id);
    assert.equal(link.getAttribute('target'),undefined);
    assert.deepEqual([route.work,route.video,route.artistReturn],[id,'mv',path+'#'+link.id]);
    assert.equal(artistReturnLabel(route.artistReturn),'《NEW DNA》');
    const work=works.find(w=>w.id===id);
    assert.deepEqual([work.song,work.version,new URL(work.url).searchParams.get('v')],[name,'原版',video]);
  }
  const alternate=works.find(w=>w.id==='recvxDMFHN1Y9G');
  assert.deepEqual([alternate.releaseDate,alternate.version,new URL(alternate.url).searchParams.get('v')],['2023-10-06','Multiverse独立版','LAZlfCjXPb0']);
  const search=parse(await renderArtist(xg,{section:'works',q:'NEW DANCE'}));
  const found=search.querySelectorAll('.nx-work>a').map(a=>readRoute(a.getAttribute('href')).work);
  assert.deepEqual(new Set(found),new Set([alternate.id,originals[2][1]]));
});

test('only the seven exact, edition-specific track fragments can travel through the work route', () => {
  for (const album of [release,otherAlbum]) {
    const base=album.querySelector('ol').getAttribute('data-release-tracks');
    for (const track of album.querySelectorAll('ol a')) {
      assert.equal(safeArtistReturn(base+'#'+track.id),base+'#'+track.id);
      const another = base === path ? '/artists/aespa/releases/armageddon' : path;
      assert.equal(safeArtistReturn(another+'#'+track.id),null);
      assert.equal(safeArtistReturn('/artists/ive#'+track.id),null);
    }
  }
  for (const target of [path+'#track',path+'#track-recvxDMFHN1Y9G',path+'?q=1#track-recvxDMFHNLljT','https://example.org'+path+'#track-recvxDMFHNLljT']) {
    assert.equal(safeArtistReturn(target),null,target);
  }
});

function firstHtml(album,anchor) {
  const list = album.querySelector('ol');
  const origin='https://stage.example';
  const location=new URL(list.getAttribute('data-release-tracks'),origin);
  const listeners=new Map();
  const events={addEventListener:(name,fn)=>listeners.set(name,fn)};
  const trackList={dataset:{releaseTracks:location.pathname}};
  let focused=0,scrolled=0;
  const link={
    id:anchor.id, dataset:{memberWorkTrigger:anchor.getAttribute('data-member-work-trigger')},
    href:new URL(anchor.getAttribute('href'),origin).href, referrerPolicy:anchor.getAttribute('referrerpolicy'),
    closest:selector=>selector.startsWith('ol')?trackList:link,
    hasAttribute:key=>key==='data-member-work-trigger',
    focus:()=>{focused++;},scrollIntoView:()=>{scrolled++;},
  };
  const history={state:null,replaceState:(_a,_b,url)=>{location.href=new URL(url,origin).href;}};
  const document={...events,getElementById:id=>id===link.id?link:null};
  const script=album.querySelector('script').rawText;
  vm.runInNewContext(script,{URL,location,document,history,window:events});
  return {location,link,history,emit:(key,event)=>listeners.get(key)(event),get focused(){return focused;},get scrolled(){return scrolled;}};
}

test('before React, native pointer and Enter activation both preserve the exact track across a return', () => {
  for(const album of [release,otherAlbum]) for(const anchor of album.querySelectorAll('ol a')) for(const detail of [1,0]) {
    const h=firstHtml(album,anchor);
    h.emit('DOMContentLoaded');
    assert.equal(h.focused,0);
    h.emit('click',{button:0,detail,target:h.link});
    assert.equal(h.location.hash,'#'+h.link.id);
    assert.equal(h.link.referrerPolicy,'same-origin');
    h.emit('pageshow',{persisted:true});
    assert.equal(h.focused,1);
    assert.equal(h.scrolled,1);
  }
});

test('modified clicks keep their current position, and refused history writes retain the direct track return', () => {
  const anchor=release.querySelector('ol a');
  const h=firstHtml(release,anchor);
  h.emit('click',{button:0,ctrlKey:true,target:h.link});
  assert.equal(h.location.hash,'');
  h.history.replaceState=()=>{throw Error('unavailable history');};
  h.emit('click',{button:0,target:h.link});
  assert.equal(h.location.hash,'');
  assert.equal(h.link.referrerPolicy,'no-referrer');
  const direct=new URL(h.link.href).searchParams.get('returnTo');
  h.location.href=new URL(direct,h.location.origin).href;
  h.emit('DOMContentLoaded');
  assert.equal(h.focused,1);
});
