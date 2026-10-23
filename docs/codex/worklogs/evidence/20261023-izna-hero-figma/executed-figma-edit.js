// Archive of the actual Figma mutation; do not replay blindly (creates an image node).

const page=await figma.getNodeByIdAsync("811:1095");await figma.setCurrentPageAsync(page);
const get=id=>figma.getNodeByIdAsync(id);
const homes=await Promise.all(["812:19251","812:19340"].map(get));
const fonts=new Map();
for(const h of homes)for(const t of h.findAllWithCriteria({types:["TEXT"]}))for(const s of t.getStyledTextSegments(["fontName"]))fonts.set(JSON.stringify(s.fontName),s.fontName);
await Promise.all([...fonts.values()].map(f=>figma.loadFontAsync(f)));
const changed=new Set(),created=[];
const touch=n=>{changed.add(n.id);return n;};
const imageHash=(await get("812:19265")).fills.find(f=>f.type==="IMAGE")?.imageHash;
if(!imageHash)throw Error("Uploaded original image is required");
const configs=[
{home:"812:19251",nav:"812:19252",brand:"812:19253",menus:["812:19254","812:19255","812:19256"],main:"812:19258",opening:"812:19259",identity:"812:19260",company:"812:19262",photo:"812:19265",pending:"812:19266",actions:"812:19263",label:"812:19264",w:1440,photoW:1120,mobile:false},
{home:"812:19340",nav:"812:19341",brand:"812:19342",menus:["812:19343","812:19344","812:19345"],main:"812:19347",opening:"812:19348",identity:"812:19349",company:"812:19351",photo:"812:19354",pending:"812:19355",actions:"812:19352",label:"812:19353",w:390,photoW:358,mobile:true}
];
const summaries=[];
for(const c of configs){
 const n={};for(const k of ["home","nav","brand","main","opening","identity","company","photo","pending","actions","label"])n[k]=touch(await get(c[k]));
 n.home.name="01 · 首页 · "+c.w+" · 首屏实图调整 · 下方图片待落地";
 n.nav.paddingLeft=n.nav.paddingRight=c.mobile?16:160;
 n.nav.paddingTop=n.nav.paddingBottom=c.mobile?14:19;
 n.nav.counterAxisAlignItems="CENTER";n.nav.primaryAxisAlignItems="SPACE_BETWEEN";
 n.brand.fontSize=c.mobile?30:40;n.brand.textAutoResize="WIDTH_AND_HEIGHT";
 n.company.textAutoResize="WIDTH_AND_HEIGHT";n.company.fontSize=12;
 n.nav.appendChild(n.company);
 n.identity.visible=false;n.pending.visible=false;
 n.main.paddingTop=c.mobile?16:24;
 n.main.paddingLeft=n.main.paddingRight=c.mobile?16:64;
 n.main.counterAxisAlignItems="CENTER";
 n.opening.name="Photo-led opening · 2026-10-23";
 n.opening.resize(c.w-(c.mobile?32:128),100);
 n.opening.layoutSizingVertical="HUG";n.opening.itemSpacing=c.mobile?12:16;n.opening.counterAxisAlignItems="CENTER";
 n.photo.name=c.mobile?"Official group portrait · full image":"Official group portrait · full members viewport";
 n.photo.resize(c.photoW,c.mobile?501.2:746.6667);
 n.photo.strokes=[];n.photo.effects=[];n.photo.cornerRadius=0;n.photo.clipsContent=true;
 if(c.mobile){n.photo.fills=[{type:"IMAGE",imageHash,scaleMode:"FIT"}];}
 else{
  const img=figma.createRectangle();created.push(img.id);img.name="Original PNG · 1500×2100 · source y850–1850 visible";
  n.photo.appendChild(img);img.resize(1120,1568);img.x=0;img.y=-634.6667;img.fills=[{type:"IMAGE",imageHash,scaleMode:"FIT"}];img.strokes=[];
  n.photo.fills=[];
 }
 n.actions.name="Navigation below photograph";n.actions.resize(c.photoW,44);
 n.actions.primaryAxisSizingMode="FIXED";n.actions.counterAxisSizingMode="FIXED";
 n.actions.paddingLeft=n.actions.paddingRight=0;n.actions.paddingTop=n.actions.paddingBottom=0;
 n.actions.primaryAxisAlignItems="SPACE_BETWEEN";n.actions.counterAxisAlignItems="CENTER";n.actions.itemSpacing=c.mobile?8:32;
 n.actions.fills=[];n.actions.strokes=[];n.actions.effects=[];
 for(let i=0;i<c.menus.length;i++){const t=touch(await get(c.menus[i]));n.actions.insertChild(i,t);t.fontSize=c.mobile?14:16;t.textAutoResize="WIDTH_AND_HEIGHT";t.characters=["成员 →","作品 →","时间轴 →"][i];}
 n.label.characters="查看原图 ↗";n.label.fontSize=c.mobile?12:14;n.label.textAutoResize="WIDTH_AND_HEIGHT";
 n.label.hyperlink={type:"URL",value:"https://cdn.wake-one.com/wp-content/uploads/2026/08/07091746/%EC%9B%A8%EC%9D%B4%ED%81%AC%EC%9B%90-%ED%94%84%EB%A1%9C%ED%95%84_%EB%8B%A8%EC%B2%B4_%EC%84%B8%EB%A1%9C.png"};
 n.label.fills=JSON.parse(JSON.stringify(n.company.fills));
 summaries.push({home:n.home.id,photo:n.photo.id,homeSize:[n.home.width,n.home.height],navSize:[n.nav.width,n.nav.height],photoBounds:[n.photo.x,n.photo.y,n.photo.width,n.photo.height],openingSize:[n.opening.width,n.opening.height],actionsSize:[n.actions.width,n.actions.height]});
}
return {changedNodeIds:[...changed],createdNodeIds:created,imageHash,summaries,counts:homes.map(h=>({id:h.id,frames:h.findAllWithCriteria({types:["FRAME"]}).length,texts:h.findAllWithCriteria({types:["TEXT"]}).length,instances:h.findAllWithCriteria({types:["INSTANCE"]}).length}))};
