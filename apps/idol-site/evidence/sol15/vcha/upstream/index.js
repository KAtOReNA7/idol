import data from './data.js';
import payload from './reconciliation.js';
import {reconcileArtist} from '../../shared/reconcile.js';
import {summaries} from './public-copy.js';
import {relatedVideoWorks} from './video-relations.js';
import {renderMemberFacts,renderEventBody,renderMemberSources} from './public-content.js';
const baseArtist={...data,members:data.members.map(member=>({...member,legacyHistory:Array.isArray(member.history)?member.history:[]}))};
const reconciled=reconcileArtist(baseArtist,payload);
export const artist={...reconciled,timeline:reconciled.timeline.map(event=>({...event,publicSummary:summaries[event.id]??event.summary}))};
const kinds={release:'发行',mv:'MV',stage:'舞台'};

export function render({route,helpers:baseHelpers}) {
 const pageMediaContext=route.page==='home'?'feature':route.page==='work'?'detail':'card';
 const videoSources=new Set(artist.works.filter(work=>['mv','stage'].includes(work.type)&&work.image).map(work=>typeof work.image==='string'?work.image:work.image.src??work.image.path??work.image.url));
 const h={...baseHelpers,image(asset,alt,options={}){
  const source=typeof asset==='string'?asset:asset?.src??asset?.path??asset?.url;
  return baseHelpers.image(asset,alt,{context:pageMediaContext,...options,...(videoSources.has(source)?{mediaRole:'video-preview',fit:'contain'}:{})});
 }};
  const E=h.escape,K=h.entityKey,workContext=['works','work'].includes(route.page)?route.query:new URLSearchParams();
  const U=(p='home',x=null,q)=>h.href('vcha',p,x?K(x):null,q??(p==='work'||p==='works'&&route.page==='work'?workContext:{}));
  const queryWith=patch=>{const q=new URLSearchParams(route.query);for(const [k,v]of Object.entries(patch))q.set(k,v);return q;};
  const active=route.page==='member'?'members':route.page==='work'?'works':route.page;
  const image=(x,alt,cls='',eager=false)=>h.image(x,alt,{className:cls,fit:'contain',loading:eager?'eager':'lazy'});
  const header=`<header class="vc-header"><a class="vc-brand" href="${U()}">VCHA</a><nav aria-label="VCHA 页面">${[['home','首页'],['members','成员'],['works','作品'],['timeline','时间轴']].map(([p,n])=>`<a href="${U(p)}" ${active===p?'aria-current="page"':''}>${n}</a>`).join('')}</nav></header>`;
  const footer=`<footer class="vc-footer"><a class="vc-brand" href="${U()}">VCHA</a><p>旧名的作品，完整地留在这里。</p><button type="button" data-vc-top>回到页首 ↑</button></footer>`;
  const pageTitle=(title,sub='')=>`<div class="vc-page-title"><h1>${E(title)}</h1>${sub?`<p>${E(sub)}</p>`:''}</div>`;
  const memberRow=(m,i)=>`<a class="vc-member-row" href="${U('member',m)}"><span class="vc-index">${String(i+1).padStart(2,'0')}</span>${m.image?image(m.image,`${m.nameZh} ${m.name}`,'vc-member-photo'):`<span class="vc-type-portrait" aria-hidden="true">${E(m.name)}</span>`}<span class="vc-member-label"><strong>${E(m.nameZh)}</strong><span>${E(m.name)}</span>${m.status?`<small>${E(m.status)}</small>`:''}</span><span class="vc-arrow" aria-hidden="true">→</span></a>`;
  const workRow=(w)=>`<a class="vc-work-row vc-work-${E(w.type)}" href="${U('work',w)}">${w.image?`<span class="vc-sleeve">${image(w.image,w.title)}${w.type!=='release'?`<small>${E(w.artRole)}</small>`:''}</span>`:`<span class="vc-type-work" aria-hidden="true">${kinds[w.type]}<span>${E(w.artistCredit)}</span></span>`}<span class="vc-work-caption"><small>${kinds[w.type]}${w.date?' · '+E(h.dateLabel(w.date)):''}</small><strong>${E(w.title)}</strong>${w.artistCredit==='GIRLSET'?'<span>GIRLSET</span>':''}</span><span class="vc-arrow" aria-hidden="true">↗</span></a>`;
  const missing=(what,p)=>`<section class="vc-missing">${pageTitle(`没有找到这${what}`)}<a class="vc-button" href="${U(p)}">返回${p==='members'?'成员目录':'作品目录'}</a></section>`;
  let content='';
  if(route.page==='home') {
    const releases=artist.works.filter(x=>x.type==='release');
    const featured=[releases.find(x=>x.title==='Girls of the Year'),releases.find(x=>x.title==='Only One')].filter(Boolean);
    content=`<section class="vc-cover"><div class="vc-cover-title"><h1>VCHA</h1><p>旧名的作品，<br>完整地留在这里。</p></div><figure class="vc-cover-art">${image(artist.hero,'VCHA《Only One》发行视觉','',true)}<figcaption>《Only One》发行视觉 · 2024.03.15</figcaption></figure><div class="vc-reading-index"><p class="vc-description">${E(artist.description)}</p>${[['members','历史成员'],['works','作品目录'],['timeline','时间轴']].map(([p,t])=>`<a href="${U(p)}"><strong>${t}</strong><span aria-hidden="true">→</span></a>`).join('')}</div></section><section class="vc-names" aria-label="六位历史成员">${artist.members.map(m=>`<a href="${U('member',m)}"><strong>${E(m.nameZh)}</strong><span>${E(m.name)}</span></a>`).join('')}</section><section class="vc-home-releases"><div class="vc-section-title"><h2>作品</h2><a href="${U('works')}">浏览作品目录 →</a></div><div class="vc-release-pair">${featured.map(workRow).join('')}</div></section><aside class="vc-next-chapter"><h2>后来的章节</h2><p>${E(artist.currentBrandNote)}</p><a href="${U('works',null,{chapter:'girlset'})}">阅读 GIRLSET 关联作品 →</a></aside>`;
  } else if(route.page==='members') {
    content=`<section class="vc-members">${pageTitle('历史成员','以 VCHA 名义活动时期的六个名字。')}<div class="vc-member-register">${artist.members.map(memberRow).join('')}</div><p class="vc-roster-note">${E(artist.currentBrandNote)}</p><details class="vc-sources"><summary>成员与历史来源</summary>${h.sources([artist.brandSource,'https://www.universalmusic.com.br/2024/03/15/o-grupo-de-pop-feminino-vcha-faz-o-lancamento-duplo-de-only-one-e-favorite-girl/'])}</details></section>`;
  } else if(route.page==='member') {
    const m=artist.members.find(x=>K(x)===route.key);
    if(!m)content=missing('位成员','members');
    else {const i=artist.members.indexOf(m),next=artist.members[(i+1)%artist.members.length];content=`<article class="vc-biography" data-member-id="${E(m.id)}"><a class="vc-back" href="${U('members')}">← 历史成员目录</a><div class="vc-biography-heading"><span>${String(i+1).padStart(2,'0')} / 06</span><h1>${E(m.nameZh)}</h1><p>${E(m.name)}</p></div><div class="vc-biography-body"><figure class="vc-biography-photo">${m.image?image(m.image,`${m.nameZh} ${m.name}`,'',true):`<div class="vc-nameplate"><span>VCHA</span><strong>${E(m.name)}</strong><span>${E(m.nameZh)}</span></div>`}${m.image?'<figcaption>《Girls of the Year》时期个人视觉 · 2024年</figcaption>':''}</figure><div class="vc-biography-text"><h2>VCHA 时期</h2><p>${E(m.profile)}</p>${renderMemberFacts(m,h)}<a class="vc-button" href="${U('works',null,{chapter:'vcha'})}">阅读 VCHA 作品 →</a><details class="vc-sources"><summary>资料与图片来源</summary>${renderMemberSources(m,h)}</details></div></div><a class="vc-next-person" href="${U('member',next)}"><span>下一位成员</span><strong>${E(next.nameZh)} · ${E(next.name)}</strong><span aria-hidden="true">→</span></a></article>`;}
  } else if(route.page==='works') {
    const type=['release','mv','stage'].includes(route.query.get('type'))?route.query.get('type'):'all';const q=route.query.get('q')??'',chapter=['vcha','girlset'].includes(route.query.get('chapter'))?route.query.get('chapter'):'all';
    const list=h.filterWorks(artist.works,{type,query:q}).filter(w=>chapter==='all'||w.chapter===chapter);
    content=`<section class="vc-library">${pageTitle('作品目录','发行、MV 与舞台，按各自入口阅读。')}<form class="vc-search" data-vc-search><label for="vc-q">搜索作品</label><input type="search" id="vc-q" name="q" value="${E(q)}" placeholder="作品名称"><button type="submit">查找</button><input type="hidden" name="type" value="${E(type)}"><input type="hidden" name="chapter" value="${E(chapter)}"></form><nav class="vc-type-tabs" aria-label="作品类型">${[['all','全部'],['release','发行'],['mv','MV'],['stage','舞台']].map(([t,n])=>`<a href="${U('works',null,queryWith({type:t,q,chapter}))}" ${type===t?'aria-current="page"':''}>${n}</a>`).join('')}</nav>${list.length?['vcha','girlset'].map(c=>{const items=list.filter(w=>w.chapter===c);return items.length?`<section class="vc-chapter vc-chapter-${c}"><div class="vc-chapter-heading"><h2>${c==='vcha'?'VCHA':'GIRLSET · 关联章节'}</h2><span>${c==='vcha'?'历史作品':'后续品牌名义作品'}</span></div><div class="vc-work-register">${items.map(workRow).join('')}</div></section>`:''}).join(''):`<div class="vc-empty"><h2>没有找到“${E(q)}”</h2><p>换个关键词，或查看完整目录。</p><a class="vc-button" href="${U('works')}">查看全部作品</a></div>`}</section>`;
  } else if(route.page==='work') {
    const w=artist.works.find(x=>K(x)===route.key);
    if(!w)content=missing('支作品','works');
    else {const sibling=relatedVideoWorks(w,artist.works)[0]??null;content=`<article class="vc-work-detail" data-work-key="${E(K(w))}"><a class="vc-back" href="${U('works',null,route.query)}">← ${kinds[w.type]}目录</a><div class="vc-work-detail-title"><p>${E(w.artistCredit)} / ${kinds[w.type]}</p><h1>${E(w.title)}</h1></div><div class="vc-work-detail-body"><div class="vc-work-display">${w.image?`${image(w.image,w.title,'',true)}${w.type!=='release'?`<p>${E(w.artRole)}</p>`:''}`:`<div class="vc-programme"><span>${kinds[w.type]}</span><strong>${E(w.title)}</strong><span>${E(w.artistCredit)}</span></div>`}</div><div class="vc-work-facts">${w.date?`<dl><dt>${w.dateKind==='music_platform_release'?'数字发行日期':'视频日期'}</dt><dd><time datetime="${E(w.date)}">${E(h.dateLabel(w.date))}</time></dd></dl>`:''}${w.tracks?`<dl><dt>收录曲目</dt><dd>${w.tracks} 首</dd></dl>`:''}${w.channel?`<dl><dt>发布频道</dt><dd>${E(w.channel)}</dd></dl>`:''}${w.version?`<dl><dt>版本</dt><dd>${E(w.version)}</dd></dl>`:''}${w.stageKind?`<p>${E(w.stageKind)}</p>`:''}${w.videoId?`<a class="vc-button" href="${E(h.videoHref(w.videoId))}" target="_blank" rel="noopener noreferrer">打开${kinds[w.type]}视频 ↗</a>`:`<a class="vc-button" href="${E(w.sources[0])}" target="_blank" rel="noopener noreferrer">在音乐平台打开 ↗</a>`}${sibling?`<a class="vc-link" href="${U('work',sibling)}">阅读同作品${kinds[sibling.type]} →</a>`:''}<details class="vc-sources"><summary>作品来源</summary>${h.sources(w.sources)}</details></div></div></article>`;}
  } else if(route.page==='timeline') {
    const dated=h.sortTimeline(artist.timeline.filter(event=>event.date)),undated=artist.timeline.filter(event=>!event.date);
    content=`<section class="vc-timeline-page">${pageTitle('时间轴','沿一根时间线，从最早的发行读起。')}<ol class="vc-timeline" data-timeline>${dated.map(event=>`<li data-event-id="${E(event.id)}"><time datetime="${E(event.date)}">${E(h.dateLabel(event.date,event.precision))}</time>${renderEventBody(event,h)}</li>`).join('')}</ol>${undated.length?`<aside class="vc-related-notices"><h2>品牌相关资料</h2>${undated.map(event=>`<article data-event-id="${E(event.id)}">${renderEventBody(event,h)}</article>`).join('')}</aside>`:''}</section>`;
  } else content=missing('个页面','works');
  return `<div class="vc-site" id="vc-top">${header}<main>${content}</main>${footer}</div>`;
}

export function afterRender({root,route,helpers:h}) {
  const form=root.querySelector('[data-vc-search]'),top=root.querySelector('[data-vc-top]');
  const search=e=>{e.preventDefault();const f=new FormData(form),query=new URLSearchParams(route.query);for(const [name,value]of f)query.set(name,String(value));h.navigate(h.href('vcha','works',null,query));};
  const toTop=()=>{root.querySelector('#vc-top')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});root.querySelector('.vc-brand')?.focus({preventScroll:true});};
  form?.addEventListener('submit',search);top?.addEventListener('click',toTop);
  return ()=>{form?.removeEventListener('submit',search);top?.removeEventListener('click',toTop);};
}
