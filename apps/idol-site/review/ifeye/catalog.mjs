/** Construct the review data from the public editorial model. This module has
 * no snapshot import. The builder alone passes normalized IDs for matching;
 * every returned field is explicitly selected, including nested stage fields. */
export function createIfeyeReviewCatalog(design, actual) {
  if (design?.group?.slug !== 'ifeye' || design.group.id !== 'rec28ldfRTiCGa') throw new Error('Expected the public ifeye editorial model');
  const groupId = design.group.id;
  for (const member of design.members) {
    const matches = actual?.members?.filter(row => row.id === member.id && [...(row.groupIds ?? []),...(row.formerGroupIds ?? [])].includes(groupId)) ?? [];
    if (matches.length !== 1) throw new Error('Review member identity is not uniquely backed: '+member.id);
  }
  const members = design.members.map(member => ({
    id:member.id,name:member.stageName,cnName:member.cnName,stageName:member.stageName,
    groupIds:member.relationship === 'former' ? [] : [groupId],
    formerGroupIds:member.relationship === 'former' ? [groupId] : [],
    photo:null,favorite:null,note:'',profile:'',status:member.relationship === 'former' ? '历史成员' : '',
    country:member.nationality ?? '',role:'',officialUrl:design.group.officialUrl,birthDate:member.birthDate ?? ''
  }));
  const mvs = design.works.filter(work => work.type === 'MV');
  if (new Set(mvs.map(work => work.id)).size !== mvs.length) throw new Error('Duplicate review MV work IDs');
  const exactWorks = new Map();
  for (const mv of mvs) {
    const matches = actual?.works?.filter(work => work.id === mv.id && work.url === mv.url && work.videoType === mv.videoType && work.groupIds?.includes(groupId)) ?? [];
    if (matches.length !== 1) throw new Error('Review work identity is not uniquely backed: ' + mv.key);
    exactWorks.set(mv.id, matches[0]);
  }
  const allowedPairs = new Set(mvs.flatMap(work =>
    work.participantEvidence?.status === 'verified_named_mv_participants' && work.participantEvidence.videoId === work.videoId && work.participantEvidence.slotType === 'MV'
      ? work.memberIds.map(id => id + ':' + work.id) : []));
  const relations = (actual?.ratings ?? []).filter(row => row.memberIds?.length === 1 && row.workIds?.length === 1 && allowedPairs.has(row.memberIds[0] + ':' + row.workIds[0]));
  if (new Set(relations.map(row => row.id)).size !== relations.length || new Set(relations.map(row => row.memberIds[0]+':'+row.workIds[0])).size !== relations.length) throw new Error('Ambiguous saved review relationships');
  if (relations.some(row => !/^rec[A-Za-z0-9]+$/.test(row.id))) throw new Error('Review relationship must retain an existing stable ID');
  const ratings = relations.map(row => ({id:row.id,name:'',memberIds:[row.memberIds[0]],workIds:[row.workIds[0]],score:null,stylingScore:null,memory:'',note:'',photo:null,referencePhoto:null,verification:'',source:'',recognition:'',personalPhotoEligible:false}));
  const works = mvs.map(mv => {
    const stageRows = design.works.filter(work => work.type === 'STAGE' && work.parentWorkId === mv.id);
    if (stageRows.length > 1) throw new Error('Ambiguous review stage: ' + mv.id);
    const stage = stageRows[0];
    const actualStage = exactWorks.get(mv.id).stage;
    if (stage && (actualStage?.videoId !== stage.videoId || actualStage?.url !== stage.url || actualStage?.kind !== stage.videoType || actualStage?.clip || actualStage?.scorePolicy || actualStage?.sourceClass && actualStage.sourceClass !== 'official' || actualStage?.platform && actualStage.platform !== 'youtube' || actualStage?.completeness && actualStage.completeness !== 'full')) throw new Error('Review stage video identity mismatch: ' + stage.key);
    const binding=actualStage?.scoreBinding;
    const validBinding=stage && binding?.videoId === stage.videoId && binding.initialScore === null && typeof binding.initializedAt === 'string' && Number.isFinite(Date.parse(binding.initializedAt)) && (!binding.sourceKey || binding.sourceKey === stage.videoId);
    return {
      id:mv.id,name:mv.title,song:mv.title,groupIds:[groupId],url:mv.url,score:null,stageScore:null,note:'',watched:'',
      videoType:mv.videoType,version:mv.version ?? '',releaseDate:mv.date ?? '',verification:'',officialTitle:mv.officialTitle,channel:'',source:mv.sourceUrl,
      ratingIds:ratings.filter(row => row.workIds[0] === mv.id).map(row => row.id),
      stage:stage ? {
        sourceClass:'official',platform:'youtube',completeness:'full',videoId:stage.videoId,url:stage.url,title:stage.officialTitle,
        channel:'',kind:stage.videoType,publishedDate:stage.date ?? '',typeNote:'',sourceUrl:stage.sourceUrl,
        // Retain only existing binding identity metadata; never initialize one.
        scoreBinding:validBinding ? {videoId:stage.videoId,initializedAt:binding.initializedAt,initialScore:null,...(binding.sourceKey ? {sourceKey:binding.sourceKey} : {})} : null,
        likes:{value:null,display:'',precision:'unknown'},checkedAt:'',selectionNote:'',candidateCount:0,candidates:[]
      } : null,
      stageResearch:{status:stage ? 'verified' : 'pending',reason:'',checkedAt:null}
    };
  });
  return {
    scope:{type:'artist',groupId},mode:'snapshot',capturedAt:'2026-10-23T00:00:00.000Z',loadedAt:'2026-10-23T00:00:00.000Z',warning:'示例资料 · 评分不写入正式手帐',
    groups:[{id:groupId,name:'ifeye',generation:'',company:design.group.company,country:'韩国',note:'',debut:'2025-04-08',memberIds:members.filter(member => member.groupIds.length).map(member => member.id),workIds:works.map(work => work.id),average:null,ratedCount:0,officialUrl:design.group.officialUrl}],
    members,works,ratings,counts:{groups:1,members:members.length,works:works.length,ratings:ratings.length,ratedWorks:0,scoreSum:0}
  };
}
