# side quests + the work week, played with real key presses where the player would press keys
import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL=lambda p: 'file:///'+os.path.join(ROOT,p).replace('\\','/').lstrip('/')
import json
from playwright.sync_api import sync_playwright
res=[]
def check(name, cond, val=''): res.append(('PASS' if cond else 'FAIL')+' '+name+' '+str(val))
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1280,'height':800}); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL('dist.html')); pg.wait_for_timeout(800); pg.click('#t-new'); pg.wait_for_timeout(300); pg.keyboard.press('Space'); pg.keyboard.press('Space')
    E=lambda js: pg.evaluate(js)
    E("window.U=window.update; window.update=()=>{}; window.step=(s)=>{for(let i=0;i<s*20;i++) U(0.05)}")
    # helpers in the page: stand where Space would talk to a giver / hand a sample to a customer
    E("""window.Q=id=>RT.quests.find(q=>q.g.gv.id===id);
    window.faceGiver=id=>{ const g=W.givers.find(g=>g.gv.id===id); for(const [dx,dy,d] of [[0,2,'up'],[0,1,'up'],[1,0,'left'],[-1,0,'right'],[0,-1,'down'],[1,2,'up'],[-1,2,'up']]){ const x=g.o.x+dx,y=g.o.y+dy; if(!inb(x,y)||W.solid[idx(x,y)]) continue; PL.x=x*16+8; PL.y=y*16+12; PL.dir=d; const t=targetInfo(); if(t&&t.act==='giver'&&t.g===g) return true; } return false; };
    window.inZone=(c,zs)=>zs.includes(custZone(c));
    window.faceCust=c=>{ for(const [dx,dy,d] of [[-12,0,'right'],[12,0,'left'],[0,-12,'down'],[0,14,'up']]){ PL.x=c.x+dx; PL.y=c.y+dy; PL.dir=d; PL.onCash=null; const t=targetInfo(); if(t&&t.act==='sample'&&t.c===c) return true; } return false; }; 0""")
    check('9 quest givers stand in the store, each with a job on offer (!)', E("W.givers.length")==9 and E("W.givers.every(g=>giverMarker(g)==='!')"), E("W.givers.map(g=>g.gv.id+':'+giverMarker(g)).join(' ')"))
    check('every giver can be reached and talked to', E("W.givers.every(g=>faceGiver(g.gv.id) && !!findPath(W.spots.mainDoorIn[0],W.spots.mainDoorIn[1],PL.x/16,PL.y/16))"), E("W.givers.filter(g=>!faceGiver(g.gv.id)).map(g=>g.gv.id)"))
    # --- take Gus's cheese job with the keyboard ---
    E("faceGiver('gus'); render()"); pg.keyboard.press('Space'); E("RT.dialog&&(RT.dialog.shown=999); updateUI(0.016)")
    check('talking to Gus offers the job with Accept / Not now', pg.is_visible('#dl-choices') and 'Accept' in pg.inner_text('#dl-choices'), pg.inner_text('#dialog')[:90])
    pg.keyboard.press('Space')
    n=E("Q('gus').n"); check('Space accepts it; marker turns to a grey ?', E("Q('gus').state")=='active' and E("giverMarker(Q('gus').g)")=='grey?', n)
    E("step(35)")
    crowd=E("RT.custs.filter(c=>c.type!=='kid' && inZone(c,['cheese']) && !(c.sampled&&c.sampled[Q('gus').key])).length")
    check(f'the Cheese Shop fills up with people to sample (want {min(n,10)})', crowd>=min(n,10), crowd)
    gave=0
    for i in range(80):
        if E("Q('gus').state")!='active': break
        ok=E("(()=>{ const c=RT.custs.find(c=>canSample(c,Q('gus'))); if(!c) return false; return faceCust(c); })()")
        if ok: E("render()"); pg.keyboard.press('Space'); gave+=1
        E("step(0.6)")
        if gave==4 and not res[-1].startswith(('PASS people','FAIL people')):
            E("step(20)"); left=E("Q('gus').n-Q('gus').got")
            have=E("RT.custs.filter(c=>c.type!=='kid' && inZone(c,['cheese']) && !(c.sampled&&c.sampled[Q('gus').key])).length")
            check('people keep coming after some get a sample', have>=min(left,10), (have,left))
    check('handing out every sample finishes the job (yellow ?)', E("Q('gus').state")=='ready' and E("giverMarker(Q('gus').g)")=='?', (E("Q('gus').got"), gave))
    check('sampled customers say something', E("RT.custs.some(c=>c.bubble && SAMPLE_LINES.cheese.some(l=>say(l)===c.bubble.text))"))
    # arrow: go far away, the nearest finished job is Gus and he's off screen
    E("PL.x=6*16; PL.y=52*16; render()")
    check('the yellow arrow targets Gus when he is off screen', E("readyGiverTarget()===Q('gus').g && !onScreen(Q('gus').g.px,Q('gus').g.py)"))
    pg.screenshot(path=os.path.join(ROOT,'tests','out','quest-arrow.png'))
    m0=E("ST.money"); r=E("Q('gus').reward")
    E("faceGiver('gus'); render()"); pg.keyboard.press('Space')
    check('turning in pays the reward and counts toward the goal', E("Q('gus').state")=='done' and abs(E("ST.money")-m0-r)<0.01 and E("RT.day.quest")==r, (E("ST.money")-m0, r))
    pg.keyboard.press('Space'); pg.keyboard.press('Space')
    # --- other job types ---
    E("acceptQuest(Q('trixie')); step(45)")
    kids=E("RT.custs.filter(c=>c.type==='kid' && inZone(c,Q('trixie').def.zones)).length")
    check('a kids-only job brings families to Candy', kids>=min(E("Q('trixie').n"),10), kids)
    adult=E("(()=>{ const c=RT.custs.find(c=>c.type!=='kid' && inZone(c,Q('trixie').def.zones)); return c ? canSample(c,Q('trixie')) : 'none'; })()")
    check('adults cannot get a lollipop', adult in (False,'none'), adult)
    E("acceptQuest(Q('philippe')); step(30)")
    check('a pour job fills the tasting stools', E("W.stools.filter(s=>s.cust && s.cust.state==='sit').length")>=3, E("W.stools.filter(s=>s.cust).length"))
    E("acceptQuest(Q('hank')); questEvent('stock','wine')")
    check('restocking the wrong aisle does not count', E("Q('hank').got")==0)
    E("questEvent('stock','produce'); questEvent('stock','produce')")
    check('restocking produce twice finishes Hank', E("Q('hank').state")=='ready')
    # --- the work week ---
    days=[]; types=[]
    for d in range(5):
        types.append(E("Q('gus').def.type"))
        E("RT.day.sales += dayGoal(); step(0.1)")
        if E("RT.menu")=='goal': pg.click('#g-close')
        else: E("closeMenu(); closeUp()")
        E("step(5)"); days.append((E("RT.report.wd"),E("RT.report.goal"),E("RT.report.weekDone")))
        if d==4: wk=pg.inner_text('#menu-box')
        pg.click('#m-next'); pg.wait_for_timeout(30)
    check('a work week runs Monday to Friday with rising goals', [x[0] for x in days]==['Mon','Tue','Wed','Thu','Fri'] and all(days[i][1]<days[i+1][1] for i in range(4)), days)
    check('Gus has a different job each day', len(set(types))>=3, types)
    check('Friday ends the week with a celebration', days[4][2] and 'Week 1 done' in wk, wk[:60])
    check('next week starts Monday, asking more', E("weekday()")=='Mon' and E("weekNo()")==2 and E("dayGoal()")>days[0][1], (E("weekday()"),E("dayGoal()")))
    print('\n'.join(res)); print('errors:',errs[:5]); b.close()
