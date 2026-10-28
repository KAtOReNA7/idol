"""Append public evidence only, retaining all 91 v200 objects and original assets."""
import copy
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
import struct

ROOT = Path(__file__).resolve().parents[5]
APP = ROOT / 'apps/idol-site'
OUT = Path(__file__).parent
def read(path): return json.loads(path.read_text(encoding='utf-8'))
def write(path, value): path.write_bytes((json.dumps(value, ensure_ascii=False, indent=2)+'\n').encode('utf-8'))
def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def semantic(value): return hashlib.sha256(json.dumps(value,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()

queue=read(ROOT/'docs/codex/evidence/20261028-v200/remaining-person-statistics.json')['remainingPersonWorks']
by_work={r['workId']:r for r in queue}
baseline_c=read(APP/'data/public-work-credits.json')
baseline_r=read(APP/'data/public-work-recognition.json')
assert len(baseline_c['records'])==len(baseline_r['records'])==91, 'One-time v200 append only; do not rerun after adoption.'
assert sum(len(r['portraits']) for r in baseline_r['records'])==488
members=read(ROOT/'docs/codex/evidence/20261028-current-audit/catalog-audit-projection.json')['members']
media=read(APP/'data/mv-public-media.json')['portraits']
specs=[]
def spec(wid,names,series,label,note,url,title,facts,extra=None,kind='documented_project_lineup'):
    work=by_work[wid]
    mids=[]
    for name in names:
        matches=[m for m in members if work['groupId'] in m['groupIds'] and m['stageName'].casefold()==name.casefold()]
        assert len(matches)==1,(wid,name,matches)
        mids.append(matches[0]['id'])
    specs.append(dict(workId=wid,memberIds=mids,memberNames=names,series=series,label=label,note=note,
                      sourceUrl=url,sourceTitle=title,facts=facts,supportingUrls=extra or [],kind=kind))

spec('recvxyOz5X6G1q',['LILY','HAEWON'],'nmixx-forward-official-202502','公开词曲参与署名（部分）',
     'Qobuz《K-Pops!》中《Caution》逐名列LILY、HAEWON为ComposerLyricist。这里只展示两人的词曲参与，不把NMIXX集体演唱署名扩成六人名单，也不等同本视频逐人出镜或逐句演唱核验。',
     'https://www.qobuz.com/us-en/album/k-pops-anderson-paak/hgg5uaqbxxjjt','Qobuz · Caution逐名词曲署名',
     ['Exact Caution track credits Lily and Haewon as ComposerLyricist.','Group collective performer credit does not identify all singers or exact video cast.'],
     ['https://music.bugs.co.kr/track/132406875'],kind='named_artist_credit')
spec('rec28ldfRTrLow',['RUKA','ASA'],'babymonster-wegoup-visual-202510','公开作词署名（部分）',
     'Bugs和Qobuz《Ghost》参与信息逐名列RUKA、ASA为作词者。这里只展示两人的作词参与，不将团体演唱署名扩成七人名单，也不据此证明本Promotion Video出镜或演唱分配。',
     'https://music.bugs.co.kr/track/124281326','Bugs · Ghost作词参与信息',
     ['Exact Ghost credits ASA and RUKA under lyrics.','Qobuz independently credits ASA and Rüka as lyricists; audio release and promotion-video publication dates are not conflated.'],
     ['https://www.qobuz.com/us-en/album/ghost-babymonster/zexebrywvhlta'],kind='named_artist_credit')
spec('rec28ldfRTrPq2',['Soeun','Heejin','Sejeong','Eunbi'],'tracer-gleammedia-named-portrait-20261024','公开本发行封套参与参考',
     'Genie《365》封套拍摄幕后专题逐名列SOEUN、HEEJIN、SEJEONG、EUNBI，并收录本单曲。这里只展示本发行封套企划的人物参考，不将封套名单当作本Performance Video Part.1逐人出镜或录音证明；官网具名照片时期未明。',
     'https://www.genie.co.kr/magazine/subMain?ctid=1&mgz_seq=14789','Genie Magazine · 365封套拍摄幕后',
     ['The original jacket feature names Soeun, Heejin, Sejeong and Eunbi and lists 365 plus its instrumental.','The four-person debut campaign roster is not proof of current contracts or the target Part.1 performance cast.'])
spec('recvxIZLpET3tB',['Chodan','Magenta','Hina','Siyeon'],'qwer-ceremony-r-20261027','公开本发行采访参考',
     'iMBC《CEREMONY》发行发布会原报道逐名记录CHODAN、MAGENTA、HINA、SIYEON的准备感想，并明确《Our Voyage》为本专辑收录曲。这里只展示同发行采访人物，不等同本曲逐人演奏、演唱或本MV出镜核验，也不转用其他曲目的创作署名。',
     'https://enews.imbc.com/News/RetrieveNewsInfo/502942','iMBC · CEREMONY发行采访',
     ['April 27, 2026 original CEREMONY showcase report individually quotes all four members.','The same report includes Our Voyage in the track list; it does not give individual recording roles for that song.'])
for wid,song in [('recvxIZnNLkXMl','A-HA!'),('recvxIZnNLgpyC','HAPPY')]:
    spec(wid,['VV','Hyerin'],'hitgs-verified-member-portrait-collection','公开本发行采访参考（部分）',
         f'Sports Kyunghyang记录VV、HYERIN参加电台采访，分别谈及《HAPPY》和《A-HA!》。这里只为《{song}》展示这两位本发行采访人物，不扩成五人录音或MV名单；文中海外拍摄回忆未逐视频区分，不能据此绑定本视频出镜。',
         'https://sports.khan.co.kr/article/202511071918003/amp','Sports Kyunghyang · VV／HYERIN电台发行采访',
         ['November 7, 2025 original report names VV and Hyerin as November 6 radio guests and discusses both HAPPY and A-HA!.','The overseas MV shooting recollection is not uniquely assigned to either target video.'])
spec('recvxIZy35Xwr7',['VV','Iyoo','Seohee','Hyerin','Seojin'],'hitgs-verified-member-portrait-collection','公开本发行报道名单',
     'NewsPim《Cherry Blossom》发行原报道的图片说明逐名列VV、IYOO、SEOHEE、HYERIN、SEOJIN，正文确认本主打曲。这里只展示本发行报道名单，不把资料照片说明当作逐人录音或本MV出镜证明；未采用网页顶部AI摘要。',
     'https://m.newspim.com/news/view/20260414001003','NewsPim · Cherry Blossom发行原报道',
     ['Original reporter text identifies Cherry Blossom as the title song; the original caption names five members.','The original article and caption were read, not its AI summary. The page body needed ordinary public HTTP after source-tool timeouts; no authentication or restriction bypass.'])
spec('rec28ldfRTrKy2',['YUNAH','MINJU','MOKA','WONHEE','IROHA'],'illit-nca-q-20261027','公开本发行采访参考',
     'Dispatch《It’s Me》发行问答逐名记录YUNAH、MINJU、MOKA、WONHEE、IROHA的准备与歌曲感想。这里只展示同发行采访人物，不证明本Performance上传el7A_SI7sxs的逐人出镜；尤其不据采访自动判断MOKA在该视频中的参与。',
     'https://www.dipe.co.kr/2342093','Dispatch · It’s Me发行问答',
     ['April 29, 2026 publisher-hosted English interview names all five members discussing Its Me and MAMIHLAPINATAPAI.','The interview is release participation evidence, not a cast list for Performance upload el7A_SI7sxs or other uploads.'])
spec('rec28ldfRTrLsE',['SOOIN','GAWON','ANNA','NARIN','ELLA'],'meovv-my-eyes-open-vvide-concept-20250423','公开本发行发布会参考',
     'MHN《BITE NOW》发行发布会原报道列SOOIN、GAWON、ANNA、NARIN、ELLA及收录曲《Hit ’Em》，News1同场原图说明亦记录该曲表演。这里只展示本发行发布会人物，不把发布会表演推定为本Performance Video逐人出镜或录音核验。',
     'https://mhnse.com/news/articleView.html?idxno=1396951','MHN · BITE NOW发行发布会',
     ['June 1, 2026 original showcase photo report names all five members and lists Hit Em on BITE NOW.','News1 original captions identify the same release showcase and a Hit Em performance; neither establishes target video vYq_Xzj8HUM cast.'],
     ['https://www.news1.kr/entertain/music/6184253'])
spec('rec28ldfRTrMW0',['JULIE','NATTY','BELLE','HANEUL'],'kiof-japan-artist-20260828','公开本发行采访参考',
     'iMBC《SWEAT》发行采访逐名列JULIE、NATTY、BELLE、HANEUL，并确认《WHAT!》是同单曲收录曲。这里只展示同发行采访人物，不把文中《SWEAT》MV拍摄回忆转用于本《WHAT!》Special Video，也不等同本曲逐人录音。',
     'https://enews.imbc.com/M/Detail/512982','iMBC · SWEAT／WHAT!发行采访',
     ['August 4, 2026 original interview names four members and lists WHAT! alongside SWEAT.','SWEAT-specific filming remarks are not attributed to the WHAT! special video.'])
spec('rec28ldfRTrMEN',['JULIE','NATTY','BELLE','HANEUL'],'kiof-japan-artist-20260828','公开本韩文版宣传报道名单',
     'Star News原报道逐名列JULIE、NATTY、BELLE、HANEUL并明确报道《Lucky (Korean Ver.)》打歌宣传。这里只展示该韩文版宣传报道人物，不将电视舞台名单当作本MV出镜或录音名单，也不把日文原版的信息直接继承到本版。',
     'https://www.starnewskorea.com/music/2025/11/24/2025112410590378248','Star News · Lucky韩文版打歌宣传原报道',
     ['November 24, 2025 original report names Belle, Julie, Natty and Haneul and explicitly describes Lucky Korean Ver music-show promotions.','Promotion association is adopted only; exact MV appearances and individual recording roles remain unverified.'])

# Every remaining item receives a fresh bounded result and a distinct next route.
unresolved=[]
def pending(wid,url,finding,route,category='collective_credit_only',body=True,extra=None):
    unresolved.append(dict(workId=wid,sourceUrl=url,bodyRead=body,finding=finding,nextRoute=route,category=category,supportingUrls=extra or []))
pending('rec28ldfRTrIkV','https://www.qobuz.com/be-nl/album/focus-hearts2hearts/ga3afnr1he5oc','Exact DJ Seinfeld remix credits only collective Hearts2Hearts and external writers/remixer. Original eight-person lineup is not inherited.','Seek named sampled-vocal/session credits for the DJ Seinfeld mix, or exact-version production feature.')
pending('rec28ldfRTrNsK','https://www.shazam.com/song/1816101983/beep-japan-edition','Exact Japan Edition lists izna collectively; VVN is background vocalist and other named contributors are external. Seven-person Summer Sonic profile does not establish this recording.','Seek Japanese recording-behind transcript or label release feature naming participants.')
pending('rec28ldfRTrNBu','https://izna-official.jp/s/n198/diary/movie/list?ima=0000&link=ROBO004','Official catalog confirms SASS & Racecar Special Performance title but gives no individual cast.','Read an exact-upload production/costume feature or named official behind; do not combine rosters of two separate song videos.','exact_video_catalog_only')
pending('rec28ldfRTrPi9','https://www.yes24.com/product/goods/175905520','Girl Meets Boy packaging counts are five covers/four message-card variants, while generic artist bio still names six. Counts and stale bio cannot identify PUNG participants.','Inspect named exact-release member covers or original PUNG production captions.','conflicting_generic_roster')
pending('recvxyH5pzrrSO','https://music.bugs.co.kr/album/4147372','WXW writing/vocals are credited collectively to WOOAH. Later call-event names and current artist roster do not identify individual target-song writers.','Seek individual writer registration or exact WXW recording interview.')
pending('recvxyH5pzQxpW','https://music.bugs.co.kr/track/6489549','SUMMER has collective vocals and external writers; alternate album page was unavailable, later event rosters are insufficient.','Seek SUMMER-specific member recording/shooting interview or original campaign captions.',extra=['https://music.bugs.co.kr/album/4151414'])
pending('recvxyH5pzFAPL','https://purplekiss.co.kr/tag/NaGoEun','Official index confirms English recording-behind and English concept posts; concept detail returned zero readable lines. Generic member tags include other members solo posts, so tags are not cast proof. Korean lyric credit and English guide recollections do not transfer.','Read exact English recording-behind TGbfk7AEIzk named captions when available; no repeated YouTube throttle requests.','exact_version_names_unavailable',extra=['https://purplekiss.co.kr/contents/68a81a0423389d55f67c6226'])
pending('recvxyHuKMisqR','https://music.bugs.co.kr/album/20421260','Exact iScreaM Vol10 catalog confirms the remix release but only collective aespa artist, without individually named participants.','Find Habstrakt exact-remix vocal/sample credits; original-song fan line distributions do not prove the remix.')
pending('recvxyHuKMiDs4','https://music.bugs.co.kr/track/32679154','Exact Girls BRLLNT remix lists aespa collective vocals and external creators, no individually named member.','Find BRLLNT remix production liner or original video production credits; do not rely on IMDb fan cast.')
pending('recvxyHuKMyy5i','https://www.qobuz.com/nz-en/album/iscream-vol26-spicy-remix-aespa-nitepunk/pf8ezgu7vr70a','Exact Spicy Nitepunk remix row lists aespa collective Vocals/MainArtist and external writers, no named members.','Seek Nitepunk sampling/session notes or exact video cast source.')
pending('recvxyHuKMBHQA','https://music.bugs.co.kr/track/111962112','Get Goin track credits aespa collectively and Dennis Lee/Philip Balsam as creators. Generic quartet story and short teaser are not full exact-upload cast proof.','Seek Apple/Henson full production cast or member-specific recording interview; keep teaser evidence limited.')
for wid,name in [('recvxyHuKMlGJW','Supernova Grimes'),('recvxyHuKMCSdB','Armageddon Flava D'),('recvxyHuKMwjsI','Supernova Grimes Other World video')]:
    pending(wid,'https://www.qobuz.com/us-en/album/iscream-vol33-supernova-armageddon-remixes-aespa/f4fvatzmvhiyb',f'{name}: exact release credits only aespa MainArtist and external remix/writing staff. Alternate video does not inherit original video cast or no-person status.','Seek exact remix sampled-vocal credits and separately the target-video production cast.')
pending('recvxyHuKMlAhN','https://www.qobuz.com/ie-en/album/rich-man-yellow-claw-remix-aespa/o5nfdsmwto1lc','Exact Yellow Claw row lists aespa collective MainArtist, external writers and remixer; generic original-album review is not remix cast evidence.','Seek Yellow Claw remix production/sample notes.')
for wid,url,version in [
    ('recvxyHuKMxwnW','https://www.qobuz.com/us-en/album/lemonade-zedd-remix-aespa-zedd/pajclg55nf2k7','Zedd'),
    ('recvxyHuKMlNfX','https://www.qobuz.com/at-de/album/lemonade-marlon-hoffstadt-remix-aespa-marlon-hoffstadt/tl4y9cv6e0oia','Marlon Hoffstadt'),
    ('recvxyHuKMLz7L','https://www.qobuz.com/us-en/album/lemonade-2spade-remix-aespa-2spade/wsxutoj0cnlae','2Spade')]:
    pending(wid,url,f'Exact LEMONADE {version} remix credits aespa collective vocals and external creators only. Other original/remix rows do not add named members.',f'Seek {version} exact-remix sampled vocal/session evidence; keep video-version cast distinct.')
pending('recvxyHuKMwrIt','https://sports.khan.co.kr/article/202608141659003/amp','Original MINIVE report names six character inspirations and confirms a BANG BANG MINIVE video. Character-to-member mapping proves neither individual recorded vocals nor real-person presence/absence.','Seek exact video production/animation credits or complete bounded viewing with named corroboration.','character_mapping_not_person_performance')
pending('recvxyOz5XFVzt','https://music.bugs.co.kr/artist/20047596?wl_ref=list_ab_04','New exact-title/member searches yield group OST and generic member discographies, no usable original individual recording evidence. Fan line-distribution names are not adopted.','Seek OST label full vocal session credits or member-specific Touchdown interview.','bounded_search_no_usable_named_source',False)
pending('recvxyOz5XsgVc','https://music.bugs.co.kr/album/20465227','Original OST introduction says seven-person NMIXX but does not name individuals; target Sprinkle Party and Hey Gabby are distinct tracks. Current six-member lineup cannot be inherited.','Seek historical seven-person named OST recording credits or exact Sprinkle Party behind.')
pending('recvxIZy35rUeY','https://music.bugs.co.kr/album/4150410','Little By Little exact title-track credits are external. VV lyrics belongs to another track, Im In Love Chinese Ver; do not transfer.','Seek exact Little By Little member interview/behind; do not use another album track role.')
pending('recvxIZy3525BF','https://music.bugs.co.kr/album/4154148','Gulliver exact song lists collective HITGS and external creators/chorus. VV Chinese solo/writing credit belongs to Ctrl C, a different track.','Seek exact Gulliver recording/filming participants; keep Ctrl C role separate.')
pending('recvxIZFpVLU0R','https://artist.mnetplus.world/main/stg/ifeye/tag/music','Official artist index confirms loverfory. Its detail link redirected to undefined/network-error; corrected artist route inaccessible. Secondary RAHEE-director claim cannot be verified against original description. YouTube route previously throttled and stopped.','Seek accessible official release post or production credits to confirm RAHEE scope; do not copy six-person generic roster.','source_access_or_primary_proof_missing',True,
        ['https://artist.mnetplus.world/main/stg/undefined/contents/6ab4ae6abc67d615d9edae11','https://artist.mnetplus.world/main/stg/ifeye/contents/6ab4ae6abc67d615d9edae11'])

assert len(specs)==11 and len(unresolved)==24
assert {r['workId'] for r in specs+unresolved}==set(by_work) and len(specs+unresolved)==len(by_work)
credits=[]; recognition=[]; assets=[]; research=[]
tracer={r['recordId']:r for r in read(APP/'docs/artist-evidence/tracer-review-20261024.json')['members']}
for s in specs:
    w=by_work[s['workId']]
    r={k:s[k] for k in ['workId','kind','memberIds','label','note','sourceUrl','sourceTitle','supportingUrls']}
    r.update(videoId=w['videoId'],groupId=w['groupId'],checkedAt='2026-10-28',evidence='Limited named public evidence only, not exhaustive MV cast or private relations. Scope: docs/codex/evidence/20261028-post-v200/people/research.json.')
    credits.append(r); portraits=[]
    for mid in s['memberIds']:
        if mid in tracer:
            a=tracer[mid]; path=APP/'public/artist/tracer/review-20261024'/f"{a['slug']}.original.png"
            width,height=struct.unpack('>II',path.read_bytes()[16:24]); h=height//4*4; cw=h//4*3
            p=dict(memberId=mid,src='/' + path.relative_to(APP/'public').as_posix(),width=width,height=height,sourceUrl=a['sourceUrl'],
                   sourceImageUrl=a['imageUrl'],photoKind='portrait_photo',photoSetId=s['series'],objectPosition='50% 50%',
                   sourceCrop=dict(x=(width-cw)//2,y=0,width=cw,height=h))
        else:
            candidates=[r for r in media if r['memberId']==mid and r.get('photoSetId')==s['series']]
            candidates += [p for r in baseline_r['records'] for p in r['portraits'] if p['memberId']==mid and p.get('photoSetId')==s['series']]
            assert candidates,(mid,s['series'])
            p=copy.deepcopy(candidates[-1]); p.pop('workId',None);p.pop('videoId',None)
            path=APP/'public'/p['src'].lstrip('/')
        digest=sha(path)
        if p.get('sha256'): assert p['sha256']==digest
        p.update(sha256=digest,label='既有同系列照片 · 认人参考',workAssociation='recognition_reference',
                 note='复用已审具名同系列完整原图，仅帮助辨认本条公开资料人物；不证明本视频出镜、造型或拍摄同期。')
        portraits.append(p)
        assets.append(dict(workId=w['workId'],memberId=mid,src=p['src'],sha256=digest,bytes=path.stat().st_size,photoSetId=s['series'],newFile=False,
                           freshVisualReview=mid in tracer,sourceCrop=p['sourceCrop']))
    recognition.append(dict(workId=w['workId'],videoId=w['videoId'],groupId=w['groupId'],portraits=portraits))
    research.append(dict(workId=w['workId'],videoId=w['videoId'],groupId=w['groupId'],song=w['song'],disposition='adopted_scoped_public_reference',
                         category=s['kind'],scope=s['label'],memberIds=s['memberIds'],memberNames=s['memberNames'],
                         sources=[dict(url=s['sourceUrl'],title=s['sourceTitle'],bodyRead=True,facts=s['facts'])],supportingUrls=s['supportingUrls'],
                         nextRoute='Exact target-video individual appearances and audio roles still need separate evidence; do not convert these public references into private rating relationships.',
                         fullPlayback=False,individualAudioComparison=False,privateRelationsCreated=0,newImageFiles=0))
for s in unresolved:
    w=by_work[s['workId']]
    research.append(dict(workId=w['workId'],videoId=w['videoId'],groupId=w['groupId'],song=w['song'],disposition='not_adopted_evidence_insufficient',
                         category=s['category'],finding=s['finding'],nextRoute=s['nextRoute'],
                         sources=[dict(url=s['sourceUrl'],bodyRead=s['bodyRead'])],supportingUrls=s['supportingUrls'],
                         proposedMemberIds=[],fullPlayback=False,individualAudioComparison=False,notFullWebExhaustion=True))
research.sort(key=lambda r:list(by_work).index(r['workId']))
baseline=dict(creditsFileSha256=sha(APP/'data/public-work-credits.json'),recognitionFileSha256=sha(APP/'data/public-work-recognition.json'),
              creditsRecordsSemanticSha256=semantic(baseline_c['records']),recognitionRecordsSemanticSha256=semantic(baseline_r['records']),
              protectedFiles={n:sha(APP/'data'/n) for n in ['mv-public-media.json','mv-member-appearance.json']})
write(OUT/'baseline.json',baseline)
write(OUT/'research.json',dict(schemaVersion=1,checkedAt=datetime.now(timezone.utc).isoformat(),baseline='c023153 / v200',
                             reviewedWorks=35,adoptedWorks=11,unresolvedWorks=24,fullWebExhaustion=False,
                             sourceMethod='Public source page bodies and bounded web queries; one ordinary public NewsPim HTTP read after timeouts. No Chrome or private session.',
                             copyrightScope='Brief facts/paraphrases only; full source articles and lyrics not stored.',records=research))
write(OUT/'public-work-credits.delta.json',dict(records=credits))
write(OUT/'public-work-recognition.delta.json',dict(records=recognition))
write(OUT/'asset-verification.json',dict(slots=len(assets),uniqueOriginals=len({a['src'] for a in assets}),newImageFiles=0,records=assets))
for stem,base,delta in [('public-work-credits',baseline_c,credits),('public-work-recognition',baseline_r,recognition)]:
    target=APP/'data'/f'{stem}.json'
    out={**base,'records':base['records']+delta}
    assert out['records'][:91]==base['records']
    write(target,out)
for n,digest in baseline['protectedFiles'].items(): assert sha(APP/'data'/n)==digest
all_r=baseline_r['records']+recognition
write(OUT/'adoption.json',dict(status='local_only_user_requested_no_new_publication',baselineWorks=91,baselineSlots=488,
                             addedWorks=len(credits),addedSlots=sum(len(r['portraits']) for r in recognition),
                             publicCreditWorks=102,publicRecognitionSlots=sum(len(r['portraits']) for r in all_r),
                             uniqueExistingOriginalFiles=len({p['src'] for r in all_r for p in r['portraits']}),
                             remainingPersonWorks=24,old91ObjectsUnchanged=True,privateWrites=0,privateRelationsAdded=0,
                             newImageFiles=0,absenceRulesChanged=0,published=False,committed=False))
print(json.dumps(read(OUT/'adoption.json')))
