/** Build-time only boundary: public editorial fields plus exact existing IDs.
 * Normalized personal fields are never spread or serialized into the browser. */
export function createKatseyeReviewCatalog(design, actual) {
  if (design?.group?.slug !== 'katseye' || design.group.id !== 'rec28ldfRTiDUd') throw new Error('Expected Katseye public editorial model');
  const groupId=design.group.id;
  if(new Set(design.members.map(m=>m.id)).size!==6 || new Set(design.works.map(w=>w.id)).size!==9) throw new Error('Unexpected or duplicate editorial identities');
  const members=design.members.map(member=>{
    const matches=actual?.members?.filter(row=>row.id===member.id&&row.groupIds?.includes(groupId))??[];
    if(matches.length!==1)throw new Error('Review member identity is not uniquely backed: '+member.id);
    return {id:member.id,name:member.stageName,cnName:member.cnName,stageName:member.stageName,groupIds:[groupId],formerGroupIds:[],photo:null,favorite:null,note:'',profile:'',status:'',country:member.country,role:'',officialUrl:design.group.officialUrl,birthDate:member.birthDate};
  });
  const memberIds=new Set(members.map(m=>m.id)),workIds=new Set(design.works.map(w=>w.id));
  // Existing singleton relations only. This does not assert new MV participation
  // evidence or invent a relationship for every member/work combination.
  const relations=(actual?.ratings??[]).filter(row=>row.memberIds?.length===1&&row.workIds?.length===1&&memberIds.has(row.memberIds[0])&&workIds.has(row.workIds[0]));
  if(new Set(relations.map(r=>r.id)).size!==relations.length||new Set(relations.map(r=>r.memberIds[0]+':'+r.workIds[0])).size!==relations.length)throw new Error('Ambiguous saved review relationships');
  if(relations.some(r=>!/^rec[A-Za-z0-9]+$/.test(r.id)))throw new Error('Review relationship must retain an existing stable ID');
  const ratings=relations.map(r=>({id:r.id,name:'',memberIds:[r.memberIds[0]],workIds:[r.workIds[0]],score:null,stylingScore:null,memory:'',note:'',photo:null,referencePhoto:null,verification:'',source:'',recognition:'',personalPhotoEligible:false}));
  const evidence=e=>({note:e.note,urls:[...e.urls]});
  const works=design.works.map(video=>{
    const matches=actual?.works?.filter(w=>w.id===video.id&&w.url===video.url&&w.videoType===video.videoType&&JSON.stringify(w.groupIds)===JSON.stringify(video.groupIds))??[];
    if(matches.length!==1)throw new Error('Review work identity is not uniquely backed: '+video.id);
    const saved=matches[0],s=video.stage,a=saved.stage,b=a?.scoreBinding;
    if(Boolean(s)!==Boolean(a)||s&&(a.videoId!==s.videoId||a.url!==s.url||a.kind!==s.kind||a.clip||a.scorePolicy||a.sourceClass&&a.sourceClass!=='official'||a.platform&&a.platform!=='youtube'||a.completeness&&a.completeness!=='full'))throw new Error('Review stage video identity mismatch: '+video.id);
    const validBinding=s&&b?.videoId===s.videoId&&b.initialScore===null&&typeof b.initializedAt==='string'&&Number.isFinite(Date.parse(b.initializedAt))&&(!b.sourceKey||b.sourceKey===s.videoId);
    const alternatives=video.alternatives.map(alt=>{
      const matches=(saved.stageSupplement?.alternatives??[]).filter(row=>row.id===alt.id&&row.sourceId===alt.sourceId&&row.url===alt.url&&row.scorePolicy==='view_only'&&row.version?.match===alt.version.match&&JSON.stringify(row.version.differences)===JSON.stringify(alt.version.differences));
      if(matches.length!==1||alt.scorePolicy!=='view_only')throw new Error('Review alternative identity mismatch: '+video.id);
      return {id:alt.id,platform:alt.platform,sourceId:alt.sourceId,sourceClass:alt.sourceClass,performerScope:alt.performerScope,completeness:alt.completeness,url:alt.url,title:alt.title,channel:alt.channel,performanceType:alt.performanceType,kind:alt.kind,checkedAt:alt.checkedAt,scorePolicy:'view_only',sourceEvidence:evidence(alt.sourceEvidence),sameSongEvidence:evidence(alt.sameSongEvidence),version:{match:alt.version.match,differences:[...alt.version.differences],evidence:evidence(alt.version.evidence)}};
    });
    return {id:video.id,name:video.title,song:video.title,groupIds:[...video.groupIds],url:video.url,score:null,stageScore:null,note:'',watched:'',videoType:video.videoType,version:video.version,releaseDate:video.date,verification:'',officialTitle:video.officialTitle,channel:video.channel,source:video.url,ratingIds:ratings.filter(r=>r.workIds[0]===video.id).map(r=>r.id),
      stage:s?{sourceClass:'official',platform:'youtube',completeness:'full',videoId:s.videoId,url:s.url,title:s.title,channel:s.channel,kind:s.kind,publishedDate:s.publishedDate,typeNote:s.typeNote,sourceUrl:s.sourceUrl,scoreBinding:validBinding?{videoId:s.videoId,initializedAt:b.initializedAt,initialScore:null,...(b.sourceKey?{sourceKey:b.sourceKey}:{})}:null,likes:{value:null,display:'',precision:'unknown'},checkedAt:'',selectionNote:'',candidateCount:0,candidates:[]}:null,
      stageSupplement:alternatives.length?{alternatives}:null,stageResearch:{status:s?'verified':'pending',reason:'',checkedAt:null}};
  });
  return {scope:{type:'artist',groupId},mode:'snapshot',capturedAt:'2026-10-24T00:00:00.000Z',loadedAt:'2026-10-24T00:00:00.000Z',warning:'示例资料 · 评分不写入正式手帐',groups:[{id:groupId,name:design.group.name,generation:'',company:design.group.company,country:'多国',note:'',debut:design.group.debut,memberIds:members.map(m=>m.id),workIds:works.map(w=>w.id),average:null,ratedCount:0,officialUrl:design.group.officialUrl}],members,works,ratings,counts:{groups:1,members:members.length,works:works.length,ratings:ratings.length,ratedWorks:0,scoreSum:0}};
}
