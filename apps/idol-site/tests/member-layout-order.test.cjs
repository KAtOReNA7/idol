// Actual React SSR with the repository snapshot and current read-only projections.
// No network, owner export or production writes. Browser checks are recorded separately.
const test = require('node:test');
const assert = require('node:assert/strict');
const {registry, nativeSlugs, artistCatalog, renderArtist} = require('./fixtures/current-artist-pages.cjs');
const ranks={identity:0,basic:1,scores:2,works:2,records:2,public:3,career:4,personal:5,sources:5};
for(const group of registry.filter(row=>!nativeSlugs.has(row.slug)))test(group.name+' real member render keeps private works before public evidence and sources',async()=>{
 const data=artistCatalog(group);
 const member=data.members.find(m=>m.groupIds.includes(group.groupId)||(m.formerGroupIds??[]).includes(group.groupId));assert.ok(member);
 const before=JSON.stringify(data);
 const html=await renderArtist(group,{section:'members',member:member.id},data);
 assert.match(html,/data-member-layout="ordered-v1"/);
 const modules=[...html.matchAll(/data-member-module="([^"]+)"/g)].map(m=>m[1]);assert.ok(modules.includes('identity'));let previous=-1;
 for(const name of modules){assert.ok(ranks[name]>=previous,group.slug+': '+modules.join(' -> '));previous=ranks[name];}
 assert.equal(JSON.stringify(data),before);
});
