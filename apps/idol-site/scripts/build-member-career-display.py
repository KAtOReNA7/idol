"""Build the minimal public period projection. No member claims/overlays are adopted."""
import hashlib,json,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
raw=(root/'research/member-careers/data/canonical.json').read_bytes(); canonical=json.loads(raw)
sources=json.loads((root/'research/member-careers/data/source-index.json').read_text())['sources']
keys=['periodId','memberId','groupId','displayName','relationType','startDate','startPrecision','endDate','endPrecision','startDateBasis','endDateBasis','announcedDate','effectiveDate','sourceIds']
periods=[]
def event(date,precision,label):return {'date':date,'precision':precision,'label':label}
for r in canonical['memberPeriods']:
 if r['decision'] not in ['accepted','accepted_with_revision']:continue
 p={k:r[k] for k in keys}; extra=[]; name=r['displayName']; summary=r['summaryZh']
 # Explicit editorial event mappings retain event/report dates, never membership endpoints.
 if name=='GENBLUE':extra.append(event('2024-09-02','day','随 GENBLUE 以《COCOCO》在韩国出道'))
 if name=='EVOLution':extra.append(event(None,None,'参与 EVOLution《Mujuk》时期活动'))
 if name=='GIRLSET':extra.append(event('2025-08-15','day','JYP 公司报告以 GIRLSET 名义介绍四人阵容'))
 if name=='NewJeans' and 'GQ' in summary:extra.append(event('2023-07-24','day','以 NewJeans 成员身份接受 GQ《Get Up》专访'))
 if name=='PURPLE KISS' and '2025年11月16日' in summary:extra.append(event('2025-11-16','day','PURPLE KISS 全部官方团体活动结束公告'))
 if name=='Cherry Bullet' and '2024年4月22日' in summary:extra.append(event('2024-04-22','day','Cherry Bullet 官方团体活动结束公告'))
 if name=='Cherry Bullet' and '2019年12月13日' in summary:extra.append(event('2019-12-13','day','公司宣布其结束 Cherry Bullet 成员活动'))
 if name=='VVUP' and '2024年8月29日' in summary:extra.append(event('2024-08-29','day','公司宣布其结束 VVUP 成员活动'))
 if name=='woo!ah!' and '2020-08-14' in summary:extra.append(event('2020-08-14','day','woo!ah! 离团公告'))
 if r['relationType']=='activity_interval':
  d=r['announcedDate'];extra.append(event(d['value'] if d else None,d['precision'] if d else None,name.split(' · ')[0]+' 暂停团体活动公告'))
 p['events']=extra;periods.append(p)
used={s for p in periods for s in p['sourceIds']}
result={'formatVersion':'idol.member-career-periods.v1','researchCutoff':canonical['researchCutoff'],'canonicalSha256':hashlib.sha256(raw).hexdigest(),'periods':periods,'sources':[{k:s[k] for k in ['sourceId','url','title','publisher']} for s in sources if s['sourceId'] in used]}
out=root/'data/member-careers/periods.json';out.parent.mkdir(exist_ok=True);out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(len(periods),'periods;',len(result['sources']),'sources')
