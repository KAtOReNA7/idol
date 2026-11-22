const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

// Runs only inside the expected video frame in a disposable Codex tab.
function installProbe(duration) {
  function eachMedia(visit) {
    const roots = [document];
    for (const root of roots) {
      for (const media of root.querySelectorAll('video,audio')) visit(media);
      for (const el of root.querySelectorAll('*')) if (el.shadowRoot) roots.push(el.shadowRoot);
    }
  }
  function silence(media) {
    if (!media.muted) media.muted = true;
    if (media.volume !== 0) media.volume = 0;
  }
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function (...args) {
    silence(this);
    return play.apply(this, args);
  };
  for (const type of ['loadstart', 'volumechange', 'playing', 'play']) {
    document.addEventListener(type, event => {
      if (event.target instanceof HTMLMediaElement) silence(event.target);
    }, true);
  }
  let timer, deadline;
  const probe = {
    samples: [], done: false,
    stop() {
      clearInterval(timer);
      clearTimeout(deadline);
      eachMedia(media => {silence(media); media.pause();});
      this.done = true;
    },
    media() {
      const rows = [];
      eachMedia(media => rows.push({time:media.currentTime,w:media.videoWidth,h:media.videoHeight,
        duration:Number.isFinite(media.duration)?media.duration:null,muted:media.muted,
        paused:media.paused,ready:media.readyState,seeking:media.seeking,error:media.error?.code || null}));
      return rows;
    },
    start({width, timeout}) {
      this.samples = [];
      this.done = false;
      timer = setInterval(() => eachMedia(media => {
        silence(media);
        if (this.done || media.paused || media.seeking || media.readyState < 2 || !(media.currentTime > 0)
            || !(media.videoWidth >= width) || !(Math.abs(media.duration - duration) < 0.6)) return;
        if (this.samples.length && media.currentTime <= this.samples[0].time) return;
        this.samples.push({time:media.currentTime,w:media.videoWidth,h:media.videoHeight,
          duration:media.duration,muted:media.muted,paused:media.paused,ready:media.readyState});
        if (this.samples.length === 2) this.stop();
      }), 75);
      deadline = setTimeout(() => this.stop(), timeout);
    },
  };
  probe.beforeMute=probe.media();
  eachMedia(silence);
  window.idolTemporaryPlaybackProbe = probe;
  return true;
}

function onWork(actual, page) {
  const location = new URL(actual);
  return location.origin === page.origin && location.pathname === page.pathname
    && location.searchParams.get('view') === 'works'
    && location.searchParams.get('work') === page.searchParams.get('work')
    && (location.searchParams.get('video') || 'mv') === 'mv';
}

