import { editorialPilotLabels, exactEditorialPilotSlots } from './editorial-asset-pilot-contract';
import type { EditorialRelationDiagnostic } from './editorial-asset-targets';
/** Pure, dependency-injected service. Host configuration, never request JSON, supplies admission. */
import type { AssetManifest, AssetLimits, AssetEntry, AssetTarget, AssetScope, AssetControl, AssetState, AssetBackup, AssetBackupMetadata, EditorialImageRef } from './editorial-asset-types';
import { AssetError, fail, canonical, sha256, verifyManifest, assertAppendOnly, parseQuery, assetUrl, objectKey, verifyBytes, keys, digest } from './editorial-asset-format';
export const editorialPrivateHeaders = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'Cross-Origin-Resource-Policy': 'same-origin', 'Vary': 'Cookie' };
export type AssetStore = {
    get: (key: string) => Promise<{
        size: number;
        mime: string | undefined;
        body: ReadableStream<Uint8Array>;
    } | null>;
    putIfAbsent: (key: string, bytes: Uint8Array, mime: string, sha: string) => Promise<unknown>;
};
export type AssetPolicy = {
    read: boolean;
    write: boolean;
    recovery: boolean;
};
export type AssetServiceConfig = {
    manifest: AssetManifest;
    lineage: AssetManifest[];
    limits: AssetLimits;
    policy: AssetPolicy;
    store: AssetStore;
    requireOwner: () => Promise<string>;
    readControl: (owner: string, scope: AssetScope) => Promise<AssetControl | null>;
    resolveTarget: (target: AssetTarget, scope: AssetScope) => Promise<AssetTarget | null>;
    diagnoseRelations?: (target: AssetTarget, scope: AssetScope) => Promise<EditorialRelationDiagnostic[]>;
    timeoutMs?: number;
    maxConcurrent?: number;
};
export function editorialJson(value: unknown, status = 200) { return Response.json(value, { status, headers: editorialPrivateHeaders }); }
export function editorialFailure(error: unknown) {
    // No upstream message, SQL, object key, raw owner ID, private fields or credentials.
    const safe = error instanceof AssetError ? error : null;
    return editorialJson({ error: safe?.code ?? 'ASSET_UNAVAILABLE' }, safe?.status ?? 503);
}
export function unsupportedEditorialMethod() { return editorialJson({ error: "METHOD_NOT_ALLOWED" }, 405); }
function exactRequest(request: Request, method: string, path: string) { const url = new URL(request.url); if (request.method !== method || url.pathname !== path || url.hash)
    fail("INVALID_ASSET_REQUEST", 400); }
