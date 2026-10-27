"""Reproduce the 704-gap classification from frozen, previously reviewed evidence.

This is an offline evidence audit, not a downloader or an image-import command.
Run from any directory: python docs/codex/reports/20261027-gap-704-classification/build.py
"""
import csv
import hashlib
import html
import json
from collections import Counter, defaultdict
from pathlib import Path

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[3]
LEDGER = ROOT / 'docs/codex/reports/20261027-gap-o/ledger.json'
AUDIT = ROOT / 'docs/codex/mv-identity-asset-audit-20261025.json'
RESEARCH = ROOT / 'docs/codex/reports/20261026-gap-k'

def read(path):
    return json.loads(path.read_text(encoding='utf-8'))

def write(path, value):
    path.write_text(value, encoding='utf-8', newline='\n')

def relative(path):
    return path.relative_to(ROOT).as_posix()

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def key(row):
    return tuple(row[k] for k in ('workId', 'videoId', 'memberId', 'ratingId'))

CATEGORIES = [
    dict(id='source_has_no_target_image', label='已查资料页没有目标作品图', expected=291,
         reason='现有具名成员资料页没有目标歌曲章节或对应图片，只能排除这一个已查入口。',
         plan='按精确 videoId 改查官方 MV 拍摄专题、发行方和成员公开帖；枚举图集全部原件。历史成员回查当时所属团体来源，停止重复扫描已确认无目标章节的资料页。',
         fallback='若第一入口仍无图，登记已读正文和检索范围，换官方幕后及具名现场视频；保留开放，不写成全网无图。'),
    dict(id='not_mv_shoot', label='素材用途不符或 MV 拍摄依据未证', expected=101,
         reason='同单曲专题、相同妆造、页面嵌入 MV，都不能证明照片拍摄于目标 MV。',
         plan='确定为封套或其他作品的照片退出候选；用途未明的照片查原发布正文、制作方拍摄说明或可追溯目标镜头。无法补齐依据就另找 MV 现场原件。',
         fallback='具名概念照只作研究线索，不导入认人槽；转向精确 MV 的具名原生视频帧。'),
    dict(id='identity_unproven', label='候选图或画面存在，逐图人物姓名未证', expected=93,
         reason='官方图集可能确认 MV 拍摄，却未给单张照片逐人署名；名单、双人题注及嘉宾组名也不能唯一指向某个人。',
         plan='优先枚举完整官方图集，找可靠逐图具名的原帖或转载，用同一完整照片的像素对应关联官方原件；也可采用明确姓名字幕与同一镜头人物的唯一对应。跨团嘉宾查本人及所属团体来源。',
         fallback='标题与文件名冲突时找独立来源；孤立 Pinterest 标签、相似脸、服装、站位和排除法均不用于定名。未证就继续开放。'),
    dict(id='insufficient_pixels', label='原生有效像素不足', expected=77,
         reason='横图、黑边或小尺寸原件在实际 3:4 裁切后不足 540×720；下载成功和标称高清不代表合格。',
         plan='先找发布方声明的原图或完整多图原件；仍小则取得更高原生分辨率的精确视频，以已有具名图片与相同完整镜头对应后提取原生帧，保存来源和时间点。',
         fallback='无法恢复原生细节则换同一 MV 的另一张具名近景；不得插值放大、生成补脸、补边或把 537px 四舍五入成 540px。'),
    dict(id='wrong_version', label='目标视频版本不符或尚未消歧', expected=70,
         reason='同歌韩/日/英版、Part.1/2、Side A/B、重剪或其他特别版本不能互相默认替用。',
         plan='先按 videoId 建版本对照，核对语言、分部和官方发布；每张照片证明属于目标版本或目标 MV 拍摄。跨版本复用须有同一实际镜头及明确来源证据。',
         fallback='原版无法对应就查目标版本专属幕后和具名原帧；不以歌曲名、发行年份或同套服装消除版本差异。'),
    dict(id='research_incomplete', label='新来源或具名画面尚未完成审查', expected=56,
         reason='部分只定位到幕后入口或商品收录说明，尚未完成正文、逐图姓名、原件和实际裁切的证据链。',
         plan='分开处理：26 条先审官方幕后/Sketch 入口的实际内容；10 条只有名单/报道需另找单图来源；8 条商品附录线索转查公开官方素材；8 条新作核实真正专题正文；4 条继续精确作品来源检索。',
         fallback='幕后入口不保证存在合格具名镜头；商品说明不代表已取得图片，不自动购买或转载付费附录。遇新阻碍按证据改类，不能把待查写成无图。'),
    dict(id='obscured_composition', label='实际清晰度、遮挡或构图不合格', expected=11,
         reason='原图尺寸可能过关，但面部太小、运动模糊、暗光、特效/眼镜/手遮挡、闭眼或头顶出框影响识别。',
         plan='审同帖其他完整原件或具名连续镜头的相邻清晰帧，优先原生近景；按实际 3:4 显示检查脸部细节与完整构图。',
         fallback='同一低质画面反复裁切不能增加细节；换来源，不做 AI 修脸、锐化伪造或补全出框部位。'),
    dict(id='source_access', label='原来源入口失效', expected=5,
         reason='均为 ADYA《왜 불러 (What’s Up?)》：旧 Naver 短链跳到首页，无法取得原正文。',
         plan='恢复文章原始永久链接，查官方其他平台转载、公开存档或同 MV 幕后；可转向 starting House / ADYA 官方具名现场原件。',
         fallback='停止重复失效短链；不绕过登录或访问限制。只恢复页面仍不算补图，须继续身份、精确 MV 和质量审查。'),
]

