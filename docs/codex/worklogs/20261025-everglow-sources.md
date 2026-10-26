# EVERGLOW official research — 2026-10-25

Research only; no repository files were changed. Browser plugin not available. Used an independent headless Chrome process, not the parent/user browser session.

## Actual official visual references

- https://www.chxxta.com/everglow — accessible company artist page. Captured full-page screenshot `chxxta.png`, live DOM `chxxta.html`, images/links/text `chxxta.json`, computed typefaces and loaded font URLs `chxxta-styles.json`, all inline CSS `official-inline.css`.
- https://everglow.bstage.in/ — accessible official community, linked by the official YouTube channel. Captured `bstage.png` and a clean first viewport `bstage-clean.png`; live DOM and metadata in `bstage.html` / `bstage.json`. Cookie banner was accepted only in the isolated anonymous browser. No login or paid content was accessed.
- Company page: pure black ground, white narrow lettering, purple geometric EVERGLOW wordmark, rectangular four-person photograph, thin white/gray rules, compact left-aligned discography and video rows. The right side carries substantial negative space. The purple original logo's dominant opaque color is **#6652a3**.
- b.stage: dark charcoal community layout with full-width landscape four-person photo, white wordmark, restrained white navigation and purple accents. The hero source is 5464 × 2383 and can be shown whole without losing people.
- Main source is the company artist page; b.stage provides the complementary official landscape asset. Project search, archive, timeline and notebook pages are extensions of this language, not official pages or a pixel-perfect official-site reproduction.

## Ready-to-use original assets

`official-assets.json` is the source manifest. Each entry has `file`, `url`, `bytes`, `sha256`, `contentType`, and image `width`, `height`, `format` where applicable. These are original endpoint response bytes; no resizing, recompression, portrait cropping or recoloring was performed.

| File | Dimensions / use |
| --- | --- |
| `everglow-logo.png` | 2516 × 371, purple official wordmark |
| `chxxta-everglow-group.png` | 666 × 821, company artist page's four-person portrait-format group photo |
| `bstage-1.jpg` | 5464 × 2383, official community's four-person landscape hero |
| `bstage-0.png` | 4056 × 483, official community wordmark variant |
| `bstage-2.png` | 3735 × 617, official community wordmark variant |
| `official-code-cover.jpg` | 3000 × 3000, company site's CODE cover |
| `chxxta-logo.png` | 3188 × 3200 source canvas, company wordmark; source canvas has padding |

Three actual loaded custom fonts were saved from the company page:

- `official-hgg-gothic-80.woff2`: `orig_hgggothicssip_80_ga`, navigation and headings; observed navigation 16 px, section headings 23 px.
- `official-hgg-gothic-60.woff2`: `orig_hgggothicssip_60_ga`, introductory body, observed 16 px.
- `official-hgg-gothic-40.woff2`: `orig_hgggothicssip_40_ga`, small discography metadata, observed 13 px.

The fonts' exact URLs, byte counts and hashes are in `official-assets.json`. Do not replace the source names with an unverified commercial font family name.

## Roster evidence and bounds

- The currently served company page describes the group as four members. The currently served Bugs artist biography names **E:U, SIHYEON, ONDA, AISHA**. Raw evidence: `bugs-artist.html` and `bugs-artist.txt`; source https://music.bugs.co.kr/artist/20076399 .
- Official channel https://www.youtube.com/@everglow_offcl links the b.stage site and uses those four member tags in current CODE material. The company site directly links that channel and official social accounts.
- This supports presenting the four-person current official roster. It does not independently establish every member's current contractual terms, future activity or the reason for former-member changes.
- The six existing name-bound Weverse portraits may remain **historical portraits**, with MIA and YIREN as historical group records. No person was identified by face or position in a group photograph. No new current individual portraits are supplied.
- Actual shooting dates for the group images are not supplied by these pages. Describe as current-site/CODE-era official materials without inventing a shooting date.
- Bugs biography says debut March 21, 2019, while its first album release page records March 18, 2019. Preserve the exact release date as March 18; do not use this discrepancy to silently overwrite existing debut/event data.

## Release dataset

`releases.json` is the final normalized dataset: **16 release records, 95 total track rows, 42 EVERGLOW-credited track rows**. Counts include repeat recordings across releases, instrumental versions and collaborations; 42 is not a count of unique songs.

Observed artist release list has 14 records and participation list adds 2 records. The compilation tab is disabled; there is no independently confirmed compilation-list page. Some records on the release/participation lists are themselves mixed-artist compilations.

Schema:

```text
id, url, title, listType, date, type, artist, artists,
info, tracks, groupTracks, sourceOgImage, coverFile, coverSha256, note

track: id, number, title, artists:[{id,name}], artist,
       titleTrack, url
```

Use `groupTracks`, not the full `tracks` array, to display this group's tracks inside mixed-artist releases. Artist attribution includes the page's hidden multi-artist controls, rather than only the first visible name.

- `20528390` Ghost Light: TheFatRat and EVERGLOW jointly credited, one track.
- `20442295` BETTER TOGETHER: multi-artist charity/collaboration single with EVERGLOW explicitly among the credits, one track.
- `4018183` The Spies Who Loved Me OST: 26 total rows, only one EVERGLOW row (`Let Me Dance`).
- `20442292` New Beginnings Day 2 Live: 31 total rows, only three EVERGLOW rows.
- Latest: `4141746` CODE, 2026-03-03, four tracks: BREAKOUT, FOCUS, CODE, Can't Be Broken.

All 16 release detail HTML files are saved as `album-{id}.html`. All 16 covers were fetched from the exact `og:image` URLs returned by those pages, with no invented larger-size URL. Original bytes: `bugs-cover-{id}.jpg`. `bugs-covers.json` contains source page, URL, dimensions, byte count and SHA256 for all 16, all successful.

The existing scoring IDs and work associations should remain unchanged. This research does not create or infer scoring-work IDs.
