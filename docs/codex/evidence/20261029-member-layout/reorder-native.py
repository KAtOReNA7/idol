import pathlib,json,hashlib,subprocess
root=pathlib.Path(__file__).resolve().parents[4]/'apps/idol-site'
receipts=[]
def original(file):
 return subprocess.check_output(['git','show','d07242bf:apps/idol-site/'+file],cwd=root).decode('utf-8')
def once(s,a,b):
 assert s.count(a)==1,(a[:120],s.count(a))
 return s.replace(a,b)
def save(file,before,after):
 assert before!=after
 assert (root/file).read_text(encoding='utf-8') in [before,after],file
 (root/file).write_text(after,encoding='utf-8',newline='\n')
 row=dict(file=file,beforeSha256=hashlib.sha256(before.encode()).hexdigest(),afterSha256=hashlib.sha256(after.encode()).hexdigest(),dataChanges=0,privateTransportChanges=0)
 if file.endswith('/izna.mjs'):
  def person(text):
   start=text.index(' function person(');end=text.index('\n function ',start+1);return text[start:end]
  row.update(previousPersonFunction=person(before),reviewedPersonSha256=hashlib.sha256(person(after).encode()).hexdigest())
 receipts.append(row)
for slug in ['ifeye','izna']:
 file=f'lib/idol/{slug}-runtime/{slug}.mjs'; before=original(file)
 start=before.index(' function person(');end=before.index('\n function ',start+1);s=before[start:end]
 # All participant lists remain the exact existing public projections.
 if slug=='ifeye':
  s=once(s,'class="shell personal-top"','class="shell personal-top" data-member-layout="ordered-v1" data-member-id="${e(m.id)}"')
  s=once(s,'class="personal-spread"','class="personal-spread" data-member-module="identity"')
  s=once(s,'class="personal-copy"','class="personal-copy" data-member-module="basic"')
  s=once(s,'</div></article>${rels.length?','</div></article><div data-member-native-slot data-member-module="records"></div>${rels.length?')
  s=once(s,'class="release-section chapter"','class="release-section chapter" data-member-module="public"')
  s=once(s,'class="chapter member-videos"','class="chapter member-videos" data-member-module="public"')
  addition='${D.events.some(ev=>(ev.memberIds||[]).includes(m.id))?`<section class="chapter member-history" data-member-module="career">${chapterHeading("CAREER","经历与动态")}${sortedEvents().filter(ev=>(ev.memberIds||[]).includes(m.id)).map(eventMarkup).join(\'\')}</section>`:\'\'}<section class="chapter member-profile-sources" data-member-module="sources"><h2>照片来源</h2>${sourceLink(m.portrait)}</section>'
  s=once(s,'<nav class="siblings"',addition+'<nav class="siblings"')
 else:
  s=once(s,'class="personal page ${','data-member-layout="ordered-v1" data-member-id="${e(m.id)}" class="personal page ${')
  s=once(s,'class="identity-spread member-editorial"','class="identity-spread member-editorial" data-member-module="identity"')
  s=once(s,'class="identity-profile"','class="identity-profile" data-member-module="basic"')
  s=once(s,"${m.portrait?.usage==='historical_named_portrait'?sourceLink(m.portrait):''}",'')
  s=once(s,'</dl></div></section>${related.length?','</dl></div></section><div data-member-native-slot data-member-module="records"></div>${related.length?')
  s=once(s,'data-member-release-roster','data-member-module="public" data-member-release-roster')
  s=once(s,'data-member-release-promotion','data-member-module="public" data-member-release-promotion')
  s=once(s,'data-member-video-slot="${type}"','data-member-module="public" data-member-video-slot="${type}"')
  addition='${D.events.some(ev=>(ev.memberIds||[]).includes(m.id))?`<section class="chapter member-history" data-member-module="career"><header class="chapter-head"><h2>经历与动态</h2></header>${timelineRows(sortedEvents().filter(ev=>(ev.memberIds||[]).includes(m.id)))}</section>`:\'\'}<section class="chapter member-profile-sources" data-member-module="sources"><h2>照片来源</h2>${sourceLink(m.portrait)}</section>'
  s=once(s,'<nav class="member-sequence"',addition+'<nav class="member-sequence"')
 save(file,before,before[:start]+s+before[end:])
 file=f'lib/idol/{slug}-runtime/host.mjs'; before=original(file)
 save(file,before,once(before,"if(section.childNodes.length)root.querySelector('main')?.append(section);","if(section.childNodes.length)(request.action==='open-member'?root.querySelector('[data-member-native-slot]'):root.querySelector('main'))?.append(section);"))
file='lib/idol/udtt-native/presentation.mjs';before=original(file)
start=before.index(" }else if(route.page==='member'){");end=before.index(" }else if(route.page==='works'){",start);s=before[start:end]
s=once(s,'class="ud-member" data-member-id=','class="ud-member" data-member-layout="ordered-v1" data-member-id=')
s=once(s,'<section class="ud-section"><a class="ud-back"','<section class="ud-section" data-member-module="identity"><a class="ud-back"')
s=once(s,'class="ud-biography"','class="ud-biography" data-member-module="basic"')
s=once(s,"${sources(publicMemberSources(m).filter(s=>s.url?.includes('hellokpop')))}",'')
s=once(s,'</div></div></section>${cast.some','</div></div></section><div class="ud-section ud-records" data-member-module="records"><!-- native-record-controls --></div>${cast.some')
s=once(s,'<section class="ud-section ud-navy"><h2>已核实出演影像','<section class="ud-section ud-navy" data-member-module="public"><h2>已核实出演影像')
s=once(s,'<section class="ud-section"><h2>资料片段','<section class="ud-section" data-member-module="career"><h2>资料片段')
s=once(s,'<section class="ud-section"><hr><h3>照片与资料来源','<section class="ud-section" data-member-module="sources"><hr><h3>照片与资料来源')
s=once(s,'${sources(publicMemberSources(m))}<!-- native-record-controls -->','${sources(publicMemberSources(m))}')
save(file,before,before[:start]+s+before[end:])
# Only the reviewed presentation pin changes; all transport guards and exclusions remain exact.
manifest=root/'scripts/udtt-private-build-assets-manifest.json';data=json.loads(manifest.read_text(encoding='utf-8'))
pin=json.loads(original('scripts/udtt-private-build-assets-manifest.json'))['runtimeGuards'][file]; raw=(root/file).read_bytes(); new=dict(bytes=len(raw),sha256=hashlib.sha256(raw).hexdigest())
assert pin['sha256']==receipts[-1]['beforeSha256']
assert data['runtimeGuards'][file] in [pin,new] or data['runtimeGuards'][file]['sha256']=='e327c44f741e48c566b0edfa4beac14e6e85093b4cd63dd9a88d2519a91cccd6'
data['sourceGuardReviewMemberLayout20261030']=dict(scope='User-approved member module order only. Move the existing member native-control marker before public participation, keep interview date semantics and sources. No transport, owner/auth, data, original, exclusion or carrier relaxation.',changes=[dict(path=file,previous=pin.copy(),reviewed=new)])
data['runtimeGuards'][file]=new
manifest.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
pathlib.Path(__file__).with_name('native-movement.json').write_text(json.dumps(receipts,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
