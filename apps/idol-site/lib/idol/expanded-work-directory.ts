import {cachedVideoPreview, publicMvCover, wholePreviewVideoId} from './mv-public-covers';
import {stageKindLabel} from './stage-display';
import {formatStageTime, stageSourceKey, stageSourceMatchesUrl} from './stage-source';
import type {Work} from './types';
import {videoId} from './values';

export type DirectoryStage = {
  key: string;
  title: string;
  channel: string;
  date: string;
  kind: string;
  poster: string;
  workReference: boolean;
  viewOnly: boolean;
  versionNote: string;
  originalWorkId: string;
};
export type DirectoryWork = {
  id: string;
  name: string;
  song: string;
  officialTitle: string;
  videoType: string;
  version: string;
  releaseDate: string;
  videoId: string;
  stage: DirectoryStage | null;
};

function stagePreview(work: Work, upload: string | null) {
  if (upload) return {poster: cachedVideoPreview(upload) ?? 'https://i.ytimg.com/vi/'+upload+'/hqdefault.jpg', workReference: false};
  return {poster: publicMvCover(work.id, videoId(work.url))?.src ?? '', workReference: true};
}

function directoryStage(work: Work): DirectoryStage | null {
  const stage = work.stage;
  if (stage) {
    const key = stageSourceKey(stage);
    if (key && stageSourceMatchesUrl(stage)) {
      const variant = stage.sameSongFallback;
      const kind = stageKindLabel(stage.kind);
      const clip = stage.clip && formatStageTime(stage.clip.startSeconds)+'–'+formatStageTime(stage.clip.endSeconds);
      return {
        key, title: stage.title, channel: stage.channel, date: stage.publishedDate,
        kind: [kind, stage.bilibili && '第 '+stage.bilibili.page+' 段', clip].filter(Boolean).join(' · '),
        ...stagePreview(work, !stage.clip && (stage.platform ?? 'youtube') === 'youtube' ? wholePreviewVideoId(stage.url) : null),
        viewOnly: false, originalWorkId: variant?.sourceWorkId ?? '',
        versionNote: variant?.version === 'different' ? '演出版本为《'+variant.performedSong+'》。'
          : variant?.version === 'unconfirmed' ? '此场演出的录音版本未确定。' : stage.memberVersionFallback?.guestDifference ?? '',
      };
    }
  }
  const other = work.stageSupplement?.alternatives[0];
  if (!other || other.scorePolicy !== 'view_only') return null;
  const upload = other.platform === 'youtube' && wholePreviewVideoId(other.url) === other.sourceId ? other.sourceId : null;
  // Only a verified complete upload can share a card across records. Other providers
  // may put several performances or edits behind the same URL.
  const key = upload && other.completeness === 'full' ? upload : 'alternative:'+work.id+':'+other.id;
  return {
    key, title: other.title, channel: other.channel, date: other.eventDate ?? '',
    kind: other.performanceType === 'official_group_fancam' ? '官方全团直拍' : stageKindLabel(other.kind),
    ...stagePreview(work, upload), viewOnly: true, originalWorkId: '',
    versionNote: other.version.match === 'unconfirmed' ? '此场演出的录音版本未确定。' : '',
  };
}

// This is the entire anonymous first-response projection. Live scores, notes,
// ratings and viewing history stay on the authenticated catalog path.
export function directoryWork(work: Work): DirectoryWork {
  return {
    id: work.id, name: work.name, song: work.song, officialTitle: work.officialTitle, videoType: work.videoType,
    version: work.version, releaseDate: work.releaseDate, videoId: videoId(work.url) ?? '', stage: directoryStage(work),
  };
}

export function directoryWorkMatches(work: DirectoryWork, query: string) {
  return [work.song, work.name, work.version, work.videoType, work.officialTitle].join(' ').toLowerCase().includes(query.trim().toLowerCase());
}

export function directoryPerformances(records: DirectoryWork[], query: string) {
  const groups = new Map<string, DirectoryWork[]>();
  for (const work of records) {
    if (!work.stage) continue;
    const matches = groups.get(work.stage.key);
    if (matches) matches.push(work);
    else groups.set(work.stage.key, [work]);
  }
  const needle = query.trim().toLowerCase();
  return [...groups.values()].flatMap(group => {
    const original = group.find(record => group.some(w => w.stage?.originalWorkId === record.id));
    // Two edits may both bind an original performance without alternate-version metadata.
    const works = group.sort((a,b) => Number(a.stage!.viewOnly) - Number(b.stage!.viewOnly)
      || Number(b === original) - Number(a === original) || a.releaseDate.localeCompare(b.releaseDate) || a.id.localeCompare(b.id));
    const stage = works[0].stage!;
    const programMatch = [stage.title, stage.channel, stage.date, stage.kind].join(' ').toLowerCase().includes(needle);
    return programMatch || works.some(work => directoryWorkMatches(work,query)) ? [{stage, works}] : [];
  });
}
