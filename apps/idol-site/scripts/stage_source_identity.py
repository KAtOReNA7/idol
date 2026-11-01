"""Exact public stage identities. Never rewrites legacy YouTube source keys."""
import re
from urllib.parse import parse_qs, urlsplit

MAX_SAFE_INTEGER = 9007199254740991
SOURCE_CLASSES = {'official', 'reupload', 'third_party'}


def source_key(source):
    platform = source.get('platform', 'youtube')
    video_id = source.get('videoId')
    assert isinstance(video_id, str), 'Video identity missing'
    if platform == 'x':
        media = source.get('xMedia')
        assert re.fullmatch(r'[1-9][0-9]{0,19}', video_id), 'Invalid X post identity'
        assert isinstance(media, dict) and set(media) == {'videoIndex'} and type(media['videoIndex']) is int and 1 <= media['videoIndex'] <= 4, 'X needs an explicit video index'
        assert source.get('clip') is None and source.get('bilibili') is None, 'X clips or Bilibili identities are not supported'
        return f"x:{video_id}:video:{media['videoIndex']}"
    if platform == 'bilibili':
        assert source.get('xMedia') is None, 'Bilibili cannot contain an X media identity'
        assert re.fullmatch(r'BV[A-Za-z0-9]{10}', video_id), 'Invalid Bilibili BV identity'
        part = source.get('bilibili')
        assert isinstance(part, dict) and set(part) == {'cid', 'page'}, 'Bilibili needs exact CID and page'
        assert isinstance(part['cid'], str) and re.fullmatch(r'[1-9][0-9]{0,19}', part['cid']), 'Invalid Bilibili CID'
        assert type(part['page']) is int and 0 < part['page'] <= MAX_SAFE_INTEGER, 'Invalid Bilibili page'
        key = f"bilibili:{video_id}:cid:{part['cid']}:p:{part['page']}"
        clip = source.get('clip')
        if clip is not None:
            assert isinstance(clip, dict), 'Invalid Bilibili clip'
            start,end,total = (clip.get(k) for k in ('startSeconds','endSeconds','sourceDurationSeconds'))
            assert all(type(v) is int for v in (start,end,total)) and 0 <= start < end <= total <= 86400, 'Invalid Bilibili clip bounds or full-part duration'
            proof = clip.get('evidence') or {}
            assert isinstance(proof.get('note'), str) and proof['note'].strip() and isinstance(proof.get('urls'), list) and proof['urls'], 'Bilibili clip boundary evidence missing'
            key += f'@{start}-{end}'
        assert len(key) <= 80, 'Stage source key exceeds save contract'
        return key
    assert platform == 'youtube', 'Unsupported formal stage platform'
    assert re.fullmatch(r'[A-Za-z0-9_-]{11}', video_id), 'Invalid YouTube identity'
    assert source.get('bilibili') is None and source.get('xMedia') is None, 'YouTube identity cannot contain another platform media identity'
    clip = source.get('clip')
    return video_id + (f"@{clip['startSeconds']}-{clip['endSeconds']}" if clip else '')


def checked_identity(source):
    key = source_key(source)
    url = source.get('url')
    assert isinstance(url, str), 'Source URL missing'
    parsed = urlsplit(url)
    assert parsed.scheme == 'https' and not parsed.username and not parsed.password and not parsed.port, 'Invalid public source URL'
    query = parse_qs(parsed.query, keep_blank_values=True)
    if source.get('platform') == 'x':
        match = re.fullmatch(r'/[A-Za-z0-9_]{1,15}/status/([1-9][0-9]{0,19})/video/([1-4])', parsed.path)
        assert parsed.hostname == 'x.com' and match and match[1] == source['videoId'] and int(match[2]) == source['xMedia']['videoIndex'] and not parsed.query and not parsed.fragment, 'X URL must identify the exact post and video index'
    elif source.get('platform', 'youtube') == 'bilibili':
        assert parsed.hostname in ('bilibili.com', 'www.bilibili.com') and parsed.path in (
            '/video/' + source['videoId'], '/video/' + source['videoId'] + '/'), 'Bilibili URL/BV mismatch'
        expected = {'p': [str(source['bilibili']['page'])]}
        if 'cid' in query:
            expected['cid'] = [source['bilibili']['cid']]
        assert query == expected and not parsed.fragment, 'Bilibili URL must explicitly identify the exact page and CID'
    else:
        host = parsed.hostname
        actual = parsed.path[1:] if host == 'youtu.be' else query.get('v', [None])[0] if host in ('youtube.com', 'www.youtube.com', 'm.youtube.com') else None
        assert actual == source['videoId'] and len(query.get('v', [actual])) == 1, 'YouTube URL/video ID mismatch'
    return key


def checked_likes(source):
    raw = source.get('likes')
    value = raw.get('value') if isinstance(raw, dict) else raw
    precision = raw.get('precision') if isinstance(raw, dict) else source.get('likesPrecision')
    display = raw.get('display') if isinstance(raw, dict) else source.get('likesDisplay')
    metric = raw.get('metric', 'likes') if isinstance(raw, dict) else source.get('likesMetric', 'likes')
    assert metric == 'likes', 'Views, coins and favorites cannot be substituted for likes'
    if precision is None and value is None:
        precision = 'unknown'
    assert precision in ('exact', 'rounded', 'unknown'), 'Invalid likes precision'
    if precision == 'exact':
        assert type(value) is int and 0 <= value <= MAX_SAFE_INTEGER, 'Invalid exact likes'
    else:
        assert value is None, 'Unknown or rounded likes require null numeric value'
    assert display is None or isinstance(display, str) and display.strip(), 'Invalid likes display'
    return {'value': value, 'display': display or (str(value) if precision == 'exact' else '未知'), 'precision': precision}


def comparison_group(source):
    platform = source.get('platform', 'youtube')
    if platform == 'x':
        assert source.get('likesScope') == 'whole_post', 'X post likes cannot be ranked as per-video likes'
        return platform, 'whole_post', 'likes'
    scope = source.get('likesScope', 'whole_video' if platform == 'bilibili' or source.get('clip') else 'performance')
    assert scope in ('performance', 'whole_video'), 'Unknown likes scope'
    return platform, scope, 'likes'
