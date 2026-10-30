import notes from '@/data/ui/alternative-notes.json';
import type {StageAlternative,StageWatchLead,Work} from './types';
export function requestMessage(code:unknown){
 const messages:Record<string,string>={
  AUTH_REQUIRED:'请重新登录后继续。',OWNER_ONLY:'这个手帐仅限本人使用。',
  EDIT_CONFLICT:'这条记录已在别处更新，本次没有覆盖。你的输入仍在，请重新载入后再保存。',
  STAGE_SOURCE_CHANGED:'这段舞台已经更换，本次没有保存。你的输入仍在，请重新查看视频后再评分。',
  INVALID_SCORE:'评分请填 0 到 10，留空表示未评分。',INVALID_TEXT:'文字过长，请缩短后再保存。',INVALID_STATUS:'请选择已有的观看状态。',
  PREFLIGHT_FAILED:'暂时无法保存，本次未提交。你的输入仍在，请稍后重试。',
  SAVE_UNCERTAIN:'暂时无法确认是否保存成功。你的输入已保留，请先核对上次保存；不要重复填写。',
  SAVE_UNRESOLVED:'上次保存结果仍未确认，请让助手处理后再继续。',
  SAVE_BUSY:'上次保存还未完成，请先核对结果。',
  READBACK_MISMATCH:'保存后的内容与预期不同，已停止重试。请让助手检查；你的输入已保留。',
  SCHEMA_CHANGED:'这条记录暂时无法保存，请让助手检查。你的输入仍在。',
  NOT_CONFIGURED:'暂时无法连接，稍后再试。',AUTH_INVALID:'暂时无法连接，稍后再试。',
 };
 return typeof code==='string'&&messages[code]?messages[code]:'暂时未能完成操作。请稍后重试，未保存的输入仍保留。';
}
export function performanceLabel(a:StageAlternative){return a.sourceClass==='audience_original'?'观众现场录像（非官方）':a.sourceClass==='press_original'||a.performanceType==='press_concert_recording'?'媒体现场录像':a.performanceType==='practice_room'?(a.sourceClass==='official'?'官方练习室':a.sourceClass==='reupload'?'练习室（转载）':'练习室（第三方上传）'):a.performanceType==='studio_performance'?'录音棚现场':a.performanceType==='produced_dance_performance'?'表演视频':a.performanceType==='broadcast_stage'?'音乐节目舞台':a.performanceType==='showcase_stage'?'展示舞台':'现场表演';}
export function selectionNote(a:StageAlternative|StageWatchLead){return !a.selection||a.selection.occasion==='unconfirmed'?'演出场合尚待确认。':a.selection.occasion==='practice_room'?'练习室不代表现场人声。':a.selection.occasion==='music_program'?'':a.selection.occasion==='studio_live'?'录音棚或电台表演。':a.selection.occasion==='produced_performance'?'制作表演视频。':'特别节目表演。';}
export function performerLabel(scope:StageAlternative['performerScope']|StageWatchLead['performerScope']){return scope==='full_group'?'全团':scope==='subunit'?'小分队':scope==='solo'?'个人表演':'演出阵容未确认';}
export function mvVersionWarning(value:string){return /版本待确认|版本未确认/.test(value)?'这条 MV 的版本尚未确认。原有评分已保留。':'';}
// Missing metadata is not an explicit review flag; keep genuine pending flags.
export function castWarning(value:string){const status=value?.trim();return status&&/待|未确认|未核/.test(status)?'出演待确认':'';}

export function alternativeViewingNote(work:Work,a:StageAlternative){const specific=(notes as Record<string,Record<string,string>>)[work.id]?.[a.id];return specific??(a.version.match==='different'?'与 MV 的语言、编配或演出阵容不同。':a.version.match==='unconfirmed'?'具体版本可能与 MV 不同。':a.performanceType==='practice_room'?'同曲练习室表演。':a.performanceType==='produced_dance_performance'?'同曲制作表演。':'同曲现场表演。');}
