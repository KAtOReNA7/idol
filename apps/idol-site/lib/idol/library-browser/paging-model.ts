import type {PageModel,PageSize,RestoreResolution,RestoreTarget} from './contract';
/** Public callers may hydrate untrusted navigation numbers. Legacy limits are never page numbers. */
export function paginate(total:number,page=1,pageSize:PageSize=24):PageModel{
 const size:PageSize=pageSize===48?48:24;
 const count=Number.isFinite(total)?Math.max(0,Math.floor(total)):0;
 const pageCount=Math.max(1,Math.ceil(count/size));
 const current=Math.min(pageCount,Math.max(1,Number.isFinite(page)?Math.floor(page):1));
 return {page:current,pageSize:size,pageCount,total:count,start:count?(current-1)*size+1:0,end:Math.min(current*size,count)};
}
export function resolveRestoreTarget(orderedIds:readonly string[],pageSize:PageSize,target:RestoreTarget={}):RestoreResolution{
 // Historical hosts saved DOM anchors as work-<id>. Prefer an exact ID first.
 let index=target.anchorId?orderedIds.indexOf(target.anchorId):-1;
 if(index<0&&target.anchorId?.startsWith('work-'))index=orderedIds.indexOf(target.anchorId.slice(5));
 const offset=Number.isFinite(target.offset)?target.offset!:0;
 if(index>=0)return {page:paginate(orderedIds.length,Math.floor(index/(pageSize===48?48:24))+1,pageSize).page,anchorId:orderedIds[index],offset,focus:'anchor',reason:'anchor'};
 return {page:paginate(orderedIds.length,target.page??1,pageSize).page,anchorId:null,offset:0,focus:'search',reason:target.anchorId?'missing-anchor':'page'};
}
