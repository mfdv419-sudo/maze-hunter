"""Validate the supplied authoring bank; this is not academic approval."""
import json, collections, pathlib
p=pathlib.Path(__file__).resolve().parents[1]/'netlify/private/questions_level01_500_master.json'
a=json.loads(p.read_text()); assert len(a)==500
assert len({q['id'] for q in a})==500
assert set(collections.Counter(q['subject_code'] for q in a).values())=={50}
assert len({q['subject_code'] for q in a})==10
for q in a:
 assert q['level']==q['grade']==1 and q['correct_index'] in range(3)
 assert len(q['options'])==len(set(x.strip() for x in q['options']))==3
 assert q['question'].strip() and q['explanation'].strip()
for code in {q['subject_code'] for q in a}:
 assert len({q['question'].strip() for q in a if q['subject_code']==code})==50
print('PASS: 500 original draft questions, 50 per subject; academic review pending')
