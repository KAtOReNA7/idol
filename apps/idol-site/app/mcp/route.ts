import {AppError} from '@/lib/idol/feishu';
import {requireUser,json,failure} from '@/lib/idol/http';
import {siteTools,callSiteTool} from '@/lib/idol/site-tools';
export const dynamic='force-dynamic';
const MODERN='2026-07-28';
const supportedVersions=[MODERN,'2025-03-26'];
const serverInfo={name:'private-idol-archive',version:'1.0.1'};
function decodeHeader(value:string|null){
 if(value?.startsWith('=?base64?')&&value.endsWith('?=')){
  try{return new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(value.slice(9,-2)),c=>c.charCodeAt(0)));}catch{return null;}
 }
 return value;
}
export async function POST(request:Request){
 try{
  const origin=request.headers.get('origin');
  if(origin&&![new URL(request.url).origin,'https://chatgpt.com'].includes(origin))return json({error:'ORIGIN_REJECTED'},403);
  if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'JSON_REQUIRED'},415);
  const text=await request.text();if(new TextEncoder().encode(text).length>20000)return json({error:'REQUEST_TOO_LARGE'},413);
  let message;try{message=JSON.parse(text);}catch{return json({jsonrpc:'2.0',id:null,error:{code:-32700,message:'Parse error'}},400);}
  if(!message||Array.isArray(message)||message.jsonrpc!=='2.0'||typeof message.method!=='string')return json({jsonrpc:'2.0',id:null,error:{code:-32600,message:'Invalid Request'}},400);
  const id=message.id??null;
  const error=(code:number,message:string,status=400,data?:unknown)=>json({jsonrpc:'2.0',id,error:{code,message,...(data?{data}:{})}},status);
  const headerVersion=request.headers.get('mcp-protocol-version');
  const metaVersion=message.params?._meta?.['io.modelcontextprotocol/protocolVersion'];
  if(metaVersion!==undefined&&headerVersion!==metaVersion)return error(-32020,'Protocol version header does not match the request');
  const version=headerVersion??metaVersion??'2025-03-26';
  if(!supportedVersions.includes(version))return error(-32022,'Unsupported protocol version',400,{supported:supportedVersions,requested:version});
  const modern=version===MODERN;
  if(modern&&(headerVersion!==metaVersion||request.headers.get('mcp-method')!==message.method||(message.method==='tools/call'&&decodeHeader(request.headers.get('mcp-name'))!==message.params?.name)))return error(-32020,'Required headers do not match the request');
  const result=(value:Record<string,unknown>)=>json({jsonrpc:'2.0',id,result:{...(modern?{resultType:'complete'}:{}),...value}});
  if(message.method==='notifications/initialized'&&!modern)return new Response(null,{status:202});
  if(id===null)return error(-32600,'A request id is required');
  if(message.method==='server/discover')return result({resultType:'complete',supportedVersions,capabilities:{tools:{}},_meta:{'io.modelcontextprotocol/serverInfo':serverInfo}});
  if(message.method==='initialize'&&!modern)return result({protocolVersion:'2025-03-26',capabilities:{tools:{}},serverInfo});
  if(message.method==='ping')return result({});
  if(message.method==='tools/list')return result({tools:siteTools});
  if(message.method==='tools/call'){
   const user=await requireUser();
   try{const value=await callSiteTool(user.userId,message.params?.name,message.params?.arguments??{});return result({content:[{type:'text',text:JSON.stringify(value)}],structuredContent:value,isError:false});}
   catch(e){return result({content:[{type:'text',text:e instanceof AppError?e.message:'操作未完成，请稍后重试。'}],isError:true});}
  }
  return error(-32601,'Method not found',404);
 }catch(e){return failure(e);}
}
export async function GET(){return json({error:'METHOD_NOT_ALLOWED'},405);}
