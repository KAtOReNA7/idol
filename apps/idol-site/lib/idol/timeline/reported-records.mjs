import source from '../../../data/timeline-reported-records.json';

// Canonical event dates stay null when only the publication date is known.
const closedDates = {
  "e-atheart-aurora-second-hiatus-announcement": "实际生效日期：0（未查得）。2026-08-18 为官方公告日期。",
  "e-udtt-jessica-provisional-join-candidate": "实际加入日期：0（未查得）。2025-04-30 为本人采访发表日。"
};
const summaries = {
  "e-atheart-aurora-second-hiatus-announcement": "AtHeart 日本官网公告称，Aurora 因健康原因将暂时停止团体活动，恢复时间将另行通知。",
  "e-udtt-jessica-provisional-join-candidate": "2025 年 4 月 30 日，Jessica 在团体采访中介绍自己叫陆雨婷，活动名为 우정，在专辑的校园设定里饰演中国留学生。5 月 8 日的本人采访与 5 月 9 日的 Sports Donga 报道也记载了她参与活动。角色设定未说明合约期限。"
};
const boundaries = {
  "e-atheart-aurora-hiatus-observed": "Aurora 于 2025 年 7 月初开始暂停活动，具体日期不详。",
  "e-bewave-six-member-phase-end-announcement": "六人阵容的活动于当日结束，团体随后继续活动。",
  "e-candyshop-yuina-hiatus-announcement": "YUINA 当时暂停团体活动，仍保留团体成员身份。",
  "e-geenius-spoiler-book-instrumental": "《Spoiler Book》另有人声版与 LDC 版。",
  "e-udtt-sena-predebut-departure-candidate": ""
};

/** Public copy preserves the underlying dates, identities and sources. */
export function reportedTimelineRecords(slug,groupId){
 return source.records.filter(row=>row.slug===slug&&row.groupId===groupId).map(row=>{
  const closed=row.eventDate===null&&Object.hasOwn(closedDates,row.eventId);
  const boundary=closed?closedDates[row.eventId]:boundaries[row.eventId]??row.boundary;
  return {...row,summary:summaries[row.eventId]??row.summary,boundary,...(closed?{dateResolution:'closed-display-zero'}:{})};
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
