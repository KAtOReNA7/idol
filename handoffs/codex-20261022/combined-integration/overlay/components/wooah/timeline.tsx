'use client';
import {wooahTimelineEvents,wooahTimelineRelease,wooahTimelineDate} from '@/lib/idol/wooah-timeline';
import '@/components/artist-timeline.css';
/** WOOAH's reviewed major-event axis. Canonical data and host release guards stay unchanged. */
export function WooahTimeline({onRelease}:{onRelease:(releaseKey:string,eventId:string)=>void}){
 const events=wooahTimelineEvents();
 if(!events)return <p role="alert">时间轴暂时无法显示。</p>;
 return <section className="artist-timeline" aria-label="WOOAH 大事时间轴"><ol className="at-list">{events.map(event=>{
  const date=wooahTimelineDate(event),release=wooahTimelineRelease(event.id),debut=event.eventType==='debut';
  return <li key={event.id} data-timeline-event-type={event.eventType} data-timeline-visual={debut?'debut':'release'}>
   <span className={`at-node at-node--${debut?'debut':'release'}`} aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false">{debut?<path className="at-node-emphasis" d="m12 2.5 2.9 6 6.6 1-4.8 4.6 1.1 6.6-5.8-3.1-5.8 3.1 1.1-6.6-4.8-4.6 6.6-1Z"/>:<><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/></>}</svg></span>
   <article className="at-event" tabIndex={-1} data-timeline-event-id={event.id} aria-labelledby={`wooah-${event.id}`}>
    <span className="at-event-kind">{debut?'出道':'音乐发行'}</span><p className="at-when">{date?<time dateTime={date.value}>{date.label}</time>:'日期待确认'}</p><h3 id={`wooah-${event.id}`}>{event.title}</h3>
    {release&&<div className="at-references"><button type="button" data-timeline-event-trigger={event.id} data-timeline-target-kind="release" data-timeline-target-id={release.key} onClick={()=>onRelease(release.key,event.id)}>查看发行 · {release.title}</button></div>}
   </article>
  </li>;
 })}</ol></section>;
}
