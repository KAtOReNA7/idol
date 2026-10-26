// This receipt applies only the four reviewed, not-yet-published K selections.
// It neither creates a relationship nor removes the former original or evidence.
import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';import {fileURLToPath} from 'node:url';import {createRequire} from 'node:module';
import {validateIdentityCandidate,planIdentityBatch} from '../../../../apps/idol-site/scripts/import-mv-identity-batch.mjs';
const folder=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(folder,'../../../..');
const require=createRequire(path.join(root,'apps/idol-site/package.json'));const {imageSize}=require('image-size');
const sha=b=>createHash('sha256').update(b).digest('hex'),tuple=p=>[p.workId,p.videoId,p.memberId].join(':');
const file=path.join(root,'docs/codex/mv-identity-asset-audit-20261025.json'),bytes=fs.readFileSync(file),before=JSON.parse(bytes),delta=JSON.parse(fs.readFileSync(path.join(folder,'newjeans-reviewed-replacements.json'),'utf8'));
if(sha(bytes)!==delta.baseAuditSha256||delta.replacements.length!==4)throw Error('Frozen four-selection review changed');
const audit=structuredClone(before),seen=new Set(),receipts=[];
const verify=p=>{const b=fs.readFileSync(path.join(root,'apps/idol-site/public',p.src)),d=imageSize(b);if(sha(b)!==p.sha256||b.length!==p.byteLength||d.width!==p.width||d.height!==p.height)throw Error('Original evidence changed');};
for(const p of delta.replacements){
 const k=tuple(p),old=audit.identityImages.find(x=>tuple(x)===k),expected=p.replacementOf;
 if(seen.has(k)||!old||p.videoId!=='ZncbtRo7RXs'||tuple(expected)!==k||old.sha256!==expected.sha256||old.src!==expected.src||old.ratingId!==p.ratingId||old.evidenceLevel!=='source_named_frame_with_official_video_match'||p.evidenceLevel!=='official_named_mv_video_frame')throw Error('Selection differs from the reviewed exact tuple');
 seen.add(k);verify(old);validateIdentityCandidate(p,verify);
 audit.supersededBeforePublication??=[];audit.supersededBeforePublication.push({selection:old,reason:delta.reason,replacedBySha256:p.sha256});
 audit.identityImages[audit.identityImages.indexOf(old)]=p;receipts.push({workId:p.workId,videoId:p.videoId,memberId:p.memberId,previousSrc:old.src,previousSha256:old.sha256,src:p.src,sha256:p.sha256});
}
audit.summary.identitySourceRecords+=4;
const result=planIdentityBatch(audit,[],()=>{}).audit;
if(JSON.stringify(result.workCoverage)!==JSON.stringify(before.workCoverage)||result.identityImages.length!==before.identityImages.length)throw Error('Relationship coverage changed');
const receipt={baseAuditSha256:sha(bytes),reason:delta.reason,replacements:receipts,oldOriginalsPreserved:true,relationshipCoverageUnchanged:true,applied:process.argv.includes('--apply')};
if(receipt.applied){fs.writeFileSync(file,JSON.stringify(result,null,2)+'\n');fs.writeFileSync(path.join(folder,'replacement-receipt.json'),JSON.stringify(receipt,null,2)+'\n');}
console.log(JSON.stringify(receipt));
