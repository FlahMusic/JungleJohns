import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL=lambda p: 'file:///'+os.path.join(ROOT,p).replace('\\','/').lstrip('/')
import json,sys
from playwright.sync_api import sync_playwright
days=int(sys.argv[1]) if len(sys.argv)>1 else 1
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1280,'height':800})
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL('dist.html')); pg.wait_for_timeout(800)
    pg.click('#t-new'); pg.wait_for_timeout(200); pg.keyboard.press('Space'); pg.keyboard.press('Space')
    pg.evaluate("""()=>{ window.__U=window.update; window.update=()=>{}; window.__fail=0; window.__calls=0; const fp=window.findPath; window.findPath=function(a,b,c,d){__calls++; const r=fp(a,b,c,d); if(!r){__fail++; window.__lastFail=[a,b,c,d];} return r;}; window.__stuck=0; }""")
    for d in range(days):
        r=pg.evaluate("""()=>{ const G=__game; const out={hours:[]}; let maxAge=0; const born=new Map();
          let steps=0; while(!G.RT.menu && steps<200000){ __U(0.05); steps++;
            for(const c of G.RT.custs){ if(!born.has(c.id)) born.set(c.id,G.ST.minute); maxAge=Math.max(maxAge,G.ST.minute-born.get(c.id)); }
            if(steps%600==0) out.hours.push([Math.round(G.ST.minute), G.RT.custs.length, Math.round(G.RT.day.sales), G.RT.custs.filter(c=>c.state==='queue').length]);
            if(G.ST.minute>=22.6*60 && !G.RT.sleeping){ G.RT.sleeping=true; }
          }
          const stock={}; for(const k in G.ST.stock) stock[k]=G.ST.stock[k];
          return {steps, rep:G.ST.rep, money:G.ST.money, report:G.RT.report && {sales:G.RT.report.sales, served:G.RT.report.served, wholesale:G.RT.report.wholesale, moods:G.RT.report.moods.length, avgMood:G.RT.report.moods.reduce((a,b)=>a+b,0)/Math.max(1,G.RT.report.moods.length), empty:G.RT.report.emptyHits, lostGave:G.RT.report.lostGaveUp}, stock, maxAge, fail:__fail, calls:__calls, lastFail:window.__lastFail, hours:out.hours.filter((_,i)=>i%3==0)} }""")
        print(json.dumps(r)[:3000])
        pg.evaluate("document.getElementById('m-next') && document.getElementById('m-next').click()")
    print('errors:',errs[:5]); b.close()
