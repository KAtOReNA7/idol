import pathlib, hashlib, json
root=pathlib.Path(__file__).resolve().parents[4]/'apps/idol-site'
receipts=[]
def change(file, transform):
 p=root/file; before=p.read_text(encoding='utf-8'); after=transform(before)
 assert after!=before, file
 p.write_text(after,encoding='utf-8',newline='\n')
 receipts.append(dict(file=file,beforeSha256=hashlib.sha256(before.encode()).hexdigest(),afterSha256=hashlib.sha256(after.encode()).hexdigest(),dataChanges=0))
def replace(s,a,b):
 assert s.count(a)==1,a[:120]
 return s.replace(a,b)
def unis(s):
 s=replace(s,"import {ArtistInformation}","import {MemberPublicCredits} from '@/components/public-work-credits';\nimport {ArtistInformation}")
 s=replace(s,'<section className="uf-person">','<section className="uf-person" data-member-layout="ordered-v1" data-member-id={person.id} data-member-module="identity">')
 s=replace(s,'<div className="uf-person-copy">','<div className="uf-person-copy" data-member-module="basic">')
 s=replace(s,'<details className="uf-person-facts"><summary>更多成员资料</summary><MemberPhysicalFacts member={person}/><MemberCareerFacts member={person}/>{image?.sourceUrl && <External href={image.sourceUrl}>照片来源 ↗</External>}</details>','<section className="uf-person-facts"><h3 className="member-profile-heading">成员资料</h3><MemberPhysicalFacts member={person}/><MemberCareerFacts member={person} part="intro"/></section>')
 s=replace(s,'<section className="uf-person-records">','<section className="uf-person-records" data-member-module="works">')
 a='      <section className="uf-related"><UnisNativeSurface slot="rule" className="uf-native-rule uf-rule-top"/><h2>浏览 UNIS 作品</h2>'
 return replace(s,a,'      {state.data && <MemberPublicCredits memberId={person.id} data={state.data} renderLink={(work,label)=><a href={artistWorkUrl(work,false,returnTo)}>{label}</a>}/>}\n      <MemberCareerFacts member={person} part="history"/>\n      {image?.sourceUrl && <section className="member-profile-sources" data-member-module="sources"><External href={image.sourceUrl}>照片来源 ↗</External></section>}\n      <MemberCareerFacts member={person} part="sources"/>\n'+a)
def wooah(s):
 s=replace(s,"import {publicVideoPreview}","import {ScopedMemberCareerFacts} from '@/components/member-career-facts';\nimport {MemberPublicCredits} from '@/components/public-work-credits';\nimport {artistWorkUrl} from '@/lib/idol/artist-preview';\nimport {publicVideoPreview}")
 start=s.index(' else if(selectedMember)'); end=s.index('\n else if(selectedRelease)',start); block=s[start:end]
 block=replace(block,'data-member-id={m.id}>','data-member-id={m.id} data-member-layout="ordered-v1" data-member-module="identity">')
 block=replace(block,'<div className="wa-profile-copy">','<div className="wa-profile-copy" data-member-module="basic">')
 historical='{m.historical&&<p className="wa-profile-period">原六人出道阵容成员。相关公告：{m.announcementDate}，不作为实际生效日期。</p>}'
 sources='<div className="wa-source"><External href={m.sources[0]}>{m.profileSourceLabel}</External></div>{m.historical&&<AnnouncementSource member={m}/>}'
 block=replace(block,historical,''); block=replace(block,sources,'')
 # Resolve canonical career facts only through the existing group-bound catalog.
 registry=json.loads((root/'data/artist-timeline-registry.json').read_text(encoding='utf-8'))
 gid=next(g['groupId'] for g in registry if g['slug']=='wooah')
 scope='data={state.data} memberId={m.id} groupId="'+gid+'"'
 tail='<MemberVideos member={m}/>'
 block=replace(block,tail,tail+'{state.data&&<MemberPublicCredits memberId={m.id} data={state.data} renderLink={(work,label)=><a href={artistWorkUrl(work,false,url)} onClick={remember}>{label}</a>}/>}<ScopedMemberCareerFacts '+scope+' part="history"/>'+('{m.historical&&<section className="wa-career" data-member-module="career">'+historical[15:-1]+'</section>}')+'<section className="member-profile-sources" data-member-module="sources">'+sources+'</section><ScopedMemberCareerFacts '+scope+' part="sources"/>')
 # Keep the historical paragraph's original conditional rather than slicing JSX.
 block=block.replace('{m.historical&&<section className="wa-career" data-member-module="career">'+historical[15:-1]+'</section>}','<section className="wa-career" data-member-module="career">'+historical+'</section>')
 s=s[:start]+block+s[end:]
 s=replace(s,'className="wa-related wa-member-videos" aria-label=','className="wa-related wa-member-videos" data-member-module="works" aria-label=')
 return s
change('components/design-review/unis-design-review.tsx',unis)
change('components/wooah/editorial.tsx',wooah)
pathlib.Path(__file__).with_name('last-react-movement.json').write_text(json.dumps(receipts,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
