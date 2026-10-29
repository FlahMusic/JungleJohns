# python tests/sim.py [minutes]  -> runs the store untouched (no player) and reports the economy + path failures
# days are untimed now: this measures money per real minute, how long the day's goal takes with nobody helping,
# and that nobody gets stuck. one JSON line per day (Mon, then Fri).
import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL=lambda p: 'file:///'+os.path.join(ROOT,p).replace('\\','/').lstrip('/')
import json,sys
from playwright.sync_api import sync_playwright
mins=float(sys.argv[1]) if len(sys.argv)>1 else 8
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1280,'height':800})
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL('dist.html')); pg.wait_for_timeout(800)
    pg.click('#t-new'); pg.wait_for_timeout(200); pg.keyboard.press('Space'); pg.keyboard.press('Space')
    pg.evaluate("""()=>{ window.__U=window.update; window.update=()=>{}; window.__fail=0; window.__calls=0; const fp=window.findPath; window.findPath=function(a,b,c,d){__calls++; const r=fp(a,b,c,d); if(!r){__fail++; window.__lastFail=[a,b,c,d];} return r;}; }""")
    for day in ('Mon','Fri'):
        if day=='Fri': pg.evaluate("()=>{ ST.day=5; startDay(); }")
        r=pg.evaluate("""(mins)=>{ const G=__game; __fail=0; __calls=0; let goalAt=null, maxC=0; const per=[];
          for(let s=0; s<mins*60*20; s++){ __U(0.05); if(G.RT.menu==='goal') closeMenu(); maxC=Math.max(maxC,G.RT.custs.length);
            if(goalAt===null && earnedToday()>=dayGoal()) goalAt=+(s/20/60).toFixed(1); if(s%(60*20)===0) per.push(Math.round(earnedToday())); }
          return {day:weekday(), goal:dayGoal(), earned:Math.round(earnedToday()), perMin:Math.round(earnedToday()/mins), idleGoalMin:goalAt, served:G.RT.day.served, custsNow:G.RT.custs.length, maxCusts:maxC,
            avgMood:Math.round(G.RT.day.moods.reduce((a,b)=>a+b,0)/Math.max(1,G.RT.day.moods.length)), empty:G.RT.day.emptyHits, fail:__fail, calls:__calls, lastFail:window.__lastFail||null, byMinute:per}; }""", mins)
        print(json.dumps(r))
    print('errors:',errs[:5]); b.close()
