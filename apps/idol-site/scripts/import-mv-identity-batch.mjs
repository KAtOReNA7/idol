// Imports reviewed public image evidence only; never creates catalog relationships.
// Default is a dry run. Pass all deltas from one frozen audit together with --apply.
import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const key=p=>[p.workId,p.videoId,p.memberId].join(':');
export const publicIdentityPath=/^\/artist\/mv-identity-(?:20261025|20261026|batch-[abcde]-20261026)\/identities\/[\w.-]+$/;
export function planIdentityBatch(audit,deltas,verifyOriginal){
 const result=structuredClone(audit),keys=new Set(result.identityImages.map(key)),admitted=[];
 for(const delta of deltas)for(const p of delta.identityImages){
  if(keys.has(key(p)))throw Error('Duplicate or replacement requires separate review: '+key(p));
  const w=result.workCoverage.find(w=>w.workId===p.workId&&w.videoId===p.videoId);
  if(!w?.missingIdentityRelationships.some(m=>m.memberId===p.memberId))throw Error('No existing exact-video member relationship: '+key(p));
  if(!publicIdentityPath.test(p.src)||p.src.includes('..'))throw Error('Invalid public original path');
  if(!['previously_reviewed_exact_original','source_named_unique_mv_chapter','source_named_exact_mv_page','official_exact_mv_shoot_provenance','official_named_member_video_thumbnail','official_named_mv_shoot_unique_version','source_named_explicit_version_mv_chapter'].includes(p.evidenceLevel))throw Error('Unreviewed provenance type');
  if(!p.label||!p.sourcePageUrl?.startsWith('https://')||p.qualityTier!=='source_resolution')throw Error('Missing source or candidate below this batch quality threshold');
  if(!Number.isSafeInteger(p.width)||!Number.isSafeInteger(p.height)||p.width<=0||p.height<=0)throw Error('Invalid original dimensions');
  const c=p.sourceCrop;if(c&&(![c.x,c.y,c.width,c.height].every(Number.isFinite)||c.x<0||c.y<0||c.width<=0||c.height<=0||c.x+c.width>p.width||c.y+c.height>p.height))throw Error('Crop outside original');
  verifyOriginal(p);keys.add(key(p));admitted.push(p);result.identityImages.push(p);w.publicIdentityCount++;
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
 audit.checkedAt='2026-10-26';audit.batch20261026={sources:files.map(p=>path.relative(path.resolve(root,'../..'),p).replaceAll('\\','/')),addedBindings:admitted.length,existingRelationshipsOnly:true,originalBytesPreserved:true};
 if(apply)fs.writeFileSync(auditPath,JSON.stringify(audit,null,2)+'\n');
 console.log(JSON.stringify({applied:apply,added:admitted.length,summary:audit.summary}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await main();
