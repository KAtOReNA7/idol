import 'server-only';
import { env } from 'cloudflare:workers';
import { requireUser } from './http';
import { AppError } from './feishu';
import { ownControl, nativeDb } from './native-storage';
import { AssetError } from './editorial-asset-format';
import { createEditorialAssetService } from './editorial-asset-service';
import { createEditorialTargetResolver } from './editorial-asset-targets';
import { editorialAssetPolicy, editorialAssetLimits, editorialAssetLineage, editorialCandidateManifest, editorialPilotIdentities } from './editorial-asset-registry';
async function owner() { try {
    return (await requireUser()).userId;
}
catch (e) {
    if (e instanceof AppError && [401, 403].includes(e.status))
        throw new AssetError(e.code, e.status);
    throw e;
} }
let service: ReturnType<typeof createEditorialAssetService> | undefined;
/** Module singleton shares the bounded concurrency gate; no identities or sessions are cached. */
export function editorialAssetService() {
    if (!service)
        service = createEditorialAssetService({ manifest: editorialCandidateManifest, lineage: editorialAssetLineage, limits: editorialAssetLimits, policy: editorialAssetPolicy, requireOwner: owner, timeoutMs: 10000, maxConcurrent: 2,
            async readControl(userId, scope) {
                let c;
                try {
                    c = await ownControl(userId);
                }
                catch (error) {
                    if (error instanceof AppError && error.status === 403)
                        throw new AssetError('OWNER_ONLY', 403);
                    throw error;
                }
                if (!c)
                    return null;
                const snapshot = await nativeDb().prepare('SELECT owner_id FROM idol_native_snapshots WHERE id=?').bind(scope.snapshotId).all<{
                    owner_id: string;
                }>();
                return { ownerId: c.owner_id, snapshotOwnerId: snapshot.results.length === 1 ? snapshot.results[0].owner_id : '', mode: c.mode, snapshotId: c.active_snapshot, epoch: c.epoch };
            },
            resolveTarget: (target, scope) => createEditorialTargetResolver(nativeDb(), editorialPilotIdentities)(target, scope),
            diagnoseRelations: (target, scope) => createEditorialTargetResolver(nativeDb(), editorialPilotIdentities).diagnoseRelations(target, scope),
            store: {
                async get(key) { if (!env.BUCKET)
                    throw new AssetError('FILES_NOT_READY', 503); const object = await env.BUCKET.get(key); return object ? { size: object.size, mime: object.httpMetadata?.contentType, body: object.body } : null; },
                async putIfAbsent(key, bytes, mime, sha) { if (!env.BUCKET)
                    throw new AssetError('FILES_NOT_READY', 503); return env.BUCKET.put(key, new Uint8Array(bytes).buffer, { onlyIf: { etagDoesNotMatch: '*' }, sha256: sha, httpMetadata: { contentType: mime } }); }
            }
        });
    return service;
}
