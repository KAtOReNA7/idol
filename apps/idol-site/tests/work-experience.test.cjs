const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {workExperience}=require('./helpers/public-artist-loader.cjs')('lib/idol/work-experience.ts');
const registry=JSON.parse(fs.readFileSync('data/artist-timeline-registry.json','utf8'));
test('all 51 recorded group identities select their theme from direct work links',()=>{
 for(const group of registry){const works=[{id:'exact-work',groupIds:[group.groupId]}];const data={works};
  const plain=workExperience(data,{work:'exact-work'});assert.equal(plain.slug,group.slug);
  assert.deepEqual(workExperience(data,{work:'exact-work',artistReturn:'/artists/izone',member:'unrelated'}),plain);
  assert.deepEqual(workExperience(data,{work:'exact-work',artistReturn:'https://invalid.test/artists/'+group.slug}),plain);
  assert.equal(workExperience(data,{member:'exact-work'}),null);
  assert.equal(workExperience(data,{work:'missing'}),null);
 }
 assert.equal(workExperience(null,{work:'missing'}),null);
});
test('a return route only selects a recorded group in a future multi-group work',()=>{
 const a=registry[0],b=registry[1],data={works:[{id:'multi',groupIds:[b.groupId,a.groupId]}]};
 assert.equal(workExperience(data,{work:'multi'}).slug,a.slug);
 assert.equal(workExperience(data,{work:'multi',artistReturn:b.path}).slug,b.slug);
 assert.equal(workExperience(data,{work:'multi',artistReturn:registry[2].path}).slug,a.slug);
});
test('work presentation leaves personal values, IDs and relationships untouched',()=>{
 const data={works:[{id:'work',groupIds:[registry[0].groupId],score:0,note:'personal-canary',watched:'已观看'}]};
 const before=JSON.stringify(data);const theme=workExperience(data,{work:'work'});assert.equal(JSON.stringify(data),before);assert.ok(!JSON.stringify(theme).includes('personal-canary'));
});
