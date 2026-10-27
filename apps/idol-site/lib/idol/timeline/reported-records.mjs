import source from '../../../data/timeline-reported-records.json';

/** Separate public reporting projection; never promotes or mutates canonical facts. */
export function reportedTimelineRecords(slug,groupId){
 return source.records.filter(row=>row.slug===slug&&row.groupId===groupId);
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
