export const groups=Object.freeze({
  izna:Object.freeze({id:'rec28ldfRTiCpp',name:'izna',path:'/artists/izna'})
});
export const reviewPath=slug=>groups[slug]?.path??null;
// Preserve the independently authored renderers' existing route contracts.
export const filterField=data=>data.group.slug==='ifeye'?'type':'kind';
export function routeCategory(data,params){
  if(data.group.slug==='ifeye')return ({release:'release',mv:'MV',stage:'STAGE'})[params.get('type')||'release']??null;
  const kind=params.get('kind')||'all';return ['all','release','MV','STAGE'].includes(kind)?kind:null;
}

/** Finite public routes only. No native/editor state is accepted here. */
export function validRoute(data,hash,depth=0) {
  if(typeof hash!=='string'||hash.length>4096||depth>8||!hash.startsWith('#/')||/[\\\u0000-\u001f]/.test(hash))return false;
  const [path,raw='',...extra]=hash.slice(2).split('?');
  if(extra.length)return false;
  const parts=path.split('/'),page=parts[0],p=new URLSearchParams(raw);
  if(!['home','members','person','works','timeline'].includes(page))return false;
  if(parts.length>2||page!=='person'&&parts.length!==1)return false;
  const allowed=page==='person'?['return']:page==='members'?['q']:page==='works'?[filterField(data),'q','detail','return']:page==='timeline'?['event','return']:[];
  for(const key of p.keys())if(!allowed.includes(key)||p.getAll(key).length!==1)return false;
  if((p.get('q')?.length??0)>200)return false;
  if(page==='person') {
    let id;try{id=decodeURIComponent(parts[1]||'');}catch{return false;}
    if(!data.members.some(m=>m.id===id))return false;
  }
  if(page==='works') {
    const kind=routeCategory(data,p);if(kind===null)return false;
    if(p.has('detail')) {
      const release=kind==='release';if(kind==='all')return false;
      if(!(release?data.releases:data.works).some(row=>row.key===p.get('detail')&&(release||row.type===kind)))return false;
    }
  }
  if(page==='timeline'&&p.has('event')&&!data.events.some(e=>(e.id||e.candidateKey)===p.get('event')))return false;
  return !p.has('return')||validRoute(data,p.get('return'),depth+1);
}

export function readReviewUrl(data,value) {
  const path=reviewPath(data.group.slug);
  try {
    const url=new URL(value,'https://review.invalid');
    if(typeof value!=='string'||!value.startsWith(path)||value.split('?')[0]!==path||url.origin!=='https://review.invalid'||url.pathname!==path||url.hash||/[\\\u0000-\u0020]/.test(value))return null;
    const p=url.searchParams;
    for(const key of p.keys())if(!['section','member','release','media','format','q','event'].includes(key)||p.getAll(key).length!==1)return null;
    const section=p.get('section')||'overview',q=p.get('q')||'',member=p.get('member'),release=p.get('release'),media=p.get('media'),format=p.get('format'),event=p.get('event');
    if(q.length>200||!['overview','members','works','records','updates'].includes(section)||format&&!['mv','stage'].includes(format))return null;
    if(['member','release','media','event'].some(k=>p.has(k)&&!p.get(k))||[member,release,media,event].filter(Boolean).length>1)return null;
    if(member&&section!=='members'||release&&section!=='works'||media&&section!=='works'||event&&section!=='updates')return null;
    if(format&&section!=='works'||release&&format||q&&!['members','works','records'].includes(section))return null;
    const out=new URLSearchParams();let page;
    if(member)page='person/'+encodeURIComponent(member);
    else if(section==='members')page='members';
    else if(section==='updates'){page='timeline';if(event)out.set('event',event);}
    else if(section==='works'||section==='records'){
      page='works';out.set('kind',release||section==='records'?'release':format==='mv'?'MV':format==='stage'?'STAGE':'all');
      if(release||media)out.set('detail',release||media);
    }else page='home';
    if(q&&!member)out.set('q',q);
    if(q&&(member||release||media)){
      const directory=member?'#/members?q='+encodeURIComponent(q):'#/works?kind='+out.get('kind')+'&q='+encodeURIComponent(q);
      out.set('return',directory);
    }
    const hash='#/'+page+(out.size?'?'+out:'');return validRoute(data,hash)?hash:null;
  }catch{return null;}
}

/** Internal renderer routes stay private to the owned host. Public links use the
 * existing finite artist query protocol, including new-tab and native returns. */
