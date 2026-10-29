import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL=lambda p: 'file:///'+os.path.join(ROOT,p).replace('\\','/').lstrip('/')
import json,time
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL(os.path.join('tests','mtest.html')))
    for i in range(240):
        t=pg.title()
        if t.startswith('{') or t.startswith('ERR'): break
        time.sleep(0.5)
    if not t.startswith('{'): print('FAIL harness',t); b.close(); raise SystemExit
    d=json.loads(t); HOLE=18
    for group in ('songs','moods'):
        for k,v in d[group].items():
            # hole: loudest minus quietest half-second. store songs must not go hollow (sparse places like night may)
            store=group=='moods' or k in d['store']
            bad=v['maxV']>8 or v['peakDb']>-1 or v['nan'] or (store and v['hole']>HOLE)
            print(('FAIL' if bad else 'ok  '),group[:-1].ljust(4),k.ljust(20),v)
    z=d['zone']
    print(('PASS' if z['badN']==0 else 'FAIL'),'department changes: phrase end, turnaround to new root, tempo eases', z['pairs'],'pairs, longest wait',z['maxWaitSteps'],'16ths', z['bad'])
    print(('PASS' if d['place']['ok']==d['place']['of'] else 'FAIL'),'place changes cut in on the next bar line',d['place'])
    print(('PASS' if d['steady']==0 else 'FAIL'),'no switch when nothing asked',d['steady'])
    print('errors',errs); b.close()
