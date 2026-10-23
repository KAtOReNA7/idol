import {createRoot} from 'react-dom/client';
import App from '../../app/page';
import VvupArtist from '../../components/vvup-artist';
import content from '../../data/vvup-artist.json';
import timeline from '../../data/artist-timelines/vvup.json';
import {timelineRecordUrl} from '../../lib/idol/timeline/navigation';
import {ArtistTimelineHostProvider,type TimelineNavigationRequest} from '../../components/artist-timeline-host';
import {PublicAccessProvider} from '../../components/public-access';
import {createReadOnlyReviewFetch} from './read-only-fetch.mjs';
import {ARTIST_PATH,RECORDS_PATH,canonicalReviewPath,normalizeReviewLocation,reviewRecordHref,installArtistHistory,installRecordHistory,installReviewLinks} from './routes.mjs';
// @ts-expect-error Only the builder provides this sanitized public virtual module.
import catalog from 'vvup-review-catalog';
import '../../app/globals.css';
import '../../app/artists/vvup/vvup-native.css';

window.fetch=createReadOnlyReviewFetch(catalog,location.origin);
document.title='VVUP · 页面审阅';
const target=document.getElementById('root');
if(!target)throw new Error('Vvup review root is missing');
const route=normalizeReviewLocation(location,history);
if(route===RECORDS_PATH)installRecordHistory(history,location);
if(route===ARTIST_PATH)installArtistHistory(history,location);
installReviewLinks(target,location);
function navigateTimeline(request:TimelineNavigationRequest,beforeLeave:()=>boolean){
  const timelineReturn=ARTIST_PATH+new URL(request.returnTo,location.origin).search;
  const href=timelineRecordUrl({...request,returnTo:timelineReturn});
  const rows=(request.kind==='member'?catalog.members:catalog.works) as {id:string;groupIds:string[]}[];
  if(!href||request.groupId!==content.groupId||canonicalReviewPath(location.pathname)+location.search!==request.returnTo||!rows.some(row=>row.id===request.targetId&&row.groupIds.includes(content.groupId)))return;
  if(beforeLeave())window.location.assign(reviewRecordHref(href,location.href));
}
createRoot(target).render(<PublicAccessProvider canEdit={false}>
  <ArtistTimelineHostProvider value={{catalog,input:timeline,navigate:navigateTimeline,loading:false,error:'',serverRoute:ARTIST_PATH}}>
    {route===ARTIST_PATH?<VvupArtist content={content}/>:route===RECORDS_PATH?<App/>:<main><h1>此审阅页仅提供 VVUP</h1><a href={ARTIST_PATH}>返回 VVUP 首页</a></main>}
  </ArtistTimelineHostProvider>
</PublicAccessProvider>);