def subtype(row):
    c, g, song = row['primaryCategory'], row['group'], row['song']
    if c == 'not_mv_shoot':
        if g in ('ODD YOUTH', 'UDTT'):
            return '其他作品或专题素材', '替换为目标作品图源，不能仅修改图片说明。'
        if g in ('ILLIT', 'NMIXX', 'aespa', 'fromis_9', 'izna'):
            return '照片用途尚未证明是 MV', '先核原帖的拍摄用途；无证据则换源，不能当成已证实错误版本。'
        return '明确封套拍摄素材', '现候选不采用；直接寻找 MV 现场或原生具名帧。'
    if c == 'research_incomplete':
        if g in ('Geenius', 'SPIA'):
            return '只有名单、署名或新闻报道', '先发现逐图来源；名单和制作署名不能给人物画面定名。'
        if (g == 'IVE' and song == 'CRUSH') or (g == 'tripleS' and song == 'Untitled'):
            return '仅商业附录收录线索', '查公开官方预览、具名剧照和幕后，不将商品列项当作已取得图源。'
        if g == 'UNIS' and song == 'Milky Way':
            return '新作的正文或图集待确认', '核 Melon 等入口是否真是本作正文，推荐列表和旧作图不计。'
        if g == 'KISS OF LIFE':
            return '尚无可用精确作品来源', '继续检索精确视频及发行/制作方，不用宣传或演唱会照片替代。'
        assert g in ('BEWAVE', 'KiiiKiii', 'UNIS', 'VVUP')
        return '已定位幕后或 Sketch 入口，内容待审', '实际取得并审查正文/视频与人工字幕；另剪 Sketch 需证明 MV 拍摄关系，元数据不够。'
    if c == 'source_has_no_target_image':
        return '已查资料页不含目标图', '仅否定已查资料页，换来源家族，不重复相同成员页盲查。'
    if c == 'wrong_version':
        return '版本对应须逐视频确认', '保留原具体问题，不把所有待消歧记录说成已证实用错。'
    if c == 'identity_unproven' and g == 'ILLIT' and song == 'Tick-Tack':
        return '官方 70 图已读，剩余人物署名未证', '依据 O 批更新，当前障碍是逐图身份；旧 not_mv_shoot 细分类不再当作当前结论。'
    return row.get('detailedProblem', c), '按本条具体问题及原研究步骤执行，采用前复核全部共同条件。'

