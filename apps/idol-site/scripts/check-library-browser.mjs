import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';

const {chromium} = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = new URL(process.argv[2] || 'http://127.0.0.1:8787');
if (!['127.0.0.1', 'localhost', '[::1]'].includes(base.hostname)) throw Error('Use a local synthetic preview.');
const output = process.argv[3];
if (output) fs.mkdirSync(output, {recursive:true});
const browser = await chromium.launch({headless:true, executablePath:process.env.CHROMIUM_PATH});
const results = [];
try {
 for (const width of [320,390,1440]) {
  const page = await browser.newPage({viewport:{width,height:900}});
  await page.route('**/*', route => new URL(route.request().url()).origin === base.origin ? route.continue() : route.abort());
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(new URL('/?view=works',base).href);
  const card = page.locator('.work-card').first();
  await card.waitFor();
  await page.evaluate(async () => {await document.fonts.ready; window.scrollTo(0,0);});
  const layout = await card.evaluate(node => ({
   cardTop:node.getBoundingClientRect().top,
   titleTop:node.querySelector('h3').getBoundingClientRect().top,
   titleBottom:node.querySelector('h3').getBoundingClientRect().bottom,
   bottomNavTop:document.querySelector('.music-bottom-nav').getBoundingClientRect().top,
   overflow:document.documentElement.scrollWidth>innerWidth,
  }));
  assert.equal(layout.overflow,false);
  if (output) await page.screenshot({path:path.join(output,`library-${width}.png`)});
  const id = await card.getAttribute('data-browse-anchor');
  await card.click();
  await page.locator('main button.back').first().click();
  await page.waitForFunction(id => document.activeElement?.getAttribute('data-browse-anchor') === id,id);
  const more = page.getByRole('button',{name:'更多筛选'});
  let touchTargets;
  if (width <= 390) {
   assert.ok(layout.titleBottom < layout.bottomNavTop);
   assert.equal(await page.locator('select[data-library-focus=sort]').isVisible(), false);
   const chips = await page.locator('.lb-stage-options button').evaluateAll(buttons=>buttons.map(button=>{
    const {left,right,top,bottom,width,height}=button.getBoundingClientRect();
    return {left,right,top,bottom,width,height};
   }));
   const toggle = await more.boundingBox();
   assert.equal(chips.length,4);
   for (const chip of chips) {
    assert.ok(chip.width>=44 && chip.height>=44);
    assert.ok(toggle.y>=chip.bottom, 'The filter toggle must sit below the stage buttons.');
   }
   assert.ok(chips[1].left>=chips[0].right && chips[3].top>=chips[1].bottom);
   assert.ok(toggle.width>=44 && toggle.height>=44);
   touchTargets={count:chips.length+1,minimumHeight:Math.min(toggle.height,...chips.map(chip=>chip.height)),overlap:false};
   await more.click();
  }
  await page.locator('select[data-library-focus=sort]').selectOption('release-desc');
  if (width <= 390) {
   await page.getByRole('button',{name:'收起筛选'}).click();
   assert.equal(await page.locator('select[data-library-focus=sort]').isVisible(),false);
  }
  const conditions=page.locator('.lb-active-conditions');
  assert.match(await conditions.innerText(),/新到旧/);
  await conditions.getByRole('button',{name:/撤销/}).first().click();
  await page.getByRole('button',{name:/^有舞台/}).click();
  assert.equal(await page.getByRole('button',{name:/^有舞台/}).getAttribute('aria-pressed'),'true');
  await conditions.getByRole('button',{name:'重置全部条件'}).click();
  assert.equal(await page.getByRole('button',{name:/^全部（/}).getAttribute('aria-pressed'),'true');
  let keyboard = null;
  if (width <= 390) {
   const trigger = page.getByRole('button',{name:'打开导航'});
   await trigger.click();
   const dialog = page.getByRole('dialog',{name:'网站导航'});
   await dialog.getByRole('button',{name:'关闭导航'}).waitFor();
   let inside=true;
   for (const key of [...Array(17).fill('Tab'),...Array(17).fill('Shift+Tab')]) {
    await page.keyboard.press(key);
    inside &&= await dialog.evaluate(node=>node.contains(document.activeElement));
   }
   assert.equal(inside,true);
   if (output) await page.screenshot({path:path.join(output,`navigation-${width}.png`)});
   await page.keyboard.press('Escape');
   await dialog.waitFor({state:'hidden'});
   await page.waitForFunction(()=>document.querySelector('.music-menu')?.getAttribute('aria-expanded')==='false' && document.activeElement===document.querySelector('.music-menu'));
   assert.equal(await trigger.getAttribute('aria-expanded'),'false');
   assert.equal(await trigger.evaluate(node=>node===document.activeElement),true);
   keyboard={containedSteps:34,escapeClosed:true,triggerRestored:true};
  }
  assert.deepEqual(errors,[]);
  results.push({width,...layout,detailFocusRestored:true,filterAndReset:true,touchTargets,keyboard,errors});
  await page.close();
 }
 if (output) fs.writeFileSync(path.join(output,'library-check.json'),JSON.stringify(results,null,2));
 console.log(JSON.stringify(results,null,2));
} finally {await browser.close();}
