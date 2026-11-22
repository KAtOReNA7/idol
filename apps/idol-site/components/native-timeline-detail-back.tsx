'use client';
import {useSyncExternalStore, type MouseEvent, type ReactNode} from 'react';
import './native-timeline-detail-back.css';

type Props = {
  subscribe: (notify: () => void) => () => void;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, href: string) => void;
  backHref: string;
  libraryHref: string;
  label: string;
  className: string;
  children: ReactNode;
};

function cameFromTimeline() {
  // newArtistHistoryState marks the detail only when its exact timeline link was followed.
  return history.length > 1 && typeof history.state?.artistTimelineOrigin === 'string';
}

export function NativeTimelineDetailBack({subscribe, onNavigate, backHref, libraryHref, label, className, children}: Props) {
  const fromTimeline = useSyncExternalStore(subscribe, cameFromTimeline, () => false);
  if (!fromTimeline) {
    return <a className={className} href={backHref} onClick={event => onNavigate(event, backHref)}>{children} {label}</a>;
  }
  return <nav aria-label="详情导航" className="native-timeline-detail-nav">
    <button type="button" className={className} onClick={() => history.back()}>{children} 返回时间轴事件</button>
    <a href={libraryHref} onClick={event => onNavigate(event, libraryHref)}>进入作品库</a>
  </nav>;
}
