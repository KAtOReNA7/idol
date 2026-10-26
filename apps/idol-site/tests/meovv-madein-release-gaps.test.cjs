/* Real component SSR with public identity metadata and synthetic private values. */
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const ts = require('typescript'), React = require('react'), jsx = require('react/jsx-runtime');
const {renderToStaticMarkup} = require('react-dom/server');
const content = JSON.parse(fs.readFileSync('data/madein-artist.json'));
const publicMembers = JSON.parse(fs.readFileSync('tests/fixtures/madein-public-identities.json'));
const publicWorks = JSON.parse(fs.readFileSync('tests/fixtures/madein-public-works.json'));
const baseline = JSON.parse(fs.readFileSync('tests/fixtures/candidate37.synthetic.json'));
const timeline = JSON.parse(fs.readFileSync('data/artist-timelines/madein.json'));
function scene() {
 const memberSeed=baseline.members.find(m=>m.groupIds.includes(content.groupId));
 const workSeed=baseline.works.find(w=>w.groupIds.includes(content.groupId));
 return {...baseline,members:publicMembers.map(m=>({...memberSeed,...m})),ratings:[],works:publicWorks.map(w=>({...workSeed,...w,score:0,groupIds:[content.groupId]}))};
}
function renderer(data, url = '/artists/madein', options = {}) {
  const cache = new Map(), elements = [], navigations = [], stateWrites = [];
  const history = {state:{artistScroll:{path:url,y:321}},pushState(state,unused,to){this.state=state;navigations.push(to);},replaceState(state,unused,to){this.state=state;navigations.push(to);}};
  const hooks = {...React,useEffect:()=>{},useLayoutEffect:()=>{},useSyncExternalStore:()=>url,
    useState:initial=>[initial,value=>stateWrites.push(value)]};
  const track = original => (type,props,...rest) => {elements.push({type,props});return original(type,props,...rest);};
  function load(file) {
    file=path.resolve(file);if(cache.has(file))return cache.get(file);
    if(file.endsWith('.json'))return {default:JSON.parse(fs.readFileSync(file,'utf8'))};
    const out={};cache.set(file,out);
    const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
    vm.runInNewContext('(function(require,exports){'+code+'})',{URL,URLSearchParams,Date,AbortController,DOMException,setTimeout,clearTimeout,Event,
      requestAnimationFrame:fn=>{fn();return 1;},window:{history,scrollY:321,location:new URL(url,'https://site.invalid'),dispatchEvent:()=>{}},document:{getElementById:()=>({focus:()=>{},scrollIntoView:()=>{}})}})(name=>{
      if(name==='react')return hooks;
      if(name==='react/jsx-runtime')return {...jsx,jsx:track(jsx.jsx),jsxs:track(jsx.jsxs)};
      if(name==='@/components/use-artist-scroll')return {useArtistScroll:()=>()=>{}};
      if(name==='@/components/photo-lightbox')return {PhotoLightbox:()=>null};
      if(name==='@/components/artist-timeline-host')return {useArtistTimelineHostOptions:()=>({catalog:data,input:timeline,...options}),ArtistTimelineHost:()=>React.createElement('section',{'data-timeline-host':content.groupId})};
      const image=require('./helpers/image-dependency-loader.cjs').imageDependency(name);if(image!==undefined)return image;
      const dep=require('./helpers/timeline-dependency-loader.cjs').timelineDependency(name);if(dep!==undefined)return dep;
      if(name==='@/components/member-physical-facts')return require('./helpers/member-physical-loader.cjs');
      if(name==='@/components/member-career-facts')return require('./helpers/member-career-loader.cjs');
      if(name.endsWith('.css'))return {};
      if(name.startsWith('@/')||name.startsWith('.')){const target=name.startsWith('@/')?name.slice(2):path.join(path.dirname(file),name);return load(['.ts','.tsx'].map(ext=>target+ext).find(p=>fs.existsSync(p))??target);}
      return require(name);
    },out);return out;
  }
  const module=load('components/candidate/madein-design.tsx');
  return {html:renderToStaticMarkup(React.createElement(module.default,{content})),module,elements,navigations,load,history,stateWrites};
}
const urls = html => [...html.matchAll(/href="([^"]+)"/g)].map(m=>m[1].replaceAll('&amp;','&'));
const memberIds = html => [...html.matchAll(/data-artist-member-trigger="([^"]+)"/g)].map(m=>m[1]);
function freeze(value){if(value&&typeof value==='object'){Object.freeze(value);Object.values(value).forEach(freeze);}return value;}

