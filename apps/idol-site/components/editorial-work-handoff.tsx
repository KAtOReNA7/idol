'use client';

import {useEffect} from 'react';

export function EditorialWorkHandoff({href, title}: {href: string; title: string}) {
  useEffect(() => { window.location.replace(href); }, [href]);
  return <p role="status"><a href={href}>打开《{title}》播放与评分</a></p>;
}
