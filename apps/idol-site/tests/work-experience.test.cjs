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

test('the official group palettes reach the shared player, title and member controls',()=>{
 const postcss=require('postcss');
 const generated=postcss.parse(fs.readFileSync('app/work-theme-tokens.css','utf8'));
 const bridge=postcss.parse(fs.readFileSync('app/work-experience.css','utf8'));
 const expected={
  itzy:{paper:'#e5efe8',surface:'#cce0d8',ink:'#153e3c',muted:'#405f5b',heading:'ItzyDisplay',button:'var(--blush)',buttonInk:'var(--ink)'},
  lesserafim:{paper:'#0d1721',surface:'#1c2b3a',ink:'#edf3f5',muted:'#b6c6cf',heading:'LeDisplay',button:'var(--rose)',buttonInk:'var(--paper)'},
  nmixx:{paper:'#f1ece2',surface:'#eee7db',ink:'#302b24',muted:'#625747',heading:'NMixxDisplay',button:'var(--rose)',buttonInk:'#faf7ee'},
 };
 for(const [slug,style] of Object.entries(expected)){
  const selector='.work-experience[data-work-theme="'+slug+'"]';
  const declarations=rule=>Object.fromEntries(rule.nodes.filter(n=>n.type==='decl').map(n=>[n.prop,n.value]));
  const colors=declarations(generated.nodes.find(rule=>rule.selector==='body '+selector));
  const action=declarations(bridge.nodes.find(rule=>rule.selector===selector));
  assert.deepEqual([colors['--paper'],colors['--white'],colors['--ink'],colors['--muted']],[style.paper,style.surface,style.ink,style.muted]);
  assert.equal(colors['--work-heading-style'],'normal');
  assert.ok(colors['--font-editorial'].startsWith(style.heading+','));
  assert.equal(action['--artist-accent'],style.button);
  assert.equal(action['--artist-action-ink'],style.buttonInk);
 }
 const scope=Object.keys(expected).map(slug=>'[data-work-theme="'+slug+'"]').join(',');
 const artists=bridge.nodes.find(rule=>rule.selector==='body .work-experience:is('+scope+')');
 assert.ok(artists.nodes.some(rule=>rule.selector?.includes('.video-play')&&rule.nodes.some(decl=>decl.prop==='background'&&decl.value==='var(--artist-accent)')));
 assert.ok(artists.nodes.some(rule=>rule.selector?.includes('.editor-open')&&rule.nodes.some(decl=>decl.prop==='min-height'&&decl.value==='44px')));
});
