'use client';
import {useEffect,useRef,useState} from 'react';
import '../manage.css';
type Pair={memberName:string;song:string;memberId:string;workId:string;recordId:string|null;revision:string|null};
type Preview={token:string;pairs:Pair[];missing:number};
async function call(options?:RequestInit){const r=await fetch('/api/manage/relations',{cache:'no-store',...options});const d:any=await r.json();if(!r.ok)throw new Error(d.message||'关联操作未完成。');return d;}
export default function Relations(){const [preview,setPreview]=useState<Preview|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[result,setResult]=useState<any>(null);const pending=useRef<{operationId:string;token:string}|null>(null),running=useRef(false);
 async function refresh(){setError('');try{setPreview(await call());}catch(e){setError((e as Error).message);}}
 useEffect(()=>{void refresh();},[]);
 async function apply(){if(running.current||!preview)return;running.current=true;setBusy(true);setError('');try{pending.current??={operationId:crypto.randomUUID(),token:preview.token};const d=await call({method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(pending.current)});setResult(d);pending.current=null;await refresh();}catch(e){setError((e as Error).message);}finally{running.current=false;setBusy(false);}}
 return <main className="manage-shell"><a href="/manage">返回管理资料</a><h1>补建五条成员关联</h1><p>仅限已确认的 Touch 三位成员和 SWICY 两位成员。新记录不填写评分、备注或照片。</p>{error&&<p role="alert">{error}</p>}{result&&<p role="status">五条关联已保存并回读核验。</p>}<ul>{(result?.pairs??preview?.pairs??[]).map((p:Pair)=><li key={p.memberId}><strong>{p.memberName} · {p.song}</strong><p>记录：{p.recordId??'尚未创建'}</p>{p.revision&&<p>版本：{p.revision}</p>}</li>)}</ul><button disabled={busy} onClick={()=>void refresh()}>核对当前状态</button> <button disabled={busy||!preview||!pending.current&&preview.missing!==5} onClick={()=>void apply()}>{busy?'正在保存…':pending.current?'重试同一次操作':'新增这五条空白关联'}</button>{pending.current&&!busy&&<p>重试会核对同一次操作。若已确认是资料冲突，请刷新页面后重新预览。</p>}</main>;
}
