// Read-only local browser regression. Supply an existing public catalog fixture;
// this script neither creates private records nor changes the development server.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const groups=['xg','aespa','babymonster','hearts2hearts','itzy','katseye','kiiikiii','kissoflife','saymyname','stayc','illit','ive','madein','purplekiss','qwer','rescene','triples','loona','meovv','newjeans','adya','geenius','oddyouth','bewave','candyshop','youngposse'];
async function main(){
 const playwright=require(process.env.PLAYWRIGHT_MODULE||'playwright');
 const fixturePath=process.env.PUBLIC_CATALOG_FIXTURE;if(!fixturePath)throw Error('PUBLIC_CATALOG_FIXTURE is required');
 const fixture=JSON.parse(fs.readFileSync(fixturePath)),base=process.env.IDOL_BASE_URL||'http://127.0.0.1:4246';
 if(!['127.0.0.1','localhost'].includes(new URL(base).hostname))throw Error('This fixture check requires a local server');
 const out=path.resolve(process.env.QA_OUTPUT||'.member-work-public-photo-qa');fs.mkdirSync(out,{recursive:true});
 const registry=JSON.parse(fs.readFileSync(path.join(root,'data/artist-timeline-registry.json'))),portraits=JSON.parse(fs.readFileSync(path.join(root,'data/mv-public-media.json'))).portraits;
 const selectedGroups=process.env.QA_GROUPS?process.env.QA_GROUPS.split(','):groups;
 const result={base,scope:'Actual local artist components with a fixed public catalog fixture; no production save, owner access change or user IAB.',groups:selectedGroups,checks:[],issues:[],pageErrors:[],resourceFailures:[]};
 const browser=await playwright.chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 try{
  const context=await browser.newContext();
  await context.route(base+'/api/**',route=>{
   if(!['GET','HEAD'].includes(route.request().method())){result.issues.push('Unexpected API mutation: '+route.request().url());return route.abort();}
   if(new URL(route.request().url()).pathname==='/api/catalog')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(fixture)});
   return route.continue();
  });
  const page=await context.newPage();page.on('pageerror',error=>result.pageErrors.push(error.message));page.on('response',response=>{if(response.status()>=400)result.resourceFailures.push({url:response.url(),status:response.status()});});
  for(const slug of selectedGroups){
   const entry=registry.find(row=>row.path==='/artists/'+slug);assert(entry,slug);
   const member=fixture.members.find(m=>(m.groupIds.includes(entry.groupId)||m.formerGroupIds?.includes(entry.groupId))&&fixture.ratings.some(r=>r.memberIds.includes(m.id)));assert(member,slug+' related member');
   const related=new Set(fixture.ratings.filter(r=>r.memberIds.includes(member.id)).flatMap(r=>r.workIds));
   const expected=portraits.filter(p=>p.memberId===member.id&&related.has(p.workId)&&fixture.works.some(w=>w.id===p.workId&&!w.placeholder&&w.url?.includes(p.videoId)));
   for(const width of [390,1440]){
    const url=base+entry.path+'?section=members&member='+member.id;
    try{
     await page.setViewportSize({width,height:1000});await page.goto(url,{waitUntil:'networkidle',timeout:90000});
     if(slug==='newjeans')await page.locator('.nj-existing-details summary').click();
     const slots=page.locator('[data-member-work-identity="available"],[data-member-work-photo-button]');await slots.first().waitFor({timeout:30000});
     const count=await slots.count();assert.equal(count,expected.length,slug+' every public member/work tuple must reach its existing control');
     const namedSet=slots.filter({has:page.locator('[data-identity-crop]')});const frame=await namedSet.count()?namedSet.first():slots.first();await frame.scrollIntoViewIfNeeded();
     if(await frame.locator('img').count())await frame.locator('img').evaluate(image=>image.decode());
     const shown=await frame.evaluate(element=>{const image=element.querySelector('img'),svg=element.querySelector('svg[data-identity-crop]');return {label:element.getAttribute('aria-label'),sourceKind:element.getAttribute('data-identity-source'),className:element.className,src:image?.getAttribute('src'),image:image?{width:image.naturalWidth,height:image.naturalHeight}:null,crop:svg?.getAttribute('data-identity-crop'),frame:{width:element.getBoundingClientRect().width,height:element.getBoundingClientRect().height}};});
     assert(shown.frame.width>0&&shown.frame.height>0);assert(shown.label?.includes('原图'));
     const headings=await page.locator('h1,h2').allTextContents();assert(headings.some(text=>text.trim()),slug+' visible page identity');
     await frame.locator('..').screenshot({path:path.join(out,slug+'-'+width+'.png')});
     if(width===390){await frame.focus();await page.keyboard.press('Enter');}else await frame.click();
     const dialog=page.getByRole('dialog');await dialog.waitFor();await dialog.locator('img').evaluate(image=>image.decode());
     const original=await dialog.locator('img').getAttribute('src'),bound=expected.find(p=>p.src===original);assert(bound,slug+' full source must belong to the exact public tuple');
     if(shown.src)assert.equal(original,shown.src);assert((await dialog.textContent()).includes(bound.label));
     const natural=await dialog.locator('img').evaluate(image=>({width:image.naturalWidth,height:image.naturalHeight}));assert.deepEqual(natural,{width:bound.width,height:bound.height});
     await page.keyboard.press('Escape');await dialog.waitFor({state:'detached'});assert(await frame.evaluate(element=>element===document.activeElement),'focus restored to original control');
     const scroll=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));assert(scroll.scroll<=scroll.width+1,slug+' horizontal overflow');
     assert(await page.locator('[data-member-work-trigger]').count()>0,slug+' work navigation retained');
     result.checks.push({slug,width,url,memberId:member.id,headings,available:count,expected:expected.length,shown,original,natural,scroll});
    }catch(error){result.issues.push({slug,width,url,error:error.stack});}
   }
  }
 }finally{await browser.close();fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({checks:result.checks.length,issues:result.issues,pageErrors:result.pageErrors,resourceFailures:result.resourceFailures.length}));if(result.issues.length||result.pageErrors.length)process.exitCode=1;}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
