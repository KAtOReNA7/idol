/* eslint-disable @typescript-eslint/no-require-imports -- isolated synthetic component regression */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const harness=fs.readFileSync('tests/candidate-density.test.cjs','utf8').split("for(const [slug,count]")[0];
const context={require,URL,URLSearchParams,AbortController,DOMException,setTimeout,clearTimeout};
vm.runInNewContext(harness+';globalThis.renderCandidate=renderer;globalThis.makeScenario=scenario;',context);
function scene(){
 const {c,data,last}=context.makeScenario('meovv',5);
 const seed=data.works[0];
 data.works=[{...seed,id:'recUnrelatedFirst',song:'Unrelated first',score:9},{...seed,id:'rec28ldfRTrJ3E',song:'TOXIC',score:null},{...seed,id:'rec28ldfRTrB45',song:'MEOW',score:0},{...seed,id:'rec28ldfRTrJ7M',song:'BODY',score:null},{...seed,id:'rec28ldfRTrJgk',song:'DROP TOP',score:null}];
 data.ratings=[];return {c,data,last};
}
function render(c,data,url='/artists/meovv'){return context.renderCandidate(data,url).render(c);}
function freeze(value){if(value&&typeof value==='object'){Object.freeze(value);Object.values(value).forEach(freeze);}return value;}
test('MEOVV owns its complete structure, without the former candidate slot layout or copied concept',()=>{
 const source=fs.readFileSync('components/candidate/meovv-design.tsx','utf8');
 assert.doesNotMatch(source,/CandidateArtistExperience|CandidateComposition|composition\.(hero|overview|member)|works\.slice\(0,3\)|AFTER HOURS|锋芒之外/);
 for(const required of ['mf-hero','mf-roster','mf-featured','mf-timeline','mf-person','mf-library','mf-records'])assert.ok(source.includes(required),required);
 assert.doesNotMatch(source,/fetch\([^)]*api\/(save|records)|method:\s*['"](?:POST|PATCH|PUT|DELETE)/);
});
test('curated MEOW/TOXIC/DROP TOP entries use canonical IDs and fixed authored order, independent of catalog order',()=>{
 const {c,data}=scene(),before=JSON.stringify(data);freeze(data);const html=render(c,data);
 assert.deepEqual([...html.matchAll(/data-work-id="([^"]+)"/g)].map(m=>m[1]),['rec28ldfRTrB45','rec28ldfRTrJ3E','rec28ldfRTrJgk']);
 assert.ok(!html.includes('Unrelated first'));assert.match(render(c,data,'/artists/meovv?section=works'),/0\.0/);assert.match(render(c,data,'/artists/meovv?section=works'),/未评分/);assert.equal(JSON.stringify(data),before);
 const reversed={...data,works:[...data.works].reverse()};assert.deepEqual([...render(c,reversed).matchAll(/data-work-id="([^"]+)"/g)].map(m=>m[1]),['rec28ldfRTrB45','rec28ldfRTrJ3E','rec28ldfRTrJgk']);
});
test('unavailable canonical featured works do not silently substitute unrelated or title-collision records',()=>{
 const {c,data}=scene();data.works=data.works.map(w=>({...w,id:'recDifferent'+w.id}));const html=render(c,data);
 assert.ok(!html.includes('data-work-id='));assert.match(html,/重点作品暂未加载/);assert.match(render(c,data,'/artists/meovv?section=works'),/Unrelated first/);
});
test('five long bilingual member identities and every safe detail entry remain intact',()=>{
 const {c,data}=scene();const html=render(c,data,'/artists/meovv?section=members');
 assert.deepEqual([...html.matchAll(/data-artist-member-trigger="([^"]+)"/g)].map(m=>m[1]),Array.from(data.members,m=>m.id));
 for(const m of data.members){assert.ok(html.includes(m.stageName));assert.ok(html.includes(m.cnName));}
 const last=data.members.at(-1);const detail=render(c,data,'/artists/meovv?section=members&member='+last.id);assert.ok(detail.includes(last.cnName));assert.match(detail,/个人记录/);assert.doesNotMatch(detail,/暂无关联作品|作品综合分/);
 assert.match(render(c,data,'/artists/meovv?section=members&member=recForeign'),/这个成员不在本团档案中/);
});
test('full works and release archive do not inherit the curated three-work subset',()=>{
 const {c,data}=scene();for(const section of ['works','records']){const html=render(c,data,'/artists/meovv?section='+section);for(const w of data.works)assert.ok(html.includes(w.id),section+' '+w.id);}
 const html=render(c,data,'/artists/meovv?section=works');assert.match(html,/搜索本团作品/);for(const label of ['待看','高分重温','看过待评分','舞台'])assert.ok(html.includes(label));
});
test('standalone work links preserve the existing section/search/queue return context and never carry private edits',()=>{
 const {c,data}=scene();const html=render(c,data,'/artists/meovv?section=works&queue=all&q=MEOW');const links=[...html.matchAll(/href="([^"]+)"/g)].map(m=>m[1].replaceAll('&amp;','&')).filter(x=>x.includes('rec28ldfRTrB45'));
 assert.ok(links.length);for(const href of links){const u=new URL(href,'https://test.invalid');assert.equal(u.pathname,'/');assert.match(u.searchParams.get('returnTo'),/^\/artists\/meovv\?section=works/);assert.ok(u.searchParams.get('returnTo').includes('q=MEOW'));assert.ok(!u.searchParams.has('score'));assert.ok(!u.searchParams.has('note'));}
});
test('complete official source photograph and verified portraits use genuine assets without arbitrary group-image member crops',()=>{
 const {c,data}=scene();const html=render(c,data);assert.match(html,/src="\/artist\/meovv\/figma-20261017\/group-spotify-hero\.jpg"/);assert.match(html,/alt="MEOVV 五人官方合照"/);assert.match(html,/fetchPriority="high"/);
 const css=fs.readFileSync('components/candidate/meovv-figma-design.css','utf8');assert.match(css,/\.mf-hero\{[^}]*aspect-ratio:2660\/1140/);assert.doesNotMatch(css,/url\([^)]*generated_images/);
 const source=fs.readFileSync('components/candidate/meovv-design.tsx','utf8');assert.match(source,/candidatePortrait\(m,content\.portraits\)/);assert.ok(!source.includes('objectPosition'));
});
test('chronological read-only timeline is rendered on both overview and updates without reimplementing or writing its data',()=>{
 const {c,data}=scene();for(const section of ['overview','updates'])assert.ok(render(c,data,'/artists/meovv?section='+section).includes('artist-timeline'));
 const source=fs.readFileSync('components/candidate/meovv-design.tsx','utf8');assert.match(source,/<ArtistTimelineHost groupId=\{content.groupId\}/);assert.ok(source.includes('newArtistHistoryState(window.history.state)'));
});
test('independent member view keeps public credit projection and omits invented missing biography copy',()=>{
 const {c,data,last}=scene();last.country='';last.birthDate='';
 c.portraits[last.id]={image:'/artist/meovv/sooin-mnet-profile.jpg',stageName:last.stageName,sourceUrl:'https://example.com/profile',credit:'官方具名资料照 · 核于 2026-10-16；拍摄日期未确认'};
 const before=JSON.stringify(c),html=render(c,data,'/artists/meovv?section=members&member='+last.id);
 assert.match(html,/官方具名资料照/);assert.match(html,/https:\/\/example.com\/profile/);assert.doesNotMatch(html,/核于|未确认|个人资料待补|官方个人照片暂缺/);assert.equal(JSON.stringify(c),before);
});
test('MEOVV work-detail theme removes dark-era contrast pairs while keeping editors and return controls structurally unchanged',()=>{
 const css=fs.readFileSync('app/meovv-experience.css','utf8');assert.doesNotMatch(css,/#d7f645|#1b231f|#18201c|#dce4d8|#596850|#c8d2c6/i);assert.match(css,/\.image-label\{[^}]*color:#222729/);assert.match(css,/\.detail-return[^}]*background:#f2f2ef/);assert.match(css,/\.button\.primary\{color:#fff;background:#a3201c/);
});
test('MEOVV display-only dates trim full ISO timestamps without rewriting stored dates or partial precision',()=>{
 const {c,data}=scene();data.works[2].releaseDate='2024-09-06T00:00:00.000Z';const before=JSON.stringify(data);
 for(const section of ['works','records']){const html=render(c,data,'/artists/meovv?section='+section);assert.ok(html.includes('2024-09-06'));assert.ok(!html.includes('T00:00:00.000Z'));}
 assert.equal(JSON.stringify(data),before);const {meovvDate}=context.renderCandidate(data,'/artists/meovv').load('components/candidate/meovv-design.tsx');assert.equal(meovvDate('2024-09'),'2024-09');assert.equal(meovvDate(''),'');
});
test('official portraits retain native square framing and error thumbnails collapse to a readable compact row',()=>{
 const css=fs.readFileSync('components/candidate/meovv-figma-design.css','utf8');assert.match(css,/\.mf-roster-photo\{[^}]*aspect-ratio:1/);assert.match(css,/\.mf-work-image:has\(>\.ri-fallback\)\{aspect-ratio:auto;min-height:48px/);assert.doesNotMatch(css,/\.mv-cover-bottom\{margin-top:auto/);
});
test('video imagery requires both canonical work identity and unchanged source video; release covers stay independent',()=>{
 const {c,data}=scene();const urls={'rec28ldfRTrB45':'https://www.youtube.com/watch?v=jpLHg-AsQV0','rec28ldfRTrJ7M':'https://www.youtube.com/watch?v=yFGsw8phPn4','rec28ldfRTrJ3E':'https://www.youtube.com/watch?v=8F61FXiYpP0','rec28ldfRTrJgk':'https://www.youtube.com/watch?v=l4On7TQoM-M'};
 data.works.forEach(w=>{if(urls[w.id])w.url=urls[w.id];});const before=JSON.stringify(data);freeze(data);const html=render(c,data);
 assert.equal((html.match(/src="\/artist\/meovv\/release-toxic.jpg"/g)||[]).length,1);assert.equal((html.match(/src="\/artist\/meovv\/release-meow.jpg"/g)||[]).length,1);
 assert.match(html,/官方发行封面/);assert.deepEqual([...html.matchAll(/data-work-id="([^"]+)"/g)].map(m=>m[1]),['rec28ldfRTrB45','rec28ldfRTrJ3E','rec28ldfRTrJgk']);assert.equal(JSON.stringify(data),before);
 const {meovvVideoArt}=context.renderCandidate(data,'/artists/meovv').load('lib/idol/candidate/meovv-figma-assets.ts');
 for(const work of data.works.filter(w=>urls[w.id])){assert.ok(meovvVideoArt(work));assert.equal(meovvVideoArt({...work,url:'https://www.youtube.com/watch?v=other'}),null);assert.equal(meovvVideoArt({...work,id:'wrong'}),null);}
 const wrong={...data,works:data.works.map(w=>({...w,url:'https://www.youtube.com/watch?v=other'}))};assert.doesNotMatch(render(c,wrong),/src="[^"]*-mv-spotify.jpg/);
});

test('release index shows useful known information without public audit or missing-date filler',()=>{
 const {c,data}=scene();data.works[0].releaseDate='';const before=JSON.stringify(data);
 const html=render(c,data,'/artists/meovv?section=records');
 assert.match(html,/发行档案/);
 assert.doesNotMatch(html,/尚未收录|日期未收录|音乐节目一位/);
 for(const work of data.works)assert.ok(html.includes(work.id));
 assert.equal(JSON.stringify(data),before);
});

test('MEOVV approved looks preserve native pixels and qualified original references without changing legacy slots',()=>{
 const {c,data,last}=context.makeScenario('meovv',5);data.mode='live';const r=data.ratings[0];r.personalPhotoEligible=true;
 r.photo={table:'ratings',recordId:r.id,fieldId:'photos',index:4,sourceKind:'mv_look_photo'};
 r.referencePhoto={...r.photo,index:0,sourceKind:'mv_still',kind:'本 MV 截图'};
 const url='/artists/meovv?section=members&member='+last.id,before=JSON.stringify(data),html=render(c,data,url);
 assert.match(html,/mf-look-photo mv-look-native/);assert.match(html,/本MV同造型照片/);assert.doesNotMatch(html,/高清/);
 assert.match(html,/record=recDensityRating0&amp;index=4/);assert.doesNotMatch(html,/<img[^>]+table=ratings[^>]+index=0/);assert.match(html,/原MV截图/);
 assert.match(html,/data-member-work-trigger="recDensityZero"/);assert.equal(JSON.stringify(data),before);
 r.referencePhoto.kind='本 MV 合照拼图';assert.doesNotMatch(render(c,data,url),/原MV截图/);
 r.referencePhoto.kind='本 MV 截图';r.referencePhoto.recordId='another';assert.doesNotMatch(render(c,data,url),/原MV截图/);
 r.photo.sourceKind='mv_still';const legacy=render(c,data,url);assert.match(legacy,/class="mf-look-photo"/);assert.doesNotMatch(legacy,/mv-look-native|本MV同造型照片|原MV截图/);
 r.personalPhotoEligible=false;assert.doesNotMatch(render(c,data,url),/record=recDensityRating0/);
});
