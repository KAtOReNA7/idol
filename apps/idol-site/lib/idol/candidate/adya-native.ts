import type {Work} from '@/lib/idol/types';
import {videoId} from '@/lib/idol/values';
import {stageSourceKey,stageHasValidBinding} from '@/lib/idol/stage-source';
export const ADYA_GROUP_ID='rec28ldfRTiDtr';
export type AdyaVideo={id:string;type:string;videoId:string};
/** A native score belongs to a record AND a video slot, never just a song title. */
export function adyaNativeBinding(item:AdyaVideo,works:readonly Work[]){
 const work=works.find(row=>row.id===item.id&&row.groupIds.includes(ADYA_GROUP_ID));
 if(!work)return null;
 const stage=item.type==='STAGE';
 if((stage?work.stage?.videoId:videoId(work.url))!==item.videoId)return null;
 if(stage&&stageSourceKey(work.stage)!==item.videoId)return null;
 const scoreBindingValid=!stage||stageHasValidBinding(work.stage);
 return {work,stage,scoreBindingValid,score:stage?(scoreBindingValid?work.stageScore:null):work.score};
}
