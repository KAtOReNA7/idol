export const libraryFormats = [
  ['all', '全部'],
  ['mv', 'MV'],
  ['stage', '舞台'],
  ['release', '发行'],
] as const;

export type LibraryFormat = typeof libraryFormats[number][0];

export function libraryCounts(works: ReadonlyArray<{type: string}>, releases: readonly unknown[]): Record<LibraryFormat, number> {
  return {
    all: works.length + releases.length,
    mv: works.filter(work => work.type === 'MV').length,
    stage: works.filter(work => work.type === 'STAGE').length,
    release: releases.length,
  };
}

const releaseFilterPaths = new Set([
  '/artists/adya', '/artists/witchx', '/artists/geenius', '/artists/oddyouth',
  '/artists/tracer', '/artists/spia', '/artists/youngposse', '/artists/bewave',
  '/artists/candyshop', '/artists/genblue', '/artists/billlie',
]);

export function supportsReleaseFilter(path: string) {
  return releaseFilterPaths.has(path);
}

export function libraryResultLabel(format: string, videos: number, releases: number) {
  if (format === 'release') return `${releases} 张发行`;
  if (format === 'all') return `${videos} 个影像 · ${releases} 张发行`;
  return `${videos} 个影像`;
}
