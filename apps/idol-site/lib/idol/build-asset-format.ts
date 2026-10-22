import manifest from './build-asset-manifest.json';
export type BuildAsset = Readonly<(typeof manifest.entries)[number]>;
// This is a build-time allowlist, never merged with request data or a database.
export const BUILD_ASSETS: readonly BuildAsset[] = Object.freeze(manifest.entries.map(entry => Object.freeze({...entry})));
export const BUILD_ASSET_NAMESPACE = manifest.namespace;
export class BuildAssetError extends Error {
 constructor(public readonly code: string, public readonly status = 400) { super(code); }
}
export function assetUrl(asset: BuildAsset, manage = false) {
 return `/api/${manage ? 'manage/' : ''}build-assets?id=${asset.id}&version=${asset.sha256}`;
}
export function selectAsset(request: Request, manage = false) {
 const url = new URL(request.url), pairs = [...url.searchParams];
 if (url.pathname !== `/api/${manage ? 'manage/' : ''}build-assets` || url.hash || pairs.length !== 2 ||
     pairs.filter(([key]) => key === 'id').length !== 1 || pairs.filter(([key]) => key === 'version').length !== 1)
  throw new BuildAssetError('INVALID_BUILD_ASSET_REQUEST');
 const entry = BUILD_ASSETS.find(item => item.id === url.searchParams.get('id') && item.sha256 === url.searchParams.get('version'));
 if (!entry) throw new BuildAssetError('BUILD_ASSET_NOT_ADMITTED', 404);
 return entry;
}
export async function buildAssetSha256(bytes: Uint8Array) {
 const hash = await crypto.subtle.digest('SHA-256', new Uint8Array(bytes).buffer);
 return Array.from(new Uint8Array(hash), value => value.toString(16).padStart(2, '0')).join('');
}
// Only these offline fully decoded, exact-SHA JPEGs are admitted. This parser
// validates their container/header geometry; it is not a general image decoder.
export function jpegGeometry(bytes: Uint8Array) {
 const invalid = () => { throw new BuildAssetError('BUILD_ASSET_IMAGE_INVALID'); };
 if (bytes.length < 12 || bytes[0] !== 255 || bytes[1] !== 216 || bytes.at(-2) !== 255 || bytes.at(-1) !== 217) return invalid();
 const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
 let offset = 2;
 while (offset + 4 <= bytes.length) {
  if (bytes[offset++] !== 255) return invalid();
  while (bytes[offset] === 255) offset++;
  const marker = bytes[offset++];
  if (marker === 0xda || marker === 0xd9 || marker === 0 || marker === 0xd8) return invalid();
  if (marker === 1 || (marker >= 0xd0 && marker <= 0xd7)) continue;
  if (offset + 2 > bytes.length) return invalid();
  const size = view.getUint16(offset);
  if (size < 2 || offset + size > bytes.length) return invalid();
  if ([0xc0, 0xc1, 0xc2].includes(marker)) {
   if (size < 8 || bytes[offset + 2] !== 8) return invalid();
   const width = view.getUint16(offset + 5), height = view.getUint16(offset + 3);
   if (!width || !height || width * height > 10000000) return invalid();
   return {mime: 'image/jpeg', width, height};
  }
  offset += size;
 }
 return invalid();
}
export async function verifyBuildAsset(asset: BuildAsset, bytes: Uint8Array, mime: string) {
 if (bytes.byteLength !== asset.bytes) throw new BuildAssetError('BUILD_ASSET_SIZE_MISMATCH');
 if (mime !== asset.mime) throw new BuildAssetError('BUILD_ASSET_MIME_MISMATCH');
 const geometry = jpegGeometry(bytes);
 if (geometry.mime !== asset.mime || geometry.width !== asset.width || geometry.height !== asset.height)
  throw new BuildAssetError('BUILD_ASSET_GEOMETRY_MISMATCH');
 if (await buildAssetSha256(bytes) !== asset.sha256) throw new BuildAssetError('BUILD_ASSET_HASH_MISMATCH');
}
