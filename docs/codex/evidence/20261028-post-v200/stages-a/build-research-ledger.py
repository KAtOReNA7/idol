"""Build bounded public stage research; never edits application or bindings."""
import json
from pathlib import Path
from datetime import datetime, timezone
from collections import Counter

ROOT = Path(__file__).resolve().parents[5]
OUT = Path(__file__).resolve().parent
QUEUE = ROOT / 'docs/codex/evidence/20261028-v200/remaining-stage-ledger.json'
queue = json.loads(QUEUE.read_text(encoding='utf-8'))
queries = json.loads((OUT / 'query-ledger.json').read_text(encoding='utf-8'))['queries']
prior_a = json.loads((ROOT / 'docs/codex/evidence/20261028-stage-fill/research-a.json').read_text(encoding='utf-8'))
prior_b = json.loads((ROOT / 'docs/codex/evidence/20261028-stage-fill/research-b.json').read_text(encoding='utf-8'))
priors = {r['workId']: r for r in prior_a['records'] + prior_b['records']}

notes = {
1: 'YG原始新闻6435只证实2024年11月曾计划三曲打歌，不证明Love In My Heart已有完整节目片源；6582为巡演，6698表演视频对应BILLIONAIRE。保留目标缺口。',
2: '新检索的M Countdown首秀报道明确实际表演I DO ME，DEBUT SONG只是VCR蛋糕情境引用。不能把搜索共现当同曲节目。',
3: '新检索的DOPAMINE Performance MV即原作品PYEOubLoXDo；MADEIN视频目录区分DADARIDA另有CHOREO，未找到DOPAMINE独立官方完整后备。不重复用原MV制造舞台。',
4: '新规则允许官方专门表演后备。Gm0apElS0sY与原kLd8bHVpUUw在同MADEIN频道、同月发布；Bugs授权DADARIDA条目明确02:52，174秒CHOREO支持整曲范围，旧布景排除理由不再适用。资料支持候选提交主代理，未全片播放或音轨逐句比对。',
5: '补强既有两曲LIVE CLIP PkEl_Z9B2y4的官方Weverse3-188265753发布证据；它已在旧只读线索中，不能算新发现或重复导入。准确FAKE IDOL章节边界及真实录制场合未证。拒绝ID l9GLV8Kd-MU保持；缩略图TLS EOF及watch读取失败分别留证。',
6: 'Weverse3-189987080明确Full ver，4-189811246是Special Video #2；Full ver仍是原作品本身，不是独立新表演，分段视频也不补完整舞台。',
7: '新检索仍为合作MV、节庆记录与原POSSE UP!的同名误配。既有tx9GAZpxo0w只有152秒、原合作MV201秒；新后备类型授权不消除合作段落/完整范围缺口。',
8: 'TOP MEDIA原始Multimedia页明确2025-01-15发布Best Friendz English Ver Performance Video。该证据支持排除把英语候选无标识绑定原Brand MV；原Brand音轨与候选的差异仍待听辨。',
9: '新检索找到本人采访推荐的是Scars performance video，并非ROTY；ROTY的演唱会/活动记录不采用。',
10: 'SM Brand Marketing案例196与KBS报道确认Teenieping合作范围，但未证与普通STYLE舞台音轨完全相同。保留版本核对，不能单凭合作名或相近时长采用。',
11: '新增Moonride检索结果为Kia原MV/流媒体及另一首ICONIC HEART的节目信息，没有取得目标完整独立表演。',
12: '授权发行目录把FOCUS DJ Seinfeld Remix作为独立混音，Qobuz/Spotify资料有约2:32条目；普通FOCUS节目或练习不可覆盖指定混音。',
13: '官方Special Video仍为原LIT RIGHT NOW作品；新采访谈及创作和练习生时期，不证明独立完整表演。KCON与巡演仍排除。',
14: 'Weverse Magazine1789讨论PRESS START巡演舞台与little monster造型，不能转作官方练习室证据。',
15: 'YG7068的dance practice关键词对应TREASURE Everything，7327/7326是本曲MV发布，年末舞台计划也非已取得普通打歌片源。',
16: 'ILLIT日本官网c2ac32af70b6明确8RvWZDUYg-g为应援法；新检索的表演描述是原MV中餐厅表演情境，不是独立后备。',
17: 'Weverse Magazine1789明确NOT ME在PRESS START巡演首次演出；镜像所谓practice不能消除此场合证据。',
18: '公开授权发行明确Kylie Cantrall与YUNAH/MINJU二人合作；新找到CKrNx6NN-NM和emaDhlvz8BY均Provided to YouTube音频，不是同合作范围表演影像。',
19: 'YG7581/7582/7580记录Ghost在京瓷巨蛋巡演；6808的FIRST TAKE对应DRIP，Ghost只是同文OST消息，不能误配。',
20: '新来源均指Painting Special Video（原MV）或KISS ROAD演唱会首播记录；未取得独立官方完整表演。',
21: 'izna日本官网MOVIE明确Love All为Lyric Video；邻接的Special Performance属于SASS & Racecar，不能串行误读为Love All表演。',
22: 'INCODE日本公告3287确认4月11日日语版独立发行；Hitomi/Mei电视片段不是整团完整同版；普通韩语练习不迁移。',
23: 'OTOTOY日本发行报道确认Japan Edition与韩版同时发行且歌词语言有差异；官方Qfez0Db9Iqc Costume491秒仍需实际单曲边界和场合。SUMMER SONIC日本首演属于活动，不采用。',
24: '新定位tripleS官方SIGNAL cRJdPN6X0IY及Gj-CYY2R0Vk，题名分别为表演讨论/舞蹈课；不能视为原分队完整同混音表演。Cherry Talk Special Performance是另一首歌。',
25: 'Apple Music6772121264等证实Baby Flower Japanese独立发行；粉丝档案中Music Bank260612仍不能证明是日语音轨，韩版练习不替代。',
26: '已纠正官网路线，Sony584980和triples-wav官方专题证实moon日本原曲；专题的Special Movie为会员内容未进入。未取得公开完整表演，Objekt活动不采用。',
27: '使用正确triples-wav官网检索，结果为Password MV Shooting图库及粉丝见面会；没有原官方练习页支持镜像LHnxtmJkytQ的出处。',
28: '正确triples-wav官网有sun DNA发行专题及Unit Photo；没有证实镜像CnS1nUqfNZc原官方练习出处。Objekt活动不作为普通舞台。',
29: 'Sony586674明确neptune日本原曲发布及Objekt活动；Special Visual Clip即原视频，Andless Performance属于另一首歌/演唱会，不能补本曲。',
30: '官方Weverse Highlight把Milky Way列为MV，Performance Video Behind及节目幕后相邻条目属于Sky Land, Star Land，不能混配。',
31: 'QWER Weverse Band Practice条目对应CEREMONY，Our Voyage仍为原MV及巡演/节庆；没有取得本曲合规独立表演。',
32: 'YOUNG POSSE日本官网MV索引列出I know，Genie/Qobuz明确SUNHYE与JIEUN二人；未取得两人同曲完整节目/后备表演。',
33: 'NTV原始20260821节目页明确把QWER SHOW DOWN列入Studio Live，补强了真实节目类型与确切日期；页面仅给主嘉宾访谈TVer链接，未给目标完整视频。旧NTmQzjUchPU为转载，完整范围仍未证。',
34: '官方日本站列出2026-07-26 Pilot2 MV；其他检索为反应视频/授权音频/活动，未取得同曲独立官方表演。',
35: '新检索kawa仍为DOEUN/JIANA原MV及mixtape发行信息，没有可靠完整二人表演影像；不以全团演出代替。',
36: '新检索显示Mr2026为东京演唱会开场，Live Nation路线也是巡演；没有取得普通节目或完整官方后备。',
37: 'XGALX1130383确认4 SEASONS主唱分队歌曲，1130530为幕后；Music Station SuperLive排期并未把本曲指派到节目，巡演不采用。',
38: 'XGALX1120313直接发布IYKYK Choreography并嵌入mU8adPiwpm4，同时链接原MV QiYOkmrI1jg及同一AWE单曲；官方专门表演的新政策适用。187秒视频与Bugs授权03:00单曲支持完整资料范围，未逐句听辨。',
39: '官方站没有检索到IN THE RAIN Choreography/Rehearsal原页；旧镜像及巡演全景不转成官方后备，保持原出处待证。',
40: '精确O.R.B官方站Choreography查询为空；原MV、THE CORE巡演和FUJI ROCK不作为合规替代。空结果不证明表演不存在。',
41: '官方SBS已有合规节目，但原特殊歌词版本和候选实际歌词仍未完成比对；新允许表演后备不解决版本冲突。',
42: '新检索多源具体指向WXW:WICKED粉丝演唱会，未取得独立官方普通节目/练习/专门表演；活动不采用。',
43: '新精确检索得到ifeye原loverfory MV、幕后及Mainz/Coex活动，没有取得独立完整官方表演；不把索引中其他歌表演视为目标。',
44: '同曲检索仍无Zoe单人66秒互动范围对应的完整官方表演；全团I.L.Y和其他成员版本不可代替。',
45: '同曲检索仍无Sion单人66秒互动范围对应的完整官方表演；全团I.L.Y和其他成员版本不可代替。',
46: '同曲检索仍无Yeyoung单人66秒互动范围对应的完整官方表演；全团I.L.Y和其他成员版本不可代替。',
47: '同曲检索仍无Andamiro单人66秒互动范围对应的完整官方表演；全团I.L.Y和其他成员版本不可代替。',
48: '同曲检索仍无Mika单人66秒互动范围对应的完整官方表演；全团I.L.Y和其他成员版本不可代替。',
49: 'KATSEYE官方Videos目录的Performance/Practice为Gabriela/Gnarly，Gameboy有MV和音频变速/混音。官方Weverse28479还明确Gabriela表演缺Manon，不能借邻接条目假定本曲或全员。',
50: '新精确检索Gulliver!仍为原MV，Performance Video关键词来自同页其他艺人或SOURPATCH；没有目标独立完整官方后备。',
51: '新检索Cherry Blossom Performance得到专辑发行页和IYOO Taste表演邻接项；不是本曲完整表演，不扩大成员或歌曲范围。',
52: '新检索Little By Little Performance的匹配词来自其他歌/艺术家；此前棒球场表演属活动，不采用。',
53: 'PURPLE KISS官方OFFICIAL_VIDEO分类明确Breath MV、DOREMI Performance和巡演Spoiler为不同条目；Breath没有由本次搜索取得独立后备。',
54: '新增具体节目路线：Lemino let me Know K-POP! S1E4、2023-05-18，GGuide重播表与Kstyle2220632均明确三首日本原曲中包含ドキドキLOVE。aw2hcpeRd08只是预告，未取得完整第一方单曲或合法可用节目章节。',
55: '新报道证实2019-06-01 NHK ShibuyaNote曾表演Buenos Aires；检索镜像1hCTF-tw2rA非官方。报道存在不等于当前完整版权方视频可用。',
56: 'PURPLE KISS官网明确English MV与English Recording Behind，另有未标English的DOREMI MV Performance；不能用后者标题推定英文。未重试已受限的原MV。',
}

