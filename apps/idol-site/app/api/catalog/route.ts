import {readPublicCatalog,publicQuery} from '@/lib/idol/public-reader';
import {ownerForRequest} from '@/lib/idol/public-access';
import {requestedArtist,projectArtistCatalog} from '@/lib/idol/artist-catalog';
import {findDetailWork,projectWorkCatalog} from '@/lib/idol/work-catalog';
import {catalogAccessHeader,preferredDetailWork} from '@/lib/idol/work-catalog-request';
import {projectBrowserCatalog,requestedBrowserCatalog,withoutStageCandidates} from '@/lib/idol/browser-catalog';
import {assertSourceUnchanged} from '@/lib/idol/native-storage';
import {withNativeCatalog,type NativeCatalogTrace} from '@/lib/idol/native-reader';
import {personalMvRatingsForOwner} from '@/lib/idol/personal-mv-ratings';
import {getReadableCatalog} from '@/lib/idol/durable-catalog';
import {AppError} from '@/lib/idol/feishu';
import {json,failure} from '@/lib/idol/http';
import type {Catalog,CatalogView,PersonalMvRatings,Work} from '@/lib/idol/types';
export const dynamic='force-dynamic';

function displayResponse(request:Request, catalog:CatalogView, access:'owner'|'public') {
 const preference = 'omit-stage-candidates';
 const omitCandidates = request.headers.get('Prefer')?.split(',').some(value => value.trim() === preference);
 const response = json(omitCandidates ? withoutStageCandidates(catalog) : catalog);
 response.headers.set(catalogAccessHeader,access);
 response.headers.append('Vary', 'Prefer');
 if (omitCandidates) response.headers.set('Preference-Applied', preference);
 if (catalog.scope?.type==='work') response.headers.append('Preference-Applied','work-detail='+catalog.scope.workId);
 return response;
}

// D1 may wrap its transport error in Error.cause. Use its documented disconnect
// and restart messages when the binding does not forward a retryable flag.
const transientD1 = /\b(?:network connection lost|replica disconnected from primary|storage caused object to be reset|reset because its code was updated|cannot resolve D1 DB due to transient issue on remote node)\b/i;
const capacityFailure = /\boverloaded\b|\bquota\b|\b(?:read|write|CPU(?: time)?) limit\b|storage operation exceeded timeout/i;
const queryFailure = /\bSQLITE_\w+\b|\bsyntax error\b|\bno such (?:table|column)\b/i;

function readFailureKind(error:unknown) {
 let transient=false;
 let fallback:'unknown'|'d1'|'type'|'timeout'='unknown';
 for(let depth=0; depth<4 && error && typeof error==='object'; depth++) {
  const cause=error as {name?:string;message?:string;retryable?:boolean;overloaded?:boolean;cause?:unknown};
  const message=typeof cause.message==='string'?cause.message:'';
  if(error instanceof AppError) {
   if(['NATIVE_DATA_MISSING','NATIVE_SCHEMA_MISSING','STORAGE_NOT_READY','PUBLIC_READ_UNAVAILABLE'].includes(error.code)) return 'storage-state';
   if(error.code==='SOURCE_READ_DEADLINE') return 'timeout';
   if(['AUTH_INVALID','UPSTREAM_INVALID','NOT_CONFIGURED'].includes(error.code) || /^FEISHU_\d+$/.test(error.code)) return 'upstream';
   return 'application';
  }
  if(cause.name==='AbortError') return 'aborted';
  if(cause.name==='SyntaxError'||cause.name==='RangeError') return 'data';
  if(cause.overloaded===true||capacityFailure.test(message)) return 'capacity';
  if(queryFailure.test(message)) return 'sqlite-or-query';
  if(cause.retryable===false) return 'not-retryable';
  if(cause.retryable===true || transientD1.test(message)) transient=true;
  if(/\bD1_ERROR\b/i.test(message)) fallback='d1';
  else if(fallback==='unknown'&&cause.name==='TypeError') fallback='type';
  else if(fallback==='unknown'&&cause.name==='TimeoutError') fallback='timeout';
  error=cause.cause;
 }
 return transient?'transient-read':fallback;
}