export async function boundedAssetBody(body: ReadableStream<Uint8Array> | null, maximum: number, timeoutMs: number) {
    if (!body)
        fail('EMPTY_BODY', 400);
    const reader = body.getReader(), chunks: Uint8Array[] = [];
    let size = 0, expired = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => { timer = setTimeout(() => { expired = true; void reader.cancel().catch(() => { }); reject(new AssetError('ASSET_TIMEOUT', 503)); }, timeoutMs); });
    try {
        for (;;) {
            const result = await Promise.race([reader.read(), timeout]);
            if (result.done)
                break;
            size += result.value.byteLength;
            if (size > maximum)
                fail('BODY_TOO_LARGE', 413);
            chunks.push(result.value);
        }
        if (expired)
            fail('ASSET_TIMEOUT', 503);
        const bytes = new Uint8Array(size);
        let offset = 0;
        for (const chunk of chunks) {
            bytes.set(chunk, offset);
            offset += chunk.byteLength;
        }
        return bytes;
    }
    finally {
        clearTimeout(timer);
        void reader.cancel().catch(() => { });
        reader.releaseLock();
    }
}
async function deadline<T>(promise: Promise<T>, ms: number, onLate?: (value: T) => void): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined, expired = false;
    const timeout = new Promise<never>((_, reject) => { timer = setTimeout(() => { expired = true; reject(new AssetError('ASSET_TIMEOUT', 503)); }, ms); });
    void promise.then(value => { if (expired)
        onLate?.(value); }, () => { });
    try {
        return await Promise.race([promise, timeout]);
    }
    finally {
        clearTimeout(timer);
    }
}
function freeze<T>(value: T): T { if (value && typeof value === 'object') {
    for (const child of Object.values(value))
        freeze(child);
    Object.freeze(value);
} return value; }
export async function verifyAssetLineage(manifest: AssetManifest, lineage: AssetManifest[], limits: AssetLimits) {
    if (!Array.isArray(lineage) || lineage.length > 32)
        fail('INVALID_LINEAGE', 400);
    let previous: AssetManifest | undefined;
    const hashes = new Set<string>();
    for (const current of [...lineage, manifest]) {
        const report = await verifyManifest(current, limits);
        if (hashes.has(report.manifestHash))
            fail('LINEAGE_CYCLE', 409);
        hashes.add(report.manifestHash);
        if (previous)
            await assertAppendOnly(previous, current, limits);
        else if (current.previousManifestHash !== null)
            fail('LINEAGE_INCOMPLETE', 409);
        previous = current;
    }
}
export async function verifyAssetBackup(bundle: AssetBackup, trustedManifestHash: string, limits: AssetLimits) {
    if (!keys(bundle, ['metadata', 'metadataHash', 'files']) || !keys(bundle.metadata, ['formatVersion', 'manifestHash', 'manifest', 'lineage', 'files']) || bundle.metadata.formatVersion !== 'idol.editorial-assets-backup.v1' || bundle.metadata.manifestHash !== trustedManifestHash || await sha256(bundle.metadata) !== bundle.metadataHash)
        fail('BACKUP_METADATA_MISMATCH', 400);
    const report = await verifyManifest(bundle.metadata.manifest, limits);
    await verifyAssetLineage(bundle.metadata.manifest, bundle.metadata.lineage, limits);
    if (report.manifestHash !== trustedManifestHash || !(bundle.files instanceof Map) || !Array.isArray(bundle.metadata.files))
        fail('BACKUP_MANIFEST_MISMATCH', 400);
    const originals = new Map(bundle.metadata.manifest.entries.map(e => [e.original.sha256, e.original])), paths = new Set<string>();
    for (const file of bundle.metadata.files) {
        if (!keys(file, ['path', 'sha256', 'byteLength']) || !digest(file.sha256) || file.path !== 'objects/' + file.sha256 || paths.has(file.path) || !originals.has(file.sha256) || file.byteLength !== originals.get(file.sha256)!.byteLength)
            fail('BACKUP_FILE_MISMATCH', 400);
        paths.add(file.path);
        const bytes = bundle.files.get(file.path);
        if (!(bytes instanceof Uint8Array))
            fail('BACKUP_FILE_MISSING', 400);
        await verifyBytes(originals.get(file.sha256)!, bytes);
    }
    if (paths.size !== originals.size || bundle.files.size !== paths.size || [...bundle.files.keys()].some(path => !paths.has(path)))
        fail('BACKUP_INCOMPLETE', 400);
    return report;
}
export async function createEditorialAssetService(input: AssetServiceConfig) {
    const registry = freeze(structuredClone(input.manifest)), lineage = freeze(structuredClone(input.lineage)), limits = freeze(structuredClone(input.limits)), policy = freeze({ ...input.policy });
    const budget = await verifyManifest(registry, limits);
    await verifyAssetLineage(registry, lineage, limits);
    const timeoutMs = input.timeoutMs ?? 10000, maxConcurrent = input.maxConcurrent ?? 2;
    if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30000 || !Number.isSafeInteger(maxConcurrent) || maxConcurrent < 1 || maxConcurrent > 4)
        fail('INVALID_RESOURCE_LIMITS', 403);
    let inFlight = 0, pendingPutCount = 0;
    // Per service/isolate only. Request deadlines never cancel R2 PUTs or release this budget.
    // Keep settled-but-unreconciled keys guarded until a verified same-key inspection; absence never authorizes a retry.
    const pendingWrites = new Map<string, { settled: boolean }>();
    async function limited<T>(fn: () => Promise<T>) { if (inFlight >= maxConcurrent)
        fail('ASSET_BUSY', 503); inFlight++; try {
        return await fn();
    }
    finally {
        inFlight--;
    } }
    async function scope(owner: string) { const c = await deadline(input.readControl(owner, registry.scope), timeoutMs); if (!c || c.ownerId !== owner || c.snapshotOwnerId !== owner)
        fail('OWNER_ONLY', 403); if (c.mode !== 'native' || c.snapshotId !== registry.scope.snapshotId || c.epoch !== registry.scope.epoch)
        fail('SCOPE_CHANGED', 409); }
    async function auth() { const owner = await deadline(input.requireOwner(), timeoutMs); if (typeof owner !== 'string' || !owner)
        fail('AUTH_REQUIRED', 401); await scope(owner); return owner; }
    async function exactTarget(entry: AssetEntry) { const target = await deadline(input.resolveTarget(entry.target, registry.scope), timeoutMs); if (!target || canonical(target) !== canonical(entry.target))
        fail('TARGET_CHANGED', 409); }
    function enabled(operation: keyof AssetPolicy) { if (!policy[operation])
        fail('ASSET_NOT_ADMITTED', 404); }
    function selected(request: Request) { const q = parseQuery(request); if (q.manifestHash !== budget.manifestHash)
        fail('MANIFEST_CHANGED', 409); const entries = registry.entries.filter(e => e.assetId === q.assetId && e.version === q.version); if (entries.length !== 1)
        fail('ASSET_NOT_ADMITTED', 404); return entries[0]; }
    async function resolve(request: Request, operation: keyof AssetPolicy) { const owner = await auth(); enabled(operation); const entry = selected(request); await exactTarget(entry); await scope(owner); return { owner, entry, key: await objectKey(owner, registry.scope, entry.original.sha256) }; }
    async function inspect(entry: AssetEntry, key: string): Promise<{
        state: AssetState;
        bytes?: Uint8Array;
    }> {
        let pending = pendingWrites.get(key);
        if (pending && !pending.settled)
            return { state: 'unknown' };
        const inspected = await inspectStored(entry, key);
        // A concurrent request may have reserved this key while GET/body verification awaited.
        pending = pendingWrites.get(key);
        if (pending && !pending.settled)
            return { state: 'unknown' };
        if (pending && inspected.state === 'verified' && pendingWrites.get(key) === pending)
            pendingWrites.delete(key);
        return pending && inspected.state === 'missing' ? { state: 'unknown' } : inspected;
    }
    async function inspectStored(entry: AssetEntry, key: string): Promise<{ state: AssetState; bytes?: Uint8Array }> {
        let object;
        try {
            object = await deadline(input.store.get(key), timeoutMs, value => { if (value)
                void value.body.cancel().catch(() => { }); });
        }
        catch {
            return { state: 'unknown' };
        }
        if (!object)
            return { state: 'missing' };
        if (object.size !== entry.original.byteLength || object.mime !== entry.original.mime) {
            void object.body.cancel().catch(() => { });
            return { state: 'conflict' };
        }
        try {
            const bytes = await boundedAssetBody(object.body, entry.original.byteLength, timeoutMs);
            await verifyBytes(entry.original, bytes);
            return { state: 'verified', bytes };
        }
        catch (error) {
            return { state: error instanceof AssetError && error.status !== 503 ? 'conflict' : 'unknown' };
        }
    }
    function result(entry: AssetEntry, state: AssetState) { return { assetId: entry.assetId, version: entry.version, manifestHash: budget.manifestHash, state, byteLength: entry.original.byteLength, sha256: entry.original.sha256, readUrl: assetUrl(budget.manifestHash, entry), stop: state === 'unknown' || state === 'conflict', accountRemainingBytes: null }; }
    function sameOrigin(request: Request) { if (request.headers.get('origin') !== new URL(request.url).origin)
        fail('ORIGIN_REJECTED', 403); }
    async function createOnly(owner: string, entry: AssetEntry, key: string, bytes: Uint8Array, checkTarget: boolean) {
        await scope(owner);
        if (checkTarget)
            await exactTarget(entry);
        // Atomic reservation after all awaits: two preflights may both have observed missing.
        if (pendingWrites.has(key))
            return result(entry, 'unknown');
        if (pendingPutCount >= maxConcurrent)
            fail('ASSET_BUSY', 503);
        const pending = { settled: false };
        pendingWrites.set(key, pending);
        pendingPutCount++;
        // R2 is not in a DB transaction; a scope flip may create a retained invisible orphan.
        // Normalize synchronous throws too. Settlement, not deadline expiry, frees provider capacity.
        const write = Promise.resolve().then(() => input.store.putIfAbsent(key, bytes, entry.original.mime, entry.original.sha256));
        const settled = write.then(() => { pending.settled = true; pendingPutCount--; }, () => { pending.settled = true; pendingPutCount--; });
        try {
            await deadline(settled, timeoutMs);
        }
        catch { /* The PUT is still pending; inspect returns unknown without treating absence as failure. */ }
        const after = await inspect(entry, key);
        await scope(owner);
        if (checkTarget)
            await exactTarget(entry);
        return result(entry, after.state === 'missing' ? 'unknown' : after.state);
    }
    async function relationDiagnostics(request: Request) {
        return limited(async () => {
            exactRequest(request, 'GET', '/api/manage/editorial-assets/relation-diagnostics');
            if ([...new URL(request.url).searchParams.keys()].length) fail('INVALID_ASSET_REQUEST', 400);
            const owner = await auth();
            const entry = registry.entries.filter(e => e.assetId === 'udtt-risako').at(-1);
            if (!entry || !input.diagnoseRelations) fail('ASSET_NOT_ADMITTED', 404);
            await scope(owner);
            let checks: EditorialRelationDiagnostic[];
            try { checks = await deadline(input.diagnoseRelations(entry.target, registry.scope), timeoutMs); }
            catch (error) {
                await scope(owner);
                if (error instanceof AssetError && ['TARGET_CHANGED', 'ASSET_TIMEOUT'].includes(error.code)) throw error;
                fail('ASSET_UNAVAILABLE', 503);
            }
            await scope(owner);
            // Reconstruct a fixed finite projection; never forward provider objects or arbitrary values.
            const reasons = ['ACCEPTED', 'MISSING', 'NULL', 'SCALAR', 'NESTED_ARRAY', 'MULTIPLE_ALIASES', 'NO_ALIAS', 'UNKNOWN_KEY', 'WRONG_TABLE', 'BAD_METADATA', 'BAD_ID', 'OVERSIZE', 'DUPLICATE', 'INVALID'];
            if (!Array.isArray(checks) || checks.length !== 2) fail('ASSET_UNAVAILABLE', 503);
            return { checks: checks.map((c, i) => {
                if (!c || c.field !== (i ? 'former' : 'current') || typeof c.present !== 'boolean' || !['missing', 'null', 'array', 'object', 'scalar'].includes(c.shape) || typeof c.strictAccepted !== 'boolean' || !reasons.includes(c.reason) || !(c.matchesExpected === null || typeof c.matchesExpected === 'boolean') || (c.strictAccepted ? c.reason !== 'ACCEPTED' || c.matchesExpected === null : c.reason === 'ACCEPTED' || c.matchesExpected !== null)) fail('ASSET_UNAVAILABLE', 503);
                return { field: c.field, present: c.present, shape: c.shape, strictAccepted: c.strictAccepted, reason: c.reason, matchesExpected: c.matchesExpected };
            }) };
        });
    }
    async function preflight(request: Request) {
        return limited(async () => {
            exactRequest(request, 'GET', '/api/manage/editorial-assets/preflight');
            if ([...new URL(request.url).searchParams.keys()].length)
                fail('INVALID_ASSET_REQUEST', 400);
            const owner = await auth();
            // Only the fixed server-owned pilot slots. This is identity evidence, not admission or a write lease.
            const entries = [...new Map(registry.entries.map(entry => [entry.assetId, entry])).values()];
            if (!exactEditorialPilotSlots(entries.map(entry => entry.assetId)))
                fail('ASSET_NOT_ADMITTED', 404);
            const checks: { assetId: string; passed: boolean; code: string }[] = [];
            for (const entry of entries) {
                await scope(owner);
                try {
                    await exactTarget(entry);
                    checks.push({ assetId: entry.assetId, passed: true, code: 'TARGET_VERIFIED' });
                }
                catch (error) {
                    // Explicit safe allowlist, never provider messages, SQL, row contents or arbitrary error codes.
                    const code = error instanceof AssetError && ['TARGET_CHANGED', 'TARGET_RELATION_INVALID', 'TARGET_RELATION_DUPLICATE', 'ASSET_TIMEOUT'].includes(error.code) ? error.code : 'ASSET_UNAVAILABLE';
                    checks.push({ assetId: entry.assetId, passed: false, code });
                }
            }
            await scope(owner);
            return { checks };
        });
    }
    async function catalog(request: Request) {
        return limited(async () => {
            exactRequest(request, 'GET', '/api/manage/editorial-assets/catalog');
            if ([...new URL(request.url).searchParams.keys()].length)
                fail('INVALID_ASSET_REQUEST', 400);
            const owner = await auth();
            // No BUCKET I/O or admission changes. Labels are fixed pilot slots, never private row fields.
            if (registry.entries.some(entry => !Object.hasOwn(editorialPilotLabels, entry.assetId)))
                fail('ASSET_NOT_ADMITTED', 404);
            // Append-only history stays in backup; display only each pilot slot's latest version.
            const latest = [...new Map(registry.entries.map(entry => [entry.assetId, entry])).values()];
            if (!exactEditorialPilotSlots(latest.map(entry => entry.assetId)))
                fail('ASSET_NOT_ADMITTED', 404);
            const entries = latest.map(entry => ({
                assetId: entry.assetId, version: entry.version,
                label: editorialPilotLabels[entry.assetId],
                sha256: entry.original.sha256, byteLength: entry.original.byteLength,
                mime: entry.original.mime, width: entry.original.width, height: entry.original.height,
            }));
            await scope(owner);
            return { manifestHash: budget.manifestHash, policy, limits, entries, accountRemainingBytes: null,
                accountBillingConfirmed: false, activeCount: registry.active.length };
        });
    }
    async function viewer(request: Request) {
        return limited(async () => {
            exactRequest(request, 'GET', '/api/manage/editorial-assets/viewer');
            if ([...new URL(request.url).searchParams.keys()].length) fail('INVALID_ASSET_REQUEST', 400);
            const owner = await auth(); enabled('read');
            const latest = [...new Map(registry.entries.map(entry => [entry.assetId, entry])).values()];
            if (latest.length !== 11 || !exactEditorialPilotSlots(latest.map(entry => entry.assetId))) fail('ASSET_NOT_ADMITTED', 404);
            // Admission is rechecked before each later byte read too. No BUCKET or request body here.
            for (const entry of latest) { await scope(owner); await exactTarget(entry); }
            await scope(owner);
            return { manifestHash: budget.manifestHash, entries: latest.map(entry => ({
                assetId: entry.assetId, sha256: entry.original.sha256, byteLength: entry.original.byteLength,
                mime: entry.original.mime, width: entry.original.width, height: entry.original.height,
                readUrl: assetUrl(budget.manifestHash, entry),
            })) };
        });
    }
    async function read(request: Request) { return limited(async () => { exactRequest(request, 'GET', '/api/editorial-assets'); const { owner, entry, key } = await resolve(request, 'read'), object = await inspect(entry, key); await exactTarget(entry); await scope(owner); if (object.state !== 'verified')
        fail('ASSET_' + object.state.toUpperCase(), object.state === 'missing' ? 404 : object.state === 'unknown' ? 503 : 409); return new Response(new Uint8Array(object.bytes!).buffer, { headers: { ...editorialPrivateHeaders, 'Content-Type': entry.original.mime, 'Content-Length': String(entry.original.byteLength) } }); }); }
    async function status(request: Request) { return limited(async () => { exactRequest(request, 'GET', '/api/manage/editorial-assets'); const { owner, entry, key } = await resolve(request, 'read'), object = await inspect(entry, key); await exactTarget(entry); await scope(owner); return result(entry, object.state); }); }
    async function upload(request: Request) {
        return limited(async () => {
            exactRequest(request, 'PUT', '/api/manage/editorial-assets');
            const { owner, entry, key } = await resolve(request, 'write');
            sameOrigin(request);
            if (request.headers.get('content-type') !== 'application/octet-stream')
                fail('INVALID_CONTENT_TYPE', 400);
            const length = request.headers.get('content-length');
            if (length !== null && (!/^\d+$/.test(length) || Number(length) !== entry.original.byteLength))
                fail('CONTENT_LENGTH_MISMATCH', 400);
            const before = await inspect(entry, key);
            if (before.state !== 'missing') {
                void request.body?.cancel().catch(() => { });
                await exactTarget(entry);
                await scope(owner);
                return result(entry, before.state);
            }
            const bytes = await boundedAssetBody(request.body, entry.original.byteLength, timeoutMs);
            await verifyBytes(entry.original, bytes);
            return createOnly(owner, entry, key, bytes, true);
        });
    }
    function manifestOnly(request: Request) { const q = new URL(request.url).searchParams; if ([...q.keys()].length !== 1 || q.getAll('manifest').length !== 1 || q.get('manifest') !== budget.manifestHash)
        fail('INVALID_BACKUP_QUERY', 400); }
    async function backup(request: Request) {
        return limited(async () => {
            exactRequest(request, 'GET', '/api/manage/editorial-assets/backup');
            const owner = await auth();
            enabled('recovery');
            manifestOnly(request);
            // Pilot bounded single volume; expanding admission requires a reviewed sharded archive implementation.
            if (budget.bytes > 2 * 1024 * 1024)
                fail('BACKUP_VOLUME_LIMIT', 413);
            const files = new Map<string, Uint8Array>();
            for (const entry of registry.entries) {
                const path = 'objects/' + entry.original.sha256;
                if (files.has(path))
                    continue;
                const object = await inspect(entry, await objectKey(owner, registry.scope, entry.original.sha256));
                if (object.state !== 'verified')
                    fail('BACKUP_INCOMPLETE', object.state === 'unknown' ? 503 : 409);
                files.set(path, object.bytes!);
                await scope(owner);
            }
            const metadata: AssetBackupMetadata = { formatVersion: 'idol.editorial-assets-backup.v1', manifestHash: budget.manifestHash, manifest: registry, lineage, files: [...files].map(([path, bytes]) => ({ path, sha256: path.slice(8), byteLength: bytes.byteLength })) };
            const bundle = { metadata, metadataHash: await sha256(metadata), files };
            await verifyAssetBackup(bundle, budget.manifestHash, limits);
            await scope(owner);
            return bundle;
        });
    }
    async function restore(request: Request, source: AssetBackup | (() => Promise<AssetBackup>)) {
        return limited(async () => {
            exactRequest(request, 'POST', '/api/manage/editorial-assets/restore');
            const owner = await auth();
            enabled('recovery');
            enabled('write');
            sameOrigin(request);
            manifestOnly(request);
            const bundle = typeof source === 'function' ? await source() : source;
            // Complete local byte preflight occurs BEFORE any PUT. Trusted hash comes only from server registry.
            await verifyAssetBackup(bundle, budget.manifestHash, limits);
            if (canonical(bundle.metadata.manifest) !== canonical(registry) || canonical(bundle.metadata.lineage) !== canonical(lineage))
                fail('BACKUP_MANIFEST_MISMATCH', 400);
            const unique = [...new Map(registry.entries.map(e => [e.original.sha256, e])).values()], missing: {
                entry: AssetEntry;
                key: string;
            }[] = [];
            for (const entry of unique) {
                const key = await objectKey(owner, registry.scope, entry.original.sha256), state = await inspect(entry, key);
                if (state.state === 'conflict' || state.state === 'unknown')
                    fail('RESTORE_' + state.state.toUpperCase(), state.state === 'unknown' ? 503 : 409);
                if (state.state === 'missing')
                    missing.push({ entry, key });
                await scope(owner);
            }
            const results = [];
            for (const { entry, key } of missing) {
                const row = await createOnly(owner, entry, key, bundle.files.get('objects/' + entry.original.sha256)!, false);
                results.push(row);
                if (row.state !== 'verified')
                    return { complete: false, stop: true, results };
            }
            // Includes already-present objects, and guards changes during restore.
            for (const entry of unique) {
                const state = await inspect(entry, await objectKey(owner, registry.scope, entry.original.sha256));
                if (state.state !== 'verified')
                    fail('RESTORE_INCOMPLETE', 409);
            }
            await scope(owner);
            return { complete: true, stop: false, restored: missing.length, objects: unique.length, results };
        });
    }
    async function imageRef(target: AssetTarget): Promise<EditorialImageRef | null> {
        return limited(async () => {
            const owner = await auth();
            if (!policy.read)
                return null;
            const candidates = registry.active.map(a => registry.entries.find(e => e.assetId === a.assetId && e.version === a.version)!).filter(e => canonical(e.target) === canonical(target));
            if (candidates.length !== 1)
                return null;
            const entry = candidates[0];
            await exactTarget(entry);
            const state = await inspect(entry, await objectKey(owner, registry.scope, entry.original.sha256));
            await exactTarget(entry);
            await scope(owner);
            if (state.state !== 'verified')
                return null;
            return { assetId: entry.assetId, version: entry.version, manifestHash: budget.manifestHash, readUrl: assetUrl(budget.manifestHash, entry), originalUrl: assetUrl(budget.manifestHash, entry), width: entry.original.width, height: entry.original.height, mime: entry.original.mime, credit: entry.source.credit, sourcePageUrl: entry.source.pageUrl, qualityLabel: '已保留并核验的交付原字节，非相机原片' };
        });
    }
    return { relationDiagnostics, preflight, catalog, viewer, read, status, upload, backup, restore, imageRef, budget: freeze(budget) };
}
