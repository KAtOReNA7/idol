// All artwork and identities are generated test-only inputs.
import {fixtureMemberId,fixtureWorkId} from '../synthetic-catalog';
const suffixes=['A','B'] as const;
export default {
 assets:[{key:'hero',figmaDisplayPath:'public/image-fixture/hero.png?host=newjeans',alt:'合成团体图',displayWidth:600,displayHeight:400,mediaId:''},...suffixes.map(suffix=>({key:`person-${suffix}`,figmaDisplayPath:`public/image-fixture/portrait-${suffix.toLowerCase()}.png?host=newjeans`,alt:`FIXTURE_${suffix}`,displayWidth:600,displayHeight:400,mediaId:''})),...suffixes.map(suffix=>({key:`video-${suffix}`,figmaDisplayPath:`public/image-fixture/video-${suffix.toLowerCase()}.png?host=newjeans`,alt:`合成 MV ${suffix}`,displayWidth:600,displayHeight:400,mediaId:fixtureWorkId(36,suffix)}))],
 members:suffixes.map(suffix=>({id:fixtureMemberId(36,suffix),cn:`FIXTURE_${suffix}`,stageName:`FIXTURE_${suffix}`,imageKey:`person-${suffix}`,sourceUrls:['https://image-fixture.example/member']})),
 releases:[{id:'fixture-nj-release',title:'合成发行',imageKey:'hero',type:'测试发行',region:'fixture',date:'2026-10-16',artistCredit:'FIXTURE',sourceUrl:'https://image-fixture.example/release',tracks:[] as {title:string}[]}],
 media:suffixes.map(suffix=>({id:fixtureWorkId(36,suffix),kind:'mv',title:'合成影像',imageKey:`video-${suffix}`,sourceUrl:`https://www.youtube.com/watch?v=FixtUrE000${suffix==='A'?'1':'2'}`,date:'2026-10-16',artistCredit:'FIXTURE',releaseId:'fixture-nj-release'})),
};
