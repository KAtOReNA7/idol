/* eslint-disable @typescript-eslint/no-require-imports -- Synthetic SSR navigation regression. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const fixture=JSON.parse(fs.readFileSync('tests/fixtures/candidate37.synthetic.json','utf8'));
const content=JSON.parse(fs.readFileSync('data/idle-artist.json','utf8'));
function renderer(url,ready=true){
 const cache=new Map(),mockReact={...React,useEffect:()=>{},useLayoutEffect:()=>{},useSyncExternalStore:()=>url,useState:initial=>[initial&&typeof initial==='object'&&'data' in initial?{data:ready?fixture:null,error:'',loading:!ready}:initial,()=>{}]};
 function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const out={};cache.set(file,out);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 vm.runInNewContext('(function(require,exports){'+code+'})',{URL,URLSearchParams,Date,AbortController,DOMException,setTimeout,clearTimeout})(name=>{const imageModule=require('./helpers/image-dependency-loader.cjs').imageDependency(name);if(imageModule!==undefined)return imageModule;const timelineModule=require('./helpers/timeline-dependency-loader.cjs').timelineDependency(name);if(timelineModule!==undefined)return timelineModule;
  if(name==='@/components/member-physical-facts')return require('./helpers/member-physical-loader.cjs');if(name==='@/components/member-career-facts')return require('./helpers/member-career-loader.cjs');if(name==='react')return mockReact;if(name.endsWith('.css'))return {};if(name==='./use-artist-scroll')return {useArtistScroll:()=>()=>{}};if(name==='./photo-lightbox')return {PhotoLightbox:()=>null};if(name==='./feishu')return {AppError:class extends Error{}};
  if(name.startsWith('@/')||name.startsWith('.')){const target=name.startsWith('@/')?name.slice(2):path.join(path.dirname(file),name);return load(['.ts','.tsx'].map(ext=>target+ext).find(p=>fs.existsSync(p))??target)}return require(name);
 },out);return out;}
 return {load,html:()=>renderToStaticMarkup(React.createElement(load('components/candidate/idle-design.tsx').default,{content}))};
}
function chapters(html){const nav=html.match(/<nav class="idle-chapter-index"[^>]*>(.*?)<\/nav>/s);assert.ok(nav);return [...nav[1].matchAll(/href="([^"]+)"/g)].map(m=>m[1]);}
test('i-dle chapters use supported route destinations without async-only fragment targets',()=>{
 const r=renderer('/artists/idle'),links=chapters(r.html()),navigation=r.load('lib/idol/artist-navigation.ts');
 assert.equal(links.length,3);
 for(const link of links)assert.equal(navigation.safeArtistReturn(link),link,'chapter must survive shared return validation: '+link);
 assert.deepEqual(links,['/artists/idle?section=members','/artists/idle?section=works','/artists/idle?section=updates']);
});
test('i-dle chapter route survives loading, refresh and section entry with correct content',()=>{
 const before=JSON.stringify(fixture),expected=[['members','ca-roster'],['works','ca-tools'],['updates','artist-timeline']];
 for(const [section,marker] of expected){const url='/artists/idle?section='+section,loading=renderer(url,false).html(),ready=renderer(url).html();assert.ok(loading.includes('正在打开'));assert.ok(!loading.includes('class="'+marker+'"'));assert.ok(ready.includes('class="'+marker+'"'));assert.deepEqual(chapters(loading),chapters(ready));assert.equal(renderer(url).html(),ready)}
 assert.equal(JSON.stringify(fixture),before);
});
test('chapter labels describe their destinations and existing overview sections remain',()=>{
 const html=renderer('/artists/idle').html(),nav=html.match(/<nav class="idle-chapter-index"[^>]*>(.*?)<\/nav>/s)[1];
 for(const text of ['人物索引','作品与舞台','资料与时间线'])assert.ok(nav.includes(text),text);
 for(const id of ['idle-people','idle-works','idle-notebook'])assert.ok(html.includes('id="'+id+'"'));
});
test('all 37 design compositions have no unsupported literal local fragment navigation',()=>{
 const files=fs.readdirSync('components/candidate').filter(f=>f.endsWith('-design.tsx'));assert.equal(files.length,37);
 const navigation=renderer('/artists/idle').load('lib/idol/artist-navigation.ts');
 for(const file of files){const source=fs.readFileSync('components/candidate/'+file,'utf8');for(const match of source.matchAll(/href="(\/artists\/[^" ]+)"/g))assert.equal(navigation.safeArtistReturn(match[1]),match[1],file+': '+match[1]);}
});
