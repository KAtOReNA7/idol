import type {Catalog,CatalogView,RatingView} from './types';
import {personalMvPhoto} from './member-works';
import {AppError} from './feishu';

export function requestedBrowserCatalog(params:URLSearchParams):boolean{
 const shapes=params.getAll('shape');
 if(!shapes.length)return false;
 if(shapes.length!==1||shapes[0]!=='display-v1')throw new AppError('INVALID_CATALOG_SHAPE','请刷新页面后重试。',400);
 return true;
}

// Only the authenticated response is reduced. Never mutate the shared native
// cache, source rows, evidence or complete export. Evaluate the exact same
// personal-photo rule before dropping text that the interface does not display.
export function projectBrowserCatalog(catalog:Catalog):CatalogView{
 const ratings:RatingView[]=catalog.ratings.map(row=>{
  // Never trust a pre-existing transport flag as source evidence.
  const {personalPhotoEligible:unusedDecision,...sourceRow}=row as RatingView;
  const personalPhotoEligible=!!personalMvPhoto(sourceRow,row.memberIds[0]??'',row.workIds[0]??'');
  const {recognition:unusedRecognition,source:unusedSource,...view}=sourceRow;
  // New look-photo projection already contains only minimal display identity.
  // Keep its original reference only when that reference independently passes
  // the personal-MV rule; never inherit eligibility from the primary photo.
  if(sourceRow.photo?.sourceKind==='mv_look_photo'&&sourceRow.referencePhoto){
   const referencePhoto=personalMvPhoto({...sourceRow,photo:sourceRow.referencePhoto},row.memberIds[0]??'',row.workIds[0]??'');
   const {referencePhoto:unusedReference,...withoutReference}=view;
   return {...withoutReference,...(referencePhoto?{referencePhoto}:{}),personalPhotoEligible};
  }
  return {...view,personalPhotoEligible};
 });
 return {...catalog,ratings};
}
