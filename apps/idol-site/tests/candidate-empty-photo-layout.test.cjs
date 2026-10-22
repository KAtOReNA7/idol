/* eslint-disable @typescript-eslint/no-require-imports -- Node CSS contract tests. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),postcss=require('postcss');
function rule(file,selector){let found;postcss.parse(fs.readFileSync(file,'utf8')).walkRules(r=>{if(r.selector===selector)found=r;});assert.ok(found,selector);return found;}
const values=r=>Object.fromEntries(r.nodes.filter(n=>n.type==='decl').map(n=>[n.prop,n.value]));
test('i-dle mobile missing cast photo hides only the adjacent redundant label',()=>{
 const file='app/idle-experience.css',prefix='.candidate-idle-experience .cast-card .photo-empty';
 const label=rule(file,prefix+'+.image-label');assert.equal(label.parent.name,'media');assert.equal(label.parent.params,'(max-width:760px)');assert.equal(values(label).display,'none');
 assert.equal(values(rule(file,prefix)).padding,'8px');assert.equal(values(rule(file,prefix+'>svg')).display,'none');
 // The existing missing/error message remains; loaded img/a and its sibling label do not match.
 const source=fs.readFileSync('app/page.tsx','utf8');assert.ok(source.includes('<div className="photo-empty">'));assert.ok(source.includes('<span className="image-label">{kind}</span>'));
 assert.ok(source.includes("'图片暂时无法加载'"));assert.ok(source.includes("'暂无 MV 截图'"));
 const hidden=[];postcss.parse(fs.readFileSync(file,'utf8')).walkRules(r=>{if(r.nodes.some(d=>d.prop==='display'&&d.value==='none')&&r.selector.includes('image-label'))hidden.push(r.selector)});assert.deepEqual(hidden,[prefix+'+.image-label']);
});
test('MEOVV missing MV look overrides disabled opacity and tall ratio only for disabled buttons',()=>{
 const file='app/artists/meovv/meovv-artist.css',prefix='.meovv-editorial .mv-look-photo:disabled';
 assert.deepEqual(values(rule(file,prefix)),{opacity:'1','aspect-ratio':'auto'});
 assert.deepEqual(values(rule(file,prefix+'>.mv-empty-image')),{height:'auto','min-height':'120px',color:'var(--mv-ink)'});
 const source=fs.readFileSync('components/candidate/meovv-design.tsx','utf8');assert.match(source,/className="mv-look-photo" disabled=\{!item.photo\}/);assert.ok(source.includes('empty="本 MV 个人造型图暂缺"'));
 const base=rule('components/candidate-artist-base.css',':where(.candidate-artist) .ca-look');assert.equal(values(base)['aspect-ratio'],'4/5');
});
