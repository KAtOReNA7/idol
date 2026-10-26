// Run from the repository root. Local, deterministic derivatives only; originals are never written.
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import sharp from 'sharp';
const content=JSON.parse(await fs.readFile('data/meovv-artist.json','utf8'));
const resize={width:1200,withoutEnlargement:true,kernel:'lanczos3'};
const encoding={quality:95,effort:6,smartSubsample:true};
const sha256=buffer=>crypto.createHash('sha256').update(buffer).digest('hex');
const entries=[];
for(const [memberId,portrait] of Object.entries(content.portraits)){
 const source=await fs.readFile('public'+portrait.image),metadata=await sharp(source).metadata();
 if(metadata.width!==metadata.height||metadata.space!=='srgb'||metadata.orientation||metadata.hasProfile)throw new Error('Review source framing/color before generating '+memberId);
 const {data,info}=await sharp(source).resize(resize).webp(encoding).toBuffer({resolveWithObject:true});
 const image=portrait.image.replace('.jpg','-roster.webp');
 await fs.writeFile('public'+image,data);
 entries.push({memberId,stageName:portrait.stageName,source:{image:portrait.image,sha256:sha256(source),bytes:source.length,width:metadata.width,height:metadata.height},derivative:{image,sha256:sha256(data),bytes:data.length,width:info.width,height:info.height}});
}
await fs.writeFile('docs/meovv-roster-portraits.json',JSON.stringify({schemaVersion:1,scope:'MEOVV independent roster only; member detail and catalog keep original sources',pipeline:{sharp:sharp.versions.sharp,libvips:sharp.versions.vips,webp:sharp.versions.webp,resize,encoding,color:'sRGB; no color edits, sharpening, crops, padding, or upscaling'},entries},null,2)+'\n');
console.log(entries.map(e=>`${e.stageName}: ${e.source.bytes} -> ${e.derivative.bytes} bytes (${e.derivative.width}px)`).join('\n'));
