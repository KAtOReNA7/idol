"""Prepare user-confirmed full Japanese song interval in the exact Bilibili part."""
import copy,datetime,json
from pathlib import Path
HERE=Path(__file__).resolve().parent
def write(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
def main():
 now=datetime.datetime.now(datetime.timezone.utc).isoformat()
 url='https://www.bilibili.com/video/BV1bo4y1x7LV/?p=1&cid=1115512650'
 official='https://www.tv-tokyo.co.jp/melodix_premium/backnumber/202305.html'
 report='https://nantejapan.com/akb48-fantastics-and-more-perform-on-premium-melodix-for-may-1/'
 proof={'note':'2026-10-29用户看片确认18:05到21:13完整、日语原版、合格；回应的检查项包含六人范围。随后用户报告第1P总长0:24:29。区间为人工确认，不冒称代理完整播放或自动裁切。','urls':[url,official,report]}
 key='bilibili:BV1bo4y1x7LV:cid:1115512650:p:1@1085-1273'
 s={'videoId':'BV1bo4y1x7LV','bilibili':{'cid':'1115512650','page':1},'platform':'bilibili','sourceClass':'reupload','completeness':'full','performerScope':'full_group','url':url,
    'title':'STAYC Teddy Bear（日语版）· Premium MelodiX!节目内18:05–21:13区间',
    'channel':'Premium MelodiX!节目转载（上传者名称未取得）','kind':'broadcast_stage',
    'label':'电视节目内完整单曲区间 · 日语原版 · 非官方转载（人工确认）',
    'versionMatch':True,'selection':{'occasion':'music_program','evidence':{'note':'东京电视台2023-05-01节目回顾列出STAYC Teddy Bear日语版；同期NanteJapan报道直接链接此BV转载。不是音乐节或演唱会。','urls':[official,report,url]}},
    'sourceEvidence':{'note':'NanteJapan直接链接BV1bo4y1x7LV；用户从分享代码给出CID1115512650／第1P。按非官方转载标注，上传者名称未取得，不冒称官方上传。','urls':[report,url]},
    'clip':{'startSeconds':1085,'endSeconds':1273,'sourceDurationSeconds':1469,'evidence':proof},
    'fullVideoDurationSeconds':1469,'likesScope':'whole_video','likes':{'value':None,'display':'未知（整片点赞不作单曲排名）','precision':'unknown'},
    'languageVersionEvidence':{'basis':proof['note']},'sourceUrl':url,'checkedAt':now,
    'verificationNote':'用户确认日语原版完整区间18:05–21:13及第1P总长24:29，精确BV／CID／分P来自公开分享代码；代理未独立完整播放或逐句核对。B站仅外链，需手动定位并在21:13停止，评分仅对应这个区间。采用前须核新鲜owner空分、完整日志与线上原绑定。'}
 item={'recordId':'recvxyH5pzoMAf','status':'verified','selectedVideoId':s['videoId'],'selectedSourceKey':key,'selected':s,'candidates':[{**copy.deepcopy(s),'eligibility':'eligible'}],
    'reason':'用户完整看片确认的日语原版电视节目区间；官方节目资料与同期转载入口对应，整分P与区间身份分开，不把其他艺人的节目内容计入评分。','checkedAt':now,'comparisonLimited':True,'comparisonLimitation':'唯一已核同版打歌区间，整片点赞未知，不作单曲最高点赞声明。'}
 write(HERE/'stayc-teddy-bear-formal-20261029.json',{'formatVersion':'idol.stage-evidence.v1','checkedAt':now,'items':[item]})
 write(HERE/'stayc-user-confirmation.json',{'checkedDate':'2026-10-29','workId':item['recordId'],'url':url,'sourceKey':key,
   'evidenceType':'user_playback_observation_and_public_share_embed','userStatement':'18:05到21:13，完整，日语原版，合格。',
   'durationStatement':'0时24分29秒','iframe':'<iframe src="//player.bilibili.com/player.html?isOutside=true&aid=398245824&bvid=BV1bo4y1x7LV&cid=1115512650&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>',
   'clip':s['clip'],'agentFullPlayback':False,'privateWrites':0})
if __name__=='__main__':main()
