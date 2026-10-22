export const groups=Object.freeze({
  izna:Object.freeze({id:'rec28ldfRTiCpp',name:'izna',path:'/artists/izna'}),
  ifeye:Object.freeze({id:'rec28ldfRTiCGa',name:'ifeye',path:'/artists/ifeye'})
});
export const reviewPath=slug=>Object.hasOwn(groups,slug)?'/design-review/astra/'+slug:null;
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
    if(!value.startsWith(path)||url.origin!=='https://review.invalid'||url.pathname!==path||url.search)return null;
    const hash=url.hash||'#/home';return validRoute(data,hash)?hash:null;
  }catch{return null;}
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
  const artistReturn=services.safeArtistReturn(groups[data.group.slug].path);
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
