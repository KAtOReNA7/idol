"""Bounded source-type extension; no bindings, data rows or access changes."""
import hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent
APP=HERE.parents[3]/'apps/idol-site'
edits=[]
def plan(file,old,new,count=1):edits.append((file,old,new,count))
plan('lib/idol/types.ts',"platform?:'youtube'|'bilibili'","platform?:'youtube'|'bilibili'|'x'",2)
plan('lib/idol/types.ts',"bilibili?:{cid:string;page:number};completeness?:'full'","bilibili?:{cid:string;page:number};xMedia?:{videoIndex:number};completeness?:'full'")
plan('lib/idol/types.ts',"bilibili?:{cid:string;page:number};title:string;url:string;likesDisplay", "bilibili?:{cid:string;page:number};xMedia?:{videoIndex:number};title:string;url:string;likesDisplay")
plan('lib/idol/types.ts',"likesScope?:'performance'|'whole_video'","likesScope?:'performance'|'whole_video'|'whole_post'")
plan('lib/idol/public-catalog.ts',"selection,bilibili:fields('cid page'),\n memberVersionFallback", "selection,bilibili:fields('cid page'),xMedia:fields('videoIndex'),\n memberVersionFallback")
plan('lib/idol/public-catalog.ts',"candidates:[{...fields('title url likesDisplay kind platform videoId'),bilibili:fields('cid page')}]", "candidates:[{...fields('title url likesDisplay kind platform videoId'),bilibili:fields('cid page'),xMedia:fields('videoIndex')}]")
plan('lib/idol/native-save.ts',"...(selected!.platform==='bilibili'?{platform:'bilibili',bilibili:selected!.bilibili}:{}),", "...(selected!.platform==='bilibili'?{platform:'bilibili',bilibili:selected!.bilibili}:{}),...(selected!.platform==='x'?{platform:'x',xMedia:selected!.xMedia}:{}),")
for file in ['scripts/merge-stage-batch.py','scripts/normalize-stage-patch.py','scripts/stage_selection_policy.py']:
 plan(file,"('youtube','bilibili')","('youtube','bilibili','x')") if file!='scripts/stage_selection_policy.py' else plan(file,"('youtube', 'bilibili')","('youtube', 'bilibili', 'x')")
plan('scripts/merge-stage-batch.py',"if s['platform']=='bilibili':assert item.get('selectedSourceKey')", "if s['platform'] in ('bilibili','x'):assert item.get('selectedSourceKey')")
plan('scripts/merge-stage-batch.py',"(s['platform']=='bilibili' or s['sourceClass']!='official')", "(s['platform'] in ('bilibili','x') or s['sourceClass']!='official')")
plan('scripts/merge-stage-batch.py',"**({'platform':'bilibili','videoId':c['videoId'],'bilibili':c['bilibili']} if c['platform']=='bilibili' else {})", "**({'platform':'bilibili','videoId':c['videoId'],'bilibili':c['bilibili']} if c['platform']=='bilibili' else {'platform':'x','videoId':c['videoId'],'xMedia':c['xMedia']} if c['platform']=='x' else {})")
plan('scripts/merge-stage-batch.py'," if s.get('sourceEvidence'):videos[rid]['sourceEvidence']", " if s['platform']=='x':videos[rid].update(xMedia=s['xMedia'],likesScope='whole_post')\n if s.get('sourceEvidence'):videos[rid]['sourceEvidence']")
plan('scripts/normalize-stage-patch.py',"  if s['platform']=='bilibili':pick['likesScope']=s.get('likesScope','whole_video')", "  if s['platform']=='bilibili':pick['likesScope']=s.get('likesScope','whole_video')\n  if s['platform']=='x':pick['likesScope']='whole_post'")
plan('components/work-video-player.tsx',"platform?:'youtube'|'bilibili';", "platform?:'youtube'|'bilibili'|'x';")
plan('components/work-video-player.tsx',"platform==='bilibili'?'在 B站观看':view", "platform==='bilibili'?'在 B站观看':platform==='x'?'在 X 观看':view")
plan('app/page.tsx',"activePlatform==='bilibili'?'B站':'YouTube'", "activePlatform==='bilibili'?'B站':activePlatform==='x'?'X':'YouTube'")
plan('app/page.tsx',"activePlatform==='bilibili'?'在 B站打开所选分P观看。':'播放不了？可在 YouTube 打开原视频。'", "activePlatform==='bilibili'?'在 B站打开所选分P观看。':activePlatform==='x'?'在 X 打开所选视频观看。':'播放不了？可在 YouTube 打开原视频。'")
texts={file:(APP/file).read_text(encoding='utf-8') for file,_,_,_ in edits}
before={file:hashlib.sha256((APP/file).read_bytes()).hexdigest() for file in texts}
for file,old,new,count in edits:
 assert texts[file].count(old)==count,(file,old,texts[file].count(old),count)
 texts[file]=texts[file].replace(old,new)
for file,text in texts.items():(APP/file).write_text(text,encoding='utf-8',newline='\n')
(HERE/'x-support-text-edits.json').write_text(json.dumps({'beforeFileSha256':before,'afterFileSha256':{file:hashlib.sha256((APP/file).read_bytes()).hexdigest() for file in texts},'bindingChanges':0,'accessChanges':0,'privateWrites':0},indent=2)+'\n',encoding='utf-8',newline='\n')
