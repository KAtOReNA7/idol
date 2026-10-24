/** Call only on the explicit public-catalog schema, never raw records. */
export function clearReviewPersonalValues(publicCatalog){
 const view=structuredClone(publicCatalog);
 for(const g of view.groups)Object.assign(g,{note:'',average:null,ratedCount:0});
 for(const m of view.members)Object.assign(m,{note:'',favorite:null,photo:null});
 for(const w of view.works){Object.assign(w,{note:'',score:null,stageScore:null,watched:''});if(w.stage?.scoreBinding)w.stage.scoreBinding.initialScore=null;}
 for(const r of view.ratings)Object.assign(r,{name:'',note:'',memory:'',score:null,stylingScore:null,photo:null,referencePhoto:null,personalPhotoEligible:false});
 view.mode='snapshot';view.warning='只读审阅 · 个人记录未载入';view.counts.ratedWorks=0;view.counts.scoreSum=0;
 return view;
}
