import {getChatGPTUser} from '@/app/chatgpt-auth';
import {AppError} from './feishu';
export async function requireUser(){const user=await getChatGPTUser();if(!user)throw new AppError('AUTH_REQUIRED','请使用 ChatGPT 登录后访问私人手帐。',401);if(user.email.toLowerCase()!=='wuke40758@gmail.com')throw new AppError('OWNER_ONLY','此私人手帐仅供站点所有者使用。',403);return user;}
export function sameOrigin(request:Request){const origin=request.headers.get('origin');if(!origin||origin!==new URL(request.url).origin)throw new AppError('ORIGIN_REJECTED','保存来源不匹配，请刷新本站后重试。',403);}
export function json(value:unknown,status=200){return Response.json(value,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});}
export function failure(e:unknown){return e instanceof AppError?json({error:e.code,message:e.message},e.status):json({error:'REQUEST_FAILED',kind:e instanceof Error?e.name:'unknown',message:'操作未完成，请稍后重新读取。'},502);}
