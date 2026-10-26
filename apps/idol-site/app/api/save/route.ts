import {saveRecord} from '@/lib/idol/save';
import {requireUser,sameOrigin,json,failure} from '@/lib/idol/http';
import {AppError} from '@/lib/idol/feishu';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{const user=await requireUser();sameOrigin(request);if(!request.headers.get('content-type')?.startsWith('application/json'))throw new AppError('INVALID_CONTENT_TYPE','保存内容格式不正确。',400);const text=await request.text();if(text.length>90000)throw new AppError('REQUEST_TOO_LARGE','保存内容过长。',413);return json(await saveRecord(user.userId,JSON.parse(text)));}catch(e){return failure(e);}}
