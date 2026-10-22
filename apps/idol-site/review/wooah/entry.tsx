import {createRoot} from 'react-dom/client';
import App from '../../app/page';
import WooahEditorial from '../../components/wooah/editorial';
import {PublicAccessProvider} from '../../components/public-access';
import {createReadOnlyReviewFetch} from './read-only-fetch.mjs';
import {ARTIST_PATH, RECORDS_PATH, normalizeReviewLocation, installRecordHistory, installReviewLinks} from './routes.mjs';
// Only the synthetic fixture and sanitized stable relation IDs enter this module.
// @ts-expect-error Supplied by build-wooah-review.mjs, never a server import.
import catalog from 'wooah-review-catalog';
import '../../app/globals.css';

window.fetch = createReadOnlyReviewFetch(catalog, location.origin);
document.title = 'WOOAH · 页面验收 · 示例资料';
const target = document.getElementById('root');
if (!target) throw new Error('WOOAH review root is missing');
const route = normalizeReviewLocation(location, history);
if (route === RECORDS_PATH) installRecordHistory(history, location);
installReviewLinks(target, location);
createRoot(target).render(<PublicAccessProvider canEdit={false}>
  {route === ARTIST_PATH ? <WooahEditorial/> : route === RECORDS_PATH ? <App/> : <main><h1>此检查页仅提供 WOOAH</h1><a href={ARTIST_PATH}>返回 WOOAH 首页</a></main>}
</PublicAccessProvider>);
