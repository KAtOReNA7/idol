// SYNTHETIC only; stable seed, public example data and private-field test sentinels.
import type {CatalogView} from '../../lib/idol/types';
export const SEED=20261016;
export function freeze<T>(value:T):T{if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
export function fixture(count:number,seed=SEED):CatalogView{
 let state=seed>>>0;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state;};
 const groups=Array.from({length:6},(_,i)=>({id:`recG${i}`,name:`SYNTHETIC Group ${i}`,currentName:`Alias ${i}`,generation:i%2?'第五代':'第四代',company:'Synthetic',country:'',note:'SYNTHETIC_PRIVATE_GROUP',debut:'',memberIds:[],workIds:[],average:i%2?8:9.5,ratedCount:i===5?0:3}));
 const works=Array.from({length:count},(_,i)=>({id:`recW${i}`,name:`SYNTHETIC Song ${i%20}`,song:`Song ${i%20}`,officialTitle:`Official ＳＯＮＧ ${i%20}`,groupIds:i%19===0?['recAbsent']:[`recG${i%6}`,...(i%7===0?[`recG${(i+1)%6}`]:[])],url:i%17===0?'':'https://example.invalid/synthetic',score:i%4===0?null:i%11===0?0:random()%11,stageScore:null,note:'SYNTHETIC_PRIVATE_NOTE',watched:['','未观看','已观看'][i%3],videoType:'MV',version:i%2?'Japanese Version':'Original',releaseDate:['2024-02-29','2025-02-30','','2023-06-01','2024-02-29','未知'][i%6],verification:'',channel:'',ratingIds:[],source:'',stage:i%4===0?{kind:'音乐节目'}:null,stageResearch:{status:'pending',reason:'',checkedAt:null},stageSupplement:{alternatives:i%4===1?[{id:'synthetic-alternative',scorePolicy:'view_only'}]:[],watchLeads:i%4===2?[{id:'synthetic-lead',scorePolicy:'view_only'}]:[]},...(i%53===0?{placeholder:{reason:'SYNTHETIC',originalRow:i,verifiedAt:''}}:{})}));
 return freeze({mode:'snapshot',capturedAt:'',loadedAt:'',warning:'SYNTHETIC',groups,works,members:[{id:'recMember',profile:'SYNTHETIC_PRIVATE_PROFILE'}],ratings:works.filter((_,i)=>i%3===0).map(w=>({id:`recR${w.id}`,memberIds:['recMember'],workIds:[w.id],memory:'SYNTHETIC_PRIVATE_MEMORY',note:'SYNTHETIC_PRIVATE_RATING'})),counts:{groups:groups.length,works:count,members:1,ratings:0,ratedWorks:0,scoreSum:0}}) as unknown as CatalogView;
}
export const defaults=()=>({search:'',group:'all',generation:'all',queue:'all',stageFilter:'all',watch:'all',sort:'default',limit:24});

export const syntheticCatalog=fixture;
