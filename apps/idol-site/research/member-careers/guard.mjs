/** Pure offline planning only. No database, transport, filesystem, UI, or credentials. */
import {createHash} from 'node:crypto';
export const PUBLIC_FIELDS = Object.freeze(['name','stageName','cnName','role','status','profile','officialUrl']);
const PATCH_FIELDS = new Set(['profile','role','officialUrl']);
export function stableJSON(value) {
  if (Array.isArray(value)) return '[' + value.map(stableJSON).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(k => JSON.stringify(k)+':'+stableJSON(value[k])).join(',') + '}';
  if (value === undefined || typeof value === 'function' || (typeof value === 'number' && !Number.isFinite(value))) throw new Error('Unsupported hash value');
  return JSON.stringify(value);
}
export const hash = value => createHash('sha256').update(stableJSON(value),'utf8').digest('hex');
export function publicHash(record) {
  if (!record || PUBLIC_FIELDS.some(k => typeof record[k] !== 'string')) throw new Error('Incomplete public field projection');
  return hash(Object.fromEntries(PUBLIC_FIELDS.map(k => [k,record[k]])));
}
function sameSet(a,b) {return Array.isArray(a) && Array.isArray(b) && a.length===new Set(a).size && b.length===new Set(b).size && hash([...a].sort())===hash([...b].sort());}
/**
 * current: {memberId, publicFields: seven exact unredacted public text values,
 * groupIds: actual current+former relations, roleLabels: raw backend array,
 * targets: display target values} supplied by a trusted read adapter.
 * context: trusted checked-in adoptedClaimHashes, current backend roleOptions,
 * availableSourceIds, observedAtMs/nowMs, optional explicit overlay review receipt.
 * Caller must independently authorize any future write and atomically recheck row revision.
 */
export function planClaim(claim,current,context) {
  const reject = reason => ({ok:false,id:claim?.id ?? null,reason});
  if (!claim || !context || !current) return reject('missing_context');
  if (!['accepted','accepted_with_revision'].includes(claim.decision)) return reject('not_accepted');
  if (!['member_patch','display_overlay'].includes(claim.kind)) return reject('unsupported_kind');
  if (context.adoptedClaimHashes?.[claim.id] !== hash(claim)) return reject('untrusted_or_changed_claim');
  if (!Number.isFinite(context.nowMs) || !Number.isFinite(context.observedAtMs) || context.nowMs<context.observedAtMs || context.nowMs-context.observedAtMs>60000) return reject('fresh_read_required');
  if (current.memberId!==claim.memberId) return reject('identity_mismatch');
  if (!sameSet(current.groupIds,claim.expectedGroupIds) || !sameSet(current.currentGroupIds,claim.expectedCurrentGroupIds) || !sameSet(current.formerGroupIds,claim.expectedFormerGroupIds)) return reject('relationship_changed');
  let observed;
  try {observed=publicHash(current.publicFields);} catch {return reject('complete_public_fields_required');}
  if (observed!==claim.beforePublicHash) return reject('public_fields_changed');
  if (!Array.isArray(claim.sourceIds) || !claim.sourceIds.length || claim.sourceIds.some(s=>!context.availableSourceIds?.includes(s))) return reject('missing_source');
  if (claim.kind==='display_overlay') {
    // before:null in the research package is never an assertion of target absence.
    const expectedTarget=claim.field==='display_profile'?'profile':claim.field==='display_career_supplement'?'careerSupplement':null;
    if (!expectedTarget || expectedTarget!==claim.targetField || typeof claim.after!=='string' || !claim.after.trim()) return reject('invalid_overlay');
    if (!current.targets || !Object.hasOwn(current.targets,expectedTarget)) return reject('current_overlay_target_required');
    const receipt=context.overlayReview;
    if (!receipt || receipt.claimId!==claim.id || receipt.memberId!==claim.memberId || receipt.publicHash!==observed || receipt.targetHash!==hash(current.targets[expectedTarget]) || receipt.adoptedClaimHash!==hash(claim) || receipt.reviewed!==true) return reject('explicit_current_target_review_required');
    return {ok:true,id:claim.id,operation:'propose_display_overlay',memberId:claim.memberId,targetField:expectedTarget,value:claim.after,expectedTargetHash:receipt.targetHash,expectedPublicHash:observed};
  }
  if (!PATCH_FIELDS.has(claim.field) || claim.targetField!==claim.field) return reject('field_not_allowed');
  if (claim.field==='profile' && claim.profileExcerptOnly) return reject('excerpt_cannot_be_before');
  if (hash(current.publicFields[claim.field])!==claim.beforeValueHash) return reject('before_value_changed');
  let value=claim.after;
  if (claim.field==='role') {
    const labels=Array.isArray(value)?value:value?.roleLabels;
    if (!Array.isArray(labels) || !labels.length || labels.some(x=>typeof x!=='string') || new Set(labels).size!==labels.length || !(Array.isArray(current.roleLabels) || current.roleLabels===null)) return reject('invalid_role_array');
    if (hash(current.roleLabels)!==claim.beforeRoleValueHash) return reject('raw_role_value_changed');
    if ((current.roleLabels??[]).join('')!==current.publicFields.role) return reject('role_projection_mismatch');
    if (!Array.isArray(context.roleOptions) || labels.some(x=>!context.roleOptions.includes(x))) return reject('unknown_role_option');
    value=[...labels];
  } else if (typeof value!=='string' || !value.trim()) return reject('invalid_text');
  if (claim.field==='officialUrl') {
    try {const u=new URL(value);if(!['http:','https:'].includes(u.protocol) || u.username || u.password) return reject('invalid_public_url');} catch {return reject('invalid_public_url');}
  }
  return {ok:true,id:claim.id,operation:'propose_public_field_patch',memberId:claim.memberId,field:claim.field,value,expectedPublicHash:observed,expectedBeforeValueHash:claim.beforeValueHash};
}
/** Detect duplicates/conflicting targets before planning, never execute accepted subset on failure. */
export function planBatch(claims,currentById,context) {
  const ids=new Set(),targets=new Set();
  for(const c of claims){
    const target=[c.memberId,c.kind,c.targetField].join(':');
    if(ids.has(c.id)||targets.has(target))return {ok:false,reason:'duplicate_or_conflicting_target',plans:[]};
    ids.add(c.id);targets.add(target);
  }
  const results=claims.map(c=>planClaim(c,currentById[c.memberId],context));
  return results.every(r=>r.ok)?{ok:true,plans:results}:{ok:false,reason:'guard_rejected',plans:[],rejections:results.filter(r=>!r.ok)};
}
