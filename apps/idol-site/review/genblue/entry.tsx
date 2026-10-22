import {createRoot} from 'react-dom/client';
import App from '../../app/page';
import GenblueBluecutExperience from '../../components/genblue/bluecut-experience';
import {PublicAccessProvider} from '../../components/public-access';
import {createReadOnlyReviewFetch} from './read-only-fetch.mjs';
// The builder supplies only the existing synthetic fixture and sanitized links.
// No snapshot, owner session, database binding, or save service enters this bundle.
// @ts-expect-error This virtual module is provided by build-genblue-review.mjs.
import catalog from 'genblue-review-catalog';
import '../../app/globals.css';

window.fetch = createReadOnlyReviewFetch(catalog, location.origin);
document.title = 'GENBLUE · 页面验收 · 示例资料';
const target = document.getElementById('root');
if (!target) throw new Error('GENBLUE review root is missing');
const route = location.pathname;
createRoot(target).render(<PublicAccessProvider canEdit={false}>
  {route === '/artists/genblue' ? <GenblueBluecutExperience/> : route === '/' ? <App/> : <main><h1>此检查页仅提供 GENBLUE</h1><a href="/artists/genblue">返回 GENBLUE 首页</a></main>}
</PublicAccessProvider>);
