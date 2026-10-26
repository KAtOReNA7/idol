const pages = new Set(['home', 'members', 'member', 'works', 'work', 'timeline']);
export function parseRoute(hash = '') {
  const value = hash.replace(/^#\/?/, '');
  const [path, rawQuery = ''] = value.split(/\?(.*)/s);
  let parts;
  try { parts = path.split('/').filter(Boolean).map(decodeURIComponent); } catch { return {slug: null, page: 'not-found', key: null, query: new URLSearchParams()}; }
  const [slug = null, page = 'home', key = null, ...rest] = parts;
  return {slug, page: pages.has(page) && !rest.length && (['member','work'].includes(page) ? Boolean(key) : key === null) ? page : 'not-found', key, query: new URLSearchParams(rawQuery)};
}

/** Serialize an isolated artist route without collapsing repeated query fields. */
export function routeHref(route) {
  const parts=[route.slug];
  if(route.page!=='home')parts.push(route.page);
  if(route.key!=null)parts.push(String(route.key));
  const query=new URLSearchParams(route.query??[]);
  return `#/${parts.map(encodeURIComponent).join('/')}${query.size?'?'+query:''}`;
}

const listPages=new Set(['home','members','works','timeline']);
const details=new Set(['member','work']);
const copyQuery=query=>new URLSearchParams(query??[]);
const withoutReturn=query=>{const result=copyQuery(query);result.delete('returnTo');return result;};

/** A return destination is a same-artist hash route, never an external URL. */
export function safeReturnTo(value,slug) {
  if(typeof value!=='string'||!value.startsWith('#/')||value.length>16384)return null;
  const destination=parseRoute(value);
  if(destination.slug!==slug||destination.page==='not-found')return null;
  return routeHref(destination);
}

export function returnDestination(route) {
  const values=copyQuery(route.query).getAll('returnTo');
  const valid=values.length&&values.every(value=>value===values[0])?safeReturnTo(values[0],route.slug):null;
  if(valid)return valid;
  return routeHref({...route,page:details.has(route.page)?route.page==='work'?'works':'members':route.page,key:null,query:withoutReturn(route.query)});
}

/** Detail links carry both the target state and their complete source-list state. */
export function detailNavigationHref(route,target) {
  if(target.slug!==route.slug||!details.has(target.page)||target.page==='not-found')throw new Error('Detail route is outside the active artist');
  const query=withoutReturn(target.query),source=withoutReturn(route.query);
  // Some retained views expose filters as a plain object. Restore missing fields
  // and repeated values rather than letting Object.fromEntries erase them.
  const names=new Set(source.keys());
  for(const name of names){
    const original=source.getAll(name),present=query.getAll(name);
    if(!present.length)for(const value of original)query.append(name,value);
    else if(original.length>1&&present.length===1&&present[0]===original.at(-1)){
      query.delete(name);for(const value of original)query.append(name,value);
    }
  }
  const origin=listPages.has(route.page)?routeHref({...route,query:withoutReturn(route.query)}):returnDestination(route);
  query.set('returnTo',origin);
  return routeHref({...target,query});
}

export function isReturnControl(element) {
  if(element.hasAttribute?.('data-back')||element.hasAttribute?.('data-return-link'))return true;
  const className=element.getAttribute?.('class')??'';
  return /(?:^|\s)[\w-]*(?:back|return)(?:\s|$)/.test(className)||/^(?:←|返回|回到)/.test(String(element.textContent??'').trim());
}

/** Mutates only same-artist navigation hrefs, not content or production records. */
export function decorateNavigationLinks({root,artist,route}) {
  const result=[];
  for(const element of root.querySelectorAll('a[href]')){
    const raw=element.getAttribute?.('href');if(!raw?.startsWith('#/'))continue;
    const target=parseRoute(raw);if(target.slug!==artist.slug||target.page==='not-found')continue;
    let next=null;
    if(details.has(target.page))next=detailNavigationHref(route,target);
    else if(details.has(route.page)&&listPages.has(target.page)&&isReturnControl(element))next=returnDestination(route);
    if(next&&next!==raw){element.setAttribute('href',next);result.push({from:raw,to:next});}
  }
  return result;
}

/** A host bridge for both hash navigation and Back/Forward, with no persistence. */
export function createHashNavigation({window,onNavigate}) {
  if(!window?.addEventListener||typeof onNavigate!=='function')throw new TypeError('Navigation window and callback are required');
  let destroyed=false,lastHash=null,revision=0;
  const sync=(reason='manual',{force=false}={})=>{
    if(destroyed)return Promise.resolve({status:'destroyed'});
    const hash=window.location.hash??'';
    if(!force&&hash===lastHash)return Promise.resolve({status:'unchanged'});
    lastHash=hash;const serial=++revision;
    return Promise.resolve(onNavigate(parseRoute(hash),{reason,hash,revision:serial}));
  };
  const hashChange=()=>{sync('hashchange').catch(()=>{});},popState=()=>{sync('popstate').catch(()=>{});};
  window.addEventListener('hashchange',hashChange);window.addEventListener('popstate',popState);
  return {sync,read:()=>parseRoute(window.location.hash),get revision(){return revision;},destroy(){if(destroyed)return;destroyed=true;window.removeEventListener('hashchange',hashChange);window.removeEventListener('popstate',popState);}};
}

/** A component requests navigation; only its host may commit a global route. */
export function createScopedNavigation({artist,route,scope,isCurrent=()=>!scope?.destroyed,onNavigate,defaultIdentity=null}){
  const current=()=>!scope?.destroyed&&!scope?.signal?.aborted&&isCurrent();
  return function navigate(target,{reason='filter',identity=defaultIdentity,event=null}={}){
    if(!current())return {status:'stale'};
    let destination;
    try{
      if(typeof target!=='string'||!target.startsWith('#/'))throw new Error('Navigation must use an artist hash route');
      destination=parseRoute(target);
      if(destination.slug!==artist.slug||destination.page==='not-found')throw new Error('Navigation leaves the active artist');
      const rows=destination.page==='work'?artist.works:destination.page==='member'?artist.members:null;
      if(rows&&!rows.some(row=>(row.id??row.candidateKey)===destination.key))throw new Error('Navigation target is absent from the active artist');
    }catch(error){return {status:'invalid',error};}
    const request={groupId:artist.id,slug:artist.slug,href:routeHref(destination),from:routeHref(route),
      fromRoute:{...route,query:new URLSearchParams(route.query??[])},toRoute:destination,
      queryEntries:[...destination.query],returnTo:identity?.returnTo??returnDestination(route),
      identity:identity==null?null:structuredClone(identity),reason,event,signal:scope?.signal??null,isCurrent:current};
    if(typeof onNavigate!=='function')return {status:'unhandled',request};
    const finish=value=>current()?{status:value===false?'declined':'handled',request,value}:{status:'stale',request};
    try{
      const value=onNavigate(request);
      return value&&typeof value.then==='function'?Promise.resolve(value).then(finish,error=>({status:current()?'error':'stale',request,error})):finish(value);
    }catch(error){return {status:current()?'error':'stale',request,error};}
  };
}

export function plainArtistLink(event,element,slug){
  if(event.type!=='click'||event.defaultPrevented||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||(event.button!=null&&event.button!==0))return false;
  const target=element.getAttribute?.('target');if(target&&target.toLowerCase()!=='_self'||element.hasAttribute?.('download'))return false;
  const href=element.getAttribute?.('href');if(!href?.startsWith('#/'))return false;
  const route=parseRoute(href);return route.slug===slug&&route.page!=='not-found';
}
