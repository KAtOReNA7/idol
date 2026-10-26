// Promote reviewed existing alternatives; preserve the complete former selection.
// Default is dry-run. Never creates relationships or changes personal records.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const tuple=p=>[p.workId,p.videoId,p.memberId].join(':');
const sha256=b=>createHash('sha256').update(b).digest('hex');
const shaPattern=/^[a-f0-9]{64}$/;
const originalPath=/^\/artist\/mv-identity-(?:20261025|20261026|batch-[abc]-20261026)\/identities\/[\w.-]+$/;

function assertOriginalMetadata(p){
 if(!originalPath.test(p.src)||p.src.includes('..'))throw Error('Invalid public original path');
 if(!shaPattern.test(p.sha256)||!Number.isSafeInteger(p.byteLength)||p.byteLength<=0)throw Error('Invalid original SHA/bytes');
 if(![p.width,p.height].every(n=>Number.isSafeInteger(n)&&n>0))throw Error('Invalid original dimensions');
}
function assertCrop(c,p){
 if(!c||![c.x,c.y,c.width,c.height].every(Number.isSafeInteger)||c.x<0||c.y<0||c.width<540||c.height<=0||c.width*4!==c.height*3||c.x+c.width>p.width||c.y+c.height>p.height)throw Error('Reviewed crop must be in-bounds 3:4 and at least 540 pixels wide');
 const border=p.sourceCrop;
 if(border&&(c.x<border.x||c.y<border.y||c.x+c.width>border.x+border.width||c.y+c.height>border.y+border.height))throw Error('Reviewed crop reintroduces excluded original borders');
}

// A pure plan: all file access is supplied by verifyOriginal; inputs are cloned.
export function planIdentityAlternativePromotions(audit,delta,verifyOriginal,auditSha256){
 if(!shaPattern.test(delta.baseAuditSha256)||delta.baseAuditSha256!==auditSha256)throw Error('Frozen audit has changed');
 if(typeof verifyOriginal!=='function')throw Error('Original verifier is required');
 if(!Array.isArray(delta.promotions)||!delta.promotions.length)throw Error('Pass reviewed alternative promotions');
 const result=structuredClone(audit),seen=new Set(),promoted=[];
 for(const p of delta.promotions){
  const k=tuple(p);
  if(!p.workId||!p.videoId||!p.memberId||seen.has(k))throw Error('Duplicate or incomplete exact-video tuple: '+k);
  seen.add(k);
  if(p.review?.approved!==true||p.review?.actual3By4Reviewed!==true||p.review?.sourceNamed!==true||p.review?.exactVideoIdVerified!==true||!p.review?.reason)throw Error('Missing completed source and 3:4 review: '+k);
  const selected=result.identityImages.filter(x=>tuple(x)===k);
  if(selected.length!==1)throw Error('No unique existing selected identity for exact video: '+k);
  const before=selected[0];
  if(before.sha256!==p.expectedBefore?.sha256||before.src!==p.expectedBefore?.src||before.qualityTier!=='card_only'||p.expectedBefore.qualityTier!=='card_only')throw Error('Selected original SHA/path/quality differs: '+k);
  for(const field of ['id','width','height','byteLength'])if(p.expectedBefore[field]!==undefined&&p.expectedBefore[field]!==before[field])throw Error('Selected original metadata differs: '+k);
  const alternatives=result.alternateIdentityImages.filter(x=>tuple(x)===k&&x.sha256===p.afterSha256&&x.src===p.afterSrc);
  if(alternatives.length!==1)throw Error('No unique reviewed existing alternative: '+k);
  const candidate=alternatives[0];
  for(const [field,value] of Object.entries(p.after??{}))if(candidate[field]!==value)throw Error('Alternative metadata differs: '+field);
  if(candidate.qualityTier!=='source_resolution'||candidate.identityBasis!=='source_named'||candidate.faceIdentityInferred!==false||candidate.contactSheetReviewed!==true||candidate.preserveOriginal!==true||candidate.sourcePixelsVerified!==true||candidate.exactVideoEvidence?.videoId!==p.videoId||candidate.exactVideoEvidence?.sourceEmbedsExactVideo!==true||!candidate.sourcePageUrl?.startsWith('https://')||!candidate.sourceImageUrl?.startsWith('https://')||!candidate.label)throw Error('Alternative lacks reviewed exact-video provenance: '+k);
  const ratingId=before.ratingId??before.id?.split(':')[0];
  if(ratingId&&candidate.ratingId!==ratingId)throw Error('Existing rating identity differs: '+k);
  assertOriginalMetadata(before);assertOriginalMetadata(candidate);assertCrop(p.sourceCrop,candidate);
  verifyOriginal(before);verifyOriginal(candidate);
  const after={...candidate,sourceCrop:structuredClone(p.sourceCrop),objectPosition:'50% 50%',effectivePortraitWidth:p.sourceCrop.width,displayAspectRatio:'3:4',displayCropReview:{checkedAt:delta.checkedAt,method:'reviewed_existing_alternative_actual_3_by_4_before_after',identityInferredFromFace:false,reason:p.review.reason,previous:{sourceCrop:candidate.sourceCrop??null,objectPosition:candidate.objectPosition??'50% 50%'}}};
  result.identityImages[result.identityImages.indexOf(before)]=after;
  result.alternateIdentityImages.splice(result.alternateIdentityImages.indexOf(candidate),1);
  result.alternateIdentityImages.push(before);
  promoted.push({workId:p.workId,videoId:p.videoId,memberId:p.memberId,beforeSha256:before.sha256,afterSha256:after.sha256,beforeSrc:before.src,afterSrc:after.src});
 }
 const rows=result.identityImages,unique=[...new Map(rows.map(p=>[p.src,p])).values()];
 Object.assign(result.summary,{identityImages:rows.length,identityUniqueFiles:unique.length,identityBytes:unique.reduce((sum,p)=>sum+p.byteLength,0),cardOnlyImages:rows.filter(p=>p.qualityTier==='card_only').length,identitySourceCrops:rows.filter(p=>p.sourceCrop).length,evidenceLevels:rows.reduce((o,p)=>(o[p.evidenceLevel]=(o[p.evidenceLevel]??0)+1,o),{})});
 return {audit:result,promoted};
}

