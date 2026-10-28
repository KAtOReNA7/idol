"""New formal adoptions only. Historical bindings stay in their original scope."""
from urllib.parse import urlsplit

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
