import type {Work} from '@/lib/idol/types';
import {videoId} from '@/lib/idol/values';
import {stageSourceKey,stageHasValidBinding} from '@/lib/idol/stage-source';
export const TRACER_GROUP_ID='rec28ldfRTiDBG';
export type TracerVideo={id:string;type:string;videoId:string};
/** A native score belongs to a record AND a video slot, never just a song title. */
export function tracerNativeBinding(item:TracerVideo,works:readonly Work[]){
 const work=works.find(row=>row.id===item.id&&row.groupIds.includes(TRACER_GROUP_ID));
 if(!work)return null;
 const stage=item.type==='STAGE';
 if((stage?work.stage?.videoId:videoId(work.url))!==item.videoId)return null;
 if(stage&&stageSourceKey(work.stage)!==item.videoId)return null;
 const scoreBindingValid=!stage||stageHasValidBinding(work.stage);
 return {work,stage,scoreBindingValid,score:stage?(scoreBindingValid?work.stageScore:null):work.score};
}
