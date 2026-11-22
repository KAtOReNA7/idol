const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const imageSize = require('next/dist/compiled/image-size');
const {parse} = require('next/dist/compiled/node-html-parser');
const {withQuery} = require('./helpers/render-artist-release.cjs');
const {artistCatalog, registry, renderArtist} = require('./fixtures/current-artist-pages.cjs');
const load = require('./helpers/public-artist-loader.cjs');
const {artistReturnLabel,safeArtistReturn} = load('lib/idol/artist-navigation.ts');
const {readRoute} = load('lib/idol/journey.ts');
const content = require('../data/lesserafim-artist.json');

const artist = registry.find(item => item.slug === 'lesserafim');
const home = '/artists/lesserafim';
const detail = home+'/releases/easy';
const cardId = 'lesserafim-release-12';
const easy = content.releases.find(item => item.id === '12');
const render = (query={}) => withQuery('app/artists/lesserafim/releases/easy/page.tsx',query);

test('both existing catalog entries show the confirmed date and web preview, keeping their own return target', async () => {
  for (const overview of [true,false]) {
    const page = parse(await renderArtist(artist, overview ? {} : {section:'records'}));
    const cards = page.querySelectorAll('.lf-release-feature article a');
    const records = overview ? content.releases.filter((item,i)=>i<3 || content.featuredReleaseIds.includes(item.id)) : content.releases;
    assert.equal(cards.length, overview ? 6 : 11);
    assert.deepEqual(cards.map(card=>card.querySelector('h3').text), records.map(record=>record.title));
    for (const [index,item] of records.entries()) {
      const card = cards[index];
      if (item.id !== easy.id) {
        assert.equal(card.getAttribute('href'), item.sourceUrl, item.title);
        assert.equal(card.getAttribute('target'), '_blank', item.title);
        assert.equal(card.querySelector('img').getAttribute('src'),item.image,item.title);
        continue;
      }
      assert.equal(card.id,cardId);
      assert.equal(card.getAttribute('data-member-work-trigger'),'release:12');
      assert.equal(card.getAttribute('href'),overview ? detail+'?from=overview' : detail);
      assert.equal(card.getAttribute('target'),undefined);
      assert.match(card.text,/2024-02-19/);
      assert.equal(card.querySelector('img').getAttribute('src'),easy.imagePreview);
      assert.equal(card.querySelector('img').getAttribute('srcset'),easy.imagePreview+' 480w, '+easy.imagePreviewLarge+' 720w');
    }
    assert.match(page.text,/SOURCE MUSIC 韩国官网收录的 11 项发行/);
    assert.doesNotMatch(page.text,/暂不展示总计|待完整核验/);
    if (overview) {
      const items = page.querySelectorAll('.lf-work,.lf-album-cover');
      const firstCover = items.findIndex(item=>item.classNames.includes('lf-album-cover'));
      assert.ok(firstCover>0);
      assert.ok(items.slice(firstCover).every(item=>item.classNames.includes('lf-album-cover')));
    }
    const release = await render(overview ? {from:'overview'} : {});
    const back = release.querySelector('nav a:last-child');
    assert.equal(back.text,overview ? '返回首页专辑' : '返回发行目录');
    assert.equal(back.getAttribute('href'),home+(overview ? '' : '?section=records')+'#'+cardId);
  }
});

test('the first album HTML has the official logo, full five-track running order, lead, timings and release sources', async () => {
  const album = await render();
  const logo = album.querySelector('nav img');
  assert.equal(logo.getAttribute('alt'),'LE SSERAFIM');
  assert.equal(logo.getAttribute('src'),'/artist/lesserafim/identity/official-logo.png');
  assert.equal(album.querySelector('h1').text,'EASY');
  assert.equal(album.querySelector('header time').getAttribute('datetime'),'2024-02-19');
  assert.match(album.querySelector('.lf-easy-heading p').text,/第三张迷你专辑/);
  const tracks = album.querySelectorAll('ol li');
  assert.deepEqual(tracks.map(track=>track.querySelector('.lf-easy-song').firstChild.text),
    ['Good Bones','EASY','Swan Song','Smart','We got so much']);
  assert.deepEqual(tracks.map(track=>track.querySelector('time').text),['2:40','2:45','2:37','2:46','2:46']);
  assert.deepEqual(tracks.flatMap((track,i)=>track.querySelector('small') ? [i+1] : []),[2]);
  assert.equal(tracks[1].querySelector('small').text,'主打');
  const total = tracks.reduce((sum,track)=>{
    const [minutes,seconds] = track.querySelector('time').text.split(':').map(Number);
    return sum+minutes*60+seconds;
  },0);
  assert.equal(album.querySelector('.lf-easy-tracks header p').text,'5 首 · '+Math.floor(total/60)+':'+(total%60));
  assert.deepEqual(album.querySelectorAll('.lf-easy-sources a').map(link=>link.getAttribute('href')),
    ['https://www.sourcemusic.com/artist/discography/LE%20SSERAFIM/12','https://weverse.io/lesserafim/notice/17350']);
});

