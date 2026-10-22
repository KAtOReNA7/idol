/* Deterministic hook/ref/event ports executing the real PhotoView, image adapters
 * and recovery provider. This is not a browser or React DOM result. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),esbuild=require('esbuild');
const root=path.resolve(__dirname,'../..');let compiled;
function source(){if(compiled)return compiled;const text=fs.readFileSync(path.join(root,'app/page.tsx'),'utf8'),ast=ts.createSourceFile('page.tsx',text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),photo=ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='PhotoView').getText(ast);return compiled=esbuild.buildSync({stdin:{contents:`import {useState,useEffect,useCallback,useMemo,useRef} from 'react';import {CatalogPhotoImage} from './components/app-image-presentation';import {MvPhotoReference} from './components/mv-photo-reference';import {mvPhotoLabel,mvReferencePhoto} from './lib/idol/mv-photo-presentation';import {ImageRecoveryProvider,ImageRecoveryControls} from './components/reliable-image';const ImageIcon=()=>null;${photo}\nexport {PhotoView,ImageRecoveryProvider,ImageRecoveryControls};`,resolveDir:root,loader:'tsx'},bundle:true,write:false,platform:'node',format:'cjs',jsx:'automatic',external:['react','react/*','react-dom','react-dom/*','lucide-react'],loader:{'.css':'empty'},logLevel:'silent'}).outputFiles[0].text;}
const equal=(a,b)=>a&&b&&a.length===b.length&&a.every((x,i)=>Object.is(x,b[i]));
function photoHarness({nested=false}={}){
 let current,contexts=new Map(),dirty=false,now=1000,uid=0,nextTimer=0,layout=[],effects=[],micro=[],tree,props;
 const fibers=new Map(),nodes=new Map(),timers=new Map(),requests=[];
 const document={activeElement:null,querySelector:()=>[...nodes.values()].find(n=>n.type==='main')?.dom??null};
 const slot=init=>{const index=current.cursor++;if(!current.hooks[index])current.hooks[index]=init();return current.hooks[index];};
 const effect=(fn,deps,list)=>{const s=slot(()=>({}));if(!equal(s.deps,deps)){s.deps=deps;list.push(()=>{s.cleanup?.();s.cleanup=fn();});}};
 const React={
 createElement(type,props,...children){return {type,key:props?.key,props:{...props,...(children.length?{children:children.length===1?children[0]:children}:{})}};},
 useState(initial){const s=slot(()=>({value:typeof initial==='function'?initial():initial}));return [s.value,v=>{const next=typeof v==='function'?v(s.value):v;if(!Object.is(next,s.value)){s.value=next;dirty=true;}}];},
 useRef:value=>slot(()=>({current:value})),useMemo(fn,deps){const s=slot(()=>({}));if(!equal(s.deps,deps)){s.deps=deps;s.value=fn();}return s.value;},useCallback(fn,deps){return React.useMemo(()=>fn,deps);},useId:()=>slot(()=>({id:'image-test-'+(++uid)})).id,
 useEffect:(fn,deps)=>effect(fn,deps,effects),useLayoutEffect:(fn,deps)=>effect(fn,deps,layout),
 createContext(value){const context={value};context.Provider={context};return context;},useContext:context=>contexts.has(context)?contexts.get(context):context.value,
 isValidElement:node=>!!node&&typeof node==='object'&&'type' in node,cloneElement:(node,extra)=>({...node,props:{...node.props,...extra}})
 };
 const jsx=(type,props,key)=>({type,props:props??{},key}),runtime={jsx,jsxs:jsx,Fragment:'fragment'};
 const modulePort={exports:{}};class Clock extends Date{static now(){return now;}}
 vm.runInNewContext('(function(require,module,exports){'+source()+'})',{Date:Clock,URL,URLSearchParams,queueMicrotask:fn=>micro.push(fn),setTimeout:(fn,ms)=>{const id=++nextTimer;timers.set(id,{fn,due:now+ms});return id;},clearTimeout:id=>timers.delete(id),fetch:(...args)=>{requests.push(args);throw Error('Image components must not fetch');}})(name=>name==='react'?React:name==='react/jsx-runtime'?runtime:require(name),modulePort,modulePort.exports);
 const output=modulePort.exports;
 function visit(node,key='root',parent=null){
  if(Array.isArray(node))return node.map((child,index)=>visit(child,key+'.'+(child?.key??index),parent));
  if(!node||typeof node!=='object')return node;
  const id=key+':'+String(node.key??'');
  if(node.type?.context){const context=node.type.context,previous=contexts;contexts=new Map(contexts);contexts.set(context,node.props.value);const result=visit(node.props.children,id+'.provider',parent);contexts=previous;return result;}
  if(typeof node.type==='function'){let fiber=fibers.get(id);if(!fiber||fiber.type!==node.type){fiber?.hooks.forEach(h=>h.cleanup?.());fiber={type:node.type,hooks:[],cursor:0};fibers.set(id,fiber);}fiber.seen=true;fiber.cursor=0;const previous=current;current=fiber;const rendered=node.type(node.props);current=previous;return visit(rendered,id+'.render',parent);}
  if(node.type==='fragment')return visit(node.props.children,id+'.fragment',parent);
  let saved=nodes.get(id);if(!saved||saved.type!==node.type){const attributes=new Map();const dom={ownerDocument:document,isConnected:true,tagName:String(node.type).toUpperCase(),complete:false,naturalWidth:0,getBoundingClientRect:()=>({width:400,height:600}),hasAttribute:k=>attributes.has(k),setAttribute:(k,v)=>attributes.set(k,v),removeAttribute:k=>attributes.delete(k),focus(){document.activeElement=this;},closest(selector){for(let n=this;n;n=n.parent){if(selector==='dialog'?n.tagName==='DIALOG':selector.startsWith('main')?n.tagName==='MAIN':['BUTTON','A','SUMMARY','LABEL'].includes(n.tagName))return n;}return null;}};saved={type:node.type,dom};nodes.set(id,saved);}saved.seen=true;saved.dom.parent=parent;saved.dom.isConnected=true;
  const ref=node.props.ref;if(ref){saved.ref=ref;if(typeof ref==='function')ref(saved.dom);else ref.current=saved.dom;}
  const nativeProps={...node.props};for(const event of ['onError','onLoad','onClick'])if(nativeProps[event]){const handler=nativeProps[event];nativeProps[event]=(supplied={})=>{if(event==='onClick')document.activeElement=saved.dom;return handler({currentTarget:saved.dom,target:saved.dom,preventDefault(){},stopPropagation(){},...supplied});};}
  return {...node,dom:saved.dom,props:{...nativeProps,children:visit(node.props.children,id+'.children',saved.dom)}};
 }
 function render(next=props){props=next;let passes=0;do{dirty=false;layout=[];effects=[];for(const f of fibers.values())f.seen=false;for(const n of nodes.values())n.seen=false;
 const photo=jsx(output.PhotoView,props),host=jsx(output.ImageRecoveryProvider,{children:jsx('main',{children:[nested?jsx('button',{children:photo}):photo,jsx(output.ImageRecoveryControls,{})]})});tree=visit(host);
 for(const [key,f] of fibers)if(!f.seen){f.hooks.forEach(h=>h.cleanup?.());fibers.delete(key);}for(const [key,n] of nodes)if(!n.seen){n.dom.isConnected=false;if(n.ref?.current===n.dom)n.ref.current=null;nodes.delete(key);}
 for(const fn of [...layout,...effects])fn();while(micro.length)micro.shift()();if(++passes>30)throw Error('Image test hook loop');}while(dirty);return tree;}
 const r={render,get tree(){return tree;}};return {r,requests,document,advance(ms){now+=ms;for(const [id,t]of timers)if(t.due<=now){timers.delete(id);t.fn();}render();},unmount(){for(const f of fibers.values())f.hooks.forEach(h=>h.cleanup?.());fibers.clear();}};
}
module.exports={photoHarness};
