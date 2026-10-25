import {AppError} from './feishu';
import {mvMemberAbsence} from './mv-member-appearance';

/** Resolve current source records on the server; browser claims are not authority. */
export async function assertMemberScoreAllowed(values:unknown,workIds:string[],loadWork:(id:string)=>Promise<{id:string;url:string}>){
 if(!values||typeof values!=='object'||!['score','stylingScore'].some(key=>Object.hasOwn(values,key)))return;
 for(const id of new Set(workIds)){
  const work=await loadWork(id);
  if(mvMemberAbsence(work))throw new AppError('MV_HAS_NO_MEMBERS','这支MV没有成员真人出镜，仅可为MV评分；原有成员记录保持不变。',409);
 }
}