legacy_notes = {
0: 'Weverse官方Performance查询没有解决原el7A_SI7sxs60秒与完整发行/打歌148秒范围差。原作品稳定ID不改，不把完整后备当同范围。',
1: '新Performance检索仍无完整Strawberry Cheesegame独立第一方影像；旧MIC DRIVE只有53秒章节及MBC年末串烧不足，不能因后备类型放宽忽略节选。',
2: 'Bugs/Melon官方授权目录把Switchblade MV与WDA Performance分列；搜索共现不构成Switchblade独立表演。原合作Ty Dolla $ign范围保护继续。',
3: '新发行报道及IVE官方MV仍指fyk6vjwI3wc，未取得可对齐原154秒版本的独立表演；DavidGuetta歌词视频198秒不是舞台。',
4: '新clean查询没有给xrm7PP1mbtI练习室与原Gnarly显式/clean音轨等同证据。旧147秒官方练习可保留候选，但须听辨，不能仅凭同题名采用。',
5: 'XGALX索引的XTRA #70为宣传幕后，没有完整单曲边界；旧CDTV9U3MPAYIZ0g已到期/受限，本轮不重试或绕过。',
6: '新报道确认两支Cool With You练习，但每支不含完整Get Up；原sideB为连续两曲。MMA611秒练习仍未证不改编连续完整双曲章节。',
7: '新检索官方授权视频目录确认Live My Life仅原MV，邻接Performance属于Armageddon等其他曲。Universe120秒仍短于整曲，tour behind926秒未有完整章节。',
8: 'IVE/Sony官方新闻重新确认CRUSH为ALIVE日本原曲；MV中的四场景舞蹈是原视频，不是独立后备。with MUSIC串烧与Venue101仍缺当前完整原片。',
9: '新增TV Asahi原始文章post-218906确认2023-05-26Music Station WAVE且说明日本原创曲；文章没有完整表演视频，也不能仅以六人团介绍证明REI实际出演。',
10: 'XGALX索引仍是MILLION PLACES巡演影像与宣传幕后；到期CDTVa8WdF6QdfFc不重试，MusicStation原档完整片源仍未取得。',
}

