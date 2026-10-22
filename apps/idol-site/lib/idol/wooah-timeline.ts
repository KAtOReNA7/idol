import canonical from '../../data/artist-timelines/wooah.json';
import groups from '../../data/artist-timeline-registry.json';
import {design,youtubeIdentity} from './wooah-editorial';
import {validateTimeline} from './timeline/validate';
import {selectChronologicalTimeline,timelineDisplayDate} from './timeline/model';
import type {TimelineEvent} from './timeline/types';
/** These public identity references contain no score, queue, watch state, or fabricated Catalog records. */
const context={groups,works:[...new Set(design.videos.map(v=>v.workId))].map(id=>({id,groupIds:[design.groupId]}))};
export function wooahTimelineEvents():TimelineEvent[]|null{
 const checked=validateTimeline(canonical,context);
 if(!checked.ok||checked.value.groupId!==design.groupId)return null;
 return selectChronologicalTimeline(checked.value.events).filter(event=>event.importance==='major');
}
export function wooahTimelineRelease(eventId:string){
 const event=wooahTimelineEvents()?.find(e=>e.id===eventId);
 const key=event&&design.releaseLinks.find(link=>link.eventId===eventId)?.releaseCandidateKey;
 return key?design.releases.find(release=>release.key===key)??null:null;
}
/** Follow the canonical release-to-work relation, never a title/date match or an inferred stage. */
export function wooahTimelineMedia(eventId:string){
 const event=wooahTimelineEvents()?.find(e=>e.id===eventId);
 if(!event||event.eventType!=='release'||event.workIds.length!==1)return null;
 const videos=design.videos.filter(video=>video.kind==='mv'&&video.workId===event.workIds[0]);
 if(videos.length!==1)return null;
 const video=videos[0];
 return youtubeIdentity(video.url)===video.videoId?video:null;
}
export function wooahTimelineDate(event:TimelineEvent){const date=timelineDisplayDate(event);if(!date)return null;const [year,month,day]=date.value.split('-').map(Number);return {value:date.value,label:`${year} 年${month?` ${month} 月`:''}${day?` ${day} 日`:''}`};}
