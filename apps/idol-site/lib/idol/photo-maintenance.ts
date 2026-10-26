import {env} from 'cloudflare:workers';
import approved from '@/data/photo-import-candidates.json';
import {appendPhotoCandidates,type AppendPhotoCandidate} from './photo-append-candidates';
import {photoRegistryBudget,PHOTO_UPLOAD_HARD_LIMIT} from './photo-import-limits';
import {validSourceNamedPhotoProof} from './photo-source-proof';
import {AppError} from './feishu';
import {F} from './fields';
import {asIds,asUrl,videoId} from './values';
import {hash} from './hash';
import {bytesHash,mediaKey} from './native-format';
import {imageHeader} from './image-integrity';
import {nativeDb,ownControl,nativeRow,nativeSchema,assertSourceUnchanged,type StorageControl} from './native-storage';
import {nativeRevision} from './native-save';
type Candidate=typeof approved.candidates[number]|AppendPhotoCandidate;
const isAppend=(a:Candidate):a is AppendPhotoCandidate=>'mode' in a&&a.mode==='append-look-preserve-reference';
const candidates=()=>{const all=[...approved.candidates,...appendPhotoCandidates];photoRegistryBudget(all);return all;};
// Legacy batch identity MUST remain byte-for-byte compatible with prepared jobs.
const candidateHash=(a:Candidate)=>hash({batch:isAppend(a)?a.candidateVersion:approved.version,candidate:a});
// c is obtained only from control(userId)/ownControl, never request input.
// Site-auth user IDs and Sites management account UUIDs are different namespaces.
function assertCandidateOwner(a:Candidate,userId:string,c:StorageControl){if(isAppend(a)&&(a.ownerScope!=='current-native-project-owner'||c.owner_id!==userId||c.mode!=='native'||!c.active_snapshot||!(a.identityBasis==='source_named'?validSourceNamedPhotoProof(a):(a.identityBasis===undefined||a.identityBasis==='owner_confirmed')&&!!a.ownerConfirmationMessageId&&!!a.ownerConfirmationQuestionId)||!a.decodedPixelsVerified||a.kind!=='mv_look_photo'||!a.identityEvidence||!a.sourcePageUrl||!a.sourceImageUrl||!a.candidateVersion||!/^[a-f0-9]{64}$/.test(a.evidenceId)||a.id!==`${a.ratingId}:${a.candidateVersion}:${a.sha256}`||a.byteLength>PHOTO_UPLOAD_HARD_LIMIT))fail('PHOTO_NOT_APPROVED','这张图片尚未完成所有者及来源核验。',403);}
type Job={id:string;owner_id:string;snapshot_id:string;epoch:number;candidate_id:string;request_hash:string;candidate_hash:string;expected_revision:string;object_key:string;file_token:string;byte_length:number;status:string;before_json:string|null;result_json:string|null;created_at:number;updated_at:number};
function fail(code:string,message:string,status=409):never{throw new AppError(code,message,status);}
function candidate(id:string){const c=candidates().find(c=>c.id===id);if(!c)fail('PHOTO_NOT_APPROVED','这张图片尚未准备好，不能加入。',400);return c!;}
function id(value:unknown){if(typeof value!=='string'||!/^[a-f0-9-]{36}$/.test(value))fail('INVALID_PHOTO_OPERATION','图片操作无效，请重新打开。',400);return value as string;}
function files(){if(!env.BUCKET)fail('FILES_NOT_READY','图片存储暂不可用。',503);return env.BUCKET!;}
async function control(userId:string){const c=await ownControl(userId);if(c?.mode!=='native'||!c.active_snapshot)fail('STORAGE_CHANGING','资料正在整理，请稍后再试。');const g=await nativeDb().prepare('SELECT generation FROM idol_catalog_state WHERE user_id=?').bind(userId).first();if(!g)fail('NATIVE_DATA_MISSING','资料暂时无法读取，请稍后重试。',503);return c! as StorageControl&{active_snapshot:string};}
const targetReads={row:nativeRow,schema:nativeSchema,schemaRow:(key:string)=>nativeDb().prepare('SELECT key,fields_json FROM idol_native_fields WHERE key=?').bind(key).first<{key:string;fields_json:string}>()};
// Only the read-only status response shares these promises. Never cache ratings:
// multiple candidates for one rating must still observe its latest revision.
// Failed reads are retried normally for each candidate; caches die with this response.
function statusTargetReads(){
 const rows=new Map<string,ReturnType<typeof nativeRow>>(),schemas=new Map<string,ReturnType<typeof nativeSchema>>(),schemaRows=new Map<string,ReturnType<typeof targetReads.schemaRow>>();
 return {
  row:(...args:Parameters<typeof nativeRow>)=>{if(args[1]==='ratings')return nativeRow(...args);const key=JSON.stringify(args);if(!rows.has(key)){const pending=nativeRow(...args);rows.set(key,pending);void pending.catch(()=>rows.delete(key));}return rows.get(key)!;},
  schema:(...args:Parameters<typeof nativeSchema>)=>{const key=JSON.stringify(args);if(!schemas.has(key)){const pending=nativeSchema(...args);schemas.set(key,pending);void pending.catch(()=>schemas.delete(key));}return schemas.get(key)!;},
  schemaRow:(key:string)=>{if(!schemaRows.has(key)){const pending=targetReads.schemaRow(key);schemaRows.set(key,pending);void pending.then(row=>{if(!row)schemaRows.delete(key);},()=>schemaRows.delete(key));}return schemaRows.get(key)!;},
 };
}
async function target(c:StorageControl&{active_snapshot:string},a:Candidate,reads=targetReads){
 const [row,work,member,schema]=await Promise.all([reads.row(c.active_snapshot,'ratings',a.ratingId),reads.row(c.active_snapshot,'works',a.workId),reads.row(c.active_snapshot,'members',a.memberId),reads.schema(c.active_snapshot,'ratings')]);
 if(!schema.some(f=>f.field_id===F.ratings.photo&&f.type===17))fail('SCHEMA_CHANGED','造型图的资料格式已变化，请重新核对。');
 const raw=JSON.parse(row.fields_json),w=JSON.parse(work.fields_json),members=asIds(raw[F.ratings.members]),works=asIds(raw[F.ratings.works]);
 if(members.length!==1||members[0]!==a.memberId||works.length!==1||works[0]!==a.workId||videoId(asUrl(w[F.works.url]))!==a.videoId)fail('PHOTO_TARGET_CHANGED','这条记录的成员或 MV 已变化，请先重新核对图片。');
 const old=raw[F.ratings.photo];if(old!==null&&old!==undefined&&(!Array.isArray(old)||(!isAppend(a)&&old.length)))fail('PHOTO_ALREADY_PRESENT','这条造型记录已有图片，未替换原图。');
 const photos=old??[];if(isAppend(a)&&photos.length>20)fail('PHOTO_ATTACHMENT_LIMIT','这条记录的图片已达到安全范围。');
 const schemas:{key:string;fields_json:string}[]=[];
 if(isAppend(a))for(const table of ['ratings','works','members']){const schemaRow=await reads.schemaRow(c.active_snapshot+':'+table);if(!schemaRow)fail('SCHEMA_CHANGED','资料格式已变化，请重新核对。');schemas.push(schemaRow!);}
 return {row,work,member,raw,photos,schemas};
}
type PreservedPhotoState={mode:'append-look-preserve-reference';photoDigest:string;photos:unknown[];objects:{key:string;fileToken:string;objectKey:string;sha256:string;byteLength:number;contentType:string}[]};
async function preservedPhotos(snapshotId:string,photos:any[]):Promise<PreservedPhotoState>{
 const objects:PreservedPhotoState['objects']=[];
 for(const photo of photos){
  if(!photo||typeof photo.file_token!=='string')fail('PHOTO_REFERENCE_UNAVAILABLE','原图标识不完整，未加入新图。');
  const key=mediaKey(snapshotId,photo.file_token),m=await nativeDb().prepare('SELECT * FROM idol_native_media WHERE key=?').bind(key).first<any>();
  if(!m||m.snapshot_id!==snapshotId||m.file_token!==photo.file_token||m.status!=='complete'||!m.object_key||!/^[a-f0-9]{64}$/.test(m.sha256)||!Number.isSafeInteger(m.byte_length))fail('PHOTO_REFERENCE_UNAVAILABLE','原图尚未完整备份，未加入新图。');
  const object=await files().get(m.object_key);if(!object)fail('PHOTO_REFERENCE_UNAVAILABLE','原图暂时无法读取，未加入新图。');
  if(object.size!==m.byte_length){await object.body.cancel();fail('PHOTO_REFERENCE_UNAVAILABLE','原图备份大小不一致，未加入新图。');}
  if(await bytesHash(new Uint8Array(await object.arrayBuffer()))!==m.sha256)fail('PHOTO_REFERENCE_UNAVAILABLE','原图备份校验失败，未加入新图。');
  objects.push({key,fileToken:m.file_token,objectKey:m.object_key,sha256:m.sha256,byteLength:m.byte_length,contentType:m.content_type});
 }
 return {mode:'append-look-preserve-reference',photoDigest:await hash(photos),photos,objects};
}
async function assertPreserved(j:Job,photos:any[]){
 let saved:PreservedPhotoState;try{saved=JSON.parse(j.before_json??'null');}catch{fail('PHOTO_REFERENCE_CHANGED','原图核验记录无效，请重新核对。');}
 if(!saved!||saved.mode!=='append-look-preserve-reference'||saved.photoDigest!==await hash(photos))fail('PHOTO_REFERENCE_CHANGED','原图列表已变化，未加入新图。');
 const current=await preservedPhotos(j.snapshot_id,photos);
 if(await hash(current)!==await hash(saved!))fail('PHOTO_REFERENCE_CHANGED','原图备份已变化，未加入新图。');
}
async function ownJob(userId:string,operationId:string){const c=await ownControl(userId),j=await nativeDb().prepare('SELECT * FROM idol_photo_imports WHERE id=?').bind(id(operationId)).first<Job>();if(!c||c.owner_id!==userId||!j||j.owner_id!==userId)fail('PHOTO_OPERATION_MISSING','没有找到这次图片操作。',404);return j!;}
function result(j:Job){return j.status==='done'&&j.result_json?JSON.parse(j.result_json):{operationId:j.id,status:j.status,saved:false};}
export async function photoImportOptions(userId:string){const c=await control(userId),jobs=(await nativeDb().prepare('SELECT * FROM idol_photo_imports WHERE owner_id=? AND snapshot_id=?').bind(userId,c.active_snapshot).all<Job>()).results;
 const reads=statusTargetReads(),options=[];for(const a of candidates()){const job=jobs.find(j=>j.candidate_id===a.id);let revision:string|null=null,state=job?.status==='done'?'done':job?'pending':'ready',message='';if(job&&job.status!=='done'&&(job.status==='storage-blocked'||job.epoch!==c.epoch)){state='unavailable';message=job.status==='storage-blocked'?'图片存储曾提示容量限制，请先检查存储后再重新核对。':'资料存储已变化，这张图片需重新核对后再加入。';}try{assertCandidateOwner(a,userId,c);const t=await target(c,a,reads);revision=t.row.revision;}catch(e){if(state!=='done'){state='unavailable';message=e instanceof AppError?e.message:'资料暂未打开。';}}
 options.push({id:a.id,memberName:a.memberName,song:a.song,version:a.version,sourceUrl:a.sourcePageUrl,sourceName:'sourceName' in a && typeof a.sourceName==='string'?a.sourceName:'Vogue Singapore',kindLabel:a.kind==='mv_still'?'本 MV 截图':'MV 同造型照片',fileName:a.fileName,sha256:a.sha256,byteLength:a.byteLength,width:a.width,height:a.height,state,message,revision,operationId:job?.id??null,workUrl:'/?view=works&work='+encodeURIComponent(a.workId),...(job?.status==='done'?{downloadUrl:'/api/manage/photos?download='+encodeURIComponent(job.id)}:{})});}
 await assertSourceUnchanged(userId,c);return {ready:true,batch:approved.version,candidates:options};
}
export async function preparePhotoImport(userId:string,input:any){
 if(!input||Object.keys(input).sort().join(',')!=='candidateId,operationId,revision'||typeof input.candidateId!=='string'||typeof input.revision!=='string'||!/^[a-f0-9]{64}$/.test(input.revision))fail('INVALID_PHOTO_OPERATION','图片准备内容无效。',400);
 const operationId=id(input.operationId),a=candidate(input.candidateId),c=await control(userId),db=nativeDb(),candidateDigest=await candidateHash(a),requestHash=await hash({candidateHash:candidateDigest,revision:input.revision});
 assertCandidateOwner(a,userId,c);const budget=photoRegistryBudget(candidates());
 const prior=await db.prepare('SELECT * FROM idol_photo_imports WHERE id=?').bind(operationId).first<Job>();
 if(prior){if(prior.owner_id!==userId||prior.request_hash!==requestHash||prior.candidate_hash!==candidateDigest)fail('IDEMPOTENCY_CONFLICT','同一次图片操作内容不同，未重复处理。');return result(prior);}
 const existing=await db.prepare('SELECT * FROM idol_photo_imports WHERE owner_id=? AND snapshot_id=? AND candidate_id=?').bind(userId,c.active_snapshot,a.id).first<Job>();if(existing){if(existing.candidate_hash!==candidateDigest)fail('PHOTO_CANDIDATE_CHANGED','图片资料已更新，请重新核对。');return result(existing);}
 const t=await target(c,a);if(t.row.revision!==input.revision)fail('EDIT_CONFLICT','这条记录刚刚更新，请重新打开后再加入图片。');const before=isAppend(a)?JSON.stringify(await preservedPhotos(c.active_snapshot,t.photos)):null;const now=Date.now();
 await db.prepare(`INSERT OR IGNORE INTO idol_photo_imports (id,owner_id,snapshot_id,epoch,candidate_id,request_hash,candidate_hash,expected_revision,object_key,file_token,byte_length,status,before_json,created_at,updated_at)
 SELECT ?,?,?,?,?,?,?,?,?,?,?,'prepared',?,?,? FROM idol_native_records r JOIN idol_storage_control c ON c.id='main'
 WHERE r.key=? AND r.revision=? AND c.owner_id=? AND c.mode='native' AND c.active_snapshot=? AND c.epoch=? AND EXISTS(SELECT 1 FROM idol_catalog_state WHERE user_id=?)
 AND EXISTS(SELECT 1 FROM idol_native_records WHERE key=? AND revision=?) AND EXISTS(SELECT 1 FROM idol_native_records WHERE key=? AND revision=?)
 AND NOT EXISTS(SELECT 1 FROM json_each(?) s LEFT JOIN idol_native_fields f ON f.key=json_extract(s.value,'$.key') WHERE f.fields_json IS NOT json_extract(s.value,'$.fields_json'))
 AND (SELECT coalesce(sum(byte_length),0) FROM idol_photo_imports WHERE owner_id=?) + ? <= ?`).bind(operationId,userId,c.active_snapshot,c.epoch,a.id,requestHash,candidateDigest,input.revision,'photos/'+a.sha256,'native_photo_'+a.sha256,a.byteLength,before,now,now,t.row.key,t.row.revision,userId,c.active_snapshot,c.epoch,userId,t.work.key,t.work.revision,t.member.key,t.member.revision,JSON.stringify(t.schemas),userId,a.byteLength,budget).run();
 const written=await db.prepare('SELECT * FROM idol_photo_imports WHERE owner_id=? AND snapshot_id=? AND candidate_id=?').bind(userId,c.active_snapshot,a.id).first<Job>();if(!written)fail('PHOTO_PREPARE_CONFLICT','资料已更新或本批图片已达到容量范围，请重新核对。');if(written!.candidate_hash!==candidateDigest)fail('PHOTO_CANDIDATE_CHANGED','图片资料已变化，请重新核对。');return result(written!);
}
async function verifiedObject(a:Candidate,key:string){const o=await files().get(key);if(!o)return null;if(o.size!==a.byteLength){await o.body.cancel();fail('PHOTO_STORED_MISMATCH','已上传图片与原图不一致，已停止处理。');}const b=new Uint8Array(await o.arrayBuffer());if(await bytesHash(b)!==a.sha256)fail('PHOTO_STORED_MISMATCH','已上传图片校验未通过，已停止处理。');return b;}
// Resolve the authenticated immutable operation before consuming any upload body.
export async function photoImportUploadLimit(userId:string,operationId:string){
 const j=await ownJob(userId,operationId),a=candidate(j.candidate_id);photoRegistryBudget(candidates());
 if(j.byte_length!==a.byteLength||await candidateHash(a)!==j.candidate_hash)fail('PHOTO_CANDIDATE_CHANGED','图片资料已变化，未继续加入。');
 if(j.status!=='prepared'&&j.status!=='done')fail('PHOTO_OPERATION_UNRESOLVED','上次图片操作尚未确认，请稍后核对。');
 return a.byteLength;
}
export async function uploadPhotoImport(userId:string,operationId:string,bytes:Uint8Array|null){
 let j=await ownJob(userId,operationId);if(j.status==='done')return result(j);if(j.status!=='prepared')fail('PHOTO_OPERATION_UNRESOLVED','上次图片操作尚未确认，请稍后核对。');
 try {
 const a=candidate(j.candidate_id),c=await control(userId);assertCandidateOwner(a,userId,c);if(await candidateHash(a)!==j.candidate_hash)fail('PHOTO_CANDIDATE_CHANGED','图片资料已变化，未继续加入。');if(c.active_snapshot!==j.snapshot_id||c.epoch!==j.epoch)fail('STORAGE_CHANGING','资料存储已变化，未继续加入图片。');
 const initial=await target(c,a);if(isAppend(a))await assertPreserved(j,initial.photos); // Refuse a different target before any object mutation.
 if(bytes&&(bytes.length!==a.byteLength||await bytesHash(bytes)!==a.sha256))fail('PHOTO_FILE_MISMATCH','选择的文件与这张造型图不一致，请重新选择。',400);
 let stored=await verifiedObject(a,j.object_key);
 if(!stored){if(!bytes)fail('PHOTO_UPLOAD_NEEDED','尚未收到图片，请重新选择原文件。',400);const info=imageHeader(bytes);if(info.mime!==a.mime||info.width!==a.width||info.height!==a.height)fail('PHOTO_FILE_MISMATCH','图片格式或尺寸不一致，未加入。',400);
  // The exact SHA allowlist is tied to complete offline pixel decoding; header
  // sniffing alone is never treated as proof of a decodable approved image.
  await files().put(j.object_key,bytes,{onlyIf:{etagDoesNotMatch:'*'},sha256:a.sha256,httpMetadata:{contentType:a.mime}});
  stored=await verifiedObject(a,j.object_key);if(!stored)fail('PHOTO_UPLOAD_UNCONFIRMED','图片上传结果尚未确认，请核对后继续。',503);
 }
 const fresh=await control(userId);if(fresh.active_snapshot!==j.snapshot_id||fresh.epoch!==j.epoch)fail('STORAGE_CHANGING','资料存储已变化，图片保留待核对。');
 // Read current values AFTER upload. Concurrent personal scores are kept, never
 // copied from the earlier prepare snapshot. The atomic CAS still rejects a
 // change between this fresh read and the commit itself.
 const t=await target(fresh,a),db=nativeDb(),existing=await db.prepare('SELECT * FROM idol_native_media WHERE key=?').bind(mediaKey(j.snapshot_id,j.file_token)).first<any>();
 if(isAppend(a))await assertPreserved(j,t.photos);
 if(existing&&(existing.snapshot_id!==j.snapshot_id||existing.file_token!==j.file_token||existing.status!=='complete'||existing.object_key!==j.object_key||existing.sha256!==a.sha256||existing.byte_length!==a.byteLength||existing.content_type!==a.mime))fail('PHOTO_STORED_MISMATCH','已有图片索引不一致，已停止处理。');
 const attachment={file_token:j.file_token,name:a.fileName,size:a.byteLength,type:a.mime,source_kind:a.kind,source_url:a.sourcePageUrl,source_image_url:a.sourceImageUrl,source_credit:a.sourceCredit,exact_video_id:a.videoId,member_id:a.memberId,work_id:a.workId,timestamp_seconds:a.timestampSeconds,source_checked_at:a.verifiedAt,...(isAppend(a)?{candidate_id:a.id,candidate_version:a.candidateVersion,evidence_id:a.evidenceId,width:a.width,height:a.height,...(a.identityBasis==='source_named'?{}:{identity_confirmation_message_id:a.ownerConfirmationMessageId})}:{} )};
 const next={...t.raw,[F.ratings.photo]:[...t.photos,attachment]},version=t.row.version+1,revision=await nativeRevision(j.snapshot_id,'ratings',a.ratingId,version,next),now=Date.now(),done={saved:true,verified:true,status:'done',operationId:j.id,candidateId:a.id,revision,sha256:a.sha256,byteLength:a.byteLength,savedAt:new Date(now).toISOString(),downloadUrl:'/api/manage/photos?download='+encodeURIComponent(j.id)};
 const gate="EXISTS(SELECT 1 FROM idol_photo_imports p WHERE p.id=? AND p.owner_id=? AND p.snapshot_id=? AND p.status='committing')",bindGate=[j.id,userId,j.snapshot_id];
 await db.batch([
  db.prepare(`UPDATE idol_photo_imports SET status='committing',before_json=?,result_json=?,updated_at=? WHERE id=? AND owner_id=? AND snapshot_id=? AND status='prepared'
   AND EXISTS(SELECT 1 FROM idol_native_records r JOIN idol_storage_control c ON c.id='main' WHERE r.key=? AND r.revision=? AND c.owner_id=? AND c.mode='native' AND c.active_snapshot=? AND c.epoch=?)
   AND EXISTS(SELECT 1 FROM idol_native_records WHERE key=? AND revision=?) AND EXISTS(SELECT 1 FROM idol_native_records WHERE key=? AND revision=?) AND EXISTS(SELECT 1 FROM idol_catalog_state WHERE user_id=?)
   AND EXISTS(SELECT 1 FROM idol_native_fields f, json_each(f.fields_json) v WHERE f.key=? AND json_extract(v.value,'$.field_id')=? AND json_extract(v.value,'$.type')=17)
   AND NOT EXISTS(SELECT 1 FROM json_each(?) s LEFT JOIN idol_native_fields f ON f.key=json_extract(s.value,'$.key') WHERE f.fields_json IS NOT json_extract(s.value,'$.fields_json'))
   AND NOT EXISTS(SELECT 1 FROM json_each(?) s LEFT JOIN idol_native_media m ON m.key=json_extract(s.value,'$.key') WHERE m.status IS NOT 'complete' OR m.snapshot_id IS NOT ? OR m.file_token IS NOT json_extract(s.value,'$.fileToken') OR m.object_key IS NOT json_extract(s.value,'$.objectKey') OR m.sha256 IS NOT json_extract(s.value,'$.sha256') OR m.byte_length IS NOT json_extract(s.value,'$.byteLength') OR m.content_type IS NOT json_extract(s.value,'$.contentType'))
   AND NOT EXISTS(SELECT 1 FROM idol_native_media WHERE key=? AND (snapshot_id IS NOT ? OR file_token IS NOT ? OR status<>'complete' OR object_key IS NOT ? OR sha256 IS NOT ? OR byte_length IS NOT ? OR content_type IS NOT ?))`).bind(JSON.stringify({fields:t.raw,revision:t.row.revision,evidence:a,...(isAppend(a)?{prepared:JSON.parse(j.before_json!)}:{})}),JSON.stringify(done),now,j.id,userId,j.snapshot_id,t.row.key,t.row.revision,userId,j.snapshot_id,j.epoch,t.work.key,t.work.revision,t.member.key,t.member.revision,userId,j.snapshot_id+':ratings',F.ratings.photo,JSON.stringify(t.schemas),isAppend(a)?JSON.stringify(JSON.parse(j.before_json!).objects):'[]',j.snapshot_id,mediaKey(j.snapshot_id,j.file_token),j.snapshot_id,j.file_token,j.object_key,a.sha256,a.byteLength,a.mime),
  db.prepare(`INSERT OR IGNORE INTO idol_native_media (key,snapshot_id,file_token,status,object_key,sha256,byte_length,content_type,error,updated_at) SELECT ?,?,?,'complete',?,?,?,?,NULL,? WHERE ${gate}`).bind(mediaKey(j.snapshot_id,j.file_token),j.snapshot_id,j.file_token,j.object_key,a.sha256,a.byteLength,a.mime,now,...bindGate),
  db.prepare(`UPDATE idol_native_records SET fields_json=?,revision=?,version=?,updated_at=? WHERE key=? AND revision=? AND ${gate}`).bind(JSON.stringify(next),revision,version,now,t.row.key,t.row.revision,...bindGate),
  db.prepare(`UPDATE idol_catalog_state SET generation=generation+1,snapshot_id=NULL,checksum=NULL,part_count=NULL,captured_at=NULL WHERE user_id=? AND ${gate}`).bind(userId,...bindGate),
  db.prepare("UPDATE idol_photo_imports SET status='done' WHERE id=? AND owner_id=? AND snapshot_id=? AND status='committing'").bind(...bindGate),
 ]);
 j=await ownJob(userId,j.id);if(j.status!=='done')fail('EDIT_CONFLICT','这条记录刚刚更新，图片已保留，请核对后继续。');return result(j);
 }catch(error){const settled=await ownJob(userId,j.id);if(settled.status==='done')return result(settled);if(/quota|billing|upgrade|insufficient.{0,20}(?:storage|space)|storage.{0,20}(?:limit|full)|capacity|no space/i.test(typeof error==='object'&&error!==null&&'message' in error&&typeof error.message==='string'?error.message:typeof error==='string'?error:'')){await nativeDb().prepare("UPDATE idol_photo_imports SET status='storage-blocked',updated_at=? WHERE id=? AND owner_id=? AND status='prepared'").bind(Date.now(),j.id,userId).run();fail('PHOTO_STORAGE_LIMIT','图片存储已提示容量限制，本批已暂停，请先检查存储。',503);}throw error;}
}
export async function downloadImportedPhoto(userId:string,operationId:string){const j=await ownJob(userId,operationId);if(j.status!=='done')fail('PHOTO_NOT_COMPLETE','图片尚未加入，暂不能下载。');const a=candidate(j.candidate_id),bytes=await verifiedObject(a,j.object_key);if(!bytes)fail('PHOTO_MISSING','原图暂时无法下载。',503);return new Response(new Uint8Array(bytes!).buffer,{headers:{'Content-Type':a.mime,'Content-Disposition':`attachment; filename="${a.fileName}"`,'Content-Length':String(a.byteLength),'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});}
