'use strict';
const test=require('node:test');const assert=require('node:assert/strict');const path=require('node:path');const fs=require('node:fs');const os=require('node:os');
const React=require('react');const {renderToStaticMarkup}=require('react-dom/server');const {build}=require('./fixtures/image-reliability/build.cjs');
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'reliable-image-react-'));let component;
test.before(async()=>{const output=path.join(directory,'core.cjs');await build({entry:'core-entry.tsx',outfile:output});component=require(output);});
test.after(()=>fs.rmSync(directory,{recursive:true,force:true}));
function render(props){return renderToStaticMarkup(React.createElement(component.ReliableImage,{src:'/image-fixture/success.png',alt:'合成完整图',...props}));}
test('actual React emits exact SSR image source, alt, dimensions and native loading hints',()=>{
 const url='https://image-fixture.example/full.png?Signature=A%2BB&expires=2000';
 const html=render({src:url,identityKey:'fixture:A',width:400,height:600,style:{objectFit:'contain'},referrerPolicy:'no-referrer'});
 assert.match(html,/src="https:\/\/image-fixture\.example\/full\.png\?Signature=A%2BB&amp;expires=2000"/);
 assert.match(html,/alt="合成完整图"/);assert.match(html,/loading="lazy"/);assert.match(html,/fetchPriority="auto"/);assert.match(html,/decoding="async"/);assert.match(html,/width="400"/);assert.match(html,/height="600"/);assert.match(html,/object-fit:contain/);assert.match(html,/referrerPolicy="no-referrer"/);
 assert.doesNotMatch(html,/<button|blob:|src=""/);
});
test('critical image alone uses eager/high while host-provided explicit native hints remain meaningful',()=>{
 const hero=render({priority:true,loading:'lazy',fetchPriority:'low'});assert.match(hero,/loading="eager"/);assert.match(hero,/fetchPriority="high"/);
 const other=render({loading:'eager',fetchPriority:'low',decoding:'sync'});assert.match(other,/loading="eager"/);assert.match(other,/fetchPriority="low"/);assert.match(other,/decoding="sync"/);
});
test('missing input renders the host placeholder without an empty image request or retry announcement',()=>{
 for(const src of [null,undefined,'',' ']){
  const html=render({src,missing:React.createElement('div',{className:'host-empty'},'合成缺图'),fallback:React.createElement('div',null,'备用')});
  assert.match(html,/data-image-status="missing"/);assert.match(html,/host-empty/);assert.match(html,/合成缺图/);
  assert.match(html,/role="img"/);assert.match(html,/aria-label="合成完整图 · 暂无对应图片"/);
  assert.doesNotMatch(html,/<img|<button|role="(?:alert|status)"/);
 }
});
test('a native parent button or link retains its single interaction and original child image structure in SSR',()=>{
 for(const tag of ['button','a']){
  const html=renderToStaticMarkup(React.createElement(tag,tag==='a'?{href:'/fixture-target'}:{type:'button'},React.createElement(component.ReliableImage,{src:'/image-fixture/success.png',alt:'父级目标图',retryMode:'inline'})));
  assert.equal((html.match(new RegExp('<'+tag+'\\b','g'))||[]).length,1);assert.match(html,/<img/);
  assert.equal((html.match(/<button\b/g)||[]).length,tag==='button'?1:0,'no retry control is inserted into the parent interaction');
 }
});
test('real retry control event ports stop parent activation and preserve modal Tab/Escape propagation',()=>{
 let retries=0;const state={status:'error',attempt:0,generation:'fixture:0',src:'/image-fixture/error.png',canRetry:true,retry(){retries++;return true;}};
 const button=component.ImageRetryControl({state,label:'重试合成图'});assert.equal(button.type,'button');
 const click={prevented:false,stopped:false,preventDefault(){this.prevented=true;},stopPropagation(){this.stopped=true;}};
 button.props.onClick(click);assert.equal(retries,1);assert.equal(click.prevented,true);assert.equal(click.stopped,true);
 for(const key of ['Enter',' ']){const event={key,stopped:false,stopPropagation(){this.stopped=true;}};button.props.onKeyDown(event);assert.equal(event.stopped,true,key);}
 for(const key of ['Tab','Escape','ArrowRight']){const event={key,stopped:false,stopPropagation(){this.stopped=true;}};button.props.onKeyDown(event);assert.equal(event.stopped,false,key);}
 assert.equal(component.ImageRetryControl({state:{...state,status:'loaded'}}),null);
 assert.equal(component.ImageRetryControl({state:null}),null);
 // These are the production handler functions with finite event ports, not browser bubbling.
});
test('disabled retry state and default provider do not advertise background or bulk requests',()=>{
 const state={status:'error',attempt:1,generation:'fixture:1',src:'/image-fixture/error.png',canRetry:false,retry(){throw new Error('must not call during SSR');}};
 const html=renderToStaticMarkup(React.createElement(component.ImageRetryControl,{state}));assert.match(html,/disabled=""/);
 const empty=renderToStaticMarkup(React.createElement(component.ImageRecoveryProvider,null,React.createElement(component.ImageRecoveryControls)));
 assert.equal(empty,'');
});
test('dot App adapters preserve photo identity, snapshot placeholders and exact YouTube choice without owning save state',()=>{
 const photo={table:'ratings',recordId:'recFixtureRating',fieldId:'fixtureField',index:3};
 const live=renderToStaticMarkup(React.createElement(component.CatalogPhotoImage,{photo,label:'合成个人图',fit:'contain'}));
 assert.match(live,/src="\/api\/media\?table=ratings&amp;record=recFixtureRating&amp;index=3"/);assert.match(live,/object-fit:contain/);
 const missing=renderToStaticMarkup(React.createElement(component.CatalogPhotoImage,{photo,live:false,label:'合成个人图',missing:'快照缺图'}));assert.doesNotMatch(missing,/<img/);assert.match(missing,/快照缺图/);
 const cover=renderToStaticMarkup(React.createElement(component.WorkCoverImage,{work:{id:'recFixtureWork',url:'https://www.youtube.com/watch?v=FixtUrE0001',song:'合成曲',name:'合成名'}}));
 assert.match(cover,/https:\/\/i\.ytimg\.com\/vi\/FixtUrE0001\/hqdefault\.jpg/);
 const concept=renderToStaticMarkup(React.createElement(component.ConceptPhotoImage,{src:'/image-fixture/concept.png',memberId:'recFixtureMember',label:'合成成员概念照'}));assert.match(concept,/loading="eager"/);assert.match(concept,/fetchPriority="high"/);
});
