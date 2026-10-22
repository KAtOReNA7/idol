'use client';

import {MvPhotoReference} from '@/components/mv-photo-reference';
import {MV_LOOK_PHOTO_LABEL,mvPhotoLabel} from '@/lib/idol/mv-photo-presentation';
import {useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode} from 'react';
import {ArrowLeft, ArrowRight, ArrowUpRight, Search, X} from 'lucide-react';
import {ArtistTimelineHost, useArtistTimelineHostOptions} from '@/components/artist-timeline-host';
import {MemberCareerFacts} from '@/components/member-career-facts';
import {MemberPhysicalFacts} from '@/components/member-physical-facts';
import {PhotoLightbox} from '@/components/photo-lightbox';
import {ReliableImage, ImageRecoveryProvider, ImageRecoveryControls} from '@/components/reliable-image';
import {useArtistScroll} from '@/components/use-artist-scroll';
import {newArtistHistoryState} from '@/lib/idol/timeline/history-state';
import {prepareTimelinePresentation} from '@/lib/idol/timeline/presentation';
import {getArtistTimeline} from '@/lib/idol/timeline/registry';
import registry from '@/data/artist-timeline-registry.json';
import {catalogReadWithDeadline} from '@/lib/idol/catalog-read-deadline';
import {candidatePortrait} from '@/lib/idol/candidate/portrait';
import {triplesRoster, triplesReleaseEntries, type TriplesRosterEntry} from '@/lib/idol/triples-identity';
import {triplesCuratedReleaseEntries} from '@/lib/idol/triples-curated-releases';
import {triplesChineseLabel, triplesPublicReleases, triplesPublicVideos, triplesPublicStages, triplesPublicDimensions, triplesPublicDate, triplesPublicTitle, triplesPublicWork, type TriplesPublicMusic} from '@/lib/idol/triples-design-catalog';
import {memberDisplayName} from '@/lib/idol/member-display-name';
import {memberAffiliationLabel} from '@/lib/idol/member-affiliation';
import {artistCollection, artistMemberUrl, artistRoute, artistRouteUrl, artistWorkRows, artistWorkScoreLabel, artistWorkUrl, type ArtistSection} from '@/lib/idol/artist-preview';
import {memberWorks, memberWorkSummary} from '@/lib/idol/member-works';
import {safeGroupLink} from '@/lib/idol/group-detail';
import type {CatalogView, Member, Photo, Work} from '@/lib/idol/types';
import type {CandidateContent} from '@/lib/idol/candidate/types';

const PATH = '/artists/triples';
const sections: [ArtistSection, string][] = [['overview', '首页'], ['members', '成员'], ['works', '作品库'], ['updates', '时间轴']];
const queues = [['all', '全部作品'], ['tonight', '待看'], ['rewatch', '高分重温'], ['unrated', '看过待评分']];
type RosterRow = TriplesRosterEntry<Member>;
const number = (value: number | null) => value === null ? '未评分' : value.toFixed(1);
const date = (value: string) => /^\d{4}-\d{2}-\d{2}T/.test(value) ? value.slice(0, 10) : value;
const media = (photo: Photo) => `/api/media?table=${photo.table}&record=${photo.recordId}&index=${photo.index}`;
const label = (row: RosterRow) => triplesChineseLabel(row.member);
const sLabel = (row: RosterRow) => row.identity ? `S${row.identity.sNumber}` : '成员';

