const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
const {photoHarness}=require('./helpers/image-hooks-harness.cjs');
const {find,all}=require('./helpers/read-recovery-harness.cjs');
const {imageDependency}=require('./helpers/image-dependency-loader.cjs');
const photo={table:'members',recordId:'recFixtureMember',index:0};
test('real App four image entry points are wired and recovery controls remain outside card interactions',()=>{
 const text=fs.readFileSync('app/page.tsx','utf8'),ast=ts.createSourceFile('page.tsx',text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 for(const [name,adapter]of [['PhotoView','CatalogPhotoImage'],['WorkCard','WorkCoverImage'],['MemberWorkCard','CatalogPhotoImage'],['MemberDetail','ConceptPhotoImage']]){const fn=ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text===name);assert.ok(fn);assert.match(fn.getText(ast),new RegExp('<'+adapter));assert.doesNotMatch(fn.getText(ast),/<img\b/);}
 let provider=0,controls=0;function walk(n){if(ts.isJsxOpeningElement(n)||ts.isJsxSelfClosingElement(n)){const name=n.tagName.getText(ast);if(name==='ImageRecoveryProvider')provider++;if(name==='ImageRecoveryControls'){controls++;for(let p=n.parent;p;p=p.parent)if(ts.isJsxElement(p))assert.ok(!['a','button'].includes(p.openingElement.tagName.getText(ast)));}}ts.forEachChild(n,walk);}walk(ast);assert.equal(provider,1);assert.equal(controls,1);
});
test('nested member card receives an external recovery button without nesting or parent activation',()=>{
 const h=photoHarness({nested:true}),r=h.r;r.render({photo,label:'Synthetic'});find(r.tree,n=>n.type==='img').props.onError();r.render();const buttons=all(r.tree,n=>n.type==='button');assert.equal(buttons.length,2);assert.equal(all(buttons[0].props.children,n=>n.type==='button').length,0);const retry=buttons[1];let stops=0;retry.props.onClick({stopPropagation(){stops++;}});r.render();assert.equal(stops,1);assert.equal(find(r.tree,n=>n.type==='img').props.src,'/api/media?table=members&record=recFixtureMember&index=0');assert.equal(h.requests.length,0);assert.equal(h.document.activeElement.tagName,'MAIN');
});
test('real PhotoView A to B to A and same-source identity changes reject late event ownership',()=>{
 const h=photoHarness(),r=h.r;r.render({photo,label:'A'});const old=find(r.tree,n=>n.type==='img');old.props.onError();r.render();assert.ok(find(r.tree,n=>n.props?.className==='ri-retry'));
 r.render({photo:{...photo,index:1},label:'B'});old.props.onLoad();old.props.onError();r.render();assert.ok(find(r.tree,n=>n.type==='img').props.src.endsWith('index=1'));assert.equal(find(r.tree,n=>n.props?.className==='ri-retry'),undefined);
 r.render({photo,label:'A'});assert.ok(find(r.tree,n=>n.type==='img').props.src.endsWith('index=0'));find(r.tree,n=>n.type==='img').props.onError();r.render();r.render({photo,label:'same source / other identity'});assert.ok(find(r.tree,n=>n.type==='img'));assert.equal(find(r.tree,n=>n.props?.className==='ri-retry'),undefined);
});
test('retry focus continuation only runs for an accepted retry whose button still owns focus',()=>{
 const {ImageRetryControl}=imageDependency('@/components/reliable-image');
 for(const accepted of [false,true])for(const focused of [false,true]){let count=0;const target={ownerDocument:{activeElement:null}};if(focused)target.ownerDocument.activeElement=target;const button=ImageRetryControl({state:{status:'error',canRetry:true,retry:()=>accepted},onRetryStarted:()=>count++});button.props.onClick({currentTarget:target,preventDefault(){},stopPropagation(){}});assert.equal(count,accepted&&focused?1:0);}
});
test('stale retry after source change or unmount cannot request or mutate the new image',()=>{
 const h=photoHarness(),r=h.r;r.render({photo,label:'A'});find(r.tree,n=>n.type==='img').props.onError();r.render();const stale=find(r.tree,n=>n.props?.className==='ri-retry');r.render({photo:{...photo,index:2},label:'B'});stale.props.onClick();r.render();assert.ok(find(r.tree,n=>n.type==='img').props.src.endsWith('index=2'));assert.equal(h.requests.length,0);h.unmount();stale.props.onClick();assert.equal(h.requests.length,0);
});
test('lightbox owns its manual recovery and no product image module imports synthetic test data',()=>{
 const lightbox=fs.readFileSync('components/photo-lightbox.tsx','utf8');assert.match(lightbox,/retryMode="manual"/);assert.doesNotMatch(lightbox,/retryMode="external"/);
 for(const name of ['components/reliable-image.tsx','components/app-image-presentation.tsx','components/photo-lightbox.tsx','lib/idol/image-presentation.ts','lib/idol/image-lightbox-session.ts'])assert.doesNotMatch(fs.readFileSync(name,'utf8'),/(?:from|import).*?(?:tests\/|fixtures\/|HANDOFF\/)/);
});
test('lightbox retry ref detachment restores only the removed control owned focus, using deterministic ports',()=>{
 const source=fs.readFileSync('components/photo-lightbox.tsx','utf8'),ast=ts.createSourceFile('photo-lightbox.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 let callback;function visit(node){if(ts.isVariableDeclaration(node)&&node.name.getText(ast)==='attachRetry')callback=node.initializer.arguments[0];ts.forEachChild(node,visit);}visit(ast);assert.ok(callback);assert.match(source,/<button ref=\{attachRetry\} type="button" className="photo-lightbox-retry"/);
 const code=ts.transpileModule('module.exports='+callback.getText(ast),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
 for(const ownsFocus of [false,true])for(const modalConnected of [false,true]){
  const retryButton={current:null},doc={activeElement:null},button={ownerDocument:doc},outside={},focusCalls=[];
  const close={current:{focus(options){focusCalls.push(options);doc.activeElement=this;}}},dialog={current:modalConnected?{isConnected:true}:null},mod={exports:null};
  new Function('module','retryButton','dialog','close',code)(mod,retryButton,dialog,close);const attach=mod.exports;
  attach(button);assert.equal(focusCalls.length,0);doc.activeElement=ownsFocus?button:outside;attach(null);
  assert.equal(focusCalls.length,ownsFocus&&modalConnected?1:0);if(focusCalls.length)assert.deepEqual(focusCalls[0],{preventScroll:true});
  const count=focusCalls.length;attach(null);assert.equal(focusCalls.length,count,'repeated stale ref detachment must not focus again');
 }
});

test('approved MV photo and reference occupy one cast grid cell; legacy photo DOM stays unchanged',()=>{
 const primary={table:'ratings',recordId:'pilot-rating',fieldId:'photos',index:2,sourceKind:'mv_look_photo',kind:'本MV同造型照片'};
 const reference={...primary,index:0,sourceKind:'mv_still',kind:'本 MV 截图'};
 const h=photoHarness();h.r.render({photo:primary,referencePhoto:reference,label:'张员瑛',live:true});
 const stack=find(h.r.tree,n=>n.props.className==='mv-photo-stack');assert.ok(stack,'photo and reference share one layout item');
 const image=find(stack,n=>n.type==='img'),control=find(stack,n=>n.type==='button'&&n.props.children==='原MV截图');assert.ok(image);assert.ok(control);
 assert.equal(image.dom.closest('main').tagName,'MAIN');
 const frame=find(stack,n=>n.props.className?.split(' ').includes('photo')),referenceNode=find(stack,n=>n.props.className==='mv-photo-reference');
 assert.equal(frame.dom.parent,stack.dom);assert.equal(referenceNode.dom.parent,stack.dom);
 assert.equal(stack.dom.parent.tagName,'MAIN','the cast-photo component contributes exactly one top-level item');
 assert.match(image.props.src,/index=2(?:&|$)/);assert.equal(all(h.r.tree,n=>n.type==='img').length,1,'reference never replaces or adds a second main image');
 h.r.render({photo:reference,label:'宮脇咲良',live:true});
 assert.equal(find(h.r.tree,n=>n.props.className==='mv-photo-stack'),undefined);
 assert.equal(find(h.r.tree,n=>n.props.className==='mv-photo-reference'),undefined);
 assert.equal(find(h.r.tree,n=>n.props.className==='photo ').dom.parent.tagName,'MAIN','nonpilot image keeps its exact direct-child layout');
 h.unmount();
});
