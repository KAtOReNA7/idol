const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const api={};vm.runInNewContext('(function(exports){'+ts.transpileModule(fs.readFileSync('lib/idol/member-works.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText+'})',{URL}) (api);
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

const syntheticPhoto=(extra={})=>({table:'ratings',recordId:'same',fieldId:'synthetic-photo',index:0,kind:'本 MV 截图',...extra});
const photoRow=(extra={})=>row('same','a',0,6,{photo:syntheticPhoto(),recognition:'本MV截图 · synthetic named caption',...extra});
function checkPhotoOrders(ratings,expected,works=[work('a')]){
 let baseline;
 for(const rs of permutations(ratings))for(const ws of permutations(works)){
  const data={ratings:rs,works:ws},before=JSON.stringify(data),items=memberWorks(data,'m'),a=items.find(x=>x.work.id==='a');
  assert.ok(a);assert.deepEqual(plain(a.photo),expected);assert.equal(JSON.stringify(data),before);
  if(baseline)assert.deepEqual(plain(items),baseline);else baseline=plain(items);
 }
}
test('photo consensus rejects conflicting duplicate attachment references and missing attachments',()=>{
 for(const patch of [{index:1},{fieldId:'other-field'},{fileToken:'synthetic-token-B'},{recordId:'other-record'},{table:'members'}]){
  checkPhotoOrders([photoRow(),photoRow({photo:syntheticPhoto(patch)})],null);
 }
 checkPhotoOrders([photoRow(),photoRow({photo:null})],null);
});
test('photo consensus sees same-ID relation conflicts before member and work filtering',()=>{
 for(const patch of [{memberIds:['other']},{workIds:['b']},{memberIds:['m','other']},{workIds:['a','b']}]){
  checkPhotoOrders([photoRow(),photoRow(patch)],null);
 }
});
test('photo consensus rejects contradictory eligibility and text evidence',()=>{
 for(const patch of [{personalPhotoEligible:false},{recognition:'档案照'},{recognition:'本MV截图 · different synthetic caption'}]){
  checkPhotoOrders([photoRow({personalPhotoEligible:true}),photoRow(patch)],null);
 }
});
test('explicit native identity contradictions cannot fall back to text or true flags',()=>{
 for(const identity of [{memberId:'other',workId:'a',videoId:'AAAAAAAAAAA'},{memberId:'m',workId:'other',videoId:'AAAAAAAAAAA'},{memberId:'m',workId:'a',videoId:'bad'}]){
  for(const flag of [{},{personalPhotoEligible:true}])assert.equal(personalMvPhoto(photoRow({...flag,photo:syntheticPhoto({nativeIdentity:identity})}),'m','a'),null);
 }
});
test('photo consensus rejects native identity or video conflicts within duplicate rating rows',()=>{
 const nativeIdentity={memberId:'m',workId:'a',videoId:'AAAAAAAAAAA'};
 for(const patch of [{memberId:'other'},{workId:'b'},{videoId:'BBBBBBBBBBB'}]){
  checkPhotoOrders([photoRow({photo:syntheticPhoto({nativeIdentity})}),photoRow({photo:syntheticPhoto({nativeIdentity:{...nativeIdentity,...patch}})})],null);
 }
});
test('exact work video must agree with photo provenance even when a true flag is present',()=>{
 const w={...work('a'),url:'https://www.youtube.com/watch?v=BBBBBBBBBBB'};
 for(const flag of [{},{personalPhotoEligible:true}])checkPhotoOrders([photoRow({...flag,photo:syntheticPhoto({nativeIdentity:{memberId:'m',workId:'a',videoId:'AAAAAAAAAAA'}})})],null,[w]);
});
test('duplicate work video, version or group conflicts hide photos and keep complete output deterministic',()=>{
 const a={...work('a'),url:'https://www.youtube.com/watch?v=AAAAAAAAAAA',version:'synthetic-A',groupIds:['synthetic-group']};
 for(const patch of [{url:'https://www.youtube.com/watch?v=BBBBBBBBBBB'},{version:'synthetic-B'},{groupIds:['synthetic-other-group']},{placeholder:{reason:'synthetic'}}]){
  checkPhotoOrders([photoRow()],null,[a,{...a,...patch}]);
 }
});
test('identical duplicate photos and scores survive key order and input order changes',()=>{
 const p=syntheticPhoto(),reordered=Object.fromEntries(Object.entries(p).reverse());
 checkPhotoOrders([photoRow(),photoRow({photo:reordered}),photoRow()],p,[work('a'),{...work('a')}]);
});
test('photo consensus preserves dimension conflicts, zero and missing scores',()=>{
 for(const rs of permutations([photoRow({score:2,stylingScore:0}),photoRow({score:8,stylingScore:0}),photoRow({score:null,stylingScore:null})])){
  const data={works:[work('a')],ratings:rs},before=JSON.stringify(data),items=memberWorks(data,'m');
  assert.deepEqual(plain(items[0].photo),syntheticPhoto());
  assert.deepEqual(plain(memberWorkSummary(items)),{performanceMean:null,stylingMean:0,performanceCount:0,stylingCount:1,ratedWorks:1,composite:null});
  assert.equal(JSON.stringify(data),before);
 }
});
test('photo consensus preserves unambiguous legacy captions and exact native video URL variants',()=>{
 const nativeIdentity={memberId:'m',workId:'a',videoId:'AAAAAAAAAAA'},p=syntheticPhoto({nativeIdentity});
 const a={...work('a'),url:'https://www.youtube.com/watch?v=AAAAAAAAAAA&feature=synthetic'};
 const b={...a,url:'https://youtu.be/AAAAAAAAAAA'};
 checkPhotoOrders([photoRow({photo:p}),photoRow({photo:p})],p,[a,b]);
 checkPhotoOrders([photoRow()],syntheticPhoto());
});
test('a conflicting duplicate group cannot be discarded to select another attachment',()=>{
 const other=row('other','a',8,9,{photo:{...syntheticPhoto(),recordId:'other'},recognition:'本MV截图 · synthetic named caption'});
 checkPhotoOrders([photoRow(),photoRow({photo:syntheticPhoto({index:1})}),other],null);
});
test('multiple eligible rating attachments remain ambiguous and cards sort by stable work ID',()=>{
 const other=row('other','a',8,9,{photo:{...syntheticPhoto(),recordId:'other'},recognition:'本MV截图 · synthetic named caption'});
 checkPhotoOrders([photoRow(),other],null);
 let baseline;
 for(const rs of permutations([photoRow(),row('b-rating','b',2,3)]))for(const ws of permutations([work('a'),work('b')])){
  const data={works:ws,ratings:rs},before=JSON.stringify(data),items=plain(memberWorks(data,'m'));
  assert.deepEqual(items.map(x=>x.work.id),['a','b']);
  if(baseline)assert.deepEqual(items,baseline);else baseline=items;
  assert.equal(JSON.stringify(data),before);
 }
});
test('explicit exact-video text conflicts cannot be overridden by native identity or eligibility',()=>{
 const recognition='本MV截图 · synthetic caption | 原文嵌入精确 MV BBBBBBBBBBB';
 const nativeIdentity={memberId:'m',workId:'a',videoId:'AAAAAAAAAAA'};
 for(const flag of [{},{personalPhotoEligible:true}]){
  assert.equal(personalMvPhoto(photoRow({...flag,recognition,photo:syntheticPhoto({nativeIdentity})}),'m','a'),null);
  checkPhotoOrders([photoRow({...flag,recognition})],null,[{...work('a'),url:'https://youtu.be/AAAAAAAAAAA'}]);
 }
 assert.equal(personalMvPhoto(photoRow({recognition:recognition+' | 原文嵌入精确 MV CCCCCCCCCCC'}),'m','a'),null);
});
test('consistent native and exact-video text evidence remains eligible',()=>{
 const nativeIdentity={memberId:'m',workId:'a',videoId:'AAAAAAAAAAA'},p=syntheticPhoto({nativeIdentity});
 checkPhotoOrders([photoRow({photo:p,recognition:'本MV截图 · synthetic caption | 原文嵌入精确 MV AAAAAAAAAAA'})],p,[{...work('a'),url:'https://youtu.be/AAAAAAAAAAA'}]);
});
