import {createRoot} from 'react-dom/client';
import App from '../../app/page';
import {PublicAccessProvider} from '../../components/public-access';
import {ArtistTimelineHostProvider} from '../../components/artist-timeline-host';
import {timelineRecordUrl} from '../../lib/idol/timeline/navigation';
import {createReviewFetch} from './read-only-fetch.mjs';
// Build-only allowlisted modules; raw snapshots never enter the browser graph.
// @ts-expect-error Supplied by the review builder.
import payload from 'all-review-payload';
// @ts-expect-error Supplied by the review builder.
import pages from 'all-review-pages';
import '../../app/globals.css';
import '../../components/artist-timeline.css';

const path=location.pathname.replace(/\/index\.html$/,'').replace(/\/$/,'')||'/';
if(path!==location.pathname)history.replaceState(history.state,'',path+location.search+location.hash);
const nativeFetch=window.fetch.bind(window);
window.fetch=createReviewFetch(payload.catalogs,location.origin,{viewer:payload.viewer,nativePortrait:payload.nativePortrait,readAsset:nativeFetch});
const slug=path.startsWith('/artists/')?path.slice('/artists/'.length):null;
const Page=slug&&pages[slug];
const catalog=slug?payload.catalogs[slug]:payload.catalogs.all;
document.title=(slug?payload.registry.find((g:{slug:string})=>g.slug===slug)?.name+' · ':'')+'全团只读审阅';
createRoot(document.getElementById('root')!).render(<PublicAccessProvider canEdit={false}>
 <ArtistTimelineHostProvider value={{catalog,loading:false,error:'',serverRoute:path,navigate:(request,beforeLeave)=>{
  const url=timelineRecordUrl(request);if(url&&request.returnTo===location.pathname+location.search&&beforeLeave())location.assign(url);
 }}}>
  {Page?<Page/>:path==='/'?<App/>:<main><h1>未找到这个团体</h1><a href="/?view=groups">返回团体索引</a></main>}
 </ArtistTimelineHostProvider>
</PublicAccessProvider>);
