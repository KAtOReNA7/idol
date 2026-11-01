export interface ReportedTimelineRecord {
 eventId:string;slug:string;groupId:string;memberIds:string[];kind:'report'|'catalog'|'repost';
 recordDate:string|null;dateLabel:string;eventDate:{value:string;precision:'year'|'month'|'day'}|null;title:string;summary:string;boundary:string;
 sources:{url:string;label:string;publishedDate:string|null}[];legacyNativeIds:string[];
}
export function reportedTimelineRecords(slug:string,groupId:string):ReportedTimelineRecord[];
export function supersededNativeReportIds(slug:string,groupId:string):string[];
