// Run once only after all 219 i-dle roots exist; no content rebuild.
const page = await figma.getNodeByIdAsync('252:1116');
if (page?.type !== 'PAGE') throw Error('i-dle page unavailable');
await figma.setCurrentPageAsync(page);
const prefixes = ['i-dle · ', 'i-dle / '];
const routeOf = n => { const p = prefixes.find(p => n.name.startsWith(p)); const r = p ? n.name.slice(p.length) : ''; return /^.+:\d+$/.test(r) ? r : null; };
const roots = page.children.filter(n => n.type === 'FRAME' && routeOf(n));
if (roots.length !== 219) throw Error('Require all 219 i-dle roots before reflow; found ' + roots.length);
const rows = new Map();
for (const n of roots) {
  const r = routeOf(n), at = r.lastIndexOf(':'), semantic = r.slice(0, at), width = Number(r.slice(at + 1));
  if (![1440,390,320].includes(width) || n.width !== width || !(n.height > 0)) throw Error('Invalid root bounds: ' + r);
  if (!rows.has(semantic)) rows.set(semantic, new Map());
  if (rows.get(semantic).has(width)) throw Error('Duplicate route: ' + r);
  rows.get(semantic).set(width,n);
}
for (const [semantic,row] of rows) if (row.size !== 3) throw Error('Incomplete width row: ' + semantic);
const families = new Set(['Space Grotesk','Noto Sans SC']);
await Promise.all((await figma.listAvailableFontsAsync()).map(f=>f.fontName).filter(f=>families.has(f.family)).map(f=>figma.loadFontAsync(f)));
const order = ['home','members','member','library','release','media','timeline','score'];
const rank = r => order.indexOf(r.split(':')[0]);
const sorted = [...rows].sort((a,b)=>rank(a[0])-rank(b[0]) || a[0].localeCompare(b[0]));
const mutated = [], bounds = {}, position = {1440:0,390:1600,320:2100};
let y = 0;
for (const [,row] of sorted) {
  const height = Math.max(...[...row.values()].map(n=>n.height));
  for (const [w,n] of row) {
    if (n.x !== position[w] || n.y !== y) { n.x = position[w]; n.y = y; mutated.push(n.id); }
    bounds[n.id] = [n.x,n.y,n.width,n.height];
  }
  y += height + 800;
}
return {createdNodeIds:'',mutatedNodeIds:mutated.join(','),removedNodeIds:'',rootCount:roots.length,rowCount:rows.size,gap:800,nonOverlapping:true,bounds};
