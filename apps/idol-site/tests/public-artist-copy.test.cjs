'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const registry=require('../HANDOFF/artist-registry51.json');
const esbuild=require('esbuild');
const {explicitTestAliases}=require('./fixtures/timeline-host/explicit-test-aliases.cjs');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'public-artist-copy-'));
let bundle;
const audit=/未知|待核|核验|核对于|核于|仅证|不作.{0,12}证明|事实补全|来源不足|不能当作|摄影时期|拍摄.{0,8}(未确认|未注明|未载)|当前阵容证明/;
test.before(async()=>{const output=path.join(temp,'routes.cjs');await esbuild.build({entryPoints:['tests/fixtures/public-copy/entry.tsx'],bundle:true,outfile:output,platform:'node',format:'cjs',jsx:'automatic',external:['react','react/*'],loader:{'.css':'empty'},nodePaths:[path.resolve('node_modules')],plugins:[{name:'actual-public-artist-documents',setup(build){build.onResolve({filter:/^@\/data\/.*-artist\.json$/},args=>({path:path.resolve(args.path.slice(2))}));}},explicitTestAliases()],metafile:true,logLevel:'silent'}).then(result=>{assert.ok(Object.keys(result.metafile.inputs).some(p=>p==='data/badvillain-artist.json'));assert.ok(!Object.keys(result.metafile.inputs).some(p=>/data\/snapshot/.test(p)));});bundle=require(output);});
test.after(()=>fs.rmSync(temp,{recursive:true,force:true}));
function render(artist,section='overview',extra={}){const input={schemaVersion:1,groupId:artist.groupId,slug:artist.slug,events:[],gaps:[]};return renderToStaticMarkup(React.createElement(bundle.ArtistTimelineHostProvider,{value:{catalog:bundle.publicCatalog,input,loading:false,styleReady:true,serverRoute:artist.path+'?section='+section,...extra}},React.createElement(bundle.routes[artist.slug])));}
for(const artist of registry)test(`${artist.slug}: all five public sections omit internal audit prose`,()=>{
 for(const section of ['overview','members','works','updates','records']){
  const html=render(artist,section);assert.doesNotMatch(html,audit,`${artist.slug}/${section}`);
  assert.match(html,/仅自己可见/);
 }
 const member=bundle.publicCatalog.members.find(m=>m.groupIds.includes(artist.groupId));
 if(member)assert.doesNotMatch(render(artist,'members',{serverRoute:artist.path+'?section=members&member='+member.id}),audit,artist.slug+'/member');
});
test('BADVILLAIN uses month-precision reviewed debut and keeps its actual photo source readable',()=>{
 const artist=registry.find(a=>a.slug==='badvillain');const html=render(artist);
 assert.match(html,/BADVILLAIN 于 2024 年 6 月以《OVERSTEP》出道/);assert.doesNotMatch(html,/把节拍留在身体里|从一段舞台进入作品|2024 年 6 月 3 日/);
 assert.match(html,/https:\/\/music.bugs.co.kr\/artist\/20212684/);assert.match(html,/图片来源/);
 const source=require('../data/badvillain-artist.json');assert.match(source.hero.caption,/拍摄时期未知，不作当前阵容证明/);assert.ok(source.gaps.length);
});
test('real read errors and business empty states survive copy projection',()=>{
 const artist=registry.find(a=>a.slug==='badvillain');assert.match(render(artist,'overview',{catalog:null,error:'读取失败，请重试'}),/读取失败，请重试/);
 const empty={...bundle.publicCatalog,members:[],works:[],ratings:[]};const html=render(artist,'overview',{catalog:empty});assert.match(html,/尚无关联作品/);assert.match(html,/未评分/);
 const records=render(artist,'records',{catalog:empty});assert.match(records,/尚无发行记录/);
 const members=render(artist,'members',{catalog:empty});assert.match(members,/尚无关联的成员记录/);
});
test('zero score remains a number, not an absent score',()=>{
 const artist=registry.find(a=>a.slug==='badvillain');const seed=bundle.publicCatalog.works.find(w=>w.groupIds.includes(artist.groupId));assert.ok(seed);
 const data={...bundle.publicCatalog,works:[{...seed,score:0,stageScore:0}]};assert.match(render(artist,'works',{catalog:data}),/<b>0.0<\/b>/);
});

