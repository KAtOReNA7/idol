"""Record the user's two observations and prepare an exact X source; no binding."""
import copy,datetime,json,sys
from pathlib import Path
HERE=Path(__file__).resolve().parent
APP=HERE.parents[3]/'apps/idol-site'
sys.path.insert(0,str(APP/'scripts'))
from stage_source_identity import checked_identity
from stage_selection_policy import checked_comparison,comparison_candidates
def write(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
def main():
 now=datetime.datetime.now(datetime.timezone.utc).isoformat()
 url='https://x.com/ming_baragi/status/2090845225845747983/video/1'
 archive='https://www.ntv.co.jp/buzzrhythm/oa/20260821.html'
 discussion='https://theqoo.net/japan/4321466057?listStyle=viewer'
 key='x:2090845225845747983:video:1'
 write(HERE/'qwer-user-confirmation.json',{'date':'2026-10-29','workId':'recvxIZRWKy9zg','originalVideoId':'TcMV9YeT9Sw',
  'postUrl':url.rsplit('/video/',1)[0],'exactVideoUrl':url,'sourceKey':key,
  'observations':[{'question':'从歌曲开始到结束完整、日语原版、四人都有参与','answer':'可以，都对'},
   {'question':'帖子只有一支视频吗？','answer':'只有一支视频'}],
  'evidenceType':'human_user_viewing_confirmation','agentFullPlayback':False,
  'limitations':['X原页读取403，代理未独立完整播放或逐句听辨；节目档案和同期讨论提供场合旁证。','本记录不是官方逐人署名或现场真唱结论。'],
  'scopeSources':[archive,discussion,url],'privateWrites':0,'deployments':0})
 stage={'platform':'x','videoId':'2090845225845747983','xMedia':{'videoIndex':1},'url':url,
  'sourceClass':'reupload','completeness':'full','performerScope':'full_group','versionMatch':True,
  'title':'QWER SHOW DOWN · バズリズム02 · 日语原版',
  'channel':'ming_baragi（X非官方转载）','kind':'music_program',
  'label':'电视音乐节目 · 日语原版 · 四人（人工确认／非官方转载）',
  'selection':{'occasion':'music_program','evidence':{'note':'日本电视台バズリズム02的2026-08-21节目档案及同期讨论的QWER SHOW DOWN链接相互对应；不是演唱会或活动录像。','urls':[archive,discussion,url]}},
  'sourceEvidence':{'note':'同期讨论直接链接该X帖子；用户确认完整首尾、日语原版、四人参与，并明确帖子仅一支视频，因此媒体序号为1。代理X页读取403，未独立播放。','urls':[discussion,url]},
  'likes':{'value':None,'display':'未知（整帖点赞不作单视频排名）','precision':'unknown'},'likesScope':'whole_post',
  'sourceUrl':url,'checkedAt':now,
  'languageVersionEvidence':{'basis':'用户对该精确帖子看片，确认完整日语原版、四人参与；独立于官方署名记录。'},
  'verificationNote':'用户已看片确认全曲日语原版、四人参与、帖子只有一支视频。代理未独立全片播放或逐句核音；X仅外链观看，不据此判断真唱。'}
 item={'recordId':'recvxIZRWKy9zg','status':'verified','selectedVideoId':stage['videoId'],'selectedSourceKey':key,
  'selected':stage,'candidates':[{**copy.deepcopy(stage),'eligibility':'eligible'}],
  'checkedAt':now,'reason':'用户确认的唯一合格同曲日语原版电视音乐节目转载；精确绑定帖子视频1，注明非官方和人工核验范围。',
  'comparisonLimited':True,'comparisonLimitation':'仅一个合格候选；未取得单视频点赞，不作最高点赞声明。'}
 assert checked_identity(stage)==key
 assert checked_comparison(stage,comparison_candidates(item['candidates']),reviewed_candidates=item['candidates'])=='single_candidate'
 write(HERE/'qwer-showdown-x-formal-20261029.json',{'formatVersion':'idol.stage-evidence.v1','checkedAt':now,'items':[item]})
 print('Prepared exact QWER X candidate; owner preimage required before binding.')
if __name__=='__main__':main()
