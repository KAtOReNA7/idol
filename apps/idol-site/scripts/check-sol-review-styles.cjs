#!/usr/bin/env node
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{createRequire}=require('node:module');
const root=path.resolve(__dirname,'..');const host=fs.existsSync(path.join(root,'node_modules'))?root:path.resolve(root,'../idol-day19-restored');const requireHost=createRequire(path.join(host,'package.json'));const postcss=requireHost('postcss'),lightningcss=requireHost('lightningcss');
const result=[];
for(const slug of ['rescene','purplekiss']){
 const file=path.join(root,`components/design-review/${slug}-visual-review.css`),css=fs.readFileSync(file,'utf8'),ast=postcss.parse(css);let selectors=0,rules=0;
 ast.walkRules(rule=>{rules++;for(const selector of rule.selectors){selectors++;assert(selector.trim().startsWith(`.${slug}-visual-review`),selector);assert(!/(^|[\s,>+~])(?:body|html)\b|:root|:global|:host/.test(selector),selector);}});
 ast.walkDecls(decl=>{assert(!/NotoSansSC|Noto Sans SC/.test(decl.value)||decl.prop==='src','Use group-specific font aliases');if(/url\(/.test(decl.value)){assert.equal(decl.prop,'src');assert(/^url\('\/fonts\/unis\/NotoSansSC-(Regular|Bold)\.woff2'\) format\('woff2'\)$/.test(decl.value),'Unverified asset');}});
 lightningcss.transform({filename:file,code:Buffer.from(css),minify:true,errorRecovery:false});
 result.push({group:slug,rules,selectors,bytes:Buffer.byteLength(css),sha256:crypto.createHash('sha256').update(css).digest('hex')});
}
const hostCSS=fs.readFileSync(path.join(root,'components/design-review/sol-visual-host.css'),'utf8');postcss.parse(hostCSS).walkRules(rule=>{for(const selector of rule.selectors)assert(/^\.(rescene|purplekiss)-visual-review(?:\s|$)/.test(selector),selector)});
console.log(JSON.stringify({ok:true,styles:result},null,2));
