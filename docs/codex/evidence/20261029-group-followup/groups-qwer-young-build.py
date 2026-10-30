"""Write this researcher's public-source follow-up ledger; never writes application data."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
GROUPS = ['QWER','Rocket Punch','SAY MY NAME','STAYC','tripleS','UNIS','VVUP','Weeekly','WOOAH','XG','YOUNG POSSE']
SOURCES = {}
def source(key, url, method, result):
    SOURCES[key] = dict(url=url, method=method, result=result)

source('qwer-live','https://weverse.io/qwer/media/3-188265753','web.open official media page; exact title research','官方仍标两曲 LIVE CLIP；可读页没有精确 FAKE IDOL 章节及拍摄场合，不能凭总标题将其设为独立合格舞台。')
source('qwer-our','https://k-sarangbang.com/zh/kpop/groups/qwer/','web.search new catalog lead; secondary only','曲目目录命中 Our Voyage MV；Band Practice 邻项不是本曲。本次未取得同曲完整第一方练习／制作表演。')
source('qwer-show','https://www.ntv.co.jp/buzzrhythm/oa/20260821.html','web.search and web.open official broadcaster','NTV 该期 Studio Live 列 QWER SHOW DOWN；正文确认演出场合，但没有可验证的完整官方单曲视频或章节。这是既有场合证据复核，不是新采用。')
source('rocket','https://bangumi.org/tv_events/AmHAEJgt4AE','web.search broadcaster-program listing','BSよしもと再播条目列 Rocket Punch 三曲，含ドキドキLOVE，时长一小时节目；没有完整曲目章节或可直接采用的视频。')
source('rocket-report','https://thetv.jp/news/detail/1138918/p2/','web.search original program report','节目报道确认ドキドキLOVE在球类游戏前表演，未取得第一方完整回放。旧 Lemino 预告仍不能作全曲。')
source('shalala','https://www.dle.jp/jp/news/k-/3519.html','web.search and web.open rights-holder announcement','动画制作方确认日语 ShaLala 为ぽちゃーズ主题曲并关联既有 MV；HITOMI／MEI 声优及动画片尾信息不证明全团同曲完整表演。')
source('lit','https://www.highup-ent.com/en/stayc-brings-positive-energy-on-stage-with-open-concert-from-bubble-to-teddy-bear-hoping-fans-will-enjoy-together/','web.search official label report','报道的 Open Concert 曲目为 Bubble／Teddy Bear，LIT 只是另述发行；不能把相邻标题解释成 LIT 日文节目舞台。')
source('mwuah','https://www.youtube.com/watch?v=3LGQGtnxEEg','web.search official channel indexed description; not full playback','STAYC Japan 官方说明明确来源于 2026-02-10 KT Zepp Yokohama STAY ALIVE Showcase LIVE 彩排；不能改称练习室或专门棚拍表演。旧候选不重复导入。')
source('meow','https://www.universal-music.co.jp/stayc/news/2024-08-05/','web.search and web.open official label','MEOW 的新曲表演来源是日本各地发行纪念活动；属于活动，且未附完整正式表演视频。不是常规电视打歌。')
source('teddy','https://www.highup-ent.com/en/stayc-lights-up-the-atmosphere-at-japan-chiba-lotte-marines-home-game-with-a-special-teddy-bear-performance/','web.search official label','官方报道指 2023-07-17 千叶球场特别表演，属体育活动，不作为普通打歌；正文也不能证明目标日文完整音轨。')
source('teddy-variety','https://thetv.jp/news/detail/1133327/','web.search original TV report','TV Asahi 视频频道报道为 Seeun／Sieun 舞蹈教学等综艺环节，不证明全团日文全曲。')
source('cherry','https://www.bilibili.com/video/BV1vS411F71x/','web.search secondary index only','合集区分 Cherry Gene Visualizer、Cherry Talk Special Clip 与 Invincible Special Performance；名称相邻不构成本混音的完整 Acid Eyes 舞台。未用转载闭项。')
source('baby','https://kprofiles.com/forums/threads/triples-official-thread-full-group.44558/page-9','web.search secondary index as lead','索引将 Japanese MV 与后续 Suit Dance／Store Link Live 分开列出；两条后备表演未标 Japanese，不能以日本版发行日期邻近来继承语种。')
source('baby-catalog','https://kpopdiscover.com/ja/groups/triples/videos/mv/','web.search secondary catalog only','日本作品过滤仍列 Japanese MV；无本轮新取得的同语种独立舞台第一方证据。普通韩文舞台不移用于此行。')
source('dream','https://www.thefirsttimes.jp/news/0000891019/','web.search label-affiliated release reporting','日本 LOVE&POP 分队发行报道及 Objekt 活动不证明 Dream Dress 的完整官方练习／独立制作表演；旧 member-only Special Movie 未读取。')
source('password','https://asiapoisk.com/music/tripleS/videos','web.search secondary catalog lead','目录中的 Password 属 MV；Dance Practice 对应 Tokimetique／Untitled 等其他歌。未取得 Password 原始官方练习来源，旧转载不升级。')
source('dna','https://triplesfans.com/members/yooyeon?lang=ja','web.search secondary catalog lead','目录明确区分 DNA special visual clip 与 Bubble Gum Girl official performance；不能用后一曲或原 visual clip 充当 DNA 新舞台。')
source('heaven','https://triples-wav.jp/s/sss/page/rl_lovepop_pt3_neptune?ima=3738','web.search official special page','Neptune 官方专题可读部分为发行／visual clip；Special Movie／Gallery 标 WAV ONLY。未读取会员内容，也未据此推断完整舞台存在。')
source('unis','https://weverse.io/unis/highlight','web.search official current media directory','当前目录将 Milky Way Official M/V 与 하늘땅 별땅 Performance Video 幕后分别列出；后者不是 Milky Way，不能挪用。')
source('vvup','https://weverse.io/vvup/media/3-189987080?hl=ko','web.search and web.open official media','读回 4 Life Special Video (Full ver.) 原作品页面；它没有证明另一个独立舞台，不能将原视频再计为新增。')
source('weeekly-top','https://www.dojeonmedia.com/post/omg-i-had-the-best-time-at-the-weeekly-concert-2024-weeekly-grand-america-concert-review-amaz','web.search original concert report','本轮 Top Secret LIVE 新路线仍命中美国巡演曲单；演唱会不作为本队列常规打歌／练习后备。')
source('weeekly-christmas','https://world.kbs.co.kr/service/program_playlist_view.htm?bbs=wh_hyerim_playlist&lang=e&no=49404&procode=wh_hyerim','web.search official broadcaster playlist','2025-12-24 节目中 Happy Christmas 是普通播歌项目；LIVE 标识属于 NVee／Kate Kim，不能挪到 Weeekly。')
source('weeekly-live','https://weverse.io/weeekly/live/3-119903139?hl=ko','web.search official live-directory context','邻接导航出现 Happy Christmas 直播名称，但本页是 2023-05-25 另一场；导航不能证明目标完整专门表演。')
source('weeekly-love','https://idolworld.co.kr/bbs/board.php?bo_table=e_story&wr_id=138530','web.search secondary post tracing exact original ID','正文指向 Love 原 MV VACXoKdmofo 与复古宣传图文，未提供独立全团同曲舞台。KBS 关键词命中别人的歌／成员二人其他曲不采用。')
source('wooah-voodoo','https://popga.co.kr/en/popup/10148','web.search concert organizer-derived listing','VOODOO DOLL 本轮命中为 2026-10-03 WICKED fan concert 首演信息；官方或组织方活动身份不使其变为普通打歌。')
source('wooah-summer-behind','https://www.youtube.com/watch?v=1cZvvuw29s8','web.search official artist channel metadata; direct web.open throttled','新增线索：官方艺人频道 2026-07-23 发布 SUMMER MV BEHIND THE SCENES。搜索可读标题／日期，未给逐名字幕；直接页 Online fetch throttled 后停止该路线，未播放／识脸／提取字幕。')
source('wooah-sideb','https://www.youtube.com/watch?v=2GNJuBVCz5E','web.search Koreanet official indexed description','Koreanet 发布 Shining on you (Side B) with WOOAH；描述为回馈粉丝的 Side B，未称 Performance。不能仅凭制作方身份视作独立表演。')
source('wooah-sideb-culture','https://hk.korean-culture.org/hk/932/board/676/read/131130','web.search official culture center body; web.open redirect loop','文化院索引正文明确标 MV Version (Side B)，支持保留原 MV 版本属性；直接页重定向循环未继续绕行。不作为合格舞台。')
source('wooah-wxw','https://music.bugs.co.kr/track/6464766?wl_ref=list_tr_08','web.search licensed song credits','Bugs 将演唱和作词成员统一写 WOOAH，其他作者具名；没有把团名展开成五个个人。百科／博客声称全员作词未取得对应逐名登记原件。')
source('wooah-wxw-stage','https://ww1.twstalker.com/WOOAH_HM','web.search official-account repost mirror, secondary only','当前可见内容为 WXW 发行签售／fan concert 宣传，不是可直接采用的同曲完整节目或独立制作表演；不据此认定曲目参与者。')
source('wooah-summer-promo','https://workingww.twstalker.com/WOOAH_HM/status/2075142926812774453','web.open secondary mirror; original URL attempted separately','镜像留有 SUMMER／Wish With W Vol.3 的 NANA 具名 concept photo 文案。仅是待追原宣传来源，不推定录音或 MV 出镜。')
source('wooah-summer-original','https://x.com/WOOAH_HM/status/2075142926812774453','web.open original account status','原始 X 返回 403，停止该源路线；另一个 #1 原帖 2074780543791562849 返回 0 行。未将镜像当原件已核。')
source('xg-four','https://xgalx.com/xg/news/detail.php?id=1130431','web.search official label','官方 4 SEASONS 发布页仍为 Official Music Video；该原 MV 不可重复作为新舞台。声乐分队范围不扩成全团。')
source('xg-rain','https://xgalx.com/en/xg/news/detail.php?id=1124078','web.search and web.open official label','发行方把 IN THE RAIN 原曲、x XDM 与 Instrumental 分列，并说明 XDM 改编。新检索仍未获原编配完整独立表演，不能把 XDM 或广告混音移入。')
source('xg-orb','https://xgalx.com/en/xg/news/detail.php?id=1130382','web.search official label tracklist','原唱片曲单可确认 O.R.B 身份，但不证明舞台。独立摄影师相关线索将 O.R.B 标 MV、NO GOOD 标 Performance，不能把后一曲误用。')
source('xg-rock','https://programs.sbs.co.kr/enter/gayo/clip/54768/OC477948996','web.search official broadcaster indexed page','确认 SBS Inkigayo 2026-02-01 本放曲 ROCK THE BOAT；搜索正文提示购买内容。未购买或绕过；目标与节目 clean／explicit 逐句仍未核，不把版本匹配设 true。')
source('xg-fullcam','https://m.sbs.co.kr/search/allSearchList.do?query=XG','web.search official broadcaster directory','目录新增可追踪 FullCam（2026-02-04）和本放（2026-02-01），属于同一次节目；尚无本轮完整播放／逐句版本验证，不能重复计数或直接采用。')
source('xg-tour','https://xgalx.com/en/xg/news/detail.php?id=1127079','web.search official label live-album announcement','厂牌明确这是 The first HOWL 东京巨蛋巡演现场专辑，含 IS THIS LOVE／IN THE RAIN 等；不是普通打歌替代。旧过期 CDTV 两链接没有重试。')
source('xg-discography','https://xgalx.com/xg/discography/','web.search official current discography','MILLION PLACES 及其巡演 live 音源被分别列出。未取得新的可用 Music Station 全曲，不将同曲巡演音源替换旧活动绑定。')
source('young-up','https://youngposse.fandom.com/wiki/YOUNG_POSSE_UP_%28song%29','web.search secondary performance index as lead','新查曲目索引把 2023-12-09 Christmasland 与 2024-04-08 DinDin Music High 分开；前者活动排除，后者旧片长／客串完整性未解决。不推定成员版删段自动合格。')
source('young-roty','https://kpopconcerts.com/exclusives/interview-young-posse-talk-head-in-the-clouds-new-york-dream-collabs-and-staying-true-to-themselves/','web.search original interview/report','ROTY 关联的是 Head in the Clouds 节庆节目；另一采访推荐的是 Scars performance，均不能证明 ROTY 合格棚拍／练习。')
source('young-iknow','https://music.bugs.co.kr/track/6489554?wl_ref=list_tr_08_ab','web.search licensed per-track credits','明确 I know 的 SUNHYE／JIEUN 曲名及作词作曲；仍只是发行身份与二人范围，未获得完整同曲二人表演。')
source('young-site','https://youngposseofficial.jp/contents','web.search and web.open official Japan index','官方近期目录把 Pilot2（2026-07-26）和 I know（2026-07-18）列在 MV，不是独立舞台；MOVIE 栏为东京公演后感言。')
source('young-kawa','https://v.daum.net/v/20260901135107785','web.search interview carried by Daum','Jiana／Doeun 本人谈 kawa 旋律、情绪与 MV，能补强创作范围，但未给二人完整独立表演。不得以全团其它歌替代。')
source('young-mr','https://www.edaily.co.kr/News/Read?mediaCodeNo=257&newsId=02945446645514192','web.search original release reporting','发布报道将 Mr2026 与其他 mixtape 单曲分列；没有同曲官方完整打歌。新搜索命中的 2026 tour／演出邀约文也非可采用视频。')

MAP = {
'rec28ldfRTrF2E':['qwer-live'], 'recvxIZLpET3tB':['qwer-our'], 'recvxIZRWKy9zg':['qwer-show'],
'recvxyH5pzA9lj':['rocket','rocket-report'], 'rec28ldfRTrNcl':['shalala'],
'recvxyH5pzVn2k':['lit'], 'recvxyH5pzbluu':['mwuah'], 'recvxyH5pzdckl':['meow'], 'recvxyH5pzoMAf':['teddy','teddy-variety'],
'rec28ldfRTrO2v':['cherry'], 'rec28ldfRTrOTb':['baby','baby-catalog'], 'rec28ldfRTrOXn':['dream'], 'rec28ldfRTrOnV':['password'], 'rec28ldfRTrP1t':['dna'], 'rec28ldfRTrP5H':['heaven'],
'rec28ldfRTrQ8F':['unis'], 'rec28ldfRTrFGi':['vvup'],
'recvxyH5pzJov0':['weeekly-top'], 'recvxyH5pzoIOD':['weeekly-christmas','weeekly-live'], 'recvxyH5pzoaOZ':['weeekly-love'],
'recvxIYG1FSCws':['wooah-voodoo'], 'recvxyH5pzQxpW':['wooah-summer-behind'], 'recvxyH5pzZfyK':['wooah-sideb','wooah-sideb-culture'], 'recvxyH5pzrrSO':['wooah-wxw','wooah-wxw-stage'],
'recvxDMFHN97Px':['xg-four'], 'recvxDMFHNJME3':['xg-rain'], 'recvxDMFHNyyeA':['xg-orb'], 'recvxDMFHNzJyr':['xg-rock','xg-fullcam'], 'recvxDMFHNojjN':['xg-tour'], 'recvxDMFHNSckK':['xg-discography'],
'rec28ldfRTrFYu':['young-up'], 'rec28ldfRTrGj0':['young-roty'], 'recvxIZRWKntfT':['young-iknow','young-site'], 'recvxIZY0lR25A':['young-site'], 'recvxIZY0lX8bP':['young-kawa'], 'recvxJ03dOg1Gc':['young-mr']}
records = []
for filename in ['stage-checklist.json','other-checklist.json']:
    baseline=json.loads((ROOT/'docs/codex/evidence/20261029-human-help'/filename).read_text(encoding='utf-8'))
    for group in baseline['groups']:
        if group['name'] not in GROUPS:
            continue
        for item in group['items']:
            if filename == 'other-checklist.json' and item['kind'] != 'person':
                continue
            stable = item['workId']
            keys = MAP[stable]
            kind = 'person' if item['kind']=='person' else ('stage-replacement' if '替换' in item['kind'] else 'stage-new')
            if kind=='person' and stable=='recvxyH5pzQxpW':
                keys = keys + ['wooah-summer-promo','wooah-summer-original']
            records.append(dict(group=group['name'],kind=kind,stableId=stable,song=item['song'],version=item.get('version'),question=item['problem'],checks=[SOURCES[x] for x in keys],newEvidence=[],proposedAction='retain-open; record newly checked source scope only',remainingReason=item['problem'],needsUserHelp=False,helpReason='没有要求用户现在补资料；公开来源受限或本轮无新增可采用证据只暂停本项。若已知完整原始来源可附链接继续核。'))

for r in records:
    if r['stableId']=='recvxyH5pzQxpW':
        r['newEvidence']=[dict(url=SOURCES['wooah-summer-behind']['url'],type='official-behind-candidate',status='indexed-metadata-only',finding='新发现的精确 SUMMER 官方拍摄幕后，可作为逐名字幕／时间点核查入口，尚未证实任何个人角色。')]
        r['proposedAction']='record-candidate; keep stage and person queues open pending named evidence'
        r['remainingReason']='已找到准确作品官方幕后标题，但逐名字幕／时间点不可读，不能把团体成员名单投射为具体录音或拍摄名单；幕后也不是完整新舞台。'
    if r['stableId']=='recvxyH5pzZfyK':
        r['newEvidence']=[dict(url=SOURCES['wooah-sideb-culture']['url'],type='source-type-clarification',status='official-indexed-body',finding='官方文化院原文将 Side B 标 MV Version，维持不作为独立舞台。')]
    if r['stableId']=='rec28ldfRTrNcl':
        r['newEvidence']=[dict(url=SOURCES['shalala']['url'],type='source-scope-clarification',status='primary-page-read',finding='日语版动画主题歌／HITOMI 和 MEI 声优活动不能用来证明全团完整舞台。')]

assert len(records)==38, len(records)
assert len({(r['kind'],r['stableId']) for r in records})==38
assert {r['group'] for r in records}==set(GROUPS)
out=dict(schemaVersion=1,checkedDate='2026-10-29',researcher='groups-qwer-young',baselineCommit='cef1765801ce62739c44308292a680b16e681597',scope='11团的36舞台分类项（34新增、2旧替换）与2人物项；真实网页检索与来源范围核查，不代表逐片完整播放或穷尽公开网络。',policy='官方原始范围优先；完整同曲、同语种与同版本；全团不代二人／个人；活动／巡演／MV重发不补舞台；成员版只放宽客串范围。',counts={'groups':11,'items':38,'newStageCandidatesAccepted':0,'personFactsAccepted':0,'openItemsRetained':38},limits=['搜索未命中不证明不存在。','视频标题、目录、发行声明不能当完整播放验证。','SUMMER 原始 YouTube 直接页 throttled、X 原帖403／空页后未重试该路线；Side B文化院直接页重定向循环。','未访问私人数据、应用文件、评分绑定、会员／付费正文；没有新部署或私人写入。','needsUserHelp=false表示本项未向用户立即提问，不代表事实已经解决。'],items=records)
dest=Path(__file__).with_name('groups-qwer-young.json')
dest.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'path':str(dest),'items':len(records),'groups':len(GROUPS),'accepted':0},ensure_ascii=False))
