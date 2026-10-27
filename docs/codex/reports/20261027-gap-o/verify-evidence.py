"""Verify named whole-photo reproductions against untouched official originals.

This compares complete image pixels, not faces. Naming still comes from the
saved third-party post and is intentionally not described as an official name.
Run with Pillow installed; no network or credentials required.
"""
from pathlib import Path
import hashlib
import json
from PIL import Image, ImageChops, ImageStat

here = Path(__file__).resolve().parent
root = here.parents[3]
read = lambda p: json.loads(p.read_text(encoding="utf-8"))
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
rows = read(here / "illit-reviewed-delta.json")["identityImages"]
results = []
for row, prefix in zip(rows, ["tick", "jelly"], strict=True):
    original = root / "apps/idol-site/public" / row["src"].lstrip("/")
    official_file = here / "evidence" / f"{prefix}-official-post.json"
    named_file = here / "evidence" / f"{prefix}-named-repost.json"
    secondary = here / "evidence" / f"{prefix}-named-repost-photo.jpg"
    official, named = read(official_file), read(named_file)
    proof = row["namedRepostEvidence"]
    match = proof["wholeImageMatch"]
    assert sha(original) == row["sha256"] == match["officialOriginalSha256"]
    assert sha(official_file) == row["sourceSnapshotSha256"]
    assert sha(named_file) == proof["sourceSnapshotSha256"]
    assert sha(secondary) == match["namedRepostSha256"]
    assert proof["officialAccount"] is False
    assert row["sourceMemberName"] in named["text"]
    assert row["song"].lower() in named["text"].lower()
    assert named["text"] == proof["sourceText"]
    assert named["photos"][match["namedRepostPhotoIndex"]]["url"] == proof["sourceImageUrl"]
    photo = official["extension"]["image"]["photos"][match["officialPhotoIndex"]]
    assert photo["url"] == row["sourceImageUrl"] and photo["photoId"] == match["officialPhotoId"]
    assert "MV Shoot" in official["title"] and photo["downloadable"] is True
    a, b = Image.open(original).convert("RGB"), Image.open(secondary).convert("RGB")
    assert a.size == b.size == (row["width"], row["height"])
    stat = ImageStat.Stat(ImageChops.difference(a, b))
    mae, rms = sum(stat.mean) / 3, sum(stat.rms) / 3
    assert abs(mae - match["meanAbsoluteError255"]) < 1e-9
    assert abs(rms - match["rootMeanSquareError255"]) < 1e-9
    # Human-reviewed same-photo pairs have only small JPEG reproduction changes.
    # This gate alone must never be used to assign an unlabelled person a name.
    assert mae < 5 and rms < 6
    assert row["faceIdentityInferred"] is False and match["faceRecognitionUsed"] is False
    c = row["sourceCrop"]
    assert c["width"] * 4 == c["height"] * 3 and c["width"] >= 540
    assert c["x"] + c["width"] <= a.width and c["y"] + c["height"] <= a.height
    results.append({"member": row["sourceMemberName"], "song": row["song"], "originalSha256": sha(original), "meanAbsoluteError255": mae, "rootMeanSquareError255": rms})
print(json.dumps({"status": "passed", "wholeImagePairs": results}, ensure_ascii=False))
