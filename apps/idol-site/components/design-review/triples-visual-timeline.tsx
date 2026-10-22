import type {AnchorHTMLAttributes, ComponentType, ReactNode} from 'react';
import {
  reviewMusicFields,
  reviewUrlFromCanonical,
  triplesReviewHref,
  triplesReviewReleases,
  triplesReviewStages,
  triplesReviewVideos,
  type ReviewMember,
  type ReviewMusic,
} from '@/lib/idol/design-review/triples-visual-model';
import {publicTimelineReleaseHref, resolvePublicArtistEntity} from '@/lib/idol/public-artist-bridge';
import {formatTimelineDate, sortTimelineEvents, timelineDateKind, timelineDisplayDate} from '@/lib/idol/timeline/model';
import type {TimelineDate, TimelineEvent} from '@/lib/idol/timeline/types';
import {safeTimelineSourceUrl} from '@/lib/idol/timeline/validate';
import type {CatalogView} from '@/lib/idol/types';

export type TriplesTimelineLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'children'> & {
  href: string | null;
  children: ReactNode;
  [attribute: `data-${string}`]: string | number | boolean | undefined;
};
export type TriplesTimelinePictureProps = {
  src: string | null | undefined;
  alt: string;
  className?: string;
  priority?: boolean;
};
export type TriplesVisualTimelineProps = {
  /** The host owns canonical schema validation and the publication gate. */
  events: readonly TimelineEvent[];
  members: readonly ReviewMember[];
  catalog: CatalogView;
  Link: ComponentType<TriplesTimelineLinkProps>;
  Picture: ComponentType<TriplesTimelinePictureProps>;
  selectedEvent?: string | null;
  selectedYear?: string | null;
};

type TimelineEntry = {event: TimelineEvent; date: TimelineDate | null};
type WorkLink = {item: ReviewMusic; href: string};
const dateLabels = {occurred: '发生日期', announcement: '公告日期', planned: '计划日期', unknown: '日期未明'} as const;

function visibleDate(date: TimelineDate | null): string {
  if (!date) return '';
  return date.value.replace(/-/g, '.');
}

function eventTitle(event: TimelineEvent): string {
  const title = event.title.replace(/分队/g, '子团');
  if (event.status === 'announced' || event.status === 'planned') {
    if (/^(宣布|计划|将于|预定)/.test(title)) return title;
    return `${timelineDateKind(event) === 'announcement' ? '宣布' : '计划'}：${title}`;
  }
  if (event.status === 'postponed' && !/延期|推迟/.test(title)) return `延期：${title}`;
  if (event.status === 'cancelled' && !/取消/.test(title)) return `取消：${title}`;
  if (event.status === 'uncertain' && !/待确认|未确认/.test(title)) return `待确认：${title}`;
  return title;
}

function cleanReleaseTitle(title: string): string {
  return title.replace(/\s{2,}/g, ' ');
}

/** Render source attribution, not the canonical research notes retained on each event. */
function EventSources({event}: {event: TimelineEvent}) {
  const sources = event.sources.flatMap(source => {
    const href = safeTimelineSourceUrl(source.url);
    return href ? [{source, href}] : [];
  });
  if (!sources.length) return null;
  return <details className="timeline-source-details">
    <summary>来源</summary>
    {event.status !== 'confirmed' && <p>{dateLabels[timelineDateKind(event)]}：{formatTimelineDate(timelineDisplayDate(event))}</p>}
    {event.plannedDate && event.status !== 'confirmed' && <p>计划日期：{formatTimelineDate(event.plannedDate)}</p>}
    {!!sources.length && <ul>{sources.map(({source, href}) => <li key={source.id}>
      <a href={href} target="_blank" rel="noopener noreferrer">{source.title || source.publisher}</a>
      {source.publisher && <span> · {source.publisher}</span>}
      {source.sourcePublishedAt && <span> · {formatTimelineDate(source.sourcePublishedAt)}</span>}
    </li>)}</ul>}
  </details>;
}

/**
 * Visual-only rendering of all host-approved assertions. No prototype fixture,
 * default "major" selector, event deduplication, or unit-to-media cast inference.
 */
