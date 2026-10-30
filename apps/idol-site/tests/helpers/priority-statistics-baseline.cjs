const assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const receipt=require('../../../../docs/codex/evidence/20261030-priority-crosscheck/statistics-adoption.json');
const guard=require('../../../../docs/codex/evidence/20261030-priority-crosscheck/guard-adoption.json');
const sha=x=>createHash('sha256').update(typeof x==='string'?x:JSON.stringify(x,null,2)+'\n').digest('hex');
function beforePriorityStatistics(current){
 if(sha(current)===receipt.beforeFileSha256)return structuredClone(current);
 current=require('./access-period-statistics-baseline.cjs').beforeAccessStatistics(current);
 assert.equal(sha(current),receipt.afterFileSha256,'complete priority statistics after-file');
 const before=structuredClone(current);assert.deepEqual(before.summary,receipt.afterSummary);
 for(const c of receipt.changes){const [g,k]=c.change.split('.');assert.deepEqual(before.groups[g][k],c.after);before.groups[g][k]=structuredClone(c.before);}
 before.summary=structuredClone(receipt.beforeSummary);assert.equal(sha(before),receipt.beforeFileSha256,'complete priority statistics preimage');return before;
}
function beforePriorityGuard(current){
 current=require('./access-period-statistics-baseline.cjs').beforeAccessGuard(current);
 assert.equal(sha(current),guard.afterFileSha256,'complete priority guard after-file');assert.deepEqual(current,guard.after);
 assert.equal(sha(guard.before),guard.beforeFileSha256,'complete priority guard preimage');return structuredClone(guard.before);
}
function beforeApprovedMemberLayoutGuard(current){
 const c=guard.approvedMemberLayout;assert.equal(sha(current),c.afterSha256,'complete approved member-layout guard');
 assert.equal(sha(c.expectedBeforeText),c.beforeSha256,'complete pre-member-layout guard');return JSON.parse(c.expectedBeforeText);
}
module.exports={beforePriorityStatistics,beforePriorityGuard,beforeApprovedMemberLayoutGuard,receipt};
