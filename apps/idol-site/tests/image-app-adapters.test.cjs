'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const esbuild=require('esbuild');
const root=path.resolve(__dirname,'..');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'image-app-adapters-'));
let fixture;
test.before(async()=>{
 const reference=path.join(__dirname,'fixtures/image-reliability/app-reference');
 const snippets=['PhotoView.tsx.txt','WorkCard.tsx.txt','MemberWorkCard.tsx.txt'].map(name=>fs.readFileSync(path.join(reference,name),'utf8')).join('\n');
 const entry=`import {useState,useEffect,useCallback,useMemo,useRef} from 'react';
 import {ImageIcon,Disc3,Play,ArrowUpRight} from 'lucide-react';
 import {CatalogPhotoImage,WorkCoverImage,ConceptPhotoImage} from './components/app-image-presentation';
 import {PhotoLightbox} from './components/photo-lightbox';
 import {ImageRecoveryProvider,ImageRecoveryControls} from './components/reliable-image';
 import {videoId} from './lib/idol/values';
 const memberDisplayName=(m:any)=>m.stageName||m.name;
 const names=(_data:any,ids:string[])=>ids.join(' · ');
 const stageStatusLabel=(work:any)=>work.stage?'已关联':'尚未关联';
 ${snippets}
 export {PhotoView,WorkCard,MemberWorkCard,CatalogPhotoImage,WorkCoverImage,ConceptPhotoImage,ImageRecoveryProvider,ImageRecoveryControls};`;
 const output=path.join(temp,'fixture.cjs');
 await esbuild.build({stdin:{contents:entry,resolveDir:root,loader:'tsx'},bundle:true,write:true,outfile:output,platform:'node',format:'cjs',jsx:'automatic',external:['react','react-dom','react-dom/*'],nodePaths:(process.env.NODE_PATH||'').split(path.delimiter).filter(Boolean),loader:{'.css':'empty'},logLevel:'silent'});
 fixture=require(output);
});
test.after(()=>fs.rmSync(temp,{recursive:true,force:true}));
const photo={table:'ratings',recordId:'recFixtureImage',index:2};
const work={id:'recFixtureWork',url:'https://www.youtube.com/watch?v=abcdefghijk',song:'合成曲',name:'合成作品',groupIds:['recFixtureGroup'],score:0,stage:null,releaseDate:'2026-01-01',watched:'看过',videoType:'MV',version:''};
const render=(Component,props)=>renderToStaticMarkup(React.createElement(Component,props));
function assertNoNestedInteractive(html){
 const stack=[];
 for(const tag of html.match(/<\/?(?:button|a)\b[^>]*>/g)||[]){
  if(tag.startsWith('</'))assert.equal(stack.pop(),/^<\/(button|a)/.exec(tag)[1]);
  else {assert.equal(stack.length,0,'interactive elements must be siblings, never nested');stack.push(/^<(button|a)/.exec(tag)[1]);}
 }
 assert.equal(stack.length,0);
}
test('actual Catalog adapter preserves API coordinates, SSR source and contain without an empty request',()=>{
 const html=render(fixture.CatalogPhotoImage,{photo,label:'合成成员 · 本 MV 个人造型',fit:'contain'});
 assert.match(html,/src="\/api\/media\?table=ratings&amp;record=recFixtureImage&amp;index=2"/);
 assert.match(html,/object-fit:contain/);assert.match(html,/loading="lazy"/);assert.match(html,/decoding="async"/);
 for(const input of [{photo:null},{photo,live:false}])assert.doesNotMatch(render(fixture.CatalogPhotoImage,{...input,label:'合成缺图'}),/<img|src=""/);
});
test('actual video and concept adapters retain original source/alt/critical policy and no nested retry',()=>{
 const html=renderToStaticMarkup(React.createElement('button',{},React.createElement(fixture.WorkCoverImage,{work})));
 assert.match(html,/https:\/\/i.ytimg.com\/vi\/abcdefghijk\/hqdefault.jpg/);
 assert.equal((html.match(/<button\b/g)||[]).length,1);assert.doesNotMatch(html,/retry=|token=|blob:/);
 const concept=render(fixture.ConceptPhotoImage,{src:'https://official.example.test/photo?signature=kept',memberId:'recFixtureMember',label:'合成成员 · 原资料概念照'});
 assert.match(concept,/loading="eager"/);assert.match(concept,/fetchPriority="high"/);assert.match(concept,/signature=kept/);
});
test('review-only WorkCard hunk executes real adapter while preserving a zero score and original target',()=>{
 const html=render(fixture.WorkCard,{work,data:{},onOpen(){}});
 assert.match(html,/0\.0/);assert.match(html,/data-browse-anchor="work-recFixtureWork"/);
 assert.equal((html.match(/<button\b/g)||[]).length,1);assert.match(html,/合成曲 官方视频封面/);
});
test('review-only MemberWorkCard hunk keeps two member/work identities, zero dimensions and body targets',()=>{
 const cards=['A','B'].map((suffix,index)=>React.createElement(fixture.MemberWorkCard,{key:suffix,item:{work:{...work,id:'recFixtureWork'+suffix},photo:{...photo,recordId:'recFixtureRating'+suffix,index},performance:0,styling:0},member:{id:'recFixtureMember'+suffix,stageName:'合成成员'+suffix,name:'合成成员'+suffix},data:{mode:'live'},onOpen(){}}));
 const html=renderToStaticMarkup(React.createElement('div',{},cards));
 for(const suffix of ['A','B']){assert.match(html,new RegExp(`data-member-work-trigger="recFixtureWork${suffix}"`));assert.match(html,new RegExp('record=recFixtureRating'+suffix));assert.match(html,new RegExp('合成成员'+suffix));}
 assert.equal((html.match(/>0\.0</g)||[]).length,4);assert.doesNotMatch(html,/待评/);assertNoNestedInteractive(html);
});
test('PhotoView proposal retains caption/original link and its scope is explicitly pending real App integration',()=>{
 const html=render(fixture.PhotoView,{photo,label:'合成成员',kind:'MV造型',fit:'contain'});
 assert.match(html,/image-label/);assert.match(html,/aria-label="放大MV造型"/);assert.match(html,/object-fit:contain/);
 const proof=JSON.parse(fs.readFileSync(path.join(root,'HANDOFF/image-reliability/APP_ENTRY_PROPOSAL.json'),'utf8'));
 assert.equal(proof.app_page_modified,false);assert.equal(proof.hunks.length,4);assert.ok(proof.hunks.every(row=>row.status==='待dot合入真实App'&&!row.standalone_compilation));
 assert.equal(fs.existsSync(path.join(root,'tests/fixtures/image-reliability/app-reference/app/page.tsx')),false,'reference fixture must not reconstruct the withheld App');
});
