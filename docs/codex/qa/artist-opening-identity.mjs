import {createRequire} from 'node:module';
const groups=createRequire(import.meta.url)('../../../apps/idol-site/data/artist-timeline-registry.json');

function readOpening(slug) {
  const host=document.querySelector('[data-'+slug+'-native-host]');
  const shadow=host&&[host,...host.querySelectorAll('*')].find(node=>node.shadowRoot)?.shadowRoot;
  const scope=shadow||document;
  const width=document.documentElement.clientWidth, height=innerHeight;
  const area=node=>{const r=node.getBoundingClientRect();return Math.max(0,Math.min(width,r.right)-Math.max(0,r.left))*Math.max(0,Math.min(height,r.bottom)-Math.max(0,r.top));};
  const visible=[...scope.querySelectorAll('img')].filter(img=>area(img)>0);
  const photograph=visible.sort((a,b)=>area(b)-area(a))[0];
  const heading=scope.querySelector('h1')||scope.querySelector('h2');
  const navigation=scope.querySelector('header');
  const footer=scope.querySelector('footer');
  const identity=root=>root?[...root.querySelectorAll('img,svg')].slice(0,4).map(node=>({name:node.getAttribute('alt')||node.getAttribute('aria-label')||'',path:node.getAttribute('src')||node.tagName})):[];
  return {slug,width,height,overflow:document.documentElement.scrollWidth-width,
    heading:(heading?.textContent.trim()||heading?.getAttribute('aria-label')||heading?.querySelector('img')?.alt||'').slice(0,92),headingFont:heading?getComputedStyle(heading).fontFamily:null,
    headerImages:identity(navigation),footerImages:identity(footer),
    topImage:photograph?{path:photograph.currentSrc||photograph.getAttribute('src'),alt:photograph.alt,natural:[photograph.naturalWidth,photograph.naturalHeight],visibleArea:Math.round(area(photograph))}:null,
    introduction:!!scope.querySelector('[data-home-introduction]')||!!document.querySelector('[data-home-introduction]')};
}

// Geometry and image identities are observations. A visual judgement still needs the actual page and official reference.
export async function inspectArtistOpenings(tab,{origin,slugs=groups.map(group=>group.slug),timeoutMs=15000}){
  const rows=[];
  for(const slug of slugs){
    const group=groups.find(g=>g.slug===slug);
    if(!group)throw Error('Unknown artist '+slug);
    try {
      await tab.goto(new URL(group.path,origin).href);
      await tab.playwright.locator('[data-home-introduction="'+slug+'"]').first().waitFor({state:'visible',timeoutMs});
      const deadline=Date.now()+timeoutMs;
      let row=await tab.playwright.evaluate(readOpening,slug);
      while(row.topImage&&!row.topImage.natural[0]&&Date.now()<deadline){
        await new Promise(resolve=>setTimeout(resolve,125));
        row=await tab.playwright.evaluate(readOpening,slug);
      }
      rows.push(row);
    }catch(error){rows.push({slug,error:String(error.message??error).slice(0,240)});}
  }
  return rows;
}
