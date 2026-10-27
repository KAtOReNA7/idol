// Imports reviewed public image evidence only; never creates catalog relationships.
// Default is a dry run. Pass all deltas from one frozen audit together with --apply.
import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const key=p=>[p.workId,p.videoId,p.memberId].join(':');
export const publicIdentityPath=/^\/artist\/mv-identity-(?:20261025|20261026|batch-[abcdefghijklm]-20261026|batch-[nopqrstuvwxy]-20261027)\/identities\/[\w.-]+$/;
// Photo purpose, not official/fan authorship, controls the research order.
// This does not replace already selected originals or change catalog bindings.
export const identityPhotoPriority=Object.freeze({concept_photo:0,jacket_photo:0,portrait_photo:1,mv_behind_photo:2,mv_frame:3});
export const photoSetLabels=Object.freeze({concept_photo:'同系列概念照 · 认人参考',jacket_photo:'同系列封套照 · 认人参考',portrait_photo:'同系列写真 · 认人参考'});
function verifyNamedPhotoSet(p){
 if(p.evidenceLevel!=='source_named_photo_set')return;
 const s=p.photoSet,r=p.photoReview;
 const https=u=>{try{return new URL(u).protocol==='https:';}catch{return false;}};
 if(!Object.hasOwn(photoSetLabels,p.kind)||p.label!==photoSetLabels[p.kind]||p.identityBasis!=='source_named'||p.faceIdentityInferred!==false||p.preserveOriginal!==true||p.exactVideoEvidence)throw Error('Photo-set reference must retain named identity and truthful non-MV labeling');
 if(!s?.id?.trim()||!s.title?.trim()||!https(s.sourcePageUrl)||!s.sourceMemberName?.trim()||!s.nameEvidence?.trim()||!s.seriesEvidence?.trim()||!s.workAssociationEvidence?.trim()||!['same_release','same_era','recognition_reference'].includes(s.workAssociation)||!['official','fan','media'].includes(s.publisherKind)||s.purpose!=='recognition_reference')throw Error('Missing named photo-set provenance');
 if(!r||r.reviewed!==true||r.naturalExpression!==true||r.faceClear!==true||r.compositionComplete!==true||r.sameSetReviewed!==true||r.noUpscale!==true||p.actual3By4ContactSheetReviewed!==true)throw Error('Photo set needs actual clarity, expression, composition and series review');
}
export function batchReviewDate(rows){
 const dates=[...new Set(rows.map(p=>p.checkedAt).filter(Boolean))];
 if(rows.some(p=>!p.checkedAt)||dates.length!==1||!/^\d{4}-\d{2}-\d{2}$/.test(dates[0])||!Number.isFinite(Date.parse(dates[0]))||new Date(dates[0]).toISOString().slice(0,10)!==dates[0])throw Error('Batch needs one valid explicit review date');
 return dates[0];
}
const visualEvidenceTypes=new Set(['source_named_frame_with_official_video_match','official_named_shoot_with_official_mv_set_match','official_named_shoot_with_official_mv_scene_match']);
function verifyVisualVersionEvidence(p){
 if(!visualEvidenceTypes.has(p.evidenceLevel))return;
 const v=p.versionReview,refs=v?.references;
 if(p.identityBasis!=='source_named'||p.faceIdentityInferred!==false||p.independentFrameVerification!==false||!v||v.targetVideoId!==p.videoId||v.reviewed!==true||v.identityFromNamedSource!==true||v.faceIdentityInferred!==false||!v.matchBasis?.trim()||!Array.isArray(refs)||!refs.length)throw Error('Missing independent version review with named-source identity');
 for(const r of refs){
  let u;try{u=new URL(r.url);}catch{throw Error('Invalid official storyboard reference');}
  if(u.protocol!=='https:'||u.hostname!=='i.ytimg.com'||!/^[-\w]{11}$/.test(r.videoId)||!u.pathname.startsWith('/sb/'+r.videoId+'/')||! /^[a-f0-9]{64}$/.test(r.sha256)||!Number.isFinite(r.sampleTimestampSeconds)||r.sampleTimestampSeconds<0)throw Error('Invalid official storyboard reference');
 }
 if(!refs.some(r=>r.videoId===p.videoId&&r.role==='target_mv'))throw Error('Version review does not include target video');
 if(p.evidenceLevel==='official_named_shoot_with_official_mv_set_match'&&(!refs.some(r=>r.role==='official_mv_shoot'&&r.videoId===v.officialBehindVideoId)||!v.officialBehindTitle?.includes('MV Shooting')||p.exactVideoEvidence?.sourceExplicitlyNamesMvShoot!==false))throw Error('Named shoot needs separately reviewed official MV-shoot evidence');
}
function verifyNamedVideoFrame(p){
 if(p.evidenceLevel!=='official_named_mv_video_frame')return;
 const f=p.frameEvidence,n=f?.nameEvidence;
 if(!f||f.targetVideoId!==p.videoId||f.scaled!==false||p.width!==f.sourceVideoWidth||p.height!==f.sourceVideoHeight||!Number.isFinite(f.timestampSeconds)||f.timestampSeconds<0||! /^[a-f0-9]{64}$/.test(f.sourceVideoSha256)||!f.extractionCommand?.trim()||!f.targetVersionProof?.trim()||!f.sourceVideoTitle?.trim()||!['target_mv','official_mv_shoot'].includes(f.sourceVideoRole)||p.identityBasis!=='source_named'||p.faceIdentityInferred!==false)throw Error('Incomplete native named-video frame evidence');
 let u;try{u=new URL(f.sourceVideoUrl);}catch{throw Error('Invalid source video URL');}
 if(u.protocol!=='https:'||u.hostname!=='www.youtube.com'||u.pathname!=='/watch'||u.searchParams.get('v')!==f.sourceVideoId||!/^[-\w]{11}$/.test(f.sourceVideoId)||(f.sourceVideoRole==='target_mv'&&f.sourceVideoId!==p.videoId))throw Error('Invalid source video URL or target version');
 if(!n?.text?.trim()||!['in_frame_text','official_manual_subtitle'].includes(n.type)||(n.type==='official_manual_subtitle'&&(!/^[a-f0-9]{64}$/.test(n.subtitleSha256)||n.autoGenerated!==false||!Number.isFinite(n.subtitleStartSeconds)||!Number.isFinite(n.subtitleEndSeconds)||f.timestampSeconds<n.subtitleStartSeconds||f.timestampSeconds>n.subtitleEndSeconds)))throw Error('Missing explicit name at frame timestamp');
}
export function validateIdentityCandidate(p,verifyOriginal){
 if(!publicIdentityPath.test(p.src)||p.src.includes('..'))throw Error('Invalid public original path');
 if(!['source_named_photo_set','previously_reviewed_exact_original','source_named_unique_mv_chapter','source_named_exact_mv_page','official_exact_mv_shoot_provenance','official_named_member_video_thumbnail','official_named_mv_shoot_unique_version','source_named_explicit_version_mv_chapter','official_named_mv_video_frame',...visualEvidenceTypes].includes(p.evidenceLevel))throw Error('Unreviewed provenance type');
 verifyVisualVersionEvidence(p);verifyNamedVideoFrame(p);verifyNamedPhotoSet(p);
 if(!p.label||!p.sourcePageUrl?.startsWith('https://')||p.qualityTier!=='source_resolution')throw Error('Missing source or candidate below this batch quality threshold');
 if(!Number.isSafeInteger(p.width)||!Number.isSafeInteger(p.height)||p.width<=0||p.height<=0)throw Error('Invalid original dimensions');
 const c=p.sourceCrop;if(c&&(![c.x,c.y,c.width,c.height].every(Number.isFinite)||c.x<0||c.y<0||c.width<=0||c.height<=0||c.x+c.width>p.width||c.y+c.height>p.height))throw Error('Crop outside original');
 if(Math.min(c?.width??p.width,(c?.height??p.height)*3/4)<540)throw Error('Effective 3:4 crop below 540px quality threshold');
 verifyOriginal(p);
}
export function planIdentityBatch(audit,deltas,verifyOriginal){
 const result=structuredClone(audit),keys=new Set(result.identityImages.map(key)),admitted=[];
 for(const delta of deltas)for(const p of delta.identityImages){
  if(keys.has(key(p)))throw Error('Duplicate or replacement requires separate review: '+key(p));
  const w=result.workCoverage.find(w=>w.workId===p.workId&&w.videoId===p.videoId);
  if(!w?.missingIdentityRelationships.some(m=>m.memberId===p.memberId))throw Error('No existing exact-video member relationship: '+key(p));
  // The visible 3:4 frame, not the source_resolution label or full landscape
  // width, determines whether the original meets the reviewed pixel threshold.
  validateIdentityCandidate(p,verifyOriginal);keys.add(key(p));admitted.push(p);result.identityImages.push(p);w.publicIdentityCount++;
  w.missingIdentityRelationships=w.missingIdentityRelationships.filter(m=>m.memberId!==p.memberId);
 }
 const rows=result.identityImages,unique=[...new Map(rows.map(p=>[p.src,p])).values()],covered=result.workCoverage.filter(w=>w.publicIdentityCount>0),s=result.summary;
 Object.assign(s,{identityImages:rows.length,identityWorks:covered.length,identityGroups:new Set(covered.flatMap(w=>w.groups)).size,identityUniqueFiles:unique.length,identityBytes:unique.reduce((n,p)=>n+p.byteLength,0),cardOnlyImages:rows.filter(p=>p.qualityTier==='card_only').length,identitySourceCrops:rows.filter(p=>p.sourceCrop).length,worksWithoutPublicIdentity:result.workCoverage.length-covered.length,missingRelationshipImages:result.workCoverage.reduce((n,w)=>n+w.missingIdentityRelationships.length,0),evidenceLevels:rows.reduce((o,p)=>(o[p.evidenceLevel]=(o[p.evidenceLevel]??0)+1,o),{})});
 s.identitySourceRecords+=admitted.length;
 s.displayCropAdjustments=(s.displayCropAdjustments??0)+deltas.reduce((n,d)=>n+(d.summary?.foregroundCompositionAdjustments??0),0);
 s.actual3By4ContactSheetsReviewed=(s.actual3By4ContactSheetsReviewed??0)+deltas.reduce((n,d)=>n+(d.summary?.actual3By4ContactSheetsReviewed??0),0);
 s.borderMetadataReview='Prior reviews preserved; every admitted batch image reviewed at actual 3:4 display. Original-byte, dimension and crop validation required; see batch source reports for composition changes and excluded candidates.';
 return {audit:result,admitted};
}
async function main(){
 const args=process.argv.slice(2),apply=args.includes('--apply'),files=args.filter(a=>a!=='--apply');if(!files.length)throw Error('Pass reviewed delta JSON files; optional --apply');
 const auditPath=path.resolve(root,'../../docs/codex/mv-identity-asset-audit-20261025.json'),bytes=fs.readFileSync(auditPath),baseSha=createHash('sha256').update(bytes).digest('hex');
 const deltas=files.map(file=>{const d=JSON.parse(fs.readFileSync(file,'utf8'));if(d.baseAuditSha256&&d.baseAuditSha256!==baseSha)throw Error('Frozen audit has changed: '+file);return d;});
 const {imageSize}=await import('image-size');
 const {audit,admitted}=planIdentityBatch(JSON.parse(bytes),deltas,p=>{const b=fs.readFileSync(path.join(root,'public',p.src));if(b.length!==p.byteLength||createHash('sha256').update(b).digest('hex')!==p.sha256)throw Error('Original SHA/bytes changed: '+p.src);const dims=imageSize(b);if(dims.width!==p.width||dims.height!==p.height)throw Error('Original dimensions differ: '+p.src);});
 // Retain the previous batch receipt when a later reviewed batch is applied.
 audit.batchHistory??=[];if(audit.batch20261026)audit.batchHistory.push(audit.batch20261026);
 const checkedAt=batchReviewDate(admitted);
 // Retain the legacy receipt key for existing report readers; its date follows
 // the reviewed rows rather than the original October 26 import session.
 audit.checkedAt=checkedAt;audit.batch20261026={checkedAt,sources:files.map(p=>path.relative(path.resolve(root,'../..'),p).replaceAll('\\','/')),baseAuditSha256:baseSha,addedBindings:admitted.length,existingRelationshipsOnly:true,originalBytesPreserved:true};
 if(apply)fs.writeFileSync(auditPath,JSON.stringify(audit,null,2)+'\n');
 console.log(JSON.stringify({applied:apply,added:admitted.length,summary:audit.summary}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await main();
