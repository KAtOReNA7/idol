const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),zlib=require('node:zlib');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const root=path.resolve(__dirname,'..'),original=JSON.parse(fs.readFileSync(path.join(root,'data/member-careers/periods.json')));
function loader(legacy=false){
 const cache=new Map();
 function load(rel){
  const file=path.resolve(root,rel);if(cache.has(file))return cache.get(file);
  if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file));
  if(legacy&&file.endsWith('/member-career-runtime.ts')){const full=load('lib/idol/member-career-display.ts');return {...full,memberCareerSources:full.memberCareerMetadata.sources};}
  const out={};cache.set(file,out);
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  vm.runInNewContext('(function(require,exports){'+code+'})',{URL,Date})(name=>{
   if(name.endsWith('.css'))return {};
   if(name.startsWith('@/')){const p=name.slice(2);return load(fs.existsSync(path.join(root,p))?p:p+'.ts');}
   return require(name);
  },out);return out;
 }
 return load;
}
const load=loader(),legacyLoad=loader(true),full=load('lib/idol/member-career-display.ts'),runtime=load('lib/idol/member-career-runtime.ts');
const Current=load('components/member-career-facts.tsx').MemberCareerFacts,Legacy=legacyLoad('components/member-career-facts.tsx').MemberCareerFacts;
const plain=value=>JSON.parse(JSON.stringify(value));
function members(){
 const ids=[...new Set(original.periods.map(p=>p.memberId))];
 return ids.flatMap(id=>{
  const groups=[...new Set(original.periods.filter(p=>p.memberId===id).map(p=>p.groupId))];
  const base={id,profile:'保留现有介绍',officialUrl:'https://example.com/profile',note:'PRIVATE_NOTE_SENTINEL',favorite:9};
  return [
   {...base,groupIds:groups,formerGroupIds:[]},
   {...base,groupIds:[],formerGroupIds:groups},
   {...base,groupIds:groups.slice(0,1),formerGroupIds:groups.slice(1)},
   {...base,groupIds:[],formerGroupIds:[]},
   {...base,id:'unknown-member',groupIds:groups,formerGroupIds:[]},
   ...groups.map(groupId=>({...base,groupIds:[groupId],formerGroupIds:[]})),
  ];
 });
}
test('compact runtime facts are exhaustive equivalents for every member and current/former/group identity',()=>{
 for(const member of members())assert.deepEqual(plain(runtime.memberCareerFacts(member)),plain(full.memberCareerFacts(member)),JSON.stringify(member));
});
test('every member renders identical synchronous HTML, sources and private-field behavior',()=>{
 for(const member of members()){
  const before=JSON.stringify(member);
  for(const officialUrl of [member.officialUrl,...original.sources.slice(0,1).map(s=>s.url),'javascript:alert(1)']){
   const props={member:{...member,officialUrl}};
   const actual=renderToStaticMarkup(React.createElement(Current,props));
   assert.equal(actual,renderToStaticMarkup(React.createElement(Legacy,props)),member.id);
   assert.doesNotMatch(actual,/PRIVATE_NOTE_SENTINEL/);
  }
  assert.equal(JSON.stringify(member),before);
 }
});
test('public projection is fresh, allowlisted, source-exact and materially smaller',async()=>{
 const {generate,projectMemberCareers}=await import('../scripts/build-artist-runtime-data.mjs');generate({check:true});
 const projected=JSON.parse(fs.readFileSync(path.join(root,'data/runtime/member-careers/periods.json')));
 assert.deepEqual(projected,projectMemberCareers(original));
 assert.deepEqual(Object.keys(projected),['periods','eventSets','sources']);
 for(const period of projected.periods)assert.deepEqual(Object.keys(period),['periodId','memberId','groupId','eventSet']);
 for(const details of projected.eventSets){assert.deepEqual(Object.keys(details),['events','sourceIds']);for(const event of details.events)assert.deepEqual(Object.keys(event).sort(),['date','label','precision']);}
 for(const source of projected.sources)assert.deepEqual(source,original.sources.find(s=>s.sourceId===source.sourceId));
 const raw=JSON.stringify(original),compact=JSON.stringify(projected);
 assert.ok(Buffer.byteLength(compact)<Buffer.byteLength(raw)*0.5);
 assert.ok(zlib.gzipSync(compact).length<zlib.gzipSync(raw).length*0.85);
});
test('component imports no full metadata and full authenticated export is unchanged',()=>{
 const component=fs.readFileSync(path.join(root,'components/member-career-facts.tsx'),'utf8');
 const runtimeSource=fs.readFileSync(path.join(root,'lib/idol/member-career-runtime.ts'),'utf8');
 const core=fs.readFileSync(path.join(root,'lib/idol/member-career-core.ts'),'utf8');
 assert.match(component,/@\/lib\/idol\/member-career-runtime/);
 assert.doesNotMatch(component,/member-career-display|React\.lazy|Suspense/);
 assert.doesNotMatch(runtimeSource,/from ['"]@\/data\/member-careers|member-career-display/);
 assert.doesNotMatch(core,/from ['"]@\/data/);
 const exportRoute=fs.readFileSync(path.join(root,'app/api/export/route.ts'),'utf8');
 assert.match(exportRoute,/memberCareerMetadata.*from '@\/lib\/idol\/member-career-display'/);
 assert.equal((exportRoute.match(/memberCareers:memberCareerMetadata/g)||[]).length,2);
 assert.match(exportRoute,/private, no-store/);
});
