/** Reviewed server evidence only; attachment/client declarations cannot grant approval. */
export type SourceNamedPhotoProof={
 identityBasis:'source_named';sourceIdentityName:string;identityEvidence:string;identitySelector:string;
 sourceSnapshotSha256:string;sourcePageUrl:string;sourceImageUrl:string;sourceName:string;sourceCredit:string;
 lookBasis:'exact_mv_visual_match'|'exact_mv_shoot_provenance';lookEvidence:string;lookEvidenceUrl:string;lookEvidenceSelector:string;lookEvidenceSnapshotSha256:string;
};
const text=(v:unknown):v is string=>typeof v==='string'&&v.trim().length>0;
const https=(v:unknown)=>{if(!text(v))return false;try{return new URL(v).protocol==='https:';}catch{return false;}};
const sha=(v:unknown)=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
export function validSourceNamedPhotoProof(value:unknown):value is SourceNamedPhotoProof{
 if(!value||typeof value!=='object'||Array.isArray(value))return false;
 const p=value as Record<string,unknown>;
 return p.identityBasis==='source_named'&&['exact_mv_visual_match','exact_mv_shoot_provenance'].includes(String(p.lookBasis))
  &&['sourceIdentityName','identityEvidence','identitySelector','sourceName','sourceCredit','lookEvidence','lookEvidenceSelector'].every(k=>text(p[k]))
  &&['sourcePageUrl','sourceImageUrl','lookEvidenceUrl'].every(k=>https(p[k]))
  &&sha(p.sourceSnapshotSha256)&&sha(p.lookEvidenceSnapshotSha256)
  &&!('ownerConfirmation' in p)&&!('ownerConfirmationMessageId' in p)&&!('ownerConfirmationQuestionId' in p);
}
