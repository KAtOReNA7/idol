import {memberFactDetail,saveMemberFacts} from '@/lib/idol/member-facts';
import {requireUser,sameOrigin,json,failure} from '@/lib/idol/http';
import {AppError} from '@/lib/idol/feishu';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{const user=await requireUser();return json(await memberFactDetail(user.userId,new URL(request.url).searchParams.get('id')??''));}catch(e){return failure(e);}}
export async function POST(request:Request){try{const user=await requireUser();sameOrigin(request);if(!request.headers.get('content-type')?.startsWith('application/json'))throw new AppError('INVALID_CONTENT_TYPE','保存内容格式不正确。',400);const text=await request.text();if(text.length>12000)throw new AppError('REQUEST_TOO_LARGE','保存内容过长。',413);let input;try{input=JSON.parse(text);}catch{throw new AppError('INVALID_FACTS','保存内容格式不正确。',400);}return json(await saveMemberFacts(user.userId,input));}catch(e){return failure(e);}}
