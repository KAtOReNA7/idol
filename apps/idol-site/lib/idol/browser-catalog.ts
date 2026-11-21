import type {Catalog,CatalogView,RatingView} from './types';
import {personalMvPhoto} from './member-works';
import {AppError} from './feishu';

export function withoutStageCandidates(view: CatalogView): CatalogView {
 const works = view.works.map(work => {
  if (!work.stage?.candidates) return work;
  const stage = {...work.stage};
  delete stage.candidates;
  return {...work, stage};
 });
 return {...view, works};
}

export function requestedBrowserCatalog(params:URLSearchParams):boolean{
 const shapes=params.getAll('shape');
 if(!shapes.length)return false;
 if(shapes.length!==1||shapes[0]!=='display-v1')throw new AppError('INVALID_CATALOG_SHAPE','请刷新页面后重试。',400);
 return true;
}

const videoLabels:Record<string,string>={
 exclusive_performance_video:'特别表演视频',ost_promotion_video:'原声带宣传片',special_film:'特别短片',
 member_collaboration_mv:'成员合作 MV',ost_mv:'原声带 MV','performance video':'表演视频',
 'performance video (Part.1)':'表演视频（上篇）','Brand MV':'品牌 MV','Special Video (Full ver.)':'特别影像（完整版）',
 'MV (Our Summer Memories version)':'MV（Our Summer Memories 版）',
 'publisher-produced performance video (MAPSQUARE Music)':'MAPSQUARE Music 制作表演视频','live clip (MEN CONCERT)':'MEN CONCERT 现场片段',
};
function videoLabel(value:string){
 return Object.hasOwn(videoLabels,value)?videoLabels[value]:/^[a-z]+(?:_[a-z]+)+$/.test(value)?'音乐影像':value;
}

// Only the authenticated response is reduced. Never mutate the shared native
// cache, source rows, evidence or complete export. Evaluate the exact same
// personal-photo rule before dropping text that the interface does not display.
export function projectBrowserCatalog(catalog:Catalog):CatalogView{
 // HI-HAT confirmed all six members moved on November 2. Only replace the
 // superseded snapshot value; newer owner edits and raw exports keep their values.
 const oldIfeye=catalog.groups.find(group=>group.id==='rec28ldfRTiCGa'&&group.company==='Hi-Hat Entertainment');
 const groups=oldIfeye?catalog.groups.map(group=>group===oldIfeye
  ?{...group,company:'초록뱀뮤직',officialUrl:group.officialUrl||'https://artist.mnetplus.world/main/stg/ifeye'}
  :group):catalog.groups;
 let worksChanged=false;
 const works=catalog.works.map(work=>{
  const videoType=videoLabel(work.videoType);
  const supplement=work.stageSupplement,originalNote=supplement?.researchNote;
  const summary=supplement?.viewingNote||'节目与发行资料';
  const changeNote=originalNote&&summary!==originalNote.summary;
  const tags=work.versionDisplay?.tags.map(videoLabel);
  const changeTags=tags?.some((tag,index)=>tag!==work.versionDisplay?.tags[index]);
  if(videoType===work.videoType&&!changeNote&&!changeTags)return work;
  worksChanged=true;
  return {...work,videoType,...(changeNote?{stageSupplement:{...supplement,researchNote:{...originalNote,summary}}}:{}),
   ...(changeTags&&work.versionDisplay?{versionDisplay:{...work.versionDisplay,tags:[...new Set(tags)]}}:{})};
 });
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
 return {...catalog,groups,works:worksChanged?works:catalog.works,ratings};
}
