/** Public display associations only; no native catalog identity or save authority. */
export const originalMvEvidence = Object.freeze({
  workId:'rec28ldfRTrPxZ',videoId:'aKRY80dEkJw',
  memberIds:Object.freeze(['recvxAPQCFRlmM','recvxAPQCFnv3p','recvxAPQCF1lfe','recvxAPQCFt0cc']),
  sourceUrl:'https://thekrazemag.com/latest-updates/2025/5/27/udtts-debut-really-really-deserves-more-love',
  label:'The Kraze · 原 MV 阵容报道',
});
export function originalMv(artist){
  if(artist?.slug!=='udtt'||artist.id!=='rec28ldfRTiDPs')return null;
  return artist.works.find(w=>w.id===originalMvEvidence.workId&&w.type==='mv'&&w.videoId===originalMvEvidence.videoId)??null;
}
export function originalMvMembers(artist){
  if(!originalMv(artist))return [];
  return originalMvEvidence.memberIds.map(id=>artist.members.find(m=>m.id===id)).filter(Boolean);
}
// Explicit existing event/release/catalogue identities, never title-based matching.
const releasePairs=Object.freeze([
  {eventId:'e-udtt-retry-prerelease-candidate',releaseKey:'udtt-retry',workKey:'catalog:udtt:retry',date:'2024-12-11',albumId:'1782470972',eventSource:'https://music.bugs.co.kr/album/20689949'},
  {eventId:'e-udtt-school-rush-debut-candidate',releaseKey:'udtt-school-rush',workKey:'catalog:udtt:school-rush',date:'2025-04-29',albumId:'1809889440',eventSource:'https://music.apple.com/us/album/school-rush-single/1809889440'},
  {eventId:'e-udtt-viper-digital-release',releaseKey:'udtt:viper-digital-release',workKey:'catalog:udtt:viper',date:'2026-06-27',albumId:'6783258321',eventSource:'https://music.apple.com/us/album/viper-single/6783258321'},
]);
const canonicalUrl=value=>{try{const u=new URL(value);return u.origin+u.pathname;}catch{return null;}};
export function releaseEventPairs(artist){
  if(artist?.slug!=='udtt'||artist.id!=='rec28ldfRTiDPs')return [];
  return releasePairs.flatMap(pair=>{
    const event=artist.timeline.find(t=>t.id===pair.eventId&&t.releaseKey===pair.releaseKey&&t.status==='confirmed'&&t.date===pair.date&&t.eventDate?.value===pair.date&&t.sources?.some(s=>canonicalUrl(s.url)===pair.eventSource));
    const work=artist.works.find(w=>w.type==='release'&&w.candidateKey===pair.workKey&&w.date===pair.date&&w.id===null&&w.projectReleaseId===null&&w.image?.sourceAlbumId===pair.albumId&&canonicalUrl(w.image?.sourceUrl)?.endsWith('/'+pair.albumId));
    return event&&work?[{event,work}]:[];
  });
}
/** Bounded group-local history. Only renderer-known pages/entities are accepted. */
export function navigation(artist,route,h){
  const allowed=new Set(['home','members','member','works','work','timeline']);
  const clean=item=>{
    if(!item||!allowed.has(item.page))return null;
    const list=item.page==='member'?artist.members:item.page==='work'?artist.works:null;
    if(list&&!list.some(x=>h.entityKey(x)===item.key))return null;
    const query=new URLSearchParams();
    for(const k of ['q','type','event'])if(typeof item[k]==='string')query.set(k,item[k]);
    return {page:item.page,key:list?item.key:null,query};
  };
  const pack=item=>({page:item.page,key:item.key??null,...Object.fromEntries([...item.query].filter(([k])=>['q','type','event'].includes(k)))});
  let trail=[];try{const raw=JSON.parse(route.query.get('udttTrail')??'[]');if(Array.isArray(raw))trail=raw.slice(-8).map(clean).filter(Boolean);}catch{}
  const context=()=>pack({page:route.page,key:route.key,query:route.query});
  const queryWithTrail=(query,stack)=>{const q=new URLSearchParams(query);q.delete('udttTrail');if(stack.length)q.set('udttTrail',JSON.stringify(stack.map(pack)));return q;};
  // Host parseReviewRoute caps the encoded hash, not the number of frames.
  // Discard oldest return frames first; if one huge query still exceeds the
  // budget, use the short known group-local destination rather than relax it.
  const boundedHref=(page,key,query,stack)=>{
    const kept=[...stack];
    let hash=h.href('udtt',page,key,queryWithTrail(query,kept));
    while(hash.length>4096&&kept.length){kept.shift();hash=h.href('udtt',page,key,queryWithTrail(query,kept));}
    return hash.length<=4096?hash:h.href('udtt',page,key);
  };
  const enter=(page,key=null,{event}={})=>{
    const here=context();if(event)here.event=event;
    const next=[...trail,clean(here)].filter(Boolean).slice(-8);
    return boundedHref(page,key,new URLSearchParams(),next);
  };
  const back=(fallback,label)=>{
    if(!trail.length)return {href:boundedHref(fallback,null,route.query,[]),label};
    const previous=trail.at(-1);
    const member=previous.page==='member'?artist.members.find(x=>h.entityKey(x)===previous.key):null;
    const work=previous.page==='work'?artist.works.find(x=>h.entityKey(x)===previous.key):null;
    return {href:boundedHref(previous.page,previous.key,previous.query,trail.slice(0,-1)),label:member?'← 返回'+(member.nameZh||member.name)+'的资料':work?'← 返回《'+work.title+'》':previous.page==='timeline'?'← 返回时间轴':label};
  };
  return {enter,back};
}
