import stageVideos from '@/data/stage-videos.json';
import research from '@/data/stages/status.json';
import {videoId} from './values';
import {stageSourceKey,stageHasValidBinding} from './stage-source';
import type {StageVideo,StageResearch} from './types';
// Editorial source metadata is keyed by the stable original work ID.
// It never creates Feishu records or changes user ratings, notes, or links.
export function stageForWork(recordId:string):StageVideo|null {
 const entry=(stageVideos as Record<string,StageVideo>)[recordId];
 if(!entry||videoId(entry.url)!==entry.videoId||!entry.checkedAt||!stageSourceKey(entry))return null;
 return entry;
}
export const stageSourceMetadata=stageVideos;
export const stageResearchMetadata=research;
export function stageResearchForWork(recordId:string):StageResearch {
 return (research.works as Record<string,StageResearch>)[recordId]??{status:'pending',reason:'这条新作品尚未完成舞台来源检索。',checkedAt:null};
}

export function stageScoreIsBound(stage:StageVideo|null):boolean { return stageHasValidBinding(stage); }
