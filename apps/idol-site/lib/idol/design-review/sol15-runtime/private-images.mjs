import {contract} from './contract.js';
import {artist} from './groups/udtt/index.js';
import {helpers as baseHelpers} from './private-model.mjs';
import {image as originalImage} from './shared/helpers.js';

const digest=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
const sameKeys=(value,keys)=>value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).sort().join('|')===[...keys].sort().join('|');
const originals=[artist.hero,...artist.members.map(row=>row.image),...artist.works.map(row=>row.image)];
export const PRIVATE_IMAGE_IDS=Object.freeze({
  "groups/udtt/assets/group.jpg": "udtt-hero",
  "groups/udtt/assets/chaehee.jpg": "udtt-han-chaehee",
  "groups/udtt/assets/hanna.jpg": "udtt-gu-hanna",
  "groups/udtt/assets/mv-aKRY80dEkJw-publisher-original.jpg": "udtt-really-really-mv",
  "groups/udtt/assets/release-retry.webp": "udtt-retry-cover",
  "groups/udtt/assets/release-school-rush.webp": "udtt-school-rush-cover",
  "groups/udtt/assets/release-viper.webp": "udtt-viper-cover",
  "groups/udtt/assets/risako.jpg": "udtt-risako",
  "groups/udtt/assets/stage-nZa0Th64v00-publisher-original.jpg": "udtt-really-really-stage",
  "groups/udtt/assets/woojung.jpg": "udtt-woojung",
  "groups/udtt/assets/yejin.jpg": "udtt-kwon-yejin"
});
export const PRIVATE_IMAGE_COUNT=11;
export const HERO_SHA256=contract.assets['groups/udtt/assets/group.jpg'].sha256;
// A route unmount is not proof that its IMG request was cancelled. Keep a
// document-lifetime lease so a later mount cannot overlap an unsettled request.
const imageLeases=new WeakMap();
// Single, independently verified native portrait. This is NOT a v3 manifest entry.
const NATIVE=Object.freeze({memberId:'recvxAPQCF66Sl',groupId:'rec28ldfRTiDPs',fieldId:'fldTMEUgHF',url:'/api/media?table=members&record=recvxAPQCF66Sl&index=0',sha256:'b80720a772b8000518fad7d71e0b3c5867a8dbef7b4c2219dcaf2ec58dba8ca9',bytes:22101,width:640,height:800,source:'https://www.idntimes.com/korea/kpop/biodata-dan-profil-lineup-debut-time-turner-00-6x7yf-q7hcs8'});
const nativeBindings=new WeakMap();
const nativeFail=()=>{throw new Error('陆雨婷原生照片未通过核验；未改用旧照片或静态图片。');};
function nativeState(binding){const state=nativeBindings.get(binding);if(!state||state.disposed)nativeFail();return state;}
function maybeRevoke(state){if(state.disposed&&state.users===0&&!state.revoked){state.revoked=true;state.scheduler.URL.revokeObjectURL(state.url);}}
export function prepareNativePortrait(options){return prepareNativePortraitBytes({...options,publicBinding:false});}
/** Server-issued public binding replaces only the stripped private field ID.
 * Identity, exact native URL, size, MIME, SHA and decoded geometry remain fixed. */
