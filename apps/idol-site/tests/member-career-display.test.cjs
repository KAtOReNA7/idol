const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const {MemberCareerFacts,memberCareerFacts,memberCareerMetadata:meta,careerPeriodEvents,careerDate,careerSourceUrl}=require('./helpers/member-career-loader.cjs');
const canonical=JSON.parse(fs.readFileSync('research/member-careers/data/canonical.json'));
function member(p,extra={}){return {id:p.memberId,groupIds:[p.groupId],formerGroupIds:[],profile:'我的原始介绍',officialUrl:'https://example.com/profile',note:'私人备注',favorite:9,...extra};}
const html=m=>renderToStaticMarkup(React.createElement(MemberCareerFacts,{member:m}));
test('all 368 accepted periods preserved, hold and all 24 overlays absent from compact metadata',()=>{
 assert.equal(meta.periods.length,368);assert.equal(meta.periods.filter(p=>p.relationType==='roster_listing').length,62);
 assert.equal(meta.canonicalSha256,crypto.createHash('sha256').update(fs.readFileSync('research/member-careers/data/canonical.json')).digest('hex'));
 const accepted=canonical.memberPeriods.filter(p=>p.decision!=='hold');assert.deepEqual(meta.periods.map(p=>p.periodId),accepted.map(p=>p.periodId));
 for(const p of meta.periods){const original=accepted.find(x=>x.periodId===p.periodId);for(const key of ['startDate','startPrecision','endDate','endPrecision','startDateBasis','endDateBasis'])if(p.periodId==='period:rec28ldfRTiDPs:recvxAPQCF66Sl:group_membership:2025-04-29:main'&&['startDate','startPrecision','startDateBasis'].includes(key))assert.equal(p[key],null);else assert.equal(p[key],original[key]);for(const id of p.sourceIds)assert.ok(meta.sources.some(s=>s.sourceId===id));}
 assert.doesNotMatch(JSON.stringify(meta),/summaryZh|statusLabelZh|beforePublicHash|memberClaims|verification_note|display_overlay/);
});
test('identity guard requires exact member id and actual current/former relation; roster observations create no milestone',()=>{
 const p=meta.periods[0];assert.ok(memberCareerFacts(member(p)).length);assert.equal(memberCareerFacts(member(p,{groupIds:[]})).length,0);assert.equal(memberCareerFacts(member(p,{id:'other'})).length,0);assert.ok(memberCareerFacts(member(p,{groupIds:[],formerGroupIds:[p.groupId]})).length);
 for(const p of meta.periods.filter(p=>p.relationType==='roster_listing'))assert.equal(careerPeriodEvents(p).length,0);
});
test('date precision is retained and invalid or missing dates never invent present-day tenure',()=>{
 assert.equal(careerDate('2018','year'),'2018');assert.equal(careerDate('2021-04','month'),'2021-04');assert.equal(careerDate('2021-02-29','day'),null);assert.equal(careerDate('2021-04-01','month'),null);
 for(const p of meta.periods){const rows=careerPeriodEvents(p);assert.doesNotMatch(JSON.stringify(rows),/至今|未知|核验|不能证明|未核|私下/);if(!p.endDate)assert.ok(!rows.some(e=>/退出团体|结束成员活动/.test(e.label)&&!p.events.some(x=>x.label===e.label)));}
});
test('group endpoints never become individual departure; revised PURPLE KISS and Cherry Bullet only show announcements',()=>{
 for(const p of meta.periods.filter(p=>p.endDateBasis==='explicit_group_activity_end'))assert.ok(!careerPeriodEvents(p).some(e=>/退出|离团/.test(e.label)));
 for(const name of ['PURPLE KISS','Cherry Bullet']){const p=meta.periods.find(p=>p.displayName===name&&p.events.some(e=>e.label.includes('官方团体活动结束')));assert.equal(p.endDate,null);assert.ok(careerPeriodEvents(p).some(e=>e.label.includes('公告')));}
 const iz=meta.periods.find(p=>p.displayName==='IZ*ONE');assert.deepEqual(Array.from(careerPeriodEvents(iz),e=>e.date),['2018-10','2021-04']);assert.match(careerPeriodEvents(iz)[1].label,/限定项目结束/);
});
test('GIRLSET report, MADEIN pause and VVUP introduction preserve distinct event meaning',()=>{
 const brand=meta.periods.find(p=>p.relationType==='brand_phase');assert.equal(brand.startDate,null);assert.match(careerPeriodEvents(brand)[0].label,/公司报告/);assert.doesNotMatch(careerPeriodEvents(brand)[0].label,/加入|改名日/);
 const pause=meta.periods.find(p=>p.relationType==='activity_interval'&&p.displayName.startsWith('MADEIN'));assert.equal(pause.startDate,null);assert.equal(pause.endDate,null);assert.match(careerPeriodEvents(pause)[0].label,/公告/);
 const intro=meta.periods.find(p=>p.startDateBasis==='dated_self_introduction');assert.match(careerPeriodEvents(intro)[0].label,/公开自我介绍/);assert.doesNotMatch(careerPeriodEvents(intro)[0].label,/首次|加入/);
 const evolution=meta.periods.find(p=>p.displayName==='EVOLution');assert.equal(careerPeriodEvents(evolution)[0].date,null);assert.match(careerPeriodEvents(evolution)[0].label,/Mujuk/);
});
test('actual shared React section preserves DB introduction/link once, empty section absent, private fields unchanged',()=>{
 const m=member(meta.periods[0]),before=JSON.stringify(m),s=html(m);assert.equal((s.match(/我的原始介绍/g)||[]).length,1);assert.equal((s.match(/相关官方页面/g)||[]).length,1);assert.doesNotMatch(s,/私人备注/);assert.equal(JSON.stringify(m),before);
 assert.equal(html({...m,id:'none',profile:'',officialUrl:''}),'');assert.doesNotMatch(html({...m,officialUrl:'javascript:alert(1)'}),/javascript:|相关官方页面/);
 assert.equal(careerSourceUrl('https://u:p@example.com'),null);assert.equal(careerSourceUrl('data:text/html,hi'),null);
});

