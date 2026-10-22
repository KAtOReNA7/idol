// Synthetic design projection; no actual artist facts or verified production artwork.
import {fixtureMemberId,fixtureWorkId} from '../synthetic-catalog';
export default {
 members:(['A','B'] as const).map(suffix=>({id:fixtureMemberId(34,suffix),cn:`FIXTURE_${suffix}`,src:`/image-fixture/portrait-${suffix.toLowerCase()}.png?host=billlie`})),
 releases:[{id:'fixture-release',title:'合成发行',kind:'测试发行',date:'2026-10-16',src:'/image-fixture/hero.png?host=billlie',artistCredit:'FIXTURE',tracks:0,source:'https://image-fixture.example/release'}],
 works:(['A','B'] as const).map(suffix=>({id:fixtureWorkId(34,suffix),mv:{id:`FixtUrE000${suffix==='A'?'1':'2'}`,src:`https://i.ytimg.com/vi/FixtUrE000${suffix==='A'?'1':'2'}/hqdefault.jpg`},stage:null as null|{id:string;src:string}})),
};
