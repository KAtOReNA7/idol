import {createRoot} from 'react-dom/client';
import App from '../../app/page';
import IznaEditorial from '../../components/izna/editorial';
import {ArtistTimelineHostProvider} from '../../components/artist-timeline-host';
import {PublicAccessProvider} from '../../components/public-access';
import {createReadOnlyReviewFetch} from './read-only-fetch.mjs';
import {ARTIST_PATH,RECORDS_PATH,normalizeReviewLocation,reviewRecordHref,installRecordHistory,installReviewLinks} from './routes.mjs';
// @ts-expect-error Only the builder provides this sanitized, public virtual module.
import catalog from 'izna-review-catalog';
import '../../app/globals.css';

window.fetch = createReadOnlyReviewFetch(catalog, location.origin);
document.title = 'izna · 页面审阅';
const target = document.getElementById('root');
if (!target) throw new Error('izna review root is missing');
const route = normalizeReviewLocation(location, history);
if (route === RECORDS_PATH) installRecordHistory(history, location);
installReviewLinks(target, location);
createRoot(target).render(<PublicAccessProvider canEdit={false}>
  <ArtistTimelineHostProvider value={{catalog,loading:false,error:'',serverRoute:ARTIST_PATH}}>
    {route === ARTIST_PATH ? <IznaEditorial onNativeOpen={(_request,context)=>{
      const href = reviewRecordHref(context.href, location.href);
      if (typeof href !== 'string' || !href.startsWith(RECORDS_PATH + '?')) return false;
      window.location.assign(href);
      return true;
    }}/> : route === RECORDS_PATH ? <App/> : <main><h1>此审阅页仅提供 izna</h1><a href={ARTIST_PATH}>返回 izna 首页</a></main>}
  </ArtistTimelineHostProvider>
</PublicAccessProvider>);
