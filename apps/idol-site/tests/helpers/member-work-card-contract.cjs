const assert = require('node:assert/strict');
const {parse} = require('next/dist/compiled/node-html-parser');

function scoreRows(page) {
  const summary = page.querySelector('[data-member-module="scores"]');
  assert.ok(summary, 'member rating summary');
  return summary.querySelectorAll('strong').map(value => {
    const row = value.parentNode;
    return [row.querySelector('small').text, value.text, row.querySelector('span').text];
  });
}

function assertMemberWorkCard(setup, fixture, slug, missingLabel) {
  const data = fixture();
  data.mode = 'live';
  const [member] = data.members;
  const [rating] = data.ratings;
  const work = data.works.find(item => item.id === rating.workIds[0]);
  const origin = 'https://site.test';
  const memberPath = `/artists/${slug}?section=members&member=${member.id}`;
  const photo = {table:'ratings', recordId:rating.id, fieldId:'photos', index:3, sourceKind:'mv_look_photo'};
  const otherId = 'recDifferentRating';
  data.ratings.push({...rating, id:otherId, memberIds:['recDifferentMember'], score:10, stylingScore:10,
    photo:{...photo, recordId:otherId}, personalPhotoEligible:true});

  function render() {
    const before = JSON.stringify(data);
    const page = parse(setup(memberPath, data).render());
    assert.equal(JSON.stringify(data), before);
    const identity = page.querySelector(`[data-member-id="${member.id}"]`);
    assert.ok(identity?.querySelector('img[src]'), 'a separate profile portrait is available');
    const links = page.querySelectorAll('[data-member-module="works"] [data-member-work-trigger]');
    assert.deepEqual(links.map(link => link.getAttribute('data-member-work-trigger')), [work.id]);
    const url = new URL(links[0].getAttribute('href'), origin);
    assert.equal(url.origin + url.pathname, origin + '/');
    assert.equal(url.searchParams.get('view'), 'works');
    assert.equal(url.searchParams.get('work'), work.id);
    assert.equal(url.searchParams.get('returnTo'), memberPath);
    return {page, row:links[0].closest('article')};
  }

  function noWorkImage(row) {
    assert.deepEqual(row.querySelectorAll('img[src],svg image,button[aria-haspopup="dialog"]'), []);
    if (missingLabel) assert.ok(row.text.includes(missingLabel));
  }

  const initial = render();
  noWorkImage(initial.row);
  assert.match(initial.row.text, /表现\s*0\.0/);
  assert.match(initial.row.text, /造型\s*8\.0/);
  assert.deepEqual(scoreRows(initial.page), [
    ['作品综合分', '4.0', '1 支作品已评'], ['表现均分', '0.0', '1 支已评'], ['造型均分', '8.0', '1 支已评'],
  ]);
  const account = member.social[0];
  const social = initial.page.querySelectorAll('[data-member-module="basic"] a[href]')
    .find(link => link.getAttribute('href') === account.url);
  assert.ok(social, 'the member’s observed account is linked from their profile');
  assert.ok(social.text.includes('10万 粉丝') && social.text.includes(account.observedAt));
  assert.equal(account.countLabel, '10.2万');

  rating.personalPhotoEligible = true;
  rating.photo = photo;
  const matched = render().row;
  const images = matched.querySelectorAll('img[src]');
  assert.deepEqual(images.map(img => img.getAttribute('src')), [`/api/media?table=ratings&record=${rating.id}&index=3`]);
  const open = images[0].closest('button[aria-haspopup="dialog"]');
  assert.ok(open && !open.hasAttribute('disabled'));
  assert.ok(open.getAttribute('aria-label').includes(member.stageName));

  rating.photo = {...photo, recordId:otherId};
  rating.stylingScore = null;
  const mismatched = render();
  noWorkImage(mismatched.row);
  assert.deepEqual(scoreRows(mismatched.page), [
    ['作品综合分', '待评', '1 支作品已评'], ['表现均分', '0.0', '1 支已评'], ['造型均分', '待评', '0 支已评'],
  ]);
  assert.ok(mismatched.page.text.includes('表现和造型都有评分后'));
  return initial.page;
}

module.exports = {assertMemberWorkCard};
