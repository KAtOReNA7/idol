import editions from '../../data/mv-recognition-editions.json';

type Portrait = {preview: string; original: string; sourceUrl: string};
export type RecognitionEditionPhoto = Portrait & {label: string};
type Edition = {
  label: string;
  portraits: Record<string, Portrait>;
  works: {workId: string; videoId: string; memberIds: string[]}[];
};

const byWork = new Map<string, {edition: Edition; videoId: string; members: Set<string>}>();
for (const edition of Object.values(editions) as Edition[]) {
  for (const work of edition.works) {
    byWork.set(work.workId, {edition, videoId: work.videoId, members: new Set(work.memberIds)});
  }
}

/** The caller supplies the already validated original MV/member binding. */
export function mvRecognitionEdition(original: {workId: string; videoId: string; memberId: string}): RecognitionEditionPhoto | null {
  const entry = byWork.get(original.workId);
  if (!entry || entry.videoId !== original.videoId || !entry.members.has(original.memberId)) return null;
  const portrait = entry.edition.portraits[original.memberId];
  return portrait ? {...portrait, label: entry.edition.label} : null;
}
