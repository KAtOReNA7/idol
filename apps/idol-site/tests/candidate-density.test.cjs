/* eslint-disable @typescript-eslint/no-require-imports -- Node synthetic SSR regression harness. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
// Synthetic identities only. SSR proves rendered records and bindings, not browser overflow/focus.
const fixture=JSON.parse(fs.readFileSync('tests/fixtures/candidate37.synthetic.json','utf8'));
const content=slug=>JSON.parse(fs.readFileSync(`data/${slug}-artist.json`,'utf8'));
function scenario(slug,count){
 const c=content(slug),base=fixture.members.find(m=>m.groupIds.includes(c.groupId));
 const members=Array.from({length:count},(_,i)=>({...base,id:`recDensity${slug}Member${i+1}`,cnName:`合成测试超长中文成员姓名第${i+1}号`,stageName:`SYNTHETIC_LONG_STAGE_NAME_${i+1}`,groupIds:[c.groupId]}));
 const seed=fixture.works.find(w=>w.groupIds.includes(c.groupId)),other=content(slug==='loona'?'vcha':'loona');
 const works=[{...seed,id:'recDensityZero',song:'本团零分测试曲',score:0,groupIds:[c.groupId]}, {...seed,id:'recDensityNull',song:'本团未知分测试曲',score:null,groupIds:[c.groupId]}, {...seed,id:'recDensityHistory',song:'跨团历史测试曲',score:9,groupIds:[other.groupId]}];
 const last=members.at(-1),ratings=works.map((w,i)=>({id:`recDensityRating${i}`,memberIds:[last.id],workIds:[w.id],score:i===0?0:null,stylingScore:null,photo:null,recognition:'',note:'',memory:''}));
 return {c,last,data:{...fixture,groups:fixture.groups.filter(g=>[c.groupId,other.groupId].includes(g.id)),members,works,ratings}};
}
function renderer(data,url){
 const cache=new Map(),mockReact={...React,useEffect:()=>{},useLayoutEffect:()=>{},useSyncExternalStore:()=>url,useState:initial=>[initial&&typeof initial==='object'&&'data' in initial?{data,error:'',loading:false}:initial,()=>{}]};
 function load(file){file=path.resolve(file);if(file.endsWith('.json'))return {default:JSON.parse(fs.readFileSync(file,'utf8'))};if(cache.has(file))return cache.get(file);const out={};cache.set(file,out);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  vm.runInNewContext('(function(require,exports){'+code+'})',{URL,URLSearchParams,Date,AbortController,DOMException,setTimeout,clearTimeout})(name=>{const imageModule=require('./helpers/image-dependency-loader.cjs').imageDependency(name);if(imageModule!==undefined)return imageModule;const timelineModule=require('./helpers/timeline-dependency-loader.cjs').timelineDependency(name);if(timelineModule!==undefined)return timelineModule;
   if(name==='@/components/member-physical-facts')return require('./helpers/member-physical-loader.cjs');if(name==='@/components/member-career-facts')return require('./helpers/member-career-loader.cjs');if(name==='react')return mockReact;if(name.endsWith('.css'))return {};if(name==='./use-artist-scroll')return {useArtistScroll:()=>()=>{}};if(name==='./photo-lightbox')return {PhotoLightbox:()=>null};if(name==='./feishu')return {AppError:class extends Error{}};
   if(name.startsWith('@/')||name.startsWith('.')){const target=name.startsWith('@/')?name.slice(2):path.join(path.dirname(file),name);return load(['.ts','.tsx'].map(ext=>target+ext).find(p=>fs.existsSync(p))??target);}
   return require(name);
  },out);return out;
 }
 return {load,render(c){return renderToStaticMarkup(React.createElement(load(`components/candidate/${c.slug}-design.tsx`).default,{content:c}));}};
}
for(const [slug,count] of [['triples',24],['loona',11],['vcha',6]]){
 test(`${slug}: ${count} long Chinese names retain unique real component targets and final ordinal`,()=>{
  const {c,data}=scenario(slug,count),before=JSON.stringify(data),html=renderer(data,`/artists/${slug}?section=members`).render(c);
  const targetPattern=slug==='triples'?/data-roster-member-id="([^"]+)"/g:/data-artist-member-trigger="([^"]+)"/g;
  const ids=[...html.matchAll(targetPattern)].map(m=>m[1]);assert.deepEqual(ids,data.members.map(m=>m.id));assert.equal(new Set(ids).size,count);
  for(const m of data.members){assert.ok(html.includes(m.cnName));assert.ok(html.includes(m.stageName));}
  if(slug==='triples'){assert.ok(html.includes('完整名册 · '+count+' 人'));assert.ok(!html.includes('data-s-number='),'synthetic IDs must not acquire official S numbers');}else if(slug==='loona'){assert.ok(html.includes('历史成员 · '+count+' 人'));assert.ok(!html.includes('ca-ordinal'));}else assert.ok(html.includes(`class="ca-ordinal">${String(count).padStart(2,'0')}</span>`));assert.equal(JSON.stringify(data),before);
 });
 test(`${slug}: final-member deep link keeps zero, unknown and cross-group historical bindings`,()=>{
  const {c,data,last}=scenario(slug,count),before=JSON.stringify(data),r=renderer(data,`/artists/${slug}?section=members&member=${last.id}`);
  const scoped=r.load('lib/idol/artist-catalog.ts').projectArtistCatalog(data,c.groupId),html=renderer(scoped,`/artists/${slug}?section=members&member=${last.id}`).render(c);
  assert.ok(html.includes(last.cnName));assert.ok(html.includes(`member=${last.id}`));assert.ok(html.includes('表现 0.0 · 造型 未评分'));assert.ok(html.includes('表现 未评分 · 造型 未评分'));
  for(const w of data.works){assert.ok(html.includes(`data-member-work-trigger="${w.id}"`));assert.ok(html.includes(`work=${w.id}`));}
  const list=renderer(scoped,`/artists/${slug}?section=works`).render(c);assert.ok(list.includes('本团零分测试曲'));assert.ok(list.includes('本团未知分测试曲'));assert.ok(!list.includes('跨团历史测试曲'));assert.ok(list.includes('<b>0.0</b>'));assert.ok(list.includes('<b>未评分</b>'));assert.equal(JSON.stringify(data),before);
 });
 test(`${slug}: unknown and foreign member IDs remain an explicit empty state`,()=>{
  const {c,data}=scenario(slug,count);for(const id of ['recDensityUnknown',`recDensity${slug==='loona'?'vcha':'loona'}Member1`]){const html=renderer(data,`/artists/${slug}?section=members&member=${id}`).render(c);assert.ok(html.includes('这个成员不在本团档案中。'));assert.ok(!html.includes('ca-member-identity'));}
 });
}
test('historical IZ*ONE roster does not invent clickable members from twelve-person prose',()=>{
 const c=content('izone'),data={...fixture,members:[],ratings:[]},html=renderer(data,'/artists/izone?section=members').render(c);assert.ok(html.includes('尚无关联的成员记录'));assert.ok(html.includes('十二人'));assert.ok(!html.includes('data-artist-member-trigger='));
});

test('candidate member page retains the database profile/link once and private records unchanged',()=>{const {c,data,last}=scenario('triples',24);last.profile='数据库介绍唯一';last.officialUrl='https://example.com/member';const before=JSON.stringify(data),s=renderer(data,`/artists/triples?section=members&member=${last.id}`).render(c);assert.equal((s.match(/数据库介绍唯一/g)||[]).length,1);assert.equal((s.match(/相关官方页面/g)||[]).length,1);assert.ok(s.indexOf('数据库介绍唯一')<s.indexOf('作品综合分'));assert.equal(JSON.stringify(data),before);});
