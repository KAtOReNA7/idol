// Extend only synthetic sandbox records; never read a production catalog.
const base=require('./fixtures/catalog.synthetic.json');
module.exports=function libraryFixture(){
 const data=structuredClone(base);
 for(let i=0;i<180;i++){
  const group=data.groups[i%6];
  data.works.push({...structuredClone(base.works[i%18]),id:`recDemoLibrary${i}`,name:`合成作品 ${i}`,song:`Library Song ${String(i).padStart(3,'0')}`,groupIds:[group.id],version:i%2?'Live Version':'Studio Version',officialTitle:`SYNTHETIC TITLE ${i}`,ratingIds:[],score:[null,0,9,null][i%4],watched:i===4?'已观看':['未观看','已观看','已观看',''][i%4],note:'合成备注，不得写入生产'});
 }
 for(const group of data.groups){const works=data.works.filter(w=>w.groupIds.includes(group.id)),rated=works.filter(w=>w.score!==null);group.workIds=works.map(w=>w.id);group.ratedCount=rated.length;group.average=rated.length?rated.reduce((n,w)=>n+w.score,0)/rated.length:null;}
 data.counts.works=data.works.length;data.counts.ratedWorks=data.works.filter(w=>w.score!==null).length;data.counts.scoreSum=data.works.reduce((n,w)=>n+(w.score??0),0);
 return data;
};
