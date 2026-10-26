/** Presentation only: never changes image bytes, queue state, lease, or retry policy. */
export function imageRecoveryNeeded(report, visibleIds) {
  if (!report || !Array.isArray(report.entries)) return false;
  const visible = report.entries.filter(row => visibleIds.has(row.assetId));
  return visible.some(row => row.status === 'failed') || report.stopped === true && visible.some(row => !['loaded','failed'].includes(row.status));
}
export function reloadVerifiedPage({mountedUrl,currentUrl,isValidUrl,mayLeave,remember,reload}) {
  if (!mountedUrl || mountedUrl !== currentUrl || !isValidUrl(currentUrl) || !mayLeave()) return false;
  remember();
  // No destination is constructed: the browser preserves the current URL/query/hash.
  reload();
  return true;
}
export function createImageRecovery({document,root,onReload}) {
  const element=document.createElement('aside');
  element.setAttribute('data-udtt-image-recovery','true');
  element.setAttribute('style','position:sticky;top:0;z-index:5;padding:12px 20px;background:#fff2d5;color:#162c32;border-bottom:1px solid #c6b890;font:14px/1.6 UdttNotoSansSC,Arial,sans-serif');
  const message=document.createElement('p');message.setAttribute('role','status');message.setAttribute('aria-live','polite');message.setAttribute('style','margin:0 0 6px');
  const button=document.createElement('button');button.type='button';button.textContent='重新载入本页';button.setAttribute('style','padding:6px 12px;font:inherit;color:inherit;cursor:pointer');
  element.append(message,button);element.hidden=true;button.disabled=true;
  let dead=false;
  const clicked=()=>{if(!dead&&!element.hidden&&!button.disabled)onReload();};
  button.addEventListener('click',clicked);
  return {element,
    update(report){
      if(dead)return;
      const ids=new Set([...root.querySelectorAll('img[data-private-asset-id]')].map(img=>img.getAttribute('data-private-asset-id')));
      const show=imageRecoveryNeeded(report,ids);
      element.hidden=!show;button.disabled=!show;
      message.textContent=show?'当前页面有图片未能加载，未使用其他图片替代。可手动重新载入本页。':'';
    },
    destroy(){if(dead)return;dead=true;button.removeEventListener('click',clicked);element.remove();}
  };
}
