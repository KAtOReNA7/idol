import {AppError} from '@/lib/idol/feishu';
import {failure,json,requireUser,sameOrigin} from '@/lib/idol/http';
import {savePersonalMvRating} from '@/lib/idol/personal-mv-ratings';
export const dynamic='force-dynamic';

export async function POST(request:Request){
 try{
  const user=await requireUser();
  sameOrigin(request);
  if(request.headers.get('content-type')?.split(';')[0].trim()!=='application/json')throw new AppError('INVALID_CONTENT_TYPE','保存内容格式不正确。',400);
  const reader=request.body?.getReader();
  if(!reader)throw new AppError('INVALID_SAVE','请填写成员评分。',400);
  const decoder=new TextDecoder();
  let text='',size=0;
  try{
   while(true){
    const chunk=await reader.read();
    if(chunk.done)break;
    size+=chunk.value.byteLength;
    if(size>4096){await reader.cancel();throw new AppError('REQUEST_TOO_LARGE','保存内容过长。',413);}
    text+=decoder.decode(chunk.value,{stream:true});
   }
   text+=decoder.decode();
  }finally{reader.releaseLock();}
  let input:unknown;
  try{input=JSON.parse(text);}catch{throw new AppError('INVALID_SAVE','保存内容格式不正确。',400);}
  return json(await savePersonalMvRating(user.userId,input));
 }catch(error){return failure(error);}
}
