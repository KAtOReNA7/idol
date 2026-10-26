import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {artist,render} from '../lib/idol/design-review/sol15-runtime/groups/udtt/index.js';
import {helpers} from '../lib/idol/design-review/sol15-runtime/model.mjs';
import {publicWorkDescription,publicMemberSources,publicWorkSources} from '../lib/idol/design-review/sol15-runtime/groups/udtt/presentation.js';
const {parseHTML}=process.env.UDTT_DOM_MODULE?await import(process.env.UDTT_DOM_MODULE):{};
const route=(page,key=null)=>({slug:'udtt',page,key,query:new URLSearchParams()});
const routes=[...['home','members','works','timeline'].map(page=>route(page)),...artist.members.map(member=>route('member',member.id)),...artist.works.map(work=>route('work',helpers.entityKey(work)))];
const hash=value=>createHash('sha256').update(value).digest('hex');
test('all public data and audit fields are retained verbatim and render has no mutation',()=>{
 assert.equal(hash(JSON.stringify(artist)),'4c9678bda0c37a27e87648a5e8196f2cc2cba1b3c3ffcded6ddac3a95545636d');
 const before=JSON.stringify(artist);for(const r of routes)render({route:r,helpers});assert.equal(JSON.stringify(artist),before);
 const stage=artist.works.find(work=>work.type==='stage');assert.match(stage.description,/metadata version matching/);assert.match(stage.description,/不据此判定真唱/);assert.equal(publicWorkDescription(stage),null);assert.equal(publicWorkDescription({...stage,description:'new text not yet reviewed'}),null);
 for(const [file,sha] of [["lib/idol/design-review/sol15-runtime/groups/udtt/data.js","c6566c41d437fc1e75c7fc0c1890dbe0274ca2f8eb4b78ae36a9e90a3164353c"],["lib/idol/design-review/sol15-runtime/groups/udtt/reconciliation.js","2595bc4d661c59fe0c21fc4131988a4fb44cf08c0e11f2888dca3ba4e6a199e9"],["lib/idol/design-review/sol15-runtime/shared/reconcile.js","fa199fc9b363ec4acaae8080898712a493e4b81625904378d02d81bb4f324b54"],["lib/idol/design-review/sol15-runtime/shared/imagery-manifest.js","ad266e23abd44497075a1c0a1878af59d86140e253af2666b54b9a6f67f982fa"],["lib/idol/design-review/sol15-runtime/shared/imagery-targets.js","6bd59ad0bf00c8793a5a95222802501f2edf6a8ae02b45dd392f2479a4bea5bc"]])assert.equal(hash(fs.readFileSync(new URL('../'+file,import.meta.url))),sha,file);
});
test('member source merging is read-only and retains exact source URL/ID pairs',()=>{
 for(const member of artist.members){const before=JSON.stringify(member),sources=publicMemberSources(member);assert.equal(sources.length,new Set([...member.sources,...member.careerSources].map(s=>typeof s==='string'?s:s.url)).size);assert.equal(new Set(sources.map(s=>s.url)).size,sources.length);for(const source of sources){assert.ok([...member.sources,...member.careerSources].some(s=>s.url===source.url&&(s.sourceId??s.id)===(source.sourceId??source.id)));}assert.equal(JSON.stringify(member),before);}
});
test('video source CTA is not repeated in a second source list',()=>{for(const work of artist.works.filter(w=>w.videoId))assert.equal(publicWorkSources(work,helpers.videoHref).length,0);for(const work of artist.works.filter(w=>w.type==='release'))assert.ok(publicWorkSources(work,helpers.videoHref).length>0);});
const report=[];
for(const r of routes)test(`parsed public copy: ${r.page}${r.key?': '+r.key:''}`,{skip:!parseHTML&&'Set UDTT_DOM_MODULE to an existing LinkeDOM ESM entry'},()=>{
 const {document}=parseHTML('<html><body>'+render({route:r,helpers})+'</body></html>');const main=document.querySelector('main'),text=document.body.textContent.replace(/\s+/g,' ');report.push({page:r.page,key:r.key,text});
 for(const forbidden of ['metadata version matching','audio fingerprinting','full viewing','依据公开标题','未逐句核对','不据此判定真唱','来源核验','主办方原稿','发行者原稿','未知，不作'])assert.equal(text.includes(forbidden),false,forbidden);
 if(r.page==='member'){const member=artist.members.find(m=>m.id===r.key);assert.ok(text.includes(member.profile||member.summary));assert.equal(main.querySelectorAll('details.ud-sources').length,1);const links=[...main.querySelectorAll('.ud-sources a')].map(node=>node.getAttribute('href'));assert.equal(new Set(links).size,links.length);assert.equal(links.length,publicMemberSources(member).length);}
 if(r.page==='work'){const work=artist.works.find(w=>helpers.entityKey(w)===r.key);assert.equal(main.querySelector('h1').textContent,work.title);if(work.date)assert.equal(main.querySelector('time').textContent,helpers.dateLabel(work.date));if(work.description)assert.equal(text.includes(work.description),false);}
 if(r.page==='timeline'){const events=helpers.sortTimeline(artist.timeline),rows=[...main.querySelectorAll('li[data-event-id]')];assert.equal(rows.length,4);rows.forEach((node,index)=>{const event=events[index];assert.equal(node.getAttribute('data-event-id'),event.id);assert.equal(node.querySelector('time').getAttribute('datetime'),event.date);assert.equal(node.querySelector('time').textContent,helpers.dateLabel(event.date,event.precision));assert.equal(node.querySelector('h2').textContent,event.title);assert.equal(node.querySelectorAll('p,a,details,dl').length,0);assert.equal(node.textContent,helpers.dateLabel(event.date,event.precision)+event.title);});}
});
test('write the optional all-route visible text audit only after every parsed route completed',{skip:!parseHTML&&'Requires parsed DOM'},()=>{assert.equal(report.length,14);if(process.env.UDTT_COPY_REPORT)fs.writeFileSync(process.env.UDTT_COPY_REPORT,JSON.stringify({note:'Includes all parsed text, including collapsed source labels; not visual browser acceptance.',routes:report},null,2)+'\n');});