export function artistUrl(data,hash){
  if(!validRoute(data,hash))return null;
  const url=new URL(hash.slice(1),'https://review.invalid'),parts=url.pathname.split('/'),p=url.searchParams,out=new URLSearchParams();
  if(parts[1]==='members')out.set('section','members');
  if(parts[1]==='person'){out.set('section','members');out.set('member',decodeURIComponent(parts[2]));}
  if(parts[1]==='timeline'){out.set('section','updates');if(p.has('event'))out.set('event',p.get('event'));}
  if(parts[1]==='works'){
    const kind=routeCategory(data,p),detail=p.get('detail');out.set('section',kind==='release'&&!detail?'records':'works');
    if(kind==='MV'||kind==='STAGE')out.set('format',kind==='MV'?'mv':'stage');
    if(detail)out.set(kind==='release'?'release':'media',detail);
  }
  let query=p.get('q'),parent=p.get('return');
  const directory=parts[1]==='person'?'/members':parts[1]==='works'?'/works':null;
  for(let depth=0;!query&&parent&&depth<8;depth++){
    const origin=new URL(parent.slice(1),'https://review.invalid'),params=origin.searchParams;
    if(['/members','/works','/timeline','/home'].includes(origin.pathname)&&!params.has('detail')){if(origin.pathname===directory)query=params.get('q');break;}
    parent=params.get('return');
  }
  if(query&&['members','person','works'].includes(parts[1]))out.set('q',query);
  return reviewPath(data.group.slug)+(out.size?'?'+out:'');
}

/** One tab-local navigation position only. No catalog, record payload, score,
 * credentials or arbitrary URL is accepted by this cross-document handoff. */
export function publicPosition(data,value,url){
  if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!['url','route','y','focus'].includes(k)))return null;
  const incoming=readReviewUrl(data,url),canonical=incoming?artistUrl(data,incoming):null;
  if(!canonical||value.url!==canonical||!validRoute(data,value.route)||artistUrl(data,value.route)!==canonical||!Number.isFinite(value.y)||value.y<0||value.y>10000000)return null;
  let focus=null;const f=value.focus;
  if(f&&typeof f==='object'&&typeof f.value==='string'&&f.value.length<=4096){
    if(f.kind==='href'&&readReviewUrl(data,f.value)||f.kind==='input'&&['q','kind'].includes(f.value)||f.kind==='event'&&data.events.some(e=>(e.id||e.candidateKey)===f.value)||f.kind==='native'&&['open-member','open-work','open-rating'].includes(f.value))focus={kind:f.kind,value:f.value};
  }
  return {url:canonical,route:value.route,y:value.y,focus};
}

const privateKeys=new Set(['score','rating','ratings','note','notes','watched','favorite','snapshot','credentials']);
export function exactRequest(data,request) {
  if(!request||Object.keys(request).some(k=>privateKeys.has(k))||request.groupId!==data.group.id||!validRoute(data,request.returnTo))return null;
  if(request.action==='open-member')return data.members.find(m=>m.id===request.memberId)?{kind:'member',memberId:request.memberId}:null;
  if(!['open-work','open-record','open-rating'].includes(request.action))return null;
  if(!['workId','videoId','videoType','slotType'].every(k=>Object.hasOwn(request,k)))return null;
  if(!/^rec[A-Za-z0-9]+$/.test(request.workId||''))return null;
  const matches=data.works.filter(w=>w.id&&w.id===request.workId&&w.videoId===request.videoId&&(w.videoType??null)===request.videoType&&w.type===request.slotType);
  return matches.length===1?{kind:'video',work:matches[0]}:null;
}

/** Bindings are host-verified public identity proofs, NOT a private catalog.
 * No network, storage, scoring or saving is performed by this adapter.
 */
export function nativeHref(data,request,services) {
  const entity=exactRequest(data,request),bindings=services?.bindings;
  if(!entity||!Array.isArray(bindings)||typeof services?.routeUrl!=='function'||typeof services?.safeArtistReturn!=='function')return null;
  const matches=bindings.filter(b=>b.groupId===data.group.id&&typeof b.evidence==='string'&&b.evidence.length>0&&(
    entity.kind==='member'?b.kind==='member'&&b.memberId===entity.memberId:
    b.kind==='video'&&['workId','videoId','videoType','slotType'].every(k=>b[k]===request[k])&&b.sourceKey===request.videoId&&b.clip===null&&
      Array.isArray(b.parentWorkIds)&&b.parentWorkIds.length===1&&b.parentWorkIds[0]===request.workId&&
      (request.action==='open-work'||b.scoreBindingVerified===true)
  ));
  if(matches.length!==1)return null;
  // The existing sanitizer does not accept review URLs. Do not extend it.
  const artistReturn=services.safeArtistReturn(artistUrl(data,request.returnTo));
  if(!artistReturn)return null;
  const route=entity.kind==='member'
    ?{nav:'members',member:entity.memberId,work:null,video:'mv',artistReturn}
    :{nav:'works',member:null,work:request.workId,video:request.slotType==='STAGE'?'stage':'mv',artistReturn};
  const href=services.routeUrl(route);
  if(typeof href!=='string'||!href.startsWith('/?')||href.startsWith('//'))return null;
  return href;
}

export function reviewState(previous,url,y,focus) {
  return {...(previous&&typeof previous==='object'&&!Array.isArray(previous)?previous:{}),
    astraIznaIfeyeReview:{version:1,url,y:Number.isFinite(y)&&y>=0?y:0,focus}};
}
export function savedPosition(state,url) {
  const row=state?.astraIznaIfeyeReview;
  return row?.version===1&&row.url===url&&Number.isFinite(row.y)&&row.y>=0?row:null;
}
