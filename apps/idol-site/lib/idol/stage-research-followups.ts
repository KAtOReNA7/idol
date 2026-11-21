import annotations from '@/data/stages/research-followups-20261030.json';
import programs from '@/data/stages/research-followups-20261121.json';
import {validStageResearchNote} from './stage-public-research';
import {stageSourceKey} from './stage-source';
import {videoId} from './values';
import type {Work,StageResearchNote} from './types';

const records=[...annotations.records,...programs.records];
const viewingSummaries:Record<string,string>={
 recvxyHuKM2Gwu:'Sony Music Japan 公布了 IVE 于 2022 年 10 月 14 日在《MUSIC STATION》演唱日语版《ELEVEN》的消息。',
 recvxyOz5XkyEY:'ITZY 于 2022 年 4 月 9 日出演 NHK《Venue101》。Kstyle 的播后报道记载了当天演出的日本原创曲《Voltage》。',
 rec28ldfRTrNcl:'HITOMI 和 MEI 参与日语译词及发音指导。LANDOER 访谈中，SEUNGJOO 谈到录音，DOHEE 说起和 KANNY 的说唱和声。',
 recvxyOz5XFVzt:'《Touchdown》是电视剧《The Winning Try》的原声 MV。SBS Catch 另收录一支 4 分 24 秒的制作花絮。',
};

// A companion note for an existing stage expires when that exact source changes.
export function stageResearchFollowup(work:Pick<Work,'id'|'groupIds'|'url'|'stage'|'placeholder'>):StageResearchNote|null{
 if(work.placeholder)return null;
 const matches=records.filter(r=>r.workId===work.id&&work.groupIds.includes(r.groupId)&&videoId(work.url)===r.videoId);
 if(matches.length!==1)return null;
 const [row]=matches;
 if('currentStageSourceKey' in row && row.currentStageSourceKey){
  if(stageSourceKey(work.stage)!==row.currentStageSourceKey)return null;
 }else if(work.stage)return null;
 return validStageResearchNote(row.note)?row.note:null;
}
export function applyStageResearchFollowups<T extends Pick<Work,'id'|'groupIds'|'url'|'stage'|'placeholder'|'stageSupplement'>>(work:T):T{
 const fresh=stageResearchFollowup(work);if(!fresh)return work;
 const old=work.stageSupplement?.researchNote;
 const note=old?.summary.includes(fresh.summary)?old:old?{summary:old.summary+' '+fresh.summary,sources:[...new Map([...old.sources,...fresh.sources].map(s=>[s.url,s])).values()]}:fresh;
 if(!validStageResearchNote(note))return work;
 const viewingNote=viewingSummaries[work.id]??fresh.summary;
 if(note===old&&work.stageSupplement?.viewingNote===viewingNote)return work;
 return {...work,stageSupplement:{...(work.stageSupplement??{alternatives:[]}),researchNote:note,viewingNote}};
}
