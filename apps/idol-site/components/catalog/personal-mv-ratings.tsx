'use client';
import {useEffect,useImperativeHandle,useRef,useState,type RefObject} from 'react';
import type {Member,PersonalMvRating,PersonalMvRatings} from '@/lib/idol/types';
import {memberDisplayName} from '@/lib/idol/member-display-name';

type Change=(key:string,value:boolean)=>void;
type Values=Pick<PersonalMvRating,'score'|'stylingScore'|'revision'>;
type SaveBody=PersonalMvRating&{scope:string;operationId:string};
const empty:Values={score:null,stylingScore:null,revision:0};
const label=(value:number|null)=>value===null?'未评分':String(value);
const inputText=(value:number|null)=>value===null?'':String(value);
const fieldId=(workId:string,memberId:string)=>'personal-mv-'+workId+'-'+memberId;

function ScoreForm({scope,workId,videoId,member,entry,onDirty,onBlocked,onSaved}:{
 scope:string;workId:string;videoId:string;member:Member;entry?:PersonalMvRating;onDirty:Change;onBlocked:Change;onSaved:()=>void;
}){
 const [baseline,setBaseline]=useState<Values>(entry??empty);
 const [score,setScore]=useState(inputText(baseline.score));
 const [styling,setStyling]=useState(inputText(baseline.stylingScore));
 const [saving,setSaving]=useState(false),[retry,setRetry]=useState(false),[message,setMessage]=useState('');
 const inFlight=useRef(false),pending=useRef<SaveBody|null>(null);
 const draft={score:score===''?null:Number(score),stylingScore:styling===''?null:Number(styling)};
 const dirty=draft.score!==baseline.score||draft.stylingScore!==baseline.stylingScore;
 const id=fieldId(workId,member.id),key='ratings:'+id;
 const newer=entry&&entry.revision>baseline.revision?entry:null;
 function load(values:Values){setBaseline(values);setScore(inputText(values.score));setStyling(inputText(values.stylingScore));setMessage('');}
 if(newer&&!dirty&&!saving&&!retry)load(newer);
 useEffect(()=>{onDirty(key,dirty);return()=>onDirty(key,false);},[key,dirty,onDirty]);
 useEffect(()=>{onBlocked(key,saving||retry);return()=>onBlocked(key,false);},[key,saving,retry,onBlocked]);
 const valid=Object.values(draft).every(value=>value===null||Number.isFinite(value)&&value>=0&&value<=10);
 async function save(){
  if(inFlight.current||(!dirty&&!retry)||!valid||newer&&!retry)return;
  inFlight.current=true;setSaving(true);setMessage('');
  const body=pending.current??{...draft,scope,workId,videoId,memberId:member.id,revision:baseline.revision,operationId:crypto.randomUUID()};
  pending.current=body;
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);
  try{
   const response=await fetch('/api/personal-mv-ratings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:controller.signal})
    .catch(()=>{throw new Error('未能连接手帐。当前输入已保留，请恢复网络后核对上次保存。');});
   const value:unknown=await response.json().catch(()=>{throw new Error('保存结果尚未确认，请核对上次保存。');});
   if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('保存结果尚未确认，请核对上次保存。');
   const result=value as Record<string,unknown>;
   if(!response.ok){
    if([400,401,403,404,409].includes(response.status)&&typeof result.error==='string'&&result.error!=='SAVE_UNRESOLVED'){
     pending.current=null;setRetry(false);
     if(response.status===409)onSaved();
     throw new Error(typeof result.message==='string'?result.message:'保存未完成，请重新载入。');
    }
    throw new Error(typeof result.message==='string'?result.message:'保存结果尚未确认，请核对上次保存。');
   }
   if(result?.saved!==true||result.verified!==true||result.operationId!==body.operationId||
    result.scope!==scope||result.workId!==workId||result.videoId!==videoId||result.memberId!==member.id||
    result.revision!==body.revision+1||result.score!==body.score||result.stylingScore!==body.stylingScore){
    throw new Error('保存结果尚未确认，请核对上次保存。');
   }
   pending.current=null;setRetry(false);
   load({score:body.score,stylingScore:body.stylingScore,revision:body.revision+1});setMessage('已保存');onSaved();
  }catch(error){
   setRetry(!!pending.current);
   setMessage(controller.signal.aborted?'保存回执超时，请核对上次保存。':error instanceof Error?error.message:'连接中断，请核对上次保存。');
  }finally{clearTimeout(timer);inFlight.current=false;setSaving(false);}
 }
 return <fieldset id={id} className="editor personal-score-form" tabIndex={-1} data-dirty={dirty?'true':undefined} data-navigation-blocked={saving||retry?'true':undefined}>
  <legend>{memberDisplayName(member)}</legend>
  <div className="editor-fields">{([['表现分',score,setScore],['造型分',styling,setStyling]] as const).map(([title,value,change])=><label key={title}>
   <span>{title}</span><div className="score-input"><input type="number" inputMode="decimal" min="0" max="10" step="any" value={value} placeholder="未评分"
    aria-label={memberDisplayName(member)+'的'+title} disabled={saving||retry} onChange={event=>{change(event.target.value);setMessage('');}}/><small>/ 10</small></div>
  </label>)}</div>
  <div className="editor-actions"><button type="button" className="button primary small" onClick={()=>void save()} disabled={saving||(!dirty&&!retry)||!valid||!!newer&&!retry}>
   {saving?'保存中…':retry?'核对上次保存':'保存成员评分'}
  </button>{newer&&dirty&&!saving&&!retry&&<button type="button" className="text-button" onClick={()=>load(newer)}>载入最新评分</button>}</div>
  {message&&<p role="status" className="save-message">{message}</p>}
 </fieldset>;
}

