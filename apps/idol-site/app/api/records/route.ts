import {ownControl,assertSourceUnchanged} from '@/lib/idol/native-storage';
import {readNativeDetail} from '@/lib/idol/native-reader';
import {getRecord,isTable,AppError} from '@/lib/idol/feishu';
import {schema,editableValues} from '@/lib/idol/live';
import {recoverRecordSave} from '@/lib/idol/save';
import {hash} from '@/lib/idol/hash';
import {readTrace} from '@/lib/idol/read-diagnostics';
import {requireUser,json,failure} from '@/lib/idol/http';
export const dynamic='force-dynamic';
export async function GET(request:Request){let trace:ReturnType<typeof readTrace>|undefined;try{const p=new URL(request.url).searchParams;const table=p.get('table');trace=readTrace('records',table??'',p.get('id')??'');const user=await requireUser();trace.mark('auth');const before=await ownControl(user.userId);trace.mark('storage');if(!isTable(table))throw new AppError('INVALID_TABLE','记录类型无效。',400);const id=p.get('id')??'';const native=await readNativeDetail(user.userId,table,id);trace.mark('nativeCheck');if(native){await assertSourceUnchanged(user.userId,before);trace.finish(200);return json(native);}const pendingSave=await recoverRecordSave(user.userId,table,id);trace.mark('pendingSaveCheck');const fields=await schema(table);trace.mark('schema');const record=await getRecord(table,id);trace.mark('record');await assertSourceUnchanged(user.userId,before);const result={table,recordId:id,mode:'live',pendingSave,revision:await hash(record.fields),values:editableValues(table,record,fields),watchedOptions:table==='works'?(fields.find(f=>f.field_id==='fld3QKrpLN')?.property?.options??[]).map(o=>o.name):[]};trace.mark('projection');trace.finish(200);return json(result);}catch(e){trace?.finish(e instanceof AppError?e.status:502,e instanceof AppError?e.code:'REQUEST_FAILED');return failure(e);}}
