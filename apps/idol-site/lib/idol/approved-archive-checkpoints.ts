// Internal, owner-approved migration checkpoints. Server-only; never imported by UI.
// Each report comes from independently downloaded, hash-checked, decoded and restored files.
export const approvedArchiveCheckpoints:Array<{id:string;operationId:string;completedPhase:number;nextPhase:number;report:Record<string,unknown>}> = [
  {
    "id": "9e4b7666-13ac-4c0c-83ec-8e49b77af792",
    "operationId": "be286f23-2d1a-4743-8f16-0eabe23f5ef0",
    "completedPhase": 0,
    "nextPhase": 1,
    "report": {
      "formatVersion": "idol.pilot-restore-report.v1",
      "completeBackup": false,
      "missingPhotoTokens": 2423,
      "archiveId": "9e4b7666-13ac-4c0c-83ec-8e49b77af792",
      "manifestHash": "fa9a7775fdd65e35ad5b9f65a553b0e4782a309bb21c78175028878f66f248df",
      "dataSha256": "ffa0f7bb205624e83ce45e627be8ac4e63efaa6f2bb8cc8e3154e7e9f4ad0470",
      "restoredRecords": 3836,
      "fieldValues": 69516,
      "protectedValues": 14515,
      "journalRows": 22,
      "photoTokens": 10,
      "decodedUniqueImages": 10,
      "photoReferences": 2433,
      "photoBytes": 3162762,
      "fieldMismatches": 0,
      "photoFailures": 0,
      "sqliteIntegrity": "ok",
      "sourceNetworkUsed": false,
      "verifiedAt": "2026-10-13T10:20:47Z"
    }
  },
  {
    "id": "9e4b7666-13ac-4c0c-83ec-8e49b77af792",
    "operationId": "de324ce1-373e-48ea-8502-0529b203463d",
    "completedPhase": 1,
    "nextPhase": 2,
    "report": {
      "formatVersion": "idol.pilot-restore-report.v1",
      "completeBackup": false,
      "missingPhotoTokens": 2244,
      "archiveId": "9e4b7666-13ac-4c0c-83ec-8e49b77af792",
      "manifestHash": "a91628ea34ba33f4e117baf0a4a5736d24a51ceda1a8c41d62621b9cbba9e65a",
      "dataSha256": "ffa0f7bb205624e83ce45e627be8ac4e63efaa6f2bb8cc8e3154e7e9f4ad0470",
      "restoredRecords": 3836,
      "fieldValues": 69516,
      "protectedValues": 14515,
      "journalRows": 22,
      "photoTokens": 189,
      "decodedUniqueImages": 184,
      "decodedFrames": 184,
      "photoReferences": 2433,
      "photoBytes": 93005450,
      "fieldMismatches": 0,
      "photoFailures": 0,
      "sqliteIntegrity": "ok",
      "sourceNetworkUsed": false,
      "verifiedAt": "2026-10-13T11:26:20Z"
    }
  }
];
