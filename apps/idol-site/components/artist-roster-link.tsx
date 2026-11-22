'use client';

import type {ComponentProps, MouseEvent} from 'react';
import {focusLinkedRelease, newArtistHistoryState, tryArtistHistoryChange} from '../lib/idol/timeline/history-state';

type RosterAction = 'portrait' | 'profile';
type MemberLinkProps = Pick<ComponentProps<'a'>, 'children' | 'className' | 'aria-label'> & {
 href: string;
 memberId: string;
 action?: RosterAction;
 anchorId?: string;
};

function localLink(event: MouseEvent<HTMLAnchorElement>, returnHash = '') {
 const link = event.currentTarget;
 const modified = event.ctrlKey || event.metaKey || event.altKey || event.shiftKey;
 if (event.defaultPrevented || event.button !== 0 || modified || (link.target && link.target !== '_self')) return null;
 const to = new URL(link.href);
 return to.origin === location.origin && to.pathname === location.pathname && (!to.hash || to.hash === returnHash) ? to : null;
}

function navigate(event: MouseEvent<HTMLAnchorElement>, to: URL, state: Record<string, unknown>) {
 const applied = tryArtistHistoryChange(() => history.pushState(state, '', to.pathname + to.search));
 // Some browsers silently ignore pushState. Leave the anchor active in that case.
 if (!applied || location.href !== to.href) return;
 event.preventDefault();
 window.dispatchEvent(new Event('artist-location-change'));
 window.scrollTo({top: 0, behavior: 'instant'});
}

export function ArtistRosterMemberLink({memberId, action = 'profile', anchorId, ...props}: MemberLinkProps) {
 function open(event: MouseEvent<HTMLAnchorElement>) {
  const to = localLink(event);
  if (!to || to.searchParams.get('member') !== memberId || to.searchParams.get('section') !== 'members') return;
  const path = location.pathname + location.search;
  const y = window.scrollY;
  const saved = tryArtistHistoryChange(() => history.replaceState({
   ...history.state,
   artistRosterFocus: {path, key: memberId, action},
   artistScroll: {path, y},
  }, '', location.href));
  if (!saved) return;
  const {artistRosterFocus: focus, artistScroll: scroll} = history.state ?? {};
  if (focus?.path !== path || focus.key !== memberId || focus.action !== action || scroll?.path !== path || scroll.y !== y) return;
  const detail = to.pathname + to.search;
  navigate(event, to, {...newArtistHistoryState(history.state), artistRosterOrigin: {path, detail, action}});
 }
 return <a {...props} id={anchorId} ref={anchorId ? focusLinkedRelease : undefined}
  data-artist-member-trigger={memberId} data-artist-roster-action={action} onClick={open}/>;
}

export function returnToArtistRoster(event: MouseEvent<HTMLAnchorElement>) {
 const current = new URL(location.href);
 const key = current.searchParams.get('member');
 const to = localLink(event, key ? '#member-' + key : '');
 if (!to || !key || to.searchParams.get('section') !== 'members' || to.searchParams.has('member')) return;
 to.hash = '';
 const origin = history.state?.artistRosterOrigin;
 if (origin?.detail === current.pathname + current.search && typeof origin.path === 'string' && origin.path.startsWith(current.pathname + '?')) {
  const source = new URL(origin.path, location.origin);
  if (source.searchParams.get('section') === 'members' && !source.searchParams.has('member')) {
   if (tryArtistHistoryChange(() => history.back())) event.preventDefault();
   return;
  }
 }
 // A directly opened profile still has a real directory and a named card.
 const path = to.pathname + to.search;
 const action = origin?.action === 'portrait' ? 'portrait' : 'profile';
 navigate(event, to, {...newArtistHistoryState(history.state), artistRosterFocus: {path, key, action}});
}