async function main(){
 const args=process.argv.slice(2),apply=args.includes('--apply'),files=args.filter(x=>x!=='--apply');
 if(files.length!==1||files[0].startsWith('-'))throw Error('Pass one reviewed promotion delta JSON; optional --apply');
 const auditPath=path.resolve(root,'../../docs/codex/mv-identity-asset-audit-20261025.json'),original=fs.readFileSync(auditPath),baseSha=sha256(original),delta=JSON.parse(fs.readFileSync(files[0],'utf8'));
 const {imageSize}=await import('image-size');
 const publicRoot=fs.realpathSync(path.join(root,'public'));
 const verifyOriginal=p=>{
  const file=fs.realpathSync(path.resolve(publicRoot,'.'+p.src));
  if(!file.startsWith(publicRoot+path.sep))throw Error('Original escapes public asset directory');
  const bytes=fs.readFileSync(file),dimensions=imageSize(bytes);
  if(bytes.length!==p.byteLength||sha256(bytes)!==p.sha256)throw Error('Original SHA/bytes changed: '+p.src);
  if(dimensions.width!==p.width||dimensions.height!==p.height)throw Error('Original dimensions differ: '+p.src);
 };
 const {audit,promoted}=planIdentityAlternativePromotions(JSON.parse(original),delta,verifyOriginal,baseSha);
 if(apply){
  if(sha256(fs.readFileSync(auditPath))!==baseSha)throw Error('Frozen audit changed before apply');
  audit.checkedAt=delta.checkedAt;
  audit.qualityPromotion20261026={promotedBindings:promoted.length,sources:[path.relative(path.resolve(root,'../..'),path.resolve(files[0])).replaceAll('\\','/')],promoted,actual3By4ContactSheetsReviewed:delta.summary?.actual3By4ContactSheetsReviewed??0,formerSelectionsPreserved:true,originalBytesPreserved:true,existingRelationshipsOnly:true};
  fs.writeFileSync(auditPath,JSON.stringify(audit,null,2)+'\n');
 }
 console.log(JSON.stringify({applied:apply,promoted:promoted.length,baseAuditSha256:baseSha,summary:audit.summary}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await main();
