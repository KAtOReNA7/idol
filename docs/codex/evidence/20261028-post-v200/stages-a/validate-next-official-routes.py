"""Verify the integrated eight-work research; --portable skips local raw checks."""
import argparse
import copy
import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
OUT = Path(__file__).resolve().parent


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


report_path = OUT / "next-official-routes.json"
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--portable", action="store_true", help="Skip four checks requiring ignored raw provider responses")
args = parser.parse_args()
report = read(report_path)
queue_path = ROOT / report["input"]["path"]
queue = read(queue_path)
prior_path = ROOT / report["previousFollowup"]["path"]
prior = read(prior_path)
inventory_path = ROOT / "apps/idol-site/data/stages/inventory.json"
inventory = {row["recordId"]: row for row in read(inventory_path)["works"]}
raw_path = ROOT / report["raw"]["path"]
raw = None if args.portable else read(raw_path)
raw_queries = {} if raw is None else {row["q"]["id"]: row for row in raw["queries"]}
queries = {row["id"]: row for row in report["queries"]}
by_work = {row["workId"]: (index, row) for index, row in enumerate(queue["records"])}
reconstructed = copy.deepcopy(queue)
integrated_rows = {row["workId"]: row for row in reconstructed["records"]}
integration_matches = True
reference = report_path.relative_to(ROOT).as_posix()
for index, record in enumerate(report["records"]):
    row = integrated_rows[record["workId"]]
    link = {"evidenceFile": reference, "jsonPointer": "/records/" + str(index)}
    expected_followup = {
        **link, "status": "pending_evidence", "finding": record["finding"],
        "result": record["result"], "queryIds": record["queryIds"],
        "sourceUrls": [source["url"] for source in record["sources"]],
        "nextCondition": record["nextCondition"],
        "eligibleForBinding": False, "bindingChanged": False,
    }
    integration_matches = integration_matches and row.pop("routeFollowup", None) == expected_followup
    integration_matches = integration_matches and row["researchHistory"][-1] == link
    row["researchHistory"].pop()
reconstructed_bytes = (json.dumps(reconstructed, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
reconstructed_sha = hashlib.sha256(reconstructed_bytes).hexdigest()


def raw_empty(query):
    blocks = query["result"].get("value", {}).get("content", [])
    return any("Empty search results" in block.get("text", "") for block in blocks)


work_ids = [row["workId"] for row in report["records"]]
query_ids = [qid for row in report["records"] for qid in row["queryIds"]]
prior_work_ids = {row["workId"] for row in prior["records"]}
checks = [
    ("historical_input_queue_reconstructs_without_unrelated_changes", reconstructed_sha == report["input"]["sha256"] == report["postIntegration"]["historicalInputSha256"]),
    ("previous_nine_work_report_hash_matches", sha(prior_path) == report["previousFollowup"]["sha256"]),
    ("raw_hash_matches", None if args.portable else sha(raw_path) == report["raw"]["sha256"]),
    ("queue_counts_109_and_11", len(queue["records"]) == 109 and len(queue["legacyReplacementsRemaining"]) == 11),
    ("eight_unique_new_gap_works", len(work_ids) == len(set(work_ids)) == 8 and all(wid in by_work for wid in work_ids)),
    ("disjoint_from_previous_nine_work_pass", len(prior_work_ids) == 9 and not set(work_ids).intersection(prior_work_ids)),
    ("all_work_ids_in_public_inventory", all(wid in inventory for wid in work_ids)),
    ("all_query_ids_resolve_to_correct_work", all(queries[qid]["workId"] == row["workId"] for row in report["records"] for qid in row["queryIds"])),
    ("all_twenty_queries_covered_once", len(queries) == len(query_ids) == len(set(query_ids)) == 20 and set(query_ids) == set(queries)),
    ("query_text_and_work_match_raw", None if args.portable else set(queries) == set(raw_queries) and all(all(queries[qid][key] == raw_queries[qid]["q"][key] for key in ("id", "workId", "q")) for qid in queries)),
    ("query_status_matches_raw", None if args.portable else all(queries[qid]["status"] == raw_queries[qid]["result"]["status"] == "fulfilled" for qid in queries)),
    ("six_empty_results_match_raw", None if args.portable else sum(q["emptySearchResults"] for q in queries.values()) == 6 and all(queries[qid]["emptySearchResults"] == raw_empty(raw_queries[qid]) for qid in queries)),
    ("original_mv_and_version_match_inventory", all(row["inventoryReference"]["originalMV"] == inventory[row["workId"]]["mv"] and row["inventoryReference"]["versionLabel"] == inventory[row["workId"]]["version"] for row in report["records"])),
    ("prior_reasons_and_input_pointers_match_queue", all(row["inputPointer"] == "/records/" + str(by_work[row["workId"]][0]) and all(value == by_work[row["workId"]][1].get(key) for key, value in row["priorReason"].items()) for row in report["records"])),
    ("historic_candidate_ids_have_valid_shape_and_not_requested", all(re.fullmatch(r"[A-Za-z0-9_-]{11}", row["priorCandidate"]["videoId"]) and row["priorCandidate"]["reRequested"] is False for row in report["records"] if "priorCandidate" in row)),
    ("zero_eligible_and_adopted", report["counts"]["eligibleNewCandidates"] == report["counts"]["adopted"] == 0 and all(not row["eligibleForBinding"] and not row["adopted"] for row in report["records"])),
    ("all_records_have_scope_and_next_condition", all(all(row.get(key) for key in ("version", "occasion", "completeRange", "performerScope", "result", "nextCondition", "priorReason")) for row in report["records"])),
    ("post_integration_queue_hash_matches", sha(queue_path) == report["postIntegration"]["sha256"]),
    ("eight_followup_objects_and_append_only_history_match", integration_matches),
    ("public_inventory_hash_matches", sha(inventory_path) == report["inventorySha256"]),
]
validation = {
    "checkedAt": datetime.now(timezone.utc).isoformat(),
    "mode": "portable" if args.portable else "full_with_local_raw",
    "checks": [{"name": name, "passed": passed, "status": "skipped_local_raw_unavailable" if passed is None else "passed" if passed else "failed"} for name, passed in checks],
    "passed": sum(bool(passed) for _, passed in checks),
    "failed": sum(passed is False for _, passed in checks),
    "skipped": sum(passed is None for _, passed in checks),
    "outputs": {path.relative_to(ROOT).as_posix(): sha(path) for path in (report_path, queue_path)},
    "historicalInputSha256": report["input"]["sha256"],
    "reconstructedHistoricalInputSha256": reconstructed_sha,
    "scopeAttestation": "This eight-work research pass did not access owner exports or user Chrome, directly request YouTube, modify application/bindings/private data, or perform Git/deploy actions. These are declared action boundaries, not a repository preservation test. Raw provider responses remain local; public evidence records summaries, URLs, and hashes.",
    "reproducibilityLimit": "The original 17 research checks plus 3 integration checks run in full mode. Four raw-hash/provider-result checks require the ignored .codex-local response cache and are explicitly skipped with --portable (16 pass, 4 skipped); the historical input SHA is preserved and independently reconstructed from the integrated queue without that cache. Raw responses are not published to GitHub.",
}
write(OUT / ("next-official-routes-portable-validation.json" if args.portable else "next-official-routes-validation.json"), validation)
print(json.dumps({"records": len(work_ids), "queries": len(queries), "eligible": 0, "passed": validation["passed"], "failed": validation["failed"], "skipped": validation["skipped"], "outputs": validation["outputs"]}, ensure_ascii=False))
assert validation["failed"] == 0
