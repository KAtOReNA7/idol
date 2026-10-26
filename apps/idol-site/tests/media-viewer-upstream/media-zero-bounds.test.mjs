import test from 'node:test';
import assert from 'node:assert/strict';
import {measureMediaBounds,resolveViewerGeometry} from '../../lib/idol/design-review/vcha-runtime/shared/media-geometry.js';

// Explicit DOM geometry contracts, not browser visual acceptance.
const rect=(width=640,height=400,left=20,top=30)=>({left,top,width,height});
function environment(box=rect()){
  const window={innerWidth:1200,innerHeight:900,getComputedStyle:node=>node.style??{overflow:'visible'}};
  const document={defaultView:window,documentElement:{clientWidth:1200,clientHeight:900}};
  const root={ownerDocument:document,getBoundingClientRect:()=>box};
  return {root,document,window,measure:()=>measureMediaBounds({root})};
}
const empty=measurement=>{assert.equal(measurement.supported,true);assert.equal(measurement.visible,false);assert.equal(resolveViewerGeometry({bounds:measurement.bounds,naturalWidth:1280,naturalHeight:720,maxWidth:320,maxHeight:180}),null);};

for(const [width,height] of [[0,0],[0,400],[640,0]])test(`finite ${width}x${height} root is supported and invisible`,()=>{
  const env=environment(rect(width,height)),measurement=env.measure();empty(measurement);
  assert.equal(measurement.hostRect.width,width);assert.equal(measurement.hostRect.height,height);
});

for(const [width,height] of [[0,0],[0,400],[640,0]])test(`finite ${width}x${height} overflow:hidden ancestor is retained as an empty clip`,()=>{
  const env=environment();env.root.parentElement={getBoundingClientRect:()=>rect(width,height),style:{overflow:'hidden'}};
  const measurement=env.measure();empty(measurement);assert.equal(measurement.clips.length,1);
  assert.equal(measurement.clips[0].rect.width,width);assert.equal(measurement.clips[0].rect.height,height);
});

test('zero-height Y clip and zero-width X clip respect axis-specific clipping',()=>{
  for(const [width,height,style] of [[640,0,{overflowX:'visible',overflowY:'hidden'}],[0,400,{overflowX:'hidden',overflowY:'visible'}]]){
    const env=environment();env.root.parentElement={getBoundingClientRect:()=>rect(width,height),style};
    const measurement=env.measure();empty(measurement);assert.equal(measurement.clips.length,1);
  }
  const env=environment();env.root.parentElement={getBoundingClientRect:()=>rect(640,0),style:{overflowX:'hidden',overflowY:'visible'}};
  const measurement=env.measure();assert.equal(measurement.supported,true);assert.equal(measurement.visible,true);assert.equal(measurement.bounds.height,400,'non-clipping axis must not create a new clip');
});

test('scaled-to-zero measured root stays invisible even when layout dimensions remain positive',()=>{
  const env=environment(rect(0,0));Object.assign(env.root,{offsetWidth:640,offsetHeight:400,clientWidth:632,clientHeight:392,clientLeft:4,clientTop:4});empty(env.measure());
});

test('ordinary offset/scale/viewport/ancestor intersections keep nonempty quality-capped geometry',()=>{
  const env=environment(rect(640,400,100,50));Object.assign(env.root,{offsetWidth:320,offsetHeight:200,clientWidth:316,clientHeight:196,clientLeft:2,clientTop:2,style:{paddingLeft:'10px',paddingRight:'5px',paddingTop:'5px',paddingBottom:'3px'}});
  env.window.visualViewport={width:500,height:500,offsetLeft:120,offsetTop:60};env.root.parentElement={getBoundingClientRect:()=>rect(450,300,140,80),style:{overflow:'hidden'}};
  const measurement=env.measure();assert.equal(measurement.supported,true);assert.equal(measurement.visible,true);assert.deepEqual(measurement.bounds,{left:140,top:80,right:590,bottom:380,width:450,height:300});
  const geometry=resolveViewerGeometry({bounds:measurement.bounds,naturalWidth:1280,naturalHeight:720,maxWidth:320,maxHeight:180});assert(geometry.imageWidth>0&&geometry.imageWidth<=320);assert(geometry.imageHeight<=180);assert(geometry.left>=140&&geometry.left+geometry.width<=590);assert(geometry.top>=80&&geometry.top+geometry.maxHeight<=380);
});

test('missing or nonfinite/negative host geometry alone remains unsupported',()=>{
  const env=environment();delete env.root.getBoundingClientRect;assert.equal(env.measure().supported,false);
  for(const box of [rect(NaN,400),rect(640,Infinity),rect(-1,400),rect(640,-1)])assert.equal(environment(box).measure().supported,false);
});

test('null or throwing geometry APIs are invalid rather than empty rectangles',()=>{
  const env=environment();env.root.getBoundingClientRect=()=>null;assert.equal(env.measure().supported,false);
  env.root.getBoundingClientRect=()=>{throw new Error('fixture unavailable geometry');};assert.equal(env.measure().supported,false);
});
