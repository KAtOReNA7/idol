'use strict';
// Test-only adapters for the actual native renderers. No content aliases or
// replacement timeline markup. Browser DOM/geometry and image-quality services
// are inert; this suite tests event text, identities and links, not image pixels.
const assert=require('node:assert/strict');
const {renderToReadableStream}=require('react-dom/server');

async function markup(element){
 const errors=[];
 const stream=await renderToReadableStream(element,{onError:error=>errors.push(error)});
 await stream.allReady;
 const html=await new Response(stream).text();
 if(errors.length)throw errors[0];
 return html;
}

const decode=s=>s.replace(/&(?:amp|lt|gt|quot|apos|#(?:x[0-9a-f]+|[0-9]+));/gi,m=>({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'"}[m.slice(1,-1)]??String.fromCodePoint(parseInt(m.slice(2,-1).replace(/^x/i,''),/^&#x/i.test(m)?16:10))));
// SSR emits balanced HTML; keep ancestry so nested reporting sections cannot
// be mistaken for confirmed events, and typography spans retain visible text.
function tree(html){
 const root={tag:'#root',attrs:{},children:[],parent:null},stack=[root];
 const voids=new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
 for(const token of html.matchAll(/<!--[\s\S]*?-->|<\/?[a-z][^>]*>|[^<]+/gi)){
  const value=token[0];if(value.startsWith('<!--'))continue;
  if(!value.startsWith('<')){stack.at(-1).children.push(decode(value));continue;}
  const tag=value.match(/^<\/?([\w-]+)/)[1].toLowerCase();
  if(value.startsWith('</')){for(let i=stack.length-1;i>0;i--)if(stack[i].tag===tag){stack.length=i;break;}continue;}
  const attrs={};for(const a of value.matchAll(/\s([\w:-]+)(?:="([^"]*)"|='([^']*)')?/g))attrs[a[1].toLowerCase()]=decode(a[2]??a[3]??'');
  const node={tag,attrs,children:[],parent:stack.at(-1)};node.parent.children.push(node);
  if(!voids.has(tag)&&!value.endsWith('/>'))stack.push(node);
 }
 return root;
}
function find(root,predicate){const rows=[];function walk(node){if(typeof node==='string')return;if(predicate(node))rows.push(node);node.children.forEach(walk);}walk(root);return rows;}
const text=node=>typeof node==='string'?node:node.children.map(text).join('');
const hasClass=(node,name)=>(node.attrs.class??'').split(/\s+/).includes(name);
const reported=node=>{for(let n=node;n;n=n.parent)if(Object.hasOwn(n.attrs,'data-reported-timeline'))return true;return false;};
const eventId=node=>node.attrs['data-timeline-event-id']??node.attrs['data-event-key']??node.attrs['data-event-id']??node.attrs.id;

function mountAstra(product,slug,data,route){
 const actual=product.createAstraRuntime({document:{},location:{href:'https://timeline-test.invalid/'}});
 const hash=route.includes('section=overview')?'#/home':'#/timeline';
 let html='';
 const scope={data,hash,alive:true,element:{},ownsRoot:()=>true,destroy(){this.alive=false;},listen(){},onRoute(){},get:()=>null,raf(){},setHTML:value=>{html=value;},
  api:{...actual,route:()=>({page:hash==='#/home'?'home':'timeline',params:new URLSearchParams()}),qualityStyle:()=>'',assetQuality:asset=>({nativeWidth:asset?.width,nativeHeight:asset?.height}),zoomAllowed:()=>false}};
 const factory=slug==='izna'?product.createIznaModule:product.createIfeyeModule;
 const handle=factory({createScope:()=>scope}).mount({element:scope.element,data});handle.destroy();
 assert.ok(html,'native renderer must synchronously deliver its actual HTML');
 return html;
}

module.exports={markup,tree,find,text,hasClass,reported,eventId,mountAstra};
