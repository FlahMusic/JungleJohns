import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL=lambda p: 'file:///'+os.path.join(ROOT,p).replace('\\','/').lstrip('/')
import json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1280,'height':800}); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL('dist.html')); pg.wait_for_timeout(700); pg.click('#t-new'); pg.wait_for_timeout(200); pg.keyboard.press('Space'); pg.keyboard.press('Space')
    r=pg.evaluate("""()=>{ const U=window.update; window.update=()=>{}; const P=__game.PL, K=KEYS; const step=(s)=>{for(let i=0;i<Math.round(s*60);i++) updatePlayer(1/60);};
      const reset=()=>{ P.x=38*16; P.y=34.6*16; P.vx=P.vy=0; for(const k in K)K[k]=false; }; const sp=()=>Math.hypot(P.vx,P.vy); const out={}; const ms=maxSpeed();
      reset(); K.KeyD=true; let t=0; while(sp()<0.9*ms && t<5){step(1/60);t+=1/60;} out.secsTo90pct=+t.toFixed(2);
      // stride pulses + poses alternate
      const speeds=[], poses=[]; for(let i=0;i<60;i++){ step(1/60); speeds.push(sp()); const ph=P.stride/P.period; poses.push(ph<0.45?(P.side?'L':'R'):'g'); }
      out.poseSeq=[...new Set(poses.join('').match(/L+|R+/g).map(s=>s[0]))].join('') ; out.pushesSeen=(poses.join('').match(/L+|R+/g)||[]).length;
      // coast
      P.x=30*16; P.y=34.6*16; P.vx=ms; P.vy=0; for(const k in K)K[k]=false; let x0=P.x; for(let i=0;i<600 && sp()>0.5;i++) step(1/60); out.coastTiles=+((P.x-x0)/16).toFixed(1);
      // brake
      P.x=30*16; P.y=34.6*16; P.vx=ms; P.vy=0; K.ShiftLeft=true; x0=P.x; for(let i=0;i<600 && sp()>0.5;i++) step(1/60); K.ShiftLeft=false; out.brakeTiles=+((P.x-x0)/16).toFixed(1);
      // carve: moving right full speed, steer down
      P.x=30*16; P.y=34.6*16; P.vx=ms; P.vy=0; K.KeyS=true; step(0.25); K.KeyS=false; out.carveKeepsSpeed=+(sp()/ms).toFixed(2); out.carveHeadingDeg=Math.round(Math.atan2(P.vy,P.vx)*57.3);
      // reverse: right at full speed, push left
      P.x=30*16; P.y=34.6*16; P.vx=ms; P.vy=0; K.KeyA=true; let rt=0; while(P.vx>0 && rt<3){step(1/60); rt+=1/60;} K.KeyA=false; out.secsToReverse=+rt.toFixed(2);
      // precision tap from rest
      reset(); x0=P.x; K.KeyD=true; step(0.1); K.KeyD=false; step(1.5); out.tapMovePx=+(P.x-x0).toFixed(1);
      out.maxSpeed=ms; return out; }""")
    print(json.dumps(r))
    # guard rails, not exact values: still feels like skating (quick start, real glide, brake works, carve keeps speed).
    # tune the feel freely inside these; today's numbers: 0.37 s, 2.5 tiles coast, 0.5 brake, 0.37 s T-stop, 72 px/s
    T=[('secsTo90pct',0.2,0.6),('coastTiles',1.5,4.0),('brakeTiles',0.2,1.0),('carveKeepsSpeed',0.9,1.0),('carveHeadingDeg',60,90),('secsToReverse',0.2,0.6),('tapMovePx',1.0,6.0),('maxSpeed',60,90)]
    for k,lo,hi in T: print(('PASS ' if lo<=r[k]<=hi else 'FAIL ')+k+' '+str(r[k])+f' (want {lo}-{hi})')
    # which leg goes first depends on frame timing; alternating is the rule
    print(('PASS ' if r['poseSeq'] in ('LR','RL') and r['pushesSeen']>=3 else 'FAIL ')+'strides alternate L/R '+r['poseSeq']+' '+str(r['pushesSeen']))
    print(errs); b.close()
