const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),Module=require('node:module'),esbuild=require('esbuild');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const {memberWorkPhoto,MemberWorkIdentityPhoto,MemberWorkPhotoButton,memberWorks}=require('./helpers/image-dependency-loader.cjs').imageDependency('@/lib/idol/member-work-photo');
const runtime=require('../data/mv-public-media.json');
const portrait=runtime.portraits.find(p=>p.photoKind==='concept_photo'&&p.sourceCrop);
const work={id:portrait.workId,url:'https://www.youtube.com/watch?v='+portrait.videoId};
const privatePhoto={table:'ratings',recordId:'private rating',fieldId:'photo',index:3,sourceKind:'mv_look_photo',kind:'私人照片'};
const render=(Component,props)=>renderToStaticMarkup(React.createElement(Component,{work,memberId:portrait.memberId,label:'成员 · 作品',live:true,className:'existing-frame',onOpen(){},...props}));

test('every public identity is selected by exact work, video and member without changing private attachments',()=>{
 const before=JSON.stringify(privatePhoto);
 for(const p of runtime.portraits){
  const w={id:p.workId,url:'https://youtu.be/'+p.videoId};
  for(const live of [true,false]){const selected=memberWorkPhoto(w,p.memberId,privatePhoto,live);assert.equal(selected.src,p.src);assert.equal(selected.label,p.label);assert.deepEqual(selected.publicImage.sourceCrop,p.sourceCrop);}
  for(const [otherWork,otherMember] of [[{...w,id:'wrong-work'},p.memberId],[{...w,url:'https://youtu.be/XXXXXXXXXXX'},p.memberId],[w,'wrong-member']])assert.equal(memberWorkPhoto(otherWork,otherMember,null,true),null);
 }
 assert.equal(JSON.stringify(privatePhoto),before);
});
test('only a live qualified private photo is the fallback, with its original attachment index and label',()=>{
 const unmatched={...work,id:'unmatched-work'};
 const selected=memberWorkPhoto(unmatched,portrait.memberId,privatePhoto,true);
 assert.equal(selected.src,'/api/media?table=ratings&record=private%20rating&index=3');assert.equal(selected.label,'本MV同造型照片');assert.equal(selected.publicImage,null);
 assert.equal(memberWorkPhoto(unmatched,portrait.memberId,privatePhoto,false),null);
 assert.equal(memberWorkPhoto(unmatched,portrait.memberId,null,true),null);
 const html=render(MemberWorkIdentityPhoto,{work:unmatched,photo:privatePhoto});assert.match(html,/record=private%20rating&amp;index=3/);assert.match(html,/本MV同造型照片/);assert.doesNotMatch(html,/foreignObject|同系列概念照/);
 assert.match(render(MemberWorkIdentityPhoto,{work:unmatched,photo:privatePhoto,className:'existing-frame mv-look-native'}),/class="existing-frame mv-look-native"/);
});
test('reviewed crop viewport contains the untouched full native image and displays the true source label',()=>{
 const html=render(MemberWorkIdentityPhoto,{photo:privatePhoto});
 assert.ok(html.includes(portrait.src));assert.ok(html.includes(portrait.label));assert.ok(html.includes(portrait.sourceUrl.replaceAll('&','&amp;')));
 assert.ok(html.includes(`viewBox="${portrait.sourceCrop.x} ${portrait.sourceCrop.y} ${portrait.sourceCrop.width} ${portrait.sourceCrop.height}"`));
 assert.ok(html.includes(`<foreignObject x="0" y="0" width="${portrait.width}" height="${portrait.height}">`));
 assert.match(html,/preserveAspectRatio="xMidYMid meet"/);assert.match(html,/class="existing-frame"/);assert.doesNotMatch(html,/api\/media|本MV同造型照片/);
 assert.match(html,/style="overflow:hidden"/);assert.match(render(MemberWorkIdentityPhoto,{photo:privatePhoto,className:'existing-frame mv-look-native'}),/class="existing-frame"/);
 const uncropped=runtime.portraits.find(p=>!p.sourceCrop);assert(uncropped);const legacy=render(MemberWorkIdentityPhoto,{work:{id:uncropped.workId,url:'https://youtu.be/'+uncropped.videoId},memberId:uncropped.memberId});assert.match(legacy,/object-fit:contain/);assert.doesNotMatch(legacy,/object-fit:fill|foreignObject/);
});
test('both existing frame and text controls open full originals, never the crop or a fabricated private attachment',()=>{
 for(const Component of [MemberWorkIdentityPhoto,MemberWorkPhotoButton]){
  let opened;const element=Component({work,memberId:portrait.memberId,label:'成员 · 作品',photo:privatePhoto,live:true,className:'existing',onOpen:value=>opened=value});
  const button=Component===MemberWorkPhotoButton?element:element.props.children[0];button.props.onClick();
  assert.deepEqual(opened,{src:portrait.src,label:'成员 · 作品 · '+portrait.label});
  assert.equal(button.props['aria-haspopup'],'dialog');assert.equal(button.props.disabled,Component===MemberWorkPhotoButton?undefined:false);
 }
 const html=render(MemberWorkPhotoButton,{photo:privatePhoto});assert.ok(html.includes(portrait.label));assert.doesNotMatch(html,/<img|<svg|api\/media/);
});
test('missing images preserve host fallback and score eligibility without manufacturing a photo',()=>{
 const unmatched={...work,id:'unmatched'};
 assert.equal(render(MemberWorkIdentityPhoto,{work:unmatched,fallback:React.createElement('a',{href:'/work'},'原作品封面')}),'<a href="/work">原作品封面</a>');
 assert.equal(render(MemberWorkPhotoButton,{work:unmatched}),'');
 const html=render(MemberWorkIdentityPhoto,{work:unmatched,showMissing:true});assert.match(html,/disabled/);assert.match(html,/认人图待补/);
 const rating={id:'private rating',memberIds:[portrait.memberId],workIds:[work.id],score:0,stylingScore:9,photo:null};
 const catalog={works:[work],ratings:[rating]};const before=JSON.stringify(catalog);const [item]=memberWorks(catalog,portrait.memberId);assert.equal(item.photo,null);assert.equal(item.performance,0);assert.equal(item.styling,9);assert.equal(memberWorkPhoto(item.work,portrait.memberId,item.photo,true).src,portrait.src);assert.equal(JSON.stringify(catalog),before);
});

