'use client';
import {useEffect,useRef,useState} from 'react';
import {runCareerChunks,type CareerStatus} from './flow';
import '../manage.css';
type Preview={expected:{snapshot:string;epoch:number;schemaHash:string;batchHash:string};operationId:string;memberCount:number;claimCount:number;applied:number;revisions:Record<string,string>;rows:{memberId:string;name:string;changes:{field:string;before:string;after:string|string[]}[]}[]};
type Status=CareerStatus;
const storageKey='career-batch-review-v1';
const labels:Record<string,string>={profile:'职业简介',role:'定位',officialUrl:'官方链接'};
async function read(r:Response){const d:any=await r.json();if(!r.ok)throw new Error(d.message||'操作暂未完成，请核对状态。');return d;}
export default function Careers(){const [preview,setPreview]=useState<Preview|null>(null),[operationId,setOperationId]=useState(''),[status,setStatus]=useState<Status|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[uncertain,setUncertain]=useState(false);const lock=useRef(false),controller=useRef<AbortController|null>(null),mounted=useRef(true);
 useEffect(()=>{mounted.current=true;try{const stored=JSON.parse(localStorage.getItem(storageKey)||'null');if(stored?.operationId){setOperationId(stored.operationId);setUncertain(true);}else setOperationId(crypto.randomUUID());}catch{setOperationId(crypto.randomUUID());}return()=>{mounted.current=false;controller.current?.abort();};},[]);
 async function act(action:'preview'|'apply'|'rollback'|'status'){
  if(lock.current)return;
  if(action==='apply'&&!window.confirm('将更新预览中的职业简介、定位和官方链接。确认保存整批资料吗？'))return;
  if(action==='rollback'&&!window.confirm('恢复本次更新的公开字段？之后修改过的字段会暂停恢复，其他资料保持当前内容。'))return;
  lock.current=true;setBusy(true);setError('');const abort=new AbortController();controller.current=abort;
  const send=async()=>{const timer=setTimeout(()=>abort.abort(),60000);try{return await read(await fetch(action==='status'?'/api/manage/careers?operationId='+encodeURIComponent(operationId):'/api/manage/careers',{signal:abort.signal,method:action==='status'?'GET':'POST',cache:'no-store',...(action==='status'?{}:{headers:{'Content-Type':'application/json'},body:JSON.stringify({action,operationId,...(action==='apply'?{revisions:preview?.revisions,expected:preview?.expected}:{})})})}));}finally{clearTimeout(timer);}};
  try{
   localStorage.setItem(storageKey,JSON.stringify({operationId}));
   if(action==='apply'||action==='rollback')await runCareerChunks(action,send,d=>{if(mounted.current){setStatus(d);setUncertain(!!d.interrupted);}},abort.signal);
   else{const d=await send();if(!mounted.current)return;if(action==='preview'){setPreview(d);setStatus(null);}else setStatus(d);setUncertain(false);}
  }catch(e){if(mounted.current){setError(abort.signal.aborted?'响应等待较久，请核对本次状态后再继续。':(e as Error).message);if(action!=='preview')setUncertain(true);}}
  finally{lock.current=false;if(mounted.current)setBusy(false);}
 }

 return <main className="manage-shell"><a className="text-button" href="/manage">← 管理资料</a><div className="manage-heading"><h1>更新成员职业资料</h1><p>先查看已审核的简介、定位和官方链接，再确认保存。</p></div><section className="panel"><div className="manage-save"><button className="button" disabled={busy||!operationId||uncertain} onClick={()=>void act('preview')}>预览本批资料</button><button className="button primary" disabled={busy||!preview||uncertain||status?.complete||status?.rows.some(r=>['conflict','rolled_back'].includes(r.state))} onClick={()=>void act('apply')}>{status?.applied?'继续本次更新':'确认更新预览资料'}</button><button className="button" disabled={busy||!operationId} onClick={()=>void act('status')}>核对本次状态</button><button className="button" disabled={busy||!status?.rows.some(r=>r.rollbackEligible)||status?.rows.some(r=>r.state==='conflict'&&!r.rollbackEligible)||uncertain} onClick={()=>void act('rollback')}>恢复本次更新</button></div>{busy&&<p role="status">正在处理，请稍候…</p>}{error&&<p role="alert">{error}</p>}{uncertain&&<p>请先核对本次状态，再继续操作。</p>}{status&&<p role="status">已核对保存 {status.applied} / {status.total} 位成员。{status.complete?'本批更新完成。':status.rows.some(r=>r.state==='conflict'&&!r.rollbackEligible)?'本次更新的字段或存储发生变化，请先核对。':status.rows.some(r=>r.conflictReason==='untouched_fields_changed')?'其他资料后来有修改；恢复本次更新会保留这些修改。':status.rows.some(r=>r.state==='rolled_back')?'已恢复的记录不会再次更新。':'可以继续预览或恢复本次已保存的内容。'}</p>}{preview&&<p>本批 {preview.claimCount} 项资料，涉及 {preview.memberCount} 位成员；本次已更新 {preview.applied} 位。</p>}</section>{preview?.rows.map(row=><section className="panel" key={row.memberId} style={{marginTop:16}}><h2>{row.name||row.memberId}</h2>{row.changes.map(c=><div key={c.field}><h3>{labels[c.field]}</h3><p><small>当前</small><br/>{c.before||'尚未填写'}</p><p><small>更新为</small><br/>{Array.isArray(c.after)?c.after.join('、'):c.after}</p></div>)}</section>)}</main>;
}
