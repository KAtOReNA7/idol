/* i-dle: independent dark-purple / warm-photography composition.
 * Public schema v1 only. No personal records or persistence. */
async function buildIdlePage(U, input, kind, width, entityId, state = 'unrated') {
  const mobile = width < 700, pad = mobile ? 16 : 48, iw = width - pad * 2;
  const gold = input.palette.gold ? 'gold' : 'accent';
  const members = input.members, listed = members.filter(m => m.profileListed), history = members.filter(m => !m.profileListed);
  const releases = input.releases, media = input.media;
  const native = input.nativeMediaIds || [media.find(m => m.id === 'recvxyOz5XuYef')?.id || media.find(m => m.kind === 'mv')?.id, media.find(m => m.kind === 'stage')?.id].filter(Boolean);
  const route = kind === 'score' ? 'score:' + entityId + ':' + state + ':' + width : kind + (entityId ? ':' + entityId : '') + ':' + width;
  const root = await U.root(route, width);
  const st = (p, name, w, gap = 0, bg, padding = 0, row = false) => U.stack(p, name, w, {dir:row?'HORIZONTAL':'VERTICAL',gap,pad:padding,...(bg?{bg}:{})});
  const tx = (p, text, w, size = 16, tone = 'ink', weight = 'Regular', role = 'cjk') => U.text(p,text,w,size,tone,weight,role);
  const bt = (p, label, w, target, style = 'secondary') => U.button(p,label,w,{route:target,style});
  const url = (p, label, w, target, style = 'secondary') => target ? U.button(p,label,w,{url:target,style}) : null;
  const rr = id => 'release:' + id + ':' + width, mr = id => 'member:' + id + ':' + width;
  const vr = id => 'media:' + id + ':' + width, sr = (id,s) => 'score:' + id + ':' + s + ':' + width;
  const date = item => {
    const d = String(item.date || '');
    return item.datePrecision === 'year' ? d.slice(0,4) : item.datePrecision === 'month' ? d.slice(0,7).replace('-','.') : d.replaceAll('-','.');
  };
  const dateKind = item => ({'release-date':'发行日','announcement-date':'公布日','video-publication-date':'视频公开日','broadcast-date':'播出日','performance-date':'演出日'}[item.dateType] || '日期');
  const zone = item => item.timeZone ? ' · '+({'Asia/Seoul':'韩国时间','Asia/Tokyo':'日本时间'}[item.timeZone] || item.timeZone) : '';
  const credit = item => Array.isArray(item.artistCredit) ? item.artistCredit.join(' / ') : item.artistCredit || '';
  const official = source => Array.isArray(source) ? source[0] : source;
  const logo = (p,w) => {
    const branding = input.branding || {};
    if (branding.logoKey) {
      const asset = input.assets.find(a => a.key === branding.logoKey);
      return U.image(p,branding.logoKey,w,asset?.width&&asset?.height?w*asset.height/asset.width:w*.44,'FIT');
    }
    if (branding.logoSvg) return U.svg(p,branding.logoSvg,w,'ink');
    return tx(p,'i-dle',w,32,'ink','Bold','latin');
  };
  function header(active, back, guarded = false, historyBack = false) {
    const h = st(root,'i-dle / masthead',width,16,undefined,pad);
    h.paddingTop = h.paddingBottom = mobile ? 16 : 22;
    const top = st(h,'Official mark and return',iw,16,undefined,0,true);
    const mark = logo(top,mobile?(back?176:208):256);
    U.bind(mark,{route:guarded?back:'home:'+width});
    if(back) {
      if(historyBack)U.button(top,'返回',mobile?76:104,{back:true,style:'secondary'});
      else bt(top,'返回',mobile?76:104,back);
    }
    if(!guarded) {
      const nav = st(h,'Main sections',iw,mobile?8:24,undefined,0,true);
      const entries = [['首页','home'],['成员','members'],['作品','library'],['时间轴','timeline']];
      const bw = (iw-(entries.length-1)*(mobile?8:24))/entries.length;
      for(const [label,key] of entries) {
        const col=st(nav,'Navigation '+key,bw,0);
        const b=bt(col,label,bw,key+':'+width);b.fills=[];b.strokes=[];
        const text=b.findOne?.(n=>n.type==='TEXT'&&n.name==='Label');
        if(text)text.fills=[U.paint(active===key?'accent':'ink')];
        if(active===key)U.rule(col,bw,'accent');
      }
    }
    U.rule(h,iw);return h;
  }
  function footer() {
    const f=st(root,'i-dle / closing credits',width,12,undefined,pad);
    f.paddingTop=32;f.paddingBottom=40;U.rule(f,iw);
    tx(f,'i-dle',iw,26,'ink','Bold','latin');
    url(f,'官方网站 ↗',Math.min(iw,184),input.branding?.sourceUrl || 'https://i-dle.cubeent.co.jp/');
  }
  function title(p,cn,en,w=iw) {
    const s=st(p,cn,w,12);tx(s,en,w,mobile?14:16,gold,'Medium','sans');
    tx(s,cn,w,mobile?32:48,'ink','Medium');U.rule(s,Math.min(w,mobile?56:96),'accent');return s;
  }
  function portrait(p,m,w) {
    if(m.profileListed)return U.image(p,m.imageKey,w,w,'FILL');
    const asset=input.assets.find(a=>a.key===m.imageKey);
    if(!asset?.width||!asset?.height)throw Error('Historical portrait dimensions are required.');
    // The supplied historical display derivative was verified at 437×656;
    // source width/height describe its uncropped original, not this display.
    const aw=asset.displayWidth || 437,ah=asset.displayHeight || 656;
    return U.image(p,m.imageKey,w,w*ah/aw,'FIT');
  }
  function profile(p,m,w,large=false) {
    const c=st(p,'Portrait '+m.id,w,12);
    const photo=portrait(c,m,w);U.bind(photo,{route:mr(m.id)});
    tx(c,m.cn,w,mobile?(large?24:19):large?34:26,'ink','Medium');
    tx(c,m.stageName,w,14,gold,'Medium','sans');
    bt(c,'个人档案',w,mr(m.id));return c;
  }
  function releaseCard(p,r,w) {
    const c=st(p,'Release '+r.id,w,12),art=U.image(c,r.imageKey,w,w,'FIT');U.bind(art,{route:rr(r.id)});
    tx(c,r.version || r.title,w,mobile?18:22,'ink','Medium','latin');
    tx(c,credit(r),w,14,'muted');
    tx(c,(date(r)?date(r)+' · ':'')+(r.type||'发行'),w,14,'muted');
    bt(c,'发行详情',w,rr(r.id));return c;
  }
  function releaseGrid(p,items,w,columns) {
    const gap=mobile?16:28,cw=(w-gap*(columns-1))/columns;
    for(let i=0;i<items.length;i+=columns){const row=st(p,'Release row '+i,w,gap,undefined,0,true);for(const r of items.slice(i,i+columns))releaseCard(row,r,cw);}
  }
  function mediaCard(p,m,w) {
    const c=st(p,'Media '+m.id,w,12),image=U.image(c,m.imageKey,w,w*9/16,'FILL');
    U.bind(image,native.includes(m.id)?{route:vr(m.id)}:{url:m.sourceUrl});
    tx(c,m.kind==='stage'?'舞台 / STAGE':'MV / MUSIC VIDEO',w,14,'accent','Medium','sans');
    tx(c,m.title,w,mobile?21:28,'ink','Medium','latin');
    if(m.date)tx(c,dateKind(m)+' · '+date(m),w,14,'muted');
    if(native.includes(m.id))bt(c,m.kind==='stage'?'舞台详情':'MV 详情',w,vr(m.id));
    else url(c,'官方视频 ↗',w,m.sourceUrl);
  }
  function releaseMetadata(p,r,w) {
    tx(p,credit(r),w,18,gold,'Medium');
    tx(p,r.title,w,mobile?32:52,'ink','Medium','latin');
    if(r.version)tx(p,r.version,w,18,'ink','Medium');
    tx(p,[r.type,r.region].filter(Boolean).join(' · '),w,16,'muted');
    if(r.date)tx(p,dateKind(r)+' · '+date(r),w,16,'ink');
    url(p,'发行来源 ↗',Math.min(w,220),r.sourceUrl);
  }

  if(kind==='home') {
    header('home');
    const hero=st(root,'Warm studio introduction',width,mobile?24:28,undefined,pad,!mobile);
    hero.paddingTop=mobile?12:28;hero.paddingBottom=mobile?32:48;
    const leftW=mobile?iw:Math.round((iw-28)*.32),rightW=mobile?iw:iw-leftW-28;
    const latest=releases.find(r=>r.artistScope==='group'&&/we made/i.test(r.title)) || releases.filter(r=>r.artistScope==='group').sort((a,b)=>b.date.localeCompare(a.date))[0];
    const left=st(hero,'Identity and latest group release',leftW,mobile?18:28);
    if(!mobile)logo(left,Math.min(224,leftW));
    tx(left,'艺人档案',leftW,16,'muted');
    if(latest){
      tx(left,latest.dateType==='announcement-date'?'团体发行预告':'最新团体发行',leftW,14,gold,'Medium');
      const sleeveW=mobile?Math.min(188,leftW):Math.min(304,leftW);
      const sleeve=U.image(left,latest.imageKey,sleeveW,sleeveW,'FIT');U.bind(sleeve,{route:rr(latest.id)});
      tx(left,latest.title,leftW,mobile?30:38,'ink','Medium','latin');
      bt(left,'查看发行',Math.min(leftW,220),rr(latest.id),'primary');
    }
    const photography=st(hero,'Studio group photograph',rightW,0);
    U.image(photography,'hero',rightW,rightW*2/3,'FIT');
    if(mobile)hero.insertChild(0,photography);
    const people=st(root,'Official profiles',width,mobile?24:36,undefined,pad);
    title(people,'成员','PROFILE');
    const cw=(iw-(mobile?16:32))/2;
    for(let i=0;i<listed.length;i+=2){const row=st(people,'Portrait pair '+i,iw,mobile?16:32,undefined,0,true);for(const m of listed.slice(i,i+2))profile(row,m,cw,!mobile);}
    bt(people,'全部成员档案',Math.min(iw,280),'members:'+width);
    const recordings=st(root,'Selected recordings',width,mobile?24:36,undefined,pad);
    title(recordings,'发行','RECORDINGS');
    releaseGrid(recordings,releases.filter(r=>r.artistScope==='group').slice(0,mobile?2:3),iw,mobile?2:3);
    bt(recordings,'浏览完整作品库',Math.min(iw,280),'library:'+width);
    const films=st(root,'Featured films',width,mobile?24:32,undefined,pad);
    title(films,'影像与舞台','FILM / LIVE');
    const featured=media.filter(m=>native.includes(m.id));
    for(const m of featured)mediaCard(films,m,iw);
    footer();return root;
  }

  if(kind==='members') {
    header('members');
    const main=st(root,'People catalogue',width,mobile?28:40,undefined,pad);
    title(main,'成员档案','PROFILE');
    const cols=mobile?2:3,gap=mobile?16:28,cw=(iw-gap*(cols-1))/cols;
    for(let i=0;i<listed.length;i+=cols){const row=st(main,'Official profile row '+i,iw,gap,undefined,0,true);for(const m of listed.slice(i,i+cols))profile(row,m,cw);}
    if(history.length){
      U.space(main,12);U.rule(main,iw,'accent');
      title(main,'历史档案','ARCHIVE');
      for(const m of history){
        const row=st(main,'Historical profile '+m.id,iw,mobile?20:40,undefined,0,!mobile);
        const pw=mobile?iw:Math.min(437,Math.round(iw*.35));
        const art=portrait(row,m,pw);U.bind(art,{route:mr(m.id)});
        const details=st(row,'Archived identity',mobile?iw:iw-pw-40,16);
        tx(details,m.cn,mobile?iw:iw-pw-40,mobile?30:42,'ink','Medium');
        tx(details,m.stageName,mobile?iw:iw-pw-40,18,gold,'Medium','sans');
        bt(details,'个人历史档案',Math.min(mobile?iw:iw-pw-40,240),mr(m.id));
      }
    }
    footer();return root;
  }

  if(kind==='member') {
    const m=members.find(x=>x.id===entityId);if(!m)throw Error('Unknown stable member ID.');
    header('members','members:'+width,false,true);
    const main=st(root,'Individual portrait',width,mobile?24:48,undefined,pad,!mobile);
    const pw=mobile?iw:m.profileListed?Math.round(iw*.53):Math.min(437,Math.round(iw*.53)),dw=mobile?iw:iw-pw-48;
    portrait(main,m,pw);
    const detail=st(main,'Member identity',dw,20);
    tx(detail,m.profileListed?'成员档案':'历史档案',dw,14,gold,'Medium');
    tx(detail,m.cn,dw,mobile?31:48,'ink','Medium');
    tx(detail,m.stageName,dw,mobile?24:36,'ink','Medium','latin');
    U.rule(detail,dw,'accent');
    url(detail,'公开人物资料 ↗',Math.min(dw,240),official(m.sourceUrls));
    bt(detail,'返回成员目录',Math.min(dw,240),'members:'+width);
    const solo=releases.filter(r=>r.artistScope==='solo'&&credit(r).toLowerCase().includes(m.stageName.toLowerCase()));
    if(solo.length){const s=st(root,'Individual releases',width,28,undefined,pad);title(s,'个人发行','SOLO RELEASES');releaseGrid(s,solo,iw,mobile?2:3);}
    const related=st(root,'Continue through people',width,20,undefined,pad);
    const index=listed.findIndex(x=>x.id===m.id),next=listed[(index+1+listed.length)%listed.length];
    if(next&&next.id!==m.id)bt(related,'下一位 · '+next.cn,iw,mr(next.id));
    footer();return root;
  }

  if(kind==='library') {
    header('library');const main=st(root,'Recording and film catalogue',width,mobile?32:48,undefined,pad);
    title(main,'作品库','DISCOGRAPHY / FILM');
    const isJapan=r=>/japan|japanese|日本|^jp$/i.test(r.region||'');
    const sections=[['团体发行','GROUP',releases.filter(r=>r.artistScope==='group'&&!isJapan(r))],
      ['日本发行','JAPAN',releases.filter(r=>r.artistScope==='group'&&isJapan(r))],
      ['个人发行','SOLO',releases.filter(r=>r.artistScope==='solo')],
      ['合作作品','COLLABORATION',releases.filter(r=>r.artistScope==='collaboration')]];
    for(const [cn,en,items] of sections)if(items.length){
      const s=st(main,'Scope '+en,iw,mobile?24:32);title(s,cn,en);
      if(en!=='JAPAN'){releaseGrid(s,items,iw,mobile?2:4);continue;}
      const separate=items.filter(r=>!r.releaseFamilyId);
      if(separate.length)releaseGrid(s,separate,iw,mobile?2:4);
      const families=[...new Set(items.map(r=>r.releaseFamilyId).filter(Boolean))];
      for(const family of families){const versions=items.filter(r=>r.releaseFamilyId===family),g=st(s,'Japanese editions '+family,iw,24);
        tx(g,versions[0].title,iw,mobile?26:34,'ink','Medium','latin');
        releaseGrid(g,versions,iw,mobile?2:3);
      }
    }
    for(const [cn,type]of [['MV','mv'],['舞台','stage']]){
      const items=media.filter(m=>m.kind===type);if(!items.length)continue;
      const s=st(main,'Films '+type,iw,mobile?24:32);title(s,cn,type==='mv'?'MUSIC VIDEO':'LIVE STAGE');
      const cols=mobile?1:2,gap=28,cw=(iw-gap*(cols-1))/cols;
      for(let i=0;i<items.length;i+=cols){const row=st(s,'Film pair '+i,iw,gap,undefined,0,true);for(const m of items.slice(i,i+cols))mediaCard(row,m,cw);}
    }
    footer();return root;
  }

  if(kind==='release') {
    const r=releases.find(x=>x.id===entityId);if(!r)throw Error('Unknown release ID.');
    header('library','library:'+width);
    const main=st(root,'Release sleeve and information',width,mobile?24:48,undefined,pad,!mobile);
    const aw=mobile?iw:Math.min(460,iw*.4),dw=mobile?iw:iw-aw-48;
    U.image(main,r.imageKey,aw,aw,'FIT');const facts=st(main,'Release identity',dw,20);releaseMetadata(facts,r,dw);
    const body=st(root,'Release contents',width,mobile?28:40,undefined,pad);
    if(r.tracks?.length){
      title(body,'曲目','TRACKLIST');
      for(let i=0;i<r.tracks.length;i++){
        const track=r.tracks[i],row=st(body,'Track '+(i+1),iw,mobile?12:24,undefined,0,true);
        const nw=mobile?28:48,dw=track.duration?(mobile?44:72):0;
        tx(row,String(i+1).padStart(2,'0'),nw,16,gold,'Medium','sans');
        tx(row,track.title,iw-nw-(dw?dw:0)-(dw?2:1)*(mobile?12:24),mobile?16:20,'ink');
        if(dw)tx(row,track.duration,dw,14,'muted','Regular','sans');
        U.rule(body,iw);
      }
    }
    const films=media.filter(m=>m.releaseId===r.id);
    if(films.length){title(body,'相关影像','FILM / LIVE');for(const m of films)mediaCard(body,m,iw);}
    bt(body,'返回作品库',Math.min(iw,280),'library:'+width);
    footer();return root;
  }

  if(kind==='media') {
    const m=media.find(x=>x.id===entityId);if(!m)throw Error('Unknown media ID.');
    header('library','library:'+width);
    const cinema=st(root,'Film presentation',width,0);U.image(cinema,m.imageKey,width,width*9/16,'FILL');
    const main=st(root,'Film identity and destination',width,mobile?24:32,undefined,pad);
    tx(main,m.kind==='stage'?'舞台 / LIVE STAGE':'MV / MUSIC VIDEO',iw,15,'accent','Medium','sans');
    tx(main,m.title,iw,mobile?32:54,'ink','Medium','latin');
    if(m.artistCredit)tx(main,credit(m),iw,18,gold);
    if(m.date)tx(main,dateKind(m)+' · '+date(m)+zone(m),iw,15,'muted');
    url(main,'前往官方视频 ↗',Math.min(iw,320),m.sourceUrl,'primary');
    bt(main,'作品评分',Math.min(iw,320),sr(m.id,'unrated'));
    const release=releases.find(r=>r.id===m.releaseId);
    if(release){U.rule(main,iw);title(main,'所属发行','RELEASE');releaseCard(main,release,mobile?iw:320);}
    bt(main,'返回作品库',Math.min(iw,320),'library:'+width);
    footer();return root;
  }

  if(kind==='score') {
    const m=media.find(x=>x.id===entityId);if(!m)throw Error('Unknown media score identity.');
    const allowed=['unrated','zero','decimal','success','success-zero','success-unrated','failure','confirm-zero','confirm-decimal','confirm-failure'];
    if(!allowed.includes(state))throw Error('Unknown finite score state.');
    const confirming=state.startsWith('confirm-'),from=confirming?state.slice(8):state;
    const value=['unrated','success-unrated'].includes(from)?null:['zero','success-zero'].includes(from)?0:8.5,dirty=['zero','decimal','failure'].includes(from);
    const back=dirty?sr(m.id,'confirm-'+from):vr(m.id);
    header('score',back,true);
    const main=st(root,'Work-only rating sample',width,mobile?24:40,undefined,pad);
    tx(main,confirming?'离开前确认':'作品评分',iw,mobile?30:46,'ink','Medium');
    tx(main,'交互样板 · 不保存个人记录',iw,14,'muted');
    const pair=st(main,'Film and value',iw,mobile?24:40,undefined,0,!mobile);
    const pw=mobile?iw:Math.round((iw-40)*.58),fw=mobile?iw:iw-pw-40;
    const film=st(pair,'Exact media context',pw,14);U.image(film,m.imageKey,pw,pw*9/16,'FILL');
    tx(film,m.kind==='stage'?'舞台 / STAGE':'MV / MUSIC VIDEO',pw,14,'accent','Medium','sans');
    tx(film,m.title,pw,mobile?25:32,'ink','Medium','latin');
    const field=st(pair,'One score field',fw,20);
    if(confirming){
      tx(field,'放弃本次修改？',fw,26,'ink','Medium');
      tx(field,'当前分数为 '+value.toFixed(1)+'。继续编辑会保留它。',fw,16,'ink');
      bt(field,'继续编辑',fw,sr(m.id,from),'primary');bt(field,'放弃并返回本作品',fw,vr(m.id));
    } else {
      tx(field,value===null?'未评分':'作品分数',fw,16,gold,'Medium');
      tx(field,value===null?'—':value.toFixed(1),fw,mobile?84:112,'ink','Medium','latin');
      U.rule(field,fw,'accent');tx(field,'0–10 分 · 精确至 0.1 分',fw,14,'muted');
      bt(field,'试填 0.0',fw,sr(m.id,'zero'));bt(field,'试填 8.5',fw,sr(m.id,'decimal'));bt(field,'清空',fw,sr(m.id,'unrated'));
      if(state==='failure')tx(field,'失败状态演示：8.5 分仍保留。',fw,15,'ink');
      if(state.startsWith('success'))tx(field,'完成状态演示：未写入个人记录。',fw,15,'ink');
      bt(field,'演示完成',fw,sr(m.id,value===null?'success-unrated':value===0?'success-zero':'success'),'primary');bt(field,'查看 8.5 分失败样例',fw,sr(m.id,'failure'));
      bt(field,'返回本作品',fw,back);
    }
    U.rule(main,iw);tx(main,'MV 与舞台分别评分。',iw,14,'muted');U.space(main,20);return root;
  }

  if(kind==='timeline') {
    header('timeline');const main=st(root,'Read-only chronology',width,mobile?28:40,undefined,pad);
    title(main,'时间轴','CHRONOLOGY');
    tx(main,'最早在前',iw,14,'muted');
    const events=[...input.timeline].sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
    const flow=st(main,'One continuous axis',iw,0),yearW=mobile?0:120;
    let previous='';
    for(const e of events){
      const row=st(flow,'Event '+e.id,iw,mobile?0:36,undefined,0,!mobile);
      if(!mobile){const y=st(row,'Year',yearW,8);tx(y,previous===e.date.slice(0,4)?'—':e.date.slice(0,4),yearW,36,gold,'Medium','latin');}
      const contentW=mobile?iw-24:iw-yearW-36;
      const content=st(row,'Event content',mobile?iw:contentW,16);
      if(mobile){content.paddingLeft=24;content.paddingTop=content.paddingBottom=12;}
      tx(content,date(e)+' · '+dateKind(e)+zone(e),contentW,14,gold,'Medium');
      tx(content,e.title,contentW,mobile?23:32,'ink','Medium');
      const release=e.kind==='release'?releases.find(r=>r.id===e.linkedId):null;
      const video=['mv','stage'].includes(e.kind)?media.find(m=>m.id===e.linkedId):null;
      if(release){const size=mobile?120:144,im=U.image(content,release.imageKey,size,size,'FIT');U.bind(im,{route:rr(release.id)});bt(content,'发行详情',Math.min(contentW,184),rr(release.id));}
      if(video){
        const size=Math.min(contentW,mobile?240:416);const image=U.image(content,video.imageKey,size,size*9/16,'FILL');
        U.bind(image,native.includes(video.id)?{route:vr(video.id)}:{url:video.sourceUrl});
        if(native.includes(video.id))bt(content,video.kind==='stage'?'舞台详情':'MV 详情',Math.min(contentW,184),vr(video.id));
        else url(content,'官方视频 ↗',Math.min(contentW,184),video.sourceUrl);
      }
      const urls=[...new Set(e.sourceUrls||[])];for(let i=0;i<urls.length;i++)url(content,urls.length===1?'来源 ↗':'来源 '+(i+1)+' ↗',Math.min(contentW,184),urls[i]);
      U.space(content,mobile?26:36);previous=e.date.slice(0,4);
    }
    const axis=st(flow,'Single continuous line',1,0,'accent');axis.layoutPositioning='ABSOLUTE';axis.resize(1,Math.max(1,flow.height));axis.x=mobile?8:138;axis.y=0;
    footer();return root;
  }
  throw Error('Unknown i-dle page kind: '+kind);
}
