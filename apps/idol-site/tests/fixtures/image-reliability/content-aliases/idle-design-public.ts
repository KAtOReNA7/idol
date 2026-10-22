// Synthetic projection for the actual editorial design, independent of production data.
import {fixtureMemberId,fixtureWorkId} from '../synthetic-catalog';
const suffixes=['A','B'] as const;
const art=(src:string,alt:string)=>({src,alt,width:600,height:400});
export default {
 assets:{hero:art('/image-fixture/hero.png?host=idle','合成团体图'),release:art('/image-fixture/release.png?host=idle','合成发行'),...Object.fromEntries(suffixes.flatMap(suffix=>[[`person-${suffix}`,art(`/image-fixture/portrait-${suffix.toLowerCase()}.png?host=idle`,`FIXTURE_${suffix}`)],[`video-${suffix}`,art(`https://i.ytimg.com/vi/FixtUrE000${suffix==='A'?'1':'2'}/hqdefault.jpg`,`合成 MV ${suffix}`)]]))},
 members:suffixes.map(suffix=>({id:fixtureMemberId(24,suffix),cn:`FIXTURE_${suffix}`,stageName:`FIXTURE_${suffix}`,imageKey:`person-${suffix}`,profileListed:true,sourceUrls:['https://image-fixture.example/person']})),
 // The current component selects its latest release by this literal title.
 releases:[{id:'fixture-idle-release',title:'We made',artistScope:'group',artistCredit:'FIXTURE',date:'2026-10-16',type:'合成发行',region:'fixture',imageKey:'release',sourceUrl:'https://image-fixture.example/release',tracks:[] as {title:string}[]}],
 media:suffixes.map(suffix=>({id:fixtureWorkId(24,suffix),kind:'mv',title:`合成 MV ${suffix}`,sourceUrl:`https://www.youtube.com/watch?v=FixtUrE000${suffix==='A'?'1':'2'}`,imageKey:`video-${suffix}`,date:'2026-10-16',dateType:'published-date',artistCredit:'FIXTURE',releaseId:'fixture-idle-release'})),
 nativeMediaIds:suffixes.map(suffix=>fixtureWorkId(24,suffix)),
};
