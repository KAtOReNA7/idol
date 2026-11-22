// Run from apps/idol-site. Render the registered directories with the public
// catalog and follow stage links. The result covers navigation, not decoding.
const {parse} = require('next/dist/compiled/node-html-parser');
const {artistCatalog, registry, renderArtist} = require('../tests/fixtures/current-artist-pages.cjs');
const selectors = require('../tests/fixtures/artist-media-order.cjs');
const {artistJourneys} = require('../tests/fixtures/artist-journey-routes.cjs');
const {mountAstra} = require('../tests/helpers/timeline-production-renderers.cjs');
const load = require('../tests/helpers/public-artist-loader.cjs');
const site = 'https://site.invalid';
const url = target => new URL(target, site);
const player = link => link && url(link).pathname === '/' && url(link).searchParams.get('view') === 'works';
const compact = value => value.replace(/\s+/g,' ').trim();
const links = outer => outer.tagName === 'A' ? [outer] : outer.querySelectorAll('a[href]');
const specific = {
  idle:'.idv-live-library .idv-film',
  newjeans:'#newjeans-records article',
  wooah:'.wa-video-hit',
  badvillain:'article.film[data-kind="stage"]',
};

function nativeStages(group, catalog) {
  const {slug} = group;
  const {safeArtistReturn} = load('lib/idol/artist-navigation.ts');
  const {routeUrl} = load('lib/idol/journey.ts');
  if (slug === 'udtt') {
    const model = load('lib/idol/udtt-native/model.mjs');
    const presentation = load('lib/idol/udtt-native/presentation.mjs');
    const from = group.path + '#/udtt/works?type=stage';
    const directory = parse(presentation.render({route:model.readReviewUrl(from),helpers:model.helpers,catalog}));
    return directory.querySelectorAll('.ud-films article').map(card => {
      const href = card.querySelector('a').getAttribute('href');
      const mounted = group.path + href;
      const route = model.readReviewUrl(mounted);
      const match = model.group.media.find(stage => stage.kind === 'stage' && stage.key === route.key);
      if (!match) throw Error('UDTT link lost its stage identity: ' + href);
      const target = model.nativeHref({reference:match,action:'play',catalog,route,mountedUrl:mounted,currentUrl:mounted,mayLeave:true},
        {safeArtistReturn,routeUrl,...load('lib/idol/stage-source.ts')});
      return {page:mounted,mode:player(target) && url(target).searchParams.get('video') === 'stage' ? 'detailToStage' : 'editorialStage'};
    });
  }
  const native = load('lib/idol/' + slug + '-native.ts');
  const model = load('lib/idol/' + slug + '-runtime/model.mjs');
  const runtime = load('lib/idol/izna-runtime/runtime.mjs');
  const renderer = load('lib/idol/' + slug + '-runtime/' + slug + '.mjs');
  const {bindEditorialLinks, editorialRequest} = load('lib/idol/editorial-mv-links.mjs');
  const {design} = native;
  const directory = slug === 'izna' ? '#/works?kind=STAGE' : '#/works?type=stage';
  const doc = parse(mountAstra({...runtime,...renderer},slug,design,directory));
  const targets = doc.querySelectorAll('a[href^="#/"]');
  const original = targets.map(a => a.getAttribute('href'));
  targets.forEach(a => {a.dataset = {};});
  const request = (hash, back) => editorialRequest(design, hash, back, model.routeCategory);
  const bindings = slug === 'izna' ? native.iznaNativeBindings(catalog) : native.ifeyeNativeBindings(catalog);
  bindEditorialLinks({root:doc,data:design,origin:directory,artistUrl:model.artistUrl,nativeRequest:request,
    nativeHref:model.nativeHref,native:{safeArtistReturn,routeUrl,bindings}});
  return targets.flatMap((anchor, i) => {
    const item = request(original[i], directory);
    if (item?.slotType !== 'STAGE') return [];
    const href = anchor.getAttribute('href');
    const valid = player(href) && url(href).searchParams.get('video') === 'stage' && url(href).searchParams.get('work') === item.workId;
    return [{page:item.videoId,mode:valid ? 'directStage' : 'wrongTarget'}];
  });
}

