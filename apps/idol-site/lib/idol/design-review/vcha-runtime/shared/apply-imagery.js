import {imageryManifest} from './imagery-manifest.js';
import {imageryTargets} from './imagery-targets.js';

const keyOf=work=>work.id??work.candidateKey??null;
const fields=['slug','groupId','entityKey','productionId','candidateKey','slot','workIds','videoId','originalVideoTypes','stageKind','sourceURLs'];
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const parents=work=>[...new Set([work.parentWorkId,work.workId,work.sourceWorkId,...(Array.isArray(work.parentWorkIds)?work.parentWorkIds:[])].filter(value=>typeof value==='string'&&value))];
const sourceURLs=work=>[...new Set([work.url,work.sourceUrl,...(work.sources??[]).map(source=>typeof source==='string'?source:source?.url)].filter(Boolean))];
const positive=value=>Number.isInteger(value)&&value>0;
const fail=message=>{throw new Error(`Imagery binding rejected: ${message}`);};
function explicitVideoID(value){
  let url;try{url=new URL(value);}catch{return null;}
  if(/^(?:i\d*\.ytimg\.com|img\.youtube\.com)$/.test(url.hostname))return url.pathname.match(/^\/(?:vi|vi_webp)\/([^/]+)\//)?.[1]??null;
  if(url.hostname==='youtu.be')return url.pathname.slice(1).split('/')[0]||null;
  if(['youtube.com','www.youtube.com','m.youtube.com'].includes(url.hostname))return url.pathname==='/watch'?url.searchParams.get('v'):/^\/(shorts|embed)\//.test(url.pathname)?url.pathname.split('/')[2]:null;
  return null;
}

export function validateImageryBinding(artist,entry,targets=imageryTargets){
  const target=entry?.target;
  if(entry?.approved!==true||!target)fail('asset is not explicitly approved');
  if(target.slug!==artist.slug||target.groupId!==artist.id)fail('cross-group identity');
  const anchor=targets.find(row=>row.slug===artist.slug&&row.entityKey===target.entityKey);
  if(!anchor)fail('target was not an original missing-image slot');
  for(const field of fields)if(!equal(target[field],anchor[field]))fail(`original target ${field} differs`);
  if(!['MV','STAGE'].includes(target.slot))fail('unsupported slot');
  const work=artist.works.find(row=>keyOf(row)===target.entityKey);
  if(!work)fail('exact work/candidate key is absent');
  if((work.id??null)!==target.productionId||(work.candidateKey??null)!==target.candidateKey)fail('production/candidate identity differs');
  if(work.type!==(target.slot==='MV'?'mv':'stage'))fail('MV/stage slot differs');
  if((work.videoId??null)!==target.videoId)fail('exact video ID differs');
  const actualParents=target.slot==='MV'?[work.id]:parents(work);
  if(!equal([...actualParents].sort(),[...target.workIds].sort()))fail('exact parent-work set differs');
  const actualSources=new Set(sourceURLs(work));
  if(!target.sourceURLs.length||!target.sourceURLs.every(source=>actualSources.has(typeof source==='string'?source:source.url)))fail('original video source URL differs');
  for(const original of target.originalVideoTypes){
    const parent=artist.works.find(row=>row.id===original.workId);
    if(!parent||parent.type!=='mv')fail('original MV parent is absent');
    const rawType=parent.videoType??parent.publicBaseline?.videoType;
    if(rawType!=null&&rawType!==original.videoType)fail('original source videoType differs');
  }
  const asset=entry.asset;
  if(!asset||typeof asset.key!=='string'||!asset.key||!positive(asset.width)||!positive(asset.height)||!positive(asset.bytes)||!/^[a-f0-9]{64}$/i.test(asset.sha256??''))fail('asset integrity metadata is incomplete');
  if(!['primary','card'].includes(asset.qualityLevel))fail('unadopted quality level');
  let src;try{src=decodeURIComponent(asset.src??'').replace(/^\.\//,'');}catch{fail('invalid local source path');}
  if(!src?.startsWith(`groups/${artist.slug}/assets/`)||src.split('/').some(part=>part==='..'||part==='.')||/[?#\\]/.test(src))fail('asset must be a local file in this group');
  if(!/^https?:\/\//i.test(asset.sourceUrl??'')||!/^https?:\/\//i.test(asset.sourceImageUrl??''))fail('public page/image source is absent');
  for(const url of [asset.sourceUrl,asset.sourceImageUrl]){
    const referencedVideo=explicitVideoID(url);
    if(referencedVideo&&referencedVideo!==target.videoId)fail('publisher image/page URL points to another video ID');
  }
  return {work,asset:{...asset,src,imageryManaged:true,noUpscale:true,displayTreatment:'contain; no enlargement beyond downloaded natural pixels',imageryTarget:structuredClone(target)}};
}

export function applyImagery(artist,manifest=imageryManifest,targets=imageryTargets){
  const entries=manifest.filter(entry=>entry?.target?.slug===artist.slug||entry?.target?.groupId===artist.id);
  if(!entries.length)return artist;
  const changes=new Map(),assets=[...(artist.assets??[])];
  for(const entry of entries){
    const {work,asset}=validateImageryBinding(artist,entry,targets);
    if(changes.has(keyOf(work)))fail('duplicate binding for one work');
    // Existing nonempty work artwork is retained. Research must not silently
    // replace already accepted MV, performance, or release imagery.
    if(work.image!=null&&work.image!=='')fail('existing nonempty artwork is protected');
    const collision=assets.find(row=>row.key===asset.key||row.src===asset.src);
    if(collision&&(!equal(collision,asset)))fail('asset key/path conflicts with an existing asset');
    if(!collision)assets.push(asset);
    changes.set(keyOf(work),asset);
  }
  return {...artist,works:artist.works.map(work=>changes.has(keyOf(work))?{...work,image:changes.get(keyOf(work))}:work),assets};
}
