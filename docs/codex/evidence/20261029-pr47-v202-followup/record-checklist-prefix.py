"""Capture the exact previously merged v202 notice that changed a frozen-doc hash."""
import hashlib,json,subprocess
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
name='docs/codex/human-help-by-group-20261029.md'
before=subprocess.run(['git','show','dada774ba79aba8e9863a88822e71644669ce7cb:'+name],cwd=ROOT,capture_output=True,check=True).stdout.decode('utf-8')
after=(ROOT/name).read_text(encoding='utf-8')
offset=before.index('\n\n')+2
added=len(after)-len(before)
assert added>0 and after[:offset]+after[offset+added:]==before
sha=lambda s:hashlib.sha256(s.encode('utf-8')).hexdigest()
assert sha(before)=='dd691c05ed807b5ca33ff0e5b35fb0cdcf6d3456cd51d0d34d2c50a0e46f1e21'
receipt={'sourceCommit':'14dfedbdd07f4ac511490d706afd385379be6a0d','beforeCommit':'dada774ba79aba8e9863a88822e71644669ce7cb','path':name,'beforeFileSha256':sha(before),'afterFileSha256':sha(after),'insertionOffset':offset,'insertedText':after[offset:offset+added],
 'meaning':'Only the exact already committed v202 notice is reconstructed for historical hash tests; the checklist body and original expected hash remain unchanged.'}
(HERE/'human-checklist-v202-prefix.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
