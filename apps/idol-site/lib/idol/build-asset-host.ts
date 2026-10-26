import 'server-only';
import {env} from 'cloudflare:workers';
import {requireUser} from './http';
import {ownControl} from './native-storage';
import {AppError} from './feishu';
import {BuildAssetError} from './build-asset-format';
import {createBuildAssetService} from './build-asset-service';
export async function requireBuildAssetOwner() {
 try {
  const user = await requireUser(); // Existing fixed site-owner identity, not any login.
  const control = await ownControl(user.userId); // Independent durable owner-id cross-check.
  if (!control || control.owner_id !== user.userId) throw new BuildAssetError('OWNER_ONLY', 403);
 } catch (error) {
  if (error instanceof AppError && [401, 403].includes(error.status)) throw new BuildAssetError(error.code, error.status);
  throw error;
 }
}
let service: ReturnType<typeof createBuildAssetService> | undefined;
export function buildAssetService() {
 return service ??= createBuildAssetService({requireOwner: requireBuildAssetOwner, store: {
  async get(key) {
   if (!env.BUCKET) throw new BuildAssetError('FILES_NOT_READY', 503);
   const object = await env.BUCKET.get(key);
   return object ? {size: object.size, mime: object.httpMetadata?.contentType, body: object.body} : null;
  },
  async putIfAbsent(key, bytes, mime, sha) {
   if (!env.BUCKET) throw new BuildAssetError('FILES_NOT_READY', 503);
   return env.BUCKET.put(key, new Uint8Array(bytes).buffer, {
    onlyIf: {etagDoesNotMatch: '*'}, sha256: sha, httpMetadata: {contentType: mime},
   });
  },
 }});
}
