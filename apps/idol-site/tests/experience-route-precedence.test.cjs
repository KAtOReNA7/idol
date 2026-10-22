const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const {candidateRegistry}=require('./candidate-harness.cjs');
const source=fs.readFileSync('app/page.tsx','utf8');
const ast=ts.createSourceFile('page.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const fn=ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='experienceClassFor');
assert.ok(fn);
const constants=Object.fromEntries([...fs.readFileSync('lib/idol/artist-navigation.ts','utf8').matchAll(/export const (\w+_GROUP_ID)='([^']+)';/g)].map(m=>[m[1],m[2]]));
const code=ts.transpileModule(fn.getText(ast),{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
const resolve=vm.runInNewContext(code+';experienceClassFor',{...constants,candidateExperienceClass:candidateRegistry.candidateExperienceClass});
// Public identities independently checked against the existing catalog; no scores or user state.
const works=[{id:'recvxyOz5XuYef',groupIds:['recvxyEBDZqkpg']},{id:'recvxyH5pzBi6D',groupIds:['recvxyEBDZPXW9']}];
const member={id:'rec28ldbniB9dP',groupIds:[constants.BABYMONSTER_GROUP_ID]};
test('rendered work keeps its own style even with another group member query',()=>{
 const data={works,members:[member]};
 for(const [index,slug] of ['idle','billlie'].entries()){
  const expected='candidate-experience candidate-'+slug+'-experience';
  assert.equal(resolve(data,{work:works[index].id}),expected);
  assert.equal(resolve(data,{work:works[index].id,member:member.id}),expected);
 }
});
test('invalid work falls back to member; missing data and ordinary routes retain behavior',()=>{
 const data={works,members:[member]};
 assert.equal(resolve(data,{work:'missing',member:member.id}),'bm-experience');
 assert.equal(resolve(data,{member:member.id}),'bm-experience');
 assert.equal(resolve(data,{}),candidateRegistry.candidateExperienceClass([]));
 assert.equal(resolve(null,{work:works[0].id,member:member.id}),candidateRegistry.candidateExperienceClass([]));
});
test('work-first rule preserves existing within-record group precedence',()=>{
 const data={works:[{id:'synthetic-work',groupIds:[constants.ILLIT_GROUP_ID,constants.BABYMONSTER_GROUP_ID]}],members:[{id:'synthetic-member',groupIds:['recvxyEBDZPXW9']}]};
 assert.equal(resolve(data,{work:'synthetic-work',member:'synthetic-member'}),'bm-experience');
 assert.equal(resolve(data,{member:'synthetic-member'}),'candidate-experience candidate-billlie-experience');
});
