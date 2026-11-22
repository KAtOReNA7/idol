const test = require('node:test');
const assert = require('node:assert/strict');
const {parse} = require('next/dist/compiled/node-html-parser');
const {registry, renderArtist, artistCatalog} = require('./fixtures/current-artist-pages.cjs');
const selectors = require('./fixtures/artist-media-order.cjs');
const {artistJourneys} = require('./fixtures/artist-journey-routes.cjs');
const load = require('./helpers/public-artist-loader.cjs');
const {safeArtistReturn} = load('lib/idol/artist-navigation.ts');
const {artistCollection} = load('lib/idol/artist-preview.ts');

const slugs = ['adya','witchx','geenius','oddyouth','tracer','spia','youngposse','bewave','candyshop','genblue'];
const formats = ['all','mv','stage','release'];

for (const [slug,title,count] of [['rescene','DISCOGRAPHY',10],['madein','VIDEO',8],['triples','Movie',25]]) {
  test(slug+' shows each MV once before albums, with matching artwork and a usable filtered return', async () => {
    const group=registry.find(row=>row.slug===slug);
    const catalog=artistCatalog(group);
    const works=artistCollection(catalog,group.groupId).works;
    const page=async query=>parse(await renderArtist(group,query,catalog));
    const all=await page({section:'works'});
    assert.equal(all.querySelector('.sr-catalog-heading h1').text,title);
    assert.deepEqual(all.querySelectorAll('.sr-catalog-heading a').map(a=>a.getAttribute('href')),['#sr-videos','#sr-releases']);
    assert.deepEqual(all.querySelectorAll('.sr-film-library [role="group"] label').map(l=>l.childNodes[0].text),['搜索作品','观看记录','内容']);
    const cards=all.querySelectorAll('#sr-videos .sr-library-film');
    assert.equal(cards.length,count);
    assert.equal(all.querySelector('main .sr-work,main .sr-release'),cards[0]);
    assert.equal(new Set(cards.map(c=>c.querySelector('img').getAttribute('src'))).size,count);
    assert.equal(all.querySelectorAll('#sr-videos img').length,count);
    for(const [i,card] of cards.entries()){
      const primary=card.querySelector('.sr-library-film-link');
      assert.equal(primary.querySelector('h3').text,works[i].song||works[i].name);
      assert.ok(primary.querySelector('img').getAttribute('src').includes(new URL(works[i].url).searchParams.get('v')));
      assert.equal(localUrl(primary).searchParams.get('work'),works[i].id);
      assert.equal(card.querySelectorAll('a').filter(a=>localUrl(a).href===localUrl(primary).href).length,1);
    }
    const w=works.find(row=>row.stage);
    for(const format of ['mv','stage']){
      const query={section:'works',format,q:w.song};
      const filtered=await page(query);
      const target=localUrl(filtered.querySelector('[data-work-id="'+w.id+'"] > a'));
      assert.equal(target.searchParams.get('work'),w.id);
      assert.equal(target.searchParams.get('video'),format==='stage'?'stage':null);
      assertDestination(new URL(target.searchParams.get('returnTo'),target),group.path,query);
      assert.equal(filtered.querySelector('input[type=search]').getAttribute('value'),w.song);
      assert.equal(filtered.querySelector('a[href="#sr-releases"]'),null);
      if(format==='stage')assert.ok(filtered.querySelector('[data-artist-stage-card] .stage-directory-credit').text.includes(w.stage.publishedDate));
    }
    const empty=await page({section:'works',format:'stage',q:'no-such-record-6829'});
    assert.match(empty.text,/没有符合条件的舞台/);
    assert.match(empty.querySelector('[role=status]').text,/清除筛选/);
    assert.equal(empty.querySelector('.sr-library-film'),null);
  });
}

function localUrl(link) {
  assert.ok(link, 'Expected a visitor-facing link');
  return new URL(link.getAttribute('href'), 'https://site.invalid');
}

function assertDestination(url, path, fields) {
  assert.equal(url.origin, 'https://site.invalid');
  assert.equal(url.pathname, path);
  assert.deepEqual(Object.fromEntries(url.searchParams), fields);
  assert.ok(safeArtistReturn(url.pathname + url.search), url.pathname + url.search);
}

function firstReleaseLink(doc, selector) {
  const card = doc.querySelector(selector);
  return card.tagName === 'A' ? card : card.querySelector('a');
}

function linkByLabel(doc, pattern) {
  return doc.querySelectorAll('a').find(anchor => pattern.test(anchor.text.trim()));
}

