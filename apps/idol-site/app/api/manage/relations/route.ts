import {relationPreview,applyRelations} from '@/lib/idol/relation-maintenance';
import {requireUser,sameOrigin,json,failure} from '@/lib/idol/http';
import {AppError} from '@/lib/idol/feishu';
export const dynamic='force-dynamic';
export async function GET(){try{const user=await requireUser();return json(await relationPreview(user.userId));}catch(e){return failure(e);}}
export async function POST(request:Request){try{const user=await requireUser();sameOrigin(request);if(!request.headers.get('content-type')?.startsWith('application/json'))throw new AppError('INVALID_CONTENT_TYPE','请求格式无效。',400);const reader=request.body?.getReader();if(!reader)throw new AppError('INVALID_RELATION_OPERATION','请求为空。',400);let size=0,text='';const decoder=new TextDecoder();while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>1024){await reader.cancel();throw new AppError('REQUEST_TOO_LARGE','请求过长。',413);}text+=decoder.decode(value,{stream:true});}text+=decoder.decode();let input;try{input=JSON.parse(text);}catch{throw new AppError('INVALID_RELATION_OPERATION','请求格式无效。',400);}return json(await applyRelations(user.userId,input));}catch(e){return failure(e);}}
