import artists from '../../data/artist-timeline-registry.json';
import type {Group} from './types';

// Existing public artist-route spellings, bound to stable group IDs. These are
// search aliases only, never display names, member names or identity keys.
const routeAliases=new Map(artists.map(artist=>[artist.groupId,artist.slug]));
export function publicGroupNames(group:Group):(string|undefined)[]{
 return [group.name,group.currentName,routeAliases.get(group.id)];
}
