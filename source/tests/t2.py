import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL=lambda p: 'file:///'+os.path.join(ROOT,p).replace('\\','/').lstrip('/')
import json
from playwright.sync_api import sync_playwright
res=[]
def check(name, cond, val=''):
    res.append(('PASS' if cond else 'FAIL')+' '+name+' '+str(val)); 
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1280,'height':800})
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL('dist.html')); pg.wait_for_timeout(800)
    pg.click('#t-new'); pg.wait_for_timeout(300)
    check('intro dialog visible', pg.is_visible('#dialog'))
    pg.keyboard.press('Space'); pg.keyboard.press('Space'); pg.wait_for_timeout(200)
    check('dialog closed', not pg.is_visible('#dialog'))
    E=lambda js: pg.evaluate(js)
    x0=E("__game.PL.x"); pg.keyboard.down('ArrowLeft'); pg.wait_for_timeout(700); pg.keyboard.up('ArrowLeft'); x1=E("__game.PL.x")
    check('holding left skates player left', x1 < x0-20, (x0,x1))
    pg.wait_for_timeout(1500); pg.keyboard.press('KeyR'); pg.wait_for_timeout(100)
    check('R takes skates off', E("__game.PL.walk")==True and 'walking' in pg.inner_text('#h-tool'), pg.inner_text('#h-tool'))
    x0=E("__game.PL.x"); pg.keyboard.down('ArrowLeft'); pg.wait_for_timeout(500); pg.keyboard.up('ArrowLeft'); x1=E("__game.PL.x"); pg.wait_for_timeout(300); x2=E("__game.PL.x")
    check('walking moves, slower than skating', 10 < x0-x1 < 30, (x0,x1))
    check('walking stops dead on release', abs(x2-x1) < 2, (x1,x2))
    pg.keyboard.press('KeyR'); pg.wait_for_timeout(50)
    check('R puts skates back on', not E("__game.PL.walk"))
    # freeze sim clock: run updates manually
    E("window.U=window.update; window.update=()=>{}; window.step=(s)=>{for(let i=0;i<s*20;i++) U(0.05)}")
    def place(tx,ty,d): E(f"(()=>{{const P=__game.PL;P.x={tx}*16+8;P.y={ty}*16+12;P.vx=P.vy=0;P.dir='{d}';}})()")
    pal=E("(()=>{const p=__game.W.pallets.find(p=>p.crate==='produce');return [p.x,p.y]})()")
    place(pal[0],pal[1]+1,'up'); m0=E("__game.ST.money")
    E("render()"); pg.keyboard.press('Space'); m1=E("__game.ST.money"); c=E("__game.PL.carry.slice()")
    check('grab produce crate from pallet', c==['produce'] and m1<m0, (c,m0,m1))
    fr=E("(()=>{const f=__game.W.fronts.produce.find(f=>f[2].y<f[1]);return [f[0],f[1]]})()")
    E("__game.ST.stock.produce=10"); place(fr[0],fr[1],'up'); pg.keyboard.press('Space')
    check('restock produce from crate', E("__game.ST.stock.produce")==30 and E("__game.PL.carry.length")==0, E("__game.ST.stock.produce"))
    # prompt text appears when facing shelf
    E("render(); updateUI(0.016)"); pr=pg.inner_text('#prompt')
    check('prompt shows stock when facing shelf', 'Produce' in pr, pr)
    # lost customer
    E("""(()=>{const G=__game; const c=spawnCustomer('adult'); c.list=[]; c.cur='wine'; c.state='lost'; c.timer=60; c.lostItem='ohio wine'; c.x=G.PL.x; c.y=G.PL.y+14; bubble(c,'?',999,'q'); window.LC=c; })()""")
    E("__game.PL.dir='down'; render()"); pg.keyboard.press('Space'); pg.wait_for_timeout(100)
    check('talking to lost customer starts escort', E("LC.state")=='follow' and pg.is_visible('#dialog'), E("LC.state"))
    pg.keyboard.press('Space'); pg.keyboard.press('Space')
    # walk player into wine (teleport near), customer follows
    h0=E("__game.RT.day.helped")
    E("(()=>{const d=__game.DEPT.wine; const f=W.fronts.wine[0]; const P=__game.PL; P.x=(f[0]+0.5)*16; P.y=(f[1]+0.7)*16; LC.x=P.x; LC.y=P.y-2; })()"); E("step(3)")
    check('escorted customer reaches wine and tips', E("__game.RT.day.helped")==h0+1 and E("__game.RT.day.tips")>0, (E("__game.RT.day.helped"),E("LC.state")))
    # mop
    place(32,34,'down'); E("__game.RT.spills.push({id:999,x:32,y:35,kind:'milk',hp:3})"); pg.keyboard.press('2')
    for i in range(3): pg.keyboard.press('Space')
    check('mop cleans spill in 3 swipes', E("__game.RT.spills.filter(s=>s.id===999).length")==0)
    # wrench elvis
    el=E("(()=>{const o=__game.W.objs.find(o=>o.anim==='elvis');return [o.x,o.y,o.h]})()")
    E("__game.ST.anims.elvis.broken=true; __game.ST.anims.elvis.fix=0"); place(el[0],el[1]+el[2],'up'); pg.keyboard.press('3')
    for i in range(4): pg.keyboard.press('Space')
    check('wrench fixes Elvis in 4 hits', E("__game.ST.anims.elvis.broken")==False)
    # feed fish
    tk=E("(()=>{const o=__game.W.tanks[0];return [o.x,o.y]})()"); place(tk[0],tk[1]+1,'up'); pg.keyboard.press('4'); pg.keyboard.press('Space')
    check('fish food feeds tanks', E("__game.ST.fedToday")==True)
    # cheese cooler
    E("__game.ST.cheeseTemp=48"); bc=E("(()=>{const o=__game.W.objs.find(o=>o.type==='bigcheese');return [o.x,o.y]})()"); place(bc[0],bc[1]+2,'up'); pg.keyboard.press('1'); pg.keyboard.press('Space')
    check('cranking big cheese cooler cools it', E("__game.ST.cheeseTemp")<40, E("__game.ST.cheeseTemp"))
    # register
    ln=E("(()=>{const l=__game.W.lanes[3];return [l.cash[0],l.cash[1]]})()"); place(ln[0],ln[1]+0.0,'right'); E("step(0.1)")
    check('player standing at register opens it', E("__game.PL.onCash && __game.PL.onCash.i")==3)
    E("""(()=>{const c=spawnCustomer('old'); c.kid=null; c.list=[]; c.items=3; c.spend=30; c.x=38.5*16; c.y=38*16; const l=__game.W.lanes[3]; l.queue=[c]; c.lane=l; c.state='queue'; c.scanned=0; c.wait=0; queueMove(l); window.QC=c; })()""")
    E("step(3)"); m0=E("__game.ST.money")
    for i in range(3): pg.keyboard.press('Space')
    check('player scans 3 items and gets paid', E("__game.ST.money")-m0>=29.9 and E("QC.state")=='walk', (E("__game.ST.money")-m0, E("QC.state")))
    # sleep
    E("(()=>{const P=__game.PL; P.x=W.spots.bed[0]*16; P.y=(W.spots.bed[1]-0.5)*16+12; P.dir='down';})()"); E("step(0.05); render()"); pg.keyboard.press('Space'); E("RT.dialog && (RT.dialog.shown=999); updateUI(0.016)")
    check('couch asks to sleep early', pg.is_visible('#dl-choices'))
    pg.keyboard.press('Space')
    check('sleeping started', E("__game.RT.sleeping")==True)
    E("(()=>{for(let i=0;i<40000 && __game.RT.menu!=='report';i++) U(0.05)})()")
    check('day ends with report', E("__game.RT.menu")=='report' and 'is done' in pg.inner_text('#menu-box'), E("__game.RT.menu"))
    pg.screenshot(path=os.path.join(ROOT,'tests','out_')+'report.png')
    # catalog buy
    E("__game.ST.money=20000"); pg.click('#m-cat'); pg.wait_for_timeout(100); pg.screenshot(path=os.path.join(ROOT,'tests','out_')+'catalog.png')
    pg.click('[data-buy=toys]'); 
    check('buying toys unlocks aisle', E("__game.ST.ups.toys")==True and E("(__game.W.fronts.toys||[]).length")>0)
    pg.click('#m-close'); pg.wait_for_timeout(50); pg.click('#m-next'); pg.wait_for_timeout(50); E("updateUI(0.016)")
    check('next day starts', 'Day 2' in pg.inner_text('#h-day'), pg.inner_text('#h-day'))
    money=E("__game.ST.money")
    pg.reload(); pg.wait_for_timeout(800)
    check('continue button after reload', pg.is_visible('#t-cont'))
    pg.click('#t-cont'); pg.wait_for_timeout(200); pg.evaluate("updateUI(0.016)")
    check('continue restores day + money + upgrade', 'Day 2' in pg.inner_text('#h-day') and abs(E("__game.ST.money")-money)<1 and E("__game.ST.ups.toys")==True, (pg.inner_text('#h-day'),E("__game.ST.money"),money))
    print('\n'.join(res)); print('errors:',errs[:5]); b.close()
