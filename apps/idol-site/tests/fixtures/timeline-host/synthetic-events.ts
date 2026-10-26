import type {ArtistTimeline,TimelineEvent,TimelineGroupIdentity} from '../../../lib/idol/timeline/types';
export const syntheticGroups:TimelineGroupIdentity[]=[{groupId:'recFixtureGroupA',slug:'fixture-a'},{groupId:'recFixtureGroupB',slug:'fixture-b'},{groupId:'recFixtureGroupC',slug:'fixture-c'}];
const source={id:'fixture-source',url:'https://timeline-fixture.example/'+'long-source-path/'.repeat(14),publisher:'合成发布者（非官方断言）',title:'合成来源：仅测试展开与日期语义',sourcePublishedAt:{value:'2026-01-02',precision:'day' as const},checkedAt:'2026-10-16',scopeNote:'合成证据范围，仅本地验证。',evidenceRef:null};
function event(id:string,groupId='recFixtureGroupA',extra:Partial<TimelineEvent>={}):TimelineEvent {
 return {id,groupId,eventType:'debut',title:'合成测试：'+id,summary:'不是任何真实团体事件。',scopeNote:'合成验证范围',eventDate:{value:'2024-02-29',precision:'day'},announcementDate:null,plannedDate:null,status:'confirmed',importance:'major',memberIds:[],workIds:[],releaseKey:null,relatedEventIds:[],sources:[source],reviewStatus:'ready',holdReasons:[],...extra};
}
const groupA:ArtistTimeline={schemaVersion:1,groupId:'recFixtureGroupA',slug:'fixture-a',gaps:['合成资料不代表真实覆盖'],events:[
 event('fixture-multi-target','recFixtureGroupA',{title:'合成测试：'+'长标题换行及精确目标返回'.repeat(10),memberIds:['recFixtureMemberA','recFixtureMemberA2','recFixtureFormerA'],workIds:['recFixtureWorkA','recFixtureWorkA2']}),
 event('fixture-year','recFixtureGroupA',{eventDate:{value:'2024',precision:'year'}}),
 event('fixture-month','recFixtureGroupA',{eventDate:{value:'2024-02',precision:'month'}}),
 event('fixture-agency','recFixtureGroupA',{eventType:'agency_change',eventDate:null,announcementDate:{value:'2026-01-02',precision:'day'}}),
 event('fixture-agency-notice','recFixtureGroupA',{eventType:'notice',title:'合成测试：发布换公司公告',eventDate:{value:'2026-01-02',precision:'day'},importance:'supporting',relatedEventIds:['fixture-agency'],memberIds:['recFixtureMemberA']}),
 event('fixture-release','recFixtureGroupA',{eventType:'release',releaseKey:'fixture-release',workIds:['recFixtureWorkA']}),
 event('fixture-release-mv','recFixtureGroupA',{eventType:'release',releaseKey:'fixture-release',importance:'supporting',workIds:['recFixtureWorkA2']}),
 event('fixture-release-notice','recFixtureGroupA',{eventType:'notice',importance:'supporting',eventDate:{value:'2024-02-01',precision:'day'},relatedEventIds:['fixture-release'],releaseKey:'fixture-release'}),
 event('fixture-broad-notice','recFixtureGroupA',{eventType:'notice',title:'合成测试：同时提及两个独立事件的公告',relatedEventIds:['fixture-release','fixture-agency']}),
 event('fixture-expired-plan','recFixtureGroupA',{eventType:'release',status:'postponed',eventDate:null,plannedDate:{value:'2001-01-01',precision:'day'}}),
 event('fixture-cancelled','recFixtureGroupA',{eventType:'release',status:'cancelled',eventDate:null,plannedDate:{value:'2026-12',precision:'month'}}),
 event('fixture-held','recFixtureGroupA',{title:'NEVER_RENDER_HELD_ASSERTION',reviewStatus:'hold',holdReasons:['合成待核原因']}),
]};
export const syntheticTimelines:Record<string,ArtistTimeline>={
 recFixtureGroupA:groupA,
 recFixtureGroupB:{schemaVersion:1,groupId:'recFixtureGroupB',slug:'fixture-b',gaps:[],events:[event('fixture-b-event','recFixtureGroupB',{memberIds:['recFixtureFormerA'],workIds:['recFixtureWorkB']})]},
 recFixtureGroupC:{schemaVersion:1,groupId:'recFixtureGroupC',slug:'fixture-c',gaps:[],events:[]},
};