type CatalogTrace = {phase:'identity'|'request'|'public-read'|'native-read'|'member-ratings'|'source-fence'|'legacy-read'|'project';native:NativeCatalogTrace};
async function catalogResponse(request:Request,readCatalog:<T>(read:()=>Promise<T>,ordinary?:boolean)=>Promise<T>,trace:CatalogTrace) {
  const user = await ownerForRequest();
  trace.phase='request';
  if (!user) {
   const query = publicQuery(request, ['artist','shape'], ['shape']);
   requestedBrowserCatalog(query);
   const artist=requestedArtist(query);
   const work=artist?null:preferredDetailWork(request.headers.get('Prefer'));
   trace.phase='public-read';
   const catalog=await readCatalog(()=>readPublicCatalog(artist,work,request));
   trace.phase='project';
   return displayResponse(request,catalog,'public');
  }
  const params = new URL(request.url).searchParams;
  const artist = requestedArtist(params), browserView = requestedBrowserCatalog(params);
  const requestedWork=browserView&&!artist?preferredDetailWork(request.headers.get('Prefer')):null;
  const force = ['1','background'].includes(params.get('refresh') ?? '');
  const native = await readCatalog(()=>{
   trace.phase='native-read';
   return withNativeCatalog(user.userId, force, async (result,control) => {
    trace.phase='project';
    const work = findDetailWork(result,requestedWork);
    trace.phase='member-ratings';
    const personal = browserView ? await personalMvRatingsForOwner(user.userId,control,result,work?.id) : undefined;
    // The native reader can revalidate the generation and repeat its own guarded read.
    trace.phase='native-read';
    return {result,work,personal};
   },trace.native,request);
  },!params.has('refresh'));
  let selection: {result:Catalog; work:Work|null; personal?:PersonalMvRatings};
  if (native.native) selection=native.value;
  else {
   trace.phase='legacy-read';
   const result = await getReadableCatalog(user.userId, force);
   trace.phase='source-fence';
   await assertSourceUnchanged(user.userId, native.state);
   trace.phase='project';
   selection={result,work:findDetailWork(result,requestedWork)};
  }
  trace.phase='project';
  const {result,work,personal}=selection;
  const scoped = artist ? projectArtistCatalog(result, artist, personal?.entries) : work ? projectWorkCatalog(result,work,personal?.entries) : result;
  if (!browserView) return json(scoped);
  const view=projectBrowserCatalog(scoped);
  if (personal) {
   if(artist||work){
    const works=new Set(work?[work.id]:scoped.works.map(item=>item.id)),members=new Set(scoped.members.map(member=>member.id));
    view.personalMvRatings={...personal,entries:personal.entries.filter(row=>works.has(row.workId)&&members.has(row.memberId))};
   }else view.personalMvRatings=personal;
  }
  return displayResponse(request, view,'owner');
}

export async function GET(request:Request) {
 let retried=false;
 const trace:CatalogTrace={phase:'identity',native:{}};
 async function readCatalog<T>(read:()=>Promise<T>, ordinary=true) {
  request.signal.throwIfAborted();
  try {
   return await read();
  } catch(error) {
   if(!ordinary || request.method!=='GET' || request.signal.aborted || readFailureKind(error)!=='transient-read') throw error;
   // The binding can retry individual statements itself. Stagger one new
   // application-level read, inside the same identity and generation fences.
   await new Promise<void>(resolve=>setTimeout(resolve,75+Math.random()*75));
   if(request.signal.aborted) throw error;
   retried=true;
   const result=await read();
   request.signal.throwIfAborted();
   return result;
  }
 }
 let response:Response;
 try {
  response=await catalogResponse(request,readCatalog,trace);
 } catch(error) {
  response=failure(error);
  if(response.status>=500) {
   // Workers Logs attaches the invocation request ID. Keep request headers, error text and data out of this event.
   try {
    const native = trace.phase === 'native-read' ? trace.native : undefined;
    console.error(JSON.stringify({event:'idol_catalog_read_failed',phase:trace.phase,kind:readFailureKind(error),
     nativeStep:native?.step,nativeCache:native?.cache,status:response.status,retried,cancelled:request.signal.aborted}));
   } catch { /* Diagnostics must not replace the original response. */ }
  }
 }
 if(retried) {
  if(response.ok) response.headers.append('Server-Timing','catalog-retry');
  console.info(JSON.stringify({event:'idol_catalog_read_retry',outcome:response.ok?'recovered':'failed',attempts:2}));
 }
 return response;
}
