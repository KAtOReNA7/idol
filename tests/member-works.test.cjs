const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const api={};vm.runInNewContext('(function(exports){'+ts.transpileModule(fs.readFileSync('lib/idol/member-works.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText+'})') (api);
const {memberWorks,memberWorkSummary,personalMvPhoto}=api;
const work=id=>({id,song:id,score:10,stageScore:10});
const row=(id,w,score=null,stylingScore=null,extra={})=>({id,memberIds:['m'],workIds:[w],score,stylingScore,photo:null,recognition:'',...extra});
const view=ratings=>memberWorks({works:['a','b','c'].map(work),ratings},'m');
test('dimensions use different denominators and remain equally weighted',()=>{const rows=view([row('r1','a',9,8),row('r2','b',8,9),row('r3','c',7)]),s=memberWorkSummary(rows);assert.equal(s.performanceMean,8);assert.equal(s.stylingMean,8.5);assert.equal(s.composite,8.25);assert.equal(s.ratedWorks,3);assert.equal(s.performanceCount,3);assert.equal(s.stylingCount,2);});
test('one dimension does not masquerade as a complete composite',()=>{const s=memberWorkSummary(view([row('r1','a',8)]));assert.equal(s.performanceMean,8);assert.equal(s.stylingMean,null);assert.equal(s.composite,null);assert.equal(s.ratedWorks,1);});
test('null, invalid and zero are distinct',()=>{const s=memberWorkSummary(view([row('r1','a',0,0),row('r2','b',null,null),row('r3','c',NaN,Infinity)]));assert.equal(s.composite,0);assert.equal(s.ratedWorks,1);assert.equal(s.performanceCount,1);assert.equal(s.stylingCount,1);});
test('personal scores do not fall back to song score or member favorite',()=>{const s=memberWorkSummary(view([row('r1','a')]));assert.equal(s.composite,null);assert.equal(s.ratedWorks,0);});
test('each member and exact work is isolated',()=>{const xs=view([row('r1','a',8,9),row('r2','b',1,2,{memberIds:['another']})]);assert.equal(xs.length,1);assert.equal(xs[0].work.id,'a');assert.equal(xs[0].performance,8);});
test('duplicate IDs and identical pair scores do not add sample weight',()=>{const r=row('r1','a',8,9),s=memberWorkSummary(view([r,r,row('r2','a',8,9),row('r3','b',6,5)]));assert.equal(s.performanceMean,7);assert.equal(s.ratedWorks,2);});
test('conflicting duplicate scores are unresolved, not averaged arbitrarily',()=>{const s=memberWorkSummary(view([row('r1','a',8,9),row('r2','a',4,9)]));assert.equal(s.performanceMean,null);assert.equal(s.stylingMean,9);assert.equal(s.composite,null);});
test('ambiguous multi-member or multi-work scores are not attributed individually',()=>{const s=memberWorkSummary(view([row('r1','a',8,9,{memberIds:['m','n']}),row('r2','a',8,9,{workIds:['a','b']})]));assert.equal(s.ratedWorks,0);});
test('photo requires one exact stable member/work and named MV evidence',()=>{const r=row('r1','a',null,null,{photo:{table:'ratings',recordId:'r1',index:0},recognition:'本MV截图 · DBKpop具名图注'});assert.ok(personalMvPhoto(r,'m','a'));for(const changed of [{memberIds:['x']},{workIds:['b']},{photo:{table:'members',recordId:'r1',index:0}},{photo:{table:'ratings',recordId:'r2',index:0}},{recognition:''},{recognition:'档案照'},{recognition:'本MV全员拼图'},{recognition:'本MV截图合照'}])assert.equal(personalMvPhoto({...r,...changed},'m','a'),null);});
test('placeholders never become rated works',()=>{const xs=memberWorks({works:[{...work('a'),placeholder:{reason:'empty'}}],ratings:[row('r','a',8,9)]},'m');assert.equal(xs.length,0);});
test('known named chapter and later editorial completion templates retain existing personal attachments',()=>{const r=row('r','a',null,null,{photo:{table:'ratings',recordId:'r',index:0}});for(const recognition of ['本MV章节配图 · WordPress具名成员页 | 原来源姓名：Kazuha | 原图注：Kazuha Easy | data-image-title additionally names the member and song | 截图状态：本MV具名截图已原生上传并回读核验','本MV来源章节具名图 · KProfiles粉丝标注 | 原来源姓名：Arin | 只读取原拼图每格既有姓名标签 | 截图状态：本MV具名截图已原生上传并回读核验','逐MV服装分解 | 截图状态：待补本MV具名截图\n【2026-10-11 本MV截图补全】已上传 MINNIE 的 Klaxon 正片裁图，Vogue Singapore 原文 gallery 1，原文嵌入精确 MV rTKqSmX9XhQ；以上为最新补全状态，原文字核验记录保留。'])assert.ok(personalMvPhoto({...r,recognition},'m','a'));assert.equal(personalMvPhoto({...r,recognition:'本MV章节配图，暂缺姓名依据'},'m','a'),null);});
test('existing named individual panel is usable but a whole-group collage is not',()=>{const r=row('r','a',null,null,{photo:{table:'ratings',recordId:'r',index:0,kind:'本 MV 认人图'},recognition:'本MV认人图 · 图内具名 | 只抄读来源拼图该独立子图上的原姓名标签。'});assert.ok(personalMvPhoto(r,'m','a'));assert.ok(personalMvPhoto({...r,recognition:'本MV认人图 | 仅抄读原发布页本歌曲/版本拼图各独立子图上的具名文字。'},'m','a'));assert.equal(personalMvPhoto({...r,recognition:r.recognition+' 当前仍为全员拼图。'},'m','a'),null);assert.equal(personalMvPhoto({...r,photo:{...r.photo,kind:'本 MV 具名全员拼图'}},'m','a'),null);});
test('an exclusion note about promotional photos does not reject a declared named MV screenshot',()=>{const r=row('r','a',null,null,{photo:{table:'ratings',recordId:'r',index:0},recognition:'本MV截图 · note原文具名 | 跨曲举例、宣传照、花絮均未入此批。'});assert.ok(personalMvPhoto(r,'m','a'));assert.ok(personalMvPhoto({...r,recognition:'本MV具名截图 · 可靠图注'},'m','a'));assert.equal(personalMvPhoto({...r,recognition:'宣传照 | 本MV截图来自别的章节'},'m','a'),null);});
test('projection leaves original manual favorites and all raw data unchanged',()=>{const data={works:[work('a')],ratings:[row('r','a',8,9)],members:[{id:'m',favorite:3,note:'synthetic'}]};const before=JSON.stringify(data);memberWorkSummary(memberWorks(data,'m'));assert.equal(JSON.stringify(data),before);});

test('native exact-image provenance can resolve old pending text but never mismatched IDs',()=>{const p={table:'ratings',recordId:'r',index:0,kind:'本 MV 截图',nativeIdentity:{memberId:'m',workId:'a',videoId:'abcdefghijk'}},r=row('r','a',null,null,{photo:p,recognition:'原待补说明保留'});assert.ok(personalMvPhoto(r,'m','a'));assert.equal(personalMvPhoto({...r,photo:{...p,nativeIdentity:{...p.nativeIdentity,memberId:'other'}}},'m','a'),null);});

const plain=value=>JSON.parse(JSON.stringify(value));
const permutations=xs=>xs.length?xs.flatMap((x,i)=>permutations(xs.filter((_,j)=>i!==j)).map(rest=>[x,...rest])):[[]];

test('same rating ID conflicts resolve per dimension independently of row order',()=>{
 const ratings=[row('same','a',2,0),row('same','a',8,0),row('other','b',4,6)];
 for(const ordered of permutations(ratings)){
  const before=JSON.stringify(ordered),items=view(ordered),a=items.find(x=>x.work.id==='a');
  assert.equal(a.performance,null);assert.equal(a.styling,0);
  assert.deepEqual(plain(memberWorkSummary(items)),{performanceMean:4,stylingMean:3,performanceCount:1,stylingCount:2,ratedWorks:2,composite:3.5});
  assert.equal(JSON.stringify(ordered),before);
 }
});

test('styling-only and two-dimension conflicts do not discard or invent scores',()=>{
 for(const ordered of permutations([row('same','a',0,2),row('same','a',0,8),row('other','b',4,6)])){
  const a=view(ordered).find(x=>x.work.id==='a');assert.equal(a.performance,0);assert.equal(a.styling,null);
  const s=memberWorkSummary(view(ordered));assert.equal(s.performanceCount,2);assert.equal(s.stylingCount,1);assert.equal(s.performanceMean,2);assert.equal(s.stylingMean,6);
 }
 for(const ordered of permutations([row('same','a',2,0),row('same','a',8,9)])){
  const s=memberWorkSummary(view(ordered));assert.equal(s.performanceMean,null);assert.equal(s.stylingMean,null);assert.equal(s.performanceCount,0);assert.equal(s.stylingCount,0);assert.equal(s.ratedWorks,0);assert.equal(s.composite,null);
 }
});

test('null duplicate dimensions remain missing while zero and matching values merge once',()=>{
 const ratings=[row('same','a',0,null),row('same','a',null,6),row('same','a',0,6),row('other','b',8)];
 for(const ordered of permutations(ratings)){
  assert.deepEqual(plain(memberWorkSummary(view(ordered))),{performanceMean:4,stylingMean:6,performanceCount:2,stylingCount:1,ratedWorks:2,composite:5});
 }
 const s=memberWorkSummary(view([row('same','a'),row('same','a')]));assert.equal(s.ratedWorks,0);assert.equal(s.performanceMean,null);assert.equal(s.stylingMean,null);
});

test('duplicate work IDs emit one member card and preserve an identical rating attachment',()=>{
 const a=work('a'),b=work('b'),r=row('same','a',0,6,{photo:{table:'ratings',recordId:'same',index:0},recognition:'本MV截图 · synthetic named caption'});
 for(const works of permutations([a,{...a},b])){
  const data={works,ratings:[r,{...r},row('other','b',8)]},before=JSON.stringify(data),items=memberWorks(data,'m');
  assert.equal(items.length,2);assert.equal(new Set(items.map(x=>x.work.id)).size,2);assert.ok(items.find(x=>x.work.id==='a').photo);
  assert.deepEqual(plain(memberWorkSummary(items)),{performanceMean:4,stylingMean:6,performanceCount:2,stylingCount:1,ratedWorks:2,composite:5});
  assert.equal(JSON.stringify(data),before);
 }
});

test('direct summaries merge duplicate work dimensions without order-dependent overrides',()=>{
 const item=(id,performance,styling)=>({work:work(id),performance,styling,photo:null});
 for(const ordered of permutations([item('a',2,0),item('a',8,0),item('b',4,6)])){
  assert.deepEqual(plain(memberWorkSummary(ordered)),{performanceMean:4,stylingMean:3,performanceCount:1,stylingCount:2,ratedWorks:2,composite:3.5});
 }
 for(const ordered of permutations([item('a',0,null),item('a',null,6),item('a',0,6)])){
  assert.deepEqual(plain(memberWorkSummary(ordered)),{performanceMean:0,stylingMean:6,performanceCount:1,stylingCount:1,ratedWorks:1,composite:3});
 }
});
