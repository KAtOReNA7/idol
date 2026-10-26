import 'server-only';
import {env} from 'cloudflare:workers';
import {publicScope,assertPublicScope,readPublicCatalog,publicQuery} from './public-reader';
import {posterQuery,readPoster} from './mv-poster-storage';
import {mvPosterRegistry} from './mv-poster-registry';
import {AppError} from './feishu';
import {nativeDb} from './native-storage';
import {editorialCandidateManifest as manifest,editorialAssetLineage as lineage,editorialAssetLimits as limits,editorialAssetPolicy as policy,editorialPilotIdentities} from './editorial-asset-registry';
import {AssetError,verifyManifest,parseQuery,objectKey,canonical,verifyBytes,assetUrl} from './editorial-asset-format';
import {verifyAssetLineage,boundedAssetBody} from './editorial-asset-service';
import {createEditorialTargetResolver} from './editorial-asset-targets';
export async function readPublishedPoster(request:Request){
 publicQuery(request,['candidate','version'],['candidate','version']);
 const id=posterQuery(request)!,before=await publicScope(),candidate=mvPosterRegistry.candidates.find(c=>c.candidateId===id);
 if(!candidate||(await readPublicCatalog()).works.every(w=>w.id!==candidate.workId))throw new AppError('POSTER_NOT_APPROVED','暂无这张公开图片。',404);
 // Storage partition identity only, not a fabricated authenticated user. The
 // original read-only function retains admission/target/SHA/size/MIME checks.
 const response=await readPoster(before.control.owner_id,id);await assertPublicScope(before);return response;
}
// Deliberately separate from the owner read/write service. No put, upload,
// recovery, management viewer/catalog or backup operation exists on this adapter.
export async function readPublishedEditorial(request:Request){
 if(request.method!=='GET'||new URL(request.url).pathname!=='/api/editorial-assets')throw new AssetError('METHOD_NOT_ALLOWED',405);
 const query=parseQuery(request),budget=await verifyManifest(manifest,limits);
 await verifyAssetLineage(manifest,lineage,limits);
 if(query.assetId==='udtt-woojung'||!policy.read||query.manifestHash!==budget.manifestHash)throw new AssetError('ASSET_NOT_ADMITTED',404);
 if(!manifest.active.some(a=>a.assetId===query.assetId&&a.version===query.version))throw new AssetError('ASSET_NOT_ADMITTED',404);
 const entries=manifest.entries.filter(a=>a.assetId===query.assetId&&a.version===query.version);
 if(entries.length!==1)throw new AssetError('ASSET_NOT_ADMITTED',404);
 const entry=entries[0],before=await publicScope(),scope=manifest.scope;
 if(before.control.mode!=='native'||before.control.active_snapshot!==scope.snapshotId||before.control.epoch!==scope.epoch)throw new AssetError('SCOPE_CHANGED',409);
 const snapshot=await nativeDb().prepare('SELECT owner_id FROM idol_native_snapshots WHERE id=?').bind(scope.snapshotId).first<{owner_id:string}>();
 if(snapshot?.owner_id!==before.control.owner_id)throw new AssetError('SCOPE_CHANGED',409);
 const target=createEditorialTargetResolver(nativeDb(),editorialPilotIdentities);
 const checkTarget=async()=>{if(canonical(await target(entry.target,scope))!==canonical(entry.target))throw new AssetError('TARGET_CHANGED',409);};
 await checkTarget();
 if(!env.BUCKET)throw new AssetError('ASSET_UNAVAILABLE',503);
 const key=await objectKey(before.control.owner_id,scope,entry.original.sha256),object=await env.BUCKET.get(key);
 if(!object)throw new AssetError('ASSET_MISSING',404);
 if(object.size!==entry.original.byteLength||object.httpMetadata?.contentType!==entry.original.mime){void object.body.cancel();throw new AssetError('ASSET_CONFLICT',409);}
 const bytes=await boundedAssetBody(object.body,entry.original.byteLength,10000);await verifyBytes(entry.original,bytes);
 await checkTarget();await assertPublicScope(before);
 return new Response(new Uint8Array(bytes).buffer,{headers:{'Content-Type':entry.original.mime,'Content-Length':String(bytes.byteLength),'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Cross-Origin-Resource-Policy':'same-origin'}});
}

/** Public presentation metadata only. Never delegates to the owner viewer,
 * which intentionally includes inactive pilot entries. Empty active = empty list. */
export async function readPublishedEditorialViewer(request:Request){
 if(request.method!=='GET'||new URL(request.url).pathname!=='/api/editorial-assets/viewer')throw new AssetError('METHOD_NOT_ALLOWED',405);
 publicQuery(request,[],[]);
 const budget=await verifyManifest(manifest,limits);await verifyAssetLineage(manifest,lineage,limits);
 if(!policy.read)throw new AssetError('ASSET_NOT_ADMITTED',404);
 const before=await publicScope(),scope=manifest.scope;
 if(before.control.mode!=='native'||before.control.active_snapshot!==scope.snapshotId||before.control.epoch!==scope.epoch)throw new AssetError('SCOPE_CHANGED',409);
 const snapshot=await nativeDb().prepare('SELECT owner_id FROM idol_native_snapshots WHERE id=?').bind(scope.snapshotId).first<{owner_id:string}>();
 if(snapshot?.owner_id!==before.control.owner_id)throw new AssetError('SCOPE_CHANGED',409);
 const target=createEditorialTargetResolver(nativeDb(),editorialPilotIdentities);
 // The historical Bugs portrait is known to be the wrong person. Never publish it.
 const active=manifest.active.filter(ref=>ref.assetId!=='udtt-woojung').map(ref=>{const matches=manifest.entries.filter(entry=>entry.assetId===ref.assetId&&entry.version===ref.version);if(matches.length!==1)throw new AssetError('ASSET_NOT_ADMITTED',404);return matches[0];});
 for(const entry of active)if(canonical(await target(entry.target,scope))!==canonical(entry.target))throw new AssetError('TARGET_CHANGED',409);
 await assertPublicScope(before);
 return {manifestHash:budget.manifestHash,entries:active.map(entry=>({assetId:entry.assetId,sha256:entry.original.sha256,byteLength:entry.original.byteLength,mime:entry.original.mime,width:entry.original.width,height:entry.original.height,readUrl:assetUrl(budget.manifestHash,entry)}))};
}
