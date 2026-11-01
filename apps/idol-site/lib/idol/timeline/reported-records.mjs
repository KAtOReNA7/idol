import source from '../../../data/timeline-reported-records.json';

/** Separate public reporting projection; never promotes or mutates canonical facts. */
export function reportedTimelineRecords(slug,groupId){
 return source.records.filter(row=>row.slug===slug&&row.groupId===groupId).map(row=>{
  // 2026-11-01: user closed these research tasks with a display-zero fallback.
  // Keep null canonical dates and the real report date; never parse 0 as a date.
  const closedDates={
   'e-atheart-aurora-second-hiatus-announcement':'实际生效日期：0（未查得）；按2026-08-18官方公告日期记录。',
   'e-udtt-jessica-provisional-join-candidate':'实际加入日期：0（未查得）；按2025-04-30本人采访发表日期记录，保留原有身份与个人历史。',
  };
  return row.eventDate===null&&Object.hasOwn(closedDates,row.eventId)
   ? {...row,boundary:closedDates[row.eventId],dateResolution:'closed-display-zero'}:row;
 });
}
export function supersededNativeReportIds(slug,groupId){
 return reportedTimelineRecords(slug,groupId).flatMap(row=>row.legacyNativeIds);
}

/** Read-only identity projection for native source guards; never fed into fact rendering. */
export function withReportedTimelineIdentity(artist){
 const records=reportedTimelineRecords(artist.slug,artist.id);
 if(!records.length)return artist;
 const ids=new Set((artist.timeline??[]).map(row=>row.id));
 if(records.some(row=>ids.has(row.eventId)))throw new Error('Reported record collides with native timeline identity');
 return {...artist,timeline:[...(artist.timeline??[]),...records.map(row=>({id:row.eventId,memberIds:[...row.memberIds],workIds:[],sources:row.sources.map(source=>({...source}))}))]};
}
