import {readPublicCatalog,publicQuery} from '@/lib/idol/public-reader';
import {ownerForRequest} from '@/lib/idol/public-access';
import {requestedArtist,projectArtistCatalog} from '@/lib/idol/artist-catalog';
import {findDetailWork,projectWorkCatalog} from '@/lib/idol/work-catalog';
import {preferredDetailWork} from '@/lib/idol/work-catalog-request';
import {projectBrowserCatalog,requestedBrowserCatalog,withoutStageCandidates} from '@/lib/idol/browser-catalog';
import {ownControl,assertSourceUnchanged} from '@/lib/idol/native-storage';
import {readNativeCatalog} from '@/lib/idol/native-reader';
import {personalMvRatingsForOwner} from '@/lib/idol/personal-mv-ratings';
import {getReadableCatalog} from '@/lib/idol/durable-catalog';
import {json,failure} from '@/lib/idol/http';
import type {CatalogView} from '@/lib/idol/types';
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

export async function GET(request:Request) {
 try {
  const user = await ownerForRequest();
  if (!user) {
   const query = publicQuery(request, ['artist','shape'], ['shape']);
   requestedBrowserCatalog(query);
   const artist=requestedArtist(query);
   return displayResponse(request, await readPublicCatalog(artist,artist?null:preferredDetailWork(request.headers.get('Prefer'))));
  }
  const params = new URL(request.url).searchParams;
  const artist = requestedArtist(params), browserView = requestedBrowserCatalog(params);
  const requestedWork=browserView&&!artist?preferredDetailWork(request.headers.get('Prefer')):null;
  const before = await ownControl(user.userId);
  const force = ['1','background'].includes(params.get('refresh') ?? '');
  const native = await readNativeCatalog(user.userId, force);
  const result = native ?? await getReadableCatalog(user.userId, force);
  const work=findDetailWork(result,requestedWork);
  const personal = native && browserView ? await personalMvRatingsForOwner(user.userId,before,result,work?.id) : undefined;
  await assertSourceUnchanged(user.userId, before);
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
 } catch (error) {
  return failure(error);
 }
}
