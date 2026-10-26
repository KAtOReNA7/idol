import 'server-only';
import {env} from 'cloudflare:workers';
import {AppError} from './feishu';
import {F} from './fields';
import {asText,asUrl,videoId} from './values';
import {hash} from './hash';
import {bytesHash} from './native-format';
import {boundedBytes,imageHeader} from './image-integrity';
import {ownControl,nativeRow,nativeSchema,nativeDb} from './native-storage';
import {mvPosterRegistry as registry,MV_POSTER_MAX_BYTES,MV_POSTER_MAX_CANDIDATES,MV_POSTER_MAX_FILE_BYTES,type MvPosterCandidate} from './mv-poster-registry';

type State='missing'|'verified'|'conflict'|'unknown';
function fail(code:string,message:string,status=409):never{throw new AppError(code,message,status);}
const digest=(v:string)=>/^[a-f0-9]{64}$/.test(v);
const safeId=(v:string)=>/^[A-Za-z0-9_-]{1,160}$/.test(v);
const evidenceUrl=(v:string)=>{try{const u=new URL(v);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}};
function approved(){
 const ids=new Set<string>();let total=0;
 for(const a of registry.candidates){
  if(!safeId(a.candidateId)||ids.has(a.candidateId)||!safeId(a.candidateVersion)||!digest(a.evidenceId)||!a.label||!/^rec[A-Za-z0-9]+$/.test(a.workId)||! /^[A-Za-z0-9_-]{11}$/.test(a.videoId)||!a.videoType||a.kind!=='mv_preview_poster'||a.view!=='mv'||a.snapshotId!==registry.snapshotId||a.epoch!==registry.epoch||!digest(a.sha256)||!Number.isSafeInteger(a.byteLength)||a.byteLength<12||a.byteLength>MV_POSTER_MAX_FILE_BYTES||!['image/jpeg','image/png','image/webp'].includes(a.mime)||!Number.isSafeInteger(a.width)||!Number.isSafeInteger(a.height)||a.width<=0||a.height<=0||a.width*a.height>100000000||a.decodedPixelsVerified!==true||!evidenceUrl(a.sourcePageUrl)||!evidenceUrl(a.sourceImageUrl)||!digest(a.sourceSnapshotSha256)||!a.sourceDescription||!Number.isFinite(Date.parse(a.verifiedAt)))fail('POSTER_NOT_APPROVED','预览图审核清单不完整。',403);
  ids.add(a.candidateId);total+=a.byteLength;
 }
 if(!safeId(registry.manifestVersion)||registry.candidates.length>MV_POSTER_MAX_CANDIDATES||total>MV_POSTER_MAX_BYTES)fail('POSTER_BUDGET','预览图已超出本批批准容量。',403);
 return total;
}
async function control(userId:string){
 const c=await ownControl(userId);
 if(!c||c.owner_id!==userId||c.mode!=='native'||c.active_snapshot!==registry.snapshotId||c.epoch!==registry.epoch)fail('POSTER_SCOPE_CHANGED','资料存储已变化，请重新审核预览图。');
 const snapshot=await nativeDb().prepare('SELECT owner_id FROM idol_native_snapshots WHERE id=?').bind(registry.snapshotId).first<{owner_id:string}>();
 if(!snapshot||snapshot.owner_id!==userId)fail('OWNER_ONLY','预览图不属于当前审核的所有者。',403);
 return c;
}
async function target(userId:string,a:MvPosterCandidate){
 await control(userId);
 const [row,schema]=await Promise.all([nativeRow(a.snapshotId,'works',a.workId),nativeSchema(a.snapshotId,'works')]);
 // Diagnostics disclose only the approved public work ID and numeric schema
 // types. Never include raw fields, URLs, scores, notes or whole schema objects.
 if(row.snapshot_id!==a.snapshotId||row.table_key!=='works'||row.record_id!==a.workId)fail('POSTER_ROW_IDENTITY_CHANGED',`作品 ${a.workId} 的记录身份不匹配，请重新审核。`);
 // Live owner-only status verified 2026-10-19: URL is type 15; video type is plain text (1).
 const urlField=schema.find(f=>f.field_id===F.works.url),typeField=schema.find(f=>f.field_id===F.works.videoType);
 if(!urlField)fail('POSTER_URL_FIELD_MISSING',`作品 ${a.workId} 缺少视频链接字段。`);
 if(!typeField)fail('POSTER_VIDEO_TYPE_FIELD_MISSING',`作品 ${a.workId} 缺少视频类型字段。`);
 const fieldType=(value:unknown)=>typeof value==='number'&&Number.isSafeInteger(value)?String(value):'非整数';
 if(urlField.type!==15)fail('POSTER_URL_FIELD_TYPE_CHANGED',`作品 ${a.workId} 视频链接字段类型为 ${fieldType(urlField.type)}（预期 15）；视频类型字段为 ${fieldType(typeField.type)}（预期 1）。`);
 if(typeField.type!==1)fail('POSTER_VIDEO_TYPE_FIELD_TYPE_CHANGED',`作品 ${a.workId} 视频类型字段类型为 ${fieldType(typeField.type)}，预期 1。`);
 const raw=JSON.parse(row.fields_json);
 if(videoId(asUrl(raw[F.works.url]))!==a.videoId)fail('POSTER_VIDEO_ID_CHANGED',`作品 ${a.workId} 的视频 ID 与审核清单不匹配。`);
 if(asText(raw[F.works.videoType])!==a.videoType)fail('POSTER_VIDEO_TYPE_VALUE_CHANGED',`作品 ${a.workId} 的视频类型值与审核清单不匹配。`);
 await control(userId);
}
function files(){if(!env.BUCKET)fail('FILES_NOT_READY','私有图片存储暂不可用。',503);return env.BUCKET!;}
export function posterQuery(request:Request,allowEmpty=false){
 const q=new URL(request.url).searchParams,keys=[...q.keys()];
 if(allowEmpty&&keys.length===0)return null;
 if(keys.length!==2||q.getAll('candidate').length!==1||q.getAll('version').length!==1||keys.some(k=>!['candidate','version'].includes(k))||!q.get('candidate')||q.get('version')!==registry.manifestVersion)fail('INVALID_POSTER_REQUEST','预览图请求或清单版本无效。',400);
 return q.get('candidate')!;
}
async function resolve(userId:string,candidateId:string){
 await control(userId);approved();
 const a=registry.candidates.find(x=>x.candidateId===candidateId);
 if(!a)fail('POSTER_NOT_APPROVED','这张预览图尚未审核。',404);
 await target(userId,a);
 // Manifest additions must not allocate a second object for an unchanged ledger entry.
 const key=`mv-posters/v1/${await hash(userId)}/${await hash({snapshot:registry.snapshotId,epoch:registry.epoch})}/${await hash({candidate:a})}/${a.sha256}`;
 return {a,key};
}
async function validBytes(a:MvPosterCandidate,b:Uint8Array){
 if(b.byteLength!==a.byteLength||await bytesHash(b)!==a.sha256)fail('POSTER_FILE_MISMATCH','文件与审核原图不一致。',400);
 const h=imageHeader(b);
 if(h.mime!==a.mime||h.width!==a.width||h.height!==a.height)fail('POSTER_FILE_MISMATCH','图片格式或尺寸与审核原图不一致。',400);
}
async function inspect(a:MvPosterCandidate,key:string):Promise<{status:State;bytes?:Uint8Array}>{
 let object;
 try{object=await files().get(key);}catch{return {status:'unknown'};}
 if(!object)return {status:'missing'};
 if(object.size!==a.byteLength||object.httpMetadata?.contentType!==a.mime){try{await object.body.cancel();}catch{}return {status:'conflict'};}
 let bytes:Uint8Array;
 try{bytes=await boundedBytes(new Response(object.body),a.byteLength);}catch(e){return {status:e instanceof AppError?'conflict':'unknown'};}
 try{await validBytes(a,bytes);}catch{return {status:'conflict'};}
 return {status:'verified',bytes};
}
function result(a:MvPosterCandidate,status:State){
 const q=`candidate=${encodeURIComponent(a.candidateId)}&version=${encodeURIComponent(registry.manifestVersion)}`;
 return {candidateId:a.candidateId,label:a.label,workId:a.workId,videoId:a.videoId,sha256:a.sha256,byteLength:a.byteLength,mime:a.mime,width:a.width,height:a.height,status,readUrl:'/api/posters?'+q,uploadUrl:'/api/manage/posters?'+q};
}
export async function posterStatus(userId:string,candidateId?:string){
 await control(userId);const approvedBytes=approved();
 const selected=candidateId?[registry.candidates.find(a=>a.candidateId===candidateId)]:registry.candidates;
 if(selected.some(a=>!a))fail('POSTER_NOT_APPROVED','这张预览图尚未审核。',404);
 const candidates=[];
 for(const a of selected){const resolved=await resolve(userId,a!.candidateId),state=await inspect(resolved.a,resolved.key);await target(userId,resolved.a);candidates.push(result(resolved.a,state.status));}
 // Recheck every target after the whole list, not only immediately after each GET.
 for(const a of selected)await target(userId,a!);
 await control(userId);
 return {manifestVersion:registry.manifestVersion,candidates,budget:{maxCandidates:MV_POSTER_MAX_CANDIDATES,maxBytes:MV_POSTER_MAX_BYTES,maxFileBytes:MV_POSTER_MAX_FILE_BYTES,approvedBytes,accountRemainingBytes:null},archive:{includedInNativeArchive:false,message:'独立预览图不在现有资料归档内。请保存本清单和已核验原图；可据相同候选及校验值恢复。'},recoveryManifest:registry.candidates.map(a=>({...a}))};
}
export async function uploadPoster(userId:string,candidateId:string,request:Request){
 // Authenticate and validate all immutable admission facts before touching body.
 const {a,key}=await resolve(userId,candidateId);
 if(request.headers.get('content-type')!=='application/octet-stream')fail('INVALID_CONTENT_TYPE','请选择原始图片文件。',400);
 const before=await inspect(a,key);
 if(before.status!=='missing'){
  try{await request.body?.cancel();}catch{}
  await target(userId,a);return result(a,before.status);
 }
 const length=request.headers.get('content-length');
 if(length!==null&&(!/^\d+$/.test(length)||Number(length)!==a.byteLength))fail('POSTER_FILE_MISMATCH','上传长度与审核原图不一致。',400);
 const bytes=await boundedBytes(new Response(request.body),a.byteLength);await validBytes(a,bytes);
 await target(userId,a);
 let putFailed=false;
 try{await files().put(key,bytes,{onlyIf:{etagDoesNotMatch:'*'},sha256:a.sha256,httpMetadata:{contentType:a.mime}});}catch{putFailed=true;}
 // No cross-D1/R2 transaction: a scope switch can leave an invisible old-scope
 // orphan. Always re-read the SAME key, including conditional null/unknown PUT.
 const after=await inspect(a,key);await target(userId,a);
 return {...result(a,after.status),...(putFailed&&after.status!=='verified'?{storageBlocked:true,message:'写入结果或存储容量未确认，已停止；先查询状态核实，不要自动重传。'}:{})};
}
export async function readPoster(userId:string,candidateId:string){
 const {a,key}=await resolve(userId,candidateId),state=await inspect(a,key);await target(userId,a);
 if(state.status!=='verified')fail('POSTER_'+state.status.toUpperCase(),'预览图尚未通过私有存储核验。',state.status==='missing'?404:state.status==='unknown'?503:409);
 return new Response(new Uint8Array(state.bytes!).buffer,{headers:{'Content-Type':a.mime,'Content-Length':String(a.byteLength),'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
}
