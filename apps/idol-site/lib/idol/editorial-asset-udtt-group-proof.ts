/** Fixed UDTT evidence for one snapshot/epoch only.
 * The four additional empty-former representations were read from the same
 * checksum-verified final backup as the original Risako proof, which is unchanged.
 * Release keys are public editorial catalog identities, NOT native release rows.
 * Video targets preserve the native MV parent and the existing editorial stage.
 * This file grants no storage permission and never reads/writes personal fields.
 */
export const editorialUdttGroupProof = Object.freeze({
    snapshotId: '0180f4aa-664f-48e9-a98a-958d4ae649f9', epoch: 6,
    slug: 'udtt', groupId: 'rec28ldfRTiDPs',
    additionalMemberIds: Object.freeze([
        'recvxAPQCFRlmM', 'recvxAPQCFnv3p', 'recvxAPQCF66Sl', 'recvxAPQCF1lfe',
    ]),
    currentFieldId: 'fld6bhQOdO', formerFieldId: 'fldf1alCIu',
    currentFieldType: 21, formerFieldType: 18, targetTableId: 'tbl5uwKCLEq7buNy',
    sourceFile: 'data.json.gz', sourceBytes: 921654,
    sourceSha256: 'd21b5d1e7a77c46231bcf0d50310d4c7873796d162f55634e9d23702389fa750',
    sourceCapturedAt: '2026-10-14T03:10:24.785Z',
    fieldProofReport: 'reports/udtt-final-field-proof.json',
    formerCanonical: '{}',
    formerCanonicalSha256: '44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a',
    workId: 'rec28ldfRTrPxZ',
    workGroupFieldId: 'fld2wy1cqw', workGroupFieldType: 21,
    workUrlFieldId: 'fldhBWXBZE', workUrlFieldType: 15,
    workTypeFieldId: 'fld1vZ4MUc', workTypeFieldType: 1,
    nativeVideoId: 'aKRY80dEkJw',
    nativeVideoUrl: 'https://www.youtube.com/watch?v=aKRY80dEkJw',
    nativeVideoType: '官方MV',
    stageVideoId: 'nZa0Th64v00',
    stageVideoUrl: 'https://www.youtube.com/watch?v=nZa0Th64v00',
    stageKind: '官方舞台化表演',
    manifestInputReport: 'reports/source-audit/manifest-inputs.json',
    sourceAuditSha256: '16816428c930056f9646490640f95819b99c7192b7a78306bb572f3aac0dc1db',
    releaseTargets: Object.freeze([
        Object.freeze({ kind: 'release-cover', slug: 'udtt', groupId: 'rec28ldfRTiDPs', entityKey: 'catalog:udtt:retry', releaseId: null }),
        Object.freeze({ kind: 'release-cover', slug: 'udtt', groupId: 'rec28ldfRTiDPs', entityKey: 'catalog:udtt:school-rush', releaseId: null }),
        Object.freeze({ kind: 'release-cover', slug: 'udtt', groupId: 'rec28ldfRTiDPs', entityKey: 'catalog:udtt:viper', releaseId: null }),
    ]),
    videoTargets: Object.freeze([
        Object.freeze({
            kind: 'video', slug: 'udtt', groupId: 'rec28ldfRTiDPs', entityKey: 'rec28ldfRTrPxZ',
            slot: 'mv', workIds: Object.freeze(['rec28ldfRTrPxZ']),
            videoId: 'aKRY80dEkJw', sourceKey: 'aKRY80dEkJw', clip: null,
            videoTypeByWork: Object.freeze([Object.freeze({ workId: 'rec28ldfRTrPxZ', videoType: '官方MV' })]),
            bindingMode: 'native-exact',
        }),
        Object.freeze({
            kind: 'video', slug: 'udtt', groupId: 'rec28ldfRTiDPs', entityKey: 'stage:rec28ldfRTrPxZ:nZa0Th64v00',
            slot: 'stage', workIds: Object.freeze(['rec28ldfRTrPxZ']),
            videoId: 'nZa0Th64v00', sourceKey: 'nZa0Th64v00', clip: null,
            videoTypeByWork: Object.freeze([Object.freeze({ workId: 'rec28ldfRTrPxZ', videoType: '官方MV' })]),
            bindingMode: 'editorial-only',
        }),
    ]),
});
