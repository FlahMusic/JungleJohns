import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL=lambda p: 'file:///'+os.path.join(ROOT,p).replace('\\','/').lstrip('/')
import json,time
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL(os.path.join('tests','mtest.html')))
    for i in range(120):
        t=pg.title()
        if t.startswith('{'): break
        time.sleep(0.5)
    d=json.loads(pg.title()); sw=d.pop('switchSteps')
    ok=True
    for k,v in d.items():
        bad=v['maxV']>8 or v['peakDb']>-1 or v['nan']
        ok&=not bad; print(('FAIL' if bad else 'ok  '),k.ljust(9),v)
    print('situation switches landed on steps',sw,'-> all on bar lines' if all(s%16==0 for s in sw) else '-> FAIL not on bar line')
    print('errors',errs); b.close()
