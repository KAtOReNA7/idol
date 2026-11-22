const assert = require('node:assert/strict');
const test = require('node:test');
const {parse} = require('next/dist/compiled/node-html-parser');
const {artistCatalog, registry, renderArtist} = require('./fixtures/current-artist-pages.cjs');
const mediaSelectors = require('./fixtures/artist-media-order.cjs');
const {approvedStagePoster,stagePreviewFallback} = require('./helpers/public-artist-loader.cjs')('lib/idol/approved-video-poster.ts');

const directoryGroups = ['vvup','loona','stayc','nmixx','kiiikiii','saymyname'];
const targetUrl = anchor => new URL(anchor.getAttribute('href'), 'https://site.invalid');

for (const [slug, stageCount, scoreableCount] of [['vcha',4,4],['hitgs',5,5],['atheart',10,2]]) {
  const group = registry.find(g => g.slug === slug);
  const videos = require('../data/'+slug+'-review-editorial.json').videos.filter(v => v.type === 'stage');
  const catalog = artistCatalog(group);
  test(slug+' stage posters and bookmarked actions open the same cut, with the complete return route', async () => {
    assert.equal(videos.length, stageCount);
    assert.equal(videos.filter(v => v.workId).length, scoreableCount);
    for (const v of videos) {
      const fields = {section:'works',format:'stage',q:v.title};
      const source = 'https://www.youtube.com/watch?v='+v.videoId;
      const library = parse(await renderArtist(group, fields, catalog));
      const card = library.querySelector('[data-artist-media="'+v.key+'"]');
      assert.equal(card.tagName, 'A', v.key);
      assert.ok(card.querySelector('img'));
      assert.equal(card.getAttribute('data-member-work-trigger'),'artist-media:'+v.key);
      const main = targetUrl(card);
      const detailFields = {...fields,media:v.key};
      const detail = parse(await renderArtist(group, detailFields, catalog));
      const action = detail.querySelector('[data-film-primary]');
      assert.equal(detail.querySelectorAll('[data-film-primary]').length, 1);
      assert.equal(detail.querySelectorAll('main a').filter(a => a.getAttribute('href') === source).length, 1);
      if (v.workId) {
        assert.equal(action.getAttribute('data-film-primary'),'onsite');
        assert.equal(action.getAttribute('data-member-work-trigger'),'editorial-video:'+source);
        assert.match(detail.querySelector('details a[href="'+source+'"]').text,/原片出处/);
        for (const [target, backFields] of [[main,fields],[targetUrl(action),detailFields]]) {
          assert.equal(target.pathname, '/');
          assert.equal(target.searchParams.get('video'), 'stage');
          assert.equal(target.searchParams.get('work'), v.workId);
          const back = new URL(target.searchParams.get('returnTo'),target);
          assert.equal(back.pathname, group.path);
          assert.deepEqual(Object.fromEntries(back.searchParams), backFields);
        }
      } else {
        assert.equal(main.pathname,group.path);
        assert.deepEqual(Object.fromEntries(main.searchParams),detailFields);
        assert.equal(action.getAttribute('href'),source);
        assert.equal(action.getAttribute('data-film-primary'),'source');
        assert.match(detail.text,/此版本暂无站内播放或评分/);
      }
    }
  });
  test(slug+' stage links preserve the collectible version on cold, failed, or changed catalogues', async () => {
    const v = videos.find(v => v.workId);
    const query = {section:'works',format:'stage',q:v.title};
    const detailFields = {...query,media:v.key};
    for (const state of [{loading:true},{error:'离线'}]) {
      const library = parse(await renderArtist(group,query,null,state));
      const anchor = library.querySelector('[data-artist-media="'+v.key+'"]');
      assert.equal(targetUrl(anchor).pathname,group.path);
      assert.deepEqual(Object.fromEntries(targetUrl(anchor).searchParams),detailFields);
      const detail = parse(await renderArtist(group,detailFields,null,state));
      assert.equal(detail.querySelector('[data-film-primary="source"]'),null);
      assert.match(detail.text,state.loading?/正在读取站内观看入口/:/重试/);
    }
    const w = catalog.works.find(w => w.id === v.workId);
    const stage = w.stage;
    const variants = [
      [{...w,stage:null}], [{...w,groupIds:['another-group']}], [{...w,id:'other-work'}], [w,w],
      [{...w,stage:{...stage,url:'https://www.youtube.com/watch?v=aaaaaaaaaaa'}}],
      [{...w,stage:{...stage,scoreBinding:{...stage.scoreBinding,sourceKey:'previous-cut'}}}],
      [{...w,stage:{...stage,clip:{startSeconds:1,endSeconds:61,sourceDurationSeconds:200},
        scoreBinding:{...stage.scoreBinding,sourceKey:stage.videoId+'@1-61'}}}],
    ];
    for (const works of variants) {
      const data = {...catalog,works};
      const library = parse(await renderArtist(group,query,data));
      const card = library.querySelector('[data-artist-media="'+v.key+'"]');
      assert.equal(targetUrl(card).searchParams.get('media'),v.key);
      const detail = parse(await renderArtist(group,detailFields,data));
      assert.equal(detail.querySelector('[data-film-primary="onsite"]'),null);
      assert.equal(detail.querySelector('[data-film-primary="source"]').getAttribute('href'),
        'https://www.youtube.com/watch?v='+v.videoId);
    }
  });
}

