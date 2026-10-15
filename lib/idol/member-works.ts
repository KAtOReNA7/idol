import type {CatalogView as Catalog,Photo,RatingView as Rating,Work} from './types';

export type MemberWork={work:Work;performance:number|null;styling:number|null;photo:Photo|null};
const validScore=(value:unknown):value is number=>typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=10;
// A work is one sample. Repeated identical rows do not add weight; conflicting
// values stay unresolved rather than choosing the first row or inventing a mean.
function oneScore(values:unknown[]){
 const scores=[...new Set(values.filter(validScore))];
 return scores.length===1?scores[0]:null;
}
export function personalMvPhoto(r:Rating,memberId:string,workId:string,videoId?:string):Photo|null{
 const p=r.photo;
 if(!p||p.table!=='ratings'||p.recordId!==r.id||r.memberIds.length!==1||r.memberIds[0]!==memberId||r.workIds.length!==1||r.workIds[0]!==workId)return null;
 if(p.nativeIdentity&&(p.nativeIdentity.memberId!==memberId||p.nativeIdentity.workId!==workId||typeof p.nativeIdentity.videoId!=='string'||!/^[A-Za-z0-9_-]{11}$/.test(p.nativeIdentity.videoId)))return null;
 const evidence=typeof r.recognition==='string'?r.recognition:'';
 // Only read explicit exact-video declarations, never infer identity from names
 // or appearance. A true eligibility flag cannot override contrary provenance.
 const declaredVideos=[...evidence.matchAll(/原文嵌入精确\s*MV\s+([A-Za-z0-9_-]{11})(?![A-Za-z0-9_-])/g)].map(match=>match[1]);
 const videos=[videoId,p.nativeIdentity?.videoId,...declaredVideos].filter((id):id is string=>id!==undefined);
 if(new Set(videos).size>1)return null;
 // The server computes this using the unchanged evidence checks below. Keep the
 // stable relation checks above for both formats; malformed flags fail closed.
 if('personalPhotoEligible' in r)return r.personalPhotoEligible===true?p:null;
 if(p.nativeIdentity?.memberId===memberId&&p.nativeIdentity?.workId===workId&&p.kind==='本 MV 截图')return p;
 const declaredKind=evidence.split(/[|；。]/,1)[0];
 const attachmentVerified=/截图状态：本MV具名截图(?:已原生上传|图片已保存)并回读核验/.test(evidence);
 const namedPanel=declaredKind.startsWith('本MV来源章节具名图 · KProfiles粉丝标注')&&evidence.includes('原来源姓名：')&&evidence.includes('只读取原拼图每格既有姓名标签')&&attachmentVerified;
 const individualPanel=/来源拼图该独立子图|拼图各独立子图/.test(evidence)||namedPanel;
 if(/全员拼图|整张图仍含|合照|全员图/.test(evidence)||(!individualPanel&&/拼图/.test(evidence))||/档案照|概念照|宣传照/.test(declaredKind)||/拼图|档案/.test(p.kind??''))return null;
 // These are already caption-mapped MV attachments, never face-matched images.
 const namedChapter=declaredKind.startsWith('本MV章节配图 · WordPress具名成员页')&&evidence.includes('原来源姓名：')&&evidence.includes('原图注：')&&evidence.includes('data-image-title additionally names the member and song')&&attachmentVerified;
 const namedGif=declaredKind==='媒体具名本MV GIF原像素抽帧'&&evidence.includes('原媒体文章 Rich Man MV 专题独立具名H2章节下GIF')&&evidence.includes('嵌入官方ID精确匹配')&&attachmentVerified;
 const completedEditorial=evidence.includes('【2026-10-11 本MV截图补全】已上传 ')&&evidence.includes('的 Klaxon 正片裁图，Vogue Singapore 原文 gallery ')&&evidence.includes('原文嵌入精确 MV rTKqSmX9XhQ')&&evidence.includes('以上为最新补全状态，原文字核验记录保留。');
 return /MV\s*截图|本\s*MV\s*(?:具名)?(?:截图|个人|认人图)/i.test(declaredKind)||namedPanel||namedChapter||namedGif||completedEditorial?p:null;
}
// Stable keys compare content, not object property or input row order. Choosing a
// stable work representative is only for output shape; it never resolves photos.
function stableKey(value:unknown):string{
 if(Array.isArray(value))return '['+value.map(stableKey).join(',')+']';
 if(value!==null&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+stableKey((value as Record<string,unknown>)[k])).join(',')+'}';
 return typeof value+':'+(typeof value==='number'?String(value):JSON.stringify(value));
}
function exactVideoId(url:string|undefined):string|undefined{
 try{
  const u=new URL(url??'');
  if(u.protocol!=='https:'||u.username||u.password)return undefined;
  const host=u.hostname.toLowerCase();
  const id=host==='youtu.be'?u.pathname.slice(1):['youtube.com','www.youtube.com','m.youtube.com','music.youtube.com','www.youtube-nocookie.com'].includes(host)?(u.pathname==='/watch'?u.searchParams.get('v'):u.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)$/)?.[1]):undefined;
  return id&&/^[A-Za-z0-9_-]{11}$/.test(id)?id:undefined;
 }catch{return undefined;}
}
function consensusPhoto(duplicates:Rating[],memberId:string,workId:string,videoId?:string):Photo|null{
 // Inspect every same-ID row before any relation filter can hide a conflict.
 if(!duplicates.every(r=>r.memberIds.length===1&&r.memberIds[0]===memberId&&r.workIds.length===1&&r.workIds[0]===workId))return null;
 const photos=duplicates.map(r=>personalMvPhoto(r,memberId,workId,videoId));
 if(photos.some(p=>p===null))return null;
 // Missing or contradictory attachments, provenance and eligibility evidence do
 // not get filled from another row. Scores intentionally do not enter this key.
 const keys=duplicates.map(r=>stableKey({photo:r.photo,recognition:r.recognition,personalPhotoEligible:r.personalPhotoEligible}));
 return new Set(keys).size===1?photos[0]:null;
}
export function memberWorks(data:Pick<Catalog,'ratings'|'works'>,memberId:string):MemberWork[]{
 const byRating=new Map<string,Rating[]>();
 for(const r of data.ratings){const duplicates=byRating.get(r.id)??[];duplicates.push(r);byRating.set(r.id,duplicates);}
 const related=data.ratings.filter(r=>r.memberIds.includes(memberId));
 const workIds=new Set(related.flatMap(r=>r.workIds));
 const byWork=new Map<string,Work[]>();
 for(const w of data.works.filter(w=>workIds.has(w.id))){const duplicates=byWork.get(w.id)??[];duplicates.push(w);byWork.set(w.id,duplicates);}
 return [...byWork.entries()].sort(([a],[b])=>a<b?-1:a>b?1:0).flatMap(([id,duplicates])=>{
  const candidates=duplicates.filter(w=>!w.placeholder).sort((a,b)=>{const x=stableKey(a),y=stableKey(b);return x<y?-1:x>y?1:0;});
  if(!candidates.length)return [];
  const work=candidates[0];
  const rows=related.filter(r=>r.memberIds.length===1&&r.workIds.length===1&&r.workIds[0]===id);
  const identities=duplicates.map(w=>stableKey({video:exactVideoId(w.url)??w.url,version:w.version,groupIds:w.groupIds?[...w.groupIds].sort():undefined,placeholder:!!w.placeholder}));
  const photos=new Set(identities).size===1?[...new Set(rows.map(r=>r.id))].map(ratingId=>consensusPhoto(byRating.get(ratingId)!,memberId,id,exactVideoId(work.url))):[];
  return [{work,performance:oneScore(rows.map(r=>r.score)),styling:oneScore(rows.map(r=>r.stylingScore)),photo:photos.length===1?photos[0]:null}];
 });
}
export function memberWorkSummary(items:MemberWork[]){
 const byWork=new Map<string,MemberWork[]>();
 for(const item of items){const rows=byWork.get(item.work.id)??[];rows.push(item);byWork.set(item.work.id,rows);}
 const unique=[...byWork.values()].map(rows=>({performance:oneScore(rows.map(r=>r.performance)),styling:oneScore(rows.map(r=>r.styling))}));
 const performance=unique.map(x=>x.performance).filter(validScore),styling=unique.map(x=>x.styling).filter(validScore);
 const mean=(values:number[])=>values.length?values.reduce((sum,x)=>sum+x,0)/values.length:null;
 const performanceMean=mean(performance),stylingMean=mean(styling);
 return {performanceMean,stylingMean,performanceCount:performance.length,stylingCount:styling.length,
  ratedWorks:unique.filter(x=>validScore(x.performance)||validScore(x.styling)).length,
  composite:performanceMean!==null&&stylingMean!==null?(performanceMean+stylingMean)/2:null};
}
