const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
for(const [file,selector] of [['unis-design-review.css','.unis-figma .uf-main'],['kep1er-figma-design.css','.kep1er-figma .kf-main']])test(`${selector} owns its geometry independently of global main`,()=>{
 const css=fs.readFileSync(`components/design-review/${file}`,'utf8');
 const body=css.slice(css.indexOf(selector+'{')).split('}')[0];
 for(const declaration of ['width:100%','max-width:none','margin:0','padding:0'])assert.ok(body.includes(declaration),declaration);
});
test('Kep1er tracks content width including scrollbar changes and preserves clean public copy',()=>{
 const source=fs.readFileSync('components/design-review/kep1er-design-review.tsx','utf8');
 assert.ok(source.includes('Math.min(document.documentElement.clientWidth,2560)'));
 assert.ok(source.includes('observer.observe(document.documentElement)'));
 assert.ok(source.includes('observer.disconnect()'));
 assert.ok(!source.includes('alt={content.hero.caption}'));
 for(const text of ['资料照不代表逐人即时活动状态','日期待确认'])assert.ok(!source.includes(text));
});
test('Kep1er clips only decorative backgrounds and retains absolute hero CTA anchoring',()=>{
 const css=fs.readFileSync('components/design-review/kep1er-figma-design.css','utf8');
 assert.ok(css.includes('.kep1er-figma .kf-native-page-background,.kep1er-figma .kf-native-hero-background,.kep1er-figma .kf-native-selected-background{overflow:clip}'));
 assert.ok(css.includes('.kep1er-figma .kf-hero-members.kf-has-native-control{position:absolute}'));
 assert.ok(!/\.kf-main\s*\{[^}]*overflow\s*:\s*(hidden|clip)/.test(css));
});
test('UNIS intermediate desktop actions follow the full identity block in normal grid rows',()=>{
 const css=fs.readFileSync('components/design-review/unis-design-review.css','utf8');
 const last=css.slice(css.lastIndexOf('@media(min-width:700px) and (max-width:1199px)'));
 assert.ok(last.includes('grid-template-rows:max-content max-content'));
 assert.ok(last.includes('.uf-hero-image{grid-row:1 / span 2}'));
 assert.ok(last.includes('.uf-hero-actions{grid-row:2;margin-top:0}'));
});
