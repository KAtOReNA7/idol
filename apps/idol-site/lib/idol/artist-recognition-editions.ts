import editions from '../../data/mv-recognition-editions.json';
import artistRoutes from '../../data/artist-timeline-registry.json';
import publicRoutes from '../../data/public-artist-navigation-keys.json';
import artwork from '../../data/music-member-artwork.json';
import careers from '../../data/runtime/member-careers/periods.json';
import type {RecognitionEdition} from './recognition-edition-lookup';

/** Server projection. Include each artist's historical members and their work in other groups. */
export function artistRecognitionEditions(slug:string): RecognitionEdition[] {
 const groupId=artistRoutes.find(group=>group.slug===slug)?.groupId;
 if(!groupId)return [];
 const members=new Set([
  ...artwork.filter(row=>row.groupId===groupId).map(row=>row.memberId),
  ...careers.periods.filter(row=>row.groupId===groupId).map(row=>row.memberId),
  ...(Object.values(publicRoutes.groups).find(group=>group.groupId===groupId)?.memberIds??[]),
 ]);
 const selected:RecognitionEdition[]=[];
 for(const edition of Object.values(editions) as RecognitionEdition[]){
  const works=edition.works.map(work=>({...work,memberIds:work.memberIds.filter(id=>members.has(id))})).filter(work=>work.memberIds.length);
  if(!works.length)continue;
  const ids=new Set(works.flatMap(work=>work.memberIds));
  const portraits=Object.fromEntries(Object.entries(edition.portraits).filter(([id])=>ids.has(id)));
  selected.push({label:edition.label,portraits,works});
 }
 return selected;
}