test('actual XG member page shows public recognition while retaining private reference and score/navigation semantics',()=>{
 const root=path.resolve(__dirname,'..');const output=esbuild.buildSync({stdin:{contents:"export {default as ExpandedArtist} from './components/expanded-artist';export {ArtistTimelineHostProvider} from './components/artist-timeline-host';",resolveDir:root,loader:'tsx'},bundle:true,write:false,platform:'node',format:'cjs',jsx:'automatic',external:['react','react/*','react-dom','react-dom/*'],loader:{'.css':'empty'},logLevel:'silent'}).outputFiles[0].text;
 const filename=path.join(root,'tests/.member-public-photo-compiled.cjs'),mod=new Module(filename,module);mod.paths=module.paths;mod._compile(output,filename);const {ExpandedArtist,ArtistTimelineHostProvider}=mod.exports;
 const content=require('../data/xg-artist.json'),p=runtime.portraits.find(p=>p.memberId==='recvxDM2kSglhG'&&p.photoKind==='concept_photo')??runtime.portraits.find(p=>p.memberId==='recvxDM2kSglhG');assert(p);
 const m={id:p.memberId,name:'JURIN',stageName:'JURIN',cnName:'JURIN',groupIds:[content.groupId],photo:null,favorite:2,note:'私人备注保持',profile:'',status:'',country:'',role:'',officialUrl:'',birthDate:''};
 const w={...work,id:p.workId,url:'https://youtu.be/'+p.videoId,groupIds:[content.groupId],name:'已关联作品',song:'已关联作品',version:'原版',score:null,stageScore:null,stage:null,releaseDate:'2026-01-01',watched:'',videoType:'MV',ratingIds:['private rating']};
 const photo={...privatePhoto,approvedLookIdentity:{memberId:m.id,workId:w.id,videoId:p.videoId,sameLook:true}},reference={...photo,index:0,sourceKind:'mv_still',kind:'本 MV 截图'};
 const catalog={mode:'live',groups:[{id:content.groupId,name:'XG',memberIds:[m.id],workIds:[w.id]}],members:[m],works:[w],ratings:[{id:photo.recordId,memberIds:[m.id],workIds:[w.id],score:0,stylingScore:9,photo,referencePhoto:reference,recognition:''}]};const before=JSON.stringify(catalog);
 const html=renderToStaticMarkup(React.createElement(ArtistTimelineHostProvider,{value:{catalog,serverRoute:'/artists/xg?section=members&member='+m.id,loading:false}},React.createElement(ExpandedArtist,{slug:'xg',content})));
 assert.ok(html.includes(p.src));assert.ok(html.includes(p.label));assert.match(html,/原MV截图/);assert.match(html,/nx-member-look member-mv-look/);assert.match(html,/>0\.0<\/strong>/);assert.match(html,/>9\.0<\/strong>/);assert.ok(html.includes('data-member-work-trigger="'+w.id+'"'));assert.ok(html.includes('work='+w.id));assert.doesNotMatch(html,/<img[^>]+api\/media\?table=ratings/);assert.equal(JSON.stringify(catalog),before);
});
