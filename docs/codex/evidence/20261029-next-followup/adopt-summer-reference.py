"""Add a named campaign reference without inventing recording or MV relationships."""
import copy,hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
APP=ROOT/'apps/idol-site'
def load(p):return json.loads(p.read_text(encoding='utf-8'))
def write(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
 cp,rp=APP/'data/public-work-credits.json',APP/'data/public-work-recognition.json'
 credits,recognition=load(cp),load(rp)
 research=next(r for r in load(HERE/'people-new.json')['records'] if r['song']=='SUMMER')
 rid=research['workId'];assert len(credits['records'])==len(recognition['records'])==105
 assert not any(r['workId']==rid for r in credits['records'])
 group=next(g for g in load(APP/'data/public-group-recognition.json')['groups'] if g['groupId']==research['groupId'])
 ids=research['recommendedMemberIds'];assert len(ids)==len(set(ids))==5
 before={p.name:sha(p) for p in [cp,rp]}
 oldc,oldr=copy.deepcopy(credits),copy.deepcopy(recognition)
 note='民间资料页逐名标注Wish With W : Vol.3概念照人物为Nana、Wooyeon、Sora、Lucy、Minseo；Bugs发行目录确认本发行包含SUMMER。这里只列发行宣传照人物，不代表本曲逐人录音或本MV出镜已核实；认人图复用既有已审校服原件，不冒称是本发行新概念照。'
 row={'workId':rid,'groupId':group['groupId'],'videoId':research['videoId'],'memberIds':ids,
  'kind':'documented_project_lineup','label':'本发行概念照人物参考','note':note,
  'sourceUrl':'https://kprofiles.com/wooah-members-profile/','sourceTitle':'KProfiles：Wish With W : Vol.3五名概念照人物（民间具名归档）',
  'supportingUrls':['https://music.bugs.co.kr/album/4151414?wl_ref=M_contents_01_04','https://namu.moe/w/Wish%20With%20W%20%3A%20Vol.3'],
  'checkedAt':'2026-10-29','evidence':'Five member-specific release-image captions, independent concept-photo table and licensed exact album context. Not the generic group roster, fan line allocation, vocal credits or a complete MV cast. Mirror overview year is inconsistent and not adopted. docs/codex/evidence/20261029-next-followup/people-new.json'}
 credits['records'].append(row)
 images=[]
 for mid in ids:
  p=copy.deepcopy(next(p for p in group['portraits'] if p['memberId']==mid));p.pop('participationStatus')
  assert sha(APP/'public'/p['src'].lstrip('/'))==p['sha256']
  p['label']='同系列校服照片 · 认人参考'
  p['note']='复用既有已审完整原件，仅帮助辨认发行概念照归档中具名人物；不冒称本发行新概念照、不证明本MV出镜或同期妆造，不新增成员评分关系。'
  images.append(p)
 recognition['records'].append({'workId':rid,'videoId':research['videoId'],'groupId':group['groupId'],'portraits':images})
 assert credits['records'][:-1]==oldc['records'] and recognition['records'][:-1]==oldr['records']
 write(cp,credits);write(rp,recognition)
 write(HERE/'summer-reference-adoption.json',{'checkedDate':'2026-10-29','baseline':'ec9efbc590673b8bbb98e6c98db303303a3b8aa0','workId':rid,
  'collections':[{'file':p.name,'beforeFileSha256':before[p.name],'afterFileSha256':sha(p),'beforeCount':105,'afterCount':106,'addedRecord':data['records'][-1]} for p,data in [(cp,credits),(rp,recognition)]],
  'sourceLocators':research['sources'],'newImageOriginals':0,'privateWrites':0,'memberRelationChanges':0,'completeFactItemsClosed':0,
  'after':{'publicCreditWorks':106,'recognitionSlots':546,'genericArchiveWorks':24,'activeGenericWorks':20,'activeGenericSlots':97,'completePersonFactItems':24},
  'preserved':'Full previous 105 entries and metadata, original images and all private relationships preserved; this is a source-scoped release-photo reference only.'})
if __name__=='__main__':main()
