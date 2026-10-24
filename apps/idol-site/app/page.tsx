'use client';
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
import {candidateExperienceStylesheet} from '@/lib/idol/candidate/experience-styles';
import {MemberCareerFacts} from '@/components/member-career-facts';
import {MemberPhysicalFacts} from '@/components/member-physical-facts';
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
import {mvPhotoLabel,mvReferencePhoto,MV_LOOK_PHOTO_LABEL} from '@/lib/idol/mv-photo-presentation';
import {CatalogPhotoImage,WorkCoverImage,ConceptPhotoImage,katseyeVideoPoster} from '@/components/app-image-presentation';
import {ImageRecoveryProvider,ImageRecoveryControls,type ReliableImageState} from '@/components/reliable-image';
import {WorkVideoPlayer} from '@/components/work-video-player';
import {SocialLinks} from '@/components/social-links';
import {BABYMONSTER_GROUP_ID,ILLIT_GROUP_ID,XG_GROUP_ID,AESPA_GROUP_ID,IVE_GROUP_ID,KIOF_GROUP_ID,STAYC_GROUP_ID,NMIXX_GROUP_ID,HEARTS2HEARTS_GROUP_ID,KIIIKIII_GROUP_ID,ITZY_GROUP_ID,LESSERAFIM_GROUP_ID,SAYMYNAME_GROUP_ID,KATSEYE_GROUP_ID,groupArtistUrl,memberArtistUrl,artistReturnLabel} from '@/lib/idol/artist-navigation';
import './babymonster-experience.css';
import './illit-experience.css';
import artistVisuals from '@/data/artist-visuals.json';
import {tracerMemberPortrait} from '@/lib/idol/tracer-photos';
import {katseyeMemberPortrait} from '@/lib/idol/katseye-photos';
import {spiaMemberPortrait} from '@/lib/idol/spia-photos';
import {witchxMemberPortrait} from '@/lib/idol/witchx-photos';
import './expanded-experience.css';
import './ive-experience.css';
import './kiof-experience.css';
import './stayc-experience.css';
import './nmixx-experience.css';
import './hearts2hearts-experience.css';
import './kiiikiii-experience.css';
import './itzy-experience.css';
import './lesserafim-experience.css';
import './saymyname-experience.css';
import './katseye-experience.css';
import './idle-experience.css';
import './billlie-experience.css';
import './candidate-experience.css';
import {candidateExperienceClass} from '@/lib/idol/candidate/registry';
import {useCatalogGroupViews,needsCatalogGroupViews} from '@/components/use-catalog-group-views';
// Keep existing index styles in the initial CSS boundary; only defer JavaScript.
import '@/components/candidate-index-card.css';
import {memberWorks,memberWorkSummary,type MemberWork} from '@/lib/idol/member-works';
import {stageSourceKey,stageHasValidBinding,stageEmbedUrl,stageWatchUrl,formatStageTime,youtubeEmbedUrl} from '@/lib/idol/stage-source';
import {inQueue as queueIncludes,queueLabels} from '@/lib/idol/queues';
import {indexWorkNames,matchingWorks,makeWatchSequence,nextInSequence,sortWorks} from '@/lib/idol/watch-sequence';
import {stageStatusLabel,stageStatusDescription,stageKindLabel,stageMatches} from '@/lib/idol/stage-display';
import {resolveHomeRotation,shuffleHomePool,type HomePool} from '@/lib/idol/home-rotation';
import {useBrowseJourney} from '@/components/use-browse-journey';
import {defaultFilters,type Nav,type Route,type WorkSort} from '@/lib/idol/journey';
import {requestMessage,performanceLabel,performerLabel,mvVersionWarning,castWarning,alternativeViewingNote} from '@/lib/idol/product-copy';
const navs:[Nav,string][]=[['home','我的放映室'],['works','作品库'],['members','成员档案'],['groups','团体索引'],['insights','偏好手帐'],['records','搜我的记录']];
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
function experienceClassFor(data:Catalog|null,route:Route){
 // Match the rendered detail: a valid work takes precedence over a member query.
 const chosenWork=data?.works.find(w=>w.id===route.work);const chosenMember=chosenWork?undefined:data?.members.find(m=>m.id===route.member);
 // Keep the historical theme on a validated local artist return journey.
 // A member's current group remains authoritative everywhere else.
 if(chosenMember&&weeeklyMemberContext(chosenMember,route.artistReturn))return 'candidate-experience candidate-weeekly-experience';
 if(chosenMember&&cherrybulletMemberContext(chosenMember,route.artistReturn))return 'candidate-experience candidate-cherrybullet-experience';
 if(chosenMember&&rocketpunchMemberContext(chosenMember,route.artistReturn))return 'candidate-experience candidate-rocketpunch-experience';
 if(chosenMember&&everglowMemberContext(chosenMember,route.artistReturn))return 'candidate-experience candidate-everglow-experience';
 if(chosenMember&&fromis9MemberContext(chosenMember,route.artistReturn))return 'candidate-experience candidate-fromis9-experience';
 if(chosenMember&&izoneMemberPortrait(chosenMember,route.artistReturn))return 'candidate-experience candidate-izone-experience';
 const bmExperience=!!(chosenWork?.groupIds.includes(BABYMONSTER_GROUP_ID)||chosenMember?.groupIds.includes(BABYMONSTER_GROUP_ID));
 const xgExperience=!!(chosenWork?.groupIds.includes(XG_GROUP_ID)||chosenMember?.groupIds.includes(XG_GROUP_ID));
 const katseyeExperience=!!(chosenWork?.groupIds.includes(KATSEYE_GROUP_ID)||chosenMember?.groupIds.includes(KATSEYE_GROUP_ID));
 const saymynameExperience=!!(chosenWork?.groupIds.includes(SAYMYNAME_GROUP_ID)||chosenMember?.groupIds.includes(SAYMYNAME_GROUP_ID));
 const itzyExperience=!!(chosenWork?.groupIds.includes(ITZY_GROUP_ID)||chosenMember?.groupIds.includes(ITZY_GROUP_ID));
 const lesserafimExperience=!!(chosenWork?.groupIds.includes(LESSERAFIM_GROUP_ID)||chosenMember?.groupIds.includes(LESSERAFIM_GROUP_ID));
 const kiiikiiiExperience=!!(chosenWork?.groupIds.includes(KIIIKIII_GROUP_ID)||chosenMember?.groupIds.includes(KIIIKIII_GROUP_ID));
 const hearts2heartsExperience=!!(chosenWork?.groupIds.includes(HEARTS2HEARTS_GROUP_ID)||chosenMember?.groupIds.includes(HEARTS2HEARTS_GROUP_ID));
 const nmixxExperience=!!(chosenWork?.groupIds.includes(NMIXX_GROUP_ID)||chosenMember?.groupIds.includes(NMIXX_GROUP_ID));
 const staycExperience=!!(chosenWork?.groupIds.includes(STAYC_GROUP_ID)||chosenMember?.groupIds.includes(STAYC_GROUP_ID));
 const kiofExperience=!!(chosenWork?.groupIds.includes(KIOF_GROUP_ID)||chosenMember?.groupIds.includes(KIOF_GROUP_ID));
 const iveExperience=!!(chosenWork?.groupIds.includes(IVE_GROUP_ID)||chosenMember?.groupIds.includes(IVE_GROUP_ID));
 const aespaExperience=!!(chosenWork?.groupIds.includes(AESPA_GROUP_ID)||chosenMember?.groupIds.includes(AESPA_GROUP_ID));
 const illitExperience=!!(chosenWork?.groupIds.includes(ILLIT_GROUP_ID)||chosenMember?.groupIds.includes(ILLIT_GROUP_ID));
 return bmExperience?'bm-experience':illitExperience?'illit-experience':xgExperience?'xg-experience':aespaExperience?'aespa-experience':iveExperience?'ive-experience':kiofExperience?'kiof-experience':staycExperience?'stayc-experience':nmixxExperience?'nmixx-experience':hearts2heartsExperience?'hearts2hearts-experience':kiiikiiiExperience?'kiiikiii-experience':itzyExperience?'itzy-experience':lesserafimExperience?'lesserafim-experience':saymynameExperience?'saymyname-experience':katseyeExperience?'katseye-experience':candidateExperienceClass(chosenWork?.groupIds??chosenMember?.groupIds??[]);
}
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
function madeinDetailMedia(work:Work){
 if(!work.groupIds.includes('rec28ldfRTiCzI'))return null;
 const base='/artist/madein/figma-20261017/';
 const rows=[['rec28ldfRTrPen','https://www.youtube.com/watch?v=yE6yETkVI3Q','super-obvious-mv.jpg'],['rec28ldfRTrCHR','https://www.youtube.com/watch?v=PVbqyKzfAjI','saturn-mv.jpg'],['rec28ldfRTrCLV','https://www.youtube.com/watch?v=offEu12tm-0','love-afraid-mv.jpg']];
 const row=rows.find(row=>row[0]===work.id&&row[1]===work.url);
 const exactStage=work.id==='rec28ldfRTrPen'&&work.stage?.url==='https://www.youtube.com/watch?v=eucm0SOw4QQ'&&work.stage.videoId==='eucm0SOw4QQ'&&!work.stage.clip;
 const exactSaturnStage=work.id==='rec28ldfRTrCHR'&&work.stage?.videoId==='Xc1x-CuRjj0'&&work.stage.url==='https://www.youtube.com/watch?v=Xc1x-CuRjj0'&&!work.stage.clip;
 return {poster:row?base+row[2]:undefined,stagePoster:exactStage?base+'super-obvious-ep916-figma-render.png':exactSaturnStage?'/artist/madein/increment-20261017/saturn-the-show-250311-original.jpg':undefined,stageLabel:exactStage?'M COUNTDOWN · EP.916':exactSaturnStage?'THE SHOW · 250311':work.stage?.title};
}

// Approved public artwork is never a record or a lineup. Match persisted ID AND media URL.
function editorialDetailMedia(work:Work){
 const rows=[
 {
  "groupId": "recvxyEBDZT8Xj",
  "id": "recvxyHuKM56jK",
  "url": "https://www.youtube.com/watch?v=g36q0ZLvygQ",
  "title": "REBEL HEART",
  "date": "2025-01-13",
  "releaseId": "ive-release-ive-empathy",
  "releaseTitle": "IVE EMPATHY",
  "releaseDate": "2025-02-03",
  "poster": "/artist/ive/mv-rebel-heart.jpg",
  "releaseCover": "/artist/ive/cover-294971.webp"
 },
 {
  "groupId": "recvxyEBDZT8Xj",
  "id": "recvxyHuKMG1Mr",
  "url": "https://www.youtube.com/watch?v=07EzMbVH3QE",
  "title": "HEYA",
  "date": "2024-04-29",
  "releaseId": "ive-release-ive-switch",
  "releaseTitle": "IVE SWITCH",
  "releaseDate": "2024-04-29",
  "poster": "/artist/ive/mv-heya.jpg",
  "releaseCover": "/artist/ive/cover-268757.webp"
 },
 {
  "groupId": "recvxyEBDZT8Xj",
  "id": "recvxyHuKMLqPj",
  "url": "https://www.youtube.com/watch?v=6ZUIwj3FgUY",
  "title": "I AM",
  "date": "2023-04-10",
  "releaseId": "ive-release-ive-ive",
  "releaseTitle": "I've IVE",
  "releaseDate": "2023-04-10",
  "poster": "/artist/ive/mv-i-am.jpg",
  "releaseCover": "/artist/ive/cover-258273.webp"
 },
 {
  "groupId": "recvxyEBDZT8Xj",
  "id": "recvxyHuKMC56f",
  "url": "https://www.youtube.com/watch?v=F0B7HDiY-10",
  "title": "After LIKE",
  "date": "2022-08-22",
  "releaseId": "ive-release-after-like",
  "releaseTitle": "After LIKE",
  "releaseDate": "2022-08-22",
  "poster": "/artist/ive/mv-after-like.jpg",
  "releaseCover": "/artist/ive/cover-196802.webp"
 },
 {
  "groupId": "recvxyEBDZT8Xj",
  "id": "recvxyHuKMaCIP",
  "url": "https://www.youtube.com/watch?v=Y8JFxS1HlDo",
  "title": "LOVE DIVE",
  "date": "2022-04-05",
  "releaseId": "ive-release-love-dive",
  "releaseTitle": "LOVE DIVE",
  "releaseDate": "2022-04-05",
  "poster": "/artist/ive/mv-love-dive.jpg",
  "releaseCover": "/artist/ive/cover-156860.webp"
 },
 {
  "groupId": "rec28ldfRTiD0h",
  "id": "rec28ldfRTrQ0L",
  "url": "https://www.youtube.com/watch?v=s-KjDJFOh5s",
  "title": "THRILLER",
  "date": "2025-09-15",
  "releaseId": "badvillain-thriller",
  "releaseTitle": "THRILLER",
  "releaseDate": "2025-09-15",
  "poster": "/artist/badvillain/mv-thriller-1280.jpg",
  "releaseCover": "/artist/badvillain/cover-thriller.jpg"
 },
 {
  "groupId": "rec28ldfRTiD0h",
  "id": "rec28ldfRTrEL4",
  "url": "https://www.youtube.com/watch?v=CW2g-yu77eA",
  "title": "숨(ZOOM)",
  "date": "2024-11-19",
  "releaseId": "badvillain-zoom",
  "releaseTitle": "숨(ZOOM)",
  "releaseDate": "2024-11-19",
  "poster": "/artist/badvillain/mv-zoom-1280.jpg",
  "releaseCover": "/artist/badvillain/cover-zoom.jpg"
 },
 {
  "groupId": "rec28ldfRTiD0h",
  "id": "rec28ldfRTrEGO",
  "url": "https://www.youtube.com/watch?v=GJzq_xBSDWI",
  "title": "야호(BADTITUDE)",
  "date": "2024-06-04",
  "releaseId": "badvillain-overstep",
  "releaseTitle": "OVERSTEP",
  "releaseDate": "2024-06-03",
  "poster": "/artist/badvillain/mv-badtitude-1280.jpg",
  "releaseCover": "/artist/badvillain/cover-overstep.jpg"
 },
 {
  "groupId": "rec28ldfRTiD0h",
  "id": "rec28ldfRTrEzJ",
  "url": "https://www.youtube.com/watch?v=WpFuv7Q0VBo",
  "title": "BADVILLAIN",
  "date": "2024-06-03",
  "releaseId": "badvillain-overstep",
  "releaseTitle": "OVERSTEP",
  "releaseDate": "2024-06-03",
  "poster": "/artist/badvillain/mv-badvillain-1280.jpg",
  "releaseCover": "/artist/badvillain/cover-overstep.jpg"
 }
];
 return rows.find(row=>work.groupIds.includes(row.groupId)&&row.id===work.id&&row.url===work.url)??null;
}