export function triplesReaderRoute(url: string) {
  const parsed = new URL(url, 'https://site.invalid');
  const reader = parsed.searchParams.get('reader');
  const release = parsed.searchParams.get('release');
  return {...artistRoute(url), release: parsed.pathname === PATH && parsed.searchParams.getAll('release').length === 1 && triplesPublicReleases.some(entry => entry.key === release) ? release : null, reader: parsed.pathname === PATH && parsed.searchParams.getAll('reader').length === 1 && /^rec[A-Za-z0-9]+$/.test(reader ?? '') ? reader : null};
}
export function triplesReaderUrl(route: ReturnType<typeof triplesReaderRoute>) {
  const parsed = new URL(artistRouteUrl({...route, reader: route.reader ?? undefined}, PATH), 'https://site.invalid');
  if (route.reader && /^rec[A-Za-z0-9]+$/.test(route.reader)) parsed.searchParams.set('reader', route.reader);
  if (route.release && triplesPublicReleases.some(entry => entry.key === route.release)) parsed.searchParams.set('release', route.release);
  return parsed.pathname + parsed.search;
}
export function triplesRosterMatches(row: RosterRow, query: string) {
  const q = query.trim().toLowerCase();
  return !q || label(row).toLowerCase().includes(q) || row.displayName.toLowerCase().includes(q) || row.member.stageName.toLowerCase().includes(q)
    || (row.identity !== null && `s${row.identity.sNumber}` === q);
}
function subscribe(listener: () => void) {
  window.addEventListener('popstate', listener);
  window.addEventListener('artist-location-change', listener);
  return () => {window.removeEventListener('popstate', listener); window.removeEventListener('artist-location-change', listener);};
}
function Link({href, children, className, external = false, focusKey}: {href?: string | null; children: ReactNode; className?: string; external?: boolean; focusKey?: string}) {
  const safe = external ? safeGroupLink(href ?? undefined) : href;
  return safe ? <a href={safe} className={className} data-member-work-trigger={focusKey} {...(external ? {target: '_blank', rel: 'noopener noreferrer'} : {})}>{children}</a> : <span className={className}>{children}</span>;
}
function Picture({src, alt, identityKey, priority = false, empty = '照片暂缺'}: {src?: string | null; alt: string; identityKey: string; priority?: boolean; empty?: string}) {
  return <ReliableImage src={src} identityKey={identityKey} alt={alt} priority={priority} style={{objectFit: 'contain'}} referrerPolicy="no-referrer"
    missing={<span className="ts-image-message">{empty}</span>}
    errorFallback={<span className="ts-image-message">图片暂时无法加载</span>}/>;
}
function WorkEntry({work, returnTo}: {work: Work; returnTo: string}) {
  return <article className="ts-work-entry" data-work-id={work.id}>
    <div><small>{[work.videoType, date(work.releaseDate), work.version].filter(Boolean).join(' · ')}</small>
      <h3><Link focusKey={`work-title:${work.id}`} href={artistWorkUrl(work, false, returnTo)}>{work.song || work.name}</Link></h3></div>
    <div className="ts-work-actions"><span>我的 MV 分 <b>{artistWorkScoreLabel(work.score)}</b></span>
      <Link focusKey={`work-mv:${work.id}`} href={artistWorkUrl(work, false, returnTo)}>观看与评分 <ArrowUpRight size={16}/></Link>
      {!!(work.stage || work.stageSupplement?.alternatives.length) && <Link focusKey={`work-stage:${work.id}`} href={artistWorkUrl(work, true, returnTo)}>看舞台 <ArrowUpRight size={16}/></Link>}
    </div>
  </article>;
}

