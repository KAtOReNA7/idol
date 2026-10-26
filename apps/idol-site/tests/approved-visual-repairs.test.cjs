const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),postcss=require('postcss');
const cache=new Map();
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));const out={};cache.set(file,out);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;vm.runInNewContext('(function(require,exports){'+code+'})',{URL,URLSearchParams})(name=>{const image=require('./helpers/image-dependency-loader.cjs').imageDependency(name);if(image!==undefined)return image;const timeline=require('./helpers/timeline-dependency-loader.cjs').timelineDependency(name);if(timeline!==undefined)return timeline;if(name.endsWith('.css'))return {};if(name.startsWith('@/')||name.startsWith('.')){const target=name.startsWith('@/')?name.slice(2):path.join(path.dirname(file),name);return load([target,target+'.ts',target+'.tsx'].find(p=>fs.existsSync(p)&&fs.statSync(p).isFile()));}return require(name);},out);return out;}
const css=postcss.parse(fs.readFileSync('app/artists/loona/loona-inner.css','utf8'));
// Cascade comparison includes specificity: a later, less-specific 100% rule caused the defect.
function styles(target,width){const result={},priority={};let order=0;css.walkRules(rule=>{order++;let parent=rule.parent;while(parent&&parent.type!=='root'){if(parent.type==='atrule'&&parent.name==='media'){const max=parent.params.match(/max-width:(\d+)px/);if(max&&width>+max[1])return;}parent=parent.parent;}if(!target.includes(rule.selector))return;const specificity=(rule.selector.match(/\.[\w-]+/g)||[]).length;for(const d of rule.nodes.filter(n=>n.type==='decl')){const rank=specificity*10000+order;if(!priority[d.prop]||rank>=priority[d.prop]){result[d.prop]=d.value;priority[d.prop]=rank;}}});return result;}
test('LOONA header return remains bounded against generic full-width actions at desktop and mobile',()=>{
 for(const width of [320,390,800,801,1165,1440]){
  const action=styles(['.loona-history.ln-approved-inner .ln-inner-action','.ln-approved-inner .ln-inner-brandrow>.ln-inner-action','.loona-history.ln-approved-inner .ln-inner-brandrow>.ln-inner-action'],width);
  assert.equal(action['max-width'],'124px');assert.equal(action.width,width<=800?'100%':'124px');
  const label=styles(['.ln-approved-inner .ln-inner-brandrow>span'],width);assert.equal(label['white-space'],'nowrap');assert.equal(label['min-width'],'max-content');
  const content=width-(width<=800?32:128);assert.ok(width<=800?(content-12)/2>=130:content-174-124-24>=64);
  if(width<=800)assert.equal(label['grid-column'],'1 / -1');
 }
});
test('LOONA index derives historical count from existing identities, independent of current group relations',()=>{
 const group={id:'recvxyEBDZJAXm',name:'LOONA'},members=JSON.parse(fs.readFileSync('tests/fixtures/loona-public-identities.json'));const data={groups:[group],members,works:[],ratings:[]};const before=JSON.stringify(data);
 const {GroupIndexCard}=load('components/group-detail.tsx');
 const render=()=>renderToStaticMarkup(React.createElement(GroupIndexCard,{group,data,onOpen(){},renderPhoto(){return null}}));
 assert.match(render(),/12 位收录成员/);assert.match(render(),/历史/);assert.doesNotMatch(render(),/当前阵容/);
 assert.equal(load('lib/idol/group-detail.ts').groupCollection(data,group).members.length,11);assert.equal(JSON.stringify(data),before);
 data.members=members.filter(m=>m.id!=='recvxyICzHTm4b');assert.match(render(),/11 位收录成员/);
 data.members=[];assert.match(render(),/0 位收录成员/);
});
test('BADVILLAIN independently verified exact debut date orders before HURRICANE with production sorter',()=>{
 const doc=JSON.parse(fs.readFileSync('data/artist-timelines/badvillain.json'));const events=load('lib/idol/timeline/model.ts').selectChronologicalTimeline(doc.events);
 assert.equal(events[0].id,'e-badvillain-official-debut');assert.deepEqual(events[0].eventDate,{value:'2024-06-03',precision:'day'});assert.equal(events[1].id,'e-badvillain-hurricane-audio-single');
 const source=events[0].sources.find(s=>s.id==='visual-repair-badvillain-overstep-bugs');assert.ok(source);const evidence=JSON.parse(fs.readFileSync(source.evidenceRef));assert.equal(evidence.eventId,events[0].id);assert.equal(evidence.dateMetadata,'2024.06.03');assert.match(evidence.excerpt,/6월 3일 데뷔 앨범/);
 assert.deepEqual(events[0].workIds,['rec28ldfRTrEzJ','rec28ldfRTrEGO','rec28ldfRTrEsc']);
});

test('MADEIN exact existing RISE carrier becomes visible once with digital release date and original work links',()=>{
 const doc=JSON.parse(fs.readFileSync('data/artist-timelines/madein.json')),id='e-madein-rise-release-carrier-hold';
 const ordered=load('lib/idol/timeline/model.ts').selectChronologicalTimeline(doc.events),rise=ordered.find(e=>e.id===id);
 assert.ok(rise);assert.equal(ordered.filter(e=>e.releaseKey==='madein-rise').length,1);assert.equal(rise.status,'confirmed');assert.equal(rise.reviewStatus,'ready');assert.deepEqual(rise.holdReasons,[]);
 assert.deepEqual(rise.eventDate,{value:'2024-09-03',precision:'day'});assert.deepEqual(rise.workIds,['rec28ldfRTrCvB','rec28ldfRTrCzF','rec28ldfRTrCDJ']);assert.deepEqual(rise.memberIds,[]);
 const correction=JSON.parse(fs.readFileSync('evidence/approved-visual-repairs/madein-rise-correction.json'));assert.equal(correction.before.reviewStatus,'hold');
 const beforeIds=doc.events.filter(e=>e.id!==id).map(e=>e.id);assert.equal(new Set(beforeIds).size,beforeIds.length);
 const evidence=JSON.parse(fs.readFileSync(rise.sources.at(-1).evidenceRef));assert.equal(evidence.format,'digital EP');assert.equal(evidence.previewVerification.httpStatus,200);assert.equal(evidence.tracks.length,4);
 const registry=JSON.parse(fs.readFileSync('data/artist-timeline-registry.json')),events=registry.flatMap(g=>JSON.parse(fs.readFileSync(`data/artist-timelines/${g.slug}.json`)).events);
 assert.equal(events.length,623);assert.equal(events.filter(e=>e.reviewStatus==='ready').length,609);assert.equal(events.filter(e=>e.reviewStatus==='hold').length,14);
});
