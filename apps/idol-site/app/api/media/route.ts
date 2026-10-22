import {readPublicMedia} from '@/lib/idol/public-reader';
import {ownerForRequest} from '@/lib/idol/public-access';
import {ownControl,assertSourceUnchanged} from '@/lib/idol/native-storage';
import {readNativeMedia} from '@/lib/idol/native-reader';
import {getRecord,isTable,AppError,mediaBytes} from '@/lib/idol/feishu';
import {schema,byId} from '@/lib/idol/live';
import {F} from '@/lib/idol/fields';
import {requireUser,failure} from '@/lib/idol/http';
import {readTrace} from '@/lib/idol/read-diagnostics';
export const dynamic='force-dynamic';
export async function GET(request:Request){let trace:ReturnType<typeof readTrace>|undefined;try{const p=new URL(request.url).searchParams;const table=p.get('table');trace=readTrace('media',table??'',p.get('record')??'');const user=await ownerForRequest();if(!user)return await readPublicMedia(request);trace.mark('auth');const before=await ownControl(user.userId);trace.mark('storage');if(!isTable(table)||!['members','ratings'].includes(table))throw new AppError('INVALID_MEDIA','该图片未获授权。',400);const recordId=p.get('record')??'';const fieldId=table==='members'?F.members.photo:F.ratings.photo;const index=Number(p.get('index')??0);if(!Number.isInteger(index)||index<0||index>20)throw new AppError('INVALID_MEDIA','图片序号无效。',400);const native=await readNativeMedia(user.userId,table,recordId,index);trace.mark('nativeCheck');if(native){await assertSourceUnchanged(user.userId,before);trace.finish(200);return native;}const fields=await schema(table);trace.mark('schema');const record=await getRecord(table,recordId);trace.mark('record');const attachments=byId(record,fields)[fieldId];if(!Array.isArray(attachments))throw new AppError('MISSING_MEDIA','此记录没有已核验图片。',404);const token=attachments[index]?.file_token;if(typeof token!=='string'||!token)throw new AppError('MISSING_MEDIA','此记录没有已核验图片。',404);const response=await mediaBytes(token);trace.mark('mediaHeaders');await assertSourceUnchanged(user.userId,before);trace.finish(response.status);return response;}catch(e){trace?.finish(e instanceof AppError?e.status:502,e instanceof AppError?e.code:'REQUEST_FAILED');return failure(e);}}
