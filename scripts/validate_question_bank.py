"""Technical validation of the supplied active 2000-question bank."""
import json, collections, pathlib
p=pathlib.Path(__file__).resolve().parents[1]/'netlify/private/questions_2000_master.json'
a=json.loads(p.read_text()); assert len(a)==2000
assert len({q['id'] for q in a})==2000
assert len({q['question'].strip() for q in a})==2000
for level in range(1,101):
 rows=[q for q in a if q['level']==level]
 assert len(rows)==20 and len({q['subject_code'] for q in rows})==10
 assert set(collections.Counter(q['subject_code'] for q in rows).values())=={2}
 for q in rows:
  grade=1 if level<=16 else 2 if level<=33 else 3 if level<=50 else 4 if level<=66 else 5 if level<=83 else 6
  assert q['grade']==grade and q['status']=='active' and q['correct_index'] in range(3)
  assert len(q['options'])==len(set(x.strip() for x in q['options']))==3
  assert q['question'].strip() and q['explanation'].strip()
print('PASS: 2000 active unique questions, 100 levels, 10 subjects, two per level/subject')
