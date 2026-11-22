export const BEWAVE_GROUP_ID='rec28ldfRTiDh1';

/** The debut performance video and the later Live Clip are separate recordings. */
export function bewaveFilmVersion(workId:string, source:string|null, stage:boolean) {
 if(workId!=='rec28ldfRTrGEy')return null;
 if(!stage&&source==='BbcxmtNaesk')return {label:'Performance Video · 表演版 MV',date:'2024-04-17'};
 if(stage&&source==='j1a4xi__JgE')return {label:'Live Clip',date:'2024-04-22'};
 return null;
}
