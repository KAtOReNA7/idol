import {safeArtistReturn} from '../artist-navigation';
import {routeUrl} from '../journey';
import type {TimelineNavigationRequest} from '../../../components/artist-timeline-host';

/** Both current and historical identities open the existing readable record page. */
export function timelineRecordUrl(request: TimelineNavigationRequest): string | null {
  if (!['member','work'].includes(request.kind)) return null;
  const returnTo = safeArtistReturn(request.returnTo);
  if (!returnTo || !/^rec[A-Za-z0-9]+$/.test(request.targetId) || !/^rec[A-Za-z0-9]+$/.test(request.groupId)) return null;
  const current = new URL(returnTo, 'https://site.invalid');
  if (current.searchParams.get('section') && !['overview', 'updates'].includes(current.searchParams.get('section')!)) return null;
  return routeUrl({nav: request.kind === 'member' ? 'members' : 'works', work: request.kind === 'work' ? request.targetId : null,
    member: request.kind === 'member' ? request.targetId : null, video: 'mv', artistReturn: returnTo});
}
