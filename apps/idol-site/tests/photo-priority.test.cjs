const {harness,Runner,find,assert}=require('./helpers/read-recovery-harness.cjs');
const test=require('node:test'),fs=require('node:fs'),ts=require('typescript');
const {photoHarness}=require('./helpers/image-hooks-harness.cjs');
test('both PhotoView image branches default to lazy/auto and opt in to eager/high without URL changes',()=>{
 for(const table of ['members','ratings'])for(const priority of [undefined,false,true]){
  const h=photoHarness(),r=h.r,photo={table,recordId:'recSyntheticPhoto',index:0};
  const props={photo,label:'合成照片',...(priority===undefined?{}:{priority})},before=JSON.stringify(props);
  r.render(props);const img=find(r.tree,n=>n.type==='img');
  assert.equal(img.props.loading,priority?'eager':'lazy');assert.equal(img.props.fetchPriority,priority?'high':'auto');
  assert.equal(img.props.src,`/api/media?table=${table}&record=recSyntheticPhoto&index=0`);
  assert.equal(!!find(r.tree,n=>n.type==='a'),table==='ratings');assert.equal(JSON.stringify(props),before);assert.equal(h.requests.length,0);
 }
});
test('failure fallback and existing photo retry preserve the requested loading policy',()=>{
 for(const table of ['members','ratings'])for(const priority of [false,true]){
  const h=photoHarness(),r=h.r,photo={table,recordId:'recSyntheticPhoto',index:0};
  r.render({photo,label:'合成照片',priority,retryable:true});r.render();
  find(r.tree,n=>n.type==='img').props.onError();r.render();assert.equal(find(r.tree,n=>n.type==='img'),undefined);
  find(r.tree,n=>n.type==='button').props.onClick({stopPropagation(){}});r.render();
  const img=find(r.tree,n=>n.type==='img');assert.equal(img.props.loading,priority?'eager':'lazy');assert.equal(img.props.fetchPriority,priority?'high':'auto');
  assert.equal(img.props.src,`/api/media?table=${table}&record=recSyntheticPhoto&index=0${table==='ratings'?'&retry=1':''}`);assert.equal(h.requests.length,0);
 }
});
test('only the first home hero PhotoView receives priority; every other call keeps the default',()=>{
 const source=fs.readFileSync('app/page.tsx','utf8'),ast=ts.createSourceFile('page.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),calls=[];
 function visit(n){if((ts.isJsxSelfClosingElement(n)||ts.isJsxOpeningElement(n))&&n.tagName.getText(ast)==='PhotoView')calls.push(n);ts.forEachChild(n,visit);}visit(ast);
 assert.ok(calls.length>=5);
 const prioritized=calls.filter(n=>n.attributes.properties.some(a=>a.name?.getText(ast)==='priority'));assert.equal(prioritized.length,1);
 const attr=prioritized[0].attributes.properties.find(a=>a.name?.getText(ast)==='priority');assert.equal(attr.initializer.expression.getText(ast),'i===0');
 let parent=prioritized[0];while(parent&&!ts.isCallExpression(parent))parent=parent.parent;
 assert.ok(parent);assert.equal(parent.expression.getText(ast),'heroMembers.map');
 const images=[0,1].map(i=>{const r=photoHarness().r;r.render({photo:{table:'members',recordId:'recHero'+i,index:0},label:'合成照片',priority:i===0});return find(r.tree,n=>n.type==='img');});
 assert.deepEqual(images.map(n=>[n.props.loading,n.props.fetchPriority]),[['eager','high'],['lazy','auto']]);
});
