'use client';

import type {CSSProperties,ReactNode} from 'react';
import imported from './kep1er-native-rect-clips.json';
import type {ArtVariants} from './kep1er-native-art';

type Clip={maskNodeId:string;width:number;height:number;imageWidth:number;imageHeight:number;imageOffsetX:number;imageOffsetY:number;x:number;y:number};
const clips=imported.clips as Record<string,Clip>;
const frames=imported.frames as Record<string,Record<string,string>>;
const sizes=['compact','phone','desktop','wide'] as const;

/** Viewports only. No missing SVG artwork is generated or substituted. */
export function nativeRectClipNodes(screen:'home'|'members'|'history'|'library'|'profile',index=0):ArtVariants{
 const source=screen==='home'?['home-320','home-390','home-1440','home-2560']
  :screen==='profile'?['profile-320','profile-320','profile-1440','profile-1440']
  :screen==='history'?['history-390','history-390','members-1440','members-1440']
  :[`${screen}-390`,`${screen}-390`,`${screen}-1440`,`${screen}-1440`];
 return Object.fromEntries(sizes.map((size,i)=>[size,frames[source[i]]?.[`clip-${index}`]]));
}

export function nativeRectClipStyle(nodes:ArtVariants):CSSProperties{
 const ids={compact:nodes.compact??nodes.phone??nodes.desktop,phone:nodes.phone??nodes.compact??nodes.desktop,desktop:nodes.desktop??nodes.phone,wide:nodes.wide??nodes.desktop??nodes.phone};
 const style:Record<string,string|number>={};
 for(const size of sizes){
  const clip=ids[size]?clips[ids[size]!]:undefined;
  if(!clip)continue;
  const prefix=`--kf-clip-${size}-`;
  style[prefix+'ratio']=`${clip.width} / ${clip.height}`;
  style[prefix+'image-x']=`${clip.imageOffsetX/clip.width*100}%`;
  style[prefix+'image-y']=`${clip.imageOffsetY/clip.height*100}%`;
  style[prefix+'image-width']=`${clip.imageWidth/clip.width*100}%`;
  style[prefix+'image-height']=`${clip.imageHeight/clip.height*100}%`;
  style[prefix+'source-y']=`${clip.y}px`;
 }
 return style as CSSProperties;
}

/** One image DOM node retains its source, accessibility, recovery and interactions. */
export function NativeRectClip({nodes,children,className=''}:{nodes:ArtVariants;children:ReactNode;className?:string}){
 if(!Object.values(nodes).some(node=>node&&clips[node]))return <>{children}</>;
 return <span className={`kf-native-rect-clip ${className}`} data-native-rect-clip={Object.values(nodes).filter(Boolean).join(' ')} style={nativeRectClipStyle(nodes)}><span className="kf-native-rect-image-plane">{children}</span></span>;
}
