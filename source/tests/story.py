# the main story (10 chapters over two work weeks) + the Big Cheese heist, played step by step with the boss's own actions
import os, json
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL=lambda p: 'file:///'+os.path.join(ROOT,p).replace('\\','/').lstrip('/')
from playwright.sync_api import sync_playwright
res=[]
def check(name, cond, val=''): res.append(('PASS' if cond else 'FAIL')+' '+name+' '+str(val))
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1280,'height':800}); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)+' '+(e.stack or '')[:240]))
    pg.goto(URL('dist.html')); pg.wait_for_timeout(800); pg.click('#t-new'); pg.wait_for_timeout(300)
    E=lambda js: pg.evaluate(js)
    E("window.U=window.update; window.update=()=>{}; window.step=(s)=>{for(let i=0;i<s*20;i++){ U(0.05); if(RT.menu==='goal') closeMenu(); }}")
    E("""
    window.drain=()=>{ for(let i=0;i<40&&RT.dialog;i++){ RT.dialog.shown=RT.dialog.text.length; if(RT.dialog.choices){ const b=document.querySelector('#dl-choices button'); if(b) b.click(); } else advanceDialog(); } };
    // stand next to a target (px,py) facing it, then press Space through the game's own action
    window.faceAt=(px,py)=>{ const tx=Math.floor(px/16), ty=Math.floor((py-4)/16); for(const [dx,dy,d] of [[0,1,'up'],[-1,0,'right'],[1,0,'left'],[0,-1,'down'],[0,2,'up'],[-1,1,'up'],[1,1,'up']]){ const x=tx+dx,y=ty+dy; if(!inb(x,y)||W.solid[idx(x,y)]) continue; PL.x=x*16+8; PL.y=y*16+12; PL.dir=d; PL.vx=PL.vy=0; PL.onCash=null; return true; } return false; };
    window.press=()=>{ render(); doAction(); drain(); };
    window.doStep=(line)=>{ drain(); const st=curStep(line); if(!st) return 'none';
      if(st.t==='goal'){ RT.day.sales+=dayGoal(); step(0.2); return 'goal'; }
      if(st.t==='talk'){ const g=W.givers.find(g=>g.gv.name===st.who); if(g){ faceAt(g.px,g.py+2); const t=targetInfo(); if(!t||t.act!=='giver') return 'cant face '+st.who; press(); return 'talk'; }
        const s=RT.staff.find(s=>s.name===st.who); if(!s) return 'no '+st.who; PL.x=s.x+10; PL.y=s.y; PL.dir='left'; PL.onCash=null; const t=targetInfo(); if(!t||t.act!=='talkStaff') return 'cant face staff '+st.who+' '+(t&&t.act); press(); return 'talk'; }
      if(st.t==='npc'||st.t==='chase'){ const n=RT.snpcs.find(n=>n.id===st.npc); if(!n) return 'no npc '+st.npc; if(st.t==='chase'){ PL.x=n.x+6; PL.y=n.y; step(0.1); return 'chase'; }
        n.state='idle'; n.timer=99; PL.x=n.x-12; PL.y=n.y; PL.dir='right'; const t=targetInfo(); if(!t||t.act!=='snpc') return 'cant face npc '+(t&&t.act); press(); return 'npc'; }
      if(st.t==='inspect'){ const c=RT.clues.find(c=>c.clue===st.clue); if(!c) return 'no clue '+st.clue; for(const [dx,dy,d] of [[0,1,'up'],[-1,0,'right'],[1,0,'left'],[0,-1,'down']]){ const x=c.x+dx,y=c.y+dy; if(!inb(x,y)||W.solid[idx(x,y)]) continue; PL.x=x*16+8; PL.y=y*16+12; PL.dir=d; PL.onCash=null; const t=targetInfo(); if(t&&t.act==='clue'){ press(); return 'inspect'; } } return 'cant face clue '+st.clue; }
      if(st.t==='mop'){ PL.tool=1; for(const s of RT.spills.filter(s=>s.story)) { for(let k=0;k<3;k++){ PL.x=s.x*16+8; PL.y=(s.y-1)*16+12; PL.dir='down'; press(); } } PL.tool=0; step(0.2); return 'mop'; }
      if(st.t==='fix'){ const o=W.objs.find(o=>o.anim===st.anim); PL.tool=2; faceAt(o.x*16+8,(o.y+o.h-1)*16+12); for(let k=0;k<4;k++) press(); PL.tool=0; step(0.2); return 'fix'; }
      if(st.t==='inspection'){ RT.spills=[]; ST.cheeseTemp=34; DEPTS.forEach(d=>{ if(d.max) ST.stock[d.id]=d.max; }); step(25); RT.spills=[]; step(1); return 'inspection'; }
      if(st.t==='stakeout'){ if(!RT.goalHit){ RT.day.sales+=dayGoal(); step(0.2); } closeMenu(); closeUp(); drain(); const h=RT.snpcs.find(n=>n.id==='hood'); if(!h) return 'no hood '+RT.stakeout; PL.x=h.x+4; PL.y=h.y; step(0.2); drain(); step(0.2); return 'stakeout'; }
      if(st.t==='pa'){ const o=W.objs.find(o=>o.type==='pa'); faceAt(o.x*16+8,o.y*16+12); const t=targetInfo(); if(!t||t.kind!=='pa') return 'cant face pa '+(t&&t.label); render(); doAction(); drain(); return 'pa'; }
      return 'unknown '+st.t; };
    window.endTheDay=()=>{ drain(); if(!RT.goalHit){ RT.day.sales+=dayGoal(); step(0.2); } closeMenu(); closeUp(); drain(); step(5); drain(); const b=document.getElementById('m-next'); if(b) b.click(); step(0.6); drain(); step(0.2); drain(); };
    """)
    E("drain(); step(1); drain()")
    log=[]; chapters=[]
    for day in range(12):
        ch0=E("S().ch"); title=E("mainChapter()?mainChapter().title:'(over)'")
        for k in range(12):
            if E("!mainChapter() || S().dayStarted!==ST.day || chapterDone('main')"): break
            r=E("doStep('main')"); log.append((day+1, title, r))
            if r in ('none',) or r.startswith(('cant','no ','unknown')): break
        done=E("chapterDone('main') || S().done"); chapters.append((title, done))
        if day==1:  # crank the Big Cheese on day 2 to start the heist
            E("(()=>{ const o=W.objs.find(o=>o.type==='bigcheese'); faceAt(o.x*16+24,(o.y+1)*16+12); PL.tool=0; render(); const t=targetInfo(); if(t&&t.act==='cheese') doAction(); drain(); })()")
            heist0=E("ST.heist.state")
        if E("ST.heist.state")=='missing':
            gone=E("cheeseGone()")
            for k in range(10):
                if E("ST.heist.state")!='missing': break
                r=E("doStep('heist')"); log.append(('heist', r))
                if r.startswith(('cant','no ','unknown','none')): break
            heistDone=E("ST.heist.state")
        if E("S().done"): break
        E("endTheDay()")
    names=[c[0] for c in chapters]
    check('all 10 chapters of the main story can be played through', E("S().done") and len([c for c in chapters if c[1]])>=10, chapters)
    check('the steps all went through the normal actions', not [l for l in log if str(l[-1]).startswith(('cant','no ','unknown'))], [l for l in log if str(l[-1]).startswith(('cant','no ','unknown'))][:4])
    check('cranking the Big Cheese on day 2 starts the heist side quest', heist0=='hint', heist0)
    check('the heist plays through: cheese missing next day, crumbs, chase, back with Gus', heistDone=='done' and E("!cheeseGone()"), heistDone)
    check('workers gossip about the story while it runs', E("(()=>{ ST.story.done=false; ST.story.ch=2; ST.story.dayStarted=ST.day; let n=0; for(let i=0;i<40;i++){ if(storyGossip('Gus','Hank')) n++; } return n>5; })()"))
    check('no errors', not errs, errs[:3])
    print('\n'.join(res)); print('log:', [l for l in log if l[0]=='heist' or l[0] in (2,3,4)]); print('errors:', errs[:3]); b.close()
