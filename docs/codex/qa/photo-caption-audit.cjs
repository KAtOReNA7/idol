// Run from apps/idol-site. Report only matching public photo labels, never form data.
const fs = require('node:fs');
const path = require('node:path');
const {createRequire} = require('node:module');
const app = createRequire(path.resolve('package.json'));
const {parse} = app('next/dist/compiled/node-html-parser');
const {registry, nativeSlugs, renderArtist, artistCatalog} = app('./tests/fixtures/current-artist-pages.cjs');
const {mountAstra} = app('./tests/helpers/timeline-production-renderers.cjs');
const load = app('./tests/helpers/public-artist-loader.cjs');
const {memberBelongsInArchive} = load('lib/idol/member-affiliation.ts');
const visits = require('../evidence/20261122-member-page-coverage/visits.json');
const wanted = process.argv.includes('--member-credits')
  ? /拍摄日期未载|完整档案卡来自公司官网，拍摄及测量时期未注明|本页照片由 Starting House|肖像来自.{0,25}Edaily 具名采访|更多参与资料持续补充/
  : /拍摄(?:日期|时间|时期)(?:未注明|未公开|未披露|未知|不详)|官网公开资料照|从一首歌，再一次认识她们|从青春里，听见她们|此处收录.{0,8}六人阵容/;

function visibleMatches(html) {
  const root = parse(html);
  const matches = [];
  function visit(node) {
    if (node.nodeType === 3) {
      const label = node.text.trim();
      if (wanted.test(label)) matches.push(label);
      return;
    }
    const name = node.rawTagName?.toLowerCase();
    if (['script','style','template','noscript'].includes(name) || node.hasAttribute?.('hidden')) return;
    for (const attr of ['alt','aria-label']) {
      const label = node.getAttribute?.(attr) || '';
      if (wanted.test(label)) matches.push(attr + ': ' + label);
    }
    const children = name === 'details' && !node.hasAttribute('open')
      ? node.childNodes.filter(child => child.rawTagName?.toLowerCase() === 'summary')
      : node.childNodes;
    children.forEach(visit);
  }
  visit(root);
  return [...new Set(matches)];
}

async function audit() {
  const rows = [];
  for (const group of registry) {
    const catalog = artistCatalog(group);
    const prior = visits.ordinary.byGroup[group.slug]?.map(row => row.member)
      ?? visits.native.find(row => row.slug === group.slug)?.rows.map(row => row.href.match(/rec[a-zA-Z0-9]+/)?.[0])
      ?? [];
    const memberIds = [...new Set([...catalog.members.filter(person => memberBelongsInArchive(person,group.groupId)).map(person => person.id),...prior.filter(Boolean)])];
    const routes = [['home', {}], ['members',{section:'members'}], ['works',{section:'works'}],
      ...memberIds.map(member => ['member/'+member,{section:'members',member}])];
    const matches = [];
    for (const [route,query] of routes) {
      let html;
      if (!nativeSlugs.has(group.slug)) {
        html = await renderArtist(group,query,catalog);
      } else if (group.slug === 'udtt') {
        const model = load('lib/idol/udtt-native/model.mjs');
        const presentation = load('lib/idol/udtt-native/presentation.mjs');
        const href = group.path + '#/udtt' + (route === 'home' ? '' : '/'+route);
        html = presentation.render({route:model.readReviewUrl(href),helpers:model.helpers,catalog});
      } else {
        const native = load('lib/idol/'+group.slug+'-native.ts');
        const runtime = load('lib/idol/izna-runtime/runtime.mjs');
        const renderer = load('lib/idol/'+group.slug+'-runtime/'+group.slug+'.mjs');
        html = mountAstra({...runtime,...renderer},group.slug,native.design,'#/'+route.replace(/^member\//,'person/'));
      }
      const labels = visibleMatches(html);
      if (labels.length) matches.push({route,labels});
    }
    rows.push({slug:group.slug,routes:routes.length,matches});
  }
  fs.writeFileSync(process.argv[2],JSON.stringify(rows,null,2)+'\n');
  for (const group of rows.filter(row => row.matches.length)) {
    console.log(group.slug,group.matches.length,[...new Set(group.matches.flatMap(row=>row.labels))].slice(0,3).join(' | '));
  }
  console.log(rows.length+' groups; '+rows.reduce((n,r)=>n+r.routes,0)+' routes');
}
audit().catch(error => {console.error(error);process.exitCode=1;});
