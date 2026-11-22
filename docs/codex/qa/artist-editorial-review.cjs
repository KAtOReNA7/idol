// Run from apps/idol-site with an output path. Uses production components and a read-only catalog.
const fs = require('node:fs');
const path = require('node:path');
const {createRequire} = require('node:module');
const appRequire = createRequire(path.resolve(__dirname, '../../../apps/idol-site/package.json'));
const {parse} = appRequire('next/dist/compiled/node-html-parser');
const {registry, artistCatalog} = appRequire('./tests/fixtures/current-artist-pages.cjs');
const {routesFor} = require('./group-design-surfaces.cjs');
const candy = appRequire('./data/candyshop-native-design.json');

const phrases = [
  '从一首歌，再一次认识她们', '此处收录2024年六人阵容及当期影像', '作品库另有个人与小分队作品',
  '六个名字，一束光', '从青春里，听见她们', '从Hashtag#到TIPTOE，认识成员', '官网公开资料照·拍摄日期未注明',
  '官网列示四人及出道时期历史档案', '中文显示名不代表官方中文姓名', '官网列示成员，照片与基本信息来自日本官方资料页',
  '中文名为本站显示名', '核于2026-10-16', '影像日期（既有目录）',
];
const normalize = text => text.replace(/\s+/g, '').normalize('NFKC');

function check(html) {
  const doc = parse(html);
  const main = doc.querySelector('main') ?? doc;
  for (const el of main.querySelectorAll('script,style,template,[hidden],[aria-hidden="true"]')) el.remove();
  const closed = main.querySelectorAll('details:not([open])');
  const disclosure = normalize(closed.map(el => el.text).join(' '));
  for (const el of closed) el.remove();
  const visible = normalize(main.text);
  return {
    visible:phrases.filter(phrase => visible.includes(normalize(phrase))),
    disclosure:phrases.filter(phrase => disclosure.includes(normalize(phrase))),
  };
}

async function review() {
  const groups = [];
  let pages = 0;
  for (const group of registry) {
    const catalog = artistCatalog(group);
    const access = routesFor(group, catalog);
    const routes = {...access.routes};
    const members = catalog.members.filter(member => [...member.groupIds, ...member.formerGroupIds].includes(group.groupId));
    for (const member of members) {
      const route = group.slug === 'udtt' ? '#/udtt/member/' + member.id
        : ['ifeye','izna'].includes(group.slug) ? '#/person/' + member.id
        : 'section=members&member=' + member.id;
      routes[member.id] = route;
    }
    if (group.slug === 'candyshop') {
      for (const release of candy.releases) routes[release.title] = 'section=works&release=' + release.key;
      for (const work of candy.works) routes[work.key] = 'section=works&format=' + work.type.toLowerCase() + '&media=' + work.key;
    }
    const matches = [];
    for (const [screen,route] of Object.entries(routes)) {
      const result = check(await access.render(route));
      pages++;
      if (result.visible.length || result.disclosure.length) matches.push({screen,...result});
    }
    groups.push({slug:group.slug,pages:Object.keys(routes).length,matches});
  }
  const output = {scope:'Publicly rendered text, including closed disclosures separately',groupCount:groups.length,pages,phrases,groups};
  if (process.argv[2]) fs.writeFileSync(process.argv[2], JSON.stringify(output,null,2)+'\n');
  console.log(JSON.stringify({groups:groups.length,pages,groupsWithMatches:groups.filter(group=>group.matches.length).map(group=>group.slug)}));
}
review().catch(error=>{console.error(error);process.exitCode=1;});
