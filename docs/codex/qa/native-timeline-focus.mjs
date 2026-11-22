// Use a dedicated background Codex tab. The caller owns the viewport and tab lifecycle.
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);

const scoped = prefix => ({title:'.'+prefix+'-title',timeline:'ol.'+prefix+'-timeline',heading:'时间轴',release:'.'+prefix+'-release-detail',media:'.'+prefix+'-film'});
const editorial = heading => ({title:'.page-heading',timeline:'ol.single-timeline',heading,release:'.release-detail',member:'.identity'});
export const nativeTimelineGroups = {
  adya:scoped('idol-adya'), witchx:scoped('wk'), youngposse:editorial('THESTORY'), bewave:editorial('Through the years'),
  candyshop:{title:'.cs-title',timeline:'ol.cs-timeline',reported:'section[data-reported-timeline="candyshop"] > ol.cs-timeline',heading:'时间轴',release:'.cs-release-detail',member:'.cs-person-detail'},
  oddyouth:scoped('oy'), geenius:scoped('idol-geenius'), tracer:scoped('tr'), spia:scoped('sp'),
};
const groupSlugs=Object.keys(nativeTimelineGroups);
// Both versions render these exact lists. The published baseline predates data-artist-timeline.
function timelineRows(config) {
  const lists=[config.timeline,config.reported].filter(Boolean).map(list=>'main#artist-content > '+list);
  return ':is('+lists.join(',')+') > li[id]';
}
const normal=s=>(s||'').normalize('NFKC').replace(/\s+/gu,'').toLowerCase();
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

function inventory(selector) {
  const visible=el=>!!el.getClientRects().length && getComputedStyle(el).visibility!=='hidden' && !el.closest('[hidden],[inert]');
  return [...document.querySelectorAll(selector)].filter(visible).map(row=>{
    const controls=[], links=[...row.querySelectorAll('a[href]')];
    for(const anchor of links) {
      if(!visible(anchor))continue;
      const raw=anchor.getAttribute('href'),url=new URL(anchor.href);
      const kind=['release','media','member'].find(k=>url.searchParams.has(k));
      if(!kind || url.origin!==location.origin || url.pathname!==location.pathname || !raw.startsWith('/artists/'))continue;
      const copies=links.filter(node=>node.getAttribute('href')===raw);
      controls.push({event:row.id,href:raw,kind,key:url.searchParams.get(kind),index:copies.indexOf(anchor),
        face:anchor.querySelector('img')?'cover':'text'});
    }
    return {event:row.id,controls};
  });
}

function geometry(anchor) {
  const row=anchor.closest('li[id]'),href=anchor.getAttribute('href');
  const duplicates=[...row.querySelectorAll('a[href]')].filter(el=>el.getAttribute('href')===href);
  const box=anchor.getBoundingClientRect(),x=box.x+box.width/2,y=box.y+box.height/2;
  const hit=x>=0&&x<document.documentElement.clientWidth&&y>=0&&y<innerHeight?document.elementFromPoint(x,y):null;
  return {width:document.documentElement.clientWidth,height:innerHeight,scrollY:Math.round(scrollY),top:Math.round(box.top),
    left:Math.round(box.left),event:row.id,index:duplicates.indexOf(anchor),focused:document.activeElement===anchor,
    focusedIndex:duplicates.indexOf(document.activeElement),visible:box.bottom>0&&box.top<innerHeight&&box.width>0&&box.height>0,
    hittable:!!hit&&anchor.contains(hit)};
}

function titleInPage(el) { return el.textContent.trim(); }
function chosenControls(events,mode) {
  const all=events.flatMap(row=>row.controls);
  if(mode==='links')return all;
  if(mode==='first')return all.length?all.filter(row=>row.event===all[0].event&&row.href===all[0].href):[];
  return all.filter((row,index)=>all.findIndex(other=>other.event===row.event&&other.href===row.href)===index);
}
function expected(design,row) {
  const list=row.kind==='member'?design.members:row.kind==='release'?design.releases:design.works;
  const item=list.find(item=>(row.kind==='member'?item.id:item.key)===row.key);
  if(!item)return [];
  return row.kind==='member'?[item.cnName,item.stageName,item.cnName+item.stageName]:[item.title];
}
function samePosition(a,b,tolerance=24) {
  return a.width===b.width&&a.height===b.height&&['scrollY','top','left'].every(k=>Math.abs(a[k]-b[k])<=tolerance);
}