/** A presentation-only score control. The record editor owns drafts and saving. */
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
 const journey=useBrowseJourney(!!data, r=>candidateExperienceStylesheet(experienceClassFor(data,r)),r=>!needsCatalogGroupViews(r,data)||groupViews.phase==='ready');const {route}=journey;const {search,group,generation,queue,stageFilter,limit,watch='all',sort='default'}=journey.filters;
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
 const home=useMemo(()=>resolveHomeRotation(data,journey.home),[data,journey.home]);
 const [homeAnnouncement,setHomeAnnouncement]=useState('');const homeShuffleCount=useRef(0);
 useEffect(()=>{if(data&&journey.home&&JSON.stringify(home.rotation)!==JSON.stringify(journey.home))journey.updateHome(home.rotation);},[data,home.rotation,journey.home,journey.updateHome]);
 // Persist the complete batch in the click, avoiding a second history write/render in the effect.
 function shuffleHome(pool:HomePool){journey.updateHome(resolveHomeRotation(data,shuffleHomePool(home.rotation,pool)).rotation);setHomeAnnouncement((pool==='photos'?'已换一组成员档案照':pool==='tonight'?'已换一批待看作品':'已换一批高分重温作品')+'，第 '+(++homeShuffleCount.current)+' 批');}
 // Keep the original queue in history while related works outside it are open.
 const activeSequence=chosenWork&&journey.sequence?.ids.includes(chosenWork.id)?journey.sequence:undefined;
 const nextWork=chosenWork&&activeSequence?nextInSequence(activeSequence,chosenWork.id,data!):null;
 function openVersion(id:string){if(!chosenWork?.versionDisplay?.links.some(link=>link.workId===id)||!data?.works.some(work=>work.id===id&&!work.placeholder))return false;return journey.navigate({nav:'works',work:id,member:null,video:'mv'},currentLabel(),undefined,journey.sequence);}
 function openWork(id:string,works:Work[]=filteredWorks,label=queueLabels[queue]??'作品库',scope=journey.filters,memberId?:string){if(route.nav==='works'&&!route.work&&!route.member&&!route.groupId){[...document.querySelectorAll<HTMLButtonElement>('.work-grid [data-browse-anchor]')].find(node=>node.dataset.browseAnchor==='work-'+id)?.focus({preventScroll:true});}const sequence=makeWatchSequence(works,label,scope,memberId);return journey.navigate({nav:'works',work:id,member:null,video:'mv'},currentLabel(),undefined,sequence.ids.includes(id)?sequence:undefined);}
 const filteredMembers=useMemo(()=>matchingMembers(memberIndex,journey.filters),[memberIndex,journey.filters]);
 function openQueue(q:string){journey.navigate({nav:'works',work:null,member:null,video:'mv'},currentLabel(),{...defaultFilters(),queue:q});}
 function filters(type:'works'|'members'|'groups'){return <div className={type==='works'?'filters library-filters':'filters'}><label className="search"><Search size={17}/><input data-library-focus={type==='works'?'search':undefined} maxLength={type==='works'?1000:undefined} value={search} onChange={e=>{setSearch(e.target.value);setLimit(24);}} placeholder={type==='works'?'搜索歌曲、团体或视频标题':type==='members'?'搜索姓名、艺名或团体':'搜索团体或公司'} aria-label="搜索"/>{search&&<button aria-label="清除搜索" onClick={e=>{setSearch('');if(type==='works')e.currentTarget.parentElement?.querySelector('input')?.focus();}}><X size={14}/></button>}</label>{type!=='groups'&&<select aria-label="按团体筛选" value={group} onChange={e=>{setGroup(e.target.value);setLimit(24);}}><option value="all">所有团体</option>{data?.groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select>}<select aria-label="按代际筛选" value={generation} onChange={e=>{setGeneration(e.target.value);setLimit(24);}}><option value="all">所有代际</option>{generations.map(g=><option key={g}>{g}</option>)}</select>{type==='works'&&<select aria-label="按观看队列筛选" value={queue} onChange={e=>{setQueue(e.target.value);setLimit(24);}}><option value="all">全部作品</option><option value="high">高分团补看</option><option value="surprise">团内惊喜</option><option value="tonight">待看</option><option value="unrated">看过待评分</option><option value="rewatch">高分重温</option></select>}{type==='works'&&<select aria-label="按观看状态筛选" data-library-focus="watch" value={watch} onChange={e=>journey.updateFilters({watch:e.target.value,limit:24})}><option value="all">所有观看状态</option><option value="watched">已观看</option><option value="unwatched">未观看</option><option value="unmarked">未标记</option></select>}{type==='works'&&<select aria-label="作品排序" data-library-focus="sort" value={sort} onChange={e=>journey.updateFilters({sort:e.target.value as WorkSort,limit:24})}><option value="default">默认排序</option><option value="release-desc">发行新到旧</option><option value="release-asc">发行旧到新</option><option value="score-desc">MV 分高到低</option></select>}{(search||group!=='all'||generation!=='all'||queue!=='all'||stageFilter!=='all'||(type==='works'&&(watch!=='all'||sort!=='default')))&&<button className="filter-reset text-button" onClick={()=>journey.updateFilters(defaultFilters())}><X size={14}/>重置筛选</button>}</div>}
 const heroMembers=home.selected.photos;
 return <ImageRecoveryProvider><div className={experienceClassFor(data,route)}><header className="header"><button className="brand" onClick={()=>setNav('home')}>stage<span>.</span><small>私 人 女 团 手 帐</small></button><nav aria-label="主导航">{navs.map(([key,label])=><button key={key} className={route.nav===key?'active':''} onClick={()=>setNav(key)}>{label}</button>)}</nav><span className="private-pill"><LockKeyhole size={12}/>公开可读，只有本人可编辑</span></header><main>
 {data&&!journey.styleReady&&<div role="status" data-style-status><p>{journey.stylePhase==='error'?'页面样式加载失败，输入仍保留。':'正在加载页面样式…'}</p>{journey.stylePhase==='error'&&<button className="button" onClick={journey.retryStyles}>重试样式</button>}<button className="button" onClick={goBack}>返回</button></div>}
 <div data-browse-content inert={!!data&&!journey.styleReady} style={data&&!journey.styleReady?{visibility:'hidden'}:undefined}>
 {loading&&!data?<div className="loading-screen"><span className="brand">stage.</span><LoaderCircle size={24} className="spin"/><p>正在打开你的私人放映室…</p></div>:error&&!data?<div className="empty large"><h2>暂时没能打开手帐</h2><p>{error}</p><button className="button primary" onClick={()=>load()}>重新载入</button><a href="/signin-with-chatgpt?return_to=/" target="_top">使用 ChatGPT 登录</a></div>:data&&<>
 <div className="source-status"><span>{data.mode==='snapshot'?'暂时只能浏览，评分保存暂不可用':refreshing?'正在更新内容，先看看已有收藏…':''}</span><button onClick={()=>load(true)} disabled={refreshing}><RefreshCw size={13} className={refreshing?'spin':''}/>{refreshing?'更新中':'更新内容'}</button></div>{error&&<div className="alert" role="alert">{error} 仍可浏览已有内容。</div>}

 {chosenWork?.placeholder?<PlaceholderDetail work={chosenWork} data={data} onBack={goBack}/>:chosenWork?<WorkDetail key={chosenWork.id} work={chosenWork} sequence={activeSequence} nextWork={nextWork} sequenceLabel={activeSequence?.label} sequencePosition={activeSequence?activeSequence.ids.indexOf(chosenWork.id)+1:0} sequenceTotal={activeSequence?.ids.length??0} onVersion={openVersion} onArtistNavigate={journey.leaveTo} onNext={()=>nextWork&&journey.continueWork(nextWork.id)} initialView={route.video} onViewChange={journey.setVideo} backLabel={journey.backLabel?`返回 ${journey.backLabel}`:route.artistReturn?'返回 '+artistReturnLabel(route.artistReturn):'返回作品库'} data={data} onBack={goBack} onMember={openMember} onGroup={openGroup} onSaved={()=>load(true)}/>:chosenMember?<MemberDetail key={chosenMember.id} member={chosenMember} artistReturn={route.artistReturn} onGroup={openGroup} backLabel={journey.backLabel?`返回 ${journey.backLabel}`:route.artistReturn?'返回成员主页':'返回成员档案'} data={data} onBack={goBack} onWork={id=>openWork(id,libraryWorks.filter(w=>data.ratings.some(r=>r.workIds.includes(w.id)&&r.memberIds.includes(chosenMember.id))),`${memberDisplayName(chosenMember)}的作品`,defaultFilters(),chosenMember.id)} onSaved={()=>load(true)}/>:chosenGroup?GroupDetail?<GroupDetail key={chosenGroup.id} group={chosenGroup} data={data} filters={journey.groupFilters} onFilters={journey.updateGroupFilters} onBack={goBack} backLabel={journey.backLabel?`返回 ${journey.backLabel}`:'返回团体索引'} onMember={id=>openMember(id,{nav:'members',member:id,work:null})} renderPhoto={m=><PhotoView photo={m.photo} label={memberDisplayName(m)} live={data.mode==='live'}/>} renderWork={(w,list,q)=><WorkCard key={w.id} work={w} data={data} onOpen={()=>openWork(w.id,list,chosenGroup.name+' · '+(queueLabels[q]??'全部作品'),{...journey.groupFilters,queue:q,group:chosenGroup.id})}/>} onWork={(w,list,q)=>openWork(w.id,list,chosenGroup.name+' · '+(queueLabels[q]??'全部作品'),{...defaultFilters(),queue:q,group:chosenGroup.id})} noteEditor={<Editor table="groups" id={chosenGroup.id} mode={data.mode} publicCatalog={data} onSaved={()=>load(true)}/>}/>:groupViewsFallback():route.work||route.member||route.groupId?<div className="empty"><h2>暂时找不到这项内容</h2><p>请更新内容后再试。</p><button className="button" onClick={()=>navigate({work:null,member:null,groupId:null})}>返回手帐</button></div>:route.nav==='home'?<>
 <section className="hero"><div className="hero-copy"><div className="eyebrow">THE WATCH JOURNAL / VOL. 01</div><h1>每次心动，<br/>都有迹可循<span>。</span></h1><p>看喜欢的 MV，记住心动的面孔。<br/>把当下的喜欢，留给下次回看。</p><div className="hero-actions"><button className="button primary" onClick={()=>openQueue('tonight')}><Play size={16} fill="currentColor"/>今晚看什么</button><button className="text-button" onClick={()=>setNav('works')}>打开作品库<ArrowUpRight size={17}/></button></div><div className="hero-stats"><div><strong>{libraryWorks.length}</strong><span>支作品</span></div><div><strong>{data.counts.members}</strong><span>位成员</span></div><div><strong>{data.counts.ratedWorks}</strong><span>支已评分作品</span></div></div></div><div className="hero-images">{heroMembers.map((m,i)=><button key={m.id} className={'hero-portrait hero-portrait-'+i} onClick={()=>openMember(m.id,{member:m.id,nav:'members'})}><PhotoView photo={m.photo} label={memberDisplayName(m)} live={data.mode==='live'} priority={i===0}/><div className="portrait-caption"><span><span className="member-display-name">{memberDisplayName(m)}</span></span><small>{names(data,m.groupIds)}</small></div></button>)}<div className="editorial-note">A LITTLE MORE THAN<br/>JUST A PLAYLIST.</div>{!heroMembers.length&&<div className="photo-empty"><ImageIcon size={28}/><span>暂时没有成员照片</span></div>}</div><div className="home-photo-controls"><span>换张面孔，认识更多成员。</span><button className="button small" aria-label="换一组成员档案照" disabled={home.pools.photos.length<2} onClick={()=>shuffleHome('photos')}><RefreshCw size={14}/>换组照片</button></div></section><span className="sr-only" role="status" aria-live="polite">{homeAnnouncement}</span>
 <section className="queue-section"><div className="section-heading"><div><span className="eyebrow">PICK YOUR MOOD</span><h2>今天，想怎么看？</h2></div><span className="quiet">从你的喜欢出发</span></div><div className="queue-grid">{[['tonight','01','待看','挑一支还没看过的 MV。'],['unrated','02','看过待评分','看过了，给这支 MV 留个分数。'],['rewatch','03','高分重温','再看一次那些让你心动的作品。']].map(([q,no,title,sub])=><button key={q} className={'queue-card queue-'+q} onClick={()=>openQueue(q)}><span className="queue-no">{no} /</span><div><h3>{title}</h3><p>{sub}</p></div><strong>{libraryWorks.filter(w=>inQueue(w,q)).length}<ArrowUpRight size={23}/></strong></button>)}</div></section>
 {(['tonight','rewatch'] as const).map(q=><section className="section home-picks" key={q}><div className="section-heading"><div><span className="eyebrow">{q==='tonight'?'SOMETHING NEW':'WORTH ANOTHER WATCH'}</span><h2><span className="home-long-title">{q==='tonight'?'还没看过，换点新鲜':'再看一次，还是会喜欢'}</span><span className="home-short-title">{q==='tonight'?'还没看过':'高分重温'}</span></h2></div><button className="button small" aria-label={q==='tonight'?'换一批待看作品':'换一批高分重温作品'} disabled={home.pools[q].length<=home.selected[q].length} onClick={()=>shuffleHome(q)}><RefreshCw size={14}/>换一批</button></div><p className="subtle">{q==='tonight'?'从待看作品里轮换，顺便认识不同团体。':'从你评过高分的作品里，换一批重温。'}</p>{home.selected[q].length?<div className="work-grid">{home.selected[q].map(w=><WorkCard key={w.id} work={w} data={data} onOpen={()=>openWork(w.id,home.selected[q],queueLabels[q],{...defaultFilters(),queue:q})}/>)}</div>:<div className="empty"><h3>{q==='tonight'?'这里暂时没有待看的 MV':'还没有高分重温作品'}</h3><p>{q==='tonight'?'去作品库看看，也许想重温熟悉的歌。':'给喜欢的作品留个分数，下次就能在这里回看。'}</p></div>}<div className="home-picks-footer"><small>{home.pools[q].length>0&&home.pools[q].length<=home.selected[q].length?'暂时就这些，慢慢看':''}</small><button className="text-button" onClick={()=>openQueue(q)}>{q==='tonight'?'全部待看':'全部高分重温'}<ArrowUpRight size={16}/></button></div></section>)}
 </>:route.nav==='records'?<section aria-label="搜我的记录">
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
 </section>:route.nav==='works'?<><PageTitle overline="THE COLLECTION" title="你的作品库" text="听过、看过、喜欢过，都在这里。" count={libraryWorks.length}/><LibraryBrowser catalog={data} filters={journey.filters} onFiltersChange={journey.updateFilters} page={libraryPage} pageSize={libraryPageSize} onPageChange={journey.setLibraryPage} restoreTarget={journey.libraryRestoreTarget} restoreReady={journey.styleReady} onRestoreReady={journey.libraryRestoreMounted} readOnly={data.mode==='snapshot'} renderWork={(w,onOpen)=><WorkCard key={w.id} work={w} data={data} onOpen={onOpen}/>} onOpenWork={(id,sequence)=>journey.navigate({nav:'works',work:id,member:null,video:'mv'},currentLabel(),undefined,sequence.ids.includes(id)?sequence:undefined)}/></>:route.nav==='members'?<><PageTitle overline="THE PEOPLE YOU REMEMBER" title="记住她的名字" text="找到喜欢的成员，回看她们的作品。" count={data.members.length}/>{filters('members')}<div className="result-line">{filteredMembers.length} 位成员</div><div className="member-grid">{filteredMembers.slice(0,limit).map(m=><button data-browse-anchor={"member-"+m.id} className="member-tile" key={m.id} onClick={()=>openMember(m.id)}><PhotoView photo={m.photo} label={m.name} live={data.mode==='live'}/><small>{names(data,m.groupIds)}</small><h3><span className="member-display-name">{memberDisplayName(m)}</span></h3>{m.favorite!==null&&<span className="member-score"><Heart size={12}/> {m.favorite.toFixed(1)}</span>}</button>)}</div><More count={filteredMembers.length} limit={limit} onMore={()=>setLimit(limit+24)}/></>:route.nav==='groups'?<><PageTitle overline="FIND YOUR FAVORITES" title="团体索引" text="先认识一个团体，再从一支作品开始。" count={data.groups.length}/>{GroupIndex?<GroupIndex data={data} filters={journey.filters} onFilters={journey.updateFilters} onOpen={openGroup} renderPhoto={m=><PhotoView photo={m.photo} label={memberDisplayName(m)} live={data.mode==='live'}/>}/>:groupViewsFallback()}</>:<PersonalInsights catalog={data} memberLabel={memberDisplayName} isStageScoreEligible={work=>stageHasValidBinding(work.stage)} viewState={journey.insights} onViewStateChange={journey.updateInsights} onGroup={openGroup} onMember={openMember} onWork={(id,intent)=>journey.navigate({nav:'works',work:id,member:null,video:intent?.video??'mv'},currentLabel())}/>}
 <ImageRecoveryControls/>
 <footer><span className="footer-brand">stage.</span><p>我的观看，我的偏好。</p><div>{canEdit&&<><a className="text-button" href="/api/export"><Download size={15}/>导出我的收藏</a><small>包含评分与备注，不含图片文件</small></>}{canEdit&&canManage&&<a className="text-button" href="/manage" onClick={e=>{if(document.querySelector('[data-navigation-blocked="true"]')){e.preventDefault();window.alert('本次保存还未确认，请先核对保存结果。');}}}>管理资料与备份<ChevronRight size={15}/></a>}</div></footer>
 </>}
 </div></main></div></ImageRecoveryProvider>;
}
function PlaceholderDetail({onBack}:{work:Work;data:Catalog;onBack:()=>void}){return <section className="empty"><h2>这项内容还没有歌曲</h2><p>先到作品库看看其他作品吧。</p><button className="button" onClick={onBack}>返回作品库</button></section>}
const platformLabel={x:'X',youtube:'YouTube',bilibili:'bilibili',naver:'NAVER TV',weverse:'Weverse',official_site:'官方网站'};
function StageSupplements({work}:{work:Work}){
 const supplement=work.stageSupplement;
 if(!supplement||(!supplement.alternatives.length&&!supplement.watchLeads?.length))return null;
 return <section id="other-performances" className="stage-supplements" aria-label="其他观看选择">
  {!!supplement.alternatives.length&&<><h2>其他现场</h2><p className="subtle">挑一支继续看。以下视频仅供观看，不用于本条舞台评分。</p><div className="alternative-grid">{supplement.alternatives.map(a=><article className="alternative-card" key={a.id}>
   <div className="alternative-source-class">{performanceLabel(a)} · {performerLabel(a.performerScope)}{a.completeness==='excerpt'?' · 短版表演':''}</div>
   <h3>{a.title}</h3>
   {!!a.performerNames?.length&&a.performerScope!=='full_group'&&<p className="alternative-performers">{a.performerNames.join(' / ')}</p>}
   {alternativeViewingNote(work,a)&&<p className="alternative-differences">{alternativeViewingNote(work,a)}</p>}
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
 </section>;
}
function PageTitle({overline,title,text,count}:{overline:string;title:string;text:string;count:number}){return <section className="page-title"><span className="eyebrow">{overline}</span><h1>{title}<sup>{count}</sup></h1><p>{text}</p></section>}
function More({count,limit,onMore}:{count:number;limit:number;onMore:()=>void}){return count===0?<div className="empty"><Search size={25}/><h3>还没有符合条件的记录</h3><p>试试别的名称或筛选条件。</p></div>:count>limit?<div className="more"><button className="button" onClick={onMore}>再看 24 条<ChevronRight size={16}/></button><small>已显示 {Math.min(limit,count)} / {count}</small></div>:null;}
function CaptionHelp(){return <details className="caption-help"><summary>字幕与中文翻译</summary><p>字幕可选语言由视频提供，播放后可在设置中切换。</p><ol><li>点击视频内的齿轮 → 字幕。</li><li>优先选择中文；若只有韩语或英语，选择“自动翻译 → 中文（简体）”。</li><li>若嵌入菜单没有此选项，可打开上方 YouTube 原视频尝试。</li></ol><p>没有可用字幕时，自动翻译也无法生成歌词。机器翻译仅供理解，可能不准确。</p><p>若翻译插件提示会员过期，可先暂停该插件，再按上方步骤使用 YouTube 字幕。</p><a href="https://support.google.com/youtube/answer/100078?hl=zh-Hans" target="_blank" rel="noopener noreferrer">YouTube 字幕帮助 ↗</a></details>;}
// Exact production identity: design-only media must never become a score target.
function newjeansDetailMedia(work:Work){
 if(!work.groupIds.includes('recvxyEBDZ9qVl')||work.id!=='recvxyOz5X2J0A'||work.url!=='https://www.youtube.com/watch?v=js1CtxSY38I')return null;
 return {poster:'/artist/newjeans/figma-display/media-recvxyOz5X2J0A-ff053d6f57.jpg',logo:'/artist/newjeans/figma-display/logo-bd89885c18.png',releaseCover:'/artist/newjeans/figma-display/cover-newjeans-release-new-jeans-5756cdf71b.jpg',date:'2022-07-22',related:[
  {title:'Supernatural (Part.2)',url:'https://www.youtube.com/watch?v=A4S8zl50AdM',poster:'/artist/newjeans/figma-display/media-recvxyOz5X4MBp-944910a6e5.jpg',date:'2024-07-05'},
  {title:'Supernatural (Part.1)',url:'https://www.youtube.com/watch?v=ZncbtRo7RXs',poster:'/artist/newjeans/figma-display/media-recvxyOz5XVlTp-2b36936527.jpg',date:'2024-06-21'}]};
}
// The Chase checkpoint is joined to an existing production work, never a design row.
function hearts2heartsDetailMedia(work:Work){
 if(!work.groupIds.includes('rec28ldfRTiBAq')||work.id!=='rec28ldfRTrzDX'||work.url!=='https://www.youtube.com/watch?v=kxUA2wwYiME')return null;
 return {designStage:work.stage?.videoId==='GtPPT-qSXj8'&&work.stage.url==='https://www.youtube.com/watch?v=GtPPT-qSXj8'&&!work.stage.clip};
}
// Exact existing work identity; never promote a design record into a score target.
function billlieDetailMedia(work:Work){
 if(!work.groupIds.includes('recvxyEBDZPXW9')||work.id!=='recvxyH5pzBi6D'||work.url!=='https://www.youtube.com/watch?v=9c2JruM56fM')return null;
 return {poster:'/artist/billlie/display/billlie-recvxyH5pzBi6D-mv-9c2JruM56fM.jpg',stagePoster:'/artist/billlie/display/billlie-recvxyH5pzBi6D-stage-wBMRRQKEweU.jpg',designStage:work.stage?.videoId==='wBMRRQKEweU'&&work.stage.url==='https://www.youtube.com/watch?v=wBMRRQKEweU'&&!work.stage.clip};
}
// Verified against the production inventory and score binding, never a research-only ID.
function meovvDetailMedia(work:Work){
 if(!work.groupIds.includes('rec28ldfRTiC6k')||work.id!=='rec28ldfRTrB45'||work.url!=='https://www.youtube.com/watch?v=jpLHg-AsQV0')return null;
 return {stagePoster:'/artist/meovv/figma-20261017/meow-npop-figma-render.png',poster:'/artist/meovv/figma-20261017/meow-mv-spotify.jpg',logo:'/artist/meovv/figma-20261017/meovv-logo-white.png',npop:work.stage?.videoId==='118STdpg-fY'&&work.stage.url==='https://www.youtube.com/watch?v=118STdpg-fY'&&!work.stage.clip};
}
// Presentation metadata is joined only to the exact existing public work identity.
function idleDetailMedia(work:Work){
 if(!work.groupIds.includes('recvxyEBDZqkpg')||work.id!=='recvxyOz5XuYef'||work.url!=='https://www.youtube.com/watch?v=Jh4QFaPmdss')return null;
 return {poster:'/artist/idle/display/media-recvxyOz5XuYef--media-recvxyOz5XuYef.jpg',releaseCover:'/artist/idle/display/cover-idle-release-cube-498--cover-cube-498.jpg',stagePoster:'/artist/idle/display/media-idle-stage-kbs-music-bank-20220318-tomboy--media-idle-stage-kbs-music-bank-20220318-tomboy.jpg',musicBank:!!work.stage&&work.stage.videoId==='hWaTFNFnttU'&&work.stage.url==='https://www.youtube.com/watch?v=hWaTFNFnttU'&&!work.stage.clip};
}
function WorkDetail({work,data,sequence,onBack,onMember,onGroup,onSaved,onVersion,onArtistNavigate,backLabel='返回作品库',initialView='mv',onViewChange,nextWork=null,onNext,sequenceLabel,sequencePosition=0,sequenceTotal=0}:{sequence?:WatchSequence;nextWork?:Work|null;onNext?:()=>void;sequenceLabel?:string;sequencePosition?:number;sequenceTotal?:number;work:Work;data:Catalog;onArtistNavigate?:(url:string)=>void;onVersion:(id:string)=>void;onBack:()=>void;onMember:(id:string)=>void;onGroup?:(id:string)=>void;onSaved:()=>void;backLabel?:string;initialView?:'mv'|'stage';onViewChange?:(view:'mv'|'stage')=>void}){
 const canEdit=useCanEdit();
 const h2hMedia=hearts2heartsDetailMedia(work);
 const [h2hRating,setH2hRating]=useState(false);
 const [h2hEditing,setH2hEditing]=useState(false);
 const [h2hMenu,setH2hMenu]=useState(false);
 const billlieMedia=billlieDetailMedia(work);
 const [billlieRating,setBilllieRating]=useState(false);
 const idleMedia=idleDetailMedia(work);
 const [idleRating,setIdleRating]=useState(false);
 const meovvMedia=meovvDetailMedia(work);
 const [meovvRating,setMeovvRating]=useState(false);
 const newjeansMedia=newjeansDetailMedia(work);
 const [newjeansRating,setNewjeansRating]=useState(false);
 const editorial=work.groupIds.includes('recvxyEBDZT8Xj')?'ive':work.groupIds.includes('rec28ldfRTiD0h')?'badvillain':null;
 const editorialMedia=editorialDetailMedia(work);
 const [editorialRating,setEditorialRating]=useState(false);
 const madein=work.groupIds.includes('rec28ldfRTiCzI');
 const madeinMedia=madeinDetailMedia(work);
 const [madeinRating,setMadeinRating]=useState(false);
 const [madeinMenu,setMadeinMenu]=useState(false);
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
 const people=data.ratings.filter(r=>r.workIds.includes(work.id));const memberDrafts=dirtyKeys.filter(k=>k.startsWith('ratings:'));const hasMemberDraft=memberDrafts.length>0;
 const switchView=(next:'mv'|'stage')=>{setView(next);onViewChange?.(next);};
 function jumpToCast(id:string){const card=memberCards.current[id];if(!card)return;card.focus({preventScroll:true});card.scrollIntoView({block:'center',behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}
 function jumpToMemberDraft(){const id=memberDrafts[0]?.slice('ratings:'.length);if(!id)return;if(view==='stage')switchView('mv');window.requestAnimationFrame(()=>{const card=memberCards.current[id];const button=card?.querySelector<HTMLButtonElement>('.editor-actions button:not(:disabled)');(button??card)?.scrollIntoView({block:'center',behavior:'smooth'});button?.focus({preventScroll:true});});}
 if(h2hMedia){
  const visit=(query='')=>onArtistNavigate?.('/artists/hearts2hearts'+query);
  const showRating=(next:boolean)=>{setH2hRating(next);window.requestAnimationFrame(()=>document.getElementById(next?'h2hd-rating-title':'h2hd-title')?.focus({preventScroll:true}));};
  const exactView=view==='mv'||h2hMedia.designStage;
  const mediaLabel=view==='mv'?'官方 MV':h2hMedia.designStage?'Performance Video':stage?.title||'暂无舞台视频';
  const related=data.works?.filter(w=>w.groupIds.includes('rec28ldfRTiBAq')&&w.song===work.song)??[];
  return <div className="h2h-work-detail" data-work-id={work.id} data-video-view={view} data-design-source={exactView?'the-chase':'current-source'}>
   <header className="h2hd-header"><button className="h2hd-brand" aria-label="Hearts2Hearts 首页" onClick={()=>visit()}><img src="/artist/hearts2hearts/logo.svg" alt="Hearts2Hearts"/></button><button className="button h2hd-menu" aria-expanded={h2hMenu} aria-controls="h2hd-nav" onClick={()=>setH2hMenu(!h2hMenu)}>菜单</button><nav id="h2hd-nav" className={h2hMenu?'is-open':''} aria-label="Hearts2Hearts 栏目">{[['首页',''],['成员','?section=members'],['作品','?section=records'],['影像','?section=works'],['历程','?section=updates']].map(([label,query])=><button className={'button'+(label===(h2hRating?'作品':'影像')?' active':'')} key={label} onClick={()=>visit(query)}>{label}</button>)}</nav></header>
   <div hidden={h2hRating}>
    <section className="h2hd-heading"><button className="button h2hd-back" onClick={onBack}>← {backLabel}</button><h1 id="h2hd-title" tabIndex={-1}>{work.song}</h1><div className="h2hd-tabs" role="tablist" aria-label="视频版本" onFocus={event=>{for(const tab of event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'))tab.tabIndex=tab===(event.target as EventTarget)?0:-1;}} onKeyDown={event=>{
     if(event.altKey||event.ctrlKey||event.metaKey||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
     const tabs=[...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')].filter(tab=>!tab.disabled&&!tab.hidden&&tab.getClientRects().length>0);
     const current=tabs.findIndex(tab=>tab===event.target);if(current<0||!tabs.length)return;
     const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(current+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
     event.preventDefault();tabs[next].focus();
    }}>{(['mv','stage'] as const).map(v=><button key={v} id={v+'-tab'} className="button" role="tab" aria-controls="h2hd-video-panel" aria-selected={view===v} tabIndex={view===v?0:-1} onClick={()=>switchView(v)}>{v==='mv'?'官方 MV':'表演视频'}</button>)}</div></section>
    <section className="h2hd-media" id="h2hd-video-panel" role="tabpanel" aria-labelledby={view+'-tab'}><div className="h2hd-film"><h2>{work.song}</h2><p>{view==='mv'?'Official MV':mediaLabel}</p>{activeUrl&&<a className="button primary" href={activeUrl} target="_blank" rel="noopener noreferrer">在 YouTube 观看 ↗</a>}</div>{activeUrl&&<details className="h2hd-player"><summary>在本页播放{view==='mv'?' MV':'表演视频'}</summary><div className="video-stage"><WorkVideoPlayer workId={work.id} view={view} url={activeUrl} videoId={vid} embedUrl={view==='stage'&&stage?stageEmbedUrl(stage):vid?youtubeEmbedUrl(vid):null} title={title}/></div><CaptionHelp/></details>}<h2>{mediaLabel}</h2><p>{[view==='mv'?work.channel:stage?.channel,view==='mv'?work.releaseDate:stage?.publishedDate].filter(Boolean).join(' · ')}</p>{view==='stage'&&stage?.clip&&<p>当前片段：{formatStageTime(stage.clip.startSeconds)}–{formatStageTime(stage.clip.endSeconds)}。打开原视频后需自行在终点停止。</p>}<button className="button primary h2hd-rate" onClick={()=>showRating(true)}>{view==='mv'?'为这部作品评分 →':'为本场舞台评分 →'}</button></section>
    {related.length>1&&<section className="h2hd-related"><h2>同曲版本</h2>{related.map(w=><article key={w.id}><div><h3>{w.id===work.id?'官方 MV':w.version||w.videoType||w.name}</h3><p>{w.releaseDate}</p></div><button className="button" onClick={()=>w.id===work.id?switchView('mv'):onVersion(w.id)}>观看 ↗</button></article>)}</section>}
   </div>
   <section className="h2hd-rating" hidden={!h2hRating} aria-label="作品评分"><div className="h2hd-rating-subject"><button className="button h2hd-back" onClick={()=>showRating(false)}>← {work.song}</button><p className="h2hd-kicker">YOUR SCORE</p><h1 id="h2hd-rating-title" tabIndex={-1}>留下你的感受<span aria-hidden="true">♥</span></h1><h2>{work.song}</h2><p>{view==='mv'?'MV 评分与备注':'当前舞台评分与备注'}</p></div>
    <div className="h2hd-entry" hidden={h2hEditing}><h2>这一次，你会给几分？</h2><p>0–10 分 · 可精确到 0.1</p><p>评分与备注，都可以留空。</p><button className="button primary" onClick={()=>setH2hEditing(true)}>{canEdit?'开始评分 →':'查看记录 →'}</button></div>
    <div className="h2hd-rating-fields" hidden={!h2hEditing}><p>已保存：{score(view==='mv'?work.score:work.stageScore)}</p><Editor key={work.id} editorial table="works" id={work.id} mode={data.mode} publicCatalog={data} onSaved={onSaved} workView={view} stageVideoId={stageBound?stage?.videoId:null} sourceKey={stageBound?stageSourceKey(stage):null} onDirtyChange={markDirty} onNavigationBlockedChange={markNavigationBlocked} saveButtonRef={workSaveButton} onSaveAvailabilityChange={setWorkSaveEnabled}/><p className="h2hd-draft-help">返回作品保留未保存输入。MV 与舞台分别评分。</p></div>
   </section>
   {people.length>0&&<section className="h2hd-cast" hidden={view==='stage'||h2hRating}><h2>本支 MV 成员</h2><div className="cast-grid">{people.map(r=>{const m=data.members.find(m=>r.memberIds.includes(m.id));return <article key={r.id} id={'mv-cast-'+r.id} tabIndex={-1} ref={node=>{memberCards.current[r.id]=node;}}><PhotoView referencePhoto={r.referencePhoto} photo={r.photo??m?.photo??null} label={m?memberDisplayName(m):r.name} live={data.mode==='live'} kind={r.photo?'本 MV 认人图':'成员资料照'}/><button className="member-name" disabled={!m} onClick={()=>m&&onMember(m.id)}>{m?memberDisplayName(m):r.name}</button>{castWarning(r.verification)&&<small className="cast-verification">{castWarning(r.verification)}</small>}<p>表现 {score(r.score)} · 造型 {score(r.stylingScore)}</p>{r.memory&&<p>{r.memory}</p>}{r.note&&<p>{r.note}</p>}<Editor editorial compact table="ratings" id={r.id} mode={data.mode} publicCatalog={data} onSaved={onSaved} onDirtyChange={markDirty} onNavigationBlockedChange={markNavigationBlocked}/></article>;})}</div></section>}
   {view==='stage'&&!h2hRating&&<StageSupplements work={work}/>}
   {dirtyKeys.length>0&&<div className="h2hd-drafts"><p role="status">有 {dirtyKeys.length} 条未保存修改，切换不会自动保存</p>{hasMemberDraft&&<button className="button member-draft-link" onClick={()=>{showRating(false);jumpToMemberDraft();}}>去保存成员评分（{memberDrafts.length}）<ArrowUpRight size={15}/></button>}</div>}
   {sequence&&<SequencePreview sequence={sequence} currentId={work.id} catalog={data} onNext={onNext} nextDisabled={navigationBlockedKeys.length>0}/>}
   <footer className="h2hd-footer"><h2>Hearts2Hearts</h2><p>SM Entertainment · 2025.02.24 出道</p></footer>
  </div>;
 }
 if(billlieMedia){
  const visit=(query='')=>onArtistNavigate?.('/artists/billlie'+query);
  const showRating=(next:boolean)=>{setBilllieRating(next);window.requestAnimationFrame(()=>document.getElementById(next?'billlie-rating-title':'billlie-detail-title')?.focus({preventScroll:true}));};
  const poster=view==='mv'?billlieMedia.poster:billlieMedia.designStage?billlieMedia.stagePoster:undefined;
  const source=view==='mv'?work.channel:stage?.channel;
  return <div className={'billlie-work-detail'+(billlieRating?' is-rating':'')} data-work-id={work.id} data-video-view={view}>
   <header className="bld-header"><button className="bld-brand" aria-label="Billlie 首页" onClick={()=>visit()}>Billlie</button><nav aria-label="Billlie 栏目">{[['首页',''],['成员','?section=members'],['作品','?section=works'],['大事','?section=updates']].map(([label,query])=><button className="button" key={label} onClick={()=>visit(query)}>{label}</button>)}</nav></header>
   <div hidden={billlieRating}>
    <section className="bld-heading"><p className="bld-kicker">{view==='mv'?'MUSIC VIDEO':'LIVE PERFORMANCE'}</p><h1 id="billlie-detail-title" tabIndex={-1}>{work.song}</h1><p>{view==='mv'?work.version:stage?.kind||'暂无舞台视频'}</p></section>
    <section className="bld-film"><div className="video-stage">{activeUrl?<WorkVideoPlayer posterSrc={poster} workId={work.id} view={view} url={activeUrl} videoId={vid} embedUrl={view==='stage'&&stage?stageEmbedUrl(stage):vid?youtubeEmbedUrl(vid):null} title={title}/>:<p>暂无舞台视频</p>}</div>{activeUrl&&<a className="button primary bld-watch" href={activeUrl} target="_blank" rel="noopener noreferrer">前往官方 YouTube 观看 ↗</a>}</section>
    <section className="bld-info">{view==='stage'&&!billlieMedia.designStage&&stage&&<p>{stage.title}</p>}{source&&<p>发布频道 {source}</p>}{(view==='mv'?work.releaseDate:stage?.publishedDate)&&<p>{view==='mv'?'作品日期':'舞台公开日期'} {view==='mv'?work.releaseDate:stage?.publishedDate}</p>}{view==='stage'&&stage?.clip&&<p>当前片段：{formatStageTime(stage.clip.startSeconds)}–{formatStageTime(stage.clip.endSeconds)}。打开原视频后需自行在终点停止。</p>}<button className="button primary" onClick={()=>showRating(true)}>{view==='mv'?'为 MV 评分':'为本场舞台评分'}</button><button id={view==='mv'?'stage-tab':'mv-tab'} className="button" onClick={()=>switchView(view==='mv'?'stage':'mv')}>{view==='mv'?'查看舞台与现场':'查看音乐影像'}</button><button className="button" onClick={onBack}>{backLabel}</button></section>
   </div>
   <section className="bld-rating" hidden={!billlieRating} aria-label="作品评分">
    <div className="bld-rating-subject"><h1 id="billlie-rating-title" tabIndex={-1}>评分</h1><p className="bld-kicker">{view==='mv'?'MV 评分':'当前舞台评分'}</p><div className="bld-subject-row">{poster&&<img src={poster} width="360" height="270" alt={work.song+(view==='mv'?' MV 封面':' 当前舞台封面')}/>}<div><h2>{work.song}</h2><p>{view==='mv'?'MV':stage?.title||'暂无舞台视频'}</p></div></div></div>
    <div className="bld-rating-fields"><p className="bld-saved-score">已保存：{score(view==='mv'?work.score:work.stageScore)}</p><Editor key={work.id} editorial table="works" id={work.id} mode={data.mode} publicCatalog={data} onSaved={onSaved} workView={view} stageVideoId={stageBound?stage?.videoId:null} sourceKey={stageBound?stageSourceKey(stage):null} onDirtyChange={markDirty} onNavigationBlockedChange={markNavigationBlocked} saveButtonRef={workSaveButton} onSaveAvailabilityChange={setWorkSaveEnabled}/><button className="button" onClick={()=>showRating(false)}>返回作品</button><p className="bld-draft-help">返回作品保留未保存输入。MV 与舞台分别评分。</p></div>
   </section>
   {people.length>0&&<section className="bld-cast" hidden={view==='stage'||billlieRating}><h2>本支 MV 成员</h2><div className="cast-grid">{people.map(r=>{const m=data.members.find(m=>r.memberIds.includes(m.id));return <article key={r.id} id={'mv-cast-'+r.id} tabIndex={-1} ref={node=>{memberCards.current[r.id]=node;}}><PhotoView referencePhoto={r.referencePhoto} photo={r.photo??m?.photo??null} label={m?memberDisplayName(m):r.name} live={data.mode==='live'} kind={r.photo?'本 MV 认人图':'成员资料照'}/><button className="member-name" disabled={!m} onClick={()=>m&&onMember(m.id)}>{m?memberDisplayName(m):r.name}</button>{castWarning(r.verification)&&<small className="cast-verification">{castWarning(r.verification)}</small>}<p>表现 {score(r.score)} · 造型 {score(r.stylingScore)}</p>{r.memory&&<p>{r.memory}</p>}{r.note&&<p>{r.note}</p>}<Editor editorial compact table="ratings" id={r.id} mode={data.mode} publicCatalog={data} onSaved={onSaved} onDirtyChange={markDirty} onNavigationBlockedChange={markNavigationBlocked}/></article>;})}</div></section>}
   {view==='stage'&&!billlieRating&&<StageSupplements work={work}/>}
   {dirtyKeys.length>0&&<div className="bld-draft-help"><p role="status">有 {dirtyKeys.length} 条未保存修改，切换不会自动保存</p>{hasMemberDraft&&<button className="button member-draft-link" onClick={()=>{showRating(false);jumpToMemberDraft();}}>去保存成员评分（{memberDrafts.length}）<ArrowUpRight size={15}/></button>}</div>}
   {sequence&&<SequencePreview sequence={sequence} currentId={work.id} catalog={data} onNext={onNext} nextDisabled={navigationBlockedKeys.length>0}/>}
   <footer className="bld-footer"><h2>Billlie</h2><p>成员 / 作品 / 时间轴</p></footer>
  </div>;
 }
 if(idleMedia){
  const visit=(query='')=>onArtistNavigate?.('/artists/idle'+query);
  const showRating=(next:boolean)=>{setIdleRating(next);window.requestAnimationFrame(()=>document.getElementById(next?'idle-rating-title':'idle-detail-title')?.focus({preventScroll:true}));};
  const poster=view==='mv'?idleMedia.poster:idleMedia.musicBank?idleMedia.stagePoster:undefined;
  const mediaTitle=view==='mv'?'TOMBOY':idleMedia.musicBank?'TOMBOY · Music Bank':stage?.title||'暂无舞台视频';
  const mediaDate=view==='mv'?'视频公开日 · 2022.03.14 · 韩国时间':idleMedia.musicBank?'播出日 · 2022.03.18 · 韩国时间':[stage?.publishedDate,stage?.channel].filter(Boolean).join(' · ');
  return <div className={'idle-work-detail'+(idleRating?' is-rating':'')} data-work-id={work.id} data-video-view={view}>
   <header className="idd-header"><div className="idd-brand-row"><button className="idd-brand" aria-label="i-dle 首页" onClick={()=>visit()}>i-dle</button><button className="button idd-back" onClick={()=>idleRating?showRating(false):onBack()}>返回</button></div><nav hidden={idleRating} aria-label="i-dle 栏目">{[['首页',''],['成员','?section=members'],['作品','?section=works'],['时间轴','?section=updates']].map(([label,query])=><button key={label} aria-current={label==='作品'?'page':undefined} onClick={()=>visit(query)}>{label}</button>)}</nav></header>
   <div hidden={idleRating}>
    {activeUrl?<div className="video-stage idd-film"><WorkVideoPlayer posterSrc={poster} workId={work.id} view={view} url={activeUrl} videoId={vid} embedUrl={view==='stage'&&stage?stageEmbedUrl(stage):vid?youtubeEmbedUrl(vid):null} title={mediaTitle}/></div>:<p className="idd-content">暂无舞台视频</p>}
    <div className="idd-content">
     <p className="idd-kicker">{view==='mv'?'MV / MUSIC VIDEO':'舞台 / LIVE STAGE'}</p><h1 id="idle-detail-title" tabIndex={-1}>{mediaTitle}</h1><p className="idd-artist">(G)I-DLE</p><p className="idd-date">{mediaDate}</p>
     {activeUrl&&<a className="button primary idd-action" href={activeUrl} target="_blank" rel="noopener noreferrer">前往官方视频 ↗</a>}<button className="button idd-action" onClick={()=>showRating(true)}>作品评分</button>
     {view==='stage'&&stage?.clip&&<p className="idd-date">当前片段：{formatStageTime(stage.clip.startSeconds)}–{formatStageTime(stage.clip.endSeconds)}。打开原视频后需自行在终点停止。</p>}
     <section className="idd-release"><p className="idd-section-kicker">RELEASE</p><h2>所属发行</h2><span className="idd-short-rule"/><article><button className="idd-cover" aria-label="I NEVER DIE 发行详情" onClick={()=>visit('?section=records&release=idle-release-cube-498')}><img src={idleMedia.releaseCover} width="400" height="400" alt="I NEVER DIE 发行封面"/></button><h3>I NEVER DIE</h3><p>(G)I-DLE</p><p>2022.03.14 · Studio Album</p><button className="button" onClick={()=>visit('?section=records&release=idle-release-cube-498')}>发行详情</button></article></section>
     <button className="button idd-action" onClick={onBack}>返回作品库</button>
    </div>
   </div>
   <section className="idd-rating" hidden={!idleRating} aria-label="作品评分"><h1 id="idle-rating-title" tabIndex={-1}>作品评分</h1><p className="idd-date">MV 与舞台分别评分。</p><div className="idd-rating-grid"><div className="idd-rating-context">{poster?<img src={poster} width="1280" height="720" alt={mediaTitle+' 视频封面'}/>:activeUrl?<div className="video-stage"><WorkVideoPlayer workId={work.id} view={view} url={activeUrl} videoId={vid} embedUrl={view==='stage'&&stage?stageEmbedUrl(stage):vid?youtubeEmbedUrl(vid):null} title={mediaTitle}/></div>:null}<p className="idd-kicker">{view==='mv'?'MV / MUSIC VIDEO':'舞台 / LIVE STAGE'}</p><h2>{mediaTitle}</h2></div><div className="idd-rating-fields"><p className="idd-artist">已保存：{score(view==='mv'?work.score:work.stageScore)}</p>
    <Editor key={work.id} editorial table="works" id={work.id} mode={data.mode} publicCatalog={data} onSaved={onSaved} workView={view} stageVideoId={stageBound?stage?.videoId:null} sourceKey={stageBound?stageSourceKey(stage):null} onDirtyChange={markDirty} onNavigationBlockedChange={markNavigationBlocked} saveButtonRef={workSaveButton} onSaveAvailabilityChange={setWorkSaveEnabled}/>
    <button className="button" onClick={()=>showRating(false)}>返回本作品</button></div></div><p className="idd-rating-help">返回详情会保留尚未保存的输入。</p></section>
   <div className="idd-records"><details><summary>MV 与当前评分舞台</summary><div className="idd-tabs"><button id="mv-tab" className="button" aria-pressed={view==='mv'} onClick={()=>switchView('mv')}>官方 MV</button><button id="stage-tab" className="button" aria-pressed={view==='stage'} onClick={()=>switchView('stage')}>当前评分舞台</button></div>{view==='stage'&&<StageSupplements work={work}/>}</details>
    {people.length>0&&<details hidden={view==='stage'}><summary>本支 MV 的成员记录</summary><div className="cast-grid">{people.map(r=>{const m=data.members.find(m=>r.memberIds.includes(m.id));return <article key={r.id} id={'mv-cast-'+r.id} tabIndex={-1} ref={node=>{memberCards.current[r.id]=node;}}><PhotoView referencePhoto={r.referencePhoto} photo={r.photo??m?.photo??null} label={m?memberDisplayName(m):r.name} live={data.mode==='live'} kind={r.photo?'本 MV 认人图':'成员资料照'}/><button className="member-name" disabled={!m} onClick={()=>m&&onMember(m.id)}>{m?memberDisplayName(m):r.name}</button>{castWarning(r.verification)&&<small>{castWarning(r.verification)}</small>}<p>表现 {score(r.score)} · 造型 {score(r.stylingScore)}</p>{r.memory&&<p>{r.memory}</p>}{r.note&&<p>{r.note}</p>}<Editor editorial compact table="ratings" id={r.id} mode={data.mode} publicCatalog={data} onSaved={onSaved} onDirtyChange={markDirty} onNavigationBlockedChange={markNavigationBlocked}/></article>;})}</div></details>}
    {dirtyKeys.length>0&&<div className="idd-draft-help"><p role="status">有 {dirtyKeys.length} 条未保存修改，切换不会自动保存</p>{hasMemberDraft&&<button className="button member-draft-link" onClick={()=>{showRating(false);const card=memberCards.current[memberDrafts[0]?.slice('ratings:'.length)];const details=card?.closest('details');if(details)details.open=true;jumpToMemberDraft();}}>去保存成员评分（{memberDrafts.length}）<ArrowUpRight size={15}/></button>}</div>}
   {sequence&&<SequencePreview sequence={sequence} currentId={work.id} catalog={data} onNext={onNext} nextDisabled={navigationBlockedKeys.length>0}/>}
   </div><footer className="idd-footer"><h2>i-dle</h2><a className="button" href="https://i-dle.cubeent.co.jp/profile/" target="_blank" rel="noopener noreferrer">官方网站 ↗</a></footer>
  </div>;
 }
 if(meovvMedia){
  const showRating=(next:boolean)=>{setMeovvRating(next);window.requestAnimationFrame(()=>document.getElementById(next?'meovv-rating-title':'meovv-detail-title')?.focus({preventScroll:true}));};
  const visit=(query='')=>onArtistNavigate?.('/artists/meovv'+query);
  // This is the supplied 800×450 image-layer export, not a rendered page.
  const poster=view==='mv'?meovvMedia.poster:meovvMedia.npop?meovvMedia.stagePoster:undefined;
  const source=view==='mv'?'THEBLACKLABEL · YouTube':[stage?.channel,'YouTube'].filter(Boolean).join(' · ');
  return <div className={'meovv-work-detail'+(meovvRating?' is-rating':'')+(view==='stage'?' is-stage':'')} data-work-id={work.id} data-video-view={view}>
   <header className="mvd-header"><button aria-label="MEOVV 首页" onClick={()=>visit()}><img src={meovvMedia.logo} width="120" height="30" alt="MEOVV"/></button><nav aria-label="MEOVV 栏目">{[['概览',''],['成员','?section=members'],['作品','?section=works'],['发行','?section=records']].map(([label,query])=><button key={label} onClick={()=>visit(query)}>{label}</button>)}</nav><span className="mvd-mobile-rating" hidden={!meovvRating}>评分</span></header>
   <div className="mvd-body">
    <button className="button mvd-back" hidden={meovvRating} onClick={()=>view==='stage'?switchView('mv'):onBack()}>{view==='stage'?'← 返回 MEOW MV':backLabel}</button>
    <div className="mvd-heading" hidden={meovvRating}><h1 id="meovv-detail-title" tabIndex={-1}>MEOW</h1><p>{view==='mv'?'官方MV · MEOVV':meovvMedia.npop?'NPOP LIMITED EDITION - SIDE A':stage?.title||'暂无舞台视频'}</p>{view==='stage'&&stage?.publishedDate&&<p>来源发布日期 {stage.publishedDate}</p>}</div>
    <div className="mvd-layout">
     <section className="mvd-media" aria-label={view==='mv'?'MEOW 官方 MV':'MEOW 当前舞台'}>
      <div className="mvd-rating-context" hidden={!meovvRating}><p>作品 / {view==='mv'?'官方MV':'正式舞台'}</p><h2>MEOW</h2></div>
      {activeUrl?<div className="video-stage"><WorkVideoPlayer posterSrc={poster} workId={work.id} view={view} url={activeUrl} videoId={vid} embedUrl={view==='stage'&&stage?stageEmbedUrl(stage):vid?youtubeEmbedUrl(vid):null} title={title}/></div>:<p>暂无舞台视频</p>}
      <p className="mvd-source">来源：{source}</p>
      {view==='stage'&&stage?.clip&&<p>当前片段：{formatStageTime(stage.clip.startSeconds)}–{formatStageTime(stage.clip.endSeconds)}。打开原视频后需自行在终点停止。</p>}
     </section>
     <aside className="mvd-info" hidden={meovvRating}>
      <section className="mvd-card"><h2>{view==='mv'?'作品信息':'节目资料'}</h2><p>MEOW</p><p>类型：{view==='mv'?'官方MV':meovvMedia.npop?'正式舞台':stageKindLabel(stage?.kind??'')}</p>{view==='mv'?<p>艺人：MEOVV</p>:stage?.channel&&<p>来源：{stage.channel}</p>}{view==='stage'&&meovvMedia.npop&&<p>节目：NPOP LIMITED EDITION - SIDE A</p>}</section>
      <section className="mvd-card"><h2>观看入口</h2>{activeUrl&&<a className="button" href={activeUrl} target="_blank" rel="noopener noreferrer">前往官方观看 ↗</a>}<p>来源：{source}</p></section>
      <section className="mvd-card"><h2>评分入口</h2><p className="mvd-existing-score">{score(view==='mv'?work.score:work.stageScore)}</p><button className="button" onClick={()=>showRating(true)}>评分</button></section>
      <section className="mvd-card"><h2>{view==='mv'?'同曲舞台入口':'同曲 MV'}</h2><button id={view==='mv'?'stage-tab':'mv-tab'} className="button" onClick={()=>switchView(view==='mv'?'stage':'mv')}>{view==='mv'?(meovvMedia.npop?'正式舞台 / NPOP':'当前评分舞台'):'前往 MV'}</button></section>
     </aside>
     <section className="mvd-rating" hidden={!meovvRating} aria-label="作品评分">
      <div className="mvd-rating-top"><button className="button" onClick={()=>showRating(false)}>← 返回</button><button className="button" onClick={()=>showRating(false)}>关闭</button></div><h2 id="meovv-rating-title" tabIndex={-1}>评分</h2>
      <div className="mvd-rating-identity">{poster&&<img src={poster} width="128" height="72" alt={view==='mv'?'MEOW 官方 MV 封面':'MEOW NPOP 舞台封面'}/>}<div><p>MEOW</p><p>{view==='mv'?'官方MV':meovvMedia.npop?'NPOP · 正式舞台':stage?.title||'舞台'}</p></div></div>
      <p className="mvd-saved-score">已保存：{score(view==='mv'?work.score:work.stageScore)}</p>
      <Editor key={work.id} editorial table="works" id={work.id} mode={data.mode} publicCatalog={data} onSaved={onSaved} workView={view} stageVideoId={stageBound?stage?.videoId:null} sourceKey={stageBound?stageSourceKey(stage):null} onDirtyChange={markDirty} onNavigationBlockedChange={markNavigationBlocked} saveButtonRef={workSaveButton} onSaveAvailabilityChange={setWorkSaveEnabled}/>
      <button className="button mvd-rating-return" onClick={()=>showRating(false)}>返回详情</button><p className="mvd-draft-help">返回详情保留未保存输入。MV 与舞台分别评分。</p>
     </section>
    </div>
    {people.length>0&&<section className="mvd-cast" hidden={view==='stage'}><h2>本支 MV 成员</h2><div className="cast-grid">{people.map(r=>{const m=data.members.find(m=>r.memberIds.includes(m.id));return <article key={r.id} id={'mv-cast-'+r.id} tabIndex={-1} ref={node=>{memberCards.current[r.id]=node;}}><PhotoView referencePhoto={r.referencePhoto} photo={r.photo??m?.photo??null} label={m?memberDisplayName(m):r.name} live={data.mode==='live'} kind={r.photo?'本 MV 认人图':'成员资料照'}/><button className="member-name" disabled={!m} onClick={()=>m&&onMember(m.id)}>{m?memberDisplayName(m):r.name}</button>{castWarning(r.verification)&&<small className="cast-verification">{castWarning(r.verification)}</small>}<p>表现 {score(r.score)} · 造型 {score(r.stylingScore)}</p>{r.memory&&<p>{r.memory}</p>}{r.note&&<p>{r.note}</p>}<Editor editorial compact table="ratings" id={r.id} mode={data.mode} publicCatalog={data} onSaved={onSaved} onDirtyChange={markDirty} onNavigationBlockedChange={markNavigationBlocked}/></article>;})}</div></section>}
    {view==='stage'&&!meovvRating&&<StageSupplements work={work}/>}
    {dirtyKeys.length>0&&<div className="mvd-draft-help"><p role="status">有 {dirtyKeys.length} 条未保存修改，切换不会自动保存</p>{hasMemberDraft&&<button className="button member-draft-link" onClick={()=>{showRating(false);jumpToMemberDraft();}}>去保存成员评分（{memberDrafts.length}）<ArrowUpRight size={15}/></button>}</div>}
   {sequence&&<SequencePreview sequence={sequence} currentId={work.id} catalog={data} onNext={onNext} nextDisabled={navigationBlockedKeys.length>0}/>}
   </div><footer className="mvd-footer">MEOVV</footer>
  </div>;
 }
 if(newjeansMedia){
  const showRating=(next:boolean)=>{setNewjeansRating(next);window.requestAnimationFrame(()=>document.getElementById(next?'newjeans-rating-title':'newjeans-detail-title')?.focus({preventScroll:true}));};
  const visit=(query='')=>onArtistNavigate?.('/artists/newjeans'+query);
  const poster=view==='mv'?newjeansMedia.poster:undefined;
  return <div className="newjeans-work-detail" data-work-id={work.id} data-video-view={view}>
   <header className="njd-header"><div className="njd-brand"><button aria-label="NewJeans 首页" onClick={()=>visit()}><img src={newjeansMedia.logo} width="142" height="38" alt="NewJeans"/></button><span>{newjeansRating?'作品评分':'成员 · 作品 · 影像'}</span></div><nav hidden={newjeansRating} aria-label="NewJeans 导航">{[['首页',''],['成员','?section=members'],['作品','?section=works'],['时间轴','?section=updates']].map(([label,query])=><button className="button" aria-current={label==='作品'?'page':undefined} key={label} onClick={()=>visit(query)}>{label}</button>)}</nav></header>
   <div className="njd-body">
    <div hidden={newjeansRating}>
     <button className="button njd-back" onClick={onBack}>{backLabel}</button>
     <h1 id="newjeans-detail-title" tabIndex={-1}>{view==='mv'?'Attention':stage?.title||'暂无舞台视频'}</h1><p className="njd-kind">{view==='mv'?'MV':'当前评分舞台'}</p><p className="njd-date">{view==='mv'?`影像公开日 ${newjeansMedia.date} · 韩国时间`:[stage?.publishedDate,stage?.channel].filter(Boolean).join(' · ')}</p>
     {view==='mv'?<a className="njd-poster" href={activeUrl} target="_blank" rel="noopener noreferrer" aria-label="前往 Attention 官方 MV"><img src={poster} width="1280" height="720" alt="Attention 官方 MV 封面"/></a>:activeUrl?<div className="video-stage"><WorkVideoPlayer workId={work.id} view={view} url={activeUrl} videoId={vid} embedUrl={stage?stageEmbedUrl(stage):null} title={title}/></div>:<p>暂无舞台视频</p>}
     <div className="njd-actions">{activeUrl&&<a className="button" href={activeUrl} target="_blank" rel="noopener noreferrer">前往{view==='mv'?'YouTube · HYBE LABELS':stage?.channel||'官方视频'} ↗</a>}<button className="button primary" onClick={()=>showRating(true)}>为这条{view==='mv'?'MV':'舞台'}评分</button></div><p className="njd-credit">NewJeans</p>
     {view==='stage'&&stage?.clip&&<p>当前片段：{formatStageTime(stage.clip.startSeconds)}–{formatStageTime(stage.clip.endSeconds)}。打开原视频后需自行在终点停止。</p>}
     <section className="njd-section"><h2>关联发行</h2><div className="njd-release"><img src={newjeansMedia.releaseCover} width="180" height="180" alt="New Jeans 发行封面"/><div><h3>New Jeans</h3><p>发行日 2022-08-01</p><button className="button" onClick={()=>visit('?section=works&release=newjeans-release-new-jeans')}>发行详情</button></div></div></section>
     <section className="njd-section"><h2>继续浏览</h2><p className="njd-kind njd-subtitle">Music videos</p><div className="njd-related">{newjeansMedia.related.map(item=><article key={item.url}><a href={item.url} target="_blank" rel="noopener noreferrer"><img src={item.poster} width="1280" height="720" alt={item.title+' 官方 MV 封面'}/></a><p className="njd-kind">MV</p><h3>{item.title}</h3><p>影像公开日 {item.date} · 韩国时间</p><a className="button" href={item.url} target="_blank" rel="noopener noreferrer">官方影像 ↗</a></article>)}</div></section>
    </div>
    <section className="njd-rating" hidden={!newjeansRating} aria-label="作品评分"><h1 id="newjeans-rating-title" tabIndex={-1}>作品评分</h1>{poster&&<img className="njd-rating-poster" src={poster} width="1280" height="720" alt="Attention 官方 MV 封面"/>}<h2>{view==='mv'?'MV · Attention':stage?.title||'舞台 · Attention'}</h2><p className="njd-date">{view==='mv'?`影像公开日 ${newjeansMedia.date} · 韩国时间`:stage?.publishedDate}</p>
     <div className="njd-score-panel"><p className="njd-saved-score">已保存：{score(view==='mv'?work.score:work.stageScore)}</p><Editor key={work.id} editorial table="works" id={work.id} mode={data.mode} publicCatalog={data} onSaved={onSaved} workView={view} stageVideoId={stageBound?stage?.videoId:null} sourceKey={stageBound?stageSourceKey(stage):null} onDirtyChange={markDirty} onNavigationBlockedChange={markNavigationBlocked} saveButtonRef={workSaveButton} onSaveAvailabilityChange={setWorkSaveEnabled}/><button className="button" onClick={()=>showRating(false)}>返回这条{view==='mv'?'MV':'舞台'}</button></div>
     <div hidden={view==='stage'} className="njd-member-ratings">{people.map(r=>{const m=data.members.find(m=>r.memberIds.includes(m.id));return <article key={r.id} id={'mv-cast-'+r.id} tabIndex={-1} ref={node=>{memberCards.current[r.id]=node;}}><h3>{m?memberDisplayName(m):r.name}</h3><Editor editorial compact table="ratings" id={r.id} mode={data.mode} publicCatalog={data} onSaved={onSaved} onDirtyChange={markDirty} onNavigationBlockedChange={markNavigationBlocked}/></article>;})}</div>
     <p>返回详情会保留尚未保存的输入。MV 与舞台分别评分。</p>
    </section>
    <details className="njd-existing-records"><summary>MV 与当前评分舞台</summary><div className="njd-actions"><button id="mv-tab" className="button" aria-selected={view==='mv'} onClick={()=>switchView('mv')}>官方 MV</button><button id="stage-tab" className="button" aria-selected={view==='stage'} onClick={()=>switchView('stage')}>当前评分舞台</button></div>{view==='stage'&&<StageSupplements work={work}/>}</details>
    {dirtyKeys.length>0&&<div className="njd-draft-help"><p role="status">有 {dirtyKeys.length} 条未保存修改，切换不会自动保存</p>{hasMemberDraft&&<button className="button member-draft-link" onClick={()=>{showRating(true);jumpToMemberDraft();}}>去保存成员评分（{memberDrafts.length}）<ArrowUpRight size={15}/></button>}</div>}
   {sequence&&<SequencePreview sequence={sequence} currentId={work.id} catalog={data} onNext={onNext} nextDisabled={navigationBlockedKeys.length>0}/>}
   </div><footer className="njd-footer"><h2>NewJeans</h2><p>成员 · 作品 · 影像</p><a className="button" href="https://www.newjeans.jp/" target="_blank" rel="noopener noreferrer">日本官网 ↗</a></footer>
  </div>;
 }
 if(editorial){
  const brand=editorial==='ive'?'IVE':'BADVILLAIN';
  const recognitionLooks=editorial==='ive'?people.filter(r=>r.photo?.sourceKind==='mv_look_photo'&&r.photo.table==='ratings'&&r.photo.recordId===r.id&&r.memberIds.length===1&&r.workIds.length===1&&r.workIds[0]===work.id&&data.members.some(m=>m.id===r.memberIds[0])):[];
  // Design stage photographs have different sources than production stage bindings.
  // Never present them as the currently scored performance.
  const poster=view==='mv'?editorialMedia?.poster:undefined;
  const showRating=(next:boolean)=>{setEditorialRating(next);window.requestAnimationFrame(()=>document.getElementById(next?'editorial-rating-title':'editorial-detail-title')?.focus({preventScroll:true}));};
  const related=(data.works??[]).filter(w=>w.id!==work.id&&w.groupIds.includes(work.groupIds.find(id=>id===(editorial==='ive'?'recvxyEBDZT8Xj':'rec28ldfRTiD0h'))!)&&editorialDetailMedia(w)).slice(0,2);
  return <div className={'editorial-work-detail '+editorial+'-work-detail'} data-work-id={work.id} data-video-view={view}>
   <header className="editorial-detail-header"><button className="editorial-brand" aria-label={brand+' 首页'} onClick={()=>onArtistNavigate?.('/artists/'+editorial)}>{editorial==='ive'?<img src="/artist/ive/ive-logo-header.png" width="64" height="64" alt="IVE"/>:brand}</button><nav aria-label={brand+' 栏目'}>{[['首页',''],['成员','?section=members'],['作品','?section=works'],['时间轴','?section=updates']].map(([label,query])=><button key={label} aria-current={label==='作品'?'page':undefined} onClick={()=>onArtistNavigate?.('/artists/'+editorial+query)}>{label}</button>)}</nav></header>
   <div className="editorial-detail-body">
    <button className="button editorial-back" onClick={()=>editorialRating?showRating(false):onBack()}><ArrowLeft size={16}/>{editorialRating?'返回详情':backLabel}</button>
    <div hidden={editorialRating}>
     <p className="editorial-kicker">{view==='mv'?'MUSIC VIDEO':'LIVE STAGE'}</p><h1 id="editorial-detail-title" tabIndex={-1}>{view==='mv'?editorialMedia?.title||work.song||work.name:work.song||work.name}</h1>
     <p className="editorial-date">{view==='mv'?[editorialMedia?.date||work.releaseDate,'MV 公开'].filter(Boolean).join(' · '):[stage?.publishedDate,stage?.channel].filter(Boolean).join(' · ')}</p>
     {activeUrl?<div className="video-stage editorial-video"><WorkVideoPlayer posterSrc={poster} workId={work.id} view={view} url={activeUrl} videoId={vid} embedUrl={view==='stage'&&stage?stageEmbedUrl(stage):vid?youtubeEmbedUrl(vid):null} title={title}/></div>:<p>暂无舞台视频</p>}
     <div className="editorial-actions">{activeUrl&&<a className="button primary" href={activeUrl} target="_blank" rel="noopener noreferrer">前往官方视频 ↗</a>}<button className="button" onClick={()=>showRating(true)}>为这条{view==='mv'?' MV':'舞台'}评分</button></div>
     {view==='stage'&&stage?.clip&&<p>当前片段：{formatStageTime(stage.clip.startSeconds)}–{formatStageTime(stage.clip.endSeconds)}。打开原视频后需自行在终点停止。</p>}
     <section className="editorial-about"><h2>{view==='mv'?'关于这支 MV':'本场舞台'}</h2><p>{view==='mv'?'保留音乐影像的完整画面；打开官方来源观看。':'当前生产记录绑定的舞台，与 MV 分别评分。'}</p>
      {editorialMedia&&<div className="editorial-release"><img src={editorialMedia.releaseCover} width="200" height="200" alt={editorialMedia.releaseTitle+' 发行封面'}/><div><h3>{editorialMedia.releaseTitle}</h3><p>发行 · {editorialMedia.releaseDate}</p><button className="button" onClick={()=>onArtistNavigate?.('/artists/'+editorial+'?section='+(editorial==='ive'?'works':'records')+'&release='+editorialMedia.releaseId)}>发行页</button></div></div>}
     </section>
     <div className="editorial-actions"><button id="mv-tab" className="button" aria-pressed={view==='mv'} onClick={()=>switchView('mv')}>官方 MV</button><button id="stage-tab" className="button" aria-pressed={view==='stage'} onClick={()=>switchView('stage')}>当前评分舞台</button></div>
     {view==='stage'&&<StageSupplements work={work}/>}
     {view==='mv'&&versionLinks.length>0&&<nav aria-label="作品版本与关联">{versionLinks.map(link=><button className="button" key={link.workId} disabled={navigationBlockedKeys.length>0} onClick={()=>onVersion(link.workId)}>{link.title}</button>)}</nav>}
     {recognitionLooks.length>0&&<section className="editorial-mv-recognition" hidden={view==='stage'} aria-label="本支 MV 成员造型"><h2>本支 MV 成员造型</h2><div className="editorial-mv-recognition-grid">{recognitionLooks.map(r=>{const m=data.members.find(m=>m.id===r.memberIds[0])!;return <article key={r.id}><PhotoView photo={r.photo} referencePhoto={r.referencePhoto} label={memberDisplayName(m)} live={data.mode==='live'} kind="本MV同造型照片"/><button className="member-name" onClick={()=>onMember(m.id)}>{memberDisplayName(m)}<ArrowUpRight size={15}/></button></article>;})}</div></section>}
     {related.length>0&&<section className="editorial-continue"><h2>继续观看</h2>{related.map(w=><article key={w.id}><img src={editorialDetailMedia(w)!.poster} width="1280" height="720" alt={(w.song||w.name)+' MV 封面'}/><p>MV · {w.song||w.name}</p><button className="button" disabled={navigationBlockedKeys.length>0} onClick={()=>onVersion(w.id)}>查看详情</button></article>)}</section>}
    </div>
    <section className="editorial-rating-panel" hidden={!editorialRating} aria-label="作品评分">
     <p className="editorial-kicker">A PERSONAL LISTEN</p><h1 id="editorial-rating-title" tabIndex={-1}>为这次观看<br/>留一个分数。</h1>
     {poster&&<img className="editorial-rating-poster" src={poster} width="1280" height="720" alt={(work.song||work.name)+' MV 封面'}/>}
     <p className="editorial-kicker">{view==='mv'?'音乐影像 / MUSIC VIDEO':'舞台 / LIVE STAGE'}</p><h2>{work.song||work.name}</h2><p>{brand}{view==='stage'&&stage?.channel?' · '+stage.channel:''}</p>
     <p>已保存的{view==='mv'?' MV 分数':'整体舞台分'}：{score(view==='mv'?work.score:work.stageScore)}</p>
     <Editor key={work.id} editorial table="works" id={work.id} mode={data.mode} publicCatalog={data} onSaved={onSaved} workView={view} stageVideoId={stageBound?stage?.videoId:null} sourceKey={stageBound?stageSourceKey(stage):null} onDirtyChange={markDirty} onNavigationBlockedChange={markNavigationBlocked} saveButtonRef={workSaveButton} onSaveAvailabilityChange={setWorkSaveEnabled}/>
     <div className="editorial-member-ratings" hidden={view==='stage'}>{people.map(r=>{const m=data.members.find(m=>r.memberIds.includes(m.id));return <article key={r.id} id={'mv-cast-'+r.id} tabIndex={-1} ref={node=>{memberCards.current[r.id]=node;}}><h3>{m?memberDisplayName(m):r.name}</h3><Editor editorial compact table="ratings" id={r.id} mode={data.mode} publicCatalog={data} onSaved={onSaved} onDirtyChange={markDirty} onNavigationBlockedChange={markNavigationBlocked}/></article>;})}</div>
     <button className="button" onClick={()=>showRating(false)}>返回本作品</button><p>MV 与舞台分别评分；返回详情会保留尚未保存的输入。</p>{dirtyKeys.length>0&&<p role="status">有 {dirtyKeys.length} 条未保存修改</p>}
    </section>
    {sequence&&<SequencePreview sequence={sequence} currentId={work.id} catalog={data} onNext={onNext} nextDisabled={navigationBlockedKeys.length>0}/>}
   </div><footer className="editorial-detail-footer"><span>{brand}</span><p>作品与演出档案</p></footer>
  </div>;
 }
 if(madein){
  const logo='/artist/madein/figma-20261017/madein-logo.png';
  const poster=view==='mv'?madeinMedia?.poster:madeinMedia?.stagePoster;
  const showRating=(next:boolean)=>{setMadeinRating(next);window.requestAnimationFrame(()=>document.getElementById(next?'madein-rating-title':'madein-detail-title')?.focus({preventScroll:true}));};
  const chooseVideo=(next:'mv'|'stage')=>{switchView(next);};
  return <div className="madein-work-detail" data-work-id={work.id} data-video-view={view}>
   <header className="madein-detail-header"><button type="button" aria-label="MADEIN 首页" onClick={()=>onArtistNavigate?.('/artists/madein')}><img src={logo} width="184" height="28" alt="MADEIN"/></button><button className="madein-menu-toggle" aria-expanded={madeinMenu} aria-controls="madein-detail-menu" onClick={()=>setMadeinMenu(!madeinMenu)}>菜单 ☰</button><nav id="madein-detail-menu" className={madeinMenu?'is-open':''} aria-label="MADEIN 栏目">{[['首页',''],['成员库','?section=members'],['作品库','?section=works'],['历程','?section=updates']].map(([label,query])=><button type="button" key={label} onClick={()=>onArtistNavigate?.('/artists/madein'+query)}>{label}</button>)}</nav></header>
   <div className="madein-detail-body">
    <div className="madein-detail-back"><button className="button" onClick={()=>madeinRating?showRating(false):view==='stage'?chooseVideo('mv'):onBack()}><ArrowLeft size={16}/>{madeinRating?'返回详情':view==='stage'?'返回对应MV':backLabel}</button></div>
    <div hidden={madeinRating}>
     <div className={"madein-detail-hero "+(!activeUrl?"madein-no-media":"")}>{activeUrl&&<div className="video-stage"><WorkVideoPlayer posterSrc={poster} workId={work.id} view={view} url={activeUrl} videoId={vid} embedUrl={view==='stage'&&stage?stageEmbedUrl(stage):vid?youtubeEmbedUrl(vid):null} title={title}/></div>}<div className="madein-detail-identity"><p>{view==='stage'?'舞台'+(stage?.channel?' / '+stage.channel:''):'MADEIN / '+(work.videoType||'MV')}</p><h1 id="madein-detail-title" tabIndex={-1}>{work.song||work.name}</h1><span>{view==='stage'?madeinMedia?.stageLabel||'暂无舞台':work.videoType||'MV'}</span>{view==='stage'&&stage?.publishedDate&&<p>发布时间：{stage.publishedDate}</p>}<div className="madein-detail-actions">{activeUrl&&<a className="button primary" href={activeUrl} target="_blank" rel="noopener noreferrer">官方观看 ↗</a>}<button className="button" onClick={()=>showRating(true)}>评分 →</button></div></div></div>
     {view==='stage'&&stage?.clip&&<p className="madein-source-note">当前舞台片段：{formatStageTime(stage.clip.startSeconds)}–{formatStageTime(stage.clip.endSeconds)}。打开原视频后需自行在终点停止。</p>}
     <section className="madein-participants"><h2>参与成员</h2>{view==='stage'?<p>暂无参与成员信息</p>:people.length===0?<p>暂无参与成员信息</p>:<div className="cast-grid">{people.map(r=>{const m=data.members.find(m=>r.memberIds.includes(m.id));return <article className="cast-card" key={r.id}><PhotoView referencePhoto={r.referencePhoto} photo={r.photo??null} label={m?memberDisplayName(m):r.name} live={data.mode==='live'} kind="本 MV 认人图"/><div><button className="member-name" disabled={!m} onClick={()=>m&&onMember(m.id)}>{m?memberDisplayName(m):r.name}</button><p>表现 {score(r.score)} · 造型 {score(r.stylingScore)}</p><button className="button" onClick={()=>showRating(true)}>成员评分 →</button></div></article>;})}</div>}</section>
     <section className="madein-related-video"><p>{view==='stage'?'对应MV':'对应舞台'}</p><h2>{view==='stage'?work.song||work.name:madeinMedia?.stageLabel||stageStatusLabel(work)}</h2><p>{view==='stage'?'MADEIN / '+(work.videoType||'MV'):(work.song||work.name)+(stage?.channel?' / '+stage.channel:'')}</p><button className="button" onClick={()=>chooseVideo(view==='stage'?'mv':'stage')}>{view==='stage'?'返回对应MV →':'查看舞台 →'}</button></section>
     {view==='mv'&&versionLinks.length>0&&<nav className="madein-version-links" aria-label="作品版本与关联">{versionLinks.map(link=><button className="button" type="button" key={link.workId} disabled={navigationBlockedKeys.length>0} onClick={()=>onVersion(link.workId)}>{link.title}<ChevronRight size={14}/></button>)}</nav>}
     {view==='stage'&&<StageSupplements work={work}/>}
    </div>
    <section className="madein-rating-panel" hidden={!madeinRating} aria-label="作品评分">
     <div className="madein-rating-heading"><h1 id="madein-rating-title" tabIndex={-1}>评分</h1><span>RATING</span></div>
     <div className="madein-rating-object">{poster?<img src={poster} width="864" height="486" alt={(work.song||work.name)+(view==='mv'?' · MV 封面':' · 当前舞台封面')}/>:null}<h2>{work.song||work.name}</h2><p>{view==='stage'?'舞台'+(stage?.channel?' / '+stage.channel:''):'MADEIN / '+(work.videoType||'MV')}</p><p>当前选择：{view==='stage'?madeinMedia?.stageLabel||'舞台':work.videoType||'MV'}</p></div>
     <div className="video-mode-tabs" role="group" aria-label="评分视频版本"><button id="mv-tab" aria-pressed={view==='mv'} onClick={()=>chooseVideo('mv')}>官方MV</button><button id="stage-tab" aria-pressed={view==='stage'} onClick={()=>chooseVideo('stage')}>舞台{madeinMedia?.stagePoster?' · '+(madeinMedia.stageLabel==='M COUNTDOWN · EP.916'?'EP.916':madeinMedia.stageLabel):''}</button></div>
     <div className="madein-saved-score"><span>{view==='stage'?'已保存的整体舞台分':'已保存的 MV 分数'}</span><strong>{score(view==='stage'?work.stageScore:work.score)}</strong><small>{work.watched||'观看状态未标记'}</small></div>
     {work.note&&<p className="madein-saved-note">{work.note}</p>}
     <Editor key={work.id} madein table="works" id={work.id} mode={data.mode} publicCatalog={data} onSaved={onSaved} workView={view} stageVideoId={stageBound?stage?.videoId:null} sourceKey={stageBound?stageSourceKey(stage):null} onDirtyChange={markDirty} onNavigationBlockedChange={markNavigationBlocked} saveButtonRef={workSaveButton} onSaveAvailabilityChange={setWorkSaveEnabled}/>
     <p className="madein-rating-guidance">{view==='stage'?'舞台只做整体评分；成员个人评分在 MV 页。':'MV 与成员评分分别保存。'}</p>
     <div hidden={view==='stage'} className="madein-member-ratings">{people.map(r=>{const m=data.members.find(m=>r.memberIds.includes(m.id));return <article id={'mv-cast-'+r.id} key={r.id} tabIndex={-1} ref={node=>{memberCards.current[r.id]=node;}}><h3>{m?memberDisplayName(m):r.name}</h3><Editor madein table="ratings" id={r.id} mode={data.mode} publicCatalog={data} onSaved={onSaved} onDirtyChange={markDirty} onNavigationBlockedChange={markNavigationBlocked} compact/></article>;})}</div>
     <button className="button madein-rating-return" onClick={()=>showRating(false)}>返回详情</button>
     {dirtyKeys.length>0&&<p role="status">有 {dirtyKeys.length} 条未保存修改，返回详情和切换视频会保留输入。</p>}
    </section>
    {sequence&&<SequencePreview sequence={sequence} currentId={work.id} catalog={data} onNext={onNext} nextDisabled={navigationBlockedKeys.length>0}/>}
   </div><footer className="madein-detail-footer"><img src={logo} width="150" height="23" alt="MADEIN"/><span>MADEIN</span></footer>
  </div>;
 }
 return <div className={'detail '+(view==='stage'?'stage-view':'')}><button className="back text-button" onClick={onBack}><ArrowLeft size={16}/>{backLabel}</button>
 {triples&&<header className="triples-work-heading"><div className="triples-work-brand"><button type="button" onClick={()=>onArtistNavigate?.('/artists/triples')} aria-label="tripleS 首页"><img src="/artist/triples/approved-design/logo-triples.svg" width="172" height="52" alt="tripleS"/></button><span>{view==='stage'?'舞台':'MV'}</span><button className="button" onClick={onBack}>返回</button></div><nav aria-label="tripleS 栏目">{[['首页',''],['成员','?section=members'],['作品','?section=works'],['时间轴','?section=updates']].map(([label,query])=><button type="button" key={label} className="button" onClick={()=>onArtistNavigate?.('/artists/triples'+query)}>{label}</button>)}</nav><h1>{work.song||work.name}</h1><div className={'triples-video-identity '+(view==='stage'?'is-stage':'')}><strong>{view==='stage'?'ON STAGE / '+(triplesMedia?.stagePoster?'M COUNTDOWN':stage?.channel||'舞台'):'MUSIC VIDEO'}</strong>{view==='mv'&&triplesMedia?.publicationDate&&<span>MV 公开 · {triplesMedia.publicationDate}</span>}{view==='stage'&&stage?.publishedDate&&<span>{triplesMedia?.stagePoster?'播出':'视频公开'} · {stage.publishedDate}</span>}{view==='stage'&&triplesMedia?.stagePoster&&<b>EP.843</b>}</div></header>}
 {loona&&<div className="loona-work-heading"><a href="/artists/loona" aria-label="LOONA 主页"><img src="/artist/loona/approved-home/logo-loona.png" width="174" height="37" alt="LOONA"/></a><nav aria-label="LOONA 栏目"><a href="/artists/loona?section=members">成员</a><a href="/artists/loona?section=works">作品</a><a href="/artists/loona?section=updates">时间轴</a></nav><h1>{work.song||work.name}</h1><p>{view==='stage'?'STAGE / '+(stage?.channel||'舞台'):'MUSIC VIDEO / WORK'}</p><p>{[view==='stage'?stage?.publishedDate:work.releaseDate,view==='mv'?work.version:null].filter(Boolean).join(' · ')}</p></div>}
 {!work.groupIds.includes(BABYMONSTER_GROUP_ID)&&!work.groupIds.includes(ILLIT_GROUP_ID)&&(work.groupIds.includes(XG_GROUP_ID)||work.groupIds.includes(AESPA_GROUP_ID))&&<div className="expanded-work-heading"><GroupLinks data={data} ids={work.groupIds} onGroup={onGroup}/><h1>{work.song||work.name}</h1><p>{[view==='stage'?stage?.publishedDate:work.releaseDate,view==='stage'?'舞台':work.version||work.videoType].filter(Boolean).join(' · ')}</p></div>}
 {work.groupIds.includes(ILLIT_GROUP_ID)&&!work.groupIds.includes(BABYMONSTER_GROUP_ID)&&<div className="illit-work-heading"><GroupLinks data={data} ids={work.groupIds} onGroup={onGroup}/><h1>{work.song||work.name}</h1><p>{[view==='stage'?stage?.publishedDate:work.releaseDate,view==='stage'?'舞台':work.version||work.videoType].filter(Boolean).join(' · ')}</p></div>}
 {!work.groupIds.some(id=>[BABYMONSTER_GROUP_ID,ILLIT_GROUP_ID,XG_GROUP_ID,AESPA_GROUP_ID].includes(id))&&work.groupIds.includes(IVE_GROUP_ID)&&<div className="ive-work-heading"><GroupLinks data={data} ids={work.groupIds} onGroup={onGroup}/><h1>{work.song||work.name}</h1><p>{[view==='stage'?stage?.publishedDate:work.releaseDate,view==='stage'?'舞台':work.version||work.videoType].filter(Boolean).join(' · ')}</p></div>}
 {!work.groupIds.some(id=>[BABYMONSTER_GROUP_ID,ILLIT_GROUP_ID,XG_GROUP_ID,AESPA_GROUP_ID,IVE_GROUP_ID].includes(id))&&work.groupIds.includes(KIOF_GROUP_ID)&&<div className="kiof-work-heading"><GroupLinks data={data} ids={work.groupIds} onGroup={onGroup}/><h1>{work.song||work.name}</h1><p>{[view==='stage'?stage?.publishedDate:work.releaseDate,view==='stage'?'舞台':work.version||work.videoType].filter(Boolean).join(' · ')}</p></div>}
 {!work.groupIds.some(id=>[BABYMONSTER_GROUP_ID,ILLIT_GROUP_ID,XG_GROUP_ID,AESPA_GROUP_ID,IVE_GROUP_ID,KIOF_GROUP_ID].includes(id))&&work.groupIds.includes(STAYC_GROUP_ID)&&<div className="stayc-work-heading"><GroupLinks data={data} ids={work.groupIds} onGroup={onGroup}/><h1>{work.song||work.name}</h1><p>{[view==='stage'?stage?.publishedDate:work.releaseDate,view==='stage'?'舞台':work.version||work.videoType].filter(Boolean).join(' · ')}</p></div>}
 {!work.groupIds.some(id=>[BABYMONSTER_GROUP_ID,ILLIT_GROUP_ID,XG_GROUP_ID,AESPA_GROUP_ID,IVE_GROUP_ID,KIOF_GROUP_ID,STAYC_GROUP_ID].includes(id))&&work.groupIds.includes(NMIXX_GROUP_ID)&&<div className="nmixx-work-heading"><GroupLinks data={data} ids={work.groupIds} onGroup={onGroup}/><h1>{work.song||work.name}</h1><p>{[view==='stage'?stage?.publishedDate:work.releaseDate,view==='stage'?'舞台':work.version||work.videoType].filter(Boolean).join(' · ')}</p></div>}
 {!work.groupIds.some(id=>[BABYMONSTER_GROUP_ID,ILLIT_GROUP_ID,XG_GROUP_ID,AESPA_GROUP_ID,IVE_GROUP_ID,KIOF_GROUP_ID,STAYC_GROUP_ID,NMIXX_GROUP_ID].includes(id))&&work.groupIds.includes(HEARTS2HEARTS_GROUP_ID)&&<div className="hearts2hearts-work-heading"><GroupLinks data={data} ids={work.groupIds} onGroup={onGroup}/><h1>{work.song||work.name}</h1><p>{[view==='stage'?stage?.publishedDate:work.releaseDate,view==='stage'?'舞台':work.version||work.videoType].filter(Boolean).join(' · ')}</p></div>}
 {!work.groupIds.some(id=>[BABYMONSTER_GROUP_ID,ILLIT_GROUP_ID,XG_GROUP_ID,AESPA_GROUP_ID,IVE_GROUP_ID,KIOF_GROUP_ID,STAYC_GROUP_ID,NMIXX_GROUP_ID,HEARTS2HEARTS_GROUP_ID].includes(id))&&work.groupIds.includes(KIIIKIII_GROUP_ID)&&<div className="kiiikiii-work-heading"><GroupLinks data={data} ids={work.groupIds} onGroup={onGroup}/><h1>{work.song||work.name}</h1><p>{[view==='stage'?stage?.publishedDate:work.releaseDate,view==='stage'?'舞台':work.version||work.videoType].filter(Boolean).join(' · ')}</p></div>}
 {!work.groupIds.some(id=>[BABYMONSTER_GROUP_ID,ILLIT_GROUP_ID,XG_GROUP_ID,AESPA_GROUP_ID,IVE_GROUP_ID,KIOF_GROUP_ID,STAYC_GROUP_ID,NMIXX_GROUP_ID,HEARTS2HEARTS_GROUP_ID,KIIIKIII_GROUP_ID].includes(id))&&work.groupIds.includes(ITZY_GROUP_ID)&&<div className="itzy-work-heading"><GroupLinks data={data} ids={work.groupIds} onGroup={onGroup}/><h1>{work.song||work.name}</h1><p>{[view==='stage'?stage?.publishedDate:work.releaseDate,view==='stage'?'舞台':work.version||work.videoType].filter(Boolean).join(' · ')}</p></div>}
 {!work.groupIds.some(id=>[BABYMONSTER_GROUP_ID,ILLIT_GROUP_ID,XG_GROUP_ID,AESPA_GROUP_ID,IVE_GROUP_ID,KIOF_GROUP_ID,STAYC_GROUP_ID,NMIXX_GROUP_ID,HEARTS2HEARTS_GROUP_ID,KIIIKIII_GROUP_ID,ITZY_GROUP_ID].includes(id))&&work.groupIds.includes(LESSERAFIM_GROUP_ID)&&<div className="lesserafim-work-heading"><GroupLinks data={data} ids={work.groupIds} onGroup={onGroup}/><h1>{work.song||work.name}</h1><p>{[view==='stage'?stage?.publishedDate:work.releaseDate,view==='stage'?'舞台':work.version||work.videoType].filter(Boolean).join(' · ')}</p></div>}
 {!work.groupIds.some(id=>[BABYMONSTER_GROUP_ID,ILLIT_GROUP_ID,XG_GROUP_ID,AESPA_GROUP_ID,IVE_GROUP_ID,KIOF_GROUP_ID,STAYC_GROUP_ID,NMIXX_GROUP_ID,HEARTS2HEARTS_GROUP_ID,KIIIKIII_GROUP_ID,ITZY_GROUP_ID,LESSERAFIM_GROUP_ID].includes(id))&&work.groupIds.includes(SAYMYNAME_GROUP_ID)&&<div className="saymyname-work-heading"><GroupLinks data={data} ids={work.groupIds} onGroup={onGroup}/><h1>{work.song||work.name}</h1><p>{[view==='stage'?stage?.publishedDate:work.releaseDate,view==='stage'?'舞台':work.version||work.videoType].filter(Boolean).join(' · ')}</p></div>}
 {!work.groupIds.some(id=>[BABYMONSTER_GROUP_ID,ILLIT_GROUP_ID,XG_GROUP_ID,AESPA_GROUP_ID,IVE_GROUP_ID,KIOF_GROUP_ID,STAYC_GROUP_ID,NMIXX_GROUP_ID,HEARTS2HEARTS_GROUP_ID,KIIIKIII_GROUP_ID,ITZY_GROUP_ID,LESSERAFIM_GROUP_ID,SAYMYNAME_GROUP_ID].includes(id))&&work.groupIds.includes(KATSEYE_GROUP_ID)&&<div className="katseye-work-heading"><GroupLinks data={data} ids={work.groupIds} onGroup={onGroup}/><h1>{work.song||work.name}</h1><p>{[view==='stage'?stage?.publishedDate:work.releaseDate,view==='stage'?'舞台':work.version||work.videoType].filter(Boolean).join(' · ')}</p></div>}
 {view==='stage'&&<div className="mobile-work-heading"><GroupLinks data={data} ids={work.groupIds} onGroup={onGroup}/><h1>{work.song||work.name}</h1></div>}
 {sequence&&<SequencePreview sequence={sequence} currentId={work.id} catalog={data} onNext={onNext} nextDisabled={navigationBlockedKeys.length>0}/>}
 {sequenceLabel&&<div className="watch-context"><span>{sequenceLabel}</span><small>第 {sequencePosition} / {sequenceTotal} 首</small></div>}
 <div className="video-mode-row"><div className="video-mode-tabs" role="tablist" aria-label="视频版本" onFocus={event=>{for(const tab of event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'))tab.tabIndex=tab===(event.target as EventTarget)?0:-1;}} onKeyDown={event=>{
  if(event.altKey||event.ctrlKey||event.metaKey||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  const tabs=[...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')].filter(tab=>!tab.disabled&&!tab.hidden&&tab.getClientRects().length>0);
  const current=tabs.findIndex(tab=>tab===event.target);if(current<0||!tabs.length)return;
  const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(current+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
  event.preventDefault();tabs[next].focus();
 }}><button role="tab" id="mv-tab" tabIndex={view==='mv'?0:-1} aria-selected={view==='mv'} aria-controls="work-video-panel" onClick={()=>switchView('mv')}>MV</button><button role="tab" id="stage-tab" tabIndex={view==='stage'?0:-1} aria-selected={view==='stage'} aria-controls="work-video-panel" onClick={()=>switchView('stage')}>舞台</button></div><span>{view==='stage'?'舞台整体评分':'MV 与本曲成员评分'}</span></div>
 <div className="work-detail-top" id="work-video-panel" role="tabpanel" aria-labelledby={view==='stage'?'stage-tab':'mv-tab'}><div>
 <div className={'video-stage '+(!activeUrl?'video-missing':'')}>{loona&&view==='stage'&&stage?<div className="loona-programme-ticket"><p>{stage.channel||'舞台'}</p><h2>{stage.title}</h2><hr/><strong>{work.song||work.name}</strong>{stage.publishedDate&&<span>发布 {stage.publishedDate}</span>}<small>节目入口 · 舞台图片待补</small></div>:!activeUrl?<div className="stage-empty"><Disc3 size={44}/><h2>{view==='stage'?stageStatusLabel(work):'暂无视频'}</h2><p>{view==='stage'?stageStatusDescription(work):'暂时没有可播放的视频。'}</p>{view==='stage'&&<>{!!(work.stageSupplement?.alternatives.length||work.stageSupplement?.watchLeads?.length)&&<button className="button primary" onClick={()=>document.getElementById('other-performances')?.scrollIntoView({behavior:'smooth',block:'start'})}>看看其他表演</button>}<button className="button" onClick={()=>switchView('mv')}>返回 MV</button></>}</div>:<WorkVideoPlayer posterSrc={loonaButterfly&&view==='mv'?'/artist/loona/approved-home/butterfly.jpg':triplesMedia?(view==='mv'?triplesMedia.poster:triplesMedia.stagePoster):approvedPoster?.src} posterLabel={approvedPoster?.label} posterFit={approvedPoster?'contain':undefined} posterSize={approvedPoster?.intrinsicSize} workId={work.id} view={view} url={activeUrl} videoId={vid} embedUrl={view==='stage'&&stage?stageEmbedUrl(stage):vid?youtubeEmbedUrl(vid):null} title={title}/>}</div>
 <div className="video-caption"><span>{title}</span>{activeUrl&&<a href={activeUrl} target="_blank" rel="noopener noreferrer">YouTube 原视频<ArrowUpRight size={13}/></a>}</div>{activeUrl&&<p className="video-fallback">播放不了？可在 YouTube 打开原视频。</p>}
 {loonaButterfly&&<div className="loona-associated-release"><img src="/artist/loona/approved-home/butterfly-album.jpg" width="96" height="96" alt="关联发行《X X》封面"/><div><strong>关联发行《X X》</strong><span>发行封面</span></div></div>}
 {view==='mv'&&people.length>0&&<nav className="mv-member-shortcuts" aria-label="本支成员"><span>本支成员</span><div>{people.map(r=>{const m=data.members.find(m=>r.memberIds.includes(m.id)),label=m?memberDisplayName(m):r.name;return <button type="button" key={r.id} aria-controls={'mv-cast-'+r.id} onClick={()=>jumpToCast(r.id)}>{label}</button>;})}</div><small>点名字，定位认人图与个人评分</small></nav>}
 {vid&&<CaptionHelp/>}
 {view==='stage'&&stage&&<div className="stage-source"><p>{stage.channel} · {stageKindLabel(stage.kind)}</p>{stage.clip&&<p className="stage-reuse-note">整场中的单曲片段 · {formatStageTime(stage.clip.startSeconds)}–{formatStageTime(stage.clip.endSeconds)}<br/>站内播放此片段；打开原视频会从起点开始，需自行在终点停止。</p>}{stage.reusesOriginalVideo&&<p className="stage-reuse-note">与 MV 页为同一支表演视频。</p>}{stage.higherCandidate&&<p className="stage-reuse-note">另有更高赞舞台可看，当前评分仍对应这支视频。<a href={stage.higherCandidate.url} target="_blank" rel="noopener noreferrer">观看另一版 ↗</a></p>}{!stageBound&&work.stageScore!==null&&<p className="stage-version-note">原有舞台分已保留，但对应的视频还未确认；暂不为这支视频改分。</p>}</div>}

 {view==='stage'&&<StageSupplements work={work}/>}
 </div><aside className={'work-aside '+(view==='stage'?'stage-aside':'')}><GroupLinks data={data} ids={work.groupIds} onGroup={onGroup}/><h1>{work.song||work.name}</h1>
 <div className="tags">{view==='stage'?<><span>舞台</span><span>{stage?stageKindLabel(stage.kind):'暂无舞台'}</span>{stage?.publishedDate&&<span>{stage.publishedDate}</span>}</>:<><span>{work.videoType||'视频'}</span>{work.version&&<span>{work.version}</span>}{work.releaseDate&&<span>{work.releaseDate}</span>}{versionTags.map(tag=><span key={tag}>{tag}</span>)}</>}</div>
 {view==='mv'&&versionLinks.length>0&&<nav className="work-version-links" aria-label="作品版本与关联">{versionGroups.map(category=><div className="work-version-group" key={category}><span className="work-version-category">{category}</span><div>{versionLinks.filter(link=>link.categories.join(' / ')===category).map(link=><button type="button" key={link.workId} data-browse-anchor={'version-'+work.id+'-'+link.workId} data-member-work-trigger={'version:'+work.id+':'+link.workId} disabled={navigationBlockedKeys.length>0} onClick={event=>{event.currentTarget.focus({preventScroll:true});onVersion(link.workId);}}><span>{link.title}</span>{link.labels.length>0&&<small>{link.labels.join(' · ')}</small>}<ChevronRight size={14}/></button>)}</div></div>)}</nav>}
 {view==='mv'&&mvVersionWarning(work.verification)&&<p className="verification">{mvVersionWarning(work.verification)}</p>}

 <div className="work-score"><span>{view==='stage'?'我的整体舞台分':'我的 MV 分数'}</span><strong>{score(view==='stage'?work.stageScore:work.score)}</strong><small>{view==='stage'?(!stageBound&&work.stageScore!==null?'原有分数，对应视频未确认':stageBound?(stage?.clip?'对应当前舞台片段':'对应当前舞台视频'):'暂无可评分视频'):(work.watched||'观看状态未标记')}</small></div>
 {view==='mv'&&work.note&&<p className="my-note">{work.note}</p>}
 <Editor key={work.id} loona={loona} triples={triples} table="works" id={work.id} mode={data.mode} publicCatalog={data} onSaved={onSaved} workView={view} stageVideoId={stageBound?stage?.videoId:null} sourceKey={stageBound?stageSourceKey(stage):null} onDirtyChange={markDirty} onNavigationBlockedChange={markNavigationBlocked} saveButtonRef={workSaveButton} onSaveAvailabilityChange={setWorkSaveEnabled}/>
 {view==='stage'&&<div className="stage-overall-note"><Music2 size={18}/><p>舞台只做整体评分。<br/>成员个人评分保留在 MV 页。</p></div>}
 </aside></div>
 {triples&&<section className="triples-detail-connections">{view==='mv'&&triplesMedia?.releaseCover&&<div className="triples-associated-release"><h2>来自这张发行</h2><button type="button" onClick={()=>onArtistNavigate?.('/artists/triples?section=works&release='+encodeURIComponent(triplesMedia.releaseKey))}><img src={triplesMedia.releaseCover} width="136" height="136" alt={triplesMedia.releaseTitle+' · 发行封面'}/><span>{triplesMedia.releaseTitle}<small>发行封面</small></span><ChevronRight size={18}/></button></div>}<div className="triples-other-video"><h2>{view==='stage'?'回到音乐影像':'到舞台上再听一次'}</h2>{view==='mv'&&triplesMedia?.stagePoster&&<img src={triplesMedia.stagePoster} width="880" height="495" alt="Girls Never Die · M COUNTDOWN EP.843 舞台封面"/>}{view==='mv'&&stage&&<p>{stage.title}</p>}<button type="button" className="button" onClick={()=>{switchView(view==='stage'?'mv':'stage');document.getElementById('work-video-panel')?.scrollIntoView({block:'start'});}}>{view==='stage'?'查看 MV':'进入舞台'}<ChevronRight size={16}/></button></div></section>}
 <section hidden={view==='stage'} className="section cast-section"><div className="section-heading"><div><span className="eyebrow">EVERYONE IN THIS VERSION</span><h2>这一支 MV，逐个记住</h2></div></div><div className="cast-grid">{people.map(r=>{const m=data.members.find(m=>r.memberIds.includes(m.id));return <article id={"mv-cast-"+r.id} tabIndex={-1} aria-label={(m?memberDisplayName(m):r.name)+" · 本支 MV 成员卡片"} data-browse-anchor={"cast-"+r.id} className="cast-card" key={r.id} ref={node=>{memberCards.current[r.id]=node;}}><PhotoView referencePhoto={r.referencePhoto} photo={r.photo??m?.photo??null} label={m?memberDisplayName(m):r.name} live={data.mode==='live'} kind={r.photo?(r.photo.kind||'本 MV 认人图'):m?.photo?'资料照 · 非本 MV 截图':'本 MV 截图待补'}/><div className="cast-copy"><button className="member-name" disabled={!m} onClick={()=>m&&onMember(m.id)}><strong><span className="member-display-name">{m?memberDisplayName(m):r.name}</span></strong><ArrowUpRight size={15}/></button>{castWarning(r.verification)&&<small className="cast-verification">{castWarning(r.verification)}</small>}<div className="cast-scores"><span>表现 <b>{score(r.score)}</b></span><span>造型 <b>{score(r.stylingScore)}</b></span></div>{r.memory&&<p className="memory">{r.memory}</p>}{r.note&&<p className="cast-note">{r.note}</p>}<Editor loona={loona} triples={triples} table="ratings" id={r.id} mode={data.mode} publicCatalog={data} onSaved={onSaved} onDirtyChange={markDirty} onNavigationBlockedChange={markNavigationBlocked} compact/></div></article>})}</div>{people.length===0&&<div className="empty"><Users size={30}/><h3>这支 MV 暂无成员名单</h3><p>可以先看视频，给整支作品评分。</p></div>}</section>
 {sequenceLabel&&<section className="watch-next" aria-label="继续观看"><div><span className="eyebrow">KEEP WATCHING</span><h2>{nextWork?'接着看下一首':'这组暂时没有下一首 MV'}</h2>{nextWork?<p>{names(data,nextWork.groupIds)} · {nextWork.song||nextWork.name}</p>:<p>回到列表，换一支想看的作品。</p>}</div>{nextWork?<button className="button primary" disabled={navigationBlockedKeys.length>0} onClick={onNext}>下一首 MV<ChevronRight size={17}/></button>:<button className="button" onClick={onBack}>{backLabel}<ArrowLeft size={16}/></button>}</section>}
 <div className="detail-return"><span className="watch-save-context">{sequenceLabel&&<strong>{sequenceLabel} · 第 {sequencePosition} / {sequenceTotal} 首</strong>}<span>{navigationBlockedKeys.length?'请先等待或核对本次保存结果，再继续下一首':dirtyKeys.length?`有 ${dirtyKeys.length} 条未保存修改，切换不会自动保存`:'切换视频不会清空未保存的输入'}</span></span><div>{canEdit&&<button className="button primary" disabled={!workSaveEnabled} onClick={()=>workSaveButton.current?.click()}>保存作品修改<Check size={15}/></button>}{hasMemberDraft&&<button className={"text-button member-draft-link "+(!workSaveEnabled?"primary":"")} onClick={jumpToMemberDraft}>去保存成员评分（{memberDrafts.length}）<ArrowUpRight size={15}/></button>}<button className="button detail-back" onClick={onBack}>{backLabel}<ArrowLeft size={16}/></button>{nextWork&&<button className="button next-work-button" title={"下一首 MV · "+(nextWork.song||nextWork.name)} aria-label={"下一首 MV · "+(nextWork.song||nextWork.name)} disabled={navigationBlockedKeys.length>0} onClick={onNext}><span>下一首 MV<small>{nextWork.song||nextWork.name}</small></span><ChevronRight size={17}/></button>}</div></div></div>;
}
function MemberWorkCard({item,member,data,onOpen}:{item:MemberWork;member:Member;data:Catalog;onOpen:()=>void}){
 const [expanded,setExpanded]=useState(false);const p=item.photo;
 const [imageState,setImageState]=useState<{request:object;value:ReliableImageState}|null>(null);
 useEffect(()=>{setExpanded(false);},[member.id,item.work.id,p?.recordId,p?.index]);
 const src=p&&data.mode==='live'?`/api/media?table=ratings&record=${p.recordId}&index=${p.index}`:'';
 const imageKey=JSON.stringify([src,member.id,item.work.id]);
 const request=useMemo(()=>({}),[imageKey]),currentRequest=useRef(request);currentRequest.current=request;
 const receiveImageState=useCallback((value:ReliableImageState)=>{if(currentRequest.current===request)setImageState({request,value});},[request]);
 const currentImageState=imageState?.request===request?imageState.value:null;
 const number=(n:number|null)=>n===null?'待评':n.toFixed(1),label=memberDisplayName(member)+' · '+item.work.song+' · '+mvPhotoLabel(p,'本 MV 个人造型');
 const closePhoto=useCallback(()=>setExpanded(false),[]);
 return <article data-browse-anchor={'work-'+item.work.id} className="member-work-wrap member-work-card">
  <div className={'member-work-card__art'+(p?.sourceKind==='mv_look_photo'?' mv-look-native':'')}><button type="button" className="member-work-photo-button" aria-haspopup="dialog" aria-label={'放大'+label} disabled={!src||currentImageState?.status==='error'} onClick={()=>setExpanded(true)}><CatalogPhotoImage photo={p?{...p,table:'ratings'}:null} live={data.mode==='live'} identityKey={`member:${member.id}:work:${item.work.id}:look`} label={label} onStateChange={receiveImageState} missing={<span className="member-work-card__empty">本 MV 个人造型图暂缺</span>} fallback={<span className="member-work-card__empty">图片暂时打不开</span>}/>{src&&currentImageState?.status!=='error'&&<span className="member-photo-expand">查看大图</span>}</button></div>
  {p?.sourceKind==='mv_look_photo'&&<small className="mv-look-photo-caption">{MV_LOOK_PHOTO_LABEL}</small>}
  <MvPhotoReference photo={p} referencePhoto={item.referencePhoto} label={memberDisplayName(member)+' · '+item.work.song} live={data.mode==='live'}/>
  <button data-member-work-trigger={item.work.id} className="member-work-card__body" onClick={onOpen}><small className="member-work-card__meta">{names(data,item.work.groupIds)} · {item.work.videoType||'MV'}{item.work.version?' · '+item.work.version:''}</small><h3 className="member-work-card__title">{item.work.song||item.work.name}</h3><span className="member-work-card__scores">{([['个人表现',item.performance],['个人造型',item.styling]] as const).map(([label,value])=><span className="member-work-card__score" key={label}><small className="member-work-card__score-label">{label}</small><strong className="member-work-card__score-value" data-unrated={value===null}>{number(value)}</strong></span>)}</span><span className="member-work-card__open">查看作品<ArrowUpRight size={16}/></span></button>
  {expanded&&src&&<PhotoLightbox src={currentImageState?.src||src} label={label} onClose={closePhoto}/>}
 </article>;
}
function MemberDetail({member:m,data,onBack,onWork,onGroup,onSaved,backLabel='返回成员档案',artistReturn}:{artistReturn?:string|null;member:Member;data:Catalog;onBack:()=>void;onWork:(id:string)=>void;onGroup?:(id:string)=>void;onSaved:()=>void;backLabel?:string}){
 const works=memberWorks(data,m.id),summary=memberWorkSummary(works),visualKey=m.groupIds.includes(BABYMONSTER_GROUP_ID)?'babymonster':m.groupIds.includes(ILLIT_GROUP_ID)?'illit':m.groupIds.includes(XG_GROUP_ID)?'xg':m.groupIds.includes(AESPA_GROUP_ID)?'aespa':m.groupIds.includes(IVE_GROUP_ID)?'ive':m.groupIds.includes(KIOF_GROUP_ID)?'kissoflife':m.groupIds.includes(STAYC_GROUP_ID)?'stayc':null,concept=weeeklyMemberPortrait(m,artistReturn)??cherrybulletMemberPortrait(m,artistReturn)??rocketpunchMemberPortrait(m,artistReturn)??everglowMemberPortrait(m,artistReturn)??fromis9MemberPortrait(m,artistReturn)??izoneMemberPortrait(m,artistReturn)??idleMemberPortrait(m)??atheartMemberPortrait(m)??hitgsMemberPortrait(m)??vchaMemberPortrait(m)??katseyeMemberPortrait(m)??spiaMemberPortrait(m)??witchxMemberPortrait(m)??tracerMemberPortrait(m)??(visualKey?(artistVisuals[visualKey].members as Record<string,{image:string;label:string;date:string}>)[m.stageName]:null);const number=(n:number|null)=>n===null?'待评':n.toFixed(1);
 return <div className="detail"><button className="back text-button" onClick={onBack}><ArrowLeft size={16}/>{backLabel}</button><div className="member-detail">{concept?<div className="photo bm-concept-photo"><ConceptPhotoImage src={concept.image} memberId={m.id} label={m.stageName+' · '+concept.label}/><span className="image-label">{concept.label} · {concept.date}</span></div>:<PhotoView photo={m.photo} label={m.name} live={data.mode==='live'} retryable fit="contain"/>}<div><GroupLinks data={data} ids={m.groupIds} onGroup={onGroup}/><h1><span className="member-display-name">{memberDisplayName(m)}</span></h1><MemberPhysicalFacts member={m}/><div className="tags">{[m.status,m.country,m.role].filter(Boolean).map(t=><span key={t}>{t}</span>)}</div><MemberCareerFacts member={weeeklyMemberContext(m,artistReturn)?{...m,officialUrl:latestWeeeklyOfficialUrl}:cherrybulletMemberContext(m,artistReturn)?{...m,officialUrl:latestCherrybulletOfficialUrl}:rocketpunchMemberContext(m,artistReturn)?{...m,officialUrl:latestRocketpunchOfficialUrl}:m}/>
  <SocialLinks accounts={m.social??[]} title="个人动态" individual/><section className="member-work-summary" aria-label="作品综合分"><div className="member-work-summary__heading"><span className="member-work-summary__label">作品综合分</span><strong className="member-work-summary__value" data-unrated={summary.composite===null}>{number(summary.composite)}</strong></div><p className="member-work-summary__count">已评 {summary.ratedWorks} 部作品</p><div className="member-work-summary__dimensions">{([['表现均分',summary.performanceMean,summary.performanceCount],['造型均分',summary.stylingMean,summary.stylingCount]] as const).map(([label,value,count])=><div className="member-work-metric" key={label}><div className="member-work-metric__heading"><span className="member-work-metric__label">{label}</span><strong className="member-work-metric__value" data-unrated={value===null}>{number(value)}</strong></div><small className="member-work-metric__count">{count} 部已评</small></div>)}</div><p className="member-work-summary__explanation">表现与造型，各占一半{summary.composite===null&&summary.ratedWorks>0?'；再评另一项即可生成综合分':''}</p></section>
  {m.note&&<p className="my-note">{m.note}</p>}<Editor table="members" id={m.id} mode={data.mode} publicCatalog={data} onSaved={onSaved}/></div></div><section className="section"><div className="section-heading"><h2>她的作品 <small>{works.length}</small></h2><span className="subtle">个人评分</span></div><div className="member-works-grid">{works.map(item=><MemberWorkCard key={item.work.id} item={item} member={m} data={data} onOpen={()=>onWork(item.work.id)}/>)}</div>{works.length===0&&<p className="subtle">还没有收录她的 MV。</p>}</section></div>;
}