def main():
    ledger, audit = read(LEDGER), read(AUDIT)
    rows = [r for r in ledger['entries'] if r['status'] == 'open']
    source_keys = {'research-profiles.json': 'rows', 'research-official.json': 'entries',
                   'research-followup.json': 'solutions', 'research-same-video.json': 'solutions',
                   'research-profiles-part2.json': 'openResults'}
    indexes = {n: {r['ratingId']: r for r in read(RESEARCH / n)[k]} for n, k in source_keys.items()}
    expected = {key(dict(m, workId=w['workId'], videoId=w['videoId']))
                for w in audit['workCoverage'] for m in w['missingIdentityRelationships']}
    assert len(rows) == len({key(r) for r in rows}) == 704
    assert {key(r) for r in rows} == expected
    assert len(ledger['entries']) == 871 and sum(r['status'] == 'resolved' for r in ledger['entries']) == 167
    assert all(r.get('researchExhausted') is False for r in rows)
    counts = Counter(r['primaryCategory'] for r in rows)
    assert counts == Counter({c['id']: c['expected'] for c in CATEGORIES})
    categories = {c['id']: c for c in CATEGORIES}
    result = []
    for row in rows:
        c = categories[row['primaryCategory']]
        detail, action = subtype(row)
        evidence = RESEARCH / row['researchEvidenceFile']
        record = indexes[evidence.name][row['ratingId']]
        assert key(record) == key(row)
        assert row['problemEvidence'] and row['steps'] and row['sources'] and row['acceptanceCriteria']
        latest = row.get('researchEvidence')
        assert not latest or (ROOT / latest).is_file()
        result.append(dict(
            **{k: row[k] for k in ('ratingId','memberId','memberName','workId','videoId','song','group')},
            stageName=row.get('stageName') or record.get('stageName', ''), status='open',
            primaryCategory=c['id'], categoryLabel=c['label'], subtype=detail,
            problemEvidence=row['problemEvidence'], nextAction=action,
            categoryPlan=c['plan'], fallback=c['fallback'], specificSteps=row['steps'],
            acceptanceCriteria=row['acceptanceCriteria'], sources=row['sources'],
            evidenceFile=relative(evidence), evidenceRowKey=row['ratingId'], latestEvidenceFile=latest,
            historicalDetailedProblem=row.get('detailedProblem'),
            historicalSecondaryCategories=row.get('secondaryCategories', []),
            validationStage=row['validationStage'], researchExhausted=False,
            reviewScope='本轮离线逐条交叉核对既有记录；未对本条重新执行全网检索或原件质量复审。'))
    subcounts = Counter(r['subtype'] for r in result)
    for label, n in [('明确封套拍摄素材',60),('其他作品或专题素材',9),('照片用途尚未证明是 MV',32),
                     ('已定位幕后或 Sketch 入口，内容待审',26),('只有名单、署名或新闻报道',10),
                     ('仅商业附录收录线索',8),('新作的正文或图集待确认',8),('尚无可用精确作品来源',4)]:
        assert subcounts[label] == n, (label, subcounts[label])
    queues = defaultdict(list)
    for row in result:
        queues[(row['workId'], row['videoId'])].append(row)
    work_queues = [dict(workId=w, videoId=v, group=rs[0]['group'], song=rs[0]['song'],
                        missing=len(rs), categoryCounts=dict(Counter(r['categoryLabel'] for r in rs)),
                        ratingIds=[r['ratingId'] for r in rs],
                        sourceUrls=sorted({s['url'] for r in rs for s in r['sources']}))
                   for (w,v),rs in queues.items()]
    assert len(queues) == 168 and len({r['group'] for r in result}) == 42
    for c in CATEGORIES:
        subset = [r for r in result if r['primaryCategory'] == c['id']]
        c.update(count=len(subset), percent=round(100*len(subset)/704,1),
                 workVideoPairs=len({(r['workId'],r['videoId']) for r in subset}),
                 groups=len({r['group'] for r in subset}),
                 subtypes=dict(Counter(r['subtype'] for r in subset)))
    payload = dict(schemaVersion=1, auditedOn='2026-10-27',
                   scope='逐条复核既有证据与当前缺口集合；不是本轮重新在线检索全部 704 条。',
                   summary=dict(missing=704,workVideoPairs=168,groups=42,originalFrozen=871,
                                resolved=167,lowQualityExistingExcluded=43,unknownStatisticsExcluded=18),
                   categories=CATEGORIES, entries=result, workQueues=work_queues,
                   sourceHashes={relative(p):sha(p) for p in [LEDGER,AUDIT,LEDGER.parent/'research-notes.md']+[RESEARCH/n for n in source_keys]})
    write(OUT/'classification.json', json.dumps(payload,ensure_ascii=False,indent=2)+'\n')
    with (OUT/'classification.csv').open('w',encoding='utf-8-sig',newline='') as f:
        fields=['group','song','stageName','memberName','videoId','workId','memberId','ratingId','categoryLabel',
                'subtype','problemEvidence','nextAction','categoryPlan','fallback','specificSteps','sources',
                'evidenceFile','evidenceRowKey','latestEvidenceFile','acceptanceCriteria','reviewScope']
        writer=csv.DictWriter(f,fieldnames=fields,extrasaction='ignore');writer.writeheader()
        for r in result:
            writer.writerow({k:json.dumps(v,ensure_ascii=False) if isinstance(v,(list,dict)) else v for k,v in r.items() if k in fields})
    verification = dict(status='passed',missingTupleSetEqualsCanonicalAudit=True,uniqueRows=704,
                        sourceResearchRowsMatched=704,reasonSourcePlanAcceptancePresent=704,
                        workVideoPairs=168,groups=42,categoryTotal=sum(counts.values()),
                        resolvedRowsExcluded=167,existingLowQualityNotMixedIn=43,
                        subtypeCountAssertions='passed',sourceHashes=payload['sourceHashes'],
                        runtimeChanges=False,imageImports=0,newDeployment=False,
                        notPerformed=['全部 704 条重新在线检索','原件重新逐张实看','网站运行测试或重新部署'])
    write(OUT/'verification.json',json.dumps(verification,ensure_ascii=False,indent=2)+'\n')
    render_html(payload)
    print(json.dumps(dict(status='passed',missing=704,works=168,groups=42,categories=dict(counts)),ensure_ascii=False))