candidate_ids = {4:'Gm0apElS0sY',38:'mU8adPiwpm4'}
records=[]
for i,r in enumerate(queue['records'][:56],1):
    old=priors[r['workId']]
    qs=[q for q in queries if i in q.get('n',[])]
    records.append({'queue':'new_gap','position1Based':i,'workId':r['workId'],'artist':r['artist'],'song':r['song'],
        'originalMv':old['originalMv'],'originalVersion':old.get('originalVersion','See exact original title and baseline ledger'),
        'priorEvidenceFile':r['priorEvidenceFile'],'priorReason':r['reason'],'queryIds':[q['id'] for q in qs],
        'sourceUrls':list(dict.fromkeys(s['url'] for q in qs for s in q['results'])),
        'finding':notes[i],'status':'official_performance_documentary_candidate' if i in candidate_ids else 'unresolved_after_bounded_research',
        'candidateVideoId':candidate_ids.get(i),'fixedCamera':'unknown','fullPlaybackVerified':False,'actualAudioComparison':False,
        'absenceClaim':False,'bindingChanged':False,'privateDataRead':False})
for i,r in enumerate(queue['legacyReplacementsRemaining']):
    qs=[q for q in queries if i in q.get('legacy',[])]
    records.append({'queue':'legacy_replacement','legacyIndex0Based':i,'workId':r['recordId'],'artist':r['group'],'song':r['song'],
        'originalMv':r['original'],'originalVersion':r['version'],'previousSelectionVideoId':r['previousSelection']['videoId'],
        'priorEvidenceFile':'docs/codex/evidence/20261028-v200/remaining-stage-ledger.json','priorReason':r['reason'],
        'queryIds':[q['id'] for q in qs],'sourceUrls':list(dict.fromkeys(s['url'] for q in qs for s in q['results'])),
        'finding':legacy_notes[i],'status':'unresolved_after_bounded_research','candidateVideoId':None,
        'fixedCamera':'unknown','fullPlaybackVerified':False,'actualAudioComparison':False,'absenceClaim':False,'bindingChanged':False,'privateDataRead':False})

