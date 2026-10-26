import media from '../../data/mv-public-media.json';
const covers=new Map(media.covers.map(row=>[row.videoId,row]));
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function nativeMvImage(row){const cover=covers.get(row.videoId);return cover?{publicVideoId:cover.videoId,sourceUrl:'https://www.youtube.com/watch?v='+cover.videoId}:row.image;}
export function nativeMvCoverHtml(asset,alt,className='',eager=false){
 const p=covers.get(asset?.publicVideoId);if(!p)return null;
 const crop=p.sourceCrop;let zoom=1;
 if(crop){const x=Math.max(crop.x,p.width-crop.x-crop.width),y=Math.max(crop.y,p.height-crop.y-crop.height);zoom=Math.max(p.width/(p.width-2*x),p.height/(p.height-2*y));}
 return `<span class="asset-frame ${escape(className)}" data-public-video-cover="${escape(p.videoId)}" style="position:relative;display:block;width:100%;aspect-ratio:16/9;overflow:hidden"><img src="${escape(p.src)}" alt="${escape(alt)} · 对应视频封面" loading="${eager?'eager':'lazy'}" style="display:block;width:100%;height:100%;object-fit:cover;transform:scale(${zoom});transform-origin:center"></span>`;
}
