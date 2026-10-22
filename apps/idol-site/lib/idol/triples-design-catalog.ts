import catalog from '@/data/triples/design-public-catalog.json';
import chineseNames from '@/data/triples/design-chinese-names.json';
import {memberChineseName} from './member-display-name';
import type {Member, Work} from './types';

/** Public editorial entities are not production Work records or media casts. */
export interface TriplesPublicMusic {
  key: string; kind: string; title: string; date: string | null; dateSemantics: string | null;
  localImage: string; sourceUrl: string; officialUrl?: string; officialLandingUrl?: string;
  releaseKey?: string; dimensionKey?: string | null; programme?: string; episode?: string;
  participantIds: string[]; participationStatus: string; participationSourceUrl?: string | null;
}
export const triplesPublicReleases: readonly TriplesPublicMusic[] = [...catalog.releases].sort((a,b)=>(b.date ?? '').localeCompare(a.date ?? ''));
export const triplesPublicVideos: readonly TriplesPublicMusic[] = [...catalog.musicVideos].sort((a,b)=>(b.date ?? '').localeCompare(a.date ?? ''));
export const triplesPublicStages: readonly TriplesPublicMusic[] = catalog.stages;
export const triplesPublicDimensions = catalog.dimensions;
export function triplesChineseLabel(member: Member): string {
  const preferred = memberChineseName(member);
  if (preferred) return preferred;
  const reviewed = chineseNames.find(entry => entry.memberId === member.id && entry.officialStageName === member.stageName);
  return reviewed && member.groupIds.includes('rec28ldfRTiCtw') ? reviewed.chineseDisplayName : member.stageName;
}
export function triplesPublicDate(entry: TriplesPublicMusic) {
  if (!entry.date) return '';
  if (!entry.dateSemantics) return entry.date;
  const prefix = entry.dateSemantics === 'broadcast_date' ? '播出' : entry.dateSemantics === 'official_video_publication_date' ? 'MV 公开' : entry.dateSemantics === 'official_japanese_release_date' ? '日本发行' : '平台发行';
  return `${prefix} · ${entry.date}`;
}
export function triplesPublicTitle(entry: TriplesPublicMusic) {
  return /^tripleS\(/.test(entry.title) ? entry.title.match(/[‘']([^’']+)[’']/)?.[1] ?? entry.title : entry.title;
}
/** Exact URL and group, uniquely matched; no title/S-number/lineup inference. */
export function triplesPublicWork(entry: TriplesPublicMusic, works: readonly Work[]): Work | null {
  if (entry.kind !== 'mv' || !entry.officialUrl) return null;
  const matches = works.filter(work => work.groupIds.includes('rec28ldfRTiCtw') && work.url === entry.officialUrl);
  return matches.length === 1 ? matches[0] : null;
}
