import type {Catalog, PersonalMvRating, Work} from './types';
import {publicCreditForWork} from './public-work-credits';

export function findDetailWork(data: Pick<Catalog, 'works'>, requestedId: string | null): Work | null {
  if (!requestedId) return null;
  const matches = data.works.filter(work => work.id === requestedId);
  return matches.length === 1 ? matches[0] : null;
}

// A version button checks its target's identity and placeholder status before navigating.
// Following it requests that work's own complete cast and score records.
export function projectWorkCatalog(data: Catalog, work: Work, personal: PersonalMvRating[] = []): Catalog {
  const workId = work.id;
  const workIds = new Set([workId, ...(work.versionDisplay?.links.map(link => link.workId) ?? [])]);
  const works = data.works.filter(item => workIds.has(item.id));
  const ratings = data.ratings.filter(row => row.workIds.includes(workId));
  const memberIds = new Set([
    ...(publicCreditForWork(work)?.memberIds ?? []),
    ...ratings.flatMap(row => row.memberIds),
    ...personal.filter(row => row.workId === workId).map(row => row.memberId),
  ]);
  const members = data.members.filter(member => memberIds.has(member.id) ||
    [...member.groupIds, ...(member.formerGroupIds ?? [])].some(id => work.groupIds.includes(id)));
  const groupIds = new Set([...works.flatMap(item => item.groupIds),
    ...members.flatMap(member => [...member.groupIds, ...(member.formerGroupIds ?? [])])]);
  const groups = data.groups.filter(group => groupIds.has(group.id));
  const rated = works.filter(item => item.score !== null);
  return {...data, scope: {type: 'work', workId}, works, ratings, members, groups, counts: {
    works: works.length, groups: groups.length, members: members.length,
    ratings: ratings.filter(row => row.memberIds.length && row.workIds.length).length,
    ratedWorks: rated.length, scoreSum: rated.reduce((sum, item) => sum + item.score!, 0),
  }};
}
