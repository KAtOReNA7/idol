import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
const root=process.cwd();
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const inventory=read('data/stages/inventory.json');
const status=read('data/stages/status.json');
const videos=read('data/stage-videos.json');
// Frozen before the 2026-10-28 policy: only these exact work/source/selection
// triples may retain a historical occasion without reassigning its score.
const baseline=read('data/stages/selection-policy-baseline-20261028.json');
const canonical=v=>JSON.stringify(v&&typeof v==='object'?Array.isArray(v)?v.map(x=>JSON.parse(canonical(x))):Object.fromEntries(Object.keys(v).sort().map(k=>[k,JSON.parse(canonical(v[k]))])):v);
const hash=v=>createHash('sha256').update(canonical(v)).digest('hex');
const validBilibiliSource=s=>{
 const b=s?.bilibili;
 if(!/^BV[A-Za-z0-9]{10}$/.test(s?.videoId??'')||!b||Object.keys(b).sort().join(',')!=='cid,page'||typeof b.cid!=='string'||!/^[1-9]\d{0,19}$/.test(b.cid)||!Number.isSafeInteger(b.page)||b.page<1||s.xMedia!==undefined)return false;
 try{const u=new URL(s.url);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&!u.hash&&['www.bilibili.com','bilibili.com'].includes(u.hostname)&&u.pathname.replace(/\/$/,'')===`/video/${s.videoId}`&&u.searchParams.getAll('p').length===1&&u.searchParams.get('p')===String(b.page)&&u.searchParams.getAll('cid').length<=1&&(!u.searchParams.has('cid')||u.searchParams.get('cid')===b.cid)&&[...u.searchParams.keys()].every(k=>k==='p'||k==='cid');}catch{return false;}
};
const validXSource=s=>{
 const m=s?.xMedia;
 if(!/^https:\/\/x\.com\//.test(s?.url??'')||!/^[1-9]\d{0,19}$/.test(s?.videoId??'')||!m||Object.keys(m).join(',')!=='videoIndex'||!Number.isSafeInteger(m.videoIndex)||m.videoIndex<1||m.videoIndex>4||s.clip!==undefined||s.bilibili!==undefined)return false;
 try{const u=new URL(s.url),p=u.pathname.match(/^\/[A-Za-z0-9_]{1,15}\/status\/([1-9]\d{0,19})\/video\/([1-4])$/);return u.protocol==='https:'&&u.hostname==='x.com'&&!u.username&&!u.password&&!u.port&&!u.search&&!u.hash&&!!p&&p[1]===s.videoId&&p[2]===String(m.videoIndex);}catch{return false;}
};
const sourceKey=s=>s?.platform==='x'?validXSource(s)?`x:${s.videoId}:video:${s.xMedia.videoIndex}`:null:s?.platform==='bilibili'?validBilibiliSource(s)?`bilibili:${s.videoId}:cid:${s.bilibili.cid}:p:${s.bilibili.page}`+(s.clip?`@${s.clip.startSeconds}-${s.clip.endSeconds}`:''):null:s?.platform!==undefined&&s.platform!=='youtube'?null:s?.clip?`${s.videoId}@${s.clip.startSeconds}-${s.clip.endSeconds}`:s?.videoId;
const sourceClasses=new Set(['official','reupload','third_party']);
const platforms=new Set(['youtube','bilibili','x']);
const rejectedIds=new Set(['l9GLV8Kd-MU','saY9KS7mKvI','BnmwjH-suLg']);
const excludedTypes=new Set(['concert','concert_stage','press_concert_recording','official_concert_full_event','tour','tour_stage','festival','festival_stage','showcase','showcase_stage','official_showcase_full_event','fan_event','other_event']);
const validStatus=new Set(['pending','verified','likes_unverified','not_found','version_mismatch','blocked','missing_song_identity']);
const ids=new Set(inventory.works.map(w=>w.recordId));
const errors=[];
const fail=m=>errors.push(m);
const utc=v=>typeof v==='string'&&Number.isFinite(Date.parse(v))&&Date.parse(v)<=Date.now()+300000&&/(Z|\+00:00)$/.test(v);
const https=v=>{try{const u=new URL(v);return typeof v==='string'&&u.protocol==='https:'&&!!u.hostname&&!u.username&&!u.password}catch{return false}};
const evidence=e=>typeof e?.note==='string'&&!!e.note.trim()&&Array.isArray(e.urls)&&e.urls.length>0&&e.urls.every(https);
const sameSongFallback=(s,id)=>{
 const f=s.sameSongFallback,w=inventory.works.find(w=>w.recordId===id);
 if(f?.sourceWorkId!==undefined&&(typeof f.sourceWorkId!=='string'||!/^rec[A-Za-z0-9]+$/.test(f.sourceWorkId)||f.sourceWorkId===id))return false;
 return !!f&&typeof f==='object'&&f.sameSong===true&&f.targetWorkId===id&&w?.groupIds.includes(f.groupId)&&typeof f.targetSong==='string'&&f.targetSong.trim().toLowerCase()===String(w.song??'').trim().toLowerCase()&&typeof f.performedSong==='string'&&!!f.performedSong.trim()&&typeof f.reason==='string'&&!!f.reason.trim()&&['full','excerpt'].includes(f.completeness)&&f.completeness===s.completeness&&['exact','different'].includes(f.version)&&(f.completeness==='excerpt'||f.version==='different')&&['full_group','subunit','solo'].includes(f.performerScope)&&f.originalPerformerScope===f.performerScope&&Array.isArray(f.differences)&&f.differences.length>0&&f.differences.length<=8&&f.differences.every(x=>typeof x==='string'&&x.trim()&&x.length<=300)&&evidence(f.evidence)&&s.versionMatch!==true&&s.versionMatch!=='exact';
};
const documentedSelection=s=>['music_program','practice_room','produced_performance'].includes(s?.occasion)&&evidence(s.evidence)&&(s.camera===undefined||!!s.camera&&['fixed','moving','mixed'].includes(s.camera.mode)&&evidence(s.camera.evidence));
const videoID=v=>{try{const u=new URL(v);if(u.protocol!=='https:')return null;const id=u.hostname==='youtu.be'?u.pathname.slice(1):['youtube.com','www.youtube.com'].includes(u.hostname)?u.searchParams.get('v'):null;return /^[\w-]{11}$/.test(id??'')?id:null}catch{return null}};
const candidateKey=c=>{
 if(c.platform==='x')return sourceKey(c);
 if(c.platform==='bilibili')return sourceKey(c);
 if(c.platform!==undefined&&c.platform!=='youtube'||c.bilibili||c.xMedia!==undefined)return null;
 const id=videoID(c.url);return id&&(c.videoId===undefined||c.videoId===id)?id:null;
};
const claimsMaximum=s=>/点赞最高|最高赞|highest\s+likes|most\s+liked/i.test(s.selectionNote??'');
if(ids.size!==inventory.works.length)fail('Duplicate work identity in inventory');
if(Object.keys(baseline).length!==482||hash(baseline)!=='6c95cff64e425a9ee99f8048d2785b96675527668f80bacb907f45890410d978')fail('Historical selection baseline changed; do not expand legacy exemptions');
if(status.inventoryCount!==ids.size)fail('Inventory and status counts differ');
for(const id of ids){const s=status.works[id];if(!s){fail(`${id}: status absent`);continue}if(!validStatus.has(s.status))fail(`${id}: invalid status`);if(!s.reason?.trim())fail(`${id}: reason absent`);if(s.checkedAt!==null&&!utc(s.checkedAt))fail(`${id}: invalid observation time`);if(s.status==='verified'&&!videos[id])fail(`${id}: verified without playable source`);}
for(const id of Object.keys(status.works))if(!ids.has(id))fail(`${id}: unknown status identity`);
for(const [id,s] of Object.entries(videos)){
 if(!ids.has(id))fail(`${id}: unknown video identity`);
 if(rejectedIds.has(s.videoId))fail(`${id}: user-rejected exact source`);
 const frozen=baseline[id]?.sourceKey===sourceKey(s)&&baseline[id]?.selectionSha256===hash(s.selection??null);
 const songFallback=sameSongFallback(s,id);
 if(s.sameSongFallback!==undefined){
  if(!songFallback)fail(`${id}: invalid explicit same-song fallback`);
  else if(!s.kind?.includes('同曲后备')||!s.verificationNote||!s.sameSongFallback.differences.every(d=>s.verificationNote.includes(d)))fail(`${id}: same-song fallback differences must be visible`);
  if(!s.scoreBinding||s.previousSources?.length)fail(`${id}: same-song fallback needs a new empty score binding, never a replacement history`);
 }
 if(s.memberVersionFallback!==undefined){
  const f=s.memberVersionFallback,w=inventory.works.find(w=>w.recordId===id);
  if(!f||typeof f!=='object'||s.versionMatch===true||s.versionMatch==='exact'||!['sameSong','sameLanguage','fullGroup','sameArrangementExceptGuest'].every(k=>f[k]===true)||f.differenceType!=='guest_scope'||!w?.groupIds.includes(f.groupId)||typeof f.guestDifference!=='string'||!f.guestDifference.trim()||!evidence(f.evidence))fail(`${id}: invalid documented member-version fallback`);
  if(!s.kind?.includes('成员版')||!s.verificationNote?.includes('客串'))fail(`${id}: member-version guest difference must be visible`);
  if(!s.scoreBinding)fail(`${id}: member-version fallback requires confirmed empty original score binding`);
 }
 if(!frozen){
  if(!documentedSelection(s.selection)||!sourceClasses.has(s.sourceClass)||!platforms.has(s.platform)||s.completeness!=='full'&&!songFallback)fail(`${id}: new or changed source requires documented full music-program/practice/produced-performance selection or explicit same-song fallback and a supported source platform/class`);
  for(const field of ['type','kind','performanceType']){
   const classification=s[field];
   if(excludedTypes.has(classification)||classification==='practice_room'&&s.selection?.occasion!=='practice_room'||classification==='music_program'&&s.selection?.occasion!=='music_program')fail(`${id}: structured performance type conflicts with new-adoption occasion`);
   if(['produced_dance_performance','staged_dance_performance','official_performance_film'].includes(classification)&&s.selection?.occasion!=='produced_performance')fail(`${id}: produced-performance type conflicts with new-adoption occasion`);
  }
 }
 if(('sourceClass' in s||'platform' in s||'completeness' in s)&&(!sourceClasses.has(s.sourceClass)||!platforms.has(s.platform)||s.completeness!=='full'&&!songFallback)||s.scorePolicy==='view_only')fail(`${id}: ineligible source cannot become a formal player`);
 if(s.sourceClass!==undefined&&s.sourceClass!=='official'&&!evidence(s.sourceEvidence))fail(`${id}: third-party upload provenance evidence absent`);
 if(s.platform==='x'?!validXSource(s):s.platform==='bilibili'?!validBilibiliSource(s):videoID(s.url)!==s.videoId||!!s.bilibili||s.xMedia!==undefined)fail(`${id}: URL/video ID mismatch or invalid exact Bilibili CID/page identity or X post/video identity`);
 if(s.platform==='x'&&(s.likesScope!=='whole_post'||claimsMaximum(s)))fail(`${id}: X whole-post likes cannot claim per-video highest likes`);
 if(!s.title?.trim()||!s.channel?.trim()||!s.kind?.trim()||!s.typeNote?.trim())fail(`${id}: incomplete source description`);
 if(!utc(s.checkedAt))fail(`${id}: invalid source time`);
 if(!https(s.sourceUrl))fail(`${id}: invalid source URL`);
 if(!['exact','rounded','unknown'].includes(s.likes?.precision))fail(`${id}: invalid like precision`);
 if(s.likes?.precision==='exact'&&(!Number.isSafeInteger(s.likes.value)||s.likes.value<0))fail(`${id}: invalid exact likes`);
 if(s.likes?.precision!=='exact'&&s.likes?.value!==null)fail(`${id}: nonexact likes need null numeric value`);
 if(!s.likes?.display?.trim())fail(`${id}: like display absent`);
 if(s.likes?.metric!==undefined&&s.likes.metric!=='likes')fail(`${id}: non-like metric cannot be used as likes`);
 if(s.likes?.precision!=='exact'&&claimsMaximum(s))fail(`${id}: unknown or rounded likes cannot claim highest likes`);
 if(s.candidateCount!==s.candidates?.length||!s.candidateCount)fail(`${id}: candidate count mismatch`);
 const urls=new Set(),candidateKeys=new Set(),candidatePlatforms=new Set();for(const c of s.candidates??[]){const key=candidateKey(c);if(!key||urls.has(c.url)||c.platform==='bilibili'&&candidateKeys.has(key))fail(`${id}: malformed or duplicate candidate`);if(rejectedIds.has(videoID(c.url)))fail(`${id}: user-rejected exact source in runtime candidates`);urls.add(c.url);if(key)candidateKeys.add(key);candidatePlatforms.add(c.platform??'youtube');if(!c.title?.trim()||!c.kind?.trim()||!c.likesDisplay?.trim())fail(`${id}: candidate description absent`)}
 if(s.platform==='bilibili'?!candidateKeys.has(sourceKey(s)):!urls.has(s.url))fail(`${id}: selected source absent from evidence candidates`);
 if(candidatePlatforms.size>1&&claimsMaximum(s))fail(`${id}: cross-platform candidates cannot claim a direct highest-likes ranking`);
 if(s.clip){const c=s.clip;const key=sourceKey(s);if(!Number.isSafeInteger(c.startSeconds)||!Number.isSafeInteger(c.endSeconds)||c.startSeconds<0||c.endSeconds<=c.startSeconds||!Number.isSafeInteger(c.sourceDurationSeconds)||c.sourceDurationSeconds<=0||c.sourceDurationSeconds>86400||c.endSeconds>c.sourceDurationSeconds||!c.evidence?.note?.trim()||!c.evidence?.urls?.length||!c.evidence.urls.every(https))fail(`${id}: invalid clip boundaries or missing evidence`);if(s.likesScope!=='whole_video'||s.selectionNote?.includes('点赞最高'))fail(`${id}: concert likes misrepresented as single-song ranking`);if(s.scoreBinding&&s.scoreBinding.sourceKey!==key)fail(`${id}: clip score binding lacks exact source key`);}
 if(s.platform==='bilibili'&&s.scoreBinding&&s.scoreBinding.sourceKey!==sourceKey(s))fail(`${id}: Bilibili score binding requires exact CID/page source key`);
 if(s.platform==='x'&&s.scoreBinding&&s.scoreBinding.sourceKey!==sourceKey(s))fail(`${id}: X score binding requires exact post/video source key`);
 if(!s.clip&&s.platform!=='bilibili'&&s.platform!=='x'&&s.scoreBinding?.sourceKey&&s.scoreBinding.sourceKey!==s.videoId)fail(`${id}: whole-video source key mismatch`);
 if(s.scoreBinding&&(s.scoreBinding.videoId!==s.videoId||s.scoreBinding.initialScore!==null||!utc(s.scoreBinding.initializedAt)))fail(`${id}: invalid score source binding`);
 const w=inventory.works.find(w=>w.recordId===id);if(w?.mv?.videoId===s.videoId&&!(s.reusesOriginalVideo===true&&/performance|special stage|live clip|showcase|dance practice|choreography practice/i.test(w.mv.officialTitle??'')&&!/official (?:music video|mv)/i.test(w.mv.officialTitle??'')))fail(`${id}: selected video is original MV without explicit performance reuse evidence`);
 if(!frozen&&/(?:DANCE|CHOREOGRAPHY)\s+PRACTICE/i.test(s.title)&&!(s.selection?.occasion==='practice_room'&&documentedSelection(s.selection)))fail(`${id}: practice needs documented full practice classification`);
 if(/RELAY\s+DANCE|FANCAM/i.test(s.title))fail(`${id}: excluded performance type in title`);
}
const reused=new Map();for(const [id,s] of Object.entries(videos)){
 const w=inventory.works.find(w=>w.recordId===id);let identityWork=w;
 if(s.sameSongFallback?.sourceWorkId){const f=s.sameSongFallback,original=inventory.works.find(x=>x.recordId===f.sourceWorkId),bound=videos[f.sourceWorkId];if(bound?.sameSongFallback!==undefined)fail(`${id}: fallback source work must not itself be a same-song fallback`);if(sameSongFallback(s,id)&&f.sourceWorkId!==id&&JSON.stringify(original?.groupIds)===JSON.stringify(w?.groupIds)&&!!bound&&bound.sameSongFallback===undefined&&sourceKey(bound)===sourceKey(s)&&String(original?.song??'').trim().toLowerCase()===f.performedSong.trim().toLowerCase())identityWork=original;else fail(`${id}: fallback source work lacks an exact same-group source identity`);}
 if(s.audioEquivalence){const eq=s.audioEquivalence;const original=inventory.works.find(x=>x.recordId===eq.originalBoundWorkId);const bound=videos[eq.originalBoundWorkId];const valid=eq.sameAudio===true&&eq.originalBoundWorkId!==id&&eq.basis?.trim()&&eq.evidenceUrls?.length>0&&eq.evidenceUrls.every(https)&&JSON.stringify(original?.groupIds)===JSON.stringify(w?.groupIds)&&!!bound&&!!sourceKey(s)&&sourceKey(bound)===sourceKey(s)&&JSON.stringify(bound.clip??null)===JSON.stringify(s.clip??null)&&!bound.audioEquivalence;if(valid)identityWork=original;else fail(`${id}: audio equivalence lacks a corroborated same-group source and public evidence`);}
 const identity=JSON.stringify([identityWork?.groupIds,identityWork?.song?.toLocaleLowerCase().trim()]);const key=sourceKey(s);const previous=reused.get(key);if(key&&previous&&previous.identity!==identity)fail(`${id}: same stage video reused for a different group/song than ${previous.id}`);else if(key)reused.set(key,{id,identity});
}
if(videos.rec28ldfRTrArg?.videoId!=='B17yoLxkbPA'||videos.rec28ldfRTrArg?.scoreBinding?.initializedAt!=='2026-10-11T11:17:01.441Z')fail('Original BATTER UP source/binding changed');
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
const counts=Object.fromEntries([...validStatus].map(k=>[k,Object.values(status.works).filter(v=>v.status===k).length]));
console.log(JSON.stringify({inventory:ids.size,sources:Object.keys(videos).length,statuses:counts,valid:true},null,2));
