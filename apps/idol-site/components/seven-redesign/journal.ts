import {sevenDesigns} from './catalog';
import direction from './art-direction.json';
import type {Member} from '@/lib/idol/types';
import {safeArtistReturn} from '@/lib/idol/artist-navigation';
/** Only the explicit artist return context may override a journal portrait.
 * A member shared with an already approved group keeps that group's context. */
export function sevenJournalPortrait(member:Member,returnTo?:string|null){
 const config=sevenJournalContext(member,returnTo);if(!config)return null;
 const art=(direction as Record<string,{portraits?:Record<string,{image:string;label:string;sourceUrl:string}>}>)[config.slug];
 const named=art?.portraits?.[member.id]??art?.portraits?.[member.stageName]??config.memberVisuals?.[member.stageName];
 return named?{...named,date:''}:null;
}
export function sevenJournalContext(member:Pick<Member,'groupIds'|'formerGroupIds'>,returnTo?:string|null){
 const safe=safeArtistReturn(returnTo);if(!safe)return null;
 const config=Object.values(sevenDesigns).find(d=>new URL(safe,'https://site.invalid').pathname==='/artists/'+d.slug);
 if(!config||!([...member.groupIds,...(member.formerGroupIds??[])]).includes(config.groupId))return null;
 return config;
}
