const test=require('node:test'),assert=require('node:assert/strict');
const {workExperience:resolve}=require('./helpers/public-artist-loader.cjs')('lib/idol/work-experience.ts');
const works=[{id:'idle-work',groupIds:['recvxyEBDZqkpg']},{id:'izone-work',groupIds:['recvxyEBDZjpqw']}];
test('a valid Work owns its theme even with a foreign member or artist return query',()=>{
 const data={works};assert.equal(resolve(data,{work:'idle-work',member:'foreign',artistReturn:'/artists/ive'}).slug,'idle');
 assert.equal(resolve(data,{work:'idle-work',artistReturn:'https://evil.test/artists/izone'}).slug,'idle');
});
test('member pages and invalid work URLs retain the confirmed shared member layout',()=>{
 for(const route of [{member:'member'},{work:'missing',member:'member',artistReturn:'/artists/izone'},{nav:'groups'},{}])assert.equal(resolve({works},route),null);
});
