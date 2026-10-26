'use client';
import {useEffect, useRef, useState} from 'react';
import {assetUrl, BUILD_ASSETS, verifyBuildAsset, type BuildAsset} from '@/lib/idol/build-asset-format';
type Status = {id?: unknown; version?: unknown; state?: unknown};
function Slot({asset}: {asset: BuildAsset}) {
 const [file, setFile] = useState<File | null>(null), [busy, setBusy] = useState(false);
 const [message, setMessage] = useState('尚未核验'), [canUpload, setCanUpload] = useState(false);
 const generation = useRef(0), locked = useRef(false), attempted = useRef(false);
 const fenceKey = `meovv-build-asset-attempt-v1:${asset.id}:${asset.sha256}`;
 useEffect(() => {
  const sync = () => {
   try { if (localStorage.getItem(fenceKey)) { attempted.current = true; setCanUpload(false); setMessage('此浏览器已尝试过上传。保留不确定写入保护，仅做只读核验。'); } }
   catch { attempted.current = true; setCanUpload(false); setMessage('本地重复上传保护不可用，仅允许只读核验。'); }
  };
  sync(); window.addEventListener('storage', sync); return () => window.removeEventListener('storage', sync);
 }, [fenceKey]);
 async function select(next?: File) {
  const token = ++generation.current; setFile(null); setCanUpload(false);
  if (!next) { setMessage('尚未选择文件'); return; }
  setMessage('正在核验原字节…');
  try {
   if (next.size !== asset.bytes) throw new Error('文件大小不符');
   const bytes = new Uint8Array(await next.arrayBuffer());
   await verifyBuildAsset(asset, bytes, next.type);
   if (token !== generation.current) return;
   setFile(next); setCanUpload(false); setMessage('本地 SHA、大小、JPEG 与尺寸一致。上传前请先读取存储状态。');
  } catch { if (token === generation.current) setMessage('核验失败：请选择指定的原始 JPEG，不会上传或转换图片。'); }
 }
 async function inspect() {
  if (locked.current) return; locked.current = true; setBusy(true); setCanUpload(false);
  try {
   const response = await fetch(assetUrl(asset, true), {cache: 'no-store', credentials: 'same-origin', signal: AbortSignal.timeout(45000)});
   if (!response.ok) throw new Error(); const result = await response.json() as Status;
   if (result.id !== asset.id || result.version !== asset.sha256) throw new Error();
   if (result.state === 'verified') {
    const readback = await fetch(assetUrl(asset), {cache: 'no-store', credentials: 'same-origin', signal: AbortSignal.timeout(30000)});
    if (!readback.ok || readback.headers.get('content-length') !== String(asset.bytes)) throw new Error();
    await verifyBuildAsset(asset, new Uint8Array(await readback.arrayBuffer()), readback.headers.get('content-type') ?? '');
    setMessage('已读回并核验原始字节。此所有者浏览器检查不替代独立匿名访问验收。');
   } else if (result.state === 'missing' && !attempted.current) {
    setCanUpload(!!file); setMessage('存储中尚无此固定副本。选择并核验原文件后，可显式上传一次。');
   } else { setMessage('状态为冲突或不确定。停止上传，仅可继续只读核验；缺失结果不证明此前写入没有执行。'); }
  } catch { setMessage('读回未能确认。没有重试或修改其他数据，请保留当前文件。'); }
  finally { locked.current = false; setBusy(false); }
 }
 async function upload() {
  if (!file || !canUpload || locked.current || attempted.current) return;
  locked.current = true; setBusy(true); setCanUpload(false);
  // Browser-profile lock makes the localStorage claim atomic across tabs. It
  // is not a global server lock and cannot coordinate a different browser.
  try {
   if (!navigator.locks) throw new Error('Local locking unavailable');
   await navigator.locks.request(fenceKey, {mode: 'exclusive'}, () => {
    if (localStorage.getItem(fenceKey)) throw new Error('Already attempted');
    localStorage.setItem(fenceKey, 'attempted'); attempted.current = true;
   });
  } catch {
   locked.current = false; setBusy(false); setMessage('无法取得本地一次性上传保护，未发起上传。仅做只读核验。'); return;
  }
  try {
   const response = await fetch(assetUrl(asset, true), {method: 'PUT', headers: {'Content-Type': 'application/octet-stream'}, body: file, credentials: 'same-origin', signal: AbortSignal.timeout(100000)});
   const result = await response.json() as Status;
   if (!response.ok || result.state !== 'verified' || result.id !== asset.id || result.version !== asset.sha256) throw new Error();
   setMessage('上传已由服务端读回核验。请再点击只读核验，随后另做独立匿名访问验收。');
  } catch { setMessage('上传结果不确定或冲突。不会自动重试，请仅用只读核验确认。'); }
  finally { locked.current = false; setBusy(false); }
 }
 return <fieldset disabled={busy} style={{marginBlock: 20, padding: 16}}>
  <legend>{asset.label} · 固定原图副本</legend>
  <p>{asset.bytes.toLocaleString()} bytes · JPEG · {asset.width} × {asset.height}</p>
  <p style={{overflowWrap: 'anywhere'}}>SHA-256: {asset.sha256}</p>
  <label>选择 {asset.sourceUrl.split('/').at(-1)} <input aria-label={`${asset.label} 原始 JPEG`} type="file" accept="image/jpeg,.jpg" onChange={event => void select(event.target.files?.[0])}/></label>
  <div style={{display: 'flex', gap: 12, marginTop: 12}}>
   <button type="button" onClick={() => void inspect()}>只读核验存储与 GET</button>
   <button type="button" disabled={!file || !canUpload} onClick={() => void upload()}>上传 {asset.label} 固定副本</button>
  </div><p role="status">{message}</p>
 </fieldset>;
}
export default function BuildAssetsClient() {
 return <main style={{maxWidth: 840, margin: '24px auto', padding: 20}}><h1>MEOVV 四张构建图片副本</h1>
  <p>仅限站点所有者。固定四张现有公开 JPEG，不改原图库、评分、备注或观看状态。不覆盖、不删除、不自动重试。</p>
  <p>原始 Git/public 文件与独立四文件备份是恢复来源，旧原图库备份不包含这些副本。此页不会切换前台地址或移除静态文件。</p>
  {BUILD_ASSETS.map(asset => <Slot key={asset.id} asset={asset}/>)}<a href="/manage">返回管理</a></main>;
}
