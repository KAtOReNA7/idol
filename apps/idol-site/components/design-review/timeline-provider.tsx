'use client';

import {useCallback, useEffect, useMemo, useState, type ReactNode} from 'react';
import {usePathname} from 'next/navigation';
import registry from '@/data/artist-timeline-registry.json';
import {ArtistTimelineHostProvider} from '@/components/artist-timeline-host';
import {loadArtistTimeline} from '@/lib/idol/timeline/production';
import {toProductionArtistUrl} from '@/lib/idol/design-review/artist-route';

/** Review-only read injection. Catalog identity checks and published return routes stay unchanged. */
export function DesignReviewTimelineProvider({children}: {children: ReactNode}) {
  const pathname = usePathname();
  const group = pathname === '/design-review/unis' || pathname === '/design-review/kep1er'
    ? registry.find(row => row.path === toProductionArtistUrl(pathname)) : undefined;
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState<{slug: string; input: unknown; error: string; failure?: 'deadline' | 'import'} | null>(null);

  useEffect(() => {
    if (!group) return;
    let active = true;
    const timer = setTimeout(() => {
      if (active) {
        active = false;
        setLoaded({slug: group.slug, input: null, error: '时间轴仍在加载，可继续等待。', failure: 'deadline'});
      }
    }, 15000);
    loadArtistTimeline(group.slug).then(({input}) => {
      if (active) { clearTimeout(timer); setLoaded({slug: group.slug, input, error: ''}); }
    }, () => {
      if (active) {
        clearTimeout(timer);
        setLoaded({slug: group.slug, input: null, error: '时间轴模块未能加载。可重新加载页面恢复；未保存的修改需先处理。', failure: 'import'});
      }
    });
    return () => { active = false; clearTimeout(timer); };
  }, [group, attempt]);

  const retry = useCallback(() => {
    if (!group || location.pathname !== pathname) return;
    if (loaded?.slug === group.slug && loaded.failure === 'import') {
      // Match the production loader's live reload guards; never reload automatically.
      if (document.querySelector('[aria-modal="true"], dialog[open]')) return;
      if (document.querySelector('[data-navigation-blocked="true"]')) {
        window.alert('本次保存还未确认，请留在当前作品等待或核对保存结果。');
        return;
      }
      if (document.querySelector('[data-dirty="true"]') && !window.confirm('还有未保存的评分或备注。重新加载会丢弃这些修改，确定继续吗？')) return;
      window.location.reload();
      return;
    }
    // As in production, re-observe a pending module import after its deadline.
    setLoaded(null);
    setAttempt(value => value + 1);
  }, [group, pathname, loaded]);

  const value = useMemo(() => ({
    input: group && loaded?.slug === group.slug ? loaded.input : null,
    timelineLoading: !!group && loaded?.slug !== group.slug,
    timelineError: group && loaded?.slug === group.slug ? loaded.error : '',
    onTimelineRetry: group && loaded?.slug === group.slug && loaded.error ? retry : undefined,
    timelineRetryLabel: loaded?.failure === 'import' ? '重新加载页面' : loaded?.failure === 'deadline' ? '继续等待' : '重新读取',
    hideLegacyBackground: true,
    // Review URLs are not sanctioned editor returns or timeline-return paths.
    // Do not invent a navigation callback that skips the shared capture guard.
  }), [group, loaded, retry]);

  return <ArtistTimelineHostProvider value={value}>{children}</ArtistTimelineHostProvider>;
}
