import { editorialPilotLabels, exactEditorialPilotSlots } from './editorial-asset-pilot-contract';
/** Narrow browser contract. No registry, owner IDs, keys, credentials, or external fetches. */
import { canonical, digest, imageHeader, keys, sha256 } from './editorial-asset-format';
import { decodeEditorialBackup, EDITORIAL_BACKUP_WIRE_MAX } from './editorial-asset-backup-codec';
import { verifyAssetBackup } from './editorial-asset-service';
import type { AssetLimits, AssetState } from './editorial-asset-types';
export type PilotEntry = { assetId: string; version: string; label: string; sha256: string; byteLength: number; mime: string; width: number; height: number };
export type PilotCatalog = { manifestHash: string; policy: { read: boolean; write: boolean; recovery: boolean }; limits: AssetLimits; entries: PilotEntry[]; accountRemainingBytes: null; accountBillingConfirmed: false; activeCount: number };
const invalid = () => { throw new Error('PILOT_CONTRACT_INVALID'); };
export function pilotCatalog(value: unknown): PilotCatalog {
    if (!keys(value, ['manifestHash', 'policy', 'limits', 'entries', 'accountRemainingBytes', 'accountBillingConfirmed', 'activeCount'])) return invalid();
    const c = value as PilotCatalog;
    if (!digest(c.manifestHash) || !keys(c.policy, ['read', 'write', 'recovery']) || Object.values(c.policy).some(v => typeof v !== 'boolean') || c.accountRemainingBytes !== null || c.accountBillingConfirmed !== false || !Number.isSafeInteger(c.activeCount) || c.activeCount < 0 || c.activeCount !== 0) return invalid();
    if (!keys(c.limits, ['maxEntries', 'maxObjects', 'maxBytes', 'maxFileBytes', 'maxPixels']) || Object.values(c.limits).some(v => !Number.isSafeInteger(v) || v < 1) || c.limits.maxEntries > 13 || c.limits.maxObjects > 11 || c.limits.maxBytes > 1799438 || c.limits.maxFileBytes > 8388608 || c.limits.maxPixels > 10000000) return invalid();
    if (!Array.isArray(c.entries) || !exactEditorialPilotSlots(c.entries.map(e => e?.assetId))) return invalid();
    const ids = new Set<string>();
    for (const e of c.entries) {
        if (!keys(e, ['assetId', 'version', 'label', 'sha256', 'byteLength', 'mime', 'width', 'height']) || !Object.hasOwn(editorialPilotLabels, e.assetId) || ids.has(e.assetId) || !digest(e.version) || !digest(e.sha256) || typeof e.label !== 'string' || e.label.length > 60 || !['image/jpeg', 'image/png', 'image/webp'].includes(e.mime) || [e.byteLength, e.width, e.height].some(v => !Number.isSafeInteger(v) || v < 1) || e.byteLength > c.limits.maxBytes || e.width * e.height > c.limits.maxPixels) return invalid();
        ids.add(e.assetId);
    }
    if (c.entries.reduce((sum, e) => sum + e.byteLength, 0) > c.limits.maxBytes) return invalid();
    return c;
}
export function pilotUrl(c: PilotCatalog, entry: PilotEntry, original = false) {
    if (!c.entries.includes(entry)) return invalid();
    return `${original ? '/api/editorial-assets' : '/api/manage/editorial-assets'}?${new URLSearchParams({ manifest: c.manifestHash, asset: entry.assetId, version: entry.version })}`;
}
export function pilotState(value: unknown, c: PilotCatalog, e: PilotEntry): AssetState {
    if (!value || typeof value !== 'object') return invalid();
    const v = value as Record<string, unknown>;
    if (v.assetId !== e.assetId || v.version !== e.version || v.manifestHash !== c.manifestHash || v.sha256 !== e.sha256 || v.byteLength !== e.byteLength || !['missing', 'verified', 'conflict', 'unknown'].includes(String(v.state)) || v.stop !== (v.state === 'unknown' || v.state === 'conflict')) return invalid();
    return v.state as AssetState;
}
export async function verifyPilotOriginal(file: Blob, e: PilotEntry) {
    if (file.size !== e.byteLength) throw new Error('PILOT_FILE_SIZE');
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (await sha256(bytes) !== e.sha256 || canonical(imageHeader(bytes)) !== canonical({ mime: e.mime, width: e.width, height: e.height })) throw new Error('PILOT_FILE_MISMATCH');
    return bytes;
}
export async function verifyPilotBackup(file: Blob, c: PilotCatalog) {
    if (!file.size || file.size > EDITORIAL_BACKUP_WIRE_MAX) throw new Error('PILOT_BACKUP_SIZE');
    const text = new TextDecoder('utf-8', { fatal: true }).decode(await file.arrayBuffer());
    const bundle = decodeEditorialBackup(text);
    await verifyAssetBackup(bundle, c.manifestHash, c.limits);
    return text;
}
export function pilotLockKey(e: PilotEntry) { return 'editorial-assets-uncertain-v1:' + e.sha256; }
export function readPilotLock(storage: Pick<Storage, 'getItem'>, e: PilotEntry) { return storage.getItem(pilotLockKey(e)) !== null; }
export function setPilotLock(storage: Pick<Storage, 'setItem' | 'getItem'>, e: PilotEntry) {
    storage.setItem(pilotLockKey(e), 'uncertain');
    if (!readPilotLock(storage, e)) throw new Error('PILOT_GUARD_UNAVAILABLE');
}
export function clearVerifiedPilotLock(storage: Pick<Storage, 'removeItem'>, e: PilotEntry, state: AssetState) {
    if (state !== 'verified') throw new Error('PILOT_VERIFY_REQUIRED');
    storage.removeItem(pilotLockKey(e));
}
