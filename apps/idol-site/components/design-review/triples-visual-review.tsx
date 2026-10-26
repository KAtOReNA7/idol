'use client';

import {createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type AnchorHTMLAttributes, type ReactNode, type Dispatch, type SetStateAction} from 'react';
import {ImageRecoveryProvider, ImageRecoveryControls, ReliableImage} from '@/components/reliable-image';
import {useArtistScroll} from '@/components/use-artist-scroll';
import {catalogReadWithDeadline} from '@/lib/idol/catalog-read-deadline';
import {safeGroupLink} from '@/lib/idol/group-detail';
import {newArtistHistoryState} from '@/lib/idol/timeline/history-state';
import {loadArtistTimeline} from '@/lib/idol/timeline/production';
import {publicMediaActionHref, publicMemberActionHref, resolvePublicArtistEntity} from '@/lib/idol/public-artist-bridge';
import type {CatalogView} from '@/lib/idol/types';
import type {TimelineEvent} from '@/lib/idol/timeline/types';
import {TRIPLES_REVIEW_PATH, canonicalReviewUrl, readReviewOpener, reviewNavigationPlan, readTriplesReviewRoute, triplesReviewHref, triplesReviewMembers, triplesReviewContent, triplesReviewWordmark, triplesReviewDimensions, triplesReviewReleases, reviewDimensionKey, reviewMemberMatches, reviewVerifiedParticipants, reviewMusicFields, reviewMusicList, reviewTimeline, type ReviewRoute, type ReviewMember, type ReviewMusic} from '@/lib/idol/design-review/triples-visual-model';
import {WorksView, WorkDetail} from './triples-visual-works';
import {TriplesVisualTimeline} from './triples-visual-timeline';

