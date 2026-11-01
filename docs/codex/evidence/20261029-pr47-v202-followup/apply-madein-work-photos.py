"""Reuse the reviewed new collection for the same four documented release subjects."""
import copy,json
from pathlib import Path
HERE=Path(__file__).resolve().parent
APP=HERE.parents[3]/'apps/idol-site'
def load(p):return json.loads(p.read_text(encoding='utf-8'))
def write(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
def main():
 rp=HERE/'madein-photo-adoption.json';receipt=load(rp)
 assert 'workChanges' not in receipt,'Already applied'
 group=next(g for g in load(APP/'data/public-group-recognition.json')['groups'] if g['groupName']=='MADEIN')
 changes=[]
 for name in ['public-work-credits.json','public-work-recognition.json']:
  p=APP/'data'/name;data=load(p);row=next(r for r in data['records'] if r['workId']=='rec28ldfRTrPi9');before=copy.deepcopy(row)
  if name=='public-work-credits.json':
   assert '更高清同套图仍待补' in row['note']
   row['note']=row['note'].split('复用的官方资料照原件')[0]+'认人参考改用JJ同篇采访逐名刊载的683×1024写真，未证本MV同期；旧569×854原件和来源完整保留，名单仍限上述4名封套人物。'
  else:
   for i,old in enumerate(row['portraits']):
    new=copy.deepcopy(next(p for p in group['portraits'] if p['memberId']==old['memberId']))
    new.pop('participationStatus');new['label']='同系列写真 · 认人参考'
    new['note']='JJ于2025年3月14日同篇采访逐名写真，仅帮助辨认本发行4名封套人物；不证明本MV出镜或同期妆造。旧569×854原件与完整来源保留在本轮采用回执。'
    row['portraits'][i]=new
  assert row['workId']==before['workId'] and row['videoId']==before['videoId'] and row['groupId']==before['groupId']
  write(p,data);changes.append({'file':name,'workId':row['workId'],'expectedBefore':before,'after':copy.deepcopy(row)})
 receipt['workChanges']=changes
 receipt['preservation']['pungReferenceChanges']='four photo sources and explanatory note only; member IDs, work ID, video ID, release scope and roles unchanged'
 receipt['after']['collectionNote']=receipt['after']['collectionNote'].replace('PUNG!既有4人发行参考继续使用原图。','PUNG!仍仅展示已具名的4名封套人物，认人图采用本套写真。')
 p=APP/'data/public-group-recognition.json';generic=load(p);g=next(g for g in generic['groups'] if g['groupName']=='MADEIN');g['collectionNote']=receipt['after']['collectionNote'];write(p,generic)
 import hashlib
 receipt['afterGenericFileSha256']=hashlib.sha256(p.read_bytes()).hexdigest()
 write(rp,receipt)
if __name__=='__main__':main()
