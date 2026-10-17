#!/usr/bin/env python3
"""Compile one bounded Native call from public schema v1. Never executes Figma."""
from __future__ import annotations
import argparse
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys

BASE = Path(__file__).resolve().parent
KINDS = ('home','members','member','library','release','media','score','timeline')
STATES = ('unrated','zero','decimal','success','success-zero','success-unrated','failure','confirm-zero','confirm-decimal','confirm-failure')
ENTITY = {'member':'members','release':'releases','media':'media','score':'media'}
MODULES = {'newjeans':('newjeans-pages.js','buildNewJeansPage'),'idle':('idle-pages.js','buildIdlePage')}
BASE_FIELDS = ('schemaVersion','slug','group','groupId','pageId','boardId','routeRoots','palette','fonts','navigation','branding','hashes','nativeMediaIds','ui','asOf')
MEMBER_FIELDS = ('id','groupId','stageName','cn','existingRelation','profileListed','imageKey','sourceUrls')
RELEASE_FIELDS = ('id','title','date','dateType','datePrecision','timeZone','type','region','version','releaseFamilyId','artistScope','artistCredit','imageKey','sourceUrl')
MEDIA_FIELDS = ('id','title','kind','imageKey','releaseId','sourceUrl','platform','date','dateType','datePrecision','timeZone','publishedAt','artistScope','artistCredit')
TIMELINE_FIELDS = ('id','title','date','dateType','datePrecision','timeZone','kind','linkedId','sourceUrls')

class BuildError(ValueError): pass

def packed(value):
    return json.dumps(value,ensure_ascii=False,separators=(',',':')).replace('\u2028','\\u2028').replace('\u2029','\\u2029')

def csv(raw):
    result = [x.strip() for x in raw.split(',')]
    if not result or any(not x for x in result) or len(result) != len(set(result)): raise BuildError('Empty or duplicate comma-separated value.')
    return result

def choose_ids(data,kind,raw):
    if kind not in ENTITY:
        if raw is not None: raise BuildError('--ids is not used for ' + kind)
        return []
    values = [x['id'] for x in data.get(ENTITY[kind],[])]
    if len(values) != len(set(values)): raise BuildError('Duplicate stable IDs in ' + ENTITY[kind])
    allowed = data.get('nativeMediaIds',[]) if kind in ('media','score') else values
    if raw is None:
        if kind in ('media','score') and allowed: return list(allowed)
        raise BuildError(kind + ' requires --ids. Available: ' + ','.join(allowed))
    result = list(allowed) if raw == 'all' else csv(raw)
    if not result: raise BuildError('No entities selected for ' + kind)
    unknown = [x for x in result if x not in values or x not in allowed]
    if unknown: raise BuildError('Unknown or non-native IDs: ' + ','.join(unknown) + '; allowed: ' + ','.join(allowed))
    return result

def choose_states(kind,raw):
    if kind != 'score':
        if raw is not None: raise BuildError('--states is only used for score.')
        return []
    result = list(STATES) if raw == 'all' else csv(raw or 'unrated')
    if any(x not in STATES for x in result): raise BuildError('Allowed score states: ' + ','.join(STATES))
    return result

