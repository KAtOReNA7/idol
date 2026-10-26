import { env } from 'cloudflare:workers';
export const BASE = 'CxLfbmGOpaT87SsoccFcoDjVnke';
export const TABLES = {groups:'tbl5uwKCLEq7buNy',members:'tbl7AstbUbwIsGN5',works:'tbl4094oMWoPJQl7',ratings:'tbl4ngn1PQGWabVK'} as const;
export type TableKey = keyof typeof TABLES;
export type MigrationReadTrace={purpose:'preflight'|'capture'|'activation';table:TableKey;kind:'fields'|'records'};
type ReadPhase='auth_wait'|'request_gate'|'http_headers'|'body_parse'|'retry_wait';
// Fixed metadata only: no URL, cursor, record/owner ID, credential, body or error
// message may enter this diagnostic. It is opt-in for migration reads only.
function traceCode(e:unknown){if(e instanceof AppError&&/^(FEISHU_\d{1,10}|SOURCE_READ_DEADLINE|UPSTREAM_INVALID|NOT_CONFIGURED|AUTH_INVALID)$/.test(e.code))return e.code;const name=e&&typeof e==='object'&&'name'in e?String(e.name):'';return ['AbortError','TimeoutError','TypeError'].includes(name)?name:'OTHER_ERROR';}
function readTrace(trace:MigrationReadTrace|undefined,phase:ReadPhase,start:number,extra:{attempt?:number;status?:number;code?:string;outcome:'ok'|'error'}={outcome:'ok'}){if(!trace||!isTable(trace.table)||!['preflight','capture','activation'].includes(trace.purpose)||!['fields','records'].includes(trace.kind))return;try{console.info(JSON.stringify({event:'idol_migration_http_stage',purpose:trace.purpose,table:trace.table,kind:trace.kind,phase,elapsedMs:Math.max(0,Date.now()-start),...extra}));}catch{/* Diagnostics must never affect the request. */}}
export type FeishuRecord = {record_id:string;fields:Record<string,unknown>};
export class AppError extends Error { constructor(public code:string, message:string, public status=502){super(message);} }
export function isTable(v:unknown):v is TableKey{return typeof v==='string'&&Object.hasOwn(TABLES,v);}
export function configured(){return !!(env.FEISHU_APP_ID&&env.FEISHU_APP_SECRET);}
let token:{value:string;expires:number}|null=null;
let tokenPending:Promise<string>|null=null;
const root='https://open.feishu.cn/open-apis';
async function parse(response:Response){
 let data:any;try{data=await response.json();}catch{throw new AppError('UPSTREAM_INVALID','飞书返回了无法解析的响应。');}
 if(!response.ok||data.code!==0)throw new AppError('FEISHU_'+String(data.code??response.status),'飞书读取未完成，请检查专用应用授权或稍后重试。');
 return data.data??data;
}
async function getToken():Promise<string>{
 if(!configured())throw new AppError('NOT_CONFIGURED','飞书连接待完成：请在 Sites 原生设置配置专用应用密钥。',503);
 if(token&&token.expires>Date.now()+60000)return token.value;
 if(tokenPending)return tokenPending;
 tokenPending=(async()=>{const r=await fetch(root+'/auth/v3/tenant_access_token/internal',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({app_id:env.FEISHU_APP_ID,app_secret:env.FEISHU_APP_SECRET}),redirect:'manual',signal:AbortSignal.timeout(15000)});const d=await parse(r);if(!d.tenant_access_token)throw new AppError('AUTH_INVALID','飞书应用认证未完成。');token={value:d.tenant_access_token,expires:Date.now()+Number(d.expire??3600)*1000};return token.value;})();
 try{return await tokenPending;}catch(e){if(e instanceof AppError)throw e;throw new AppError('AUTH_NETWORK_'+((e as Error)?.name??'Error'),'飞书应用认证网络请求未完成。');}finally{tokenPending=null;}
}
// Optional migration read scope. It cancels only this caller's waits/fetches,
// never the shared token request or the normal scoring/read path.
function checkAbort(signal?:AbortSignal){if(signal?.aborted)throw new AppError('SOURCE_READ_DEADLINE','本轮源资料读取超时，未继续请求。',503);}
async function abortable<T>(promise:Promise<T>,signal?:AbortSignal):Promise<T>{if(!signal)return promise;checkAbort(signal);return new Promise<T>((resolve,reject)=>{const stop=()=>{cleanup();reject(new AppError('SOURCE_READ_DEADLINE','本轮源资料读取超时，未继续请求。',503));};const cleanup=()=>signal.removeEventListener('abort',stop);signal.addEventListener('abort',stop,{once:true});promise.then(value=>{cleanup();if(signal.aborted)stop();else resolve(value);},error=>{cleanup();reject(error);});});}
async function delay(ms:number,signal?:AbortSignal){if(!signal)return new Promise<void>(resolve=>setTimeout(resolve,ms));checkAbort(signal);await new Promise<void>((resolve,reject)=>{const stop=()=>{clearTimeout(timer);signal.removeEventListener('abort',stop);reject(new AppError('SOURCE_READ_DEADLINE','本轮源资料读取超时，未继续请求。',503));};const timer=setTimeout(()=>{signal.removeEventListener('abort',stop);resolve();},ms);signal.addEventListener('abort',stop,{once:true});});}
// Only a timestamp is shared across invocations. A canceled caller's timer or
// fetch cannot leave a promise chain that later requests must wait for.
let lastStart=-Infinity;
async function startRequest(start:()=>Promise<Response>,signal?:AbortSignal):Promise<Response>{
 for(;;){checkAbort(signal);const now=Date.now(),wait=220-(now-lastStart);
  if(wait<=0){lastStart=now;try{return start();}finally{lastStart=Date.now();}}
  await delay(wait,signal);
 }
}
export async function api(path:string,body?:unknown,method='GET',signal?:AbortSignal,diagnostic?:MigrationReadTrace){
 const readOnly=method==='GET'||isFixedSearch(path,body,method);const trace=readOnly?diagnostic:undefined;
 checkAbort(signal);const authStarted=Date.now();let bearer:string;try{bearer=await abortable(getToken(),signal);readTrace(trace,'auth_wait',authStarted);}catch(e){readTrace(trace,'auth_wait',authStarted,{outcome:'error',code:traceCode(e)});throw e;}checkAbort(signal);const attempts=readOnly?3:1;
 for(let i=0;i<attempts;i++){
  // Retries share the same actual-start gate; PUT remains single-shot.
  const gateStarted=Date.now();let fetchStarted:number|null=null;
  try{const r=await startRequest(()=>{fetchStarted=Date.now();readTrace(trace,'request_gate',gateStarted,{outcome:'ok',attempt:i+1});const request=fetch(root+path,{method,headers:{Authorization:'Bearer '+bearer,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),redirect:'manual',signal:signal?AbortSignal.any([signal,AbortSignal.timeout(20000)]):AbortSignal.timeout(20000)});return trace?request.then(response=>{readTrace(trace,'http_headers',fetchStarted!,{outcome:'ok',attempt:i+1,status:response.status});return response;},e=>{readTrace(trace,'http_headers',fetchStarted!,{outcome:'error',attempt:i+1,code:traceCode(e)});throw e;}):request;},signal);if((r.status===429||r.status>=500)&&i<attempts-1){const waitStarted=Date.now();try{await delay(700*(i+1),signal);}finally{readTrace(trace,'retry_wait',waitStarted,{outcome:signal?.aborted?'error':'ok',attempt:i+1,status:r.status});}continue;}const parseStarted=Date.now();try{const value=await abortable(parse(r),signal);readTrace(trace,'body_parse',parseStarted,{outcome:'ok',attempt:i+1,status:r.status});return value;}catch(e){readTrace(trace,'body_parse',parseStarted,{outcome:'error',attempt:i+1,status:r.status,code:traceCode(e)});throw e;}}catch(e){if(fetchStarted===null)readTrace(trace,'request_gate',gateStarted,{outcome:'error',attempt:i+1,code:traceCode(e)});checkAbort(signal);if(i===attempts-1){if(e instanceof AppError)throw e;throw new AppError('API_NETWORK_'+((e as Error)?.name??'Error'),'飞书数据网络请求未完成。');}const waitStarted=Date.now();try{await delay(500*(i+1),signal);}finally{readTrace(trace,'retry_wait',waitStarted,{outcome:signal?.aborted?'error':'ok',attempt:i+1,code:traceCode(e)});}}
 }
 throw new AppError('UPSTREAM_UNAVAILABLE','飞书暂时无法连接。');
}
const tablePath=(table:TableKey)=>`/bitable/v1/apps/${BASE}/tables/${TABLES[table]}`;
export async function listRecordPage(table:TableKey,cursor:string|null,signal?:AbortSignal,pageSize=500,trace?:MigrationReadTrace):Promise<{items:FeishuRecord[];nextCursor:string|null}>{if(!Number.isSafeInteger(pageSize)||pageSize<1||pageSize>500)throw new AppError('PAGINATION_INVALID','读取页数范围无效。');if(cursor!==null&&(typeof cursor!=='string'||cursor.length>4000))throw new AppError('PAGINATION_INVALID','读取位置无效。');const p=await api(tablePath(table)+'/records?page_size='+pageSize+(cursor?'&page_token='+encodeURIComponent(cursor):''),undefined,'GET',signal,trace);if(!Array.isArray(p.items)||p.items.length>pageSize||typeof p.has_more!=='boolean'||(p.has_more&&(typeof p.page_token!=='string'||!p.page_token||p.page_token.length>4000)))throw new AppError('PAGINATION_INVALID','源资料分页不完整。');return{items:p.items,nextCursor:p.has_more?p.page_token:null};}
// This exact fixed-table POST is a read. All other POST/PUT calls stay single-shot.
function isFixedSearch(path:string,body:unknown,method:string){
 if(method!=='POST'||!body||typeof body!=='object'||Array.isArray(body))return false;
 const b=body as Record<string,unknown>;if(Object.keys(b).sort().join(',')!=='automatic_fields,field_names'||b.automatic_fields!==false||!Array.isArray(b.field_names)||!b.field_names.length||b.field_names.length>500||b.field_names.some(n=>typeof n!=='string'||!n||n.length>1000)||new Set(b.field_names).size!==b.field_names.length)return false;
 const [base,query,...rest]=path.split('?');if(rest.length||!Object.values(TABLES).some(id=>base===`/bitable/v1/apps/${BASE}/tables/${id}/records/search`))return false;
 const q=new URLSearchParams(query);return [...q.keys()].length===new Set(q.keys()).size&&[...q.keys()].every(k=>['page_size','page_token','user_id_type'].includes(k))&&q.get('user_id_type')==='open_id'&&/^[1-9]\d*$/.test(q.get('page_size')??'')&&Number(q.get('page_size'))<=500&&(!q.has('page_token')||!!q.get('page_token')&&q.get('page_token')!.length<=4000);
}
function finiteSearchJson(v:unknown,depth=0):boolean{if(depth>32)return false;if(typeof v==='number')return Number.isFinite(v)&&(!Number.isInteger(v)||Number.isSafeInteger(v));if(Array.isArray(v))return v.every(x=>finiteSearchJson(x,depth+1));if(v&&typeof v==='object')return Object.values(v).every(x=>finiteSearchJson(x,depth+1));return true;}
export async function searchRecordPage(table:TableKey,cursor:string|null,fieldNames:string[],signal?:AbortSignal,pageSize=500,trace?:MigrationReadTrace):Promise<{items:FeishuRecord[];nextCursor:string|null}>{
 if(!isTable(table)||!Number.isSafeInteger(pageSize)||pageSize<1||pageSize>500||cursor!==null&&(typeof cursor!=='string'||!cursor||cursor.length>4000))throw new AppError('PAGINATION_INVALID','读取位置或范围无效。');
 const path=tablePath(table)+'/records/search?user_id_type=open_id&page_size='+pageSize+(cursor?'&page_token='+encodeURIComponent(cursor):''),body={field_names:fieldNames,automatic_fields:false};
 if(!isFixedSearch(path,body,'POST'))throw new AppError('SCHEMA_INCOMPLETE','本轮完整字段尚未确认。');
 const p=await api(path,body,'POST',signal,trace);
 if(!Array.isArray(p.items)||p.items.length>pageSize||typeof p.has_more!=='boolean'||p.items.some((r:any)=>!r||!/^rec[A-Za-z0-9]+$/.test(r.record_id)||!r.fields||typeof r.fields!=='object'||Array.isArray(r.fields)||!finiteSearchJson(r.fields))||(p.has_more&&(typeof p.page_token!=='string'||!p.page_token||p.page_token.length>4000)))throw new AppError('PAGINATION_INVALID','源资料分页不完整。');
 return{items:p.items,nextCursor:p.has_more?p.page_token:null};
}
export async function listAll(table:TableKey,signal?:AbortSignal){let page='';let items:FeishuRecord[]=[];const seen=new Set<string>();do{const p=await api(tablePath(table)+'/records?page_size=500'+(page?'&page_token='+encodeURIComponent(page):''),undefined,'GET',signal);items.push(...(p.items??[]));if(!p.has_more)break;if(!p.page_token||seen.has(p.page_token))throw new AppError('PAGINATION_INVALID','飞书分页不完整，已停止读取。');page=p.page_token;seen.add(page);if(seen.size>50)throw new AppError('PAGINATION_LIMIT','记录数量超出本次读取范围。');}while(page);return items;}
export async function listFields(table:TableKey,signal?:AbortSignal,trace?:MigrationReadTrace){let page='';const items:any[]=[];do{const p=await api(tablePath(table)+'/fields?page_size=100'+(page?'&page_token='+encodeURIComponent(page):''),undefined,'GET',signal,trace);items.push(...(p.items??[]));if(!p.has_more)break;if(!p.page_token||p.page_token===page)throw new AppError('SCHEMA_INCOMPLETE','字段信息分页未完成。');page=p.page_token;}while(page);return items;}
export async function getRecord(table:TableKey,id:string):Promise<FeishuRecord>{if(!/^rec[A-Za-z0-9]+$/.test(id))throw new AppError('INVALID_RECORD','记录 ID 无效。',400);const d=await api(tablePath(table)+'/records/'+id);return d.record;}
export async function updateRecord(table:TableKey,id:string,fields:Record<string,unknown>){const d=await api(tablePath(table)+'/records/'+id,{fields},'PUT');if(d.record?.record_id!==id)throw new AppError('WRITE_ACK_MISMATCH','飞书保存回执未对应当前记录。');return d;}
export async function mediaBytes(fileToken:string){const bearer=await getToken();const r=await startRequest(()=>fetch(root+'/drive/v1/medias/'+encodeURIComponent(fileToken)+'/download',{headers:{Authorization:'Bearer '+bearer},redirect:'manual',signal:AbortSignal.timeout(25000)}));if(!r.ok)throw new AppError('MEDIA_HTTP_'+r.status,'原图暂时无法读取。');const kind=r.headers.get('content-type')??'';if(!/^image\/(jpeg|png|webp|gif|avif)/i.test(kind))throw new AppError('MEDIA_TYPE','该附件不是可显示的图片。');if(Number(r.headers.get('content-length')??0)>16000000)throw new AppError('MEDIA_TOO_LARGE','图片超出安全显示大小。');return new Response(r.body,{headers:{'Content-Type':kind,'Cache-Control':'private, max-age=300','X-Content-Type-Options':'nosniff'}});}
