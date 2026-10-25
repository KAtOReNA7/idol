const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
function load(file,deps={}){const exports={};vm.runInNewContext('(function(exports,require){'+ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText+'})')(exports,name=>name in deps?deps[name]:require(name));return exports;}
const model=load('lib/idol/mv-photo-presentation.ts');
const primary={table:'ratings',recordId:'rating-a',fieldId:'photo-field',index:3,sourceKind:'mv_look_photo',kind:'本 MV 截图'};
const reference={...primary,index:0,sourceKind:'mv_still',kind:'本 MV 截图'};
function render(props,opened=null){const {MvPhotoReference}=load('components/mv-photo-reference.tsx',{'react':{...React,useState:()=>[opened,()=>{}]},'@/lib/idol/mv-photo-presentation':model,'./mv-photo-reference.css':{},'./photo-lightbox':{PhotoLightbox:({src,label})=>React.createElement('div',{'data-reference-src':src},label)}});return renderToStaticMarkup(React.createElement(MvPhotoReference,props));}
test('approved main photo label never inherits screenshot text; legacy photos retain exact old labels',()=>{assert.equal(model.mvPhotoLabel(primary,primary.kind),'本MV同造型照片');for(const photo of [null,reference,{...reference,sourceKind:undefined}])assert.equal(model.mvPhotoLabel(photo,'本 MV 认人图'),'本 MV 认人图');});
test('main and original retain distinct actual private attachment indices',()=>{assert.equal(model.privatePhotoSource(primary),'/api/media?table=ratings&record=rating-a&index=3');assert.equal(model.privatePhotoSource(model.mvReferencePhoto(primary,reference)),'/api/media?table=ratings&record=rating-a&index=0');const props={photo:primary,referencePhoto:reference,label:'张员瑛 · Violeta'};const closed=render(props);assert.match(closed,/原MV截图/);assert.doesNotMatch(closed,/data-reference-src|https?:/);const open=render(props,JSON.stringify([model.privatePhotoSource(reference),props.label]));assert.match(open,/index=0/);assert.doesNotMatch(open,/index=3/);assert.match(open,/张员瑛 · Violeta · 原MV截图/);});
test('reference does not appear for snapshots, absent candidates, portrait fallback, wrong binding or same attachment',()=>{for(const photo of [null,reference,{...primary,table:'members'}])assert.equal(render({photo,referencePhoto:reference,label:'member'}),'');for(const ref of [null,{...reference,table:'members'},{...reference,recordId:'other'},{...reference,fieldId:'other'},{...reference,index:3},{...reference,index:-1},{...reference,sourceKind:'mv_look_photo'},...['档案照','资料照','概念照','本 MV 具名全员拼图'].map(kind=>({...reference,kind}))])assert.equal(render({photo:primary,referencePhoto:ref,label:'member'}),'');assert.equal(render({photo:primary,referencePhoto:reference,label:'member',live:false}),'');});
test('reference UI is bound to current source and label rather than stale open state',()=>{const props={photo:primary,referencePhoto:reference,label:'member'};assert.doesNotMatch(render(props,JSON.stringify([model.privatePhotoSource(reference),'previous member'])),/data-reference-src/);});
test('shared MV and member cards use exact identity component while retaining references and editors',()=>{
 const page=fs.readFileSync('app/page.tsx','utf8'),identity=fs.readFileSync('components/mv-identity-photo.tsx','utf8'),css=fs.readFileSync('components/mv-identity-photo.css','utf8');
 assert.match(page,/<MvIdentityPhoto work=\{work\}/);assert.match(page,/<MvIdentityPhoto work=\{item.work\}/);
 assert.match(page,/<MvPhotoReference photo=\{r.photo\} referencePhoto=\{r.referencePhoto\}/);
 assert.match(page,/onDirtyChange=\{markDirty\} onNavigationBlockedChange=\{markNavigationBlocked\}/);
 assert.match(identity,/publicMvPortrait\(work,memberId\)/);assert.match(identity,/publicImage\?publicImage.sourceCrop:focus\?\.sourceCrop/);
 assert.match(css,/aspect-ratio:3\/4/);assert.match(identity,/<PhotoLightbox src=\{src\}/);
});

test('LE SSERAFIM and shared XG gallery hooks use the same approved-only native frame and private reference',()=>{
 for(const [file,prefix]of [['components/lesserafim-artist.tsx','lf'],['components/expanded-artist.tsx','nx']]){
  const source=fs.readFileSync(file,'utf8');assert.ok(source.includes("className={'"+prefix+"-member-look member-mv-look'+(x.photo?.sourceKind==='mv_look_photo'?' mv-look-native':'')}"));
  assert.match(source,/<MvPhotoReference photo=\{x.photo\} referencePhoto=\{x.referencePhoto\}/);assert.match(source,/live=\{data.mode==='live'\}/);assert.match(source,/mvPhotoLabel\(x.photo,/);
 }
 const css=fs.readFileSync('components/mv-photo-reference.css','utf8');assert.match(css,/\.member-mv-look\.mv-look-native\{display:block;background:transparent!important\}/);
});
