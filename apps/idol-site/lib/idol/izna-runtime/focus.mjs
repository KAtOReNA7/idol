/** Document.activeElement is retargeted to the host across a shadow boundary. */
export function deepActiveElement(document) {
  let node=document.activeElement;
  const seen=new Set();
  while(node?.shadowRoot?.activeElement&&!seen.has(node)) {
    seen.add(node);node=node.shadowRoot.activeElement;
  }
  return node;
}

export function focusKey(root) {
  const node=deepActiveElement(root.ownerDocument);
  if(!root.contains(node))return null;
  if(node.matches('a[href]'))return {kind:'href',value:node.getAttribute('href')};
  if(node.matches('input[name]'))return {kind:'input',value:node.name};
  return null;
}

export function restoreFocus(root,key) {
  let target=null;
  if(key?.kind==='href')target=[...root.querySelectorAll('a[href]')].find(n=>n.getAttribute('href')===key.value);
  if(key?.kind==='input')target=[...root.querySelectorAll('input[name]')].find(n=>n.name===key.value);
  if(key?.kind==='event')target=[...root.querySelectorAll('[data-event-key]')].find(n=>n.dataset.eventKey===key.value);
  if(!target||target.disabled||target.closest('[hidden],[inert],[aria-hidden="true"]'))target=root.querySelector('main');
  target?.focus({preventScroll:true});
}
