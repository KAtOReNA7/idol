const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const root=path.resolve(__dirname,'..');function load(file){const e={};const code=ts.transpileModule(fs.readFileSync(root+'/lib/idol/'+file+'.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext('(function(require,exports){'+code+'})',{Set})(name=>require('./helpers/timeline-dependency-loader.cjs').timelineDependency(name)??load(name.replace('./','')),e);return e;}
const {inQueue}=load('queues'),{makeWatchSequence,nextInSequence,matchesWorkScope}=load('watch-sequence'),{defaultFilters}=load('journey');
const groups=[{id:'recG',name:'GROUP',generation:'第五代',ratedCount:3,average:9.5}];
const work=(id,patch={})=>({id,name:'Song '+id,song:'Song '+id,officialTitle:'Music Video',videoType:'MV',version:'',groupIds:['recG'],url:'https://www.youtube.com/watch?v=abcdefghijk',score:null,watched:'未观看',stage:null,...patch});
const data=works=>({works,groups,ratings:[]});
test('MV rating todo requires watched and null; zero and stage/member blanks never qualify',()=>{assert.equal(inQueue(work('recA',{watched:'已观看'}),'unrated',groups),true);for(const patch of [{watched:'未观看'},{watched:''},{watched:'已观看',score:0},{watched:'已观看',score:7,stageScore:null}])assert.equal(inQueue(work('recA',patch),'unrated',groups),false);});
test('next retains original anchor after saved current work leaves queue; skips now-ineligible future works',()=>{const filters={...defaultFilters(),queue:'tonight'};const a=work('recA'),b=work('recB'),c=work('recC');const seq=makeWatchSequence([a,b,c],'待看',filters);const updated=data([{...a,score:9,watched:'已观看'},{...b,watched:'已观看'},c]);assert.equal(nextInSequence(seq,a.id,updated).id,c.id);assert.equal(nextInSequence(seq,c.id,updated),null);});
test('sequence is bounded to its original ordering, excludes placeholders and URL-less entries, does not wrap',()=>{const a=work('recA'),b=work('recB');const seq=makeWatchSequence([a,work('recEmpty',{url:''}),work('recPlace',{placeholder:{}}),b,a],'全部',defaultFilters());assert.deepEqual(Array.from(seq.ids),['recA','recB']);assert.equal(nextInSequence(seq,a.id,data([work('recNew'),b,a])).id,b.id);assert.equal(nextInSequence(seq,b.id,data([a,b])),null);assert.equal(nextInSequence(seq,'recUnknown',data([a,b])),null);assert.equal(nextInSequence(seq,a.id,data([a])),null);});
test('next rechecks group, generation, query and stage scope without promoting alternative videos',()=>{const a=work('recA',{stage:{}}),b=work('recB',{stage:{}}),c=work('recC',{stage:{}});const filters={...defaultFilters(),group:'recG',generation:'第五代',search:'GROUP',stageFilter:'ready'};const seq=makeWatchSequence([a,b,c],'筛选结果',filters);assert.equal(nextInSequence(seq,a.id,data([a,{...b,stage:null,stageSupplement:{alternatives:[{}]}},c])).id,c.id);assert.equal(matchesWorkScope({...c,groupIds:[]},filters,groups),false);});
test('member sequence skips a work whose original member relationship no longer exists',()=>{const a=work('recA'),b=work('recB'),c=work('recC');const seq=makeWatchSequence([a,b,c],'成员作品',defaultFilters(),'recMember');const d=data([a,b,c]);d.ratings=[{workIds:['recC'],memberIds:['recMember']}];assert.equal(nextInSequence(seq,a.id,d).id,c.id);});
test('sequence state contains navigation data only and copies filters rather than mutating them',()=>{const filters=defaultFilters(),seq=makeWatchSequence([work('recA',{score:10,note:'private note'})],'待看',filters);filters.queue='unrated';assert.equal(seq.filters.queue,'all');const json=JSON.stringify(seq);assert.ok(!json.includes('private note'));assert.ok(!json.includes('score'));assert.deepEqual(Object.keys(seq).sort(),['filters','ids','label']);});
test('group timeline and recommendations start an independent group sequence while library cards retain search',()=>{const source=fs.readFileSync(root+'/app/page.tsx','utf8');assert.ok(source.includes("onWork={(w,list,q)=>openWork(w.id,list,chosenGroup.name+' · '+(queueLabels[q]??'全部作品'),{...defaultFilters(),queue:q,group:chosenGroup.id})}"));const a=work('recA'),b=work('recB'),filtered={...defaultFilters(),search:'NO-MATCH',group:'recG'};const independent=makeWatchSequence([a,b],'时间线',{...defaultFilters(),group:'recG'});assert.equal(nextInSequence(independent,a.id,data([a,b])).id,b.id);const library=makeWatchSequence([a,b],'本团搜索',filtered);assert.equal(nextInSequence(library,a.id,data([a,b])),null);});

const {sortWorks}=load('watch-sequence');
const ids=works=>Array.from(works,w=>w.id);
test('library default sort preserves input and every sort is non-mutating and stable',()=>{
 const rows=[work('recC',{score:7,releaseDate:'2024-02-29'}),work('recA',{score:7,releaseDate:'2024-02-29'}),work('recB',{score:null,releaseDate:''})];
 const before=JSON.stringify(rows);Object.freeze(rows);rows.forEach(Object.freeze);
 for(const sort of [undefined,'default','score-desc','release-desc','release-asc'])assert.deepEqual(ids(sortWorks(rows,sort)),['recC','recA','recB']);
 assert.notEqual(sortWorks(rows),rows);assert.equal(JSON.stringify(rows),before);
});
test('MV sort retains zero, sorts only MV score, and puts null/non-finite scores last stably',()=>{
 const rows=[work('recNull',{score:null,stageScore:10}),work('recZero',{score:0,stageScore:null}),work('recNine',{score:9,stageScore:0}),work('recNaN',{score:NaN}),work('recInf',{score:Infinity}),work('recNineAgain',{score:9})];
 assert.deepEqual(ids(sortWorks(rows,'score-desc')),['recNine','recNineAgain','recZero','recNull','recNaN','recInf']);
});
test('calendar date sorts keep unknown and impossible dates last in both directions',()=>{
 const rows=[work('recEmpty',{releaseDate:''}),work('recOld',{releaseDate:'2023-12-31'}),work('recLeap',{releaseDate:'2024-02-29'}),work('recInvalidLeap',{releaseDate:'2023-02-29'}),work('recPartial',{releaseDate:'2025-03'}),work('recInvalidDay',{releaseDate:'2025-02-30'}),work('recNew',{releaseDate:'2025-01-01'}),work('recLeapTie',{releaseDate:'2024-02-29'}),work('recUnknown',{releaseDate:'未知'})];
 const unknown=['recEmpty','recInvalidLeap','recPartial','recInvalidDay','recUnknown'];
 assert.deepEqual(ids(sortWorks(rows,'release-desc')),['recNew','recLeap','recLeapTie','recOld',...unknown]);
 assert.deepEqual(ids(sortWorks(rows,'release-asc')),['recOld','recLeap','recLeapTie','recNew',...unknown]);
});
test('filtered library is sorted before pagination and the full sequence follows that order across pages',()=>{
 const rows=Array.from({length:30},(_,i)=>work('recSorted'+i,{score:i,releaseDate:`2024-01-${String(i+1).padStart(2,'0')}`}));
 rows.push(work('recFilteredOut',{score:100,groupIds:['recOther']}));
 const filters={...defaultFilters(),group:'recG',sort:'score-desc',limit:24};
 const sorted=sortWorks(rows.filter(w=>matchesWorkScope(w,filters,groups)),filters.sort),visible=sorted.slice(0,filters.limit);
 assert.equal(sorted.length,30);assert.equal(visible.length,24);assert.equal(visible[0].id,'recSorted29');
 const seq=makeWatchSequence(sorted,'作品库',filters);assert.equal(seq.filters.sort,'score-desc');
 assert.equal(nextInSequence(seq,visible.at(-1).id,data(rows)).id,'recSorted5');
 // Saved ratings cannot reshuffle an in-progress viewing session.
 const changed=rows.map(w=>({...w,score:100-w.score}));
 assert.equal(nextInSequence(seq,visible[0].id,data(changed)).id,'recSorted28');
 assert.equal(nextInSequence(seq,sorted.at(-1).id,data(rows)),null);
});
test('library host delegates bounded pages while the full filtered sort defines the sequence',()=>{
 const source=fs.readFileSync(root+'/app/page.tsx','utf8');
 assert.ok(source.includes('<LibraryBrowser catalog={data}'));
 assert.ok(source.includes('page={libraryPage} pageSize={libraryPageSize} onPageChange={journey.setLibraryPage}'));
 assert.ok(source.includes('sequence.ids.includes(id)?sequence:undefined'));
 assert.ok(!source.includes('filteredWorks.slice(0,limit)'));
 const {buildLibraryModel}=require('./helpers/library-browser-dependency-loader.cjs').libraryBrowserDependency('@/components/library-browser');
 const rows=Array.from({length:60},(_,i)=>work('recPage'+i,{score:i}));
 rows.push(work('recExcluded',{score:100,groupIds:['recOther']}));
 const filters={...defaultFilters(),group:'recG',sort:'score-desc'};
 const model=buildLibraryModel(data(rows),filters,2,24);
 assert.equal(model.orderedWorks.length,60);
 assert.equal(model.rows.length,24);
 assert.deepEqual(ids(model.rows),ids(model.orderedWorks.slice(24,48)));
 assert.equal(model.rows[0].id,'recPage35');
 assert.equal(model.rows.at(-1).id,'recPage12');
 const sequence=makeWatchSequence(model.orderedWorks,'作品库',filters);
 assert.equal(sequence.ids.length,60);
 assert.equal(nextInSequence(sequence,model.rows.at(-1).id,data(rows)).id,'recPage11');
});
