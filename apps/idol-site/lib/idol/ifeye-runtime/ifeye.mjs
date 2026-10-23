export function createIfeyeModule(runtime){'use strict';


 // Reviewed public copy is supplied as data.publicContent for portable mount().
 // Source metadata and untouched raw biographies stay in scope.data/data.json.
 function selectFields(row,keys){const out={};for(const key of keys)if(Object.prototype.hasOwnProperty.call(row,key))out[key]=row[key];return out;}
 function displayAsset(asset){
  if(!asset||typeof asset!=='object')return asset;
  const label=asset.usage==='mv_related_article_illustration'?'报道图片':asset.usage==='historical_named_portrait'?'历史资料照':'';
  // Keep resolver/byte/native-size properties; never interpolate raw captions or research labels.
  return {...asset,label,caption:''};
 }
 function projectPublicData(raw){
  const content=raw.publicContent?.schema==='astra-public-content/1'?raw.publicContent:{members:{},works:{},events:{}};
  const group=selectFields(raw.group,['id','name','slug','company','officialUrl','hero','logo']);group.hero=displayAsset(group.hero);group.logo=displayAsset(group.logo);
  return {group,
   members:raw.members.map(row=>{const out=selectFields(row,['id','recordId','cnName','stageName','nationality','birthDate','joined','left','relationship','displayRelationship']);const copy=content.members?.[row.id];out.role=copy?copy.role:'';out.profile=copy?copy.profile:'';out.status=copy?copy.status:'';out.portrait=displayAsset(row.portrait);return out;}),
   releases:raw.releases.map(row=>({...selectFields(row,['key','recordId','title','date','type','languageMarket','creditScope','creditedArtists','memberIds','canonicalEventId','url','sourceUrl','trackVersions']),cover:displayAsset(row.cover)})),
   works:raw.works.map(row=>({...selectFields(row,['id','recordId','key','title','type','videoType','videoId','url','date','releaseKey','memberIds','version','officialTitle','sourceUrl','previewState','participantStatus']),publicLabel:content.works?.[row.key]?.typeLabel||(row.type==='STAGE'?'舞台':'影像'),image:displayAsset(row.image)})),
   events:raw.events.map(row=>({...selectFields(row,['id','candidateKey','date','precision','releaseKey','memberIds','workIds','sourceUrl','eventType']),title:content.events?.[row.id||row.candidateKey]?.title||''}))};
 }
 function publicVideoLabel(work){return work.publicLabel||(work.type==='STAGE'?'舞台':'影像');}
 let active=null;

 function mount(options){
  if(active)active.destroy();
  if(!options||!options.element||!options.data||options.data.group?.slug!=='ifeye'||!['members','releases','works','events'].every(k=>Array.isArray(options.data[k])))throw new TypeError('Invalid public ifeye mount data');
 let scope=null,handle=null,disposed=false,cleanupLocal=()=>{};
 const owns=()=>!disposed&&!!scope?.alive&&scope.ownsRoot();
 function dispose(){
  if(disposed)return;
  disposed=true;
  try{cleanupLocal();}finally{try{scope?.destroy();}finally{if(active===handle)active=null;}}
 }
 function guard(fn){return function(...args){if(!owns())return;try{return fn.apply(this,args);}catch(error){try{dispose();}catch(_){}throw error;}};}
 const listen=(target,type,fn,options)=>scope.listen(target,type,guard(fn),options);
 try{
  scope=runtime.createScope({...options,slug:'ifeye'});const A=scope.api,D=projectPublicData(scope.data);

 const e=v=>A.esc(v),name=m=>m.cnName||m.stageName||'',date=v=>v?A.formatDate(v):'',h=(p,id,params)=>A.href(p,id,params);
 const img=(asset,alt,extra={})=>scopedImage(asset,alt,extra);
 const action=(label,url)=>`<a class="text-action" href="${e(url)}"><span>${e(label)}</span><span aria-hidden="true" class="arrow">↗</span></a>`;
 const state=(title,back)=>`<div class="empty"><h2>${e(title)}</h2>${back?action('返回全部',back):''}</div>`;
 const sortedEvents=()=>D.events.map((x,i)=>({...x,_i:i})).sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999')||a._i-b._i);
 const allReleases=()=>D.releases.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||''));
 function mediaPurpose(asset,purpose){return asset&&asset.usage==='mv_related_article_illustration'?'related-illustration':purpose;}
 // This outer wrapper includes the credit; pixel caps remain on A.image's actual frame/img.
 function mediaStyle(asset,purpose){return A.qualityStyle(asset,purpose)+'max-height:none!important;aspect-ratio:auto!important;overflow:visible!important;';}
 function nativeDimensions(asset,purpose){
  const quality=A.assetQuality(asset,purpose);
  const width=Number(quality.nativeWidth)||Number(asset&&asset.width)||0,height=Number(quality.nativeHeight)||Number(asset&&asset.height)||0;
  return {width:width>0?width:0,height:height>0?height:0};
 }
 function cappedDimensions(asset,purpose,width,height){
  const quality=A.assetQuality(asset,purpose),limits=[1];
  if(width>0&&Number(quality.maxWidth)>0)limits.push(Number(quality.maxWidth)/width);
  if(height>0&&Number(quality.maxHeight)>0)limits.push(Number(quality.maxHeight)/height);
  const ratio=Math.min(...limits);
  return {width:width>0?width*ratio:0,height:height>0?height*ratio:0};
 }
 function scopedImage(asset,alt,extra={}){
  const purpose=mediaPurpose(asset,extra.purpose||'related-illustration'),q=A.assetQuality(asset,purpose),size=nativeDimensions(asset,purpose),cap=cappedDimensions(asset,purpose,size.width,size.height);
  const css=mediaStyle(asset,purpose)+(cap.width?'--native-width:'+cap.width+'px;':'')+(size.width&&size.height?'--native-ratio:'+size.width+' / '+size.height+';':'');
  return '<span class="native-frame quality-media" data-image-purpose="'+e(purpose)+'" style="'+e(css)+'">'+A.image(asset,purpose==='video-preview'&&!asset?alt+' · 预览图暂缺':alt,{className:'photo',eager:!!extra.eager,zoom:!!extra.zoom&&A.zoomAllowed(asset,purpose),purpose})+'</span>';
 }
 function backTo(route,fallback){const v=route.params.get('return');return v&&/^#\/(home|members|person|works|timeline)(\/|\?|$)/.test(v)?v:fallback;}
 function releaseHref(r){return h('works',null,{type:'release',detail:r.key,return:scope.hash||h('works')});}
 function videoHref(w){return h('works',null,{type:w.type==='STAGE'?'stage':'mv',detail:w.key,return:scope.hash||h('works')});}
 function sourceLink(asset,label='图片来源'){return asset?.sourceUrl?`<a class="media-source" href="${e(asset.sourceUrl)}" target="_blank" rel="noopener noreferrer">${e(label)} ↗</a>`:'';}
 function relatedTimeline(item){const events=D.events.filter(ev=>ev.releaseKey===item.key||ev.workIds?.includes(item.id));return events.length?`<nav class="linked-timeline" aria-label="相关时间轴">${events.map(ev=>`<a class="text-action" href="${e(h('timeline',null,{event:ev.id||ev.candidateKey,return:scope.hash}))}">${e(date(ev.date))} · ${e(ev.title)} ↗</a>`).join('')}</nav>`:'';}
 function chrome(page){
  const header=`<div class="mast shell"><a class="brand" href="${h('home')}" aria-label="ifeye 首页">ifeye</a><nav class="nav" aria-label="主导航">${[['home','首页'],['members','成员'],['works','作品'],['timeline','时间轴']].map(([key,label])=>`<a href="${h(key)}"${page===key||page==='person'&&key==='members'?' aria-current="page"':''}>${label}</a>`).join('')}</nav></div>`;
  const footer=`<div class="footer shell"><a class="brand" href="${h('home')}">ifeye</a><small>${e(D.group.company||'')}</small><a href="${h('timeline')}">时间轴 ↗</a></div>`;
  return {header,footer};
 }
 function chapterHeading(english,title,link=''){return `<div class="chapter-head"><div><p class="section-label" lang="en">${e(english)}</p><h2>${e(title)}</h2></div>${link}</div>`;}
 function rosterMarkup(members){return `<div class="roster-layout"><p class="roster-side" lang="en" aria-hidden="true">MEMBER</p><div class="member-stream">${members.map(memberCard).join('')}</div></div>`;}
 function memberCard(m){const index=D.members.indexOf(m)+1;return `<article class="member-card" data-member-id="${e(m.id)}"><a href="${e(h('person',m.id,{return:scope.hash||h('members')}))}"><div class="portrait-frame quality-parent" style="${e(mediaStyle(m.portrait,'member-card'))}">${img(m.portrait,name(m)+' · '+m.stageName,{purpose:'member-card'})}</div><div class="member-caption"><span class="member-index" aria-hidden="true">${String(index).padStart(2,'0')}</span><div><h3 class="member-name">${e(name(m))}</h3><p class="member-stage" lang="en">${e(m.stageName)}</p></div><span class="member-arrow" aria-hidden="true">↗</span></div></a></article>`;}
 function releaseCard(r){const position=allReleases().findIndex(x=>x.key===r.key),lead=position===0;return `<article class="release-card${lead?' release-lead':''}" data-release-key="${e(r.key)}"><a href="${e(releaseHref(r))}"><div class="release-orbit"><span class="release-pointer" aria-hidden="true"></span><div class="cover-frame quality-parent" style="${e(mediaStyle(r.cover,'release-card'))}">${img(r.cover,r.title+' 封面',{purpose:'release-card'})}</div></div><div class="release-caption"><span class="release-number" aria-hidden="true">${String(position+1).padStart(2,'0')}</span><div><h3>${e(r.title)}</h3><p class="meta">${e(date(r.date))}${r.type?' · '+e(r.type):''}</p></div><span aria-hidden="true">↗</span></div></a></article>`;}
 function workCard(w){
  const parent=w.releaseKey?D.releases.find(r=>r.key===w.releaseKey):null;
  if(!w.image)return `<article class="work-card video-text-row" data-work-key="${e(w.key)}" data-preview-state="missing"><a href="${e(videoHref(w))}"><span class="video-kind" aria-hidden="true">${w.type==='STAGE'?'STAGE':'MV'}</span><div class="video-row-title"><p class="meta">${e(publicVideoLabel(w))}${w.date?' · '+e(date(w.date)):''}</p><h3>${e(w.title)}</h3>${parent?`<p class="video-parent">${e(parent.title)}</p>`:''}<p class="missing-preview">预览图暂缺</p></div><span class="video-arrow" aria-hidden="true">↗</span></a></article>`;
  return `<article class="work-card" data-work-key="${e(w.key)}"><a href="${e(videoHref(w))}">${img(w.image,w.title+' '+publicVideoLabel(w)+' 预览',{purpose:'video-preview'})}<h3>${e(w.title)}</h3><p class="meta">${e(publicVideoLabel(w))}${w.date?' · '+e(date(w.date)):''}</p></a>${w.image?.usage==='mv_related_article_illustration'?sourceLink(w.image,'报道来源'):''}</article>`;
 }
 function videoDirectory(videos){return `<div class="video-grid${videos.every(w=>!w.image)?' text-video-directory':''}">${videos.map(workCard).join('')}</div>`;}
 function eventMarkup(ev){const links=[];const linkedRelease=ev.releaseKey?D.releases.find(r=>r.key===ev.releaseKey):null;if(linkedRelease)links.push(`<a href="${e(h('works',null,{type:'release',detail:linkedRelease.key,return:h('timeline')}))}">${e(linkedRelease.title)}</a>`);(ev.memberIds||[]).forEach(id=>{const m=D.members.find(x=>x.id===id);if(m)links.push(`<a href="${e(h('person',id,{return:scope.hash}))}">${e(name(m))}</a>`);});(ev.workIds||[]).forEach(id=>{for(const w of D.works.filter(x=>x.id===id))links.push(`<a href="${e(videoHref(w))}">${e(w.title)} · ${e(publicVideoLabel(w))}</a>`);});return `<article class="event" id="${e(ev.id||ev.candidateKey)}" data-event-id="${e(ev.id||'')}" data-event-key="${e(ev.id||ev.candidateKey)}" tabindex="-1">${ev.date?`<time datetime="${e(ev.date)}">${e(date(ev.date))}</time>`:'<div></div>'}<div class="event-copy"><h2>${e(ev.title)}</h2>${links.length?`<div class="event-links">${links.join('')}</div>`:''}</div></article>`;}
 function home(){const events=sortedEvents(),releases=allReleases();return `<section class="flow-hero" aria-labelledby="ifeye-home-title"><figure class="flow-image quality-parent" style="${e(mediaStyle(D.group.hero,'hero'))}">${img(D.group.hero,'ifeye 团体概念照片',{eager:true,zoom:true,purpose:'hero'})}</figure><div class="flow-copy shell"><h1 id="ifeye-home-title">ifeye</h1><nav class="hero-jump" aria-label="首页快捷导航">${action('成员',h('members'))}${action('发行作品',h('works'))}${action('时间轴',h('timeline'))}</nav></div>${D.group.company?`<p class="hero-credit shell">${e(D.group.company)} · 官网五人宣传照 · <a href="${e(D.group.officialUrl)}" target="_blank" rel="noopener noreferrer">图片来源 ↗</a></p>`:''}</section><section class="roster-section chapter shell">${chapterHeading('MEMBERS','成员',action('全部成员',h('members')))}${rosterMarkup(D.members)}</section><section class="release-section chapter shell">${chapterHeading('DISCOGRAPHY','发行作品',action('浏览作品',h('works')))}${releases.length?`<div class="release-flow">${releases.map(releaseCard).join('')}</div>`:state('暂无发行作品')}</section>${D.works.length?`<section class="video-section chapter shell">${chapterHeading('VIDEOS','影像',action('全部影像',h('works',null,{type:'mv'})))}${videoDirectory(D.works.slice(0,3))}</section>`:''}<section class="timeline-section chapter shell">${chapterHeading('TIMELINE','时间轴',action('完整时间轴',h('timeline')))}<div class="chronicle">${events.slice(0,2).map(eventMarkup).join('')||state('时间轴暂无内容')}</div></section>`;}
 function members(route){const q=(route.params.get('q')||'').trim(),members=D.members.filter(m=>!q||(name(m)+' '+m.stageName).toLocaleLowerCase().includes(q.toLocaleLowerCase()));return `<div class="shell members-page"><header class="page-head"><div><p class="section-label" lang="en">MEMBERS</p><h1 class="page-title">成员</h1></div><a class="page-crosslink" href="${e(h('works'))}">发行与影像 ↗</a></header><form class="toolbar" data-search="members"><label class="search"><span>中文名或艺名</span><input type="search" name="q" value="${e(q)}" autocomplete="off" placeholder="寻找成员"></label><button type="submit">查找 ↗</button></form><section class="roster-section chapter">${members.length?rosterMarkup(members):state('没有找到匹配的成员',h('members'))}</section></div>`;}
 function person(route){
  const m=D.members.find(x=>x.id===route.id);if(!m)return `<div class="shell">${state('没有找到这位成员',h('members'))}</div>`;
  const i=D.members.indexOf(m),prev=D.members[i-1],next=D.members[i+1],rels=allReleases().filter(x=>(x.memberIds||[]).includes(m.id)),videos=D.works.filter(w=>(w.memberIds||[]).includes(m.id)),facts=[['艺名',m.stageName],['国籍',m.nationality],['出生日期',date(m.birthDate)],['加入',date(m.joined)],['离开',date(m.left)],['活动状态',m.status]].filter(x=>x[1]);const back=backTo(route,h('members'));
  return `<div class="shell personal-top"><a class="back" href="${e(back)}">← 返回</a><article class="personal-spread"><figure class="personal-photo quality-parent" style="${e(mediaStyle(m.portrait,'member-detail'))}">${img(m.portrait,name(m)+' · '+m.stageName,{eager:true,zoom:true,purpose:'member-detail'})}</figure><div class="personal-copy"><p class="section-label" lang="en">MEMBER · ${String(i+1).padStart(2,'0')}</p><h1>${e(name(m))}</h1><p class="personal-stage" lang="en">${e(m.stageName)}</p>${m.role?`<p class="profile-role">${e(m.role)}</p>`:''}${m.profile?`<p class="profile-copy">${e(m.profile)}</p>`:''}${facts.length?`<dl class="facts">${facts.map(([label,value])=>`<div><dt>${label}</dt><dd>${e(value)}</dd></div>`).join('')}</dl>`:''}</div></article>${rels.length?`<section class="release-section chapter">${chapterHeading('DISCOGRAPHY','参与发行')}<div class="release-flow">${rels.map(releaseCard).join('')}</div></section>`:''}${videos.length?`<section class="chapter member-videos">${chapterHeading('VIDEOS','参与影像')}${videoDirectory(videos)}</section>`:''}<nav class="siblings" aria-label="更多成员">${prev?`<a href="${e(h('person',prev.id,{return:back}))}"><span>上一位</span>← ${e(name(prev))}</a>`:'<span></span>'}<a class="all-members" href="${e(/^#\/members(?:\?|$)/.test(back)?back:h('members'))}">返回成员目录</a>${next?`<a href="${e(h('person',next.id,{return:back}))}"><span>下一位</span>${e(name(next))} →</a>`:''}</nav></div>`;
 }
 function relations(item){const ms=(item.memberIds||[]).map(id=>D.members.find(m=>m.id===id)).filter(Boolean),release=item.releaseKey?D.releases.find(r=>r.key===item.releaseKey):null;if(!ms.length&&!release)return '';return `<section class="related-members">${release?`<a class="text-action" data-related-release="${e(release.key)}" href="${e(releaseHref(release))}">所属发行：${e(release.title)} ↗</a>`:''}${ms.length?`<h2>${item.type==='MV'||item.type==='STAGE'?(item.participantStatus==='partial'?'已确认参演成员':'参演成员'):'参与成员'}</h2><div>${ms.map(m=>`<a href="${e(h('person',m.id,{return:scope.hash}))}">${e(name(m))}</a>`).join('')}</div>`:''}</section>`;}
 function detail(route,type,item){
  const release=type==='release',backParams=Object.fromEntries(route.params);delete backParams.detail;delete backParams.return;const backTarget=backTo(route,h('works',null,backParams));const asset=release?item.cover:item.image;const backLabel=/^#\/timeline(?:\?|$)/.test(backTarget)?'返回时间轴':/^#\/person\//.test(backTarget)?'返回成员':/^#\/members(?:\?|$)/.test(backTarget)?'返回成员目录':/^#\/home(?:\?|$)/.test(backTarget)?'返回首页':'返回作品';
  return `<div class="shell personal-top"><a class="back" href="${e(backTarget)}">← ${e(backLabel)}</a><article class="detail-layout chapter ${!asset?'no-media':''}" data-detail-type="${release?'release':item.type}">${asset?`<figure class="quality-parent detail-media" style="${e(mediaStyle(asset,release?'release-detail':mediaPurpose(asset,'video-preview')))}">${img(asset,item.title+(release?' 封面':' 预览'),{eager:true,zoom:true,purpose:release?'release-detail':'video-preview'})}${sourceLink(asset,asset?.usage==='mv_related_article_illustration'?'报道来源':'图片来源')}</figure>`:''}<div class="detail-story"><p class="section-label" lang="en">${release?'DISCOGRAPHY':item.type==='STAGE'?'STAGE':'VIDEO'}</p><p class="meta">${release?'发行':publicVideoLabel(item)}</p><h1 class="page-title">${e(item.title)}</h1>${!release&&!asset?'<p class="missing-preview">预览图暂缺</p>':''}<dl class="release-facts">${item.date?`<div><dt>日期</dt><dd>${e(date(item.date))}</dd></div>`:''}${release&&item.type?`<div><dt>类型</dt><dd>${e(item.type)}</dd></div>`:''}${item.version?`<div><dt>版本</dt><dd>${e(item.version)}</dd></div>`:''}</dl>${relations(item)}<div class="detail-actions">${release&&item.sourceUrl?`<a class="button" href="${e(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">发行来源 ↗</a>`:''}${!release&&item.url?`<a class="button" href="${e(item.url)}" target="_blank" rel="noopener noreferrer">打开官方视频 ↗</a>`:''}${!release&&item.id?`<button class="button button-outline" type="button" data-open-work="${e(item.key)}">打开作品记录</button>`:''}</div></div></article>${relatedTimeline(item)}${release&&D.works.some(w=>w.releaseKey===item.key)?`<section class="chapter member-videos">${chapterHeading('VIDEOS','影像')}${videoDirectory(D.works.filter(w=>w.releaseKey===item.key))}</section>`:''}</div>`;
 }
 function works(route){
  const type=['release','mv','stage'].includes(route.params.get('type'))?route.params.get('type'):'release',q=(route.params.get('q')||'').trim(),collection=type==='release'?allReleases():D.works.filter(w=>type==='mv'?w.type==='MV':w.type==='STAGE');const detailKey=route.params.get('detail');
  if(detailKey){const item=collection.find(x=>x.key===detailKey);return item?detail(route,type,item):`<div class="shell">${state('没有找到这件作品',h('works',null,{type}))}</div>`;}
  const filtered=collection.filter(x=>!q||x.title.toLocaleLowerCase().includes(q.toLocaleLowerCase()));
  return `<div class="shell works-page"><header class="page-head"><div><p class="section-label" lang="en">DISCOGRAPHY / VIDEOS</p><h1 class="page-title">作品</h1></div><a class="page-crosslink" href="${e(h('timeline'))}">沿着时间浏览 ↗</a></header><div class="catalog-controls"><nav class="work-tabs" aria-label="作品类型">${[['release','发行'],['mv','影像'],['stage','舞台']].map(([key,label])=>`<a href="${e(h('works',null,{type:key,q:q||undefined}))}"${key===type?' aria-current="page"':''}>${label}</a>`).join('')}</nav><form class="toolbar" data-search="works"><label class="search"><span>作品名称</span><input name="q" type="search" value="${e(q)}" placeholder="寻找作品" autocomplete="off"></label><button type="submit">查找 ↗</button></form></div><section class="chapter catalog-results">${filtered.length?(type==='release'?`<div class="release-flow">${filtered.map(releaseCard).join('')}</div>`:videoDirectory(filtered)):state('没有找到匹配的作品',h('works',null,{type}))}</section></div>`;
 }
 function timeline(){const events=sortedEvents(),back=A.route().params.get('return');return `<div class="shell timeline-page">${back?`<a class="back" href="${e(backTo(A.route(),h('works')))}">← 返回资料</a>`:''}<header class="page-head"><div><p class="section-label" lang="en">TIMELINE</p><h1 class="page-title">时间轴</h1></div><a class="page-crosslink" href="${e(h('works'))}">发行与影像 ↗</a></header>${events.length?`<div class="chronicle">${events.map(eventMarkup).join('')}</div>`:state('时间轴暂无内容')}</div>`;}
 function renderPage(){const route=A.route(),parts=chrome(route.page);const body=route.page==='home'?home():route.page==='members'?members(route):route.page==='person'?person(route):route.page==='works'?works(route):route.page==='timeline'?timeline():`<div class="shell">${state('这一页暂时无法打开',h('home'))}</div>`;scope.setHTML(`<a class="skip" href="#main">跳到正文</a><header id="header" class="group-header ${route.page==='home'?'is-home':''}">${parts.header}</header><main id="main" class="group-main" data-page="${e(route.page)}" tabindex="-1">${body}</main><footer id="footer" class="group-footer">${parts.footer}</footer>`);}

 listen(scope.element,'submit',event=>{const form=event.target.closest('[data-search]');if(!form)return;event.preventDefault();const page=form.dataset.search,params=page==='works'?Object.fromEntries(A.route().params):{};delete params.detail;params.q=new FormData(form).get('q')||'';scope.navigate(h(page,null,params));});
 listen(scope.element,'click',event=>{const target=event.target.closest('[data-open-work]');if(!target)return;const w=D.works.find(x=>x.key===target.dataset.openWork);if(w&&w.id)A.emitIntegration({action:'open-work',groupId:D.group.id,workId:w.id,videoId:w.videoId,videoType:w.videoType??null,slotType:w.type,returnTo:scope.hash});});
 const render=guard(renderPage);scope.onRoute(render);render();
 handle={navigate:guard(hash=>scope.navigate(hash)),destroy:dispose};active=handle;return handle;
 }catch(error){try{dispose();}catch(_){}throw error;}
 }
 function destroy(){if(active)active.destroy();}
 return Object.freeze({mount,destroy});
}
