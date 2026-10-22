'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadTimeline } = require('./timeline-test-loader.cjs');
const {
  DEFAULT_TIMELINE_FILTERS, dateInterval, formatTimelineDate, sortTimelineEvents, selectTimeline,
} = loadTimeline('model');
const baseline = require('./fixtures/timeline/synthetic-baseline.json');
const clone = (value) => structuredClone(value);
function event(id, overrides = {}) { return {...clone(baseline.events[0]), id, ...overrides}; }
const day = (value) => ({value, precision: 'day'});
const year = (value) => ({value, precision: 'year'});
const month = (value) => ({value, precision: 'month'});
const groups = (selection) => selection.sections.flatMap((section) => section.groups);
const ids = (selection) => groups(selection).map((group) => group.id);
const section = (selection, id) => selection.sections.find((entry) => entry.id === id);
function deepFreeze(value) {
  if (value && typeof value === 'object') { Object.freeze(value); Object.values(value).forEach(deepFreeze); }
  return value;
}

test('calendar interval bounds respect precision and actual leap centuries', () => {
  assert.deepEqual(dateInterval(year('2024')), {start: '2024-01-01', end: '2024-12-31'});
  assert.deepEqual(dateInterval(month('2024-02')), {start: '2024-02-01', end: '2024-02-29'});
  assert.deepEqual(dateInterval(month('1900-02')), {start: '1900-02-01', end: '1900-02-28'});
  assert.deepEqual(dateInterval(day('2000-02-29')), {start: '2000-02-29', end: '2000-02-29'});
  for (const date of [null, year('0000'), day('1900-02-29'), day('2026-04-31'), {value:'2026', precision:'day'}, ...['__proto__','constructor','toString'].map((precision) => ({value:'2026',precision}))]) assert.equal(dateInterval(date), null);
});

test('date presentation preserves unknown/year/month semantics without inventing display days', () => {
  assert.equal(formatTimelineDate(null), '日期未明');
  assert.match(formatTimelineDate(year('2024')), /2024.*年内日期未详/);
  assert.doesNotMatch(formatTimelineDate(year('2024')), /1\s*月|1\s*日/);
  assert.match(formatTimelineDate(month('2024-02')), /2024.*2.*月内日期未详/);
  assert.doesNotMatch(formatTimelineDate(month('2024-02')), /1\s*日/);
  assert.match(formatTimelineDate(day('2024-02-29')), /2024.*2.*29/);
});

test('strict day chronology and same-day stable IDs hold in both directions', () => {
  const values = [event('z-new', {eventDate:day('2025-03-01')}), event('z-same', {eventDate:day('2024-02-29')}), event('a-same', {eventDate:day('2024-02-29')}), event('a-old', {eventDate:day('2023-12-01')})];
  assert.deepEqual(sortTimelineEvents(values).map((entry) => entry.id), ['z-new','a-same','z-same','a-old']);
  assert.deepEqual(sortTimelineEvents(values, 'earliest').map((entry) => entry.id), ['a-old','a-same','z-same','z-new']);
  assert.deepEqual(sortTimelineEvents([...values].reverse()).map((entry) => entry.id), ['z-new','a-same','z-same','a-old']);
});

test('overlap is not used as a nontransitive comparator: proven chronology survives every input permutation', () => {
  const december = event('a-december', {eventDate:day('2024-12-20')});
  const broad = event('b-year', {eventDate:year('2024')});
  const january = event('c-january', {eventDate:day('2024-01-10')});
  const permutations = [[december,broad,january],[december,january,broad],[broad,december,january],[broad,january,december],[january,december,broad],[january,broad,december]];
  for (const order of ['recent','earliest']) {
    let expected;
    for (const input of permutations) {
      const sorted = sortTimelineEvents(input, order).map((entry) => entry.id);
      if (order === 'earliest') assert.ok(sorted.indexOf('c-january') < sorted.indexOf('a-december'), JSON.stringify(sorted));
      else assert.ok(sorted.indexOf('a-december') < sorted.indexOf('c-january'), JSON.stringify(sorted));
      if (expected) assert.deepEqual(sorted, expected, 'presentation order cannot depend on import order');
      expected = sorted;
    }
  }
  const selection = selectTimeline([december,broad,january]);
  assert.ok(groups(selection).every((entry) => entry.ambiguousOrder), 'a year overlapping both exact dates must communicate unresolved relative precision');
});

