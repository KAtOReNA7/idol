import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const inventory=read('data/stages/inventory.json');
const status=read('data/stages/status.json');
const videos=read('data/stage-videos.json');
const validStatus=new Set(['pending','verified','likes_unverified','not_found','version_mismatch','blocked','missing_song_identity']);
const ids=new Set(inventory.works.map(w=>w.recordId));
const errors=[];
const fail=m=>errors.push(m);
const utc=v=>typeof v==='string'&&Number.isFinite(Date.parse(v))&&Date.parse(v)<=Date.now()+300000&&/(Z|\+00:00)$/.test(v);
const https=v=>{try{return new URL(v).protocol==='https:'}catch{return false}};
const videoID=v=>{try{const u=new URL(v);if(u.protocol!=='https:')return null;const id=u.hostname==='youtu.be'?u.pathname.slice(1):['youtube.com','www.youtube.com'].includes(u.hostname)?u.searchParams.get('v'):null;return /^[\w-]{11}$/.test(id??'')?id:null}catch{return null}};
if(ids.size!==inventory.works.length)fail('Duplicate work identity in inventory');
if(status.inventoryCount!==ids.size)fail('Inventory and status counts differ');
for(const id of ids){const s=status.works[id];if(!s){fail(`${id}: status absent`);continue}if(!validStatus.has(s.status))fail(`${id}: invalid status`);if(!s.reason?.trim())fail(`${id}: reason absent`);if(s.checkedAt!==null&&!utc(s.checkedAt))fail(`${id}: invalid observation time`);if(s.status==='verified'&&!videos[id])fail(`${id}: verified without playable source`);}
for(const id of Object.keys(status.works))if(!ids.has(id))fail(`${id}: unknown status identity`);
for(const [id,s] of Object.entries(videos)){
 if(!ids.has(id))fail(`${id}: unknown video identity`);
 if(('sourceClass' in s||'platform' in s||'completeness' in s)&&(s.sourceClass!=='official'||s.platform!=='youtube'||s.completeness!=='full')||s.scorePolicy==='view_only')fail(`${id}: ineligible source cannot become a formal player`);
 if(videoID(s.url)!==s.videoId)fail(`${id}: URL/video ID mismatch`);
 if(!s.title?.trim()||!s.channel?.trim()||!s.kind?.trim()||!s.typeNote?.trim())fail(`${id}: incomplete source description`);
 if(!utc(s.checkedAt))fail(`${id}: invalid source time`);
 if(!https(s.sourceUrl))fail(`${id}: invalid source URL`);
 if(!['exact','rounded','unknown'].includes(s.likes?.precision))fail(`${id}: invalid like precision`);
 if(s.likes?.precision==='exact'&&(!Number.isSafeInteger(s.likes.value)||s.likes.value<0))fail(`${id}: invalid exact likes`);
 if(s.likes?.precision!=='exact'&&s.likes?.value!==null)fail(`${id}: nonexact likes need null numeric value`);
 if(!s.likes?.display?.trim())fail(`${id}: like display absent`);
 if(s.candidateCount!==s.candidates?.length||!s.candidateCount)fail(`${id}: candidate count mismatch`);
 const urls=new Set();for(const c of s.candidates??[]){if(!videoID(c.url)||urls.has(c.url))fail(`${id}: malformed or duplicate candidate`);urls.add(c.url);if(!c.title?.trim()||!c.kind?.trim()||!c.likesDisplay?.trim())fail(`${id}: candidate description absent`)}
 if(!urls.has(s.url))fail(`${id}: selected source absent from evidence candidates`);
 if(s.clip){const c=s.clip;const key=`${s.videoId}@${c.startSeconds}-${c.endSeconds}`;if(!Number.isSafeInteger(c.startSeconds)||!Number.isSafeInteger(c.endSeconds)||c.startSeconds<0||c.endSeconds<=c.startSeconds||!Number.isSafeInteger(c.sourceDurationSeconds)||c.sourceDurationSeconds<=0||c.sourceDurationSeconds>86400||c.endSeconds>c.sourceDurationSeconds||!c.evidence?.note?.trim()||!c.evidence?.urls?.length||!c.evidence.urls.every(https))fail(`${id}: invalid clip boundaries or missing evidence`);if(s.likesScope!=='whole_video'||s.selectionNote?.includes('点赞最高'))fail(`${id}: concert likes misrepresented as single-song ranking`);if(s.scoreBinding&&s.scoreBinding.sourceKey!==key)fail(`${id}: clip score binding lacks exact source key`);}
 if(!s.clip&&s.scoreBinding?.sourceKey&&s.scoreBinding.sourceKey!==s.videoId)fail(`${id}: whole-video source key mismatch`);
 if(s.scoreBinding&&(s.scoreBinding.videoId!==s.videoId||s.scoreBinding.initialScore!==null||!utc(s.scoreBinding.initializedAt)))fail(`${id}: invalid score source binding`);
 const w=inventory.works.find(w=>w.recordId===id);if(w?.mv?.videoId===s.videoId&&!(s.reusesOriginalVideo===true&&/performance|special stage|live clip|showcase/i.test(w.mv.officialTitle??'')&&!/official (?:music video|mv)|dance practice/i.test(w.mv.officialTitle??'')))fail(`${id}: selected video is original MV without explicit performance reuse evidence`);
 if(/DANCE\s+PRACTICE|CHOREOGRAPHY\s+PRACTICE|RELAY\s+DANCE|FANCAM/i.test(s.title))fail(`${id}: excluded performance type in title`);
}
const reused=new Map();for(const [id,s] of Object.entries(videos)){
 const w=inventory.works.find(w=>w.recordId===id);let identityWork=w;
 if(s.audioEquivalence){const eq=s.audioEquivalence;const original=inventory.works.find(x=>x.recordId===eq.originalBoundWorkId);const valid=eq.sameAudio===true&&eq.originalBoundWorkId!==id&&eq.basis?.trim()&&eq.evidenceUrls?.length>0&&eq.evidenceUrls.every(https)&&JSON.stringify(original?.groupIds)===JSON.stringify(w?.groupIds)&&videos[eq.originalBoundWorkId]?.videoId===s.videoId&&JSON.stringify(videos[eq.originalBoundWorkId]?.clip??null)===JSON.stringify(s.clip??null)&&!videos[eq.originalBoundWorkId]?.audioEquivalence;if(valid)identityWork=original;else fail(`${id}: audio equivalence lacks a corroborated same-group source and public evidence`);}
 const identity=JSON.stringify([identityWork?.groupIds,identityWork?.song?.toLocaleLowerCase().trim()]);const sourceKey=s.clip?`${s.videoId}@${s.clip.startSeconds}-${s.clip.endSeconds}`:s.videoId;const previous=reused.get(sourceKey);if(previous&&previous.identity!==identity)fail(`${id}: same stage video reused for a different group/song than ${previous.id}`);else reused.set(sourceKey,{id,identity});
}
if(videos.rec28ldfRTrArg?.videoId!=='B17yoLxkbPA'||videos.rec28ldfRTrArg?.scoreBinding?.initializedAt!=='2026-10-11T11:17:01.441Z')fail('Original BATTER UP source/binding changed');
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
const counts=Object.fromEntries([...validStatus].map(k=>[k,Object.values(status.works).filter(v=>v.status===k).length]));
console.log(JSON.stringify({inventory:ids.size,sources:Object.keys(videos).length,statuses:counts,valid:true},null,2));
