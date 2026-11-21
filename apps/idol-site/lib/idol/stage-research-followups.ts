import annotations from '@/data/stages/research-followups-20261030.json';
import programs from '@/data/stages/research-followups-20261121.json';
import {validStageResearchNote} from './stage-public-research';
import {stageSourceKey} from './stage-source';
import {videoId} from './values';
import type {Work,StageResearchNote} from './types';

const records=[...annotations.records,...programs.records];

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
 if(old?.summary.includes(fresh.summary))return work;
 const note=old?{summary:old.summary+' '+fresh.summary,sources:[...new Map([...old.sources,...fresh.sources].map(s=>[s.url,s])).values()]}:fresh;
 if(!validStageResearchNote(note))return work;
 return {...work,stageSupplement:{...(work.stageSupplement??{alternatives:[]}),researchNote:note}};
}
