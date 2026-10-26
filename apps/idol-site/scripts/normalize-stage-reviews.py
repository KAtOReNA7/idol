"""Compile bounded public-source conclusions; stdout only, never providers or user facts.
Usage: python3 scripts/normalize-stage-reviews.py FROZEN_REVIEW_JSON > PROPOSAL.json
Already-available sources/alternatives take precedence over the historical review baseline.
"""
import json,pathlib,sys,hashlib,datetime,urllib.parse
root=pathlib.Path(__file__).resolve().parent.parent
p=pathlib.Path(sys.argv[1]);raw=p.read_bytes();doc=json.loads(raw)
assert doc['schemaVersion']=='idol.remaining77.local-disposition-review.v1' and len(doc['items'])==doc['recordCount']==77
videos=json.loads((root/'data/stage-videos.json').read_text());supp=json.loads((root/'data/stages/supplements.json').read_text())['works'];works={};skipped=[]
def clean(s):
 replacements={
  '不再排浏览器或改路重试':'当前停止核验这两个受限来源',
  'YouTube web open为CacheMiss':'本次未能读取YouTube页面内容',
  '普通HTTP200仅得客户端网页壳，web工具CacheMiss/InternalError；未见源站拒绝，需正常浏览器确认实际直播内容。':'页面返回了基础框架，实际直播内容尚未成功读取；未见源站拒绝，仍需核验实际内容。',
  '部分X页真实403，另一些只是工具CacheMiss。':'部分X页拒绝访问，另一些页面内容尚未成功读取。',
  '工具CacheMiss未取得页面，不证明源站拒绝。':'本次未能读取页面内容，不能据此判断源站拒绝访问。',
  '尚未在本地完成核验':'尚未完成核验',
  '由父级确认':'确认',
  '沿正确曲名发现的보가츠具体现场候选，父级已排浏览器；本审核未自行请求或认定合格。':'沿正确曲名发现的보가츠具体现场候选；实际内容与完整性尚待核验。',
  'Uploader explicitly labels a linked original source; unresolved target must be copied from browser.':'上传者说明标注了原始来源，但原链接目标尚未核实。',
  'XGALX官方影片/新闻目录、CDTV原iframe与精确HTTP私有原因、旧候选bot登录限制；此审核修正了仅凭browser文件缺失误认为未查的风险。':'XGALX官方影片/新闻目录、CDTV原iframe及具体私有响应、旧候选的登录或验证限制。'
 }
 value=str(s)
 for old,new in replacements.items():value=value.replace(old,new)
 return value
def public(u):
 parts=urllib.parse.urlsplit(u)
 assert parts.scheme=='https' and parts.hostname and not parts.username and not parts.password,'Expected public HTTPS evidence link'
 return u
for x in doc['items']:
 rid=x['recordId'];assert rid not in works and rid not in skipped
 if rid in videos or supp.get(rid,{}).get('alternatives'):skipped.append(rid);continue
 limits=x['accessLimitations'];limited=bool(limits) or x['researchCompleteness']!='bounded_search_reviewed'
 outcome='verification_limited' if limited else 'not_found_in_scope'
 evidence=x['primaryPublicEvidence'];notes={e['url']:clean(e['note']) for e in evidence}
 urls=list(dict.fromkeys(x['searchedScope']['sourcePagesAndCandidateDirectoriesReviewed']+[e['url'] for e in evidence]))
 scope=[{'url':public(u),'label':notes.get(u) or ('已查公开来源 · '+urllib.parse.urlsplit(u).hostname)} for u in urls]
 excluded=[];unlinked=[];seen=set()
 for e in x['excludedCandidates']:
  if not e.get('url'):
   unlinked.append('排除说明：'+clean(e['reason']));continue
  pair=(e['url'],e['reason'])
  if pair in seen:continue
  seen.add(pair);u=public(e['url']);q=urllib.parse.parse_qs(urllib.parse.urlsplit(u).query);label=e.get('title') or ('已核排除候选 '+q.get('v',[''])[0]).strip()
  excluded.append({'url':u,'title':label,'reason':clean(e['reason'])})
 limitations=['以上时间是已采集公开证据的整理时间，不表示全部页面在此时重新检查。',clean(x['searchedScope']['summary'])]+[clean(a['reason']) for a in limits]+unlinked+['后续核验方向：'+clean(x['nextUsefulAction'])]
 works[rid]={'alternatives':[],'searchReview':{'checkedAt':x['checkedAt'],'accessLimited':limited,'outcome':outcome,'summary':clean(x['readableConclusion']),'scope':scope,'excluded':excluded,'limitations':list(dict.fromkeys(limitations))}}
print(json.dumps({'formatVersion':'idol.stage-supplements.v1','updatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'reviewedSourceSha256':hashlib.sha256(raw).hexdigest(),'skippedBecauseNewerSourceAvailable':skipped,'works':works},ensure_ascii=False,indent=2))
