import {renderToStaticMarkup} from 'react-dom/server';
import {
  WorksView, WorkDetail,
  type WorksLinkProps, type WorksPictureProps, type WorkDetailProps,
} from '@/components/design-review/triples-visual-works';
import type {ReviewMember, ReviewMusic, ReviewRoute} from '@/lib/idol/design-review/triples-visual-model';

export {canonicalReviewUrl, readTriplesReviewRoute, triplesReviewReleases, triplesReviewVideos, triplesReviewStages} from '@/lib/idol/design-review/triples-visual-model';
export {triplesPublicTitle} from '@/lib/idol/triples-design-catalog';
export {default as identities} from '@/data/public-artist-identity-map.json';

const Link = ({href, children, ...props}: WorksLinkProps) => <a href={href ?? undefined} {...props}>{children}</a>;
const Picture = ({src, alt, className}: WorksPictureProps) => <span className={`asset-frame ${className ?? ''}`}><img src={src ?? undefined} alt={alt} /></span>;
const Rail = ({active}: {active: readonly number[]}) => <div className="sequence-rail" data-sequence={active.join(',')} aria-hidden="true" />;
const shared = {Link, Picture, Rail};

export function renderCatalogue(route: ReviewRoute, members: readonly ReviewMember[] = []) {
  return renderToStaticMarkup(<WorksView {...shared} route={route} members={members} onFilter={() => {}} />);
}
export function renderDetail(item: ReviewMusic, props: Partial<Pick<WorkDetailProps, 'members' | 'catalog' | 'route'>> = {}) {
  return renderToStaticMarkup(<WorkDetail {...shared} item={item} members={[]} catalog={null} onClose={() => {}} onMediaAction={() => {}} {...props} />);
}
