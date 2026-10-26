const prefix='vc';
const typeLabels={group_membership:'团体成员经历',public_introduction:'公开加入公告',brand_phase:'品牌阶段',activity_interval:'活动安排',company_contract:'经纪合作',solo_debut:'个人活动'};
const basisLabels={public_debut:'公开出道',public_debut_membership:'公开出道',public_announcement:'公开公告',public_lineup_announcement:'阵容公布',official_profile:'公开资料记录'};
const publicSources=items=>(items??[]).map(source=>typeof source==='string'?source:{...source,label:source.publisher||source.label||source.title||'公开来源'});
const dateParts=value=>typeof value==='string'?{value}:value;
function stamped(value,H){const d=dateParts(value);return d?.value&&H.dateLabel(d.value,d.precision)?`<time datetime="${H.escape(d.value)}">${H.escape(H.dateLabel(d.value,d.precision))}</time>`:'';}
export function renderMemberFacts(member,H){
 const E=H.escape;
 const roles=[member.role?['公开角色',member.role]:null,member.status?['资料中的状态',member.status]:null,member.historical?['成员经历','历史成员']:null].filter(Boolean);
 const periods=member.careerPeriods??[];
 return `${roles.length?`<dl class="${prefix}-public-fields">${roles.map(([label,value])=>`<div><dt>${E(label)}</dt><dd>${E(value)}</dd></div>`).join('')}</dl>`:''}${periods.length?`<section class="${prefix}-career-facts"><h2>成员经历</h2>${periods.map(period=>{
  const details=[];
  if(period.startDate)details.push(`<span>${E(basisLabels[period.startDateBasis]||'开始时间')}：${stamped({value:period.startDate,precision:period.startPrecision},H)}</span>`);
  if(period.endDate)details.push(`<span>结束时间：${stamped({value:period.endDate,precision:period.endPrecision},H)}</span>`);
  if(period.announcedDate)details.push(`<span>公告时间：${stamped(period.announcedDate,H)}</span>`);
  if(period.effectiveDate)details.push(`<span>生效时间：${stamped(period.effectiveDate,H)}</span>`);
  const rows=(period.events??[]).map(event=>`<p class="${prefix}-career-event">${event.date?stamped({value:event.date,precision:event.precision},H)+' · ':''}${E(event.label)}</p>`).join('');
  const sources=(member.careerSources??[]).filter(source=>(period.sourceIds??[]).includes(source.sourceId));
  return `<article class="${prefix}-career-period" data-period-id="${E(period.periodId)}"><h3>${E(period.displayName)} · ${E(typeLabels[period.relationType]||'公开经历')}</h3>${details.length?`<p class="${prefix}-career-dates">${details.join('')}</p>`:''}${rows}<details class="${prefix}-sources"><summary>经历来源</summary>${H.sources(publicSources(sources))}</details></article>`;
 }).join('')}</section>`:''}`;
}
export function renderEventBody(event,H){
 const E=H.escape, extra=[];
 if(event.announcementDate&&event.eventDate)extra.push(`<div><dt>公告时间</dt><dd>${stamped(event.announcementDate,H)}</dd></div>`);
 if(event.plannedDate)extra.push(`<div><dt>${event.status==='planned'||event.status==='announced'?'计划时间':'原计划时间'}</dt><dd>${stamped(event.plannedDate,H)}</dd></div>`);
 return `<div><h2>${E(event.title)}</h2>${event.publicSummary?`<p class="${prefix}-event-summary">${E(event.publicSummary)}</p>`:''}${event.date?`<p class="${prefix}-event-kind">${event.eventDate?'事件时间':'公告时间'}</p>`:''}${extra.length?`<dl class="${prefix}-event-dates">${extra.join('')}</dl>`:''}<details class="${prefix}-sources"><summary>来源</summary>${H.sources(publicSources(event.sources))}</details></div>`;
}
export function renderMemberSources(member,H){return H.sources(publicSources(member.sources));}