const crypto=require('node:crypto');
const evidence='evidence/meovv-madein-release-gaps/';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
test('MEOVV eight release covers retain original five and verified exact new bytes',()=>{
 const {load}=renderer(scene());
 const rows=load('lib/idol/candidate/meovv-figma-assets.ts').MEOVV_RELEASES;
 assert.equal(rows.length,8);
 const oldSource=fs.readFileSync(evidence+'meovv-assets-baseline.ts.txt','utf8');
 const oldRows=vm.runInNewContext('('+oldSource.split('export const MEOVV_RELEASES=')[1].replace(' as const;','')+')',{base:'/artist/meovv/figma-20261017/'});
 assert.equal(JSON.stringify(rows.slice(0,5)),JSON.stringify(oldRows));
 for(const row of rows)assert.ok(fs.existsSync('public'+row.src),row.title);
 const verified=read(evidence+'verified-releases.json');
 for(const v of verified){const r=rows.find(r=>r.title===v.title);assert.equal(r.releaseDate,v.releaseDate);assert.equal(r.sourceUrl,v.sourceUrl);assert.equal(r.workId,v.workIds[0]??null);}
 let bytes=0;
 for(const m of read(evidence+'cover-manifest.json')){const b=fs.readFileSync(m.path);bytes+=b.length;assert.equal(b.length,m.bytes);assert.equal(crypto.createHash('sha256').update(b).digest('hex'),m.sha256);}
 assert.ok(bytes<400000);
});
test('MADEIN alternative-only cards show real metadata and view-only links without official claims',()=>{
 const data=scene(),supplements=read('data/stages/supplements.json').works;
 const ids=['rec28ldfRTrCzF','rec28ldfRTrCDJ'];
 for(const id of ids){const work=data.works.find(w=>w.id===id);assert.ok(work);work.stage=null;work.stageScore=null;work.stageSupplement=supplements[id];}
 const before=JSON.stringify(data);freeze(data);
 const {html,load}=renderer(data,'/artists/madein?section=works&format=stage');
 for(const id of ids){
  const card=html.match(new RegExp('<article class="stage-row"[^>]*data-work-id="'+id+'"[\\s\\S]*?</article>'))?.[0];
  assert.ok(card,id);assert.match(card,/观众饭拍 · 仅供观看/);assert.match(card,/查看其他现场 →/);assert.doesNotMatch(card,/官方观看|<img|评分/);
  const target=urls(card).find(h=>h.includes('work='+id));assert.ok(target);assert.equal(new URL(target,'https://test.invalid').searchParams.get('returnTo'),'/artists/madein?section=works&format=stage');
  assert.equal(load('lib/idol/stage-source.ts').stageSourceKey(supplements[id].alternatives[0]),null);
  assert.equal(supplements[id].alternatives[0].scorePolicy,'view_only');assert.equal(load('lib/idol/stage-source.ts').stageHasValidBinding(supplements[id].alternatives[0]),false);
 }
 assert.match(html,/Today&#x27;s Sunshine/);assert.match(html,/보가츠/);assert.equal(JSON.stringify(data),before);
});
test('MADEIN class structure stays unchanged and unknown dates do not crash',()=>{
 const source=fs.readFileSync('components/candidate/madein-design.tsx','utf8');
 assert.deepEqual(source.match(/className=(?:"[^"]*"|\{[^}]*\})/g),read(evidence+'madein-class-baseline.json'));
 const comparator=source.match(/const rows=artistWorkRows\(works,route.queue,route.search\)\.sort\((.*?)\);return/)[1];
 const sort=vm.runInNewContext('('+comparator+')');
 const rows=[{id:'b',releaseDate:null},{id:'a'},{id:'c',releaseDate:'2025'}];
 assert.doesNotThrow(()=>rows.sort(sort));assert.deepEqual(rows.map(r=>r.id),['a','b','c']);assert.equal(rows[0].releaseDate,undefined);assert.equal(rows[1].releaseDate,null);
});

test('shared artist collection treats absent dates as empty without changing dated order or identities',()=>{
 const data=scene();data.works[0].releaseDate=null;data.works[1].releaseDate=undefined;data.works[2].releaseDate='';
 const before=JSON.stringify(data);freeze(data);
 const {load}=renderer(data,'/artists/madein?section=works');
 const rows=load('lib/idol/artist-preview.ts').artistCollection(data,content.groupId).works;
 const expected=[...data.works].sort((a,b)=>(b.releaseDate??'').localeCompare(a.releaseDate??'')||a.id.localeCompare(b.id));
 assert.equal(JSON.stringify(rows.map(w=>w.id)),JSON.stringify(expected.map(w=>w.id)));assert.equal(JSON.stringify(data),before);
});
