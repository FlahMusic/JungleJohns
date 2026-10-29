# music zones on the real map: neighbours fit together, and the song can't flip-flop on a boundary
import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL=lambda p: 'file:///'+os.path.join(ROOT,p).replace('\\','/').lstrip('/')
import json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1280,'height':800}); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL('dist.html')); pg.wait_for_timeout(700)
    # 1. every two departments you can walk between directly (touching, or across open floor) are at most one note apart
    r=pg.evaluate("""()=>{ const U={toys:1,gacha:1,tiktok:1,cards:1,sushi:1}; buildWorld(U); const S=MUSIC.SONGS;
      const pcs=s=>new Set(MUSIC.SCALES[S[s].scale].map(x=>(((x+S[s].key)%12)+12)%12));
      const song=i=>zoneSong(DEPTS[i].id), inStock=(x,y)=>x>=W.stockRect[0]&&x<=W.stockRect[2]&&y>=W.stockRect[1]&&y<=W.stockRect[3];
      const open=(x,y)=>inb(x,y)&&!W.outdoor[idx(x,y)]&&!W.wall[idx(x,y)]&&!inStock(x,y);
      const pairs=new Set(), N=[[1,0],[-1,0],[0,1],[0,-1]];
      for(let y=0;y<MH;y++) for(let x=0;x<MW;x++){ const z=W.zone[idx(x,y)]; if(z<0||!open(x,y)) continue;
        // flood across the open floor (zone -1) from this department's edge; first departments met are neighbours
        for(const [dx,dy] of N){ let q=[[x+dx,y+dy]], seen=new Set();
          while(q.length){ const [a,c]=q.pop(), k=idx(a,c); if(!open(a,c)||seen.has(k)) continue; seen.add(k); const z2=W.zone[k];
            if(z2>=0){ if(z2!==z) pairs.add([song(z),song(z2)].sort().join('|')); continue; }
            if(seen.size>400) break; for(const [ex,ey] of N) q.push([a+ex,c+ey]); } } }
      const bad=[], ok=[]; for(const pr of pairs){ const [a,c]=pr.split('|'); if(a===c) continue; const A=pcs(a),B=pcs(c); let d=0; A.forEach(v=>{ if(!B.has(v)) d++; }); (d<=1?ok:bad).push(pr+':'+d); }
      return {pairs:ok.length+bad.length, bad}; }""")
    print(('PASS' if not r['bad'] else 'FAIL'),'neighbouring departments are at most one note apart',r['pairs'],'pairs',r['bad'])
    # 2. in the game: wobbling across a boundary never changes the song; standing in a department does, once
    pg.click('#t-new'); pg.wait_for_timeout(200); pg.keyboard.press('Space'); pg.keyboard.press('Space')
    r=pg.evaluate("""()=>{ window.update=()=>{}; __game.ST.minute=11*60; AU.started=true; AU.music=AU.music||{gain:{}}; const calls=[]; MUSIC.set=(s,m)=>calls.push(s);
      let A=null,B=null; for(let y=0;y<MH&&!A;y++) for(let x=0;x<MW-1;x++){ const z=W.zone[idx(x,y)], z2=W.zone[idx(x+1,y)]; if(z>=0&&z2>=0&&zoneSong(DEPTS[z].id)!==zoneSong(DEPTS[z2].id)){A=[x,y];B=[x+1,y];break;} }
      const at=t=>{ __game.PL.x=t[0]*16+8; __game.PL.y=t[1]*16+10; musicTick(); };
      at(A); at(A); at(A); at(A); const start=calls[calls.length-1];
      for(let i=0;i<20;i++) at(i%2?A:B); const wobble=new Set(calls.slice(-20));
      for(let i=0;i<2;i++) at(B); const tooSoon=calls[calls.length-1];
      for(let i=0;i<3;i++) at(B); const settled=calls[calls.length-1];
      return {A:zoneSong(DEPTS[W.zone[idx(...A)]].id),B:zoneSong(DEPTS[W.zone[idx(...B)]].id),start,wobble:[...wobble],tooSoon,settled}; }""")
    print(('PASS' if r['wobble']==[r['A']] else 'FAIL'),'wobbling across a boundary keeps the song',r)
    print(('PASS' if r['tooSoon']==r['A'] and r['settled']==r['B'] else 'FAIL'),'standing in the next department switches after ~1.2 s')
    print('errors',errs); b.close()