def project(data,kind,ids):
    if data.get('schemaVersion') != 1 or data.get('slug') not in MODULES: raise BuildError('Expected schema v1 and supported slug.')
    for key in ('pageId','boardId'):
        if not isinstance(data.get(key),str) or not data[key]: raise BuildError(key + ' is not assigned yet.')
    out = {k:data[k] for k in BASE_FIELDS if k in data}
    if out.get('branding',{}).get('logoKey'):
        out['branding'] = dict(out['branding']);out['branding'].pop('logoSvg',None)
    if not isinstance(out.get('hashes'),dict): raise BuildError('hashes must be a dictionary.')
    if any(not isinstance(v,str) or not re.fullmatch('[a-fA-F0-9]{40}',v) for v in out['hashes'].values()): raise BuildError('Invalid image hash.')
    native = out.get('nativeMediaIds',[])
    if len(native) != len(set(native)) or any(x not in [m['id'] for m in data.get('media',[])] for x in native): raise BuildError('nativeMediaIds must reference distinct real media IDs.')
    out['members'] = [{k:m[k] for k in MEMBER_FIELDS if k in m} for m in data.get('members',[])]
    releases, media, timeline = [], [], []
    if kind in ('home','library','timeline'): releases = data.get('releases',[])
    if kind in ('home','library','media'): media = data.get('media',[])
    if kind == 'release':
        releases = [x for x in data.get('releases',[]) if x['id'] in ids]
        media = [x for x in data.get('media',[]) if x.get('releaseId') in ids]
    elif kind == 'member':
        names = [m['stageName'].lower() for m in data.get('members',[]) if m['id'] in ids]
        releases = [r for r in data.get('releases',[]) if r.get('artistScope') == 'solo' and any(name in (' / '.join(r.get('artistCredit',[])) if isinstance(r.get('artistCredit'),list) else str(r.get('artistCredit',''))).lower() for name in names)]
    elif kind == 'media':
        related = {x.get('releaseId') for x in media if x['id'] in ids}
        releases = [x for x in data.get('releases',[]) if x['id'] in related]
    elif kind == 'score': media = [x for x in data.get('media',[]) if x['id'] in ids]
    if kind == 'timeline':
        timeline = data.get('timeline',[])
        linked = {x.get('linkedId') for x in timeline}
        media = [x for x in data.get('media',[]) if x['id'] in linked]
    out['releases'] = [{k:x[k] for k in RELEASE_FIELDS if k in x} for x in releases]
    if kind == 'release':
        for result,raw in zip(out['releases'],releases):
            if 'tracks' in raw: result['tracks'] = [{k:t[k] for k in ('title','duration') if k in t} for t in raw['tracks']]
            if 'sourceUrls' in raw: result['sourceUrls'] = raw['sourceUrls']
    out['media'] = [{k:x[k] for k in MEDIA_FIELDS if k in x} for x in media]
    if kind in ('media','score'):
        for result,raw in zip(out['media'],media):
            if raw['id'] in ids and 'sourceUrls' in raw: result['sourceUrls'] = raw['sourceUrls']
    out['timeline'] = [{k:x[k] for k in TIMELINE_FIELDS if k in x} for x in timeline]
    if kind == 'timeline':
        out['releases'] = [{k:r[k] for k in ('id','imageKey','date') if k in r} for r in out['releases']]
        out['media'] = [{k:m[k] for k in ('id','kind','imageKey','sourceUrl') if k in m} for m in out['media']]
    if kind not in ('home','members','member'):
        for member in out['members']:member.pop('sourceUrls',None)
    if kind in ('home','library','member'):
        for release in out['releases']:release.pop('sourceUrl',None)
    needed = {'hero'}
    if out.get('branding',{}).get('logoKey'): needed.add(out['branding']['logoKey'])
    for name in ('members','releases','media'):
        needed.update(x.get('imageKey') for x in out[name] if x.get('imageKey'))
    out['assets'] = [{k:a[k] for k in ('key','width','height','displayWidth','displayHeight') if k in a} for a in data.get('assets',[]) if a['key'] in needed]
    return out

def prune_page_kind(source,kind):
    pattern=r'''(?m)^  (?:}\s*else\s+)?if\s*\(kind\s*===\s*['"]([^'"]+)['"]\)\s*\{'''
    starts=list(re.finditer(pattern,source))
    names=[match.group(1) for match in starts]
    if len(starts)!=len(KINDS) or set(names)!=set(KINDS):
        raise BuildError('Page source needs the eight two-space-indented if(kind===...) branches for safe specialization.')
    endings=[]
    for match in starts:
        end=re.search(r'(?m)^  }',source[match.end():])
        if not end:raise BuildError('Could not locate the branch closing line: '+match.group(1))
        close=match.end()+end.start();line_end=source.find('\n',close)
        endings.append((close,line_end+1 if line_end>=0 else len(source)))
    index=names.index(kind);match=starts[index]
    body=source[match.end():endings[index][0]]
    # Each author uses either a single if/else chain or independent returning
    # blocks. Keep its own shared helpers and final footer/throw unchanged.
    return source[:starts[0].start()]+"  if(kind==="+packed(kind)+") {"+body+"  }\n"+source[endings[-1][1]:]

