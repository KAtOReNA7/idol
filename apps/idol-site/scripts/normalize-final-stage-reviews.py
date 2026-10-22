"""Compile frozen final bounded research conclusions; no provider or business writes.
Only unresolved stable IDs may receive searchReview. Source/alternative/lead arrays stay separate.
"""
import json,pathlib,sys,hashlib,urllib.parse
root=pathlib.Path(__file__).resolve().parent.parent
raw=pathlib.Path(sys.argv[1]).read_bytes();doc=json.loads(raw)
assert doc['formatVersion']=='idol.search-review-final-dispositions.v3' and doc['recordCount']==len(doc['items'])==58
sources=json.loads((root/'data/stage-videos.json').read_text());supp=json.loads((root/'data/stages/supplements.json').read_text())['works']
inventory={w['recordId'] for w in json.loads((root/'data/stages/inventory.json').read_text())['works']}
placeholders=set(json.loads((root/'data/stages/group-placeholders.json').read_text())['records'])
expected=inventory-set(sources)-{rid for rid,r in supp.items() if r['alternatives']}-placeholders
assert {i['recordId'] for i in doc['items']}==expected and len(expected)==58

def clean(s):
 text=str(s)
 replacements={
  'Uploader explicitly labels a linked original source; unresolved target must be copied from browser.':'上传者说明标注原始来源，但其目标链接与具体内容尚未核实。',
  '普通HTTP200仅得客户端网页壳，web工具CacheMiss/InternalError；未见源站拒绝，需正常浏览器确认实际直播内容。':'页面返回基础框架，实际直播内容尚未成功读取；未见源站拒绝，仍需核验实际内容。',
  '工具CacheMiss未取得页面，不证明源站拒绝。':'本次未能读取页面内容，不能据此判断源站拒绝访问。',
  '打开结果CacheMiss不是源站拒绝。':'本次未能读取页面内容，不表示源站拒绝访问。',
  '部分X页真实403，另一些只是工具CacheMiss。':'部分X页拒绝访问，另一些页面内容尚未成功读取。',
  '本轮对单页的web打开CacheMiss，不是HTTP403。':'本轮未能读取该页面内容，未见明确拒绝访问。',
  'YouTube web open为CacheMiss':'本次未能读取YouTube页面内容',
  '用户维护曲目统计':'公开曲目统计',
  '只保留既有watchLead，本轮处置结束':'保留已有观看线索，本轮核验完成',
  'watchLead':'观看线索',
  '本轮直接打开返回Internal Error':'本轮未能读取正文',
  '本轮直接打开Internal Error，没有登录或越过会员限制。':'本次未能读取页面正文，未登录或越过会员限制。',
  '保持未闭环':'尚未核验完整对应舞台',
  '未闭合':'尚未核实',
  '禁用广告25秒不是主片长':'广告显示的25秒不是正片长度'
 }
 for a,b in replacements.items():text=text.replace(a,b)
 return text

def url(u):
 v=urllib.parse.urlsplit(u);assert v.scheme=='https' and v.hostname and not v.username and not v.password
 return u

works={}
for x in doc['items']:
 rid=x['recordId'];assert rid not in works and x['reviewComplete'] is True and not x['countsAsCovered'] and not x['globalStageAbsenceProven']
 notes={}
 for e in x.get('sourceEvidence',[]):
  note=clean(e.get('note') or e.get('text') or '')
  if note and note not in notes.get(e['url'],''):notes[e['url']]=notes.get(e['url'],'')+('；' if e['url'] in notes else '')+note
 scope=[{'url':url(u),'label':notes.get(u) or ('公开来源 · '+urllib.parse.urlsplit(u).hostname)} for u in dict.fromkeys(x['sourceURLs'])]
 excluded=[];unlinked=[];seen=set()
 for e in x['exclusions']:
  if not e.get('sourceURLs'):unlinked.append('排除说明：'+clean(e['reason']))
  for u in e.get('sourceURLs',[]):
   pair=(u,e['reason'])
   if pair in seen:continue
   seen.add(pair);parts=urllib.parse.urlsplit(u);video=urllib.parse.parse_qs(parts.query).get('v',[''])[0]
   excluded.append({'url':url(u),'title':('已核排除候选 '+video).strip() if video else '已核排除来源 · '+parts.hostname,'reason':clean(e['reason'])})
 limitations=['以上时间为已采集公开证据的整理时间，不表示全部来源在此时重新访问。','已查范围：'+clean(x['actualscope'])]+[clean(a['reason']) for a in x['accesslimitations']]+unlinked
 limited=bool(x['accesslimitations']) or x['category']!='bounded_review_no_verifiable_public_performance'
 review={'checkedAt':x['checkedAt'],'accessLimited':limited,'outcome':'verification_limited' if limited else 'not_found_in_scope','summary':clean(x['readableConclusion']),'scope':scope,'excluded':excluded,'limitations':list(dict.fromkeys(limitations)),'reviewComplete':True,'reopenRequirement':clean(x['specificNewEvidenceRequired'])}
 works[rid]={'alternatives':[],'searchReview':review}
print(json.dumps({'formatVersion':'idol.stage-supplements.v1','updatedAt':doc['createdAt'],'reviewedSourceSha256':hashlib.sha256(raw).hexdigest(),'works':works},ensure_ascii=False,indent=2))