export async function checkOkVideo(tab, work, site, timeoutMs) {
  const page = new URL('/?view=works&work='+work.id+'&video=mv', site);
  const address = work.origin + work.path + '?autoplay=1&silent=1';
  const row = {id:work.id,title:work.title,origin:work.origin,status:'unverified',frames:0,
    defaultSamples:[],samples:[],qualityChoice:null,samePage:false,kbps:null};
  if (new URL(await tab.url()).origin !== page.origin) await tab.goto(new URL('/favicon.svg', page).href);
  const cdp = await tab.capabilities.get('cdp');
  const methods = ['Target.attachedToTarget'];
  let cursor = (await cdp.readEvents({methods,timeoutMs:0})).cursor;
  try {
    await tab.goto(page.href);
    const selector = '.detail:not(.stage-view) .video-stage iframe';
    const player = tab.playwright.locator(selector);
    const activate=tab.playwright.getByRole('button',{name:'播放视频（OK Video）',exact:true});
    await activate.waitFor({state:'visible',timeoutMs:15000});
    const heading=await activate.evaluate(el=>el.closest('.detail')?.querySelector('.music-work-title h1')?.textContent.trim());
    row.framesBefore=await player.count();
    if (row.framesBefore!==0 || heading!==work.title || !onWork(await tab.url(),page))
      throw Error('Unexpected player before the user action');
    await activate.click({timeoutMs:5000});
    await player.waitFor({state:'visible',timeoutMs:15000});
    const details = await player.evaluate(el => ({src:el.src,allow:el.allow,
      heading:el.closest('.detail')?.querySelector('.music-work-title h1')?.textContent.trim()}));
    row.frames = await player.count();
    if (row.frames !== 1 || details.src !== address || details.heading !== work.title
        || !/\bautoplay\s+'none'/.test(details.allow)) throw Error('Unexpected player or work');
    let target;
    const until = Date.now() + 6000;
    while (!target && Date.now() < until) {
      const update = await cdp.readEvents({methods,afterSequence:cursor,timeoutMs:250});
      cursor = update.cursor;
      target = update.events.map(e => e.params?.targetInfo).find(t => t?.type === 'iframe' && t.url === address);
    }
    if (!target) throw Error('Player measurement context unavailable');
    async function run(fn, arg) {
      const expression = 'location.href === ' + JSON.stringify(address) + ' && (' + fn.toString() + ')(' + JSON.stringify(arg) + ')';
      const result = await cdp.send('Runtime.evaluate',{expression,returnByValue:true},{target:{targetId:target.targetId},timeoutMs:1500});
      return result.result?.value;
    }
    const {duration=163.49,width=3840,height=1770,quality="2160p"}=work;
    if (!await run(installProbe, duration)) throw Error('Could not silence test frame');
    const frame = tab.playwright.frameLocator(selector);
    const click = {timeoutMs:5000};
    async function measure(width, activate) {
      await run(options => window.idolTemporaryPlaybackProbe.start(options), {width,timeout:timeoutMs});
      try {
        if (activate) await activate();
        const until = Date.now() + timeoutMs;
        while (Date.now() < until) {
          if (await run(() => window.idolTemporaryPlaybackProbe.done)) break;
          await wait(150);
        }
        return await run(() => window.idolTemporaryPlaybackProbe.samples);
      } finally {await run(() => window.idolTemporaryPlaybackProbe.stop());}
    }
    const resume=frame.getByRole('button',{name:/^(Смотреть|Воспроизвести|Play|播放)$/i});
    row.beforeTestMute=await run(() => window.idolTemporaryPlaybackProbe.beforeMute);
    row.defaultSamples=await measure(1);
    row.firstClickPlayed=row.defaultSamples.length===2;
    if (!row.firstClickPlayed) {
      row.lastMedia=await run(() => window.idolTemporaryPlaybackProbe.media());
      row.status='no-confirmed-first-click-progress';return row;
    }
    if (!work.verifyQualityMenu && row.defaultSamples.every(s => s.w === width && s.h === height)) {
      row.qualityChoice='current setting';
      row.samples=row.defaultSamples;
    } else {
      await frame.getByRole('button',{name:/^(Настройки|Settings|设置)$/i}).click(click);
      await frame.getByRole('menuitem',{name:/^(Качество:|Quality:|画质|清晰度)/i}).click(click);
      const other=frame.getByRole('menuitem',{name:/^(Другое|Other|Advanced|其他|高级)$/i});
      if (await other.isVisible()) await other.click(click);
      const highest=frame.getByRole('menuitem',{name:quality,exact:true});
      row.qualityChoice=quality;
      row.samples=await measure(width,async () => {
        await highest.click(click);
        if (await resume.isVisible()) await resume.click(click);
      });
    }
    row.samePage=onWork(await tab.url(), page) && (await player.count())===1;
    row.status=row.samples.length===2 && row.samples.every(s=>s.w===width && s.h===height) && row.samePage?'playing':'highest-quality-unverified';
  } catch(error) {
    row.error=String(error.message).split('\n')[0].slice(0,140);
  } finally {
    try {await tab.goto('about:blank');} catch {await tab.close();}
  }
  return row;
}
