/** Download quality is an editorial decision; pixel dimensions never upgrade it. */
const boundedWidths=Object.freeze({card:240,feature:240,detail:320,enlargement:320});
const aliases=Object.freeze({home:'feature',hero:'feature',featured:'feature',recommendation:'feature',work:'detail',lightbox:'enlargement',modal:'enlargement',viewer:'enlargement'});
const positive=value=>Number.isFinite(value)&&value>0;

export function normalizeMediaContext(value='card'){
  const context=aliases[value]??value;
  return Object.hasOwn(boundedWidths,context)?context:'card';
}

export function resolveMediaPresentation(asset,options={}){
  const details=asset&&typeof asset==='object'?asset:{};
  const context=normalizeMediaContext(options.context);
  const cardOnly=details.qualityLevel==='card';
  const active=cardOnly||(details.imageryManaged===true&&details.noUpscale===true)||options.mediaRole==='video-preview';
  const hasDimensions=positive(details.width)&&positive(details.height);
  const naturalWidth=hasDimensions?details.width:null,naturalHeight=hasDimensions?details.height:null;
  const maxWidth=active&&hasDimensions?Math.min(naturalWidth,cardOnly?boundedWidths[context]:naturalWidth):null;
  const maxHeight=maxWidth==null?null:Math.min(naturalHeight,maxWidth*naturalHeight/naturalWidth);
  return Object.freeze({
    active,canRender:!active||hasDimensions,context,
    qualityLevel:cardOnly?'card':details.qualityLevel??null,
    recommendedUse:cardOnly?'bounded-video-preview':active?'video-preview':'retained-artwork',
    naturalWidth,naturalHeight,maxWidth,maxHeight,
    allowPrimaryVisual:active&&!cardOnly&&details.qualityLevel==='primary',
    allowEnlargement:active&&!cardOnly&&details.qualityLevel==='primary',
    operation:active?(cardOnly?'bounded-preview':'natural-preview'):'retained-artwork',
    actionLabel:cardOnly?'查看缩略预览':details.qualityLevel==='primary'?'查看图片':'查看预览',objectFit:active?'contain':null,
    originalBytesUnchanged:true
  });
}

/** A viewer receives the same fixed quality decision, never an upgrade request. */
export function resolveMediaViewer(asset,options={}){
  const presentation=resolveMediaPresentation(asset,{...options,context:'enlargement'});
  return Object.freeze({...presentation,mode:presentation.operation,title:presentation.actionLabel});
}
