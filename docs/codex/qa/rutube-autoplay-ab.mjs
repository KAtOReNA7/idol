// Run "node docs/codex/qa/rutube-autoplay-ab.mjs --serve", then pass the printed loopback origin and a dedicated Codex IAB tab to checkRutubeAutoplayAB.
import {acceptPlaybackTime,leavePlaybackTab} from './priority-mv-playback.mjs';

const workId='rec28ldfRTrLku', videoId='Gz_yRl6703c';
const controlEmbed='https://rutube.ru/play/embed/9d692403740a2ae5e84dbd5a8ec167d0?autostartmute=true&q=1080';

// Runs on our local parent page. The public message protocol is the only player interface.
function monitorFixture(expected,stop,acceptTime) {
  const panel=document.querySelector('#measurement');
  const status={condition:document.body.dataset.condition,observedSrc:null,frames:0,events:[],samples:[],
    reportedMuted:null,reportedQuality:null,providerError:null,ended:null};
  function write(){panel.textContent=JSON.stringify(status);}
  function finish(reason){
    if(status.ended)return;
    status.ended=reason;write();stop();
  }
  const host=document.querySelector('#player');
  new MutationObserver(()=>{
    const frames=host.querySelectorAll('iframe');
    if(!frames.length)return;
    status.frames=Math.max(status.frames,frames.length);
    status.observedSrc=frames[0].src;
    if(frames.length!==1 || frames[0].src!==expected)finish('unexpected-player');
    else write();
  }).observe(host,{childList:true,subtree:true});
  host.addEventListener('click',event=>{
    if(event.target.closest('.video-play'))setTimeout(()=>finish('timeout'),15000);
  });
  window.addEventListener('message',event=>{
    const frame=host.querySelector('iframe');
    if(status.ended || !frame || frame.src!==expected || event.origin!=='https://rutube.ru' || event.source!==frame.contentWindow)return;
    let message=event.data;
    if(typeof message==='string')try{message=JSON.parse(message);}catch{return;}
    const allowed=['player:init','player:ready','player:playStart','player:changeState','player:currentTime','player:error',
      'player:volumeChange','player:currentQuality','player:qualityList','player:adStart','player:adEnd','player:rollState'];
    if(!allowed.includes(message?.type))return;
    const type=message.type,data=message.data??{};
    if(!status.events.includes(type))status.events.push(type);
    if(type==='player:error'){
      const code=String(data.code??'');
      status.providerError=/^(?:BLNCTMT_[A-Z0-9_]+|\d{1,8})$/.test(code)?code:'player:error';
      finish('provider-error');return;
    }
    if(type==='player:volumeChange' && typeof data.muted==='boolean'){
      status.reportedMuted=data.muted || (data.volume!=null && Number(data.volume)===0);
      if(!status.reportedMuted){finish('mute-not-confirmed');return;}
    }
    if(type==='player:playStart' && Number(data.q_w)>0 && Number(data.q_h)>0) {
      status.reportedQuality={width:Number(data.q_w),height:Number(data.q_h),event:type};
    }
    if(type==='player:currentQuality' && Number(data.quality?.height)>0) {
      status.reportedQuality={height:Number(data.quality.height),event:type};
    }
    if(type==='player:currentTime' && (typeof data.time==='number' || typeof data.time==='string')){
      if(acceptTime(status.samples,{time:Number(data.time)})){finish('two-public-times');return;}
    }
    write();
  });
  write();
}

