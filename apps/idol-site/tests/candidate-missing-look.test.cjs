/* eslint-disable @typescript-eslint/no-require-imports -- Node synthetic SSR and CSS contract tests. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),postcss=require('postcss');
const rules=new Map();postcss.parse(fs.readFileSync('components/candidate-artist-base.css','utf8')).walkRules(r=>rules.set(r.selector,Object.fromEntries(r.nodes.filter(n=>n.type==='decl').map(n=>[n.prop,n.value]))));
test('shared candidate missing looks use compact opaque explanation without changing enabled photos',()=>{
 assert.deepEqual(rules.get(':where(.candidate-artist) .ca-look:disabled'),{opacity:'1','aspect-ratio':'auto'});
 assert.deepEqual(rules.get(':where(.candidate-artist) .ca-look:disabled>.ca-placeholder'),{height:'auto','min-height':'120px',color:'var(--ca-ink)'});
 assert.equal(rules.get(':where(.candidate-artist) .ca-look')['aspect-ratio'],'4/5');
 assert.equal(rules.get(':where(.candidate-artist) .ca-look>.ca-placeholder').height,'100%');
});
// Reuse the real-component synthetic renderer, without registering its density tests.
const harness=fs.readFileSync('tests/candidate-density.test.cjs','utf8').split("for(const [slug,count]")[0];
const context={require,URL,URLSearchParams,AbortController,DOMException,setTimeout,clearTimeout};vm.runInNewContext(harness+';globalThis.renderCandidate=renderer;globalThis.makeScenario=scenario;',context);
for(const slug of ['badvillain','qwer','atheart','meovv'])test(`${slug}: missing look stays disabled while a verified synthetic photo remains enabled`,()=>{
 const {c,data,last}=context.makeScenario(slug,2),rating=data.ratings[0];
 rating.photo={table:'ratings',recordId:rating.id,index:0,kind:'本 MV 截图',nativeIdentity:{memberId:last.id,workId:rating.workIds[0]}};rating.personalPhotoEligible=true;
 const html=context.renderCandidate(data,`/artists/${slug}?section=members&member=${last.id}`).render(c);
 const buttons=[...html.matchAll(new RegExp('<button[^>]*class="'+(slug==='meovv'?'mv-look-photo':'ca-look')+'"[^>]*>[\\s\\S]*?<\\/button>','g'))].map(m=>m[0]);assert.equal(buttons.length,3);
 assert.ok(!buttons[0].includes('disabled=""'));assert.ok(buttons[0].includes('<img'));assert.ok(buttons[0].includes('aria-haspopup="dialog"'));
 for(const b of buttons.slice(1)){assert.ok(b.includes('disabled=""'));assert.ok(b.includes(slug==='meovv'?'mv-empty-image':'ca-placeholder'));assert.ok(b.includes('本 MV 个人造型图暂缺'));assert.ok(!b.includes('<img'));}
});
