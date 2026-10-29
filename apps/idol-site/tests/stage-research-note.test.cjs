const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const load=require('./helpers/public-artist-loader.cjs');
const {stageSupplementForWork,validStageSearchReview}=load('lib/idol/supplements.ts');
const {validStageResearchNote}=load('lib/idol/stage-public-research.ts');
const {projectPublicCatalog}=load('lib/idol/public-catalog.ts');
const {stageForWork}=load('lib/idol/stage.ts');
const {stageMatches}=load('lib/idol/stage-display.ts');
const {formatStageTime}=load('lib/idol/stage-source.ts');
const productCopy=load('lib/idol/product-copy.ts');
const metadata=require('../data/stages/supplements.json'),id='recvxyOz5Xo5fW';
const source=fs.readFileSync(path.join(__dirname,'../app/page.tsx'),'utf8');
const start=source.indexOf('function StageSupplements('),end=source.indexOf('function PageTitle(',start);
const code=ts.transpileModule('export '+source.slice(start,end),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.React}}).outputText;
const component={};vm.runInNewContext(`(function(exports){${code}})`,{React,ArrowUpRight:()=>null,platformLabel:{youtube:'YouTube'},validStageResearchNote,...productCopy,formatStageTime})(component);
const render=work=>renderToStaticMarkup(React.createElement(component.StageSupplements,{work}));
const fixture=()=>({mode:'live',groups:[],members:[],ratings:[],works:[{id,stage:null,score:0,stageScore:0,stageSupplement:stageSupplementForWork(id)}],counts:{}});

test('Hey Gabby review-only content reaches anonymous projection and renders a collapsed, read-only source disclosure',()=>{
 const catalog=fixture(),before=structuredClone(catalog),out=projectPublicCatalog(catalog),work=out.works[0];
 assert.equal(work.stageSupplement.searchReview,undefined);
 assert.deepEqual(Object.keys(work.stageSupplement.researchNote).sort(),['sources','summary']);
 assert.equal(work.stageSupplement.researchNote.sources.length,3);
 const html=render(work);assert.match(html,/<details class="caption-help stage-research-note"><summary>待核说明与来源<\/summary>/);
 assert.doesNotMatch(html,/<details[^>]*\bopen\b/);
 for(const url of ['https://www.youtube.com/watch?v=XSpYaEdpKxY','https://music.bugs.co.kr/mv/608040','https://www.newsis.com/view/NISX20220518_0001876354'])assert.ok(html.includes(`href="${url}" target="_blank" rel="noopener noreferrer"`));
 assert.match(html,/仍待核验，不用于本条舞台评分/);
 assert.doesNotMatch(html,/<input|<form|<iframe|<button|保存作品修改|owner|保存日志|versionMatch|completeness|verification_limited|Music Bank/);
 assert.equal(stageForWork(id),null);assert.equal(stageMatches(work,'ready'),false);assert.equal(work.stageScore,0);assert.equal(work.score,0);
 assert.deepEqual(work.stageSupplement.alternatives,[]);assert.equal(work.stageSupplement.watchLeads,undefined);
 assert.deepEqual(catalog,before);
});

test('anonymous Hey Gabby disclosure shows the human participation finding without creating stage or member scores',()=>{
 const catalog=fixture(),snapshot=structuredClone(catalog),publicWork=projectPublicCatalog(catalog).works[0];
 const html=render(publicWork);
 assert.match(html,/人工看片已确认.*7名成员均参与/);
 assert.match(html,/视频首尾是否完整、语言和音轨是否与原曲一致仍待核验/);
 assert.match(html,/目前尚未采用为本条舞台/);
 assert.ok(html.includes('https://www.youtube.com/watch?v=XSpYaEdpKxY'));
 assert.ok(html.includes('https://music.bugs.co.kr/mv/608040'));
 assert.doesNotMatch(html,/<iframe|<input|<button|cast-scores|版本已确认|完整播放已确认/);
 assert.equal(publicWork.stage,null);assert.equal(stageMatches(publicWork,'ready'),false);
 assert.equal(publicWork.score,0);assert.equal(publicWork.stageScore,0);
 assert.deepEqual(publicWork.stageSupplement.alternatives,[]);assert.equal(publicWork.stageSupplement.watchLeads,undefined);
 assert.deepEqual(catalog.ratings,[]);assert.deepEqual(catalog,snapshot);
});

