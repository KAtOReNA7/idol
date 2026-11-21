import {AppError} from './feishu';
import {F} from './fields';
import {hash} from './hash';
import {mvMemberAbsence} from './mv-member-appearance';
import {nativeDb,nativeRow,ownControl,type StorageControl} from './native-storage';
import {reviewedMvUrl} from './reviewed-work-metadata';
import {asIds,asText,asUrl,videoId} from './values';
import type {CatalogView,PersonalMvRating,PersonalMvRatings} from './types';

type SaveInput=PersonalMvRating&{scope:string;operationId:string};
type Receipt=SaveInput&{saved:true;verified:true};
type Journal={user_id:string;request_hash:string;status:string;result_json:string};
const recordId=/^rec[A-Za-z0-9]{1,80}$/;
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const validScore=(value:unknown)=>value===null||typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=10;
const scopeFor=(control:StorageControl)=>hash(['personal-mv',control.owner_id,control.active_snapshot,control.epoch]);
function conflict(){return new AppError('EDIT_CONFLICT','评分或成员资料已更新，请重新载入后核对。',409);}

export async function personalMvRatingsForOwner(userId:string,control:StorageControl|null,catalog:CatalogView):Promise<PersonalMvRatings|undefined>{
 if(!control?.active_snapshot||control.owner_id!==userId||!['frozen','native'].includes(control.mode))return;
 const db=nativeDb();
 const {results}=await db.prepare(`SELECT work_id AS workId,video_id AS videoId,member_id AS memberId,
   score,styling_score AS stylingScore,revision FROM idol_personal_mv_ratings
   WHERE owner_id=? AND snapshot_id=? ORDER BY work_id,member_id`).bind(userId,control.active_snapshot).all<PersonalMvRating>();
 const works=new Map(catalog.works.map(work=>[work.id,work]));
 const members=new Map(catalog.members.map(member=>[member.id,member]));
 const entries=results.filter(row=>{
  const work=works.get(row.workId),member=members.get(row.memberId);
  return work&&member&&!work.placeholder&&!mvMemberAbsence(work)&&videoId(work.url)===row.videoId
   &&work.groupIds.some(group=>member.groupIds.includes(group)||member.formerGroupIds?.includes(group));
 });
 return {scope:await scopeFor(control),writable:control.mode==='native',entries};
}

function parseInput(value:unknown):SaveInput{
 if(!value||typeof value!=='object'||Array.isArray(value)||
  Object.keys(value).sort().join(',')!=='memberId,operationId,revision,scope,score,stylingScore,videoId,workId'){
  throw new AppError('INVALID_SAVE','请重新打开成员评分。',400);
 }
 const input=value as SaveInput;
 if(typeof input.scope!=='string'||!/^[a-f0-9]{64}$/.test(input.scope)||
  typeof input.workId!=='string'||!recordId.test(input.workId)||typeof input.memberId!=='string'||!recordId.test(input.memberId)||
  typeof input.videoId!=='string'||!/^[A-Za-z0-9_-]{11}$/.test(input.videoId)||typeof input.operationId!=='string'||!uuid.test(input.operationId)||
  !Number.isSafeInteger(input.revision)||input.revision<0||input.revision>=Number.MAX_SAFE_INTEGER){
  throw new AppError('INVALID_SAVE','请重新打开成员评分。',400);
 }
 if(!validScore(input.score)||!validScore(input.stylingScore)||input.revision===0&&input.score===null&&input.stylingScore===null){
  throw new AppError('INVALID_SCORE','请填写 0 至 10 的表现分或造型分。',400);
 }
 return input;
}

async function savedReceipt(userId:string,operationId:string,requestHash:string):Promise<Receipt|null>{
 const prior=await nativeDb().prepare('SELECT user_id,request_hash,status,result_json FROM idol_saves WHERE id=?').bind(operationId).first<Journal>();
 if(!prior)return null;
 if(prior.user_id!==userId||prior.request_hash!==requestHash)throw new AppError('IDEMPOTENCY_CONFLICT','这次保存的内容与上次不同，请重新载入。',409);
 if(prior.status!=='done'||!prior.result_json)throw new AppError('SAVE_UNRESOLVED','上次保存仍在确认，请稍后核对。',409);
 return JSON.parse(prior.result_json);
}

