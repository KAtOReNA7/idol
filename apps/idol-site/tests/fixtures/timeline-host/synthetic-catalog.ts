import type {CatalogView,Member,Work,Group} from '../../../lib/idol/types';
import publicGroups from '../../../HANDOFF/artist-registry51.json';

function member(id:string,groupIds:string[],formerGroupIds:string[]=[]):Member {
 return {id,name:'合成成员 '+id,cnName:'',stageName:id,groupIds,formerGroupIds,
  photo:null,favorite:null,note:'',profile:'',status:'',country:'',role:'',officialUrl:'',birthDate:'',social:[]};
}
function work(id:string,groupIds:string[]):Work {
 return {id,name:'合成作品 '+id,song:'合成歌曲',groupIds,url:'',score:null,stageScore:null,note:'',watched:'',
  videoType:'',version:'',releaseDate:'',verification:'',officialTitle:'',channel:'',ratingIds:[],source:'',
  stage:null,stageResearch:{status:'pending',reason:'合成夹具',checkedAt:null}};
}
function group(id:string,name:string,memberIds:string[],workIds:string[]):Group {
 return {id,name,generation:'',company:'',country:'',note:'',debut:'',memberIds,workIds,average:null,ratedCount:0};
}
function catalog(groups:Group[],members:Member[],works:Work[]):CatalogView {
 return {mode:'snapshot',capturedAt:'2026-10-16T00:00:00Z',loadedAt:'2026-10-16T00:00:00Z',warning:null,
  groups,members,works,ratings:[],counts:{groups:groups.length,members:members.length,works:works.length,ratings:0,ratedWorks:0,scoreSum:0}};
}
export const syntheticCatalog=catalog([
 group('recFixtureGroupA','合成团 A',['recFixtureMemberA','recFixtureMemberA2'],['recFixtureWorkA','recFixtureWorkA2']),
 group('recFixtureGroupB','合成团 B',['recFixtureFormerA'],['recFixtureWorkB']),
 group('recFixtureGroupC','合成团 C',['recFixtureMemberC'],['recFixtureWorkC']),
],[member('recFixtureMemberA',['recFixtureGroupA']),member('recFixtureMemberA2',['recFixtureGroupA']),
 member('recFixtureFormerA',['recFixtureGroupB'],['recFixtureGroupA']),member('recFixtureMemberC',['recFixtureGroupC'])],
 [work('recFixtureWorkA',['recFixtureGroupA']),work('recFixtureWorkA2',['recFixtureGroupA']),work('recFixtureWorkB',['recFixtureGroupB']),work('recFixtureWorkC',['recFixtureGroupC'])]);
/** Public registry IDs only identify actual route hosts. Every personal entity is synthetic. */
export const publicCatalog=catalog(publicGroups.map((item,index)=>group(item.groupId,'合成宿主 '+item.slug,[`recFixturePublicMember${index}`],[`recFixturePublicWork${index}`])),
 publicGroups.map((item,index)=>member(`recFixturePublicMember${index}`,[item.groupId])),
 publicGroups.map((item,index)=>work(`recFixturePublicWork${index}`,[item.groupId])));
