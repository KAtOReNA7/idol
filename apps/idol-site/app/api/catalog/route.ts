import {readPublicCatalog,publicQuery} from '@/lib/idol/public-reader';
import {ownerForRequest} from '@/lib/idol/public-access';
import {requestedArtist,projectArtistCatalog} from '@/lib/idol/artist-catalog';
import {projectBrowserCatalog,requestedBrowserCatalog} from '@/lib/idol/browser-catalog';
import {ownControl,assertSourceUnchanged} from '@/lib/idol/native-storage';
import {readNativeCatalog} from '@/lib/idol/native-reader';
import {getReadableCatalog} from '@/lib/idol/durable-catalog';
import {json,failure} from '@/lib/idol/http';
import type {CatalogView} from '@/lib/idol/types';
export const dynamic='force-dynamic';

function displayResponse(request:Request, catalog:CatalogView) {
 const preference = 'omit-stage-candidates';
 const omitCandidates = request.headers.get('Prefer')?.split(',').some(value => value.trim() === preference);
 let view = catalog;
 if (omitCandidates) {
  const works = catalog.works.map(work => {
   if (!work.stage?.candidates) return work;
   const stage = {...work.stage};
   delete stage.candidates;
   return {...work, stage};
  });
  view = {...catalog, works};
 }
 const response = json(view);
 response.headers.append('Vary', 'Prefer');
 if (omitCandidates) response.headers.set('Preference-Applied', preference);
 return response;
}

export async function GET(request:Request) {
 try {
  const user = await ownerForRequest();
  if (!user) {
   const query = publicQuery(request, ['artist','shape'], ['shape']);
   requestedBrowserCatalog(query);
   return displayResponse(request, await readPublicCatalog(requestedArtist(query)));
  }
  const params = new URL(request.url).searchParams;
  const artist = requestedArtist(params), browserView = requestedBrowserCatalog(params);
  const before = await ownControl(user.userId);
  const force = ['1','background'].includes(params.get('refresh') ?? '');
  const native = await readNativeCatalog(user.userId, force);
  const result = native ?? await getReadableCatalog(user.userId, force);
  await assertSourceUnchanged(user.userId, before);
  const scoped = artist ? projectArtistCatalog(result, artist) : result;
  return browserView ? displayResponse(request, projectBrowserCatalog(scoped)) : json(scoped);
 } catch (error) {
  return failure(error);
 }
}
