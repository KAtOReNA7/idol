import {readPublicCatalog,publicQuery} from '@/lib/idol/public-reader';
import {ownerForRequest} from '@/lib/idol/public-access';
import {requestedArtist,projectArtistCatalog} from '@/lib/idol/artist-catalog';
import {findDetailWork,projectWorkCatalog} from '@/lib/idol/work-catalog';
import {preferredDetailWork} from '@/lib/idol/work-catalog-request';
import {projectBrowserCatalog,requestedBrowserCatalog,withoutStageCandidates} from '@/lib/idol/browser-catalog';
import {assertSourceUnchanged} from '@/lib/idol/native-storage';
import {withNativeCatalog} from '@/lib/idol/native-reader';
import {personalMvRatingsForOwner} from '@/lib/idol/personal-mv-ratings';
import {getReadableCatalog} from '@/lib/idol/durable-catalog';
import {AppError} from '@/lib/idol/feishu';
import {json,failure} from '@/lib/idol/http';
import type {Catalog,CatalogView,PersonalMvRatings,Work} from '@/lib/idol/types';
export const dynamic='force-dynamic';

function displayResponse(request:Request, catalog:CatalogView) {
 const preference = 'omit-stage-candidates';
 const omitCandidates = request.headers.get('Prefer')?.split(',').some(value => value.trim() === preference);
 const response = json(omitCandidates ? withoutStageCandidates(catalog) : catalog);
 response.headers.append('Vary', 'Prefer');
 if (omitCandidates) response.headers.set('Preference-Applied', preference);
 if (catalog.scope?.type==='work') response.headers.append('Preference-Applied','work-detail='+catalog.scope.workId);
 return response;
}

// D1 may wrap its transport error in Error.cause. Use its documented disconnect
// and restart messages when the binding does not forward a retryable flag.
const transientD1 = /\b(?:network connection lost|replica disconnected from primary|storage caused object to be reset|reset because its code was updated|cannot resolve D1 DB due to transient issue on remote node)\b/i;
const resourceOrQueryFailure = /\boverloaded\b|\bquota\b|\b(?:read|write|CPU(?: time)?) limit\b|storage operation exceeded timeout|\bSQLITE_\w+\b|\bsyntax error\b|\bno such (?:table|column)\b/i;

function isTransientReadError(error:unknown) {
 let transient=false;
 for(let depth=0; depth<4 && error && typeof error==='object'; depth++) {
  const cause=error as {name?:string;message?:string;retryable?:boolean;overloaded?:boolean;cause?:unknown};
  const message=typeof cause.message==='string'?cause.message:'';
  if(error instanceof AppError || cause.name==='AbortError' || cause.name==='SyntaxError' || cause.name==='RangeError'
    || cause.retryable===false || cause.overloaded===true || resourceOrQueryFailure.test(message)) return false;
  if(cause.retryable===true || transientD1.test(message)) transient=true;
  error=cause.cause;
 }
 return transient;
}

async function catalogResponse(request:Request,readCatalog:<T>(read:()=>Promise<T>,ordinary?:boolean)=>Promise<T>) {
  const user = await ownerForRequest();
  if (!user) {
   const query = publicQuery(request, ['artist','shape'], ['shape']);
   requestedBrowserCatalog(query);
   const artist=requestedArtist(query);
   const work=artist?null:preferredDetailWork(request.headers.get('Prefer'));
   return displayResponse(request, await readCatalog(()=>readPublicCatalog(artist,work)));
  }
  const params = new URL(request.url).searchParams;
  const artist = requestedArtist(params), browserView = requestedBrowserCatalog(params);
  const requestedWork=browserView&&!artist?preferredDetailWork(request.headers.get('Prefer')):null;
  const force = ['1','background'].includes(params.get('refresh') ?? '');
  const native = await readCatalog(()=>withNativeCatalog(user.userId, force, async (result,control) => {
   const work = findDetailWork(result,requestedWork);
   const personal = browserView ? await personalMvRatingsForOwner(user.userId,control,result,work?.id) : undefined;
   return {result,work,personal};
  }),!params.has('refresh'));
  let selection: {result:Catalog; work:Work|null; personal?:PersonalMvRatings};
  if (native.native) selection=native.value;
  else {
   const result = await getReadableCatalog(user.userId, force);
   await assertSourceUnchanged(user.userId, native.state);
   selection={result,work:findDetailWork(result,requestedWork)};
  }
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
  return displayResponse(request, view);
}

export async function GET(request:Request) {
 let retried=false;
 async function readCatalog<T>(read:()=>Promise<T>, ordinary=true) {
  request.signal.throwIfAborted();
  try {
   return await read();
  } catch(error) {
   if(!ordinary || request.method!=='GET' || request.signal.aborted || !isTransientReadError(error)) throw error;
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
  response=await catalogResponse(request,readCatalog);
 } catch(error) {
  response=failure(error);
 }
 if(retried) {
  if(response.ok) response.headers.append('Server-Timing','catalog-retry');
  console.info(JSON.stringify({event:'idol_catalog_read_retry',outcome:response.ok?'recovered':'failed',attempts:2}));
 }
 return response;
}
