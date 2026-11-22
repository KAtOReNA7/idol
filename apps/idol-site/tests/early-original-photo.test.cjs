const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const load = require('./helpers/public-artist-loader.cjs');
const {EarlyOriginalPhotoDialog} = load('components/early-original-photo-dialog.tsx');
const {OriginalPhotoLink} = load('components/original-photo-link.tsx');

test('an unhydrated artist photo opens inside the page, retries and returns focus on close', () => {
  const html = renderToStaticMarkup(React.createElement(EarlyOriginalPhotoDialog));
  const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script);
  const controls = {};
  for (const name of ['scope','dialog','img','figcaption','[role="status"]','[data-close]','retry']) {
    const listeners = new Map();
    controls[name] = {
      addEventListener(type, callback) { listeners.set(type, callback); },
      fire(type, event = {}) { listeners.get(type)?.(event); },
    };
  }
  let focus;
  const {dialog,scope,img} = controls, close=controls['[data-close]'], error=controls['[role="status"]'];
  Object.assign(dialog, {
    isConnected:true, dataset:{}, open:false, classList:{add(){},remove(){}},
    closest:() => scope, querySelector:selector => controls[selector],
    showModal() { this.open=true; },
    close() { this.open=false; this.fire('close'); },
  });
  error.querySelector = () => controls.retry;
  close.focus = () => { focus=close; };
  img.removeAttribute = () => { delete img.src; };
  const link = {dispatchEvent:()=>true,isConnected:true,href:'/artist/newjeans/debut/five-original.jpg',
    querySelector:() => ({alt:'五人团照'}),focus() { focus=this; }};
  const target = {closest:() => link};
  const click = (type,extra={}) => {
    const event = {type,target,button:0,preventDefault() { this.defaultPrevented=true; },...extra};
    scope.fire(type,event);
    return event;
  };
  vm.runInNewContext(script,{window:{},Event,document:{getElementById:() => dialog,addEventListener:scope.addEventListener.bind(scope)}});
  assert.equal(click('click',{ctrlKey:true}).defaultPrevented,undefined);
  assert.equal(click('keydown',{key:'Tab'}).defaultPrevented,undefined);
  assert.equal(dialog.open,false);
  for (const type of ['click','keydown']) {
    const event = click(type,{key:' '});
    assert.equal(event.defaultPrevented,true);
    assert.ok(dialog.open);
    assert.equal(focus,close);
    assert.equal(img.src,link.href);
    assert.equal(img.alt,'五人团照');
    assert.equal(controls.figcaption.textContent,'五人团照');
    img.fire('error');
    assert.equal(error.hidden,false);
    assert.equal(img.hidden,true);
    controls.retry.fire('click');
    assert.equal(error.hidden,true);
    assert.equal(img.hidden,false);
    close.fire('click');
    assert.equal(focus,link);
    assert.ok(!dialog.open);
  }
  const memberLink = {
    ...link, href:'/artist/bewave/member.original.jpg', querySelector:() => null,
    getAttribute:name => name === 'aria-label' ? '查看允瑟原图' : null,
  };
  click('click',{target:{closest:() => memberLink}});
  assert.equal(img.src, memberLink.href);
  assert.equal(img.alt, '查看允瑟原图');
  assert.equal(controls.figcaption.textContent, '查看允瑟原图');
  close.fire('click');
  assert.equal(focus, memberLink);
  assert.equal(click('click',{target:{closest:() => null}}).defaultPrevented,undefined);

  // Hydration attaches the existing artist's own lightbox to the same link.
  // The capture listener must let that lightbox own the first click, exactly once.
  const live = new EventTarget(), opened=[];
  live.focus = () => { focus=live; };
  const hydrated = OriginalPhotoLink({href:link.href,onOpen:src=>opened.push(src)});
  const disconnect = hydrated.props.ref(live);
  const liveTarget = {closest:()=>live};
  const activation=click('click',{target:liveTarget});
  assert.equal(activation.defaultPrevented,true);
  assert.deepEqual(opened,[link.href]);
  assert.equal(focus,live);
  assert.equal(dialog.open,false);
  hydrated.props.onClick(activation);
  assert.deepEqual(opened,[link.href]);
  disconnect();
  assert.equal(live.dispatchEvent(new Event('stage-original-photo-open',{cancelable:true})),true);
});
