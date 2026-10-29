"""Align only QWER's old research note with the just-protected adoption."""
import copy,hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent
APP=HERE.parents[3]/'apps/idol-site'
def load(p):return json.loads(p.read_text(encoding='utf-8'))
def write(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
r=load(HERE/'qwer-formal-adoption.json');rid=r['workId'];vp=APP/'data/stage-videos.json';v=load(vp)
assert sha(vp)==r['stageVideos']['afterFileSha256'] and v[rid]==r['stageVideos']['afterRow']
v[rid]['verificationNote']+=' 采用前已核新鲜owner舞台分为空、完整206条保存日志无目标、全部497条线上来源一致及两条未发布来源保持；私人写入0。'
write(vp,v);r['stageVideos'].update(afterRow=v[rid],afterFileSha256=sha(vp))
up=APP/'data/stages/supplements.json';d=load(up);before=copy.deepcopy(d['works'][rid]['searchReview']);beforehash=sha(up)
n=d['works'][rid]['searchReview'];n['checkedAt']=r['mergeResult']['freshPreimageAt'];n['accessLimited']=False
n['summary']='日本电视台バズリズム02官方节目档案列出QWER SHOW DOWN；同期TheQoo帖子链接精确X转载。用户已确认全曲完整、日语原版、四人参与、帖子仅一支视频；现已采用X帖子2090845225845747983的视频1。代理X页403，未独立全片播放；旧TV Tokyo／TVer入口仍仅历史线索，不混同为这次采用的节目。'
n['limitations']=['内容范围与唯一视频序号由用户看片确认；官方节目档案和同期转载链接提供场合旁证。','代理未独立全片播放或逐句核音，不据此判断真唱；X原页读取403与旧TVer播放器未加载分别记录。']
n['scope']+= [{'url':'https://www.ntv.co.jp/buzzrhythm/oa/20260821.html','label':'NTV バズリズム02：SHOW DOWN studio live'}, {'url':'https://theqoo.net/japan/4321466057?listStyle=viewer','label':'同期讨论直接链接所选X帖子'}, {'url':v[rid]['url'],'label':'X转载：全曲、日语原版及四人参与已由用户确认；视频1'}]
write(up,d);r['supplementChange']={'workId':rid,'expectedBefore':before,'after':copy.deepcopy(n),'beforeFileSha256':beforehash,'afterFileSha256':sha(up)}
write(HERE/'qwer-formal-adoption.json',r)
