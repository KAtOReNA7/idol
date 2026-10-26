const test=require('node:test'),assert=require('node:assert/strict');
const {harness}=require('./helpers/sol-review-hooks.cjs');
for(const slug of ['rescene','purplekiss']){
 test(`${slug}: filter typing replaces history without stealing focus or scroll`,()=>{
  const h=harness(slug,{initial:`/design-review/${slug}-v1?section=works&format=mv`});h.render();const focused=h.document.activeElement;
  for(const q of ['L','LO','LOV']){h.props.onFilter({section:'works',format:'mv',q,sort:'oldest'});h.render();assert.equal(h.document.activeElement,focused);assert.equal(h.scrolls.length,0);assert.equal(h.stack.length,1);assert.equal(h.props.route.query,q);assert.equal(h.props.route.sort,'oldest');}
  h.unmount();assert.equal(h.listenerCount,0);
 });
 test(`${slug}: repeated modal open, close, browser back/forward and sibling changes clean up`,()=>{
  const h=harness(slug,{initial:`/design-review/${slug}-v1?section=works&format=mv`});h.render();const mv=h.props.data.works.find(w=>w.kind==='mv');const href=h.model.solReviewHref(slug,h.model.solWorkFields(mv));
  for(let i=0;i<4;i++){h.ui.navigate(href,href);h.render();assert.equal(h.dialogs.get('detail-dialog').open,true);assert.equal(h.document.body.style.overflow,'hidden');h.props.onReturn();h.render();assert.equal(h.dialogs.get('detail-dialog').open,false);assert.equal(h.props.route.format,'mv');assert.equal(h.document.body.style.overflow,'');}
  h.history.forward();h.render();assert.equal(h.dialogs.get('detail-dialog').open,true);h.history.back();h.render();assert.equal(h.dialogs.get('detail-dialog').open,false);
  h.unmount();assert.equal(h.listenerCount,0);assert.equal(h.document.body.style.overflow,'');
 });
 test(`${slug}: zoom owns its dialog, topmost recovery region and cleanup`,()=>{
  const h=harness(slug);h.render();h.ui.zoom({src:h.props.data.hero,label:'Group'});h.render();assert.equal(h.dialogs.get('sol-image-dialog').open,true);assert.equal(h.dialogs.get('detail-dialog').open,false);assert.equal(h.walk(h.tree).filter(n=>n.type==='image-controls').length,1);
  const dialog=h.walk(h.tree).find(n=>n.type==='dialog'&&n.props.className==='sol-image-dialog');dialog.props.onCancel({preventDefault(){}});h.render();assert.equal(h.dialogs.get('sol-image-dialog').open,false);assert.equal(h.document.body.style.overflow,'');h.unmount();assert.equal(h.listenerCount,0);
 });
 test(`${slug}: live dirty/save/modal checks block real actions and stale callbacks`,()=>{
  const h=harness(slug,{initial:`/design-review/${slug}-v1?section=works&format=mv`});h.render();const original=h.props,work=original.data.works.find(w=>w.kind==='mv');
  h.document.pending=true;original.onMediaAction(work,'records');assert.equal(h.assigns.length,0);h.document.pending=false;h.document.dirty=true;h.window.confirm=()=>false;original.onMediaAction(work,'records');assert.equal(h.assigns.length,0);h.document.dirty=false;h.document.foreign=true;original.onMemberAction(original.data.members[0]);assert.equal(h.assigns.length,0);h.document.foreign=false;original.onMediaAction(work,'records');assert.equal(h.assigns.length,1);assert.ok(h.assigns[0].includes(work.workId));
  h.ui.navigate(h.model.solReviewHref(slug,{section:'members'}));h.render();original.onMediaAction(work,'records');assert.equal(h.assigns.length,1);h.unmount();
 });
 test(`${slug}: direct detail cancel derives the correct visible list and only one pending back`,()=>{
  const first=harness(slug);first.render();const work=first.props.data.works.find(w=>w.kind==='mv');first.unmount();
  const initial=first.model.solReviewHref(slug,first.model.solWorkFields(work));const h=harness(slug,{initial});h.render();assert.equal(h.dialogs.get('detail-dialog').open,true);h.props.onReturn();h.render();assert.equal(h.position,0);assert.equal(h.stack.length,1);assert.equal(h.props.route.format,'mv');assert.equal(h.props.route.media,null);assert.equal(h.dialogs.get('detail-dialog').open,false);h.unmount();
 });
}
