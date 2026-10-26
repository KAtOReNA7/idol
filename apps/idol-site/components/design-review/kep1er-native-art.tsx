'use client';

import {useEffect,useRef,useState,type CSSProperties} from 'react';
import importedAssets from './kep1er-native-assets.json';
import importedControls from './kep1er-native-controls.json';
import importedSourceArt from './kep1er-retained-source-art.json';
import importedSourcePrimitives from './kep1er-retained-source-primitives.json';

type Box={x:number;y:number;width:number;height:number};
type Asset={src:string;width:number;height:number;exportNodeId:string;sourceFrameId:string;boundingBox?:Box;renderBounds?:Box;renderOffset?:{x:number;y:number}};
type RetainedSourceArt={src:string;width:number;height:number;sourceFrameId:string;currentNodeId:string;nativeBoundingBox:Box;nativePaintOffset?:{x:number;y:number};sourceSha256:string;componentSha256:string;assetSha256:string};
type SourcePrimitive={sourceFrameId:string;nativeBoundingBox:Box;nativePaintOffset:{x:number;y:number};width:number;height:number;kind:'rectangle'|'line';role:string;css:{width:number;height:number;backgroundColor:string;borderWidth:number;borderColor:string};sourceSha256:string;componentSha256:string};
type Control={name:string;sourceFrameId:string;width:number;height:number;x:number;y:number;layers:{nodeId:string;x:number;y:number;renderPosition?:boolean}[]};
const assets=Object.fromEntries(Object.entries(importedAssets.slots).map(([node,index])=>[node,importedAssets.files[index]])) as Record<string,Asset>;
const controls=importedControls as Record<string,Control>;
const sourceArt=importedSourceArt.slots as Record<string,RetainedSourceArt>;
const sourcePrimitives=importedSourcePrimitives.slots as Record<string,SourcePrimitive>;
const hasArtwork=(node:string)=>!!(assets[node]||sourceArt[node]||sourcePrimitives[node]);
const paintOffset=(node:string)=>!assets[node]?(sourceArt[node]?.nativePaintOffset??sourcePrimitives[node]?.nativePaintOffset):undefined;
export type ArtVariants={compact?:string;phone?:string;desktop?:string;wide?:string};
const breakpoints=['compact','phone','desktop','wide'] as const;

/** Every image keeps its intrinsic SVG root dimensions. Only its layout wrapper can scale. */
export function NativeArt({node,className='',style}:{node:string;className?:string;style?:CSSProperties}){
 const asset=assets[node],retainedSource=sourceArt[node],primitive=sourcePrimitives[node];
 // Ordinary authored geometry stays CSS paint inside the existing live element.
 if(!asset&&!retainedSource&&primitive){const {css}=primitive;const line=primitive.kind==='line';const stroke=css.borderWidth;return <span className={`kf-native-art kf-retained-source-primitive ${className}`} data-source-primitive-node={node} data-source-primitive-frame={primitive.sourceFrameId} data-art-provenance="retained-authored-source-css" data-source-component-sha256={primitive.componentSha256} aria-hidden="true" style={{width:primitive.nativeBoundingBox.width,height:primitive.nativeBoundingBox.height,pointerEvents:'none',...style}}><span style={{position:'absolute',display:'block',left:line?primitive.nativePaintOffset.x:0,top:line?primitive.nativePaintOffset.y:0,width:line?primitive.width:css.width,height:line?primitive.height:css.height,backgroundColor:css.backgroundColor,pointerEvents:'none',border:0,padding:0,margin:0}}/>{stroke>0&&<span style={{position:'absolute',display:'block',left:-stroke/2,top:-stroke/2,width:css.width+stroke,height:css.height+stroke,boxSizing:'border-box',border:`${stroke}px solid ${css.borderColor}`,borderRadius:0,padding:0,margin:0,pointerEvents:'none'}}/>}</span>;}
 // Approved authored-source component, kept distinct from current native exports.
 if(!asset&&retainedSource)return <span className={`kf-native-art kf-retained-source-art ${className}`} data-source-art-node={node} data-source-art-frame={retainedSource.sourceFrameId} data-art-provenance="retained-authored-source" data-source-component-sha256={retainedSource.componentSha256} aria-hidden="true" style={{width:retainedSource.nativeBoundingBox.width,height:retainedSource.nativeBoundingBox.height,...style}}><img src={retainedSource.src} alt="" width={retainedSource.width} height={retainedSource.height} style={retainedSource.nativePaintOffset?{position:'absolute',left:retainedSource.nativePaintOffset.x,top:retainedSource.nativePaintOffset.y}:undefined} draggable={false}/></span>;
 if(!asset)return <span className={`kf-native-unresolved ${className}`} data-native-unresolved={node} aria-hidden="true"/>;
 return <span className={`kf-native-art ${className}`} data-native-node={node} data-native-export={asset.exportNodeId} aria-hidden="true" style={{width:asset.width,height:asset.height,...style}}><img src={asset.src} alt="" width={asset.width} height={asset.height} draggable={false}/></span>;
}

