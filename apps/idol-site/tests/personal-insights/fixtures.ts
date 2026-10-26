/** TEST ONLY synthetic fixtures. Never copy these records into production data. */
import type { CatalogView, Group, Member, RatingView, Work } from '../../lib/idol/types';

export const TEST_ONLY_NOTICE = 'TEST ONLY / synthetic personal-insights fixtures';

export function group(id: string, patch: Partial<Group> = {}): Group {
  return {
    id, name: 'TEST ONLY Group ' + id, generation: '', company: '', country: '',
    note: '', debut: '', memberIds: [], workIds: [], average: null, ratedCount: 0,
    ...patch,
  };
}

export function member(id: string, patch: Partial<Member> = {}): Member {
  return {
    id, name: 'TEST ONLY Member ' + id, cnName: '', stageName: 'TEST ONLY ' + id,
    groupIds: [], photo: null, favorite: null, note: '', profile: '', status: '',
    country: '', role: '', officialUrl: '', birthDate: '', ...patch,
  };
}

export function stage(
  patch: Partial<NonNullable<Work['stage']>> = {},
): NonNullable<Work['stage']> {
  return {
    videoId: 'TEST_ONLY_STAGE', url: 'https://video.example/test-only-stage',
    title: 'TEST ONLY complete stage', channel: 'TEST ONLY channel',
    kind: 'TEST ONLY stage', publishedDate: '', typeNote: '',
    sourceUrl: 'https://source.example/test-only-stage', scoreBinding: null,
    likes: { value: null, display: '', precision: 'unknown' },
    checkedAt: '2026-10-16', selectionNote: 'TEST ONLY', candidateCount: 0,
    candidates: [], ...patch,
  };
}

export function work(id: string, patch: Partial<Work> = {}): Work {
  return {
    id, name: 'TEST ONLY Work ' + id, song: 'TEST ONLY Song ' + id,
    groupIds: [], url: '', score: null, stageScore: null, stage: null,
    stageResearch: { status: 'pending', reason: 'TEST ONLY', checkedAt: null },
    note: '', watched: '', videoType: '', version: '', releaseDate: '',
    verification: '', officialTitle: '', channel: '', ratingIds: [], source: '',
    ...patch,
  };
}

export function rating(id: string, patch: Partial<RatingView> = {}): RatingView {
  return {
    id, name: 'TEST ONLY Rating ' + id, memberIds: [], workIds: [],
    score: null, stylingScore: null, memory: '', note: '', photo: null,
    verification: '', source: '', recognition: '', ...patch,
  };
}

export interface CatalogParts {
  groups?: Group[];
  members?: Member[];
  works?: Work[];
  ratings?: RatingView[];
}

export function catalog(parts: CatalogParts = {}): CatalogView {
  const groups = parts.groups ?? [];
  const members = parts.members ?? [];
  const works = parts.works ?? [];
  const ratings = parts.ratings ?? [];
  const scores = works.map((item) => item.score).filter((value): value is number => (
    typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 10
  ));
  return {
    mode: 'snapshot', capturedAt: '2026-10-16T00:00:00.000Z',
    loadedAt: '2026-10-16T00:00:00.000Z', warning: null,
    groups, members, works, ratings,
    counts: {
      groups: groups.length, members: members.length, works: works.length,
      ratings: ratings.length, ratedWorks: scores.length,
      scoreSum: scores.reduce((sum, value) => sum + value, 0),
    },
  };
}

/** Deliberately malformed runtime field; never casts an entire catalog. */
export function rawField<T extends object, K extends keyof T>(
  record: T, key: K, value: unknown,
): T {
  const copy = { ...record };
  Object.defineProperty(copy, key, {
    value, enumerable: true, configurable: true, writable: true,
  });
  return copy;
}

/** Freezes values without invoking accessors. */
export function deepFreeze<T>(value: T, seen: WeakSet<object> = new WeakSet()): T {
  if (value === null || (typeof value !== 'object' && typeof value !== 'function')) return value;
  if (seen.has(value)) return value;
  seen.add(value);
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor && 'value' in descriptor) deepFreeze(descriptor.value, seen);
  }
  return Object.freeze(value);
}

/** Privacy oracle: accidental access fails instead of returning fake content. */
export function forbidRead(record: object, keys: readonly PropertyKey[]): void {
  for (const key of keys) {
    Object.defineProperty(record, key, {
      enumerable: true, configurable: true,
      get() { throw new Error('TEST ONLY forbidden personal field read: ' + String(key)); },
    });
  }
}
