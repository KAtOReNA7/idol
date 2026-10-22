import {AppError} from './feishu';
export const MAX_IMAGE_BYTES=16000000;
// Header checks reject HTML/login payloads. Full pixel decoding is performed by
// the independent backup verifier before migration is eligible for cutover.
export function imageHeader(bytes:Uint8Array){
 const fail=()=>{throw new AppError('IMAGE_INVALID','照片内容无效，本次没有完成备份。');};
 if(bytes.length<12)return fail();const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 if(bytes[0]===137&&String.fromCharCode(...bytes.slice(1,4))==='PNG'&&v.getUint32(4)===0x0d0a1a0a){if(bytes.length<33||String.fromCharCode(...bytes.slice(12,16))!=='IHDR')return fail();const width=v.getUint32(16),height=v.getUint32(20);if(!width||!height||width*height>100000000)return fail();return {mime:'image/png',width,height};}
 if(bytes[0]===255&&bytes[1]===216){let i=2;while(i+4<bytes.length){if(bytes[i++]!==255)continue;while(bytes[i]===255)i++;const marker=bytes[i++];if(marker===0xda||marker===0xd9)break;if(marker>=0xd0&&marker<=0xd7)continue;const length=v.getUint16(i);if(length<2||i+length>bytes.length)return fail();if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)){if(length<8)return fail();const height=v.getUint16(i+3),width=v.getUint16(i+5);if(!width||!height||width*height>100000000)return fail();return {mime:'image/jpeg',width,height};}i+=length;}return fail();}
 if(String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP'){
  if(v.getUint32(4,true)+8!==bytes.length)return fail();
  // Simple lossy WebP: RIFF/VP8 key-frame dimensions (RFC 6386, section 9.1).
  // These are header checks only; exact-hash admission still requires offline
  // full pixel decoding. Other WebP layouts retain unknown dimensions.
  if(String.fromCharCode(...bytes.slice(12,16))==='VP8 '){
   if(bytes.length<30)return fail();const size=v.getUint32(16,true);
   if(size<10||20+size+(size&1)>bytes.length||(bytes[20]&1)!==0||bytes[23]!==0x9d||bytes[24]!==0x01||bytes[25]!==0x2a)return fail();
   const width=v.getUint16(26,true)&0x3fff,height=v.getUint16(28,true)&0x3fff;
   if(!width||!height||width*height>100000000)return fail();return {mime:'image/webp',width,height};
  }
  return {mime:'image/webp',width:null,height:null};
 }
 if(String.fromCharCode(...bytes.slice(0,6)).match(/^GIF8[79]a$/)){const width=v.getUint16(6,true),height=v.getUint16(8,true);if(!width||!height||width*height>100000000)return fail();return {mime:'image/gif',width,height};}
 return fail();
}
export async function boundedBytes(response:Response,limit=MAX_IMAGE_BYTES){if(!response.body)throw new AppError('IMAGE_EMPTY','照片内容为空。');const reader=response.body.getReader(),chunks:Uint8Array[]=[];let count=0;try{for(;;){const r=await reader.read();if(r.done)break;count+=r.value.length;if(count>limit){await reader.cancel();throw new AppError('IMAGE_TOO_LARGE','照片超出单文件安全范围。');}chunks.push(r.value);}}finally{reader.releaseLock();}const bytes=new Uint8Array(count);let cursor=0;for(const chunk of chunks){bytes.set(chunk,cursor);cursor+=chunk.length;}return bytes;}
