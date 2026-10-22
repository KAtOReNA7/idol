import type {CatalogView,Group,Member,Work,RatingView} from '../../../lib/idol/types';
import groups51 from '../../../HANDOFF/artist-registry51.json';
export const fixtureMemberId=(index:number,suffix:'A'|'B')=>`recFixtureImageMember${index}${suffix}`;
export const fixtureWorkId=(index:number,suffix:'A'|'B')=>`recFixtureImageWork${index}${suffix}`;
function makeMember(index:number,suffix:'A'|'B',groupId:string):Member {
 const id=fixtureMemberId(index,suffix);
 return {id,name:`合成成员 ${suffix}`,stageName:`FIXTURE_${suffix}`,cnName:'',groupIds:[groupId],formerGroupIds:[],
 photo:{table:'members',recordId:id,fieldId:'fixturePhoto',index:0},favorite:null,note:'',profile:'',status:'',country:'',role:'',officialUrl:'',birthDate:'',social:[]};
}
function makeWork(index:number,suffix:'A'|'B',groupId:string):Work {
 return {id:fixtureWorkId(index,suffix),name:`合成作品 ${suffix}`,song:`合成歌曲 ${suffix}`,groupIds:[groupId],url:`https://www.youtube.com/watch?v=FixtUrE000${suffix==='A'?'1':'2'}`,
 score:0,stageScore:null,note:'',watched:'',videoType:'官方MV',version:'合成测试',releaseDate:'',verification:'',officialTitle:'',channel:'',ratingIds:[],source:'',stage:null,stageResearch:{status:'pending',reason:'合成夹具',checkedAt:null}};
}
function makeRating(index:number,suffix:'A'|'B'):RatingView {
 const id=`recFixtureImageRating${index}${suffix}`;
 return {id,name:'合成造型关联',memberIds:[fixtureMemberId(index,suffix)],workIds:[fixtureWorkId(index,suffix)],score:0,stylingScore:0,memory:'',note:'',
 photo:{table:'ratings',recordId:id,fieldId:'fixturePhoto',index:0,kind:'本 MV 截图'},verification:'',personalPhotoEligible:true};
}
const members=groups51.flatMap((group,index)=>[makeMember(index,'A',group.groupId),makeMember(index,'B',group.groupId)]);
const works=groups51.flatMap((group,index)=>[makeWork(index,'A',group.groupId),makeWork(index,'B',group.groupId)]);
const ratings=groups51.flatMap((_group,index)=>[makeRating(index,'A'),makeRating(index,'B')]);
const groups:Group[]=groups51.map((item,index)=>({id:item.groupId,name:'合成图片宿主 '+item.slug,generation:'',company:'',country:'',note:'',debut:'',memberIds:[fixtureMemberId(index,'A'),fixtureMemberId(index,'B')],workIds:[fixtureWorkId(index,'A'),fixtureWorkId(index,'B')],average:0,ratedCount:2}));
export const imageCatalog:CatalogView={mode:'snapshot',capturedAt:'2026-10-16T00:00:00Z',loadedAt:'2026-10-16T00:00:00Z',warning:null,groups,members,works,ratings,counts:{groups:groups.length,members:members.length,works:works.length,ratings:ratings.length,ratedWorks:works.length,scoreSum:0}};
