'use client';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import {MusicMemberPhoto} from './member-portrait';
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
 useEffect(()=>{
  if(!dirty&&!saving&&!retry)return;
  const protect=(event:BeforeUnloadEvent)=>event.preventDefault();
  window.addEventListener('beforeunload',protect);return()=>window.removeEventListener('beforeunload',protect);
 },[dirty,saving,retry]);
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
   setMessage(controller.signal.aborted?'未及时收到保存结果，请核对上次保存。':error instanceof Error?error.message:'连接中断，请核对上次保存。');
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

type ScoreProps={ratings:PersonalMvRatings;workId:string;videoId:string;onDirty:Change;onBlocked:Change;onSaved:()=>void};

export function PersonalMvScore({member,startOpen=false,...props}:ScoreProps&{member:Member;startOpen?:boolean}){
 const {ratings,workId,videoId}=props;
 const entry=ratings.entries.find(row=>row.workId===workId&&row.videoId===videoId&&row.memberId===member.id);
 const [chosen,setChosen]=useState(false);
 const opened=startOpen||chosen;
 const root=useRef<HTMLDivElement>(null);
 if(!ratings.writable&&!entry)return null;
 const name=memberDisplayName(member);
 return <div ref={root} className="mv-inline-score" data-score-member={member.id} data-score-kind="personal">
  {entry&&<p className="mv-inline-summary">表现 {label(entry.score)} · 造型 {label(entry.stylingScore)}</p>}
  {ratings.writable&&<button type="button" className="credit-score-action" aria-expanded={opened} aria-label={'给'+name+'评分'} onClick={()=>{
   setChosen(true);
   window.requestAnimationFrame(()=>root.current?.querySelector('input')?.focus({preventScroll:true}));
  }}>个人评分</button>}
  {ratings.writable&&opened&&<ScoreForm {...props} scope={ratings.scope} member={member} entry={entry}/>}
 </div>;
}

export type NativeScoreLocation={host:HTMLDivElement;placement:string};
export function NativeScoreButton({memberId,name,recordId,placement,active,onOpen}:{
 memberId:string;name:string;recordId:string;placement:string;active:boolean;onOpen:(node:HTMLDivElement)=>void;
}){
 const slot=useRef<HTMLDivElement>(null);
 return <div className="mv-inline-score" data-score-member={memberId} data-score-kind="native" data-score-record={recordId}>
  <button type="button" className="credit-score-action" aria-label={'给'+name+'评分'} aria-expanded={active}
   onClick={()=>{if(slot.current)onOpen(slot.current);}}>个人评分</button>
  <div ref={slot} data-score-placement={placement}/>
 </div>;
}

// Keep one mounted editor for a native record when its owner moves between the two photo cards.
export function NativeScorePortal({location,children}:{location:NativeScoreLocation;children:ReactNode}){
 return createPortal(children,location.host);
}

export function PersonalMvRatingsPanel({roster,...props}:ScoreProps&{roster:Member[]}){
 const {ratings,workId,videoId}=props;
 const entries=ratings.entries.filter(row=>row.workId===workId&&row.videoId===videoId);
 const [opened,setOpened]=useState<string[]>([]);
 const saved=new Set(entries.map(row=>row.memberId));
 const cards=[...opened.flatMap(id=>roster.filter(m=>m.id===id)),...roster.filter(m=>saved.has(m.id)&&!opened.includes(m.id))];
 if(!roster.length||(!ratings.writable&&!cards.length))return null;
 const picker='personal-mv-choose-'+workId;
 return <div className="personal-mv-ratings">
  {ratings.writable&&<div className="personal-mv-picker"><label htmlFor={picker}>添加成员评分</label>
   <select id={picker} value="" onChange={event=>{
    const id=event.target.value;
    setOpened(previous=>[id,...previous.filter(memberId=>memberId!==id)]);
   }}><option value="">选择成员</option>{roster.map(m=><option key={m.id} value={m.id}>{memberDisplayName(m)}</option>)}</select>
   <small>按团体名册选择，资料照供认人参考。</small>
  </div>}
  <div className="cast-grid">{cards.map(member=><article className="cast-card personal-roster-card" key={member.id} data-roster-score-member={member.id}>
   <MusicMemberPhoto member={member} live/><div className="cast-copy"><strong>{memberDisplayName(member)}</strong><small>成员资料照</small>
    <PersonalMvScore {...props} member={member} startOpen={opened.includes(member.id)}/>
   </div>
  </article>)}</div>
 </div>;
}
