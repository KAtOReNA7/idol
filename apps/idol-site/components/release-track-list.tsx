import type {ReactNode} from 'react';

// A native link can leave the server-rendered page before hydration starts.
// Enable a same-origin referrer only after the original history entry has its exact track.
const earlyTrackFocus = `(() => {
  const registration = Symbol.for('stage.releaseTrackFocus');
  if (window[registration]) return;
  window[registration] = true;
  function currentList(link) {
    const list = link?.closest('ol[data-release-tracks]') || link?.closest('[data-directory-record-links]');
    const route = list?.dataset.releaseTracks || list?.dataset.directoryRecordLinks;
    return route === location.pathname || route === location.pathname + location.search ? list : null;
  }
  function remember(event) {
    if (event.defaultPrevented || event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const link = event.target.closest?.('a[data-member-work-trigger][id]');
    const list = currentList(link);
    if (!list) return;
    const url = new URL(link.href);
    const listRoute = list.dataset.releaseTracks || list.dataset.directoryRecordLinks;
    const target = listRoute + '#' + link.id;
    const kind = link.dataset.timelineTargetKind || 'work';
    const id = link.dataset.timelineTargetId || link.dataset.directoryRecordId || link.dataset.memberWorkTrigger;
    if (url.origin !== location.origin || url.pathname !== '/' || url.searchParams.get('returnTo') !== target || url.searchParams.get(kind) !== id) return;
    try {
      let state = history.state;
      if (list.dataset.directoryRecordLinks) {
        const path = location.pathname + location.search;
        state = {...state,memberWorkFocus:{path,key:link.dataset.memberWorkTrigger},artistScroll:{path,y:window.scrollY}};
        const prior = state.timelineReturn;
        if (prior?.path === path && (prior.identity?.eventId !== link.dataset.timelineEventTrigger || prior.identity?.kind !== kind || prior.identity?.targetId !== id)) delete state.timelineReturn;
      }
      history.replaceState(state, '', location.pathname + location.search + '#' + link.id);
      link.referrerPolicy = 'same-origin';
    } catch { link.referrerPolicy = 'no-referrer'; }
  }
  function restore() {
    const link = document.getElementById(location.hash.slice(1));
    if (!currentList(link) || !link.hasAttribute('data-member-work-trigger')) return;
    link.focus({preventScroll:true});
    link.scrollIntoView({block:'nearest',behavior:'instant'});
  }
  document.addEventListener('click', remember, true);
  document.addEventListener('DOMContentLoaded', restore, {once:true});
  window.addEventListener('pageshow', restore);
  document.addEventListener('stage-directory-links-ready', () => {
    const active = document.activeElement;
    if (!active || active === document.body || active === document.documentElement || active.id === location.hash.slice(1)) restore();
  });
})();`;

export function EarlyRecordReturnFocus() {
  return <script dangerouslySetInnerHTML={{__html: earlyTrackFocus}}/>;
}

export function ReleaseTrackList({route, children}: {route: string; children: ReactNode}) {
  return <>
    <EarlyRecordReturnFocus/>
    <ol role="list" data-release-tracks={route}>{children}</ol>
  </>;
}
