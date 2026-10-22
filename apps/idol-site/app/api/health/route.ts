import {readNativeCatalog} from '@/lib/idol/native-reader';
import {activeNative,nativeSchema,ownControl,assertSourceUnchanged} from '@/lib/idol/native-storage';
import {configured,TABLES,TableKey} from '@/lib/idol/feishu';
import {getCatalog} from '@/lib/idol/catalog';
import {schema} from '@/lib/idol/live';
import {EDITABLE} from '@/lib/idol/fields';
import {requireUser,json,failure} from '@/lib/idol/http';
export const dynamic='force-dynamic';
// This fixed, aggregate-only diagnostic is behind the owner-private Sites boundary.
// It returns no records, notes, personal scores, credentials, or arbitrary query results.
export async function GET(){try{const user=await requireUser();const before=await ownControl(user.userId);const native=await activeNative(user.userId);if(!native&&!configured()){await assertSourceUnchanged(user.userId,before);return json({configured:false});}const data=native?(await readNativeCatalog(user.userId))!:await getCatalog(true);const checks=[];for(const table of Object.keys(TABLES) as TableKey[]){const fields=native?await nativeSchema(native.active_snapshot!,table):await schema(table,true);checks.push({table,fields:fields.length,editableSchemaValid:Object.values(EDITABLE[table]).every(f=>fields.some(x=>x.field_id===f.id&&f.types.includes(x.type)))});}await assertSourceUnchanged(user.userId,before);return json({configured:true,source:data.mode,checkedAt:data.loadedAt,counts:{groups:data.groups.length,members:data.members.length,works:data.works.length,ratings:data.ratings.length},checks,missing:{videoUrls:data.works.filter(w=>!w.url).length,versionLabels:data.works.filter(w=>!w.version).length,associatedMembers:data.works.filter(w=>!w.ratingIds.length).length}});}catch(e){return failure(e);}}
