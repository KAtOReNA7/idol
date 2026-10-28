"""Freeze the bounded v200 stage-source research without changing app data."""
import datetime, hashlib, json, pathlib

root = pathlib.Path(__file__).resolve().parents[5]
out = pathlib.Path(__file__).resolve().parent
queue_path = root / 'docs/codex/evidence/20261028-continuous/remaining-stage-ledger.json'
queue_bytes = queue_path.read_bytes()
queue = json.loads(queue_bytes)
by_id = {row['workId']: row for row in queue['records']}

data = [
('rec28ldfRTrAfx', ['"KiiiKiii" "DEBUT SONG" "뮤직뱅크"'],
 'official_wrong_song_disambiguated',
 'KBS 2025-02-28 article identifies the actual M Countdown stage as I DO ME. DEBUT SONG occurs in the VCR/cake-introduction explanation, not as an independently documented full-song stage.',
 ['https://world.kbs.co.kr/service/contents_view.htm?board_seq=456104&id=&lang=k&menu_cate='],
 'Seek an exact DEBUT SONG first-party complete practice or program upload; exclude debut-event results for I DO ME.'),
('rec28ldfRTrIC0', ['"Hearts2Hearts" "Moonride" dance practice'],
 'no_new_eligible_source_in_bounded_search',
 'Search surfaced the Kia collaboration MV, MV behind and official timeline entries for other songs. No exact eligible program or full practice source was identified in this query.',
 ['https://www.soompi.com/article/1868750wpp/watch-hearts2hearts-teases-new-collaboration-single-moonride', 'https://fiji.kastden.org/owner/hearts2hearts/'],
 'Continue artist/company Moonride-specific uploads; ICONIC HEART/15-LOVE practice titles are different works.'),
('recvxIZnIaGCNq', ['"KATSEYE" "Gameboy" performance official', 'site:youtube.com "Gameboy" "KATSEYE" "Dance Practice"', 'site:katseye.world "Gameboy" performance'],
 'official_index_disambiguated',
 'Official video directory lists Gameboy MV plus extended/sped-up/acoustic-remix audios. Nearby Performance and Dance Practice entries belong to Gabriela and Gnarly. The bounded official-index read does not establish absence everywhere.',
 ['https://www.katseye.world/videos/', 'https://www.katseye.world/video/page/2/'],
 'Look for an exact complete original-arrangement Gameboy program/practice from an artist or broadcaster. Do not use a different-song practice or remix/audio.'),
('recvxyOz5X6G1q', ['"NMIXX" "Caution" "쇼챔피언"'],
 'no_new_eligible_source_in_bounded_search',
 'Exact query surfaced references to Caution MV Behind and unrelated Show Champion history. It did not establish a Caution full-song show performance.',
 ['https://d.namu.moe/w/NMIXX/%EC%9C%A0%ED%8A%9C%EB%B8%8C'],
 'Seek a first-party complete performance retaining the precise collaboration/version. Behind-the-scenes editing is not proof of a full stage.'),
('recvxyOz5XlqWP', ['ITZY "Boys Like You" "DANCE PRACTICE"'],
 'unverified_practice_title_leads',
 'Search surfaced QA83BdN4iOw and w-WEZoiVs_E, both titled as Dance Practice. Search titles alone do not verify artist/company uploaders or original practice source. Exact page opens returned Online fetch throttled; stopped this route without bypass.',
 ['https://www.youtube.com/watch?v=QA83BdN4iOw', 'https://www.youtube.com/watch?v=w-WEZoiVs_E'],
 'Only resume exact original uploader/source-chain checks after normal access recovers; reject fan/mirrored/edited concert sources. Do not repeat already excluded year-end medley.'),
('recvxyOz5XkyEY', ['ITZY "Voltage" "DANCE PRACTICE"', 'site:itzyjapan.com "Voltage" "MUSIC STATION"', 'site:itzyjapan.com "Voltage" "CDTV"'],
 'no_new_eligible_source_in_bounded_search',
 'Search again surfaced the already-known official Special Dance Clip, unrelated RINGO/#Twenty practices and release news. No new first-party full-song regular-program/practice video was established.',
 ['https://www.itzyjapan.com/feature/voltage', 'https://www.bandwagon.asia/articles/itzy-release-japanese-debut-single-album-voltage-warner-music-japan-jyp-april-2022'],
 'Seek full Japanese regular music-show archive or actual artist practice. The known produced special clip stays a separate category.'),
('recvxyH5pzVn2k', ['STAYC "LIT" "DANCE PRACTICE"', '"STAYC" "LIT" パフォーマンス 番組'],
 'no_new_eligible_source_in_bounded_search',
 'Search found label release information, MV, Japan-activity behind and POPPY dance practice. No full LIT practice/program upload was established. Release-period behind dTdz4Ls8XmQ is not a declared complete practice.',
 ['https://www.universal-music.co.jp/stayc/news/2023-09-19/', 'https://www.youtube.com/watch?v=dTdz4Ls8XmQ'],
 'Prioritize the Japanese rights-holder program archive and exact LIT title; do not replace it with POPPY or release-event footage.'),
('recvxyH5pzdckl', ['STAYC "MEOW" "Music Station"', 'site:youtube.com "STAYC" "MEOW" "STAYC Japan Official"', 'site:universal-music.co.jp/stayc "MEOW" "テレビ"'],
 'recording_behind_not_full_stage',
 'Official search result identifies LZfaAxp7i5Q as MEOW Recording Behind, published2024-08-23, distinct from the MV b8yjHGQ4hA4. A recording-behind title does not prove complete single-song performance. Release description separates MEOW and Cheeky Icy Thang Japanese version.',
 ['https://www.youtube.com/watch?v=LZfaAxp7i5Q', 'https://www.youtube.com/watch?v=b8yjHGQ4hA4'],
 'Continue exact MEOW program/practice lookup. Do not assign the other double-A-side song or label edited recording behind as a complete live take.'),
('recvxDMFHNHFyM', ['"XG" "IYKYK" "Inkigayo"'],
 'no_new_eligible_source_in_bounded_search',
 'Search matched concert-setlist pages and a same-title ILLIT Inkigayo entry. Neither proves XG IYKYK at a normal show. Existing produced choreography source remains outside automatic practice eligibility.',
 ['https://xg-music.fandom.com/wiki/AWE/Videos', 'https://test2.sonichits.com/video/ILLIT/IYKYK_%28If_You_Know_You_Know%29'],
 'Require XG exact artist and song plus broadcaster/artist source. Reject ILLIT same-title and tour setlist hits.'),
('recvxDMFHNJME3', ['"XG" "IN THE RAIN" "Music Bank"'],
 'no_new_eligible_source_in_bounded_search',
 'Results combined IN THE RAIN MV/live-tour pages with HOWLING Music Bank entries; no same-work ordinary program/practice established.',
 ['https://xg-music.fandom.com/wiki/AWE/Videos', 'https://www.uta-net.com/movie/377929/93nXITK9CaY/'],
 'Check exact IN THE RAIN artist/broadcaster video rather than neighboring HOWLING or tour chapters.'),
('rec28ldfRTrMwG', ['"KISS OF LIFE" "Painting" practice music show'],
 'no_new_eligible_source_in_bounded_search',
 'The returned work-specific results describe Painting Special Video and behind. Practice/show titles in the results belong to Lips Hips Kiss/k bye. Encore-concert associations remain excluded.',
 ['https://kissoflife.fandom.com/wiki/Painting', 'https://kissoflife.fandom.com/wiki/Kiss_Of_Life/Videos'],
 'Seek Painting-specific artist practice or ordinary promotional show. Do not re-use previously rejected Nothing/Sticky compilation or concert.'),
('recvxyH5pzEDfw', ['"IZ*ONE" "Buenos Aires" NHK 2019 performance official', 'site:universal-music.co.jp/izone "シブヤノオト" "Buenos"', 'site:izone-official.com "Buenos Aires" "シブヤノオト"'],
 'broadcast_date_found_rightsholder_video_missing',
 'Contemporary Japanese reports identify NHK Shibuya Note appearance2019-06-01 at24:05 and Buenos Aires debut performance. No currently accessible full rights-holder source was established. An appearance announcement is not sufficient video adoption evidence.',
 ['https://spice.eplus.jp/articles/240115/amp', 'https://kstyle.com/article.ksn?articleNo=2118539', 'https://lp.p.pia.jp/article/news/53117/index.html'],
 'Follow NHK/artist rights-holder archive for that precise broadcast; verify complete original Japanese song and participant scope, not fan repost title.'),
]

