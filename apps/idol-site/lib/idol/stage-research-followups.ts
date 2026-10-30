import annotations from '@/data/stages/research-followups-20261030.json';
import {validStageResearchNote} from './stage-public-research';
import {videoId} from './values';
import type {Work,StageResearchNote} from './types';

// Editorial notes carry no stage identity, scoring policy or editable values.
// Bind to the complete work identity; a later stage adoption retires stale notes.
export function stageResearchFollowup(work:Pick<Work,'id'|'groupIds'|'url'|'stage'|'placeholder'>):StageResearchNote|null{
 if(work.placeholder||work.stage)return null;
 const matches=annotations.records.filter(r=>r.workId===work.id&&work.groupIds.includes(r.groupId)&&videoId(work.url)===r.videoId);
 return matches.length===1&&validStageResearchNote(matches[0].note)?matches[0].note:null;
}
export function applyStageResearchFollowups<T extends Pick<Work,'id'|'groupIds'|'url'|'stage'|'placeholder'|'stageSupplement'>>(work:T):T{
 const fresh=stageResearchFollowup(work);if(!fresh)return work;
 const old=work.stageSupplement?.researchNote;
 if(old?.summary.includes(fresh.summary))return work;
 const note=old?{summary:old.summary+' '+fresh.summary,sources:[...new Map([...old.sources,...fresh.sources].map(s=>[s.url,s])).values()]}:fresh;
 if(!validStageResearchNote(note))return work;
 return {...work,stageSupplement:{...(work.stageSupplement??{alternatives:[]}),researchNote:note}};
}
