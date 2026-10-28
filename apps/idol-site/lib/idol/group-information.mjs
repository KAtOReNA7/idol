import artwork from '../../data/music-index-artwork.json';
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
 return {name:artwork.find(g=>g.slug===slug)?.name??slug,accounts:accounts.map(a=>{
  const observed=typeof a.observedValue==='number'&&Number.isFinite(a.observedValue)&&a.observedValue>=0&&a.observedAt;
  const legacy=a.observedAt?followersInWan(a.countLabel):null;
  return {...a,value:observed?followersInWan(String(a.observedValue)):legacy??'0人',fallbackZero:!observed&&!legacy};
 }).filter(a=>a.platform!=='x'||(followerCount(a.value)??0)>0),sales:completed?.sales??row.sales,wins:completed?.wins??row.wins};
}
export function renderGroupInformation(slug,group){
 const model=groupInformationModel(slug,group);
 const social=model.accounts.map(a=>`<article class="group-info-stat" data-stat-status="${a.fallbackZero?'unavailable':escape(a.status??'observed')}"><a href="${escape(https(a.url))}" target="_blank" rel="noopener noreferrer"><span>${platforms[a.platform]} ↗</span><strong>${escape(a.value)}</strong></a><small>${a.platform==='youtube'?'订阅':'粉丝'}${a.observedAt?' · '+escape(a.observedAt.slice(0,10)):''}</small>${a.subjectName&&a.subjectName.toLowerCase()!==model.name.toLowerCase()?`<small>账号现名 / ${escape(a.subjectName)}</small>`:''}</article>`).join('');
 const metric=(item,kind)=>{const retail=kind==='sales'&&item?.evidence?.chart==='Circle Retail Album Chart',label=retail?'已核零售销量':kind==='sales'?'唱片累计销量':'打歌一位总数',value=item?.observedValue??item?.value,valid=typeof value==='number'&&Number.isFinite(value)&&value>=0&&!['conflicting','unverified','conflict','unavailable'].includes(item?.status);const scope=valid?(kind==='sales'?(item?.title??'唱片累计'):'团体音乐节目获奖'):(kind==='sales'?'唱片统计':'音乐节目');return `<article class="group-info-stat" data-stat-status="${valid?escape(item?.status??'observed'):'unavailable'}"><span>${escape(label)}</span><strong>${escape((valid?value:0).toLocaleString('zh-CN'))}${kind==='sales'?'<em>张</em>':'<em>次</em>'}</strong><small>${escape(scope)}</small>${item?.asOf?`<small>${retail?'统计日':'截至'} ${escape(item.asOf)}</small>`:''}</article>`;};
 const evidence=['粉丝数以万为单位四舍五入显示整数；不足一万显示整数人数。原始精度保留在来源记录中，日期为对应观察或来源更新日。','未查得可靠数字或来源冲突时按本页设置显示0；这类0不是已确认的零，核查状态与来源记录仍保留。',...model.accounts.filter(a=>a.fallbackZero).map(a=>`${platforms[a.platform]}：已核实账号，未查得可靠人数，显示0。`),...['sales','wins'].flatMap(k=>{const a=model[k];return a?[`${k==='sales'?'销量':'一位'}：${a.scope??''} ${a.dateNote??(a.asOf?'截至 '+a.asOf:'来源未注明统计截止日')}${['unavailable','conflict','conflicting','unverified'].includes(a.status)?'；未查得可靠累计值，显示0。':a.status==='confirmed-zero'?'；来源确认零。':''}`,...(a.notes??[])]:[];})].filter(Boolean);
 const sources=[...model.accounts.map(a=>{const url=https(a.sourceUrl??a.url);return `<li><a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${platforms[a.platform]} · ${escape(a.sourceTitle??(a.observedAt?'人数公开记录 '+a.observedAt.slice(0,10):'官方账号，人数未查得'))} ↗</a></li>`;}),...['sales','wins'].flatMap(k=>{const a=model[k],sources=a?.sources?.length?a.sources:[{url:a?.sourceUrl,title:a?.sourceTitle}];return sources.flatMap(s=>{const url=https(s.url);return url?[`<li><a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(s.title??(k==='sales'?'销量来源':'一位来源'))} ↗</a></li>`]:[];});})].join('');
 return `<section class="group-information" data-home-module="information" aria-label="${escape(model.name)} 信息"><header><small>INFORMATION</small><h2>信息</h2></header><div class="group-info-grid" data-stat-count="${model.accounts.length+2}">${social?`<div class="group-info-social" aria-label="社媒人数">${social}</div>`:''}<div class="group-info-records" aria-label="作品成绩">${metric(model.sales,'sales')}${metric(model.wins,'wins')}</div></div><details class="group-info-sources"><summary>统计日期与来源</summary>${evidence.map(t=>`<p>${escape(t)}</p>`).join('')}<ul>${sources}</ul></details></section>`;
}
