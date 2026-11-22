type DateValue = {value:string; precision:string} | null;
type Source = {id:string; url:string; publisher:string; title:string; sourcePublishedAt:DateValue; checkedAt:string};
type Event = {
  id:string; groupId:string; eventType:string; title:string; eventDate:DateValue; announcementDate:DateValue;
  plannedDate:DateValue; status:string; importance:string; memberIds:string[]; workIds:string[];
  releaseKey:string|null; relatedEventIds:string[]; sources:Source[]; reviewStatus:string;
};

export function publicShareTimeline(input:{schemaVersion:number; groupId:string; slug:string; events:Event[]}) {
  const {schemaVersion, groupId, slug} = input;
  const ready = input.events.filter(event => event.reviewStatus === 'ready');
  const publishedIds = new Set(ready.map(event => event.id));
  return {schemaVersion, groupId, slug, gaps: [], events: ready.map(event => ({
    id: event.id, groupId: event.groupId, eventType: event.eventType, title: event.title,
    eventDate: event.eventDate, announcementDate: event.announcementDate, plannedDate: event.plannedDate,
    status: event.status, importance: event.importance, memberIds: event.memberIds, workIds: event.workIds,
    releaseKey: event.releaseKey, relatedEventIds: event.relatedEventIds.filter(id => publishedIds.has(id)),
    sources: event.sources.map(({id,url,publisher,title,sourcePublishedAt,checkedAt}) =>
      ({id, url, publisher, title, sourcePublishedAt, checkedAt, scopeNote: '', evidenceRef: null})),
    reviewStatus: event.reviewStatus, holdReasons: [], summary: '', scopeNote: '',
  }))};
}
