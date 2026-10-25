import artwork from '../../data/music-index-artwork.json';
import facts from '../../data/group-information-facts.json';

const platforms={instagram:'INS',x:'X',youtube:'YouTube'};
export function followersInWan(label){
 if(typeof label!=='string')return null;
 const match=label.trim().replace(/^(?:约|大约|about)\s*/i,'').match(/^([\d,]+(?:\.\d+)?)\s*(万|亿|[KMB])?(?:\s*(?:位|人|粉丝|关注者|订阅者?|followers?|subscribers?))*\s*$/i);
 if(!match)return null;
 const number=Number(match[1].replaceAll(',',''))*({万:1e4,亿:1e8,K:1e3,M:1e6,B:1e9}[match[2]?.toUpperCase()]??1);
 return Number.isFinite(number)&&number>=0?`${Number((number/1e4).toFixed(4))}万`:null;
}
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const https=value=>{try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:null;}catch{return null;}};
export const informationGroupId=slug=>artwork.find(g=>g.slug===slug)?.groupId;
export function groupInformationModel(slug,group){
 const row=facts[slug]??facts.groups?.[slug]??{};
 const byPlatform=new Map();
 for(const account of [...(group?.social??[]),...(row.social??[])]){
  if(!platforms[account.platform]||!https(account.url))continue;
  const previous=byPlatform.get(account.platform);
  if(!previous||(account.observedAt??'')>(previous.observedAt??''))byPlatform.set(account.platform,account);
 }
 const accounts=Object.keys(platforms).flatMap(platform=>byPlatform.has(platform)?[byPlatform.get(platform)]:[]);
 return {name:artwork.find(g=>g.slug===slug)?.name??slug,accounts:accounts.map(a=>({...a,value:a.observedAt?followersInWan(a.countLabel):null})),sales:row.sales,wins:row.wins};
}
export function renderGroupInformation(slug,group){
 const model=groupInformationModel(slug,group);
 const social=model.accounts.map(a=>`<article class="group-info-stat"><a href="${escape(https(a.url))}" target="_blank" rel="noopener noreferrer"><span>${platforms[a.platform]} ↗</span><strong>${escape(a.value??'待核实')}</strong></a><small>${a.platform==='youtube'?'订阅':'粉丝'}${a.observedAt?' · '+escape(a.observedAt.slice(0,10)):''}</small>${a.subjectName&&a.subjectName.toLowerCase()!==model.name.toLowerCase()?`<small>账号现名 / ${escape(a.subjectName)}</small>`:''}</article>`).join('');
 const metric=(item,kind)=>{const label=kind==='sales'?'唱片累计销量':'打歌一位总数',valid=typeof item?.value==='number'&&Number.isFinite(item.value)&&item.value>=0&&!['conflicting','unverified'].includes(item.status);const scope=valid?(kind==='sales'?'韩国实体发行 · Circle 汇总':'团体音乐节目获奖 · 来源汇总'):item?.status==='conflicting'?'来源记录存在冲突':'尚缺可靠累计数据';return `<article class="group-info-stat"><span>${escape(item?.title??label)}</span><strong>${valid?escape(item.value.toLocaleString('zh-CN'))+(kind==='sales'?'<em>张</em>':'<em>次</em>'):'待核实'}</strong><small>${scope}</small>${item?.asOf?`<small>截至 ${escape(item.asOf)}</small>`:''}</article>`;};
 const evidence=['粉丝数以万为单位换算，保留平台公开显示的精度；日期为对应记录的采集日。',...['sales','wins'].flatMap(k=>{const a=model[k];return a?[`${k==='sales'?'销量':'一位'}：${a.scope??''} ${a.dateNote??(a.asOf?'截至 '+a.asOf:'来源未注明统计截止日')}`,...(a.notes??[])]:[];})].filter(Boolean);
 const sources=[...model.accounts.map(a=>{const url=https(a.sourceUrl??a.url);return `<li><a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${platforms[a.platform]} · ${escape(a.observedAt?'人数公开记录 '+a.observedAt.slice(0,10):'官方账号，人数待核实')} ↗</a></li>`;}),...['sales','wins'].map(k=>{const a=model[k],url=https(a?.sourceUrl);return url?`<li><a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(a.sourceTitle??(k==='sales'?'销量来源':'一位来源'))} ↗</a></li>`:'';})].join('');
 return `<section class="group-information" data-home-module="information" aria-label="${escape(model.name)} 信息"><header><small>INFORMATION</small><h2>信息</h2></header><div class="group-info-grid">${social}${metric(model.sales,'sales')}${metric(model.wins,'wins')}</div>${!model.accounts.length?'<p class="group-info-note">官方账号粉丝数待核实。</p>':''}<details class="group-info-sources"><summary>统计日期与来源</summary>${evidence.map(t=>`<p>${escape(t)}</p>`).join('')}<ul>${sources}</ul></details></section>`;
}