ca=priors['rec28ldfRTrCzF']['candidatePageEvidence'][0]
cb=next(x for x in prior_b['firstPartyWatchMetadata'] if x['videoId']=='mU8adPiwpm4')
candidates=[
 {'workId':'rec28ldfRTrCzF','artist':'MADEIN','song':'DADARIDA','videoId':'Gm0apElS0sY','url':'https://www.youtube.com/watch?v=Gm0apElS0sY','title':'MADEIN - "DADARIDA" CHOREO Ver','channel':'MADEIN','channelId':'UCQZy15R31id90AlisaiOg2Q','type':'official_performance','occasion':'dedicated_choreography_video','durationSeconds':174,'originalVideoId':'kLd8bHVpUUw','originalDurationSeconds':184,'catalogDurationSeconds':172,'catalogEvidence':{'url':'https://music.bugs.co.kr/track/33284474?wl_ref=list_tr_08','queryId':'04e','ref':'turn621431search2','access':'search_service_index; direct GET later403 and stopped'},'previousFirstPartyWatch':ca,'documentaryBasis':'Same exact artist channel, song title, same October2024 release campaign, full licensed172second song versus174second choreography upload; no language/remix/excerpt label. This supports documentary candidate scope, not an audio equality test.','fixedCamera':'unknown','sourceFreshnessNote':'Watch snapshot05:29Z is prior evidence; current search-tool watch open failed, so no claim of fresh playability/like verification.'},
 {'workId':'recvxDMFHNHFyM','artist':'XG','song':'IYKYK','videoId':'mU8adPiwpm4','url':'https://www.youtube.com/watch?v=mU8adPiwpm4','title':'XG - IYKYK (Choreography)','channel':'XG','channelId':'UC12HMtO5MYph9dCZZ7yygng','type':'official_performance','occasion':'dedicated_choreography_video','durationSeconds':187,'originalVideoId':'QiYOkmrI1jg','originalDurationSeconds':189,'catalogDurationSeconds':180,'catalogEvidence':{'url':'https://music.bugs.co.kr/album/20675990?wl_ref=list_ab_01_ar','queryId':'38e','ref':'turn851871search1','access':'search_service_index'},'artistArticle':'https://xgalx.com/en/xg/news/detail.php?id=1120313','artistArticleReadReceipt':'first-party-candidate-reads.json','previousFirstPartyWatch':cb,'documentaryBasis':'Current first-party XGALX article embeds exact choreography ID and directly links original MV, same AWE single and2024-10-11 release.187second video versus licensed180second song; dedicated full title without language/remix/excerpt modifier.','fixedCamera':'unknown','sourceFreshnessNote':'Current artist article HTTP200; watch snapshot05:29Z is prior evidence. Current search-tool watch open failed, not proof the video is inaccessible in a normal player.'}
]
for c in candidates:
    c.update({'status':'submit_for_parent_adoption_checks','notYetAdopted':True,'requiresFreshOwnerValidation':True,
              'fullPlaybackVerified':False,'actualAudioComparison':False,'individualParticipantAppearanceVerified':False,
              'liveVocalClaim':False,'likeComparisonExhaustive':False,'bindingChanged':False,
              'adoptionChecks':['Current exact first-party video metadata/playability and source ID','Fresh owner null-score including0-not-empty, original full source value, complete save log checks','Preserve precise source and historical binding; disclose documentary-only full-song verification','Do not label choreography as practice room or infer fixed camera']})

