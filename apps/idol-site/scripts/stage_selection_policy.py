"""New formal adoptions only. Historical bindings stay in their original scope."""
from urllib.parse import urlsplit
import hashlib
import json
import re
from stage_source_identity import SOURCE_CLASSES, checked_identity, checked_likes, comparison_group, source_key

REJECTED = {'l9GLV8Kd-MU', 'saY9KS7mKvI', 'BnmwjH-suLg'}
PRIORITY = {'music_program': 0, 'practice_room': 1, 'produced_performance': 2}
# These are structured classifications, never words found in a program title.
EXCLUDED_TYPES = {
    'concert', 'concert_stage', 'press_concert_recording', 'official_concert_full_event',
    'tour', 'tour_stage', 'festival', 'festival_stage', 'showcase', 'showcase_stage',
    'official_showcase_full_event', 'fan_event', 'other_event',
}

def checked_member_fallback(source):
    fallback = source.get('memberVersionFallback')
    if fallback is None:
        return None
    assert isinstance(fallback, dict) and source.get('versionMatch') not in (True, 'exact'), 'Member fallback must not claim exact original version'
    for key in ('sameSong', 'sameLanguage', 'fullGroup', 'sameArrangementExceptGuest'):
        assert fallback.get(key) is True, 'Member fallback needs full same-song, same-language group performance; only guest scope may differ'
    for field in ('performerScope', 'originalPerformerScope'):
        assert source.get(field) in (None, 'full_group'), 'Member fallback conflicts with explicit performer scope'
    assert fallback.get('differenceType') == 'guest_scope', 'Only documented guest-scope fallback is permitted'
    assert isinstance(fallback.get('groupId'), str) and fallback['groupId'], 'Member fallback target group missing'
    assert isinstance(fallback.get('guestDifference'), str) and fallback['guestDifference'].strip(), 'Member fallback difference missing'
    proof = fallback.get('evidence') or {}
    assert isinstance(proof, dict), 'Member fallback evidence must be an object'
    assert isinstance(proof.get('note'), str) and proof['note'].strip() and isinstance(proof.get('urls'), list) and proof['urls'], 'Member fallback evidence missing'
    for url in proof['urls']:
        assert isinstance(url, str), 'Invalid member fallback evidence URL'
        parsed = urlsplit(url)
        assert parsed.scheme == 'https' and parsed.hostname and not parsed.username and not parsed.password, 'Invalid member fallback evidence URL'
    return fallback

def checked_same_song_fallback(source):
    """Explicit new-slot exception; never claims the original full version."""
    fallback = source.get('sameSongFallback')
    if fallback is None:
        return None
    assert isinstance(fallback, dict) and source.get('versionMatch') not in (True, 'exact'), 'Same-song fallback must not claim an exact original version'
    assert fallback.get('sameSong') is True, 'Fallback requires established same-song identity'
    for field in ('targetWorkId', 'groupId', 'targetSong', 'performedSong', 'reason'):
        assert isinstance(fallback.get(field), str) and fallback[field].strip(), 'Same-song fallback target and actual song evidence missing'
    assert all(re.fullmatch(r'rec[A-Za-z0-9]+', fallback[field]) for field in ('targetWorkId', 'groupId')), 'Fallback stable work/group identity invalid'
    if fallback.get('sourceWorkId') is not None:
        assert isinstance(fallback['sourceWorkId'], str) and re.fullmatch(r'rec[A-Za-z0-9]+', fallback['sourceWorkId']) and fallback['sourceWorkId'] != fallback['targetWorkId'], 'Fallback source work identity invalid'
    assert fallback.get('completeness') in ('full', 'excerpt') and fallback['completeness'] == source.get('completeness'), 'Fallback completeness must match the actual source'
    assert fallback.get('version') in ('exact', 'different'), 'Fallback actual version must be known'
    assert fallback['completeness'] == 'excerpt' or fallback['version'] == 'different', 'Full corresponding version is not a fallback'
    scopes = ('full_group', 'subunit', 'solo')
    assert fallback.get('performerScope') in scopes and fallback.get('originalPerformerScope') == fallback['performerScope'], 'Same-song fallback does not relax the original performer scope'
    assert source.get('performerScope', fallback['performerScope']) == fallback['performerScope'] and source.get('originalPerformerScope', fallback['originalPerformerScope']) == fallback['originalPerformerScope'], 'Fallback performer scope differs from source evidence'
    differences = fallback.get('differences')
    assert isinstance(differences, list) and 1 <= len(differences) <= 8 and all(isinstance(v, str) and v.strip() and len(v) <= 300 for v in differences), 'Visible fallback differences required'
    proof = fallback.get('evidence') or {}
    assert isinstance(proof, dict) and isinstance(proof.get('note'), str) and proof['note'].strip() and isinstance(proof.get('urls'), list) and proof['urls'], 'Same-song/actual-version evidence required'
    for url in proof['urls']:
        assert isinstance(url, str), 'Invalid fallback evidence URL'
        parsed = urlsplit(url)
        assert parsed.scheme == 'https' and parsed.hostname and not parsed.username and not parsed.password, 'Invalid fallback evidence URL'
    return fallback

