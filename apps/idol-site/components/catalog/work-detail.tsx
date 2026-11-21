'use client';
import {useCanEdit} from '@/components/public-access';
import {SequencePreview} from '@/components/library-browser';
import type {WatchSequence} from '@/lib/idol/journey';
import {PublicWorkCredits, PublicProductionCredits} from '@/components/public-work-credits';
import {publicCreditForWork} from '@/lib/idol/public-work-credits';
import {memberDisplayName} from '@/lib/idol/member-display-name';
import {useState, useCallback, useRef} from 'react';
import {ArrowUpRight, ArrowLeft, Check, ChevronRight, Music2, Users, Disc3} from 'lucide-react';
import type {CatalogView as Catalog, Work} from '@/lib/idol/types';
import {videoId} from '@/lib/idol/values';
import {approvedVideoPoster, approvedStagePoster} from '@/lib/idol/approved-video-poster';
import {MvPhotoReference} from '@/components/mv-photo-reference';
import {mvRecognitionEdition} from '@/lib/idol/mv-recognition-edition';
import {MvIdentityPhoto} from '@/components/mv-identity-photo';
import {mvMemberAbsence} from '@/lib/idol/mv-member-appearance';
import {katseyeVideoPoster} from '@/components/app-image-presentation';
import {workPlayback} from '@/lib/idol/work-playback';
import {WorkVideoPlayer} from '@/components/work-video-player';
import {personalMvPhoto} from '@/lib/idol/member-works';
import {stageMatchesAlternative, stageSourceKey, stageHasValidBinding, stageEmbedUrl, stageWatchUrl, formatStageTime, youtubeEmbedUrl} from '@/lib/idol/stage-source';
import {stageStatusLabel, stageStatusDescription, stageKindLabel} from '@/lib/idol/stage-display';
import {validStageResearchNote} from '@/lib/idol/stage-public-research';
import {performanceLabel, performerLabel, mvVersionWarning, castWarning, alternativeViewingNote, selectionNote} from '@/lib/idol/product-copy';
import {StageSameSongFallback} from '@/components/stage-same-song-fallback';
import {names, score, GroupLinks} from './presentation';
import {Editor} from './record-editor';

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

const platformLabel={x:'X',youtube:'YouTube',bilibili:'bilibili',naver:'NAVER TV',weverse:'Weverse',official_site:'官方网站'};
function StageSupplements({work}:{work:Work}){
 const original=work.stageSupplement;
 const supplement=original&&work.stage&&!work.stage.clip?{...original,alternatives:original.alternatives.filter(a=>!stageMatchesAlternative(work.stage!,a))}:original;
 const researchNote=supplement?.researchNote&&validStageResearchNote(supplement.researchNote)?supplement.researchNote:null;
 if(!supplement||(!supplement.alternatives.length&&!supplement.watchLeads?.length&&!researchNote))return null;
 return <section id="other-performances" className="stage-supplements" aria-label="其他观看选择">
  {!!supplement.alternatives.length&&<><h2>其他观看选择</h2><p className="subtle">优先查看打歌节目与练习室。以下视频仅供观看，不用于本条舞台评分。</p><div className="alternative-grid">{supplement.alternatives.map(a=><article className="alternative-card" key={a.id}>
   <div className="alternative-source-class">{performanceLabel(a)} · {performerLabel(a.performerScope)}{a.completeness==='excerpt'?' · 短版表演':''}</div>
   <h3>{a.title}</h3>
   {!!a.performerNames?.length&&a.performerScope!=='full_group'&&<p className="alternative-performers">{a.performerNames.join(' / ')}</p>}
   {alternativeViewingNote(work,a)&&<p className="alternative-differences">{alternativeViewingNote(work,a)}</p>}
   {selectionNote(a)&&<small>{selectionNote(a)}</small>}
   <small>{platformLabel[a.platform]} · {a.channel}{a.sourceClass==='reupload'?' · 转载':a.sourceClass==='third_party'?' · 第三方上传':''}</small>
   {a.durationScope==='whole_video'&&a.durationSeconds&&<small>整段视频 {formatStageTime(a.durationSeconds)}，不代表单曲时长。</small>}
   <a className="button" href={a.url} target="_blank" rel="noopener noreferrer">{a.performanceType==='press_concert_recording'?'前往原媒体观看':`在 ${platformLabel[a.platform]} 观看`}<ArrowUpRight size={15}/></a>
   <small>仅观看，不用于本条舞台评分。</small>
  </article>)}</div></>}
  {!!supplement.watchLeads?.length&&<><h2>相关演出</h2><p className="subtle">这些整场或合集提到了这首歌，暂未提供完整单曲片段。仅供观看，不用于本条舞台评分。</p><div className="alternative-grid">{supplement.watchLeads.map(a=><article className="alternative-card" key={a.id}>
   <div className="alternative-source-class">{a.sourceClass==='official'?'官方整场或合集':a.sourceClass==='reupload'?'转载节目线索':'第三方节目线索'} · {performerLabel(a.performerScope)}</div><h3>{a.title}</h3>
   <p>尚未确认完整单曲的起止与对应版本。</p>
   {a.leadTimeSeconds!==undefined&&<p>可从 {formatStageTime(a.leadTimeSeconds)} 附近开始寻找歌曲；不是完整片段。</p>}
   <small>{platformLabel[a.platform]} · {a.channel}{a.sourceClass==='reupload'?' · 转载':a.sourceClass==='third_party'?' · 第三方上传':''}</small><a className="button" href={a.url} target="_blank" rel="noopener noreferrer">打开相关演出<ArrowUpRight size={15}/></a>
  </article>)}</div></>}
  {researchNote?<details className="caption-help stage-research-note"><summary>待核说明与来源</summary><p>{researchNote.summary}</p><ul>{researchNote.sources.map(source=><li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}<ArrowUpRight size={13}/></a></li>)}</ul><p className="subtle">仍待核验，不用于本条舞台评分。</p></details>:null}
 </section>;
}

