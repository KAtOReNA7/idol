'use strict';
// Pure UI-state tests only; real browser focus/scroll/host guard QA is separate.
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadTimeline} = require('./timeline-test-loader.cjs');
const {
  isTimelineReturnIdentity, sameTimelineReturnIdentity, isTimelineReturnFilters, timelineReturnFilters,
  canUseTimelineReturn, createTimelineReturnState, readTimelineReturnState,
  withTimelineReturnState,
} = loadTimeline('return-state');

const path = '/artists/meovv?section=updates&timelineType=members&timelineImportance=all&timelineOrder=earliest&roster=history';
const identity = {eventId: 'synthetic-event:members-and-works', kind: 'member', targetId: 'recFixtureMemberA'};
const make = (overrides = {}) => createTimelineReturnState(path, identity, {openDetails: ['related:synthetic-event', 'sources:synthetic-context'], scrollY: 394, ...overrides});
const gates = {ready:true, styleReady:true, dataReady:true, visible:true, blocked:false, modal:false, userTakeover:false};

test('return identity distinguishes every member/work target within the same event', () => {
  assert.ok(isTimelineReturnIdentity(identity));
  assert.ok(sameTimelineReturnIdentity(identity, {...identity}));
  for (const different of [{...identity,targetId:'recFixtureMemberB'}, {...identity,kind:'work'}, {...identity,eventId:'synthetic-another-event'}]) assert.equal(sameTimelineReturnIdentity(identity,different),false);
});

test('return identity rejects malformed or expanded payloads instead of storing records', () => {
  for (const invalid of [null, {}, [], {...identity,kind:'external'}, {...identity,targetId:'https://example.test'}, {...identity,eventId:''}, {...identity,record:{notes:'not UI state'}}, {...identity,eventId:'a'.repeat(8193)}]) assert.equal(isTimelineReturnIdentity(invalid),false);
});

test('full artist path and unrelated scope survive while timeline choices normalize', () => {
  const saved = make();
  assert.equal(saved.path,path);
  assert.deepEqual(saved.filters,{type:'all',importance:'all',order:'earliest'});
  assert.deepEqual(readTimelineReturnState(saved,path),saved);
  assert.match(saved.path,/roster=history/);
});

test('overview/default artist entry has default filter state without adding query parameters', () => {
  assert.deepEqual(timelineReturnFilters('/artists/meovv'),{type:'all',importance:'all',order:'earliest'});
  assert.deepEqual(timelineReturnFilters('/artists/meovv?section=overview'),{type:'all',importance:'all',order:'earliest'});
  assert.equal(timelineReturnFilters('/artists/meovv?section=overview&timelineType=members'),null);
});

test('overview discards controlled legacy filters without inventing URL parameters', () => {
  const overview = '/artists/meovv?section=overview&roster=history';
  const filters = Object.freeze({type:'release',importance:'all',order:'earliest'});
  const saved = createTimelineReturnState(overview,identity,{filters,scrollY:50});
  assert.deepEqual(saved.filters,{type:'all',importance:'all',order:'earliest'});
  assert.notEqual(saved.filters,filters);
  assert.equal(saved.path,overview);
  assert.deepEqual(readTimelineReturnState(saved,overview),saved);
  assert.equal(readTimelineReturnState(saved,overview.replace('meovv','illit')),null);
  assert.deepEqual(createTimelineReturnState('/artists/meovv?section=updates',identity,{filters,scrollY:50}).filters,{type:'all',importance:'all',order:'earliest'},'legacy URL/filter choices cannot revive filtering');
  assert.ok(isTimelineReturnFilters(filters));
  for (const invalid of [{...filters,type:'unknown'},{...filters,extra:'record'},null]) {
    assert.equal(isTimelineReturnFilters(invalid),false);
    assert.equal(createTimelineReturnState(overview,identity,{filters:invalid,scrollY:50}),null);
  }
});

test('other groups, different query order, filters and historical scope cannot consume state', () => {
  const saved = make();
  for (const current of [path.replace('meovv','illit'),path.replace('members','release'),path.replace('roster=history','roster=current'),path.replace('section=updates&timelineType=members','timelineType=members&section=updates')]) assert.equal(readTimelineReturnState(saved,current),null);
});