def version_eligible(source):
    try:
        fallback = checked_member_fallback(source)
        same_song = checked_same_song_fallback(source)
    except (AssertionError, TypeError, ValueError):
        return False
    return bool(fallback or same_song) or source.get('versionMatch') is True or source.get('versionMatch') == 'exact'

def checked_selection(source):
    assert source.get('videoId') not in REJECTED, 'User-rejected exact source'
    selection = source.get('selection') or {}
    assert isinstance(selection, dict) and selection.get('occasion') in PRIORITY, 'New formal sources need documented music-program, practice-room or official produced-performance context'
    for field in ('type', 'kind', 'performanceType'):
        classification = source.get(field)
        assert classification not in EXCLUDED_TYPES, 'Structured performance type conflicts with new-adoption occasion'
        assert classification != 'practice_room' or selection['occasion'] == 'practice_room', 'Structured practice type conflicts with occasion'
        assert classification != 'music_program' or selection['occasion'] == 'music_program', 'Structured program type conflicts with occasion'
        assert classification not in ('produced_dance_performance', 'staged_dance_performance', 'official_performance_film') or selection['occasion'] == 'produced_performance', 'Structured produced-performance type conflicts with occasion'
    evidence = selection.get('evidence') or {}
    assert isinstance(evidence, dict) and isinstance(evidence.get('note'), str) and evidence['note'].strip(), 'Occasion evidence note missing'
    urls = evidence.get('urls')
    assert isinstance(urls, list) and urls, 'Occasion evidence URLs missing'
    for url in urls:
        assert isinstance(url, str), 'Invalid occasion evidence URL'
        parsed = urlsplit(url)
        assert parsed.scheme == 'https' and parsed.hostname and not parsed.username and not parsed.password, 'Invalid occasion evidence URL'
    camera = selection.get('camera')
    if camera is not None:
        assert isinstance(camera, dict) and camera.get('mode') in ('fixed', 'moving', 'mixed'), 'Invalid camera classification'
        proof = camera.get('evidence') or {}
        assert isinstance(proof, dict) and isinstance(proof.get('note'), str) and proof['note'].strip(), 'Camera evidence note missing'
        assert isinstance(proof.get('urls'), list) and proof['urls'], 'Camera evidence URLs missing'
        for url in proof['urls']:
            parsed = urlsplit(url)
            assert parsed.scheme == 'https' and parsed.hostname and not parsed.username and not parsed.password, 'Invalid camera evidence URL'
    same_song = checked_same_song_fallback(source)
    assert source.get('sourceClass') in SOURCE_CLASSES and (source.get('completeness') == 'full' or same_song), 'Documented source class and full performance or explicit same-song fallback required'
    checked_identity(source)
    if source['sourceClass'] != 'official':
        proof = source.get('sourceEvidence') or {}
        assert isinstance(proof.get('note'), str) and proof['note'].strip() and isinstance(proof.get('urls'), list) and proof['urls'], 'Third-party upload provenance evidence missing'
        for url in proof['urls']:
            parsed = urlsplit(url)
            assert parsed.scheme == 'https' and parsed.hostname and not parsed.username and not parsed.password, 'Invalid upload provenance URL'
    return selection

def selection_rank(source):
    selection = checked_selection(source)
    fixed_practice = selection['occasion'] == 'practice_room' and selection.get('camera', {}).get('mode') == 'fixed'
    # Corresponding original versions precede guest-scope fallbacks, even when
    # the fallback is a higher-like program or practice upload.
    return (2 if checked_same_song_fallback(source) else 1 if checked_member_fallback(source) else 0, PRIORITY[selection['occasion']], 0 if fixed_practice else 1)

def comparison_candidates(candidates, best_only=True):
    """Return only qualified, version-matched sources at the best policy priority.

    The caller keeps the original research list for evidence. A concert, rejected
    source, incomplete observation or lower-priority practice cannot win the
    music-program comparison merely because it has more likes.
    """
    eligible = []
    for candidate in candidates:
        if candidate.get('eligibility') not in ('eligible', 'qualified'):
            continue
        if candidate.get('platform') not in ('youtube', 'bilibili', 'x') or candidate.get('scorePolicy') == 'view_only':
            continue
        if not version_eligible(candidate):
            continue
        try:
            checked_selection(candidate)
            checked_likes(candidate)
        except (AssertionError, TypeError, ValueError):
            continue
        eligible.append((selection_rank(candidate), candidate))
    if not eligible:
        return []
    if not best_only:
        return [candidate for _, candidate in eligible]
    priority = min(rank for rank, _ in eligible)
    # Unknown likes do not erase an otherwise qualified higher-priority source.
    return [candidate for rank, candidate in eligible if rank == priority]


