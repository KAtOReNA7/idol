import type { AssetManifest, AssetLimits, AssetEntry, AssetTarget, AssetOriginal, AssetScope, AssetQuery } from "./editorial-asset-types";
export class AssetError extends Error {
    constructor(public code: string, public status = 409) { super(code); }
}
export function fail(code: string, status = 409): never { throw new AssetError(code, status); }
export const digest = (value: unknown): value is string => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const id = (value: unknown): value is string => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,160}$/.test(value);
const recordId = (value: unknown): value is string => typeof value === 'string' && /^rec[A-Za-z0-9]+$/.test(value);
const string = (value: unknown): value is string => typeof value === 'string' && value.length > 0 && value.length <= 4096;
const safeKey = (value: unknown): value is string => typeof value === 'string' && /^[A-Za-z0-9_:@.-]{1,240}$/.test(value) && !value.includes('..');
export const keys = (value: unknown, expected: string[]): boolean => !!value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).sort().join('|') === [...expected].sort().join('|');
const positive = (value: unknown): value is number => typeof value === "number" && Number.isSafeInteger(value) && value > 0;
const date = (value: unknown) => typeof value === 'string' && Number.isFinite(Date.parse(value));
const https = (value: unknown) => { try {
    if (typeof value !== "string" || value.length > 4096)
        return false;
    const u = new URL(value);
    return u.protocol === 'https:' && !u.username && !u.password;
}
catch {
    return false;
} };
export const canonical = (value: unknown): string => {
    if (Array.isArray(value))
        return '[' + value.map(canonical).join(',') + ']';
    if (value !== null && typeof value === 'object')
        return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + canonical((value as Record<string, unknown>)[k])).join(',') + '}';
    if (value === undefined || typeof value === 'function' || typeof value === 'symbol' || typeof value === 'bigint' || typeof value === 'number' && !Number.isFinite(value))
        fail('INVALID_CANONICAL_VALUE', 400);
    return JSON.stringify(value);
};
export async function sha256(value: unknown) {
    const bytes = value instanceof Uint8Array ? value : new TextEncoder().encode(canonical(value));
    return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new Uint8Array(bytes).buffer)), b => b.toString(16).padStart(2, '0')).join('');
}
export function validateTarget(value: unknown): asserts value is AssetTarget {
    const target = value as AssetTarget;
    if (!target || !['hero', 'member', 'release-cover', 'video'].includes(target.kind))
        fail('INVALID_TARGET', 400);
    const common = ['kind', 'slug', 'groupId', 'entityKey'];
    const extra = target.kind === 'member' ? ['memberId'] : target.kind === 'release-cover' ? ['releaseId'] : target.kind === 'video' ? ['slot', 'workIds', 'videoId', 'sourceKey', 'clip', 'videoTypeByWork', 'bindingMode'] : [];
    if (!keys(target, [...common, ...extra]) || typeof target.slug !== 'string' || !/^[a-z0-9-]{1,80}$/.test(target.slug) || !recordId(target.groupId) || !safeKey(target.entityKey))
        fail('INVALID_TARGET', 400);
    if (target.kind === 'hero' && target.entityKey !== target.groupId)
        fail('INVALID_TARGET', 400);
    if (target.kind === 'member' && (!recordId(target.memberId) || target.entityKey !== target.memberId))
        fail('INVALID_TARGET', 400);
    // Editorial releases are NOT native Works. No fabricated release IDs.
    if (target.kind === 'release-cover' && target.releaseId !== null)
        fail('INVALID_TARGET', 400);
    if (target.kind === 'video') {
        if (!['mv', 'stage'].includes(target.slot) || !Array.isArray(target.workIds) || !target.workIds.every(recordId) || new Set(target.workIds).size !== target.workIds.length || canonical(target.workIds) !== canonical([...target.workIds].sort()) || typeof target.videoId !== 'string' || !/^[A-Za-z0-9_-]{11}$/.test(target.videoId))
            fail('INVALID_TARGET', 400);
        if (!['native-exact', 'editorial-only'].includes(target.bindingMode) || target.bindingMode === 'native-exact' && target.workIds.length !== 1 || target.bindingMode === 'native-exact' && target.slot === 'mv' && target.entityKey !== target.workIds[0])
            fail('AMBIGUOUS_TARGET', 400);
        if (target.clip !== null && (!keys(target.clip, ['startSeconds', 'endSeconds', 'sourceDurationSeconds']) || !Number.isSafeInteger(target.clip.startSeconds) || target.clip.startSeconds < 0 || !positive(target.clip.endSeconds) || !positive(target.clip.sourceDurationSeconds) || target.clip.endSeconds <= target.clip.startSeconds || target.clip.endSeconds > target.clip.sourceDurationSeconds || target.clip.sourceDurationSeconds > 86400))
            fail('INVALID_CLIP', 400);
        const expectedSource = target.videoId + (target.clip ? `@${target.clip.startSeconds}-${target.clip.endSeconds}` : '');
        if (target.sourceKey !== expectedSource)
            fail('SOURCE_KEY_MISMATCH', 400);
        if (!Array.isArray(target.videoTypeByWork) || target.videoTypeByWork.length !== target.workIds.length || target.videoTypeByWork.some((v, i) => !keys(v, ['workId', 'videoType']) || v.workId !== target.workIds[i] || !string(v.videoType)))
            fail('INVALID_VIDEO_TYPES', 400);
    }
}
export async function entryVersion(entry: AssetEntry) { const payload = Object.fromEntries(Object.entries(entry).filter(([key]) => key !== "version")); return sha256(payload); }
export async function verifyManifest(value: unknown, limits: AssetLimits) {
    const manifest = value as AssetManifest;
    if (!keys(limits, ['maxEntries', 'maxObjects', 'maxBytes', 'maxFileBytes', 'maxPixels']) || !Object.values(limits).every(positive))
        fail('LIMITS_REQUIRED', 403);
    if (!keys(manifest, ['formatVersion', 'revision', 'scope', 'previousManifestHash', 'entries', 'active']) || manifest.formatVersion !== 'idol.editorial-assets.v1' || !id(manifest.revision) || !keys(manifest.scope, ['snapshotId', 'epoch']) || typeof manifest.scope.snapshotId !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(manifest.scope.snapshotId) || !Number.isSafeInteger(manifest.scope.epoch) || manifest.scope.epoch < 0 || manifest.previousManifestHash !== null && !digest(manifest.previousManifestHash) || !Array.isArray(manifest.entries) || !Array.isArray(manifest.active))
        fail('INVALID_MANIFEST', 400);
    if (manifest.entries.length > limits.maxEntries || manifest.active.length > limits.maxEntries)
        fail('ADMISSION_BUDGET', 403);
    const versions = new Set<string>(), originals = new Map<string, AssetOriginal>(), assetTargets = new Map<string, string>();
    for (const entry of manifest.entries) {
        if (!keys(entry, ['assetId', 'version', 'target', 'original', 'source']) || !id(entry.assetId) || !digest(entry.version) || versions.has(entry.assetId + ':' + entry.version))
            fail('INVALID_ENTRY', 400);
        validateTarget(entry.target);
        if (assetTargets.has(entry.assetId) && assetTargets.get(entry.assetId) !== canonical(entry.target))
            fail('ASSET_ID_REBOUND', 400);
        assetTargets.set(entry.assetId, canonical(entry.target));
        const a = entry.original, s = entry.source;
        if (!keys(a, ['sha256', 'byteLength', 'mime', 'width', 'height', 'preserved', 'decode']) || !digest(a.sha256) || !positive(a.byteLength) || a.byteLength > limits.maxFileBytes || !['image/jpeg', 'image/png', 'image/webp'].includes(a.mime) || !positive(a.width) || !positive(a.height) || a.width * a.height > limits.maxPixels || a.preserved !== true || !keys(a.decode, ['sha256', 'width', 'height', 'frames', 'decoder', 'reportHash']) || a.decode.sha256 !== a.sha256 || a.decode.width !== a.width || a.decode.height !== a.height || a.decode.frames !== 1 || !string(a.decode.decoder) || !digest(a.decode.reportHash))
            fail('INVALID_ORIGINAL', 400);
        if (!keys(s, ['pageUrl', 'imageUrl', 'credit', 'artifactSha256', 'description', 'bytesKind', 'verifiedAt']) || !https(s.pageUrl) || s.imageUrl !== null && !https(s.imageUrl) || !string(s.credit) || !digest(s.artifactSha256) || !string(s.description) || !['downloaded-publisher-rendition', 'retained-package-bytes'].includes(s.bytesKind) || !date(s.verifiedAt))
            fail('INVALID_PROVENANCE', 400);
        if (await entryVersion(entry) !== entry.version)
            fail('ENTRY_VERSION_MISMATCH', 400);
        const old = originals.get(a.sha256);
        if (old && canonical(old) !== canonical(a))
            fail('ORIGINAL_METADATA_CONFLICT', 400);
        originals.set(a.sha256, a);
        versions.add(entry.assetId + ':' + entry.version);
    }
    const slots = new Set();
    for (const active of manifest.active) {
        if (!keys(active, ['assetId', 'version']) || !versions.has(active.assetId + ':' + active.version))
            fail('INVALID_ACTIVE_MAPPING', 400);
        const entry = manifest.entries.find(e => e.assetId === active.assetId && e.version === active.version);
        const slot = canonical(entry!.target);
        if (slots.has(slot))
            fail('DUPLICATE_ACTIVE_SLOT', 400);
        slots.add(slot);
    }
    const bytes = [...originals.values()].reduce((sum, a) => sum + a.byteLength, 0);
    if (!Number.isSafeInteger(bytes) || originals.size > limits.maxObjects || bytes > limits.maxBytes)
        fail('ADMISSION_BUDGET', 403);
    return { manifestHash: await sha256(manifest), objects: originals.size, bytes, accountRemainingBytes: null };
}
export async function assertAppendOnly(previous: AssetManifest, next: AssetManifest, limits: AssetLimits) {
    await verifyManifest(previous, limits);
    await verifyManifest(next, limits);
    if (next.revision === previous.revision || next.previousManifestHash !== await sha256(previous) || canonical(previous.scope) !== canonical(next.scope))
        fail('LINEAGE_MISMATCH', 409);
    for (const old of previous.entries) {
        const matches = next.entries.filter(e => e.assetId === old.assetId && e.version === old.version);
        if (matches.length !== 1 || canonical(matches[0]) !== canonical(old))
            fail('HISTORY_REMOVED_OR_CHANGED', 409);
    }
    return true;
}
export function parseQuery(request: Request): AssetQuery {
    const q = new URL(request.url).searchParams, wanted = ['manifest', 'asset', 'version'];
    if ([...q.keys()].length !== 3 || wanted.some(k => q.getAll(k).length !== 1) || !digest(q.get('manifest')) || !id(q.get('asset')) || !digest(q.get('version')))
        fail('INVALID_ASSET_QUERY', 400);
    return { manifestHash: q.get('manifest')!, assetId: q.get('asset')!, version: q.get('version')! };
}
export function assetUrl(manifestHash: string, entry: AssetEntry) {
    return '/api/editorial-assets?' + new URLSearchParams({ manifest: manifestHash, asset: entry.assetId, version: entry.version });
}
export async function objectKey(ownerId: string, scope: AssetScope, sha: string) {
    if (!digest(sha))
        fail('INVALID_OBJECT_DIGEST', 400);
    return `editorial-assets/v1/${await sha256(ownerId)}/${await sha256(scope)}/originals/${sha}`;
}
export function imageHeader(bytes: Uint8Array) {
    const bad = () => fail('INVALID_IMAGE_BYTES', 400);
    if (!(bytes instanceof Uint8Array) || bytes.length < 12)
        return bad();
    const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength), word = (at: number, n: number) => String.fromCharCode(...bytes.slice(at, at + n));
    let mime, width, height;
    if (bytes[0] === 137 && word(1, 3) === 'PNG' && v.getUint32(4) === 0x0d0a1a0a) {
        if (bytes.length < 33 || word(12, 4) !== 'IHDR')
            return bad();
        mime = 'image/png';
        width = v.getUint32(16);
        height = v.getUint32(20);
    }
    else if (bytes[0] === 255 && bytes[1] === 216) {
        let i = 2;
        while (i + 4 < bytes.length) {
            if (bytes[i++] !== 255)
                continue;
            while (i < bytes.length && bytes[i] === 255)
                i++;
            const marker = bytes[i++];
            if (marker === 0xda || marker === 0xd9)
                break;
            if (marker >= 0xd0 && marker <= 0xd7)
                continue;
            if (i + 2 > bytes.length)
                return bad();
            const length = v.getUint16(i);
            if (length < 2 || i + length > bytes.length)
                return bad();
            if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
                if (length < 8)
                    return bad();
                mime = 'image/jpeg';
                height = v.getUint16(i + 3);
                width = v.getUint16(i + 5);
                break;
            }
            i += length;
        }
    }
    else if (word(0, 4) === 'RIFF' && word(8, 4) === 'WEBP') {
        if (v.getUint32(4, true) + 8 !== bytes.length || bytes.length < 30)
            return bad();
        mime = 'image/webp';
        const chunk = word(12, 4), length = v.getUint32(16, true);
        if (20 + length + (length & 1) > bytes.length)
            return bad();
        if (chunk === 'VP8 ') {
            if (length < 10 || (bytes[20] & 1) !== 0 || word(23, 3) !== '\x9d\x01\x2a')
                return bad();
            width = v.getUint16(26, true) & 0x3fff;
            height = v.getUint16(28, true) & 0x3fff;
        }
        else if (chunk === 'VP8L') {
            if (length < 5 || bytes[20] !== 0x2f || bytes[24] >> 5 !== 0)
                return bad();
            const bits = v.getUint32(21, true);
            width = (bits & 0x3fff) + 1;
            height = ((bits >>> 14) & 0x3fff) + 1;
        }
        else if (chunk === 'VP8X') {
            if (length !== 10 || (bytes[20] & 2))
                return bad();
            const u24 = (at: number) => bytes[at] + (bytes[at + 1] << 8) + (bytes[at + 2] << 16);
            width = u24(24) + 1;
            height = u24(27) + 1;
        }
        else
            return bad();
    }
    if (!mime || !positive(width) || !positive(height))
        return bad();
    return { mime, width, height };
}
export async function verifyBytes(original: AssetOriginal, bytes: Uint8Array) {
    if (bytes.byteLength !== original.byteLength || await sha256(bytes) !== original.sha256)
        fail('ASSET_BYTES_MISMATCH', 409);
    if (canonical(imageHeader(bytes)) !== canonical({ mime: original.mime, width: original.width, height: original.height }))
        fail('ASSET_HEADER_MISMATCH', 409);
    return true; // Header + exact admitted SHA only; NEVER a replacement for full offline pixel decoding.
}
