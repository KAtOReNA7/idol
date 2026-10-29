"""Record user-supplied public embed identity; prepare, never bind, the candidate."""
import copy
import datetime
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
def read(p): return json.loads(p.read_text(encoding='utf-8'))
def write(p, data): p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')

def main():
    p = ROOT / 'apps/idol-site/data/stages/supplements.json'
    supplements = read(p)
    receipt = read(HERE / 'password-user-confirmation.json')
    rid = receipt['workId']
    current = supplements['works'][rid]['searchReview']
    assert current == receipt['after'], 'Unexpected current research note'
    url = 'https://www.bilibili.com/video/BV1bhU8BWEso/?p=1&cid=34265369310'
    iframe = '<iframe src="//player.bilibili.com/player.html?isOutside=true&aid=115613221522100&bvid=BV1bhU8BWEso&cid=34265369310&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>'
    key = 'bilibili:BV1bhU8BWEso:cid:34265369310:p:1'
    receipt['embedIdentity'] = {'evidenceType':'user_supplied_public_share_embed','iframe':iframe,
        'bvid':'BV1bhU8BWEso','aid':'115613221522100','cid':'34265369310','page':1,'sourceKey':key}
    receipt['notIndependentlyVerified'] = ['agent_full_playback','fresh_owner_empty_score','complete_save_log','online_original_binding']
    receipt['identityLimitation'] = 'CID/page read from user-supplied public share code, not independently fetched from Bilibili API after 412/browser connection timeouts.'
    summary = 'TBS节目回顾确认tripleS ∞!《Password》参加PLAYLIST；B站非官方转载的完整首尾、原日／英混合版本及8人分队全员参与，已由用户看片确认。用户提供的公开分享代码明确BV1bhU8BWEso／CID34265369310／第1P。代理未独立完整播放；正式评分绑定仍待新鲜owner空分、完整保存日志和线上原绑定核对，尚未采用为本条舞台。'
    current['summary'] = current['publicNote']['summary'] = summary
    current['limitations'] = ['内容范围来自用户看片确认；精确BV／CID／分P来自用户提供的公开分享代码。代理未独立完整播放，正式采用前仍须owner保护核对。']
    for source in current['scope'] + current['publicNote']['sources']:
        if 'BV1bhU8BWEso' in source['url']:
            source.update(url=url,label='B站：Password @PLAYLIST转载（人工已确认内容及精确分P）')
    receipt['after'] = copy.deepcopy(current)
    write(p,supplements)
    receipt['afterSupplementsSha256'] = hashlib.sha256(p.read_bytes()).hexdigest()
    write(HERE / 'password-user-confirmation.json',receipt)
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    stage = {
        'videoId':'BV1bhU8BWEso','url':url,'bilibili':{'cid':'34265369310','page':1},
        'platform':'bilibili','sourceClass':'reupload','completeness':'full','performerScope':'full_unit',
        'title':'251126 tripleS ∞! Password @PLAYLIST','channel':'tripleS_能量站',
        'versionMatch':True,'kind':'music_program','label':'电视节目打歌 · 日／英混合原版 · 八人分队（人工确认／非官方转载）',
        'selection':{'occasion':'music_program','evidence':{
            'note':'TBS PLAYLIST 2025-11-25节目回顾列出tripleS ∞! Password；转载标题与节目对应。属于电视音乐节目，不是演唱会或活动录像。',
            'urls':['https://www.tbs.co.jp/playlist-tbs/archive/20251125/',url]}},
        'sourceEvidence':{'note':'用户看片确认精确BV中的全曲、原日／英混合版本和八人分队全员；用户随后复制公开分享嵌入代码确认CID34265369310、第1P。上传者为tripleS_能量站，按非官方转载标注；简介只写YTB，未宣称已找到原YouTube上传。',
            'urls':[url,'https://space.bilibili.com/3493081055758830/']},
        'likes':{'value':None,'display':'未知（整BV点赞不作分P排名）','precision':'unknown'},
        'likesScope':'whole_video','sourceUrl':url,'checkedAt':now,
        'languageVersionEvidence':{'basis':'2026-10-29用户对BV1bhU8BWEso确认开始至结束完整、对应原日／英混合版本、8人全；未把全团其他成员补入该八人分队。'},
        'verificationNote':'用户完整看片确认原日／英混合版和八人分队全员；CID／分P取自用户公开分享代码。代理未独立全片播放或逐句音轨比对，不据此判断真唱。正式采用前须核新鲜owner空分、完整日志和线上无旧绑定。'}
    item = {'recordId':rid,'status':'verified','selectedVideoId':stage['videoId'],
        'selectedSourceKey':key,'selected':stage,'candidates':[{**copy.deepcopy(stage),'eligibility':'eligible'}],
        'reason':'现有唯一已核同曲同版本合格电视节目来源；接受用户完整看片与公开分享代码作为有限核验证据，明确非官方转载和核验范围。',
        'checkedAt':now,'comparisonLimited':True,
        'comparisonLimitation':'仅一个合格同版本候选；整BV点赞不能证明精确分P点赞，不作最高点赞声明。'}
    write(HERE / 'password-playlist-formal-20261029.json',{'formatVersion':'idol.stage-evidence.v1','checkedAt':now,'items':[item]})

if __name__ == '__main__': main()
