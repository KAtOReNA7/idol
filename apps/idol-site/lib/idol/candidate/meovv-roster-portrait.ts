import type {Member} from '../types';

// Display-only aliases, pinned to both canonical identity and exact selected source.
// Full originals remain in the portrait catalog and member detail. Audit/recipe:
// docs/meovv-roster-portraits.json and scripts/build-meovv-roster-portraits.mjs.
const portraits:Record<string,{stageName:string;source:string;display:string}>={
 'rec28ldbniBa8G':{stageName:'SOOIN',source:'/artist/meovv/sooin-mnet-profile.jpg',display:'/artist/meovv/sooin-mnet-profile-roster.webp'},
 'rec28ldbniBafU':{stageName:'GAWON',source:'/artist/meovv/gawon-mnet-profile.jpg',display:'/artist/meovv/gawon-mnet-profile-roster.webp'},
 'rec28ldbniBan4':{stageName:'ANNA',source:'/artist/meovv/anna-mnet-profile.jpg',display:'/artist/meovv/anna-mnet-profile-roster.webp'},
 'rec28ldbniBauu':{stageName:'NARIN',source:'/artist/meovv/narin-mnet-profile.jpg',display:'/artist/meovv/narin-mnet-profile-roster.webp'},
 'rec28ldbniBaBx':{stageName:'ELLA',source:'/artist/meovv/ella-mnet-profile.jpg',display:'/artist/meovv/ella-mnet-profile-roster.webp'},
};
export function meovvRosterPortrait(member:Pick<Member,'id'|'stageName'>,source:string|null|undefined){
 const asset=portraits[member.id];
 return asset&&asset.stageName===member.stageName&&asset.source===source?asset.display:source;
}
