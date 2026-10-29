import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL=lambda p: 'file:///'+os.path.join(ROOT,p).replace('\\','/').lstrip('/')
import json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(); pg.goto(URL('dist.html')); pg.wait_for_timeout(700)
    for ups in ['', 'toys,gacha,tiktok,cards,sushi']:
        r=pg.evaluate("""(ups)=>{ const U={}; ups.split(',').filter(Boolean).forEach(u=>U[u]=true); buildWorld(U); const s=W.spots.mainDoorIn; const bad=[]; let n=0;
          for(const id in W.fronts){ const fr=W.fronts[id]; const ok=fr.some(f=>findPath(s[0],s[1],f[0],f[1])); n++; if(!ok) bad.push(id); }
          const noFront=DEPTS.filter(d=>d.max && (!d.lock||U[d.lock]) && !(W.fronts[d.id]||[]).length).map(d=>d.id);
          const pal=W.pallets.filter(p=>!findPath(s[0],s[1],p.x,p.y+1)).map(p=>p.crate);
          const lanes=W.lanes.filter(l=>!findPath(s[0],s[1],l.q[4][0],l.q[4][1]) || !findPath(l.pay[0],l.pay[1],W.spots.exitIn[0],W.spots.exitIn[1])).map(l=>l.i);
          const doors=[W.spots.exitIn,W.spots.sideDoorIn,W.spots.bed].filter(d=>!findPath(s[0],s[1],d[0],d[1])).length;
          return {depts:n, unreachable:bad, noFront, palletsBlocked:pal, lanesBlocked:lanes, doorsBlocked:doors, tanks:W.tanks.length, lanesN:W.lanes.length}; }""", ups)
        print(ups or 'base', json.dumps(r))
    b.close()
