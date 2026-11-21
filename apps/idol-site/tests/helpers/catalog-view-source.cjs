// Older VM specs instrument named local functions and provide their own React runtime.
// Read the current modules in a shared VM scope. Browser tests exercise real lazy imports.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '../..');
let cached;
module.exports = function catalogViewSource() {
 if (cached) return cached;
 const imports = new Map(), declarations = new Map();
 for (const file of ['app/page.tsx','components/catalog/presentation.tsx','components/catalog/work-detail.tsx',
   'components/catalog/record-editor.tsx','components/catalog/member-portrait.tsx','components/catalog/member-detail.tsx']) {
  const text = fs.readFileSync(path.join(root,file),'utf8');
  const tree = ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  for (const node of tree.statements) {
   if (ts.isImportDeclaration(node)) {
    const source = node.moduleSpecifier.text;
    if (source.startsWith('@/components/catalog/') || (file !== 'app/page.tsx' && source.startsWith('./'))) continue;
    const clause = node.importClause;
    if (!clause || clause.isTypeOnly) continue;
    const existing = imports.get(source) || {names:new Set(),defaultName:null};
    if (clause.name) existing.defaultName = clause.name.text;
    for (const spec of clause.namedBindings?.elements || []) if (!spec.isTypeOnly) existing.names.add(spec.getText(tree));
    imports.set(source,existing);
   } else {
    const name = node.name?.text || node.declarationList?.declarations[0]?.name?.text;
    if (!name || /^const \w+\s*=\s*lazy\(/.test(node.getText(tree))) continue;
    declarations.set(name,node.getText(tree).replace(/^export (?!default )/,''));
   }
  }
 }
 const header = [...imports].map(([source,{names,defaultName}])=>{
  const bindings = [defaultName,names.size && '{'+[...names].join(',')+'}'].filter(Boolean);
  return 'import '+bindings.join(',')+" from '"+source+"';";
 });
 // Keep named slice boundaries used by pre-split SSR fixtures.
 const order = ['navs','score','readResponse','names','GroupLinks','PhotoView','WorkCard','triplesDetailMedia',
  'isEditorValues','LoonaScoreInput','Editor','App','PlaceholderDetail','platformLabel','StageSupplements','PageTitle','More',
  'CaptionHelp','WorkDetail','MemberWorkCard','musicMemberPortrait','MusicPortrait','MusicMemberPhoto','MemberDetail'];
 cached = [...header,...order.map(name=>declarations.get(name)).filter(Boolean)].join('\n');
 return cached;
};
