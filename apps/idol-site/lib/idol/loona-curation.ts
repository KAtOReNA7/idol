import type {Work} from './types';
import type {CandidatePortrait} from './candidate/types';
// Page-local addition: index/current roster and the prior eleven portrait bindings stay intact.
export const loonaHistoricalPortraits: Record<string, CandidatePortrait> = {
  recvxyICzHTm4b: {image: '/artist/loona/approved-home/chuu.jpg', stageName: 'CHUU', sourceUrl: 'https://www.universal-music.co.jp/loona/biography/', credit: 'Universal Music Japan · 历史成员资料照'},
};
// Exact decoded file dimensions, keyed by the unmodified static source path.
// Unknown runtime member/MV images deliberately receive no inferred geometry.
const staticImageDimensions: Record<string, {width: number; height: number}> = {
  '/artist/loona/approved-home/unit-13.jpg': {width: 1000, height: 684},
  '/artist/loona/approved-home/unit-oec.jpg': {width: 1000, height: 667},
  '/artist/loona/approved-home/unit-yyxy.jpg': {width: 1000, height: 695},
  '/artist/loona/approved-home/chuu.jpg': {width: 800, height: 1200},
  '/artist/loona/batch-b-20261016-webp-v1/hero-display.webp': {width: 1576, height: 1051},
};
export function loonaImageDimensions(src: string | null | undefined) {
  return src && Object.hasOwn(staticImageDimensions, src) ? staticImageDimensions[src] : undefined;
}
export const LOONA_GROUP_ID = 'recvxyEBDZJAXm';
// Publicly reviewed identities. No lookup by title or array position.
const selections = [
  {id: 'recvxyOz5X7Pt4', song: 'Hi High', url: 'https://www.youtube.com/watch?v=846cjX0ZTrk', label: '完整体出道作品 / + +', description: '个人与分队之后，回到完整体的起点。'},
  {id: 'recvxyOz5X7G95', song: 'Butterfly', url: 'https://www.youtube.com/watch?v=XEOCbFJjRw0', label: 'X X / 新增曲重版', description: '从《+ +》走入下一张作品，继续完整体发行主线。'},
  {id: 'recvxyOz5XEgYP', song: 'HULA HOOP', url: 'https://www.youtube.com/watch?v=tnpUv1Vj5MA', label: '日本出道单曲', description: '日本出道单曲《HULA HOOP》。'},
] as const;
export function loonaSelectedWorks(works: readonly Work[]) {
  return selections.flatMap(entry => {
    const matches = works.filter(work => work.id === entry.id);
    if (matches.length !== 1) return [];
    const work = matches[0];
    return work.groupIds.includes(LOONA_GROUP_ID) && work.song === entry.song && work.url === entry.url ? [{...entry, work}] : [];
  });
}
