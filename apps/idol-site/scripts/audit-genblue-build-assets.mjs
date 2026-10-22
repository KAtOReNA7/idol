// GENBLUE BlueCut reuses seven existing JPGs. Prune only the seven audited
// unused BUILD originals; public/Git originals and all runtime images survive.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import manifest from './genblue-build-assets-manifest.json' with {type:'json'};

export function auditGenblueBuildAssets(root, texts, entries=manifest.files) {
  const prefix='/artist/genblue/batch-b-20261016/';
  const source=path.join(root,'public',prefix),build=path.join(root,'dist/client',prefix);
  const known=new Map(entries.map(entry=>[entry.path,entry]));
  if(known.size!==14||entries.filter(entry=>entry.retain).length!==7||entries.some(entry=>!entry.path.startsWith(prefix)||!/^(card-[1-6]|group)-(display|original)\.jpg$/.test(entry.path.slice(prefix.length))))throw new Error('GENBLUE asset scope changed');
  function files(directory) {
    if(!fs.existsSync(directory))return [];
    if(fs.lstatSync(directory).isSymbolicLink())throw new Error('GENBLUE directory symlink rejected');
    return fs.readdirSync(directory).map(name=>{
      const file=path.join(directory,name);
      if(!fs.lstatSync(file).isFile()||fs.lstatSync(file).isSymbolicLink())throw new Error('GENBLUE unexpected asset type');
      if(!known.has(prefix+name))throw new Error('GENBLUE unexpected asset: '+name);
      return prefix+name;
    });
  }
  if(files(source).length!==entries.length)throw new Error('GENBLUE source list changed');
  const built=new Set(files(build));
  const verify=(file,entry)=>{
    if(!fs.existsSync(file)||fs.lstatSync(file).isSymbolicLink()||fs.statSync(file).size!==entry.bytes||createHash('sha256').update(fs.readFileSync(file)).digest('hex')!==entry.sha256)throw new Error('GENBLUE image integrity mismatch: '+entry.path);
  };
  const plan=[];
  for(const entry of entries) {
    verify(path.join(root,'public',entry.path),entry);
    if(entry.retain||built.has(entry.path))verify(path.join(root,'dist/client',entry.path),entry);
    if(entry.retain)continue;
    for(const {p,text} of texts)if(text.includes(entry.path))throw new Error('GENBLUE original is now referenced: '+p);
    if(built.has(entry.path))plan.push({file:path.join('dist/client',entry.path),bytes:entry.bytes});
  }
  return plan;
}
