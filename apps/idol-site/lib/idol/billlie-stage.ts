import type {Work} from './types';
import {stageSourceKey,stageHasValidBinding} from './stage-source';
import {videoId} from './values';
/** Display only: never changes a saved score or substitutes an MV score. */
export function billlieStageScore(work:Work){
 const stage=work.stage;
 const valid=!!stage&&!!stageSourceKey(stage)&&videoId(stage.url)===stage.videoId&&stageHasValidBinding(stage);
 return {valid,score:valid?work.stageScore:null};
}
