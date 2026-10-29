'use client';
import {MusicNavigation} from '@/components/music-shell';
import {MusicHome} from '@/components/music-home';
import musicPortraits from '@/data/music-member-artwork.json';
import musicGroupRegistry from '@/data/artist-timeline-registry.json';
import {vvupMemberPortrait} from '@/lib/idol/vvup-photos';
import {itzyMemberPortrait} from '@/lib/idol/itzy-photos';
import {weeeklyMemberPortrait,weeeklyMemberContext,latestWeeeklyOfficialUrl} from '@/lib/idol/weeekly-photos';
import {cherrybulletMemberPortrait,cherrybulletMemberContext,latestCherrybulletOfficialUrl} from '@/lib/idol/cherrybullet-photos';
import {rocketpunchMemberPortrait,rocketpunchMemberContext,latestRocketpunchOfficialUrl} from '@/lib/idol/rocketpunch-photos';
import {everglowMemberPortrait,everglowMemberContext} from '@/lib/idol/everglow-photos';
import {fromis9MemberPortrait,fromis9MemberContext} from '@/lib/idol/fromis9-photos';
import {izoneMemberPortrait} from '@/lib/idol/izone-photos';
import {idleMemberPortrait} from '@/lib/idol/idle-photos';
import {atheartMemberPortrait} from '@/lib/idol/atheart-photos';
import {hitgsMemberPortrait} from '@/lib/idol/hitgs-photos';
import {vchaMemberPortrait} from '@/lib/idol/vcha-photos';
import {useCanEdit} from '@/components/public-access';
import {LibraryBrowser,SequencePreview} from '@/components/library-browser';
import {resolveRestoreTarget} from '@/lib/idol/library-browser/paging-model';
import {PersonalInsights} from '@/components/personal-insights/PersonalInsights';
import type {WatchSequence} from '@/lib/idol/journey';
import {indexPersonalRecords,matchPersonalRecords,materializePersonalRecordMatches} from '@/lib/idol/personal-record-search';
import {sevenJournalPortrait} from '@/components/seven-redesign/journal';
import {MemberCareerFacts} from '@/components/member-career-facts';
import {MemberPhysicalFacts} from '@/components/member-physical-facts';
import {PublicWorkCredits,MemberPublicCredits,PublicProductionCredits} from '@/components/public-work-credits';
import {publicCreditForWork,publicCreditsForMember} from '@/lib/idol/public-work-credits';
import {memberDisplayName} from '@/lib/idol/member-display-name';
import {indexMemberNames,matchingMembers} from '@/lib/idol/member-index';
import {catalogReadWithDeadline} from '@/lib/idol/catalog-read-deadline';
import {useEffect,useMemo,useState,useCallback,useRef,type RefObject} from 'react';
import {ArrowUpRight,ArrowLeft,Search,Play,Heart,Check,RefreshCw,Download,LockKeyhole,ChevronRight,SlidersHorizontal,Music2,Users,Disc3,Star,X,LoaderCircle,ImageIcon} from 'lucide-react';
import type {CatalogView as Catalog,Work,Member,RatingView as Rating,Photo,Group} from '@/lib/idol/types';
import {videoId} from '@/lib/idol/values';
import {approvedVideoPoster} from '@/lib/idol/approved-video-poster';
import {PhotoLightbox} from '@/components/photo-lightbox';
import {MvPhotoReference} from '@/components/mv-photo-reference';
import {MvIdentityPhoto} from '@/components/mv-identity-photo';
import {mvMemberAbsence} from '@/lib/idol/mv-member-appearance';
import {mvPhotoLabel,mvReferencePhoto,MV_LOOK_PHOTO_LABEL} from '@/lib/idol/mv-photo-presentation';
import {CatalogPhotoImage,WorkCoverImage,ConceptPhotoImage,katseyeVideoPoster} from '@/components/app-image-presentation';
import {ImageRecoveryProvider,ImageRecoveryControls,type ReliableImageState} from '@/components/reliable-image';
import {WorkVideoPlayer} from '@/components/work-video-player';
import {SocialLinks} from '@/components/social-links';
import {BABYMONSTER_GROUP_ID,ILLIT_GROUP_ID,XG_GROUP_ID,AESPA_GROUP_ID,IVE_GROUP_ID,KIOF_GROUP_ID,STAYC_GROUP_ID,NMIXX_GROUP_ID,HEARTS2HEARTS_GROUP_ID,KIIIKIII_GROUP_ID,ITZY_GROUP_ID,LESSERAFIM_GROUP_ID,SAYMYNAME_GROUP_ID,KATSEYE_GROUP_ID,groupArtistUrl,memberArtistUrl,artistReturnLabel} from '@/lib/idol/artist-navigation';
import artistVisuals from '@/data/artist-visuals.json';
import {tracerMemberPortrait} from '@/lib/idol/tracer-photos';
import {katseyeMemberPortrait} from '@/lib/idol/katseye-photos';
import {spiaMemberPortrait} from '@/lib/idol/spia-photos';
import {witchxMemberPortrait} from '@/lib/idol/witchx-photos';
import {useCatalogGroupViews,needsCatalogGroupViews} from '@/components/use-catalog-group-views';
// Keep existing index styles in the initial CSS boundary; only defer JavaScript.
import '@/components/candidate-index-card.css';
import {personalMvPhoto,memberWorks,memberWorkSummary,type MemberWork} from '@/lib/idol/member-works';
import {stageSourceKey,stageHasValidBinding,stageEmbedUrl,stageWatchUrl,formatStageTime,youtubeEmbedUrl} from '@/lib/idol/stage-source';
import {inQueue as queueIncludes,queueLabels} from '@/lib/idol/queues';
import {indexWorkNames,matchingWorks,makeWatchSequence,nextInSequence,sortWorks} from '@/lib/idol/watch-sequence';
import {stageStatusLabel,stageStatusDescription,stageKindLabel,stageMatches} from '@/lib/idol/stage-display';
import {validStageResearchNote} from '@/lib/idol/stage-public-research';
import {useBrowseJourney} from '@/components/use-browse-journey';
import {defaultFilters,type Nav,type Route,type WorkSort} from '@/lib/idol/journey';
import './music-experience.css';
import './candidate-experience.css';
import './work-experience.css';
import './work-theme-tokens.css';
import {workExperience} from '@/lib/idol/work-experience';
import {workExperienceStylesheet} from '@/lib/idol/work-experience-styles';
import {requestMessage,performanceLabel,performerLabel,mvVersionWarning,castWarning,alternativeViewingNote,selectionNote} from '@/lib/idol/product-copy';
const navs:[Nav,string][]=[['home','发现'],['works','作品'],['members','成员'],['groups','团体'],['insights','偏好统计'],['records','观看记录']];
const score=(n:number|null)=>n===null?'未评分':n.toFixed(1);
async function readResponse(response:Response){if(!(response.headers.get('content-type')??'').includes('application/json'))throw new Error('连接暂时中断，请稍后再试。未保存的输入仍保留。');try{return await response.json();}catch{throw new Error('内容暂时没能加载，请稍后重试。未保存的输入仍保留。');}}
const names=(data:Catalog,ids:string[])=>ids.map(id=>data.groups.find(g=>g.id===id)?.name).filter(Boolean).join(' / ');
function GroupLinks({data,ids,onGroup}:{data:Catalog;ids:string[];onGroup?:((id:string)=>void)}){return <div className="group-links eyebrow">{data.groups.filter(g=>ids.includes(g.id)).map(g=>onGroup?<button key={g.id} className="text-button" onClick={()=>onGroup(g.id)}>{g.name}<ChevronRight size={13}/></button>:<span key={g.id}>{g.name}</span>)}</div>;}
function PhotoView({photo,referencePhoto,label,kind='档案资料照',className='',live=true,retryable=Boolean(photo&&live),priority=false,fit}:{photo:Photo|null;referencePhoto?:Photo|null;label:string;kind?:string;className?:string;live?:boolean;retryable?:boolean;priority?:boolean;fit?:'contain'}){
 kind=mvPhotoLabel(photo,kind);
 const src=photo&&live?`/api/media?table=${photo.table}&record=${photo.recordId}&index=${photo.index}`:'';
 const [imageState,setImageState]=useState<{request:object;value:ReliableImageState}|null>(null);
 const imageKey=JSON.stringify([src,label,kind]);
 const request=useMemo(()=>({}),[imageKey]),currentRequest=useRef(request);currentRequest.current=request;
 const receiveImageState=useCallback((value:ReliableImageState)=>{if(currentRequest.current===request)setImageState({request,value});},[request]);
 const currentImageState=imageState?.request===request?imageState.value:null;
 const image=<CatalogPhotoImage photo={photo} live={live} label={label+' · '+kind} priority={priority} fit={fit} retryable={retryable}
  onStateChange={receiveImageState} missing={<div className="photo-empty"><ImageIcon size={28}/><span>{photo?'图片暂时无法加载':kind.includes('MV')?'暂无 MV 截图':'暂无照片'}</span></div>}
  fallback={<div className="photo-empty"><ImageIcon size={28}/><span>图片暂时无法加载</span></div>}/>;
 const frame=<div className={'photo '+className+(photo?.sourceKind==='mv_look_photo'?' mv-look-native':'')}>{src&&photo?.table==='ratings'?<a href={currentImageState?.src||src} target="_blank" rel="noopener noreferrer" aria-label={'放大'+kind} onClick={event=>{if(currentImageState?.status==='error'){event.preventDefault();event.stopPropagation();}}}>{image}</a>:image}<span className="image-label">{kind}</span></div>;
 return live&&mvReferencePhoto(photo,referencePhoto)?<div className="mv-photo-stack">{frame}<MvPhotoReference photo={photo} referencePhoto={referencePhoto} label={label} live={live}/></div>:frame;
}
function WorkCard({work,data,onOpen}:{work:Work;data:Catalog;onOpen:()=>void}){return <button data-browse-anchor={"work-"+work.id} className="work-card" onClick={onOpen}><div className="work-art"><WorkCoverImage work={work} label={work.song+' 官方视频封面'} fallback={<div className="cover-empty"><Disc3 size={48}/></div>}/><span className="play-circle"><Play size={18} fill="currentColor"/></span><span className="video-badge">{work.videoType||'视频'}{work.version?' · '+work.version:''}</span></div><div className="work-card-copy"><div><small>{names(data,work.groupIds)||'团体未收录'}</small><h3>{work.song||work.name}</h3></div><span className={'rating-number '+(work.score===null?'unrated':'')}>{work.score===null?'—':work.score.toFixed(1)}</span></div><div className="work-meta"><span>{work.releaseDate}</span><span>{work.watched||'未标记'}</span></div><div className={'stage-card-status '+(work.stage?'ready':'pending')}><strong>{stageStatusLabel(work)}</strong></div></button>}
// Public design-media lookup. Research keys never become record IDs or cast lists.
// Sources: approved tripleS handoff works-research.json, matched to the existing catalog.
function triplesDetailMedia(work:Work){
 if(!work.groupIds.includes('rec28ldfRTiCtw'))return null;
 const rows:readonly (readonly string[])[] = [
 [
  "rec28ldfRTrOP3",
  "https://www.youtube.com/watch?v=6q8UMVXhXsE",
  "mv-baby-flower",
  "2026-06-01",
  "love-and-pop-pt1",
  "<LOVE&POP> pt.1"
 ],
 [
  "rec28ldfRTrOKC",
  "https://www.youtube.com/watch?v=TvmLPQ7iBLQ",
  "mv-official-video-TvmLPQ7iBLQ",
  "2025-11-24",
  "beyond-beauty",
  "msnz <Beyond Beauty>"
 ],
 [
  "rec28ldfRTrOGv",
  "https://www.youtube.com/watch?v=vpXtzSpyV_8",
  "mv-official-video-vpXtzSpyV_8",
  "2025-11-24",
  "beyond-beauty",
  "msnz <Beyond Beauty>"
 ],
 [
  "rec28ldfRTrOs2",
  "https://www.youtube.com/watch?v=LfS0-022cq8",
  "mv-official-video-LfS0-022cq8",
  "2025-11-24",
  "beyond-beauty",
  "msnz <Beyond Beauty>"
 ],
 [
  "rec28ldfRTrOyh",
  "https://www.youtube.com/watch?v=With0YDpuWQ",
  "mv-official-video-With0YDpuWQ",
  "2025-11-24",
  "beyond-beauty",
  "msnz <Beyond Beauty>"
 ],
 [
  "rec28ldfRTrOnV",
  "https://www.youtube.com/watch?v=m25wQkLg1jc",
  "mv-password",
  "2025-09-17",
  "secrethimitsubimil",
  "tripleS ∞! ＜SecretHimitsuBimil＞"
 ],
 [
  "rec28ldfRTrOhH",
  "https://www.youtube.com/watch?v=pTycfmVzdl8",
  "mv-are-you-alive",
  "2025-05-12",
  "assemble25",
  "ASSEMBLE25"
 ],
 [
  "rec28ldfRTrCrz",
  "https://www.youtube.com/watch?v=2EtFv4apgvo",
  "mv-untitled",
  "2024-11-18",
  "untitled",
  "tripleS ∞! ＜アンタイトル＞"
 ],
 [
  "rec28ldfRTrCnq",
  "https://www.youtube.com/watch?v=aKyt6Ahxwss",
  "mv-hit-the-floor",
  "2024-10-23",
  "performante",
  "Visionary Vision <Performante>"
 ],
 [
  "rec28ldfRTrCjG",
  "https://www.youtube.com/watch?v=2tda_TCjz8w",
  "mv-girls-never-die",
  "2024-05-08",
  "assemble24",
  "ASSEMBLE24"
 ],
 [
  "rec28ldfRTrCeB",
  "https://www.youtube.com/watch?v=PqKZctzEW1o",
  "mv-door",
  "2024-01-15",
  "aria-structure-of-sadness",
  "Aria  <Structure Of Sadness>"
 ],
 [
  "rec28ldfRTrCaw",
  "https://www.youtube.com/watch?v=KMythzAnNK0",
  "mv-invincible",
  "2023-10-11",
  "evolution",
  "EVOLution <⟡>"
 ],
 [
  "rec28ldfRTrC6f",
  "https://www.youtube.com/watch?v=OvtoY0lfYJ8",
  "mv-girls-capitalism",
  "2023-08-17",
  "lovelution",
  "LOVElution <ↀ>"
 ],
 [
  "rec28ldfRTrC1G",
  "https://www.youtube.com/watch?v=xYXqVV4biGY",
  "mv-touch-plus",
  "2023-06-22",
  "krystal-eyes-touch",
  "+(KR) ystal Eyes <Touch+>"
 ],
 [
  "rec28ldfRTrBXp",
  "https://www.youtube.com/watch?v=uE_T_t6s_Go",
  "mv-cherry-talk",
  "2023-05-05",
  "krystal-eyes-aesthetic",
  "+(KR) ystal Eyes <AESTHETIC>"
 ],
 [
  "rec28ldfRTrBTi",
  "https://www.youtube.com/watch?v=3TQd2ahq6oU",
  "mv-rising",
  "2023-02-13",
  "assemble",
  "ASSEMBLE"
 ],
 [
  "rec28ldfRTrBOX",
  "https://www.youtube.com/watch?v=0cZ7o0Wn_dc",
  "mv-generation",
  "2022-10-28",
  "acid-angel-from-asia-access",
  "Acid Angel from Asia <ACCESS>"
 ]
];
 const match=rows.find(row=>row[0]===work.id&&row[1]===work.url);
 if(!match)return null;
 const base='/artist/triples/approved-design/';
 const exactStage=work.id==='rec28ldfRTrCjG'&&work.stage?.videoId==='y2Zx2JpmUU8'&&work.stage.url==='https://www.youtube.com/watch?v=y2Zx2JpmUU8'&&!work.stage.clip;
 return {poster:base+match[2]+'.jpg',publicationDate:match[3],releaseKey:match[4],releaseTitle:match[5],releaseCover:match[4]?base+'release-'+match[4]+'.jpg':null,stagePoster:exactStage?base+'stage-girls-never-die-mcountdown-843.jpg':undefined};
}

