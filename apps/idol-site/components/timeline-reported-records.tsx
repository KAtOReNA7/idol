import type {ReactNode} from 'react';
import {reportedTimelineRecords} from '@/lib/idol/timeline/reported-records.mjs';

/** Reuses native timeline classes; report dates never enter the event-date model. */
export function TimelineReportedRecords({slug,groupId,variant='shared',renderMember}:{slug:string;groupId:string;variant?:'shared'|'bewave'|'candyshop'|'geenius';renderMember?:(id:string)=>ReactNode}){
 const records=reportedTimelineRecords(slug,groupId);
 if(!records.length)return null;
 const styles={shared:['at-list','at-event','at-when'],bewave:['single-timeline','event-copy','event-date'],candyshop:['cs-timeline','cs-event-copy','cs-event-date'],geenius:['idol-geenius-timeline','idol-geenius-event-copy','idol-geenius-event-date']}[variant];
 return <section data-reported-timeline={slug} aria-label="报道与目录记录"><h2>报道与目录记录</h2><ol className={styles[0]}>{records.map(row=>{
  const date=<div className={styles[2]}>{row.recordDate?<time dateTime={row.recordDate}>{row.recordDate}</time>:<span>记录日期未确认</span>}<span> · {row.dateLabel}</span></div>;
  return <li key={row.eventId} id={row.eventId} data-timeline-event-id={row.eventId} data-reported-record={row.eventId} className={variant==='bewave'?'event':undefined}>
   {variant==='shared'?<span className="at-node at-node--ordinary" aria-hidden="true"><span className="at-node-dot"/></span>:date}
   <div className={styles[1]}>{row.legacyNativeIds.map(id=><span id={id} key={id} aria-hidden="true"/>)}{variant==='shared'&&date}{variant==='bewave'?<h2>{row.title}</h2>:<h3>{row.title}</h3>}<p>{row.summary}</p><p><strong>{row.boundary}</strong></p><div className={variant==='shared'?'at-references':variant==='geenius'?'idol-geenius-event-links':variant==='candyshop'?'cs-event-links':'event-links'}>{renderMember&&row.memberIds.map(id=><span key={id}>{renderMember(id)}</span>)}{row.sources.map(s=><a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer">{s.label} ↗</a>)}</div></div>
  </li>;
 })}</ol></section>;
}