def checked_manual_decision(decision, selected, compared):
    assert isinstance(decision, dict) and decision.get('method') == 'manual_evidence', 'Manual selection reason and evidence required for incomparable sources'
    assert decision.get('selectedSourceKey') == source_key(selected), 'Manual selection must identify exact selected source key'
    keys = decision.get('comparedSourceKeys')
    assert isinstance(keys, list) and all(isinstance(key, str) for key in keys) and len(keys) == len(set(keys)), 'Manual comparison keys invalid'
    assert set(keys) == {source_key(source) for source in compared}, 'Manual comparison must cover exact compared sources'
    assert isinstance(decision.get('reason'), str) and decision['reason'].strip(), 'Manual selection reason missing'
    proof = decision.get('evidence') or {}
    assert isinstance(proof.get('note'), str) and proof['note'].strip() and isinstance(proof.get('urls'), list), 'Manual selection evidence missing'
    assert {source['url'] for source in compared} <= set(proof['urls']), 'Manual selection evidence must cite compared source URLs'
    for url in proof['urls']:
        parsed = urlsplit(url)
        assert parsed.scheme == 'https' and parsed.hostname and not parsed.username and not parsed.password, 'Invalid manual selection URL'
    return True


def checked_comparison(selected, candidates, decision=None, reviewed_candidates=None):
    assert candidates, 'No highest-priority policy-eligible comparison'
    reviewed = comparison_candidates(reviewed_candidates, best_only=False) if reviewed_candidates is not None else candidates
    if selected.get('platform') == 'x' and len(candidates) > 1:
        checked_manual_decision(decision, selected, candidates)
        return 'manual_evidence'
    if len({candidate.get('platform', 'youtube') for candidate in reviewed}) > 1:
        checked_manual_decision(decision, selected, reviewed)
        return 'manual_evidence'
    selected_likes = checked_likes(selected)
    groups = {comparison_group(candidate) for candidate in candidates}
    exact = all(checked_likes(candidate)['precision'] == 'exact' for candidate in candidates)
    bilibili_uploads = [candidate['videoId'] for candidate in candidates if candidate.get('platform') == 'bilibili']
    shared_upload = len(bilibili_uploads) != len(set(bilibili_uploads))
    if len(candidates) > 1 and (len(groups) != 1 or not exact or shared_upload):
        checked_manual_decision(decision, selected, candidates)
        return 'manual_evidence'
    if exact and not selected.get('clip'):
        assert selected_likes['value'] == max(checked_likes(candidate)['value'] for candidate in candidates), 'Selected not maximum among reviewed comparable candidates'
    return 'comparable_likes' if len(candidates) > 1 else 'single_candidate'

def replacement_preference(previous, selected, review=None, decision=None):
    """Compare eligible priority before likes; unknown historical context is held.

    Excluding an old event requires an explicit review bound to every byte of its
    canonical object. Missing legacy selection is never evidence of exclusion.
    Owner-score, save-journal and clip guards are enforced separately by merger.
    """
    assert checked_same_song_fallback(selected) is None, 'Same-song fallback is for new slots only, not source replacement'
    new_rank = selection_rank(selected)
    # A cross-platform or unknown-like replacement is never automatic, even
    # when its policy tier would otherwise win. Owner guards remain separate.
    same_bv = selected.get('platform') == previous.get('platform') == 'bilibili' and previous['videoId'] == selected['videoId'] and source_key(previous) != source_key(selected)
    incomparable = same_bv or comparison_group(previous) != comparison_group(selected) or checked_likes(previous)['precision'] != 'exact' or checked_likes(selected)['precision'] != 'exact'
    if incomparable:
        if decision is None:
            return None
        checked_manual_decision(decision, selected, [previous, selected])
    try:
        old_rank = selection_rank(previous)
    except (AssertionError, TypeError, ValueError):
        if not isinstance(review, dict):
            return None
        digest = hashlib.sha256(json.dumps(previous, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode('utf-8')).hexdigest()
        assert review.get('previousVideoId') == previous['videoId'] and review.get('previousSha256') == digest, 'Historical occasion review must match exact current source'
        assert review.get('occasion') in EXCLUDED_TYPES, 'Historical exclusion needs a documented excluded occasion'
        ev = review.get('evidence') or {}
        assert isinstance(ev.get('note'), str) and ev['note'].strip(), 'Historical occasion review note missing'
        urls = ev.get('urls')
        assert isinstance(urls, list) and previous.get('url') in urls, 'Historical review must cite the exact old source URL'
        for url in urls:
            parsed = urlsplit(url)
            assert parsed.scheme == 'https' and parsed.hostname and not parsed.username and not parsed.password, 'Invalid historical evidence URL'
        return 'excluded_historical_occasion'
    if new_rank < old_rank:
        return 'higher_policy_priority'
    if new_rank > old_rank:
        return None
    old_likes = previous.get('likes') or {}
    if incomparable:
        return 'documented_manual_comparison'
    if old_likes.get('precision') == 'exact' and isinstance(old_likes.get('value'), int) and not isinstance(old_likes['value'], bool) and checked_likes(selected)['value'] > old_likes['value']:
        return 'higher_comparable_likes'
    return None
