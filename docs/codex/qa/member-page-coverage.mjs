import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const moduleOrder = new Map(Object.entries({
  identity: 0, basic: 1, scores: 2, works: 2, records: 2, public: 3, career: 4, personal: 5, sources: 5,
}));

// The three hash routers use their own member keys and URL contracts.
export function memberPageInventory() {
  // Generate the inventory from the formal app directory where its SSR fixture resolves routes.
  const {registry, artistCatalog, nativeSlugs} = require('../../../apps/idol-site/tests/fixtures/current-artist-pages.cjs');
  return registry.filter(group => !nativeSlugs.has(group.slug)).flatMap(group => {
    const {members} = artistCatalog(group);
    return members.filter(m => m.groupIds.includes(group.groupId) || m.formerGroupIds?.includes(group.groupId))
      .map(m => ({slug: group.slug, member: m.id, path: group.path + '?section=members&member=' + encodeURIComponent(m.id)}));
  });
}

export async function checkMemberPages(tab, origin, routes, timeoutMs = 6500) {
  const rows = [];
  for (const item of routes) {
    try {
      await tab.goto(new URL(item.path, origin).href);
      const identity = tab.playwright.locator('[data-member-layout="ordered-v1"]');
      await identity.first().waitFor({state:'visible', timeoutMs});
      const page = await tab.playwright.evaluate(() => {
        const m = document.querySelector('[data-member-layout="ordered-v1"]');
        const art = m.querySelector('img');
        return {id: m.getAttribute('data-member-id') ?? m.closest('[data-member-id]')?.getAttribute('data-member-id'),
          image: art?.naturalWidth ?? null, modules: [...document.querySelectorAll('[data-member-module]')].map(n => n.dataset.memberModule),
          width: document.documentElement.clientWidth, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth};
      });
      const ranks = page.modules.map(n => moduleOrder.get(n));
      const ordered = page.modules.includes('identity') && ranks.every((v,i) => v !== undefined && (i === 0 || ranks[i-1] <= v));
      rows.push({...item, ...page, ordered, pass: ordered && page.id === item.member && page.overflow === 0});
    } catch (error) {
      rows.push({...item, pass:false, error:String(error.message ?? error).split('\n')[0].slice(0,130)});
    }
  }
  return rows;
}

export async function checkNativeMemberPages(tab, origin, slug) {
  const counts = {ifeye: 6, izna: 7, udtt: 5};
  if (!Object.hasOwn(counts, slug)) throw Error('Unknown native member directory');
  const path = '/artists/' + slug + (slug === 'udtt' ? '#/udtt/members' : '?section=members');
  const listUrl = new URL(path, origin).href;
  const links = tab.playwright.locator(slug === 'udtt' ? 'a[href^="#/udtt/member/"]' : 'a[href*="section=members&member="]');
  const ready = {state:'visible', timeoutMs:30000};
  await tab.goto(listUrl);
  await links.first().waitFor(ready);
  const cards = await links.evaluateAll(nodes => nodes.map(a => ({
    href: a.getAttribute('href'), name: (a.querySelector('h3,h2,strong')?.textContent || '').trim(),
  })));
  const rows = [];
  for (const card of cards) {
    const link = tab.playwright.locator('a[href=' + JSON.stringify(card.href) + ']').first();
    await link.click();
    const heading = tab.playwright.getByRole('heading', {name:card.name, exact:true}).and(tab.playwright.locator('h1'));
    await heading.waitFor(ready);
    const actual = await tab.url();
    const geometry = await heading.evaluate(el => ({
      width: el.ownerDocument.documentElement.clientWidth,
      overflow: el.ownerDocument.documentElement.scrollWidth - el.ownerDocument.documentElement.clientWidth,
    }));
    await tab.back();
    await link.waitFor(ready);
    rows.push({...card, ...geometry, matched: actual === new URL(card.href, listUrl).href, returned: await tab.url() === listUrl});
  }
  return {slug, expected:counts[slug], rows, pass:rows.length === counts[slug] && rows.every(r => r.matched && r.returned && r.overflow === 0)};
}
