// Read-only scope adapter for the exact reviewed YOUNG POSSE image helper.
// Never suppress arbitrary batch fragments, other consumers, or missing live images.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const manifestPath=fileURLToPath(new URL('./youngposse-original-retention-manifest.json',import.meta.url));
const sourceHelper="const originalPhoto=(src:string)=>src.replace('/batch-b-20261016-webp-v1/','/batch-b-20261016/');";
const compiledHelper='C=e=>e.replace(`/batch-b-20261016-webp-v1/`,`/batch-b-20261016/`)';
const component='components/candidate/youngposse-design.tsx',data='data/youngposse-artist.json';
const same=(a,b)=>JSON.stringify([...a].sort())===JSON.stringify([...b].sort());
function verify(file,expected){
 if(!expected||!Number.isSafeInteger(expected.bytes)||expected.bytes<=0||!/^[a-f0-9]{64}$/.test(expected.sha256)||!fs.existsSync(file)||!fs.lstatSync(file).isFile()||fs.lstatSync(file).isSymbolicLink()||fs.statSync(file).size!==expected.bytes||createHash('sha256').update(fs.readFileSync(file)).digest('hex')!==expected.sha256)throw new Error('YOUNG POSSE retained integrity mismatch: '+file);
}
export function youngposseAuditTexts(root,manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'))){
 root=path.resolve(root);
 if(manifest.component!==component||manifest.data!==data||!same(Object.keys(manifest.runtimeGuards??{}),[component,data]))throw new Error('YOUNG POSSE exact retained guard inventory changed');
 if(manifest.exactHelper!==sourceHelper||manifest.compiledHelper!==compiledHelper)throw new Error('YOUNG POSSE exact helper scope changed');
 for(const [name,expected]of Object.entries(manifest.runtimeGuards))verify(path.join(root,name),expected);
 const content=JSON.parse(fs.readFileSync(path.join(root,data),'utf8'));
 const displays=[content.hero.image,...Object.values(content.portraits).map(p=>p.image)];
 if(displays.length!==6||new Set(displays).size!==6||displays.some(p=>!/^\/artist\/youngposse\/batch-b-20261016-webp-v1\/(?:group|sunhye|yeonjung|jiana|doeun|jieun)-display\.webp$/.test(p)))throw new Error('YOUNG POSSE original-photo input scope changed');
 const oldDisplays=displays.map(p=>p.replace('/batch-b-20261016-webp-v1/','/batch-b-20261016/'));
 const originals=oldDisplays.map(p=>p.endsWith('/group-display.webp')?p.replace('/group-display.webp','/group-original.png'):p.replace('-display.webp','-original.jpg'));
 if(!Array.isArray(manifest.retainedImages)||!same(manifest.retainedImages.map(p=>p.path),[...displays,...oldDisplays,...originals]))throw new Error('YOUNG POSSE retained-image inventory changed');
 for(const image of manifest.retainedImages)for(const dir of ['public','dist/client'])verify(path.join(root,dir,image.path),image);
 const carriers=Object.keys(manifest.builtCarriers??{});
 if(carriers.length!==2||!carriers.some(p=>p.startsWith('dist/client/'))||!carriers.some(p=>p.startsWith('dist/server/ssr/'))||carriers.some(p=>!/^dist\/(?:client|server\/ssr)\/_next\/static\/(?:chunks\/)?youngposse-design-[A-Za-z0-9_-]+\.js$/.test(p)))throw new Error('YOUNG POSSE exact compiled carrier inventory changed');
 for(const p of carriers)verify(path.join(root,p),manifest.builtCarriers[p]);
 for(const p of [component,...carriers]){
  const text=fs.readFileSync(path.join(root,p),'utf8'),helper=p===component?sourceHelper:compiledHelper;
  if(text.split(helper).length!==2)throw new Error('YOUNG POSSE exact helper must occur once: '+p);
 }
 return (file,text)=>{
  const relative=path.relative(root,file),helper=relative===component?sourceHelper:carriers.includes(relative)?compiledHelper:null;
  if(!helper)return text;
  if(text.split(helper).length!==2)throw new Error('YOUNG POSSE exact helper changed: '+relative);
  return text.replace(helper,'');
 };
}
