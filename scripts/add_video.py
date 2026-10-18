#!/usr/bin/env python3
"""Safely add one video mapping by a stable EX#### ID (preserves other videos).
Examples:
 python3 scripts/add_video.py EX0001 --file ./my_pushup.mp4 --caption 'Side view'
 python3 scripts/add_video.py EX0002 --youtube 'https://youtu.be/dQw4w9WgXcQ'
"""
import argparse,json,shutil,re
from pathlib import Path
root=Path(__file__).resolve().parents[1]
a=argparse.ArgumentParser(description=__doc__)
a.add_argument('exercise_id');group=a.add_mutually_exclusive_group(required=True)
group.add_argument('--file',help='MP4 or WebM source video to copy into public/videos/')
group.add_argument('--youtube',help='Direct YouTube URL (youtu.be/ID or youtube.com/watch?v=ID)')
a.add_argument('--caption',default='',help='Short credit / video description')
a.add_argument('--poster',default='',help='Optional public URL, e.g. /videos/EX0001.jpg')
opts=a.parse_args()
ex={x['id'] for x in json.loads((root/'src/data/exercises.json').read_text())}
if opts.exercise_id not in ex:raise SystemExit('Unknown Exercise ID: '+opts.exercise_id)
if opts.file:
 f=Path(opts.file).resolve()
 if not f.is_file() or f.suffix.lower() not in ('.mp4','.webm'):raise SystemExit('Provide an existing MP4 or WebM file')
 if f.stat().st_size>80*1024*1024:raise SystemExit('Video >80 MB. Host externally or compress for GitHub Pages.')
 dest=root/'public/videos'/f'{opts.exercise_id}{f.suffix.lower()}'
 if dest.resolve()!=f:shutil.copy2(f,dest)
 src='/videos/'+dest.name
else:
 src=opts.youtube
 if not re.fullmatch(r'https://(?:www\.)?(?:youtu\.be/[A-Za-z0-9_-]{11}|youtube\.com/watch\?v=[A-Za-z0-9_-]{11})',src):
  raise SystemExit('Use an approved short or watch YouTube URL')
source=root/'src/data/videos.json';videos=json.loads(source.read_text())
videos[opts.exercise_id]={'src':src}
if opts.caption:videos[opts.exercise_id]['caption']=opts.caption
if opts.poster:videos[opts.exercise_id]['poster']=opts.poster
source.write_text(json.dumps(dict(sorted(videos.items())),indent=2,ensure_ascii=False)+'\n')
print('Added',opts.exercise_id,'video ->',src,'\nNow run: npm run validate:data')
