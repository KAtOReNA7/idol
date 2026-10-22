// Synthetic-only real React DOM regression; no production data or writes.
import React from 'react';
import {createRoot} from 'react-dom/client';
import App from '../app/page';
const results=[];const requests=[];
const work={id:'recW',song:'Synthetic song',name:'Synthetic song',groupIds:[],url:'',score:0,stageScore:null,note:'private needle '+'长备注'.repeat(200),watched:'已观看',videoType:'MV',version:'',releaseDate:'2000-01-01',verification:'',officialTitle:'',channel:'',ratingIds:[],source:'',stage:null,stageResearch:{status:'pending',reason:'synthetic',checkedAt:null}};
const member={id:'recM',name:'Synthetic member',stageName:'Synthetic member',cnName:'',groupIds:[],photo:null,favorite:0,note:'private needle member',profile:'',status:'',country:'',role:'',officialUrl:'',birthDate:''};
const catalog={mode:'live',capturedAt:'2000-01-01',loadedAt:'2000-01-01',warning:null,groups:[],members:[member],works:Array.from({length:30},(_,i)=>({...work,id:'recW'+i})),ratings:[],counts:{groups:0,members:1,works:30,ratings:0,ratedWorks:30,scoreSum:0}};
window.fetch=async(input,options={})=>{requests.push(String(input));if(options.method&&options.method!=='GET')throw Error('Fixture forbids writes');const url=String(input);let body;if(url.startsWith('/api/catalog'))body=catalog;else if(url==='/api/status')body={source:'feishu'};else if(url.startsWith('/api/records'))body={table:'works',values:{score:0,stageScore:null,note:work.note,watched:'已观看'},revision:'a'.repeat(64),watchedOptions:['已观看','未观看']};else throw Error('Blocked request');return new Response(JSON.stringify(body),{headers:{'content-type':'application/json'}});};
window.confirm=()=>false;window.alert=()=>{};
const delay=()=>new Promise(r=>setTimeout(r,40));
async function until(fn){for(let i=0;i<100;i++){if(fn())return;await delay();}throw Error('Timed out');}
const assert=(ok,label)=>{if(!ok)throw Error(label);results.push(label);};
const button=text=>[...document.querySelectorAll('button')].find(b=>b.textContent.includes(text));
async function input(node,value){Object.getOwnPropertyDescriptor(node.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,'value').set.call(node,value);node.dispatchEvent(new Event('input',{bubbles:true}));await delay();}
async function run(){
 history.replaceState(null,'','/?view=records');const root=createRoot(document.querySelector('#fixture'));root.render(<App/>);
 await until(()=>document.querySelector('[aria-label="搜索我的已保存记录"]'));
 assert(!document.body.textContent.includes(work.note),'empty query hides saved text');
 const initial=requests.length;await input(document.querySelector('input[type=search]'),'private needle');
 await until(()=>document.querySelectorAll('article').length===24);assert(requests.length===initial,'typing triggers no fetch');assert(!JSON.stringify(history.state).includes('private needle')&&!location.href.includes('private'),'query absent from history and URL');
 button('再看 24 条').click();await until(()=>document.querySelectorAll('article').length===31);assert(true,'24-row pagination expands to all 31');
 const target=[...document.querySelectorAll('[data-browse-anchor]')].find(x=>x.dataset.browseAnchor.includes('recW25'));target.scrollIntoView();target.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));target.focus();window.dispatchEvent(new Event('scroll'));await delay();const y=scrollY,key=target.dataset.browseAnchor;target.click();
 await until(()=>button('返回 搜我的记录'));button('返回 搜我的记录').click();await until(()=>document.querySelector('input[type=search]'));await delay();
 assert(document.querySelector('input[type=search]').value==='private needle','Back retains in-memory query');assert(document.querySelectorAll('article').length===31,'Back retains expanded results');assert(document.activeElement?.dataset.browseAnchor===key,'Back restores exact result focus');assert(Math.abs(scrollY-y)<4,'Back restores result scroll');
 const memberLink=button('查看成员记录');memberLink.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));memberLink.click();await until(()=>button('返回 搜我的记录'));assert(new URL(location.href).searchParams.get('member')==='recM','member result uses internal safe detail navigation');button('返回 搜我的记录').click();await until(()=>document.querySelector('input[type=search]'));
 button('查看作品').click();await until(()=>button('返回 搜我的记录'));const marker=document.createElement('div');marker.dataset.dirty='true';document.body.append(marker);const before=location.href;button('返回 搜我的记录').click();await delay();assert(location.href===before,'cancelled dirty return stays on detail');marker.remove();const pending=document.createElement('div');pending.dataset.navigationBlocked='true';document.body.append(pending);button('搜我的记录').click();await delay();assert(location.href===before,'uncertain save blocks record navigation');pending.remove();button('返回 搜我的记录').click();await until(()=>document.querySelector('input[type=search]'));
 button('清除记录搜索').click();await delay();assert(!document.querySelector('article'),'clear removes excerpts');assert(document.activeElement===document.querySelector('input[type=search]'),'clear restores input focus');await input(document.querySelector('input[type=search]'),'private needle');root.unmount();createRoot(document.querySelector('#fixture')).render(<App/>);await until(()=>document.querySelector('input[type=search]'));assert(document.querySelector('input[type=search]').value==='','remount clears query');
 document.querySelector('#results').textContent=JSON.stringify({status:'passed',results});
}
run().catch(error=>{document.querySelector('#results').textContent=JSON.stringify({status:'failed',results,error:error.message});});
