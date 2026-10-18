#!/usr/bin/env python3
"""Dependency-free smoke check for source assets and key project configuration."""
from pathlib import Path
import json,sys
root=Path(__file__).resolve().parents[1]
required=['package.json','index.html','vite.config.ts','src/main.tsx','src/App.tsx','src/style.css','src/lib/planner.ts','src/lib/history.ts','src/lib/avatar.ts','src/components/Avatar.tsx','src/lib/store.tsx','src/lib/supabase.ts','src/data/exercises.json','src/data/muscles.json','src/data/videos.json','src/data/links.json','source/Exercise_Atlas.xlsx','source/Muscle_Atlas.xlsx','supabase/migrations/0001_initial.sql','.github/workflows/deploy-pages.yml']
missing=[name for name in required if not (root/name).is_file()]
for name in required: print(('MISSING' if name in missing else 'OK     '),name)
if missing:sys.exit(1)
e=json.loads((root/'src/data/exercises.json').read_text());m=json.loads((root/'src/data/muscles.json').read_text());v=json.loads((root/'src/data/videos.json').read_text());
print(f'\nExercises: {len(e)}, muscles: {len(m)}, registered videos: {len(v)}')
print('To test the frontend build: npm install && npm test && npm run build')
