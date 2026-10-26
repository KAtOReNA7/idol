import {approvedArchiveCheckpoints} from './approved-archive-checkpoints';
import {continueArchive} from './archive-continuation';
import {currentArchiveBudget} from './archive-budget';
import {nativeDb} from './native-storage';
export async function advanceApprovedCheckpoint(userId:string,id:string){
 // Publication of a real verified report is an explicit administrative approval.
 // The existing mutating step API does not accept hidden payloads or auto-expand.
 const phase=(await currentArchiveBudget(id))?.phase??0;
 for(const checkpoint of approvedArchiveCheckpoints){
  if(checkpoint.id!==id||checkpoint.completedPhase!==phase||checkpoint.nextPhase!==phase+1)continue;
  const used=await nativeDb().prepare('SELECT id FROM idol_archive_phases WHERE id=?').bind(checkpoint.operationId).first();
  if(used)continue;
  return continueArchive(userId,id,checkpoint.operationId,checkpoint.report);
 }
 return null;
}
