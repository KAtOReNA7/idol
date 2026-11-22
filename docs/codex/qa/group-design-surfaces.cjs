// Run from apps/idol-site so the existing route fixture resolves the production app.
const fs = require('node:fs');
const path = require('node:path');
const {createRequire} = require('node:module');
const app = path.resolve(__dirname, '../../../apps/idol-site');
const appRequire = createRequire(path.join(app, 'package.json'));
const {parse} = appRequire('next/dist/compiled/node-html-parser');
const {registry, artistCatalog, renderArtist} = appRequire('./tests/fixtures/current-artist-pages.cjs');
const {mountAstra} = appRequire('./tests/helpers/timeline-production-renderers.cjs');
const load = appRequire('./tests/helpers/public-artist-loader.cjs');
const {artistWorkUrl} = load('lib/idol/artist-preview.ts');
const runtime = load('lib/idol/izna-runtime/runtime.mjs');
const udtt = load('lib/idol/udtt-native/model.mjs');
const udttView = load('lib/idol/udtt-native/presentation.mjs');

function routesFor(group, catalog) {
  if (['ifeye','izna'].includes(group.slug)) {
    const native = load('lib/idol/' + group.slug + '-native.ts');
    const model = load('lib/idol/' + group.slug + '-runtime/model.mjs');
    const view = load('lib/idol/' + group.slug + '-runtime/' + group.slug + '.mjs');
    const display = (native.prepareIfeyeDisplayData ?? native.prepareIznaDisplayData)(catalog);
    return {
      routes:{home:'#/home',members:'#/members',works:'#/works',releases:group.slug === 'ifeye' ? '#/works?type=release' : '#/works?kind=release',timeline:'#/timeline'},
      toPath:hash => hash.startsWith('#/') ? model.artistUrl(display, hash) : hash,
      render:hash => mountAstra({...runtime,...view},group.slug,display,hash),
    };
  }
  if (group.slug === 'udtt') return {
    routes:{home:group.path,members:'#/udtt/members',works:'#/udtt/works',releases:'#/udtt/works?type=release',timeline:'#/udtt/timeline'},
    toPath:route => route.startsWith('#') ? group.path + route : route,
    render:route => udttView.render({route:udtt.readReviewUrl(route.startsWith('#') ? group.path + route : route),helpers:udtt.helpers,catalog}),
  };
  return {
    routes:{home:'',members:'section=members',works:'section=works',releases:'section=records',timeline:'section=updates'},
    toPath:route => route.startsWith('/') || route.startsWith('http') || route.startsWith('#') ? route : group.path + (route ? '?' + route : ''),
    render:query => renderArtist(group,Object.fromEntries(new URLSearchParams(query)),catalog),
  };
}

async function inventory() {
  const groups=[];
  for (const group of registry) {
    const catalog=artistCatalog(group);
    const access=routesFor(group,catalog);
    const routes={};
    const examples={};
    for (const [screen,route] of Object.entries(access.routes)) {
      const page=parse(await access.render(route));
      const main=page.querySelector('main') ?? page;
      const heading=main.querySelector('h1') ?? main.querySelector('h2');
      const label=heading?.text.trim() || heading?.querySelector('img[alt]')?.getAttribute('alt') || null;
      routes[screen]={path:access.toPath(route),firstHeading:label,images:main.querySelectorAll('img[src]').length};
      const links=main.querySelectorAll('a[href]').map(el=>el.getAttribute('href')).filter(Boolean);
      for (const href of links) {
        const target=access.toPath(href);
        if (!target || !target.startsWith('/')) continue;
        const u=new URL(target,'https://example.invalid');
        if (!examples.profile && screen==='members' && (u.searchParams.get('member') || /#\/udtt\/member\//.test(target))) examples.profile=target;
        if (!examples.release && (u.searchParams.get('release') || /#\/udtt\/release\//.test(target))) examples.release=target;
        if (!examples.mv && u.pathname==='/' && u.searchParams.get('work') && !u.searchParams.get('video')) examples.mv=target;
        if (!examples.stage && u.pathname==='/' && u.searchParams.get('work') && u.searchParams.get('video')==='stage') examples.stage=target;
      }
    }
    const record=catalog.works.find(w=>!w.placeholder && w.groupIds.includes(group.groupId) && w.url);
    const staged=catalog.works.find(w=>!w.placeholder && w.groupIds.includes(group.groupId) && w.stage?.videoId);
    const sharedRecordRoutes={};
    if(record) sharedRecordRoutes.mv=artistWorkUrl(record,false,group.path);
    if(staged) sharedRecordRoutes.stage=artistWorkUrl(staged,true,group.path);
    groups.push({slug:group.slug,routes,examples,sharedRecordRoutes});
  }
  return groups;
}

module.exports = {routesFor};

if (require.main===module) {
  inventory().then(groups=>{
    const json=JSON.stringify(groups,null,2)+'\n';
    if(process.argv[2])fs.writeFileSync(process.argv[2],json);
    else process.stdout.write(json);
  }).catch(error=>{console.error(error);process.exitCode=1;});
}
