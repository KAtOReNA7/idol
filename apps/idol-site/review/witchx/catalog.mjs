/** Build-time projection; never serializes saved notes, scores or watch states. */
export function createWitchxReviewCatalog(design,actual){
 if(design?.group?.slug!=='witchx'||design.group.id!=='rec28ldfRTiDFM'||design.members.length!==5||new Set(design.members.map(m=>m.id)).size!==5)throw new Error('Invalid W!TCHX editorial identity');
 const groupId=design.group.id;
 const members=design.members.map(m=>{
  const matches=actual?.members?.filter(row=>row.id===m.id&&row.groupIds?.includes(groupId))??[];
  if(matches.length!==1)throw new Error('Unbacked member identity: '+m.id);
  return {id:m.id,name:m.stageName,cnName:m.cnName,stageName:m.stageName,groupIds:[groupId],formerGroupIds:[],photo:null,favorite:null,note:'',profile:'',status:'',country:m.country,role:m.role,officialUrl:design.group.officialUrl,birthDate:m.birthDate};
 });
 // The only saved work is blank. Public releases/videos have no native work
 // identity; deliberately exclude it and every rating rather than manufacture IDs.
 if(design.works.length!==0)throw new Error('Public videos cannot become native records');
 return {scope:{type:'artist',groupId},mode:'snapshot',capturedAt:'2026-10-24T00:00:00.000Z',loadedAt:'2026-10-24T00:00:00.000Z',warning:'示例资料 · 评分不写入正式手帐',groups:[{id:groupId,name:design.group.name,generation:'',company:design.group.company,country:'韩国',note:'',debut:design.group.debut,memberIds:members.map(m=>m.id),workIds:[],average:null,ratedCount:0,officialUrl:design.group.officialUrl}],members,works:[],ratings:[],counts:{groups:1,members:5,works:0,ratings:0,ratedWorks:0,scoreSum:0}};
}
