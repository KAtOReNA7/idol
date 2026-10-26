// Walk the composed tree so the shadow host and its clipping ancestors participate.
export const mediaParent=node=>node?.parentElement??node?.parentNode??node?.host??null;
const finite=value=>Number.isFinite(Number(value));
const positive=value=>finite(value)&&Number(value)>0;
const n=value=>Number(value)||0;
const rounded=value=>Math.max(0,Math.floor(value*1000)/1000);
const rectOf=element=>{
  if(typeof element?.getBoundingClientRect!=='function')return null;
  try{
    const r=element.getBoundingClientRect();if(!r)return null;
    const left=Number(r.left??r.x),top=Number(r.top??r.y),width=Number(r.width??Number(r.right)-left),height=Number(r.height??Number(r.bottom)-top);
    // A finite empty rectangle is measurable and clips visibility to zero.
    return [left,top,width,height].every(Number.isFinite)&&width>=0&&height>=0?{left,top,width,height,right:left+width,bottom:top+height}:null;
  }catch{return null;}
};
const intersect=(a,b,x=true,y=true)=>{
  const left=x?Math.max(a.left,b.left):a.left,top=y?Math.max(a.top,b.top):a.top;
  const right=x?Math.min(a.right,b.right):a.right,bottom=y?Math.min(a.bottom,b.bottom):a.bottom;
  return {left,top,right,bottom,width:Math.max(0,right-left),height:Math.max(0,bottom-top)};
};
const styleOf=(element,window)=>{try{return window?.getComputedStyle?.(element)??null;}catch{return null;}};
const cssPx=value=>Number.parseFloat(value)||0;
function contentRect(element,rect,window,{padding=true}={}){
  const style=styleOf(element,window),sx=positive(element.offsetWidth)?rect.width/Number(element.offsetWidth):1,sy=positive(element.offsetHeight)?rect.height/Number(element.offsetHeight):1;
  const bx=finite(element.clientLeft)?n(element.clientLeft):cssPx(style?.borderLeftWidth),by=finite(element.clientTop)?n(element.clientTop):cssPx(style?.borderTopWidth);
  const rightBorder=positive(element.offsetWidth)&&positive(element.clientWidth)?Math.max(0,Number(element.offsetWidth)-Number(element.clientWidth)-bx):cssPx(style?.borderRightWidth);
  const bottomBorder=positive(element.offsetHeight)&&positive(element.clientHeight)?Math.max(0,Number(element.offsetHeight)-Number(element.clientHeight)-by):cssPx(style?.borderBottomWidth);
  const l=(bx+(padding?cssPx(style?.paddingLeft):0))*sx,t=(by+(padding?cssPx(style?.paddingTop):0))*sy;
  const r=(rightBorder+(padding?cssPx(style?.paddingRight):0))*sx,b=(bottomBorder+(padding?cssPx(style?.paddingBottom):0))*sy;
  const left=rect.left+l,top=rect.top+t,right=Math.max(left,rect.right-r),bottom=Math.max(top,rect.bottom-b);
  return {left,top,right,bottom,width:right-left,height:bottom-top};
}

/** Real CSS-pixel host/viewport measurements. Missing geometry is explicit. */
export function measureMediaBounds({root,document=root?.ownerDocument,window=document?.defaultView}={}){
  const hostRect=rectOf(root);
  const viewport=window?.visualViewport;
  const width=positive(viewport?.width)?Number(viewport.width):positive(window?.innerWidth)?Number(window.innerWidth):Number(document?.documentElement?.clientWidth);
  const height=positive(viewport?.height)?Number(viewport.height):positive(window?.innerHeight)?Number(window.innerHeight):Number(document?.documentElement?.clientHeight);
  if(!hostRect||!positive(width)||!positive(height))return {supported:false,reason:!hostRect?'host-rect-unavailable':'viewport-rect-unavailable'};
  const left=n(viewport?.offsetLeft),top=n(viewport?.offsetTop),viewportRect={left,top,width,height,right:left+width,bottom:top+height};
  const hostContent=contentRect(root,hostRect,window);let bounds=intersect(hostContent,viewportRect);const clips=[];
  for(let ancestor=mediaParent(root);ancestor;ancestor=mediaParent(ancestor)){
    const style=styleOf(ancestor,window),x=/(auto|scroll|hidden|clip)/.test(style?.overflowX??style?.overflow??''),y=/(auto|scroll|hidden|clip)/.test(style?.overflowY??style?.overflow??'');
    if(!x&&!y)continue;const r=rectOf(ancestor);if(!r)continue;const clip=contentRect(ancestor,r,window,{padding:false});bounds=intersect(bounds,clip,x,y);clips.push({rect:clip,x,y});
  }
  return {supported:true,hostRect,hostContent,viewport:viewportRect,clips,bounds,visible:bounds.width>0&&bounds.height>0};
}

/** Keep the whole dialog and unaltered-aspect image inside the visible host. */
export function resolveViewerGeometry({bounds,naturalWidth,naturalHeight,maxWidth=naturalWidth,maxHeight=naturalHeight,headingHeight=24,controlsHeight=32,gutter=12}={}){
  if(!bounds||!positive(bounds.width)||!positive(bounds.height))return null;
  const gap=Math.min(gutter,bounds.width/8,bounds.height/8),availableWidth=Math.max(0,bounds.width-2*gap),availableHeight=Math.max(0,bounds.height-2*gap);
  const padding=Math.min(16,availableWidth/10,availableHeight/10),border=2;
  const outerWidth=Math.min(availableWidth,maxWidth+padding*2+border),innerWidth=Math.max(0,outerWidth-padding*2-border);
  const chrome=padding*2+border+Math.max(0,headingHeight)+12+Math.max(0,controlsHeight)+12;
  // A long heading must not permanently collapse an available image to zero.
  // The dialog scrolls internally when its text/control chrome consumes the host.
  const roomHeight=Math.max(Math.min(48,availableHeight/4),availableHeight-chrome),ratio=naturalWidth/naturalHeight;
  const imageWidth=rounded(Math.min(naturalWidth,maxWidth,innerWidth,Math.min(naturalHeight,maxHeight,roomHeight)*ratio));
  const imageHeight=rounded(imageWidth/ratio),renderedHeight=Math.min(availableHeight,chrome+imageHeight);
  // Anchor the top to the host; max-height must remain valid even when actual
  // browser text height differs from this measured content estimate.
  const left=bounds.left+gap+(availableWidth-outerWidth)/2,top=bounds.top+gap;
  return {left,top,width:outerWidth,maxWidth:availableWidth,maxHeight:availableHeight,padding,imageWidth,imageHeight,estimatedHeight:renderedHeight,right:left+outerWidth,bottom:top+availableHeight,contentMayScroll:chrome+imageHeight>availableHeight};
}
