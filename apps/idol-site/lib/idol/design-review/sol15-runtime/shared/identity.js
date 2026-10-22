import {entityKey,href} from './helpers.js';
import {parseRoute} from './router.js';

const actionSelector='a[href],button,input,select,summary,form,[data-action]';
const contextSelector='[data-entity-type][data-entity-key],[data-member-id],[data-work-key],[data-event-id]';
export function lookupEntity(artist,type,key){
  if(type==='group')return artist;
  if(!['member','event','work','mv','stage','release'].includes(type))return null;
  const rows=type==='member'?artist.members:type==='event'?artist.timeline:artist.works;
  return rows?.find(row=>entityKey(row)===key)??null;
}
export function identityFor({artist,route,entityType='group',entity=null,sourceId=null,sourceIds=[],sourceUrl=null,targetUrl=null}){
  const isGroup=entityType==='group';
  const isWork=['work','mv','stage','release'].includes(entityType);
  const record=isGroup?artist:lookupEntity(artist,entityType,entityKey(entity));
  if(!record)throw new Error('Action entity is absent from the active artist');
  const type=isWork?record.type:entityType;
  const parent=isWork&&record.type==='stage'?(record.parentWorkId??record.workId??record.sourceWorkId??null):null;
  const query=new URLSearchParams(route.query??[]);
  return {
    groupId:artist.id,slug:artist.slug,entityType:type,
    entityId:isGroup?artist.id:(record.id??null),candidateKey:isGroup?null:(record.id!=null?null:record.candidateKey??null),
    workId:isWork?(record.type==='mv'?(record.id??record.workId??null):record.type==='stage'?parent:null):null,
    videoId:isWork?(record.videoId??null):null,
    parentWorkIds:isWork&&record.type==='stage'?[...new Set([parent,...(record.parentWorkIds??[])].filter(Boolean))]:[],
    eventId:entityType==='event'?record.id:null,
    relatedWorkIds:entityType==='event'?[...(record.workIds??[])]:[],
    relatedMemberIds:entityType==='event'?[...(record.memberIds??[])]:[],
    sourceId,sourceIds:[...sourceIds],sourceUrl,targetUrl,
    returnRoute:href(artist.slug,route.page,route.key,query),
    returnQuery:[...query.entries()]
  };
}
function contextEntity(element,artist,route){
  const rawHref=element.getAttribute?.('href');
  if(rawHref?.startsWith('#/')){
    const target=parseRoute(rawHref);
    if(target.slug&&target.slug!==artist.slug)throw new Error('Cross-group action target rejected');
    if(target.page==='not-found')throw new Error('Invalid action route rejected');
    if(['member','work'].includes(target.page)){
      const type=target.page;
      const entity=lookupEntity(artist,type,target.key);
      if(!entity)throw new Error('Action target is not owned by active artist');
      return {entityType:type,entity};
    }
    return {entityType:'group',entity:artist};
  }
  const context=element.closest?.(contextSelector);
  if(context){
    let type=context.getAttribute('data-entity-type'),key=context.getAttribute('data-entity-key');
    if(context.hasAttribute('data-member-id')){type='member';key=context.getAttribute('data-member-id');}
    else if(context.hasAttribute('data-work-key')){type='work';key=context.getAttribute('data-work-key');}
    else if(context.hasAttribute('data-event-id')){type='event';key=context.getAttribute('data-event-id');}
    const entity=lookupEntity(artist,type,key);
    if(!entity)throw new Error('Action context is not owned by active artist');
    return {entityType:type,entity};
  }
  if(['member','work'].includes(route.page)){
    const entity=lookupEntity(artist,route.page,route.key);
    if(!entity)throw new Error('Active detail entity is absent');
    return {entityType:route.page,entity};
  }
  return {entityType:'group',entity:artist};
}
export function actionIdentity(element,{artist,route}){
  const context=contextEntity(element,artist,route);
  const declaredSourceId=element.getAttribute?.('data-source-id')??null;
  const targetUrl=element.getAttribute?.('href')??null;
  const sourceUrl=/^https?:\/\//i.test(targetUrl??'')?targetUrl:null;
  const knownSources=[...(context.entity?.sources??[]),...(context.entity?.careerSources??[])].map(source=>typeof source==='string'?{url:source}:source);
  const matches=sourceUrl?knownSources.filter(source=>source?.url===sourceUrl):[];
  const sourceIds=[...new Set(matches.map(source=>source?.id??source?.sourceId).filter(Boolean))];
  if(declaredSourceId&&!sourceIds.includes(declaredSourceId))throw new Error('Exact source ID and URL pair is absent from active entity');
  if(context.entityType==='event'&&sourceUrl&&!matches.length)throw new Error('Event source URL is absent from the exact supplied event sources');
  const sourceId=declaredSourceId??(sourceIds.length===1?sourceIds[0]:null);
  if(['work','mv','stage'].includes(context.entityType)&&context.entity?.videoId&&targetUrl){
    let url;try{url=new URL(targetUrl);}catch{}
    if(url&&['youtube.com','www.youtube.com','m.youtube.com','youtu.be'].includes(url.hostname)){
      const targetVideo=url.hostname==='youtu.be'?url.pathname.slice(1).split('/')[0]:url.pathname==='/watch'?url.searchParams.get('v'):/^\/(shorts|embed)\//.test(url.pathname)?url.pathname.split('/')[2]:null;
      const isVideo=url.hostname==='youtu.be'||url.pathname==='/watch'||/^\/(shorts|embed)\//.test(url.pathname);
      if(isVideo&&targetVideo!==context.entity.videoId)throw new Error('Video action points to a different work or version');
    }
  }
  return identityFor({artist,route,...context,sourceId,sourceIds,sourceUrl,targetUrl});
}
export function validateIdentity(identity,expected){
  const required=['groupId','slug','entityType','entityId','candidateKey','workId','videoId','parentWorkIds','eventId','relatedWorkIds','relatedMemberIds','sourceId','sourceIds','sourceUrl','targetUrl','returnRoute','returnQuery'];
  for(const key of required)if(JSON.stringify(identity?.[key])!==JSON.stringify(expected[key]))return {valid:false,reason:`Action identity mismatch: ${key}`};
  return {valid:true};
}
export function attachActionIdentities({root,artist,route,scope,onInvalid=()=>{},onValid=()=>{}}){
  const stamp=element=>{
    const expected=actionIdentity(element,{artist,route});
    if(!element.hasAttribute('data-action-identity'))element.setAttribute('data-action-identity',JSON.stringify(expected));
    return expected;
  };
  for(const element of root.querySelectorAll(actionSelector)){
    try{stamp(element);}catch(error){element.setAttribute('data-action-invalid',error.message);}
  }
  const activate=event=>{
    const element=event.target?.closest?.(actionSelector);
    if(!element||!root.contains(element))return;
    try{
      const expected=stamp(element);
      const identity=JSON.parse(element.getAttribute('data-action-identity'));
      const result=validateIdentity(identity,expected);
      if(!result.valid)throw new Error(result.reason);
      onValid({event,element,identity});
    }catch(error){event.preventDefault();event.stopImmediatePropagation();onInvalid({event,element,error});}
  };
  const events=['click','submit','change'];
  if(scope){for(const type of events)scope.on(root,type,activate,{capture:true});return ()=>{};}
  for(const type of events)root.addEventListener(type,activate,{capture:true});
  return ()=>{for(const type of events)root.removeEventListener(type,activate,{capture:true});};
}
