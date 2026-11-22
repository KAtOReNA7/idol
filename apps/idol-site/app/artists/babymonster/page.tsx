import {ArtistRecognition} from '@/components/artist-recognition';
import ArtistSample from '@/components/artist-sample';
import {artistRequestSearch} from '@/lib/idol/artist-request-search';
import type {ArtistPageSearchParams} from '@/lib/idol/home-image-preload';
import '../../preview/babymonster/artist.css';
import './directory.css';

async function publicTimeline() {
  const {schemaVersion,groupId,slug,events} = (await import('@/data/artist-timelines/babymonster.json')).default;
  const ready = events.filter(event => event.reviewStatus === 'ready');
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

export default async function Page({searchParams}:{searchParams:Promise<ArtistPageSearchParams>}) {
  const initialSearch = artistRequestSearch(await searchParams ?? {});
  const query = new URLSearchParams(initialSearch);
  const initialTimeline = query.get('section') === 'updates' && !query.get('member') ? await publicTimeline() : undefined;
  return <ArtistRecognition slug="babymonster"><ArtistSample basePath="/artists/babymonster" initialSearch={initialSearch} initialTimeline={initialTimeline}/></ArtistRecognition>;
}
