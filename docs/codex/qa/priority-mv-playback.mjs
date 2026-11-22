/*
 * Codex 自带浏览器中传入专用的后台测试标签页。每项结束时退出作品，调用结束后可关闭该标签。
 * const {checkPriorityMvPlayback} = await import('file:///D:/porject/idol/docs/codex/qa/priority-mv-playback.mjs');
 * const result = await checkPriorityMvPlayback(tab);
 * options.ids 可指定实际待查作品。默认跳过已验收并停测的《BILLIONAIRE》。timeoutMs 为点击后每项最多等待的毫秒数。
 * 脚本回归：node --test docs/codex/qa/priority-mv-playback.test.mjs
 */
import {checkOkVideo,onWork} from './ok-video-playback.mjs';
const site = 'https://idol-lens-private.wuke40758.chatgpt.site';
const works = [
  {id:'rec28ldfRTrLku', title:'BILLIONAIRE', original:'Gz_yRl6703c', provider:'OK Video', explicitOnly:true,
    origin:'https://ok.ru', path:'/videoembed/9392431106679'},
  {id:'rec28ldfRTrzPI', title:'Magnetic', original:'Vk5-c_v4gMU', provider:'Vimeo',
    origin:'https://player.vimeo.com', path:'/video/930729644', mute:'muted', value:'1'},
  {id:'recvxyOz5X2J0A', title:'Attention', original:'js1CtxSY38I', provider:'OK Video',
    origin:'https://ok.ru', path:'/videoembed/10326677850722',duration:262.25,width:3840,height:2160,quality:'2160p'},
  {id:'recvxyOz5XSxiH', title:'ETA', original:'jOTfBlKSQYY', provider:'OK Video',
    origin:'https://ok.ru', path:'/videoembed/5970279860834',duration:218,width:1920,height:1080,quality:'1080p'},
  {id:'recvxyHuKMFzlZ', title:'ATTITUDE', original:'38xYeot-ciM', provider:'Vimeo',
    origin:'https://player.vimeo.com', path:'/video/1054517686', mute:'muted', value:'1'},
];
const stage = '.detail:not(.stage-view) .video-stage';
const frameSelector = stage+' > iframe';
const attached = ['Target.attachedToTarget'];
const delay = ms => new Promise(resolve=>setTimeout(resolve,ms));

export function acceptPlaybackTime(samples,sample) {
  if (Number.isFinite(sample?.time) && sample.time>0 && samples.length<2 && (!samples.length || sample.time>samples[0].time)) {
    samples.push(sample);
  }
  return samples.length===2;
}

