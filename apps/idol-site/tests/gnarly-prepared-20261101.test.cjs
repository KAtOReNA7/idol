const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),{spawnSync}=require('node:child_process');

test('Gnarly human-confirmed candidate passes strict preference without mutating the existing festival binding',()=>{
 const script=String.raw`
import pathlib,sys,json,copy
root=pathlib.Path.cwd();sys.path.insert(0,str(root/'scripts'))
from stage_selection_policy import checked_selection,comparison_candidates,replacement_preference
e=root.parent.parent/'docs/codex/evidence/20261101-closeout'
item=json.loads((e/'gnarly-prepared-20261101.json').read_text(encoding='utf8'))['items'][0]
confirmation=json.loads((e/'gnarly-human-confirmation.json').read_text(encoding='utf8'))
before=(root/'data/stage-videos.json').read_bytes();videos=json.loads(before);previous=videos[item['recordId']]
assert previous['videoId']=='Rz47IBr1GXM' and confirmation['adopted'] is False
assert confirmation['userAnswer']=='完整六人，音轨版本一致'
selected=item['selected'];assert selected['videoId']=='xrm7PP1mbtI'
assert selected['completeness']=='full' and selected['versionMatch'] is True
assert selected['performerScope']=='full_group'
assert checked_selection(selected)['occasion']=='practice_room'
assert comparison_candidates(item['candidates'])==[selected]
assert replacement_preference(previous,selected,item['previousOccasionReview'],item['replacementDecision'])=='excluded_historical_occasion'
bad=copy.deepcopy(previous);bad['title']+=' changed'
try:replacement_preference(bad,selected,item['previousOccasionReview'],item['replacementDecision'])
except AssertionError:pass
else:raise AssertionError('Changed legacy preimage was accepted')
assert before==(root/'data/stage-videos.json').read_bytes()
print('prepared only; no owner export or mutation')
`;
 const out=spawnSync('python',['-c',script],{cwd:path.resolve(__dirname,'..'),encoding:'utf8'});
 assert.equal(out.status,0,out.stdout+'\n'+out.stderr);
 assert.match(out.stdout,/prepared only/);
});
