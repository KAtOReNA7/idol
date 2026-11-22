import {approvedStagePoster, stagePreviewFallback, workReferencePoster} from './approved-video-poster';
import {stageKindLabel} from './stage-display';
import type {Work} from './types';
import {videoId} from './values';

function publicStage(work:Work) {
  const stage=work.stage;
  if (!stage && !work.stageSupplement?.alternatives.length) return null;
  const poster=stage ? approvedStagePoster(work.id,stage) ?? stagePreviewFallback(work,stage,true) : workReferencePoster(work);
  return {
    videoId:stage?.videoId??'', action:stage?'看舞台':'其他现场',
    detail:stage?[stageKindLabel(stage.kind),stage.channel,stage.publishedDate].filter(Boolean).join(' · '):'其他现场 · 仅供观看',
    poster:poster?.src??'', posterLabel:poster?.label??'', workReference:!!poster?.workReference,
    sameVideo:!!stage?.reusesOriginalVideo,
  };
}

export function kiofDirectoryRecord(work:Work) {
  return {
    id:work.id, name:work.name, song:work.song, officialTitle:work.officialTitle, version:work.version,
    videoType:work.videoType, releaseDate:work.releaseDate, videoId:videoId(work.url)??'', stage:publicStage(work),
  };
}