export async function leavePlaybackTab(tab) {
  try {
    await tab.goto('about:blank');
    if(await tab.url()==='about:blank')return;
  } catch { /* A dedicated test tab can still be closed if navigation failed. */ }
  await tab.close();
  throw Error('未能返回空白页，已关闭测试标签。');
}

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
  // The scoped IAB locator verifies the embedding element's exact src. Its DOM
  // projection does not always expose ownerDocument.location. Check it when present.
  const href=body.ownerDocument?.location?.href ?? body.baseURI;
  if(href){
    const url=new URL(href);
    if(url.origin!==expected.origin || url.pathname.replace(/\/$/,'')!==expected.path)return null;
  }
  const visible=body.innerText || '';
  const blocked=visible.match(/\bBLNCTMT_[A-Z0-9_]+\b/);
  if(blocked)return {error:blocked[0]};
  if(/couldn.t verify the security of your connection/i.test(visible))return {error:'provider-connection-restricted'};
  if(/(?:sorry,? (?:this|the) video (?:is|does)|this video is (?:not available|unavailable)|video (?:does not exist|has been removed)|видео (?:недоступно|удалено))/i.test(visible))
    return {error:'provider-unavailable'};
  const videos=Array.from(body.querySelectorAll('video'));
  const playing=videos.filter(video=>video.paused===false && !video.ended);
  if(playing.some(video=>video.muted===false && video.volume!==0))return {audible:true};
  const video=playing.find(video=>!video.error && !video.seeking && video.readyState>=2 && video.videoWidth>0
    && video.videoHeight>0 && Number.isFinite(video.currentTime) && video.currentTime>0 && (video.muted===true || video.volume===0));
  if(!video){
    if(videos.length && videos.every(element=>element.error?.code))return {error:'MEDIA_ERR_'+videos[0].error.code};
    return null;
  }
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
    status:'unverified',samples:[],samePage:false,providerError:'',waitingHintSeen:false,kbps:null,bitrateEvidence:null};
  const frame=tab.playwright.locator(frameSelector), failure=tab.playwright.locator(stage+' [role="status"]');
  const url=new URL('/?view=works&work='+work.id+'&video=mv',site);
  let cursor,targetId;
  try {
    await tab.goto(url.href);
    const play=tab.playwright.getByRole('button',{name,exact:true});
    await play.first().waitFor({state:'visible',timeoutMs:12000});
    row.count=await play.count();
    const heading=await tab.playwright.locator('.detail:not(.stage-view) .music-work-title h1').first().evaluate(el=>el.textContent.trim());
    if(row.count!==1 || heading!==work.title || !onWork(await tab.url(),url) || await frame.count()){
      row.status='unexpected-work-or-player';return row;
    }
    if(cdp)try {cursor=(await cdp.readEvents({methods:attached,timeoutMs:0})).cursor;} catch { /* Use the frame locator. */ }
    await play.click({timeoutMs:Math.min(timeoutMs,2500)});
    const deadline=Date.now()+timeoutMs;
    const remaining=limit=>Math.max(1,Math.min(limit,deadline-Date.now()));
    let mounted=false,missing=false,nextErrorCheck=0;
    await delay(Math.min(450,Math.floor(timeoutMs/4)));
    const expression='('+readMedia.toString()+')(document.body,'+JSON.stringify(expected)+')';
    while(Date.now()<deadline){
      const count=await frame.count();
      row.frames=Math.max(row.frames,count);
      if(count>1){row.status='unexpected-player';return row;}
      if(count===1){
        if(work.provider==='RUTUBE'&&!row.waitingHintSeen&&Date.now()>=deadline-timeoutMs+7500)
          row.waitingHintSeen=await tab.playwright.locator(stage+' + .video-start-notice[role="status"]').isVisible();
        let src;
        try {src=await frame.first().evaluate(el=>el.getAttribute('src'),undefined,{timeoutMs:remaining(500)});}
        catch {await delay(90);continue;}
        if(!approvedUrl(src,work,true)){row.status='unexpected-player-or-mute';return row;}
        const address=new URL(src);
        mounted=true;missing=false;row.origin=address.origin;row.mute=address.searchParams.get(work.mute);
        row.requestedQuality=address.searchParams.get(work.provider==='RUTUBE'?'q':'quality');
        let observation=null;
        const body=tab.playwright.frameLocator(frameSelector+'[src='+JSON.stringify(src)+']').locator('body').first();
        try {observation=await body.evaluate(readMedia,expected,{timeoutMs:remaining(500)});} catch { /* The media process may be separate. */ }
        if(!observation && cdp && cursor!=null && Date.now()<deadline){
          try {
            const update=await cdp.readEvents({methods:attached,afterSequence:cursor,timeoutMs:targetId?0:remaining(75)});
            cursor=update.cursor;
            const newest=update.events?.map(event=>event.params?.targetInfo).findLast(info=>info?.type==='iframe' && approvedUrl(info.url,work,false));
            if(newest)targetId=newest.targetId;
            if(targetId && Date.now()<deadline){
              const result=await cdp.send('Runtime.evaluate',{expression,returnByValue:true},{target:{targetId},timeoutMs:remaining(500)});
              observation=result.result?.value;
            }
          } catch {targetId=undefined;}
        }
        // A blocked RUTUBE embed can put its error inside a second frame. The
        // accessibility snapshot stays in memory; only its public error code leaves this block.
        if(!observation && work.provider==='RUTUBE' && Date.now()>=nextErrorCheck){
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
          if(row.samples.length && observation.sample.time<row.samples[0].time)row.samples.length=0;
          const finished=acceptPlaybackTime(row.samples,observation.sample);
          if(observation.bitrateEvidence){row.kbps=observation.kbps;row.bitrateEvidence=observation.bitrateEvidence;}
          if(finished){
            row.samePage=onWork(await tab.url(),url);
            row.status=row.samePage && await frame.count()===1?'playing':'unexpected-work-or-player';
            return row;
          }
        }
      } else if(await failure.count()){row.status='player-error';return row;}
      else if(mounted){
        missing=true;targetId=undefined;row.samples.length=0;row.kbps=null;row.bitrateEvidence=null;
      }
      if(Date.now()<deadline)await delay(remaining(90));
    }
    row.status=missing?'player-disappeared':'no-confirmed-progress';
  } catch {
    row.status='unverified';
  } finally {
    await leavePlaybackTab(tab);
  }
  return row;
}

export async function checkPriorityMvPlayback(tab,{ids=works.filter(work=>!work.explicitOnly).map(work=>work.id),timeoutMs=10000}={}) {
  if(!Array.isArray(ids) || !ids.length || new Set(ids).size!==ids.length || !ids.every(id=>works.some(work=>work.id===id)))
    throw Error('请选择已核对作品中的一项或多项。');
  if(!Number.isFinite(timeoutMs) || timeoutMs<500 || timeoutMs>15000)throw Error('播放采样时限为 500 至 15000 毫秒。');
  const {createRequire}=await import('node:module');
  const require=createRequire(import.meta.url);
  const loaderPath=require.resolve('../../../apps/idol-site/tests/helpers/public-artist-loader.cjs');
  // A persistent browser QA session may span multiple deployments.
  delete require.cache[loaderPath];
  const load=require(loaderPath);
  const {workPlayback}=load('lib/idol/work-playback.ts'), rows=[];
  const plan=ids.map(id=>works.find(work=>work.id===id));
  for(const work of plan){
    const config=workPlayback(work.id,work.original,'mv',null);
    if(config?.label!==work.provider || !approvedUrl(config.embedUrl,work,work.provider!=='OK Video'))throw Error(work.title+' 的播放器地址或静音配置已变更。');
  }
  let cdp;
  try {cdp=await tab.capabilities.get('cdp');} catch { /* The approved frame can also be observed through Playwright. */ }
  for(const work of plan) {
    if(work.provider==='OK Video')rows.push(await checkOkVideo(tab,work,site,timeoutMs));
    else rows.push(await checkOne(tab,cdp,work,timeoutMs));
  }
  return {site,method:'站内静音短播。两次有效媒体时间前进即退出。码率只取播放器明确显示的实际视频码率，未测得记 null。',rows};
}

export default checkPriorityMvPlayback;