for (const slug of directoryGroups) {
  test(slug + ' opens the selected stage from its poster, title and main action', async () => {
    const group = registry.find(g => g.slug === slug);
    const catalog = artistCatalog(group);
    const eligible = catalog.works.filter(w => w.groupIds.includes(group.groupId) && !w.placeholder && (w.stage || w.stageSupplement?.alternatives.length));
    const fields = {section:'works',format:'stage'};
    const doc = parse(await renderArtist(group, fields));
    const cards = doc.querySelectorAll(mediaSelectors.get(slug).worksVideo);
    assert.deepEqual(new Set(cards.map(c => c.getAttribute('data-work-id'))), new Set(eligible.map(w => w.id)));
    assert.equal(cards.length, eligible.length);

    for (const card of cards) {
      const work = eligible.find(w => w.id === card.getAttribute('data-work-id'));
      const primary = card.querySelector('a');
      const url = targetUrl(primary);
      assert.equal(url.pathname, '/');
      assert.equal(url.searchParams.get('video'), 'stage');
      assert.equal(url.searchParams.get('work'), work.id);
      assert.equal(new URL(url.searchParams.get('returnTo'), url).pathname, group.path);
      assert.deepEqual(Object.fromEntries(new URL(url.searchParams.get('returnTo'), url).searchParams), fields);
      assert.equal(primary.querySelector('h3').text, work.song || work.name);
      assert.ok(primary.querySelector('.stage-directory-action'));
      assert.doesNotMatch(primary.text, /我的\s*MV\s*分/);
      if (work.stage) {
        assert.equal(primary.querySelector('.stage-directory-source').text, work.stage.title);
        assert.equal(primary.querySelector('time')?.getAttribute('datetime'), work.stage.publishedDate || undefined);
        const picture = primary.querySelector('.artist-work-preview img');
        assert.ok(picture);
        const poster = approvedStagePoster(work.id, work.stage) || stagePreviewFallback(work, work.stage, true);
        assert.equal(picture.getAttribute('src'), poster.src);
        if (work.stage.platform === 'bilibili') assert.match(primary.text, /暂无站内高清片源/);
      }
      const related = card.querySelector('.stage-directory-related');
      if (work.url && !work.stage?.reusesOriginalVideo) {
        assert.equal(targetUrl(related).searchParams.get('work'), work.id);
        assert.equal(targetUrl(related).searchParams.get('video'), null);
      } else assert.equal(related, null);
    }

    const sample = eligible.find(w => w.stage?.scoreBinding && w.url);
    const query = {section:'works',queue:'rewatch',q:sample.song};
    const data = {...catalog,works:[{...sample,score:9.5,stageScore:0}]};
    const stagePage = parse(await renderArtist(group, {...query,format:'stage'}, data));
    const stage = stagePage.querySelector('[data-artist-stage-card]');
    assert.equal(stage.querySelector('.stage-directory-score b').text, '0.0 / 10');
    const back = new URL(targetUrl(stage.querySelector('a')).searchParams.get('returnTo'), 'https://site.invalid');
    assert.deepEqual(Object.fromEntries(back.searchParams), {...query,format:'stage'});
    for (const format of ['all','mv']) {
      const page = parse(await renderArtist(group, {...query,format}, data));
      const original = page.querySelector(mediaSelectors.get(slug).worksVideo);
      assert.equal(original.querySelector('.stage-directory-score'), null);
      assert.equal(targetUrl(original.querySelector('a')).searchParams.get('video'), null);
      assert.match(original.text,/9\.5/);
    }
  });
}

