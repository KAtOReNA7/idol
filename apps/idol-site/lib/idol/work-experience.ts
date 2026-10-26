import registry from '../../data/artist-timeline-registry.json';
import type {CatalogView} from './types';
import type {Route} from './journey';
import {safeArtistReturn} from './artist-navigation';

const classes:Record<string,string>={babymonster:'bm-experience',illit:'illit-experience',xg:'xg-experience',aespa:'aespa-experience',ive:'ive-experience',kissoflife:'kiof-experience',stayc:'stayc-experience',nmixx:'nmixx-experience',hearts2hearts:'hearts2hearts-experience',kiiikiii:'kiiikiii-experience',itzy:'itzy-experience',lesserafim:'lesserafim-experience',saymyname:'saymyname-experience',katseye:'katseye-experience'};
// A work's recorded group relationship owns its design, independent of how it
// was opened. A validated return route can only select among that work's groups.
// Do not infer an affiliation from a member query or change member-page themes.
export function workExperience(data:Pick<CatalogView,'works'>|null,route:Partial<Route>){
 const work=data?.works.find(w=>w.id===route.work);
 if(!work)return null;
 const groups=registry.filter(g=>work.groupIds.includes(g.groupId));
 const returnPath=safeArtistReturn(route.artistReturn)?.split('?')[0];
 const group=groups.find(g=>g.path===returnPath)??groups[0];
 return group?{slug:group.slug,name:group.name,groupId:group.groupId,path:group.path,className:classes[group.slug]??`candidate-experience candidate-${group.slug}-experience`}:null;
}