test('the two original-photo controls open the full 1024px cover while both responsive candidates use the whole smaller image', async () => {
  const album = await render();
  const cover = album.querySelector('figure img');
  assert.equal(cover.getAttribute('src'),easy.imagePreview);
  assert.equal(cover.getAttribute('srcset'),easy.imagePreview+' 480w, '+easy.imagePreviewLarge+' 720w');
  assert.ok(cover.getAttribute('sizes').includes('410px'));
  assert.equal(cover.getAttribute('alt'),'EASY · SOURCE MUSIC 官方发行封面');
  const triggers = album.querySelectorAll('figure a[data-original-photo]');
  assert.deepEqual(triggers.map(link=>[link.getAttribute('href'),link.getAttribute('aria-haspopup'),link.getAttribute('target')]),
    [[easy.image,'dialog',undefined],[easy.image,'dialog',undefined]]);
  assert.equal(triggers[1].text,'查看原图');
  assert.equal(album.querySelector('img[src="'+easy.image+'"]'),null);
  for (const [url,width,type] of [[easy.image,1024,'png'],[easy.imagePreview,480,'webp'],[easy.imagePreviewLarge,720,'webp']]) {
    const bytes = fs.readFileSync(path.join('public',url));
    const size = imageSize(bytes);
    assert.deepEqual([size.width,size.height,size.type],[width,width,type]);
    if (width !== 1024) assert.ok(bytes.length < 85_000);
  }
});

test('both origins bind only the Korean originals and all invalid origin, member, or other edition fragments are discarded', async () => {
  const originals = [['EASY','recvxyOz5Xfden','bNKXxwOQYB8'],['Smart','recvxyOz5X0dv0','KNexS61fjus']];
  const works = artistCatalog(artist).works;
  for (const route of [detail,detail+'?from=overview']) {
    const album = await render(route===detail ? {} : {from:'overview'});
    const links = album.querySelectorAll('ol a');
    assert.equal(links.length,2);
    assert.equal(album.querySelector('ol').getAttribute('data-release-tracks'),route);
    assert.equal(safeArtistReturn(route),route);
    for (const [index,[title,id,video]] of originals.entries()) {
      const link = links[index];
      const destination = readRoute(link.getAttribute('href'));
      const from = route+'#track-'+id;
      const work = works.find(item=>item.id===id);
      assert.deepEqual([link.id,link.getAttribute('data-member-work-trigger'),link.getAttribute('target'),link.getAttribute('referrerpolicy')],
        ['track-'+id,id,undefined,'no-referrer']);
      assert.deepEqual([destination.work,destination.video,destination.artistReturn],[id,'mv',from]);
      assert.deepEqual([work.song,work.version,new URL(work.url).searchParams.get('v')],[title,'韩文原版',video]);
      assert.equal(artistReturnLabel(from),'《EASY》');
      assert.equal(safeArtistReturn('/artists/aespa/releases/armageddon#track-'+id),null);
    }
  }
  for (const invalid of [detail+'?from=members',detail+'?from=overview&extra=1',detail+'#track-recvxDMFHNLljT',
    detail+'?from=overview#track-recvxDMFHNLljT','https://outside.example'+detail+'#track-recvxyOz5Xfden']) {
    assert.equal(safeArtistReturn(invalid),null,invalid);
  }
  assert.equal((await render({from:'members'})).querySelector('nav a:last-child').getAttribute('href'),home+'?section=records#'+cardId);
});
