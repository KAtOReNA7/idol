// Only verified production work IDs join an MV to its stage versions.
// Candidate keys, video IDs, titles and dates do not establish this relation.
const productionId=value=>typeof value==='string'&&/^rec[A-Za-z0-9]+$/.test(value);
const mvIds=work=>[work.id,work.workId].filter(productionId);
const stageParentIds=work=>[work.parentWorkId,work.workId,work.sourceWorkId,...(Array.isArray(work.parentWorkIds)?work.parentWorkIds:[])].filter(productionId);

export function relatedVideoWorks(work,works=[]) {
  if(!work||!['mv','stage'].includes(work.type))return [];
  const ids=new Set(work.type==='mv'?mvIds(work):stageParentIds(work));
  if(!ids.size)return [];
  const otherType=work.type==='mv'?'stage':'mv';
  return works.filter(other=>other!==work&&other?.type===otherType&&(otherType==='mv'?mvIds(other):stageParentIds(other)).some(id=>ids.has(id)));
}