export default function TriplesDesign({content}: {content: CandidateContent}) {
  const options = useArtistTimelineHostOptions();
  const [fetchedState, setState] = useState<{data: CatalogView | null; error: string; loading: boolean}>({data: null, error: '', loading: true});
  const state = options.catalog !== undefined ? {data: options.catalog, error: options.error ?? '', loading: options.loading ?? false} : fetchedState;
  const [lightbox, setLightbox] = useState<{src: string; label: string} | null>(null);
  const [rosterSearch, setRosterSearch] = useState('');
  const rosterDialog = useRef<HTMLDialogElement>(null);
  const rosterTrigger = useRef<HTMLElement | null>(null);
  const url = useSyncExternalStore(subscribe, () => window.location.href, () => options.serverRoute ?? PATH);
  const route = useMemo(() => triplesReaderRoute(url), [url]);
  const returnTo = triplesReaderUrl(route);
  const rememberScroll = useArtistScroll(!!state.data, url);
  const previousMember = useRef<string | null>(null);
  useLayoutEffect(() => {
    const departed = previousMember.current;
    previousMember.current = route.member;
    if (!state.data || !departed || route.member) return;
    const frame = requestAnimationFrame(() => document.getElementById('triples-reader-details')?.focus({preventScroll: true}));
    return () => cancelAnimationFrame(frame);
  }, [state.data, route.member, url]);

  useEffect(() => {
    if (options.catalog !== undefined) return;
    const controller = new AbortController();
    async function load() {
      try {
        const data = await catalogReadWithDeadline(async signal => {
          const response = await fetch('/api/catalog?artist=triples&shape=display-v1', {cache: 'no-store', signal});
          if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('暂时没有连上你的资料库。');
          const result = await response.json() as CatalogView;
          if (!result || !Array.isArray(result.groups) || !Array.isArray(result.members) || !Array.isArray(result.works) || !Array.isArray(result.ratings)) throw new Error('资料暂时没有加载完整。');
          return result;
        }, controller.signal);
        if (!controller.signal.aborted) setState({data, error: '', loading: false});
      } catch (error) {
        if (!controller.signal.aborted) setState({data: null, error: error instanceof Error ? error.message : '资料暂时无法读取。', loading: false});
      }
    }
    void load();
    return () => controller.abort();
  }, [options.catalog]);

  const collection = useMemo(() => state.data ? artistCollection(state.data, content.groupId) : null, [state.data, content.groupId]);
  const members = collection?.members ?? [];
  const works = collection?.works ?? [];
  // Resolve the COMPLETE roster before sorting or filtering, preserving unmatched identities.
  const roster = useMemo(() => [...triplesRoster(members)].sort((a, b) => (a.identity?.sNumber ?? Infinity) - (b.identity?.sNumber ?? Infinity)), [members]);
  const selectedReader = roster.find(row => row.member.id === route.reader && row.identity);
  const current = selectedReader ?? roster[0];
  const currentIndex = current ? roster.indexOf(current) : -1;
  const neighbor = roster[currentIndex + 1] ?? roster[currentIndex - 1];
  const member = members.find(item => item.id === route.member);
  const portrait = (m: Member) => candidatePortrait(m, content.portraits);
  const matchesFormat = (work: Work) => route.format === 'stage' ? !!(work.stage || work.stageSupplement?.alternatives.length) : route.format === 'mv' ? !!work.url : true;
  const rows = artistWorkRows(works, route.queue, route.search).filter(matchesFormat);
  const groups = options.groups ?? registry;
  const timelineInput = useMemo(() => options.input !== undefined ? options.input
    : options.inputs && Object.hasOwn(options.inputs, content.groupId) ? options.inputs[content.groupId]
      : getArtistTimeline(content.groupId, {groups}).timeline, [options.input, options.inputs, content.groupId, groups]);
  const presentation = useMemo(() => prepareTimelinePresentation(timelineInput, state.data, groups), [timelineInput, state.data, groups]);
  const published = !state.loading && !state.error && !options.timelineLoading && !options.timelineError
    && presentation.timeline?.groupId === content.groupId && ['ready', 'context-unavailable', 'empty'].includes(presentation.state)
    ? presentation.timeline.events.filter(event => event.reviewStatus === 'ready' && !event.holdReasons.length
      && event.workIds.every(id => {const identity = presentation.identity.works.get(id); return identity?.usable && identity.groupIds.includes(content.groupId);})) : [];
  const releaseEntries = [...triplesReleaseEntries(works, published), ...triplesCuratedReleaseEntries(works)];
  const selectedReleases = ['triples-aaa-access', 'triples-assemble24', 'triples-assemble', 'triples-lovelution-muhan']
    .flatMap(key => releaseEntries.filter(entry => entry.releaseKey === key));

  function navigate(patch: Partial<ReturnType<typeof triplesReaderRoute>>, replace = false, target = 'artist-content') {
    rememberScroll();
    window.history[replace ? 'replaceState' : 'pushState'](newArtistHistoryState(window.history.state), '', triplesReaderUrl({...route, ...patch}));
    window.dispatchEvent(new Event('artist-location-change'));
    if (!replace) requestAnimationFrame(() => document.getElementById(target)?.scrollIntoView({block: 'start'}));
  }
  function openRoster() {
    rosterTrigger.current = document.activeElement as HTMLElement;
    setRosterSearch('');
    rosterDialog.current?.showModal();
  }
  function closeRoster() {rosterDialog.current?.close();}
  function choose(row: RosterRow) {
    closeRoster();
    if (!row.identity) {openMember(row); return;}
    navigate({reader: row.member.id, member: null, section: route.section === 'members' ? 'members' : 'overview'}, false, 'triples-reader');
    requestAnimationFrame(() => document.getElementById('triples-reader-details')?.focus({preventScroll: true}));
  }
  function openMember(row: RosterRow) {navigate({member: row.member.id, reader: selectedReader?.member.id ?? null});}
  const index = <div className="ts-index"><div className="ts-index-title"><span>MEMBERS / 成员</span><strong>{roster.length}</strong></div>
    <div className="ts-nameindex">{roster.map((row, i) => <button key={`${row.member.id}:${i}`} aria-pressed={row.member.id === current?.member.id} data-s-number={row.identity?.sNumber}
      onClick={() => choose(row)}><i>{sLabel(row)}</i><span>{label(row)}</span></button>)}</div>
    <div className="ts-index-bottom"><button onClick={openRoster}>完整名册 ↗</button><button onClick={() => navigate({section: 'updates', member: null})}>时间轴 ↗</button></div>
  </div>;
  const reader = current ? <section className="ts-reader" id="triples-reader" aria-labelledby="triples-reader-title">
    <div className="ts-reader-top"><h2>成员摄影册</h2><button onClick={openRoster}>完整名册 ↗</button><span>{sLabel(current)} / {roster.length}</span></div>
    <div className="ts-reader-mobile-id"><span>{sLabel(current)}</span><strong>{label(current)}</strong><span>{current.member.stageName}</span></div>
    <div className="ts-spread"><div className="ts-spine" aria-hidden="true">{sLabel(current)}</div>
      <figure className="ts-portrait"><button aria-label={`放大${current.displayName}的资料照`} aria-haspopup="dialog" disabled={!portrait(current.member)}
        onClick={() => {const image = portrait(current.member); if (image) setLightbox({src: image.image, label: current.displayName});}}>
        <Picture src={portrait(current.member)?.image} alt={current.displayName} identityKey={'reader:' + current.member.id} priority={route.section === 'members'}/></button>
        <figcaption>{portrait(current.member)?.credit} <Link href={portrait(current.member)?.sourceUrl} external>图片来源 ↗</Link></figcaption></figure>
      <div className="ts-reader-copy"><div className="ts-identity"><p>{sLabel(current)}</p><h2 tabIndex={-1} id="triples-reader-title">{label(current)}</h2><p className="ts-en">{current.member.stageName}</p></div>
        <div className="ts-reader-actions"><button className="ts-textlink" id="triples-reader-details" data-artist-member-trigger={current.member.id} onClick={() => openMember(current)}>成员详情 <ArrowUpRight size={16}/></button>
          <Link focusKey={`reader-profile:${current.member.id}`} className="ts-textlink" href={artistMemberUrl(current.member.id, triplesReaderUrl({...route, reader: current.identity ? current.member.id : route.reader}))}>个人档案与记录 <ArrowUpRight size={16}/></Link></div>
        {neighbor && <figure className="ts-neighbor"><button onClick={() => choose(neighbor)} aria-label={`阅读${sLabel(neighbor)} ${label(neighbor)}`}><Picture src={portrait(neighbor.member)?.image} alt={neighbor.displayName} identityKey={'neighbor:' + neighbor.member.id}/></button><figcaption>{currentIndex === roster.length - 1 ? '上一位' : '下一位'} / {sLabel(neighbor)} {label(neighbor)}</figcaption></figure>}
      </div>
    </div>
    <div className="ts-turns"><button disabled={currentIndex <= 0} onClick={() => choose(roster[currentIndex - 1])}><ArrowLeft size={16}/>{roster[currentIndex - 1] ? `${sLabel(roster[currentIndex - 1])} ${label(roster[currentIndex - 1])}` : '第一页'}</button>
      <button disabled={currentIndex >= roster.length - 1} onClick={() => choose(roster[currentIndex + 1])}>{roster[currentIndex + 1] ? `${sLabel(roster[currentIndex + 1])} ${label(roster[currentIndex + 1])}` : '最后一页'}<ArrowRight size={16}/></button></div>
  </section> : <p className="ts-empty">尚无关联的成员记录。</p>;
  const releases = <section className="ts-edition"><div className="ts-sectionhead"><h2>发行折页</h2><span>SELECTED RELEASES</span></div>
    <div className="ts-releases">{selectedReleases.map(entry => <article className="ts-release" key={entry.releaseKey} data-release-key={entry.releaseKey} data-work-id={entry.work.id}>
      <small>{entry.releaseKey === 'triples-aaa-access' ? 'Acid Angel from Asia' : entry.releaseKey === 'triples-lovelution-muhan' ? 'LOVElution' : entry.releaseKey === 'triples-assemble24' ? '24人完整体' : '十人时期'}</small>
      <h3>{entry.title}</h3><Link focusKey={`release:${entry.releaseKey}`} href={artistWorkUrl(entry.work, false, returnTo)}>{entry.work.song}<ArrowUpRight size={18}/></Link>
      <Link className="ts-release-source" href={entry.sourceUrls[0]} external>发行资料 ↗</Link></article>)}</div>
    {!selectedReleases.length && <p>发行选辑暂未加载，可继续查看作品库。</p>}
    <button className="ts-textlink" onClick={() => navigate({section: 'works', member: null})}>完整作品库 · {works.length} 支 <ArrowRight size={16}/></button>
  </section>;
  const timeline = <section className="ts-timeline"><div className="ts-sectionhead"><h2>发行记事</h2></div><div className="ts-timeline-opening"><strong>{published.flatMap(event => event.eventDate ? [event.eventDate.value.slice(0,4)] : []).sort()[0] ?? "tripleS"}</strong><div><h3>从这张唱片，<br/>听向下一段。</h3><p>沿着时间，回看每一次相遇。</p></div></div>
    <ArtistTimelineHost groupId={content.groupId} catalog={state.data} loading={state.loading} error={state.error} onRetry={options.onRetry}/></section>;

  function openRelease(key: string) {navigate({section: 'works', member: null, release: key});}
  function personGrid(people: readonly RosterRow[], home = false) {
    return <div className="ts-people-grid">{people.map((row, i) => <button className="ts-person-card" key={row.member.id} data-person-id={row.member.id} data-s-number={row.identity?.sNumber} data-artist-member-trigger={row.member.id} onClick={() => openMember(row)}>
      <Picture src={portrait(row.member)?.image} alt={label(row)} identityKey={'wall:' + row.member.id} priority={!home && !route.reader && route.section === 'members' && i === 0}/>
      <strong>{label(row)}</strong><span>{row.member.stageName}</span><small>{sLabel(row)}</small>
    </button>)}</div>;
  }
  function releaseCard(entry: TriplesPublicMusic, compact = false) {
    return <button key={entry.key} className={compact ? 'ts-release-row' : 'ts-disc-card'} data-public-release={entry.key} onClick={() => openRelease(entry.key)}>
      <Picture src={entry.localImage} alt={`${entry.title} 发行封面`} identityKey={'release:' + entry.key}/>
      <span className="ts-disc-copy"><strong>{entry.title}</strong>{entry.date && <small>{triplesPublicDate(entry)}</small>}<span className="ts-card-action">查看发行 →</span></span>
    </button>;
  }
  function videoCard(entry: TriplesPublicMusic) {
    const matched = triplesPublicWork(entry, works);
    const href = matched ? artistWorkUrl(matched, false, returnTo) : entry.officialUrl;
    return <article className="ts-video-card" key={entry.key} data-public-video={entry.key}>
      <Link href={href} external={!matched}><Picture src={entry.localImage} alt={`${triplesPublicTitle(entry)} ${entry.kind === 'stage' ? '舞台' : 'MV'}预览`} identityKey={'public-video:' + entry.key}/></Link>
      <small>{entry.kind === 'stage' ? `${entry.programme} · EP.${entry.episode}` : 'MUSIC VIDEO'}</small><h3>{triplesPublicTitle(entry)}</h3>{entry.date && <p>{triplesPublicDate(entry)}</p>}
      <Link className="ts-action ts-primary" href={href} external={!matched} focusKey={matched ? `public-video:${matched.id}` : undefined}>{matched ? '观看与评分 →' : '在官方频道观看 ↗'}</Link>
    </article>;
  }
  const peopleWall = <section className="ts-wall" id="triples-people"><div className="ts-sectionhead"><h2 id={route.reader ? undefined : "triples-reader-details"} tabIndex={-1}>成员</h2></div><p className="ts-section-note">{roster.length} 位成员 · 按 S 编号</p>
    {route.section === 'members' && <label className="ts-roster-search"><Search size={18}/><input aria-label="搜索成员中文名、英文名或S编号" placeholder="中文、英文或 S 编号" value={rosterSearch} onChange={event => setRosterSearch(event.target.value)}/></label>}
    {personGrid(route.section === 'members' ? roster.filter(row => triplesRosterMatches(row, rosterSearch)) : roster, route.section === 'overview')}
    {route.section === 'members' && !roster.some(row => triplesRosterMatches(row, rosterSearch)) && <p role="status">没有符合条件的成员。<button onClick={() => setRosterSearch('')}>显示完整名册</button></p>}
    {route.section === 'overview' && <button className="ts-action" onClick={() => navigate({section: 'members', member: null, reader: null, release: null})}>成员目录 →</button>}
  </section>;
  const latestRelease = triplesPublicReleases[0];
  const homeOpening = <section className="ts-opening ts-cover"><figure><button aria-label="放大 tripleS 官方团体资料照" aria-haspopup="dialog" onClick={() => content.hero.image && setLightbox({src: content.hero.image, label: 'tripleS 官方团体资料照'})}><Picture src={content.hero.image} alt="tripleS 官方团体资料照" identityKey={'hero:' + content.groupId} priority/></button></figure>
    <div className="ts-opening-copy"><h1>tripleS</h1><p>{roster.length} 位成员</p><button className="ts-latest" onClick={() => openRelease(latestRelease.key)}><Picture src={latestRelease.localImage} alt={`${latestRelease.title} 发行封面`} identityKey={'latest:' + latestRelease.key}/><span><small>新发行</small><strong>{latestRelease.title}</strong><small>{triplesPublicDate(latestRelease)}</small></span></button><button className="ts-action ts-primary" onClick={() => openRelease(latestRelease.key)}>进入这张发行 →</button></div>
  </section>;
  const publicReleases = <section className="ts-public-releases"><div className="ts-sectionhead"><h2>发行 / Releases</h2></div><div className="ts-release-rows">{triplesPublicReleases.slice(1,4).map(entry => releaseCard(entry,true))}</div><button className="ts-action" onClick={() => navigate({section: 'works', release: null})}>浏览全部发行 →</button></section>;
  const publicVideos = <section className="ts-home-videos"><div className="ts-sectionhead"><h2>音乐视频 / Music Videos</h2></div><div className="ts-featured-videos">{triplesPublicVideos.slice(0,3).map(entry => videoCard(entry))}</div><button className="ts-action" onClick={() => navigate({section: 'works', release: null, format: 'mv'})}>浏览音乐与影像 →</button></section>;
  const dimensions = <section className="ts-dimensions"><div className="ts-sectionhead"><h2>不同组合，不同声音</h2></div>{triplesPublicDimensions.map(dimension => {
    const related = triplesPublicReleases.find(entry => entry.dimensionKey === dimension.key);
    return <article className="ts-dimension" key={dimension.key}><h3>{dimension.name}</h3><div><p>{dimension.memberIds.map(id => roster.find(row => row.member.id === id)).filter((row): row is RosterRow => !!row).map(row => label(row)).join(' · ')}</p>{related && <button className="ts-dimension-release" onClick={() => openRelease(related.key)}><Picture src={related.localImage} alt={related.title} identityKey={'dimension:' + dimension.key}/><span>{related.title}<small>查看发行 →</small></span></button>}<Link href={dimension.sourceUrl} external>分队资料来源 ↗</Link></div></article>;
  })}</section>;
  const publicMatch = (entry: TriplesPublicMusic) => !route.search || `${entry.title} ${entry.date ?? ''}`.toLowerCase().includes(route.search.toLowerCase());
  const publicLibrary = route.queue === 'all' ? <div className="ts-public-library">
    {route.format === 'all' && <section id="triples-releases"><div className="ts-sectionhead"><h2>发行 / Releases</h2></div><div className="ts-disc-grid">{triplesPublicReleases.filter(publicMatch).map(entry => releaseCard(entry))}</div></section>}
    {route.format !== 'stage' && <section id="triples-videos"><div className="ts-sectionhead"><h2>MV / Music Videos</h2></div><div className="ts-video-grid">{triplesPublicVideos.filter(publicMatch).map(entry => videoCard(entry))}</div></section>}
    {route.format !== 'mv' && <section id="triples-stages"><div className="ts-sectionhead"><h2>舞台 / On Stage</h2></div><div className="ts-video-grid">{triplesPublicStages.filter(publicMatch).map(entry => videoCard(entry))}</div></section>}
  </div> : null;
  function releasePage(entry: TriplesPublicMusic) {
    const participants = /^official_/.test(entry.participationStatus) ? entry.participantIds.flatMap(id => roster.filter(row => row.member.id === id && row.identity)) : [];
    const related = triplesPublicVideos.filter(video => video.releaseKey === entry.key);
    return <section className="ts-release-page"><button className="ts-action" onClick={() => navigate({release: null})}><ArrowLeft size={16}/>返回音乐与影像</button><h1>Release</h1><div className="ts-release-opening"><div className="ts-release-sleeve"><Picture src={entry.localImage} alt={`${entry.title} 发行封面`} identityKey={'release-detail:' + entry.key} priority/></div><div className="ts-liner"><small>tripleS / RELEASE</small><h2>{entry.title}</h2>{entry.date && <p>{triplesPublicDate(entry)}</p>}<Link className="ts-action ts-primary" href={entry.officialLandingUrl ?? entry.officialUrl ?? entry.sourceUrl} external>官方发行页 ↗</Link></div></div>
      {!!related.length && <section><div className="ts-sectionhead"><h2>这一张里的影像</h2></div><div className="ts-video-grid">{related.map(videoCard)}</div></section>}
      {!!participants.length && <section><div className="ts-sectionhead"><h2>参与成员</h2></div><p className="ts-section-note">本发行录音／分队名单</p>{personGrid(participants)}<Link href={entry.participationSourceUrl} external>名单来源 ↗</Link></section>}
      <button className="ts-action" onClick={() => navigate({release: null})}>返回音乐与影像</button>
    </section>;
  }

  function memberPage(m: Member) {
    if (!state.data) return null;
    const selected = portrait(m), row = roster.find(item => item.member.id === m.id);
    const items = memberWorks(state.data, m.id), summary = memberWorkSummary(items);
    const backLabel = route.section === 'works' ? '返回作品库' : route.section === 'updates' ? '返回时间轴' : route.section === 'records' ? '返回发行档案' : '返回成员摄影册';
    const backTarget = ['overview', 'members'].includes(route.section) ? (route.reader ? 'triples-reader' : 'triples-people') : 'artist-content';
    return <><div className="ts-detail-top"><button className="ts-textlink" onClick={() => navigate({member: null, reader: selectedReader?.member.id ?? null}, false, backTarget)}><ArrowLeft size={16}/>{backLabel}</button><button onClick={openRoster}>完整名册 ↗</button></div>
      <section className="ts-person"><div className="ts-person-heading"><small>{row && sLabel(row)} / tripleS</small><h1 className="member-display-name">{row ? label(row) : memberDisplayName(m)}</h1><p>{m.stageName}</p></div>
        <figure className="ts-person-photo"><button disabled={!selected} aria-label={`放大${memberDisplayName(m)}的资料照`} aria-haspopup="dialog" onClick={() => selected && setLightbox({src: selected.image, label: memberDisplayName(m)})}>
          <Picture src={selected?.image} identityKey={'member:' + m.id} alt={memberDisplayName(m)} priority/></button><figcaption>{selected?.credit} <Link href={selected?.sourceUrl} external>图片来源 ↗</Link></figcaption></figure>
        <div className="ts-person-copy">
          {triplesPublicDimensions.some(dimension => dimension.memberIds.includes(m.id)) && <div className="ts-person-dimensions"><small>相关分队</small>{triplesPublicDimensions.filter(dimension => dimension.memberIds.includes(m.id)).map(dimension => <p key={dimension.key}>{dimension.name}</p>)}</div>}
          <button className="ts-action ts-primary" disabled={!selected} onClick={() => selected && setLightbox({src: selected.image, label: row ? label(row) : memberDisplayName(m)})}>查看完整照片</button>
          <button className="ts-action" onClick={() => navigate({section:'works', member:null, release:null})}>选择作品与评分</button>
          <MemberPhysicalFacts member={m}/><MemberCareerFacts member={m}/>
          {(m.country || m.birthDate) && <p>{[m.country, m.birthDate].filter(Boolean).join(' · ')}</p>}{m.role && <p>{m.role}</p>}
          <p>{memberAffiliationLabel(m, content.groupId)}</p>
          <div className="ts-person-scores"><div><small>作品综合分</small><strong>{number(summary.composite)}</strong></div><div><small>表现均分</small><strong>{number(summary.performanceMean)}</strong></div><div><small>造型均分</small><strong>{number(summary.stylingMean)}</strong></div></div>
          <p>{summary.ratedWorks} 支作品已评</p><Link focusKey={`member-profile:${m.id}`} className="ts-textlink" href={artistMemberUrl(m.id, returnTo)}>个人档案与记录 <ArrowUpRight size={16}/></Link>
        </div></section>
      <section className="ts-looks-section"><div className="ts-sectionhead"><h2>个人作品与造型</h2></div><div className="ts-looks">{items.map(item => <article key={item.work.id}>
        {item.photo && <button className={'ts-look-photo'+(item.photo?.sourceKind==='mv_look_photo'?' mv-look-native':'')} aria-label={`放大${memberDisplayName(m)}在${item.work.song}的MV造型`} aria-haspopup="dialog" onClick={() => item.photo && setLightbox({src: media(item.photo), label: `${memberDisplayName(m)} · ${item.work.song} · ${mvPhotoLabel(item.photo,'MV造型')}`})}><Picture src={media(item.photo)} identityKey={'look:' + m.id + ':' + item.work.id} alt={`${memberDisplayName(m)} · ${item.work.song} · ${mvPhotoLabel(item.photo,'MV造型')}`}/></button>}{item.photo?.sourceKind==='mv_look_photo'&&<small className="mv-look-photo-caption">{MV_LOOK_PHOTO_LABEL}</small>}<MvPhotoReference photo={item.photo} referencePhoto={item.referencePhoto} label={memberDisplayName(m)+' · '+item.work.song} live={state.data?.mode==='live'}/><a data-member-work-trigger={item.work.id} href={artistWorkUrl(item.work, false, returnTo)}><h3>{item.work.song || item.work.name} ↗</h3><p>表现 {number(item.performance)} · 造型 {number(item.styling)}</p></a>
      </article>)}</div>{!items.length && <p>这位成员尚无已关联的作品记录。</p>}</section><section className="ts-person-next"><h2>继续认识成员</h2>{[roster[roster.findIndex(row => row.member.id === m.id)-1],roster[roster.findIndex(row => row.member.id === m.id)+1]].map((neighbor,i) => neighbor ? <button className="ts-action" key={neighbor.member.id} onClick={() => openMember(neighbor)}>{i===0?'← ':''}{label(neighbor)}{i===1?' →':''}</button> : null)}</section></>;
  }
  return <ImageRecoveryProvider><div className="triples-photobook">
    <header className="ts-mast"><Link className="ts-logo" href={PATH}><img src="/artist/triples/approved-design/logo-triples.svg" alt="tripleS"/></Link><nav aria-label="团体内容">{sections.map(([key, title]) => <button key={key} aria-current={route.section === key ? 'page' : undefined} onClick={() => navigate({section: key, member: null, release: null})}>{title}</button>)}</nav><Link className="ts-back" href="/?view=groups">团体索引 ↗</Link></header>
    <main className="ts-main" id="artist-content">
      {state.loading ? <div className="ts-empty" role="status">正在打开 tripleS 档案…<p><a href="">重新加载当前页</a></p></div>
        : state.error ? <div className="ts-empty" role="alert"><p>{state.error}</p><button onClick={() => options.onRetry ? options.onRetry() : window.location.reload()}>重新加载</button></div>
          : !collection ? <div className="ts-empty">暂未找到团体资料。<Link href="/?view=groups">返回团体索引</Link></div>
            : route.member ? member ? memberPage(member) : <div className="ts-empty">这个成员不在本团档案中。<button onClick={() => navigate({section: 'members', member: null})}>查看成员</button></div>
              : <>
                {route.release ? releasePage(triplesPublicReleases.find(entry => entry.key === route.release)!) : <>
                {route.section === 'overview' && homeOpening}
                {(route.section === 'overview' || route.section === 'members') && peopleWall}
                {route.reader && ['overview','members'].includes(route.section) && <div className="ts-shell"><div>{reader}</div><aside className="ts-bookedge">{index}</aside></div>}
                {route.section === 'overview' && <>{publicReleases}{publicVideos}{dimensions}{timeline}</>}
                {route.section === 'updates' && timeline}
                {route.section === 'records' && <section>{releases}<div className="ts-sectionhead"><h2>全部发行记录</h2></div>{works.map(work => <WorkEntry key={work.id} work={work} returnTo={returnTo}/>)}{!works.length && <p>尚无发行记录。</p>}</section>}
                {route.section === 'works' && <section className="ts-library"><div className="ts-sectionhead"><h1>音乐与影像</h1><span>{rows.length} / {works.length}</span></div>
                  <div className="ts-tools"><label><Search size={18}/><input aria-label="搜索本团作品" placeholder="搜索歌曲或版本" value={route.search} onChange={event => navigate({search: event.target.value}, true)}/></label>
                    <div className="ts-filters">{queues.map(([key, title]) => <button key={key} aria-pressed={route.queue === key} onClick={() => navigate({queue: key})}>{title}</button>)}</div>
                    <div className="ts-filters" aria-label="播放内容">{([['all', '全部'], ['mv', 'MV'], ['stage', '可看舞台']] as const).map(([key, title]) => <button key={key} aria-pressed={route.format === key} onClick={() => navigate({format: key})}>{title}</button>)}</div></div>
                  {publicLibrary}<div className="ts-sectionhead"><h2>我的作品记录</h2></div>
                  {rows.map(work => <WorkEntry key={work.id} work={work} returnTo={returnTo}/>)}{!rows.length && <div className="ts-empty">没有符合条件的作品。<button onClick={() => navigate({queue: 'all', search: '', format: 'all'})}>查看全部</button></div>}
                </section>}
                </>}
              </>}
    </main>
    <footer className="ts-footer"><strong>tripleS</strong><Link href="/?view=groups">返回团体索引 ↗</Link><small>STAGE · 私人观看与评分手帐 · 公开可读，只有本人可编辑</small></footer>
    <dialog ref={rosterDialog} className="ts-roster-dialog" aria-labelledby="triples-roster-title" onClose={() => rosterTrigger.current?.focus({preventScroll: true})}>
      <header><h2 id="triples-roster-title">完整名册 · {roster.length} 人</h2><button aria-label="关闭完整名册" onClick={closeRoster}><X size={22}/></button></header>
      <label className="ts-roster-search"><Search size={18}/><input aria-label="搜索成员中文名、英文名或S编号" placeholder="中文、英文或 S 编号" value={rosterSearch} onChange={event => setRosterSearch(event.target.value)}/></label>
      <div className="ts-fullroster">{roster.filter(row => triplesRosterMatches(row, rosterSearch)).map((row, i) => <button key={`${row.member.id}:${i}`} data-roster-member-id={row.member.id} onClick={() => choose(row)}><Picture src={portrait(row.member)?.image} alt={row.displayName} identityKey={'roster:' + row.member.id}/><strong>{sLabel(row)} · {label(row)}</strong><small>{row.member.stageName}</small></button>)}</div>
      {!roster.some(row => triplesRosterMatches(row, rosterSearch)) && <p role="status">没有符合“{rosterSearch}”的成员。<button onClick={() => setRosterSearch('')}>显示完整名册</button></p>}
    </dialog>
    {lightbox && <PhotoLightbox {...lightbox} onClose={() => setLightbox(null)}/>}
  </div><ImageRecoveryControls/></ImageRecoveryProvider>;
}
