"""Rebuild the v200 public-only person proposals from existing reviewed originals."""
import copy
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
APP = ROOT / 'apps/idol-site'
OUT = Path(__file__).parent
def read(path):
    return json.loads(path.read_text(encoding='utf-8'))
def write(name, value):
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')

queue = read(ROOT / 'docs/codex/evidence/20261028-continuous/remaining-person-statistics.json')['remainingPersonWorks']
by_work = {r['workId']: r for r in queue}
base_credits = read(APP / 'data/public-work-credits.json')
base_recognition = read(APP / 'data/public-work-recognition.json')
media = read(APP / 'data/mv-public-media.json')['portraits']

specs = [
    dict(workId='recvxIYG1FSCws', kind='named_artist_credit', memberIds=['recvxyICzHu6mX'], series='wooah-wish3-r-20261027',
         label='公开录音署名（部分）',
         note='KanStarpress 2026年10月26日本人采访中，SORA明确谈到《VOODOO DOLL》的录音及自己负责开头段落；这里只补SORA的录音参与，不推定其他四人，也不等同本MV逐人出镜。',
         sourceUrl='https://kanstarpress.com/?p=207329&page=6', sourceTitle='KanStarpress · SORA本人录音采访',
         supportingUrls=['https://kanstarpress.com/?p=207329&page=7'],
         facts=['SORA describes recording VOODOO DOLL and performing its opening part.', 'The interview page 7 embeds target video nYrezqbjl3E. The embedded playback fetch was throttled; no full playback claim.']),
    dict(workId='rec28ldfRTrN8c', kind='named_artist_credit', memberIds=['rec28ldbniBbbO'], series='saymyname-jp-official-portrait-202601-directory',
         label='公开作词署名（部分）',
         note='Bugs本曲参与信息明确列HITOMI为作词者；non-no本人采访另谈及这首歌的创作。这里只展示HITOMI的作词参与，不将集体演唱署名扩成七人名单，也不等同本Music Story逐人出镜。',
         sourceUrl='https://music.bugs.co.kr/track/6266051', sourceTitle='Bugs · 本曲作词参与信息',
         supportingUrls=['https://nonno.hpplus.jp/entertainment/interview/181842/'],
         facts=['The exact Korean-titled song credits HITOMI individually under lyrics.', 'Vocals are credited only to the group. No seven-person recording or MV cast is inferred.']),
    dict(workId='rec28ldfRTrMcf', kind='official_recording_lineup', memberIds=['rec28ldbniBaIJ','rec28ldbniBaPL','rec28ldbniBaWW','rec28ldbniBb4p'], series='kiof-japan-artist-20260828',
         label='公开录音参与署名',
         note='Shazam本曲Credits逐名列出Julie Han、Natty、BELLE、HANEUL为Performer，发行归属S2 Entertainment的《Midas Touch》。这里只补歌曲录音的公开表演者署名，不据此证明本Short Film逐人出镜或片中每个声音；未完整播放本视频。',
         sourceUrl='https://www.shazam.com/song/1737365432/nothing', sourceTitle='Shazam · Nothing逐名表演者署名',
         supportingUrls=[],
         facts=['The track credits Natty, BELLE, HANEUL and Julie Han as individual performing artists.', 'The page associates the track with Midas Touch and S2 Entertainment, released April 3, 2024.', 'The page language field is not used as language evidence.']),
    dict(workId='recvxyOz5XueI9', kind='documented_project_lineup', memberIds=list(read(APP / 'data/loona-artist.json')['portraits']), series='loona-universal-jp-profile-202106-directory',
         label='公开本发行个人盘参考',
         note='Universal Music Japan《LUMINOUS》日本第二张单曲公告逐名列出11款个人封套：HEEJIN、HYUNJIN、HASEUL、YEOJIN、VIVI、KIM LIP、JINSOUL、CHOERRY、YVES、GOWON、OLIVIA HYE。这里只展示本发行个人盘人物参考，不将封套或发行活动名单当作全曲演唱或MV出镜证据，也不据此判定CHUU是否参与录音。',
         sourceUrl='https://www.universal-music.co.jp/loona/news/2022-07-28/', sourceTitle='Universal Music Japan · LUMINOUS个人盘发行公告',
         supportingUrls=[],
         facts=['The label names eleven individual-cover editions of Japan 2nd single LUMINOUS, due September 28, 2022.', 'Only personal-edition association is proposed. Event absence does not establish recording or MV absence.']),
    dict(workId='rec28ldfRTrIZT', kind='documented_project_lineup', memberIds=['rec28ldbniB8oY','rec28ldbniB8wf','rec28ldbniB8Oo','rec28ldbniB8WR','rec28ldbniB94X'], series='kiiikiii-uncut-gem-concept-photos-1',
         label='公开本发行参与参考',
         note='OSEN 2026年8月11日本次《WhyKiiiKiii》发行采访逐名记录JIYU、LEESOL、SUI、HAUM、KYA的准备感想，并明确《Pop Off Pop Off》为主打曲。这里只补同发行参与参考，不把采访出席直接当作每人的歌曲录音或本MV出镜核验；未完整播放本视频。',
         sourceUrl='https://v.daum.net/v/20260811143248533', sourceTitle='OSEN / Daum · WhyKiiiKiii五人发行采访',
         supportingUrls=[],
         facts=['OSEN original interview identifies five named members describing their preparation for WhyKiiiKiii.', 'It identifies Pop Off Pop Off as the title track and release on August 10, 2026.', 'The old queue suggestion to search a 2025 MV announcement is corrected in research only; no canonical release dates changed.']),
    dict(workId='rec28ldfRTrHhL', kind='documented_project_lineup', memberIds=['recvxAPKXChZPr','recvxAPQCFEeoQ','recvxAPQCF1pq2','recvxAPQCFdy35','recvxAPQCFRLvq'], series='adya-kprofiles-red-sportswear-set',
         label='公开本发行报道名单',
         note='Star Today韩文原稿转述Starting House的《RIZZ》发行通告，并在同篇逐名列出Yeonsu、Seowon、Sena、Chaeeun、Seungchae。这里只展示本发行报道的成员名单，不将团体发行通告当作逐人录音署名，也不据此证明本Performance Video全部出镜；未完整播放本视频。',
         sourceUrl='https://www.mk.co.kr/news/musics/11101359', sourceTitle='Star Today / Maeil Business · RIZZ发行原报道',
         supportingUrls=['https://www.genie.co.kr/detail/albumInfo?axnm=85537521'],
         facts=['The August 26, 2024 original report quotes Starting House announcing RIZZ and names Yeonsu, Seowon, Sena, Chaeeun and Seungchae in the same release report.', 'Only the release-report roster is proposed, not individual recorded vocals or exact MV appearances.'])
]
specs += [
    dict(workId='rec28ldfRTrNO2', kind='documented_project_lineup', memberIds=['rec28ldbniBc6L','rec28ldbniBcnd','rec28ldbniBcvH','rec28ldbniBcDI','rec28ldbniBcMa','rec28ldbniBcVa'], series='izna-not-just-pretty-concept-photos-1',
         label='公开本日文发行名单',
         note='iMBC原报道逐名列出MAI、BANG JEE MIN、KOKO、RYU SA RANG、CHOI JUNG EUN、JEONG SAE BI，说明六人团体将发行首支日本原创曲《Love All》，并用于日本电视广告。这里只补本日文发行报道名单，不等同逐人录音或MV出镜核验，也不以该名单解释其他版本；官方录音幕后尚未完整观看。',
         sourceUrl='https://enews.imbc.com/News/RetrieveNewsInfo/497222', sourceTitle='iMBC · Love All日本原创曲发行原报道', supportingUrls=[],
         facts=['March 9, 2026 original iMBC report names Mai, Bang Jeemin, Koko, Ryu Sarang, Choi Jungeun and Jeong Saebi in the announcement of the Japanese original Love All.', 'Only the exact Japanese release roster is proposed; the recording-behind video was not fully watched.']),
    dict(workId='rec28ldfRTrMwG', kind='named_artist_credit', memberIds=['rec28ldbniBaPL'], series='kiof-japan-artist-20260828',
         label='公开作词署名（部分）',
         note='Bugs《Painting》参与信息逐名列NATTY为作词者，Apple Music《224》专辑说明亦确认此项创作。这里只展示NATTY的作词参与，不将集体演唱署名扩成四人名单，也不据此证明本视频逐人出镜。',
         sourceUrl='https://music.bugs.co.kr/track/6314382', sourceTitle='Bugs · Painting作词参与信息', supportingUrls=['https://music.apple.com/us/album/224/1816140537'],
         facts=['Bugs lists Natty (KISS OF LIFE) under lyrics for Painting from 224.', 'Apple Music album editorial independently describes Natty contributing the song lyrics. No exact-video appearance is inferred.']),
    dict(workId='rec28ldfRTrMgm', kind='named_artist_credit', memberIds=['rec28ldbniBaWW'], series='kiof-japan-artist-20260828',
         label='公开作词／作曲署名（部分）',
         note='Bugs《Te Quiero》逐名列BELLE为作词及作曲者，Edaily本人采访也记录其创作并介绍歌曲。这里只展示BELLE的创作参与，不把其他词曲作者或集体演唱署名自动映射为团员，也不等同本Performance Video逐人出镜。',
         sourceUrl='https://music.bugs.co.kr/track/6250571', sourceTitle='Bugs · Te Quiero词曲参与信息', supportingUrls=['https://v.daum.net/v/20240701083248278?s=print_news'],
         facts=['Bugs lists Belle (KISS OF LIFE) for both composition and lyrics of Te Quiero.', 'The July 1, 2024 Edaily original interview independently states Belle co-wrote/composed the track and quotes her explanation.']),
    dict(workId='rec28ldfRTrMMV', kind='documented_project_lineup', memberIds=['rec28ldbniBaIJ','rec28ldbniBaPL','rec28ldbniBaWW','rec28ldbniBb4p'], series='kiof-japan-artist-20260828',
         label='公开本发行封套参与参考',
         note='Melon《Who is she》发行封套幕后专题逐名介绍JULIE、NATTY、BELLE、HANEUL，并将《Don’t mind me》明确列为第二首收录曲。这里只展示同发行封套参与参考，不把专题中的《Who is she》MV当作本视频出镜证据，也不将封套名单当作逐人录音核验。',
         sourceUrl='https://www.melon.com/musicstory/detail.htm?mstorySeq=16836', sourceTitle='Melon Magazine · Who is she发行封套幕后', supportingUrls=[],
         facts=['The original album jacket feature individually captions Haneul, Natty, Julie and Belle.', 'Its track table and album discussion identify Dont mind me as the second track.', 'The separately embedded Who is she MV is not used as exact-target appearance evidence.'])
]

