import type {StageResearchStatus,Work} from './types';

// Research states remain in the private catalog; the UI describes viewing options.
export const stageStatusLabels:Record<StageResearchStatus,string>={pending:'暂无舞台',verified:'有舞台',likes_unverified:'暂无舞台',not_found:'暂无舞台',version_mismatch:'暂无舞台',blocked:'暂无舞台',missing_song_identity:'暂无作品'};
export function stageKindLabel(kind:string){
 const label=baseStageKindLabel(kind);
 return label+(/成员版/.test(kind)?' · 成员版':'')+(/同曲后备/.test(kind)?' · 同曲后备':'')+(/节选/.test(kind)?' · 节选':'')+(/不同版本/.test(kind)?' · 不同版本':'')+(/版本未核/.test(kind)?' · 版本未核':'');
}
// Each caption describes one reviewed source, including its part or clip.
// A replacement gets its own caption instead of inheriting the old one.
const viewingNotes:Record<string,string>={
 'recvxIZd9vfxUk/xrm7PP1mbtI':'六人完整版练习室，与 MV 使用同一版音轨。',
 'recvxyHuKM2wRG/_rn2nefy610':'日语原版。',
 'recvxyHuKMCtUB/bilibili:BV1JctKeyEgw:cid:25864110751:p:2':'六人日语原版，节目转载第 2 段收录完整演出。',
 'recvxDMFHNUJlD/mf4X6i5cm_Q':'英语原版。',
 'recvxDMFHNSckK/nd2aaJ9AQjA':'英语原版。',
 'recvxyOz5XHEju/y4Tr8LE5yV4':'固定机位，完整编舞。',
 'rec28ldfRTrCzF/Gm0apElS0sY':'CHOREO Ver. 编舞版，全长 2 分 54 秒。',
 'recvxDMFHNHFyM/mU8adPiwpm4':'《AWE》时期的编舞版，全长 3 分 07 秒。',
 'recvxyOz5XJWXT/OsPt0BY1_Wk':'LE SSERAFIM 五人成员版练习室。原发行收录了 j-hope 的客串。此视频未注明音轨的 clean／explicit 版本。',
 'recvxyOz5Xo5fW/XSpYaEdpKxY':'七人完整演出，韩语原版。',
 'rec28ldfRTrOnV/bilibili:BV1bhU8BWEso:cid:34265369310:p:1':'TBS《PLAYLIST》，八人分队完整演出日英混合原版。打开第 1 段观看。',
 'recvxyH5pzoMAf/bilibili:BV1bo4y1x7LV:cid:1115512650:p:1@1085-1273':'东京电视台《Premium MelodiX!》，日语原版，位于节目转载第 1 段。',
 'recvxIZRWKy9zg/x:2090845225845747983:video:1':'四人演出的日语原版。',
 'recvxyHuKM2Gwu/bilibili:BV19D4y1r7c6:cid:867429881:p:1':'六人日语原版。第 1 段全长 5 分 07 秒，含节目导入。',
};
export function stageViewingNote(workId:string,sourceKey:string|null|undefined){
 return sourceKey?viewingNotes[workId+'/'+sourceKey]:undefined;
}
function baseStageKindLabel(kind:string){
 if(/\bpractice\b|练习室/i.test(kind))return /band|vocal|合奏|演唱|声乐/i.test(kind)?'合奏／演唱练习':/dance|choreography|舞蹈/i.test(kind)?'舞蹈练习室':'练习室';
 if(/出道特别|DEBUT SPECIAL/i.test(kind))return /6人|六人/.test(kind)?'出道特别表演 · 6 人版':'出道特别表演';
 if(/DANCE PERFORMANCE|DANCE VIDEO|DANCE CLIP|PERFORMANCE VIDEO|CHOREO(?:GRAPHY)?\s*(?:VER\.?|VERSION)|produced|舞台化|表演版|表演视频|特别表演/i.test(kind))return '表演视频';
 if(/录音棚|棚内|乐队|studio/i.test(kind))return /可能采用现场编曲/.test(kind)?'录音棚现场 · 可能采用现场编曲':'录音棚现场';
 if(/音乐节目|打歌|broadcast|电视|节目(?:完整)?舞台/i.test(kind))return '音乐节目舞台';
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
