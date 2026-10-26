const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const data=JSON.parse(fs.readFileSync('data/badvillain-figma-public.json')),manifest=JSON.parse(fs.readFileSync('data/badvillain-image-sources.json'));
const src=fs.readFileSync('components/candidate/badvillain-design.tsx','utf8');
function render(url,catalog={works:[],members:[],ratings:[]}){
 const out={};const code=ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext('(function(require,exports){'+code+'})',{URL,URLSearchParams})(name=>{
 if(name==='react')return {...React,useEffect:()=>{},useSyncExternalStore:()=>url};
 if(name==='react/jsx-runtime')return require('react/jsx-runtime');
 if(name.endsWith('badvillain-figma-public.json'))return {default:data};
 if(name.endsWith('artist-preview'))return {artistRoute:s=>{const p=new URL(s,'https://test').searchParams;return {section:p.get('section')||'overview',member:p.get('member')};},artistWorkUrl:(w,stage,ret)=>'/?work='+w.id+'&artistReturn='+encodeURIComponent(ret),artistWorkScoreLabel:v=>v===null?'未评分':v.toFixed(1)};
 if(name.endsWith('artist-timeline-host'))return {useArtistTimelineHostOptions:()=>({catalog}),ArtistTimelineHost:()=>React.createElement('div',{'data-full-timeline':'true'})};
 if(name.endsWith('reliable-image'))return {ReliableImage:({src,alt,style})=>React.createElement('img',{src,alt,style}),ImageRecoveryProvider:({children})=>children,ImageRecoveryControls:()=>null};
 if(name.endsWith('use-artist-scroll'))return {useArtistScroll:()=>()=>{}};
 if(name.endsWith('member-works'))return {memberWorks:()=>[]};
 return new Proxy({}, {get:()=>()=>null});
 },out);
 return renderToStaticMarkup(React.createElement(out.default,{content:{groupId:data.groupId}}));
}
test('all 18 source-bound assets retain original bytes and dimensions',()=>{assert.equal(manifest.bindings.length,18);for(const row of manifest.bindings){const bytes=fs.readFileSync('public'+row.image);assert.ok(bytes.length);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),row.sha256);assert.ok(row.width>0&&row.height>0);}});
test('home shows seven named portraits and full square group photograph',()=>{const html=render('/artists/badvillain');for(const m of data.members){assert.ok(html.includes(m.cn));assert.ok(html.includes(m.image));}assert.ok(html.includes(data.hero.image));assert.ok(html.includes('aspect-ratio:1'));assert.ok(!src.includes('CandidateArtistExperience'));});
test('seven individual pages keep exact identities without speculative filler',()=>{for(const m of data.members){const html=render('/artists/badvillain?section=members&member='+m.id);assert.ok(html.includes(m.cn));assert.ok(html.includes(m.stageName));assert.ok(html.includes(m.image));assert.ok(!/待核|未知|资料待补/.test(html));}});
test('library retains four distinct group releases and separate 100RED collaboration',()=>{const html=render('/artists/badvillain?section=works');for(const r of data.releases)assert.ok(html.includes(r.image));assert.ok(html.includes('合作发行'));assert.ok(html.includes('100RED / 多位艺人共同参与，包含 BADVILLAIN'));});
test('all five release details have matching sleeves, dates, credits and tracks',()=>{for(const r of data.releases){const html=render('/artists/badvillain?section=records&release='+r.id);assert.ok(html.includes(r.image));assert.ok(html.includes(r.date));for(const t of r.tracks)assert.ok(html.includes(t.title));if(r.id==='badvillain-hurricane')assert.ok(!html.includes('Performance'));}});
test('timeline delegates to full production host, never package sample events',()=>{assert.ok(render('/artists/badvillain?section=updates').includes('data-full-timeline'));assert.ok(!Object.hasOwn(data,'timeline'));});
test('only exact group, work ID and official URL match can open private record',()=>{const m=data.media[0];const good={id:'rec28ldfRTrQ0L',url:m.watchUrl,groupIds:[data.groupId]};assert.ok(render('/artists/badvillain',{works:[good],members:[],ratings:[]}).includes('/?work=rec28ldfRTrQ0L'));assert.ok(!render('/artists/badvillain',{works:[{...good,url:'https://wrong.invalid'}],members:[],ratings:[]}).includes('/?work=rec28ldfRTrQ0L'));});
test('SBS preview stays exact independent read-only media, with no new scores',()=>{const html=render('/artists/badvillain?section=works&media=badvillain-stage-inkigayo-20240616');assert.ok(html.includes('OC470821569'));assert.ok(html.includes('stage-badvillain-inkigayo-240616.png'));assert.ok(!src.includes("method:'POST'"));assert.ok(!src.includes('localStorage'));});
