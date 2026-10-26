import {AppError} from './feishu';
// Application-only admission bound. This does not alter provider storage quota.
export const PHOTO_UPLOAD_HARD_LIMIT=3_000_000;
export function photoRegistryBudget(candidates:readonly {id:string;byteLength:number}[]){
 const ids=new Set<string>();let total=0;
 for(const c of candidates){
  if(typeof c.id!=='string'||!c.id||ids.has(c.id)||!Number.isSafeInteger(c.byteLength)||c.byteLength<=0||c.byteLength>PHOTO_UPLOAD_HARD_LIMIT||!Number.isSafeInteger(total+c.byteLength))throw new AppError('PHOTO_REGISTRY_INVALID','图片批次资料无效，已暂停加入。',503);
  ids.add(c.id);total+=c.byteLength;
 }
 return total;
}
