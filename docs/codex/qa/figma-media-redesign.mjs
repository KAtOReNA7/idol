const screens = {
  genblue: {path: 'genblue?section=works', row: '.gb-video-row.has-preview', picture: 'img', title: 'h3', count: 2},
  unis: {path: 'unis', row: '.uf-film-grid > a', picture: 'img', title: 'h3', count: 3},
  vvup: {path: 'vvup', row: '.vu-home .vu-video', picture: '.vu-video-preview img', title: 'h3', count: 2},
  youngposse: {path: 'youngposse', row: '.video-row[data-video-key]', picture: '.yp-video-art img', title: 'h3', count: 3},
  adya: {path: 'adya', row: '.idol-adya-poster', picture: '.idol-adya-group img', title: 'h1', count: 1},
  tracer: {path: 'tracer', row: 'main:has(.tr-group)', picture: '.tr-group img', title: '.tr-home-title', count: 1},
  ive: {path: 'ive', row: '.ive-artist-opening', picture: '.ive-official-portrait img', title: 'h1', count: 1},
};

export async function checkFigmaMedia(tab, origin, slugs = Object.keys(screens)) {
  const output = [];
  for (const slug of slugs) {
    const {path, row, picture, title, count} = screens[slug];
    const cards = [];
    try {
      await tab.goto(new URL('/artists/' + path, origin).href);
      for (let i = 0; i < count; i++) {
        const card = tab.playwright.locator(row).nth(i);
        await card.waitFor({state: 'visible', timeoutMs: 15000});
        const target = (await card.evaluate(el => el.matches('a'))) ? card : card.locator('a,button').first();
        await target.press('Tab', {timeoutMs: 10000});
        const measure = () => card.evaluate((el, {picture, title}) => {
          const photo = el.querySelector(picture), heading = el.querySelector(title);
          const box = n => {
            const r = n.getBoundingClientRect();
            return [r.left, r.top, r.width, r.height].map(Math.round);
          };
          return {title: heading?.textContent.trim(), artwork: photo?.getAttribute('src'),
            pixels: photo && [photo.naturalWidth, photo.naturalHeight], imageBox: photo && box(photo),
            textBox: heading && box(heading), width: document.documentElement.clientWidth,
            overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth};
        }, {picture, title});
        let result = await measure();
        const deadline = Date.now() + 6000;
        while ((!result.pixels?.[0] || !result.imageBox?.[2] || !result.textBox?.[2]) && Date.now() < deadline) {
          await new Promise(resolve => setTimeout(resolve, 150));
          result = await measure();
        }
        cards.push(result);
      }
      output.push({slug, cards, ok: cards.every(c => c.pixels?.[0] && c.imageBox?.[2] && c.textBox?.[2] && c.title && !c.overflow)});
    } catch (error) {
      output.push({slug, cards, ok: false, error: String(error.message ?? error).split('\n')[0].slice(0,160)});
    }
  }
  return output;
}