test('split profile, career and source sections preserve facts once and do not manufacture empty modules',()=>{
 const m=member(meta.periods[0]),before=JSON.stringify(m),part=p=>renderToStaticMarkup(React.createElement(MemberCareerFacts,{member:m,part:p}));
 const intro=part('intro'),history=part('history'),sources=part('sources'),all=html(m);
 assert.match(intro,/我的原始介绍/);assert.match(intro,/相关官方页面/);assert.doesNotMatch(intro,/演艺经历|<time|<details/);
 assert.match(history,/演艺经历/);assert.doesNotMatch(history,/我的原始介绍|相关官方页面|<details/);
 assert.match(sources,/资料来源/);assert.doesNotMatch(sources,/我的原始介绍|相关官方页面|<time/);
 for(const f of memberCareerFacts(m)){assert.ok(history.includes(f.label));assert.ok(all.includes(f.label));}
 for(const p of ['intro','history','sources'])assert.equal(renderToStaticMarkup(React.createElement(MemberCareerFacts,{member:{...m,id:'none',profile:'',officialUrl:''},part:p})),'');
 assert.equal(JSON.stringify(m),before);
});
test('reviewed career consumers retain all legacy families and split migrated profile content',()=>{
 const legacy=['components/candidate-artist-experience.tsx','components/illit-artist.tsx','components/candidate/madein-design.tsx','components/candidate/triples-design.tsx'];
 const split=['app/page.tsx','components/artist-sample.tsx','components/expanded-artist.tsx','components/hearts2hearts-artist.tsx','components/itzy-artist.tsx','components/katseye-artist.tsx','components/kiiikiii-artist.tsx','components/kiof-artist.tsx','components/lesserafim-artist.tsx','components/nmixx-artist.tsx','components/saymyname-artist.tsx','components/stayc-artist.tsx','components/vvup-artist.tsx','components/candidate/badvillain-design.tsx','components/candidate/billlie-design.tsx','components/candidate/loona-design.tsx','components/candidate/meovv-design.tsx','components/candidate/newjeans-design.tsx','components/design-review/unis-design-review.tsx','components/design-review/kep1er-design-review.tsx','components/seven-redesign/artist.tsx'];
 const discover=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?discover(dir+'/'+entry.name):entry.name.endsWith('.tsx')?[dir+'/'+entry.name]:[]);
 const actual=[...discover('app'),...discover('components')].filter(file=>file!=='components/member-career-facts.tsx'&&/<MemberCareerFacts\b/.test(fs.readFileSync(file,'utf8'))).sort();
 assert.deepEqual(actual,[...legacy,...split].sort());
 for(const file of legacy)assert.equal((fs.readFileSync(file,'utf8').match(/<MemberCareerFacts\b/g)||[]).length,1,file);
 for(const file of split){const source=fs.readFileSync(file,'utf8'),calls=[...source.matchAll(/<MemberCareerFacts\b[^>]+>/g)].map(m=>m[0]);assert.equal(calls.length,3,file);assert.deepEqual(calls.map(c=>c.match(/part="([^"]+)"/)[1]),['intro','history','sources'],file);}
 const root=fs.readFileSync('app/page.tsx','utf8');assert.match(root,/const careerMember=weeeklyMemberContext/);assert.match(root,/cherrybulletMemberContext/);assert.match(root,/rocketpunchMemberContext/);
 const bad=fs.readFileSync('components/candidate/badvillain-design.tsx','utf8');assert.match(bad,/members\.find\(p=>p.id===m.id&&p.groupIds.includes\(publicData.groupId\)\)/);
 const route=fs.readFileSync('app/api/export/route.ts','utf8');assert.equal((route.match(/memberCareers:memberCareerMetadata/g)||[]).length,2);
});

test('editorial career resolver rejects missing, duplicated and unrelated identities without touching data',()=>{
 const {ScopedMemberCareerFacts}=require('./helpers/member-career-loader.cjs'),p=meta.periods[0],m=member(p),part='history';
 for(const members of [[],[{...m,groupIds:[]}],[m,{...m}]])assert.equal(ScopedMemberCareerFacts({data:{members},memberId:m.id,groupId:p.groupId,part}),null);
 const data={members:[m]},before=JSON.stringify(data),node=ScopedMemberCareerFacts({data,memberId:m.id,groupId:p.groupId,part});assert.ok(renderToStaticMarkup(node).includes('演艺经历'));assert.equal(JSON.stringify(data),before);
});
