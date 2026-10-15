const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const cache={};function load(file){if(cache[file])return cache[file];const e={};cache[file]=e;const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext('(function(require,exports){'+code+'})',{URL})(name=>load('lib/idol/'+name.slice(2)+'.ts'),e);return e;}
const {groupCollection,groupWorkMatches,groupActivity,safeGroupLink}=load('lib/idol/group-detail.ts');
const g={id:'recG',name:'GROUP',average:10,ratedCount:999};
const work=(id,score=null,stageScore=null)=>({id,groupIds:['recG'],song:id,name:id,score,stageScore,watched:'',url:'https://www.youtube.com/watch?v=abcdefghijk',version:'',videoType:'官方MV',officialTitle:''});
test('group stats are distinct linked works, preserve zero and separate MV/stage samples',()=>{const a=work('recA',0,9),b=work('recB',8),c=work('recC',null,3),d=work('recD');d.placeholder={};const other={...work('recOther',10,10),groupIds:['recOther']};const input={works:[a,a,b,c,d,other],members:[{id:'recM',groupIds:['recG'],status:'在团',photo:{}},{id:'recFormer',groupIds:['recG'],status:'已离团',photo:{}}]};const before=JSON.stringify(input),s=groupCollection(input,g);assert.deepEqual(JSON.parse(JSON.stringify(s.mv)),{mean:4,count:2});assert.deepEqual(JSON.parse(JSON.stringify(s.stage)),{mean:6,count:2});assert.equal(s.works.length,3);assert.equal(s.members.length,2);assert.equal(s.portraits.length,1);assert.equal(s.pending.length,1);assert.equal(JSON.stringify(input),before);});
test('empty or invalid scores never imply zero or invent a global group mean',()=>{const a=work('recA');a.score=NaN;a.stageScore=11;const s=groupCollection({works:[a],members:[]},g);assert.equal(s.mv.mean,null);assert.equal(s.stage.mean,null);assert.equal(s.mv.count,0);});
test('group work filters match exact collection semantics and actual scores',()=>{const a=work('recA',0),b={...work('recB'),watched:'已观看'},c=work('recC',9);assert.equal(groupWorkMatches(a,'rewatch',''),false);assert.equal(groupWorkMatches(a,'tonight',''),false);assert.equal(groupWorkMatches(b,'unrated',' recB '),true);assert.equal(groupWorkMatches(c,'rewatch','recc'),true);});
test('activity copy preserves real unknowns and safe links reject unsafe protocols and credentials',()=>{assert.equal(groupActivity('据成员透露已结束；原始声明待核'),'近期活动情况暂无更新');assert.equal(groupActivity('团体官方活动已结束'),'已结束团体活动');assert.equal(groupActivity('活动中；HARUNA暂停活动'),'活动中');for(const x of ['http://','javascript:alert(1)','data:x','https://person:pass@host.test'])assert.equal(safeGroupLink(x),null);assert.equal(safeGroupLink('https://www.youtube.com/@X'),'https://www.youtube.com/@X');});

const plain=value=>JSON.parse(JSON.stringify(value));
const permutations=xs=>xs.length?xs.flatMap((x,i)=>permutations(xs.filter((_,j)=>i!==j)).map(rest=>[x,...rest])):[[]];

test('conflicting duplicate works exclude only the conflicting score dimension in every order',()=>{
 for(const works of permutations([work('recA',2,0),work('recA',8,0),work('recB',4,6)])){
  const data={works,members:[]},before=JSON.stringify(data),s=groupCollection(data,g),a=s.works.find(w=>w.id==='recA');
  assert.equal(s.works.length,2);assert.equal(a.score,null);assert.equal(a.stageScore,0);
  assert.deepEqual(plain(s.mv),{mean:4,count:1});assert.deepEqual(plain(s.stage),{mean:3,count:2});
  assert.equal(JSON.stringify(data),before);
 }
 for(const works of permutations([work('recA',0,2),work('recA',0,8),work('recB',4,6)])){
  const s=groupCollection({works,members:[]},g),a=s.works.find(w=>w.id==='recA');
  assert.equal(a.score,0);assert.equal(a.stageScore,null);
  assert.deepEqual(plain(s.mv),{mean:2,count:2});assert.deepEqual(plain(s.stage),{mean:6,count:1});
 }
});

test('duplicate group work zero, null and agreed scores merge once independent of order',()=>{
 for(const works of permutations([work('recA',0,null),work('recA',null,6),work('recA',0,6),work('recB',8)])){
  const s=groupCollection({works,members:[]},g);assert.equal(s.works.length,2);
  assert.deepEqual(plain(s.mv),{mean:4,count:2});assert.deepEqual(plain(s.stage),{mean:6,count:1});
 }
});

test('all-conflict, all-null and empty group dimensions stay null with zero denominators',()=>{
 for(const works of [...permutations([work('recA',0,2),work('recA',8,9)]),[work('recA'),work('recA')],[]]){
  const s=groupCollection({works,members:[]},g);
  assert.deepEqual(plain(s.mv),{mean:null,count:0});assert.deepEqual(plain(s.stage),{mean:null,count:0});
 }
});