def render_html(payload):
    esc = html.escape
    cards=''.join(f'<button class="category" data-category="{c["id"]}"><b>{c["count"]}</b>{esc(c["label"])}</button>' for c in CATEGORIES)
    blocks=[]
    for r in payload['entries']:
        links=' '.join(f'<a href="{esc(s["url"],quote=True)}" target="_blank" rel="noopener noreferrer">来源 {i+1}</a>' for i,s in enumerate(r['sources']))
        evidence_path=r['latestEvidenceFile'] or r['evidenceFile']
        local='../../../../'+evidence_path
        steps=''.join(f'<li>{esc(s)}</li>' for s in r['specificSteps'])
        search=' '.join(str(r[k]) for k in ('group','song','stageName','memberName','videoId','categoryLabel','subtype','problemEvidence','ratingId'))
        blocks.append(f'''<article data-category="{r['primaryCategory']}" data-search="{esc(search,quote=True)}">
<h2>{esc(r['group'])} · {esc(r['song'])} · {esc(r['stageName'] or r['memberName'])}</h2>
<p class="tag">{esc(r['categoryLabel'])} / {esc(r['subtype'])}</p>
<p><strong>当前原因：</strong>{esc(r['problemEvidence'])}</p><p><strong>下一步：</strong>{esc(r['nextAction'])}</p>
<details><summary>具体来源、处理步骤和采用条件</summary><ol>{steps}</ol>
<p>{esc(r['categoryPlan'])}</p><p><strong>仍失败时：</strong>{esc(r['fallback'])}</p>
<p>{links} <a href="{local}">仓库证据</a></p>
<ul>{''.join('<li>'+esc(s)+'</li>' for s in r['acceptanceCriteria'])}</ul>
<p class="muted">videoId: {esc(r['videoId'])} · ratingId: {esc(r['ratingId'])}<br>{esc(r['reviewScope'])}</p></details></article>''')
    page='''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>704 条认人图缺口：原因与处理路线</title><style>
*{box-sizing:border-box}body{margin:0;background:#f5f5f7;color:#202124;font:16px/1.65 system-ui,sans-serif}main{max-width:1150px;margin:auto;padding:28px 18px}h1{font-size:30px;line-height:1.3}h2{font-size:19px;margin:0}.muted{color:#61656c;font-size:14px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}.category{font:inherit;text-align:left;background:white;border:1px solid #ccd0d5;padding:14px;border-radius:12px;cursor:pointer}.category b{display:block;font-size:26px}.category[aria-pressed=true]{border:2px solid #b42953;background:#fff4f7}.controls{position:sticky;top:0;background:#f5f5f7;padding:14px 0;z-index:1;display:flex;gap:10px;flex-wrap:wrap}input,select,button{font:inherit;padding:8px;max-width:100%}input{flex:1;min-width:200px}article{background:#fff;padding:20px;border:1px solid #ddd;border-radius:12px;margin:14px 0;overflow-wrap:anywhere}article[hidden]{display:none}.tag{color:#9c2646;font-size:14px}a{color:#175db0;margin-right:10px}summary{cursor:pointer;color:#175db0}p{margin:10px 0}li{margin:6px 0}#count{font-weight:700}
</style><main><h1>704 条认人图缺口：原因与处理路线</h1>
<p>42 团 · 168 个精确作品/视频 · 原 871 条已补 167。本表按每条当前主要障碍计数，不重复相加。</p>
<p class="muted">2026-10-27：本轮逐条交叉核对既有研究证据与当前审计，不代表重新在线穷尽所有来源。43 张已存在低清图、18 项未知统计不在此表。GitHub 候选与正式站部署分别记录。</p>
<p><a href="classification.csv" download>下载全部 704 条 CSV</a><a href="classification.json">完整 JSON 与 168 个作品队列</a><a href="../../remaining-704-classification-20261027.md">分类报告</a></p>
<div class="grid">__CARDS__</div><div class="controls"><input id="query" aria-label="搜索团体作品成员或原因" placeholder="搜索团体、作品、成员、原因或 videoId"><select id="category" aria-label="按主要原因筛选"><option value="">全部原因</option>__OPTIONS__</select><button id="reset">清除筛选</button></div>
<p id="count" aria-live="polite">704 / 704 条</p>__BLOCKS__</main><script>
const query=document.querySelector('#query'),select=document.querySelector('#category'),rows=[...document.querySelectorAll('article')];
function filter(){const terms=query.value.toLocaleLowerCase().trim().split(/\\s+/).filter(Boolean);let n=0;for(const row of rows){const ok=(!select.value||row.dataset.category===select.value)&&terms.every(t=>row.dataset.search.toLocaleLowerCase().includes(t));row.hidden=!ok;if(ok)n++;}document.querySelector('#count').textContent=n+' / 704 条';document.querySelectorAll('.category').forEach(b=>b.setAttribute('aria-pressed',String(select.value===b.dataset.category)));}
query.addEventListener('input',filter);select.addEventListener('change',filter);document.querySelectorAll('.category').forEach(b=>b.addEventListener('click',()=>{select.value=select.value===b.dataset.category?'':b.dataset.category;filter();}));document.querySelector('#reset').addEventListener('click',()=>{query.value='';select.value='';filter();});filter();
</script></html>'''
    page=page.replace('__CARDS__',cards).replace('__OPTIONS__',''.join(f'<option value="{c["id"]}">{esc(c["label"])}（{c["count"]}）</option>' for c in CATEGORIES)).replace('__BLOCKS__','\n'.join(blocks))
    write(OUT/'ledger.html',page)

if __name__ == '__main__':
    main()