function CaptionHelp(){return <details className="caption-help"><summary>字幕与中文翻译</summary><p>字幕可选语言由视频提供，播放后可在设置中切换。</p><ol><li>点击视频内的齿轮 → 字幕。</li><li>优先选择中文；若只有韩语或英语，选择“自动翻译 → 中文（简体）”。</li><li>若嵌入菜单没有此选项，可打开上方 YouTube 原视频尝试。</li></ol><p>没有可用字幕时，自动翻译也无法生成歌词。机器翻译仅供理解，可能不准确。</p><p>若翻译插件提示会员过期，可先暂停该插件，再按上方步骤使用 YouTube 字幕。</p><a href="https://support.google.com/youtube/answer/100078?hl=zh-Hans" target="_blank" rel="noopener noreferrer">YouTube 字幕帮助 ↗</a></details>;}
// Exact production identity: design-only media must never become a score target.
export function WorkDetail({work,data,sequence,onBack,onMember,onGroup,onSaved,onVersion,onArtistNavigate,backLabel='返回作品库',initialView='mv',onViewChange,nextWork=null,onNext,sequenceLabel,sequencePosition=0,sequenceTotal=0}:{sequence?:WatchSequence;nextWork?:Work|null;onNext?:()=>void;sequenceLabel?:string;sequencePosition?:number;sequenceTotal?:number;work:Work;data:Catalog;onArtistNavigate?:(url:string)=>void;onVersion:(id:string)=>void;onBack:()=>void;onMember:(id:string)=>void;onGroup?:(id:string)=>void;onSaved:()=>void;backLabel?:string;initialView?:'mv'|'stage';onViewChange?:(view:'mv'|'stage')=>void}){
 const canEdit=useCanEdit();
 const triples=work.groupIds.includes('rec28ldfRTiCtw');
 const triplesMedia=triplesDetailMedia(work);
 const loona=work.groupIds.includes('recvxyEBDZJAXm');
 const loonaButterfly=loona&&work.id==='recvxyOz5X7G95'&&work.song==='Butterfly';
 const [selection,setSelection]=useState({workId:work.id,initialView,view:initialView});
 const view=selection.workId===work.id&&selection.initialView===initialView?selection.view:initialView;
 const [dirtyKeys,setDirtyKeys]=useState<string[]>([]);const [navigationBlockedKeys,setNavigationBlockedKeys]=useState<string[]>([]);const [workSaveEnabled,setWorkSaveEnabled]=useState(false);
 const [retryWorkSave,setRetryWorkSave]=useState(false);
 const onWorkSaveState=useCallback((enabled:boolean,retry:boolean)=>{setWorkSaveEnabled(enabled);setRetryWorkSave(retry);},[]);
 const workSaveButton=useRef<HTMLButtonElement>(null);const memberCards=useRef<Record<string,HTMLElement|null>>({});
 const markNavigationBlocked=useCallback((key:string,blocked:boolean)=>setNavigationBlockedKeys(old=>blocked?(old.includes(key)?old:[...old,key]):old.includes(key)?old.filter(k=>k!==key):old),[]);
 const markDirty=useCallback((key:string,dirty:boolean)=>setDirtyKeys(old=>dirty?(old.includes(key)?old:[...old,key]):old.includes(key)?old.filter(k=>k!==key):old),[]);
 // Browser Back can change the video tab of an already mounted work.
 if(selection.workId!==work.id || selection.initialView!==initialView){
  setSelection({workId:work.id,initialView,view:initialView});
  if(selection.workId!==work.id){
   setDirtyKeys([]);setNavigationBlockedKeys([]);setWorkSaveEnabled(false);setRetryWorkSave(false);
  }
 }
 const versionTags=[...new Set(work.versionDisplay?.tags??[])].filter(tag=>![work.videoType||'视频',work.version,work.releaseDate,work.name,work.song,work.officialTitle,work.channel].includes(tag));
 const versionLinks=work.versionDisplay?.links??[];
 const versionGroups=[...new Set(versionLinks.map(link=>link.categories.join(' / ')))];
 const stage=work.stage;const stageBound=stageHasValidBinding(stage);
 const activeUrl=view==='stage'?(stage?stageWatchUrl(stage):''):work.url;const vid=view==='stage'?stage?.videoId??null:videoId(activeUrl);const activePlatform=view==='stage'?stage?.platform??'youtube':'youtube';const activePlatformLabel=activePlatform==='bilibili'?'B站':activePlatform==='x'?'X':'YouTube';const title=view==='stage'?stage?.title??'暂无舞台视频':work.officialTitle||work.name;
 const playback=workPlayback(work.id,vid,view,stage);
 const approvedPoster=view==='stage'?(stage?approvedStagePoster(work.id,stage)??(activePlatform==='youtube'&&!stage.clip?katseyeVideoPoster(work.id,vid,view):null):null):approvedVideoPoster(work.id,vid,view)??katseyeVideoPoster(work.id,vid,view);
 const absence=mvMemberAbsence(work);
 const people=absence?[]:data.ratings.filter(r=>r.workIds.includes(work.id));const memberDrafts=dirtyKeys.filter(k=>k.startsWith('ratings:'));const hasMemberDraft=memberDrafts.length>0;
 const switchView=(next:'mv'|'stage')=>{setSelection({workId:work.id,initialView,view:next});onViewChange?.(next);};
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
 {!activeUrl?<div className="video-stage video-missing"><div className="stage-empty"><Disc3 size={44}/><h2>{view==='stage'?stageStatusLabel(work):'暂无视频'}</h2><p>{view==='stage'?stageStatusDescription(work):'暂时没有可播放的视频。'}</p>
 {view==='stage'&&<>
  {(work.stageSupplement?.alternatives.length||work.stageSupplement?.watchLeads?.length)
   ?<button className="button primary" onClick={()=>document.getElementById('other-performances')?.scrollIntoView({behavior:'smooth',block:'start'})}>看看其他表演</button>
   :work.stageSupplement?.researchNote&&validStageResearchNote(work.stageSupplement.researchNote)&&<button type="button" className="button primary" aria-controls="other-performances" onClick={event=>{
    const details=event.currentTarget.closest('.detail')?.querySelector<HTMLDetailsElement>('.stage-research-note');
    if(!details)return;
    details.open=true;
    details.querySelector('summary')?.focus({preventScroll:true});
    details.scrollIntoView({block:'center'});
   }}>查看资料与来源</button>}
  <button className="button" onClick={()=>switchView('mv')}>返回 MV</button>
 </>}</div></div>:<WorkVideoPlayer posterSrc={approvedPoster?.src??(loonaButterfly&&view==='mv'?'/artist/loona/approved-home/butterfly.jpg':triplesMedia&&activePlatform==='youtube'?(view==='mv'?triplesMedia.poster:triplesMedia.stagePoster):undefined)} posterLabel={approvedPoster?.label} posterFit={approvedPoster?.fit??(approvedPoster?'contain':undefined)} posterSize={approvedPoster?.intrinsicSize} posterZoom={approvedPoster?.zoom} workId={work.id} view={view} platform={activePlatform} sourceKey={view==='stage'&&stage?stageSourceKey(stage):null} url={activeUrl} videoId={vid} embedUrl={playback?.embedUrl??(view==='stage'&&stage?stageEmbedUrl(stage):vid?youtubeEmbedUrl(vid):null)} title={title}/>}
 <div className="video-caption"><span>{title}</span>{playback?<span>{playback.credit}</span>:activeUrl&&<a href={activeUrl} target="_blank" rel="noopener noreferrer">{activePlatformLabel} 原视频<ArrowUpRight size={13}/></a>}</div>{activeUrl&&!playback&&<p className="video-fallback">{activePlatform==='bilibili'?'在 B站打开所选分P观看。':activePlatform==='x'?'在 X 打开所选视频观看。':'播放不了？可在 YouTube 打开原视频。'}</p>}
 {loonaButterfly&&<div className="loona-associated-release"><img src="/artist/loona/approved-home/butterfly-album.jpg" width="96" height="96" alt="关联发行《X X》封面"/><div><strong>关联发行《X X》</strong><span>发行封面</span></div></div>}
 {view==='mv'&&people.length>0&&<nav className="mv-member-shortcuts" aria-label="本支成员"><span>本支成员</span><div>{people.map(r=>{const m=data.members.find(m=>r.memberIds.includes(m.id)),label=m?memberDisplayName(m):r.name;return <button type="button" key={r.id} aria-controls={'mv-cast-'+r.id} onClick={()=>jumpToCast(r.id)}>{label}</button>;})}</div><small>点名字，定位认人图与个人评分</small></nav>}
 {!playback&&vid&&activePlatform==='youtube'&&<CaptionHelp/>}
 {view==='stage'&&stage&&<div className="stage-source">{stage.sameSongFallback&&<StageSameSongFallback stage={stage}/>}<p>{stage.channel} · {stageKindLabel(stage.kind)}{stage.sourceClass==='reupload'?' · 转载':stage.sourceClass==='third_party'?' · 第三方上传':''}</p>{!stage.sameSongFallback&&stage.verificationNote&&<p className="stage-version-note">{stage.verificationNote}</p>}{stage.clip&&<p className="stage-reuse-note">整场中的单曲片段 · {formatStageTime(stage.clip.startSeconds)}–{formatStageTime(stage.clip.endSeconds)}<br/>{stage.platform==='bilibili'?'B站仅提供原分P外链，请手动定位到上述起点，并在终点停止；评分只对应该区间。':'站内播放此片段；打开原视频会从起点开始，需自行在终点停止。'}</p>}{stage.reusesOriginalVideo&&<p className="stage-reuse-note">与 MV 页为同一支表演视频。</p>}{stage.higherCandidate&&<p className="stage-reuse-note">另有更高赞舞台可看，当前评分仍对应这支视频。<a href={stage.higherCandidate.url} target="_blank" rel="noopener noreferrer">观看另一版 ↗</a></p>}{!stageBound&&work.stageScore!==null&&<p className="stage-version-note">原有舞台分已保留，但对应的视频还未确认；暂不为这支视频改分。</p>}</div>}

 {view==='stage'&&<StageSupplements work={work}/>}
 </div><aside className={'work-aside '+(view==='stage'?'stage-aside':'')}><GroupLinks data={data} ids={work.groupIds} onGroup={onGroup}/><h1>{work.song||work.name}</h1>
 <div className="tags">{view==='stage'?<><span>舞台</span><span>{stage?stageKindLabel(stage.kind):'暂无舞台'}</span>{stage?.publishedDate&&<span>{stage.publishedDate}</span>}</>:<><span>{work.videoType||'视频'}</span>{work.version&&<span>{work.version}</span>}{work.releaseDate&&<span>{work.releaseDate}</span>}{versionTags.map(tag=><span key={tag}>{tag}</span>)}</>}</div>
 {view==='mv'&&versionLinks.length>0&&<nav className="work-version-links" aria-label="作品版本与关联">{versionGroups.map(category=><div className="work-version-group" key={category}><span className="work-version-category">{category}</span><div>{versionLinks.filter(link=>link.categories.join(' / ')===category).map(link=><button type="button" key={link.workId} data-browse-anchor={'version-'+work.id+'-'+link.workId} data-member-work-trigger={'version:'+work.id+':'+link.workId} disabled={navigationBlockedKeys.length>0} onClick={event=>{event.currentTarget.focus({preventScroll:true});onVersion(link.workId);}}><span>{link.title}</span>{link.labels.length>0&&<small>{link.labels.join(' · ')}</small>}<ChevronRight size={14}/></button>)}</div></div>)}</nav>}
 {view==='mv'&&mvVersionWarning(work.verification)&&<p className="verification">{mvVersionWarning(work.verification)}</p>}

 <div className="work-score"><span>{view==='stage'?'我的整体舞台分':'我的 MV 分数'}</span><strong>{score(view==='stage'?work.stageScore:work.score)}</strong><small>{view==='stage'?(!stageBound&&work.stageScore!==null?'原有分数，对应视频未确认':stageBound?(stage?.clip?'对应当前舞台片段':'对应当前舞台视频'):'暂无可评分视频'):(work.watched||'观看状态未标记')}</small></div>
 {view==='mv'&&work.note&&<p className="my-note">{work.note}</p>}
 <Editor key={work.id} table="works" id={work.id} mode={data.mode} publicCatalog={data} onSaved={onSaved} workView={view} stageVideoId={stageBound?stage?.videoId:null} sourceKey={stageBound?stageSourceKey(stage):null} onDirtyChange={markDirty} onNavigationBlockedChange={markNavigationBlocked} saveButtonRef={workSaveButton} onSaveAvailabilityChange={onWorkSaveState}/>
 {view==='stage'&&<div className="stage-overall-note"><Music2 size={18}/><p>舞台只做整体评分。<br/>成员个人评分保留在 MV 页。</p></div>}
 </aside></div>
 {triples&&<section className="triples-detail-connections">{view==='mv'&&triplesMedia?.releaseCover&&<div className="triples-associated-release"><h2>来自这张发行</h2><button type="button" onClick={()=>onArtistNavigate?.('/artists/triples?section=works&release='+encodeURIComponent(triplesMedia.releaseKey))}><img src={triplesMedia.releaseCover} width="136" height="136" alt={triplesMedia.releaseTitle+' · 发行封面'}/><span>{triplesMedia.releaseTitle}<small>发行封面</small></span><ChevronRight size={18}/></button></div>}<div className="triples-other-video"><h2>{view==='stage'?'回到音乐影像':'到舞台上再听一次'}</h2>{view==='mv'&&triplesMedia?.stagePoster&&<img src={triplesMedia.stagePoster} width="880" height="495" alt="Girls Never Die · M COUNTDOWN EP.843 舞台封面"/>}{view==='mv'&&stage&&<p>{stage.title}</p>}<button type="button" className="button" onClick={()=>{switchView(view==='stage'?'mv':'stage');document.getElementById('work-video-panel')?.scrollIntoView({block:'start'});}}>{view==='stage'?'查看 MV':'进入舞台'}<ChevronRight size={16}/></button></div></section>}
 {view==='mv'&&absence&&<section className="mv-no-members" aria-label="无成员出镜"><h2>本MV无成员真人出镜</h2><p>{absence.reason}</p><p>仅保留MV评分，成员评分已关闭。</p><a href={absence.sources[0]} target="_blank" rel="noopener noreferrer">查看出镜核查来源 ↗</a></section>}
 {view==='mv'&&<PublicWorkCredits work={work} data={data} onMember={onMember}/>}
 {view==='mv'&&<PublicProductionCredits work={work}/>}
 {!absence&&<section hidden={view==='stage'||(people.length===0&&!!publicCreditForWork(work))} className="section cast-section"><div className="section-heading"><div><h2>成员与评分</h2></div></div><div className="cast-grid">{people.map(r=>{const m=data.members.find(m=>r.memberIds.includes(m.id));return <article id={"mv-cast-"+r.id} tabIndex={-1} aria-label={(m?memberDisplayName(m):r.name)+" · 本支 MV 成员卡片"} data-browse-anchor={"cast-"+r.id} className="cast-card" key={r.id} ref={node=>{memberCards.current[r.id]=node;}}><div className="mv-photo-stack"><MvIdentityPhoto work={work} selectEdition={mvRecognitionEdition} memberId={m?.id??''} label={m?memberDisplayName(m):r.name} photo={m?personalMvPhoto(r,m.id,work.id):null} live={data.mode==='live'}/><MvPhotoReference photo={r.photo} referencePhoto={r.referencePhoto} label={m?memberDisplayName(m):r.name} live={data.mode==='live'}/></div><div className="cast-copy"><button className="member-name" disabled={!m} onClick={()=>m&&onMember(m.id)}><strong><span className="member-display-name">{m?memberDisplayName(m):r.name}</span></strong><ArrowUpRight size={15}/></button>{castWarning(r.verification)&&<small className="cast-verification">{castWarning(r.verification)}</small>}<div className="cast-scores"><span>表现 <b>{score(r.score)}</b></span><span>造型 <b>{score(r.stylingScore)}</b></span></div>{r.memory&&<p className="memory">{r.memory}</p>}{r.note&&<p className="cast-note">{r.note}</p>}<Editor loona={loona} triples={triples} table="ratings" id={r.id} mode={data.mode} publicCatalog={data} onSaved={onSaved} onDirtyChange={markDirty} onNavigationBlockedChange={markNavigationBlocked} compact/></div></article>})}</div>{people.length===0&&<div className="empty"><Users size={30}/><h3>{publicCreditForWork(work)?'个人评分记录待补':'这支 MV 暂无成员名单'}</h3><p>{publicCreditForWork(work)?'已核实的公开资料见下方。':'可以先看视频，给整支作品评分。'}</p></div>}</section>}
 {sequenceLabel&&<section className="watch-next" aria-label="继续观看"><div><span className="eyebrow">KEEP WATCHING</span><h2>{nextWork?'接着看下一首':'这组暂时没有下一首 MV'}</h2>{nextWork?<p>{names(data,nextWork.groupIds)} · {nextWork.song||nextWork.name}</p>:<p>回到列表，换一支想看的作品。</p>}</div>{nextWork?<button className="button primary" disabled={navigationBlockedKeys.length>0} onClick={onNext}>下一首 MV<ChevronRight size={17}/></button>:<button className="button" onClick={onBack}>{backLabel}<ArrowLeft size={16}/></button>}</section>}
 <div className="detail-return"><span className="watch-save-context">{sequenceLabel&&<strong>{sequenceLabel} · 第 {sequencePosition} / {sequenceTotal} 首</strong>}<span>{navigationBlockedKeys.length?'请先等待或核对本次保存结果，再继续下一首':dirtyKeys.length?`有 ${dirtyKeys.length} 条未保存修改，切换不会自动保存`:'切换视频不会清空未保存的输入'}</span></span><div>{canEdit&&<button className="button primary" disabled={!workSaveEnabled} onClick={()=>workSaveButton.current?.click()}>{retryWorkSave?'核对上次保存':'保存作品修改'}<Check size={15}/></button>}{hasMemberDraft&&<button className={"text-button member-draft-link "+(!workSaveEnabled?"primary":"")} onClick={jumpToMemberDraft}>去保存成员评分（{memberDrafts.length}）<ArrowUpRight size={15}/></button>}<button className="button detail-back" onClick={onBack}>{backLabel}<ArrowLeft size={16}/></button>{nextWork&&<button className="button next-work-button" title={"下一首 MV · "+(nextWork.song||nextWork.name)} aria-label={"下一首 MV · "+(nextWork.song||nextWork.name)} disabled={navigationBlockedKeys.length>0} onClick={onNext}><span>下一首 MV<small>{nextWork.song||nextWork.name}</small></span><ChevronRight size={17}/></button>}</div></div></div>;
}
