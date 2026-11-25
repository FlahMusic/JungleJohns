# people: personas, portraits, regulars whose stories move on, patience running out, shoppers talking to each other
import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL=lambda p: 'file:///'+os.path.join(ROOT,p).replace('\\','/').lstrip('/')
from playwright.sync_api import sync_playwright
res=[]
def check(name, cond, val=''): res.append(('PASS' if cond else 'FAIL')+' '+name+' '+str(val))
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1280,'height':800}); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)+' '+(e.stack or '')[:300]))
    pg.goto(URL('dist.html')); pg.wait_for_timeout(800); pg.click('#t-new'); pg.wait_for_timeout(300); pg.keyboard.press('Space'); pg.keyboard.press('Space')
    E=lambda js: pg.evaluate(js)
    E("window.U=window.update; window.update=()=>{}; window.step=(s)=>{for(let i=0;i<s*20;i++) U(0.05)}; RT.huddle=null; while(RT.dialog){ RT.dialog.shown=999; advanceDialog(); }") # skip the morning huddle (t2 covers it)
    # a shopper standing still in the open, the boss facing them
    E("""window.stand=(c)=>{ const s=W.spots.skate; c.x=(s[0]+2)*16; c.y=s[1]*16; c.state='loiter'; c.timer=999; c.path=null; c.bubble=null; c.list=[]; PL.x=c.x-12; PL.y=c.y; PL.dir='right'; PL.vx=PL.vy=0; PL.onCash=null; };
      window.closeD=()=>{ for(let i=0;i<5&&RT.dialog;i++){ RT.dialog.shown=RT.dialog.text.length; advanceDialog(); } };""")
    def talk(): E("render()"); pg.keyboard.press('Space')
    E("window.C=spawnCustomer('adult'); C.kid=null; C.p=null; makePersona(C); C.p.reg=null; C.p.patience=3; C.p.att='chatty'; stand(C)")
    check('everyone who walks in has a name and an attitude', E("RT.custs.every(c=>c.p && c.p.name && c.p.att)"))
    E("render(); updateUI(0.016)"); pr=pg.inner_text('#prompt')
    check('the prompt says who you\'d talk to', E("C.p.name") in pr, pr)
    talk(); E("RT.dialog&&(RT.dialog.shown=999); updateUI(0.016)")
    check('talking opens a dialog with their name and a portrait', pg.is_visible('#dialog') and E("C.p.name") in pg.inner_text('#dl-name') and pg.is_visible('#dl-face'), pg.inner_text('#dl-name'))
    pg.screenshot(path=os.path.join(ROOT,'tests','out_portrait.png'))
    E("closeD()")
    # keep talking: annoyed bubbles, a warning, then they snap (shove or storm out)
    seen=[]; snapped=False
    for i in range(8):
        x0,y0=E("PL.x"),E("PL.y"); E("stand(C); C.bubble=null"); talk(); E("closeD()")
        seen.append(E("C.bubble?C.bubble.text:''"))
        if E("!!C.stormed") or abs(E("PL.vx"))>100 or E("C.p.cold>0"): snapped=True; break
    check('pestering someone runs out their patience and they snap', snapped, seen)
    check('...and then they give you the cold shoulder', E("C.p.cold>0"))
    talk(); E("closeD()"); check('a cold shoulder is one-word answers, not a dialog', not pg.is_visible('#dialog') and E("C.bubble&&C.bubble.text.length<12"), E("C.bubble&&C.bubble.text"))
    # regulars: same person, a new chapter of their life on each day you talk to them
    E("window.R=spawnCustomer('old'); R.kid=null; dressRegular(R, REG.carol); RT.custs=[R]; stand(R)"); talk(); t1=E("RT.dialog?RT.dialog.text:''"); E("closeD()")
    check('a regular tells you about their life', 'bird feeder' in t1, t1[:60])
    E("ST.day=2; RT.regDay=null; window.R2=spawnCustomer('old'); R2.kid=null; dressRegular(R2, REG.carol); RT.custs=[R2]; stand(R2)"); talk(); t2=E("RT.dialog?RT.dialog.text:''"); E("closeD()")
    check('the next day their story has moved on', t2!=t1 and len(t2)>10, t2[:60])
    check('...in different clothes', E("R.look.shirt!==R2.look.shirt || R.look.pants!==R2.look.pants || R.look.pattern!==R2.look.pattern"), (E("R.look.shirt"),E("R2.look.shirt")))
    # shoppers who pass each other talk (or bicker), one after the other
    E("""(()=>{ RT.custs.forEach(c=>c.bubble=null); window.A=spawnCustomer('adult'); window.B=spawnCustomer('adult'); for(const [c,dx] of [[A,0],[B,1]]){ c.kid=null; c.x=(W.spots.skate[0]+10+dx)*16; c.y=W.spots.skate[1]*16; c.state='loiter'; c.timer=999; c.bubble=null; c.p.att='chatty'; c.metId=null; }
      RT.custs=RT.custs.filter(c=>c===A||c===B); RT.meetT=0; shopperMeet(); })()""")
    a1=E("A.bubble&&A.bubble.text"); E("step(2)"); b1=E("B.bubble&&B.bubble.text")
    check('two shoppers who pass each other have a little exchange', bool(a1) and bool(b1), (a1,b1))
    check('no errors', not errs, errs[:3])
    print('\n'.join(res)); print('errors:',errs); b.close()
