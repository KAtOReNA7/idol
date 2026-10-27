// Replace reviewed low-resolution selections without discarding their originals.
// Only named photo-set references are admitted; catalog and personal data stay intact.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import {fileURLToPath} from 'node:url';
import {batchReviewDate,publicIdentityPath,validateIdentityCandidate} from './import-mv-identity-batch.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const key=p=>[p.workId,p.videoId,p.memberId].join(':');
const hash=b=>createHash('sha256').update(b).digest('hex');

export function planIdentityQualityReplacements(audit,delta,verifyOriginal,auditSha256){
 if(!/^[a-f0-9]{64}$/.test(delta.baseAuditSha256)||delta.baseAuditSha256!==auditSha256)throw Error('Frozen audit has changed');
 if(typeof verifyOriginal!=='function'||!Array.isArray(delta.replacements)||!delta.replacements.length)throw Error('Reviewed replacements and original verifier required');
 const result=structuredClone(audit),seen=new Set(),replaced=[];
 const checkedAt=batchReviewDate(delta.replacements.map(r=>r.after));
 for(const item of delta.replacements){
  const after=structuredClone(item.after),k=key(after);
  if(!after.workId||!after.videoId||!after.memberId||seen.has(k))throw Error('Duplicate or incomplete exact tuple');
  seen.add(k);
  const selected=result.identityImages.filter(r=>key(r)===k),before=selected[0];
  if(selected.length!==1||!isDeepStrictEqual(before,item.expectedBefore)||before.qualityTier!=='card_only')throw Error('Selected low-resolution record differs');
  if(item.review?.approved!==true||item.review?.actual3By4Reviewed!==true||!item.review?.reason?.trim())throw Error('Completed quality review required');
  const ratingId=before.ratingId??before.id?.split(':')[0];
  if(!ratingId||after.ratingId!==ratingId)throw Error('Existing rating identity differs');
  if(after.evidenceLevel!=='source_named_photo_set'||after.sha256===before.sha256)throw Error('A distinct named photo-set original is required');
  const c=after.sourceCrop;
  if(!c||![c.x,c.y,c.width,c.height].every(Number.isSafeInteger)||c.width*4!==c.height*3)throw Error('Actual 3:4 review required');
  if(!publicIdentityPath.test(before.src))throw Error('Invalid former original path');
  verifyOriginal(before);
  validateIdentityCandidate(after,verifyOriginal);
  result.identityImages[result.identityImages.indexOf(before)]=after;
  result.alternateIdentityImages??=[];
  if(!result.alternateIdentityImages.some(r=>isDeepStrictEqual(r,before)))result.alternateIdentityImages.push(before);
  replaced.push({workId:after.workId,videoId:after.videoId,memberId:after.memberId,ratingId,beforeSrc:before.src,beforeSha256:before.sha256,afterSrc:after.src,afterSha256:after.sha256,reason:item.review.reason});
 }
 const rows=result.identityImages,unique=[...new Map(rows.map(r=>[r.src,r])).values()];
 Object.assign(result.summary,{identityImages:rows.length,identitySourceRecords:result.summary.identitySourceRecords+replaced.length,identityUniqueFiles:unique.length,identityBytes:unique.reduce((n,r)=>n+r.byteLength,0),cardOnlyImages:rows.filter(r=>r.qualityTier==='card_only').length,identitySourceCrops:rows.filter(r=>r.sourceCrop).length,evidenceLevels:rows.reduce((o,r)=>(o[r.evidenceLevel]=(o[r.evidenceLevel]??0)+1,o),{})});
 result.checkedAt=checkedAt;
 result.qualityReplacementHistory??=[];
 result.qualityReplacementHistory.push({checkedAt,baseAuditSha256:auditSha256,replaced,formerSelectionsPreserved:true,originalBytesPreserved:true,existingRelationshipsOnly:true});
 return {audit:result,replaced};
}

async function main(){
 const args=process.argv.slice(2),apply=args.includes('--apply'),files=args.filter(x=>x!=='--apply');
 if(files.length!==1||files[0].startsWith('-'))throw Error('Pass one reviewed quality delta; optional --apply');
 const auditPath=path.resolve(root,'../../docs/codex/mv-identity-asset-audit-20261025.json'),bytes=fs.readFileSync(auditPath),baseSha=hash(bytes),delta=JSON.parse(fs.readFileSync(files[0],'utf8'));
 const {imageSize}=await import('image-size');
 const publicRoot=fs.realpathSync(path.join(root,'public'));
 const verifyOriginal=r=>{
  const file=fs.realpathSync(path.resolve(publicRoot,'.'+r.src));
  if(!file.startsWith(publicRoot+path.sep))throw Error('Original escapes public directory');
  const b=fs.readFileSync(file),size=imageSize(b);
  if(b.length!==r.byteLength||hash(b)!==r.sha256||size.width!==r.width||size.height!==r.height)throw Error('Original bytes or dimensions changed');
 };
 const {audit,replaced}=planIdentityQualityReplacements(JSON.parse(bytes),delta,verifyOriginal,baseSha);
 if(apply){if(hash(fs.readFileSync(auditPath))!==baseSha)throw Error('Frozen audit changed before apply');fs.writeFileSync(auditPath,JSON.stringify(audit,null,2)+'\n');}
 console.log(JSON.stringify({applied:apply,replaced:replaced.length,baseAuditSha256:baseSha,summary:audit.summary}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await main();
