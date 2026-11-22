'use client';

import {useEffect} from 'react';
import './editorial-work-handoff.css';

export function EditorialWorkHandoff({href, title}: {href: string; title: string}) {
  useEffect(() => {
    try {
      window.location.replace(href);
    } catch {
      // An embedded page can require an explicit click before navigating.
    }
  }, [href]);
  return <section className="editorial-work-handoff" aria-label="作品入口">
    <h1>{title}</h1>
    <a className="editorial-work-handoff-action" href={href} aria-label={`打开《${title}》播放与评分`}>
      播放与评分 <span aria-hidden="true">→</span>
    </a>
  </section>;
}
