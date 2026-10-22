/** Test-only formatter used solely by actual artist-preview.ts's routeUrl import.
 * This is NOT journey, navigation authorization, dirty/save protection or API.
 * Host fixture navigation is a supplied callback spy; no global site route runs.
 */
export function routeUrl(route:{nav?:string;work?:string|null;member?:string|null;video?:string;artistReturn?:string}) {
  const params=new URLSearchParams();
  if(route.nav)params.set('view',route.nav);
  if(route.work)params.set('work',route.work);
  if(route.member)params.set('member',route.member);
  if(route.video&&route.video!=='mv')params.set('video',route.video);
  if(route.artistReturn)params.set('artistReturn',route.artistReturn);
  return '/'+(params.size?'?'+params:'');
}
