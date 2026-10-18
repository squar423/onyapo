#!/usr/bin/env python3
import json
from pathlib import Path
from collections import Counter
root=Path(__file__).resolve().parents[1]
e=json.loads((root/'src/data/exercises.json').read_text());m=json.loads((root/'src/data/muscles.json').read_text());videos=json.loads((root/'src/data/videos.json').read_text())
assert len(e)==376 and len(m)==349,(len(e),len(m))
assert len(set(x['id'] for x in e))==len(e)
assert len(set(x['name'] for x in m))==len(m)
assert set(x['setting'] for x in e)=={'home','gym'}
known=set(x['name'] for x in m)
for x in e:
 assert x['id'].startswith('EX')
 assert x['name'] and x['instructions'] and x['category']
 for key in ('primary','assisting','stabilizers','stretched'):
  for name in x[key]:
   assert name in known,(x['id'],key,name)
for id,v in videos.items():
 assert id in {x['id'] for x in e},'Unknown video ID '+id
 assert v['src'].startswith('/videos/') or v['src'].startswith('https://youtu.be/') or v['src'].startswith('https://www.youtube.com/watch?v='),'Video URL not permitted'
print('Validated',len(e),'exercises,',len(m),'muscles,',len(videos),'videos; settings:',dict(Counter(x['setting'] for x in e)))
