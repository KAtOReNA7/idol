/* Mechanical Native Figma primitives. No artist layout or private I/O. */
async function createArtistUI(figma, input) {
  if (!input || input.schemaVersion !== 1 || !input.group || !input.groupId || !/^[a-z][a-z0-9-]*$/.test(input.slug || '')) throw Error('Expected public artist schema v1.');
  const page = await figma.getNodeByIdAsync(input.pageId), board = await figma.getNodeByIdAsync(input.boardId);
  if (page?.type !== 'PAGE' || !board || board.parent?.id !== page.id || !('children' in board)) throw Error('Artist page/board mismatch.');
  await figma.setCurrentPageAsync(page);
  const prefix = input.group + ' / ', rootPrefix = input.group + ' · ', created = new Set(), mutated = new Set(), removed = new Set(), variablesChanged = new Set(), touched = new Map();
  const routeOf = n => { const p = n.name.startsWith(rootPrefix) ? rootPrefix : n.name.startsWith(prefix) ? prefix : null; const route = p ? n.name.slice(p.length) : ''; return /^.+:\d+(?:\.\d+)?$/.test(route) ? route : null; };
  const children = n => 'children' in n ? n.children : [];
  const walk = (n, fn) => { if (fn(n) === false) return; for (const child of children(n)) walk(child, fn); };
  const add = n => { created.add(n.id); return n; };
  const tree = n => { walk(n, add); return n; };
  const change = n => { if (!created.has(n.id)) mutated.add(n.id); return n; };
  const own = n => { for (let p = n; p; p = p.parent) if (p.id === page.id) return n; throw Error('Refusing to modify another page.'); };
  const dim = n => { if (!Number.isFinite(n) || n <= 0) throw Error('Invalid dimensions.'); return n; };
  const set = (n, key, value) => { if (JSON.stringify(n[key]) !== JSON.stringify(value)) { n[key] = value; change(n); } };
  set(board,'x',-10000);
  const rgb = hex => { if (!/^#[0-9a-f]{6}$/i.test(hex || '')) throw Error('Palette requires #RRGGBB.'); return {r:parseInt(hex.slice(1,3),16)/255,g:parseInt(hex.slice(3,5),16)/255,b:parseInt(hex.slice(5,7),16)/255}; };
  const palette = input.palette || {}, colors = {}, fonts = input.fonts || {}, loaded = new Set(), fontChoices = {};
  for (const tone of ['paper','ink','accent','muted','line','white']) rgb(palette[tone]);
  for (const role of ['latin','sans','cjk']) if (typeof fonts[role] !== 'string' || !fonts[role]) throw Error('Missing font role: ' + role);
  const available = (await figma.listAvailableFontsAsync()).map(item => item.fontName);
  for (const [role, family] of Object.entries(fonts)) {
    if (typeof family !== 'string') throw Error('Font roles must be family names.');
    const choices = available.filter(font => font.family === family);
    if (!choices.length) throw Error('Unavailable font: ' + family);
    fontChoices[role] = choices;
    for (const font of choices) { const key = JSON.stringify(font); if (!loaded.has(key)) { await figma.loadFontAsync(font); loaded.add(key); } }
  }
  const font = (role, weight) => {
    const choices = fontChoices[role]; if (!choices) throw Error('Unknown font role: ' + role);
    const simple = value => String(value).toLowerCase().replace(/[ -]/g,'');
    return choices.find(f => simple(f.style) === simple(weight)) || choices.find(f => f.style === 'Regular') || choices[0];
  };
  if (!input.hashes || typeof input.hashes !== 'object') throw Error('Image hashes are required.');
  for (const [key, hash] of Object.entries(input.hashes)) if (!/^[a-f0-9]{40}$/i.test(hash) || !figma.getImageByHash(hash)) throw Error('Unanchored or missing image: ' + key);
  const collectionName = prefix + 'Mechanical UI Colors';
  let collection = (await figma.variables.getLocalVariableCollectionsAsync()).find(c => c.name === collectionName);
  if (!collection) { collection = figma.variables.createVariableCollection(collectionName); variablesChanged.add(collection.id); }
  const oldVariables = await figma.variables.getLocalVariablesAsync('COLOR');
  for (const [tone, value] of Object.entries(palette)) {
    if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(tone)) throw Error('Invalid palette key: ' + tone);
    const color = rgb(value), name = 'color/' + tone;
    let variable = oldVariables.find(v => v.variableCollectionId === collection.id && v.name === name);
    if (!variable) { variable = figma.variables.createVariable(name,collection,'COLOR'); variable.scopes = ['FRAME_FILL','SHAPE_FILL','TEXT_FILL','STROKE_COLOR']; }
    const old = variable.valuesByMode?.[collection.defaultModeId];
    if (!old || ['r','g','b'].some(k => !Number.isFinite(old[k]) || Math.abs(old[k] - color[k]) > 1e-6)) { variable.setValueForMode(collection.defaultModeId,color); variablesChanged.add(variable.id); }
    const syntax = 'var(--' + input.slug + '-' + tone + ')';
    if (variable.codeSyntax?.WEB !== syntax) { variable.setVariableCodeSyntax('WEB',syntax); variablesChanged.add(variable.id); }
    colors[tone] = variable;
  }
  const paint = tone => { if (!colors[tone]) throw Error('Unknown tone: ' + tone); return figma.variables.setBoundVariableForPaint({type:'SOLID',color:rgb(palette[tone])},'color',colors[tone]); };
  const U = {api:figma,input,page,board,paint,activeRoot:null,header:() => null,footer:() => null};
  U.track = (node, mode = 'created') => { own(node); return mode === 'created' ? tree(node) : change(node); };
  U.stack = (parent, name, w, options = {}) => {
    own(parent); dim(w); const dir = options.dir || 'VERTICAL', gap = options.gap ?? 0, pad = options.pad ?? 0;
    if (!['VERTICAL','HORIZONTAL'].includes(dir) || ![gap,pad].every(v => Number.isFinite(v) && v >= 0)) throw Error('Invalid auto layout.');
    const n = add(figma.createAutoLayout(dir)); parent.appendChild(n); n.name = name; n.resize(w,1);
    n.primaryAxisSizingMode = dir === 'VERTICAL' ? 'AUTO' : 'FIXED'; n.counterAxisSizingMode = dir === 'VERTICAL' ? 'FIXED' : 'AUTO';
    n.layoutSizingHorizontal = 'FIXED'; n.layoutSizingVertical = 'HUG';
    n.paddingTop = n.paddingBottom = n.paddingLeft = n.paddingRight = pad; n.itemSpacing = gap;
    n.fills = options.bg ? [paint(options.bg)] : []; n.clipsContent = false; return n;
  };
  U.text = (parent, value, w, size = 16, tone = 'ink', weight = 'Regular', role = 'cjk') => {
    own(parent); dim(w); dim(size); const str = String(value);
    if (/[\u2e80-\u9fff\uac00-\ud7af]/.test(str)) role = 'cjk';
    const n = add(figma.createText()); parent.appendChild(n); n.name = 'Text / ' + str.slice(0,48); n.fontName = font(role,weight);
    n.fontSize = U.activeRoot?.width < 700 ? Math.max(14,size) : size;
    n.lineHeight = {unit:'PERCENT',value:input.ui?.lineHeight?.[role] || (role === 'latin' ? 115 : 140)};
    n.characters = str; n.textAutoResize = 'HEIGHT'; n.resize(w,Math.max(1,n.height)); n.layoutSizingHorizontal = 'FIXED'; n.fills = [paint(tone)]; return n;
  };
  U.image = (parent, key, w, h, mode = 'FILL') => {
    own(parent); dim(w); dim(h); if (!input.hashes[key] || !['FILL','FIT','CROP','TILE'].includes(mode)) throw Error('Unknown image or scale: ' + key);
    const n = add(figma.createRectangle()); parent.appendChild(n); n.name = 'Image / ' + key; n.resize(w,h); n.fills = [{type:'IMAGE',imageHash:input.hashes[key],scaleMode:mode}]; return n;
  };
  U.svg = (parent, source, w, tone) => {
    own(parent); dim(w); const n = tree(figma.createNodeFromSvg(source)); parent.appendChild(n);
    if (tone) walk(n,child => { for (const prop of ['fills','strokes']) if (prop in child && Array.isArray(child[prop])) child[prop] = child.type === 'FRAME' ? [] : child[prop].map(p => p.type === 'SOLID' ? {...paint(tone),opacity:p.opacity ?? 1} : p); });
    if (!(n.width > 0 && n.height > 0)) throw Error('Invalid SVG dimensions.'); n.rescale(w/n.width); return n;
  };
  U.rule = (parent,w,tone = 'line') => { own(parent); dim(w); const n = add(figma.createRectangle()); parent.appendChild(n); n.name = 'Rule'; n.resize(w,1); n.fills = [paint(tone)]; return n; };
  U.space = (parent,h) => { own(parent); dim(h); const n = add(figma.createFrame()); parent.appendChild(n); n.name = 'Space'; n.resize(1,h); n.fills = []; n.layoutSizingVertical = 'FIXED'; return n; };
  U.bind = (n, action = {}) => {
    own(n); if ([action.route,action.url,action.back].filter(Boolean).length > 1) throw Error('Choose one action.');
    if (action.back) set(n,'name','Link BACK');
    else if (action.route) { if (!/^.+:\d+(?:\.\d+)?$/.test(action.route)) throw Error('Expected semantic:width route.'); set(n,'name','Link / ' + action.route); }
    else if (action.url) { if (!/^https?:\/\/[^\s]+$/i.test(action.url)) throw Error('Invalid public URL.'); set(n,'name','Link URL / ' + action.url); }
    return n;
  };
  U.root = async (route,w) => {
    dim(w); if (!route || !route.endsWith(':' + w)) throw Error('Root route/width mismatch.');
    const matches = page.children.filter(n => n.id !== board.id && routeOf(n) === route);
    if (matches.length > 1) throw Error('Duplicate route: ' + route); let n = matches[0];
    const mapped = input.routeRoots?.[route];
    if (mapped) { const old = await figma.getNodeByIdAsync(mapped); if (!old || old.parent?.id !== page.id || old.type !== 'FRAME' || old.id === board.id) throw Error('Mapped root outside artist page: ' + route); if (n && n.id !== old.id) throw Error('Conflicting mapped/existing root: ' + route); n = old; }
    if (n && n.type !== 'FRAME') throw Error('Route must be a frame.');
    if (!n) {
      const semantic = route.slice(0,route.lastIndexOf(':')), peers = page.children.filter(c => c.id !== board.id && c.type === 'FRAME' && routeOf(c));
      const sibling = peers.find(c => { const r = routeOf(c); return r.slice(0,r.lastIndexOf(':')) === semantic; });
      n = add(figma.createAutoLayout('VERTICAL')); page.appendChild(n); n.name = rootPrefix + route; n.x = w >= 700 ? 0 : w >= 390 ? 1600 : 2100;
      n.y = sibling ? sibling.y : Math.max(0,...peers.map(c => c.y+c.height+800));
    }
    const oldFonts = [];
    walk(n,c => { if (c.type === 'TEXT') for (const segment of c.getStyledTextSegments(['fontName'])) { const f = segment.fontName, key = JSON.stringify(f); if (!loaded.has(key) && available.some(a => a.family === f.family && a.style === f.style)) { oldFonts.push(f); loaded.add(key); } } });
    for (const f of oldFonts) await figma.loadFontAsync(f);
    for (const child of [...n.children]) { walk(child,c => removed.add(c.id)); child.remove(); }
    change(n); n.name = rootPrefix + route; n.visible = true; n.layoutMode = 'VERTICAL'; n.resize(w,1); n.primaryAxisSizingMode = 'AUTO'; n.counterAxisSizingMode = 'FIXED';
    n.paddingTop = n.paddingBottom = n.paddingLeft = n.paddingRight = 0; n.itemSpacing = 0; n.fills = [paint('paper')]; n.clipsContent = false;
    U.activeRoot = n; touched.set(route,n); return n;
  };
  const config = input.ui?.button || {}, masters = {}, minHeight = Math.max(48,config.minHeight || 48), padX = Math.max(8,config.paddingX || 8), padY = Math.max(0,config.paddingY || 0);
  for (const style of ['primary','secondary']) {
    const name = prefix + 'Mechanical / Button / ' + style; let master = board.findOne(n => n.type === 'COMPONENT' && n.name === name);
    const bg = config[style + 'Bg'] || (style === 'primary' ? 'accent' : 'paper'), fg = config[style + 'Fg'] || (style === 'primary' ? 'paper' : 'ink');
    if (!master) { master = add(figma.createComponent()); board.appendChild(master); master.name = name; master.layoutMode = 'HORIZONTAL'; master.resize(240,minHeight);
      master.primaryAxisSizingMode = master.counterAxisSizingMode = 'FIXED'; master.primaryAxisAlignItems = master.counterAxisAlignItems = 'CENTER'; master.itemSpacing = 0; master.clipsContent = false;
      const label = U.text(master,'操作',240-padX*2,14,fg,config.weight || 'Medium',config.fontRole || 'cjk'); label.name = 'Label'; label.textAlignHorizontal = 'CENTER'; label.layoutSizingHorizontal = 'FILL';
      if (!board.layoutMode || board.layoutMode === 'NONE') { master.x = 24; master.y = Math.max(0,...board.children.filter(c => c.id !== master.id).map(c => c.y+c.height))+24; }
    }
    for (const [key,value] of Object.entries({paddingLeft:padX,paddingRight:padX,paddingTop:padY,paddingBottom:padY,cornerRadius:Math.max(0,config.cornerRadius || 0),fills:[paint(bg)],strokes:style === 'secondary' ? [paint('line')] : [],strokeWeight:1,strokeAlign:'INSIDE'})) set(master,key,value);
    const label = master.findOne(n => n.type === 'TEXT' && n.name === 'Label'); set(label,'fills',[paint(fg)]); set(label,'fontName',font(config.fontRole || 'cjk',config.weight || 'Medium')); masters[style] = master;
  }
  U.button = (parent,label,w,options = {}) => {
    own(parent); dim(w); const master = masters[options.style || 'primary']; if (!master) throw Error('Unknown button style.');
    const n = tree(master.createInstance()); parent.appendChild(n); n.name = 'Button / ' + label; n.resize(Math.max(48,w),minHeight); n.layoutSizingHorizontal = n.layoutSizingVertical = 'FIXED';
    const text = n.findOne(c => c.type === 'TEXT' && c.name === 'Label'); text.characters = String(label); text.layoutSizingHorizontal = 'FILL'; text.textAutoResize = 'HEIGHT'; text.textTruncation = 'DISABLED'; text.maxLines = null;
    n.resize(n.width,Math.max(minHeight,Math.ceil(text.height)+padY*2)); U.bind(n,options); return n;
  };
  U.finish = async () => {
    const routes = new Map(), links = [];
    for (const root of page.children) if (root.id !== board.id && root.type === 'FRAME' && root.visible) {
      const route = routeOf(root); if (!route) continue;
      if (routes.has(route)) throw Error('Duplicate route: ' + route); routes.set(route,root);
      walk(root,n => { if (n.visible === false) return false; if (n.name === 'Link BACK' || n.name.startsWith('Link / ') || n.name.startsWith('Link URL / ')) links.push(n); });
    }
    let pendingLinks = 0, resolvedLinks = 0, selfRoutesSkipped = 0;
    const react = async (n,wanted) => {
      const old = n.reactions || [];
      const equal = old.length === wanted.length && wanted.every((r,i) => { const actual = old[i]; if (actual?.trigger?.type !== r.trigger?.type) return false;
        const a = actual.actions || (actual.action ? [actual.action] : []), b = r.actions || (r.action ? [r.action] : []);
        return a.length === b.length && b.every((v,j) => Object.keys(v).every(k => JSON.stringify(a[j]?.[k]) === JSON.stringify(v[k]))); });
      if (!equal) { await n.setReactionsAsync(wanted); change(n); }
    };
    for (const n of links) {
      let action;
      if (n.name === 'Link BACK') action = {type:'BACK'};
      else if (n.name.startsWith('Link URL / ')) action = {type:'URL',url:n.name.slice(11),openInNewTab:true};
      else {
        const target = routes.get(n.name.slice(7)); if (!target) { pendingLinks++; await react(n,[]); continue; }
        let owner = n; while (owner.parent && owner.parent.id !== page.id) owner = owner.parent;
        if (owner.id === target.id) { selfRoutesSkipped++; await react(n,[]); continue; }
        action = {type:'NODE',destinationId:target.id,navigation:'NAVIGATE',transition:null,resetScrollPosition:true};
      }
      await react(n,[{trigger:{type:'ON_CLICK'},actions:[action]}]); resolvedLinks++;
    }
    const result = {createdNodeIds:[...created].filter(id => !removed.has(id)).join(','),mutatedNodeIds:[...mutated].filter(id => !removed.has(id)).join(','),removedNodeIds:[...removed].join(','),changedVariableIds:[...variablesChanged].join(','),
      roots:Object.fromEntries([...touched].map(([route,n]) => [route,{id:n.id,width:n.width,height:n.height}])),pendingLinks,resolvedLinks,selfRoutesSkipped};
    const json = JSON.stringify(result); let bytes = 0; for (const c of json) { const n = c.codePointAt(0); bytes += n < 128 ? 1 : n < 2048 ? 2 : n < 65536 ? 3 : 4; }
    if (bytes > 20000) throw Error('Result is ' + bytes + ' bytes; split fewer routes/widths/states to retain all affected IDs below 20KB.');
    return result;
  };
  return U;
}
if (typeof module !== 'undefined' && module.exports) module.exports = {createArtistUI};
