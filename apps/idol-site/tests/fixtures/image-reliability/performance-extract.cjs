'use strict';
const fs=require('node:fs');const path=require('node:path');const ts=require('typescript');const crypto=require('node:crypto');
const implementations=['artist-sample','illit-artist','expanded-artist','ive-artist','kiof-artist','stayc-artist','nmixx-artist','hearts2hearts-artist','kiiikiii-artist','lesserafim-artist','itzy-artist','saymyname-artist','katseye-artist','candidate-artist-experience'];
function extract(source,filename){
 const ast=ts.createSourceFile(filename,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);const definitions=new Map(),imports=new Map();
 for(const node of ast.statements){
  if(ts.isFunctionDeclaration(node)&&node.name)definitions.set(node.name.text,node);
  if(ts.isVariableStatement(node))for(const item of node.declarationList.declarations)if(ts.isIdentifier(item.name))definitions.set(item.name.text,node);
  if(ts.isImportDeclaration(node)&&node.importClause){const clause=node.importClause;if(clause.name)imports.set(clause.name.text,node);if(clause.namedBindings&&ts.isNamedImports(clause.namedBindings))for(const item of clause.namedBindings.elements)imports.set(item.name.text,node);}
 }
 const selected=filename.endsWith('photo-lightbox.tsx')?['PhotoLightbox']:['Picture',...(definitions.has('WorkCard')?['WorkCard']:[]),...['Thumb','VideoThumb'].filter(name=>definitions.has(name))];
 const nodes=new Set(),usedImports=new Set();
 function visit(node){if(!node)return;if(ts.isIdentifier(node)){const name=node.text;if(definitions.has(name)&&!nodes.has(definitions.get(name))){const declaration=definitions.get(name);nodes.add(declaration);ts.forEachChild(declaration,visit);}if(imports.has(name))usedImports.add(imports.get(name));}ts.forEachChild(node,visit);}
 for(const name of selected){const node=definitions.get(name);if(!node)throw new Error('Missing actual image definition '+filename+':'+name);if(!nodes.has(node)){nodes.add(node);ts.forEachChild(node,visit);}}
 const ordered=[...nodes].sort((a,b)=>a.pos-b.pos);const code=[...usedImports].sort((a,b)=>a.pos-b.pos).map(n=>n.getText(ast)).join('\n')+'\n'+ordered.map(n=>n.getText(ast).replace(/^export\s+default\s+/,'').replace(/^export\s+/,'' )).join('\n')+'\nexport {'+selected.join(',')+'};\n';
 return {source:filename,sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),selected,declarations:ordered.map(node=>({name:ts.isFunctionDeclaration(node)?node.name?.text:'variable',line:ast.getLineAndCharacterOfPosition(node.getStart()).line+1,text:node.getText(ast)})),code};
}
function currentRecords(root){return Object.fromEntries([...implementations.map(name=>'components/'+name+'.tsx'),'components/photo-lightbox.tsx'].map(file=>[file,extract(fs.readFileSync(path.join(root,file),'utf8'),file)]));}
module.exports={implementations,extract,currentRecords};
