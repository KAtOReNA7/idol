"""Preserve the exact observed public thumbnail bytes for one exact Bili part."""
import hashlib,json,shutil,subprocess
from pathlib import Path
from PIL import Image
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
APP=ROOT/'apps/idol-site'
def load(p):return json.loads(p.read_text(encoding='utf-8'))
def write(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
 target='rec28ldfRTrOnV';stages=load(APP/'data/stage-videos.json');stage=stages[target]
 key='bilibili:BV1bhU8BWEso:cid:34265369310:p:1'
 assert len(stages)==499 and stage['scoreBinding']['sourceKey']==key and stage['bilibili']=={'cid':'34265369310','page':1} and 'clip' not in stage
 src=Path(r'C:\Users\61919\AppData\Local\Temp\idol-password-bili-cover.jpg')
 digest='0c9aa40b0abe0132acb8c9825b9f8098c2fd3758724ca162c10ba419495ccf70'
 assert sha(src)==digest and src.stat().st_size==41986
 with Image.open(src) as im:assert im.size==(1024,576);im.verify()
 dest=APP/'public/artist/stage-bilibili-20261029/BV1bhU8BWEso-cid-34265369310-p1.jpg'
 manifest=APP/'data/stage-bilibili-posters-20261029.json'
 assert not dest.exists() and not manifest.exists(),'Already applied; do not overwrite'
 dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dest)
 row={'workId':target,'videoId':stage['videoId'],'sourceKey':key,'view':'stage',
  'src':'/'+dest.relative_to(APP/'public').as_posix(),'label':'B站转载舞台封面（原页面预览图）',
  'intrinsicSize':{'width':1024,'height':576},'sourceUrl':'https://i1.hdslb.com/bfs/archive/6187056d9fcf78b77bc9a41a9d52774e09dd7695.jpg@1200w_630h',
  'sourcePageUrl':stage['url'],'sha256':digest,'byteLength':41986,'originalBytesPreserved':True,
  'imageScope':'reviewed_single_song_part','checkedAt':'2026-10-29'}
 write(manifest,{'schemaVersion':1,'scope':'Exact platform/BV/CID/page/range posters only; never borrow a whole-BV cover for another part or song interval.','entries':[row]})
 write(HERE/'password-poster-adoption.json',{'checkedDate':'2026-10-29','baseline':'ec9efbc590673b8bbb98e6c98db303303a3b8aa0','entry':row,
  'browserObservation':{'title':'251126 tripleS ∞! Password @PLAYLIST','videoDurationSeconds':174,'uploader':'tripleS_能量站','sourceUrl':stage['url'],'metadataProperty':'og:image',
    'declaredOgSize':[1200,630],'actualDecodedSize':[1024,576],'notes':'Actual JPEG dimensions override declarative OG values; no URL size guessing, upscaling, border addition or video frame synthesis. Image visually matches the TBS PLAYLIST stage. Agent did not reverify the full audio/version.'},
  'newOriginals':1,'privateWrites':0,'formalBindingChanges':0,
  'protectedFileSha256':{p:sha(APP/p) for p in ['data/stage-videos.json','data/stages/status.json','data/stages/supplements.json','data/stage-selection-posters-20261027.json','data/mv-public-media.json','data/production-asset-delivery.json']},
  'delivery':'Additional local public original copied by the build; old 5996-row asset-delivery inventory unchanged.',
  'staycPosterReview':{'sourcePage':'https://www.bilibili.com/video/BV1bo4y1x7LV/?p=1&cid=1115512650','observedUploader':'samuraihong_X','uploaderProfile':'https://space.bilibili.com/667182052/','browserDurationSeconds':1468.734,'displayDuration':'24:29',
    'imageUrl':'https://i2.hdslb.com/bfs/archive/e55788e1bd5188e9a6c1191aed1fec935483a49e.jpg@1200w_630h','imageSha256':'cc2686d5fcdb7e351bf7a2321f3619039bb0101cdd51af949c0162c618f03b89','imageSize':[1008,630],'imageBytes':85924,
    'decision':'rejected_wrong_song_scope','reason':'Whole-program image explicitly captions AKB48, not the STAYC 18:05–21:13 song interval; no face identification needed. Never attach it as the STAYC stage poster.'}})
if __name__=='__main__':main()
