import metadata from '@/data/stages/supplements.json';
import type {StageAlternative,StageEvidence,StageSearchReview,StageSelection,StageSupplement,StageWatchLead} from './types';
export const stageSupplementMetadata=metadata;
const kinds=new Set(['press_concert_recording','official_group_fancam','broadcast_stage','concert_stage','studio_performance','produced_dance_performance','showcase_stage','practice_room']);
const platforms=new Set(['youtube','bilibili','naver','weverse','official_site','x']);
const occasions=new Set(['music_program','practice_room','studio_live','produced_performance','special_program','showcase','concert','festival','fan_event','other_event','unconfirmed']);
const excludedOccasions=new Set(['showcase','concert','festival','fan_event','other_event']);
const rejectedVideoIds=new Set(['l9GLV8Kd-MU','saY9KS7mKvI','BnmwjH-suLg']);
const practiceTitle=/\bpractice\b|练习室/i;
// Links only: never proxy arbitrary URLs, load external HTML, embed an unvetted player,
// or turn a supplement ID into a score-bearing video binding.
export function safePublicStageUrl(value:unknown):value is string {
 if(typeof value!=='string'||value.length>2000)return false;
 try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&u.hostname.includes('.')&&!/^(?:localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(?:1[6-9]|2\d|3[01])\.)/.test(u.hostname)&&!u.hostname.startsWith('[')&&!/^\d+(?:\.\d+){3}$/.test(u.hostname)&&!u.hostname.endsWith('.localhost')&&!u.hostname.endsWith('.local')&&!u.hostname.endsWith('.internal');}catch{return false;}
}
function evidence(v:StageEvidence|undefined){return !!v&&typeof v.note==='string'&&!!v.note.trim()&&Array.isArray(v.urls)&&v.urls.length>0&&v.urls.every(safePublicStageUrl);}
function date(v:unknown){return typeof v==='string'&&/(?:Z|\+00:00)$/.test(v)&&Number.isFinite(Date.parse(v))&&Date.parse(v)<=Date.now()+60000;}
function validSelection(v:StageSelection|undefined){return v===undefined||!!v&&typeof v==='object'&&!Array.isArray(v)&&occasions.has(v.occasion)&&evidence(v.evidence);}
// Historical source records remain structurally verifiable. Eligibility for the
// current viewing queue is applied separately, without changing score bindings.
export function validStageAlternative(a:StageAlternative):boolean{
 if(!a||typeof a!=='object'||Array.isArray(a)||/relay dance|official music video|official m\/v|official mv|单人直拍|个人直拍/i.test(`${a.title} ${a.kind}`)||a.scorePolicy!=='view_only'||'scoreBinding' in a||!platforms.has(a.platform)||!kinds.has(a.performanceType)||!validSelection(a.selection))return false;
 if(![a.id,a.sourceId,a.title,a.channel,a.kind].every(v=>typeof v==='string'&&!!v.trim())||!safePublicStageUrl(a.url)||!date(a.checkedAt))return false;
 if(!['official','audience_original','press_original'].includes(a.sourceClass)||!['full_group','subunit','solo'].includes(a.performerScope)||!['full','excerpt'].includes(a.completeness))return false;
 if(a.performanceType==='practice_room'&&(a.sourceClass!=='official'||a.completeness!=='full'||a.selection?.occasion!=='practice_room'))return false;
 if(a.selection?.occasion==='practice_room'&&a.performanceType!=='practice_room')return false;
 if(a.selection?.occasion==='music_program'&&['concert_stage','showcase_stage','press_concert_recording'].includes(a.performanceType))return false;
 if(practiceTitle.test(`${a.title} ${a.kind}`)&&a.performanceType!=='practice_room')return false;
 if(a.performanceType==='press_concert_recording'&&(a.sourceClass!=='press_original'||a.completeness!=='full'))return false;
 if(a.sourceClass==='press_original'&&a.performanceType!=='press_concert_recording')return false;
 if(a.performanceType==='official_group_fancam'&&(a.sourceClass!=='official'||a.performerScope!=='full_group'))return false;
 if(a.durationSeconds!==undefined&&(!Number.isFinite(a.durationSeconds)||a.durationSeconds<=0))return false;
 if(a.completeness==='excerpt'&&!a.durationSeconds)return false;
 if(a.durationScope!==undefined&&!['single_song','whole_video'].includes(a.durationScope))return false;
 if(a.durationScope==='whole_video'&&(!['official','press_original'].includes(a.sourceClass)||(a.completeness!=='excerpt'&&a.performanceType!=='press_concert_recording')||!a.durationSeconds))return false;
 if(a.sourceClass==='audience_original'&&(a.platform==='official_site'||a.originalPerformerScope!==a.performerScope||!Array.isArray(a.performerNames)||!a.performerNames.length||!a.performerNames.every(v=>typeof v==='string'&&!!v.trim())||!Array.isArray(a.originalPerformerNames)||JSON.stringify([...a.performerNames].sort())!==JSON.stringify([...a.originalPerformerNames].sort())||!evidence(a.performerEvidence)||a.completeness!=='full'||!a.eventDate||!/^\d{4}-\d{2}-\d{2}$/.test(a.eventDate)||!Number.isFinite(Date.parse(a.eventDate))||!evidence(a.eventEvidence)))return false;
 if(!evidence(a.sourceEvidence)||!evidence(a.sameSongEvidence)||!evidence(a.version?.evidence))return false;
 if(!['exact','different','unconfirmed'].includes(a.version.match)||!Array.isArray(a.version.differences)||a.version.differences.some(v=>typeof v!=='string'||!v.trim()))return false;
 if(a.version.match!=='exact'&&a.version.differences.length===0)return false;
 const u=new URL(a.url),host=u.hostname.toLowerCase();
 // X supports only the reviewed original audience post as a plain external link.
 if(a.platform==='x')return a.sourceClass==='audience_original'&&host==='x.com'&&a.url==='https://x.com'+u.pathname&&!u.search&&!u.hash&&/^[1-9]\d{0,19}$/.test(a.sourceId)&&new RegExp('^/[A-Za-z0-9_]{1,15}/status/'+a.sourceId+'$').test(u.pathname);
 if(a.platform==='naver')return host==='tv.naver.com'&&/^[1-9]\d{0,19}$/.test(a.sourceId)&&a.url==='https://tv.naver.com/v/'+a.sourceId;
 if(a.platform==='youtube')return ['youtube.com','www.youtube.com','m.youtube.com','youtu.be'].includes(host)&&/^[A-Za-z0-9_-]{11}$/.test(a.sourceId)&&(host==='youtu.be'?u.pathname.slice(1):u.searchParams.get('v'))===a.sourceId;
 return a.platform==='official_site'||(a.platform==='bilibili'&&['www.bilibili.com','bilibili.com'].includes(host))||(a.platform==='weverse'&&host==='weverse.io');
}
export function validStageWatchLead(a:StageWatchLead):boolean{
 if(!a||typeof a!=='object'||Array.isArray(a)||a.sourceClass!=='official'||a.completeness!=='unconfirmed'||a.scorePolicy!=='view_only'||!platforms.has(a.platform)||!['full_group','subunit','solo','unconfirmed'].includes(a.performerScope)||!validSelection(a.selection))return false;
 if(a.selection?.occasion==='practice_room'||a.selection?.occasion==='music_program'&&['official_concert_full_event','official_showcase_full_event'].includes(a.sourceType))return false;
 const keys=new Set(['id','platform','sourceId','sourceClass','performerScope','completeness','selection','url','title','channel','sourceType','kind','checkedAt','scorePolicy','sourceEvidence','sameSongEvidence','reason','leadTimeSeconds','leadTimeEvidence']);
 if(Object.keys(a).some(k=>!keys.has(k))||!['official_livestream_song_lead','official_multi_song_live_clip','official_showcase_full_event','official_concert_full_event','official_compilation','official_television_program'].includes(a.sourceType))return false;
 if(![a.id,a.sourceId,a.title,a.channel,a.kind,a.reason].every(v=>typeof v==='string'&&!!v.trim())||!safePublicStageUrl(a.url)||!date(a.checkedAt)||!evidence(a.sourceEvidence)||!evidence(a.sameSongEvidence))return false;
 if(practiceTitle.test(`${a.title} ${a.kind}`)||/relay dance|official music video|official m\/v|official mv|单人直拍|个人直拍/i.test(`${a.title} ${a.kind}`))return false;
 if(a.leadTimeSeconds!==undefined&&(!Number.isSafeInteger(a.leadTimeSeconds)||a.leadTimeSeconds<0||a.leadTimeSeconds>86400||!evidence(a.leadTimeEvidence)))return false;
 if(a.leadTimeEvidence!==undefined&&a.leadTimeSeconds===undefined)return false;
 const u=new URL(a.url),host=u.hostname.toLowerCase();
 // A timestamp is a viewing lead only, never a verified playable/scorable clip.
 if(u.searchParams.has('end')||u.searchParams.has('start'))return false;
 if(u.searchParams.has('t')&&(a.leadTimeSeconds===undefined||u.searchParams.get('t')!==String(a.leadTimeSeconds)))return false;
 if(a.platform==='youtube'&&(u.hash||[...u.searchParams.keys()].some(k=>!['v','t'].includes(k))))return false;
 if(a.platform==='youtube')return ['youtube.com','www.youtube.com','m.youtube.com','youtu.be'].includes(host)&&/^[A-Za-z0-9_-]{11}$/.test(a.sourceId)&&(host==='youtu.be'?u.pathname.slice(1):u.searchParams.get('v'))===a.sourceId;
 return a.platform==='official_site'||(a.platform==='bilibili'&&['www.bilibili.com','bilibili.com'].includes(host))||(a.platform==='naver'&&host==='tv.naver.com')||(a.platform==='weverse'&&host==='weverse.io');
}
export function validStageSearchReview(r:StageSearchReview):boolean{
 return !!r&&(r.reviewComplete===undefined||(r.reviewComplete===true&&typeof r.reopenRequirement==='string'&&!!r.reopenRequirement.trim()))&&(r.reopenRequirement===undefined||(r.reviewComplete===true&&typeof r.reopenRequirement==='string'&&!!r.reopenRequirement.trim()))&&typeof r.accessLimited==='boolean'&&date(r.checkedAt)&&['not_found_in_scope','verification_limited','alternate_version_found'].includes(r.outcome)&&typeof r.summary==='string'&&!!r.summary.trim()&&Array.isArray(r.scope)&&r.scope.length>0&&r.scope.every(x=>x.label&&safePublicStageUrl(x.url))&&Array.isArray(r.excluded)&&r.excluded.every(x=>x.title&&x.reason&&safePublicStageUrl(x.url))&&Array.isArray(r.limitations)&&r.limitations.every(x=>typeof x==='string'&&!!x.trim())&&!(r.outcome==='not_found_in_scope'&&r.accessLimited);
}
function alternativeVisible(a:StageAlternative){
 if(rejectedVideoIds.has(a.sourceId))return false;
 if(a.selection&&excludedOccasions.has(a.selection.occasion))return false;
 if(['concert_stage','showcase_stage','press_concert_recording'].includes(a.performanceType))return !!a.selection&&a.selection.occasion!=='unconfirmed';
 return true;
}
function watchLeadVisible(a:StageWatchLead){
 return !rejectedVideoIds.has(a.sourceId)&&!['official_concert_full_event','official_showcase_full_event'].includes(a.sourceType)&&!(a.selection&&excludedOccasions.has(a.selection.occasion));
}
function selectionPriority(a:{selection?:StageSelection}){return a.selection?.occasion==='music_program'?0:a.selection?.occasion==='practice_room'?1:2;}
export function stageSupplementForWork(recordId:string):StageSupplement|null{
 const row=(metadata.works as Record<string,StageSupplement>)[recordId];if(!row)return null;
 const alternatives=Array.isArray(row.alternatives)?row.alternatives.filter(validStageAlternative).filter(alternativeVisible).sort((a,b)=>selectionPriority(a)-selectionPriority(b)):[];
 const watchLeads=Array.isArray(row.watchLeads)?row.watchLeads.filter(validStageWatchLead).filter(watchLeadVisible).sort((a,b)=>selectionPriority(a)-selectionPriority(b)):[];
 const searchReview=row.searchReview&&validStageSearchReview(row.searchReview)?row.searchReview:undefined;
 return alternatives.length||watchLeads.length||searchReview?{alternatives,...(watchLeads.length?{watchLeads}:{}),...(searchReview?{searchReview}:{})}:null;
}
