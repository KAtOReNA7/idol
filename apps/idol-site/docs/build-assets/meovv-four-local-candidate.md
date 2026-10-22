# MEOVV four-image immutable build-copy pilot: A (local only)

Baseline: 5857bc86212615af58203b15317d5cd471ef1324, site v185/public.
This candidate has not been uploaded, published, deployed or credentialed.

A adds exactly four public GET identities and an independent owner-only UI/API.
All current consumers and every public/Git original remain unchanged. Public GET
returns only byte-identical originals already public, not arbitrary bucket keys.
The owner is checked both by existing fixed site-owner authentication and durable
storage-control owner_id, with another fresh owner check just before PUT.

The only write is existing env.BUCKET.put with atomic create-only
onlyIf(etagDoesNotMatch:'*'). There is no overwrite, delete, bucket listing,
remote URL fetching, D1 write/new table, editorial/native image change, record
change, permission or sharing change. Existing registry 13/11/10 and backup
2 MiB / codec 3 MiB contracts are untouched.

Each request accepts exactly id + version (SHA). Any other/duplicate query,
wrong route/method/origin/content type/content length is rejected. Upload body
and readback are checked for exact bytes, MIME, SHA, JPEG header and geometry.
Offline full pixel decoding is separate and is covered by the four-file backup
rehearsal. Public responses use no-store, nosniff, CORP same-origin. No cache
policy elsewhere changes.

Resource policy: four concurrent operations; up to six unresolved R2 GET/owner
checks and two unresolved PUTs per isolate. Timed-out upstream calls keep their
slots until settlement. Each IO/body stage has a 10 s deadline. Body buffers are
preallocated at the exact admitted size; empty chunks and >8192 chunks reject.
UI deadlines allow complete multi-stage work (status 45 s, GET 30 s, PUT 100 s).

State meanings:
- missing: this bounded read observed no object; not proof that a previous
  uncertain request never executed.
- verified: exact existing or newly created bytes passed readback. Uploading
  the same bytes again through the API is idempotent and never overwrites.
- conflict: stored bytes or metadata differ; stop, never overwrite.
- unknown: a read/write failed, timed out, or is still pending; only read back,
  never automatically retry a PUT.

The UI requires file verification then an explicit read-only missing result
before its upload button enables. It uses a Web Lock plus localStorage attempt
fence before PUT, disabling further attempts after any outcome. This survives
reloads and coordinates same-profile tabs, but is NOT a cross-browser/global
server lock. Per-isolate pending-write records are likewise not global/durable.
Across isolates/browsers atomic R2 create-only protects bytes; it cannot prove
that no duplicate attempt occurred. No such global guarantee is claimed.

Recovery source: Git/public originals and the independent four-file SHA/geometry
backup, NOT the old editorial/native backup. No restoration into real storage
has been attempted. Unknown/conflicting storage is not repaired by overwrite.

Before any publication: independent code review; existing exact compiled build
carrier guard refresh review (not a loosened consumer rule); full real build and
unchanged 194-item prune checks; official archive gzip-expanded tar measurement
with >=2 MiB headroom and <=256 KiB growth budget for A. Local source size is NOT
an expanded-tar measurement. Official helper remains the parent operator's task.

After separately authorized A publication: use normal owner browser UI, not
injected fetch/cookies; upload the named files and collect real readback evidence.
Verify independent anonymous public GET plus owner GET, actual R2 conditional
semantics, failure/recovery, member detail/lightbox open-close-back behavior and
latency. Current independent anonymous Cloudflare 1010 refusal remains unresolved;
no header/cookie/bypass workaround is authorized. B must remain disabled until
these checks pass. No R2 free capacity or billing guarantee is established.
