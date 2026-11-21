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
const {artistCatalog, renderArtist, nativeSlugs} = require('./fixtures/current-artist-pages.cjs');
const visible = html => html.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
for(const artist of registry)test(`${artist.slug}: public navigation keeps research-only input out of the visible page`, async()=>{
 const catalog=artistCatalog(artist);
 const member=catalog.members.find(m=>m.groupIds.includes(artist.groupId)||m.formerGroupIds?.includes(artist.groupId));
 const routes=[{}, {section:'members'}, {section:'works'}, {section:'updates'}];
 if(member)routes.push({section:'members',member:member.id});
 const document=require(`../data/artist-timelines/${artist.slug}.json`);
 const held=document.events.map(e=>e.reviewStatus==='hold'?{...e,title:'INTERNAL_HELD_EVENT',summary:'INTERNAL_HELD_EVENT'}:e);
 const input={...document,events:held,gaps:['INTERNAL_RESEARCH_NOTE']};
 for(const query of routes){
  const html=await renderArtist(artist,query,catalog,{groups:registry,input});
  const text=visible(html);
  assert.doesNotMatch(text,/INTERNAL_RESEARCH_NOTE|INTERNAL_HELD_EVENT|事实补全|核验限制：|仅自己可见/);
  if(nativeSlugs.has(artist.slug)){
   assert.ok(html.includes(`data-${artist.slug}-native-host="true"`));
   assert.match(html,/role="status"/);
   assert.match(text,/正在|读取/);
  }else{
   assert.match(html,/<(?:h1|h2|main)\b/);
   assert.ok(text.length>10);
  }
 }
});
test('BADVILLAIN labels the sourced release date and keeps the original photo provenance',async()=>{
 const artist=registry.find(a=>a.slug==='badvillain');
 const html=await renderArtist(artist,{section:'works',release:'badvillain-overstep'});
 assert.match(visible(html),/OVERSTEP.*音源发行 2024-06-03/);
 assert.match(html,/https:\/\/music\.bugs\.co\.kr\/album\/4102279/);
 const original=require('../data/badvillain-artist.json');
 assert.match(original.hero.caption,/拍摄时期未知，不作当前阵容证明/);
 assert.ok(original.gaps.length);
});
test('catalog failure offers retry and the seven public profiles remain available without personal rows',async()=>{
 const artist=registry.find(a=>a.slug==='badvillain');
 const html=await renderArtist(artist,{section:'works'},null,{error:'读取失败，请重试'});
 assert.match(visible(html),/私人记录暂时无法读取。 重试/);
 assert.match(visible(html),/OVERSTEP/);
 const empty={...artistCatalog(artist),members:[],works:[],ratings:[]};
 const roster=await renderArtist(artist,{section:'members'},empty);
 assert.equal((visible(roster).match(/个人详情/g)||[]).length,7);
 assert.doesNotMatch(roster,/\/api\/save/);
});
function indexCard(artist,value){
 const data=artistCatalog(artist);
 const group=data.groups.find(g=>g.id===artist.groupId);
 const works=data.works.map(w=>({...w,score:value}));
 return renderToStaticMarkup(React.createElement(bundle.GroupIndexCard,{group,data:{...data,works},onOpen(){},renderPhoto(){return null;}}));
}
test('score-aware group cards distinguish a numeric zero from an unrated catalog',()=>{
 const artist=registry.find(a=>a.slug==='katseye');
 assert.match(visible(indexCard(artist,0)),/我的 MV 均分 0\.0/);
 assert.doesNotMatch(visible(indexCard(artist,null)),/我的 MV 均分/);
});
test('all 51 group index cards expose the correct stable browse anchor and a named control',()=>{
 for(const artist of registry){
  const html=indexCard(artist,0);
  assert.ok(html.includes(`data-browse-anchor="group-${artist.groupId}"`),artist.slug);
  assert.match(html,/<button\b/);
  assert.ok(visible(html).length>3);
  assert.doesNotMatch(visible(html),/事实补全|核验限制：/);
 }
});
test('every official candidate portrait credit is projected while provenance remains unchanged',()=>{
 for(const artist of registry){const d=JSON.parse(fs.readFileSync(`data/${artist.slug}-artist.json`,'utf8'));for(const [id,photo] of Object.entries(d.portraits??{})){const before=JSON.stringify(photo);const selected=bundle.candidatePortrait({id,stageName:photo.stageName,photo:null},d.portraits);assert.doesNotMatch(selected.credit,audit,artist.slug);assert.equal(selected.image,photo.image);assert.equal(selected.sourceUrl,photo.sourceUrl);assert.equal(JSON.stringify(photo),before);}}
});
test('physical facts retain historical date and source without exposing evidence scope',()=>{
 const record={recordId:'recPublicFact',stageName:'Example',verified:true,measurements:{heightCm:{value:170,sourceUrl:'https://example.com/profile',sourceTitle:'官方资料',sourceKind:'official',publishedAt:'2020-01-01',checkedAt:'2026-10-16',scope:'核验限制：不作为当前测量证明'}}};const html=renderToStaticMarkup(React.createElement(bundle.MemberPhysicalFacts,{member:{id:'recPublicFact',stageName:'Example',birthDate:'2000-01-01'},record}));assert.match(html,/170 cm/);assert.match(html,/2020-01-01/);assert.match(html,/https:\/\/example.com\/profile/);assert.doesNotMatch(html,audit);assert.match(record.measurements.heightCm.scope,/核验限制/);
});
