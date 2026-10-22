import {validSourceNamedPhotoProof,type SourceNamedPhotoProof} from './photo-source-proof';
import {appendPhotoCandidates} from './photo-append-candidates';
// Server projection/import policy only. Never import this approval registry into
// browser components. Raw attachment fields are claims, not approval evidence.
type MvLookApprovalBase={
 candidateId:string;evidenceId:string;ratingId:string;memberId:string;workId:string;videoId:string;
 sha256:string;sourcePageUrl:string;sourceImageUrl:string;mime:string;byteLength:number;width:number;height:number;
 sameLook:true;lookBasis:'exact_mv_visual_match'|'exact_mv_shoot_provenance';
};
export type MvLookApproval=Readonly<MvLookApprovalBase&(SourceNamedPhotoProof|{
 identityBasis:'owner_confirmed';
 ownerConfirmation:Readonly<{messageId:string;confirmed:true;sha256:string;memberId:string;workId:string;videoId:string}>;
})>;
// A single immutable, server-only registry binds import and projection. The
// evidence ID is SHA-256 of the reviewed candidate metadata (before evidenceId),
// serialized as UTF-8 JSON with sorted keys, no whitespace, literal Unicode.
export const approvedMvLookPhotos:readonly MvLookApproval[]=Object.freeze(appendPhotoCandidates.filter(a=>a.identityBasis!=='source_named'||validSourceNamedPhotoProof(a)).map(a=>Object.freeze({
 candidateId:a.id,evidenceId:a.evidenceId,ratingId:a.ratingId,memberId:a.memberId,workId:a.workId,videoId:a.videoId,
 sha256:a.sha256,sourcePageUrl:a.sourcePageUrl,sourceImageUrl:a.sourceImageUrl,mime:a.mime,byteLength:a.byteLength,width:a.width,height:a.height,
 sameLook:true as const,lookBasis:a.identityBasis==='source_named'?a.lookBasis:'exact_mv_visual_match' as const,
 ...(a.identityBasis==='source_named'?{
 identityBasis:'source_named' as const,sourceIdentityName:a.sourceIdentityName,identityEvidence:a.identityEvidence,identitySelector:a.identitySelector,
 sourceSnapshotSha256:a.sourceSnapshotSha256,sourceName:a.sourceName,sourceCredit:a.sourceCredit,
 lookEvidence:a.lookEvidence,lookEvidenceUrl:a.lookEvidenceUrl,lookEvidenceSelector:a.lookEvidenceSelector,lookEvidenceSnapshotSha256:a.lookEvidenceSnapshotSha256,
 }:{identityBasis:'owner_confirmed' as const,ownerConfirmation:Object.freeze({messageId:a.ownerConfirmationMessageId,confirmed:true as const,sha256:a.sha256,memberId:a.memberId,workId:a.workId,videoId:a.videoId})}),
})));
export type MvLookTarget={ratingId:string;memberIds:readonly string[];workIds:readonly string[];videoId:string|null;memberExists:boolean;workExists:boolean};
const object=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value);
const https=(value:string)=>{try{return new URL(value).protocol==='https:';}catch{return false;}};
export function approvedMvLookPhoto(raw:unknown,target:MvLookTarget,approvals:readonly MvLookApproval[]=approvedMvLookPhotos):MvLookApproval|null{
 if(!object(raw)||raw.source_kind!=='mv_look_photo'||target.memberIds.length!==1||target.workIds.length!==1||!target.memberExists||!target.workExists||!target.videoId)return null;
 const matches=approvals.filter(a=>a.candidateId===raw.candidate_id);
 if(matches.length!==1)return null;
 const a=matches[0];
 if(a.sameLook!==true||!['source_named','owner_confirmed'].includes(a.identityBasis)||!['exact_mv_visual_match','exact_mv_shoot_provenance'].includes(a.lookBasis)||!a.candidateId||!/^[a-f0-9]{64}$/.test(a.evidenceId)||!/^[a-f0-9]{64}$/.test(a.sha256)||!https(a.sourcePageUrl)||!https(a.sourceImageUrl)||!['image/jpeg','image/png','image/webp'].includes(a.mime)||![a.byteLength,a.width,a.height].every(x=>Number.isSafeInteger(x)&&x>0))return null;
 if(a.identityBasis==='source_named'&&!validSourceNamedPhotoProof(a))return null;
 if(a.identityBasis==='owner_confirmed'){
  const c=a.ownerConfirmation;
  // This must be the actual affirmative owner reply, not the question sent to
  // the owner. Reviewers pin it in the immutable server approval, never in a
  // browser request or an attachment's self-declared identity fields.
  if(!c||c.confirmed!==true||typeof c.messageId!=='string'||!c.messageId.trim()||c.sha256!==a.sha256||c.memberId!==a.memberId||c.workId!==a.workId||c.videoId!==a.videoId)return null;
 }
 if(a.ratingId!==target.ratingId||a.memberId!==target.memberIds[0]||a.workId!==target.workIds[0]||a.videoId!==target.videoId)return null;
 if(raw.member_id!==a.memberId||raw.work_id!==a.workId||raw.exact_video_id!==a.videoId||raw.evidence_id!==a.evidenceId||raw.file_token!=='native_photo_'+a.sha256||raw.source_url!==a.sourcePageUrl||raw.source_image_url!==a.sourceImageUrl||raw.type!==a.mime||raw.size!==a.byteLength||raw.width!==a.width||raw.height!==a.height)return null;
 return a;
}
