const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=require('node:path').resolve(__dirname,'../..');const ts=require(root+'/node_modules/typescript');
let current;const eq=(a,b)=>a&&b&&a.length===b.length&&a.every((v,i)=>Object.is(v,b[i]));
class Runner{constructor(fn){this.fn=fn;this.hooks=[];}render(props=this.props){this.props=props;this.i=0;this.effects=[];current=this;this.tree=this.fn(props);for(const f of this.effects)f();return this.tree;}unmount(){for(const h of this.hooks)h?.cleanup?.();}}
const React={useState(initial){const r=current,i=r.i++;if(!r.hooks[i]){const slot={value:typeof initial==='function'?initial():initial};slot.set=v=>{slot.value=typeof v==='function'?v(slot.value):v};r.hooks[i]=slot;}return [r.hooks[i].value,r.hooks[i].set]},useRef(v){const r=current,i=r.i++;return r.hooks[i]??(r.hooks[i]={current:v})},useMemo(fn,deps){const r=current,i=r.i++;const old=r.hooks[i];if(!old||!eq(old.deps,deps))r.hooks[i]={deps,value:fn()};return r.hooks[i].value},useCallback(fn,deps){return React.useMemo(()=>fn,deps)},useEffect(fn,deps){const r=current,i=r.i++,old=r.hooks[i];if(!old||!eq(old.deps,deps)){const slot={deps,cleanup:old?.cleanup};r.hooks[i]=slot;r.effects.push(()=>{slot.cleanup?.();slot.cleanup=fn();})}}};
const jsx=(type,props,key)=>({type,props:props??{},key});const runtime={jsx,jsxs:jsx,Fragment:'fragment'};
const walk=node=>Array.isArray(node)?node.flatMap(walk):!node||typeof node!=='object'?[]:[node,...walk(node.props?.children)];
const find=(t,p)=>walk(t).find(p),all=(t,p)=>walk(t).filter(p),text=n=>Array.isArray(n)?n.map(text).join(''):n&&typeof n==='object'?text(n.props?.children):n==null||typeof n==='boolean'?'':String(n);
const tick=()=>new Promise(r=>setImmediate(r));
function harness({respectAbort=true}={}){
 let now=1000,nextTimer=0;const timers=new Map(),requests=[],listeners=new Map();
 const setTimeout=(f,delay)=>{const id=++nextTimer;timers.set(id,{f,due:now+delay});return id},clearTimeout=id=>timers.delete(id);
 const win={addEventListener(k,f){if(!listeners.has(k))listeners.set(k,new Set());listeners.get(k).add(f)},removeEventListener(k,f){listeners.get(k)?.delete(f)},confirm:()=>true};
 const fetch=(url,options={})=>new Promise((resolve,reject)=>{const q={url,options,resolve,reject};requests.push(q);if(respectAbort&&options.signal){const abort=()=>reject(options.signal.reason??new DOMException('Aborted','AbortError'));if(options.signal.aborted)abort();else options.signal.addEventListener('abort',abort,{once:true});}});
 const e={},source=fs.readFileSync(root+'/app/page.tsx','utf8')+'\nexport {Editor,PhotoView};';
 const code=ts.transpileModule(source,{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const req=n=>n==='react'?React:n==='react/jsx-runtime'?runtime:n==='lucide-react'?new Proxy({},{get:(_,k)=>k}):n==='@/lib/idol/product-copy'?{requestMessage:c=>'Request failed: '+c}:{};
 vm.runInNewContext('(function(require,exports){'+code+'})',{console,window:win,fetch,crypto,URL,URLSearchParams,Date,AbortController,AbortSignal,DOMException,setTimeout,clearTimeout})(req,e);
 return {exports:e,requests,timers,listeners,window:win,async advance(ms){now+=ms;for(const [id,t] of timers)if(t.due<=now){timers.delete(id);t.f();}await tick();},reply(index,values={score:1,stylingScore:null,memory:'',note:''}){requests[index].resolve({ok:true,headers:{get:()=>"application/json"},json:async()=>({values,revision:'synthetic',watchedOptions:['未观看']})});}};
}
module.exports={harness,Runner,find,all,text,tick,assert};
