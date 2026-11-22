'use client';

import type {MouseEvent} from 'react';
import {artistRoute, artistRouteUrl} from '@/lib/idol/artist-preview';

type Route = ReturnType<typeof artistRoute>;
type Props = {
  className: string;
  basePath: string;
  route: Route;
  navigate: (patch: Partial<Route>, replace?: boolean) => void;
};

export function followDirectoryLink(event: MouseEvent<HTMLAnchorElement>, navigate: () => void) {
  if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  navigate();
}

export function ArtistDirectorySearch({className, basePath, route, navigate}: Props) {
  const clearHref = artistRouteUrl({...route, search: ''}, basePath);
  const filters = new URL(clearHref, 'https://site.invalid').searchParams;

  function preserveEarlyInput(field: HTMLInputElement | null) {
    // Hydration preserves the live value. A later controlled render reapplies the URL query.
    if (!field || field.value === field.defaultValue || field.defaultValue !== route.search) return;
    const location = field.ownerDocument.location;
    if (!location || location.pathname !== basePath) return;
    if (artistRouteUrl(artistRoute(location.href), basePath) === artistRouteUrl(route, basePath)) {
      navigate({search: field.value}, true);
    }
  }

  return <form className={className} action={basePath} method="get" role="search" aria-label="搜索本团作品"
    onSubmit={event => {
      event.preventDefault();
      const field = event.currentTarget.elements.namedItem('q') as HTMLInputElement;
      navigate({search: field.value}, true);
    }}>
    {Array.from(filters, ([name, value]) => <input key={name} type="hidden" name={name} value={value}/>)}
    <input ref={preserveEarlyInput} name="q" value={route.search} maxLength={200} enterKeyHint="search" aria-label="搜索本团作品"
      placeholder="搜索歌曲或版本" onChange={event => navigate({search: event.currentTarget.value}, true)}/>
    {route.search && <a href={clearHref} onClick={event => followDirectoryLink(event, () => {
      event.currentTarget.closest('form')?.querySelector<HTMLInputElement>('input[name="q"]')?.focus();
      navigate({search: ''}, true);
    })}>清空</a>}
    <button type="submit">搜索</button>
  </form>;
}