test('unknown event date is retained separately; announcement/source/check/plan dates cannot become occurrence', () => {
  const unknown = event('unknown-effective', {
    eventDate:null, announcementDate:day('2026-10-01'), plannedDate:day('2026-10-15'),
    sources:[{...clone(baseline.events[0].sources[0]), sourcePublishedAt:day('2026-10-02'), checkedAt:'2026-10-16'}],
  });
  const known = event('known', {eventDate:day('2020-01-01')});
  const selection = selectTimeline([unknown,known]);
  assert.deepEqual(section(selection,'confirmed').groups.map((entry) => entry.id), ['known']);
  assert.deepEqual(section(selection,'undated').groups.map((entry) => entry.id), ['unknown-effective']);
  assert.equal(section(selection,'undated').groups[0].date, null);
  assert.equal(selection.visibleEventCount, 2);
  for (const order of ['recent','earliest']) assert.equal(sortTimelineEvents([unknown,known],order).at(-1).id,'unknown-effective');
});

test('future, expired plans, postponement and cancellation preserve source status at a frozen clock', () => {
  const values = [
    event('planned-expired', {status:'planned', eventDate:null, plannedDate:day('2001-01-01')}),
    event('postponed', {status:'postponed', eventDate:null, plannedDate:month('2024-03')}),
    event('cancelled', {status:'cancelled', eventDate:day('2020-01-01')}),
    event('future-confirmed', {status:'confirmed', eventDate:day('2099-12-31')}),
    event('announced', {status:'announced', eventDate:null, announcementDate:day('2025-01-01')}),
  ];
  const frozen = deepFreeze(values);
  const RealDate = global.Date;
  function readAt(now) {
    global.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : [now])); } static now() { return now; } };
    try { return selectTimeline(frozen); } finally { global.Date = RealDate; }
  }
  const past = readAt(0);
  const future = readAt(4102444800000);
  assert.deepEqual(past, future, 'elapsed time never upgrades plan to occurrence');
  assert.deepEqual(section(past,'confirmed').groups.map((entry) => entry.id), ['future-confirmed']);
  assert.deepEqual(section(past,'announcements').groups.map((entry) => entry.id), ['cancelled','announced','planned-expired','postponed']);
  assert.equal(values.find((entry) => entry.id === 'planned-expired').status, 'planned');
});

test('default importance is major; ready supporting remains discoverable and hold stays a count', () => {
  assert.deepEqual(DEFAULT_TIMELINE_FILTERS, {type:'all', importance:'major', order:'recent'});
  const values = [event('major'), event('supporting', {importance:'supporting'}), event('held', {reviewStatus:'hold', holdReasons:['合成测试：待核']})];
  const defaults = selectTimeline(values);
  assert.deepEqual(ids(defaults), ['major']);
  assert.equal(defaults.holdCount, 1);
  assert.equal(defaults.readyCount, 2);
  const all = selectTimeline(values,{importance:'all'});
  assert.deepEqual(ids(all), ['major','supporting']);
  assert.equal(all.visibleEventCount,2);
  assert.ok(groups(all).flatMap((group) => group.events).every((entry) => entry.id !== 'held'));
});

test('category filters distinguish member/group, releases and organization/status events', () => {
  const values = [
    event('join',{eventType:'member_join'}), event('depart',{eventType:'member_departure'}),
    event('debut',{eventType:'debut'}), event('disband',{eventType:'disband'}), event('rename',{eventType:'rename'}),
    event('release',{eventType:'release'}), event('agency',{eventType:'agency_change'}), event('contract',{eventType:'contract_end'}),
    event('hiatus',{eventType:'hiatus'}), event('resume',{eventType:'resume'}), event('notice',{eventType:'notice'}), event('other',{eventType:'other'}),
  ];
  assert.deepEqual(ids(selectTimeline(values,{type:'members'})), ['debut','depart','disband','join','rename']);
  assert.deepEqual(ids(selectTimeline(values,{type:'release'})), ['release']);
  assert.deepEqual(ids(selectTimeline(values,{type:'organization'})), ['agency','contract','hiatus','resume']);
  assert.equal(selectTimeline(values).visibleEventCount,12);
});

test('only explicit same-group releaseKey folds releases; equal titles/dates never infer identity', () => {
  const values = [
    event('release-main',{eventType:'release', releaseKey:'synthetic-epoch'}),
    event('release-mv',{eventType:'release', releaseKey:'synthetic-epoch', importance:'supporting'}),
    event('same-title-no-key-a',{eventType:'release', title:'合成测试：同名作品'}),
    event('same-title-no-key-b',{eventType:'release', title:'合成测试：同名作品'}),
    event('other-group-same-key',{eventType:'release', groupId:'recSyntheticOtherGroup', releaseKey:'synthetic-epoch'}),
    event('different-key',{eventType:'release', releaseKey:'synthetic-other-epoch', title:'合成测试：同名作品'}),
  ];
  const selection = selectTimeline(values);
  assert.equal(selection.visibleEventCount,5);
  const release = groups(selection).find((group) => group.events.some((entry) => entry.id === 'release-main'));
  assert.deepEqual(release.events.map((entry) => entry.id),['release-main','release-mv']);
  assert.equal(selection.visibleAssertionCount,6);
  assert.ok(ids(selection).includes('same-title-no-key-a'));
  assert.ok(ids(selection).includes('same-title-no-key-b'));
  assert.ok(ids(selection).includes('other-group-same-key'));
});

