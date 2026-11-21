import editions from '../../data/mv-recognition-editions.json';

type Portrait = {preview: string; original: string; sourceUrl: string; label?: string};
export type RecognitionEditionPhoto = Portrait & {label: string};
type Edition = {
  label: string;
  portraits: Record<string, Portrait>;
  works: {workId: string; videoId: string; memberIds: string[]; label?: string}[];
};

const byWork = new Map<string, {portraits: Edition['portraits']; videoId: string; members: Set<string>; label: string}>();
for (const edition of Object.values(editions) as Edition[]) {
  for (const work of edition.works) {
    byWork.set(work.workId, {
      portraits: edition.portraits,
      videoId: work.videoId,
      members: new Set(work.memberIds),
      label: work.label ?? edition.label,
    });
  }
}

/** The caller supplies the already validated original MV/member binding. */
export function mvRecognitionEdition(original: {workId: string; videoId: string; memberId: string}): RecognitionEditionPhoto | null {
  const entry = byWork.get(original.workId);
  if (!entry || entry.videoId !== original.videoId || !entry.members.has(original.memberId)) return null;
  const portrait = entry.portraits[original.memberId];
  return portrait ? {...portrait, label: portrait.label ?? entry.label} : null;
}
