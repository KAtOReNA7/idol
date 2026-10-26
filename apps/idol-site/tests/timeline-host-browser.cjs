'use strict';
// Optional REAL browser QA. Uses an already available Playwright; never installs.
// Exit 2 means the browser runtime is unavailable, never a passed/skipped test.
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
async function main(){
 let playwright;
 const candidates=process.env.PLAYWRIGHT_MODULE?[process.env.PLAYWRIGHT_MODULE]:['playwright',...(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?[path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright')]:[])];
 for(const candidate of candidates){try{playwright=require(candidate);break;}catch{}}
 if(!playwright){console.error('BROWSER_NOT_RUN: existing Playwright module unavailable; no dependency installation attempted.');process.exitCode=2;return;}

 const directory=path.resolve(process.argv[2]||'.timeline-host-preview');
 const output=path.resolve(process.argv[3]||'.timeline-host-browser-results');
 if(!fs.existsSync(path.join(directory,'preview.js')))throw new Error('Build the fixture before browser QA.');
 fs.mkdirSync(output,{recursive:true});
 const server=http.createServer((request,response)=>{
  const url=new URL(request.url,'http://fixture.invalid');
  const file=/^\/artists\/fixture-[abc]$/.test(url.pathname)||url.pathname==='/'?'index.html':url.pathname.slice(1);
  if(!['index.html','preview.js','preview.css'].includes(file)){response.writeHead(404).end();return;}
  response.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html; charset=utf-8');
  response.end(fs.readFileSync(path.join(directory,file)));
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${server.address().port}`;
 let browser;
 const results={scope:'Real local host fixture only; global journey/save/editor/production not supplied.',checks:[],consoleErrors:[],blockedExternalRequests:[]};
 try{
  try{browser=await playwright.chromium.launch({headless:true});}
  catch(error){console.error('BROWSER_NOT_RUN: '+String(error));fs.writeFileSync(path.join(output,'BROWSER_NOT_RUN.json'),JSON.stringify({reason:String(error),installed:false},null,2));process.exitCode=2;return;}

  const page=await browser.newPage();
  page.on('pageerror',error=>results.consoleErrors.push(String(error)));
  await page.route('**/*',route=>{
   if(new URL(route.request().url()).origin!==base){results.blockedExternalRequests.push(route.request().url());return route.abort();}
   return route.continue();
  });
  await page.goto(base+'/artists/fixture-a?section=updates');
  await page.locator('[data-timeline-host="recFixtureGroupA"][data-timeline-ready="true"]').waitFor();
  for(const width of [320,390,1280]){
   await page.setViewportSize({width,height:900});
   await page.locator('details.at-sources summary').first().click();
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),'no horizontal overflow at '+width);
   await page.screenshot({path:path.join(output,`host-${width}.png`),fullPage:true});
   await page.locator('details.at-sources summary').first().click();
   results.checks.push({name:`layout-${width}`,passed:true});
  }
  await page.getByRole('button',{name:'发行',exact:true}).click();
  await page.waitForURL(/timelineType=release/);
  assert.equal(await page.getByRole('button',{name:'发行',exact:true}).getAttribute('aria-pressed'),'true');
  await page.getByRole('button',{name:'全部',exact:true}).click();
  await page.getByRole('button',{name:'全部已核事件',exact:true}).click();
  await page.getByRole('button',{name:'最早优先',exact:true}).click();
  const priorUrl=page.url();
  await page.getByLabel('合成团',{exact:true}).selectOption('recFixtureGroupB');
  await page.locator('[data-timeline-host="recFixtureGroupB"]').waitFor();
  await page.goBack();
  await page.locator('[data-timeline-host="recFixtureGroupA"]').waitFor();
  assert.equal(page.url(),priorUrl);
  assert.equal(await page.getByRole('button',{name:'最早优先',exact:true}).getAttribute('aria-pressed'),'true');
  results.checks.push({name:'controlled-filters-and-browser-A-B-A',passed:true});
  const summary=page.locator('details.at-sources summary').first();
  await summary.focus();await page.keyboard.press('Enter');
  assert.equal(await summary.evaluate(node=>node.parentElement.open),true);
  results.checks.push({name:'source-summary-keyboard',passed:true});
  await page.getByLabel('资料状态',{exact:true}).selectOption('error');
  await page.getByRole('button',{name:'重新读取时间轴'}).click();
  await page.locator('[data-timeline-ready="true"]').waitFor();
  await page.getByLabel('资料状态',{exact:true}).selectOption('loading');
  await page.getByText('正在读取大事时间轴…',{exact:true}).waitFor();
  await page.getByLabel('资料状态',{exact:true}).selectOption('ready');
  await page.locator('[data-timeline-ready="true"]').waitFor();
  results.checks.push({name:'loading-error-retry',passed:true});
  await page.getByLabel('宿主模拟守卫',{exact:true}).selectOption('dirty');
  await page.locator('[data-timeline-event-trigger="fixture-multi-target"][data-timeline-target-id="recFixtureMemberA"]').click();
  assert.equal(await page.getByLabel('模拟目标页').count(),0,'blocked callback cannot leave fixture host');
  await page.getByLabel('宿主模拟守卫',{exact:true}).selectOption('clean');
  const target='[data-timeline-event-trigger="fixture-multi-target"][data-timeline-target-kind="member"][data-timeline-target-id="recFixtureMemberA2"]';
  await page.locator(target).click();
  await page.getByLabel('模拟目标页').waitFor();
  await page.getByRole('button',{name:'浏览器 Back 返回时间轴'}).click();
  await page.locator(target).waitFor();
  await page.waitForFunction(selector=>document.querySelector(selector)===document.activeElement,target);
  results.checks.push({name:'explicit-host-block-and-exact-target-back',passed:true});
  assert.deepEqual(results.consoleErrors,[]);
  fs.writeFileSync(path.join(output,'RESULTS.json'),JSON.stringify(results,null,2));
  console.log(JSON.stringify({checks:results.checks.length,passed:true,output}));
 }finally{
  if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));
 }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
