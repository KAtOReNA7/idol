import artwork from '../../data/music-index-artwork.json';
import introductions from '../../data/artist-home-introductions.json';
import facts from '../../data/group-information-facts.json';
import completion from '../../data/group-statistics-completion-evidence.json';
import {formatFollowerCount,followerCount} from './follower-count.mjs';

const platforms={instagram:'INS',x:'X',youtube:'YouTube'};
export const followersInWan=formatFollowerCount;
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const https=value=>{try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:null;}catch{return null;}};
export const informationGroupId=slug=>artwork.find(g=>g.slug===slug)?.groupId;
export function groupInformationModel(slug,group){
 const row=facts[slug]??facts.groups?.[slug]??{};
 const completed=completion.groups?.[slug];
 const byPlatform=new Map();
 const candidates=completed?completed.social.filter(a=>a.accountExists===true):[...(group?.social??[]),...(row.social??[])];
 for(const account of candidates){
  if(!platforms[account.platform]||!https(account.url))continue;
  const previous=byPlatform.get(account.platform);
  if(!previous||(account.observedAt??'')>(previous.observedAt??''))byPlatform.set(account.platform,account);
 }
 const accounts=Object.keys(platforms).flatMap(platform=>byPlatform.has(platform)?[byPlatform.get(platform)]:[]);
 const storedSales=completed?.sales??row.sales;
 const sales=slug==='triples'&&storedSales?{...storedSales,notes:['采用可复算的Circle Album公开累计下界，统计截止2026-06；不是全球完整累计。旧汇总与历次差额保留在来源档案中，按用户决定不再追查。']}:storedSales;
 const introduction=Object.hasOwn(introductions,slug)?introductions[slug]:null;
 return {name:artwork.find(g=>g.slug===slug)?.name??slug,introduction,accounts:accounts.map(a=>{
  const observed=typeof a.observedValue==='number'&&Number.isFinite(a.observedValue)&&a.observedValue>=0&&a.observedAt;
  const legacy=a.observedAt?followersInWan(a.countLabel):null;
  return {...a,value:observed?followersInWan(String(a.observedValue)):legacy??'0人',fallbackZero:!observed&&!legacy};
 }).filter(a=>a.platform!=='x'||(followerCount(a.value)??0)>0),sales,wins:completed?.wins??row.wins};
}
const salesCoverage={
 triples:'tripleS 及所属分队的韩国 Circle Album 销量下限，统计至 2026 年 6 月。未计全球其他市场。',
 fromis9:'fromis_9 韩国 Circle 销量下限，统计至 2026 年 7 月。《FUN FACTORY》和《from our Memento Box》标准版按年度榜单统计。',
 madein:'MADEIN 本团韩国 Circle 销量下限，不含 LIMELIGHT 和 MADEIN S。',
 loona:'LOONA 团体专辑的韩国 Circle/Gaon 出货量，不含出道前个人、分队及日本发行。',
 vvup:'《Locked On》在 2024 年第 17 周的 Circle Album 销量，不含其他周、其他作品或零售榜销量。',
 geenius:'《Spoiler Book (WITHVUU)》在 2026 年 5 月 18 日的 Circle 零售销量。此数仅涵盖当天和该版本。',
 udtt:'Circle 零售榜收录《School Rush》2025 年 5 月 1 日 64 张、《VIPER》2026 年 7 月 10 日 39 张，合计 103 张。仅计这两个日期，各日之间的销量未计入。',
 badvillain:'《OVERSTEP》2024 年第 23、24 周的 Circle Album 销量合计，仅涵盖这两周。',
 bewave:'《BE;WAVE》2024 年第 16 周的 Circle Album 销量，仅涵盖这一周。'
};
const winCoverage={
 triples:'包含 tripleS 本团 5 次及分队 Visionary Vision 1 次，成员个人获奖另计。',
 xg:'Soridata 列出的韩国音乐节目一位为 0 次，不含年末奖。',
 rescene:'截至 2026 年 8 月 16 日，《Pretty Girl》4 次、《LOVE ATTACK》2 次，合计 6 次。',
 newjeans:'统计本团署名的一位，《Super Shy》按六次获奖计，成员个人及跨团合作另计。',
 aespa:'统计本团署名的一位，未计 KARINA 个人作品《Up》。',
 ive:'统计本团署名的一位，包括《BANG BANG》8 次、《BLACKHOLE》1 次。',
 lesserafim:'统计本团署名的一位，个人及跨团合作另计。',
 idle:'包含更名前后的获奖记录，分别为 70 次和 3 次。',
 vcha:'统计 VCHA 在韩国六个音乐节目的获奖，涵盖 2022—2026 年，截至 2026-10-29；不含 GIRLSET。'
};
function observedMetric(item){
 const value=item?.observedValue??item?.value;
 return Number.isFinite(value)&&value>=0&&!['conflicting','unverified','conflict','unavailable'].includes(item?.status)?value:null;
}
function publicMetricScope(slug,kind,item){
 const value=observedMetric(item);
 if(value===null)return '暂无可靠累计数据，显示为 0。';
 if(kind==='wins'){
  if(winCoverage[slug])return winCoverage[slug];
  if(value===0&&!item.asOf)return '来源记录的韩国音乐节目一位为 0 次，不含年末奖。';
  return item.scope??'韩国音乐节目一位。';
 }
 if(salesCoverage[slug])return salesCoverage[slug];
 if(item.lowerBound)return '韩国 Circle 榜单收录的实体发行累计下限，未计入其他市场。';
 return item.scope??'韩国实体发行销量。';
}
function metricCard(item,kind){
 const sales=kind==='sales';
 const value=observedMetric(item);
 const chart=item?.evidence?.chart;
 const retail=chart==='Circle Retail Album Chart';
 const limited=retail||item?.evidence?.periodType==='week'||/已核[^周]*周/.test(item?.title??'');
 const label=sales?(retail?'零售销量':limited?'专辑销量':'唱片累计销量'):'打歌一位总数';
 const scope=value===null?'暂无累计数据，显示为 0':sales?(item?.title?.replace(/^已核/,'').replace('下界','下限').replace('已公开累计','公开累计下限')??'唱片累计'):'团体音乐节目获奖';
 return `<article class="group-info-stat" data-stat-status="${value===null?'unavailable':escape(item.status??'observed')}"><span>${label}</span><strong>${(value??0).toLocaleString('zh-CN')}<em>${sales?'张':'次'}</em></strong><small>${escape(scope)}</small></article>`;
}
function publicSourceTitle(title){
 if(!title)return '';
 return title.replace(/^X · 用户人工观察（([^，]+)，原始显示 ([^；]+)；未独立抓取）$/,'用户记录（$1，原始显示 $2）')
  .replace('已核实公开团页的官方账号','官方账号').replace('官方原生接口读回','官方榜单')
  .replace('发行及期间下界复算','发行销量与统计期').replace('年榜交叉核验 (可读复本)','年榜（转载）')
  .replace('年榜交叉核验 (官方索引)','年榜（官方索引）').replace('逐期获奖记录核对','各期获奖记录');
}
export function renderGroupInformation(slug,group){
 const model=groupInformationModel(slug,group);
 // Several artist designs already introduce the group in the hero. Only add
 // copy here for the designs whose information section supplies the introduction.
 const {introduction}=model;
 const paragraph=introduction&&introduction.placement!=='hero'?`<p class="group-info-introduction" data-home-introduction="${escape(slug)}"><span class="group-intro-label">团体介绍</span>${escape(introduction.text)}</p>`:'';
 const introductionSources=introduction?.sources.flatMap(({label,url})=>{
  const href=https(url);
  return href?[`<li><a href="${escape(href)}" target="_blank" rel="noopener noreferrer">${escape(label)} ↗</a></li>`]:[];
 }).join('')??'';
 const social=model.accounts.map(a=>`<article class="group-info-stat" data-stat-status="${a.fallbackZero?'unavailable':escape(a.status??'observed')}"><a href="${escape(https(a.url))}" target="_blank" rel="noopener noreferrer"><span>${platforms[a.platform]} ↗</span><strong>${escape(a.value)}</strong></a><small>${a.platform==='youtube'?'订阅':'粉丝'}${a.observedAt?' · '+escape(a.observedAt.slice(0,10)):''}</small>${a.subjectName&&a.subjectName.toLowerCase()!==model.name.toLowerCase()?`<small>账号现名 / ${escape(a.subjectName)}</small>`:''}</article>`).join('');
 const evidence=['粉丝和订阅人数达到一万时四舍五入为整数万，不足一万时显示人数。日期为观察日或来源更新日，非实时人数。',
  ...model.accounts.filter(a=>a.fallbackZero).map(a=>`${platforms[a.platform]} 暂无人数数据；显示的 0 不是已确认的零。`),
  ...['sales','wins'].flatMap(k=>{
   const item=model[k];
   if(!item)return [];
   const days=item.evidence?.dayRows?.map(row=>row.date).filter(Boolean);
   const period=item.evidence?.periodLabel||(days?.length?[...new Set(days)].join('、'):null);
   const date=period?(item.evidence?.periodType==='week'?'统计周 ':'统计日 ')+period:item.asOf?'截至 '+item.asOf:'来源未注明统计截止日';
   return [`${k==='sales'?'销量':'一位'}：${publicMetricScope(slug,k,item)} ${date}。`];
  })];
 const sources=[...model.accounts.map(a=>{const url=https(a.sourceUrl??a.url);return `<li><a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${platforms[a.platform]} · ${escape(publicSourceTitle(a.sourceTitle)||(a.observedAt?'人数公开记录 '+a.observedAt.slice(0,10):'官方账号，人数未查得'))} ↗</a></li>`;}),...['sales','wins'].flatMap(k=>{const a=model[k],sources=a?.sources?.length?a.sources:[{url:a?.sourceUrl,title:a?.sourceTitle}];return sources.flatMap(s=>{const url=https(s.url);return url?[`<li><a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(publicSourceTitle(s.title)||(k==='sales'?'销量来源':'一位来源'))} ↗</a></li>`]:[];});})].join('');
 return `<section class="group-information" data-home-module="information" aria-label="${escape(model.name)} 信息"><header><small>INFORMATION</small><h2>信息</h2></header>${paragraph}<div class="group-info-grid" data-stat-count="${model.accounts.length+2}">${social?`<div class="group-info-social" aria-label="社媒人数">${social}</div>`:''}<div class="group-info-records" aria-label="作品成绩">${metricCard(model.sales,'sales')}${metricCard(model.wins,'wins')}</div></div><details class="group-info-sources"><summary>${introduction?'资料来源与统计日期':'统计日期与来源'}</summary>${introductionSources?`<ul aria-label="团体介绍来源">${introductionSources}</ul>`:''}${evidence.map(t=>`<p>${escape(t)}</p>`).join('')}<ul>${sources}</ul></details></section>`;
}
