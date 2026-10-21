# WOOAH + Billlie immutable source handoff

Use every source-part-XX.json, source-manifest.json and restore-source.py from the SAME fixed commit. Each shard is a complete UTF-8 JSON document under 400 KB. A long unchanged source file can span numbered content fragments; the restorer joins them before verifying original whole-file SHA256. No Library download or xattrs are involved.

Windows: python restore-source.py --destination wb-source-new
Then: python restore-source.py --destination wb-source-new --verify
Use a NEW directory. No overwrites, path traversal or symlink targets are allowed. Do not run Python with -O (assertions are integrity checks). No packages are required.

Entries: groups/wooah/index.js and groups/billlie/index.js. Original static host: app.js, index.html, registry.js, shared/*.js, shared/host.css, serve.py. Registry is preserved exactly and lists 15 groups; only routes #/wooah and #/billlie have modules in this subset. Other group routes are intentionally NOT supplied. This is NOT the production framework or the deployed 11-group tree. package.json historical aggregate test scripts refer to tests not included; the preserved groups/billlie/reconciliation.test.mjs is ALSO a cross-group historical suite requiring KATSEYE/VCHA and inputs/reconciliation, deliberately outside this two-group handoff. It cannot run standalone here; do not report that suite passed. Both group module imports and actual per-route static rendering are checked separately.

Preserve reconciled views and public-content/reconciliation data; do not fall back to stale raw data projections. Candidate release IDs, partial video relationships and uncertain dates must remain explicit. Never fill all members as default video cast. There are no personal ratings, watch status or user notes to import.

Images are NOT in this text handoff. HANDOFF-ORIGIN.json records all 63 physical originals and their exact SHA256/size; per-group asset-map.json records source/identity metadata. Source archive: libfile_e41db3f2f23c8191ae3a8e729358e63a v1, 152106677 bytes, SHA256 6448e9f5b572807f706974206de80aec1b45f8ce085c181d9720a9d8b2e7f43d. Billlie original image package libfile_3a3ce7a6d8f8819189f504bcb11ff2b3. Root supplies image bindings separately. Do not call this visually ready until exact originals are accessible in the consuming browser.

Billlie already has independent native Figma design, file zeLNExz4TbpWRW3uiahef7 page 596:1167. Inspect groups/billlie/design-reference.json and existing frames FIRST; audit and complete rather than blindly redesign. WOOAH has reference-index.json documenting a distinct black fashion/editorial/magenta direction, with rendered-reference limitations. Historical HANDOFF claims are not current browser acceptance.

No deployment, no GitHub main implementation overwrite, no credentials, no image re-encoding. All archive text files retained byte-for-byte; HANDOFF-ORIGIN.json is added metadata only.