test('all 51 group index cards use public prose and retain counts and zero scores',()=>{
 for(const artist of registry){const group=bundle.publicCatalog.groups.find(g=>g.id===artist.groupId);const data={...bundle.publicCatalog,works:bundle.publicCatalog.works.map(w=>({...w,score:0}))};const html=renderToStaticMarkup(React.createElement(bundle.GroupIndexCard,{group,data,onOpen(){},renderPhoto(){return null;}}));assert.doesNotMatch(html,audit,artist.slug);assert.match(html,/进入团体主页/);assert.match(html,/0.0/);}
});
test('every official candidate portrait credit is projected while provenance remains unchanged',()=>{
 for(const artist of registry){const d=JSON.parse(fs.readFileSync(`data/${artist.slug}-artist.json`,'utf8'));for(const [id,photo] of Object.entries(d.portraits??{})){const before=JSON.stringify(photo);const selected=bundle.candidatePortrait({id,stageName:photo.stageName,photo:null},d.portraits);assert.doesNotMatch(selected.credit,audit,artist.slug);assert.equal(selected.image,photo.image);assert.equal(selected.sourceUrl,photo.sourceUrl);assert.equal(JSON.stringify(photo),before);}}
});
test('physical facts retain historical date and source without exposing evidence scope',()=>{
 const record={recordId:'recPublicFact',stageName:'Example',verified:true,measurements:{heightCm:{value:170,sourceUrl:'https://example.com/profile',sourceTitle:'官方资料',sourceKind:'official',publishedAt:'2020-01-01',checkedAt:'2026-10-16',scope:'核验限制：不作为当前测量证明'}}};const html=renderToStaticMarkup(React.createElement(bundle.MemberPhysicalFacts,{member:{id:'recPublicFact',stageName:'Example',birthDate:'2000-01-01'},record}));assert.match(html,/170 cm/);assert.match(html,/2020-01-01/);assert.match(html,/https:\/\/example.com\/profile/);assert.doesNotMatch(html,audit);assert.match(record.measurements.heightCm.scope,/核验限制/);
});

test('actual personal-note JSX preserves audit-like words verbatim in notes and memories',()=>{
 const ts=require('typescript'),vm=require('node:vm');
 const sentinel='我的原话：未知、待核、核验、来源不足，喜欢这段表现。';
 const found=new Set();
 for(const filename of ['app/page.tsx','components/group-detail.tsx']){
  const source=fs.readFileSync(filename,'utf8'),ast=ts.createSourceFile(filename,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  function visit(node){
   if(ts.isJsxElement(node)&&node.openingElement.tagName.getText(ast)==='p'){
    const cls=node.openingElement.attributes.properties.find(a=>ts.isJsxAttribute(a)&&a.name.getText(ast)==='className');
    if(cls&&['"my-note"','"memory"','"cast-note"'].includes(cls.initializer?.getText(ast))){
     const expression=node.getText(ast),key=['work.note','m.note','g.note','r.note','r.memory'].find(x=>expression.includes('{'+x+'}'));
     assert.ok(key,'Personal text must remain directly bound, never sanitized: '+expression);found.add(key);
     const js=ts.transpileModule('exports.render=()=>('+expression+');',{compilerOptions:{jsx:ts.JsxEmit.React,target:ts.ScriptTarget.ES2022}}).outputText;
     const exports={},record={note:sentinel,memory:sentinel};vm.runInNewContext(js,{React,exports,work:record,m:record,g:record,r:record});
     assert.ok(renderToStaticMarkup(exports.render()).includes(sentinel));
    }
   }
   ts.forEachChild(node,visit);
  }
  visit(ast);
 }
 assert.deepEqual([...found].sort(),['g.note','m.note','r.memory','r.note','work.note'].sort());
});
