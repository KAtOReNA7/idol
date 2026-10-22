import type { AssetBackup } from './editorial-asset-types';
import { fail, keys, digest } from './editorial-asset-format';
/** Portable, independently verifiable JSON backup, explicitly limited to the fixed UDTT pilot. */
export const EDITORIAL_BACKUP_WIRE_MAX = 3 * 1024 * 1024;
function base64(bytes: Uint8Array) { let text = ''; for (let i = 0; i < bytes.length; i += 8192)
    text += String.fromCharCode(...bytes.subarray(i, i + 8192)); return btoa(text); }
export function encodeEditorialBackup(bundle: AssetBackup) { return JSON.stringify({ metadata: bundle.metadata, metadataHash: bundle.metadataHash, files: [...bundle.files].map(([path, bytes]) => ({ path, data: base64(bytes) })) }); }
export function decodeEditorialBackup(text: string): AssetBackup {
    if (new TextEncoder().encode(text).byteLength > EDITORIAL_BACKUP_WIRE_MAX)
        fail('BACKUP_TOO_LARGE', 413);
    let value: unknown;
    try {
        value = JSON.parse(text);
    }
    catch {
        fail('INVALID_BACKUP', 400);
    }
    if (!keys(value, ['metadata', 'metadataHash', 'files']))
        fail('INVALID_BACKUP', 400);
    const wire = value as {
        metadata: AssetBackup['metadata'];
        metadataHash: string;
        files: unknown[];
    };
    if (!digest(wire.metadataHash) || !Array.isArray(wire.files) || wire.files.length > 11)
        fail('INVALID_BACKUP', 400);
    const files = new Map<string, Uint8Array>();
    let size = 0;
    for (const raw of wire.files) {
        if (!keys(raw, ['path', 'data']))
            fail('INVALID_BACKUP_FILE', 400);
        const file = raw as {
            path: string;
            data: string;
        };
        if (typeof file.path !== 'string' || !/^objects\/[a-f0-9]{64}$/.test(file.path) || files.has(file.path) || typeof file.data !== 'string' || file.data.length % 4 !== 0 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(file.data))
            fail('INVALID_BACKUP_FILE', 400);
        let binary: string;
        try {
            binary = atob(file.data);
        }
        catch {
            fail('INVALID_BACKUP_FILE', 400);
        }
        size += binary.length;
        if (size > 2 * 1024 * 1024)
            fail('BACKUP_TOO_LARGE', 413);
        const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
        if (base64(bytes) !== file.data)
            fail('INVALID_BACKUP_FILE', 400);
        files.set(file.path, bytes);
    }
    return { metadata: wire.metadata, metadataHash: wire.metadataHash, files };
}