export function preparePublicNativePortrait(options){return prepareNativePortraitBytes({...options,publicBinding:true});}
async function prepareNativePortraitBytes({catalog,scheduler=globalThis,signal,publicBinding=false}){
 const members=catalog?.members?.filter(m=>m?.id===NATIVE.memberId),groups=catalog?.groups?.filter(g=>g?.id===NATIVE.groupId),member=members?.[0],photo=member?.photo;
 if(catalog?.scope?.type!=='artist'||catalog.scope.groupId!==NATIVE.groupId||groups?.length!==1||members?.length!==1||!member.groupIds?.includes(NATIVE.groupId)||photo?.table!=='members'||photo.recordId!==NATIVE.memberId||(publicBinding?photo.fieldId!==''||photo.publicBinding!=='member-primary-v1':photo.fieldId!==NATIVE.fieldId)||photo.index!==0)nativeFail();
 const old=originals.find(a=>a.src==='groups/udtt/assets/woojung.jpg');
 if(old?.sha256!=='cbf9129dfd0073537c892e6ae1ba32851141303f414065b415f7caecce289f5c'||old.bytes!==20090||old.width!==200||old.height!==200||signal?.aborted||imageLeases.has(scheduler))nativeFail();
 const owner={},controller=new AbortController();let expired=false;const abort=()=>controller.abort();signal?.addEventListener('abort',abort,{once:true});
 const timer=scheduler.setTimeout(()=>{expired=true;controller.abort();},20000);imageLeases.set(scheduler,{owner,row:null});
 try{
  const response=await scheduler.fetch(NATIVE.url,{credentials:'same-origin',cache:'no-store',redirect:'error',signal:controller.signal});
  if(controller.signal.aborted||response.status!==200||response.redirected||response.url!==scheduler.location.origin+NATIVE.url||response.headers.get('content-type')?.split(';')[0].trim()!=='image/jpeg'||!response.body){await response.body?.cancel();nativeFail();}
  const reader=response.body.getReader(),parts=[];let length=0;
  try{while(true){const {done,value}=await reader.read();if(controller.signal.aborted)nativeFail();if(done)break;length+=value.length;if(length>NATIVE.bytes){await reader.cancel();nativeFail();}parts.push(value);}}catch(error){await reader.cancel().catch(()=>{});throw error;}finally{reader.releaseLock();}
  if(length!==NATIVE.bytes)nativeFail();const bytes=new Uint8Array(length);let offset=0;for(const p of parts){bytes.set(p,offset);offset+=p.length;}
  const sha=[...new Uint8Array(await scheduler.crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');
  if(sha!==NATIVE.sha256||controller.signal.aborted||signal?.aborted||expired)nativeFail();
  const url=scheduler.URL.createObjectURL(new Blob([bytes],{type:'image/jpeg'}));const state={url,scheduler,users:0,disposed:false,revoked:false};
  const binding=Object.freeze({destroy(){if(state.disposed)return;state.disposed=true;maybeRevoke(state);}});nativeBindings.set(binding,state);return binding;
 }finally{scheduler.clearTimeout(timer);signal?.removeEventListener('abort',abort);if(imageLeases.get(scheduler)?.owner===owner)imageLeases.delete(scheduler);}
}
export function withNativePortrait(references,binding){
 const state=nativeState(binding),oldPath='groups/udtt/assets/woojung.jpg',old=references.byPath.get(oldPath);
 if(old?.assetId!=='udtt-woojung'||old.sha256!=='cbf9129dfd0073537c892e6ae1ba32851141303f414065b415f7caecce289f5c'||old.byteLength!==20090||old.width!==200||old.height!==200)nativeFail();
 const entry=Object.freeze({...old,sha256:NATIVE.sha256,byteLength:NATIVE.bytes,width:NATIVE.width,height:NATIVE.height,readUrl:state.url,sourceKind:'verified-native-media'}),byPath=new Map(references.byPath);byPath.set(oldPath,entry);
 return Object.freeze({...references,byPath,entries:Object.freeze(references.entries.map(e=>e===old?entry:e)),nativePortrait:binding});
}
export function nativePortraitSourceAllowed(binding,identity){return !!binding&&!!nativeState(binding)&&identity?.slug==='udtt'&&identity.groupId===NATIVE.groupId&&identity.entityType==='member'&&identity.entityId===NATIVE.memberId&&identity.sourceUrl===NATIVE.source;}
function memberPresentation(binding,member){
 if(member?.id!==NATIVE.memberId)return member;
 nativeState(binding);if(member.image?.src!=='groups/udtt/assets/woojung.jpg'||member.image.sha256!=='cbf9129dfd0073537c892e6ae1ba32851141303f414065b415f7caecce289f5c'||member.image.width!==200||member.image.height!==200)nativeFail();
 const credit='2024 年历史新闻图 · IDN Times（署名 timeturner_official）；读取现有原生媒体，非 v3 图片清单';
 return {...member,image:{...member.image,sha256:NATIVE.sha256,bytes:NATIVE.bytes,width:640,height:800,originalPath:null,sourceUrl:NATIVE.source,credit,quality:'historical-news-portrait',imageryManaged:true,noUpscale:true},sources:[{url:NATIVE.source,label:'IDN Times · 2024 年历史照片来源'},...(member.sources??[]).filter(s=>s.url!==member.image.sourceUrl)]};
}

const fail=()=>{throw new Error('UDTT 私有图片清单未通过完整性核验，未使用静态图片替代。');};
/** Whole-group references are all-or-nothing. An authenticated API remains the authority. */
export function validatePrivateViewer(value){
  if(!sameKeys(value,['manifestHash','entries'])||!digest(value.manifestHash)||!Array.isArray(value.entries)||value.entries.length!==PRIVATE_IMAGE_COUNT)fail();
  const ids=new Set(),hashes=new Set(),byPath=new Map();
  for(const entry of value.entries){
    if(!sameKeys(entry,['assetId','sha256','byteLength','mime','width','height','readUrl'])||typeof entry.assetId!=='string'||!/^udtt-[a-z0-9-]+$/.test(entry.assetId)||ids.has(entry.assetId)||!digest(entry.sha256)||hashes.has(entry.sha256))fail();
    const matching=Object.values(contract.assets).filter(row=>row.sha256===entry.sha256);
    if(matching.length!==1)fail();
    const expected=matching[0],original=originals.find(row=>row.src===expected.path);
    if(entry.assetId!==PRIVATE_IMAGE_IDS[expected.path]||!original||original.sha256!==expected.sha256||entry.byteLength!==expected.bytes||entry.width!==original.width||entry.height!==original.height||entry.mime!==(expected.path.endsWith('.webp')?'image/webp':'image/jpeg'))fail();
    if(typeof entry.readUrl!=='string')fail();
    let url;try{url=new URL(entry.readUrl,'https://private.invalid');}catch{fail();}
    const version=url.searchParams.get('version');
    if(!digest(version)||entry.readUrl!=='/api/editorial-assets?'+new URLSearchParams({manifest:value.manifestHash,asset:entry.assetId,version}))fail();
    ids.add(entry.assetId);hashes.add(entry.sha256);byPath.set(expected.path,Object.freeze({...entry}));
  }
  if(byPath.size!==Object.keys(contract.assets).length)fail();
  return Object.freeze({manifestHash:value.manifestHash,entries:Object.freeze([...byPath.values()]),byPath});
}
export function validatePublicViewer(value){
  if(!sameKeys(value,['manifestHash','entries'])||!digest(value.manifestHash)||!Array.isArray(value.entries)||value.entries.length!==PRIVATE_IMAGE_COUNT-1)fail();
  const ids=new Set(),hashes=new Set(),byPath=new Map();
  for(const entry of value.entries){
    if(!sameKeys(entry,['assetId','sha256','byteLength','mime','width','height','readUrl'])||typeof entry.assetId!=='string'||!/^udtt-[a-z0-9-]+$/.test(entry.assetId)||ids.has(entry.assetId)||!digest(entry.sha256)||hashes.has(entry.sha256))fail();
    const matching=Object.values(contract.assets).filter(row=>row.sha256===entry.sha256);
    if(matching.length!==1)fail();
    const expected=matching[0],original=originals.find(row=>row.src===expected.path);
    if(expected.path==='groups/udtt/assets/woojung.jpg'||entry.assetId!==PRIVATE_IMAGE_IDS[expected.path]||!original||original.sha256!==expected.sha256||entry.byteLength!==expected.bytes||entry.width!==original.width||entry.height!==original.height||entry.mime!==(expected.path.endsWith('.webp')?'image/webp':'image/jpeg'))fail();
    if(typeof entry.readUrl!=='string')fail();
    let url;try{url=new URL(entry.readUrl,'https://private.invalid');}catch{fail();}
    const version=url.searchParams.get('version');
    if(!digest(version)||entry.readUrl!=='/api/editorial-assets?'+new URLSearchParams({manifest:value.manifestHash,asset:entry.assetId,version}))fail();
    ids.add(entry.assetId);hashes.add(entry.sha256);byPath.set(expected.path,Object.freeze({...entry}));
  }
  if(byPath.size!==Object.keys(contract.assets).length-1)fail();
  return Object.freeze({manifestHash:value.manifestHash,entries:Object.freeze([...byPath.values()]),byPath});
}
/** No old Lu entry is fabricated or admitted to the public references. */
export function withPublicNativePortrait(references,binding){
 const state=nativeState(binding),path='groups/udtt/assets/woojung.jpg';
 if(references.entries.length!==10||references.byPath.has(path)||references.entries.some(e=>e.assetId==='udtt-woojung'))nativeFail();
 const entry=Object.freeze({assetId:'udtt-native-lu',sha256:NATIVE.sha256,byteLength:NATIVE.bytes,mime:'image/jpeg',width:NATIVE.width,height:NATIVE.height,readUrl:state.url,sourceKind:'verified-native-media'});
 const byPath=new Map(references.byPath);byPath.set(path,entry);
 return Object.freeze({...references,byPath,entries:Object.freeze([...references.entries,entry]),nativePortrait:binding});
}
export function createPrivateHelpers(references,viewerTransport=null){
  const nativeViewerAssets=new WeakSet();
  return Object.freeze({...baseHelpers,...(references.nativePortrait?{memberPresentation:member=>memberPresentation(references.nativePortrait,member)}:{}),image(asset,alt='',options={}){
    const details=typeof asset==='string'?{src:asset}:asset;
    const entry=details&&references.byPath.get(details.src);
    if(!entry||details.sha256!==entry.sha256||details.width!==entry.width||details.height!==entry.height)fail();
    const card=details.qualityLevel==='card';
    const mapped={...details,src:entry.sourceKind==='verified-native-media'?NATIVE.url:entry.readUrl,...(card?{imageryManaged:true,noUpscale:true}:{})};
    const html=originalImage(mapped,alt,{...options,...(card?{fit:'contain'}:{})});
    if(!html.includes('<img '))fail();
    // No src/srcset means no browser request before the queue claims this exact IMG.
    return html.replace(/ src="[^"]*"/,` data-private-asset-id="${entry.assetId}" data-private-sha256="${entry.sha256}" data-private-image-state="not-triggered"`).replace(/ data-original-src="[^"]*"/,'');
  },
  // The shared enlargement widget creates a separate IMG and retry controls.
  // This isolated pilot deliberately keeps all image reads in its single queue.
  resolveMediaAsset:asset=>{
    if(!viewerTransport)return null;
    const entry=asset&&references.byPath.get(asset.src);
    if(!entry||asset.sha256!==entry.sha256||asset.width!==entry.width||asset.height!==entry.height)fail();
    const resolved=Object.freeze({...asset,src:entry.sourceKind==='verified-native-media'?NATIVE.url:entry.readUrl,privateAssetId:entry.assetId});
    if(entry.sourceKind==='verified-native-media'){nativeState(references.nativePortrait);nativeViewerAssets.add(resolved);}return resolved;
  },
  ...(viewerTransport?{mediaImageTransport:(image,asset,callbacks)=>{
    const entry=references.entries.find(e=>e.assetId===asset?.privateAssetId);
    if(entry?.sourceKind==='verified-native-media'){const state=nativeState(references.nativePortrait);if(!nativeViewerAssets.has(asset)||asset.src!==NATIVE.url||asset.sha256!==NATIVE.sha256||asset.bytes!==NATIVE.bytes||asset.width!==640||asset.height!==800||entry.readUrl!==state.url)nativeFail();return viewerTransport(image,{...asset,src:state.url},callbacks);}
    return viewerTransport(image,asset,callbacks);
  }}:{})});
}
/**
 * One real IMG per asset for the entire mount. Never fetch(), new Image(), clone,
 * retry, or change src. Moving an IMG preserves pending requests across routes.
 * Timeout is not cancellation: it stops the queue and leaves the slot occupied.
 */
export function createPrivateImageQueue({references,parking,scheduler=globalThis,onReport=()=>{},timeoutMs=20000}){
  const now=()=>scheduler.performance?.now?.()??Date.now();
  const startedAt=now(),records=new Map(references.entries.map(entry=>[entry.assetId,{entry,node:null,status:'not-triggered',seen:false,triggeredAt:null,loadAt:null,decodedAt:null,failedAt:null,error:null,timeout:false,lateOutcome:null}]));
  const owner={},viewerJobs=[];
  const release=row=>{if(row.nativeActive){row.nativeActive=false;const state=nativeBindings.get(references.nativePortrait);state.users--;maybeRevoke(state);}const lease=imageLeases.get(scheduler);if(lease?.owner===owner&&lease.row===row)imageLeases.delete(scheduler);};
  let active=null,stopped=false,stopReason=null,dead=false,paused=false,timer=null;
  const report=()=>{
    const entries=[...records.values()].map(row=>({assetId:row.entry.assetId,sha256:row.entry.sha256,byteLength:row.entry.byteLength,sourceKind:row.entry.sourceKind??'editorial-v3',status:row.status,seen:row.seen,triggeredAtMs:row.triggeredAt===null?null:row.triggeredAt-startedAt,loadAtMs:row.loadAt===null?null:row.loadAt-startedAt,decodedAtMs:row.decodedAt===null?null:row.decodedAt-startedAt,srcToLoadMs:row.loadAt===null?null:row.loadAt-row.triggeredAt,loadToDecodeMs:row.decodedAt===null||row.loadAt===null?null:row.decodedAt-row.loadAt,srcToDecodeMs:row.decodedAt===null?null:row.decodedAt-row.triggeredAt,error:row.error,timedOut:row.timeout,lateOutcome:row.lateOutcome}));
    const counts={loaded:0,failed:0,notTriggered:0,pending:0};for(const row of entries)counts[row.status==='not-triggered'?'notTriggered':row.status==='loading'||row.status==='decoding'?'pending':row.status]++;
    return {format:'udtt-private-image-observation-v1',manifestHash:references.manifestHash,...(references.nativePortrait?{sourceMode:'10-editorial-v3-plus-1-verified-native',manifestCoverage:'editorial references only; native portrait independently byte-verified'}:{}),total:records.size,counts,stopped,stopReason,inFlightAssetId:imageLeases.get(scheduler)?.owner===owner?imageLeases.get(scheduler).row.entry.assetId:null,maxInFlight:1,allImagesReady:counts.loaded===records.size,complete:counts.loaded+counts.failed===records.size,hero:entries.find(row=>row.sha256===HERO_SHA256),entries,timingNote:'IMG src assignment to load and load to decode completion only; not first paint, visual readiness, or TTFB.'};
  };
  const emit=()=>{if(!dead)onReport(report());};
  const mark=(row)=>{if(row.node){row.node.setAttribute('data-private-image-state',row.status);if(row.error){row.node.setAttribute('data-private-image-error',row.error);row.node.setAttribute('title','私有图片加载失败；本次不重试，也不使用静态替代图。');}}};
  const stop=reason=>{stopped=true;stopReason=reason;emit();};
  const clearTimer=()=>{if(timer!==null){scheduler.clearTimeout(timer);timer=null;}};
  const settle=(row,error=null)=>{
    if(active!==row)return;
    release(row);
    if(dead){row.off?.();return;}
    if(row.timeout){row.lateOutcome=error?'failed':'loaded';row.off?.();emit();return;}
    clearTimer();row.status=error?'failed':'loaded';row.error=error;row.failedAt=error?now():null;row.off?.();mark(row);active=null;if(row.viewer)viewerJobs.splice(viewerJobs.indexOf(row),1);if(row.viewer&&!row.cancelled)row.complete(error);emit();pump();
  };
  function start(row){
    if(active||stopped||dead||paused||row.status!=='not-triggered'||!row.node)return;
    if(imageLeases.has(scheduler)){stop('previous-mount-image-unsettled: no new IMG request started');return;}
    const image=row.node;if(row.entry.sourceKind==='verified-native-media'){const state=nativeState(references.nativePortrait);if(row.entry.readUrl!==state.url)nativeFail();state.users++;row.nativeActive=true;}active=row;imageLeases.set(scheduler,{owner,row});row.status='loading';row.triggeredAt=now();mark(row);
    const onError=()=>settle(row,'img-error');
    const onLoad=()=>{
      if(active!==row||row.loadAt!==null)return;
      if(dead){release(row);row.off?.();return;}
      row.loadAt=now();if(!row.timeout)row.status='decoding';mark(row);emit();
      // decode() is the same already-loaded element, never a second request.
      if(typeof image.decode!=='function'){settle(row,'decode-unavailable');return;}
      Promise.resolve().then(()=>image.decode()).then(()=>{
        if(active!==row)return;
        if(dead){release(row);row.off?.();return;}
        if(image.naturalWidth!==row.entry.width||image.naturalHeight!==row.entry.height){settle(row,'decoded-dimensions-mismatch');return;}
        row.decodedAt=now();settle(row);
      },()=>settle(row,'decode-error'));
    };
    image.addEventListener('load',onLoad);image.addEventListener('error',onError);row.off=()=>{image.removeEventListener('load',onLoad);image.removeEventListener('error',onError);};
    timer=scheduler.setTimeout(()=>{timer=null;if(dead||active!==row)return;row.timeout=true;row.status='failed';row.error='timeout-uncancelled';row.failedAt=now();mark(row);stop('20s-timeout: pending IMG was not cancelled; remaining queue stopped');if(row.viewer&&!row.cancelled)row.complete('timeout-uncancelled');},timeoutMs);
    // Native lazy loading could leave the only active slot waiting below fold.
    image.setAttribute('loading','eager');image.setAttribute('fetchpriority',row.entry.sha256===HERO_SHA256?'high':'low');emit();
    image.setAttribute('src',row.entry.readUrl);
  }
  function pump(){
    if(active||stopped||dead||paused)return;
    const job=viewerJobs.find(row=>!row.cancelled&&row.status==='not-triggered');if(job){start(job);return;}
    const available=[...records.values()].filter(row=>row.node&&row.status==='not-triggered');
    available.sort((a,b)=>Number(b.entry.sha256===HERO_SHA256)-Number(a.entry.sha256===HERO_SHA256));
    if(available[0])start(available[0]);
  }
  const copyPresentation=(from,to)=>{
    for(const attr of [...to.attributes])if(!['src','loading','fetchpriority','data-private-image-state','data-private-image-error'].includes(attr.name))to.removeAttribute(attr.name);
    for(const attr of [...from.attributes])if(!['src','srcset','loading','fetchpriority','data-private-image-state'].includes(attr.name))to.setAttribute(attr.name,attr.value);
  };
  emit();
  return {report,
    // Explicit viewer attempts use the same real-IMG lease, including after close.
    // Cancellation drops callbacks/queued jobs, never pretends an active request ended.
    requestViewer(image,asset,{onLoad,onError}){
      const entry=references.entries.find(row=>row.assetId===asset.privateAssetId);
      if(!entry||entry.readUrl!==asset.src||entry.sha256!==asset.sha256||entry.width!==asset.width||entry.height!==asset.height)fail();
      const row={entry,node:image,viewer:true,status:'not-triggered',triggeredAt:null,loadAt:null,decodedAt:null,failedAt:null,error:null,timeout:false,cancelled:false,complete:error=>error?onError(error):onLoad()};
      if(dead||stopped){queueMicrotask(()=>{if(!row.cancelled)onError('queue-stopped');});}
      else{for(let i=viewerJobs.length-1;i>=0;i--)if(viewerJobs[i].cancelled&&viewerJobs[i]!==active)viewerJobs.splice(i,1);if(viewerJobs.some(job=>job!==active&&!job.cancelled&&job.status==='not-triggered'))throw new Error('Private viewer queue already has one pending attempt');viewerJobs.push(row);pump();}
      return()=>{row.cancelled=true;};
    },
    park(){if(dead)return;paused=true;for(const row of records.values())if(row.node)parking.append(row.node);},
    attach(root){
      if(dead)return;
      const seen=new Set();
      for(const image of root.querySelectorAll('img')){
        const id=image.getAttribute('data-private-asset-id'),row=records.get(id);
        if(!row||seen.has(id)||image.hasAttribute('src')||image.hasAttribute('srcset')||image.getAttribute('data-private-sha256')!==row.entry.sha256){stop('render-image-identity-mismatch');throw new Error('私有图片渲染身份不匹配，已停止图片队列。');}
        seen.add(id);row.seen=true;
        if(row.node){copyPresentation(image,row.node);image.replaceWith(row.node);mark(row);}else row.node=image;
      }
      paused=false;emit();pump();
    },
    destroy(){if(dead)return;dead=true;stopped=true;stopReason='destroyed';clearTimer();for(const row of records.values())if(row!==active)row.off?.();}
  };
}
