/*
 * Codex 自带浏览器中传入专用的后台测试标签页。每项结束时退出作品，调用结束后可关闭该标签。
 * const {checkPriorityMvPlayback} = await import('file:///D:/porject/idol/docs/codex/qa/priority-mv-playback.mjs');
 * const result = await checkPriorityMvPlayback(tab);
 * options.ids 可选择下列作品的子集。timeoutMs 为点击后每项最多等待的毫秒数。
 */
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const load = require('../../../apps/idol-site/tests/helpers/public-artist-loader.cjs');
const site = 'https://idol-lens-private.wuke40758.chatgpt.site';
const works = [
  {id:'rec28ldfRTrLku', title:'BILLIONAIRE', original:'Gz_yRl6703c', provider:'RUTUBE',
    origin:'https://rutube.ru', path:'/play/embed/9d692403740a2ae5e84dbd5a8ec167d0', mute:'autostartmute', value:'true'},
  {id:'rec28ldfRTrzPI', title:'Magnetic', original:'Vk5-c_v4gMU', provider:'Vimeo',
    origin:'https://player.vimeo.com', path:'/video/930729644', mute:'muted', value:'1'},
  {id:'recvxyHuKMFzlZ', title:'ATTITUDE', original:'38xYeot-ciM', provider:'Vimeo',
    origin:'https://player.vimeo.com', path:'/video/1054517686', mute:'muted', value:'1'},
];
const stage = '.detail:not(.stage-view) .video-stage';
const frameSelector = stage+' > iframe';
const attached = ['Target.attachedToTarget'];
const delay = ms => new Promise(resolve=>setTimeout(resolve,ms));

function approvedUrl(value,work,requireMute) {
  try {
    const url=new URL(value);
    return url.origin===work.origin && !url.username && !url.password && url.pathname.replace(/\/$/,'')===work.path
      && (!requireMute || (url.searchParams.getAll(work.mute).length===1 && url.searchParams.get(work.mute)===work.value));
  } catch {return false;}
}

// This function is serialized into the already mounted, approved media document.
// Return only public playback measurements and recognized provider errors.
function readMedia(body,expected) {
  if(!body)return null;
  const doc=body.ownerDocument, url=new URL(doc.location.href);
  if(url.origin!==expected.origin || url.pathname.replace(/\/$/,'')!==expected.path)return null;
  const visible=body.innerText || '';
  const blocked=visible.match(/\bBLNCTMT_[A-Z0-9_]+\b/);
  if(blocked)return {error:blocked[0]};
  if(/(?:sorry,? (?:this|the) video (?:is|does)|this video is (?:not available|unavailable)|video (?:does not exist|has been removed)|видео (?:недоступно|удалено))/i.test(visible))
    return {error:'provider-unavailable'};
  const video=body.querySelector('video');
  if(!video)return null;
  if(video.error)return {error:'MEDIA_ERR_'+video.error.code};
  if(typeof video.muted!=='boolean' || typeof video.paused!=='boolean' || typeof video.currentTime!=='number')return null;
  if(!video.muted && video.volume!==0)return {audible:true};
  if(video.paused || video.ended || video.seeking || video.readyState<2 || !video.videoWidth || !video.videoHeight
      || !Number.isFinite(video.currentTime) || video.currentTime<=0)return null;
  const sample={time:video.currentTime,w:video.videoWidth,h:video.videoHeight,muted:video.muted,
    volumeZero:video.volume===0,paused:video.paused,bytes:Number.isFinite(video.webkitVideoDecodedByteCount)?video.webkitVideoDecodedByteCount:null};
  // Buffer downloads and the nonstandard byte counter do not establish the selected stream's bitrate.
  for(const label of body.querySelectorAll('dt, th')) {
    const name=label.innerText.trim(), value=label.nextElementSibling;
    if(!/^(?:current video bitrate|actual video bitrate|当前视频码率|实际视频码率)$/i.test(name) || !value?.matches('dd, td')
        || !label.getClientRects().length || !value.getClientRects().length)continue;
    const text=value.innerText.trim(), match=text.match(/^(\d+(?:\.\d+)?)\s*([km])(?:bps|bit\/s)$/i);
    if(match && Number(match[1])>0)return {sample,kbps:Number(match[1])*(match[2].toLowerCase()==='m'?1000:1),bitrateEvidence:{label:name,value:text}};
  }
  return {sample};
}

