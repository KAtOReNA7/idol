export type CareerStatus={recorded:number;applied:number;total:number;complete:boolean;interrupted?:boolean;rows:{memberId:string;state:string;rollbackEligible:boolean;conflictReason:string|null}[]};
/** A single confirmed action runs bounded server chunks; never retry an unknown result. */
export async function runCareerChunks(action:'apply'|'rollback',send:()=>Promise<CareerStatus>,onStatus:(s:CareerStatus)=>void,signal:AbortSignal){
 let previous=-1;
 while(!signal.aborted){const status=await send();if(signal.aborted)return;onStatus(status);
  if(status.interrupted||status.rows.some(r=>r.state==='conflict'&&(action==='apply'||!r.rollbackEligible)))return;
  const progress=action==='apply'?status.applied:status.rows.filter(r=>r.state==='rolled_back').length;
  if(progress===previous)return;previous=progress;
  if(action==='apply'?(status.complete||status.rows.some(r=>r.state==='rolled_back')||!status.rows.some(r=>r.state==='pending')):!status.rows.some(r=>r.rollbackEligible))return;
 }
}
