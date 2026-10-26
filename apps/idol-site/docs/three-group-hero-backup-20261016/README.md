# Three group hero recovery

Baseline: `1804f12`. This directory preserves the original bytes of the three artist content files, candidate index, shared image-caption component, and changed existing test. `manifest.json` contains SHA-256 values for every preserved file.

The new photos use new versioned asset paths and do not overwrite any old image. All six original/display files are recorded in `../three-group-hero-assets-20261016.json`; the TRACER original is the full 25,354,489-byte JPEG, not its smaller display derivative. No member, work, rating, note, watched state, relationship, or timeline data was changed.

To recover, first verify the saved file hashes, then compare current files with this change. Restore only this change's hero fields, two photo-gap descriptions, image-caption link and tests. The previous hero images were null. Keep unrelated later edits and avoid resetting the whole tree. Restore matching index and detail hero objects together. Retain the new images for reversible recovery rather than deleting storage objects. A clean inverse of the dedicated implementation commit is preferable when it has no overlapping later changes.

Runtime publication must keep the existing private-site access boundary. This local change does not grant access, create credentials, or publish files by itself.