for (const slug of slugs) {
  const group = registry.find(row => row.slug === slug);
  const scope = selectors.get(slug);
  const design = require('../data/' + slug + (slug === 'genblue' ? '-bluecut' : '-native-design') + '.json');
  const works = design.works || design.media;
  const page = async fields => parse(await renderArtist(group, fields));
  const countVideos = format => works.filter(work => (work.type || work.kind).toLowerCase() === format
    || (format === 'stage' && work.sharedStage)).length;

  test(slug + ' catalog tabs open four distinct lists and keep both legacy directories playable', async () => {
    for (const format of formats) {
      const fields = format === 'all' ? {section:'works'} : {section:'works', format};
      const doc = await page(fields);
      const tabs = doc.querySelectorAll('nav[aria-label="作品类型"] a');
      assert.deepEqual(tabs.map(a => a.text.trim().replace(/\s*\d+$/, '')), ['全部','MV','舞台','发行']);
      assert.deepEqual(tabs.filter(a => a.hasAttribute('aria-current')), [tabs[formats.indexOf(format)]]);
      tabs.forEach((a, i) => assertDestination(localUrl(a), group.path,
        i === 0 ? {section:'works'} : {section:'works', format:formats[i]}));
      const videos = doc.querySelectorAll(scope.worksVideo);
      const releases = doc.querySelectorAll(scope.worksRelease);
      assert.equal(videos.length, format === 'release' ? 0 : format === 'all' ? works.length : countVideos(format));
      assert.equal(releases.length, format === 'all' || format === 'release' ? design.releases.length : 0);
      if (format === 'all') {
        assert.equal(doc.querySelector(scope.worksVideo + ', ' + scope.worksRelease), videos[0]);
      }
      if (format === 'release') {
        assert.equal(doc.querySelector('[role="status"]').text.trim(), design.releases.length + ' 张发行');
        assert.doesNotMatch(doc.text, /没有符合条件的影像/);
      }
      const expected = artistJourneys(slug).find(entry => entry.url === group.path + '?' + new URLSearchParams(fields));
      assert.ok(expected, 'Missing visitor journey for ' + format);
      const normalize = text => text.replace(/\s+/g, '').toLowerCase();
      assert.ok(doc.querySelectorAll('h1,h2,h3').some(h => normalize(h.text) === normalize(expected.expectedHeading)));
    }
    const legacy = await page({section:'records'});
    assert.equal(legacy.querySelectorAll(scope.worksVideo).length, works.length);
    assert.equal(legacy.querySelectorAll(scope.worksRelease).length, design.releases.length);
    assertDestination(localUrl(linkByLabel(legacy.querySelector('nav[aria-label="作品类型"]'), /^发行/)), group.path, {section:'works',format:'release'});
  });

  test(slug + ' release search, clear, detail and back preserve the selected catalog', async () => {
    const release = design.releases[0];
    const q = release.title;
    const empty = await page({section:'works',format:'release',q:'missing-729ad'});
    assert.match(empty.text, /没有符合条件的发行/);
    assert.doesNotMatch(empty.text, /没有符合条件的影像|0 个影像/);
    assertDestination(localUrl(linkByLabel(empty,/清除搜索/)), group.path, {section:'works',format:'release'});
    for (const format of ['release','all']) {
      const list = format === 'all' ? {section:'works',q} : {section:'works',format,q};
      const doc = await page(list);
      assert.equal(doc.querySelector('main input').getAttribute('value'), q);
      const detailUrl = localUrl(firstReleaseLink(doc,scope.worksRelease));
      assertDestination(detailUrl, group.path, {...list, release:release.key});
      const detail = await page(Object.fromEntries(detailUrl.searchParams));
      assert.ok(detail.querySelectorAll('h1').some(h => h.text.trim() === q));
      assertDestination(localUrl(linkByLabel(detail,/返回(?:发行目录|作品)/)), group.path, list);
    }
    const bare = await page({section:'works',release:release.key});
    assertDestination(localUrl(linkByLabel(bare,/返回(?:发行目录|作品)/)), group.path, {section:'works'});
  });
}

test('release return paths accept an exact local release only on supported artists', () => {
  for (const slug of slugs) {
    const path = '/artists/' + slug;
    const query = '?section=works&format=release';
    for (const invalid of [path + '?section=members&format=release', path + '?section=records&format=release',
      path + query + '&media=unknown', path + query + '&release=foreign-key', path + query + '&queue=tonight',
      path + query + '&format=mv', path + query + '#', 'https://other.invalid' + path + query]) {
      assert.equal(safeArtistReturn(invalid), null, invalid);
    }
  }
  assert.equal(safeArtistReturn('/artists/ive?section=works&format=release'), null);
  assert.equal(safeArtistReturn('/artists/billlie?section=works&format=release'), '/artists/billlie?section=works&format=release');
});

test('GENBLUE releases leave the viewing queue while keeping the search', async () => {
  const group = registry.find(row => row.slug === 'genblue');
  const result = parse(await renderArtist(group,{section:'works',format:'mv',queue:'unrated',q:'COCO'}));
  const url = localUrl(linkByLabel(result.querySelector('nav[aria-label="作品类型"]'),/^发行/));
  assertDestination(url, group.path, {section:'works',q:'COCO',format:'release'});
  const release = parse(await renderArtist(group,Object.fromEntries(url.searchParams)));
  assert.equal(release.querySelector('[aria-label="观看队列"]'), null);
});