export function ResponsiveArt({nodes,label,className=''}:{nodes:ArtVariants;label?:string;className?:string}){
 const ids={compact:nodes.compact??nodes.phone??nodes.desktop,phone:nodes.phone??nodes.compact??nodes.desktop,desktop:nodes.desktop??nodes.phone,wide:nodes.wide??nodes.desktop??nodes.phone};
 return <span className={`kf-responsive-art ${className}`}>{label&&<span className="kf-visually-hidden">{label}</span>}{breakpoints.map(size=>ids[size]&&<span className={`kf-art-variant kf-art-${size}`} key={size}>{hasArtwork(ids[size]!) ? <NativeArt node={ids[size]!}/> : label?<span className="kf-native-label-unresolved" data-native-unresolved={ids[size]} role="status">标题暂时无法显示</span>:<NativeArt node={ids[size]!}/>}</span>)}</span>;
}

/** Leaf art inside live controls. A paint-anchored source layer is shifted to layout origin before its image paint offset is applied once. */
function ControlArtwork({node}:{node:string}){
 const host=useRef<HTMLSpanElement>(null),control=controls[node];
 const [scale,setScale]=useState({x:1,y:1});
 useEffect(()=>{if(!host.current||!control)return;const target=host.current;const update=()=>{const {width,height}=target.getBoundingClientRect();setScale({x:width/control.width,y:height/control.height});};update();const observer=new ResizeObserver(update);observer.observe(target);return()=>observer.disconnect();},[control]);
 if(!control)return <StretchArtwork node={node} axis="xy"/>;
 const primary=importedSourcePrimitives.profilePrimarySurface;const required=node===primary.control?primary.requiredLayers:[control.layers[0]?.nodeId];const visibleFill=node===primary.control?primary.visibleFillLayer:control.layers[0]?.nodeId;
 return <span className="kf-control-art" ref={host} aria-hidden="true" data-native-control={node} data-native-surface-complete={required.every(hasArtwork)} data-native-fill-missing={!hasArtwork(visibleFill)||undefined}><span className="kf-control-canvas" style={{width:control.width,height:control.height,transform:`scale(${scale.x},${scale.y})`}}>{control.layers.map(layer=>{const asset=assets[layer.nodeId];const sourceOffset=paintOffset(layer.nodeId);const strokeX=layer.renderPosition?-(sourceOffset?.x??0):(asset?.renderOffset?.x??0);const strokeY=layer.renderPosition?-(sourceOffset?.y??0):(asset?.renderOffset?.y??0);return <NativeArt key={layer.nodeId} node={layer.nodeId} style={{position:'absolute',left:layer.x+strokeX,top:layer.y+strokeY}}/>;})}</span></span>;
}
export function NativeControl({nodes}:{nodes:ArtVariants}){
 const ids={compact:nodes.compact??nodes.phone??nodes.desktop,phone:nodes.phone??nodes.compact??nodes.desktop,desktop:nodes.desktop??nodes.phone,wide:nodes.wide??nodes.desktop??nodes.phone};
 return <>{breakpoints.map(size=>ids[size]&&<span className={`kf-art-variant kf-art-${size} kf-control-variant`} key={size}><ControlArtwork node={ids[size]!}/></span>)}</>;
}

function StretchArtwork({node,axis='x'}:{node:string;axis?:'x'|'xy'}){
 const ref=useRef<HTMLSpanElement>(null),asset=assets[node]??sourceArt[node]??sourcePrimitives[node];
 const sourceOffset=paintOffset(node);
 const [scale,setScale]=useState({x:1,y:1});
 useEffect(()=>{if(!ref.current||!asset)return;const target=ref.current;const update=()=>{const box=target.getBoundingClientRect();setScale({x:box.width/asset.width,y:axis==='xy'?box.height/asset.height:1});};update();const observer=new ResizeObserver(update);observer.observe(target);return()=>observer.disconnect();},[asset,axis]);
 return <span className="kf-stretch-art" ref={ref}><NativeArt node={node} style={{transform:`scale(${scale.x},${scale.y})`,transformOrigin:'top left',...(sourceOffset?{left:-sourceOffset.x*scale.x,top:-sourceOffset.y*scale.y}:{})}}/></span>;
}
export function ResponsiveStretch({nodes,className='',axis='x'}:{nodes:ArtVariants;className?:string;axis?:'x'|'xy'}){
 const ids={compact:nodes.compact??nodes.phone??nodes.desktop,phone:nodes.phone??nodes.compact??nodes.desktop,desktop:nodes.desktop??nodes.phone,wide:nodes.wide??nodes.desktop??nodes.phone};
 return <span className={`kf-responsive-stretch ${className}`} aria-hidden="true">{breakpoints.map(size=>ids[size]&&<span className={`kf-art-variant kf-art-${size}`} key={size}><StretchArtwork node={ids[size]!} axis={axis}/></span>)}</span>;
}

export function nativeWorkControl(workId:string,video:'mv'|'stage'):ArtVariants{const name=`work-${workId}-${video}`;const find=(frame:string)=>Object.entries(controls).find(([,control])=>control.sourceFrameId===frame&&control.name===name)?.[0];return {phone:find('663:3723')??(video==='mv'?'663:3842':'663:3847'),desktop:find('663:4575')??(video==='mv'?'663:4686':'663:4691')};}
