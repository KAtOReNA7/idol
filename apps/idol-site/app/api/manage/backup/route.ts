import{requireUser,json,failure}from'@/lib/idol/http';
import{backupOptions,backupDownload}from'@/lib/idol/backup-download';
export async function GET(request:Request){try{const user=await requireUser(),params=new URL(request.url).searchParams,raw=params.get('part');if(raw!==null){if(!/^[1-9][0-9]*$/.test(raw))return json({error:'INVALID_PART',message:'备份分卷无效。'},400);return await backupDownload(user.userId,Number(raw),params.get('snapshot')??'',params.get('manifest')??'');}return json(await backupOptions(user.userId));}catch(e){return failure(e);}}