async function checkOne(tab,cdp,work,timeoutMs) {
  const name='播放视频（'+work.provider+'）', expected={origin:work.origin,path:work.path};
  const row={id:work.id,title:work.title,name,expectedOrigin:work.origin,origin:null,count:0,frames:0,mute:null,requestedQuality:null,
    status:'unverified',samples:[],providerError:'',waitingHintSeen:false,kbps:null,bitrateEvidence:null};
  const frame=tab.playwright.locator(frameSelector), failure=tab.playwright.locator(stage+' [role="status"]');
  const url=new URL('/?view=works&work='+work.id+'&video=mv',site);
  let timer,exiting,cursor,targetId;
  function leave() {
    if(!exiting)exiting=(async()=>{
      try {
        await tab.goto('about:blank');
        if(await tab.url()==='about:blank')return;
      } catch { /* A dedicated test tab can still be closed if navigation failed. */ }
      await tab.close();
      throw Error('未能返回空白页，已关闭测试标签。');
    })();
    return exiting;
  }
  try {
    await tab.goto(url.href);
    const play=tab.playwright.getByRole('button',{name,exact:true});
    await play.first().waitFor({state:'visible',timeoutMs:12000});
    const actual=new URL(await tab.url());
    row.count=await play.count();
    const heading=await tab.playwright.locator('.detail:not(.stage-view) .music-work-title h1').first().evaluate(el=>el.textContent.trim());
    if(row.count!==1 || heading!==work.title || actual.origin!==site || actual.pathname!=='/' || actual.searchParams.get('view')!=='works'
        || actual.searchParams.get('work')!==work.id || (actual.searchParams.get('video') || 'mv')!=='mv' || await frame.count()){
      row.status='unexpected-work-or-player';return row;
    }
    if(cdp)try {cursor=(await cdp.readEvents({methods:attached,timeoutMs:0})).cursor;} catch { /* Use the frame locator. */ }
    const deadline=Date.now()+timeoutMs;
    timer=setTimeout(()=>{void leave().catch(()=>{});},timeoutMs);
    await play.click({timeoutMs:Math.min(timeoutMs,2500)});
    let mounted=false,nextErrorCheck=0;
    const body=tab.playwright.frameLocator(frameSelector).locator('body').first();
    const expression='('+readMedia.toString()+')(document.body,'+JSON.stringify(expected)+')';
    while(!exiting && Date.now()<deadline){
      const count=await frame.count();
      row.frames=Math.max(row.frames,count);
      if(count>1){row.status='unexpected-player';return row;}
      if(count===1){
        if(work.provider==='RUTUBE'&&!row.waitingHintSeen&&Date.now()>=deadline-timeoutMs+7500)
          row.waitingHintSeen=await tab.playwright.locator(stage+' + .video-start-notice[role="status"]').isVisible();
        const src=await frame.first().evaluate(el=>el.getAttribute('src'),undefined,{timeoutMs:350});
        if(!approvedUrl(src,work,true)){row.status='unexpected-player-or-mute';return row;}
        const address=new URL(src);
        mounted=true;row.origin=address.origin;row.mute=address.searchParams.get(work.mute);
        row.requestedQuality=address.searchParams.get(work.provider==='RUTUBE'?'q':'quality');
        let observation=null;
        try {observation=await body.evaluate(readMedia,expected,{timeoutMs:210});} catch { /* The media process may be separate. */ }
        if(!observation && cdp && cursor!=null && !exiting){
          try {
            if(!targetId){
              const update=await cdp.readEvents({methods:attached,afterSequence:cursor,timeoutMs:75});
              cursor=update.cursor;
              targetId=update.events?.map(event=>event.params?.targetInfo).find(info=>info?.type==='iframe' && approvedUrl(info.url,work,false))?.targetId;
            }
            if(targetId){
              const result=await cdp.send('Runtime.evaluate',{expression,returnByValue:true},{target:{targetId},timeoutMs:400});
              observation=result.result?.value;
            }
          } catch { /* A detached player is handled on the next DOM check. */ }
        }
        // A blocked RUTUBE embed can put its error inside a second frame. The
        // accessibility snapshot stays in memory; only its public error code leaves this block.
        if(!observation && work.provider==='RUTUBE' && !exiting && Date.now()>=nextErrorCheck){
          nextErrorCheck=Date.now()+350;
          try {
            const ax=await tab.getAXState({emit:false,disableDiffing:true});
            const code=(typeof ax==='string'?ax:JSON.stringify(ax)).match(/\bBLNCTMT_[A-Z0-9_]+\b/)?.[0];
            if(code)observation={error:code};
          } catch { /* Continue with the approved player if its accessibility tree is not ready. */ }
        }
        if(observation?.error){row.providerError=observation.error;row.status='provider-error';return row;}
        if(observation?.audible){row.status='mute-not-confirmed';return row;}
        if(observation?.sample){
          const sample=observation.sample, first=row.samples[0];
          if(!first || sample.time>first.time)row.samples.push(sample);
          if(observation.bitrateEvidence){row.kbps=observation.kbps;row.bitrateEvidence=observation.bitrateEvidence;}
          if(row.samples.length===2){row.status='playing';return row;}
        }
      } else if(await failure.count()){row.status='player-error';return row;}
      else if(mounted){row.status='player-disappeared';return row;}
      await delay(90);
    }
    row.status='no-confirmed-progress';
  } catch {
    row.status=exiting?'no-confirmed-progress':'unverified';
  } finally {
    clearTimeout(timer);
    await leave();
  }
  return row;
}

export async function checkPriorityMvPlayback(tab,{ids=works.map(work=>work.id),timeoutMs=10000}={}) {
  if(!Array.isArray(ids) || !ids.length || new Set(ids).size!==ids.length || !ids.every(id=>works.some(work=>work.id===id)))
    throw Error('请选择三支已核对作品中的一项或多项。');
  if(!Number.isFinite(timeoutMs) || timeoutMs<500 || timeoutMs>15000)throw Error('播放采样时限为 500 至 15000 毫秒。');
  const {workPlayback}=load('lib/idol/work-playback.ts'), rows=[];
  const plan=ids.map(id=>works.find(work=>work.id===id));
  for(const work of plan){
    const config=workPlayback(work.id,work.original,'mv',null);
    if(config?.label!==work.provider || !approvedUrl(config.embedUrl,work,true))throw Error(work.title+' 的播放器地址或静音配置已变更。');
  }
  let cdp;
  try {cdp=await tab.capabilities.get('cdp');} catch { /* The approved frame can also be observed through Playwright. */ }
  for(const work of plan)rows.push(await checkOne(tab,cdp,work,timeoutMs));
  return {site,method:'站内静音短播。两次有效媒体时间前进即退出。码率只取播放器明确显示的实际视频码率，未测得记 null。',rows};
}

export default checkPriorityMvPlayback;