async function inspectDirectory(group) {
  const {slug} = group, catalog = artistCatalog(group);
  const filter = artistJourneys(slug).some(j => j.section === 'works' && j.format === 'stage');
  if (['udtt','izna','ifeye'].includes(slug)) return {slug,filter,rows:nativeStages(group,catalog)};
  const query = filter ? {section:'works',format:'stage'} : {section:'works'};
  const doc = parse(await renderArtist(group, query, catalog));
  const cards = (doc.querySelector('main') || doc).querySelectorAll(specific[slug] || selectors.get(slug).worksVideo);
  const owned = catalog.works.filter(w => w.groupIds.includes(group.groupId) && !w.placeholder);
  const rows = [];
  for (const card of cards) {
    const all = links(card);
    const options = !filter && slug !== 'badvillain'
      ? all.filter(a => /^(?:看)?舞台|其他现场/.test(compact(a.text)))
      : [all[0]];
    for (const element of options) {
      let href = element?.getAttribute('href');
      if (!href) {
        let key = card.getAttribute('data-artist-media');
        if (slug === 'ive') {
          const label = card.querySelector('button')?.getAttribute('aria-label');
          key = require('../data/ive-soft-issue.json').media.find(f => f.kind === 'stage' && '查看' + f.title === label)?.id;
        }
        if (!key) {rows.push({page:compact(card.text),mode:'wrongTarget'}); continue;}
        href = group.path + '?' + new URLSearchParams({section:'works',format:'stage',media:key});
      }
      if (player(href)) {
        const q = url(href).searchParams, work = owned.find(w => w.id === q.get('work'));
        const valid = q.get('video') === 'stage' && !!(work?.stage || work?.stageSupplement?.alternatives.length);
        rows.push({page:q.get('work'),mode:valid ? 'directStage' : 'wrongTarget'});
        continue;
      }
      const local = url(href);
      const media = local.searchParams.get('media');
      if (local.origin !== site || local.pathname !== group.path || !media) {
        rows.push({page:href,mode:'wrongTarget'});
        continue;
      }
      const detail = parse(await renderArtist(group, Object.fromEntries(local.searchParams), catalog));
      const region = detail.querySelector('main') || detail;
      const stage = region.querySelectorAll('a[href]').find(a => {
        const link = a.getAttribute('href');
        return player(link) && url(link).searchParams.get('video') === 'stage';
      });
      const source = region.querySelectorAll('a[href]').find(a =>
        /^https?:\/\//.test(a.getAttribute('href')) && /观看|播放|前往官方视频|原片/.test(compact(a.text)));
      const declared = local.searchParams.get('format') === 'stage' || card.getAttribute('data-kind') === 'stage';
      const empty = /暂时找不到这个视频版本|没有找到这个条目/.test(region.text);
      let mode = 'wrongTarget';
      if (declared && !empty) mode = stage ? 'detailToStage' : 'editorialStage';
      rows.push({page:media,mode,...(source && {sourceText:compact(source.text)}),
        ...(source && stage && {externalFirst:region.querySelectorAll('a[href]').indexOf(source) < region.querySelectorAll('a[href]').indexOf(stage)})});
    }
  }
  return {slug,filter,rows};
}

async function main() {
  const groups = [];
  for (const group of registry) {
    const {slug,filter,rows} = await inspectDirectory(group);
    const counts = {};
    for (const row of rows) counts[row.mode] = (counts[row.mode] || 0) + 1;
    groups.push({slug,stageFilter:filter,targets:rows.length,...counts,
      ...(rows.some(r => r.externalFirst) && {externalFirst:rows.filter(r => r.externalFirst).map(r => r.page)}),
      ...(counts.editorialStage && {editorialOnly:rows.filter(r => r.mode === 'editorialStage').map(r => r.page)}),
      ...(counts.wrongTarget && {wrong:rows.filter(r => r.mode === 'wrongTarget').map(r => r.page)})});
  }
  console.log(JSON.stringify(groups,null,2));
  if (groups.some(g => g.wrongTarget || g.stageFilter && !g.targets)) process.exitCode = 1;
}
main().catch(error => {console.error(error);process.exitCode=1;});
