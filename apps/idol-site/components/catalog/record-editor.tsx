'use client';
import {useCanEdit} from '@/components/public-access';
import {useEffect, useState, useCallback, useRef, type RefObject} from 'react';
import {Check, LockKeyhole, ChevronRight, Star, LoaderCircle} from 'lucide-react';
import type {CatalogView as Catalog} from '@/lib/idol/types';
import {stageSourceKey} from '@/lib/idol/stage-source';
import {requestMessage} from '@/lib/idol/product-copy';
import {score, readResponse} from './presentation';

function LoonaScoreInput({value,onChange,disabled,label}:{value:number|null;onChange:(value:number|null)=>void;disabled:boolean;label:string}){
 const [focused,setFocused]=useState(false);
 const adjust=(delta:number)=>onChange(Math.max(0,Math.min(10,Math.round(((value??0)+delta)*10)/10)));
 return <div className="loona-score-control">
  <div className="loona-score-stepper">
   <button type="button" aria-label={label+'减少 0.1'} disabled={disabled||value===null||value<=0} onClick={()=>adjust(-.1)}>−</button>
   <div className="score-input"><input aria-label={label} inputMode="decimal" type="number" min="0" max="10" step="0.1" placeholder="未评分" disabled={disabled} value={value===null?'':focused?value:value.toFixed(1)} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} onChange={event=>{const text=event.target.value;if(text==='')onChange(null);else if(Number.isFinite(Number(text)))onChange(Math.round(Number(text)*10)/10);}}/><small>/ 10</small></div>
   <button type="button" aria-label={label+'增加 0.1'} disabled={disabled||(value!==null&&value>=10)} onClick={()=>adjust(.1)}>+</button>
  </div>
  <button type="button" className="loona-score-clear" aria-label={label+'清除评分'} disabled={disabled||value===null} onClick={()=>onChange(null)}>清除评分</button>
  <small>0–10 分，每次调整 0.1。未评分与 0.0 分开记录。</small>
 </div>;
}

