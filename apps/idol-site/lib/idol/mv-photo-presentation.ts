import type {Photo} from './types';

export const MV_LOOK_PHOTO_LABEL='本MV同造型照片';
export function mvPhotoLabel(photo:Photo|null|undefined,fallback:string){
 return photo?.sourceKind==='mv_look_photo'?MV_LOOK_PHOTO_LABEL:fallback;
}
// referencePhoto is independently qualified by the catalog projection. Keep its
// stable attachment index and reject misplaced portrait/primary references here.
export function mvReferencePhoto(primary:Photo|null|undefined,reference:Photo|null|undefined):Photo|null{
 if(primary?.sourceKind!=='mv_look_photo'||primary.table!=='ratings'||!reference||reference.table!=='ratings'||reference.recordId!==primary.recordId||reference.fieldId!==primary.fieldId||reference.index===primary.index||!Number.isInteger(reference.index)||reference.index<0||reference.sourceKind==='mv_look_photo')return null;
 if(/档案|资料|概念|宣传|拼图|合照/.test(reference.kind??''))return null;
 return reference;
}
export function privatePhotoSource(photo:Photo){
 return `/api/media?table=${photo.table}&record=${encodeURIComponent(photo.recordId)}&index=${photo.index}`;
}
