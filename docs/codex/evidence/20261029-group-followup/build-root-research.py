"""Record this run's bounded public research; never convert absence into facts."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[4]
OUT=Path(__file__).parent
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def check(url,result,method='live web search index; not full-page or video verification'):
    return dict(url=url,method=method,result=result)
bugs='https://music.bugs.co.kr/artist/80347326/mvs?wl_ref=S_ar_05_01'
aespa_checks=[check(bugs,'正版艺人目录区分原曲Performance与混音MV；这是目录范围检查，未逐片播放，也不是所有混音的逐人署名。','live web.open full page text')]
getgoin=[check('https://www.toughpigs.com/transcript-fraggle-talk-26/','原制作采访说明首尔屋顶拍摄与制作人员，但未逐名列成员录音角色。','live web.open full interview text'),
    check('https://kpopnewswire.com/aespa-drops-new-track-get-goin-for-apple-tv-original-series-fraggle-rock/','明确四人出现在预告；预告范围不能扩成目标完整版逐人参与。','live web.open full article text'),
    check('https://www.henson.com/fraggle-rock/','官方节目页无可用于本曲逐人的具体角色资料。','live web.open full page text')]
special={
 'recvxyHuKMBHQA':getgoin,
 'recvxyHuKMZLFT':[check('https://datazoo.jp/n/KISS%2BN%2BTELL-aespa/25382745','新节目日志把歌曲缩至2026-09-12 01:03–01:06时段；仍未取得完整官方单曲片源。'),check('https://aespa-official.jp/news/kissntell-release/','艺人官方发行说明能证日文发行，不能证明节目音轨/完整范围。')],
 'recvxyHuKMyy5i':[check('https://music.bugs.co.kr/album/4091238','发行说明泛称成员人声采样，没有逐名指定此混音保留的成员。'),check('https://nitepunk.world/','本混音制作人Nitepunk官方网站可读内容仅有音乐/巡演入口，无逐成员采样名单。','live web.open full page text'),*aespa_checks],
 'recvxyHuKMDFye':[check('https://www.youtube.com/watch?v=0TeYnotdeoE','承接已核K-909官方全景；本轮没有新的可读客串声部证据，不把nævis范围改为已核。','prior evidence reviewed; no new full playback')],
 'recvxyHuKMXVDa':[check('https://www.youtube.com/watch?v=F4Ag77XSVYI','SM提供的自动音源说明列制作/作词角色，并非完整独立表演。'),check('https://www.setlist.fm/stats/aespa-13f431f9.html?year=2024','新查询指向巡演或校园舞台；仍在当前类型排除范围。')],
 'recvxyHuKMDKAR':[check('https://music.bugs.co.kr/artist/80347326/mvs?wl_ref=S_ar_05_01','最新发行目录将Switchblade列MV；新表演查询仍指Lollapalooza/巡演，不能替换合规舞台。','live web.open full page text')],
 'recvxyHuKMKGBh':[check('https://en.wikipedia.org/wiki/List_of_Aespa_live_performances','近期线索列校园/音乐节；仅发现路线，不作为官方完整表演或替换授权。')]
}
items=[]
stage=read(ROOT/'docs/codex/evidence/20261029-human-help/stage-checklist.json')
other=read(ROOT/'docs/codex/evidence/20261029-human-help/other-checklist.json')
for g in stage['groups']:
 if g['name']!='aespa':continue
 for row in g['items']:
  checks=special.get(row['workId'],aespa_checks)
  items.append(dict(group=g['name'],kind='stage_replacement' if row['kind']=='旧来源待替换' else 'stage_new',stableId=row['workId'],song=row['song'],version=row['version'],question=row['problem'],checks=checks,
   newEvidence=['KISS N TELL节目日志进一步定位时间段，仍不是可采用原片。'] if row['workId']=='recvxyHuKMZLFT' else [],
   proposedAction='保留原来源/缺口；不重复导入既有MV，不以其他混音或活动替代。',remainingReason=row['problem'],needsUserHelp=row['workId']=='recvxyHuKMDFye'))

group_checks={
 'GENBLUE':[check('https://www.reddit.com/r/kpop/comments/1j8ncov','获奖查询仍只落到2025-03-11候选而非获胜；搜索结果和记忆不足以核全时期0。')],
 'SPIA':[check('https://www.genie.co.kr/detail/albumInfo?axnm=84950678','沿用已核数字发行格式；新实体/销量检索未得可相加数值。','prior distributor evidence reviewed plus new bounded search')],
 'TRACER':[check('https://music.apple.com/us/album/365-single/1777757195','365正版数字目录可作同名消歧，不能证明实体售量或音乐节目一位数。'),check('https://www.genie.co.kr/magazine/subMain?ctid=1&mgz_seq=14789','具名封套人物已在前批采用，不重复；无实体数量。','new search corroborates previously adopted jacket feature')],
 'VCHA / GIRLSET':[check('https://www.girlsetofficial.com/','本轮限定VCHA/GIRLSET时期与获奖口径，新查询无完整获奖总表或VCHA实体售量；沿用已核商品不重复采用。','bounded query plus prior evidence review; no fresh full-page read')],
 'W!TCHX':[check('https://music.apple.com/','本轮精确W!TCHX/WTCHX实体销量检索未得可核数值；原数字发行与0+不能证明全期0。','bounded search with group aliases; not source-body evidence')],
 'tripleS':[check('https://circlechart.co.kr/page_chart/album.circle?hitYear=2025&nationGbn=T&targetTime=2025&termGbn=year&yearTime=3','新官方索引仍为ASSEMBLE25 Cosmo 406744与Beyond Beauty Cosmo 310273；前者已作年榜替换，后者等于2025年11/12月273527+36746，不新增相加。'),check('https://soridata.com/sales/TripleS.html','新索引列旧月份而非差额明细；不重试下载/验证码，不使用Hanteo或日本销量填350635。','search index only; original aggregate not newly verified')],
 'AtHeart':[check('https://atheartkpop.fandom.com/wiki/Aurora','新线索指2026-06-15 Say It预告含回归；尚无原发布具名正文，不反推首次暂停起点或第二次生效日。'),check('https://kprofiles.com/atheart-members-profile/','同样把预告日期当回归线索，缺独立公司生效说明。')],
 'BEWAVE':[check('https://kprofiles.com/bewave-members-profile/','本轮可见仍转述9月4日宣布未来10月31日结束六人活动；没有计划已执行的独立原证。')],
 'CandyShop':[check('https://www.xportsnews.com/article/1856885','原记者全文转载公司暂停声明，但文中没有另一个明确生效日；不能把后续缺席/猜测写成退团。','live indexed full article text'),check('https://celebconfirmed.com/news/candy-shops-yuina-pauses-activities-due-to-health-new-member-to-join-12555','独立记者引述同一声明；未来行程暂停不是额外生效日期。','live indexed full article text')],
 'Geenius':[check('https://www.kpopalbums.com/products/geenius-spoiler-book-1st-instrumental-album-qr-version','仍是2026-01-15器乐QR商品目录，未得公司实际上市通知；不转成人声完整版发行。')],
 'UDTT':[check('https://udangtangtang-sonyeondan-kpop.fandom.com/wiki/Jung_Sena','新索引指向3月26日原账号线索；正文返回402后停止，无原公告正文可采用。','web search then direct open 402; no bypass'),check('https://www.kprofiles.com/forums/threads/udtt-official-thread.46629/','社区转发指粉丝udtt_global，不能当udtt_official原公告或实际退出日期。'),check('https://thekrazemag.com/latest-updates/2025/5/27/udtts-debut-really-really-deserves-more-love','次级评论的退出描述不补公司/本人原始生效依据。')]
}
for g in other['groups']:
 if g['name'] not in ['aespa',*group_checks]:continue
 for idx,row in enumerate(g['items']):
  sid=row.get('workId',row.get('key',row.get('eventId',g['name']+':'+row['kind'])))
  checks=special.get(sid,aespa_checks) if g['name']=='aespa' else group_checks[g['name']]
  if row['kind']=='person' and sid in ['recvxyHuKMlGJW','recvxyHuKMwjsI']:
   checks=checks+[check('https://readdork.com/lyrics/aespa-supernova-grimes-remix','新发现的歌词/credits聚合未给权威上游，甚至将成员标成songwriter；不用分词标签反推混音采样成员。','live web.open full page text; rejected as unsupported attribution')]
  if sid=='e-udtt-jessica-provisional-join-candidate':
   checks=[check('docs/codex/evidence/20261029-human-help/other-checklist.json','复核既有4月30日/5月8日/5月9日采访与报道的角色/身份差异结论；本轮没有取得新的Jessica公司加入公告，也未重读全部原采访。','local prior-evidence review only; no fresh source body')]
  items.append(dict(group=g['name'],kind=row['kind'],stableId=sid,song=row.get('song'),question=row['problem'],checks=checks,newEvidence=[],
   proposedAction='保留未知/待证；不把公告日、群体署名、版本数或搜索缺失推成事实。',remainingReason=row['problem'],needsUserHelp=False))
assert len(items)==42,len(items)
assert len({(x['group'],x['kind'],x['stableId']) for x in items})==42
out=dict(schemaVersion=1,checkedAt='2026-10-29',baselineCommit='cef1765801ce62739c44308292a680b16e681597',
 scope='aespa27分类项及其余统计/实际生效日期15项；有界公开检索，不称全网穷尽。',
 queryNotes=['aespa remix/practice/performance按精确混音名查询；其它版本结果排除。','统计先同名消歧及口径；时间轴寻找原公告，不搜索私人健康细节。','同一来源多条复用只代表同源检查，不能把42项当42份独立新证据。','UDTT Jessica沿用前批已读采访的角色/身份差异；没有新明确加入日期，不冒称重新阅读全部原文。'],
 adoptedApplicationFacts=0,items=items)
(OUT/'groups-root.json').write_bytes((json.dumps(out,ensure_ascii=False,indent=2)+'\n').encode())
print('42 classified research items recorded; no factual closures.')
