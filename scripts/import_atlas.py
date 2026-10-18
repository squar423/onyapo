#!/usr/bin/env python3
"""Portable atlas import. Reads sheet XML with Python's standard library; no Excel needed.
Run from the repository root: python3 scripts/import_atlas.py
Do not hand edit generated src/data/{exercises,muscles}.json; edit source workbooks first.
"""
import json
from collections import Counter
from pathlib import Path
from xml.etree import ElementTree as ET
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
      'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
      'p': 'http://schemas.openxmlformats.org/package/2006/relationships'}

def read_sheet(path, name):
    with ZipFile(path) as z:
        strings=[]
        if 'xl/sharedStrings.xml' in z.namelist():
            sx=ET.fromstring(z.read('xl/sharedStrings.xml'))
            strings=[''.join(n.itertext()) for n in sx.findall('m:si', NS)]
        book=ET.fromstring(z.read('xl/workbook.xml'))
        relid=next(s.attrib['{%s}id'%NS['r']] for s in book.findall('m:sheets/m:sheet',NS) if s.attrib['name']==name)
        rels=ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
        target=next(r.attrib['Target'] for r in rels if r.attrib['Id']==relid)
        if target.startswith('/'): target=target.lstrip('/')
        elif not target.startswith('xl/'): target='xl/'+target
        root=ET.fromstring(z.read(target))
        rows=[]
        for row in root.findall('m:sheetData/m:row',NS):
            vals={}
            for c in row.findall('m:c',NS):
                addr=c.attrib['r']; letters=''.join(ch for ch in addr if ch.isalpha()); idx=0
                for ch in letters: idx=idx*26+ord(ch)-64
                v=c.find('m:v',NS); inline=c.find('m:is',NS)
                if v is not None:
                    text=v.text or ''
                    val=strings[int(text)] if c.attrib.get('t')=='s' else text
                elif inline is not None: val=''.join(inline.itertext())
                else: val=''
                vals[idx-1]=val
            if vals: rows.append([vals.get(i,'') for i in range(max(vals)+1)])
        return rows

def clean(s): return str(s or '').strip()
def split(s): return [t.strip() for t in clean(s).split(';') if t.strip() and t.strip() != '—']
def c(row,i): return clean(row[i]) if i<len(row) else ''

def main():
    exrows=read_sheet(ROOT/'source/Exercise_Atlas.xlsx','ALL EXERCISES')
    musrows=read_sheet(ROOT/'source/Muscle_Atlas.xlsx','ALL MUSCLES')
    ex=[]
    for r in exrows[3:]:
        if not c(r,0).startswith('EX'):continue
        ex.append(dict(id=c(r,0),name=c(r,1),region=c(r,2),setting=c(r,3).lower(),category=c(r,4),
                       primary=split(c(r,5)),assisting=split(c(r,6)),stabilizers=split(c(r,7)),stretched=split(c(r,8)),
                       tendons=c(r,10),ligamentContext=c(r,11),instructions=c(r,14),equipment=c(r,15),
                       sourceDosage=c(r,16),safety=c(r,17),reference=c(r,18),evidence=c(r,19)))
    muscles=[]
    for r in musrows[3:]:
        if not c(r,0):continue
        muscles.append(dict(name=c(r,0),compartment=c(r,1),roles=c(r,2),actions=c(r,6),origin=c(r,7),insertion=c(r,8),
                         nerve=c(r,9),roots=c(r,10),tendons=c(r,11),ligaments=c(r,12),typeI=c(r,13),typeII=c(r,14),
                         fiberProfile=c(r,15),fiberCaveat=c(r,16),reference=c(r,17)))
    if len(ex)!=376 or len(muscles)!=349:raise SystemExit(f'Unexpected count: {len(ex)} exercises, {len(muscles)} muscles; verify workbook format')
    if len({a['id'] for a in ex}) != len(ex):raise SystemExit('Duplicate exercise IDs')
    if len({m['name'] for m in muscles}) != len(muscles):raise SystemExit('Duplicate muscle names')
    out=ROOT/'src/data';out.mkdir(parents=True,exist_ok=True)
    for name,data in [('exercises',ex),('muscles',muscles)]:
        (out/(name+'.json')).write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf8')
    existing=(out/'videos.json')
    if not existing.exists():existing.write_text('{}\n',encoding='utf8')
    print('Wrote',len(ex),'exercises and',len(muscles),'muscles.')
    print('Settings:',dict(Counter(e['setting'] for e in ex)))
    print('Videos preserved in src/data/videos.json')

if __name__=='__main__': main()
