import {groupInformationModel,informationGroupId} from '../group-information.mjs';

const https=value=>{try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password?url.href:null;}catch{return null;}};

// The home renderer and its action guard must use the same current information
// model. Project only its public URLs onto the group; detail/event sources stay
// attached to their own entities and retain the existing exact-pair validation.
export function withGroupInformationIdentity(artist,group){
 if(!artist?.id||informationGroupId(artist.slug)!==artist.id||group&&group.id!==artist.id)return artist;
 const model=groupInformationModel(artist.slug,group);
 const candidates=[...model.accounts.flatMap(account=>[account.url,account.sourceUrl??account.url]),...['sales','wins'].flatMap(kind=>{
  const metric=model[kind];return metric?.sources?.length?metric.sources.map(source=>source.url):[metric?.sourceUrl];
 })];
 const sources=[...(artist.sources??[])],known=new Set(sources.map(source=>typeof source==='string'?source:source?.url));
 for(const candidate of candidates){const url=https(candidate);if(!url||known.has(url))continue;known.add(url);sources.push({id:`${artist.id}:information:${url}`,url});}
 return {...artist,sources};
}
