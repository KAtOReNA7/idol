// @ts-nocheck
// Synthetic visual specimen; actual production stylesheet hook and compiled CSS.
import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {useExperienceStyles} from '../components/use-experience-styles';
const manifest=await fetch('/manifest.json').then(r=>r.json());
const legacy=['bm','illit','xg','aespa','ive','kiof','stayc','nmixx','hearts2hearts','kiiikiii','itzy','lesserafim','saymyname','katseye'];
let api:any;const results:any[]=[];let running=false;
const pause=(ms:number)=>new Promise(r=>setTimeout(r,ms));
async function until(fn:()=>boolean,label:string,ms=6000){const start=performance.now();while(!fn()){if(performance.now()-start>ms)throw Error('Timeout: '+label);await pause(25);}await pause(60);}
function check(ok:any,label:string){if(!ok)throw Error(label);}
function report(){const value={status:running?'running':results.some(x=>x.status==='fail')?'fail':results.length?'pass':'idle',viewport:{width:innerWidth,height:innerHeight},results};(window as any).__cssHttpResults=value;document.title=value.status.toUpperCase()+' · HTTP CSS fixture';document.querySelector('#http-results')!.textContent=JSON.stringify(value,null,2);}
async function select(theme:any,href=theme?.href){api.select(theme,href);await until(()=>api.href===href,'selection');}
function App(){
 const [theme,setTheme]=useState<any>(null),[href,setHref]=useState<string|undefined>();
 const {phase,retry}=useExperienceStyles(href);api={phase,href,theme,retry,select(t:any,h:any){setTheme(t);setHref(h);}};
 const klass=theme?.legacy?theme.legacy+'-experience':theme?'candidate-experience candidate-'+theme.slug+'-experience':'';
 return <><aside className="qa-controls"><h1>真实 HTTP CSS 验收</h1><p>合成展示样本；使用生产样式加载器、官方构建 CSS 和字体。无生产 API、图片或视频。</p><label>主题 <select aria-label="验收主题" value={theme?.slug??'home'} onChange={e=>{const t=manifest.themes.find((x:any)=>x.slug===e.target.value)??(e.target.value==='home'?null:{slug:e.target.value,legacy:e.target.value});api.select(t,t?.href);}}><option value="home">首页（无需候选CSS）</option>{legacy.map(x=><option key={x} value={x}>旧团 {x}</option>)}{manifest.themes.map((x:any)=><option key={x.slug} value={x.slug}>{x.slug}</option>)}</select></label><p id="http-phase" aria-live="polite">{phase} · {href??'无候选stylesheet'}</p><button onClick={()=>void run()}>运行全部真实HTTP检查（约30秒）</button><button onClick={retry} disabled={!href}>仅重试当前样式</button><details><summary>逐项结果与路径</summary><pre id="http-results"/></details></aside>
 <div className={klass} data-selected-theme={theme?.slug??'home'}><header className="header"><span className="brand">stage.</span><nav>仅本地合成主题样本</nav></header><main>
 {phase==='loading'||phase==='error'?<div role="status" className="qa-status">{phase==='error'?'真实CSS请求失败或超时，可重试。':'等待真实CSS加载…'}<button onClick={retry}>重试</button></div>:null}
 <div data-browse-content inert={phase==='loading'||phase==='error'} style={{visibility:phase==='loading'||phase==='error'?'hidden':'visible'}}><section className="detail"><button className="back">返回合成作品库</button><div className="work-detail-top"><div><div className="video-stage"><span>无媒体请求 · Synthetic video placeholder</span></div><p className="video-caption">此处不放 iframe，不调用生产媒体</p></div><aside className="work-aside"><span className="eyebrow">SYNTHETIC MUSIC VIDEO</span><h1>Theme sample 示例作品</h1><div className="tags"><span>{theme?.slug??'home'}</span><span>合成数据</span></div><div className="work-score"><span>展示分数</span><strong>8.5</strong></div><div className="editor"><div className="editor-heading">仅显示布局，不保存</div><div className="editor-fields"><label><span>合成分数</span><input aria-label="合成分数" defaultValue="8.5"/></label><label className="wide"><span>合成备注</span><textarea aria-label="合成备注" defaultValue="字体、布局与换主题可见性检查。"/></label></div></div></aside></div><section className="section"><h2>字体与响应式检查</h2><p>ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 女团作品记录。This specimen is not a full artist-page visual acceptance.</p></section></section></div></main></div></>;
}
createRoot(document.querySelector('#root')!).render(<App/>);
async function caseOf(name:string,fn:()=>Promise<any>){try{const detail=await fn();results.push({name,status:'pass',detail});}catch(e){results.push({name,status:'fail',error:String(e)});}report();}
async function run(){if(running)return;running=true;results.length=0;report();const id=Date.now()+'-'+Math.random().toString(16).slice(2);const [a,b]=manifest.themes;
 await caseOf('native 404 → same URL retry → actual compiled CSS success',async()=>{const href='/fault/once404/'+a.href.split('/').at(-1)+'?case='+id;await select(a,href);await until(()=>api.phase==='error','native 404');api.retry();await until(()=>api.phase==='ready','404 retry');return {href,phase:api.phase};});
 await caseOf('real 15s deadline → new retry link → switch B before late A response → return A ready',async()=>{
 const href='/fault/timeout/'+a.href.split('/').at(-1)+'?case='+id;const start=performance.now();await select(a,href);
 const original=[...document.querySelectorAll('link[rel=stylesheet]')].find((x:any)=>x.getAttribute('href')===href);
 await until(()=>api.phase==='error','15-second timeout',17000);const elapsed=performance.now()-start;check(elapsed>=14500&&elapsed<17000,'deadline not approximately15s: '+elapsed);check(!original?.isConnected,'timed-out original link remains attached');
 api.retry();await until(()=>api.phase==='loading','retry starts while original HTTP still in flight');
 const retryLink=[...document.querySelectorAll('link[rel=stylesheet]')].find((x:any)=>x.getAttribute('href')===href);check(retryLink&&retryLink!==original,'retry must create a new link');
 await select(b);await until(()=>api.phase==='ready','B ready before late A');const switchedAt=Date.now();
 await pause(Math.max(0,19500-(performance.now()-start)));check(api.href===b.href&&api.phase==='ready','late A response changed B');
 const log=await fetch('/fixture-log.json').then(r=>r.json());const initial=log.requests.find((x:any)=>x.path.includes('case='+id)&&x.scenario?.startsWith('timeout/')&&x.attempt===1);
 check(initial?.status===200&&Date.parse(initial.finishedAt)>switchedAt,'A response did not actually finish after B switch');
 await select(a,href);await until(()=>api.phase==='ready','return A uses completed retry asset');check(retryLink.sheet,'retry link has no native loaded sheet');
 return {href,elapsedMs:Math.round(elapsed),switchedAt,initialFinishedAt:initial.finishedAt,newLink:true,oldDetached:true,returnedReady:true,transport:'same-URL requests may be coalesced by the browser'};
 });
 await caseOf('real delayed A → B → A uses same pending asset',async()=>{const href='/fault/delay/'+a.href.split('/').at(-1)+'?case='+id;await select(a,href);check(api.phase==='loading','A must be pending');await select(b);await until(()=>api.phase==='ready','B cached');await select(a,href);await until(()=>api.phase==='ready','A completes');return {href};});
 await caseOf('37 official compiled theme styles load and switch with native links',async()=>{const loaded=[];for(const theme of manifest.themes){await select(theme);await until(()=>api.phase==='ready',theme.slug+' stylesheet');const link=[...document.querySelectorAll('link[rel=stylesheet]')].find((x:any)=>x.getAttribute('href')===theme.href);check(link?.sheet,'missing CSSStyleSheet '+theme.slug);check(document.querySelector('[data-selected-theme]')?.getAttribute('data-selected-theme')===theme.slug,'theme class not selected');loaded.push({slug:theme.slug,href:theme.href,rules:link.sheet.cssRules.length});}check(loaded.length===37,'expected37');return loaded;});
 await caseOf('all compiled local font resources return bytes and decode as FontFace',async()=>{const loaded=[];for(const [i,path] of manifest.fontPaths.entries()){const response=await fetch(path);check(response.ok,'font HTTP '+path);const bytes=await response.arrayBuffer();check(bytes.byteLength>0,'font empty '+path);const face=new FontFace('FixtureFont'+i,bytes);await face.load();check(face.status==='loaded','font decode '+path);loaded.push({path,bytes:bytes.byteLength,status:face.status});}return loaded;});
 await caseOf('old14 and home never enter candidate stylesheet waiting',async()=>{const count=document.querySelectorAll('link[rel=stylesheet]').length;for(const name of [...legacy,'home']){await select(name==='home'?null:{slug:name,legacy:name},undefined);check(api.phase==='not-required','legacy candidate wait '+name);}check(document.querySelectorAll('link[rel=stylesheet]').length===count,'legacy created candidate stylesheet');return {legacy,home:true};});
 await caseOf('server confirms actual first404, slow response, retry and paths',async()=>{
 const log=await fetch('/fixture-log.json').then(r=>r.json());
 const requests=log.requests.filter((x:any)=>x.path.includes('case='+id));
 const fault=requests.filter((x:any)=>x.scenario?.startsWith('once404/'));
 check(fault.some((x:any)=>x.attempt===1&&x.status===404),'missing real first404');
 check(fault.some((x:any)=>x.attempt===2&&x.status===200),'missing actual404 retry200');
 const slow=requests.filter((x:any)=>x.scenario?.startsWith('timeout/'));
 check(slow.some((x:any)=>x.attempt===1&&x.delaySeconds===18),'missing actual18s request');
 check(slow.some((x:any)=>x.status===200),'missing actual timeout-path200 completion');
 check(slow.length===1||slow.some((x:any)=>x.attempt===2&&x.status===200),'unexpected retry transport failure');
 check(requests.filter((x:any)=>x.scenario?.startsWith('delay/')).length===1,'A-B-A issued duplicate delayed request');
 return {requests,scenarioCounts:log.scenarioCounts};
 });
 running=false;report();
}
