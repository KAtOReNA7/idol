import type {Work} from './types';
import dates from '@/data/public-video-date-evidence.json';
import completion from '@/data/public-work-metadata-completion.json';
import {videoId} from './values';

// Owner chose the original score's exact MV on 2026-10-25. This repairs only
// the known empty display metadata; raw source rows and personal values stay intact.
export function applyReviewedWorkMetadata<T extends Work>(work:T):T{
 if(work.id==='rec28ldfRTrEng'&&work.groupIds.length===1&&work.groupIds[0]==='rec28ldfRTiD0h'&&work.song==='HURRICANE'&&!work.url.trim())return {...work,url:'https://www.youtube.com/watch?v=00tUzCOPI6g',videoType:'MV',version:'Music Video',officialTitle:"BADVILLAIN - 'HURRICANE' MV",channel:'BPM Entertainment',releaseDate:work.releaseDate||'2024-07-10'};
 if(work.placeholder)return work;
 const metadata=completion.records.find(row=>row.workId===work.id&&work.groupIds.includes(row.groupId)&&videoId(work.url)===row.videoId);
 if(metadata){
  // Empty display fields only. A source correction must never overwrite a later
  // owner edit or carry personal values from an evidence snapshot into the app.
  const values=metadata.values as Partial<Pick<Work,'releaseDate'|'officialTitle'|'channel'>>;
  for(const field of ['releaseDate','officialTitle','channel'] as const){
   if(!work[field]?.trim()&&values[field])work={...work,[field]:values[field]};
  }
 }
 if(work.releaseDate)return work;
 const date=dates.changes.find(row=>row.id===work.id&&work.groupIds.includes(row.groupId)&&videoId(work.url)===row.videoId);
 return date?{...work,releaseDate:date.proposedDate}:work;
}
