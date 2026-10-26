# Historical roster display correction

The three archive pages previously appeared empty because the application read only the current-group field. The production export captured 2026-10-16 01:03:32 UTC already contains the original former-group links (fldf1alCIu). This patch reads them separately; no source-data repair or new member creation is needed.

- IZ*ONE: 12 original member identities, including five with existing current affiliations to IVE, LE SSERAFIM and SAY MY NAME.
- Cherry Bullet: 10 historical identities across different eras. The seven-person 2023 Cherry Dash image is not the full historical roster.
- PURPLE KISS: 7 historical identities including Park Ji Eun. The Victor image depicts a six-person era.

Only these three group IDs opt into historical roster display. Current groupIds and Group.memberIds retain their previous meaning. Other group lists, including NMIXX and LE SSERAFIM, are unchanged. The artist API retains all original personal rating/work relations; history is not used to guess who appears in an MV. Members on an archival page receive a page-relative historical label rather than borrowing their current global active status.

No database, export, rating, note, watch state, relation, access or credential changes are part of this patch. Original images are retained unmodified, with hashes and source pages in historical-group-images-20261016.json. WebP derivatives use sharp rotation metadata, width at most 1200 without enlargement, quality 88, effort 5, without cropping. IZ*ONE source width is only 600 pixels; this is not a high-resolution replacement.

Validation: five new regression tests cover historical counts, original current affiliations, Chinese names, stable-ID deduplication, same-name rejection, personal cross-group rating preservation, old-group counts and image hashes. Independent reviewer also ran these against the latest production export. Full tests/build and actual browser results are recorded separately; static fixtures do not prove production navigation or mobile device behavior.
