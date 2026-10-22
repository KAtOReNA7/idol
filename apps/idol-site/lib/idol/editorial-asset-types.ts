/** Wire types contain public editorial identity only, never rating/note fields. */
export type AssetScope = {
    snapshotId: string;
    epoch: number;
};
export type AssetClip = {
    startSeconds: number;
    endSeconds: number;
    sourceDurationSeconds: number;
};
type CommonTarget = {
    slug: string;
    groupId: string;
    entityKey: string;
};
export type AssetTarget = CommonTarget & ({
    kind: 'hero';
} | {
    kind: 'member';
    memberId: string;
} | {
    kind: 'release-cover';
    releaseId: null;
} | {
    kind: 'video';
    slot: 'mv' | 'stage';
    workIds: string[];
    videoId: string;
    sourceKey: string;
    clip: AssetClip | null;
    videoTypeByWork: {
        workId: string;
        videoType: string;
    }[];
    bindingMode: 'native-exact' | 'editorial-only';
});
export type AssetOriginal = {
    sha256: string;
    byteLength: number;
    mime: 'image/jpeg' | 'image/png' | 'image/webp';
    width: number;
    height: number;
    preserved: true;
    decode: {
        sha256: string;
        width: number;
        height: number;
        frames: 1;
        decoder: string;
        reportHash: string;
    };
};
export type AssetEntry = {
    assetId: string;
    version: string;
    target: AssetTarget;
    original: AssetOriginal;
    source: {
        pageUrl: string;
        imageUrl: string | null;
        credit: string;
        artifactSha256: string;
        description: string;
        bytesKind: 'downloaded-publisher-rendition' | 'retained-package-bytes';
        verifiedAt: string;
    };
};
export type AssetManifest = {
    formatVersion: 'idol.editorial-assets.v1';
    revision: string;
    scope: AssetScope;
    previousManifestHash: string | null;
    entries: AssetEntry[];
    active: {
        assetId: string;
        version: string;
    }[];
};
export type AssetLimits = {
    maxEntries: number;
    maxObjects: number;
    maxBytes: number;
    maxFileBytes: number;
    maxPixels: number;
};
export type AssetQuery = {
    manifestHash: string;
    assetId: string;
    version: string;
};
export type AssetState = 'missing' | 'verified' | 'conflict' | 'unknown';
export type AssetControl = {
    ownerId: string;
    snapshotOwnerId: string;
    mode: string;
    snapshotId: string | null;
    epoch: number;
};
export type EditorialImageRef = {
    assetId: string;
    version: string;
    manifestHash: string;
    readUrl: string;
    originalUrl: string;
    width: number;
    height: number;
    mime: string;
    credit: string;
    sourcePageUrl: string;
    qualityLabel: string;
};
export type BackupFile = {
    path: string;
    sha256: string;
    byteLength: number;
};
export type AssetBackupMetadata = {
    formatVersion: 'idol.editorial-assets-backup.v1';
    manifestHash: string;
    manifest: AssetManifest;
    lineage: AssetManifest[];
    files: BackupFile[];
};
export type AssetBackup = {
    metadata: AssetBackupMetadata;
    metadataHash: string;
    files: Map<string, Uint8Array>;
};
