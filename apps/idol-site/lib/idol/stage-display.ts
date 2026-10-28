import type {StageResearchStatus,Work} from './types';

// Research states remain in the private catalog; the UI describes viewing options.
export const stageStatusLabels:Record<StageResearchStatus,string>={pending:'暂无舞台',verified:'有舞台',likes_unverified:'暂无舞台',not_found:'暂无舞台',version_mismatch:'暂无舞台',blocked:'暂无舞台',missing_song_identity:'暂无作品'};
export function stageKindLabel(kind:string){
 if(/\bpractice\b|练习室/i.test(kind))return /band|vocal|合奏|演唱|声乐/i.test(kind)?'合奏／演唱练习':/dance|choreography|舞蹈/i.test(kind)?'舞蹈练习室':'练习室';
 if(/出道特别|DEBUT SPECIAL/i.test(kind))return /6人|六人/.test(kind)?'出道特别表演 · 6 人版':'出道特别表演';
 if(/DANCE PERFORMANCE|produced|舞台化|表演版|表演视频|特别表演/i.test(kind))return '表演视频';
 if(/录音棚|棚内|乐队|studio/i.test(kind))return /可能采用现场编曲/.test(kind)?'录音棚现场 · 可能采用现场编曲':'录音棚现场';
 if(/音乐节目|打歌|broadcast|电视|节目舞台/i.test(kind))return '音乐节目舞台';
 if(/演唱会|巡演|concert/i.test(kind))return '演唱会现场';
 if(/showcase|展示|出道秀/i.test(kind))return '展示舞台';
 return '舞台表演';
}
export function stageStatusLabel(work:Work){
 if(work.stage)return '有舞台';
 if(work.stageSupplement?.alternatives.length)return '其他现场';
 if(work.stageSupplement?.watchLeads?.length)return '相关演出';
 return '暂无舞台';
}
export function stageStatusDescription(work:Work){return work.stage?stageKindLabel(work.stage.kind):work.stageSupplement?.alternatives.length?'可查看其他现场版本。':work.stageSupplement?.watchLeads?.length?'可先看相关演出，暂未提供对应单曲舞台。':'这首歌暂时没有可用舞台，可以先看 MV。';}
export function stageMatches(work:Work,filter:string){return filter==='all'||(filter==='ready'?!!work.stage:filter==='alternative'?!work.stage&&!!work.stageSupplement?.alternatives.length:!work.stage&&!work.stageSupplement?.alternatives.length);}