policy={'priority':['ordinary_music_show','official_complete_practice_fixed_camera_preferred','official_complete_dedicated_performance_fallback'],
        'excluded':['concert','tour','festival','commercial_or_fan_event','unverified_mirror','single_member_focus_for_group_target','other_language_or_remix','unverified_excerpt'],
        'reference':'docs/codex/stage-selection-policy-20261028.md','freshPolicyApplied':True}
out={'schemaVersion':1,'checkedAt':datetime.now(timezone.utc).isoformat(),'baselineCommit':'c023153','scope':'56 first new gaps +11 legacy replacements; public evidence only; no app/binding/private mutations',
     'policy':policy,'summary':{'records':len(records),'newGaps':56,'legacyReplacements':11,'queries':len(queries),'emptySearches':sum(q['emptyResult'] for q in queries),
         'documentaryCandidates':len(candidates),'unresolvedResearchRecords':sum(x['status']=='unresolved_after_bounded_research' for x in records),'adopted':0},
     'records':records,'limitations':['Bounded search does not establish absence; artist/program indexes are not exhaustive','Official article/date/type and catalog duration support documented scope but are not complete playback or per-line audio comparison','Member appearance not inferred from recording credits','No expired/private video or membership/region restriction bypass','No user Chrome or personal data access','Individual query source lists include rejected/noisy search results; findings state their actual evidentiary use']}
(OUT/'research-ledger.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(OUT/'candidates.json').write_text(json.dumps({'schemaVersion':1,'policy':policy,'candidates':candidates},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
assert len(records)==67 and len({(r['queue'],r['workId']) for r in records})==67
assert all(r['queryIds'] for r in records)
assert set(notes)==set(range(1,57)) and set(legacy_notes)==set(range(11))
assert all(not r['bindingChanged'] and not r['privateDataRead'] and not r['fullPlaybackVerified'] for r in records)
assert {r['candidateVideoId'] for r in records if r['candidateVideoId']}=={'Gm0apElS0sY','mU8adPiwpm4'}
validation={'status':'passed','uniqueResearchRecords':67,'queryCount':len(queries),'newGapCoverage':'56/56','legacyCoverage':'11/11','duplicateRecords':0,'missingQueryReferences':0,'adopted':0,'privateReads':0,'privateWrites':0,'appWrites':0,'fullPlaybackClaims':0,'audioEqualityClaims':0,'fixedCameraClaims':0}
(OUT/'validation.json').write_text(json.dumps(validation,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(validation,ensure_ascii=False))
