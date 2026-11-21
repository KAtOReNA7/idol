'use client';

import type {ComponentProps, MouseEvent} from 'react';
import {newArtistHistoryState} from '../lib/idol/timeline/history-state';

type RosterAction = 'portrait' | 'profile';
type MemberLinkProps = Pick<ComponentProps<'a'>, 'children' | 'className' | 'aria-label'> & {
 href: string;
 memberId: string;
 action?: RosterAction;
};

function localLink(event: MouseEvent<HTMLAnchorElement>) {
 const link = event.currentTarget;
 const modified = event.ctrlKey || event.metaKey || event.altKey || event.shiftKey;
 if (event.defaultPrevented || event.button !== 0 || modified || (link.target && link.target !== '_self')) return null;
 const to = new URL(link.href);
 return to.origin === location.origin && to.pathname === location.pathname && !to.hash ? to : null;
}

function navigate(to: URL, state: Record<string, unknown>) {
 history.pushState(state, '', to.pathname + to.search);
 window.dispatchEvent(new Event('artist-location-change'));
 window.scrollTo({top: 0, behavior: 'instant'});
}

export function ArtistRosterMemberLink({memberId, action = 'profile', ...props}: MemberLinkProps) {
 function open(event: MouseEvent<HTMLAnchorElement>) {
  const to = localLink(event);
  if (!to || to.searchParams.get('member') !== memberId || to.searchParams.get('section') !== 'members') return;
  event.preventDefault();
  const path = location.pathname + location.search;
  history.replaceState({
   ...history.state,
   artistRosterFocus: {path, key: memberId, action},
   artistScroll: {path, y: window.scrollY},
  }, '', location.href);
  const detail = to.pathname + to.search;
  navigate(to, {...newArtistHistoryState(history.state), artistRosterOrigin: {path, detail, action}});
 }
 return <a {...props} data-artist-member-trigger={memberId} data-artist-roster-action={action} onClick={open}/>;
}

export function returnToArtistRoster(event: MouseEvent<HTMLAnchorElement>) {
 const to = localLink(event);
 const current = new URL(location.href);
 const key = current.searchParams.get('member');
 if (!to || !key || to.searchParams.get('section') !== 'members' || to.searchParams.has('member')) return;
 event.preventDefault();
 const origin = history.state?.artistRosterOrigin;
 if (origin?.detail === current.pathname + current.search && typeof origin.path === 'string' && origin.path.startsWith(current.pathname + '?')) {
  const source = new URL(origin.path, location.origin);
  if (source.searchParams.get('section') === 'members' && !source.searchParams.has('member')) {
   history.back();
   return;
  }
 }
 // A directly opened profile still has a real directory and a named card.
 const path = to.pathname + to.search;
 const action = origin?.action === 'portrait' ? 'portrait' : 'profile';
 navigate(to, {...newArtistHistoryState(history.state), artistRosterFocus: {path, key, action}});
}
