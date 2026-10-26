import 'server-only';
import type { AssetManifest, AssetLimits } from './editorial-asset-types';
import type { AssetPolicy } from './editorial-asset-service';
import type { EditorialPilotIdentity } from './editorial-asset-targets';
/** Fixed UDTT retained-byte pilot. No automatic enablement or formal-page replacement. */
export const editorialAssetPolicy: AssetPolicy = Object.freeze({ read: true, write: true, recovery: true });
export const editorialAssetLimits: AssetLimits = Object.freeze({ maxEntries: 13, maxObjects: 11, maxBytes: 1799438, maxFileBytes: 8388608, maxPixels: 10000000 });
export const editorialAssetLineage: AssetManifest[] = [
  {
    "formatVersion": "idol.editorial-assets.v1",
    "revision": "candidate-sol15-udtt-two-image-v1",
    "scope": {
      "snapshotId": "0180f4aa-664f-48e9-a98a-958d4ae649f9",
      "epoch": 6
    },
    "previousManifestHash": null,
    "entries": [
      {
        "assetId": "udtt-hero",
        "version": "6d48785493db12769cfc41430cfa6fea47c274e0902a30aaac7efb27f587438e",
        "target": {
          "kind": "hero",
          "slug": "udtt",
          "groupId": "rec28ldfRTiDPs",
          "entityKey": "rec28ldfRTiDPs"
        },
        "original": {
          "sha256": "c55959059143b87732e514646b3d81104bbc7195a5379c98c5720c50487945bf",
          "byteLength": 245638,
          "mime": "image/jpeg",
          "width": 1067,
          "height": 1600,
          "preserved": true,
          "decode": {
            "sha256": "c55959059143b87732e514646b3d81104bbc7195a5379c98c5720c50487945bf",
            "width": 1067,
            "height": 1600,
            "frames": 1,
            "decoder": "Pillow 12.3.0",
            "reportHash": "4f3513d5339ed43e4c505a5d2c892a0bbe88e6b632306774b568293acbff7b1b"
          }
        },
        "source": {
          "pageUrl": "https://prtimes.jp/main/html/rd/p/000000006.000170584.html",
          "imageUrl": null,
          "credit": "活动主办方 2025-10-08 四人宣传照",
          "artifactSha256": "681dae8ae8e14975d76056576c09838010d99a50076834e01dfdd7af716e3291",
          "description": "Isolated fixture only. Packaged public provenance retained; local bytes and full pixel decoding verified. No fresh source-page, rights or live target verification. Not camera-original or member-participation proof.",
          "bytesKind": "retained-package-bytes",
          "verifiedAt": "2026-10-20T07:31:43.384006+00:00"
        }
      },
      {
        "assetId": "udtt-risako",
        "version": "4cd3ec29556d6f158dea9ade4b1a143bf4062ca03335cfc7dd7f3f208b62ede2",
        "target": {
          "kind": "member",
          "slug": "udtt",
          "groupId": "rec28ldfRTiDPs",
          "entityKey": "recvxAPQCFt0cc",
          "memberId": "recvxAPQCFt0cc"
        },
        "original": {
          "sha256": "c5c5b1b2e9c486cd30683454b3a20319d4f8bad246f7e7778163779fa11bdda6",
          "byteLength": 282674,
          "mime": "image/jpeg",
          "width": 700,
          "height": 1049,
          "preserved": true,
          "decode": {
            "sha256": "c5c5b1b2e9c486cd30683454b3a20319d4f8bad246f7e7778163779fa11bdda6",
            "width": 700,
            "height": 1049,
            "frames": 1,
            "decoder": "Pillow 12.3.0",
            "reportHash": "4f3513d5339ed43e4c505a5d2c892a0bbe88e6b632306774b568293acbff7b1b"
          }
        },
        "source": {
          "pageUrl": "https://v.daum.net/v/20250414132025075",
          "imageUrl": null,
          "credit": "SW Entertainment / Sports Seoul 2025-04-14",
          "artifactSha256": "681dae8ae8e14975d76056576c09838010d99a50076834e01dfdd7af716e3291",
          "description": "Isolated fixture only. Packaged public provenance retained; local bytes and full pixel decoding verified. No fresh source-page, rights or live target verification. Not camera-original or member-participation proof.",
          "bytesKind": "retained-package-bytes",
          "verifiedAt": "2026-10-20T07:31:43.384006+00:00"
        }
      }
    ],
    "active": []
  },
  {
    "formatVersion": "idol.editorial-assets.v1",
    "revision": "source-reviewed-udtt-two-image-v2",
    "scope": {
      "snapshotId": "0180f4aa-664f-48e9-a98a-958d4ae649f9",
      "epoch": 6
    },
    "previousManifestHash": "c1057c32d379f361b2779ff71c2ff7ce5c0841a22ffbcf2f653d779c2b499421",
    "entries": [
      {
        "assetId": "udtt-hero",
        "version": "6d48785493db12769cfc41430cfa6fea47c274e0902a30aaac7efb27f587438e",
        "target": {
          "kind": "hero",
          "slug": "udtt",
          "groupId": "rec28ldfRTiDPs",
          "entityKey": "rec28ldfRTiDPs"
        },
        "original": {
          "sha256": "c55959059143b87732e514646b3d81104bbc7195a5379c98c5720c50487945bf",
          "byteLength": 245638,
          "mime": "image/jpeg",
          "width": 1067,
          "height": 1600,
          "preserved": true,
          "decode": {
            "sha256": "c55959059143b87732e514646b3d81104bbc7195a5379c98c5720c50487945bf",
            "width": 1067,
            "height": 1600,
            "frames": 1,
            "decoder": "Pillow 12.3.0",
            "reportHash": "4f3513d5339ed43e4c505a5d2c892a0bbe88e6b632306774b568293acbff7b1b"
          }
        },
        "source": {
          "pageUrl": "https://prtimes.jp/main/html/rd/p/000000006.000170584.html",
          "imageUrl": null,
          "credit": "活动主办方 2025-10-08 四人宣传照",
          "artifactSha256": "681dae8ae8e14975d76056576c09838010d99a50076834e01dfdd7af716e3291",
          "description": "Isolated fixture only. Packaged public provenance retained; local bytes and full pixel decoding verified. No fresh source-page, rights or live target verification. Not camera-original or member-participation proof.",
          "bytesKind": "retained-package-bytes",
          "verifiedAt": "2026-10-20T07:31:43.384006+00:00"
        }
      },
      {
        "assetId": "udtt-risako",
        "version": "4cd3ec29556d6f158dea9ade4b1a143bf4062ca03335cfc7dd7f3f208b62ede2",
        "target": {
          "kind": "member",
          "slug": "udtt",
          "groupId": "rec28ldfRTiDPs",
          "entityKey": "recvxAPQCFt0cc",
          "memberId": "recvxAPQCFt0cc"
        },
        "original": {
          "sha256": "c5c5b1b2e9c486cd30683454b3a20319d4f8bad246f7e7778163779fa11bdda6",
          "byteLength": 282674,
          "mime": "image/jpeg",
          "width": 700,
          "height": 1049,
          "preserved": true,
          "decode": {
            "sha256": "c5c5b1b2e9c486cd30683454b3a20319d4f8bad246f7e7778163779fa11bdda6",
            "width": 700,
            "height": 1049,
            "frames": 1,
            "decoder": "Pillow 12.3.0",
            "reportHash": "4f3513d5339ed43e4c505a5d2c892a0bbe88e6b632306774b568293acbff7b1b"
          }
        },
        "source": {
          "pageUrl": "https://v.daum.net/v/20250414132025075",
          "imageUrl": null,
          "credit": "SW Entertainment / Sports Seoul 2025-04-14",
          "artifactSha256": "681dae8ae8e14975d76056576c09838010d99a50076834e01dfdd7af716e3291",
          "description": "Isolated fixture only. Packaged public provenance retained; local bytes and full pixel decoding verified. No fresh source-page, rights or live target verification. Not camera-original or member-participation proof.",
          "bytesKind": "retained-package-bytes",
          "verifiedAt": "2026-10-20T07:31:43.384006+00:00"
        }
      },
      {
        "assetId": "udtt-hero",
        "version": "d8a7c1d19423b9e28e5609176ef2720decbbdf56154abc0908153c80d3822c5c",
        "target": {
          "kind": "hero",
          "slug": "udtt",
          "groupId": "rec28ldfRTiDPs",
          "entityKey": "rec28ldfRTiDPs"
        },
        "original": {
          "sha256": "c55959059143b87732e514646b3d81104bbc7195a5379c98c5720c50487945bf",
          "byteLength": 245638,
          "mime": "image/jpeg",
          "width": 1067,
          "height": 1600,
          "preserved": true,
          "decode": {
            "sha256": "c55959059143b87732e514646b3d81104bbc7195a5379c98c5720c50487945bf",
            "width": 1067,
            "height": 1600,
            "frames": 1,
            "decoder": "Pillow 12.3.0",
            "reportHash": "4f3513d5339ed43e4c505a5d2c892a0bbe88e6b632306774b568293acbff7b1b"
          }
        },
        "source": {
          "pageUrl": "https://prtimes.jp/main/html/rd/p/000000006.000170584.html",
          "imageUrl": "https://prcdn.freetls.fastly.net/release_image/170584/6/170584-6-69b88d8bc9efc66ed3ab35ec23a9a1fe-1200x1799.jpg",
          "credit": "在日本大韓民国民団大阪府本部 via PR TIMES, 2025-10-08",
          "artifactSha256": "681dae8ae8e14975d76056576c09838010d99a50076834e01dfdd7af716e3291",
          "description": "Retained package bytes, not publisher-original bytes. Publisher page captions identify UDTT; no individual identity or participation inferred from faces. Observed publisher CDN rendition SHA256 ab537193942af46601a56e27dc5b45976c75fb80aedb77d25cb9fd38af170d1a differs from retained original SHA256 c55959059143b87732e514646b3d81104bbc7195a5379c98c5720c50487945bf. Historical transformation chain is not established. Source review does not establish new reuse rights or provider/account capacity.",
          "bytesKind": "retained-package-bytes",
          "verifiedAt": "2026-10-20T09:35:22.078134+00:00"
        }
      },
      {
        "assetId": "udtt-risako",
        "version": "d7ac96c7982de6bfce91c2d129d397b3b52024c5449089ec4d3073afd8ea1c76",
        "target": {
          "kind": "member",
          "slug": "udtt",
          "groupId": "rec28ldfRTiDPs",
          "entityKey": "recvxAPQCFt0cc",
          "memberId": "recvxAPQCFt0cc"
        },
        "original": {
          "sha256": "c5c5b1b2e9c486cd30683454b3a20319d4f8bad246f7e7778163779fa11bdda6",
          "byteLength": 282674,
          "mime": "image/jpeg",
          "width": 700,
          "height": 1049,
          "preserved": true,
          "decode": {
            "sha256": "c5c5b1b2e9c486cd30683454b3a20319d4f8bad246f7e7778163779fa11bdda6",
            "width": 700,
            "height": 1049,
            "frames": 1,
            "decoder": "Pillow 12.3.0",
            "reportHash": "4f3513d5339ed43e4c505a5d2c892a0bbe88e6b632306774b568293acbff7b1b"
          }
        },
        "source": {
          "pageUrl": "https://v.daum.net/v/20250414132025075",
          "imageUrl": "https://t1.daumcdn.net/news/202504/14/SPORTSSEOUL/20250414132026718lvfx.jpg",
          "credit": "SW엔터테인먼트 / Sports Seoul, 이승록, 2025-04-14; syndicated on Daum",
          "artifactSha256": "681dae8ae8e14975d76056576c09838010d99a50076834e01dfdd7af716e3291",
          "description": "Retained package bytes exactly match the observed publisher CDN rendition: SHA256 c5c5b1b2e9c486cd30683454b3a20319d4f8bad246f7e7778163779fa11bdda6, 282674 bytes, JPEG 700x1049. The corresponding publisher caption names 리사코 and credits SW엔터테인먼트; no facial identification. Not a camera-original claim. Source review does not establish new reuse rights or provider/account capacity.",
          "bytesKind": "retained-package-bytes",
          "verifiedAt": "2026-10-20T09:35:22.078134+00:00"
        }
      }
    ],
    "active": []
  },
  {
    "formatVersion": "idol.editorial-assets.v1",
    "revision": "candidate-sol15-udtt-whole-group-v3",
    "scope": {
      "snapshotId": "0180f4aa-664f-48e9-a98a-958d4ae649f9",
      "epoch": 6
    },
    "previousManifestHash": "6fe68fc3b6912b4cefa8d6a503f6702a43991712a869238cea6acd5f9a83f94e",
    "entries": [
      {
        "assetId": "udtt-hero",
        "version": "6d48785493db12769cfc41430cfa6fea47c274e0902a30aaac7efb27f587438e",
        "target": {
          "kind": "hero",
          "slug": "udtt",
          "groupId": "rec28ldfRTiDPs",
          "entityKey": "rec28ldfRTiDPs"
        },
        "original": {
          "sha256": "c55959059143b87732e514646b3d81104bbc7195a5379c98c5720c50487945bf",
          "byteLength": 245638,
          "mime": "image/jpeg",
          "width": 1067,
          "height": 1600,
          "preserved": true,
          "decode": {
            "sha256": "c55959059143b87732e514646b3d81104bbc7195a5379c98c5720c50487945bf",
            "width": 1067,
            "height": 1600,
            "frames": 1,
            "decoder": "Pillow 12.3.0",
            "reportHash": "4f3513d5339ed43e4c505a5d2c892a0bbe88e6b632306774b568293acbff7b1b"
          }
        },
        "source": {
          "pageUrl": "https://prtimes.jp/main/html/rd/p/000000006.000170584.html",
          "imageUrl": null,
          "credit": "活动主办方 2025-10-08 四人宣传照",
          "artifactSha256": "681dae8ae8e14975d76056576c09838010d99a50076834e01dfdd7af716e3291",
          "description": "Isolated fixture only. Packaged public provenance retained; local bytes and full pixel decoding verified. No fresh source-page, rights or live target verification. Not camera-original or member-participation proof.",
          "bytesKind": "retained-package-bytes",
          "verifiedAt": "2026-10-20T07:31:43.384006+00:00"
        }
      },
      {
        "assetId": "udtt-risako",
        "version": "4cd3ec29556d6f158dea9ade4b1a143bf4062ca03335cfc7dd7f3f208b62ede2",
        "target": {
          "kind": "member",
          "slug": "udtt",
          "groupId": "rec28ldfRTiDPs",
          "entityKey": "recvxAPQCFt0cc",
          "memberId": "recvxAPQCFt0cc"
        },
        "original": {
          "sha256": "c5c5b1b2e9c486cd30683454b3a20319d4f8bad246f7e7778163779fa11bdda6",
          "byteLength": 282674,
          "mime": "image/jpeg",
          "width": 700,
          "height": 1049,
          "preserved": true,
          "decode": {
            "sha256": "c5c5b1b2e9c486cd30683454b3a20319d4f8bad246f7e7778163779fa11bdda6",
            "width": 700,
            "height": 1049,
            "frames": 1,
            "decoder": "Pillow 12.3.0",
            "reportHash": "4f3513d5339ed43e4c505a5d2c892a0bbe88e6b632306774b568293acbff7b1b"
          }
        },
        "source": {
          "pageUrl": "https://v.daum.net/v/20250414132025075",
          "imageUrl": null,
          "credit": "SW Entertainment / Sports Seoul 2025-04-14",
          "artifactSha256": "681dae8ae8e14975d76056576c09838010d99a50076834e01dfdd7af716e3291",
          "description": "Isolated fixture only. Packaged public provenance retained; local bytes and full pixel decoding verified. No fresh source-page, rights or live target verification. Not camera-original or member-participation proof.",
          "bytesKind": "retained-package-bytes",
          "verifiedAt": "2026-10-20T07:31:43.384006+00:00"
        }
      },
      {
        "assetId": "udtt-hero",
        "version": "d8a7c1d19423b9e28e5609176ef2720decbbdf56154abc0908153c80d3822c5c",
        "target": {
          "kind": "hero",
          "slug": "udtt",
          "groupId": "rec28ldfRTiDPs",
          "entityKey": "rec28ldfRTiDPs"
        },
        "original": {
          "sha256": "c55959059143b87732e514646b3d81104bbc7195a5379c98c5720c50487945bf",
          "byteLength": 245638,
          "mime": "image/jpeg",
          "width": 1067,
          "height": 1600,
          "preserved": true,
          "decode": {
            "sha256": "c55959059143b87732e514646b3d81104bbc7195a5379c98c5720c50487945bf",
            "width": 1067,
            "height": 1600,
            "frames": 1,
            "decoder": "Pillow 12.3.0",
            "reportHash": "4f3513d5339ed43e4c505a5d2c892a0bbe88e6b632306774b568293acbff7b1b"
          }
        },
        "source": {
          "pageUrl": "https://prtimes.jp/main/html/rd/p/000000006.000170584.html",
          "imageUrl": "https://prcdn.freetls.fastly.net/release_image/170584/6/170584-6-69b88d8bc9efc66ed3ab35ec23a9a1fe-1200x1799.jpg",
          "credit": "在日本大韓民国民団大阪府本部 via PR TIMES, 2025-10-08",
          "artifactSha256": "681dae8ae8e14975d76056576c09838010d99a50076834e01dfdd7af716e3291",
          "description": "Retained package bytes, not publisher-original bytes. Publisher page captions identify UDTT; no individual identity or participation inferred from faces. Observed publisher CDN rendition SHA256 ab537193942af46601a56e27dc5b45976c75fb80aedb77d25cb9fd38af170d1a differs from retained original SHA256 c55959059143b87732e514646b3d81104bbc7195a5379c98c5720c50487945bf. Historical transformation chain is not established. Source review does not establish new reuse rights or provider/account capacity.",
          "bytesKind": "retained-package-bytes",
          "verifiedAt": "2026-10-20T09:35:22.078134+00:00"
        }
      },
      {
        "assetId": "udtt-risako",
        "version": "d7ac96c7982de6bfce91c2d129d397b3b52024c5449089ec4d3073afd8ea1c76",
        "target": {
          "kind": "member",
          "slug": "udtt",
          "groupId": "rec28ldfRTiDPs",
          "entityKey": "recvxAPQCFt0cc",
          "memberId": "recvxAPQCFt0cc"
        },
        "original": {
          "sha256": "c5c5b1b2e9c486cd30683454b3a20319d4f8bad246f7e7778163779fa11bdda6",
          "byteLength": 282674,
          "mime": "image/jpeg",
          "width": 700,
          "height": 1049,
          "preserved": true,
          "decode": {
            "sha256": "c5c5b1b2e9c486cd30683454b3a20319d4f8bad246f7e7778163779fa11bdda6",
            "width": 700,
            "height": 1049,
            "frames": 1,
            "decoder": "Pillow 12.3.0",
            "reportHash": "4f3513d5339ed43e4c505a5d2c892a0bbe88e6b632306774b568293acbff7b1b"
          }
        },
        "source": {
          "pageUrl": "https://v.daum.net/v/20250414132025075",
          "imageUrl": "https://t1.daumcdn.net/news/202504/14/SPORTSSEOUL/20250414132026718lvfx.jpg",
          "credit": "SW엔터테인먼트 / Sports Seoul, 이승록, 2025-04-14; syndicated on Daum",
          "artifactSha256": "681dae8ae8e14975d76056576c09838010d99a50076834e01dfdd7af716e3291",
          "description": "Retained package bytes exactly match the observed publisher CDN rendition: SHA256 c5c5b1b2e9c486cd30683454b3a20319d4f8bad246f7e7778163779fa11bdda6, 282674 bytes, JPEG 700x1049. The corresponding publisher caption names 리사코 and credits SW엔터테인먼트; no facial identification. Not a camera-original claim. Source review does not establish new reuse rights or provider/account capacity.",
          "bytesKind": "retained-package-bytes",
          "verifiedAt": "2026-10-20T09:35:22.078134+00:00"
        }
      },
      {
        "assetId": "udtt-han-chaehee",
        "target": {
          "slug": "udtt",
          "groupId": "rec28ldfRTiDPs",
          "kind": "member",
          "entityKey": "recvxAPQCFRlmM",
          "memberId": "recvxAPQCFRlmM"
        },
        "original": {
          "sha256": "d8665766996b02bd6e2d9474c0762028faad3a1c09c91e2f283ed264be0efbb7",
          "byteLength": 346270,
          "mime": "image/jpeg",
          "width": 700,
          "height": 1050,
          "preserved": true,
          "decode": {
            "sha256": "d8665766996b02bd6e2d9474c0762028faad3a1c09c91e2f283ed264be0efbb7",
            "width": 700,
            "height": 1050,
            "frames": 1,
            "decoder": "Pillow 12.3.0",
            "reportHash": "cd899eaf3efd8c08abaaf1e851bd2d604dfe5f5be25dc61a49ce558da374105c"
          }
        },
        "source": {
          "pageUrl": "https://v.daum.net/v/20250414132025075",
          "imageUrl": "https://t1.daumcdn.net/news/202504/14/SPORTSSEOUL/20250414132027014vhpe.jpg",
          "credit": "SW Entertainment / Sports Seoul 2025-04-14",
          "artifactSha256": "16816428c930056f9646490640f95819b99c7192b7a78306bb572f3aac0dc1db",
          "description": "named-caption-reconfirmed; prior-exact-byte-download-mapping. Caption/text attribution only. Current photo bytes not newly downloaded in this audit. No fresh roster/activity conclusion.",
          "bytesKind": "retained-package-bytes",
          "verifiedAt": "2026-10-20T10:58:58Z"
        },
        "version": "17a067bc1a07fbc00f1f9715a2268cb5eabb3f61ba4fac17c5a3fc3e3f2f84d1"
      },
      {
        "assetId": "udtt-gu-hanna",
        "target": {
          "slug": "udtt",
          "groupId": "rec28ldfRTiDPs",
          "kind": "member",
          "entityKey": "recvxAPQCFnv3p",
          "memberId": "recvxAPQCFnv3p"
        },
        "original": {
          "sha256": "a073524053353a2fb90831059af37edcc8c2753fbc519b383711ec693301b8b7",
          "byteLength": 324365,
          "mime": "image/jpeg",
          "width": 700,
          "height": 1050,
          "preserved": true,
          "decode": {
            "sha256": "a073524053353a2fb90831059af37edcc8c2753fbc519b383711ec693301b8b7",
            "width": 700,
            "height": 1050,
            "frames": 1,
            "decoder": "Pillow 12.3.0",
            "reportHash": "cd899eaf3efd8c08abaaf1e851bd2d604dfe5f5be25dc61a49ce558da374105c"
          }
        },
        "source": {
          "pageUrl": "https://v.daum.net/v/20250414132025075",
          "imageUrl": "https://t1.daumcdn.net/news/202504/14/SPORTSSEOUL/20250414132027354ocsl.jpg",
          "credit": "SW Entertainment / Sports Seoul 2025-04-14",
          "artifactSha256": "16816428c930056f9646490640f95819b99c7192b7a78306bb572f3aac0dc1db",
          "description": "named-caption-reconfirmed; prior-exact-byte-download-mapping. Caption/text attribution only. Current photo bytes not newly downloaded in this audit. No fresh roster/activity conclusion.",
          "bytesKind": "retained-package-bytes",
          "verifiedAt": "2026-10-20T10:58:58Z"
        },
        "version": "83822b36bfd8254027800757c51ae712f31a753df0da9cb2c915bbbda79eac05"
      },
      {
        "assetId": "udtt-really-really-mv",
        "target": {
          "slug": "udtt",
          "groupId": "rec28ldfRTiDPs",
          "kind": "video",
          "entityKey": "rec28ldfRTrPxZ",
          "slot": "mv",
          "workIds": [
            "rec28ldfRTrPxZ"
          ],
          "videoId": "aKRY80dEkJw",
          "sourceKey": "aKRY80dEkJw",
          "clip": null,
          "videoTypeByWork": [
            {
              "workId": "rec28ldfRTrPxZ",
              "videoType": "官方MV"
            }
          ],
          "bindingMode": "native-exact"
        },
        "original": {
          "sha256": "4139391550e96a783d920ff4cbb6563b864684b299089cebbc550f8de44ab0c1",
          "byteLength": 101380,
          "mime": "image/jpeg",
          "width": 1280,
          "height": 720,
          "preserved": true,
          "decode": {
            "sha256": "4139391550e96a783d920ff4cbb6563b864684b299089cebbc550f8de44ab0c1",
            "width": 1280,
            "height": 720,
            "frames": 1,
            "decoder": "Pillow 12.3.0",
            "reportHash": "cd899eaf3efd8c08abaaf1e851bd2d604dfe5f5be25dc61a49ce558da374105c"
          }
        },
        "source": {
          "pageUrl": "https://www.youtube.com/watch?v=aKRY80dEkJw",
          "imageUrl": "https://img.youtube.com/vi/aKRY80dEkJw/maxresdefault.jpg",
          "credit": "SW ENTERTAINMENT / YouTube publisher thumbnail",
          "artifactSha256": "16816428c930056f9646490640f95819b99c7192b7a78306bb572f3aac0dc1db",
          "description": "retained-reviewed-exact-video-tuple-and-thumbnail; fresh-watch-page-unavailable. Publisher thumbnail artwork, not verified video frame or person-participation evidence. Retained prior HTTP 200 + exact SHA/decode; no fresh watch-page or CDN byte check in this audit. Original native parent videoType remains 官方MV for both slots.",
          "bytesKind": "retained-package-bytes",
          "verifiedAt": "2026-10-20T10:58:58Z"
        },
        "version": "b91e27db5326776ff89f887d9e93fee150aefd93d47163cbfa7fe9e1fc70f55c"
      },
      {
        "assetId": "udtt-retry-cover",
        "target": {
          "slug": "udtt",
          "groupId": "rec28ldfRTiDPs",
          "kind": "release-cover",
          "entityKey": "catalog:udtt:retry",
          "releaseId": null
        },
        "original": {
          "sha256": "a197a59f8ced877376e9434b9c7dfd9f053e6f36412e7cfd5d788778300fa82c",
          "byteLength": 8884,
          "mime": "image/webp",
          "width": 632,
          "height": 632,
          "preserved": true,
          "decode": {
            "sha256": "a197a59f8ced877376e9434b9c7dfd9f053e6f36412e7cfd5d788778300fa82c",
            "width": 632,
            "height": 632,
            "frames": 1,
            "decoder": "Pillow 12.3.0",
            "reportHash": "cd899eaf3efd8c08abaaf1e851bd2d604dfe5f5be25dc61a49ce558da374105c"
          }
        },
        "source": {
          "pageUrl": "https://music.apple.com/us/album/retry-single/1782470972",
          "imageUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/76/1f/f4/761ff4df-571d-8722-6c90-bb79d6f33049/8800284467122_cover.jpg/632x632bb.webp",
          "credit": "UDTT · Apple Music 目录封面",
          "artifactSha256": "16816428c930056f9646490640f95819b99c7192b7a78306bb572f3aac0dc1db",
          "description": "album-name-and-artist-reconfirmed; retained-exact-rendition-mapping. Editorial release keys only, no native release record ID. Preserve platform-provided 632x632 WebP bytes without crop/re-encoding. Does not establish rights or new live target validation.",
          "bytesKind": "retained-package-bytes",
          "verifiedAt": "2026-10-20T10:58:58Z"
        },
        "version": "52b298b69a62ab2d5d9c84fa5d4d9f739a14b38967c1297aecc6c3fb1a40b084"
      },
      {
        "assetId": "udtt-school-rush-cover",
        "target": {
          "slug": "udtt",
          "groupId": "rec28ldfRTiDPs",
          "kind": "release-cover",
          "entityKey": "catalog:udtt:school-rush",
          "releaseId": null
        },
        "original": {
          "sha256": "fd945ca10f63316bd436437b7a8d89d72ac475f16880ac3f969894de551bf104",
          "byteLength": 18732,
          "mime": "image/webp",
          "width": 632,
          "height": 632,
          "preserved": true,
          "decode": {
            "sha256": "fd945ca10f63316bd436437b7a8d89d72ac475f16880ac3f969894de551bf104",
            "width": 632,
            "height": 632,
            "frames": 1,
            "decoder": "Pillow 12.3.0",
            "reportHash": "cd899eaf3efd8c08abaaf1e851bd2d604dfe5f5be25dc61a49ce558da374105c"
          }
        },
        "source": {
          "pageUrl": "https://music.apple.com/us/album/school-rush-single/1809889440",
          "imageUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/72/34/f1/7234f17d-dabf-e883-4c8f-48e29ce637d7/8800306817348_cover.jpg/632x632bb.webp",
          "credit": "UDTT · Apple Music 目录封面",
          "artifactSha256": "16816428c930056f9646490640f95819b99c7192b7a78306bb572f3aac0dc1db",
          "description": "album-name-and-artist-reconfirmed; retained-exact-rendition-mapping. Editorial release keys only, no native release record ID. Preserve platform-provided 632x632 WebP bytes without crop/re-encoding. Does not establish rights or new live target validation.",
          "bytesKind": "retained-package-bytes",
          "verifiedAt": "2026-10-20T10:58:58Z"
        },
        "version": "2166aab25428fd49ad55b33e30844e5c81e76212f55deb089d2fc982675dc3fa"
      },
      {
        "assetId": "udtt-viper-cover",
        "target": {
          "slug": "udtt",
          "groupId": "rec28ldfRTiDPs",
          "kind": "release-cover",
          "entityKey": "catalog:udtt:viper",
          "releaseId": null
        },
        "original": {
          "sha256": "aa208cffba81469787c5b4807310e5ceabd1d4abd4d039cc45c2d422aa27f270",
          "byteLength": 28424,
          "mime": "image/webp",
          "width": 632,
          "height": 632,
          "preserved": true,
          "decode": {
            "sha256": "aa208cffba81469787c5b4807310e5ceabd1d4abd4d039cc45c2d422aa27f270",
            "width": 632,
            "height": 632,
            "frames": 1,
            "decoder": "Pillow 12.3.0",
            "reportHash": "cd899eaf3efd8c08abaaf1e851bd2d604dfe5f5be25dc61a49ce558da374105c"
          }
        },
        "source": {
          "pageUrl": "https://music.apple.com/us/album/viper-single/6783258321",
          "imageUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/68/4d/5f/684d5fda-2502-fb6f-52fa-0dea0f3fe6f0/26UMGIM80525.rgb.jpg/632x632bb.webp",
          "credit": "UDTT · Apple Music 目录封面",
          "artifactSha256": "16816428c930056f9646490640f95819b99c7192b7a78306bb572f3aac0dc1db",
          "description": "album-name-and-artist-reconfirmed; retained-exact-rendition-mapping. Editorial release keys only, no native release record ID. Preserve platform-provided 632x632 WebP bytes without crop/re-encoding. Does not establish rights or new live target validation.",
          "bytesKind": "retained-package-bytes",
          "verifiedAt": "2026-10-20T10:58:58Z"
        },
        "version": "a78e0ea693c9db80bce1b02807fe18722b7c055364c468c78d0301b873d53adc"
      },
      {
        "assetId": "udtt-really-really-stage",
        "target": {
          "slug": "udtt",
          "groupId": "rec28ldfRTiDPs",
          "kind": "video",
          "entityKey": "stage:rec28ldfRTrPxZ:nZa0Th64v00",
          "slot": "stage",
          "workIds": [
            "rec28ldfRTrPxZ"
          ],
          "videoId": "nZa0Th64v00",
          "sourceKey": "nZa0Th64v00",
          "clip": null,
          "videoTypeByWork": [
            {
              "workId": "rec28ldfRTrPxZ",
              "videoType": "官方MV"
            }
          ],
          "bindingMode": "editorial-only"
        },
        "original": {
          "sha256": "96bec21c388b48ec491b09b40e3b48601fae39df100e85faa6d8079889db5d95",
          "byteLength": 110130,
          "mime": "image/jpeg",
          "width": 1280,
          "height": 720,
          "preserved": true,
          "decode": {
            "sha256": "96bec21c388b48ec491b09b40e3b48601fae39df100e85faa6d8079889db5d95",
            "width": 1280,
            "height": 720,
            "frames": 1,
            "decoder": "Pillow 12.3.0",
            "reportHash": "cd899eaf3efd8c08abaaf1e851bd2d604dfe5f5be25dc61a49ce558da374105c"
          }
        },
        "source": {
          "pageUrl": "https://www.youtube.com/watch?v=nZa0Th64v00",
          "imageUrl": "https://img.youtube.com/vi/nZa0Th64v00/maxresdefault.jpg",
          "credit": "SW ENTERTAINMENT / YouTube publisher thumbnail",
          "artifactSha256": "16816428c930056f9646490640f95819b99c7192b7a78306bb572f3aac0dc1db",
          "description": "retained-reviewed-exact-video-tuple-and-thumbnail; fresh-watch-page-unavailable. Publisher thumbnail artwork, not verified video frame or person-participation evidence. Retained prior HTTP 200 + exact SHA/decode; no fresh watch-page or CDN byte check in this audit. Original native parent videoType remains 官方MV for both slots.",
          "bytesKind": "retained-package-bytes",
          "verifiedAt": "2026-10-20T10:58:58Z"
        },
        "version": "4edad668cefc613b21f09d20f56896c9cf955d2dbea0af46ec93d74d1ffa262e"
      },
      {
        "assetId": "udtt-woojung",
        "target": {
          "slug": "udtt",
          "groupId": "rec28ldfRTiDPs",
          "kind": "member",
          "entityKey": "recvxAPQCF66Sl",
          "memberId": "recvxAPQCF66Sl"
        },
        "original": {
          "sha256": "cbf9129dfd0073537c892e6ae1ba32851141303f414065b415f7caecce289f5c",
          "byteLength": 20090,
          "mime": "image/jpeg",
          "width": 200,
          "height": 200,
          "preserved": true,
          "decode": {
            "sha256": "cbf9129dfd0073537c892e6ae1ba32851141303f414065b415f7caecce289f5c",
            "width": 200,
            "height": 200,
            "frames": 1,
            "decoder": "Pillow 12.3.0",
            "reportHash": "cd899eaf3efd8c08abaaf1e851bd2d604dfe5f5be25dc61a49ce558da374105c"
          }
        },
        "source": {
          "pageUrl": "https://music.bugs.co.kr/artist/80414746",
          "imageUrl": "https://image.bugsm.co.kr/artist/images/200/804147/80414746.jpg?version=20260628002100",
          "credit": "Bugs · 平台成员头像",
          "artifactSha256": "16816428c930056f9646490640f95819b99c7192b7a78306bb572f3aac0dc1db",
          "description": "Retained existing deployed UDTT member slot bytes only. Same deployed member binding, path and SHA256 are preserved without selecting a new image or asserting publisher-named portrait identity. The historical Bugs image URL is retained; publisher-named identity evidence remains incomplete. No facial identification, new attribution assertion, new reuse rights or provider/account capacity claim.",
          "bytesKind": "retained-package-bytes",
          "verifiedAt": "2026-10-20T10:58:58Z"
        },
        "version": "9f853cdb04c5c7aebc96b2691c19c3f16f12c9bca705ff5122b9fe547104f8de"
      },
      {
        "assetId": "udtt-kwon-yejin",
        "target": {
          "slug": "udtt",
          "groupId": "rec28ldfRTiDPs",
          "kind": "member",
          "entityKey": "recvxAPQCF1lfe",
          "memberId": "recvxAPQCF1lfe"
        },
        "original": {
          "sha256": "63b26c338b52e00f599df134b76ababf49535c3a177c7e06323d8594f3fa9cae",
          "byteLength": 312851,
          "mime": "image/jpeg",
          "width": 700,
          "height": 1049,
          "preserved": true,
          "decode": {
            "sha256": "63b26c338b52e00f599df134b76ababf49535c3a177c7e06323d8594f3fa9cae",
            "width": 700,
            "height": 1049,
            "frames": 1,
            "decoder": "Pillow 12.3.0",
            "reportHash": "cd899eaf3efd8c08abaaf1e851bd2d604dfe5f5be25dc61a49ce558da374105c"
          }
        },
        "source": {
          "pageUrl": "https://v.daum.net/v/20250414132025075",
          "imageUrl": "https://t1.daumcdn.net/news/202504/14/SPORTSSEOUL/20250414132026370mzpm.jpg",
          "credit": "SW Entertainment / Sports Seoul 2025-04-14",
          "artifactSha256": "16816428c930056f9646490640f95819b99c7192b7a78306bb572f3aac0dc1db",
          "description": "named-caption-reconfirmed; prior-exact-byte-download-mapping. Caption/text attribution only. Current photo bytes not newly downloaded in this audit. No fresh roster/activity conclusion.",
          "bytesKind": "retained-package-bytes",
          "verifiedAt": "2026-10-20T10:58:58Z"
        },
        "version": "c6769c0b0cde77749efb1554b1c884110c42c422d7f2fedf176b0f4cece84444"
      }
    ],
    "active": []
  }
];
export const editorialPilotIdentities: EditorialPilotIdentity[] = [{"slug": "udtt", "groupId": "rec28ldfRTiDPs", "members": [{"memberId": "recvxAPQCFRlmM", "currentGroupIds": ["rec28ldfRTiDPs"], "formerGroupIds": []}, {"memberId": "recvxAPQCFnv3p", "currentGroupIds": ["rec28ldfRTiDPs"], "formerGroupIds": []}, {"memberId": "recvxAPQCFt0cc", "currentGroupIds": ["rec28ldfRTiDPs"], "formerGroupIds": []}, {"memberId": "recvxAPQCF66Sl", "currentGroupIds": ["rec28ldfRTiDPs"], "formerGroupIds": []}, {"memberId": "recvxAPQCF1lfe", "currentGroupIds": ["rec28ldfRTiDPs"], "formerGroupIds": []}]}];
export const editorialCandidateManifest: AssetManifest = {
  "formatVersion": "idol.editorial-assets.v1",
  "revision": "candidate-sol15-udtt-public-ten-v4",
  "scope": {
    "snapshotId": "0180f4aa-664f-48e9-a98a-958d4ae649f9",
    "epoch": 6
  },
  "previousManifestHash": "57987e98b564d745cfc936d53acaefdca4574c8be98aa4eb1cc40c7ab351f89f",
  "entries": [
    {
      "assetId": "udtt-hero",
      "version": "6d48785493db12769cfc41430cfa6fea47c274e0902a30aaac7efb27f587438e",
      "target": {
        "kind": "hero",
        "slug": "udtt",
        "groupId": "rec28ldfRTiDPs",
        "entityKey": "rec28ldfRTiDPs"
      },
      "original": {
        "sha256": "c55959059143b87732e514646b3d81104bbc7195a5379c98c5720c50487945bf",
        "byteLength": 245638,
        "mime": "image/jpeg",
        "width": 1067,
        "height": 1600,
        "preserved": true,
        "decode": {
          "sha256": "c55959059143b87732e514646b3d81104bbc7195a5379c98c5720c50487945bf",
          "width": 1067,
          "height": 1600,
          "frames": 1,
          "decoder": "Pillow 12.3.0",
          "reportHash": "4f3513d5339ed43e4c505a5d2c892a0bbe88e6b632306774b568293acbff7b1b"
        }
      },
      "source": {
        "pageUrl": "https://prtimes.jp/main/html/rd/p/000000006.000170584.html",
        "imageUrl": null,
        "credit": "活动主办方 2025-10-08 四人宣传照",
        "artifactSha256": "681dae8ae8e14975d76056576c09838010d99a50076834e01dfdd7af716e3291",
        "description": "Isolated fixture only. Packaged public provenance retained; local bytes and full pixel decoding verified. No fresh source-page, rights or live target verification. Not camera-original or member-participation proof.",
        "bytesKind": "retained-package-bytes",
        "verifiedAt": "2026-10-20T07:31:43.384006+00:00"
      }
    },
    {
      "assetId": "udtt-risako",
      "version": "4cd3ec29556d6f158dea9ade4b1a143bf4062ca03335cfc7dd7f3f208b62ede2",
      "target": {
        "kind": "member",
        "slug": "udtt",
        "groupId": "rec28ldfRTiDPs",
        "entityKey": "recvxAPQCFt0cc",
        "memberId": "recvxAPQCFt0cc"
      },
      "original": {
        "sha256": "c5c5b1b2e9c486cd30683454b3a20319d4f8bad246f7e7778163779fa11bdda6",
        "byteLength": 282674,
        "mime": "image/jpeg",
        "width": 700,
        "height": 1049,
        "preserved": true,
        "decode": {
          "sha256": "c5c5b1b2e9c486cd30683454b3a20319d4f8bad246f7e7778163779fa11bdda6",
          "width": 700,
          "height": 1049,
          "frames": 1,
          "decoder": "Pillow 12.3.0",
          "reportHash": "4f3513d5339ed43e4c505a5d2c892a0bbe88e6b632306774b568293acbff7b1b"
        }
      },
      "source": {
        "pageUrl": "https://v.daum.net/v/20250414132025075",
        "imageUrl": null,
        "credit": "SW Entertainment / Sports Seoul 2025-04-14",
        "artifactSha256": "681dae8ae8e14975d76056576c09838010d99a50076834e01dfdd7af716e3291",
        "description": "Isolated fixture only. Packaged public provenance retained; local bytes and full pixel decoding verified. No fresh source-page, rights or live target verification. Not camera-original or member-participation proof.",
        "bytesKind": "retained-package-bytes",
        "verifiedAt": "2026-10-20T07:31:43.384006+00:00"
      }
    },
    {
      "assetId": "udtt-hero",
      "version": "d8a7c1d19423b9e28e5609176ef2720decbbdf56154abc0908153c80d3822c5c",
      "target": {
        "kind": "hero",
        "slug": "udtt",
        "groupId": "rec28ldfRTiDPs",
        "entityKey": "rec28ldfRTiDPs"
      },
      "original": {
        "sha256": "c55959059143b87732e514646b3d81104bbc7195a5379c98c5720c50487945bf",
        "byteLength": 245638,
        "mime": "image/jpeg",
        "width": 1067,
        "height": 1600,
        "preserved": true,
        "decode": {
          "sha256": "c55959059143b87732e514646b3d81104bbc7195a5379c98c5720c50487945bf",
          "width": 1067,
          "height": 1600,
          "frames": 1,
          "decoder": "Pillow 12.3.0",
          "reportHash": "4f3513d5339ed43e4c505a5d2c892a0bbe88e6b632306774b568293acbff7b1b"
        }
      },
      "source": {
        "pageUrl": "https://prtimes.jp/main/html/rd/p/000000006.000170584.html",
        "imageUrl": "https://prcdn.freetls.fastly.net/release_image/170584/6/170584-6-69b88d8bc9efc66ed3ab35ec23a9a1fe-1200x1799.jpg",
        "credit": "在日本大韓民国民団大阪府本部 via PR TIMES, 2025-10-08",
        "artifactSha256": "681dae8ae8e14975d76056576c09838010d99a50076834e01dfdd7af716e3291",
        "description": "Retained package bytes, not publisher-original bytes. Publisher page captions identify UDTT; no individual identity or participation inferred from faces. Observed publisher CDN rendition SHA256 ab537193942af46601a56e27dc5b45976c75fb80aedb77d25cb9fd38af170d1a differs from retained original SHA256 c55959059143b87732e514646b3d81104bbc7195a5379c98c5720c50487945bf. Historical transformation chain is not established. Source review does not establish new reuse rights or provider/account capacity.",
        "bytesKind": "retained-package-bytes",
        "verifiedAt": "2026-10-20T09:35:22.078134+00:00"
      }
    },
    {
      "assetId": "udtt-risako",
      "version": "d7ac96c7982de6bfce91c2d129d397b3b52024c5449089ec4d3073afd8ea1c76",
      "target": {
        "kind": "member",
        "slug": "udtt",
        "groupId": "rec28ldfRTiDPs",
        "entityKey": "recvxAPQCFt0cc",
        "memberId": "recvxAPQCFt0cc"
      },
      "original": {
        "sha256": "c5c5b1b2e9c486cd30683454b3a20319d4f8bad246f7e7778163779fa11bdda6",
        "byteLength": 282674,
        "mime": "image/jpeg",
        "width": 700,
        "height": 1049,
        "preserved": true,
        "decode": {
          "sha256": "c5c5b1b2e9c486cd30683454b3a20319d4f8bad246f7e7778163779fa11bdda6",
          "width": 700,
          "height": 1049,
          "frames": 1,
          "decoder": "Pillow 12.3.0",
          "reportHash": "4f3513d5339ed43e4c505a5d2c892a0bbe88e6b632306774b568293acbff7b1b"
        }
      },
      "source": {
        "pageUrl": "https://v.daum.net/v/20250414132025075",
        "imageUrl": "https://t1.daumcdn.net/news/202504/14/SPORTSSEOUL/20250414132026718lvfx.jpg",
        "credit": "SW엔터테인먼트 / Sports Seoul, 이승록, 2025-04-14; syndicated on Daum",
        "artifactSha256": "681dae8ae8e14975d76056576c09838010d99a50076834e01dfdd7af716e3291",
        "description": "Retained package bytes exactly match the observed publisher CDN rendition: SHA256 c5c5b1b2e9c486cd30683454b3a20319d4f8bad246f7e7778163779fa11bdda6, 282674 bytes, JPEG 700x1049. The corresponding publisher caption names 리사코 and credits SW엔터테인먼트; no facial identification. Not a camera-original claim. Source review does not establish new reuse rights or provider/account capacity.",
        "bytesKind": "retained-package-bytes",
        "verifiedAt": "2026-10-20T09:35:22.078134+00:00"
      }
    },
    {
      "assetId": "udtt-han-chaehee",
      "target": {
        "slug": "udtt",
        "groupId": "rec28ldfRTiDPs",
        "kind": "member",
        "entityKey": "recvxAPQCFRlmM",
        "memberId": "recvxAPQCFRlmM"
      },
      "original": {
        "sha256": "d8665766996b02bd6e2d9474c0762028faad3a1c09c91e2f283ed264be0efbb7",
        "byteLength": 346270,
        "mime": "image/jpeg",
        "width": 700,
        "height": 1050,
        "preserved": true,
        "decode": {
          "sha256": "d8665766996b02bd6e2d9474c0762028faad3a1c09c91e2f283ed264be0efbb7",
          "width": 700,
          "height": 1050,
          "frames": 1,
          "decoder": "Pillow 12.3.0",
          "reportHash": "cd899eaf3efd8c08abaaf1e851bd2d604dfe5f5be25dc61a49ce558da374105c"
        }
      },
      "source": {
        "pageUrl": "https://v.daum.net/v/20250414132025075",
        "imageUrl": "https://t1.daumcdn.net/news/202504/14/SPORTSSEOUL/20250414132027014vhpe.jpg",
        "credit": "SW Entertainment / Sports Seoul 2025-04-14",
        "artifactSha256": "16816428c930056f9646490640f95819b99c7192b7a78306bb572f3aac0dc1db",
        "description": "named-caption-reconfirmed; prior-exact-byte-download-mapping. Caption/text attribution only. Current photo bytes not newly downloaded in this audit. No fresh roster/activity conclusion.",
        "bytesKind": "retained-package-bytes",
        "verifiedAt": "2026-10-20T10:58:58Z"
      },
      "version": "17a067bc1a07fbc00f1f9715a2268cb5eabb3f61ba4fac17c5a3fc3e3f2f84d1"
    },
    {
      "assetId": "udtt-gu-hanna",
      "target": {
        "slug": "udtt",
        "groupId": "rec28ldfRTiDPs",
        "kind": "member",
        "entityKey": "recvxAPQCFnv3p",
        "memberId": "recvxAPQCFnv3p"
      },
      "original": {
        "sha256": "a073524053353a2fb90831059af37edcc8c2753fbc519b383711ec693301b8b7",
        "byteLength": 324365,
        "mime": "image/jpeg",
        "width": 700,
        "height": 1050,
        "preserved": true,
        "decode": {
          "sha256": "a073524053353a2fb90831059af37edcc8c2753fbc519b383711ec693301b8b7",
          "width": 700,
          "height": 1050,
          "frames": 1,
          "decoder": "Pillow 12.3.0",
          "reportHash": "cd899eaf3efd8c08abaaf1e851bd2d604dfe5f5be25dc61a49ce558da374105c"
        }
      },
      "source": {
        "pageUrl": "https://v.daum.net/v/20250414132025075",
        "imageUrl": "https://t1.daumcdn.net/news/202504/14/SPORTSSEOUL/20250414132027354ocsl.jpg",
        "credit": "SW Entertainment / Sports Seoul 2025-04-14",
        "artifactSha256": "16816428c930056f9646490640f95819b99c7192b7a78306bb572f3aac0dc1db",
        "description": "named-caption-reconfirmed; prior-exact-byte-download-mapping. Caption/text attribution only. Current photo bytes not newly downloaded in this audit. No fresh roster/activity conclusion.",
        "bytesKind": "retained-package-bytes",
        "verifiedAt": "2026-10-20T10:58:58Z"
      },
      "version": "83822b36bfd8254027800757c51ae712f31a753df0da9cb2c915bbbda79eac05"
    },
    {
      "assetId": "udtt-really-really-mv",
      "target": {
        "slug": "udtt",
        "groupId": "rec28ldfRTiDPs",
        "kind": "video",
        "entityKey": "rec28ldfRTrPxZ",
        "slot": "mv",
        "workIds": [
          "rec28ldfRTrPxZ"
        ],
        "videoId": "aKRY80dEkJw",
        "sourceKey": "aKRY80dEkJw",
        "clip": null,
        "videoTypeByWork": [
          {
            "workId": "rec28ldfRTrPxZ",
            "videoType": "官方MV"
          }
        ],
        "bindingMode": "native-exact"
      },
      "original": {
        "sha256": "4139391550e96a783d920ff4cbb6563b864684b299089cebbc550f8de44ab0c1",
        "byteLength": 101380,
        "mime": "image/jpeg",
        "width": 1280,
        "height": 720,
        "preserved": true,
        "decode": {
          "sha256": "4139391550e96a783d920ff4cbb6563b864684b299089cebbc550f8de44ab0c1",
          "width": 1280,
          "height": 720,
          "frames": 1,
          "decoder": "Pillow 12.3.0",
          "reportHash": "cd899eaf3efd8c08abaaf1e851bd2d604dfe5f5be25dc61a49ce558da374105c"
        }
      },
      "source": {
        "pageUrl": "https://www.youtube.com/watch?v=aKRY80dEkJw",
        "imageUrl": "https://img.youtube.com/vi/aKRY80dEkJw/maxresdefault.jpg",
        "credit": "SW ENTERTAINMENT / YouTube publisher thumbnail",
        "artifactSha256": "16816428c930056f9646490640f95819b99c7192b7a78306bb572f3aac0dc1db",
        "description": "retained-reviewed-exact-video-tuple-and-thumbnail; fresh-watch-page-unavailable. Publisher thumbnail artwork, not verified video frame or person-participation evidence. Retained prior HTTP 200 + exact SHA/decode; no fresh watch-page or CDN byte check in this audit. Original native parent videoType remains 官方MV for both slots.",
        "bytesKind": "retained-package-bytes",
        "verifiedAt": "2026-10-20T10:58:58Z"
      },
      "version": "b91e27db5326776ff89f887d9e93fee150aefd93d47163cbfa7fe9e1fc70f55c"
    },
    {
      "assetId": "udtt-retry-cover",
      "target": {
        "slug": "udtt",
        "groupId": "rec28ldfRTiDPs",
        "kind": "release-cover",
        "entityKey": "catalog:udtt:retry",
        "releaseId": null
      },
      "original": {
        "sha256": "a197a59f8ced877376e9434b9c7dfd9f053e6f36412e7cfd5d788778300fa82c",
        "byteLength": 8884,
        "mime": "image/webp",
        "width": 632,
        "height": 632,
        "preserved": true,
        "decode": {
          "sha256": "a197a59f8ced877376e9434b9c7dfd9f053e6f36412e7cfd5d788778300fa82c",
          "width": 632,
          "height": 632,
          "frames": 1,
          "decoder": "Pillow 12.3.0",
          "reportHash": "cd899eaf3efd8c08abaaf1e851bd2d604dfe5f5be25dc61a49ce558da374105c"
        }
      },
      "source": {
        "pageUrl": "https://music.apple.com/us/album/retry-single/1782470972",
        "imageUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/76/1f/f4/761ff4df-571d-8722-6c90-bb79d6f33049/8800284467122_cover.jpg/632x632bb.webp",
        "credit": "UDTT · Apple Music 目录封面",
        "artifactSha256": "16816428c930056f9646490640f95819b99c7192b7a78306bb572f3aac0dc1db",
        "description": "album-name-and-artist-reconfirmed; retained-exact-rendition-mapping. Editorial release keys only, no native release record ID. Preserve platform-provided 632x632 WebP bytes without crop/re-encoding. Does not establish rights or new live target validation.",
        "bytesKind": "retained-package-bytes",
        "verifiedAt": "2026-10-20T10:58:58Z"
      },
      "version": "52b298b69a62ab2d5d9c84fa5d4d9f739a14b38967c1297aecc6c3fb1a40b084"
    },
    {
      "assetId": "udtt-school-rush-cover",
      "target": {
        "slug": "udtt",
        "groupId": "rec28ldfRTiDPs",
        "kind": "release-cover",
        "entityKey": "catalog:udtt:school-rush",
        "releaseId": null
      },
      "original": {
        "sha256": "fd945ca10f63316bd436437b7a8d89d72ac475f16880ac3f969894de551bf104",
        "byteLength": 18732,
        "mime": "image/webp",
        "width": 632,
        "height": 632,
        "preserved": true,
        "decode": {
          "sha256": "fd945ca10f63316bd436437b7a8d89d72ac475f16880ac3f969894de551bf104",
          "width": 632,
          "height": 632,
          "frames": 1,
          "decoder": "Pillow 12.3.0",
          "reportHash": "cd899eaf3efd8c08abaaf1e851bd2d604dfe5f5be25dc61a49ce558da374105c"
        }
      },
      "source": {
        "pageUrl": "https://music.apple.com/us/album/school-rush-single/1809889440",
        "imageUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/72/34/f1/7234f17d-dabf-e883-4c8f-48e29ce637d7/8800306817348_cover.jpg/632x632bb.webp",
        "credit": "UDTT · Apple Music 目录封面",
        "artifactSha256": "16816428c930056f9646490640f95819b99c7192b7a78306bb572f3aac0dc1db",
        "description": "album-name-and-artist-reconfirmed; retained-exact-rendition-mapping. Editorial release keys only, no native release record ID. Preserve platform-provided 632x632 WebP bytes without crop/re-encoding. Does not establish rights or new live target validation.",
        "bytesKind": "retained-package-bytes",
        "verifiedAt": "2026-10-20T10:58:58Z"
      },
      "version": "2166aab25428fd49ad55b33e30844e5c81e76212f55deb089d2fc982675dc3fa"
    },
    {
      "assetId": "udtt-viper-cover",
      "target": {
        "slug": "udtt",
        "groupId": "rec28ldfRTiDPs",
        "kind": "release-cover",
        "entityKey": "catalog:udtt:viper",
        "releaseId": null
      },
      "original": {
        "sha256": "aa208cffba81469787c5b4807310e5ceabd1d4abd4d039cc45c2d422aa27f270",
        "byteLength": 28424,
        "mime": "image/webp",
        "width": 632,
        "height": 632,
        "preserved": true,
        "decode": {
          "sha256": "aa208cffba81469787c5b4807310e5ceabd1d4abd4d039cc45c2d422aa27f270",
          "width": 632,
          "height": 632,
          "frames": 1,
          "decoder": "Pillow 12.3.0",
          "reportHash": "cd899eaf3efd8c08abaaf1e851bd2d604dfe5f5be25dc61a49ce558da374105c"
        }
      },
      "source": {
        "pageUrl": "https://music.apple.com/us/album/viper-single/6783258321",
        "imageUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/68/4d/5f/684d5fda-2502-fb6f-52fa-0dea0f3fe6f0/26UMGIM80525.rgb.jpg/632x632bb.webp",
        "credit": "UDTT · Apple Music 目录封面",
        "artifactSha256": "16816428c930056f9646490640f95819b99c7192b7a78306bb572f3aac0dc1db",
        "description": "album-name-and-artist-reconfirmed; retained-exact-rendition-mapping. Editorial release keys only, no native release record ID. Preserve platform-provided 632x632 WebP bytes without crop/re-encoding. Does not establish rights or new live target validation.",
        "bytesKind": "retained-package-bytes",
        "verifiedAt": "2026-10-20T10:58:58Z"
      },
      "version": "a78e0ea693c9db80bce1b02807fe18722b7c055364c468c78d0301b873d53adc"
    },
    {
      "assetId": "udtt-really-really-stage",
      "target": {
        "slug": "udtt",
        "groupId": "rec28ldfRTiDPs",
        "kind": "video",
        "entityKey": "stage:rec28ldfRTrPxZ:nZa0Th64v00",
        "slot": "stage",
        "workIds": [
          "rec28ldfRTrPxZ"
        ],
        "videoId": "nZa0Th64v00",
        "sourceKey": "nZa0Th64v00",
        "clip": null,
        "videoTypeByWork": [
          {
            "workId": "rec28ldfRTrPxZ",
            "videoType": "官方MV"
          }
        ],
        "bindingMode": "editorial-only"
      },
      "original": {
        "sha256": "96bec21c388b48ec491b09b40e3b48601fae39df100e85faa6d8079889db5d95",
        "byteLength": 110130,
        "mime": "image/jpeg",
        "width": 1280,
        "height": 720,
        "preserved": true,
        "decode": {
          "sha256": "96bec21c388b48ec491b09b40e3b48601fae39df100e85faa6d8079889db5d95",
          "width": 1280,
          "height": 720,
          "frames": 1,
          "decoder": "Pillow 12.3.0",
          "reportHash": "cd899eaf3efd8c08abaaf1e851bd2d604dfe5f5be25dc61a49ce558da374105c"
        }
      },
      "source": {
        "pageUrl": "https://www.youtube.com/watch?v=nZa0Th64v00",
        "imageUrl": "https://img.youtube.com/vi/nZa0Th64v00/maxresdefault.jpg",
        "credit": "SW ENTERTAINMENT / YouTube publisher thumbnail",
        "artifactSha256": "16816428c930056f9646490640f95819b99c7192b7a78306bb572f3aac0dc1db",
        "description": "retained-reviewed-exact-video-tuple-and-thumbnail; fresh-watch-page-unavailable. Publisher thumbnail artwork, not verified video frame or person-participation evidence. Retained prior HTTP 200 + exact SHA/decode; no fresh watch-page or CDN byte check in this audit. Original native parent videoType remains 官方MV for both slots.",
        "bytesKind": "retained-package-bytes",
        "verifiedAt": "2026-10-20T10:58:58Z"
      },
      "version": "4edad668cefc613b21f09d20f56896c9cf955d2dbea0af46ec93d74d1ffa262e"
    },
    {
      "assetId": "udtt-woojung",
      "target": {
        "slug": "udtt",
        "groupId": "rec28ldfRTiDPs",
        "kind": "member",
        "entityKey": "recvxAPQCF66Sl",
        "memberId": "recvxAPQCF66Sl"
      },
      "original": {
        "sha256": "cbf9129dfd0073537c892e6ae1ba32851141303f414065b415f7caecce289f5c",
        "byteLength": 20090,
        "mime": "image/jpeg",
        "width": 200,
        "height": 200,
        "preserved": true,
        "decode": {
          "sha256": "cbf9129dfd0073537c892e6ae1ba32851141303f414065b415f7caecce289f5c",
          "width": 200,
          "height": 200,
          "frames": 1,
          "decoder": "Pillow 12.3.0",
          "reportHash": "cd899eaf3efd8c08abaaf1e851bd2d604dfe5f5be25dc61a49ce558da374105c"
        }
      },
      "source": {
        "pageUrl": "https://music.bugs.co.kr/artist/80414746",
        "imageUrl": "https://image.bugsm.co.kr/artist/images/200/804147/80414746.jpg?version=20260628002100",
        "credit": "Bugs · 平台成员头像",
        "artifactSha256": "16816428c930056f9646490640f95819b99c7192b7a78306bb572f3aac0dc1db",
        "description": "Retained existing deployed UDTT member slot bytes only. Same deployed member binding, path and SHA256 are preserved without selecting a new image or asserting publisher-named portrait identity. The historical Bugs image URL is retained; publisher-named identity evidence remains incomplete. No facial identification, new attribution assertion, new reuse rights or provider/account capacity claim.",
        "bytesKind": "retained-package-bytes",
        "verifiedAt": "2026-10-20T10:58:58Z"
      },
      "version": "9f853cdb04c5c7aebc96b2691c19c3f16f12c9bca705ff5122b9fe547104f8de"
    },
    {
      "assetId": "udtt-kwon-yejin",
      "target": {
        "slug": "udtt",
        "groupId": "rec28ldfRTiDPs",
        "kind": "member",
        "entityKey": "recvxAPQCF1lfe",
        "memberId": "recvxAPQCF1lfe"
      },
      "original": {
        "sha256": "63b26c338b52e00f599df134b76ababf49535c3a177c7e06323d8594f3fa9cae",
        "byteLength": 312851,
        "mime": "image/jpeg",
        "width": 700,
        "height": 1049,
        "preserved": true,
        "decode": {
          "sha256": "63b26c338b52e00f599df134b76ababf49535c3a177c7e06323d8594f3fa9cae",
          "width": 700,
          "height": 1049,
          "frames": 1,
          "decoder": "Pillow 12.3.0",
          "reportHash": "cd899eaf3efd8c08abaaf1e851bd2d604dfe5f5be25dc61a49ce558da374105c"
        }
      },
      "source": {
        "pageUrl": "https://v.daum.net/v/20250414132025075",
        "imageUrl": "https://t1.daumcdn.net/news/202504/14/SPORTSSEOUL/20250414132026370mzpm.jpg",
        "credit": "SW Entertainment / Sports Seoul 2025-04-14",
        "artifactSha256": "16816428c930056f9646490640f95819b99c7192b7a78306bb572f3aac0dc1db",
        "description": "named-caption-reconfirmed; prior-exact-byte-download-mapping. Caption/text attribution only. Current photo bytes not newly downloaded in this audit. No fresh roster/activity conclusion.",
        "bytesKind": "retained-package-bytes",
        "verifiedAt": "2026-10-20T10:58:58Z"
      },
      "version": "c6769c0b0cde77749efb1554b1c884110c42c422d7f2fedf176b0f4cece84444"
    }
  ],
  "active": [
    {
      "assetId": "udtt-hero",
      "version": "d8a7c1d19423b9e28e5609176ef2720decbbdf56154abc0908153c80d3822c5c"
    },
    {
      "assetId": "udtt-risako",
      "version": "d7ac96c7982de6bfce91c2d129d397b3b52024c5449089ec4d3073afd8ea1c76"
    },
    {
      "assetId": "udtt-han-chaehee",
      "version": "17a067bc1a07fbc00f1f9715a2268cb5eabb3f61ba4fac17c5a3fc3e3f2f84d1"
    },
    {
      "assetId": "udtt-gu-hanna",
      "version": "83822b36bfd8254027800757c51ae712f31a753df0da9cb2c915bbbda79eac05"
    },
    {
      "assetId": "udtt-really-really-mv",
      "version": "b91e27db5326776ff89f887d9e93fee150aefd93d47163cbfa7fe9e1fc70f55c"
    },
    {
      "assetId": "udtt-retry-cover",
      "version": "52b298b69a62ab2d5d9c84fa5d4d9f739a14b38967c1297aecc6c3fb1a40b084"
    },
    {
      "assetId": "udtt-school-rush-cover",
      "version": "2166aab25428fd49ad55b33e30844e5c81e76212f55deb089d2fc982675dc3fa"
    },
    {
      "assetId": "udtt-viper-cover",
      "version": "a78e0ea693c9db80bce1b02807fe18722b7c055364c468c78d0301b873d53adc"
    },
    {
      "assetId": "udtt-really-really-stage",
      "version": "4edad668cefc613b21f09d20f56896c9cf955d2dbea0af46ec93d74d1ffa262e"
    },
    {
      "assetId": "udtt-kwon-yejin",
      "version": "c6769c0b0cde77749efb1554b1c884110c42c422d7f2fedf176b0f4cece84444"
    }
  ]
};
