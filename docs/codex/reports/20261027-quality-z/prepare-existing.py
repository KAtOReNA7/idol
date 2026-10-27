from pathlib import Path
from PIL import Image,ImageDraw
import json,copy
r=Path('C:/Users/20240513/.codex/worktrees/mv-identity-quality-followup/idol');p=Path(__file__).parent
a=json.loads((r/'docs/codex/mv-identity-asset-audit-20261025.json').read_text(encoding='utf8'));groups={w['workId']:w['groups'][0] for w in a['workCoverage']}
sets={'KiiiKiii':'kiiikiii-uncut-gem-concept-photos-1','izna':'izna-not-just-pretty-concept-photos-1','KISS OF LIFE':'kiof-tokyo-mission-start-concept3-20251031','tripleS':'triples-assemble24-concept-20240429','YOUNG POSSE':'yp-goahead-r-20261027','MEOVV':'meovv-my-eyes-open-vvide-concept-20250423','BABYMONSTER':'babymonster-wegoup-visual-202510','STAYC':'stayc-sun-concept-1','aespa':'aespa-rich-man-energy-202508','NewJeans':'nj-supernatural-q-20261027','fromis_9':'fromis-glowme-vacance-202607','LOONA':'loona-hashtag-dbkpop-concept-20200205'}
sets.update({'BADVILLAIN':'badvillain-zoom3-q-20261027','RESCENE':'rescene-lipbomb-concept-20251103'})
rows=[]
for before in a['identityImages']:
 if before.get('qualityTier')!='card_only':continue
 group=groups[before['workId']];cs=[x for x in a['identityImages'] if x['memberId']==before['memberId'] and x.get('photoSet') and x['photoSet']['id']==('triples-assemble24-first-202404' if before['memberId']=='rec28ldbniBeIh' else sets.get(group))]
 if not cs:continue
 src=cs[0];after=copy.deepcopy(src)
 for k in ['workId','videoId','memberId','memberName','song']:after[k]=before[k]
 after['ratingId']=before.get('ratingId',before.get('id','').split(':')[0]);after['operation']='replace_card_only';after['checkedAt']='2026-10-27';after['group']=group
 after['photoSet']['workAssociation']='recognition_reference';after['photoSet']['workAssociationEvidence']='Previously reviewed named same-collection reference used to replace a small card-only rendition for this stable member relationship. This reuse does not establish the exact MV costume or a contemporaneous release connection. Original source proof and the old selection are retained.'
 after['qualityNotes']=src.get('qualityNotes',[])+['Quality replacement for a small card-only source; previous selection remains in alternateIdentityImages.']
 after['reusedFromBinding']={k:src[k] for k in ['workId','videoId','memberId','sha256']};after['localOriginalPath']=str(r/'apps/idol-site/public'/after['src'].lstrip('/'));rows.append({'expectedBefore':before,'after':after,'review':{'approved':False,'actual3By4Reviewed':False,'reason':'Pending final parent contact-sheet review'}})
(p/'proposed-existing-replacements.json').write_text(json.dumps({'replacements':rows},ensure_ascii=False,indent=2),encoding='utf8')
for start in range(0,len(rows),15):
 subset=rows[start:start+15];sheet=Image.new('RGB',(1500,((len(subset)+4)//5)*440),'white');d=ImageDraw.Draw(sheet)
 for i,item in enumerate(subset):
  a=item['after'];c=a['sourceCrop'];im=Image.open(a['localOriginalPath']).convert('RGB').crop((c['x'],c['y'],c['x']+c['width'],c['y']+c['height']));im.thumbnail((290,387));x=(i%5)*300;y=(i//5)*440;sheet.paste(im,(x,y+38));d.text((x,y),a['group']+' '+a.get('sourceMemberName',''),fill='black');d.text((x,y+16),a['song'],fill='black')
 sheet.save(p/f'existing-quality-{start}.jpg')
print(len(rows))
