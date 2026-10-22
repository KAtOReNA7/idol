// Six synthetic media slots satisfy the design's explicit [0]/[5] home selection.
import {fixtureMemberId} from '../synthetic-catalog';
export default {
 members:(['A','B'] as const).map(suffix=>({id:fixtureMemberId(41,suffix),cn:`FIXTURE_${suffix}`,stageName:`FIXTURE_${suffix}`,image:`/image-fixture/portrait-${suffix.toLowerCase()}.png?host=ive`})),
 releases:[{id:'fixture-ive-release',title:'合成发行',image:'/image-fixture/release.png?host=ive',region:'fixture',type:'测试发行',date:'2026-10-16',sourceUrl:'https://image-fixture.example/release'}],
 media:Array.from({length:6},(_,index)=>({id:`fixture-ive-video-${index}`,kind:'mv',title:`合成影像 ${index}`,image:`https://i.ytimg.com/vi/FixtUrE000${index%2+1}/hqdefault.jpg`,sourceUrl:`https://www.youtube.com/watch?v=FixtUrE000${index%2+1}`,date:'2026-10-16',dateLabel:'测试日期',platform:'FIXTURE',releaseId:'fixture-ive-release'})),
};