loona_assets = {r['recordId']: r for r in read(APP / 'docs/artist-evidence/loona.json')['assets'] if r.get('recordId')}
credits, recognition, assets, research = [], [], [], []
for spec in specs:
    work = by_work[spec['workId']]
    assert not any(r['workId'] == work['workId'] for r in base_credits['records'])
    ids = spec['memberIds']
    record = {k: spec[k] for k in ['workId','kind','memberIds','label','note','sourceUrl','sourceTitle','supportingUrls']}
    record.update(videoId=work['videoId'], groupId=work['groupId'], checkedAt='2026-10-28',
                  evidence='Limited named public evidence, not exhaustive MV cast or private relations. Scope and source access: docs/codex/evidence/20261028-v200/people/research.json.')
    credits.append(record)
    portraits = []
    for mid in ids:
        if work['groupId'] == 'recvxyEBDZJAXm':
            a = loona_assets[mid]
            image = a['original']
            portrait = dict(memberId=mid, src='/' + image['path'].removeprefix('public/'), width=image['width'], height=image['height'],
                            sourceUrl=a['sourceUrl'], sourceImageUrl=a['imageUrl'], photoKind='portrait_photo',
                            photoSetId=spec['series'], sha256=image['sha256'], objectPosition='50% 0%',
                            sourceCrop=dict(x=1,y=0,width=798,height=1064))
        else:
            candidates = [r for r in media if r['memberId']==mid and r.get('photoSetId')==spec['series']]
            candidates += [p for r in base_recognition['records'] for p in r['portraits'] if p['memberId']==mid and p.get('photoSetId')==spec['series']]
            assert candidates, (mid,spec['series'])
            portrait = copy.deepcopy(candidates[-1])
            portrait.pop('workId',None); portrait.pop('videoId',None)
        path = APP / 'public' / portrait['src'].lstrip('/')
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        if 'sha256' in portrait: assert portrait['sha256']==digest
        portrait.update(sha256=digest, label='既有同系列照片 · 认人参考', workAssociation='recognition_reference',
                         note='复用已审具名同系列完整原图，仅帮助辨认本条公开资料人物；不证明本视频出镜、造型或拍摄同期。')
        portraits.append(portrait)
        assets.append(dict(workId=work['workId'],memberId=mid,src=portrait['src'],sha256=digest,bytes=path.stat().st_size,
                           photoSetId=spec['series'],newFile=False))
    recognition.append(dict(workId=work['workId'], videoId=work['videoId'], groupId=work['groupId'], portraits=portraits))
    research.append(dict(workId=work['workId'],videoId=work['videoId'],groupId=work['groupId'],song=work['song'],
                         disposition='proposed_public_credit_only', scope=spec['label'], memberIds=ids,
                         sources=[dict(url=spec['sourceUrl'], publisher=spec['sourceTitle'],bodyRead=True,facts=spec['facts'])],
                         supportingUrls=spec['supportingUrls'], fullPlayback=False, individualAudioComparison=False,
                         privateRelationsCreated=0, newImageFiles=0))

