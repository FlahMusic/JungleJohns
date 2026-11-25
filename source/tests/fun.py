# rooms, secrets and pokeable things, played with Space where the player would press it; plus mid-day save
import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL=lambda p: 'file:///'+os.path.join(ROOT,p).replace('\\','/').lstrip('/')
from playwright.sync_api import sync_playwright
res=[]
def check(name, cond, val=''): res.append(('PASS' if cond else 'FAIL')+' '+name+' '+str(val))
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1280,'height':800}); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL('dist.html')); pg.wait_for_timeout(800); pg.click('#t-new'); pg.wait_for_timeout(300); pg.keyboard.press('Space'); pg.keyboard.press('Space')
    E=lambda js: pg.evaluate(js)
    E("window.U=window.update; window.update=()=>{}; window.step=(s)=>{for(let i=0;i<s*20;i++) U(0.05)}")
    # stand on a free tile next to an object, facing it, so Space acts on it
    E("""window.face=(o)=>{ for(const [dx,dy,d] of [[0,o.h,'up'],[0,-1,'down'],[-1,0,'right'],[o.w,0,'left']]){ const x=o.x+dx,y=o.y+dy; if(!inb(x,y)||W.solid[idx(x,y)]) continue;
        PL.x=x*16+8; PL.y=y*16+12; PL.dir=d; PL.vx=PL.vy=0; PL.onCash=null; const t=targetInfo(); if(t&&t.o===o) return true; } return false; };
      window.obj=(type,f)=>W.objs.find(o=>o.type===type&&(!f||f(o))); window.closeD=()=>{ for(let i=0;i<5&&RT.dialog;i++){ if(RT.dialog.choices){closeDialog();break;} RT.dialog.shown=RT.dialog.text.length; advanceDialog(); } };""")
    def press(): E("render()"); pg.keyboard.press('Space'); E("closeD()")
    def space_on(js):
        ok=E(f"face({js})"); press(); return ok
    # restroom: in through a porta-potty, the dryer blows you across, out the door back where you were
    ok=space_on("obj('restroom')")
    check('Space on a porta-potty door goes into the restroom', ok and E("RT.room")=='throne' and E("F().found.throne")==True, E("RT.room"))
    E("step(0.5)"); pg.screenshot(path=os.path.join(ROOT,'tests','out_room_throne.png'))
    space_on("obj('dryer')"); y1=E("PL.y"); E("step(0.4)"); y2=E("PL.y")
    check('the hand dryer blows you across the room', y2-y1>20 and E("F().found.dryer")==True, (y1,y2))
    check('the camera stays on the room', E("ROOMS.throne.x0*16") <= E("R.cx+R.vw/2") <= E("(ROOMS.throne.x1+1)*16"), E("(R.cx+R.vw/2)/16"))
    # out of order stall: knocking does nothing, three wrench hits open the stairs to the cheese cave
    space_on("obj('stall',o=>o.n===2)"); check('knocking on stall 3 says it needs a wrench', E("RT.room")=='throne' and 'wrench' in E("flashMsg?flashMsg.text:''"))
    pg.keyboard.press('3')
    for i in range(3): space_on("obj('stall',o=>o.n===2)")
    E("closeD()"); E("step(0.1)")
    check('three wrench hits open stall 3 onto the cheese cave', E("RT.room")=='cave' and E("F().found.stall && F().found.cave")==True, E("RT.room"))
    pg.keyboard.press('1'); E("step(0.5)"); pg.screenshot(path=os.path.join(ROOT,'tests','out_room_cave.png'))
    space_on("obj('roomdoor',o=>o.room==='cave')")
    bc=E("(()=>{const o=obj('bigcheese');return [o.x,o.y]})()")
    check('the cave stairs come up at the Big Cheese', E("RT.room")==None and abs(E("PL.x")/16-bc[0]-1)<2 and abs(E("PL.y")/16-bc[1]-2.5)<2, (E("PL.x/16"),E("PL.y/16"),bc))
    # the hollow knock: crank the cooler while it's cold, twice
    E("F().found.cave=false; ST.cheeseTemp=34"); space_on("obj('bigcheese')")
    check('cranking a cold Big Cheese sounds hollow', 'hollow' in E("flashMsg?flashMsg.text:''"), E("flashMsg&&flashMsg.text"))
    space_on("obj('bigcheese')"); E("step(0.1)")
    check('cranking it again opens the way to the cave', E("RT.room")=='cave', E("RT.room"))
    space_on("obj('roomdoor',o=>o.room==='cave')")
    # stage door: locked until Elvis has sung 3 times today, then it's his dressing room
    space_on("obj('stagedoor')"); check('the stage door is locked at first', E("RT.room")==None)
    E("RT.fun.elvisSang=3"); space_on("obj('stagedoor')")
    check('after three songs the stage door opens backstage', E("RT.room")=='backstage', E("RT.room"))
    E("step(0.5)"); pg.screenshot(path=os.path.join(ROOT,'tests','out_room_backstage.png'))
    space_on("obj('rider')"); check('reading the rider sets up the honey job', E("F().riderRead")==True)
    E("PL.carry=['natural']"); space_on("obj('vanity')")
    check('leaving a Natural crate at the vanity is honey for Elvis', E("F().found.honey")==True and E("PL.carry.length")==0)
    space_on("obj('jumprack')"); check('the rack puts you in a jumpsuit', E("PL.outfit")=='jumpsuit')
    space_on("obj('roomdoor',o=>o.room==='backstage')"); check('leaving the dressing room comes out at the stage door', E("RT.room")==None)
    # penguins: pat all seven
    E("for(const id of ['throne','cave','backstage']) F().peng[id]=true")
    for pid in ['frozen1','frozen2','deck','beer']: space_on(f"obj('penguin',o=>o.pid==='{pid}')")
    check('patting all 7 penguins finishes the census', E("F().found.penguins")==True, E("Object.keys(F().peng)"))
    # Todd: look twice, pick him up, take him to the boat
    for i in range(3): space_on("obj('tank',o=>o.kind==='lobster')")
    check('the third look picks Todd up', E("F().items.todd")==True)
    space_on("obj('anim',o=>o.anim==='minnow')"); check('Todd goes on the boat', E("F().found.todd")==True and E("F().toddBoat")==True)
    # trash, capsules, wishes, plants
    m0=E("ST.money"); space_on("obj('capsule')"); check('the capsule machine takes $1 and gives a capsule', E("Object.keys(F().caps).length")==1 and abs(E("ST.money")-(m0-1))<0.01)
    E("ST.money=50"); [space_on("obj('pond')") for i in range(5)]; space_on("obj('pond')")
    check('five wishes a day, then the hippo stops', E("RT.fun.wishes")==5 and 'enough' in E("flashMsg?flashMsg.text:''"))
    for i in range(7): space_on("obj('plant',o=>o.x<SW)")
    check('watering a plastic plant 7 times makes it bloom', E("F().found.bloom")==True and E("obj('plant',o=>o.x<SW).frame")==1)
    space_on("obj('trash')"); space_on("obj('trash')"); check('each trash can once a day', 'already' in E("flashMsg?flashMsg.text:''"))
    # Reginald + the golden plunger
    E("F().found.plunger=false; F().plungerQ=false"); E("enterRoom('throne')"); space_on("obj('staff',o=>o.npc==='reginald')")
    can=E("F().plungerCan"); check('Reginald hides the golden plunger in a trash can', bool(can), can)
    E("RT.fun.trash={}"); E("leaveRoom()"); space_on(f"obj('trash',o=>o.key==='{can}')"); check('the plunger is in that can', E("F().items.plunger")==True)
    E("enterRoom('throne')"); space_on("obj('staff',o=>o.npc==='reginald')"); E("leaveRoom()")
    check('returning it pays and the mop cleans in one swipe', E("F().found.plunger")==True)
    E("RT.spills.push({id:9999,x:Math.floor(PL.x/16),y:Math.floor((PL.y-3)/16),kind:'milk',hp:3})"); pg.keyboard.press('2'); press(); pg.keyboard.press('1')
    check('golden mop: one swipe', E("RT.spills.filter(s=>s.id===9999).length")==0)
    # quest log lists secrets
    pg.keyboard.press('KeyJ'); txt=pg.inner_text('#menu-box'); pg.keyboard.press('KeyJ')
    check('the quest log lists the secrets', 'Secrets' in txt and 'found' in txt)
    # mid-day save: accept a job, make progress, reload, continue
    E("Object.assign(RT.day,{sales:777}); acceptQuest(RT.quests[0]); RT.quests[0].got=1; PL.x=W.spots.skate[0]*16; PL.y=W.spots.skate[1]*16; saveMid()")
    pg.reload(); pg.wait_for_timeout(800); pg.click('#t-cont'); pg.wait_for_timeout(300)
    check('mid-day continue keeps the day so far', abs(pg.evaluate("RT.day.sales")-777)<0.01 and pg.evaluate("RT.quests[0].state")=='active' and pg.evaluate("RT.quests[0].got")==1, pg.evaluate("[RT.day.sales,RT.quests[0].state,RT.quests[0].got]"))
    check('...and where you stood', abs(pg.evaluate("PL.x")-pg.evaluate("W.spots.skate[0]*16"))<1)
    check('...and the secrets', pg.evaluate("F().found.plunger")==True)
    print('\n'.join(res)); print('errors:',errs); b.close()
