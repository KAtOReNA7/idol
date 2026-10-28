"""New formal adoptions only. Historical bindings stay in their original scope."""
from urllib.parse import urlsplit
import hashlib
import json

REJECTED = {'l9GLV8Kd-MU', 'saY9KS7mKvI', 'BnmwjH-suLg'}
PRIORITY = {'music_program': 0, 'practice_room': 1}
# These are structured classifications, never words found in a program title.
EXCLUDED_TYPES = {
    'concert', 'concert_stage', 'press_concert_recording', 'official_concert_full_event',
    'tour', 'tour_stage', 'festival', 'festival_stage', 'showcase', 'showcase_stage',
    'official_showcase_full_event', 'fan_event', 'other_event',
}

def checked_selection(source):
    assert source.get('videoId') not in REJECTED, 'User-rejected exact source'
    selection = source.get('selection') or {}
    assert isinstance(selection, dict) and selection.get('occasion') in PRIORITY, 'New formal sources need documented music-program or practice-room context'
    for field in ('type', 'kind', 'performanceType'):
        classification = source.get(field)
        assert classification not in EXCLUDED_TYPES, 'Structured performance type conflicts with new-adoption occasion'
        assert classification != 'practice_room' or selection['occasion'] == 'practice_room', 'Structured practice type conflicts with occasion'
        assert classification != 'music_program' or selection['occasion'] == 'music_program', 'Structured program type conflicts with occasion'
    evidence = selection.get('evidence') or {}
    assert isinstance(evidence, dict) and isinstance(evidence.get('note'), str) and evidence['note'].strip(), 'Occasion evidence note missing'
    urls = evidence.get('urls')
    assert isinstance(urls, list) and urls, 'Occasion evidence URLs missing'
    for url in urls:
        assert isinstance(url, str), 'Invalid occasion evidence URL'
        parsed = urlsplit(url)
        assert parsed.scheme == 'https' and parsed.hostname and not parsed.username and not parsed.password, 'Invalid occasion evidence URL'
    assert source.get('sourceClass') == 'official' and source.get('completeness') == 'full', 'Official full performance required'
    return selection

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
        if candidate.get('versionMatch') is not True and candidate.get('versionMatch') != 'exact':
            continue
        likes = candidate.get('likes') or {}
        if not isinstance(likes, dict) or likes.get('precision') != 'exact':
            continue
        value = likes.get('value')
        if not isinstance(value, int) or isinstance(value, bool) or value < 0:
            continue
        try:
            selection = checked_selection(candidate)
        except (AssertionError, TypeError, ValueError):
            continue
        eligible.append((PRIORITY[selection['occasion']], candidate))
    if not eligible:
        return []
    priority = min(rank for rank, _ in eligible)
    return [candidate for rank, candidate in eligible if rank == priority]

def replacement_preference(previous, selected, review=None):
    """Compare eligible priority before likes; unknown historical context is held.

    Excluding an old event requires an explicit review bound to every byte of its
    canonical object. Missing legacy selection is never evidence of exclusion.
    Owner-score, save-journal and clip guards are enforced separately by merger.
    """
    new_rank = PRIORITY[checked_selection(selected)['occasion']]
    try:
        old_rank = PRIORITY[checked_selection(previous)['occasion']]
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
