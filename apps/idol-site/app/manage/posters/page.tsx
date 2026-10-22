'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,Check,ImagePlus,LoaderCircle,LockKeyhole} from 'lucide-react';
import {PhotoLightbox} from '@/components/photo-lightbox';
import '../manage.css';
import '../photos/photos.css';

type Candidate={candidateId:string;label:string;workId:string;videoId:string;sha256:string;byteLength:number;mime:string;width:number;height:number;status:'missing'|'verified'|'conflict'|'unknown';readUrl:string;uploadUrl:string};
type Manifest={manifestVersion:string;candidates:Candidate[];budget:{maxCandidates:number;maxBytes:number;maxFileBytes:number;approvedBytes:number;accountRemainingBytes:number|null}};
type Selected={file:File;url:string;sha256:string;version:string};
const endpoint='/api/manage/posters';
function isRecord(value:unknown):value is Record<string,unknown>{return typeof value==='object'&&value!==null&&!Array.isArray(value);}
function safeUpload(candidate:Candidate,version:string){
 const expected=endpoint+'?candidate='+encodeURIComponent(candidate.candidateId)+'&version='+encodeURIComponent(version);
 const url=new URL(candidate.uploadUrl,window.location.origin);
 if(url.origin!==window.location.origin||url.username||url.password||url.hash||url.pathname!==endpoint||url.search!==new URL(expected,window.location.origin).search||!(candidate.uploadUrl===expected||candidate.uploadUrl===window.location.origin+expected))throw new Error('上传目标不符合本批限制，请重新核对。');
 return expected;
}
function parseManifest(value:unknown):Manifest{
 const d=value as Manifest,b=d?.budget;
 if(!d||typeof d.manifestVersion!=='string'||!d.manifestVersion||!Array.isArray(d.candidates)||!b||b.maxCandidates!==10||b.maxBytes!==8000000||b.maxFileBytes!==3000000||!Number.isSafeInteger(b.approvedBytes)||b.approvedBytes<0||b.approvedBytes>b.maxBytes||d.candidates.length>b.maxCandidates||!(b.accountRemainingBytes===null||Number.isSafeInteger(b.accountRemainingBytes)&&b.accountRemainingBytes>=0))throw new Error('本批清单或容量尚未核实，请重新核对。');
 const ids=new Set<string>();let total=0;
 for(const c of d.candidates){
  if(!c||typeof c.candidateId!=='string'||!c.candidateId||ids.has(c.candidateId)||typeof c.label!=='string'||typeof c.workId!=='string'||typeof c.videoId!=='string'||! /^[a-f0-9]{64}$/.test(c.sha256)||!Number.isSafeInteger(c.byteLength)||c.byteLength<=0||c.byteLength>b.maxFileBytes||!['image/jpeg','image/png','image/webp'].includes(c.mime)||!Number.isSafeInteger(c.width)||!Number.isSafeInteger(c.height)||c.width<=0||c.height<=0||!['missing','verified','conflict','unknown'].includes(c.status))throw new Error('图片清单尚未核实，请重新核对。');
  safeUpload(c,d.manifestVersion);ids.add(c.candidateId);total+=c.byteLength;
 }
 if(total!==b.approvedBytes)throw new Error('本批图片容量与清单不一致，请重新核对。');
 return d;
}
async function fileHash(file:File){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',await file.arrayBuffer()))].map(x=>x.toString(16).padStart(2,'0')).join('');}
export default function PosterImport(){
 const [manifest,setManifest]=useState<Manifest|null>(null),[selected,setSelected]=useState<Record<string,Selected>>({}),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[current,setCurrent]=useState(''),[error,setError]=useState(''),[notice,setNotice]=useState(''),[ready,setReady]=useState(false),[lightbox,setLightbox]=useState<{src:string;label:string}|null>(null);
 const mounted=useRef(false),generation=useRef(0),running=useRef(false),urls=useRef(new Set<string>()),controllers=useRef(new Set<AbortController>()),input=useRef<HTMLInputElement|null>(null);
 const active=(token:number)=>mounted.current&&generation.current===token;
 async function request(path:string,token:number,options:RequestInit={}){
  if(!active(token))throw new Error('操作已停止。');
  const controller=new AbortController();controllers.current.add(controller);const timer=setTimeout(()=>controller.abort(),30000);
  try{
   const r=await fetch(path,{...options,cache:'no-store',credentials:'same-origin',redirect:'error',signal:controller.signal});
   if(!active(token))throw new Error('操作已停止。');
   if(!r.headers.get('content-type')?.includes('application/json'))throw new Error('连接结果未确认，请核对状态后继续。');
   const d:unknown=await r.json();if(!active(token))throw new Error('操作已停止。');
   if(!isRecord(d))throw new Error('响应格式未确认，请核对状态后继续。');
   if(!r.ok)throw new Error(typeof d.message==='string'?d.message:'请求未完成，请核对状态后继续。');return d;
  }finally{clearTimeout(timer);controllers.current.delete(controller);}
 }
 async function refresh(token:number){
  setLoading(true);setReady(false);
  try{const d=parseManifest(await request(endpoint,token));if(!active(token))throw new Error('操作已停止。');setManifest(d);setReady(true);return d;}
  finally{if(active(token))setLoading(false);}
 }
 useEffect(()=>{
  mounted.current=true;const token=++generation.current;
  void refresh(token).catch(e=>{if(active(token))setError(e.message);});
  return()=>{mounted.current=false;++generation.current;for(const c of controllers.current)c.abort();for(const url of urls.current)URL.revokeObjectURL(url);urls.current.clear();};
 },[]);
 useEffect(()=>{if(!busy)return;const guard=(e:BeforeUnloadEvent)=>e.preventDefault();window.addEventListener('beforeunload',guard);return()=>window.removeEventListener('beforeunload',guard);},[busy]);
 async function check(){
  if(running.current)return;running.current=true;setBusy(true);setError('');setNotice('');const token=generation.current;
  try{await refresh(token);if(active(token))setNotice('已重新核对当前状态。');}catch(e){if(active(token))setError((e as Error).message);}finally{if(active(token)){running.current=false;setBusy(false);}}
 }
 async function choose(files:FileList|null){
  if(!files||running.current||!ready||!manifest)return;running.current=true;setBusy(true);setError('');setNotice('');const token=generation.current;let matched=0,missed=0;
  try{
   for(const file of Array.from(files)){
    if(!active(token))return;
    const possible=manifest.candidates.filter(c=>c.status==='missing'&&c.byteLength===file.size);
    if(!possible.length||file.size>manifest.budget.maxFileBytes){missed++;continue;}
    const digest=await fileHash(file);if(!active(token))return;
    const candidate=possible.find(c=>c.sha256===digest);if(!candidate){missed++;continue;}
    const url=URL.createObjectURL(file);urls.current.add(url);
    try{const img=new Image();img.src=url;await img.decode();if(!active(token))return;if(img.naturalWidth!==candidate.width||img.naturalHeight!==candidate.height)throw new Error('图片尺寸不符。');}
    catch(e){URL.revokeObjectURL(url);urls.current.delete(url);if(!active(token))return;missed++;continue;}
    setSelected(old=>{const previous=old[candidate.candidateId];if(previous){URL.revokeObjectURL(previous.url);urls.current.delete(previous.url);}return {...old,[candidate.candidateId]:{file,url,sha256:digest,version:manifest.manifestVersion}};});matched++;
   }
   if(active(token))setNotice(`已匹配 ${matched} 张图片。${missed?`有 ${missed} 个文件不属于本批待加入原图，未选择。`:''}`);
  }catch{if(active(token))setError('图片暂时无法核验，请重新选择原始文件。');}
  finally{if(active(token)){running.current=false;setBusy(false);if(input.current)input.current.value='';}}
 }
 async function upload(){
  if(running.current||!ready||!manifest)return;running.current=true;setBusy(true);setError('');setNotice('');const token=generation.current,version=manifest.manifestVersion;let completed=0;
  try{
   let latest=await refresh(token);
   const assertBatch=()=>{if(latest.manifestVersion!==version)throw new Error('本批清单已变化，请重新选择原图。');if(latest.candidates.some(c=>c.status==='conflict'||c.status==='unknown'))throw new Error('存在冲突或结果未确认的图片，已停止，请先核对状态。');};
   assertBatch();
   const queue=manifest.candidates.filter(c=>selected[c.candidateId]&&c.status==='missing');
   if(!queue.length||queue.length>10)throw new Error('没有本批待加入图片。');
   for(const original of queue){
    if(!active(token))return;assertBatch();
    const c=latest.candidates.find(x=>x.candidateId===original.candidateId),local=selected[original.candidateId];
    if(!c||c.sha256!==local.sha256||c.byteLength!==local.file.size||local.version!==version||c.width!==original.width||c.height!==original.height||c.mime!==original.mime||c.workId!==original.workId||c.videoId!==original.videoId)throw new Error('图片或目标已变化，请重新核对原图。');
    if(c.status==='verified')continue;
    if(c.status!=='missing')throw new Error('图片结果尚未确认，已停止。');
    if(latest.budget.accountRemainingBytes!==null&&latest.budget.accountRemainingBytes<c.byteLength)throw new Error('剩余存储容量不足，已停止。');
    setCurrent(c.candidateId);
    const saved=await request(safeUpload(c,version),token,{method:'PUT',headers:{'Content-Type':'application/octet-stream'},body:local.file});
    if(saved.storageBlocked||saved.status!=='verified'||saved.candidateId!==c.candidateId||saved.sha256!==c.sha256||saved.byteLength!==c.byteLength)throw new Error(typeof saved.message==='string'&&saved.message?saved.message:'上传结果尚未确认，已停止；请先核对状态。');
    latest=await refresh(token);assertBatch();
    if(latest.candidates.find(x=>x.candidateId===c.candidateId&&x.sha256===c.sha256&&x.byteLength===c.byteLength)?.status!=='verified')throw new Error('读取核验尚未确认，已停止；请先核对状态。');
    completed++;setNotice(`本次已核验加入 ${completed} 张封面。`);
   }
   if(active(token)&&!completed)setNotice('已核对，所选图片无需重复上传。');
  }catch(e){if(active(token)){setReady(false);setError((e as Error).message||'结果未确认，请核对状态后继续。');}}
  finally{if(active(token)){running.current=false;setBusy(false);setCurrent('');}}
 }
 const candidates=manifest?.candidates??[],chosen=candidates.filter(c=>selected[c.candidateId]&&c.status==='missing'),done=candidates.filter(c=>c.status==='verified').length,blocked=candidates.some(c=>c.status==='conflict'||c.status==='unknown');
 return <><header className="header manage-header"><a href="/" className="brand">stage.</a><nav><a href="/">我的放映室</a><a href="/?view=works">作品库</a><a href="/?view=members">成员档案</a><a href="/?view=groups">团体索引</a></nav><span className="private-pill"><LockKeyhole size={13}/>管理页仅本人可见</span></header><main className="manage-shell photo-import-shell"><a className="text-button" href="/manage"><ArrowLeft size={15}/>管理资料</a><div className="manage-heading"><h1>补充 MV 封面</h1><p>核对本批原始图片，逐张加入私有存储。</p></div>
 <section className="panel photo-pick"><div><h2>本批 {candidates.length} 张封面</h2><p>按原文件校验值匹配，保留完整画面。</p><small>已核验 {done} 张 · 已选择 {chosen.length} 张</small></div><input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp" aria-label="选择本地封面原图" disabled={busy||loading||!ready||!candidates.some(c=>c.status==='missing')} onChange={e=>void choose(e.target.files)}/></section>
 {error&&<div className="photo-import-notice error" role="alert"><strong>还未全部完成</strong><p>{error}</p><p>已保留本地选择。请先核对当前状态，再决定是否继续。</p></div>}{notice&&<p className="photo-import-notice" role="status">{notice}</p>}
 <section className="panel photo-review"><div className="photo-review-heading"><div><h2>核对封面图片</h2><p>仅加入本批已审核且确认缺失的原图。点击预览可放大。</p></div><small>{chosen.length} 张待加入</small></div>{loading&&!manifest?<p role="status">正在核对封面…</p>:ready&&!candidates.length?<p role="status">无本批待加入图片。</p>:<div className="photo-import-list">{candidates.map(c=><article key={c.candidateId} className="photo-import-row"><button className="photo-import-preview" disabled={!selected[c.candidateId]} onClick={()=>setLightbox({src:selected[c.candidateId].url,label:c.label})} aria-label={'放大 '+c.label}>{selected[c.candidateId]?<img src={selected[c.candidateId].url} alt={c.label} style={{objectFit:'contain'}}/>:<span><ImagePlus size={22}/>{c.status==='verified'?'图片已核验':'选择原图预览'}</span>}</button><div className="photo-import-member"><strong>{c.label}</strong><small>{c.videoId}</small></div><div className="photo-import-source"><span>{c.width} × {c.height}</span><small>{c.byteLength} 字节</small></div><div className="photo-import-state"><span data-state={c.status==='verified'?'done':c.status==='missing'?'ready':'pending'}>{current===c.candidateId?<><LoaderCircle size={14} className="spin"/>正在核验…</>:c.status==='verified'?<><Check size={14}/>已核验</>:c.status==='missing'?'待加入':c.status==='conflict'?'内容冲突，已停止':'结果未确认，先核对'}</span></div></article>)}</div>}
 <div className="photo-import-actions"><small>{busy?'正在逐张核验，请保留此页面。':blocked?'需先核对异常状态。':'本批最多 10 张，不自动重试上传。'}</small><button className="button" disabled={busy||loading} onClick={()=>void check()}>核对当前状态</button><button className="button primary" disabled={busy||loading||!ready||blocked||!chosen.length} onClick={()=>void upload()}>{busy?<LoaderCircle className="spin" size={16}/>:<Check size={16}/>} {busy?'正在处理…':'加入已选封面'}</button></div></section><p className="subtle">重新打开页面后，请重新选择相同原文件。独立封面不在现有资料归档内，请保留已核验原图与恢复清单。</p></main><footer><span className="footer-brand">stage.</span><p>私人女团手帐</p></footer>{lightbox&&<PhotoLightbox {...lightbox} onClose={()=>setLightbox(null)}/>}</>;
}