// Design imagery is presentation-only: both persisted identity and source URL must match.
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

function Editor({publicCatalog,table,id,mode,onSaved,compact=false,loona=false,triples=false,madein=false,editorial=false,workView,stageVideoId,sourceKey,onDirtyChange,onNavigationBlockedChange,saveButtonRef,onSaveAvailabilityChange}:{publicCatalog?:Catalog;table:'works'|'members'|'ratings'|'groups';id:string;mode:Catalog['mode'];onSaved:()=>void;compact?:boolean;loona?:boolean;triples?:boolean;madein?:boolean;editorial?:boolean;workView?:'mv'|'stage';stageVideoId?:string|null;sourceKey?:string|null;onDirtyChange?:(key:string,dirty:boolean)=>void;onNavigationBlockedChange?:(key:string,blocked:boolean)=>void;saveButtonRef?:RefObject<HTMLButtonElement|null>;onSaveAvailabilityChange?:(enabled:boolean)=>void}){
 const canEdit=useCanEdit();
 const [open,setOpen]=useState(table==='works');const [detail,setDetail]=useState<any>(null);const [draft,setDraft]=useState<Record<string,any>>({});const [state,setState]=useState<'idle'|'loading'|'saving'|'saved'|'error'>('idle');const [message,setMessage]=useState('');const pendingSave=useRef<any>(null);const [pendingRetry,setPendingRetry]=useState(false);const [stageDraftVideoId,setStageDraftVideoId]=useState<string|null>(stageVideoId??null);const [stageDraftSourceKey,setStageDraftSourceKey]=useState<string|null>(sourceKey??stageVideoId??null);
 const readSequence=useRef(0);const readAbort=useRef<AbortController|null>(null);
 const load=useCallback(async()=>{if(!canEdit||mode!=='live')return;const sequence=++readSequence.current;readAbort.current?.abort();const controller=new AbortController();readAbort.current=controller;const timeout=setTimeout(()=>controller.abort(),30000);setState('loading');setMessage('');try{const r=await fetch(`/api/records?table=${table}&id=${id}`,{cache:'no-store',signal:controller.signal});const d:any=await readResponse(r);if(sequence!==readSequence.current)return;if(controller.signal.aborted)throw new Error('读取用时较长，请重试。输入会保留。');if(!r.ok)throw new Error(requestMessage(d.error));setDetail(d);setDraft(d.values);pendingSave.current=null;setPendingRetry(false);setState('idle');if(d.pendingSave)setMessage('上次保存结果还未确认，请让助手处理后再继续。');}catch(e){if(sequence!==readSequence.current)return;setState('error');setMessage(controller.signal.aborted?'读取用时较长，请重试。输入会保留。':(e as Error).message);}finally{clearTimeout(timeout);if(readAbort.current===controller)readAbort.current=null;}},[table,id,mode,canEdit]);
 useEffect(()=>{if(open)void load();return()=>{readSequence.current++;readAbort.current?.abort();readAbort.current=null;};},[open,load]);
 const dirty=!!detail&&JSON.stringify(draft)!==JSON.stringify(detail.values);
 useEffect(()=>{onDirtyChange?.(table+':'+id,dirty);return()=>onDirtyChange?.(table+':'+id,false);},[dirty,table,id,onDirtyChange]);
 const navigationBlocked=state==='saving'||pendingRetry||!!detail?.pendingSave;
 useEffect(()=>{onNavigationBlockedChange?.(table+':'+id,navigationBlocked);return()=>onNavigationBlockedChange?.(table+':'+id,false);},[navigationBlocked,table,id,onNavigationBlockedChange]);
 const stageSourceMismatch=table==='works'&&!!detail&&draft.stageScore!==detail.values.stageScore&&(stageDraftVideoId!==(stageVideoId??null)||stageDraftSourceKey!==(sourceKey??stageVideoId??null));
 const canSave=canEdit&&!stageSourceMismatch&&mode==='live'&&!detail?.pendingSave&&(dirty||pendingRetry)&&state!=='saving'&&state!=='loading';
 useEffect(()=>{onSaveAvailabilityChange?.(canSave);},[canSave,onSaveAvailabilityChange]);
 const hiddenWorkScoreDirty=table==='works'&&workView&&detail&&draft[workView==='stage'?'score':'stageScore']!==detail.values[workView==='stage'?'score':'stageScore'];
 useEffect(()=>{if(!dirty&&!navigationBlocked)return;const h=(e:BeforeUnloadEvent)=>e.preventDefault();window.addEventListener('beforeunload',h);return()=>window.removeEventListener('beforeunload',h);},[dirty,navigationBlocked]);
 const fields=table==='works'?[['score','MV 分数','score'],['stageScore','舞台分数','score'],['watched','观看状态','select'],['note','我的点评','text']]:table==='members'?[['note','我的备注','text']]:table==='ratings'?[['score','表现分','score'],['stylingScore','造型喜欢','score'],['memory','记忆点','text'],['note','我的备注','text']]:[['note','我的备注','text']];
 async function save(){if(!canEdit||!detail||(!dirty&&!pendingSave.current)||state==='saving')return;setState('saving');setMessage('');const changed=Object.fromEntries(Object.entries(draft).filter(([k,v])=>v!==detail.values[k]));if(!pendingSave.current)pendingSave.current={table,recordId:id,revision:detail.revision,operationId:crypto.randomUUID(),values:changed,...(table==='works'&&Object.hasOwn(changed,'stageScore')?{stageVideoId:stageDraftVideoId,stageSourceKey:stageDraftSourceKey}:{})};try{const r=await fetch('/api/save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(pendingSave.current)});const d:any=await readResponse(r);if(!r.ok){if(['EDIT_CONFLICT','SCHEMA_CHANGED','INVALID_SCORE','INVALID_TEXT','INVALID_STATUS','FIELD_NOT_ALLOWED','PREFLIGHT_FAILED','STAGE_SOURCE_CHANGED'].includes(d.error)){pendingSave.current=null;setPendingRetry(false);}else setPendingRetry(true);throw new Error(requestMessage(d.error));}pendingSave.current=null;setPendingRetry(false);setDetail({...detail,revision:d.revision,values:d.values});setDraft(d.values);setState('saved');setMessage('已保存');onSaved();}catch(e){if(pendingSave.current)setPendingRetry(true);setState('error');setMessage((e as Error).message);}}
 if(!canEdit){const record=publicCatalog?.[table].find(row=>row.id===id) as unknown as Record<string,unknown>|undefined;return <div className="public-record" aria-label="公开记录，只读">{fields.filter(([key])=>table!=='works'||!workView||(key!=='score'||workView==='mv')&&(key!=='stageScore'||workView==='stage')).map(([key,label,type])=><p key={key}><span>{label}：</span><span style={{whiteSpace:'pre-wrap'}}>{record?.[key]===null||record?.[key]===undefined?type==='score'?'未评分':'—':String(record[key])||'—'}</span></p>)}</div>;}
 if(mode==='snapshot')return <div className="readonly-note"><LockKeyhole size={14}/>暂时只能浏览，评分保存暂不可用</div>;
 if(!open)return <button className="text-button editor-open" onClick={()=>setOpen(true)}><Star size={14}/>{table==='members'?'我的备注':table==='groups'?'我的团体笔记':'评分与备注'}<ChevronRight size={14}/></button>;
 return <div data-navigation-blocked={navigationBlocked?'true':undefined} data-dirty={dirty?'true':undefined} className={'editor '+(compact?'compact ':'')+(workView==='stage'?'stage-editor':'')}><div className="editor-heading"><span>{table==='works'?'我的作品记录':'记录这一刻'}</span>{state==='loading'&&<LoaderCircle size={14} className="spin"/>}</div>{detail&&<div className="editor-fields">{fields.filter(([key])=>table!=='works'||!workView||(key!=='score'||workView==='mv')&&(key!=='stageScore'||workView==='stage')).map(([key,label,type])=><label key={key} className={type==='text'?'wide':''}><span>{table==='works'&&workView==='stage'?(key==='stageScore'?'作品整体舞台分':key==='note'?'作品点评（与 MV 共用）':key==='watched'?'作品观看状态（与 MV 共用）':label):label}</span>{type==='score'?(loona||triples||madein||editorial)?<LoonaScoreInput value={draft[key]??null} label={key==='stageScore'?'作品整体舞台分':label} disabled={state==='saving'||state==='loading'||pendingRetry||(key==='stageScore'&&!stageVideoId)} onChange={value=>{if(key==='stageScore'&&draft.stageScore===detail.values.stageScore){setStageDraftVideoId(stageVideoId??null);setStageDraftSourceKey(sourceKey??stageVideoId??null);}setDraft({...draft,[key]:value});}}/>:<div className="score-input"><input disabled={state==='saving'||state==='loading'||pendingRetry||(key==='stageScore'&&!stageVideoId)} aria-label={key==='stageScore'?'作品整体舞台分':label} type="number" min="0" max="10" step="0.1" placeholder="—" value={draft[key]??''} onChange={e=>{if(key==='stageScore'&&draft.stageScore===detail.values.stageScore){setStageDraftVideoId(stageVideoId??null);setStageDraftSourceKey(sourceKey??stageVideoId??null);}setDraft({...draft,[key]:e.target.value===''?null:Number(e.target.value)});}}/><small>/ 10</small></div>:type==='select'?<select disabled={state==='saving'||state==='loading'||pendingRetry} value={draft[key]??''} onChange={e=>setDraft({...draft,[key]:e.target.value})}><option value="" disabled>选择状态</option>{detail.watchedOptions.map((s:string)=><option key={s}>{s}</option>)}</select>:<textarea disabled={state==='saving'||state==='loading'||pendingRetry} aria-label={label} value={draft[key]??''} rows={key==='memory'?2:3} placeholder={key==='memory'?'留下一个记忆点':'写下打动你的细节…'} onChange={e=>setDraft({...draft,[key]:e.target.value})}/>}</label>)}</div>}<div className="editor-actions"><button ref={saveButtonRef} className="button small primary" disabled={!canSave} onClick={save}>{state==='saving'?<LoaderCircle className="spin" size={14}/>:<Check size={14}/>}{pendingRetry?'核对上次保存':table==='works'?'保存作品修改':'保存此条记录'}</button>{state==='error'&&!pendingRetry&&<button className="text-button" onClick={()=>{if(!dirty||window.confirm('重新载入会清空尚未保存的输入，继续吗？'))void load();}}>重新载入</button>}</div>{stageSourceMismatch&&<p className="save-message error" role="status">当前舞台已更换。你的输入仍对应上一支视频；请先把分数恢复为原值，再查看新视频后评分。</p>}{hiddenWorkScoreDirty&&<p className="save-message">另一个视频页有未保存评分，将随本次作品修改一并保存。</p>}{table==='works'&&workView==='stage'&&!stageVideoId&&<p className="save-message">{detail&&detail.values.stageScore!==null?'原有舞台分已保留，但对应视频还未确认。':'暂无可评分的舞台视频。'}可以先看 MV 或下方其他现场。</p>}{message&&(state!=='saved'||!dirty)&&<p className={'save-message '+(state==='error'?'error':'')} role="status">{message}</p>}{dirty&&state!=='saving'&&<small className="unsaved">有未保存修改</small>}</div>;
}
export default function App(){
 const canEdit=useCanEdit();
 const [data,setData]=useState<Catalog|null>(null);const [error,setError]=useState('');const [loading,setLoading]=useState(true);const [refreshing,setRefreshing]=useState(false);const [canManage,setCanManage]=useState(false);
 const groupViews=useCatalogGroupViews();
 const journey=useBrowseJourney(!!data, r=>workExperienceStylesheet(workExperience(data,r)?.className),r=>!needsCatalogGroupViews(r,data)||groupViews.phase==='ready');const {route}=journey;const {search,group,generation,queue,stageFilter,limit,watch='all',sort='default'}=journey.filters;
 const setSearch=(value:string)=>journey.updateFilters({search:value,limit:24});const setGroup=(value:string)=>journey.updateFilters({group:value,limit:24});const setGeneration=(value:string)=>journey.updateFilters({generation:value,limit:24});const setQueue=(value:string)=>journey.updateFilters({queue:value,limit:24});const setStageFilter=(value:string)=>journey.updateFilters({stageFilter:value,limit:24});const setLimit=(value:number)=>journey.updateFilters({limit:value});
 const loadSequence=useRef(0),loadAbort=useRef<AbortController|null>(null),mounted=useRef(false);
 const load=useCallback(async(force=false)=>{
  if(!mounted.current)return;
  const sequence=++loadSequence.current;
  loadAbort.current?.abort();
  const controller=new AbortController();loadAbort.current=controller;
  force?setRefreshing(true):setLoading(true);setError('');
  let updating=force;
  try{
   const read=(url:string)=>catalogReadWithDeadline(async signal=>{
    const r=await fetch(url,{cache:'no-store',signal});const d:any=await readResponse(r);
    if(!r.ok)throw new Error(requestMessage(d.error));return d as Catalog;
   },controller.signal);
   const d=await read('/api/catalog?shape=display-v1'+(force&&canEdit?'&refresh=1':''));
   if(sequence!==loadSequence.current)return;
   setData(d);setLoading(false);
   if(canEdit&&!force&&d.cache?.refreshRecommended){
    updating=true;setRefreshing(true);
    const updated=await read('/api/catalog?shape=display-v1&refresh=background');
    if(sequence===loadSequence.current)setData(updated);
   }
  }catch(e){
   if(sequence===loadSequence.current&&!controller.signal.aborted){
    const message=(e as Error).message;
    setError(message==='资料读取用时较长，请重新加载。'?(updating?'内容更新用时较长，请点击“更新内容”重试。':'资料读取用时较长，请重新载入。'):message);
   }
  }finally{
   if(sequence===loadSequence.current){setLoading(false);setRefreshing(false);loadAbort.current=null;}
  }
 },[canEdit]);
 const cancelLoad=useCallback(()=>{loadSequence.current++;loadAbort.current?.abort();loadAbort.current=null;},[]);
 useEffect(()=>{
  mounted.current=true;
  let active=true;void Promise.resolve().then(()=>{if(active)void load();});
  return()=>{active=false;mounted.current=false;cancelLoad();};
 },[load,cancelLoad]);
 useEffect(()=>{if(!canEdit)return;let active=true;const controller=new AbortController();void catalogReadWithDeadline(signal=>fetch('/api/status',{cache:'no-store',signal}).then(readResponse),controller.signal).then(s=>{if(active)setCanManage(!!s&&typeof s==='object'&&'source' in s&&s.source==='native');}).catch(()=>{});return()=>{active=false;controller.abort();};},[canEdit]);
 function currentLabel(){return route.groupId?(data?.groups.find(g=>g.id===route.groupId)?.name||'团体主页'):route.work?(data?.works.find(w=>w.id===route.work)?.song||'作品'):route.member?((()=>{const m=data?.members.find(m=>m.id===route.member);return m?memberDisplayName(m):'成员档案';})()):(navs.find(n=>n[0]===route.nav)?.[1]||'我的放映室');}
 function navigate(next:Partial<Route>){return journey.navigate(next,currentLabel());}
 function setNav(nav:Nav){if(route.nav===nav&&!route.work&&!route.member&&!route.groupId)return;navigate({nav,work:null,member:null,video:'mv'});}
 function goBack(){if(!journey.backLabel&&route.artistReturn){journey.leaveTo(route.artistReturn,true);return;}journey.back({nav:route.groupId?'groups':route.work?'works':'members',work:null,member:null,groupId:null,video:'mv'});}
 function openGroup(id:string){const artist=groupArtistUrl(id);if(artist){journey.leaveTo(artist);return;}journey.navigate({nav:'groups',groupId:id,work:null,member:null,video:'mv'},currentLabel());}
 const chosenWork=data?.works.find(w=>w.id===route.work);const chosenMember=data?.members.find(m=>m.id===route.member);const chosenGroup=data?.groups.find(g=>g.id===route.groupId);
 const groupViewsNeeded=needsCatalogGroupViews(route,data);
 useEffect(()=>{if(groupViewsNeeded&&groupViews.phase==='idle')groupViews.load();},[groupViewsNeeded,groupViews.phase,groupViews.load]);
 const GroupIndex=groupViews.value?.GroupIndex,GroupDetail=groupViews.value?.GroupDetail;
 function groupViewsFallback(){return <section className="empty" data-module-status aria-busy={groupViews.phase!=='error'}><h2>{groupViews.phase==='error'?'团体页面未能加载':route.groupId?'正在打开团体主页':'正在打开团体索引'}</h2><p role="status">{groupViews.phase==='error'?'页面组件未能加载，需要刷新后再试。公开筛选和浏览位置会保留。':'正在加载团体页面…'}</p>{groupViews.phase==='error'&&<><p>重新加载会清空“搜我的记录”的临时关键词；已保存内容不受影响。</p><button className="button primary" onClick={journey.reloadPage}>重新加载页面</button></>}<button className="button" onClick={()=>journey.back({nav:route.groupId?'groups':'home',groupId:null,work:null,member:null,video:'mv'})}>返回{journey.backLabel?' '+journey.backLabel:route.groupId?'团体索引':'我的放映室'}</button></section>;}
 function openMember(id:string,fallback:Partial<Route>={work:null,member:id}){const m=data?.members.find(x=>x.id===id),artist=m&&memberArtistUrl(m);if(artist){journey.leaveTo(artist);return;}navigate(fallback);}
 // Private search stays in React memory only; never use journey filters/history here.
 const [recordQuery,setRecordQuery]=useState('');const [recordLimit,setRecordLimit]=useState(24);
 const recordSearchActive=route.nav==='records'&&!route.work&&!route.member&&!route.groupId&&!!recordQuery.trim();
 const recordIndex=useMemo(()=>indexPersonalRecords(recordSearchActive?data:null),[data,recordSearchActive]);
 const recordResults=useMemo(()=>matchPersonalRecords(recordIndex,recordQuery),[recordIndex,recordQuery]);
 const visibleRecordResults=useMemo(()=>materializePersonalRecordMatches(recordResults,recordLimit),[recordResults,recordLimit]);
 const generations=useMemo(()=>data?[...new Set(data.groups.map(g=>g.generation).filter(Boolean))].sort():[],[data]);
 // Normalize public fields once per actual catalog response, never cache old
 // record copies: refreshed scores, names and relationships remain authoritative.
 const memberIndex=useMemo(()=>indexMemberNames(data?.members??[],data?.groups??[]),[data]);
 const workIndex=useMemo(()=>indexWorkNames(data?.works??[],data?.groups??[]),[data]);
 function inQueue(w:Work,q=queue){return queueIncludes(w,q,data?.groups??[]);}
 const libraryWorks=useMemo(()=>workIndex.map(row=>row.work),[workIndex]);
 const workScope=useMemo(()=>matchingWorks(workIndex,journey.filters),[workIndex,search,group,generation,queue,watch]);
 const filteredWorks=useMemo(()=>sortWorks(workScope.filter(w=>stageMatches(w,stageFilter)),sort),[workScope,stageFilter,sort]);
 const libraryPageSize=journey.filters.pageSize??24;
 const libraryPage=journey.libraryRestoreTarget?resolveRestoreTarget(filteredWorks.map(w=>w.id),libraryPageSize,journey.libraryRestoreTarget).page:(journey.filters.page??1);
 // Keep the original queue in history while related works outside it are open.
 const activeSequence=chosenWork&&journey.sequence?.ids.includes(chosenWork.id)?journey.sequence:undefined;
 const nextWork=chosenWork&&activeSequence?nextInSequence(activeSequence,chosenWork.id,data!):null;
 function openVersion(id:string){if(!chosenWork?.versionDisplay?.links.some(link=>link.workId===id)||!data?.works.some(work=>work.id===id&&!work.placeholder))return false;return journey.navigate({nav:'works',work:id,member:null,video:'mv'},currentLabel(),undefined,journey.sequence);}
 function openWork(id:string,works:Work[]=filteredWorks,label=queueLabels[queue]??'作品库',scope=journey.filters,memberId?:string){if(route.nav==='works'&&!route.work&&!route.member&&!route.groupId){[...document.querySelectorAll<HTMLButtonElement>('.work-grid [data-browse-anchor]')].find(node=>node.dataset.browseAnchor==='work-'+id)?.focus({preventScroll:true});}const sequence=makeWatchSequence(works,label,scope,memberId);return journey.navigate({nav:'works',work:id,member:null,video:'mv'},currentLabel(),undefined,sequence.ids.includes(id)?sequence:undefined);}
 const filteredMembers=useMemo(()=>matchingMembers(memberIndex,journey.filters),[memberIndex,journey.filters]);
 function openQueue(q:string){journey.navigate({nav:'works',work:null,member:null,video:'mv'},currentLabel(),{...defaultFilters(),queue:q});}
 function filters(type:'works'|'members'|'groups'){return <div className={type==='works'?'filters library-filters':'filters'}><label className="search"><Search size={17}/><input data-library-focus={type==='works'?'search':undefined} maxLength={type==='works'?1000:undefined} value={search} onChange={e=>{setSearch(e.target.value);setLimit(24);}} placeholder={type==='works'?'搜索歌曲、团体或视频标题':type==='members'?'搜索姓名、艺名或团体':'搜索团体或公司'} aria-label="搜索"/>{search&&<button aria-label="清除搜索" onClick={e=>{setSearch('');if(type==='works')e.currentTarget.parentElement?.querySelector('input')?.focus();}}><X size={14}/></button>}</label>{type!=='groups'&&<select aria-label="按团体筛选" value={group} onChange={e=>{setGroup(e.target.value);setLimit(24);}}><option value="all">所有团体</option>{data?.groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select>}<select aria-label="按代际筛选" value={generation} onChange={e=>{setGeneration(e.target.value);setLimit(24);}}><option value="all">所有代际</option>{generations.map(g=><option key={g}>{g}</option>)}</select>{type==='works'&&<select aria-label="按观看队列筛选" value={queue} onChange={e=>{setQueue(e.target.value);setLimit(24);}}><option value="all">全部作品</option><option value="high">高分团补看</option><option value="surprise">团内惊喜</option><option value="tonight">待看</option><option value="unrated">看过待评分</option><option value="rewatch">高分重温</option></select>}{type==='works'&&<select aria-label="按观看状态筛选" data-library-focus="watch" value={watch} onChange={e=>journey.updateFilters({watch:e.target.value,limit:24})}><option value="all">所有观看状态</option><option value="watched">已观看</option><option value="unwatched">未观看</option><option value="unmarked">未标记</option></select>}{type==='works'&&<select aria-label="作品排序" data-library-focus="sort" value={sort} onChange={e=>journey.updateFilters({sort:e.target.value as WorkSort,limit:24})}><option value="default">默认排序</option><option value="release-desc">发行新到旧</option><option value="release-asc">发行旧到新</option><option value="score-desc">MV 分高到低</option></select>}{(search||group!=='all'||generation!=='all'||queue!=='all'||stageFilter!=='all'||(type==='works'&&(watch!=='all'||sort!=='default')))&&<button className="filter-reset text-button" onClick={()=>journey.updateFilters(defaultFilters())}><X size={14}/>重置筛选</button>}</div>}
 const workTheme=workExperience(data,route);
 return <ImageRecoveryProvider><div className={workTheme?`work-experience ${workTheme.className}`:"music-experience"} data-work-theme={workTheme?.slug}><MusicNavigation active={route.nav} onNavigate={setNav} canEdit={canEdit} onSearch={query=>journey.navigate({nav:'works',work:null,member:null,groupId:null,video:'mv'},currentLabel(),{...defaultFilters(),search:query})}/><main>
 {data&&!journey.styleReady&&<div role="status" data-style-status><p>{journey.stylePhase==='error'?'页面样式加载失败，输入仍保留。':'正在加载页面样式…'}</p>{journey.stylePhase==='error'&&<button className="button" onClick={journey.retryStyles}>重试样式</button>}<button className="button" onClick={goBack}>返回</button></div>}
 <div data-browse-content inert={!!data&&!journey.styleReady} style={data&&!journey.styleReady?{visibility:'hidden'}:undefined}>
 {loading&&!data?<div className="loading-screen"><span className="brand">stage.</span><LoaderCircle size={24} className="spin"/><p>正在加载音乐资料…</p></div>:error&&!data?<div className="empty large"><h2>暂时没能打开手帐</h2><p>{error}</p><button className="button primary" onClick={()=>load()}>重新载入</button><a href="/signin-with-chatgpt?return_to=/" target="_top">使用 ChatGPT 登录</a></div>:data&&<>
 <div className="source-status"><span>{data.mode==='snapshot'?'浏览模式 · 个人记录未载入':refreshing?'正在更新内容，先看看已有收藏…':''}</span><button onClick={()=>load(true)} disabled={refreshing}><RefreshCw size={13} className={refreshing?'spin':''}/>{refreshing?'更新中':'更新内容'}</button></div>{error&&<div className="alert" role="alert">{error} 仍可浏览已有内容。</div>}

 {chosenWork?.placeholder?<PlaceholderDetail work={chosenWork} data={data} onBack={goBack}/>:chosenWork?<WorkDetail key={chosenWork.id} work={chosenWork} sequence={activeSequence} nextWork={nextWork} sequenceLabel={activeSequence?.label} sequencePosition={activeSequence?activeSequence.ids.indexOf(chosenWork.id)+1:0} sequenceTotal={activeSequence?.ids.length??0} onVersion={openVersion} onArtistNavigate={journey.leaveTo} onNext={()=>nextWork&&journey.continueWork(nextWork.id)} initialView={route.video} onViewChange={journey.setVideo} backLabel={journey.backLabel?`返回 ${journey.backLabel}`:route.artistReturn?'返回 '+artistReturnLabel(route.artistReturn):'返回作品库'} data={data} onBack={goBack} onMember={openMember} onGroup={openGroup} onSaved={()=>load(true)}/>:chosenMember?<MemberDetail key={chosenMember.id} member={chosenMember} artistReturn={route.artistReturn} onGroup={openGroup} backLabel={journey.backLabel?`返回 ${journey.backLabel}`:route.artistReturn?'返回成员主页':'返回成员档案'} data={data} onBack={goBack} onWork={id=>openWork(id,libraryWorks.filter(w=>data.ratings.some(r=>r.workIds.includes(w.id)&&r.memberIds.includes(chosenMember.id))),`${memberDisplayName(chosenMember)}的作品`,defaultFilters(),chosenMember.id)} onSaved={()=>load(true)}/>:chosenGroup?GroupDetail?<GroupDetail key={chosenGroup.id} group={chosenGroup} data={data} filters={journey.groupFilters} onFilters={journey.updateGroupFilters} onBack={goBack} backLabel={journey.backLabel?`返回 ${journey.backLabel}`:'返回团体索引'} onMember={id=>openMember(id,{nav:'members',member:id,work:null})} renderPhoto={m=><PhotoView photo={m.photo} label={memberDisplayName(m)} live={data.mode==='live'}/>} renderWork={(w,list,q)=><WorkCard key={w.id} work={w} data={data} onOpen={()=>openWork(w.id,list,chosenGroup.name+' · '+(queueLabels[q]??'全部作品'),{...journey.groupFilters,queue:q,group:chosenGroup.id})}/>} onWork={(w,list,q)=>openWork(w.id,list,chosenGroup.name+' · '+(queueLabels[q]??'全部作品'),{...defaultFilters(),queue:q,group:chosenGroup.id})} noteEditor={<Editor table="groups" id={chosenGroup.id} mode={data.mode} publicCatalog={data} onSaved={()=>load(true)}/>}/>:groupViewsFallback():route.work||route.member||route.groupId?<div className="empty"><h2>暂时找不到这项内容</h2><p>请更新内容后再试。</p><button className="button" onClick={()=>navigate({work:null,member:null,groupId:null})}>返回手帐</button></div>:route.nav==='home'?<MusicHome data={data} onGroup={openGroup} onWork={(w,list)=>openWork(w.id,list,'从一支 MV 开始',defaultFilters())} onWorks={()=>setNav('works')} onGroups={()=>setNav('groups')} onQueue={openQueue}/>:route.nav==='records'?<section aria-label="搜我的记录">
 <PageTitle overline="MY SAVED WORDS" title="搜我的记录" text="找回作品点评、成员备注和评分里留下的记忆点。" count={recordResults.length}/>
 <p className="subtle">只搜索当前已加载的保存记录。关键词仅留在本页内存，不会发送或保存；刷新页面后清空。</p>
 <div className="filters"><label className="search"><Search size={17}/><input data-library-focus="search" type="search" autoComplete="off" spellCheck={false} maxLength={200} aria-label="搜索我的已保存记录" placeholder="输入你记下的词句" value={recordQuery} onChange={e=>{setRecordQuery(e.target.value);setRecordLimit(24);}}/>{recordQuery&&<button aria-label="清除记录搜索" onClick={e=>{setRecordQuery('');setRecordLimit(24);e.currentTarget.parentElement?.querySelector('input')?.focus();}}><X size={14}/></button>}</label></div>
 <div className="result-line" role="status" aria-live="polite" aria-atomic="true">{recordQuery.trim()?`找到 ${recordResults.length} 条记录`:'输入关键词后显示匹配记录'}</div>
 {!recordQuery.trim()?<div className="empty"><h3>想找回哪段记忆？</h3><p>搜索你写下的文字，不包含尚未保存的输入。</p></div>:!recordResults.length?<div className="empty"><h3>没有找到匹配记录</h3><p>试试更短的词句，或更新内容后再搜索。</p></div>:<div>{visibleRecordResults.map(result=><article className="section" key={result.kind+'-'+result.id} style={{overflowWrap:'anywhere'}}>
 <small className="eyebrow">{result.kind==='work'?'作品记录':result.kind==='member'?'成员记录':'成员评分记录'}{result.groups.length?' · '+result.groups.join(' / '):''}</small>
 <h2>{[...result.works.map(w=>w.name),...result.members.map(m=>m.name)].join(' · ')||'关联资料暂未收录'}</h2>
 {result.matches.map(match=><p key={match.label}><strong>{match.label}：</strong>{match.excerpt}</p>)}
 <div className="hero-actions">{result.works.map(work=><button className="button small" key={'work-'+work.id} data-browse-anchor={'record-'+result.kind+'-'+result.id+'-work-'+work.id} onClick={e=>{e.currentTarget.focus({preventScroll:true});journey.navigate({nav:'works',work:work.id,member:null,video:'mv'},'搜我的记录');}}>查看作品 · {work.name}<ChevronRight size={14}/></button>)}{result.members.map(member=><button className="button small" key={'member-'+member.id} data-browse-anchor={'record-'+result.kind+'-'+result.id+'-member-'+member.id} onClick={e=>{e.currentTarget.focus({preventScroll:true});journey.navigate({nav:'members',member:member.id,work:null,video:'mv'},'搜我的记录');}}>查看成员记录 · {member.name}<ChevronRight size={14}/></button>)}</div>
 </article>)}</div>}
 {recordResults.length>0&&<More count={recordResults.length} limit={recordLimit} onMore={()=>setRecordLimit(recordLimit+24)}/>}
 </section>:route.nav==='works'?<><PageTitle overline="THE COLLECTION" title="作品" text="音乐影像与现场表演" count={libraryWorks.length}/><LibraryBrowser catalog={data} filters={journey.filters} onFiltersChange={journey.updateFilters} page={libraryPage} pageSize={libraryPageSize} onPageChange={journey.setLibraryPage} restoreTarget={journey.libraryRestoreTarget} restoreReady={journey.styleReady} onRestoreReady={journey.libraryRestoreMounted} readOnly={data.mode==='snapshot'} renderWork={(w,onOpen)=><WorkCard key={w.id} work={w} data={data} onOpen={onOpen}/>} onOpenWork={(id,sequence)=>journey.navigate({nav:'works',work:id,member:null,video:'mv'},currentLabel(),undefined,sequence.ids.includes(id)?sequence:undefined)}/></>:route.nav==='members'?<><PageTitle overline="THE PEOPLE YOU REMEMBER" title="成员" text="找到喜欢的成员，回看她们的作品。" count={data.members.length}/>{filters('members')}<div className="result-line">{filteredMembers.length} 位成员</div><div className="member-grid">{filteredMembers.slice(0,limit).map(m=><button data-browse-anchor={"member-"+m.id} className="member-tile" key={m.id} onClick={()=>openMember(m.id)}><MusicMemberPhoto member={m} live={data.mode==='live'}/><small>{names(data,m.groupIds)}</small><h3><span className="member-display-name">{memberDisplayName(m)}</span></h3>{m.favorite!==null&&<span className="member-score"><Heart size={12}/> {m.favorite.toFixed(1)}</span>}</button>)}</div><More count={filteredMembers.length} limit={limit} onMore={()=>setLimit(limit+24)}/></>:route.nav==='groups'?<><PageTitle overline="FIND YOUR FAVORITES" title="团体" text="先认识一个团体，再从一支作品开始。" count={data.groups.length}/>{GroupIndex?<GroupIndex data={data} filters={journey.filters} onFilters={journey.updateFilters} onOpen={openGroup} renderPhoto={m=><PhotoView photo={m.photo} label={memberDisplayName(m)} live={data.mode==='live'}/>}/>:groupViewsFallback()}</>:<PersonalInsights catalog={data} memberLabel={memberDisplayName} isStageScoreEligible={work=>stageHasValidBinding(work.stage)} viewState={journey.insights} onViewStateChange={journey.updateInsights} onGroup={openGroup} onMember={openMember} onWork={(id,intent)=>journey.navigate({nav:'works',work:id,member:null,video:intent?.video??'mv'},currentLabel())}/>}
 <ImageRecoveryControls/>
 <footer><span className="footer-brand">stage.</span><p>我的观看，我的偏好。</p><div>{canEdit&&<><a className="text-button" href="/api/export"><Download size={15}/>导出我的收藏</a><small>包含评分与备注，不含图片文件</small></>}{canEdit&&canManage&&<a className="text-button" href="/manage" onClick={e=>{if(document.querySelector('[data-navigation-blocked="true"]')){e.preventDefault();window.alert('本次保存还未确认，请先核对保存结果。');}}}>管理资料与备份<ChevronRight size={15}/></a>}</div></footer>
 </>}
 </div></main></div></ImageRecoveryProvider>;
}
function PlaceholderDetail({onBack}:{work:Work;data:Catalog;onBack:()=>void}){return <section className="empty"><h2>这项内容还没有歌曲</h2><p>先到作品库看看其他作品吧。</p><button className="button" onClick={onBack}>返回作品库</button></section>}
const platformLabel={x:'X',youtube:'YouTube',bilibili:'bilibili',naver:'NAVER TV',weverse:'Weverse',official_site:'官方网站'};
function StageSupplements({work}:{work:Work}){
 const original=work.stageSupplement;
 const supplement=original&&work.stage&&!work.stage.clip?{...original,alternatives:original.alternatives.filter(a=>a.platform!=='youtube'||a.sourceId!==work.stage!.videoId)}:original;
 const researchNote=supplement?.researchNote&&validStageResearchNote(supplement.researchNote)?supplement.researchNote:null;
 if(!supplement||(!supplement.alternatives.length&&!supplement.watchLeads?.length&&!researchNote))return null;
 return <section id="other-performances" className="stage-supplements" aria-label="其他观看选择">
  {!!supplement.alternatives.length&&<><h2>其他观看选择</h2><p className="subtle">优先查看打歌节目与练习室。以下视频仅供观看，不用于本条舞台评分。</p><div className="alternative-grid">{supplement.alternatives.map(a=><article className="alternative-card" key={a.id}>
   <div className="alternative-source-class">{performanceLabel(a)} · {performerLabel(a.performerScope)}{a.completeness==='excerpt'?' · 短版表演':''}</div>
   <h3>{a.title}</h3>
   {!!a.performerNames?.length&&a.performerScope!=='full_group'&&<p className="alternative-performers">{a.performerNames.join(' / ')}</p>}
   {alternativeViewingNote(work,a)&&<p className="alternative-differences">{alternativeViewingNote(work,a)}</p>}
   {selectionNote(a)&&<small>{selectionNote(a)}</small>}
   <small>{platformLabel[a.platform]} · {a.channel}</small>
   {a.durationScope==='whole_video'&&a.durationSeconds&&<small>整段视频 {formatStageTime(a.durationSeconds)}，不代表单曲时长。</small>}
   <a className="button" href={a.url} target="_blank" rel="noopener noreferrer">{a.performanceType==='press_concert_recording'?'前往原媒体观看':`在 ${platformLabel[a.platform]} 观看`}<ArrowUpRight size={15}/></a>
   <small>仅观看，不用于本条舞台评分。</small>
  </article>)}</div></>}
  {!!supplement.watchLeads?.length&&<><h2>相关演出</h2><p className="subtle">这些整场或合集提到了这首歌，暂未提供完整单曲片段。仅供观看，不用于本条舞台评分。</p><div className="alternative-grid">{supplement.watchLeads.map(a=><article className="alternative-card" key={a.id}>
   <div className="alternative-source-class">官方整场或合集 · {performerLabel(a.performerScope)}</div><h3>{a.title}</h3>
   <p>尚未确认完整单曲的起止与对应版本。</p>
   {a.leadTimeSeconds!==undefined&&<p>可从 {formatStageTime(a.leadTimeSeconds)} 附近开始寻找歌曲；不是完整片段。</p>}
   <small>{platformLabel[a.platform]} · {a.channel}</small><a className="button" href={a.url} target="_blank" rel="noopener noreferrer">打开相关演出<ArrowUpRight size={15}/></a>
  </article>)}</div></>}
  {researchNote?<details className="caption-help stage-research-note"><summary>待核说明与来源</summary><p>{researchNote.summary}</p><ul>{researchNote.sources.map(source=><li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}<ArrowUpRight size={13}/></a></li>)}</ul><p className="subtle">仍待核验，不用于本条舞台评分。</p></details>:null}
 </section>;
}
function PageTitle({overline,title,text,count}:{overline:string;title:string;text:string;count:number}){return <section className="page-title"><span className="eyebrow">{overline}</span><h1>{title}<sup>{count}</sup></h1><p>{text}</p></section>}
function More({count,limit,onMore}:{count:number;limit:number;onMore:()=>void}){return count===0?<div className="empty"><Search size={25}/><h3>还没有符合条件的记录</h3><p>试试别的名称或筛选条件。</p></div>:count>limit?<div className="more"><button className="button" onClick={onMore}>再看 24 条<ChevronRight size={16}/></button><small>已显示 {Math.min(limit,count)} / {count}</small></div>:null;}
function CaptionHelp(){return <details className="caption-help"><summary>字幕与中文翻译</summary><p>字幕可选语言由视频提供，播放后可在设置中切换。</p><ol><li>点击视频内的齿轮 → 字幕。</li><li>优先选择中文；若只有韩语或英语，选择“自动翻译 → 中文（简体）”。</li><li>若嵌入菜单没有此选项，可打开上方 YouTube 原视频尝试。</li></ol><p>没有可用字幕时，自动翻译也无法生成歌词。机器翻译仅供理解，可能不准确。</p><p>若翻译插件提示会员过期，可先暂停该插件，再按上方步骤使用 YouTube 字幕。</p><a href="https://support.google.com/youtube/answer/100078?hl=zh-Hans" target="_blank" rel="noopener noreferrer">YouTube 字幕帮助 ↗</a></details>;}
// Exact production identity: design-only media must never become a score target.
function WorkDetail({work,data,sequence,onBack,onMember,onGroup,onSaved,onVersion,onArtistNavigate,backLabel='返回作品库',initialView='mv',onViewChange,nextWork=null,onNext,sequenceLabel,sequencePosition=0,sequenceTotal=0}:{sequence?:WatchSequence;nextWork?:Work|null;onNext?:()=>void;sequenceLabel?:string;sequencePosition?:number;sequenceTotal?:number;work:Work;data:Catalog;onArtistNavigate?:(url:string)=>void;onVersion:(id:string)=>void;onBack:()=>void;onMember:(id:string)=>void;onGroup?:(id:string)=>void;onSaved:()=>void;backLabel?:string;initialView?:'mv'|'stage';onViewChange?:(view:'mv'|'stage')=>void}){
 const canEdit=useCanEdit();
 const triples=work.groupIds.includes('rec28ldfRTiCtw');
 const triplesMedia=triplesDetailMedia(work);
 const loona=work.groupIds.includes('recvxyEBDZJAXm');
 const loonaButterfly=loona&&work.id==='recvxyOz5X7G95'&&work.song==='Butterfly';
 const [view,setView]=useState<'mv'|'stage'>(initialView);const [dirtyKeys,setDirtyKeys]=useState<string[]>([]);const [navigationBlockedKeys,setNavigationBlockedKeys]=useState<string[]>([]);const [workSaveEnabled,setWorkSaveEnabled]=useState(false);const workSaveButton=useRef<HTMLButtonElement>(null);const memberCards=useRef<Record<string,HTMLElement|null>>({});
 const markNavigationBlocked=useCallback((key:string,blocked:boolean)=>setNavigationBlockedKeys(old=>blocked?(old.includes(key)?old:[...old,key]):old.includes(key)?old.filter(k=>k!==key):old),[]);
 const markDirty=useCallback((key:string,dirty:boolean)=>setDirtyKeys(old=>dirty?(old.includes(key)?old:[...old,key]):old.includes(key)?old.filter(k=>k!==key):old),[]);
 useEffect(()=>{setView(initialView);setDirtyKeys([]);setNavigationBlockedKeys([]);setWorkSaveEnabled(false);},[work.id]);
 useEffect(()=>{setView(initialView);},[initialView]);
 const versionTags=[...new Set(work.versionDisplay?.tags??[])].filter(tag=>![work.videoType||'视频',work.version,work.releaseDate,work.name,work.song,work.officialTitle,work.channel].includes(tag));
 const versionLinks=work.versionDisplay?.links??[];
 const versionGroups=[...new Set(versionLinks.map(link=>link.categories.join(' / ')))];
 const stage=work.stage;const stageBound=stageHasValidBinding(stage);
 const activeUrl=view==='stage'?(stage?stageWatchUrl(stage):''):work.url;const vid=videoId(activeUrl);const title=view==='stage'?stage?.title??'暂无舞台视频':work.officialTitle||work.name;
 const approvedPoster=view==='stage'&&(!stage||stage.videoId!==vid||stage.clip)?null:approvedVideoPoster(work.id,vid,view)??katseyeVideoPoster(work.id,vid,view);
 const absence=mvMemberAbsence(work);
 const people=absence?[]:data.ratings.filter(r=>r.workIds.includes(work.id));const memberDrafts=dirtyKeys.filter(k=>k.startsWith('ratings:'));const hasMemberDraft=memberDrafts.length>0;
 const switchView=(next:'mv'|'stage')=>{setView(next);onViewChange?.(next);};
 function jumpToCast(id:string){const card=memberCards.current[id];if(!card)return;card.focus({preventScroll:true});card.scrollIntoView({block:'center',behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}
 function jumpToMemberDraft(){const id=memberDrafts[0]?.slice('ratings:'.length);if(!id)return;if(view==='stage')switchView('mv');window.requestAnimationFrame(()=>{const card=memberCards.current[id];const button=card?.querySelector<HTMLButtonElement>('.editor-actions button:not(:disabled)');(button??card)?.scrollIntoView({block:'center',behavior:'smooth'});button?.focus({preventScroll:true});});}
 return <div className={'detail '+(view==='stage'?'stage-view':'')}><button className="back text-button" onClick={onBack}><ArrowLeft size={16}/>{backLabel}</button>
 <header className="music-work-title"><GroupLinks data={data} ids={work.groupIds} onGroup={onGroup}/><h1>{work.song||work.name}</h1><p>{[work.videoType,work.version,work.releaseDate].filter(Boolean).join(' · ')}</p></header>
 {sequence&&<SequencePreview sequence={sequence} currentId={work.id} catalog={data} onNext={onNext} nextDisabled={navigationBlockedKeys.length>0}/>}
 {sequenceLabel&&<div className="watch-context"><span>{sequenceLabel}</span><small>第 {sequencePosition} / {sequenceTotal} 首</small></div>}
 <div className="video-mode-row"><div className="video-mode-tabs" role="tablist" aria-label="视频版本" onFocus={event=>{for(const tab of event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'))tab.tabIndex=tab===(event.target as EventTarget)?0:-1;}} onKeyDown={event=>{
  if(event.altKey||event.ctrlKey||event.metaKey||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  const tabs=[...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')].filter(tab=>!tab.disabled&&!tab.hidden&&tab.getClientRects().length>0);
  const current=tabs.findIndex(tab=>tab===event.target);if(current<0||!tabs.length)return;
  const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(current+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
  event.preventDefault();tabs[next].focus();
 }}><button role="tab" id="mv-tab" tabIndex={view==='mv'?0:-1} aria-selected={view==='mv'} aria-controls="work-video-panel" onClick={()=>switchView('mv')}>MV</button><button role="tab" id="stage-tab" tabIndex={view==='stage'?0:-1} aria-selected={view==='stage'} aria-controls="work-video-panel" onClick={()=>switchView('stage')}>舞台</button></div><span>{view==='stage'?'舞台整体评分':absence?'MV 整体评分':'MV 与本曲成员评分'}</span></div>
 <div className="work-detail-top" id="work-video-panel" role="tabpanel" aria-labelledby={view==='stage'?'stage-tab':'mv-tab'}><div>
 <div className={'video-stage '+(!activeUrl?'video-missing':'')}>{!activeUrl?<div className="stage-empty"><Disc3 size={44}/><h2>{view==='stage'?stageStatusLabel(work):'暂无视频'}</h2><p>{view==='stage'?stageStatusDescription(work):'暂时没有可播放的视频。'}</p>{view==='stage'&&<>{!!(work.stageSupplement?.alternatives.length||work.stageSupplement?.watchLeads?.length)&&<button className="button primary" onClick={()=>document.getElementById('other-performances')?.scrollIntoView({behavior:'smooth',block:'start'})}>看看其他表演</button>}<button className="button" onClick={()=>switchView('mv')}>返回 MV</button></>}</div>:<WorkVideoPlayer posterSrc={approvedPoster?.src??(loonaButterfly&&view==='mv'?'/artist/loona/approved-home/butterfly.jpg':triplesMedia?(view==='mv'?triplesMedia.poster:triplesMedia.stagePoster):undefined)} posterLabel={approvedPoster?.label} posterFit={approvedPoster?.fit??(approvedPoster?'contain':undefined)} posterSize={approvedPoster?.intrinsicSize} posterZoom={approvedPoster?.zoom} workId={work.id} view={view} url={activeUrl} videoId={vid} embedUrl={view==='stage'&&stage?stageEmbedUrl(stage):vid?youtubeEmbedUrl(vid):null} title={title}/>}</div>
 <div className="video-caption"><span>{title}</span>{activeUrl&&<a href={activeUrl} target="_blank" rel="noopener noreferrer">YouTube 原视频<ArrowUpRight size={13}/></a>}</div>{activeUrl&&<p className="video-fallback">播放不了？可在 YouTube 打开原视频。</p>}
 {loonaButterfly&&<div className="loona-associated-release"><img src="/artist/loona/approved-home/butterfly-album.jpg" width="96" height="96" alt="关联发行《X X》封面"/><div><strong>关联发行《X X》</strong><span>发行封面</span></div></div>}
 {view==='mv'&&people.length>0&&<nav className="mv-member-shortcuts" aria-label="本支成员"><span>本支成员</span><div>{people.map(r=>{const m=data.members.find(m=>r.memberIds.includes(m.id)),label=m?memberDisplayName(m):r.name;return <button type="button" key={r.id} aria-controls={'mv-cast-'+r.id} onClick={()=>jumpToCast(r.id)}>{label}</button>;})}</div><small>点名字，定位认人图与个人评分</small></nav>}
 {vid&&<CaptionHelp/>}
 {view==='stage'&&stage&&<div className="stage-source"><p>{stage.channel} · {stageKindLabel(stage.kind)}</p>{stage.verificationNote&&<p className="stage-version-note">{stage.verificationNote}</p>}{stage.clip&&<p className="stage-reuse-note">整场中的单曲片段 · {formatStageTime(stage.clip.startSeconds)}–{formatStageTime(stage.clip.endSeconds)}<br/>站内播放此片段；打开原视频会从起点开始，需自行在终点停止。</p>}{stage.reusesOriginalVideo&&<p className="stage-reuse-note">与 MV 页为同一支表演视频。</p>}{stage.higherCandidate&&<p className="stage-reuse-note">另有更高赞舞台可看，当前评分仍对应这支视频。<a href={stage.higherCandidate.url} target="_blank" rel="noopener noreferrer">观看另一版 ↗</a></p>}{!stageBound&&work.stageScore!==null&&<p className="stage-version-note">原有舞台分已保留，但对应的视频还未确认；暂不为这支视频改分。</p>}</div>}

 {view==='stage'&&<StageSupplements work={work}/>}
 </div><aside className={'work-aside '+(view==='stage'?'stage-aside':'')}><GroupLinks data={data} ids={work.groupIds} onGroup={onGroup}/><h1>{work.song||work.name}</h1>
 <div className="tags">{view==='stage'?<><span>舞台</span><span>{stage?stageKindLabel(stage.kind):'暂无舞台'}</span>{stage?.publishedDate&&<span>{stage.publishedDate}</span>}</>:<><span>{work.videoType||'视频'}</span>{work.version&&<span>{work.version}</span>}{work.releaseDate&&<span>{work.releaseDate}</span>}{versionTags.map(tag=><span key={tag}>{tag}</span>)}</>}</div>
 {view==='mv'&&versionLinks.length>0&&<nav className="work-version-links" aria-label="作品版本与关联">{versionGroups.map(category=><div className="work-version-group" key={category}><span className="work-version-category">{category}</span><div>{versionLinks.filter(link=>link.categories.join(' / ')===category).map(link=><button type="button" key={link.workId} data-browse-anchor={'version-'+work.id+'-'+link.workId} data-member-work-trigger={'version:'+work.id+':'+link.workId} disabled={navigationBlockedKeys.length>0} onClick={event=>{event.currentTarget.focus({preventScroll:true});onVersion(link.workId);}}><span>{link.title}</span>{link.labels.length>0&&<small>{link.labels.join(' · ')}</small>}<ChevronRight size={14}/></button>)}</div></div>)}</nav>}
 {view==='mv'&&mvVersionWarning(work.verification)&&<p className="verification">{mvVersionWarning(work.verification)}</p>}

 <div className="work-score"><span>{view==='stage'?'我的整体舞台分':'我的 MV 分数'}</span><strong>{score(view==='stage'?work.stageScore:work.score)}</strong><small>{view==='stage'?(!stageBound&&work.stageScore!==null?'原有分数，对应视频未确认':stageBound?(stage?.clip?'对应当前舞台片段':'对应当前舞台视频'):'暂无可评分视频'):(work.watched||'观看状态未标记')}</small></div>
 {view==='mv'&&work.note&&<p className="my-note">{work.note}</p>}
 <Editor key={work.id} table="works" id={work.id} mode={data.mode} publicCatalog={data} onSaved={onSaved} workView={view} stageVideoId={stageBound?stage?.videoId:null} sourceKey={stageBound?stageSourceKey(stage):null} onDirtyChange={markDirty} onNavigationBlockedChange={markNavigationBlocked} saveButtonRef={workSaveButton} onSaveAvailabilityChange={setWorkSaveEnabled}/>
 {view==='stage'&&<div className="stage-overall-note"><Music2 size={18}/><p>舞台只做整体评分。<br/>成员个人评分保留在 MV 页。</p></div>}
 </aside></div>
 {triples&&<section className="triples-detail-connections">{view==='mv'&&triplesMedia?.releaseCover&&<div className="triples-associated-release"><h2>来自这张发行</h2><button type="button" onClick={()=>onArtistNavigate?.('/artists/triples?section=works&release='+encodeURIComponent(triplesMedia.releaseKey))}><img src={triplesMedia.releaseCover} width="136" height="136" alt={triplesMedia.releaseTitle+' · 发行封面'}/><span>{triplesMedia.releaseTitle}<small>发行封面</small></span><ChevronRight size={18}/></button></div>}<div className="triples-other-video"><h2>{view==='stage'?'回到音乐影像':'到舞台上再听一次'}</h2>{view==='mv'&&triplesMedia?.stagePoster&&<img src={triplesMedia.stagePoster} width="880" height="495" alt="Girls Never Die · M COUNTDOWN EP.843 舞台封面"/>}{view==='mv'&&stage&&<p>{stage.title}</p>}<button type="button" className="button" onClick={()=>{switchView(view==='stage'?'mv':'stage');document.getElementById('work-video-panel')?.scrollIntoView({block:'start'});}}>{view==='stage'?'查看 MV':'进入舞台'}<ChevronRight size={16}/></button></div></section>}
 {view==='mv'&&absence&&<section className="mv-no-members" aria-label="无成员出镜"><h2>本MV无成员真人出镜</h2><p>{absence.reason}</p><p>仅保留MV评分，成员评分已关闭。</p><a href={absence.sources[0]} target="_blank" rel="noopener noreferrer">查看出镜核查来源 ↗</a></section>}
 {view==='mv'&&<PublicWorkCredits work={work} data={data} onMember={onMember}/>}
 {view==='mv'&&<PublicProductionCredits work={work}/>}
 {!absence&&<section hidden={view==='stage'||(people.length===0&&!!publicCreditForWork(work))} className="section cast-section"><div className="section-heading"><div><h2>成员与评分</h2></div></div><div className="cast-grid">{people.map(r=>{const m=data.members.find(m=>r.memberIds.includes(m.id));return <article id={"mv-cast-"+r.id} tabIndex={-1} aria-label={(m?memberDisplayName(m):r.name)+" · 本支 MV 成员卡片"} data-browse-anchor={"cast-"+r.id} className="cast-card" key={r.id} ref={node=>{memberCards.current[r.id]=node;}}><div className="mv-photo-stack"><MvIdentityPhoto work={work} memberId={m?.id??''} label={m?memberDisplayName(m):r.name} photo={m?personalMvPhoto(r,m.id,work.id):null} live={data.mode==='live'}/><MvPhotoReference photo={r.photo} referencePhoto={r.referencePhoto} label={m?memberDisplayName(m):r.name} live={data.mode==='live'}/></div><div className="cast-copy"><button className="member-name" disabled={!m} onClick={()=>m&&onMember(m.id)}><strong><span className="member-display-name">{m?memberDisplayName(m):r.name}</span></strong><ArrowUpRight size={15}/></button>{castWarning(r.verification)&&<small className="cast-verification">{castWarning(r.verification)}</small>}<div className="cast-scores"><span>表现 <b>{score(r.score)}</b></span><span>造型 <b>{score(r.stylingScore)}</b></span></div>{r.memory&&<p className="memory">{r.memory}</p>}{r.note&&<p className="cast-note">{r.note}</p>}<Editor loona={loona} triples={triples} table="ratings" id={r.id} mode={data.mode} publicCatalog={data} onSaved={onSaved} onDirtyChange={markDirty} onNavigationBlockedChange={markNavigationBlocked} compact/></div></article>})}</div>{people.length===0&&<div className="empty"><Users size={30}/><h3>{publicCreditForWork(work)?'个人评分记录待补':'这支 MV 暂无成员名单'}</h3><p>{publicCreditForWork(work)?'已核实的公开资料见下方。':'可以先看视频，给整支作品评分。'}</p></div>}</section>}
 {sequenceLabel&&<section className="watch-next" aria-label="继续观看"><div><span className="eyebrow">KEEP WATCHING</span><h2>{nextWork?'接着看下一首':'这组暂时没有下一首 MV'}</h2>{nextWork?<p>{names(data,nextWork.groupIds)} · {nextWork.song||nextWork.name}</p>:<p>回到列表，换一支想看的作品。</p>}</div>{nextWork?<button className="button primary" disabled={navigationBlockedKeys.length>0} onClick={onNext}>下一首 MV<ChevronRight size={17}/></button>:<button className="button" onClick={onBack}>{backLabel}<ArrowLeft size={16}/></button>}</section>}
 <div className="detail-return"><span className="watch-save-context">{sequenceLabel&&<strong>{sequenceLabel} · 第 {sequencePosition} / {sequenceTotal} 首</strong>}<span>{navigationBlockedKeys.length?'请先等待或核对本次保存结果，再继续下一首':dirtyKeys.length?`有 ${dirtyKeys.length} 条未保存修改，切换不会自动保存`:'切换视频不会清空未保存的输入'}</span></span><div>{canEdit&&<button className="button primary" disabled={!workSaveEnabled} onClick={()=>workSaveButton.current?.click()}>保存作品修改<Check size={15}/></button>}{hasMemberDraft&&<button className={"text-button member-draft-link "+(!workSaveEnabled?"primary":"")} onClick={jumpToMemberDraft}>去保存成员评分（{memberDrafts.length}）<ArrowUpRight size={15}/></button>}<button className="button detail-back" onClick={onBack}>{backLabel}<ArrowLeft size={16}/></button>{nextWork&&<button className="button next-work-button" title={"下一首 MV · "+(nextWork.song||nextWork.name)} aria-label={"下一首 MV · "+(nextWork.song||nextWork.name)} disabled={navigationBlockedKeys.length>0} onClick={onNext}><span>下一首 MV<small>{nextWork.song||nextWork.name}</small></span><ChevronRight size={17}/></button>}</div></div></div>;
}
function MemberWorkCard({item,member,data,onOpen}:{item:MemberWork;member:Member;data:Catalog;onOpen:()=>void}){
 const number=(n:number|null)=>n===null?'待评':n.toFixed(1);
 return <article data-browse-anchor={'work-'+item.work.id} className="member-work-wrap member-work-card">
  <MvIdentityPhoto work={item.work} memberId={member.id} label={memberDisplayName(member)} photo={item.photo} live={data.mode==='live'}/>
  <MvPhotoReference photo={item.photo} referencePhoto={item.referencePhoto} label={memberDisplayName(member)+' · '+item.work.song} live={data.mode==='live'}/>
  <button data-member-work-trigger={item.work.id} className="member-work-card__body" onClick={onOpen}><small className="member-work-card__meta">{names(data,item.work.groupIds)} · {item.work.videoType||'MV'}{item.work.version?' · '+item.work.version:''}</small><h3 className="member-work-card__title">{item.work.song||item.work.name}</h3><span className="member-work-card__scores">{([['个人表现',item.performance],['个人造型',item.styling]] as const).map(([label,value])=><span className="member-work-card__score" key={label}><small className="member-work-card__score-label">{label}</small><strong className="member-work-card__score-value" data-unrated={value===null}>{number(value)}</strong></span>)}</span><span className="member-work-card__open">查看作品<ArrowUpRight size={16}/></span></button>
 </article>;
}

function musicMemberPortrait(m:Member,artistReturn?:string|null){const visualKey=m.groupIds.includes(BABYMONSTER_GROUP_ID)?'babymonster':m.groupIds.includes(ILLIT_GROUP_ID)?'illit':m.groupIds.includes(XG_GROUP_ID)?'xg':m.groupIds.includes(AESPA_GROUP_ID)?'aespa':m.groupIds.includes(IVE_GROUP_ID)?'ive':m.groupIds.includes(KIOF_GROUP_ID)?'kissoflife':m.groupIds.includes(STAYC_GROUP_ID)?'stayc':null;const displayGroups=m.groupIds.length?m.groupIds:(m.formerGroupIds??[]);const fallback=musicPortraits.find(a=>displayGroups.includes(a.groupId)&&(!a.memberId||a.memberId===m.id)&&a.stageName.toLowerCase()===m.stageName.toLowerCase());const currentPath=musicGroupRegistry.find(g=>displayGroups.includes(g.groupId))?.path;const defaultSeven=sevenJournalPortrait(m,artistReturn??currentPath);return defaultSeven??itzyMemberPortrait(m)??vvupMemberPortrait(m,artistReturn)??weeeklyMemberPortrait(m,artistReturn)??cherrybulletMemberPortrait(m,artistReturn)??rocketpunchMemberPortrait(m,artistReturn)??everglowMemberPortrait(m,artistReturn)??fromis9MemberPortrait(m,artistReturn)??izoneMemberPortrait(m,artistReturn)??idleMemberPortrait(m)??atheartMemberPortrait(m)??hitgsMemberPortrait(m)??vchaMemberPortrait(m)??katseyeMemberPortrait(m)??spiaMemberPortrait(m)??witchxMemberPortrait(m)??tracerMemberPortrait(m)??(visualKey?(artistVisuals[visualKey].members as Record<string,{image:string;label:string;date:string}>)[m.stageName]:null)??fallback??null;}
function MusicPortrait({concept,member:m}:{concept:{image:string;label:string;date:string};member:Member}){const [open,setOpen]=useState(false);return <div className="music-portrait-original"><button type="button" className="photo" aria-label={'查看 '+memberDisplayName(m)+' 原图'} onClick={()=>setOpen(true)}><ConceptPhotoImage src={concept.image} memberId={m.id} label={m.stageName+' · '+concept.label}/></button><p>{concept.label}{concept.date?' · '+concept.date:''}</p><button className="text-button" onClick={()=>setOpen(true)}>查看原图 ↗</button>{open&&<PhotoLightbox src={concept.image} label={m.stageName+' · '+concept.label} onClose={()=>setOpen(false)}/>}</div>;}
function MusicMemberPhoto({member:m,live}:{member:Member;live:boolean}){const concept=musicMemberPortrait(m);return concept?<div className="photo"><ConceptPhotoImage src={concept.image} memberId={m.id} label={m.stageName+' · '+concept.label}/></div>:<PhotoView photo={m.photo} label={memberDisplayName(m)} live={live}/>;}
function MemberDetail({member:m,data,onBack,onWork,onGroup,onSaved,backLabel='返回成员档案',artistReturn}:{artistReturn?:string|null;member:Member;data:Catalog;onBack:()=>void;onWork:(id:string)=>void;onGroup?:(id:string)=>void;onSaved:()=>void;backLabel?:string}){
 const works=memberWorks(data,m.id),summary=memberWorkSummary(works),concept=musicMemberPortrait(m,artistReturn);const number=(n:number|null)=>n===null?'待评':n.toFixed(1);
 return <div className="detail"><button className="back text-button" onClick={onBack}><ArrowLeft size={16}/>{backLabel}</button><div className="member-detail">{concept?<MusicPortrait concept={concept} member={m}/>:<PhotoView photo={m.photo} label={m.name} live={data.mode==='live'} retryable fit="contain"/>}<div><GroupLinks data={data} ids={m.groupIds} onGroup={onGroup}/><h1><span className="member-display-name">{memberDisplayName(m)}</span></h1><MemberPhysicalFacts member={m}/><div className="tags">{[m.status,m.country,m.role].filter(Boolean).map(t=><span key={t}>{t}</span>)}</div><MemberCareerFacts member={weeeklyMemberContext(m,artistReturn)?{...m,officialUrl:latestWeeeklyOfficialUrl}:cherrybulletMemberContext(m,artistReturn)?{...m,officialUrl:latestCherrybulletOfficialUrl}:rocketpunchMemberContext(m,artistReturn)?{...m,officialUrl:latestRocketpunchOfficialUrl}:m}/>
  <SocialLinks accounts={m.social??[]} title="个人动态" individual/><section className="member-work-summary" aria-label="作品综合分"><div className="member-work-summary__heading"><span className="member-work-summary__label">作品综合分</span><strong className="member-work-summary__value" data-unrated={summary.composite===null}>{number(summary.composite)}</strong></div><p className="member-work-summary__count">已评 {summary.ratedWorks} 部作品</p><div className="member-work-summary__dimensions">{([['表现均分',summary.performanceMean,summary.performanceCount],['造型均分',summary.stylingMean,summary.stylingCount]] as const).map(([label,value,count])=><div className="member-work-metric" key={label}><div className="member-work-metric__heading"><span className="member-work-metric__label">{label}</span><strong className="member-work-metric__value" data-unrated={value===null}>{number(value)}</strong></div><small className="member-work-metric__count">{count} 部已评</small></div>)}</div><p className="member-work-summary__explanation">表现与造型，各占一半{summary.composite===null&&summary.ratedWorks>0?'；再评另一项即可生成综合分':''}</p></section>
  {m.note&&<p className="my-note">{m.note}</p>}<Editor table="members" id={m.id} mode={data.mode} publicCatalog={data} onSaved={onSaved}/></div></div><section className="section"><div className="section-heading"><h2>她的作品 <small>{works.length}</small></h2><span className="subtle">个人评分</span></div><div className="member-works-grid">{works.map(item=><MemberWorkCard key={item.work.id} item={item} member={m} data={data} onOpen={()=>onWork(item.work.id)}/>)}</div>{works.length===0&&<p className="subtle">{publicCreditsForMember(data,m.id).length?'个人评分记录待补，公开作品资料见下方。':'还没有收录她的 MV。'}</p>}</section><MemberPublicCredits memberId={m.id} data={data} onWork={onWork}/></div>;
}
