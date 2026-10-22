const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
test('member source disclosure and dedicated client/route are absent',()=>{
 const page=fs.readFileSync(path.join(root,'app/page.tsx'),'utf8');
 assert.doesNotMatch(page,/MemberSourceDisclosure|资料来源与核验说明|\/api\/member-source/);
 assert.doesNotMatch(fs.readFileSync(path.join(root,'app/globals.css'),'utf8'),/\.member-source/);
 for(const f of ['app/api/member-source/route.ts','components/member-source-disclosure.tsx','lib/idol/source-links.ts'])assert.equal(fs.existsSync(path.join(root,f)),false,f);
});
test('original member links, personal notes and score editor remain available',()=>{
 const page=fs.readFileSync(path.join(root,'app/page.tsx'),'utf8');
 assert.match(page,/<MemberCareerFacts member=\{m\}\/>/);const career=fs.readFileSync(path.join(root,'components/member-career-facts.tsx'),'utf8');assert.match(career,/member\.officialUrl/);assert.match(career,/相关官方页面/);const React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),{MemberCareerFacts}=require('./helpers/member-career-loader.cjs');const rendered=renderToStaticMarkup(React.createElement(MemberCareerFacts,{member:{id:'synthetic',groupIds:[],profile:'source profile',officialUrl:'https://example.com/member'}}));assert.match(rendered,/href="https:\/\/example.com\/member"/);assert.match(rendered,/source profile/);assert.match(page,/<Editor table="members"/);assert.match(page,/m\.note/);
});