test('external, normalized traversal, hidden-section, hash and malformed timeline routes fail closed', () => {
  for (const invalid of ['https://example.test/artists/meovv', '//example.test/artists/meovv', '/artists/../artists/meovv', '/artists/meovv#event', '/artists/meovv?section=members', '/artists/meovv?section=updates&section=updates', '/artists/meovv?section=updates&timelineType=all&timelineType=members', '/artists/meovv?section=updates&timelineOrder=sideways', '/artists/meovv?timelineType=members', '/artists/meovv\\evil', '/artists/meovv\n']) assert.equal(timelineReturnFilters(invalid),null,invalid);
});

test('legacy serialized filters normalize without changing exact target or path', () => {
  const saved = make();
  for (const filters of [{...saved.filters,type:'release'},{...saved.filters,importance:'major'},{...saved.filters,order:'recent'}]) assert.deepEqual(readTimelineReturnState({...saved,filters},path).filters,{type:'all',importance:'all',order:'earliest'});
  assert.equal(readTimelineReturnState({...saved,filters:{...saved.filters,extra:'not schema'}},path),null);
});

test('saved open detail keys are deduplicated and copied without mutating caller inputs', () => {
  const keys = Object.freeze(['related:a','source:a','related:a']);
  const frozenIdentity = Object.freeze({...identity});
  const saved = createTimelineReturnState(path,frozenIdentity,{openDetails:keys,scrollY:0});
  assert.deepEqual(saved.openDetails,['related:a','source:a']);
  assert.notEqual(saved.identity,frozenIdentity);
  saved.identity.targetId = 'recFixtureOther';
  saved.openDetails.push('source:b');
  assert.equal(frozenIdentity.targetId,'recFixtureMemberA');
  assert.deepEqual(keys,['related:a','source:a','related:a']);
});

test('invalid scroll or details data never becomes a restore command', () => {
  for (const scrollY of [NaN,Infinity,-Infinity,-1,'394',null]) assert.equal(make({scrollY}),null);
  for (const openDetails of [[null],[''],['a'.repeat(8193)],Array.from({length:501},(_,index)=>String(index)),{}]) assert.equal(make({openDetails}),null);
});

test('state version, shape and identity are rechecked when reading browser history', () => {
  const saved = make();
  for (const invalid of [null,[],{...saved,version:2},{...saved,extra:'no'},{...saved,identity:{...identity,kind:'url'}},{...saved,openDetails:[0]},{...saved,scrollY:Infinity}]) assert.equal(readTimelineReturnState(invalid,path),null);
  const missing = {...saved}; delete missing.identity;
  assert.equal(readTimelineReturnState(missing,path),null);
});

test('every readiness, hidden, modal, dirty/uncertain and user takeover gate denies restoration independently', () => {
  assert.equal(canUseTimelineReturn(gates),true);
  for (const flag of ['ready','styleReady','dataReady','visible']) assert.equal(canUseTimelineReturn({...gates,[flag]:false}),false,flag);
  for (const flag of ['blocked','modal','userTakeover']) assert.equal(canUseTimelineReturn({...gates,[flag]:true}),false,flag);
});

test('history merge uses a separate timelineReturn key and preserves unrelated focus and host state', () => {
  const saved = make();
  const prior = Object.freeze({memberWorkFocus:Object.freeze({path:'/artists/meovv',key:'recFixtureWork'}),artistScroll:Object.freeze({path:'/artists/meovv',y:1}),hostKey:12});
  const merged = withTimelineReturnState(prior,saved);
  assert.notEqual(merged,prior);
  assert.equal(merged.timelineReturn,saved);
  assert.equal(merged.memberWorkFocus,prior.memberWorkFocus);
  assert.equal(merged.artistScroll,prior.artistScroll);
  assert.equal(merged.hostKey,12);
  assert.equal(Object.hasOwn(prior,'timelineReturn'),false);
  assert.deepEqual(withTimelineReturnState(null,saved),{timelineReturn:saved});
});

test('round trip retains separate child event identity for a folded notice or release', () => {
  const child = {eventId:'synthetic-related-notice',kind:'work',targetId:'recFixtureWorkB'};
  const saved = createTimelineReturnState(path,child,{openDetails:['related:synthetic-main','sources:synthetic-related-notice'],scrollY:915});
  const restored = readTimelineReturnState(JSON.parse(JSON.stringify(saved)),path);
  assert.deepEqual(restored.identity,child);
  assert.deepEqual(restored.openDetails,['related:synthetic-main','sources:synthetic-related-notice']);
  assert.equal(restored.scrollY,915);
});