test('same-group explicit notice relationships fold context without heuristics and never bridge distinct events', () => {
  const release = event('release',{eventType:'release',releaseKey:'synthetic-release'});
  const notice = event('notice',{eventType:'notice',status:'announced',eventDate:day('2024-02-20'),releaseKey:'synthetic-release',relatedEventIds:['release'],importance:'supporting'});
  const selection = selectTimeline([notice,release]);
  assert.equal(selection.visibleEventCount,1);
  assert.deepEqual(groups(selection)[0].events.map((entry) => entry.id),['release','notice']);
  const mismatch = {...notice,id:'notice-wrong-key',releaseKey:'different-key',importance:'major'};
  assert.equal(selectTimeline([release,mismatch]).visibleEventCount,1,'an explicit same-group event relationship is sufficient even when release keys differ');
  const unlinked = {...notice,id:'notice-unlinked',relatedEventIds:[],importance:'major'};
  assert.equal(selectTimeline([release,unlinked]).visibleEventCount,2);
  const wrongGroup = {...notice,id:'notice-other-group',groupId:'recSyntheticOtherGroup',importance:'major'};
  assert.equal(selectTimeline([release,wrongGroup]).visibleEventCount,2,'relationships never fold across group identity');
  const a = event('member-a',{eventType:'member_departure'});
  const b = event('member-b',{eventType:'member_departure'});
  const broad = event('broad-notice',{eventType:'notice',relatedEventIds:['member-a','member-b']});
  assert.equal(selectTimeline([a,b,broad]).visibleEventCount,3,'one broad announcement cannot collapse two independently identified events');
});

test('organization notice remains context: its announcement day cannot replace an unknown agency effective date', () => {
  const agency = event('agency-change',{
    eventType:'agency_change',eventDate:null,announcementDate:day('2026-10-01'),
    memberIds:[],workIds:[],releaseKey:null,
  });
  const notice = event('agency-announcement',{
    eventType:'notice',title:'合成测试：发布换公司公告',importance:'supporting',
    eventDate:day('2026-10-01'),announcementDate:day('2026-10-01'),
    memberIds:[],workIds:[],releaseKey:null,relatedEventIds:['agency-change'],
  });
  const input = deepFreeze([notice,agency]);
  const selection = selectTimeline(input,{type:'organization'});
  assert.equal(selection.visibleEventCount,1);
  assert.equal(selection.visibleAssertionCount,2);
  assert.deepEqual(section(selection,'confirmed').groups,[]);
  assert.deepEqual(section(selection,'announcements').groups,[]);
  assert.equal(section(selection,'undated').groups.length,1);
  const group = section(selection,'undated').groups[0];
  assert.equal(group.id,'agency-change');
  assert.equal(group.date,null);
  assert.deepEqual(group.events.map((entry) => entry.id),['agency-change','agency-announcement']);
  assert.equal(group.events[0].eventDate,null);
  assert.deepEqual(group.events[1].eventDate,day('2026-10-01'));
  assert.deepEqual(ids(selectTimeline(input)),['agency-change']);
});

test('pure pipeline preserves deeply frozen inputs, event references and caller filter state', () => {
  const values = deepFreeze([event('b',{eventDate:year('2024')}),event('a',{eventDate:month('2024-02')}),event('held',{reviewStatus:'hold',holdReasons:['待核']})]);
  const filters = deepFreeze({type:'all',importance:'all',order:'earliest'});
  const before = JSON.stringify({values,filters});
  const sorted = sortTimelineEvents(values, 'earliest');
  const selection = selectTimeline(values, filters);
  assert.notEqual(sorted,values,'sorting must return a separate array');
  assert.equal(JSON.stringify({values,filters}), before);
  for (const current of groups(selection).flatMap((group) => group.events)) assert.ok(values.includes(current),'model must retain canonical input event identity');
  assert.equal(selection.visibleEventCount,2);
});

test('empty input and invalid filters produce an honest deterministic empty selection', () => {
  const result = selectTimeline([], {type:'not-a-filter',importance:'wrong',order:'wrong'});
  assert.deepEqual(result.sections.map((entry) => entry.id),['confirmed','announcements','undated']);
  assert.ok(result.sections.every((entry) => entry.groups.length === 0));
  assert.equal(result.holdCount,0);
  assert.equal(result.readyCount,0);
  assert.equal(result.visibleEventCount,0);
  const values = [event('major'),event('supporting',{importance:'supporting'})];
  assert.deepEqual(selectTimeline(values,{type:'wrong',importance:'wrong',order:'wrong'}),selectTimeline(values));
});
