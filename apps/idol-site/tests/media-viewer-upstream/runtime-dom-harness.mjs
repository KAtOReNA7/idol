import assert from 'node:assert/strict';
// Native EventTarget + explicit element/resource contract. This constructs and
// exercises the real widget but does not parse HTML, lay out CSS or take screenshots.
export class Element extends EventTarget{
  constructor(document,tag='div'){super();this.ownerDocument=document;this.tagName=tag.toUpperCase();this.children=[];this.parentNode=null;this.attributes=new Map();this.dataset={};this.markup='';this.open=false;this.removed=0;this.focused=0;this.hidden=false;}
  setAttribute(key,value){this.attributes.set(key,String(value));if(key==='open')this.open=true;}
  getAttribute(key){return this.attributes.get(key)??null;}
  hasAttribute(key){return this.attributes.has(key);}
  removeAttribute(key){this.attributes.delete(key);if(key==='open')this.open=false;}
  get id(){return this.getAttribute('id');}set id(value){this.setAttribute('id',value);}
  get innerHTML(){return this.markup;}set innerHTML(value){this.replaceChildren();this.markup=String(value);}
  matches(selector){return selector.split(',').some(part=>{part=part.trim();const tag=/^[a-z]+/i.exec(part)?.[0];if(tag&&tag.toUpperCase()!==this.tagName)return false;for(const match of part.matchAll(/\[([\w-]+)(?:="([^"]*)")?\]/g))if(!this.hasAttribute(match[1])||(match[2]!==undefined&&this.getAttribute(match[1])!==match[2]))return false;return part==='*'||Boolean(tag)||part.startsWith('[');});}
  closest(selector){for(let node=this;node;node=node.parentNode)if(node.matches(selector))return node;return null;}
  querySelectorAll(selector){return this.children.flatMap(node=>[...(node.matches(selector)?[node]:[]),...node.querySelectorAll(selector)]);}
  querySelector(selector){return this.querySelectorAll(selector)[0]??null;}
  append(...nodes){for(const node of nodes){node.remove();node.parentNode=this;this.children.push(node);}}
  replaceChildren(...nodes){for(const node of this.children)node.parentNode=null;this.children=[];this.markup='';this.append(...nodes);}
  contains(node){for(let current=node;current;current=current.parentNode)if(current===this)return true;return false;}
  remove(){if(this.parentNode){this.parentNode.children=this.parentNode.children.filter(node=>node!==this);this.parentNode=null;}this.removed++;}
  insertAdjacentElement(position,node){assert.equal(position,'afterend');const parent=this.parentNode;assert.ok(parent);node.remove();node.parentNode=parent;parent.children.splice(parent.children.indexOf(this)+1,0,node);}
  focus(){this.focused++;this.ownerDocument.activeElement=this;}
  showModal(){this.open=true;this.setAttribute('open','');}
  close(){this.open=false;this.removeAttribute('open');this.dispatchEvent(new Event('close'));}
}
export function documentFor(){const doc={createElement(tag){return new Element(doc,tag);},activeElement:null};doc.body=new Element(doc,'body');doc.head=new Element(doc,'head');return doc;}
export function rootFor(doc=documentFor()){const root=doc.createElement('main');doc.body.append(root);return root;}