export async function checkNativeTimelineFocus(tab,{
  site='https://idol-lens-private.wuke40758.chatgpt.site',groups=groupSlugs,mode='first',
  activations=['click','enter'],start=0,limit=Infinity,deadlineMs=55000,
}={}) {
  if(groups.some(slug=>!Object.hasOwn(nativeTimelineGroups,slug)) || !['first','targets','links'].includes(mode)
    || activations.some(a=>!['click','enter'].includes(a)))throw Error('Unknown native timeline case');
  const origin=new URL(site).origin,pw=tab.playwright,end=Date.now()+deadlineMs,runs=[];
  const timeout=(ms=5000)=>({timeoutMs:Math.max(1,Math.min(ms,end-Date.now()))});
  async function bounded(work) {
    if(Date.now()>=end)throw Error('deadline');
    let timer;
    try{return await Promise.race([work(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('deadline')),end-Date.now());})]);}
    finally{clearTimeout(timer);}
  }
  let cdp;
  for(const slug of groups) {
    if(Date.now()>=end)break;
    const config=nativeTimelineGroups[slug],design=require('../../../apps/idol-site/data/'+slug+'-native-design.json');
    const rowSelector=timelineRows(config);
    const directory=origin+'/artists/'+slug+'?section=updates',group={slug,attempts:[]};
    runs.push(group);
    async function readyList(reset) {
      if(await bounded(()=>tab.url())!==directory && reset)await bounded(()=>tab.goto(directory));
      const title=pw.locator('main#artist-content > '+config.title+' > h1');
      const match=config.heading==='THESTORY'?/^THE\s*STORY$/i:new RegExp('^'+config.heading+'$','i');
      await title.filter({hasText:match}).waitFor({state:'visible',...timeout(9000)});
      await pw.locator(rowSelector).first().waitFor({state:'visible',...timeout(9000)});
      if(await bounded(()=>tab.url())!==directory)throw Error('not-timeline');
    }
    try {
      await readyList(true);
      const events=await bounded(()=>pw.evaluate(inventory,rowSelector)),all=chosenControls(events,'links'),selected=chosenControls(events,mode);
      group.events=events.length;group.targets=chosenControls(events,'targets').length;group.links=all.length;
      group.width=await bounded(()=>pw.evaluate(()=>document.documentElement.clientWidth));group.selected=selected.length;
      group.cases=selected.map(({event,kind,key,index,face})=>({event,kind,key,index,face}));
      for(const [caseIndex,item] of selected.entries()) {
        if(caseIndex<start||caseIndex>=start+limit||Date.now()>=end)continue;
        const row=rowSelector+'[id='+JSON.stringify(item.event)+']';
        const selector=row+' a[href='+JSON.stringify(item.href)+']';
        const source=pw.locator(selector).nth(item.index),detailClass=config[item.kind],titles=expected(design,item);
        for(const activation of activations) {
          if(Date.now()>=end)break;
          const attempt={caseIndex,event:item.event,key:item.key,kind:item.kind,index:item.index,face:item.face,activation,ok:false};
          group.attempts.push(attempt);
          try {
            if(!detailClass||!titles.length)throw Error('unmapped-detail');
            await readyList(true);
            // Scroll the actual source into view without pre-focusing a mouse target. Pressing Shift
            // focuses the exact link only for the keyboard run. The activation itself is a real click/Enter.
            if(activation==='enter')await source.press('Shift',timeout());
            cdp??=await bounded(()=>tab.capabilities.get('cdp'));
            const exp='(()=>{const link=document.querySelectorAll('+JSON.stringify(selector)+')['+item.index+'];'
              +'if(link)link.scrollIntoView({block:"center",inline:"nearest",behavior:"instant"});})()';
            await bounded(()=>cdp.send('Runtime.evaluate',{expression:exp}));
            let prior=null,stable=false;
            const steady=Math.min(end,Date.now()+2200);
            do {
              const current=await bounded(()=>source.evaluate(geometry));attempt.before=current;
              if(prior&&current.hittable&&current.index===item.index&&current.event===item.event
                &&(activation!=='enter'||current.focused)&&samePosition(prior,current,1)){stable=true;break;}
              prior=current;await sleep(90);
            } while(Date.now()<steady);
            if(!stable)throw Error('source-not-actionable');
            if(activation==='enter')await source.press('Enter',timeout());
            else await source.click(timeout());
            const detail=pw.locator('main#artist-content '+detailClass+' h1');
            await detail.waitFor({state:'visible',...timeout(8000)});
            const heading=await bounded(()=>detail.evaluate(titleInPage)),url=await bounded(()=>tab.url());
            attempt.heading=heading;
            attempt.opened=url===new URL(item.href,origin).href && titles.some(t=>normal(t)===normal(heading));
            if(!attempt.opened)throw Error('wrong-detail');
            await bounded(()=>tab.back());
            await readyList(false);
            attempt.returned=true;
            const settle=Math.min(end,Date.now()+2200);
            do {
              const after=await bounded(()=>source.evaluate(geometry));attempt.after=after;
              attempt.sameLink=after.event===item.event&&after.index===item.index&&after.focused&&after.focusedIndex===item.index;
              attempt.samePosition=after.visible&&samePosition(attempt.before,after);
              if(attempt.sameLink&&attempt.samePosition){attempt.ok=true;break;}
              await sleep(100);
            } while(Date.now()<settle);
            if(!attempt.ok)attempt.reason=attempt.sameLink?'position-not-restored':'exact-link-not-focused';
          } catch(error) {
            const msg=String(error?.message||'');
            attempt.reason=/timeout|timed out|deadline/i.test(msg)?'timeout':
              ['not-timeline','unmapped-detail','wrong-detail','source-not-actionable'].includes(msg)?msg:'interaction-failed';
          }
        }
      }
    } catch(error) { group.reason=/timeout|timed out|deadline/i.test(String(error?.message))?'timeout':'timeline-unavailable'; }
  }
  return {probeVersion:'native-timeline-focus-v2',site:origin,mode,activations,start,limit:Number.isFinite(limit)?limit:null,
    deadlineMs,deadlineReached:Date.now()>=end,requestedGroups:groups,groups:runs};
}
