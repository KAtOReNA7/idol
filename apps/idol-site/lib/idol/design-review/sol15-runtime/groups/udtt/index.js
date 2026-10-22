import {originalMvEvidence,originalMv,originalMvMembers,releaseEventPairs,navigation} from './relations.mjs';
import { data as baseData } from './data.js';
import payload from './reconciliation.js';
import {publicWorkDescription,publicMemberSources,publicWorkSources} from './presentation.js';
import { reconcileArtist } from '../../shared/reconcile.js';
export const artist = reconcileArtist(baseData, payload);
const data = artist;
const copy = {home:'首页',members:'成员',works:'作品',timeline:'时间轴'};
export function render({route,helpers:h}) {
 const e=h.escape, link=(p='home',k=null,q={})=>h.href('udtt',p,k,q), key=h.entityKey;
 const navContext=navigation(data,route,h),mv=originalMv(data),cast=originalMvMembers(data),releasePairs=releaseEventPairs(data);
 const memberBack=navContext.back('members','← 成员目录'),workBack=navContext.back('works','← 发行与影像');
 const activePage=route.page==='member'?'members':route.page==='work'?'works':route.page;
 const nav=`<header class="ud-nav"><a class="ud-brand" href="${link()}">UDTT<span>우당탕탕 소녀단</span></a><nav aria-label="UDTT 页面">${Object.entries(copy).map(([p,t])=>`<a href="${link(p)}" ${activePage===p?'aria-current="page"':''}>${t}</a>`).join('')}</nav></header>`;
 const title=(text,sub='')=>`<div class="ud-heading"><h1>${e(text)}</h1>${sub?`<p>${e(sub)}</p>`:''}</div>`;
 const historicalPhoto=m=>m.id==='recvxAPQCF66Sl'&&m.image?.sha256==='b80720a772b8000518fad7d71e0b3c5867a8dbef7b4c2219dcaf2ec58dba8ca9';
 const photoCaption=m=>historicalPhoto(m)?`<small class="ud-photo-caption">${e(m.image.credit)}</small>`:'';
 const cardPhoto=m=>{if(!m.image)return '';const image=h.image(m.image,m.nameZh+' · '+m.name,{className:historicalPhoto(m)?'ud-portrait ud-historical-portrait':m.image.width<=200?'ud-portrait ud-catalog-portrait':'ud-portrait'});return historicalPhoto(m)?`<span class="ud-historical-frame">${image}</span>`:image;};
 const card=(original,i)=>{const m=h.memberPresentation?.(original)??original;return `<a class="ud-person" href="${link('member',key(m),route.page==='members'?route.query:{})}"><span class="ud-number" aria-hidden="true">${String(i+1).padStart(2,'0')}</span>${cardPhoto(m)}${photoCaption(m)}<span class="ud-person-name"><strong>${e(m.nameZh||m.name)}</strong><span>${e(m.name)}</span></span><span class="ud-arrow" aria-hidden="true">↗</span></a>`};
 const row=w=>`<a class="ud-work" href="${link('work',key(w),route.query)}">${w.image?h.image(w.image,w.title,{className:'ud-cover',fit:'contain'}):`<span class="ud-work-letter" aria-hidden="true">${w.type==='release'?'音':'影'}</span>`}<span><small>${w.type==='release'?'发行':w.type==='stage'?'舞台':'MV'}</small><h3>${e(w.title)}</h3><time>${h.dateLabel(w.date)}</time></span><b aria-hidden="true">↗</b></a>`;
 const source=s=>s?.length?`<details class="ud-sources"><summary>来源</summary>${h.sources(s)}</details>`:'';
 const relations=m=>cast.some(x=>x.id===m.id)?`<section class="ud-career" data-udtt-member-works><h3>已核实出演影像</h3><a class="ud-button" href="${e(navContext.enter('work',key(mv)))}" data-udtt-related-work="${e(key(mv))}">REALLY REALLY · 原 MV ↗</a><p>仅关联本支原 MV，不代表参与其他舞台或歌曲录音。</p></section>`:`<section class="ud-career" data-udtt-member-works><h3>具体影像关联</h3><p>该成员的具体影像关联待补充。</p></section>`;
 const mvCast=w=>mv&&key(w)===key(mv)?`<section class="ud-career" data-udtt-mv-cast><h2>原 MV 出演成员</h2>${cast.map(m=>`<p><a class="ud-button" data-udtt-related-member="${e(key(m))}" href="${e(navContext.enter('member',key(m)))}">${e(m.nameZh||m.name)} · ${e(m.name)} ↗</a></p>`).join('')}<p>原 MV 为四位成员与蒙面舞者；陆雨婷后续加入舞台，不列入本支 MV。</p></section>`:'';
 const eventLink=t=>{const pair=releasePairs.find(p=>p.event.id===t.id);return pair?`<p><a class="ud-button" data-udtt-event-release="${e(key(pair.work))}" href="${e(navContext.enter('work',key(pair.work),{event:t.id}))}">查看《${e(pair.work.title)}》发行资料 ↗</a></p>`:'';};
 const releaseTimeline=w=>{const pair=releasePairs.find(p=>key(p.work)===key(w));return pair?`<p><a class="ud-button" data-udtt-release-event="${e(pair.event.id)}" href="${e(link('timeline',null,{event:pair.event.id}))}">查看发行时间轴 ↗</a></p>`:'';};
 const withQuery=(name,value)=>{const query=new URLSearchParams(route.query);query.set(name,value);return query;};
 const career=m=>!m.careerPeriods?.length?'':`<section class="ud-career"><h3>成员经历</h3><dl>${m.careerPeriods.map(period=>{
  const isRoster=period.relationType==='roster_listing';
  const caption=isRoster?'官方成员名录':period.startDateBasis==='public_debut'?'公开出道':'成员经历';
  const start=period.startDate?h.dateLabel(period.startDate,period.startPrecision):'';
  const end=period.endDate?h.dateLabel(period.endDate,period.endPrecision):'';
  const dates=[start?`${e(caption)} · ${e(start)}`:e(caption),end?`结束 · ${e(end)}`:'',period.announcedDate?.value?`公告 · ${e(h.dateLabel(period.announcedDate.value,period.announcedDate.precision))}`:'',period.effectiveDate?.value?`生效 · ${e(h.dateLabel(period.effectiveDate.value,period.effectiveDate.precision))}`:''].filter(Boolean);
  return `<div data-period-id="${e(period.periodId)}"><dt>${e(period.displayName)}</dt><dd>${dates.join('<br>')}</dd></div>`;
 }).join('')}</dl></section>`;
 // The public timeline contains only the original date and event title.
 // Summaries, source methods and verification metadata stay in the input data.
 const eventDates=t=>t.date?`<time datetime="${e(t.date)}">${e(h.dateLabel(t.date,t.precision))}</time>`:'';
 const eventBody=t=>`<h2>${e(t.title)}</h2>`;
 let page='';
 if(route.page==='home') page=`<section class="ud-opening"><div class="ud-cover-copy"><h1>UDTT</h1><p>成员 · 作品 · 时间轴</p><a class="ud-button" href="${link('works')}">打开作品集 ↗</a><span class="ud-handline" aria-hidden="true"></span></div><figure class="ud-class-photo">${h.image(data.hero,'UDTT 2025年活动宣传照',{loading:'eager',fit:'contain'})}<figcaption>2025 · 活动宣传照</figcaption></figure><div class="ud-opening-index"><a href="${link('members')}">成员目录 <span>01</span></a><a href="${link('works')}">发行与影像 <span>02</span></a><a href="${link('timeline')}">大事时间轴 <span>03</span></a></div></section><section class="ud-roster-band"><div class="ud-section-title"><h2>认识成员</h2><a href="${link('members')}">查看全部 ↗</a></div><div class="ud-roster">${data.members.map(card).join('')}</div></section><section class="ud-listen"><h2>发行与影像</h2><div>${data.works.map(row).join('')}</div></section>`;
 else if(route.page==='members'){
  const q=route.query.get('q')||'';const filtered=data.members.filter(m=>[m.name,m.nameZh].join(' ').toLocaleLowerCase().includes(q.toLocaleLowerCase()));
  page=title('成员目录','UDTT 成员资料')+`<form class="ud-search" data-member-search><label for="ud-name">查找成员</label><div><input id="ud-name" name="q" value="${e(q)}" placeholder="中文名或艺名"><button>查找</button></div></form><div class="ud-roster ud-full-roster">${filtered.map(card).join('')||'<p class="ud-empty">没有找到这个名字。换个关键词再试试。</p>'}</div>`;
 }
 else if(route.page==='member'){
  const original=data.members.find(m=>key(m)===route.key),m=original&&(h.memberPresentation?.(original)??original);
  page=m?`<a class="ud-back" href="${e(memberBack.href)}">${e(memberBack.label)}</a><article class="ud-student" data-member-id="${e(m.id)}"><div class="ud-student-name"><p>UDTT</p><h1>${e(m.nameZh||m.name)}</h1><span>${e(m.name)}</span></div><div class="ud-student-image ${historicalPhoto(m)?'ud-historical-photo':m.image?.width<=200?'ud-catalog-photo':''}">${m.image?h.image(m.image,m.nameZh+' · '+m.name,{fit:'contain',loading:'eager'}):''}${photoCaption(m)}</div><div class="ud-student-story"><h2>关于她</h2><p>${e(m.profile||m.summary)}</p>${m.role?`<p class="ud-role">${e(m.role)}</p>`:''}${career(m)}${source(publicMemberSources(m))}${relations(m)}<a class="ud-button" href="${link('works')}">去作品集 ↗</a></div></article>`:title('没有找到这位成员')+`<a href="${link('members')}">返回成员目录</a>`;
 }
 else if(route.page==='works'){
  const q=route.query.get('q')||'',type=route.query.get('type')||'all',works=h.filterWorks(data.works,{query:q,type});
  page=title('发行与影像','发行 · MV · 舞台')+`<div class="ud-library-controls"><nav aria-label="作品类型">${[['all','全部'],['release','发行'],['mv','MV'],['stage','舞台']].map(([k,t])=>`<a href="${link('works',null,withQuery('type',k))}" ${type===k?'aria-current="true"':''}>${t}</a>`).join('')}</nav><form data-work-search><label for="ud-work">查找作品</label><input id="ud-work" name="q" value="${e(q)}"><button>搜索</button></form></div><section class="ud-library">${works.map(row).join('')||'<div class="ud-empty"><h2>这里还没有匹配的作品</h2><p>试试其他名称或分类。</p><a href="'+link('works')+'">查看全部</a></div>'}</section>`;
 }
 else if(route.page==='work'){
  const w=data.works.find(w=>key(w)===route.key);
  page=w?`<a class="ud-back" href="${e(workBack.href)}">${e(workBack.label)}</a><article class="ud-work-detail" data-work-key="${e(key(w))}"><div>${w.image?h.image(w.image,w.title,{fit:'contain',loading:'eager'}):`<span class="ud-film-title">${e(w.title)}</span>`}</div><section><p>${w.type==='release'?'正式发行':w.type==='mv'?'官方 MV':'舞台影像'}</p><h1>${e(w.title)}</h1>${w.date?`<p><time>${h.dateLabel(w.date)}</time>${w.type==='release'?' · 音乐平台收录':' · 视频记录日期'}</p>`:''}${w.version?`<p>${e(w.version)}</p>`:''}${publicWorkDescription(w)?`<p>${e(publicWorkDescription(w))}</p>`:''}${w.videoId?`<a class="ud-button" href="${e(h.videoHref(w.videoId))}" target="_blank" rel="noopener noreferrer">前往官方视频 ↗</a>`:''}${source(publicWorkSources(w,h.videoHref))}${mvCast(w)}${releaseTimeline(w)}</section></article>`:title('没有找到这部作品')+`<a href="${link('works')}">返回作品库</a>`;
 }
 else if(route.page==='timeline') page=title('大事时间轴','发行与团体事件')+`<ol class="ud-timeline">${h.sortTimeline(data.timeline).map(t=>`<li data-event-id="${e(t.id)}"><div class="ud-timeline-date">${eventDates(t)}</div><div>${eventBody(t)}${eventLink(t)}</div></li>`).join('')}</ol>`;
 else page=title('页面不存在')+`<a href="${link()}">返回首页</a>`;
 return `<div class="ud-page">${nav}<main id="ud-main">${page}</main><footer class="ud-footer"><strong>UDTT</strong><p>成员 · 作品 · 时间轴</p><a href="${link('timeline')}">从最早开始阅读 ↗</a></footer></div>`;
}
export function afterRender({root,route,helpers:h}) {
 const removers=[];

 for(const [selector,page] of [['[data-work-search]','works'],['[data-member-search]','members']]){
  const form=root.querySelector(selector);if(!form)continue;
  const handler=event=>{event.preventDefault();const query=new URLSearchParams(route.query);query.set('q',new FormData(form).get('q')||'');location.hash=h.href('udtt',page,null,query);};
  form.addEventListener('submit',handler);removers.push(()=>form.removeEventListener('submit',handler));
 }
 return ()=>removers.forEach(fn=>fn());
}
