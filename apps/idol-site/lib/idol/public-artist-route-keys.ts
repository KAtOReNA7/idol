import navigation from '../../data/public-artist-navigation-keys.json';

/** ID-only data: no public display catalog, private records, router or I/O imports. */
export type PublicArtistSlug = keyof typeof navigation.groups;
export type PublicMediaKind = 'mv' | 'stage';
export const publicArtistExtensionParams = ['unit', 'participant', 'sort', 'rosterView', 'year', 'event'] as const;

export function publicArtistKeys(slug: string) {
  return Object.hasOwn(navigation.groups, slug) ? navigation.groups[slug as PublicArtistSlug] : null;
}

export function publicArtistKeysForPath(path: string) {
  return Object.values(navigation.groups).find(group => group.path === path) ?? null;
}

/** Additional finite constraints underneath the existing canonical sanitizer.
 * Unrelated artists retain their original schema and cannot receive new fields.
 * Existing tripleS release + format/reader URLs remain valid for its old reader.
 */
export function validPublicArtistRoute(value: string, url: URL): boolean {
  const group = publicArtistKeysForPath(url.pathname);
  const params = url.searchParams;
  if (!group) return !publicArtistExtensionParams.some(key => params.has(key));
  if (!value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u0020]/.test(value)) return false;
  if (url.origin !== 'https://site.invalid' || value.includes('#') || value.split('?')[0] !== url.pathname) return false;
  const triples = url.pathname === navigation.groups.triples.path;
  const section = params.get('section') ?? 'overview';
  const member = params.get('member');
  const reader = params.get('reader');
  const release = params.get('release');
  const media = params.get('media');
  if (params.has('member') && (!member || !group.memberIds.includes(member))) return false;
  if (params.has('reader') && (!triples || !reader || !group.memberIds.includes(reader))) return false;
  if (params.has('release')) {
    if (!release || !group.releases.includes(release) || params.has('media') || !triples && params.has('member')) return false;
    // Sol's new release detail is works-only. The released tripleS reader also
    // keeps release while opening a participant member; retain that back context.
    if (!triples && (section !== 'works' || params.has('format'))) return false;
  }
  if (params.has('media')) {
    const matches = group.media.filter(entry => entry.key === media && entry.kind === params.get('format'));
    if (section !== 'works' || params.has('member') || params.has('release') || matches.length !== 1) return false;
  }
  if (params.has('unit') && (!triples || !['members', 'works'].includes(section) || !group.units.includes(params.get('unit')!))) return false;
  if (params.has('participant') && (!triples || section !== 'works' || params.has('format') || params.has('member') || !group.memberIds.includes(params.get('participant')!))) return false;
  if (params.has('sort') && (!triples || section !== 'works' || !['newest', 'oldest'].includes(params.get('sort')!))) return false;
  if (params.has('rosterView') && (!triples || section !== 'members' || !['members', 'units'].includes(params.get('rosterView')!))) return false;
  if (params.has('year') && (section !== 'updates' || !group.years.includes(params.get('year')!))) return false;
  if (params.has('event')) {
    const event = group.events.find(entry => entry.id === params.get('event'));
    if (section !== 'updates' || !event || params.has('year') && event.year !== params.get('year')) return false;
  }
  return true;
}
