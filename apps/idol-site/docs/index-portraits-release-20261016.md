# Group index and portrait integration

Base: a95d00573c55f15ae99ebb22984c221dfcc03f08 (published v86).

- Keep the original 14 index-card branches. Add 37 candidate cards using their detail-page palette and editorial title, with five layout variants.
- MEOVV/i-dle use existing verified full-group assets without cropping. Other entries show explicitly labelled member-photo selections, never a false group photograph.
- Details prefer the exact member-ID + stage-name bound official portrait; otherwise use that same member's existing members-table photo, labelled archive imagery, with no claim about shoot date or official origin.
- QWER 4 and UNIS 8 portraits use current official text-to-image bindings. Originals remain unchanged. Display-only derivatives preserve aspect ratio, use EXIF orientation and width <=1000, WebP quality86; no crop, face modification or generative content.
- Original bytes total 6,913,297; display bytes 701,950. These are file sizes, not measured network timings.
- No snapshot, backup, score, journal, watched state, API mutation, permissions or runtime credential changes.

## Validation

- New identity/asset/index tests: 9 passed, including real snapshot member-ID/stage-name/group-ID matching and original/display SHA256 checks.
- Full serial suite: 906 passed. TypeScript and official production build passed.
- One parallel run initially hit the existing unchanged photo-import-flow test's short async crypto wait. Isolated suite 6/6 and full serial 906/906 then passed; no assertion was removed or weakened.
- The older group SSR harness was extended to load the new real component; existing assertions were retained.
- Following full checks, narrow mobile noir-title and empty-cover wordmark CSS adjustments fixed visually observed trailing-letter wraps. Targeted 21 tests and production rebuild repeated; actual cloud-browser 320px recheck confirmed both BADVILLAIN labels fit on one line.
- Static cloud-browser QA uses the real production CSS closure with 320/390 same-origin iframe viewports, not a mobile device emulator or full JavaScript interaction test. Live post-publication data export and navigation checks remain required.

- Final compiled stylesheet used in visual recheck: page.BVUP2ol3.css with global index.mWmOoc2H.css. Desktop and 320/390 views of all four verified-image groups passed sampled visual inspection; all37 card DOM widths stayed within their iframe viewport. No production state was changed by this static check.

- Final frozen validation after both mobile CSS fixes: 907/907 full serial tests and TypeScript passed; last production build passed.
