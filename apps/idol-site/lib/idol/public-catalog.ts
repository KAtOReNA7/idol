import type {CatalogView} from './types';

// Server-only output boundary. This does not authorize reads or accept a user ID.
// Call ONLY after selecting the current project snapshot through a dedicated
// public reader. Never feed raw tables, backups, journals or arbitrary objects.
type Shape = true | {readonly [key:string]:Shape} | readonly [Shape];
const fields=(keys:string):Record<string,Shape>=>Object.fromEntries(keys.split(' ').map(key=>[key,true]));
const ids:Shape=[true];
const evidence:Shape={};
const likes:Shape=fields('value display precision');
const social:Shape=[fields('platform url subjectName countLabel observedAt')];
const photo:Shape={...fields('table recordId index kind sourceKind'),
 displayFocus:{...fields('sourceWidth sourceHeight qualityTier maxEffectiveWidth preserveOriginal'),sourceCrop:fields('x y width height')},
 approvedLookIdentity:fields('memberId workId videoId sameLook'),nativeIdentity:fields('memberId workId videoId')};
const stage:Shape={...fields('sourceClass platform completeness likesScope videoId url title channel kind publishedDate checkedAt reusesOriginalVideo comparisonLimited comparisonLimitation candidateCount'),
 clip:{...fields('startSeconds endSeconds sourceDurationSeconds'),evidence},
 audioEquivalence:{...fields('originalBoundWorkId sameAudio')},
 scoreBinding:fields('videoId sourceKey initializedAt initialScore'),likes,
 higherCandidate:{...fields('videoId url title checkedAt'),likes},candidates:[fields('title url likesDisplay kind')]};
const version:Shape={match:true,differences:ids,evidence};
const supplement:Shape={
 alternatives:[{...fields('id platform sourceId sourceClass performerScope originalPerformerScope completeness durationSeconds durationScope eventDate url title channel performanceType kind checkedAt scorePolicy'),performerNames:ids,originalPerformerNames:ids,performerEvidence:evidence,eventEvidence:evidence,sourceEvidence:evidence,sameSongEvidence:evidence,version}],
 watchLeads:[{...fields('sourceType id platform sourceId sourceClass performerScope completeness url title channel kind checkedAt scorePolicy reason leadTimeSeconds'),sourceEvidence:evidence,sameSongEvidence:evidence,leadTimeEvidence:evidence}],
 };
const shape:Shape={
 scope:fields('type groupId'),cache:fields('source refreshRecommended'),...fields('mode capturedAt loadedAt'),
 groups:[{...fields('id name generation company country note debut average ratedCount currentName status officialUrl channelUrl'),memberIds:ids,workIds:ids,social,milestones:[fields('id kind title valueLabel scope date sourceTitle sourceUrl')]}],
 members:[{...fields('id name cnName stageName favorite note profile status country role officialUrl birthDate'),groupIds:ids,formerGroupIds:ids,photo,social}],
 works:[{...fields('id name song url score stageScore note watched videoType version releaseDate officialTitle channel'),groupIds:ids,ratingIds:ids,stage,stageResearch:fields('status checkedAt'),stageSupplement:supplement,
 placeholder:fields('reason originalRow verifiedAt'),versionDisplay:{tags:ids,links:[{...fields('workId title'),labels:ids,categories:ids}]}}],
 ratings:[{...fields('id name score stylingScore memory note personalPhotoEligible'),memberIds:ids,workIds:ids,photo,referencePhoto:photo}],
 counts:fields('groups members works ratings ratedWorks scoreSum'),
};
// Explicit schema at EVERY level: future fields are private by default. Invalid
// object-valued primitives fail closed, rather than recursively copying secrets.
function project(value:unknown,schema:Shape):unknown{
 if(value===null)return null;
 if(schema===true)return typeof value==='string'||typeof value==='boolean'||typeof value==='number'&&Number.isFinite(value)?value:undefined;
 if(Array.isArray(schema))return Array.isArray(value)?value.map(v=>project(v,schema[0])).filter(v=>v!==undefined):undefined;
 if(!value||typeof value!=='object'||Array.isArray(value))return undefined;
 const out:Record<string,unknown>={};
 for(const [key,child] of Object.entries(schema))if(Object.hasOwn(value,key)){
  const result=project((value as Record<string,unknown>)[key],child);if(result!==undefined)out[key]=result;
 }
 return out;
}
export function projectPublicCatalog(catalog:CatalogView):CatalogView{
 const view=project(catalog,shape) as CatalogView;
 // Keep existing UI contract without passing diagnostics or source provenance.
 view.warning=null;
 for(const work of view.works){
  work.source='';work.verification='';
  if(work.stageResearch)work.stageResearch.reason='';
  if(work.stage){work.stage.typeNote='';work.stage.sourceUrl='';work.stage.selectionNote='';
   if(work.stage.clip)work.stage.clip.evidence={note:'',urls:[]};
   if(work.stage.audioEquivalence){work.stage.audioEquivalence.basis='';work.stage.audioEquivalence.evidenceUrls=[];}
  }
  for(const alt of work.stageSupplement?.alternatives??[]){alt.sourceEvidence={note:'',urls:[]};alt.sameSongEvidence={note:'',urls:[]};if(alt.performerEvidence)alt.performerEvidence={note:'',urls:[]};if(alt.eventEvidence)alt.eventEvidence={note:'',urls:[]};if(alt.version)alt.version.evidence={note:'',urls:[]};}
  for(const lead of work.stageSupplement?.watchLeads??[]){lead.sourceEvidence={note:'',urls:[]};lead.sameSongEvidence={note:'',urls:[]};if(lead.leadTimeEvidence)lead.leadTimeEvidence={note:'',urls:[]};}
 }
 for(const rating of view.ratings)rating.verification='';
 for(const row of [...view.members,...view.ratings]){
  if(row.photo)row.photo.fieldId='';
  if('referencePhoto' in row&&row.referencePhoto)row.referencePhoto.fieldId='';
 }
 return view;
}
