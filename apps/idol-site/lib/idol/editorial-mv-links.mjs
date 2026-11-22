import {renderGroupInformation} from './group-information.mjs';

export function editorialRequest(data,hash,returnTo,routeCategory) {
  if(!hash)return null;
  const url=new URL(hash.slice(1),'https://artist.invalid');
  const [,page,id]=url.pathname.split('/');
  const groupId=data.group.id;
  if(page==='person')return {action:'open-member',groupId,memberId:decodeURIComponent(id),returnTo};
  const key=url.searchParams.get('detail');
  if(page!=='works'||!key)return null;
  const category=routeCategory(data,url.searchParams);
  if(category==='release'){
    const release=data.releases.find(row=>row.key===key);
    return {action:'open-release',groupId,releaseKey:key,releaseRecordId:release?.recordId??null,returnTo};
  }
  const video=data.works.find(row=>row.key===key&&row.type===category);
  return video?{action:'open-work',groupId,workId:video.id??null,videoId:video.videoId,
    videoType:video.videoType??null,slotType:video.type,returnTo}:null;
}

/** Keep the public editorial route as the focus key when a verified MV can open the shared player. */
export function bindEditorialLinks({root, data, origin, artistUrl, nativeRequest, nativeHref, native}) {
  const routeKey=data.group.slug+'Route';
  for (const link of root.querySelectorAll('a[href^="#/"],a[data-'+data.group.slug+'-route]')) {
    const route = link.dataset[routeKey]??link.getAttribute('href');
    const local = artistUrl(data, route);
    if (!local) continue;
    link.dataset[routeKey] = route;
    const request = nativeRequest(route, origin);
    let destination = null;
    if (request?.slotType === 'MV') {
      destination = nativeHref(data, request, native)
        ?? native?.pendingMvHref?.(request.workId, request.videoId, artistUrl(data, origin));
    }
    if (destination) link.dataset.editorialFocusHref = local;
    else delete link.dataset.editorialFocusHref;
    const href=destination??local;
    if(link.getAttribute('href')!==href)link.setAttribute('href',href);
  }
}

export function updateEditorialAccounts(root,data,accounts) {
  data.publicAccounts.splice(0,data.publicAccounts.length,...accounts);
  const current=root.querySelector('[data-home-module="information"]');
  if(!current)return;
  const template=root.ownerDocument.createElement('template');
  template.innerHTML=renderGroupInformation(data.group.slug,{social:accounts});
  const next=template.content.firstElementChild;
  if(!next||next.isEqualNode(current))return;
  const active=root.getRootNode().activeElement;
  const focus=current.contains(active)?active:null;
  const open=current.querySelector('details')?.open;
  const details=next.querySelector('details');
  if(details)details.open=Boolean(open);
  current.replaceWith(next);
  if(focus){
    const link=focus.getAttribute('href');
    const target=link?[...next.querySelectorAll('a[href]')].find(a=>a.getAttribute('href')===link):next.querySelector('summary');
    target?.focus({preventScroll:true});
  }
}

export function restoreEditorialMvFocus(root,key) {
  if(key?.kind!=='href')return false;
  const link=[...root.querySelectorAll('[data-editorial-focus-href]')].find(node=>node.dataset?.editorialFocusHref===key.value);
  if(!link||link.closest('[hidden],[inert],[aria-hidden="true"]'))return false;
  link.focus({preventScroll:true});return true;
}
