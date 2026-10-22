import type {CatalogView as Catalog,Photo,RatingView as Rating,Work} from './types';

export type MemberWork={work:Work;performance:number|null;styling:number|null;photo:Photo|null;referencePhoto?:Photo|null};
const validScore=(value:unknown):value is number=>typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=10;
// A work is one sample. Repeated identical rows do not add weight; conflicting
// values stay unresolved rather than choosing the first row or inventing a mean.
function oneScore(values:unknown[]){
 const scores=[...new Set(values.filter(validScore))];
 return scores.length===1?scores[0]:null;
}
export function personalMvPhoto(r:Rating,memberId:string,workId:string):Photo|null{
 const p=r.photo;
 if(!p||p.table!=='ratings'||p.recordId!==r.id||r.memberIds.length!==1||r.memberIds[0]!==memberId||r.workIds.length!==1||r.workIds[0]!==workId)return null;
 // The server computes this using the unchanged evidence checks below. Keep the
 // stable relation checks above for both formats; malformed flags fail closed.
 if('personalPhotoEligible' in r)return r.personalPhotoEligible===true?p:null;
 if(p.sourceKind==='mv_look_photo')return p.approvedLookIdentity?.sameLook===true&&p.approvedLookIdentity.memberId===memberId&&p.approvedLookIdentity.workId===workId&&/^[A-Za-z0-9_-]{11}$/.test(p.approvedLookIdentity.videoId)?p:null;
 if(p.nativeIdentity?.memberId===memberId&&p.nativeIdentity?.workId===workId&&p.kind==='本 MV 截图')return p;
 const evidence=typeof r.recognition==='string'?r.recognition:'';
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
export function memberWorks(data:Pick<Catalog,'ratings'|'works'>,memberId:string):MemberWork[]{
 const related=data.ratings.filter(r=>r.memberIds.includes(memberId));
 const workIds=new Set(related.flatMap(r=>r.workIds));
 const works=[...new Map(data.works.filter(w=>workIds.has(w.id)&&!w.placeholder).map(w=>[w.id,w])).values()];
 return works.map(work=>{
  const rows=related.filter(r=>r.memberIds.length===1&&r.workIds.length===1&&r.workIds[0]===work.id);
  // Keep the existing photo selection policy; score conflicts use every row.
  const photoRows=[...new Map(rows.map(r=>[r.id,r])).values()];
  const photos=photoRows.map(r=>personalMvPhoto(r,memberId,work.id)).filter((p):p is Photo=>p!==null);
  const selected=photos.length===1?photos[0]:null;
  const reference=selected?.sourceKind==='mv_look_photo'?photoRows.find(r=>r.photo===selected)?.referencePhoto:null;
  return {work,...(reference?{referencePhoto:reference}:{}),performance:oneScore(rows.map(r=>r.score)),styling:oneScore(rows.map(r=>r.stylingScore)),photo:photos.length===1?photos[0]:null};
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
