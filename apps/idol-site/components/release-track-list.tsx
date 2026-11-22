import type {ReactNode} from 'react';

// A native link can leave the server-rendered page before hydration starts.
// Enable a same-origin referrer only after the original history entry has its exact track.
const earlyTrackFocus = `(() => {
  const registration = Symbol.for('stage.releaseTrackFocus');
  if (window[registration]) return;
  window[registration] = true;
  function currentList(link) {
    const list = link?.closest('ol[data-release-tracks]');
    const route = list?.dataset.releaseTracks;
    return route === location.pathname || route === location.pathname + location.search ? list : null;
  }
  function remember(event) {
    if (event.defaultPrevented || event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const link = event.target.closest?.('a[data-member-work-trigger][id]');
    const list = currentList(link);
    if (!list) return;
    const url = new URL(link.href);
    const target = list.dataset.releaseTracks + '#' + link.id;
    if (url.origin !== location.origin || url.searchParams.get('returnTo') !== target || url.searchParams.get('work') !== link.dataset.memberWorkTrigger) return;
    try {
      history.replaceState(history.state, '', location.pathname + location.search + '#' + link.id);
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
})();`;

export function ReleaseTrackList({route, children}: {route: string; children: ReactNode}) {
  return <>
    <script dangerouslySetInnerHTML={{__html: earlyTrackFocus}}/>
    <ol role="list" data-release-tracks={route}>{children}</ol>
  </>;
}
