import 'server-only';
import {env} from 'cloudflare:workers';
import {AppError} from './feishu';
import {nativeDb,storageControl,nativeRow,sourceStamp} from './native-storage';
import {readNativeCatalog} from './native-reader';
import {projectBrowserCatalog} from './browser-catalog';
import {projectPublicCatalog} from './public-catalog';
import {projectArtistCatalog} from './artist-catalog';
import {F} from './fields';
import {boundedBytes,imageHeader,MAX_IMAGE_BYTES} from './image-integrity';
import {bytesHash} from './native-format';
import type {Photo,CatalogView} from './types';
const denied=()=>new AppError('PUBLIC_READ_UNAVAILABLE','公开资料暂时无法读取。',503);
// The partition ID comes ONLY from the fixed project's current control row.
// This is an explicit public read capability, not a visitor/owner login/session.
// Nothing here accepts an owner ID, historical snapshot, table or storage key.
export async function publicScope(){
 const control=await storageControl();
 if(!control?.owner_id||!control.active_snapshot||!['native','frozen'].includes(control.mode))throw denied();
 const generation=await nativeDb().prepare('SELECT generation FROM idol_catalog_state WHERE user_id = ?').bind(control.owner_id).first<{generation:number}>();
 if(!generation||!Number.isSafeInteger(generation.generation)||generation.generation<0)throw denied();
 return {control,generation:generation.generation};
}
export async function assertPublicScope(before:Awaited<ReturnType<typeof publicScope>>){
 const after=await publicScope();
 if(after.control.owner_id!==before.control.owner_id||sourceStamp(after.control)!==sourceStamp(before.control)||after.generation!==before.generation)throw new AppError('STORAGE_CHANGING','资料刚刚更新，请重新读取。',409);
}
export async function readPublicCatalog(artist:string|null=null):Promise<CatalogView>{
 const before=await publicScope();
 // Reuse the native read-only generation-checked cache with its actual partition
 // key. Never use the Feishu fallback or force refresh. No auth state is changed.
 const native=await readNativeCatalog(before.control.owner_id,false);
 if(!native)throw denied();
 const scoped=projectBrowserCatalog(artist?projectArtistCatalog(native,artist):native),result=projectPublicCatalog(scoped);
 // Server-derived semantic binding, never copied from rows or request flags.
 // Public callers need no internal Feishu field ID; bytes remain independently
 // verified against the native portrait's pinned SHA/MIME/dimensions by the UI.
 const groupId='rec28ldfRTiDPs',memberId='recvxAPQCF66Sl';
 const groups=scoped.groups.filter(g=>g.id===groupId),members=scoped.members.filter(m=>m.id===memberId),member=members[0],photo=member?.photo;
 if(scoped.scope?.type==='artist'&&scoped.scope.groupId===groupId&&groups.length===1&&groups[0].memberIds.includes(memberId)&&members.length===1&&member.groupIds.includes(groupId)&&photo?.table==='members'&&photo.recordId===memberId&&photo.fieldId===F.members.photo&&photo.index===0){
  const publicPhoto=result.members.find(m=>m.id===memberId)?.photo;
  if(publicPhoto)Object.assign(publicPhoto,{publicBinding:'member-primary-v1'});
 }
 await assertPublicScope(before);return result;
}
export function publicQuery(request:Request,allowed:readonly string[],required:readonly string[]=[]){
 if(request.method!=='GET')throw new AppError('METHOD_NOT_ALLOWED','仅可读取。',405);
 const q=new URL(request.url).searchParams;
 for(const key of q.keys())if(!allowed.includes(key)||q.getAll(key).length!==1)throw new AppError('INVALID_PUBLIC_REQUEST','读取参数无效。',400);
 for(const key of required)if(!q.get(key))throw new AppError('INVALID_PUBLIC_REQUEST','读取参数无效。',400);
 return q;
}
export async function readPublicMedia(request:Request){
 const q=publicQuery(request,['table','record','index'],['table','record']);
 const table=q.get('table'),id=q.get('record')!,rawIndex=q.get('index')??'0';
 if((table!=='members'&&table!=='ratings')||!/^rec[A-Za-z0-9]+$/.test(id)||!/^\d+$/.test(rawIndex)||Number(rawIndex)>20)throw new AppError('INVALID_MEDIA','图片请求无效。',400);
 const index=Number(rawIndex),before=await publicScope(),catalog=await readPublicCatalog();
 const photos:Photo[]=[...catalog.members.flatMap(row=>row.photo?[row.photo]:[]),...catalog.ratings.flatMap(row=>[row.photo,row.referencePhoto].filter((p):p is Photo=>!!p))];
 if(!photos.some(photo=>photo.table===table&&photo.recordId===id&&photo.index===index))throw new AppError('MISSING_MEDIA','暂无这张公开照片。',404);
 const row=await nativeRow(before.control.active_snapshot!,table,id),fields=JSON.parse(row.fields_json),attachments=fields[table==='members'?F.members.photo:F.ratings.photo],token=Array.isArray(attachments)?attachments[index]?.file_token:null;
 if(typeof token!=='string')throw new AppError('MISSING_MEDIA','暂无这张公开照片。',404);
 const media=await nativeDb().prepare("SELECT object_key,sha256,content_type,byte_length FROM idol_native_media WHERE snapshot_id = ? AND file_token = ? AND status = 'complete'").bind(before.control.active_snapshot,token).first<{object_key:string;sha256:string;content_type:string;byte_length:number}>();
 if(!media||!env.BUCKET||!['image/jpeg','image/png','image/webp','image/gif'].includes(media.content_type)||!Number.isSafeInteger(media.byte_length)||media.byte_length<12||media.byte_length>MAX_IMAGE_BYTES||!/^[a-f0-9]{64}$/.test(media.sha256))throw denied();
 const object=await env.BUCKET.get(media.object_key);if(!object||object.size!==media.byte_length)throw denied();
 const bytes=await boundedBytes(new Response(object.body),media.byte_length);
 if(bytes.byteLength!==media.byte_length||await bytesHash(bytes)!==media.sha256||imageHeader(bytes).mime!==media.content_type)throw denied();
 await assertPublicScope(before);
 return new Response(new Uint8Array(bytes).buffer,{headers:{'Content-Type':media.content_type,'Content-Length':String(bytes.byteLength),'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Cross-Origin-Resource-Policy':'same-origin'}});
}