export function Editor({publicCatalog,table,id,mode,onSaved,compact=false,loona=false,triples=false,madein=false,editorial=false,workView,stageVideoId,sourceKey,onDirtyChange,onNavigationBlockedChange,saveButtonRef,onSaveAvailabilityChange}:{publicCatalog?:Catalog;table:'works'|'members'|'ratings'|'groups';id:string;mode:Catalog['mode'];onSaved:()=>void;compact?:boolean;loona?:boolean;triples?:boolean;madein?:boolean;editorial?:boolean;workView?:'mv'|'stage';stageVideoId?:string|null;sourceKey?:string|null;onDirtyChange?:(key:string,dirty:boolean)=>void;onNavigationBlockedChange?:(key:string,blocked:boolean)=>void;saveButtonRef?:RefObject<HTMLButtonElement|null>;onSaveAvailabilityChange?:(enabled:boolean,retry:boolean)=>void}){
 const canEdit=useCanEdit();
 const [open,setOpen]=useState(table==='works');const [detail,setDetail]=useState<any>(null);const [draft,setDraft]=useState<Record<string,any>>({});const [state,setState]=useState<'idle'|'loading'|'saving'|'saved'|'error'>('idle');const [message,setMessage]=useState('');const pendingSave=useRef<any>(null);const [pendingRetry,setPendingRetry]=useState(false);const [stageDraftVideoId,setStageDraftVideoId]=useState<string|null>(stageVideoId??null);const [stageDraftSourceKey,setStageDraftSourceKey]=useState<string|null>(sourceKey??stageVideoId??null);
 const saving=useRef(false);
 const readSequence=useRef(0);const readAbort=useRef<AbortController|null>(null);
 const load=useCallback(async()=>{if(!canEdit||mode!=='live')return;const sequence=++readSequence.current;readAbort.current?.abort();const controller=new AbortController();readAbort.current=controller;const timeout=setTimeout(()=>controller.abort(),30000);setState('loading');setMessage('');try{const r=await fetch(`/api/records?table=${table}&id=${id}`,{cache:'no-store',signal:controller.signal});const d:any=await readResponse(r);if(sequence!==readSequence.current)return;if(controller.signal.aborted)throw new Error('读取用时较长，请重试。输入会保留。');if(!r.ok)throw new Error(requestMessage(d.error));setDetail(d);setDraft(d.values);pendingSave.current=null;setPendingRetry(false);setState('idle');if(d.pendingSave)setMessage('上次保存结果还未确认，请让助手处理后再继续。');}catch(e){if(sequence!==readSequence.current)return;setState('error');setMessage(controller.signal.aborted?'读取用时较长，请重试。输入会保留。':(e as Error).message);}finally{clearTimeout(timeout);if(readAbort.current===controller)readAbort.current=null;}},[table,id,mode,canEdit]);
 useEffect(()=>{if(open)void load();return()=>{readSequence.current++;readAbort.current?.abort();readAbort.current=null;};},[open,load]);
 const dirty=!!detail&&JSON.stringify(draft)!==JSON.stringify(detail.values);
 useEffect(()=>{onDirtyChange?.(table+':'+id,dirty);return()=>onDirtyChange?.(table+':'+id,false);},[dirty,table,id,onDirtyChange]);
 const navigationBlocked=state==='saving'||pendingRetry||!!detail?.pendingSave;
 useEffect(()=>{onNavigationBlockedChange?.(table+':'+id,navigationBlocked);return()=>onNavigationBlockedChange?.(table+':'+id,false);},[navigationBlocked,table,id,onNavigationBlockedChange]);
 const stageSourceMismatch=table==='works'&&!!detail&&draft.stageScore!==detail.values.stageScore&&(stageDraftVideoId!==(stageVideoId??null)||stageDraftSourceKey!==(sourceKey??stageVideoId??null));
 const canSave=canEdit&&!stageSourceMismatch&&mode==='live'&&!detail?.pendingSave&&(dirty||pendingRetry)&&state!=='saving'&&state!=='loading';
 useEffect(()=>{onSaveAvailabilityChange?.(canSave,pendingRetry);},[canSave,pendingRetry,onSaveAvailabilityChange]);
 const hiddenWorkScoreDirty=table==='works'&&workView&&detail&&draft[workView==='stage'?'score':'stageScore']!==detail.values[workView==='stage'?'score':'stageScore'];
 useEffect(()=>{if(!dirty&&!navigationBlocked)return;const h=(e:BeforeUnloadEvent)=>e.preventDefault();window.addEventListener('beforeunload',h);return()=>window.removeEventListener('beforeunload',h);},[dirty,navigationBlocked]);
 const fields=table==='works'?[['score','MV 分数','score'],['stageScore','舞台分数','score'],['watched','观看状态','select'],['note','我的点评','text']]:table==='members'?[['note','我的备注','text']]:table==='ratings'?[['score','表现分','score'],['stylingScore','造型喜欢','score'],['memory','记忆点','text'],['note','我的备注','text']]:[['note','我的备注','text']];
 async function save(){
  if(!canSave||!detail||saving.current)return;
  saving.current=true;
  setState('saving');
  setMessage('');
  try{
   if(!pendingSave.current){
    const values=Object.fromEntries(Object.entries(draft).filter(([key,value])=>value!==detail.values[key]));
    pendingSave.current={table,recordId:id,revision:detail.revision,operationId:crypto.randomUUID(),values,
     ...(table==='works'&&Object.hasOwn(values,'stageScore')?{stageVideoId:stageDraftVideoId,stageSourceKey:stageDraftSourceKey}:{})};
   }
   const response=await fetch('/api/save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(pendingSave.current)});
   const result=await readResponse(response);
   if(!response.ok){
    const code=result&&typeof result==='object'&&'error' in result?result.error:null;
    if(typeof code==='string'&&['EDIT_CONFLICT','SCHEMA_CHANGED','INVALID_SCORE','INVALID_TEXT','INVALID_STATUS','FIELD_NOT_ALLOWED','PREFLIGHT_FAILED','STAGE_SOURCE_CHANGED'].includes(code)){
     pendingSave.current=null;
    }
    throw new Error(requestMessage(code));
   }
   if(!result||typeof result!=='object'||!('revision' in result)||typeof result.revision!=='string'||
      !('values' in result)||!result.values||typeof result.values!=='object'||Array.isArray(result.values)){
    throw new Error('保存结果尚未确认，请核对上次保存。');
   }
   pendingSave.current=null;
   setPendingRetry(false);
   setDetail({...detail,revision:result.revision,values:result.values});
   setDraft({...result.values});
   setState('saved');
   setMessage('已保存');
   onSaved();
  }catch(error){
   setPendingRetry(!!pendingSave.current);
   setState('error');
   setMessage(error instanceof Error?error.message:'连接暂时中断，请核对上次保存。');
  }finally{
   saving.current=false;
  }
 }
 if(!canEdit){const record=publicCatalog?.[table].find(row=>row.id===id) as unknown as Record<string,unknown>|undefined;return <div className="public-record" aria-label="公开记录，只读">{fields.filter(([key])=>table!=='works'||!workView||(key!=='score'||workView==='mv')&&(key!=='stageScore'||workView==='stage')).map(([key,label,type])=><p key={key}><span>{label}：</span><span style={{whiteSpace:'pre-wrap'}}>{record?.[key]===null||record?.[key]===undefined?type==='score'?'未评分':'—':String(record[key])||'—'}</span></p>)}</div>;}
 if(mode==='snapshot')return <div className="readonly-note"><LockKeyhole size={14}/>暂时只能浏览，评分保存暂不可用</div>;
 if(!open)return <button className="text-button editor-open" onClick={()=>setOpen(true)}><Star size={14}/>{table==='members'?'我的备注':table==='groups'?'我的团体笔记':'评分与备注'}<ChevronRight size={14}/></button>;
 return <div data-navigation-blocked={navigationBlocked?'true':undefined} data-dirty={dirty?'true':undefined} className={'editor '+(compact?'compact ':'')+(workView==='stage'?'stage-editor':'')}><div className="editor-heading"><span>{table==='works'?'我的作品记录':'记录这一刻'}</span>{state==='loading'&&<LoaderCircle size={14} className="spin"/>}</div>{detail&&<div className="editor-fields">{fields.filter(([key])=>table!=='works'||!workView||(key!=='score'||workView==='mv')&&(key!=='stageScore'||workView==='stage')).map(([key,label,type])=><label key={key} className={type==='text'?'wide':''}><span>{table==='works'&&workView==='stage'?(key==='stageScore'?'作品整体舞台分':key==='note'?'作品点评（与 MV 共用）':key==='watched'?'作品观看状态（与 MV 共用）':label):label}</span>{type==='score'?(loona||triples||madein||editorial)?<LoonaScoreInput value={draft[key]??null} label={key==='stageScore'?'作品整体舞台分':label} disabled={state==='saving'||state==='loading'||pendingRetry||(key==='stageScore'&&!stageVideoId)} onChange={value=>{if(key==='stageScore'&&draft.stageScore===detail.values.stageScore){setStageDraftVideoId(stageVideoId??null);setStageDraftSourceKey(sourceKey??stageVideoId??null);}setDraft({...draft,[key]:value});}}/>:<div className="score-input"><input disabled={state==='saving'||state==='loading'||pendingRetry||(key==='stageScore'&&!stageVideoId)} aria-label={key==='stageScore'?'作品整体舞台分':label} type="number" min="0" max="10" step="0.1" placeholder="—" value={draft[key]??''} onChange={e=>{if(key==='stageScore'&&draft.stageScore===detail.values.stageScore){setStageDraftVideoId(stageVideoId??null);setStageDraftSourceKey(sourceKey??stageVideoId??null);}setDraft({...draft,[key]:e.target.value===''?null:Number(e.target.value)});}}/><small>/ 10</small></div>:type==='select'?<select disabled={state==='saving'||state==='loading'||pendingRetry} value={draft[key]??''} onChange={e=>setDraft({...draft,[key]:e.target.value})}><option value="" disabled>选择状态</option>{detail.watchedOptions.map((s:string)=><option key={s}>{s}</option>)}</select>:<textarea disabled={state==='saving'||state==='loading'||pendingRetry} aria-label={label} value={draft[key]??''} rows={key==='memory'?2:3} placeholder={key==='memory'?'留下一个记忆点':'写下打动你的细节…'} onChange={e=>setDraft({...draft,[key]:e.target.value})}/>}</label>)}</div>}<div className="editor-actions"><button ref={saveButtonRef} className="button small primary" disabled={!canSave} onClick={save}>{state==='saving'?<LoaderCircle className="spin" size={14}/>:<Check size={14}/>}{pendingRetry?'核对上次保存':table==='works'?'保存作品修改':'保存此条记录'}</button>{state==='error'&&!pendingRetry&&<button className="text-button" onClick={()=>{if(!dirty||window.confirm('重新载入会清空尚未保存的输入，继续吗？'))void load();}}>重新载入</button>}</div>{stageSourceMismatch&&<p className="save-message error" role="status">当前舞台已更换。你的输入仍对应上一支视频；请先把分数恢复为原值，再查看新视频后评分。</p>}{hiddenWorkScoreDirty&&<p className="save-message">另一个视频页有未保存评分，将随本次作品修改一并保存。</p>}{table==='works'&&workView==='stage'&&!stageVideoId&&<p className="save-message">{detail&&detail.values.stageScore!==null?'原有舞台分已保留，但对应视频还未确认。':'暂无可评分的舞台视频。'}可以先看 MV 或下方其他现场。</p>}{message&&(state!=='saved'||!dirty)&&<p className={'save-message '+(state==='error'?'error':'')} role="status">{message}</p>}{dirty&&state!=='saving'&&<small className="unsaved">有未保存修改</small>}</div>;
}
