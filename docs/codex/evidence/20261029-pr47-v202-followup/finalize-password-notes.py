"""Finalize public wording after the authentic empty-score import succeeded."""
import copy,hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent
APP=HERE.parents[3]/'apps/idol-site'
def load(p):return json.loads(p.read_text(encoding='utf-8'))
def write(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
 p=HERE/'password-formal-adoption.json';receipt=load(p);rid=receipt['workId']
 vp=APP/'data/stage-videos.json';videos=load(vp)
 assert videos[rid]==receipt['stageVideos']['afterRow'] and 'supplementChange' not in receipt
 videos[rid]['verificationNote']='用户完整看片确认原日／英混合版和八人分队全员；CID／分P取自用户公开分享代码。代理未独立全片播放或逐句音轨比对，不据此判断真唱。采用前已核新鲜owner舞台分为空、完整206条保存日志无目标、线上无旧绑定且全部497条既有来源一致。'
 write(vp,videos);receipt['stageVideos']['afterRow']=videos[rid];receipt['stageVideos']['afterFileSha256']=sha(vp)
 sp=APP/'data/stages/supplements.json';supplements=load(sp);before=copy.deepcopy(supplements['works'][rid]['searchReview'])
 note=supplements['works'][rid]['searchReview']
 summary='TBS节目回顾确认tripleS ∞!《Password》参加PLAYLIST。已采用非官方转载BV1bhU8BWEso／CID34265369310／第1P；完整首尾、原日／英混合版本和8人分队全员由用户看片确认，精确分P来自用户公开分享代码。代理未独立全片播放或逐句音轨比对，不据此判定真唱。'
 note['summary']=note['publicNote']['summary']=summary
 note['limitations']=['内容范围来自用户看片，精确分P来自公开分享代码；未作代理独立全片／逐句核对。采用前已核新鲜owner空分、完整日志及线上原绑定，不转移旧评分。']
 write(sp,supplements)
 receipt['supplementChange']={'workId':rid,'expectedBefore':before,'after':copy.deepcopy(note),'afterFileSha256':sha(sp)}
 receipt['posterLimitation']='No independent stage-cover original retrieved; do not fabricate a Bilibili thumbnail or reuse a wrong-part poster. Existing 28 stage posters unchanged.'
 write(p,receipt)
if __name__=='__main__':main()