additional = [
    ('recvxyH5pzrrSO','bounded_collective_credit_only','https://music.bugs.co.kr/album/4147372',True,
     'WXW lists WOOAH collectively among lyricists. No individual names are given for target-song creation or recording; later event rosters do not substitute for track evidence.'),
    ('recvxyH5pzQxpW','bounded_collective_credit_only','https://music.bugs.co.kr/track/6489549',True,
     'SUMMER Bugs credits list only WOOAH collectively for vocals. Later fan events are not target-track evidence. A member missing a later event is not evidence of absence from this recording.'),
    ('rec28ldfRTrLsE','bounded_collective_video_report_only','https://m.news.nate.com/view/20260613n03604',True,
     'CBC report identifies the full June 12 Hit Em performance video but does not name individual participants. Apple visible article lacked usable credits; Fader interview did not individually establish target-recording participation.'),
]
for wid,status,url,body,fact in additional:
    work=by_work[wid]
    research.append(dict(workId=wid,videoId=work['videoId'],groupId=work['groupId'],song=work['song'],disposition=status,
                         sources=([dict(url=url,bodyRead=body,facts=[fact])] if url else []),finding=fact,
                         proposedMemberIds=[],fullPlayback=False,notFullWebExhaustion=True))

write('public-work-credits.delta.json',dict(checkedAt='2026-10-28',scope='Proposed append-only public evidence, no private relations or release-date changes.',records=credits))
write('public-work-recognition.delta.json',dict(schemaVersion=1,checkedAt='2026-10-28',scope='Existing reviewed full originals only; recognition references are not exact-video appearance proof.',records=recognition))
write('research.json',dict(schemaVersion=1,checkedAt='2026-10-28',sourceReadMethod='search_service page body; bounded searches; no browser/Chrome, no media bypass',
                         baselinePublicCreditWorks=len(base_credits['records']), baselinePublicRecognitionSlots=sum(len(r['portraits']) for r in base_recognition['records']),
                         proposedWorks=len(credits),proposedReferenceSlots=len(assets),researchedWorks=len(research),
                         baselineCreditsSha256=hashlib.sha256((APP/'data/public-work-credits.json').read_bytes()).hexdigest(),
                         baselineRecognitionSha256=hashlib.sha256((APP/'data/public-work-recognition.json').read_bytes()).hexdigest(),
                         copyrightScope='Facts and short paraphrases only; no full source articles or lyrics retained.', records=research))
write('asset-verification.json',dict(checkedAt=datetime.now(timezone.utc).isoformat(),slots=len(assets),uniqueOriginals=len(set(r['src'] for r in assets)),
                                    newImageFiles=0,localBytesAndShaVerified=True,independentVisualRecheck=False,records=assets))
print(json.dumps(dict(proposedWorks=len(credits),slots=len(assets),researchedWorks=len(research)),ensure_ascii=False))
