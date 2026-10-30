'use strict';
const assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const receipt=require('../../../../docs/codex/evidence/20261030-access-period-lower-bound/adoption.json');
const guard=require('../../../../docs/codex/evidence/20261030-access-period-lower-bound/guard-adoption.json');
const pins={statistics:{before:'9335bf76efa00a44be1bd920966d7ec10c4415a4b818f88b15b8466395cc63f8',after:'cea7f00cb684f8da1ef3c607b3f4df52109fd9bd2667a02e287bf6103a50c1fa'},guard:{before:'8dacece274f515078cd5ec5ec9c3bed5a4644e10d65ac3e0acfdde2b1d034c8d',after:'9728063b2282ba5708dd1dab9c97e1a5d85e0f6e56796f91393d1a79a2c67605'}};
const sha=value=>createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value,null,2)+'\n').digest('hex');
function beforeAccessStatistics(current){
 assert.equal(receipt.beforeFileSha256,pins.statistics.before);assert.equal(receipt.afterFileSha256,pins.statistics.after);
 const out=structuredClone(current);if(sha(out)===pins.statistics.before)return out;
 assert.equal(sha(out),pins.statistics.after,'complete ACCESS statistics after-file');assert.deepEqual(out.summary,receipt.afterSummary);
 assert.equal(receipt.change.group,'triples');assert.equal(receipt.change.metric,'sales');assert.deepEqual(out.groups.triples.sales,receipt.change.after);
 out.groups.triples.sales=structuredClone(receipt.change.before);out.summary=structuredClone(receipt.beforeSummary);
 assert.equal(sha(out),pins.statistics.before,'complete ACCESS statistics preimage');return out;
}
function beforeAccessGuard(current){
 assert.equal(guard.beforeFileSha256,pins.guard.before);assert.equal(guard.afterFileSha256,pins.guard.after);
 assert.equal(sha(guard.before),pins.guard.before,'complete ACCESS guard receipt preimage');assert.equal(sha(guard.after),pins.guard.after,'complete ACCESS guard receipt after-file');
 const out=structuredClone(current);if(sha(out)===pins.guard.before){assert.deepEqual(out,guard.before);return out;}
 assert.equal(sha(out),pins.guard.after,'complete ACCESS guard after-file');assert.deepEqual(out,guard.after);
 assert.deepEqual(guard.changedPins,['data/group-statistics-completion-evidence.json']);
 for(const relative of guard.changedPins){assert.deepEqual(out.runtimeGuards[relative],guard.after.runtimeGuards[relative]);out.runtimeGuards[relative]=structuredClone(guard.before.runtimeGuards[relative]);}
 assert.deepEqual(out,guard.before,'only the exact ACCESS statistics runtime pin changed');assert.equal(sha(out),pins.guard.before,'complete ACCESS guard preimage');return out;
}
module.exports={beforeAccessStatistics,beforeAccessGuard,receipt,guard,sha};