def source_module(path,function,kind=None):
    source = path.read_text(encoding='utf-8')
    if len(re.findall(r'(?m)^async function\s+' + re.escape(function) + r'\s*\(',source)) != 1: raise BuildError('Expected one ' + function + ' in ' + path.name)
    end = re.search(r'(?m)^if\s*\(typeof module',source)
    source = source[:end.start()] if end else source
    # Preserve all same-module helpers; never combine the other group's layout.
    return (prune_page_kind(source,kind) if kind else source).strip()

def compile_call(data,group,kind,widths,ids,states):
    if data.get('slug') != group: raise BuildError('Input slug does not match --group.')
    out = project(data,kind,ids)
    file,function = MODULES[group]
    runtime = source_module(BASE/'native-runtime.js','createArtistUI')
    page = source_module(BASE/file,function,kind)
    calls = []
    for w in widths:
        for entity_id in ids or [None]:
            for state in states or ['unrated']:
                calls.append(f'await {function}(U,input,{packed(kind)},{w},{packed(entity_id)},{packed(state)});')
    code = '\n'.join([runtime,page,'const input='+packed(out)+';','const U=await createArtistUI(figma,input);',*calls,'return await U.finish();',''])
    units = len(code.encode('utf-16-le'))//2
    info = {'group':group,'kind':kind,'widths':widths,'ids':ids,'states':states,'rootsToBuild':len(calls),'sourceFiles':['native-runtime.js',file],'specializedKind':kind,
            'codePoints':len(code),'utf16Units':units,'utf8Bytes':len(code.encode()),'inputChars':len(packed(out)),'imageHashesPreserved':len(out['hashes'])}
    if units > 50000: raise BuildError(f'Call is {units} UTF-16 units, over 50,000. Runtime {len(runtime)}, page module {len(page)}, input {info["inputChars"]}, calls {len(calls)}. Split selected IDs/states/widths or page module by kind; no source was written.')
    return code,info

def syntax_check(code):
    node = shutil.which('node')
    if not node: raise BuildError('Cloud Node required for syntax-only check; no Figma call was made.')
    script = "new (Object.getPrototypeOf(async function(){}).constructor)('figma',require('node:fs').readFileSync(0,'utf8'));"
    result = subprocess.run([node,'-e',script],input=code,text=True,capture_output=True,check=False)
    if result.returncode: raise BuildError('Compiled JS syntax failed: ' + result.stderr.strip())

def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--group',required=True,choices=MODULES)
    p.add_argument('--kind',required=True,choices=KINDS)
    p.add_argument('--width',choices=('1440','390','320','all'))
    p.add_argument('--ids');p.add_argument('--states')
    p.add_argument('--input',type=Path);p.add_argument('--output',type=Path)
    args = p.parse_args(argv)
    try:
        data = json.loads((args.input or BASE/(args.group+'-data.json')).read_text())
        ids,states = choose_ids(data,args.kind,args.ids),choose_states(args.kind,args.states)
        width = args.width or ('all' if args.kind in ('home','members','library','timeline') else '390')
        widths = [1440,390,320] if width == 'all' else [int(width)]
        code,info = compile_call(data,args.group,args.kind,widths,ids,states);syntax_check(code)
        output = args.output or BASE/'native-calls'/f'{args.group}-{args.kind}-{width}.native-call.js'
        if not str(output).endswith('.native-call.js'): raise BuildError('Output must end in .native-call.js; never overwrite source.')
        output.parent.mkdir(parents=True,exist_ok=True);output.write_text(code)
        info.update(output=str(output.resolve()),syntaxCheck='passed',executedInFigma=False)
        print(json.dumps(info,ensure_ascii=False));return 0
    except (OSError,ValueError,KeyError,TypeError) as error:
        print('Build error: '+str(error),file=sys.stderr);return 2

if __name__ == '__main__': raise SystemExit(main())