records = []
for work_id, queries, status, finding, urls, action in data:
    old = by_id[work_id]
    records.append({
        'workId': work_id, 'artist': old['artist'], 'song': old['song'],
        'baselineCategory': old['category'], 'baselineReason': old['reason'],
        'queries': queries, 'status': status, 'finding': finding,
        'sourceUrls': urls, 'nextAction': action,
        'eligibleForAdoption': False, 'absenceClaim': False,
        'fullPlaybackVerified': False, 'actualAudioComparison': False,
        'privateDataRead': False, 'bindingChanged': False,
    })
result = {
    'schemaVersion': 1, 'researchDate': '2026-10-28', 'timezone': 'Asia/Shanghai',
    'baselineCommit': '21b12a6f0d49f355ee639ae87bb2b294ba58513f',
    'baselineLedger': str(queue_path.relative_to(root)).replace('\\', '/'),
    'baselineLedgerSha256': hashlib.sha256(queue_bytes).hexdigest(),
    'method': 'Bounded fresh internet searches and public source reads; official source-chain preference. Search-only leads remain labeled. No browser login, private owner export, video playback or application edits.',
    'summary': {'reviewedWorks': len(records), 'exactQueries': sum(len(r['queries']) for r in records), 'adoptableNewSources': 0, 'newBindings': 0, 'legacyBindingsReplaced': 0, 'remainingNew': 112, 'remainingLegacyReplacement': 11},
    'accessLimit': {'service': 'web search page-open', 'urls': ['https://www.youtube.com/watch?v=QA83BdN4iOw', 'https://www.youtube.com/watch?v=w-WEZoiVs_E'], 'message': 'Online fetch throttled', 'response': 'Stopped direct YouTube page-open route; did not bypass or reuse user session.'},
    'records': records,
    'additionalExploratoryQueries': [
        '"WOOAH" "SUMMER" "dance practice"',
        '"fromis_9" "Touchdown" "practice"',
        '"Weeekly" "Top Secret" live music',
    ],
    'additionalExploratoryScope': 'These three light searches only returned neighboring songs, MV/OST pages or concert reports. They are not included in the12-work focused-research count or claimed as completed evidence review.',
}
assert len(records) == 12 and len({r['workId'] for r in records}) == 12
assert all(r['workId'] in by_id for r in records)
(out / 'research.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')
print(json.dumps(result['summary'], ensure_ascii=False))