const nav = [['overview', '首页'], ['members', '成员'], ['works', '作品'], ['updates', '时间轴']] as const;
const shortDate = (value: string | null | undefined) => (value ?? '').replaceAll('-', '.');
const sequenceLabel = (member: ReviewMember) => `S${String(member.sNumber).padStart(2, '0')}`;
function subscribe(listener: () => void) {
  window.addEventListener('popstate', listener); window.addEventListener('artist-location-change', listener);
  return () => {window.removeEventListener('popstate', listener); window.removeEventListener('artist-location-change', listener);};
}
function currentUrl() { return location.pathname + location.search + location.hash; }
function Arrow() { return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5"/></svg>; }
export function SequenceRail({active}: {active: readonly number[]}) {
  const ids = new Set(active);
  return <div className="sequence-rail" aria-hidden="true"><div className="sequence-rail-grid">{Array.from({length: 24}, (_, index) => <span key={index} data-s-number={index + 1} className={`sequence-slot${ids.has(index + 1) ? ' is-active' : ''}`}/>)}</div><div className="sequence-rail-ends"><span>S1</span><span>S24</span></div></div>;
}

/** This review has no editors or mutations. Any departure still reads the live host gates. */
export function reviewMayLeave(root: ParentNode, ownDialog: HTMLDialogElement | null, confirm: (message: string) => boolean, alert: (message: string) => void): boolean {
  if ([...root.querySelectorAll('[aria-modal="true"], dialog[open]')].some(node => node !== ownDialog)) return false;
  if (root.querySelector('[data-navigation-blocked="true"]')) {alert('本次保存还未确认，请留在当前作品等待或核对保存结果。'); return false;}
  return !root.querySelector('[data-dirty="true"]') || confirm('还有未保存的评分或备注。确定离开吗？');
}

const ReviewUiContext = createContext<{navigate: (href: string | null, triggerHref?: string) => void; openZoom: (value: {src: string; label: string}) => void}>({navigate: () => {}, openZoom: () => {}});
function Link({href, children, ...props}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {href?: string | null; children: ReactNode}) {
    const ui = useContext(ReviewUiContext);
    if (!href) return <span className={props.className}>{children}</span>;
    return <a {...props} href={href} onClick={event => {props.onClick?.(event); if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; if (canonicalReviewUrl(href)) {event.preventDefault(); ui.navigate(href, href);}}}>{children}</a>;
  }
function Picture({src, alt, className = '', priority = false, zoom = false}: {src?: string | null; alt: string; className?: string; priority?: boolean; zoom?: boolean}) {
    const ui = useContext(ReviewUiContext);
    const picture = <span className={`asset-frame ${className}`}><ReliableImage src={src} alt={alt} identityKey={src ?? alt} priority={priority} retryMode="external" missing={<span>{alt} · 图片暂缺</span>} errorFallback={<span>{alt} · 图片暂时无法加载</span>}/></span>;
    return zoom && src ? <button type="button" className="zoom-button" aria-label={`放大${alt}`} aria-haspopup="dialog" onClick={() => ui.openZoom({src, label: alt})}>{picture}</button> : picture;
  }
function MemberLink({member}: {member: ReviewMember}) {return <Link className="member-name-link" href={triplesReviewHref({section: 'members', member: member.id})}><small>S{member.sNumber}</small>{member.name}</Link>;}
function ReleaseTile({item}: {item: ReviewMusic}) {return <Link className="release-tile" data-release-key={item.key} href={triplesReviewHref(reviewMusicFields(item))}><Picture src={item.localImage} className="cover" alt={`${item.title} 封面`}/><h3>{item.title}</h3><div className="tile-meta">{item.date && <time dateTime={item.date}>{shortDate(item.date)}</time>}<span>{triplesReviewDimensions.find(unit => unit.key === reviewDimensionKey(item))?.name}</span></div></Link>;}

function memberTile(member: ReviewMember) {return <Link className="member-tile" key={member.id} data-member-id={member.id} href={triplesReviewHref({section: 'members', member: member.id})}><span className="member-number">S{member.sNumber}</span><Picture src={member.image} className="portrait" alt={member.name}/><span className="member-name">{member.name}<span className="member-stage" lang="en">{member.stageName}</span></span></Link>;}
// Public captions describe the image only; canonical photography/lineup provenance stays in the source data.
function Home({members, events, homeRange, homeSlide, homeUnit, setHomeRange, setHomeSlide, setHomeUnit}: {members: ReviewMember[]; events: readonly TimelineEvent[]; homeRange: number; homeSlide: number; homeUnit: string; setHomeRange: Dispatch<SetStateAction<number>>; setHomeSlide: Dispatch<SetStateAction<number>>; setHomeUnit: Dispatch<SetStateAction<string>>}) {
    const selected = triplesReviewDimensions.find(unit => unit.key === homeUnit) ?? triplesReviewDimensions[0];
    const featured = triplesReviewReleases.find(item => item.key === 'assemble24');
    const unitRelease = triplesReviewReleases.find(item => reviewDimensionKey(item) === selected.key);
    const rangeMembers = members.filter(member => member.sNumber > homeRange * 6 && member.sNumber <= homeRange * 6 + 6);
    const milestones = events.filter((event, index) => index === 0 || ['e-triples-assemble24-complete-phase', 'e-triples-love-pop-korea-pt1'].includes(event.id));
    return <div className="home-page"><section className="home-opening" aria-label="tripleS"><div className="home-signature"><h1 className="home-logo-heading"><Picture src={triplesReviewWordmark} className="home-wordmark logo" alt="tripleS" priority/></h1><div className="home-primary-links"><Link href={triplesReviewHref({section: 'members'})}>成员 <Arrow/></Link><Link href={triplesReviewHref({section: 'works'})}>作品 <Arrow/></Link></div></div><figure className="home-group"><Picture src={triplesReviewContent.hero.image} className="group" alt="tripleS 团体资料照" priority zoom/><figcaption>tripleS 日本官网团体资料照</figcaption></figure>{featured && <aside className="home-feature"><div className="home-feature-label">发行选集</div><Link href={triplesReviewHref(reviewMusicFields(featured))}><Picture src={featured.localImage} className="cover" alt={`${featured.title} 封面`} priority/><h2>{featured.title}</h2></Link><div className="home-feature-meta"><time dateTime={featured.date ?? undefined}>{shortDate(featured.date)}</time><Link className="text-link" href={triplesReviewHref(reviewMusicFields(featured))}>查看发行 <Arrow/></Link></div></aside>}</section>
      <section className="home-members" aria-labelledby="home-members-title"><header className="section-head"><h2 id="home-members-title">成员<span className="home-section-number">{members.length}</span></h2><Link className="text-link" href={triplesReviewHref({section: 'members'})}>全部成员 <Arrow/></Link></header><div className="home-ranges" aria-label="按 S 号浏览">{[0, 1, 2, 3].map(index => <button key={index} type="button" aria-pressed={homeRange === index} onClick={() => {setHomeRange(index); setHomeSlide(0);}}>S{index * 6 + 1}—S{index * 6 + 6}</button>)}</div><SequenceRail active={rangeMembers.map(member => member.sNumber)}/><div className="member-grid home-member-grid" data-slide={homeSlide}>{rangeMembers.map((member, index) => <div className="home-member-slot" key={member.id} data-mobile-visible={Math.floor(index / 2) === homeSlide}>{memberTile(member)}</div>)}</div><div className="home-member-pagination"><button type="button" className="button" disabled={homeSlide === 0} aria-label="上一组成员" onClick={() => setHomeSlide(value => Math.max(0, value - 1))}><Arrow/></button><span>{homeSlide + 1} / 3</span><button type="button" className="button" disabled={homeSlide === 2} aria-label="下一组成员" onClick={() => setHomeSlide(value => Math.min(2, value + 1))}><Arrow/></button></div></section>
      <section className="home-units" aria-labelledby="home-units-title"><header className="section-head"><h2 id="home-units-title">子团与作品</h2><Link className="text-link" href={triplesReviewHref({section: 'members', rosterView: 'units'})}>查看子团 <Arrow/></Link></header><div className="home-units-layout"><nav className="home-unit-index" aria-label="选择子团">{triplesReviewDimensions.map(unit => <Link key={unit.key} href={triplesReviewHref({section: 'members', rosterView: 'units', unit: unit.key})} aria-current={unit.key === selected.key ? 'true' : undefined} onClick={event => {if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {event.preventDefault(); setHomeUnit(unit.key);}}}>{unit.name}</Link>)}</nav><div className="home-unit-spread">{unitRelease && <Link className="home-unit-art" href={triplesReviewHref(reviewMusicFields(unitRelease))}><Picture src={unitRelease.localImage} className="cover" alt={`${unitRelease.title} 封面`}/></Link>}<div className="home-unit-info"><h3>{selected.name}</h3>{unitRelease && <><p className="home-unit-release">{unitRelease.title}</p><time>{shortDate(unitRelease.date)}</time></>}<SequenceRail active={selected.sNumbers}/><div className="home-unit-names">{members.filter(member => selected.memberIds.includes(member.id)).map(member => <MemberLink key={member.id} member={member}/>)}</div><Link className="text-link" href={triplesReviewHref({section: 'members', rosterView: 'units', unit: selected.key})}>查看成员与作品 <Arrow/></Link></div></div></div></section>
      <section className="home-history" aria-labelledby="home-history-title"><header className="section-head"><h2 id="home-history-title">时间轴</h2><Link className="text-link" href={triplesReviewHref({section: 'updates'})}>完整历程 <Arrow/></Link></header><ol>{milestones.map(event => <li key={event.id}><Link href={triplesReviewHref({section: 'updates', event: event.id})}><time dateTime={event.eventDate?.value}>{shortDate(event.eventDate?.value)}</time><h3>{event.title.replaceAll('分队', '子团')}</h3><Arrow/></Link></li>)}</ol></section></div>;
  }
// Unit membership describes the public unit relation; it is never reused as an inferred MV cast.
function Members({route, members, url, onNavigate}: {route: ReviewRoute; members: ReviewMember[]; url: string; onNavigate: (target: string | null) => void}) {
    const query = route.query;
    const units = triplesReviewDimensions.filter(unit => !query || unit.name.toLowerCase().includes(query.toLowerCase()) || members.some(member => unit.memberIds.includes(member.id) && reviewMemberMatches(member, query)));
    const selected = units.find(unit => unit.key === route.unit) ?? units[0];
    const effectiveUnit = route.rosterView === 'units' ? selected?.key ?? '' : route.unit;
    const unit = triplesReviewDimensions.find(unit => unit.key === route.unit);
    const filtered = members.filter(member => (!unit || unit.memberIds.includes(member.id)) && reviewMemberMatches(member, query));
    const unitReleases = selected ? triplesReviewReleases.filter(item => reviewDimensionKey(item) === selected.key).sort((a, b) => (a.date ?? '9999').localeCompare(b.date ?? '9999')) : [];
    const unitRelease = unitReleases[0];
    const people = selected ? members.filter(member => selected.memberIds.includes(member.id)) : [];
    return <section className="people-page"><header className="page-head people-page-head"><div><h1>成员<span className="people-heading-count">{members.length}</span></h1></div><div className="people-view-tabs" aria-label="目录显示方式">{(['members', 'units'] as const).map(view => <Link key={view} href={triplesReviewHref({section: 'members', rosterView: view, unit: route.unit || null, q: query || null})} aria-current={route.rosterView === view ? 'page' : undefined}>{view === 'members' ? '成员' : '子团'}</Link>)}</div></header>
      <form key={url} className="people-filter-form" role="search" onSubmit={event => {event.preventDefault(); const data = new FormData(event.currentTarget); onNavigate(triplesReviewHref({section: 'members', rosterView: route.rosterView, q: String(data.get('q') ?? '') || null, unit: String(data.get('unit') ?? '') || null}));}}><label className="people-search-label"><span>搜索{route.rosterView === 'units' ? '子团或成员' : '成员'}</span><input type="search" name="q" defaultValue={query} placeholder="中文名 / 艺名 / S号" autoComplete="off" maxLength={200}/></label><label className="people-unit-label"><span>子团</span><select name="unit" defaultValue={effectiveUnit} onChange={event => event.currentTarget.form?.requestSubmit()}><option value="">全部子团</option>{triplesReviewDimensions.map(unit => <option key={unit.key} value={unit.key}>{unit.name}</option>)}</select></label><button type="submit" className="button people-search-submit">查找</button>{(route.query || route.unit) && <Link className="text-link people-clear" href={triplesReviewHref({section: 'members', rosterView: route.rosterView})}>清除筛选</Link>}</form>
      {route.rosterView === 'members' ? <><div className="people-results-head"><p>{unit && <>{unit.name} <span>／</span> </>}<strong>{filtered.length}</strong> 位成员</p><span>S1—S24</span></div>{filtered.length ? <div className="member-grid people-contact-sheet">{filtered.map((member, index) => <article className="people-card" key={member.id} id={`member-${member.id}`} data-member-id={member.id}><Link className="people-card-link" data-artist-member-trigger={member.id} href={triplesReviewHref({section: 'members', member: member.id})}><span className="people-card-sequence" aria-label={`S${member.sNumber}`}>S<span>{String(member.sNumber).padStart(2, '0')}</span></span><div className="people-card-image"><Picture src={member.image} className="people-portrait" alt={`${member.name} · ${member.stageName}`} priority={index < 6}/><span className="people-card-open" aria-hidden="true">↗</span></div><div className="people-card-caption"><h2>{member.name}</h2><p lang="en">{member.stageName}</p></div></Link></article>)}</div> : <div className="empty"><h2>没有找到匹配的成员</h2><Link className="button" href={triplesReviewHref({section: 'members'})}>清除搜索</Link></div>}</>
      : selected ? <div className="people-units-shell"><nav className="people-unit-index" aria-label="子团目录">{units.map(unit => <Link key={unit.key} href={triplesReviewHref({section: 'members', rosterView: 'units', unit: unit.key, q: query || null})} aria-current={unit.key === selected.key ? 'true' : undefined}><span>{String(triplesReviewDimensions.indexOf(unit) + 1).padStart(2, '0')}</span><span lang="en">{unit.name}</span><span aria-hidden="true">↗</span></Link>)}</nav><article className="people-unit-spread" data-unit-key={selected.key} id={`unit-${selected.key}`}><header className="people-unit-title"><span className="people-eyebrow">DIMENSION</span><h2 lang="en">{selected.name}</h2><SequenceRail active={selected.sNumbers}/></header><div className="people-unit-layout">{unitRelease && <Link className="people-unit-art" href={triplesReviewHref(reviewMusicFields(unitRelease))} aria-label={`查看${unitRelease.title}`}><Picture src={unitRelease.localImage} className="people-unit-cover" alt={`${unitRelease.title} 封面`} priority/></Link>}<div className="people-unit-information">{unitRelease && <div className="people-unit-release"><span className="people-eyebrow">发行</span><h3><Link href={triplesReviewHref(reviewMusicFields(unitRelease))}>{unitRelease.title}</Link></h3><time dateTime={unitRelease.date ?? undefined}>{shortDate(unitRelease.date)}</time></div>}<div className="people-unit-roster"><h3>成员 <span>{String(people.length).padStart(2, '0')}</span></h3><ol>{people.map(member => <li key={member.id}><Link href={triplesReviewHref({section: 'members', member: member.id})}><span className="people-roster-s">{sequenceLabel(member)}</span><span className="people-roster-name">{member.name}</span><span className="people-roster-stage" lang="en">{member.stageName}</span><span className="people-roster-arrow" aria-hidden="true">↗</span></Link></li>)}</ol></div><Link className="text-link people-unit-see-members" href={triplesReviewHref({section: 'members', rosterView: 'members', unit: selected.key})}>查看成员肖像 ↗</Link></div></div>{unitReleases.length > 1 && <section className="people-unit-more"><h3 className="section-title">相关发行</h3><div className="release-grid">{unitReleases.slice(1).map(item => <ReleaseTile key={item.key} item={item}/>)}</div></section>}</article></div> : <div className="empty"><h2>没有找到匹配的子团</h2><Link className="button" href={triplesReviewHref({section: 'members', rosterView: 'units'})}>清除搜索</Link></div>}
    </section>;
  }
function Person({member, members, originHref, onReturn, onMemberAction}: {member: ReviewMember; members: ReviewMember[]; originHref: string | null; onReturn: () => void; onMemberAction: (member: ReviewMember) => void}) {
    const units = triplesReviewDimensions.filter(unit => unit.memberIds.includes(member.id));
    const releases = triplesReviewReleases.filter(item => reviewVerifiedParticipants(item).includes(member.id));
    const origin = readTriplesReviewRoute(originHref ?? TRIPLES_REVIEW_PATH);
    const originUnit = triplesReviewDimensions.find(unit => unit.key === origin.unit);
    const filtered = origin.section === 'members' && !origin.member ? members.filter(person => (!originUnit || originUnit.memberIds.includes(person.id)) && reviewMemberMatches(person, origin.query)) : members;
    const sequence = filtered.some(person => person.id === member.id) ? filtered : members;
    const index = sequence.findIndex(person => person.id === member.id);
    const sibling = (person: ReviewMember | undefined, direction: 'previous' | 'next') => person ? <Link className={`person-sibling person-sibling-${direction}`} href={triplesReviewHref({section: 'members', member: person.id})}><span>{direction === 'previous' ? '上一位 ←' : '下一位 →'}</span><strong>{person.name}</strong><small>{sequenceLabel(person)} / {person.stageName}</small></Link> : <div className="person-sibling person-sibling-empty" aria-hidden="true"/>;
    const source = safeGroupLink(member.sourceUrl ?? undefined);
    return <article className="person-page" data-member-id={member.id}><div className="person-back"><button type="button" className="back-link" onClick={onReturn}><Arrow/>{origin.release ? '返回发行' : origin.section === 'works' ? '返回作品' : origin.section === 'overview' ? '返回首页' : '返回成员'}</button></div><header className="person-identity"><p className="person-number">S<span>{String(member.sNumber).padStart(2, '0')}</span></p><h1>{member.name}</h1><p className="person-stage-name" lang="en">{member.stageName}</p><SequenceRail active={[member.sNumber]}/></header><div className="person-hero"><figure className="person-portrait"><Picture src={member.image} className="person-portrait-image" alt={`${member.name} · ${member.stageName}`} priority zoom/><figcaption><span>tripleS</span><span>{sequenceLabel(member)}</span></figcaption></figure><div className="person-introduction"><p className="person-group-label">tripleS</p><div className="person-intro-line"/>{units.length > 0 && <section className="person-unit-section"><h2>参与子团</h2><div className="person-unit-list">{units.map(unit => <Link key={unit.key} href={triplesReviewHref({section: 'members', rosterView: 'units', unit: unit.key})} lang="en"><span>{unit.name}</span><span aria-hidden="true">↗</span></Link>)}</div></section>}<button type="button" className="button" onClick={() => onMemberAction(member)}>打开现有成员记录 ↗</button><div className="person-profile-footer"><span>{sequenceLabel(member)} / 24</span>{source && <a className="text-link" href={source} target="_blank" rel="noopener noreferrer">官方介绍 ↗</a>}</div></div></div>{releases.length > 0 && <section className="person-releases"><header className="person-section-heading"><h2 className="section-title">参与发行 <span>{String(releases.length).padStart(2, '0')}</span></h2><Link className="text-link" href={triplesReviewHref({section: 'works', participant: member.id})}>查看发行 ↗</Link></header><div className="release-grid">{releases.map(item => <ReleaseTile key={item.key} item={item}/>)}</div></section>}<nav className="person-sequence" aria-label="前后成员">{sibling(sequence[index - 1], 'previous')}{sibling(sequence[index + 1], 'next')}</nav></article>;
  }

type Props = {catalogOverride?: CatalogView | null; timelineOverride?: unknown; serverRoute?: string};
export default function TriplesVisualReview({catalogOverride, timelineOverride, serverRoute = TRIPLES_REVIEW_PATH}: Props) {
  const [fetched, setFetched] = useState<{catalog: CatalogView | null; loading: boolean; error: string}>({catalog: null, loading: true, error: ''});
  const [attempt, setAttempt] = useState(0);
  const [timelineState, setTimelineState] = useState<{input: unknown; loading: boolean; error: string; failure?: 'deadline' | 'import'}>({input: null, loading: true, error: ''});
  const [timelineAttempt, setTimelineAttempt] = useState(0);
  const state = catalogOverride === undefined ? fetched : {catalog: catalogOverride, loading: false, error: ''};
  const timelineData = timelineOverride === undefined ? timelineState : {input: timelineOverride, loading: false, error: ''};
  const url = useSyncExternalStore(subscribe, currentUrl, () => serverRoute);
  const route = useMemo(() => readTriplesReviewRoute(url), [url]);
  const originHref = useSyncExternalStore(subscribe, () => readReviewOpener(history.state?.triplesReviewOpener)?.href ?? '', () => '') || triplesReviewHref({section: 'members'});
  const members = useMemo(() => triplesReviewMembers(state.catalog), [state.catalog]);
  const timeline = useMemo(() => reviewTimeline(timelineData.input, state.catalog), [timelineData.input, state.catalog]);
  const group = resolvePublicArtistEntity('triples', {kind: 'group', key: 'triples'}, state.catalog);
  const ready = !state.loading && !state.error && !!group;
  const rememberScroll = useArtistScroll(ready, url);
  const pendingBack = useRef(false);
  const main = useRef<HTMLElement>(null), dialog = useRef<HTMLDialogElement>(null), imageDialog = useRef<HTMLDialogElement>(null);
  const [lightbox, setLightbox] = useState<{src: string; label: string} | null>(null);
  const [homeRange, setHomeRange] = useState(0), [homeSlide, setHomeSlide] = useState(0), [homeUnit, setHomeUnit] = useState(triplesReviewDimensions[0].key);
  const detail = route.valid && !route.member && (route.release || route.media) ? reviewMusicList(route.release ? 'release' : route.format).find(item => item.key === (route.release ?? route.media)) : undefined;
  const hasDetail = ready && !!detail;

  useEffect(() => {
    if (catalogOverride !== undefined) return;
    const controller = new AbortController();
    void catalogReadWithDeadline(async signal => {
      const response = await fetch('/api/catalog?artist=triples&shape=display-v1', {cache: 'no-store', signal});
      if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('暂时没有连上你的资料库。');
      const data = await response.json() as CatalogView;
      if (!data || !Array.isArray(data.groups) || !Array.isArray(data.members) || !Array.isArray(data.works) || !Array.isArray(data.ratings)) throw new Error('资料暂时没有加载完整。');
      if (!resolvePublicArtistEntity('triples', {kind: 'group', key: 'triples'}, data)) throw new Error('资料所属团体与当前预览不一致。');
      return data;
    }, controller.signal).then(catalog => {if (!controller.signal.aborted) setFetched({catalog, loading: false, error: ''});}, error => {if (!controller.signal.aborted) setFetched({catalog: null, loading: false, error: error instanceof Error ? error.message : '资料暂时无法读取。'});});
    return () => controller.abort();
  }, [catalogOverride, attempt]);
  useEffect(() => {
    if (timelineOverride !== undefined) return;
    let active = true;
    const timer = setTimeout(() => {if (active) {active = false; setTimelineState({input: null, loading: false, error: '时间轴仍在加载，可继续等待。', failure: 'deadline'});}}, 15000);
    loadArtistTimeline('triples').then(({input}) => {if (active) {clearTimeout(timer); setTimelineState({input, loading: false, error: ''});}}, () => {if (active) {clearTimeout(timer); setTimelineState({input: null, loading: false, error: '时间轴模块未能加载。可重新加载页面恢复。', failure: 'import'});}});
    return () => {active = false; clearTimeout(timer);};
  }, [timelineOverride, timelineAttempt]);
  useEffect(() => {
    const node = dialog.current;
    if (!hasDetail || !node) return;
    const previous = document.activeElement as HTMLElement | null;
    if (!node.open) node.showModal();
    return () => {if (node.open) node.close(); if (previous?.isConnected) previous.focus({preventScroll: true});};
  }, [hasDetail]);
  useEffect(() => {
    const node = imageDialog.current;
    if (!lightbox || !node) return;
    const previous = document.activeElement as HTMLElement | null;
    if (!node.open) node.showModal();
    return () => {if (node.open) node.close(); if (previous?.isConnected) previous.focus({preventScroll: true});};
  }, [lightbox]);
  const modalOpen = hasDetail || !!lightbox;
  useEffect(() => {
    if (!modalOpen) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {document.body.style.overflow = overflow;};
  }, [modalOpen]);
  useEffect(() => {
    const closeImage = () => {pendingBack.current = false; setLightbox(null);};
    window.addEventListener('popstate', closeImage);
    return () => window.removeEventListener('popstate', closeImage);
  }, []);
  useEffect(() => {
    if (!ready || hasDetail || lightbox) return;
    const target = route.event ?? (route.year ? `timeline-year-${route.year}` : null);
    if (!target) return;
    const frame = requestAnimationFrame(() => {const node = document.getElementById(target); if (node && main.current?.contains(node)) {node.scrollIntoView({block: 'start'}); node.focus({preventScroll: true});}});
    return () => cancelAnimationFrame(frame);
  }, [ready, hasDetail, lightbox, route.event, route.year, timeline.events]);

  useLayoutEffect(() => {
    if (!ready || lightbox) return;
    const saved = history.state?.triplesReviewFocus;
    if (saved?.path !== url || typeof saved.href !== 'string' || !canonicalReviewUrl(saved.href)) return;
    const frame = requestAnimationFrame(() => {
      const target = [...document.querySelectorAll<HTMLAnchorElement>('.triples-visual-review a[href]')].find(node => node.getAttribute('href') === saved.href);
      if (target?.isConnected) target.focus({preventScroll: true});
    });
    return () => cancelAnimationFrame(frame);
  }, [ready, url, lightbox, hasDetail]);

  function mayLeave() { return reviewMayLeave(document, dialog.current, message => window.confirm(message), message => window.alert(message)); }
  function navigate(target: string | null, triggerHref?: string) {
    if (pendingBack.current || !target || !canonicalReviewUrl(target) || currentUrl() !== url || !mayLeave()) return;
    if (target === url) return;
    rememberScroll();
    if (triggerHref && canonicalReviewUrl(triggerHref)) history.replaceState({...history.state, triplesReviewFocus: {path: url, href: triggerHref}}, '', url);
    const next = readTriplesReviewRoute(target);
    const plan = reviewNavigationPlan(url, target, history.state?.triplesReviewOpener, triggerHref ?? null);
    if (!plan) return;
    const newState = newArtistHistoryState(history.state); delete newState.triplesReviewOpener; delete newState.triplesReviewFocus;
    if (plan.opener) newState.triplesReviewOpener = plan.opener;
    history[plan.method](newState, '', target);
    window.dispatchEvent(new Event('artist-location-change'));
    if (!(next.release || next.media)) {window.scrollTo({top: 0, behavior: 'instant'}); requestAnimationFrame(() => main.current?.focus({preventScroll: true}));}
  }
  function returnToOpener(fallback: string | null) {
    if (pendingBack.current || currentUrl() !== url || !mayLeave()) return;
    const opener = readReviewOpener(history.state?.triplesReviewOpener);
    if (opener?.parentEntry && canonicalReviewUrl(opener.href)) {pendingBack.current = true; history.back(); return;}
    fallback = opener?.href ?? fallback;
    if (fallback && canonicalReviewUrl(fallback)) {const next = newArtistHistoryState(history.state); delete next.triplesReviewOpener; delete next.triplesReviewFocus; history.replaceState(next, '', fallback); window.dispatchEvent(new Event('artist-location-change')); requestAnimationFrame(() => main.current?.focus({preventScroll: true}));}
  }
  function closeDetail() {returnToOpener(triplesReviewHref({section: 'works', format: route.format === 'release' ? null : route.format}));}
  function mediaAction(item: ReviewMusic, action: 'play' | 'records') {
    if (pendingBack.current || item.kind !== 'mv' && item.kind !== 'stage' || !route.canonical || currentUrl() !== url || !mayLeave()) return;
    const resolved = resolvePublicArtistEntity('triples', {kind: item.kind, key: item.key}, state.catalog);
    if (!resolved || resolved.kind !== 'mv' && resolved.kind !== 'stage') return;
    const href = publicMediaActionHref({slug: 'triples', kind: item.kind, key: item.key, action, workId: resolved.work.id, videoId: resolved.videoId, returnTo: route.canonical, currentArtistUrl: canonicalReviewUrl(currentUrl()) ?? ''}, state.catalog);
    if (href) {rememberScroll(); location.assign(href);}
  }
  function memberAction(member: ReviewMember) {
    if (pendingBack.current || !route.canonical || currentUrl() !== url || !mayLeave()) return;
    const href = publicMemberActionHref({slug: 'triples', key: member.id, memberId: member.id, returnTo: route.canonical, currentArtistUrl: canonicalReviewUrl(currentUrl()) ?? ''}, state.catalog);
    if (href) {rememberScroll(); location.assign(href);}
  }
  const member = members.find(member => member.id === route.member);
  const active = route.member ? 'members' : route.section === 'records' ? 'works' : route.section;
  const page = route.member ? 'person' : route.section === 'overview' ? 'home' : route.section === 'updates' ? 'timeline' : route.section === 'records' ? 'works' : route.section;
  return <ReviewUiContext.Provider value={{navigate, openZoom: setLightbox}}><ImageRecoveryProvider><div className="triples-visual-review" data-design-review="triples-visual-v2" data-visual-acceptance="pending" data-figma-acceptance="not-accepted"><a className="skip-link" href="#triples-review-main" onClick={event => {event.preventDefault(); main.current?.focus();}}>跳到正文</a><header className="site-header"><Link className="brand" href={triplesReviewHref()} aria-label="tripleS 首页"><Picture src={triplesReviewWordmark} className="logo" alt="tripleS" priority/></Link><nav className="site-nav" aria-label="主导航">{nav.map(([section, title]) => <Link key={section} href={triplesReviewHref({section})} aria-current={active === section ? 'page' : undefined}>{title}</Link>)}</nav></header><main id="triples-review-main" ref={main} className={`container page-${page}`} tabIndex={-1} aria-busy={state.loading}>
      {!route.valid ? <div className="empty"><h1>这个预览链接无效</h1><Link className="button" href={triplesReviewHref()}>返回 tripleS 首页</Link></div> : state.loading ? <p className="loading-message" role="status">正在打开 tripleS…</p> : state.error ? <div className="empty" role="alert"><h1>资料暂时无法读取</h1><p>{state.error}</p><button type="button" className="button" onClick={() => {setFetched({catalog: null, loading: true, error: ''}); setAttempt(value => value + 1);}}>重新读取</button></div> : !group ? <div className="empty"><h1>未找到匹配的 tripleS 资料</h1><p>当前资料库没有提供唯一、有效的本团身份。</p></div> : route.member ? member ? <Person member={member} members={members} originHref={originHref} onReturn={() => returnToOpener(triplesReviewHref({section: 'members'}))} onMemberAction={memberAction}/> : <div className="empty"><h1>没有找到这位成员</h1><Link className="button" href={triplesReviewHref({section: 'members'})}>返回成员</Link></div> : route.section === 'members' ? <Members route={route} members={members} url={url} onNavigate={navigate}/> : route.section === 'works' || route.section === 'records' ? <WorksView route={route} members={members} Link={Link} Picture={Picture} Rail={SequenceRail} onFilter={fields => navigate(triplesReviewHref(fields))}/> : route.section === 'updates' ? timelineData.loading ? <p className="loading-message" role="status">正在读取完整时间轴…</p> : timelineData.error || timeline.state === 'invalid' ? <div className="empty" role="alert"><h1>时间轴暂未就绪</h1><p>{timelineData.error || '时间轴资料未通过校验。'}</p><button type="button" className="button" onClick={() => {if (currentUrl() !== url || !mayLeave()) return; if (timelineState.failure === 'import') {location.reload(); return;} setTimelineState({input: null, loading: true, error: ''}); setTimelineAttempt(value => value + 1);}}>{timelineState.failure === 'import' ? '重新加载页面' : '继续读取'}</button></div> : <TriplesVisualTimeline events={timeline.events} members={members} catalog={state.catalog!} Link={Link} Picture={Picture} selectedEvent={route.event} selectedYear={route.year}/> : <Home members={members} events={timeline.events} homeRange={homeRange} homeSlide={homeSlide} homeUnit={homeUnit} setHomeRange={setHomeRange} setHomeSlide={setHomeSlide} setHomeUnit={setHomeUnit}/>}
      {!hasDetail && !lightbox && <ImageRecoveryControls/>}
    </main><footer className="site-footer"><Link className="brand" href={triplesReviewHref()}>tripleS</Link><nav aria-label="页脚导航">{nav.map(([section, title]) => <Link key={section} href={triplesReviewHref({section})}>{title}</Link>)}</nav></footer>
    <dialog ref={dialog} className="detail-dialog" aria-labelledby="work-dialog-title" onCancel={event => {event.preventDefault(); closeDetail();}} onClick={event => {if (event.target !== event.currentTarget) return; const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeDetail();}}>{hasDetail && <><WorkDetail item={detail} route={route} members={members} catalog={state.catalog!} Link={Link} Picture={Picture} Rail={SequenceRail} onClose={closeDetail} onMediaAction={mediaAction}/>{!lightbox && <ImageRecoveryControls/>}</>}</dialog>
    <dialog ref={imageDialog} className="image-dialog" aria-labelledby="triples-image-caption" onCancel={event => {event.preventDefault(); setLightbox(null);}} onClick={event => {if (event.target !== event.currentTarget) return; const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) setLightbox(null);}}>{lightbox && <><button type="button" className="dialog-close" aria-label="关闭图片" onClick={() => setLightbox(null)}>×</button><figure><ReliableImage src={lightbox.src} alt={lightbox.label} identityKey={lightbox.src} priority/><figcaption id="triples-image-caption">{lightbox.label}</figcaption></figure><ImageRecoveryControls style={{color: 'white'}}/></>}</dialog>
  </div></ImageRecoveryProvider></ReviewUiContext.Provider>;
}
