// Build filenames include graph hashes, which may change without a code change.
// Discover one carrier per reviewed output scope, then keep full-content pins.
// The optional migration normalizes ONLY the hash in reviewed leading imports;
// bindings, module names, statements and all runtime literals remain pinned.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

const directories=['dist/client/_next/static/chunks','dist/server/ssr/_next/static'];
const sha=text=>createHash('sha256').update(text).digest('hex');
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const integrity=value=>value&&Number.isSafeInteger(value.bytes)&&value.bytes>0&&/^[a-f0-9]{64}$/.test(value.sha256);
function regular(root,relative){
 let current=root;
 for(const part of relative.split('/')){
  current=path.join(current,part);
  if(!fs.existsSync(current)||fs.lstatSync(current).isSymbolicLink())throw new Error(`Compiled carrier missing or symlink: ${relative}`);
 }
 if(!fs.statSync(current).isFile())throw new Error(`Compiled carrier is not a regular file: ${relative}`);
 return current;
}
export function normalizeCarrierImports(text,expectedImports){
 if(!Array.isArray(expectedImports)||!expectedImports.length||expectedImports.some(s=>typeof s!=='string'))throw new Error('Compiled carrier import inventory missing');
 const imports=[];let offset=0,result='';
 // Deliberately accepts only the reviewed minifier's leading static-import form.
 // A syntax/compiler change requires review instead of a broad text exemption.
 const pattern=/^import(?:\{[A-Za-z0-9_$ ,]+\}from)?"([^"\r\n]+)";/;
 while(true){
  const match=text.slice(offset).match(pattern);if(!match)break;
  const specifier=match[1];
  const normalized=specifier.replace(/^(\.\/[A-Za-z0-9_-]+)-[A-Za-z0-9_-]{8}\.js$/,'$1-<hash>.js');
  if(normalized===specifier&&specifier!=='../../index.js')throw new Error(`Compiled carrier unsupported import: ${specifier}`);
  imports.push(normalized);
  result+=match[0].replace('"'+specifier+'"','"'+normalized+'"');offset+=match[0].length;
 }
 if(!same(imports,expectedImports))throw new Error('Compiled carrier import inventory changed');
 return result+text.slice(offset);
}
export function resolveAuditedCarriers(root,pins,moduleName,normalizedPins={}){
 root=path.resolve(root);
 if(fs.lstatSync(root).isSymbolicLink()||!/^[a-z][a-z0-9-]*$/.test(moduleName))throw new Error('Invalid compiled carrier scope');
 const entries=Object.entries(pins??{}),seen=[];
 if(entries.length!==2)throw new Error('Exactly two compiled carriers required');
 const optional=Object.keys(normalizedPins??{});
 if(optional.length&&(!same([...optional].sort(),[...directories].sort())))throw new Error('Compiled carrier normalization scope changed');
 const resolved={};
 for(const [previousName,pin]of entries){
  const directory=path.posix.dirname(previousName),name=path.posix.basename(previousName);
  if(!directories.includes(directory)||seen.includes(directory)||!new RegExp('^'+moduleName+'-[A-Za-z0-9_-]{8}\\.js$').test(name)||!integrity(pin))throw new Error('Compiled carrier pin inventory changed');
  seen.push(directory);
 }
 // Inspect every exact path component; never follow a linked output directory.
 for(const [previousName,pin]of entries){
  const directory=path.posix.dirname(previousName);
  let current=root;
  for(const part of directory.split('/')){current=path.join(current,part);if(!fs.existsSync(current)||fs.lstatSync(current).isSymbolicLink()||!fs.statSync(current).isDirectory())throw new Error(`Compiled carrier directory missing or symlink: ${directory}`);}
  const names=fs.readdirSync(current).filter(name=>name.startsWith(moduleName+'-')&&name.endsWith('.js'));
  if(names.length!==1||!new RegExp('^'+moduleName+'-[A-Za-z0-9_-]{8}\\.js$').test(names[0]))throw new Error(`Compiled carrier missing or ambiguous: ${moduleName} in ${directory}`);
  const relative=directory+'/'+names[0],file=regular(root,relative),bytes=fs.readFileSync(file);
  if(bytes.length!==pin.bytes)throw new Error(`Compiled carrier integrity mismatch: ${relative}`);
  const normalized=normalizedPins?.[directory];
  if(normalized){
   if(!integrity(normalized))throw new Error('Compiled carrier normalization pin invalid');
   const text=normalizeCarrierImports(bytes.toString('utf8'),normalized.imports);
   if(Buffer.byteLength(text)!==normalized.bytes||sha(text)!==normalized.sha256)throw new Error(`Compiled carrier normalized integrity mismatch: ${relative}`);
  }else if(sha(bytes)!==pin.sha256)throw new Error(`Compiled carrier integrity mismatch: ${relative}`);
  resolved[relative]={bytes:bytes.length,sha256:sha(bytes)};
 }
 return resolved;
}