test('stage options keep other performances view-only and ignore a stale saved score', async () => {
  const group = registry.find(g => g.slug === 'loona');
  const catalog = artistCatalog(group);
  const sample = catalog.works.find(w => w.stage?.scoreBinding && w.url);
  async function card(overrides) {
    const rows = {...catalog,works:[{...sample,score:8,stageScore:7,...overrides}]};
    const page = parse(await renderArtist(group, {section:'works',format:'stage'}, rows));
    return page.querySelector('[data-artist-stage-card]');
  }
  const unbound = await card({stage:{...sample.stage,scoreBinding:{...sample.stage.scoreBinding,sourceKey:'unrelated'}}});
  assert.match(unbound.text,/这版舞台暂时无法评分/);
  assert.equal(unbound.querySelector('.stage-directory-score'), null);
  const alternative = await card({stage:null,stageSupplement:{alternatives:[{id:'view-only'}]}});
  assert.match(alternative.text,/仅供观看/);
  assert.equal(alternative.querySelector('.stage-directory-action').text, '查看其他现场');
  assert.equal(alternative.querySelector('.stage-directory-score'), null);
});

test('KISS OF LIFE stage cards use one link and the matching thumbnail, date and score across the full stage filter',async()=>{
  const group=registry.find(g=>g.slug==='kissoflife'), catalog=artistCatalog(group);
  const unfiltered=parse(await renderArtist(group,{section:'works',format:'stage'},catalog,{canEdit:true}));
  const cards=unfiltered.querySelectorAll('.kf-work-grid .kf-work');
  assert.equal(cards.length,catalog.works.filter(w=>w.stage||w.stageSupplement?.alternatives.length).length);
  for(const card of cards){
    const links=card.querySelectorAll('a');
    assert.equal(links.length,1);
    const target=new URL(links[0].getAttribute('href'),'https://site.invalid');
    assert.equal(target.searchParams.get('video'),'stage');
    const work=catalog.works.find(w=>w.id===target.searchParams.get('work'));
    assert.equal(links[0].getAttribute('data-member-work-trigger'),work.id);
    assert.ok(work.stage);
    assert.match(card.text,/我的整体舞台分/);
    assert.ok(card.text.includes(work.stage.publishedDate));
    assert.doesNotMatch(card.text,/我的 MV 分/);
    const art=card.querySelector('.artist-work-preview img');
    assert.ok(art);
    if(!card.querySelector('.work-preview-label'))assert.ok(art.getAttribute('src').includes(work.stage.videoId));
  }
  const same=catalog.works.find(w=>w.id==='rec28ldfRTrMgm');
  const render=async(format,overrides={})=>{
    const data={...catalog,works:[{...same,...overrides}]};
    const fields={section:'works',format,q:'Te Quiero'};
    return parse(await renderArtist(group,fields,data,{canEdit:true})).querySelector('.kf-work');
  };
  const stage=await render('stage',{score:8,stageScore:0});
  assert.match(stage.text,/与 MV 页为同一支表演视频/);
  assert.match(stage.querySelector('.kf-score').text,/0\.0/);
  const mv=await render('mv',{score:8,stageScore:0});
  assert.equal(new URL(mv.querySelector('a').getAttribute('href'),'https://x.invalid').searchParams.get('video'),null);
  assert.match(mv.querySelector('.kf-score').text,/8\.0/);
  const other=await render('stage',{stage:null,stageScore:8,stageSupplement:{alternatives:[{id:'view-only'}]}});
  assert.match(other.text,/其他现场 · 仅供观看/);
  assert.equal(other.querySelector('.kf-score'),null);
  const stale=await render('stage',{stage:{...same.stage,scoreBinding:null},stageScore:8});
  assert.match(stale.querySelector('.kf-score').text,/未评分/);
});

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
  for(const state of [{loading:true},{error:'网络中断'}]){
    const cold=parse(await renderArtist(group,query,null,state));
    const direct=new URL(cold.querySelector('[data-video-key="rizz-video"] a').getAttribute('href'),'https://site.invalid');
    assert.equal(direct.pathname,'/');
    assert.equal(direct.searchParams.get('work'),work.id);
    assert.equal(direct.searchParams.get('video'),'stage');
    assert.deepEqual(Object.fromEntries(new URL(direct.searchParams.get('returnTo'),direct).searchParams),query);
    const native=parse(await renderArtist(group,{...query,media:'rizz-video'},null,state));
    assert.ok(native.querySelector('[data-film-primary="onsite"]'));
    assert.match(native.text,/舞台整体评分/);
  }
  const changed={...catalog,works:catalog.works.map(w=>w.id===work.id?{...w,stage:null}:w)};
  const current=parse(await renderArtist(group,query,changed));
  const fallback=new URL(current.querySelector('[data-video-key="rizz-video"] a').getAttribute('href'),'https://site.invalid');
  assert.equal(fallback.pathname,group.path);
  assert.equal(fallback.searchParams.get('media'),'rizz-video');
  assert.equal(fallback.searchParams.get('format'),'stage');
  assert.ok(safeArtistReturn(fallback.pathname+fallback.search));
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
