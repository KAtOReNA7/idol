# Cherry Bullet / Weeekly: immutable source recovery

This is a pure UTF-8 GitHub source handoff, not a Library transfer, deployable full website, or complete visual baseline. It contains 92 files / 2,285,869 source bytes, including both full group directories, CSS, React entries, tests, 22 unchanged real host dependencies, six adopted public relation-evidence text files, image identities, and both repaired hosts. No original image binaries, credentials, private user records, node_modules or dist are included.

Requirements: read repository AGENTS.md, docs/design-requirements.md (fixed requirement commit e9dfacf3f38b20ec204d983bd8fc3edf696ada0c), and docs/collaboration-playbook.md. Do not overwrite the existing application or frozen 11-group tree. Restore into a NEW directory only.

## Windows: recover and verify

Obtain these three files from the same immutable GitHub commit, through the authorized connector or normal Git checkout/download. Do not substitute a moving main branch. With Git, use `git -c core.autocrlf=false ...` to preserve exact UTF-8 bytes. Do not repair/change the platform Library helper or skip its metadata checks; this route reads GitHub source instead.

Run from this directory:

    py -3 restore-source.py --destination C:\work\sol-cw-recovered
    py -3 restore-source.py --destination C:\work\sol-cw-recovered --verify
    Get-FileHash .\source-bundle.json -Algorithm SHA256

On Linux/macOS use python3 and an absolute new destination. The ordinary Python standard-library restorer verifies all paths, bytes and SHA256 values before writing, rejects traversal, Windows device names, symlinks and existing destinations; --verify is read-only. It never uses os.setxattr, the network, or a Library ID as a download URL.

Expected source-bundle.json: 2,487,914 B; SHA256 dc4d58e1ea4a94311c09ef7dad07e8b6bef1fcac7bf52269fd807e8761474f90.

## Version and exact preserved change

Parent Library v1: libfile_8f1842fafea08191ba9cf935877751bd, SHA256 9d6422ca96c1b0478a1b7177bbbe3a63d209477d9d6285d03835ec5b9a0e445c.
Delta Library v0: libfile_6b019478d30c819182276eb6580ae701, 838580 B, SHA256 0e43aad9044929ce5d4e8f703f51ddebd839a3b1cd77f3105d6d5580649255a2. Producer materialized it through the official Library flow and applied verified xattrs; Windows Library failure is not claimed fixed.

HOST-DELTA.json records verified before/after SHAs. Only cherrybullet-host.mjs and weeekly-host.mjs changed from v1: keyboard original-image retry focus restoration and accurate release return label. CSS/design/data/15 exact public member-video appearances and We Can cover identity remain unchanged. Both host after SHAs:
- Cherry: 054452422dc01a7413cbf85adcb9a43099dbea14865bb7c2c4f50b2b05075079
- Weeekly: edfed85a3da75fffdb94a91c2e107bd9283f0440bbccb530a1ebd91264d00014

Dependencies are exact read-only copies from the verified production source baseline 3ca624cfb15055d7e4f2fa088fe32edbeb75bbe8; see DEPENDENCIES.json. These navigation helpers are not the sandbox main app and must not overwrite any drifted production helper. Static local imports are complete. External React/framework dependencies are NOT included or installed. Existing host uses React 19.2.6 / Next 16.3.4; node tests use Node 24 registerHooks. No new generic host was built.

## Entry points and local source checks

Source root: restored/source. Routes: /design-review/sol15/cherry-bullet and /design-review/sol15/weeekly. React components: components/design-review/{cherrybullet,weeekly}-review.tsx. Runtime: lib/idol/design-review/cw-runtime. CSS: public/design-review/sol15/{cherry-bullet,weeekly}.

In source/, Node 24 can run source-only suites:

    node --import ./tests/helpers/cw-main-loader.mjs --test tests/cw-failure-state.test.mjs

For relation-evidence tests, set CW_EVIDENCE_ROOT to the absolute restored/evidence directory and run tests/cw-v1-design-relations.test.mjs with the same loader. All 48 selected tests (cw-main-review, cw-failure-state, cw-v1-design-relations) passed on the restored candidate with the producer's independently verified 67 actual images. The full cw-main-review suite REQUIRES SOL15_RESOURCE_ROOT (66 originals) and CW_NEW_RESOURCE_ROOT (new We Can image); absence must fail, not be hidden with placeholders. Recipient tests/images/browser are not yet verified.

## Missing image / host / design prerequisites

IMAGE-IDENTITIES.json has 67 exact asset identities: Cherry 32, Weeekly 35. The prior 66 original assets come from Sol ALL15 Library libfile_e41db3f2f23c8191ae3a8e729358e63a v1 (archive SHA 6448e9f5b572807f706974206de80aec1b45f8ce085c181d9720a9d8b2e7f43d). The new We Can image is in the parent v1 package at new-assets/groups/weeekly/assets/release-we-can-apple-1534999771.jpg, JPEG 632x632, 112964 B, SHA256 5a93b408b7d319460d355444d2576cec825cc640125d00715cff5bdfc096748c. Library access remains subject to the supported consumer-local workflow; this source recovery does not magically supply those bytes.

Read HOST-INTEGRATION.md: default resolveImage/catalog null is NOT a finished image host. Exact same-origin /_sol15-originals/<slug>/<sha>/<filename> is an isolated test contract, not a production API. Actual approved image service + full framework host and exact native catalog identities remain required for visual/native integration. Do not fabricate native ratings or assume current full roster performs every video. Six missing stage preview images and historical source-publication gaps remain. Figma plugin null/timeout is separate and unresolved. No design acceptance or deployment follows from this recovery.