export function PersonalMvRatingsPanel({ratings,workId,videoId,roster,existingMembers,openRef,onDirty,onBlocked,onSaved}:{
 ratings:PersonalMvRatings;workId:string;videoId:string;roster:Member[];existingMembers:Set<string>;
 openRef:RefObject<((id:string)=>void)|null>;onDirty:Change;onBlocked:Change;onSaved:()=>void;
}){
 const entries=ratings.entries.filter(row=>row.workId===workId&&row.videoId===videoId);
 const choices=roster.filter(member=>!existingMembers.has(member.id));
 const [opened,setOpened]=useState<string[]>([]);
 const selectId='personal-mv-choose-'+workId;
 function open(id:string){
  if(!ratings.writable||!choices.some(member=>member.id===id))return;
  setOpened(previous=>previous.includes(id)?previous:[...previous,id]);
  window.requestAnimationFrame(()=>document.getElementById(fieldId(workId,id))?.querySelector('input')?.focus());
 }
 useImperativeHandle(openRef,()=>open);
 if(!entries.length&&(!ratings.writable||!choices.length))return null;
 return <div className="personal-mv-ratings">
  {entries.length>0&&<ul className="personal-mv-saved">{entries.map(row=>{
   const member=roster.find(m=>m.id===row.memberId);
   if(!member)return null;
   return <li key={member.id}><strong>{memberDisplayName(member)}</strong><span>表现 {label(row.score)} · 造型 {label(row.stylingScore)}</span>
    {ratings.writable&&!existingMembers.has(member.id)&&<button type="button" className="text-button" onClick={()=>open(member.id)} aria-label={'修改'+memberDisplayName(member)+'的个人评分'}>修改</button>}</li>;
  })}</ul>}
  {ratings.writable&&choices.length>0&&<div className="personal-mv-picker"><label htmlFor={selectId}>添加成员评分</label>
   <select id={selectId} value="" onChange={event=>open(event.target.value)}><option value="">选择成员</option>{choices.map(member=><option key={member.id} value={member.id}>{memberDisplayName(member)}</option>)}</select>
   <small>选择想记录的成员，分数仅自己可见。</small></div>}
  {ratings.writable&&opened.map(id=>{
   const member=choices.find(m=>m.id===id);
   return member&&<ScoreForm key={id} scope={ratings.scope} member={member} workId={workId} videoId={videoId} entry={entries.find(row=>row.memberId===id)} onDirty={onDirty} onBlocked={onBlocked} onSaved={onSaved}/>;
  })}
 </div>;
}
