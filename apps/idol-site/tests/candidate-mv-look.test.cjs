/* Actual UNIS/Kep1er compositions and gallery; synthetic identities, no private writes. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const harness=fs.readFileSync('tests/candidate-density.test.cjs','utf8').split("for(const [slug,count]")[0];
const context={require,URL,URLSearchParams,AbortController,DOMException,setTimeout,clearTimeout};
vm.runInNewContext(harness+';globalThis.renderCandidate=renderer;globalThis.makeScenario=scenario;',context);
for(const slug of ['unis','kep1er','fromis9'])test(slug+' actual member composition retains approved primary, individual reference and legacy gallery',()=>{
 const {c,data,last}=context.makeScenario(slug,2);data.mode='live';const r=data.ratings[0];
 r.photo={table:'ratings',recordId:r.id,fieldId:'photos',index:4,sourceKind:'mv_look_photo',approvedLookIdentity:{sameLook:true,memberId:last.id,workId:r.workIds[0],videoId:'abcdefghijk'}};
 r.referencePhoto={...r.photo,index:0,sourceKind:'mv_still',kind:'本 MV 截图'};
 const url='/artists/'+slug+'?section=members&member='+last.id,render=()=>context.renderCandidate(data,url).render(c),before=JSON.stringify(data),html=render();
 assert.match(html,/class="ca-look mv-look-native"/);assert.match(html,/本MV同造型照片/);assert.doesNotMatch(html,/高清/);
 assert.match(html,/record=recDensityRating0&amp;index=4/);assert.doesNotMatch(html,/<img[^>]+table=ratings[^>]+index=0/);assert.match(html,/原MV截图/);
 assert.match(html,/data-member-work-trigger="recDensityZero"/);assert.match(html,/表现 0.0 · 造型 未评分/);assert.equal(JSON.stringify(data),before);
 if(slug!=='fromis9')assert.ok(html.includes(slug==='unis'?'unis-person-pass':'kep1er-person-coordinate'));
 r.referencePhoto.kind='本 MV 合照拼图';assert.doesNotMatch(render(),/原MV截图/);
 r.referencePhoto.kind='本 MV 截图';r.referencePhoto.recordId='another';assert.doesNotMatch(render(),/原MV截图/);
 r.photo.approvedLookIdentity.memberId='another';assert.doesNotMatch(render(),/mv-look-native|record=recDensityRating0/);
 r.photo.sourceKind='mv_still';r.photo.kind='本 MV 截图';r.photo.nativeIdentity={memberId:last.id,workId:r.workIds[0]};
 const legacy=render();assert.match(legacy,/class="ca-look"/);assert.match(legacy,/record=recDensityRating0&amp;index=4/);assert.doesNotMatch(legacy,/mv-look-native|本MV同造型照片|原MV截图/);
 r.photo=null;const missing=render();assert.match(missing,/本 MV 个人造型图暂缺/);assert.doesNotMatch(missing,/mv-look-native|原MV截图/);
});