export function TriplesVisualTimeline({
  events, members, catalog, Link, Picture, selectedEvent = null, selectedYear = null,
}: TriplesVisualTimelineProps) {
  // Order by the canonical display-date semantics without mutating source dates.
  const ordered = sortTimelineEvents(events.map(event => ({...event, eventDate: timelineDisplayDate(event)})), 'earliest');
  const original = new Map(events.map(event => [event.id, event]));
  const grouped = new Map<string, TimelineEntry[]>();
  for (const orderedEvent of ordered) {
    const event = original.get(orderedEvent.id)!;
    const date = timelineDisplayDate(event);
    const year = date ? date.value.slice(0, 4) : 'other';
    const entries = grouped.get(year) ?? [];
    entries.push({event, date});
    grouped.set(year, entries);
  }
  const years = [...grouped.keys()];
  const datedYears = years.filter(year => year !== 'other');
  const firstYear = datedYears[0] ?? '';
  const lastYear = datedYears.at(-1) ?? '';

  // A timeline workId must match the resolved exact public (kind, key) tuple.
  const worksById = new Map<string, WorkLink[]>();
  for (const item of [...triplesReviewVideos, ...triplesReviewStages]) {
    if (item.kind !== 'mv' && item.kind !== 'stage') continue;
    const resolved = resolvePublicArtistEntity('triples', {kind: item.kind, key: item.key}, catalog);
    if (!resolved || resolved.kind !== item.kind || resolved.key !== item.key || !('work' in resolved)) continue;
    const href = triplesReviewHref(reviewMusicFields(item));
    if (!href) continue;
    const links = worksById.get(resolved.work.id) ?? [];
    links.push({item, href});
    worksById.set(resolved.work.id, links);
  }

  function eventMarkup({event, date}: TimelineEntry, previousDate: TimelineDate | null) {
    const canonicalReleaseHref = event.releaseKey ? publicTimelineReleaseHref('triples', event.releaseKey) : null;
    const releaseHref = reviewUrlFromCanonical(canonicalReleaseHref);
    const releaseKey = canonicalReleaseHref ? new URL(canonicalReleaseHref, 'https://site.invalid').searchParams.get('release') : null;
    const releaseCandidates = releaseKey ? triplesReviewReleases.filter(item => item.key === releaseKey) : [];
    const resolvedRelease = releaseKey ? resolvePublicArtistEntity('triples', {kind: 'release', key: releaseKey}, catalog) : null;
    const release = releaseHref && resolvedRelease?.kind === 'release' && releaseCandidates.length === 1 ? releaseCandidates[0] : null;
    const workLinks = event.workIds.flatMap(workId => worksById.get(workId) ?? []);
    const memberLinks = event.memberIds.flatMap(id => {
      const candidates = members.filter(member => member.id === id && member.member.id === id);
      const resolved = resolvePublicArtistEntity('triples', {kind: 'member', key: id}, catalog);
      if (candidates.length !== 1 || resolved?.kind !== 'member' || resolved.member.id !== id) return [];
      const href = triplesReviewHref({section: 'members', member: id});
      return href ? [{member: candidates[0], href}] : [];
    });
    const repeated = !!date && date.value === previousDate?.value && date.precision === previousDate.precision;
    const dateKind = timelineDateKind(event);
    const isPlanned = event.status === 'planned' || event.status === 'announced';
    const hasCover = !!(release && release.localImage);
    const hasLinks = !!release || workLinks.length > 0 || memberLinks.length > 0;
    return <article
      key={event.id}
      className={`timeline-event${hasCover ? ' timeline-event-with-cover' : ''}${isPlanned ? ' timeline-event-announcement' : ''}`}
      id={event.id}
      tabIndex={-1}
      aria-current={selectedEvent === event.id ? 'true' : undefined}
      data-timeline-event={event.id}
      data-event-date={date?.value ?? ''}
      data-event-precision={date?.precision ?? ''}
      data-date-kind={dateKind}
      data-event-status={event.status}
      data-work-ids={event.workIds.join(' ')}
    >
      <div className="timeline-event-date">{date && <time
        dateTime={date.value}
        className={repeated ? 'timeline-date-repeat' : undefined}
        aria-label={`${dateLabels[dateKind]}：${formatTimelineDate(date)}`}
      >{visibleDate(date)}</time>}</div>
      <div className="timeline-event-content">
        <span className="timeline-dot" aria-hidden="true"/>
        <div className="timeline-event-body">
          <h3>{eventTitle(event)}</h3>
          {hasLinks && <div className="timeline-links">
            {release && <Link className="timeline-release-link text-link" href={releaseHref}>
              {cleanReleaseTitle(release.title)}<span aria-hidden="true"> ↗</span>
            </Link>}
            {workLinks.map(({item, href}) => <Link key={`${item.kind}:${item.key}`} className="timeline-work-link text-link" href={href} data-media-kind={item.kind} data-media-key={item.key}>
              {item.title}<span aria-hidden="true"> ↗</span>
            </Link>)}
            {memberLinks.map(({member, href}) => <Link key={member.id} className="member-name-link" href={href} data-member-id={member.id}>
              <small>S{member.sNumber}</small>{member.name}
            </Link>)}
          </div>}
          <EventSources event={event}/>
        </div>
        {hasCover && release && <Link className="timeline-cover" href={releaseHref} aria-label={`查看${cleanReleaseTitle(release.title)}`}>
          <Picture src={release.localImage} className="timeline-cover-image" alt={`${cleanReleaseTitle(release.title)} 封面`}/>
        </Link>}
      </div>
    </article>;
  }

  return <div className="timeline-page">
    <header className="page-head timeline-page-head">
      <div><p className="timeline-eyebrow">tripleS</p><h1>时间轴</h1></div>
      {datedYears.length > 0 && <p className="timeline-range" aria-label={`${firstYear}年至${lastYear}年`}>
        <span>{firstYear}</span><span className="timeline-range-dash" aria-hidden="true">—</span><span>{lastYear}</span>
      </p>}
    </header>
    <nav className="timeline-year-nav" aria-label="按年份跳转">{years.map(year => <Link
      key={year}
      href={triplesReviewHref({section: 'updates', year})}
      data-event-anchor={`timeline-year-${year}`}
      aria-current={selectedYear === year ? 'location' : undefined}
    >{year === 'other' ? '大事记' : year}</Link>)}</nav>
    <div className="timeline-sequence" data-event-count={events.length}>
      <div className="timeline-axis" aria-hidden="true"/>
      {years.map(year => <section className="timeline-year-section" tabIndex={-1} id={`timeline-year-${year}`} aria-labelledby={`timeline-label-${year}`} key={year}>
        <h2 className="timeline-year" id={`timeline-label-${year}`}>{year === 'other' ? '大事记' : year}</h2>
        <div className="timeline-year-events">{grouped.get(year)!.map((entry, index, entries) => eventMarkup(entry, index > 0 ? entries[index - 1].date : null))}</div>
      </section>)}
    </div>
    <footer className="timeline-end">
      <span aria-hidden="true">●</span>
      <Link className="text-link" href={triplesReviewHref({section: 'works'})}>浏览发行作品 <span aria-hidden="true">↗</span></Link>
    </footer>
  </div>;
}

export default TriplesVisualTimeline;