export async function startRutubeAutoplayFixture({port=0}={}) {
  const [{createRequire},{createServer},{readFileSync},{fileURLToPath},path]=await Promise.all([
    import('node:module'),import('node:http'),import('node:fs'),import('node:url'),import('node:path'),
  ]);
  const app=fileURLToPath(new URL('../../../apps/idol-site/',import.meta.url));
  const require=createRequire(path.join(app,'package.json'));
  const {workPlayback}=require('./tests/helpers/public-artist-loader.cjs')('lib/idol/work-playback.ts');
  const production=workPlayback(workId,videoId,'mv',null);
  if(production?.embedUrl!==controlEmbed)throw Error('The production BILLIONAIRE player no longer matches this A/B baseline.');
  const contents=[
    "import React from 'react'; import {createRoot} from 'react-dom/client';",
    "import {WorkVideoPlayer} from './components/work-video-player';",
    'const expected=new URL('+JSON.stringify(controlEmbed)+');',
    "if(document.body.dataset.condition==='explicit')expected.searchParams.set('autoplay','true');",
    "const root=createRoot(document.getElementById('player'));",
    '('+monitorFixture.toString()+')(expected.href,()=>root.unmount(),'+acceptPlaybackTime.toString()+');',
    "root.render(React.createElement(WorkVideoPlayer,{workId:"+JSON.stringify(workId)+",videoId:"+JSON.stringify(videoId)+",",
    "url:'https://www.youtube.com/watch?v="+videoId+"',view:'mv',platform:'youtube',embedUrl:expected.href,title:'BILLIONAIRE',",
    "posterSrc:'/cover.jpg',playbackLabel:'RUTUBE',playbackCredit:"+JSON.stringify(production.credit)+"}));",
  ].join('\n');
  const bundle=require('esbuild').buildSync({stdin:{contents,resolveDir:app},bundle:true,write:false,
    define:{'process.env.NODE_ENV':'"production"'},jsx:'automatic',platform:'browser',format:'iife',minify:true,logLevel:'silent'}).outputFiles[0].contents;
  const poster=readFileSync(path.join(app,'public/artist/mv-identity-20261025/covers',videoId+'.jpg'));
  const server=createServer((req,res)=>{
    if(!/^(GET|HEAD)$/.test(req.method)||req.headers.host!==('127.0.0.1:'+server.address().port)){res.writeHead(404).end();return;}
    const u=new URL(req.url,'http://127.0.0.1'), condition=u.searchParams.get('condition');
    let body,mime;
    if(u.pathname==='/player.js'){body=bundle;mime='text/javascript';}
    else if(u.pathname==='/cover.jpg'){body=poster;mime='image/jpeg';}
    else if(u.pathname==='/' && ['current','explicit'].includes(condition)){
      mime='text/html; charset=utf-8';
      body='<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
        '<title>BILLIONAIRE · 站内播放器对照</title><style>body{margin:12px;background:#171717;color:white;font:16px system-ui}h1{font-size:20px}.video-stage{max-width:750px;aspect-ratio:16/9;position:relative}.video-stage>img,.video-stage>iframe{width:100%;height:100%;object-fit:contain;border:0}.video-play{position:absolute;inset:0;margin:auto;width:max-content;height:48px;display:flex;align-items:center}.video-source-credit{display:block}output{font:12px monospace;display:block;overflow-wrap:anywhere}</style>'+
        '<body data-condition="'+condition+'"><main class="detail"><header class="music-work-title"><h1>BILLIONAIRE</h1></header><div id="player"></div></main><output id="measurement"></output><script defer src="/player.js"></script></body></html>';
    } else {res.writeHead(404).end();return;}
    res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-store','Referrer-Policy':'strict-origin-when-cross-origin'});
    res.end(req.method==='HEAD'?undefined:body);
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});
  return {origin:'http://127.0.0.1:'+server.address().port, close:()=>new Promise(resolve=>server.close(resolve))};
}

export async function checkRutubeAutoplayAB(tab,{origin,order=['current','explicit'],timeoutMs=10000}={}) {
  const local=new URL(origin);
  if(local.protocol!=='http:'||local.hostname!=='127.0.0.1'||local.origin!==origin||!local.port
      || !Array.isArray(order)||order.length<1 || order.length>4 || !order.every(v=>['current','explicit'].includes(v))
      || !Number.isFinite(timeoutMs) || timeoutMs<1000 || timeoutMs>14000)throw Error('Invalid loopback fixture or sampling options');
  const rows=[];
  for(const condition of order){
    const row={condition,status:'unverified',decodedSize:null,kbps:null,events:[],samples:[]};
    rows.push(row);
    const page=origin+'/?condition='+condition;
    const expected=new URL(controlEmbed);
    if(condition==='explicit')expected.searchParams.set('autoplay','true');
    let timer,exiting;
    const leave=()=>exiting??=leavePlaybackTab(tab);
    try{
      await tab.goto(page);
      const pw=tab.playwright,button=pw.getByRole('button',{name:'播放视频（RUTUBE）',exact:true});
      await button.waitFor({state:'visible',timeoutMs:8000});
      if(await tab.url()!==page || await button.count()!==1 || await pw.locator('iframe').count())throw Error('Unexpected initial test page');
      const output=pw.locator('#measurement');
      const start=Date.now(), deadline=start+timeoutMs;
      timer=setTimeout(()=>{void leave().catch(()=>{});},timeoutMs);
      await button.click({timeoutMs:2000});
      let nextErrorCheck=0;
      while(!exiting && Date.now()<deadline){
        const seen=await output.evaluate(el=>JSON.parse(el.textContent),undefined,{timeoutMs:400});
        Object.assign(row,seen);
        if(seen.condition!==condition || (seen.observedSrc && seen.observedSrc!==expected.href)) {row.status='unexpected-player';break;}
        if(seen.ended){row.status=seen.ended;break;}
        if(seen.frames && Date.now()>=nextErrorCheck){
          nextErrorCheck=Date.now()+500;
          // Only the error code that the player displays to the visitor. Do not enter the provider frame.
          try {
            const state=await tab.getAXState({emit:false,disableDiffing:true});
            const code=(typeof state==='string'?state:JSON.stringify(state)).match(/\bBLNCTMT_[A-Z0-9_]+\b/)?.[0];
            if(code){row.providerError=code;row.status='provider-error';break;}
          } catch { /* The public player events remain available. */ }
        }
        await new Promise(resolve=>setTimeout(resolve,90));
      }
      row.elapsedMs=Date.now()-start;
      if(row.status==='unverified')row.status='no-confirmed-progress';
    } catch(error) {
      row.status=exiting?'no-confirmed-progress':'fixture-error';
      if(!exiting)row.error=String(error.message).split('\n')[0].slice(0,150);
    } finally {clearTimeout(timer);await leave();}
  }
  return {origin,workId,videoId,timeoutMs,method:'Public trusted RUTUBE messages on a loopback parent. Active quality is provider-reported; decoded size and independent bitrate are unavailable.',rows};
}

if(import.meta.main){
  const {argv}=await import('node:process');
  if(argv[2]==='--serve'){
    const fixture=await startRutubeAutoplayFixture();
    console.log(fixture.origin);
    setTimeout(()=>void fixture.close(),10*60*1000).unref();
  }
}
