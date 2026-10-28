'use client';

import {useId, useMemo, type ReactNode} from 'react';
import type {TimelineDate, TimelineEvent, TimelineFilters, TimelineValidationContext} from '../lib/idol/timeline/types';
import {selectChronologicalTimeline, timelineDisplayDate, timelineDateKind} from '../lib/idol/timeline/model';
import {validateTimeline} from '../lib/idol/timeline/validate';
import {prepareTimelinePresentation} from '../lib/idol/timeline/presentation';
import type {TimelineIdentityCatalog} from '../lib/idol/timeline/identity';
import type {TimelineDisplayCopy} from '../lib/idol/timeline/display-copy';
import './artist-timeline.css';
import {TimelineReportedRecords} from './timeline-reported-records';

export interface ArtistTimelineProps {
  /** Untrusted wire payload; validation precedes all event rendering. */
  input: unknown;
  context: TimelineValidationContext;
  catalog?: TimelineIdentityCatalog | null;
  title?: string;
  showTitle?: boolean;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  retryLabel?: string;
  /** Legacy host props remain accepted, but never control this read-only axis. */
  displayCopy?: TimelineDisplayCopy;
  background?: ReactNode;
  initialFilters?: Partial<TimelineFilters>;
  filters?: TimelineFilters;
  onFiltersChange?: (filters: TimelineFilters) => void;
  /** The host applies the existing dirty/save guard before navigation. */
  onMember?: (memberId: string, eventId: string) => void;
  onWork?: (workId: string, eventId: string) => void;
  releaseTargets?: Readonly<Record<string,{id:string;label:string}>>;
  onRelease?: (releaseId:string,eventId:string)=>void;
  memberLabels?: Readonly<Record<string, string>>;
  workLabels?: Readonly<Record<string, string>>;
}

function eventHeadingId(instanceId: string, eventId: string): string {
  const encoded = Array.from(eventId, char => char.codePointAt(0)!.toString(16)).join('-');
  return `${instanceId}-event-${encoded}`;
}

function DateLabel({date}: {date: TimelineDate | null}) {
  if (!date) return <span>日期待确认</span>;
  const [year, month, day] = date.value.split('-').map(Number);
  const label = `${year} 年${month ? ` ${month} 月` : ''}${day ? ` ${day} 日` : ''}`;
  // A year/month stays a year/month; no invented day or publication-date fallback.
  return date.precision === 'year' ? <span>{label}</span> : <time dateTime={date.value}>{label}</time>;
}

function eventTitle(event: TimelineEvent): string {
  // Exact reviewed presentation-only overrides; canonical titles remain intact.
  const copy:Record<string,{before:string;after:string}>={
    'e-lesserafim-crazy':{before:'《CRAZY》数字发行',after:'《CRAZY》发行'},
    'e-lesserafim-garam-hiatus':{before:'金佳蓝暂停活动，团体暂以五人活动',after:'金佳览暂停活动，团体暂以五人活动'},
    'e-lesserafim-garam-contract-announcement':{before:'宣布金佳蓝离团并解约',after:'宣布金佳览离团并解约'},
  };
  const override=copy[event.id];
  const title=override?.before===event.title?override.after:event.title;
  if(event.status==='confirmed')return title;
  if(event.status==='cancelled')return title.includes('取消')?title:`已取消：${title}`;
  if(event.status==='postponed')return title.includes('延期')?title:`已延期：${title}`;
  if(event.status==='uncertain')return title.includes('待确认')?title:`待确认：${title}`;
  if(timelineDateKind(event)==='planned'||event.status==='planned')return title.includes('计划')?title:`计划：${title}`;
  return /公告|宣布|公布|声明/.test(title)?title:`宣布：${title}`;
}

// Keep each artist's typography; only book-title punctuation needs a CJK font.
function titleWithCjkPunctuation(title: string): ReactNode {
  if (!/[《》]/u.test(title)) return title;
  return title.split(/([《》])/u).map((part, index) => part === '《' || part === '》'
    ? <span className="at-title-punctuation" key={index}>{part}</span> : part);
}

function EventLinks({event,context,onMember,onWork,memberLabels,workLabels,releaseTargets,onRelease}: {
  event: TimelineEvent; context: TimelineValidationContext;
  releaseTargets?: ArtistTimelineProps['releaseTargets']; onRelease?: ArtistTimelineProps['onRelease'];
  onMember?: ArtistTimelineProps['onMember']; onWork?: ArtistTimelineProps['onWork'];
  memberLabels?: ArtistTimelineProps['memberLabels']; workLabels?: ArtistTimelineProps['workLabels'];
}) {
  const release=releaseTargets?.[event.id];
  const targets = [
    ...(release&&onRelease?[{id:release.id,kind:'release' as const,label:release.label,usable:true,navigate:onRelease}]:[]),
    ...event.memberIds.map(id => ({id,kind:'member' as const,label:memberLabels?.[id],usable:context.members?.some(member=>member.id===id&&member.groupIds.includes(event.groupId)),navigate:onMember})),
    ...event.workIds.map(id => ({id,kind:'work' as const,label:workLabels?.[id],usable:context.works?.some(work=>work.id===id&&work.groupIds.includes(event.groupId)),navigate:onWork})),
  ].filter(target=>target.label);
  if (!targets.length) return null;
  return <div className="at-references" aria-label="关联成员与作品">{targets.map(target=>target.usable&&target.navigate
    ? <button type="button" key={`${target.kind}-${target.id}`} data-timeline-event-trigger={event.id} data-timeline-target-kind={target.kind} data-timeline-target-id={target.id} onClick={()=>target.navigate!(target.id,event.id)}>{target.label}</button>
    : <span key={`${target.kind}-${target.id}`}>{target.label}</span>)}</div>;
}

