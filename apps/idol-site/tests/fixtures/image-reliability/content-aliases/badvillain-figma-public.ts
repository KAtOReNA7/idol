// Seven synthetic editorial slots satisfy this design's fixed seven-slot pagination.
import {fixtureMemberId} from '../synthetic-catalog';
export default {
 groupId:'rec28ldfRTiD0h',
 hero:{image:'/image-fixture/hero.png?host=badvillain'},
 members:Array.from({length:7},(_,index)=>({id:index<2?fixtureMemberId(8,index===0?'A':'B'):`recFixtureEditorialBV${index}`,cn:index<2?`FIXTURE_${index===0?'A':'B'}`:`FIXTURE_EXTRA_${index}`,stageName:index<2?`FIXTURE_${index===0?'A':'B'}`:`FIXTURE_EXTRA_${index}`,image:`/image-fixture/portrait-${index===0?'a':index===1?'b':'extra-'+index}.png?host=badvillain`,sourceUrl:'https://image-fixture.example/member'})),
 releases:[false,true].map(isCollaboration=>({id:`fixture-bv-release-${isCollaboration}`,isCollaboration,image:'/image-fixture/release.png?host=badvillain',shortTitle:'合成发行',artistCredit:'FIXTURE',displayType:'测试发行',type:'测试发行',date:'2026-10-16',sourceUrl:'https://image-fixture.example/release',tracks:[] as {title:string;duration:string}[]})),
 media:['mv','stage'].map((kind,index)=>({id:`fixture-bv-${kind}`,kind,image:`https://i.ytimg.com/vi/FixtUrE000${index+1}/hqdefault.jpg`,title:'合成影像',dateLabel:'测试日期',date:'2026-10-16',watchUrl:`https://www.youtube.com/watch?v=FixtUrE000${index+1}`,releaseId:'fixture-bv-release-false',artistCredit:'FIXTURE',sourceUrl:'https://image-fixture.example/media'})),
};
