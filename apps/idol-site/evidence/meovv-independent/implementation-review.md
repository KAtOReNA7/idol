# MEOVV independent editorial implementation

## Scope
Baseline ae852924. Implemented in isolated branch design/meovv-independent. No production deployment, data write, upload, credential, permission, score, note, watch-state or binding changes.

The standalone MEOVV artist page now owns its full DOM and CSS. It does not use CandidateArtistExperience, CandidateComposition, or the hero/overview/member slots. Shared utilities remain limited to catalog reads, safe public routing, catalog identity/score calculations, image recovery, public portrait-credit projection, existing member facts, and the established read-only chronological timeline host.

Files with runtime changes:
- components/candidate/meovv-design.tsx
- app/artists/meovv/meovv-artist.css
- app/meovv-experience.css (existing work/member editing views: visual colors only)

All original route files, data, shared API/save logic, score/note/watch fields, and return/dirty guards remain unchanged.

## Visual target and genuine assets
Selected target: exec-d591adca-a387-45e7-b4a1-462045975c79.png, 1536 × 1024.
The generated target is art direction only. Its unsupported Chinese slogan, date, textures, and incorrectly matched member faces are not production content or assets.

Existing official group image: /artist/meovv/group-official.jpg, 1440 × 1717. It is displayed at its native aspect ratio with contain, retaining all five people and full bodies. This intentionally makes the opening taller than the generated horizontal collage. No AI-generated person, face crop, or invented texture is used. Two independently verified official release covers were added locally in the later 0fbae9f iteration; original images are unchanged.

Existing locally licensed Anton provides narrow red display type, Instrument Serif contrasts the work names, and DM Sans supports the small archive navigation. Cold white and steel gray backgrounds and fine dividers replace the prior black/lime appearance.

Desktop: independent group image, narrow side work index, tall red wordmark and introductory actions; five accurate portrait/name entries; asymmetrical release-art listening section; personal score summary; chronological timeline and sourced group introduction. Mobile: complete vertical group photograph and sequential directory, one-column works, compact individual member entries.

Featured works are selected only by exact IDs in authored MEOW/BODY/TOXIC order:
- rec28ldfRTrB45 — MEOW
- rec28ldfRTrJ7M — BODY
- rec28ldfRTrJ3E — TOXIC
Unrelated catalog order or a title collision cannot substitute a missing selected identity. The full work and release indexes retain every collected work.

## Safety and regression coverage
The 51-route image-host matrix still executes all four MEOVV route states. MEOVV did not leave the behavioral matrix. Its explicit synthetic host input was added to the alias manifest so the isolated renderer cannot accidentally load real data.

The image-migration AST proof now checks 15 real implementations, including independent MEOVV, with the same hero, portrait, MV-look, thumbnail and recovery-provider requirements. Existing 14 implementations keep their immutable source/fit/priority baseline comparisons.

The timeline AST proof now checks 36 shared candidates, one independent MEOVV, and 14 legacy pages. MEOVV requires actual reachable ArtistTimelineHost calls in both overview and updates rather than forcing obsolete slots.

Existing missing-look regressions retain their disabled/safe-image assertions with the new MEOVV selectors. Added independent rendering tests cover full structure, stable featured IDs and missing-ID behavior, five long bilingual names, foreign-member empty state, full works/releases, exact return URL context, preserved official image, public credit cleanup, no invented missing biography, and detail color contrast. Added eight actual-effect tests cover fetch/body deadlines, recovery, unmount, Strict replay, stale success and malformed responses.

## Verification commands
- NODE_PATH=$PWD/node_modules node --test $(find tests -name '*.test.cjs' | sort)
- node tests/personal-insights/run-tests.mjs
- node --test research/member-careers/guard.test.mjs
- node_modules/.bin/tsc --noEmit
- npm run build

Browser screenshots and interaction verification are independently collected in meovv-independent-browser-qa. Build/SSR success is not claimed as visual verification. Final visual QA status must be supplied after the independent browser review.

## Verified release-art refinement
Runtime freeze 0fbae9fa65793242fc97ddda57f712dcec6a5ef2 adds full 1000 × 1000 MEOW and TOXIC covers (provenance in release-art/sources.json). MEOW has one entry, TOXIC shares one cover with two original video entries; BODY is clearly identified as included on TOXIC. No cover is labelled as an MV screenshot. Exact original record ID and canonical video URL must both match before release art is used. All other entries retain the original video-thumbnail path. The frozen-catalog regression verifies that URL, score and all other data stay byte-for-byte unchanged.

Latest automated totals: 1847 recursive tests (baseline 1825 + 13 independent renderer + 8 real fetch-effect + 1 additional real image implementation), 31 personal-insights tests, 26 career guards. All passed; tsc and official build passed. Browser release-cover and CJK punctuation verification passed, and independent art review approved the final layout; see project-root design-qa.md for evidence and the external thumbnail limitation.
