/** Immutable historical representation evidence, NOT a hash assertion about the live database.
 * Independently read once from the existing final cutover backup and checksum-verified.
 * No runtime archive read, credential, mutable admission, or record write.
 */
export const editorialEmptyFormerProof = Object.freeze({
    snapshotId: '0180f4aa-664f-48e9-a98a-958d4ae649f9', epoch: 6,
    slug: 'udtt', groupId: 'rec28ldfRTiDPs', memberId: 'recvxAPQCFt0cc',
    currentFieldId: 'fld6bhQOdO', formerFieldId: 'fldf1alCIu',
    currentFieldType: 21, formerFieldType: 18, targetTableId: 'tbl5uwKCLEq7buNy',
    sourceFile: 'data.json.gz', sourceBytes: 921654,
    sourceSha256: 'd21b5d1e7a77c46231bcf0d50310d4c7873796d162f55634e9d23702389fa750',
    sourceCapturedAt: '2026-10-14T03:10:24.785Z',
    sourceManifestHash: '2243d0f2141af60bc63f71a99079ecae0191e27f41eb8eadd8ace1d410249152',
    formerCanonical: '{}', formerCanonicalSha256: '44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a',
});
