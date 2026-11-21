'use strict';
const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');

const agencyEventIds = [
  'e-ifeye-20261101-hihat-contract-end',
  'e-ifeye-20261102-agency-change',
];
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const serialize = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');

// Reproduce the exact October documents consumed by the older ledgers.
// The November notice introduced two events, one resolved research gap and
// a change of label. The photography still belongs to the former agency.
function beforeAgencyTimelineBytes(slug, bytes) {
  if (slug !== 'ifeye') return bytes;
  assert.equal(sha(bytes), '26aa0e51c147f125c0dd45e16b325d7b2e92573068bdb533b6f08ad760d9891c', 'reviewed November ifeye timeline');
  const document = JSON.parse(bytes);
  assert.deepEqual(document.events.slice(-2).map(event => event.id), agencyEventIds);
  document.events.splice(-2);
  const gap = document.gaps.indexOf('成员加入、退出、解散仍需独立来源。既有中文名/艺名冲突及照片人数边界保持。');
  assert.notEqual(gap, -1);
  document.gaps[gap] = '成员加入、退出、解散、经纪关系变化无合格原文。既有中文名/艺名冲突及照片人数边界保持。';
  const before = serialize(document);
  assert.equal(sha(before), '1f799a4ce2520ddc4c0510cacc0221fd9136d914d4fa2a13cfbd548e03807f1e', 'exact October ifeye timeline');
  return before;
}

function beforeAgencyEditorialBytes(bytes) {
  assert.equal(sha(bytes), '9bd150d9d0f11bcf82b9cc049b5ca026ff69afd81cfaaf460331efba434d7339', 'reviewed November ifeye presentation');
  const document = JSON.parse(bytes);
  assert.deepEqual(document.events.slice(-2).map(event => event.id), agencyEventIds);
  document.events.splice(-2);
  for (const id of agencyEventIds) delete document.publicContent.events[id];
  document.group.company = 'Hi-Hat Entertainment';
  document.group.officialUrl = 'https://www.hihat.co.kr/eng/artist/458';
  document.group.hero.sourceUrl = document.group.officialUrl;
  delete document.group.hero.credit;
  const before = serialize(document);
  assert.equal(sha(before), '8e718f356b2ce7f3fa1d9d5f932223b2a27bb0793c7a0930e35c0979f1a48ca6', 'exact October ifeye presentation');
  return before;
}

module.exports = {agencyEventIds, beforeAgencyTimelineBytes, beforeAgencyEditorialBytes};
