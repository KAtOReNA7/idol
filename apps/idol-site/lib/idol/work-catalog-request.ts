import type {CatalogView} from './types';

const recordId = /^rec[A-Za-z0-9]{1,80}$/;
const detailPrefix = 'work-detail=';

export function validDetailWork(id: string | null): string | null {
  return id && recordId.test(id) ? id : null;
}

export function workCatalogHeaders(workId: string | null) {
  const id = validDetailWork(workId);
  return {Prefer: id ? 'omit-stage-candidates, ' + detailPrefix + id : 'omit-stage-candidates'};
}

export function preferredDetailWork(header: string | null): string | null {
  const targets = (header ?? '').split(',').map(value => value.trim()).filter(value => value.startsWith(detailPrefix));
  return targets.length === 1 ? validDetailWork(targets[0].slice(detailPrefix.length)) : null;
}

export function catalogCoversRoute(catalog: CatalogView | null, workId: string | null): boolean {
  return !!catalog && (!catalog.scope || (catalog.scope.type === 'work' && catalog.scope.workId === workId));
}
