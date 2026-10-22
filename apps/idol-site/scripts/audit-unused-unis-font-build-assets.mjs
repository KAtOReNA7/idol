// Read-only, fail-closed audit. Only two obsolete UNIS WOFF BUILD copies qualify.
// Public WOFF sources, WOFF2 derivatives, licenses and shared Instrument TTF stay.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const manifest = JSON.parse(fs.readFileSync(fileURLToPath(new URL('./unused-unis-font-build-assets-manifest.json', import.meta.url)), 'utf8'));
const names = ['NotoSansSC-Regular', 'NotoSansSC-Bold'];
const prefix = '/fonts/unis/';
const extensions = /\.(?:[cm]?js|jsx|[cm]?ts|tsx|json|css|html|svg|txt|map)$/;
const sha = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function files(dir) {
  if (!fs.existsSync(dir)) return [];
  if (fs.lstatSync(dir).isSymbolicLink()) throw new Error(`UNIS font audit rejects symlink: ${dir}`);
  return fs.readdirSync(dir, {withFileTypes:true}).flatMap(entry => {
    const file = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`UNIS font audit rejects symlink: ${file}`);
    return entry.isDirectory() ? files(file) : [file];
  });
}
function verify(file, bytes, hash) {
  if (!fs.existsSync(file) || fs.lstatSync(file).isSymbolicLink() || !fs.statSync(file).isFile() || fs.statSync(file).size !== bytes || sha(file) !== hash)
    throw new Error(`UNIS font integrity mismatch: ${file}`);
}
export function auditUnusedUnisFontBuildAssets(root) {
  root = path.resolve(root);
  const udtt=JSON.parse(fs.readFileSync(path.join(root,'scripts/udtt-font-retention-manifest.json'),'utf8'));
  const exactUdttSources=['lib/idol/udtt-native/image-recovery.mjs','public/fonts/udtt/fonts.css','public/artist/udtt/figma-native.css','dist/client/fonts/udtt/fonts.css','dist/client/artist/udtt/figma-native.css'];
  const guards=Object.keys(udtt.runtimeGuards??{}),carriers=guards.filter(p=>!exactUdttSources.includes(p));
  if(udtt.family!=='UdttNotoSansSC'||guards.length!==7||exactUdttSources.some(p=>!guards.includes(p))||carriers.length!==2||!carriers.some(p=>p.startsWith('dist/client/'))||!carriers.some(p=>p.startsWith('dist/server/ssr/'))||carriers.some(p=>!/^dist\/(?:client|server\/ssr)\/_next\/static\/(?:chunks\/)?udtt-native-design-[A-Za-z0-9_-]+\.js$/.test(p)))throw new Error('UDTT font consumer inventory changed');
  const udttUrls=Array.from({length:20},(_,i)=>`/fonts/udtt/NotoSansSC-${String(i+1).padStart(2,'0')}.woff2`);
  if(!Array.isArray(udtt.retainedFonts)||JSON.stringify(udtt.retainedFonts.map(f=>f.path).sort())!==JSON.stringify([...udttUrls].sort()))throw new Error('UDTT exact retained WOFF2 inventory changed');
  for(const [file,expected]of Object.entries(udtt.runtimeGuards))verify(path.join(root,file),expected.bytes,expected.sha256);
  for(const font of udtt.retainedFonts)for(const dir of ['public','dist/client'])verify(path.join(root,dir,font.path),font.bytes,font.sha256);
  const server = path.join(root, 'dist/server/index.js');
  if (!fs.existsSync(server)) throw new Error('Build dist first');
  if (manifest.files.length !== 2 || manifest.files.some((entry, i) =>
    entry.path !== prefix + names[i] + '.woff' || entry.replacement !== entry.path + '2' ||
    !Number.isSafeInteger(entry.bytes) || entry.bytes <= 0 ||
    !Number.isSafeInteger(entry.replacementBytes) || entry.replacementBytes <= 0 || entry.replacementBytes >= entry.bytes ||
    !/^[a-f0-9]{64}$/.test(entry.sha256) || !/^[a-f0-9]{64}$/.test(entry.replacementSha256)))
    throw new Error('Invalid exact two-file UNIS font allowlist');
  const sourceFiles = ['app','components','lib','hooks','data','db','public','vendor'].flatMap(dir => files(path.join(root, dir)));
  sourceFiles.push(...fs.readdirSync(root, {withFileTypes:true}).filter(entry => entry.isFile()).map(entry => path.join(root, entry.name)));
  const sources = sourceFiles.filter(file => extensions.test(file));
  const built = files(path.join(root, 'dist')).filter(file => extensions.test(file));
  const inventory = JSON.stringify(files(path.join(root, 'public')).map(file => '/' + path.relative(path.join(root, 'public'), file).split(path.sep).join('/')).sort());
  const texts = [...sources, ...built].map(file => {
    let text = fs.readFileSync(file, 'utf8').replaceAll('\\/', '/');
    if (file === server) {
      const pattern = /new Set\(`([^`]*?)`\.split\(`,`\)\)/g;
      const matches = [...text.matchAll(pattern)].filter(match => match[1].includes('/fonts/unis/'));
      // Exactly one recognized inventory, equal to every public file. No broad
      // string removal: any partial/duplicate Set or outside consumer blocks.
      if (matches.length !== 1 || JSON.stringify(matches[0][1].split(',').sort()) !== inventory)
        throw new Error('UNIS font public inventory is not the exact single complete inventory');
      text = text.replace(matches[0][0], 'new Set()');
    }
    return {file, text};
  });
  for (const {file, text} of texts) {
    // Strip only the complete retained URLs. Old .woff consumers and common
    // dynamic filename/path fragments remain and therefore fail closed.
    let remaining = text;
    // Only exact reviewed UDTT consumers may name this separate family/subset set.
    // Keep all UNIS paths, unknown NotoSansSC fragments and other consumers fail-closed.
    if(Object.hasOwn(udtt.runtimeGuards,path.relative(root,file))){
      remaining=remaining.replaceAll(udtt.family,'');
      for(const url of udttUrls)remaining=remaining.replaceAll(url,'');
    }

    for (const entry of manifest.files) remaining = remaining.replaceAll(entry.replacement, '');
    for (const keep of ['URWGothic-Demi.otf','URWGothic-LICENSE.txt','NotoSansCJK-LICENSE.txt'])
      remaining = remaining.replaceAll(prefix + keep, '');
    if (remaining.includes(prefix) || (path.extname(file) !== '.txt' && remaining.includes('NotoSansSC')))
      throw new Error(`UNIS font runtime consumer or dynamic path: ${path.relative(root, file)}`);
  }
  const plan = [];
  for (const entry of manifest.files) {
    verify(path.join(root, 'public', entry.path), entry.bytes, entry.sha256);
    verify(path.join(root, 'public', entry.replacement), entry.replacementBytes, entry.replacementSha256);
    verify(path.join(root, 'dist/client', entry.replacement), entry.replacementBytes, entry.replacementSha256);
    const activeCss = path.join(root, 'components/design-review/unis-design-review.css');
    if (!texts.some(({file,text}) => file === activeCss && text.includes(entry.replacement)))
      throw new Error(`UNIS WOFF2 missing from active source CSS: ${entry.replacement}`);
    if (!texts.some(({file,text}) => built.includes(file) && file.endsWith('.css') && text.includes(entry.replacement)))
      throw new Error(`UNIS WOFF2 missing from built CSS: ${entry.replacement}`);
    const file = path.join(root, 'dist/client', entry.path);
    if (fs.existsSync(file)) {
      verify(file, entry.bytes, entry.sha256);
      plan.push({file:path.relative(root, file), bytes:entry.bytes});
    }
  }
  return plan;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = process.argv[2] || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const plan = auditUnusedUnisFontBuildAssets(root);
  console.log(JSON.stringify({mode:'read-only', plan, savedBytes:plan.reduce((sum,item) => sum + item.bytes, 0)}, null, 2));
}
