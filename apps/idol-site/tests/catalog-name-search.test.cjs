const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),path=require('node:path');
const cache={};function load(name){if(cache[name])return cache[name];const out={};cache[name]=out;const code=ts.transpileModule(fs.readFileSync('lib/idol/'+name+'.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext('(function(exports,require){'+code+'})',{URL,URLSearchParams,crypto:require('node:crypto').webcrypto})(out,s=>require('./helpers/timeline-dependency-loader.cjs').timelineDependency(s)??load(s==='./candidate/registry'?'candidate/registry':s==='./personal-insights/view-state'?'personal-insights/view-state':path.basename(s)));return out;}
const {indexNameFields,nameSearchQuery,matchesNameFields}=load('name-search');
const {indexGroupNames,matchingIndexedGroups,matchingGroups}=load('group-index');
const {indexMemberNames,matchingMembers}=load('member-index');
const {indexWorkNames,matchingWorks,matchesWorkScope,sortWorks,nextInSequence,makeWatchSequence}=load('watch-sequence');
const {defaultFilters}=load('journey'),{inQueue}=load('queues');
const ids=rows=>Array.from(rows,row=>row.id),filters=patch=>({...defaultFilters(),...patch});
const group=(id,name,patch={})=>({id,name,currentName:'',generation:'第四代',company:'SOURCE MUSIC',memberIds:[],workIds:[],note:'privategroupneedle',average:9.5,ratedCount:3,...patch});
const groups=[group('recLe','LE SSERAFIM'),group('recIdle','(G)I-DLE',{currentName:'i-dle',company:'CUBE'})];
const work=(id,patch={})=>({id,name:'Title '+id,song:'Smart',officialTitle:'Official Video',groupIds:['recLe'],url:'https://www.youtube.com/watch?v=abcdefghijk',score:null,stageScore:null,note:'privateworkneedle',watched:'未观看',videoType:'MV',version:'Studio Version',releaseDate:'2024-01-01',ratingIds:[],stage:null,stageResearch:{status:'pending',reason:'privateresearchneedle'},source:'privatesourceneedle',...patch});
const member=(id,patch={})=>({id,name:'LE SSERAFIM · KIM CHAEWON',stageName:'KIM CHAE-WON',cnName:'金采源',groupIds:['recLe'],photo:null,favorite:0,note:'privatememberneedle',profile:'privateprofileneedle',...patch});

test('name matching is deterministic NFKC, case and separator tolerant within a field',()=>{
 const cases=[['LE SSERAFIM',['lesserafim','LE-SSERAFIM','ＬＥ　ＳＳＥＲＡＦＩＭ','le_sserafim']],['(G)I-DLE',['gidle','G I DLE','(G) I - DLE']],['KIM CHAE-WON',['kimchaewon','Kim Chae Won','KIM CHAE–WON']],['O.O',['oo','o o']],['Don’t Know What To Do',['dontknowwhattodo',"DON'T KNOW"]],['名字・かな',['名字かな','名字 かな']]];
 for(const [name,queries]of cases)for(const query of queries)assert.equal(matchesNameFields(indexNameFields([name]),nameSearchQuery(query)),true,`${name} / ${query}`);
 assert.equal(matchesNameFields(indexNameFields(['café']),nameSearchQuery('cafe')),false,'no invented accent/transliteration aliases');
 assert.equal(matchesNameFields(indexNameFields(['A+B']),nameSearchQuery('ab')),false,'symbols are not silently discarded');
});

test('blank search remains all; nonempty punctuation or emoji search is never all',()=>{
 const index=indexGroupNames(groups),members=indexMemberNames([member('recM')],groups),works=indexWorkNames([work('recW')],groups);
 for(const search of ['', ' \t\n　 '])assert.equal(matchingIndexedGroups(index,filters({search})).length,2);
 for(const search of ['---','()','．＿／','·','💗','✨ 💗','!?','--- 💗']){
  assert.equal(matchingIndexedGroups(index,filters({search})).length,0,search);
  assert.equal(matchingMembers(members,filters({search})).length,0,search);
  assert.equal(matchingWorks(works,filters({search})).length,0,search);
 }
 assert.equal(matchingIndexedGroups(index,filters({search:'lesserafim 💗'})).length,0,'non-name tokens do not become wildcards');
});

test('independent fields cannot invent concatenated names while multiword AND still crosses fields',()=>{
 const separate=[group('recSeparate','Alpha',{currentName:'Beta',company:'Gamma'})];
 for(const search of ['alphabeta','betagamma','alphagamma'])assert.equal(matchingGroups(separate,filters({search})).length,0);
 assert.equal(matchingGroups(separate,filters({search:'gamma alpha beta'})).length,1);
 const works=indexWorkNames([work('recW',{name:'Alpha',song:'Beta',officialTitle:'Gamma',groupIds:[]})],[]);
 assert.equal(matchingWorks(works,filters({search:'alphabetagamma'})).length,0);
 assert.equal(matchingWorks(works,filters({search:'gamma alpha beta'})).length,1);
 const members=indexMemberNames([member('recM',{name:'Alpha',cnName:'中文',stageName:'Beta',groupIds:[]})],[]);
 for(const search of ['alphabeta','中文beta'])assert.equal(matchingMembers(members,filters({search})).length,0);
 assert.equal(matchingMembers(members,filters({search:'beta 中文 alpha'})).length,1);
});

test('group old/current names, member Chinese display names and combined filters remain searchable',()=>{
 assert.deepEqual(ids(matchingGroups(groups,filters({search:'ＧＩＤＬＥ cube'}))),['recIdle']);
 assert.deepEqual(ids(matchingGroups(groups,filters({search:'idle',company:'CUBE',generation:'第四代'}))),['recIdle']);
 assert.equal(matchingGroups(groups,filters({search:'idle',company:'SOURCE MUSIC'})).length,0);
 const index=indexMemberNames([member('recM')],groups);
 for(const search of ['金采源','金采源 lesserafim','chaewon 金采源','  ＫＩＭ　CHAEWON  '])assert.deepEqual(ids(matchingMembers(index,filters({search}))),['recM']);
 assert.equal(matchingMembers(index,filters({search:'金采源',group:'recIdle'})).length,0);
 assert.equal(matchingMembers(index,filters({search:'金采源',generation:'第五代'})).length,0);
 // Reviewed Chinese display-name fallback remains available when cnName is empty.
 const reviewed=member('recvxDM9ZF8TqH',{name:'XG · JURIA',cnName:'',stageName:'JURIA',groupIds:['recvxDKdOtKdWD']});
 assert.deepEqual(ids(matchingMembers(indexMemberNames([reviewed],[]),filters({search:'上田纯利亚'}))),[reviewed.id]);
});

test('public indexes exclude personal notes, profile prose, sources and research text',()=>{
 const workIndex=indexWorkNames([work('recW')],groups),memberIndex=indexMemberNames([member('recM')],groups),groupIndex=indexGroupNames(groups);
 for(const search of ['privategroupneedle','privateworkneedle','privatememberneedle','privateprofileneedle','privateresearchneedle','privatesourceneedle']){
  assert.equal(matchingIndexedGroups(groupIndex,filters({search})).length,0);
  assert.equal(matchingMembers(memberIndex,filters({search})).length,0);
  assert.equal(matchingWorks(workIndex,filters({search})).length,0);
 }
});

test('indexed library preserves existing queue/watch/generation/stage inputs and original references',()=>{
 const data=require('./library-fixture.cjs')(),before=JSON.stringify(data),index=indexWorkNames(data.works,data.groups);
 const oldMatch=(w,f)=>{const linked=data.groups.filter(g=>w.groupIds.includes(g.id)),norm=v=>v.normalize('NFKC').toLowerCase().trim().split(/\s+/u).filter(Boolean);const text=norm(`${w.name} ${w.song} ${w.version} ${w.videoType} ${w.officialTitle} ${linked.map(g=>g.name).join(' / ')}`).join(' ');return !w.placeholder&&inQueue(w,f.queue,data.groups)&&(f.group==='all'||w.groupIds.includes(f.group))&&(f.generation==='all'||linked.some(g=>g.generation===f.generation))&&(f.watch==='all'||(f.watch==='watched'?w.watched==='已观看':f.watch==='unwatched'?w.watched==='未观看':w.watched===''))&&norm(f.search).every(term=>text.includes(term));};
 for(const search of ['', 'library studio','synthetic title 179'])for(const queue of ['all','tonight','unrated','rewatch','high','surprise'])for(const watch of ['all','watched','unwatched','unmarked'])for(const group of ['all',data.groups[0].id]){
  const f=filters({search,queue,watch,group});assert.deepEqual(ids(matchingWorks(index,f)),ids(data.works.filter(w=>oldMatch(w,f))));
 }
 assert.equal(matchingWorks(index,filters())[0],data.works[0]);assert.equal(JSON.stringify(data),before);
});

test('index reuse never rereads or renormalizes public text when typing, filtering or counting queues',()=>{
 let reads=0;const w=work('recW'),m=member('recM'),g=groups[0];const observed=(object,key)=>({...object,get [key](){reads++;return object[key];}});
 const workIndex=indexWorkNames([observed(w,'song')],[observed(g,'name')]);
 const memberIndex=indexMemberNames([observed(m,'cnName')],[observed(g,'name')]);
 const groupIndex=indexGroupNames([observed(g,'name')]);const initial=reads;assert.ok(initial>0);
 for(const search of ['l','le','lesserafim','smart','金采源'])for(const queue of ['all','tonight','unrated','rewatch']){
  matchingWorks(workIndex,filters({search,queue}));matchingMembers(memberIndex,filters({search}));matchingIndexedGroups(groupIndex,filters({search}));
 }
 assert.equal(reads,initial);
});

test('a fresh catalog rebuild updates names, scores, queues and relationships without mutating prior indexes',()=>{
 const first={groups:structuredClone(groups),members:[member('recM')],works:[work('recW')]};
 const oldIndex=indexWorkNames(first.works,first.groups),next=structuredClone(first);
 next.groups[0].name='Renamed Group';next.groups[0].generation='第五代';next.works[0].song='Renamed Song';next.works[0].score=0;next.works[0].watched='已观看';next.members[0].cnName='新名字';
 const newIndex=indexWorkNames(next.works,next.groups);
 assert.equal(matchingWorks(oldIndex,filters({search:'smart lesserafim',queue:'tonight'})).length,1);
 assert.equal(matchingWorks(newIndex,filters({search:'smart lesserafim'})).length,0);
 assert.equal(matchingWorks(newIndex,filters({search:'renamedsong renamedgroup',watch:'watched'}))[0],next.works[0]);
 assert.equal(matchingWorks(newIndex,filters({queue:'tonight'})).length,0);assert.equal(matchingWorks(newIndex,filters({queue:'unrated'})).length,0);
 assert.equal(matchingMembers(indexMemberNames(next.members,next.groups),filters({search:'新名字',generation:'第五代'}))[0],next.members[0]);
 assert.equal(matchingGroups(next.groups,filters({search:'renamedgroup'}))[0],next.groups[0]);
});

test('separator-tolerant query preserves sorted 24-row pagination and next-item revalidation',()=>{
 const works=Array.from({length:30},(_,i)=>work('recW'+i,{score:i})),f=filters({search:'lesserafim smart',sort:'score-desc',limit:24});
 const all=sortWorks(matchingWorks(indexWorkNames(works,groups),f),f.sort);assert.equal(all.length,30);assert.equal(all.slice(0,f.limit).length,24);
 const seq=makeWatchSequence(all,'合成队列',f);assert.equal(seq.filters.search,f.search);assert.equal(nextInSequence(seq,all[23].id,{works,groups,ratings:[]}).id,all[24].id);
 assert.equal(matchesWorkScope({...all[24],groupIds:[]},f,groups),false);
});

test('public route aliases are shared by group, work and member name indexes without changing identities',()=>{
 const registry=require('../data/artist-timeline-registry.json');
 const artist=registry.find(row=>row.slug==='witchx');assert.equal(artist.name,'W!TCHX');
 const g=group(artist.groupId,artist.name),other=group('recUnrelated','W!TCHX');
 const w=work('recAliasWork',{groupIds:[g.id]}),w2=work('recAliasWork2',{groupIds:[g.id],score:0});
 const m=member('recAliasMember',{name:'Test Member',cnName:'测试',stageName:'Test',groupIds:[g.id]});
 const data={groups:[other,g],works:[w,w2,work('recOtherWork',{groupIds:[other.id]})],members:[m,member('recOtherMember',{groupIds:[other.id]})]};
 const before=JSON.stringify(data),gi=indexGroupNames(data.groups),wi=indexWorkNames(data.works,data.groups),mi=indexMemberNames(data.members,data.groups);
 for(const search of ['witchx','ＷＩＴＣＨＸ','witch x']){
  assert.deepEqual(ids(matchingIndexedGroups(gi,filters({search}))),[g.id]);
  assert.deepEqual(ids(matchingWorks(wi,filters({search}))),[w.id,w2.id]);
  assert.deepEqual(ids(matchingMembers(mi,filters({search}))),[m.id]);
 }
 assert.equal(matchingIndexedGroups(gi,filters({search:'witchx source music'}))[0],g);
 assert.equal(matchingWorks(wi,filters({search:'witchx smart studio mv'}))[0],w);
 assert.equal(matchingMembers(mi,filters({search:'witchx 测试 test'}))[0],m);
 assert.equal(matchingWorks(wi,filters({search:'witchxsmart'})).length,0,'aliases remain independent fields');
 assert.equal(matchingMembers(mi,filters({search:'witchxtest'})).length,0);
 for(const search of ['privategroupneedle','privateworkneedle','privatememberneedle','privateprofileneedle','privateresearchneedle','privatesourceneedle','!!!','---','💗']){
  assert.equal(matchingIndexedGroups(gi,filters({search})).length,0,search);
  assert.equal(matchingWorks(wi,filters({search})).length,0,search);
  assert.equal(matchingMembers(mi,filters({search})).length,0,search);
 }
 assert.equal(matchingIndexedGroups(gi,filters({search:''})).length,2,'same display names never merge');
 assert.deepEqual(ids(sortWorks(matchingWorks(wi,filters({search:'witchx'})),'default')),[w.id,w2.id]);
 const f=filters({search:'witchx smart'}),seq=makeWatchSequence([w,w2],'Alias queue',f);
 assert.equal(nextInSequence(seq,w.id,{...data,ratings:[]}),w2);
 assert.equal(matchesWorkScope({...w2,groupIds:[other.id]},f,data.groups),false);
 assert.equal(JSON.stringify(data),before,'search never rewrites names, IDs, scores, notes or watch state');
});

test('all existing public route aliases are stable-ID-bound and preserve i-dle / lesserafim searches',()=>{
 for(const artist of require('../data/artist-timeline-registry.json')){
  const g=group(artist.groupId,artist.name),w=work('recW',{groupIds:[g.id]}),m=member('recM',{groupIds:[g.id]});
  assert.equal(matchingGroups([g],filters({search:artist.slug}))[0],g,artist.slug);
  assert.equal(matchingWorks(indexWorkNames([w],[g]),filters({search:artist.slug}))[0],w,artist.slug);
  assert.equal(matchingMembers(indexMemberNames([m],[g]),filters({search:artist.slug}))[0],m,artist.slug);
 }
 for(const [name,query] of [['i-dle','idle'],['(G)I-DLE','gidle'],['LE SSERAFIM','lesserafim']]){
  assert.equal(matchingGroups([group('recNoRoute',name)],filters({search:query})).length,1);
 }
 assert.equal(matchingGroups([group('recNoRoute','W!TCHX',{note:'witchx',profile:'witchx'})],filters({search:'witchx'})).length,0,'neither names nor private prose grant alias identity');
});

test('refreshed alias indexes update links, public names and filters while previous snapshots stay intact',()=>{
 const g=group('rec28ldfRTiDFM','W!TCHX'),other=group('recOther','Other');
 const w=work('recW',{groupIds:[g.id]}),m=member('recM',{name:'Original',cnName:'旧名',groupIds:[g.id]});
 const oldG=indexGroupNames([g,other]),oldW=indexWorkNames([w],[g,other]),oldM=indexMemberNames([m],[g,other]);
 const nextG={...g,name:'Updated public label',generation:'第五代'},nextW={...w,groupIds:[other.id],score:0,watched:'已观看'},nextM={...m,cnName:'新名',groupIds:[other.id]};
 assert.equal(matchingIndexedGroups(indexGroupNames([nextG,other]),filters({search:'witchx updated',generation:'第五代'}))[0],nextG);
 assert.equal(matchingWorks(indexWorkNames([nextW],[nextG,other]),filters({search:'witchx'})).length,0);
 assert.equal(matchingMembers(indexMemberNames([nextM],[nextG,other]),filters({search:'witchx'})).length,0);
 assert.equal(matchingWorks(oldW,filters({search:'witchx'}))[0],w);
 assert.equal(matchingMembers(oldM,filters({search:'witchx 旧名'}))[0],m);
 assert.equal(matchingIndexedGroups(oldG,filters({search:'witchx'}))[0],g);
 assert.equal(matchingWorks(indexWorkNames([w],[]),filters({search:'witchx'})).length,0,'missing linked group does not materialize a record');
 assert.equal(matchingMembers(indexMemberNames([m],[]),filters({search:'witchx'})).length,0);
});
