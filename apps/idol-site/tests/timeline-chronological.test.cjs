'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {loadTimeline}=require('./timeline-test-loader.cjs');
const {selectChronologicalTimeline,timelineDisplayDate,timelineDateKind,dateInterval}=loadTimeline('model');
const base=require('./fixtures/timeline/synthetic-baseline.json').events[0];
const day=value=>({value,precision:'day'});
const event=(id,patch={})=>({...structuredClone(base),id,status:'confirmed',reviewStatus:'ready',eventDate:null,announcementDate:null,plannedDate:null,...patch});
test('all ready dates form one ascending sequence, with true unknowns last and holds excluded',()=>{
 const input=[event('unknown',{announcementDate:day('1999-01-01')}),event('later',{eventDate:day('2024-02-29')}),event('supporting',{eventDate:{value:'2020-05',precision:'month'},importance:'supporting'}),event('held',{eventDate:day('2010-01-01'),reviewStatus:'hold'})];
 const frozen=JSON.stringify(input);
 assert.deepEqual(selectChronologicalTimeline(input).map(e=>e.id),['supporting','later','unknown']);
 assert.equal(timelineDisplayDate(input[0]),null,'an announcement/publication cannot backfill a confirmed occurrence');
 assert.equal(JSON.stringify(input),frozen);
});
test('announcements, plans and postponements use their own applicable dates without promoting occurrence',()=>{
 const announcement=event('announce',{status:'announced',announcementDate:day('2021-03-04'),plannedDate:day('2022-09-10')});
 const plan=event('plan',{status:'planned',announcementDate:day('2020-01-01'),plannedDate:{value:'2027-01',precision:'month'}});
 const postponed=event('postponed',{status:'postponed',announcementDate:day('2024-07-07'),plannedDate:day('2023-01-01')});
 const planOnly=event('plan-only',{status:'announced',plannedDate:day('2025-03-10')});
 assert.equal(timelineDateKind(announcement),'announcement');assert.deepEqual(timelineDisplayDate(announcement),day('2021-03-04'));
 assert.equal(timelineDateKind(plan),'planned');assert.deepEqual(timelineDisplayDate(plan),{value:'2027-01',precision:'month'});
 assert.deepEqual(timelineDisplayDate(postponed),day('2024-07-07'));assert.equal(timelineDateKind(planOnly),'planned');
 assert.deepEqual(selectChronologicalTimeline([plan,planOnly,postponed,announcement]).map(e=>e.id),['announce','postponed','plan-only','plan']);
 assert.equal(announcement.eventDate,null);assert.equal(plan.eventDate,null);
 assert.equal(timelineDisplayDate(event('no-postpone-date',{status:'postponed',plannedDate:day('2022-06-10')})),null);
});
test('same-day and overlapping imprecise dates are stable across input permutations without invented dates',()=>{
 const input=[event('z',{eventDate:{value:'2024',precision:'year'}}),event('b',{eventDate:day('2024-02-29')}),event('a',{eventDate:day('2024-02-29')}),event('c',{eventDate:day('2025-01-01')})];
 const ids=selectChronologicalTimeline(input).map(e=>e.id);
 assert.deepEqual(selectChronologicalTimeline([...input].reverse()).map(e=>e.id),ids);
 for(const [index,left] of selectChronologicalTimeline(input).entries())for(const right of selectChronologicalTimeline(input).slice(index+1))assert.ok(dateInterval(timelineDisplayDate(left)).start<=dateInterval(timelineDisplayDate(right)).end);
 assert.equal(timelineDisplayDate(input[0]).value,'2024');
});
