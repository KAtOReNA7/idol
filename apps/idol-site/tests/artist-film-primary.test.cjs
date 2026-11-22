const assert = require('node:assert/strict');
const test = require('node:test');
const {parse} = require('next/dist/compiled/node-html-parser');
const {artistCatalog, registry, renderArtist} = require('./fixtures/current-artist-pages.cjs');

test('ADYA RIZZ keeps its single official cut on the score selected in the catalog and in saved bookmarks', async () => {
  const group = registry.find(g => g.slug === 'adya'), catalog = artistCatalog(group);
  const work = catalog.works.find(w => w.id === 'rec28ldfRTrHhL');
  const {safeArtistReturn} = require('./helpers/public-artist-loader.cjs')('lib/idol/artist-navigation.ts');
  assert.equal(work.stage.videoId, new URL(work.url).searchParams.get('v'));
  assert.equal(work.stage.reusesOriginalVideo, true);
  for (const format of ['all','mv','stage']) {
    const query = {section:'works', ...(format === 'all' ? {} : {format}), q:'RIZZ'};
    const doc = parse(await renderArtist(group, query));
    const cards = doc.querySelectorAll('[data-video-key="rizz-video"]');
    assert.equal(cards.length, 1);
    const links = cards[0].querySelectorAll('a');
    assert.equal(links.length, 1);
    const target = new URL(links[0].getAttribute('href'), 'https://site.invalid');
    assert.equal(target.pathname, '/');
    assert.equal(target.searchParams.get('work'), work.id);
    assert.equal(target.searchParams.get('video'), format === 'stage' ? 'stage' : null);
    assert.deepEqual(Object.fromEntries(new URL(target.searchParams.get('returnTo'), target).searchParams), query);
    if (format === 'stage') assert.match(links[0].text, /舞台整体评分/);
  }
  for (const format of ['mv','stage']) {
    const fields = {section:'works',format,media:'rizz-video',q:'RIZZ'};
    const page = parse(await renderArtist(group, fields));
    const primary = page.querySelector('[data-film-primary="onsite"]');
    const target = new URL(primary.getAttribute('href'), 'https://site.invalid');
    assert.equal(target.searchParams.get('video'), format === 'stage' ? 'stage' : null);
    assert.deepEqual(Object.fromEntries(new URL(target.searchParams.get('returnTo'), target).searchParams), fields);
  }
  const query = {section:'works',format:'stage',q:'RIZZ'};
  const pending = parse(await renderArtist(group, query, null, {loading:true}));
  const bookmark = pending.querySelector('[data-video-key="rizz-video"] a').getAttribute('href');
  const accepted = safeArtistReturn(bookmark);
  assert.ok(accepted);
  assert.deepEqual(Object.fromEntries(new URL(accepted, 'https://site.invalid').searchParams),
    Object.fromEntries(new URL(bookmark, 'https://site.invalid').searchParams));
  const native = parse(await renderArtist(group, Object.fromEntries(new URL(bookmark, 'https://site.invalid').searchParams), null, {loading:true}));
  assert.ok(native.querySelector('[data-film-primary="pending"]'));
  assert.match(native.text, /舞台整体评分/);
  assert.equal(safeArtistReturn('/artists/adya?section=works&format=stage&media=dazzling-day-ost-video'), null);
});

for (const slug of ['adya','geenius','oddyouth','tracer','spia','candyshop','bewave','youngposse','genblue']) {
  const group = registry.find(row => row.slug === slug);
  const catalog = artistCatalog(group);
  const videos = slug === 'genblue'
    ? require('../data/genblue-bluecut.json').media.map(v => ({...v, type:v.kind, id:v.workId}))
    : require('../data/'+slug+'-native-design.json').works;
  const query = v => ({section:'works', format:v.type.toLowerCase(), media:v.key});
  const render = async (v, data=catalog, options={}) => parse(await renderArtist(group, query(v), data, options)).querySelector('main');

  test(slug+' details keep the exact native action first and one publisher source for each cut', async () => {
    for (const v of videos) {
      const page = await render(v);
      const stage = v.type.toLowerCase() === 'stage';
      const work = catalog.works.find(w => w.id === v.id && (stage ? w.stage?.videoId === v.videoId : w.url === v.url));
      const action = page.querySelector('[data-film-primary]');
      assert.ok(action, v.key);
      assert.equal(page.querySelectorAll('[data-film-primary]').length, 1, v.key);
      const links = page.querySelectorAll('a');
      const credited = links.filter(a => a.getAttribute('href') === v.url);
      assert.equal(credited.length, 1, v.key);
      assert.equal(credited[0].getAttribute('target'), '_blank');
      if (work) {
        assert.equal(action.getAttribute('data-film-primary'), 'onsite', v.key);
        const dest = new URL(action.getAttribute('href'),'https://example.invalid');
        assert.equal(dest.origin, 'https://example.invalid');
        assert.equal(dest.searchParams.get('work'), work.id);
        assert.equal(dest.searchParams.get('video'), stage?'stage':null);
        const back = new URL(dest.searchParams.get('returnTo'),dest);
        assert.equal(back.pathname,group.path);
        assert.deepEqual(Object.fromEntries(back.searchParams),query(v));
        assert.match(credited[0].text,/原片出处/);
        if (v.sharedStage && work.stage?.videoId === v.videoId) {
          const alternate = links.find(a=>a.text.includes('舞台评分与记录'));
          assert.ok(alternate,v.key);
          const next = new URL(alternate.getAttribute('href'),dest);
          assert.equal(next.searchParams.get('video'),'stage');
          assert.equal(next.searchParams.get('work'),work.id);
        }
      } else {
        assert.equal(action.getAttribute('data-film-primary'),'source',v.key);
        assert.equal(action.getAttribute('href'),v.url,v.key);
        assert.match(page.text,/暂无站内播放或评分/);
      }
    }
  });

  test(slug+' keeps a delayed or failed catalogue distinct from a mismatched video', async () => {
    const v=videos.find(v => v.type.toLowerCase()==='mv' && catalog.works.some(w => w.id===v.id && w.url===v.url));
    assert.ok(v);
    for (const opts of [{loading:true},{error:'读取失败'}]) {
      const page=await render(v,null,opts);
      assert.equal(page.querySelector('[data-film-primary="onsite"]'),null);
      assert.doesNotMatch(page.text,/此版本暂无站内播放或评分/);
      assert.match(page.text,opts.loading?/正在读取/:/重试|重新读取/);
    }
    const works=catalog.works.map(w=>w.id===v.id?{...w,url:'https://www.youtube.com/watch?v=aaaaaaaaaaa'}:w);
    const page=await render(v,{...catalog,works});
    assert.equal(page.querySelector('[data-film-primary="source"]').getAttribute('href'),v.url);
  });
}
