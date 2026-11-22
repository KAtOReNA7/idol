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
  for (const link of root.querySelectorAll('a[href^="#/"]')) {
    const route = link.getAttribute('href');
    const local = artistUrl(data, route);
    if (!local) continue;
    link.dataset[data.group.slug + 'Route'] = route;
    const request = nativeRequest(route, origin);
    let destination = null;
    if (request?.slotType === 'MV') {
      destination = nativeHref(data, request, native)
        ?? native?.pendingMvHref?.(request.workId, request.videoId, artistUrl(data, origin));
    }
    if (destination) link.dataset.editorialFocusHref = local;
    link.setAttribute('href', destination ?? local);
  }
}

export function restoreEditorialMvFocus(root,key) {
  if(key?.kind!=='href')return false;
  const link=[...root.querySelectorAll('[data-editorial-focus-href]')].find(node=>node.dataset?.editorialFocusHref===key.value);
  if(!link||link.closest('[hidden],[inert],[aria-hidden="true"]'))return false;
  link.focus({preventScroll:true});return true;
}