test('only an explicitly reviewed note is public; historical raw review fields and nested unknown fields never cross the boundary',()=>{
 const ids=Object.keys(metadata.works),notes=ids.filter(workId=>stageSupplementForWork(workId)?.researchNote);
 assert.deepEqual(notes.slice().sort(),[id,'recvxyH5pzoMAf','rec28ldfRTrOnV'].sort());assert.equal(ids.length-notes.length,134);
 const catalog=fixture(),s=catalog.works[0].stageSupplement;
 s.searchReview.summary='RAW_REVIEW_SECRET';s.searchReview.limitations.push('OWNER_LOG_SECRET');s.searchReview.excluded.push({title:'EXCLUDED_SECRET',url:'https://example.com/',reason:'PRIVATE_REASON'});
 s.researchNote.internal='PRIVATE_NOTE_EXTRA';s.researchNote.sources[0].credential='PRIVATE_SOURCE_EXTRA';
 const out=projectPublicCatalog(catalog),json=JSON.stringify(out);
 assert.doesNotMatch(json,/RAW_REVIEW_SECRET|OWNER_LOG_SECRET|EXCLUDED_SECRET|PRIVATE_REASON|PRIVATE_NOTE_EXTRA|PRIVATE_SOURCE_EXTRA|searchReview|publicNote|excluded|limitations/);
 assert.deepEqual(Object.keys(out.works[0].stageSupplement.researchNote.sources[0]).sort(),['label','url']);
 const review=metadata.works[id].searchReview;
 assert.equal(validStageSearchReview(review),true);
 for(const patch of [{outcome:'not_found_in_scope',accessLimited:false},{reviewComplete:true,reopenRequirement:'test reopening'}])assert.equal(validStageSearchReview({...review,...patch}),false);
 const old={alternatives:[],searchReview:{...review,publicNote:undefined}};
 assert.equal(render({stage:null,stageSupplement:old}),'','raw research is not an automatic public display');
});

test('research disclosure fails closed on unsafe links or malformed fields and escapes text as plain content',()=>{
 const note=structuredClone(metadata.works[id].searchReview.publicNote);
 for(const url of ['javascript:alert(1)','data:text/html,test','http://example.com/','//example.com/','https://127.0.0.1/','https://[::1]/','https://user:pass@example.com/','https://example.com:8443/']){
  const invalid={...note,sources:[{label:'Source',url}]};assert.equal(validStageResearchNote(invalid),false,url);
  assert.equal(render({stage:null,stageSupplement:{alternatives:[],researchNote:invalid}}),'',url);
  assert.equal(validStageSearchReview({...metadata.works[id].searchReview,publicNote:invalid}),false,url);
 }
 for(const invalid of [null,[],{...note,summary:{}},{...note,sources:[]},{...note,sources:[null]},{...note,sources:[{label:{},url:'https://example.com/'}]},{...note,owner:'private'},{...note,sources:[{label:'Source',url:'https://example.com/',token:'private'}]}])assert.equal(validStageResearchNote(invalid),false);
 const malicious={summary:'<script>alert(1)</script>',sources:[{label:'<img src=x onerror=alert(1)>',url:'https://example.com/'}]};
 const html=render({stage:null,stageSupplement:{alternatives:[],researchNote:malicious}});
 assert.match(html,/&lt;script&gt;/);assert.match(html,/&lt;img/);assert.doesNotMatch(html,/<script|<img/);
 const malformed=fixture();malformed.works[0].stageSupplement.researchNote.summary={token:'SECRET'};
 assert.equal(render(projectPublicCatalog(malformed).works[0]),'');
});