export async function savePersonalMvRating(userId:string,value:unknown):Promise<Receipt>{
 const input=parseInput(value),{scope,operationId,workId,videoId:expectedVideo,memberId,revision,score,stylingScore}=input;
 const control=await ownControl(userId);
 if(control?.mode!=='native'||!control.active_snapshot||await scopeFor(control)!==scope){
  throw new AppError('STORAGE_CHANGING','手帐已更新，请重新载入作品。',409);
 }
 const snapshot=control.active_snapshot,db=nativeDb();
 const requestHash=await hash({kind:'personal-mv-rating',...input});
 const prior=await savedReceipt(userId,operationId,requestHash);
 if(prior)return prior;
 const [work,member]=await Promise.all([nativeRow(snapshot,'works',workId),nativeRow(snapshot,'members',memberId)]);
 const workFields=JSON.parse(work.fields_json),memberFields=JSON.parse(member.fields_json);
 const groups=asIds(workFields[F.works.groups]);
 const url=reviewedMvUrl({id:workId,groupIds:groups,song:asText(workFields[F.works.song]),url:asUrl(workFields[F.works.url])});
 if(videoId(url)!==expectedVideo)throw new AppError('MV_SOURCE_CHANGED','作品视频已更换，请重新打开后评分。',409);
 if(mvMemberAbsence({id:workId,url}))throw new AppError('MV_HAS_NO_MEMBERS','此视频没有成员真人出镜。',409);
 const memberGroups=[...asIds(memberFields[F.members.groups]),...asIds(memberFields[F.members.formerGroups])];
 if(!groups.some(group=>memberGroups.includes(group)))throw new AppError('INVALID_MEMBER','请选择本团成员。',400);
 const id=await hash([userId,snapshot,workId,expectedVideo,memberId]);
 const existing=await db.prepare('SELECT score,styling_score AS stylingScore,revision FROM idol_personal_mv_ratings WHERE id=?').bind(id).first<Pick<PersonalMvRating,'score'|'stylingScore'|'revision'>>();
 if((existing?.revision??0)!==revision){
  const saved=await savedReceipt(userId,operationId,requestHash);
  if(saved)return saved;
  throw conflict();
 }
 const now=Date.now(),receipt:Receipt={...input,revision:revision+1,saved:true,verified:true};
 const identity={scope,snapshot,workId,videoId:expectedVideo,memberId};
 // The source rows, native relations, owner fence and optimistic revision are
 // rechecked inside the same D1 transaction as the independent save journal.
 const journal=db.prepare(`INSERT INTO idol_saves
  (id,user_id,table_key,record_id,request_hash,status,before_json,patch_json,result_json,created_at,updated_at)
  SELECT ?,?,'personal_mv_ratings',?,?,'done',?,?,?,?,? FROM idol_storage_control c
  WHERE c.id='main' AND c.owner_id=? AND c.mode='native' AND c.active_snapshot=? AND c.epoch=?
   AND EXISTS(SELECT 1 FROM idol_native_records WHERE key=? AND revision=?)
   AND EXISTS(SELECT 1 FROM idol_native_records WHERE key=? AND revision=?)
   AND coalesce((SELECT revision FROM idol_personal_mv_ratings WHERE id=?),0)=?
   AND NOT EXISTS(SELECT 1 FROM idol_native_records r WHERE r.snapshot_id=? AND r.table_key='ratings'
    AND EXISTS(SELECT 1 FROM json_tree(r.fields_json,'$.${F.ratings.works}') WHERE atom=?)
    AND EXISTS(SELECT 1 FROM json_tree(r.fields_json,'$.${F.ratings.members}') WHERE atom=?))
  ON CONFLICT(id) DO NOTHING`).bind(operationId,userId,id,requestHash,
   JSON.stringify({...identity,previous:existing}),JSON.stringify({...identity,score,stylingScore}),JSON.stringify(receipt),now,now,
   userId,snapshot,control.epoch,work.key,work.revision,member.key,member.revision,id,revision,snapshot,workId,memberId);
 const store=db.prepare(`INSERT INTO idol_personal_mv_ratings
  (id,owner_id,snapshot_id,work_id,video_id,member_id,score,styling_score,revision)
  SELECT ?,?,?,?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM idol_saves WHERE id=? AND user_id=? AND request_hash=? AND status='done')
  ON CONFLICT(id) DO UPDATE SET score=excluded.score,styling_score=excluded.styling_score,revision=excluded.revision
   WHERE idol_personal_mv_ratings.revision=?`).bind(id,userId,snapshot,workId,expectedVideo,memberId,score,stylingScore,receipt.revision,operationId,userId,requestHash,revision);
 try{await db.batch([journal,store]);}
 catch(error){const saved=await savedReceipt(userId,operationId,requestHash);if(saved)return saved;throw error;}
 const saved=await savedReceipt(userId,operationId,requestHash);
 if(!saved)throw conflict();
 return saved;
}
