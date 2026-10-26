import {assetUrl, BUILD_ASSET_NAMESPACE, BuildAssetError, selectAsset, verifyBuildAsset, type BuildAsset} from './build-asset-format';
export type BuildAssetStore = {
 get(key: string): Promise<{size: number; mime?: string; body: ReadableStream<Uint8Array>} | null>;
 putIfAbsent(key: string, bytes: Uint8Array, mime: string, sha: string): Promise<unknown>;
};
type State = 'missing' | 'verified' | 'conflict' | 'unknown';
type Inspection = {state: State; bytes?: Uint8Array};
export const buildAssetHeaders = {'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Cross-Origin-Resource-Policy': 'same-origin'};
export function buildAssetJson(value: unknown, status = 200) { return Response.json(value, {status, headers: buildAssetHeaders}); }
export function buildAssetFailure(error: unknown) {
 return buildAssetJson({error: error instanceof BuildAssetError ? error.code : 'BUILD_ASSET_UNAVAILABLE'}, error instanceof BuildAssetError ? error.status : 503);
}
export function unsupportedBuildAssetMethod() { return buildAssetJson({error: 'METHOD_NOT_ALLOWED'}, 405); }
async function deadline<T>(promise: Promise<T>, ms: number, late?: (value: T) => void): Promise<T> {
 let expired = false, timer: ReturnType<typeof setTimeout> | undefined;
 const timeout = new Promise<never>((_, reject) => { timer = setTimeout(() => { expired = true; reject(new BuildAssetError('BUILD_ASSET_TIMEOUT', 503)); }, ms); });
 void promise.then(value => { if (expired) late?.(value); }, () => {});
 try { return await Promise.race([promise, timeout]); } finally { clearTimeout(timer); }
}
async function boundedBody(body: ReadableStream<Uint8Array> | null, limit: number, ms: number) {
 if (!body) throw new BuildAssetError('BUILD_ASSET_EMPTY_BODY');
 const reader = body.getReader(), buffer = new Uint8Array(limit);
 const expiresAt = Date.now() + ms;
 let length = 0, chunks = 0;
 const read = async () => {
  for (;;) {
   if (Date.now() >= expiresAt) throw new BuildAssetError('BUILD_ASSET_TIMEOUT', 503);
   const part = await reader.read();
   if (part.done) break;
   if (!part.value.byteLength || ++chunks > 8192) throw new BuildAssetError('BUILD_ASSET_STREAM_INVALID', 413);
   if (length + part.value.byteLength > limit) throw new BuildAssetError('BUILD_ASSET_BODY_TOO_LARGE', 413);
   buffer.set(part.value, length); length += part.value.byteLength;
  }
  return buffer.subarray(0, length);
 };
 try { return await deadline(read(), ms); }
 finally { void reader.cancel().catch(() => {}); reader.releaseLock(); }
}
/** No database or remote-fetch interface exists here. The host must verify real ownership. */
export function createBuildAssetService(config: {store: BuildAssetStore; requireOwner: () => Promise<void>; timeoutMs?: number}) {
 const ms = config.timeoutMs ?? 10000;
 if (!Number.isInteger(ms) || ms < 1 || ms > 10000) throw new BuildAssetError('INVALID_RESOURCE_LIMIT');
 let active = 0, unsettledPuts = 0, unsettledIO = 0;
 const pending = new Map<string, {settled: boolean}>();
 async function limited<T>(action: () => Promise<T>) {
  if (active >= 4) throw new BuildAssetError('BUILD_ASSET_BUSY', 503);
  active++; try { return await action(); } finally { active--; }
 }
 // Deadlines do not cancel upstream R2 or owner checks. Keep their budget
 // occupied until settlement, so repeated timeouts cannot grow hidden work.
 async function boundedIO<T>(action: () => Promise<T>, late?: (value: T) => void) {
  if (unsettledIO >= 6) throw new BuildAssetError('BUILD_ASSET_BUSY', 503);
  unsettledIO++;
  const operation = Promise.resolve().then(action);
  void operation.then(() => {unsettledIO--;}, () => {unsettledIO--;});
  return deadline(operation, ms, late);
 }
 const keyFor = (asset: BuildAsset) => `${BUILD_ASSET_NAMESPACE}/${asset.id}/${asset.sha256}.jpg`;
 async function inspect(asset: BuildAsset): Promise<Inspection> {
  const key = keyFor(asset);
  if (pending.get(key)?.settled === false) return {state: 'unknown'};
  let object;
  try { object = await boundedIO(() => config.store.get(key), late => { if (late) void late.body.cancel().catch(() => {}); }); }
  catch { return {state: 'unknown'}; }
  if (!object) return {state: pending.has(key) ? 'unknown' : 'missing'};
  if (object.size !== asset.bytes || object.mime !== asset.mime) { void object.body.cancel().catch(() => {}); return {state: 'conflict'}; }
  try {
   const bytes = await boundedBody(object.body, asset.bytes, ms);
   await verifyBuildAsset(asset, bytes, object.mime);
   if (pending.get(key)?.settled === false) return {state: 'unknown'};
   pending.delete(key);
   return {state: 'verified', bytes};
  } catch (error) { return {state: error instanceof BuildAssetError && error.status !== 503 ? 'conflict' : 'unknown'}; }
 }
 async function owner() { await boundedIO(() => config.requireOwner()); }
 function exactMethod(request: Request, method: string) {
  if (request.method !== method) throw new BuildAssetError('METHOD_NOT_ALLOWED', 405);
 }
 const report = (asset: BuildAsset, result: Inspection) => ({id: asset.id, version: asset.sha256, state: result.state,
  ...(result.state === 'verified' ? {bytes: asset.bytes, mime: asset.mime, width: asset.width, height: asset.height, url: assetUrl(asset)} : {})});
 return {
  read(request: Request) { return limited(async () => {
   exactMethod(request, 'GET'); const asset = selectAsset(request), result = await inspect(asset);
   if (result.state !== 'verified' || !result.bytes) throw new BuildAssetError(`BUILD_ASSET_${result.state.toUpperCase()}`, result.state === 'missing' ? 404 : result.state === 'conflict' ? 409 : 503);
   return new Response(new Uint8Array(result.bytes).buffer, {headers: {...buildAssetHeaders, 'Content-Type': asset.mime, 'Content-Length': String(asset.bytes), 'X-Build-Asset-SHA256': asset.sha256}});
  }); },
  status(request: Request) { return limited(async () => {
   exactMethod(request, 'GET'); await owner(); const asset = selectAsset(request, true);
   return report(asset, await inspect(asset));
  }); },
  upload(request: Request) { return limited(async () => {
   exactMethod(request, 'PUT'); await owner(); const asset = selectAsset(request, true);
   if (request.headers.get('origin') !== new URL(request.url).origin) throw new BuildAssetError('ORIGIN_REJECTED', 403);
   if (request.headers.get('content-type') !== 'application/octet-stream' || request.headers.has('content-encoding')) throw new BuildAssetError('INVALID_CONTENT_TYPE', 415);
   if (request.headers.get('content-length') !== String(asset.bytes)) throw new BuildAssetError('INVALID_CONTENT_LENGTH', 411);
   const bytes = await boundedBody(request.body, asset.bytes, ms);
   await verifyBuildAsset(asset, bytes, asset.mime);
   const before = await inspect(asset), key = keyFor(asset);
   if (before.state !== 'missing') return report(asset, before);
   // Recheck request-scoped real ownership immediately before the only write.
   await owner();
   if (pending.has(key)) return report(asset, {state: 'unknown'});
   if (unsettledPuts >= 2) throw new BuildAssetError('BUILD_ASSET_BUSY', 503);
   const reservation = {settled: false}; pending.set(key, reservation); unsettledPuts++;
   // A timed-out PUT cannot be cancelled. Keep its reservation even when absent
   // on readback, never loop/retry. R2 conditional create is the cross-isolate guard.
   const write = Promise.resolve().then(() => config.store.putIfAbsent(key, bytes, asset.mime, asset.sha256));
   void write.then(() => { reservation.settled = true; unsettledPuts--; }, () => { reservation.settled = true; unsettledPuts--; });
   try { await deadline(write, ms); } catch { return report(asset, {state: 'unknown'}); }
   return report(asset, await inspect(asset));
  }); },
 };
}
