/** Test-only content shapes derived from the actual legacy and candidate reads.
 * No source JSON, artist event, photograph, user score or private metadata copied.
 */
import type {CandidateContent} from '../../../lib/idol/candidate/types';
import type {ExpandedArtistContent} from '../../../components/expanded-artist';

const note='合成宿主资料：仅供工程测试，不是真实团体事实。';
const source='https://timeline-fixture.example/background';
export function candidateContent(slug:string,groupId:string,name:string):CandidateContent {
  return {slug,groupId,name,eyebrow:'SYNTHETIC HOST',headline:'合成资料宿主',intro:note,
    hero:{image:null,caption:note,sourceUrl:null},portraits:{},
    facts:[{label:'合成范围',value:'仅本地测试',sourceUrl:source,scope:note,checkedDate:'2026-10-16'}],
    gaps:['没有真实事实资料'],rosterNote:note,activityNote:note,designNote:note};
}
export function expandedContent(groupId:string,name:string):ExpandedArtistContent {
  return {asOf:'2026-10-16',groupId,
    profile:{name,company:'合成测试公司',members:[],debutDate:'日期未录入',summary:note,sourceUrl:source},
    hero:{image:'',caption:note,date:'资料日期未录入'},
    portraitSet:{label:'无合成图片',date:'未录入',copyright:'测试无图片'},memberVisuals:{},
    social:[],updates:[],releases:[],upcoming:[],wins:[],
    winsCoverage:{label:'合成范围',scope:note,status:'pending',note},
    salesCoverage:{label:'合成范围',scope:note,latestPeriod:'未录入'},achievements:[],salesMetrics:[]};
}
// Exact non-null legacy JSON contracts where these two components read directly.
// Arrays stay empty: these declarations do not invent sales, wins or releases.
type ExpandedRelease=ExpandedArtistContent['releases'][number];
type ConcreteLegacyRelease=Omit<ExpandedRelease,'image'|'circle'>&{
 image:string;
 circle:NonNullable<ExpandedRelease['circle']>&{copies:number;coverageLabel:string;missingPeriods:string[]};
};
type LegacyWin=NonNullable<ExpandedArtistContent['wins']>[number];
type IllitUpdate=ExpandedArtistContent['updates'][number]&{attendanceNote?:string};
type IllitUpcoming=ExpandedArtistContent['upcoming'][number]&{time:string};
// Explicit legacy differences; no universal empty object proxy masks field access.
export function babymonsterContent(groupId:string,name:string) {
  const base=expandedContent(groupId,name);
  return {...base,profile:{...base.profile,debutEvents:[] as {date:string;label:string}[]},
    releases:[] as ConcreteLegacyRelease[],wins:[] as LegacyWin[],
    portraitSet:{...base.portraitSet,attribution:'合成测试无图片'}};
}
export function illitContent(groupId:string,name:string) {
 return {...expandedContent(groupId,name),releases:[] as ConcreteLegacyRelease[],wins:[] as LegacyWin[],
  updates:[] as IllitUpdate[],upcoming:[] as IllitUpcoming[]};
}
export function featuredReleaseContent(groupId:string,name:string) {
  return {...expandedContent(groupId,name),featuredReleaseIds:[] as string[],releaseVideoIds:{} as Record<string,string[]>};
}
export function releaseCoverageContent(groupId:string,name:string) {
  return {...featuredReleaseContent(groupId,name),releaseCoverage:{scope:note}};
}
export function itzyContent(groupId:string,name:string) {return {...expandedContent(groupId,name),releaseCoverage:{scope:note}};}
