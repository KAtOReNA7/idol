"""New formal adoptions only. Historical bindings stay in their original scope."""
from urllib.parse import urlsplit
import hashlib
import json

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

def version_eligible(source):
    try:
        fallback = checked_member_fallback(source)
    except (AssertionError, TypeError, ValueError):
        return False
    return bool(fallback) or source.get('versionMatch') is True or source.get('versionMatch') == 'exact'

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
    assert source.get('sourceClass') == 'official' and source.get('completeness') == 'full', 'Official full performance required'
    return selection

def selection_rank(source):
    selection = checked_selection(source)
    fixed_practice = selection['occasion'] == 'practice_room' and selection.get('camera', {}).get('mode') == 'fixed'
    # Corresponding original versions precede guest-scope fallbacks, even when
    # the fallback is a higher-like program or practice upload.
    return (1 if checked_member_fallback(source) else 0, PRIORITY[selection['occasion']], 0 if fixed_practice else 1)

def comparison_candidates(candidates):
    """Return only qualified, version-matched sources at the best policy priority.

    The caller keeps the original research list for evidence. A concert, rejected
    source, incomplete observation or lower-priority practice cannot win the
    music-program comparison merely because it has more likes.
    """
    eligible = []
    for candidate in candidates:
        if candidate.get('eligibility') not in ('eligible', 'qualified'):
            continue
        if candidate.get('platform') != 'youtube' or candidate.get('scorePolicy') == 'view_only':
            continue
        if not version_eligible(candidate):
            continue
        try:
            selection = checked_selection(candidate)
        except (AssertionError, TypeError, ValueError):
            continue
        eligible.append((selection_rank(candidate), candidate))
    if not eligible:
        return []
    priority = min(rank for rank, _ in eligible)
    # Missing comparable likes at the best documented priority is a research
    # hold, not permission to fall back to a lower-priority performance.
    comparable = []
    for rank, candidate in eligible:
        if rank != priority:
            continue
        likes = candidate.get('likes') or {}
        value = likes.get('value') if isinstance(likes, dict) else None
        if isinstance(likes, dict) and likes.get('precision') == 'exact' and isinstance(value, int) and not isinstance(value, bool) and value >= 0:
            comparable.append(candidate)
    return comparable

def replacement_preference(previous, selected, review=None):
    """Compare eligible priority before likes; unknown historical context is held.

    Excluding an old event requires an explicit review bound to every byte of its
    canonical object. Missing legacy selection is never evidence of exclusion.
    Owner-score, save-journal and clip guards are enforced separately by merger.
    """
    new_rank = selection_rank(selected)
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
    if old_likes.get('precision') == 'exact' and isinstance(old_likes.get('value'), int) and not isinstance(old_likes['value'], bool) and selected['likes'] > old_likes['value']:
        return 'higher_comparable_likes'
    return None