type TimelineVisual = 'debut' | 'people' | 'release' | 'organization' | 'ordinary';
function timelineVisual(event: TimelineEvent): TimelineVisual {
  if (event.eventType === 'debut') return 'debut';
  if (event.eventType === 'release') return 'release';
  if (['member_join', 'member_departure', 'hiatus', 'resume'].includes(event.eventType)) return 'people';
  // A single person's contract is visually personal, without asserting departure.
  if (event.eventType === 'contract_end' && event.memberIds.length === 1) return 'people';
  if (['agency_change', 'contract_end', 'rename', 'disband'].includes(event.eventType)) return 'organization';
  return 'ordinary';
}
const eventKindLabels: Record<TimelineEvent['eventType'], string> = {
  member_join:'成员加入', member_departure:'成员变动', debut:'出道', release:'音乐发行',
  disband:'团体变动', agency_change:'公司变动', contract_end:'合约变动', rename:'团体更名',
  hiatus:'活动暂停', resume:'活动恢复', notice:'公告', other:'团体事件',
};
function EventMarker({visual}: {visual: TimelineVisual}) {
  return <span className={`at-node at-node--${visual}`} aria-hidden="true">
    {visual === 'ordinary' ? <span className="at-node-dot"/> : <svg viewBox="0 0 24 24" focusable="false">
      {visual === 'debut' ? <path className="at-node-emphasis" d="m12 2.5 2.9 6 6.6 1-4.8 4.6 1.1 6.6-5.8-3.1-5.8 3.1 1.1-6.6-4.8-4.6 6.6-1Z"/>
        : visual === 'people' ? <><circle cx="12" cy="7" r="3.3"/><path d="M5 21v-2a7 7 0 0 1 14 0v2M8 21h8"/></>
        : visual === 'release' ? <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/><path className="at-node-accent" d="M12 6a6 6 0 0 1 6 6M6 12a6 6 0 0 0 6 6"/></>
        : <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 7h1m4 0h1M9 11h1m4 0h1M10 21v-6h4v6"/></>}
    </svg>}
  </span>;
}

/** A single read-only chronological axis. Audit/source content stays in canonical data. */
export function ArtistTimeline({input,context,catalog,title='大事时间轴',showTitle=true,loading=false,error='',onRetry,retryLabel='重新读取',onMember,onWork,memberLabels,workLabels,releaseTargets,onRelease}: ArtistTimelineProps) {
  const instanceId=useId();
  const presentation=useMemo(()=>catalog!==undefined?prepareTimelinePresentation(input,catalog,context.groups):null,[input,catalog,context.groups]);
  const validation=useMemo(()=>presentation?.timeline&&presentation.state!=='invalid'?{ok:true as const,value:presentation.timeline,issues:[]}:validateTimeline(input,context),[input,context,presentation]);
  const events=useMemo(()=>selectChronologicalTimeline(validation.ok?validation.value.events:[]),[validation]);
  const identityContext=presentation?.identity.context??context;
  return <section className="artist-timeline" aria-labelledby={showTitle?`${instanceId}-title`:undefined} aria-label={showTitle?undefined:title} aria-busy={!error&&(loading||presentation?.state==='loading')||undefined}>
    {showTitle&&<header className="at-heading"><h2 id={`${instanceId}-title`}>{title}</h2></header>}
    {error?<div className="at-state" role="alert"><p>{error}</p>{onRetry&&<button type="button" onClick={onRetry}>{retryLabel}</button>}</div>
      :loading||presentation?.state==='loading'?<p className="at-state" role="status">正在读取时间轴…</p>
      :!validation.ok?<div className="at-state" role="alert"><p>时间轴暂时无法显示。</p>{onRetry&&<button type="button" onClick={onRetry}>重新读取</button>}</div>
      :events.length===0?<p className="at-state">事件正在整理，确认后会显示在这里。</p>
      :<ol className="at-list">{events.map(event=><li key={event.id} data-timeline-event-type={event.eventType} data-timeline-visual={timelineVisual(event)}>
        <EventMarker visual={timelineVisual(event)}/>
        <article className="at-event" tabIndex={-1} data-timeline-event-id={event.id} aria-labelledby={eventHeadingId(instanceId,event.id)}>
          <span className="at-event-kind">{eventKindLabels[event.eventType]}</span>
          <p className="at-when"><DateLabel date={timelineDisplayDate(event)}/></p>
          <h3 id={eventHeadingId(instanceId,event.id)}>{titleWithCjkPunctuation(eventTitle(event))}</h3>
          <EventLinks event={event} context={identityContext} onMember={onMember} onWork={onWork} memberLabels={memberLabels} workLabels={workLabels} releaseTargets={releaseTargets} onRelease={onRelease}/>
        </article>
      </li>)}</ol>}
    {validation.ok&&!loading&&!error&&<TimelineReportedRecords slug={validation.value.slug} groupId={validation.value.groupId}/>}
  </section>;
}
