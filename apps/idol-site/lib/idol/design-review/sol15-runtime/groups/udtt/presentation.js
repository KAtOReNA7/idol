/** Public display only. Research descriptions, verification methods and source
 * notes remain intact on artist; they are never treated as public introductions.
 * A future introduction must be explicitly reviewed and added by exact work key. */
const reviewedWorkIntroductions = Object.freeze({});
export function publicWorkDescription(work) {
  const key = work?.id ?? work?.candidateKey;
  return Object.hasOwn(reviewedWorkIntroductions, key) ? reviewedWorkIntroductions[key] : null;
}
/** Merge the two existing member-source lists by exact URL, without altering
 * stored facts or source-ID/URL pairs. Publisher names are concise public labels. */
export function publicSources(items = []) {
  const seen = new Set();
  return items.flatMap(item => {
    const source = typeof item === 'string' ? {url:item,label:'来源'} : item;
    if (!source?.url || seen.has(source.url)) return [];
    let url; try {url = new URL(source.url);} catch {return [];}
    if (!['https:','http:'].includes(url.protocol)) return [];
    seen.add(source.url);
    return [{...source,label:source.publisher || source.label || source.title || '来源'}];
  });
}
export function publicMemberSources(member) {
  return publicSources([...(member.sources ?? []),...(member.careerSources ?? [])]);
}
/** The main video CTA already carries this exact source. Do not repeat it. */
export function publicWorkSources(work, videoHref) {
  const primary = work.videoId ? videoHref(work.videoId) : null;
  return publicSources(work.sources).filter(source => source.url !== primary);
}
