import {requireUser,sameOrigin,json,failure} from '@/lib/idol/http';
import {posterQuery,posterStatus,uploadPoster} from '@/lib/idol/mv-poster-storage';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{const user=await requireUser();return json(await posterStatus(user.userId,posterQuery(request,true)??undefined));}catch(e){return failure(e);}}
export async function PUT(request:Request){try{const user=await requireUser();sameOrigin(request);const candidate=posterQuery(request)!;return json(await uploadPoster(user.userId,candidate,request));}catch(e){return failure(e);}}
