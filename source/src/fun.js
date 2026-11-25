// ===== fun: things to poke, secrets to find, rooms you can walk into =====
// rooms live past the store's east edge (x >= SW), walled off from it. you get in through doors (Space), the camera
// stays inside the room, the store keeps running while you're in there.
const ROOMS = {
  throne:    { name: 'The Throne Room', x0: 115, y0: 3, x1: 126, y1: 10, floor: 'marble', wall: 'marble', song: 'spa' },
  cave:      { name: 'The Cheese Cave', x0: 130, y0: 3, x1: 142, y1: 11, floor: 'stone', wall: 'cave', song: 'cave', exitTo: 'bigcheese' },
  backstage: { name: 'Elvis\'s Dressing Room', x0: 115, y0: 15, x1: 126, y1: 22, floor: 'redcarpet', wall: 'backstage', song: 'backstage', exitTo: 'stagedoor' },
};
const roomDoorX = r => Math.floor((r.x0 + r.x1) / 2);

// secrets: the quest log lists them, found or not (unfound ones show their hint)
const SECRETS = [
  { id: 'throne', name: 'The Throne Room', hint: 'The restrooms here won an award. Go see why.', reward: 100 },
  { id: 'dryer', name: 'Blown Away', hint: 'The hand dryer in the restroom is strong. Try it.', reward: 100 },
  { id: 'stall', name: 'Out of Order', hint: 'Reginald says the third stall has been broken since 1998. Bring a wrench.', reward: 200 },
  { id: 'cave', name: 'The Cheese Cave', hint: 'Crank the Big Cheese when it\'s already cold. Listen.', reward: 300 },
  { id: 'plunger', name: 'The Golden Plunger', hint: 'Ask the restroom attendant what went missing.', reward: 500 },
  { id: 'penguins', name: 'Penguin Census', hint: 'There are more penguins than the two by Frozen. Pat all 7.', reward: 500 },
  { id: 'gerald', name: 'Gerald', hint: 'Something lives in the trash cans. Say hi three times.', reward: 250 },
  { id: 'todd', name: 'Captain Todd', hint: 'One lobster in the live tanks has a name and a dream.', reward: 400 },
  { id: 'backstage', name: 'Backstage Pass', hint: 'Make Elvis sing a few times, then try the stage door in Candy.', reward: 300 },
  { id: 'honey', name: 'Honey for the King', hint: 'Elvis\'s voice is shot. Read his rider.', reward: 400 },
  { id: 'orbit', name: 'Victory Laps', hint: 'Skate five laps around the jungle scene without stopping.', reward: 300 },
  { id: 'bees', name: 'Poked the Hive', hint: 'Don\'t poke the hive in Honey & Maple Syrup.', reward: 50 },
  { id: 'bloom', name: 'Green Thumb', hint: 'The plants are plastic. Water one anyway. A lot.', reward: 200 },
  { id: 'hippo', name: 'The Hippo Speaks', hint: 'Toss coins in the jungle scene pond.', reward: 300 },
  { id: 'banana', name: 'Banana Guy', hint: 'Talk to the person in the banana suit.', reward: 150 },
  { id: 'capsules', name: 'Capsule Collector', hint: 'Collect all 12 capsule toys from the machine by the Foodie Entrance.', reward: 1000 },
];
const CAPSULES = ['tiny Big Cheese', 'Elvis keychain', 'rubber durian', 'pocket penguin', 'glow-in-the-dark lobster', 'mini soup can on a swing', 'a single sock', 'monorail ticket stub', 'teeny hot sauce', 'Gerald figure', 'a capsule with a smaller capsule inside', 'golden skate'];
const PENGUINS = ['frozen1', 'frozen2', 'deck', 'beer', 'throne', 'cave', 'backstage'];

// saved fun state (lazy, so old saves load) + per-day state
function F() { if (!ST.fun) ST.fun = {}; const f = ST.fun; for (const k of ['found', 'peng', 'caps', 'items', 'plants', 'bloom']) f[k] = f[k] || {}; return f; }
function resetFunDay() { RT.fun = { trash: {}, wishes: 0, tree: {}, couch: false, sofa: false, gouda: false, elvisSang: 0, sinkT: 0, paT: -99, coupon: false, orbit: 0, orbitA: null, knock: {}, hollowT: -99 }; RT.room = null; RT.roomFrom = null; RT.beesT = 0; RT.zoomT = 0; }
function foundSecret(id) {
  const f = F(); if (f.found[id]) return false; const s = SECRETS.find(s => s.id === id); if (!s) return false; f.found[id] = true;
  if (RT.day) { ST.money += s.reward; RT.day.extra += s.reward; } floatText(PL.x, PL.y - 34, '+' + fmtMoney(s.reward), '#7dff7a');
  toast(`Secret found: ${s.name}! +${fmtMoney(s.reward)} (${Object.keys(f.found).length}/${SECRETS.length})`, 'good'); MUSIC.sting('good') || sfx('good'); sparkle(PL.x, PL.y - 20); return true;
}
const funPick = a => a[Math.floor(Math.random() * a.length)];
function cycleLine(key, arr) { const f = F(); f.cyc = f.cyc || {}; const i = f.cyc[key] = ((f.cyc[key] ?? -1) + 1) % arr.length; return arr[i]; }

// ---------- building: rooms + the extra things in the store ----------
function buildFun() {
  // the void past the store, then each room carved out of it
  W.wallStyle = new Map();
  for (let y = 0; y < MH; y++) for (let x = SW; x < MW; x++) { const k = idx(x, y); W.ground[k] = 'void'; W.solid[k] = 1; W.wall[k] = 1; W.outdoor[k] = 0; W.zone[k] = -1; }
  for (const id in ROOMS) { const r = ROOMS[id];
    for (let y = r.y0 - 1; y <= r.y1 + 1; y++) for (let x = r.x0 - 1; x <= r.x1 + 1; x++) { const k = idx(x, y), inside = x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1;
      if (inside) { W.ground[k] = r.floor; W.solid[k] = 0; W.wall[k] = 0; } else W.wallStyle.set(k, r.wall); }
    addObj({ type: 'roomdoor', room: id, x: roomDoorX(r), y: r.y1 + 1, frame: id === 'cave' ? 1 : 0 });
  }
  const free = (x, y) => inb(x, y) && !W.solid[idx(x, y)] && !W.objAt.get(idx(x, y));
  const put = (o) => free(o.x, o.y) ? addObj(o) : null;
  const addObjR = o => addObj(Object.assign(o, { x: o.x + 34 })); // room furniture is laid out from x=81; rooms sit 34 further east now
  // the throne room: the award-winning restroom behind the porta-potty doors
  for (const x of [82, 84]) { addObjR({ type: 'mirror', x, y: 2 }); addObjR({ type: 'sink', x, y: 3 }); }
  addObjR({ type: 'dryer', x: 86, y: 2 }); addObjR({ type: 'plaque', x: 88, y: 2 });
  [90, 91, 92].forEach((x, n) => addObjR({ type: 'stall', x, y: 3, n, frame: n === 2 ? (F().found.stall ? 3 : 2) : 0 }));
  addObjR({ type: 'staff', npc: 'reginald', x: 88, y: 6, solid: true, look: npcLook('reginald') });
  addObjR({ type: 'plungercase', x: 81, y: 9, frame: F().found.plunger ? 1 : 0 }); addObjR({ type: 'plant', x: 81, y: 10 }); addObjR({ type: 'plant', x: 81, y: 3 });
  addObjR({ type: 'penguin', pid: 'throne', x: 92, y: 10 });
  // the cheese cave
  for (let x = 96; x <= 108; x++) if (x !== 102) addObjR({ type: 'cheeserack', x, y: 3, seed: x });
  for (const x of [98, 99, 100, 104, 105, 106]) addObjR({ type: 'cheeserack', x, y: 6, seed: x * 3 });
  addObjR({ type: 'bigwheel', x: 97, y: 9, w: 2, h: 2 }); addObjR({ type: 'candle', x: 96, y: 11 }); addObjR({ type: 'candle', x: 108, y: 11 }); addObjR({ type: 'candle', x: 101, y: 9 }); addObjR({ type: 'candle', x: 103, y: 9 });
  addObjR({ type: 'staff', npc: 'gouda', x: 102, y: 8, solid: true, look: npcLook('gouda') });
  addObjR({ type: 'penguin', pid: 'cave', x: 107, y: 10 });
  // elvis's dressing room
  addObjR({ type: 'vanity', x: 82, y: 15, w: 2 }); addObjR({ type: 'jumprack', x: 86, y: 15, w: 2, frame: PL.outfit ? 1 : 0 });
  for (const x of [89, 90, 91]) addObjR({ type: 'goldrec', x, y: 14, seed: x });
  addObjR({ type: 'sofa', x: 90, y: 21, w: 2 }); addObjR({ type: 'rider', x: 83, y: 20 }); addObjR({ type: 'cutout', x: 92, y: 17 });
  addObjR({ type: 'penguin', pid: 'backstage', x: 81, y: 22 }); addObjR({ type: 'plant', x: 81, y: 15 });
  // in the store: name the penguins, two more of them hiding, a capsule machine, a PA mic, the stage door
  W.objs.filter(o => o.type === 'penguin' && !o.pid).forEach((o, i) => o.pid = 'frozen' + (i + 1));
  put({ type: 'penguin', pid: 'deck', x: 76, y: 59 }); put({ type: 'penguin', pid: 'beer', x: 34, y: 31 }); // one by the monorail, one in the beer cave
  put({ type: 'capsule', x: 85, y: 53 }); put({ type: 'pa', x: 80, y: 54 });
  const candy = DEPT.candy; if (candy) { const sx = candy.x + 1, sy = candy.y + 1; removeAt(sx, sy); addObj({ type: 'stagedoor', x: sx, y: sy }); W.spots.stagedoor = [sx + 0.5, sy + 1.75]; }
  if (W.spots.bigcheese) W.spots.cheeseFront = [W.spots.bigcheese[0], W.spots.bigcheese[1] - 0.1];
  W.objs.forEach(o => { if (o.type === 'trash' || o.type === 'plant') o.key = o.type + o.x + '_' + o.y; if (o.type === 'plant' && F().bloom[o.key]) o.frame = 1; });
}
function npcLook(id) {
  const o = randomLook(mkRng(id.length * 131 + id.charCodeAt(1)), id === 'gouda' ? 'old' : 'adult'); o.key = 'npc_' + id; o.pattern = null; o.tote = null; o.beard = false;
  if (id === 'reginald') { o.shirt = '#1e1e24'; o.pants = '#1e1e24'; o.pattern = 'logo'; o.pc = '#f2c230'; o.style = 'short'; o.hair = '#2a1a12'; o.glasses = null; }
  if (id === 'gouda') { o.shirt = '#6a4a2a'; o.pants = '#5a3a1a'; o.apron = '#4a3018'; o.style = 'bald'; o.beard = true; o.hair = '#e8e8e8'; o.glasses = null; }
  return o;
}

// ---------- rooms: in and out ----------
function enterRoom(id, from) {
  const r = ROOMS[id]; if (!r) return;
  if (PL.escort) { const c = PL.escort; PL.escort = null; bubble(c, 'i\'m not following you in THERE.', 3, 'mad'); c.state = 'walk'; c.then = 'browse'; const f = pick(Math.random, W.fronts[c.cur] || [[Math.floor(c.x / T), Math.floor(c.y / T)]]); c.front = f; goTo(c, f[0] + 0.5, f[1] + 0.75); }
  RT.roomFrom = from === undefined ? { x: PL.x, y: PL.y } : from; RT.room = id; RT.fadeT = 0.4;
  PL.x = (roomDoorX(r) + 0.5) * T; PL.y = (r.y1 + 0.7) * T; PL.vx = PL.vy = 0; PL.dir = 'up'; sfx('pick');
  toast(r.name, ''); if (id === 'throne') foundSecret('throne'); if (id === 'cave') foundSecret('cave'); if (id === 'backstage') foundSecret('backstage');
}
function enterRoomAt(id, x, y) { RT.room = id; RT.roomFrom = null; PL.x = x; PL.y = y; }
function leaveRoom() {
  const r = ROOMS[RT.room]; let p = RT.roomFrom;
  if (!p) { const s = r && r.exitTo === 'bigcheese' ? W.spots.cheeseFront : r && r.exitTo === 'stagedoor' ? W.spots.stagedoor : W.spots.mainDoorIn; p = { x: s[0] * T, y: s[1] * T }; }
  RT.room = null; RT.roomFrom = null; RT.fadeT = 0.4; PL.x = p.x; PL.y = p.y; PL.vx = PL.vy = 0; PL.dir = 'down'; sfx('pick');
}

// ---------- what Space does on each fun thing ----------
const CORN_JOKES = [
  ['corn', 'why did the corn get promoted? it was outstanding in its field.'], ['butter', 'i\'d tell you a joke about me, but i\'d just spread it around.'],
  ['corn', 'i\'m all ears. literally. it\'s a medical thing.'], ['butter', 'we\'ve been doing this since 1974. it\'s been a-maize-ing. he makes me say that.'],
  ['corn', 'what do you call a sad ear of corn? a little husky.'], ['butter', 'i\'m on a roll. well, a cob. close enough.'],
  ['corn', 'don\'t get me started on popcorn. that guy just pops off.'], ['butter', 'i spread myself too thin. story of my life.'],
];
const PENGUIN_LINES = ['it\'s a fake penguin. it\'s cold anyway.', 'the penguin stares into the middle distance.', 'you pat the penguin. it does not pat you back.', 'the penguin has seen things in this freezer aisle.', 'a penguin. in ohio. nobody asks questions.'];
const TRASH_JUNK = ['half a sandwich. no.', 'a receipt for 40 pounds of shrimp. respect.', 'a shopping list: "eggs, milk, the big cheese (??)"', 'somebody\'s crossword. 7 down is "gouda".', 'a single skate wheel. not yours. probably.', 'a coupon for 10 cents off sardines. expired in 1996.'];
const GERALD = ['a raccoon pops out, looks you dead in the eye, and leaves. his little name tag says GERALD.', 'gerald again. he\'s eating a donut. he does not share.', 'gerald nods at you. you\'re friends now. he leaves you a coupon on his way out.'];
const MIRROR = ['looking good, boss.', 'you look like someone who knows where the tahini is.', 'is that a gray hair? no. it\'s parmesan.', 'there\'s a sticker on the mirror. it says "you\'re doing great."', 'you fix your sweatband. perfect.'];
const STALL = [['occupied.', 'STILL occupied.', 'sir, this is a restroom.', '...is that the boss? hi boss. still occupied.'], ['*rustle* ...occupied.', 'go away, i\'m reading the sale flyer.', 'is it true the big cheese has a basement? asking for me.']];
const REGINALD_IDLE = ['mint, sir?', 'do enjoy the dryer. carefully.', 'the third stall has been out of order since 1998. nobody knows why. a wrench might.', 'towel, sir? it\'s warm. i keep it in my jacket.'];
const GOUDA_LINES = ['every wheel down here is older than your skates.', 'patience. cheese is patience you can eat.', 'the mother wheel has been aging since 1971. like the store.', 'you smell like the frozen aisle. it\'s fine. it\'s fine.'];
const RACK_LINES = ['wheel #4471. aged 11 years. do not lick.', 'a wheel labeled DO NOT TURN. you turn it a little.', 'this one is humming. cheese should not hum.', 'a tag: "property of the big cheese. hands off."'];
const RECORDS = ['gold record: "love me tender(loin)". meat dept hits, vol. 1.', 'gold record: "blue suede skates". you feel seen.', 'gold record: "aisle be seeing you". 1977.'];
const SOUP = ['wheeeee!', 'higher! HIGHER!', 'i\'m a soup can on a swing. this is the dream.', 'don\'t tell the chicken noodle i\'m having fun.'];
const ROBIN = ['robin hood waves back. he\'s been waving since the \'80s.', 'robin hood fires an arrow. it\'s a suction cup. it sticks to the cereal.', 'robin hood: "steal from the rich, give to the... hey, these are just prices."'];
const COSTUME_LINES = {
  banana: ['i\'m not in a costume. this is just how i look.', 'please don\'t peel me. it\'s been a long day.', 'is there a potassium aisle? asking for me.', 'it\'s for a bet. i lost.'],
  tourist: ['is this the famous grocery store? *click*', 'i flew in for the big cheese. worth it.', 'where\'s the gift shop? oh. it\'s all the gift shop.'],
  jogger: ['just doing laps. the store\'s bigger than the track.', 'mile three. hot sauce aisle. feeling good.', 'don\'t mind me. new personal record.'],
};
const JUMPSUIT_LINES = ['is that... the king?', 'nice jumpsuit, boss.', 'thank you. thank you very much. -me, to you', 'the lion has competition.'];

function funInfo(o, tool) { // label + act for anything fun in front of you, or null to let the normal rules handle it
  const f = F(), A = (label, kind) => ({ act: 'fun', o, kind: kind || o.type, label });
  if (PL.carry.length && o.dept && DEPT[o.dept] && DEPT[o.dept].max) return null; // carrying a crate to a shelf: restock first
  if (o.npc) return A(`Space: talk to ${o.npc === 'gouda' ? 'Brother Gouda' : 'Reginald'}`, 'npc');
  switch (o.type) {
    case 'penguin': return A('Space: pat the penguin');
    case 'restroom': return A('Space: go in (restroom)');
    case 'hive': return A('Space: poke the hive');
    case 'trash': return A(RT.fun.trash[o.key] ? 'Already went through this one today' : 'Space: dig through the trash');
    case 'plant': return A(o.frame ? 'It bloomed. It\'s plastic. It bloomed anyway.' : 'Space: water the plant');
    case 'racecar': return A('A real race car, hung from the ceiling. Space: reach for it');
    case 'corral': return A('Space: push a cart');
    case 'giraffe': case 'elephant': case 'rhino': return A(`Space: pat the ${o.type}`);
    case 'tree': return A('Space: shake the tree');
    case 'mstairs': return A('Space: climb the monorail platform and look around');
    case 'capsule': return A(`Space: capsule machine ($1) · ${Object.keys(f.caps).length}/${CAPSULES.length} collected`);
    case 'gacha': return PL.carry.length ? null : A(`Space: try a capsule ($1) · ${Object.keys(f.caps).length}/${CAPSULES.length} collected`, 'capsule');
    case 'pa': return A(RT.dayT - RT.fun.paT < 45 ? 'The PA mic needs a minute' : 'Space: make an announcement');
    case 'stagedoor': return A(stageOpen() ? 'Space: stage door (go in)' : 'Stage door. Space: knock');
    case 'roomdoor': return A(o.room === 'cave' ? 'Space: climb the stairs back up' : 'Space: go back to the store');
    case 'mirror': return A('Space: look in the mirror');
    case 'sink': return A('Space: wash your hands');
    case 'dryer': return A('Space: use the hand dryer');
    case 'plaque': return A('Space: read the plaque');
    case 'stall': if (o.n === 2) { if (o.frame === 3) return A('Space: take the stairs down', 'stall'); return tool === 'wrench' ? A(`Space: fix the stall door (${RT.fun.knock.fix || 0}/3)`) : A('Out of order. Space: knock'); } return A('Space: knock');
    case 'plungercase': return A('Space: look at the case');
    case 'cheeserack': return A('Space: look at the wheels');
    case 'bigwheel': return A('Space: touch the Mother Wheel');
    case 'candle': return { label: 'A candle. It smells like cheddar.' };
    case 'vanity': return A(PL.carry.includes('natural') && !f.found.honey ? 'Space: leave the honey for Elvis' : 'Space: sit at the vanity');
    case 'jumprack': return A(PL.outfit ? 'Space: hang the jumpsuit back up' : 'Space: try on a jumpsuit');
    case 'goldrec': return A('Space: read the gold record');
    case 'sofa': return A('Space: sit on the couch');
    case 'rider': return A('Space: read the note on the table');
    case 'cutout': return A('Space: talk to the cardboard Elvis');
    case 'cardtable': return weekday() === 'Fri' ? null : A('Space: play solitaire');
    case 'tank': if (tool !== 'hands' || o.kind !== 'lobster') return null; return A(f.toddBoat ? 'Todd\'s tank is empty. He\'s on the boat now.' : f.items.todd ? 'Todd is with you' : (f.todd || 0) >= 2 ? 'Space: pick up Todd' : 'Space: look at the lobster with the name tag', 'todd');
    case 'couch': return RT.goalHit || RT.fun.couch ? null : A('Space: search the couch cushions');
    case 'anim': case 'pond': {
      const a = ST.anims[o.anim]; if (!a || a.broken || o.anim === 'elvis') return null;
      if (o.anim === 'minnow' && f.items.todd) return A('Space: put Todd on the boat', 'boat');
      return A({ corn: 'Space: ask Corn & Butter for a joke', robin: 'Space: wave at Robin Hood', swing: 'Space: push the soup can', firetruck: 'Space: hit the siren', minnow: 'Space: ring the ship\'s bell', jungle: RT.fun.wishes >= 5 ? 'The hippo has heard enough wishes today' : 'Space: toss a coin in the pond ($1)' }[o.anim], 'anim_' + o.anim);
    }
  }
  return null;
}
function stageOpen() { return RT.fun.elvisSang >= 3 || F().found.backstage; }
function funAct(t) {
  const o = t.o, f = F(), say1 = s => flash(s);
  switch (t.kind) {
    case 'penguin': { sfx('talk'); const n0 = Object.keys(f.peng).length; f.peng[o.pid] = true; const n = Object.keys(f.peng).length;
      if (n > n0) { floatText(PL.x, PL.y - 34, `penguin ${n}/${PENGUINS.length}`, '#9ff0ff'); say1(funPick(PENGUIN_LINES) + ` (${n} of ${PENGUINS.length} counted)`); if (n >= PENGUINS.length) foundSecret('penguins'); } else say1(funPick(PENGUIN_LINES)); break; }
    case 'restroom': enterRoom('throne'); break;
    case 'roomdoor': leaveRoom(); break;
    case 'hive': { RT.beesT = 6; sfx('alarm'); toast('BEES. Skate!', 'warn'); floatText(PL.x, PL.y - 34, 'BZZZ', '#ffe14d'); RT.custs.forEach(c => { if (Math.hypot(c.x - PL.x, c.y - PL.y) < 4 * T) { moodHit(c, -2); bubble(c, 'BEES?!', 2, 'mad'); } }); break; }
    case 'trash': rummage(o); break;
    case 'plant': { if (o.frame) return; f.plants[o.key] = (f.plants[o.key] || 0) + 1; const n = f.plants[o.key]; sfx('pour'); for (let i = 0; i < 6; i++) RT.parts.push({ x: o.x * T + 4 + Math.random() * 8, y: o.y * T - 6, vx: (Math.random() - 0.5) * 10, vy: 20, t: 0.4, c: '#7fd4ff' });
      if (n >= 7) { o.frame = 1; f.bloom[o.key] = true; say1('...it bloomed. it\'s plastic. it BLOOMED.'); sparkle(o.x * T + 8, o.y * T); foundSecret('bloom'); }
      else say1(['it\'s plastic. you water it anyway.', 'still plastic.', 'you whisper encouragement to the plastic plant.', 'is it... greener? no.', 'the soil is just foam. you keep going.', 'something is happening. maybe.'][n - 1]); break; }
    case 'racecar': say1(ST.ups.skates3 ? 'you and the race car share a look. speed recognizes speed.' : cycleLine('car', ['the keys are in it. you can\'t reach. it\'s for the best.', 'you jump. you are not tall enough. nobody is.', 'somebody hung a race car from the ceiling and just left it.'])); break;
    case 'corral': say1(cycleLine('cart', ['you push a cart. it has one bad wheel. they all have one bad wheel.', 'the carts live here. like little metal horses.', 'one cart has a receipt from 2011 in it. a long journey.'])); break;
    case 'giraffe': say1('you pat the giraffe\'s leg. that\'s as high as you go.'); break;
    case 'elephant': SFX.elvis && tone(98, 0.5, 'sawtooth', 0.08, 0, null, 160); say1('the elephant has no comment.'); break;
    case 'rhino': say1('the rhino has seen ten thousand shoppers. it has opinions about all of them.'); break;
    case 'tree': { const k = o.x + '_' + o.y; if (RT.fun.tree[k]) { say1('you shake it again. nothing. the tree is done with you.'); break; } RT.fun.tree[k] = 1; const r = Math.random();
      if (r < 0.3) { addMoney(1, PL.x, PL.y - 30); RT.day.extra += 1; say1('a dollar falls out of the tree. that\'s how money works now.'); } else say1(funPick(['a frisbee from 2004 falls out.', 'a very surprised squirrel.', 'one leaf. the leaf is judging you.', 'a kite. no string. no explanation.'])); break; }
    case 'mstairs': RT.zoomT = 6; say1('you climb the monorail platform. you can see the whole lot from up here. somebody parked across three spots.'); sfx('pick'); break;
    case 'capsule': pullCapsule(); break;
    case 'pa': paAnnounce(); break;
    case 'stagedoor': if (stageOpen()) enterRoom('backstage'); else { sfx('clank'); say1('stage door. AUTHORIZED LIONS ONLY. (sounds like he\'s warming up. maybe after a few songs.)'); } break;
    case 'mirror': say1(funPick(MIRROR)); break;
    case 'sink': { if (RT.dayT - RT.fun.sinkT < 20) { say1('your hands are very clean already.'); break; } RT.fun.sinkT = RT.dayT; ST.energy = Math.min(100, ST.energy + 5); sfx('pour'); say1('you wash your hands for 20 seconds and hum the whole time. +5 energy.'); break; }
    case 'dryer': { PL.vy = 300; PL.vx = (Math.random() - 0.5) * 80; PL.walk = false; noise(0.9, 0.08); for (let i = 0; i < 16; i++) RT.parts.push({ x: PL.x + (Math.random() - 0.5) * 10, y: PL.y - 14, vx: (Math.random() - 0.5) * 30, vy: 80 + Math.random() * 60, t: 0.5, c: '#ffffff', dust: true }); floatText(PL.x, PL.y - 34, 'WHOOOOSH', '#ffffff'); say1('the XTREME 9000 hand dryer. your hands are dry. so is your soul.'); foundSecret('dryer'); break; }
    case 'plaque': showDialog('Plaque', 'BEST RESTROOM IN AMERICA, 2007. underneath, in pen: "nicer than my house." - a customer'); break;
    case 'stall': {
      if (o.n === 2) {
        if (o.frame === 3) { enterRoom('cave', null); break; }
        if (TOOLS[PL.tool].id === 'wrench') { RT.fun.knock.fix = (RT.fun.knock.fix || 0) + 1; sfx('clank'); if (RT.fun.knock.fix >= 3) { o.frame = 3; foundSecret('stall'); showDialog('Stall 3', 'the door swings open. there\'s no toilet. there\'s a stone staircase going down. it smells like cheddar.', () => enterRoom('cave', null)); } break; }
        sfx('clank'); say1('nobody answers. the door is stuck. looks like a job for a wrench.'); break;
      }
      sfx('clank'); RT.fun.knock[o.n] = (RT.fun.knock[o.n] || 0); const arr = STALL[o.n]; flash('"' + arr[Math.min(arr.length - 1, RT.fun.knock[o.n]++)] + '"'); break;
    }
    case 'plungercase': say1(f.found.plunger ? 'the golden plunger, back where it belongs. it gleams.' : 'an empty display case. the little card says: THE GOLDEN PLUNGER.'); break;
    case 'npc': talkNpc(o); break;
    case 'cheeserack': say1(funPick(RACK_LINES)); break;
    case 'bigwheel': say1('the mother wheel. aged since 1971. it\'s warm. is it breathing? no. you\'re tired.'); break;
    case 'vanity': {
      if (PL.carry.includes('natural') && !f.found.honey) { PL.carry.splice(PL.carry.indexOf('natural'), 1); sfx('stock'); foundSecret('honey'); showDialog('Elvis (from somewhere)', 'mmm. local honey. thank you. thank you very much. the voice is back, boss. i\'ll sing longer for the kids now.'); break; }
      say1('you sit at the vanity. the bulbs make you look like a star. a sweaty star.'); break;
    }
    case 'jumprack': { PL.outfit = PL.outfit ? null : 'jumpsuit'; o.frame = PL.outfit ? 1 : 0; sfx('pick'); say1(PL.outfit ? 'you try on a white jumpsuit. it fits. too well.' : 'you hang the jumpsuit back up. you miss it already.'); break; }
    case 'goldrec': say1(RECORDS[o.seed % RECORDS.length]); break;
    case 'sofa': { if (!RT.fun.sofa) { RT.fun.sofa = true; ST.energy = Math.min(100, ST.energy + 15); say1('you sit on elvis\'s couch. it\'s warm. weird. +15 energy.'); } else say1('the couch is still warm. still weird.'); break; }
    case 'rider': { f.riderRead = true; showDialog('Elvis\'s rider', 'BACKSTAGE NEEDS: 1. honey. LOCAL. the voice needs it. 2. no brown gummy bears. 3. room temperature water. 4. a mirror that says nice things.', null, f.found.honey ? 'Done. He has his honey.' : 'Honey comes in Natural crates (stock room). Leave one at the vanity.'); break; }
    case 'cutout': say1(cycleLine('cutout', ['the cardboard elvis says nothing. it\'s cardboard.', 'you ask the cutout for advice. you feel like it said "thank you very much".', 'somebody drew a mustache on the cutout. it works, honestly.'])); break;
    case 'cardtable': say1(cycleLine('sol', ['you play solitaire. you lose. to yourself.', 'you play solitaire. you win. nobody saw. it doesn\'t count.', 'you build a little card house. a kid knocks it over. fair.'])); break;
    case 'todd': {
      if (f.toddBoat || f.items.todd) break; f.todd = (f.todd || 0) + 1;
      if (f.todd === 1) showDialog('Todd', 'this lobster has a tiny name tag: TODD. he\'s been here since 2009. he\'s not for sale. he\'s management.');
      else if (f.todd === 2) showDialog('Todd', 'todd is staring across the store at the s.s. minnow. longingly. todd wants to see the boat.', null, 'Space again to carry him there.');
      else { f.items.todd = true; sfx('pick'); toast('You\'re carrying Todd. Take him to the S.S. Minnow in Seafood.', 'good'); }
      break;
    }
    case 'boat': { f.items.todd = false; f.toddBoat = true; sfx('good'); foundSecret('todd'); showDialog('Captain Todd', 'todd climbs aboard the s.s. minnow. he has never looked happier. he is captain todd now. he will not be taking questions.'); break; }
    case 'couch': { RT.fun.couch = true; addMoney(3.75, PL.x, PL.y - 30); RT.day.extra += 3.75; say1('$3.75, a tv remote and a single grape. you keep the money.'); break; }
    case 'anim_corn': { const [who, j] = CORN_JOKES[(f.corn = ((f.corn || 0) + 1)) % CORN_JOKES.length]; showDialog(who === 'corn' ? 'Corn' : 'Butter', j); break; }
    case 'anim_robin': { RT.parts.push({ x: o.x * T + 30, y: o.y * T - 8, vx: 160, vy: 0, t: 0.9, c: '#e8e8e0', arrow: true }); sfx('pick'); say1(funPick(ROBIN)); break; }
    case 'anim_swing': { RT.swingT = 4; floatText(o.x * T + 8, o.y * T - 24, funPick(SOUP), '#ffffff'); sfx('talk'); break; }
    case 'anim_firetruck': { RT.sirenT = 3; SFX.alarm(); for (let i = 0; i < 20; i++) RT.parts.push({ x: o.x * T + 30, y: o.y * T - 4, vx: 40 + Math.random() * 60, vy: -40 - Math.random() * 30, t: 0.8, c: '#7fd4ff' }); floatText(o.x * T + 16, o.y * T - 20, 'WEE-OO', '#ff6a5a'); RT.custs.forEach(c => { if (c.kid && Math.hypot(c.x - PL.x, c.y - PL.y) < 6 * T) moodHit(c, 4); }); break; }
    case 'anim_minnow': { tone(880, 0.6, 'triangle', 0.1); tone(880, 0.6, 'triangle', 0.08, 0.7); say1('DING DING. the s.s. minnow isn\'t seaworthy. it is, however, store-worthy.'); break; }
    case 'anim_jungle': wish(); break;
  }
}
function talkNpc(o) {
  const f = F(); sfx('talk');
  if (o.npc === 'reginald') {
    if (f.items.plunger) { f.items.plunger = false; foundSecret('plunger'); const c = W.objs.find(o => o.type === 'plungercase'); if (c) c.frame = 1; return showDialog('Reginald', 'the golden plunger! sir, i could weep. i AM weeping. please, take this: from now on your mop works like a dream. one swipe.', null, 'Golden mop: every spill comes up in one swipe.'); }
    if (!f.found.plunger && !f.plungerQ) { f.plungerQ = true; hidePlunger(); return showDialog('Reginald', 'welcome to the throne room, sir. mint? towel? ...i must confess, sir. there has been a theft. the golden plunger. our award. gone. if you see it... it\'ll be somewhere a plunger has no business being.', null, 'Check the trash cans around the store.'); }
    return showDialog('Reginald', funPick(REGINALD_IDLE));
  }
  if (o.npc === 'gouda') {
    if (!f.metGouda) { f.metGouda = true; return showDialog('Brother Gouda', 'ah. a visitor. few find the cave. fewer find it twice. i am brother gouda. i turn the wheels. the wheels turn me.'); }
    if (!RT.fun.gouda) { RT.fun.gouda = true; ST.energy = 100; return showDialog('Brother Gouda', 'eat this. it is eleven years old. it will change you.', null, 'Energy full.'); }
    return showDialog('Brother Gouda', funPick(GOUDA_LINES));
  }
}
function hidePlunger() { const cans = W.objs.filter(o => o.type === 'trash'); const c = pick(Math.random, cans); F().plungerCan = c ? c.key : null; }
function rummage(o) {
  const f = F(); if (RT.fun.trash[o.key]) { flash('already went through this one today.'); return; } RT.fun.trash[o.key] = 1; sfx('mop');
  if (f.plungerQ && !f.found.plunger && !f.items.plunger && (f.plungerCan === o.key || !f.plungerCan)) { f.items.plunger = true; sparkle(PL.x, PL.y - 20); showDialog('Trash can', 'under a pile of napkins: a gleaming GOLDEN PLUNGER. somebody threw away an award.', null, 'Take it back to Reginald in the restroom.'); return; }
  if (f.found.gerald && !RT.fun.coupon) { RT.fun.coupon = true; addMoney(20, PL.x, PL.y - 30); RT.day.extra += 20; flash('gerald left you a coupon. $20 off. he\'s a good friend.'); return; }
  const r = Math.random();
  if (r < 0.25 && !f.found.gerald) { f.gerald = (f.gerald || 0) + 1; RT.parts.push({ x: o.x * T + 8, y: o.y * T, vx: 70, vy: -10, t: 1, c: '#6a6f78', dust: true }); floatText(o.x * T + 8, o.y * T - 16, 'GERALD', '#c8ccd2'); showDialog('Trash can', GERALD[Math.min(2, f.gerald - 1)]); if (f.gerald >= 3) foundSecret('gerald'); return; }
  if (r < 0.5) { addMoney(5, PL.x, PL.y - 30); RT.day.extra += 5; flash('a $5 coupon. somebody\'s loss.'); return; }
  if (r < 0.62) { PL.spinT = 0.9; PL.vx += (Math.random() - 0.5) * 160; PL.vy += 60; floatText(PL.x, PL.y - 34, 'WHOA', '#ffe14d'); flash('a banana peel. you slip. you spin. you stick the landing.'); return; }
  flash(funPick(TRASH_JUNK));
}
function pullCapsule() {
  const f = F(); if (ST.money < 1) { sfx('err'); flash('you need a dollar.'); return; }
  ST.money -= 1; RT.day.wholesale = RT.day.wholesale; const gold = Math.random() < 0.05, name = gold ? CAPSULES[CAPSULES.length - 1] : CAPSULES[Math.floor(Math.random() * (CAPSULES.length - 1))];
  const isNew = !f.caps[name]; f.caps[name] = (f.caps[name] || 0) + 1; sfx(isNew ? 'good' : 'pick');
  for (let i = 0; i < 6; i++) RT.parts.push({ x: PL.x, y: PL.y - 20, vx: (Math.random() - 0.5) * 50, vy: -40 - Math.random() * 20, t: 0.6, c: pick(Math.random, ['#ff6fb0', '#ffd23f', '#5ee07a', '#3ac0ff']) });
  const n = Object.keys(f.caps).length;
  if (isNew) { toast(`New capsule: ${name}! (${n}/${CAPSULES.length})`, 'good'); if (n >= CAPSULES.length) foundSecret('capsules'); }
  else flash(`another ${name}. you have ${f.caps[name]}.`);
}
function wish() {
  if (RT.fun.wishes >= 5) { flash('the hippo has heard enough wishes for today.'); return; } if (ST.money < 1) { flash('you need a dollar.'); return; }
  ST.money -= 1; RT.fun.wishes++; const f = F(); f.wishes = (f.wishes || 0) + 1; sfx('pick');
  RT.parts.push({ x: PL.x, y: PL.y - 16, vx: 0, vy: -60, t: 0.5, c: '#ffd23f' }); sparkle(51.5 * T, 39 * T);
  if (f.wishes >= 10 && !f.found.hippo) { foundSecret('hippo'); showDialog('The Hippo', '...ten coins. you are persistent. i have been in this pond since the store opened. i am saving up for a bigger pond. thank you.'); return; }
  const r = Math.random();
  if (r < 0.3) flash('the hippo blinks. that\'s probably good.');
  else if (r < 0.5) { addRep(1); flash('somebody saw you make a wish and thought it was sweet. +rep'); }
  else if (r < 0.65) { if (ST.weather === 'rain') { ST.weather = 'cloudy'; flash('the rain stops. coincidence? yes.'); } else flash('a little breeze. nice.'); }
  else if (r < 0.85) { for (let i = 0; i < 4; i++) spawnCustomer(); flash('four shoppers wander in, drawn by the sound of a coin.'); }
  else { addMoney(5, PL.x, PL.y - 30); RT.day.extra += 5; flash('$5 floats back up. the hippo doesn\'t want your money. today.'); }
}
function paAnnounce() {
  if (RT.dayT - RT.fun.paT < 45) { flash('the mic is still squealing. give it a minute.'); return; }
  const go = (fn) => () => { RT.fun.paT = RT.dayT; sfx('alarm'); fn(); };
  const free = () => RT.custs.filter(c => isFree(c));
  showDialog('PA system', 'you pick up the mic. it squeals. everyone looks up.', null, null, [
    ['Free cheese samples!', go(() => { free().slice(0, 6).forEach(c => { goLoiter(c, ['cheese']); moodHit(c, 3); }); toast('"Free samples in the Cheese Shop!" People head that way.'); })],
    ['Elvis is on!', go(() => { RT.custs.filter(c => c.kid).forEach(k => { const p = k.parent; if (p && isFree(p)) goLoiter(p, ['candy']); }); startElvis(false); toast('"Elvis is about to perform!" Families run to Candy.'); })],
    ['You look nice today', go(() => { RT.custs.forEach(c => moodHit(c, 4)); addRep(0.5); toast('"Attention shoppers: you look nice today." Everyone smiles.'); })],
    ['Never mind', () => { }],
  ]);
}
// ---------- every frame: bees, spins, laps, room fades, chatter about your outfit ----------
function updateFun(dt) {
  if (!RT.fun) return;
  if (RT.fadeT > 0) RT.fadeT -= dt; if (RT.zoomT > 0) RT.zoomT -= dt; if (RT.swingT > 0) RT.swingT -= dt; if (RT.sirenT > 0) RT.sirenT -= dt;
  if (RT.beesT > 0) { RT.beesT -= dt; for (let i = 0; i < 2; i++) { const a = Math.random() * 6.283, r = 10 + Math.random() * 10; RT.parts.push({ x: PL.x + Math.cos(a) * r, y: PL.y - 12 + Math.sin(a) * r * 0.6, vx: (Math.random() - 0.5) * 60, vy: (Math.random() - 0.5) * 40, t: 0.25, c: Math.random() < 0.5 ? '#ffd23f' : '#2a2a2a' }); }
    if (RT.beesT <= 0) { flash('the bees lost interest. you survived.'); foundSecret('bees'); } }
  if (PL.spinT > 0) { PL.spinT = Math.max(0, PL.spinT - dt); PL.dir = ['down', 'left', 'up', 'right'][Math.floor(PL.spinT * 12) % 4]; }
  // laps around the jungle scene: the angle around the pond adds up while you stay near it and keep moving
  const pond = W.objs.find(o => o.type === 'pond');
  if (pond && !RT.room && !PL.walk) { const cx = (pond.x + pond.w / 2) * T, cy = (pond.y + pond.h / 2) * T, d = Math.hypot(PL.x - cx, PL.y - cy), a = Math.atan2(PL.y - cy, PL.x - cx);
    if (d < 5.5 * T && Math.hypot(PL.vx, PL.vy) > 20) { if (RT.fun.orbitA !== null) { let da = a - RT.fun.orbitA; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI; RT.fun.orbit += da;
        const laps = Math.floor(Math.abs(RT.fun.orbit) / (2 * Math.PI)); if (laps > (RT.fun.lapShown || 0)) { RT.fun.lapShown = laps; floatText(PL.x, PL.y - 34, `lap ${laps}`, '#ffe14d'); if (laps >= 5) foundSecret('orbit'); } }
      RT.fun.orbitA = a; } else { RT.fun.orbitA = null; RT.fun.orbit = 0; RT.fun.lapShown = 0; } }
  if (PL.outfit && ST.phase === 'day' && (RT.fun.suitT = (RT.fun.suitT || 0) - dt) <= 0) { RT.fun.suitT = 6; const c = RT.custs.find(c => !c.bubble && Math.hypot(c.x - PL.x, c.y - PL.y) < 4 * T); if (c) bubble(c, funPick(JUMPSUIT_LINES), 3); }
}
function maxSpeedFun() { return (RT.beesT > 0 ? 1.35 : 1); }

// ---------- quest log: secrets + collection ----------
function secretsHTML() {
  const f = F(), n = Object.keys(f.found).length, caps = Object.keys(f.caps).length, peng = Object.keys(f.peng).length;
  const pockets = [f.items.todd ? 'Todd (a lobster)' : '', f.items.plunger ? 'the Golden Plunger' : ''].filter(Boolean);
  return `<h3>Secrets · ${n}/${SECRETS.length} found</h3><div class="tasks">${SECRETS.map(s => f.found[s.id] ? `<div class="ok">✔ ${typo(s.name)} <span class="dim">${fmtMoney(s.reward)}</span></div>` : `<div>? <span class="dim">${typo(s.hint)}</span></div>`).join('')}</div>
  <p class="dim">Penguins counted: ${peng}/${PENGUINS.length} · Capsules: ${caps}/${CAPSULES.length}${caps ? ` (${Object.keys(f.caps).map(typo).join(', ')})` : ''}${pockets.length ? ` · Carrying: ${pockets.join(', ')}` : ''}</p>`;
}

// ---------- art: room floors, walls, and props ----------
Object.assign(FLOOR, {
  marble(g, x, y, r, tx, ty) { bevel(g, x, y, 16, 16, (tx + ty) % 2 ? '#ece8e0' : '#f6f2ea', 0.3, -0.08); const v = Math.floor(r() * 4); P(g, x + 2 + v, y + 3, 1, 4, '#d8d2c6'); P(g, x + 3 + v, y + 7, 1, 3, '#d8d2c6'); P(g, x + 9, y + 10 - v, 4, 1, '#ddd6ca'); if ((tx + ty) % 2 === 0) { P(g, x, y, 2, 2, '#e8c040'); } },
  stone(g, x, y, r) { tiles(g, x, y, '#7a7064', '#6e655a', '#4a4238', 8, r); if (r() < 0.2) P(g, x + 4 + Math.floor(r() * 6), y + 5, 2, 1, '#8a8072'); },
  redcarpet(g, x, y, r) { carpet(g, x, y, '#a8202e', '#9a1c2a', '#c8384a'); if (r() < 0.12) { P(g, x + 7, y + 6, 1, 3, '#f2c230'); P(g, x + 6, y + 7, 3, 1, '#f2c230'); } },
  void(g, x, y) { P(g, x, y, 16, 16, '#07070c'); },
});
const ROOMWALL = { // face (the wall you see above the floor) and top colours per room
  marble: { top: '#cfc6b4', face(g, x, y, tx) { P(g, x, y, 16, 16, '#efe6d2'); P(g, x, y, 16, 2, '#c8a030'); P(g, x, y + 2, 16, 1, '#f8e8a0'); P(g, x, y + 13, 16, 3, '#d8cdb6'); P(g, x, y + 13, 16, 1, '#c8a030'); if (tx % 2) P(g, x + 7, y + 4, 2, 8, '#e4dac4'); } },
  cave: { top: '#3a332c', face(g, x, y, tx, ty) { P(g, x, y, 16, 16, '#5a5046'); const r = mkRng(tx * 17 + ty); for (let i = 0; i < 4; i++) oval(g, x + 2 + r() * 12, y + 3 + r() * 9, 2.5, 1.6, pick(r, ['#6a6054', '#4a4238', '#665c50'])); P(g, x, y + 14, 16, 2, '#3a332c'); } },
  backstage: { top: '#2a1a2a', face(g, x, y, tx) { P(g, x, y, 16, 16, '#3a2440'); P(g, x, y, 16, 2, '#1e1222'); P(g, x, y + 13, 16, 3, '#2a1a2a'); if (tx % 3 === 0) { P(g, x + 7, y + 5, 2, 4, '#f2c230'); P(g, x + 5, y + 6, 6, 2, '#f2c230'); P(g, x + 6, y + 9, 1, 1, '#f2c230'); P(g, x + 9, y + 9, 1, 1, '#f2c230'); } } },
};
const plantBase = PROPS.plant[2];
Object.assign(PROPS, {
  plant: [16, 26, (g, f, c) => { plantBase(g, f, c); if (f === 1) for (const [x, y, k] of [[5, 6, '#ff6fb0'], [11, 7, '#ffd23f'], [8, 3, '#ff6fb0'], [3, 11, '#b070ff'], [13, 11, '#ffd23f']]) { disc(g, x, y, 1.3, k); P(g, x, y, 1, 1, '#fff6a0'); } }, true],
  mirror: [16, 16, (g) => { P(g, 2, 2, 12, 12, '#c8a030'); P(g, 3, 3, 10, 10, '#bfe0ec'); P(g, 4, 4, 3, 1, '#ffffff'); P(g, 4, 5, 1, 2, '#ffffff'); P(g, 9, 9, 3, 3, '#a8d0e0'); }, true],
  sink: [16, 24, (g) => { P(g, 0, 10, 16, 14, '#efe6d2'); P(g, 0, 10, 16, 2, '#f8f2e4'); oval(g, 8, 13, 5, 2, '#d8e8f0'); oval(g, 8, 13, 3.5, 1.2, '#b8d0e0'); P(g, 7, 7, 2, 4, '#e8c040'); P(g, 7, 7, 4, 1, '#e8c040'); P(g, 0, 22, 16, 2, '#c8a030'); P(g, 2, 16, 12, 5, '#e4dac4'); }, true],
  dryer: [16, 16, (g) => { P(g, 2, 3, 12, 9, '#9aa3ad'); P(g, 2, 3, 12, 1, '#d8dde2'); P(g, 4, 11, 8, 2, '#3a3a42'); P(g, 4, 5, 8, 2, '#e23a2e'); P(g, 5, 5, 6, 1, '#ff6a5a'); }, true],
  plaque: [16, 16, (g) => { P(g, 2, 3, 12, 10, '#8a5a30'); P(g, 3, 4, 10, 8, '#e8c040'); P(g, 3, 4, 10, 1, '#fff0a0'); P(g, 5, 6, 6, 1, '#8a6a10'); P(g, 5, 8, 6, 1, '#8a6a10'); P(g, 6, 10, 4, 1, '#8a6a10'); }, true],
  stall: [16, 28, (g, f) => { P(g, 0, 0, 16, 28, '#c8bca4'); P(g, 1, 2, 14, 24, f === 3 ? '#1a1410' : '#e8dcc4'); if (f === 3) { for (let i = 0; i < 5; i++) P(g, 3 + i, 8 + i * 3, 10 - i * 2, 2, '#5a5046'); } else { P(g, 1, 2, 14, 1, '#f8f0dc'); P(g, 12, 14, 2, 2, '#c8a030'); P(g, 6, 24, 4, 2, '#9a9080'); }
    if (f === 2) { P(g, 3, 8, 10, 6, '#ffffff'); P(g, 3, 8, 10, 1, '#e23a2e'); P(g, 4, 10, 8, 1, '#2a1d22'); P(g, 4, 12, 6, 1, '#2a1d22'); } P(g, 0, 26, 16, 2, '#9a9080'); }, true],
  plungercase: [16, 26, (g, f) => { P(g, 1, 18, 14, 8, '#8a5a30'); P(g, 1, 18, 14, 1, '#b07a44'); P(g, 2, 2, 12, 16, '#dff2f6'); g.globalAlpha = 0.5; P(g, 3, 3, 2, 10, '#ffffff'); g.globalAlpha = 1; P(g, 1, 1, 14, 1, '#c8a030');
    if (f === 1) { P(g, 7, 5, 2, 9, '#e8c040'); P(g, 7, 5, 1, 9, '#fff0a0'); oval(g, 8, 14, 4, 2, '#e8c040'); P(g, 6, 13, 2, 1, '#fff0a0'); } else { P(g, 5, 15, 6, 2, '#ffffff'); P(g, 6, 15, 4, 1, '#c8c8c4'); } }, true],
  roomdoor: [16, 16, (g, f) => { if (f === 1) { P(g, 2, 0, 12, 16, '#3a332c'); for (let i = 0; i < 4; i++) P(g, 3, 2 + i * 4, 10, 2, '#7a7064'); } else { P(g, 2, 0, 12, 16, '#7a4a28'); P(g, 3, 1, 10, 15, '#a8703a'); P(g, 11, 8, 1, 2, '#f2c230'); P(g, 5, 4, 6, 1, '#c8904a'); P(g, 4, 0, 8, 1, '#c8a030'); } }, true],
  cheeserack: [16, 24, (g, f, c) => { P(g, 1, 0, 2, 24, '#6a4a2a'); P(g, 13, 0, 2, 24, '#6a4a2a'); for (const y of [7, 15, 22]) P(g, 1, y, 14, 2, '#8a6a3a'); for (const [y, s] of [[2, 0], [10, 1], [17, 2]]) { const col = ['#f2c230', '#e8a030', '#f6d870'][s]; oval(g, 8, y + 2, 5, 2.5, col); P(g, 4, y + 1, 8, 1, shade(col, 0.3)); P(g, 4, y + 3, 8, 1, shade(col, -0.25)); } }, true],
  bigwheel: [34, 34, (g) => { g.translate(1, 1); P(g, 2, 24, 28, 8, '#5a3a1a'); oval(g, 16, 18, 15, 9, '#e8a030'); oval(g, 16, 14, 15, 9, '#f6d060'); oval(g, 16, 14, 11, 6, '#f8e080'); P(g, 6, 12, 4, 1, '#fff6c0'); for (const [x, y] of [[12, 15], [20, 13], [16, 17]]) disc(g, x, y, 1, '#d8a020'); }, true],
  candle: [16, 20, (g) => { P(g, 6, 8, 4, 10, '#f4ead0'); P(g, 6, 8, 1, 10, '#ffffff'); P(g, 7, 6, 2, 2, '#2a1d22'); oval(g, 8, 4, 1.5, 2.5, '#ffd23f'); P(g, 8, 4, 1, 2, '#ffffff'); P(g, 4, 18, 8, 2, '#8a6a3a'); }, true],
  vanity: [32, 32, (g) => { P(g, 2, 2, 28, 16, '#2a1a2a'); P(g, 5, 4, 22, 12, '#bfe0ec'); P(g, 6, 5, 6, 1, '#ffffff'); for (let x = 3; x < 30; x += 4) { disc(g, x, 2, 1.3, '#fff6a0'); disc(g, x, 17, 1.3, '#fff6a0'); } for (let y = 6; y < 16; y += 4) { disc(g, 3, y, 1.3, '#fff6a0'); disc(g, 29, y, 1.3, '#fff6a0'); }
    P(g, 0, 20, 32, 12, '#e8e0f0'); P(g, 0, 20, 32, 2, '#ffffff'); P(g, 6, 18, 3, 3, '#e23a2e'); P(g, 20, 17, 4, 4, '#f2c230'); P(g, 0, 30, 32, 2, '#a898b8'); }, true],
  jumprack: [32, 30, (g, f) => { P(g, 2, 2, 28, 2, '#c8c8d0'); P(g, 2, 2, 2, 28, '#9aa3ad'); P(g, 28, 2, 2, 28, '#9aa3ad'); for (const [x, on] of [[7, 1], [15, f ? 0 : 1], [23, 1]]) { P(g, x + 2, 3, 1, 3, '#6a6f78'); if (!on) continue; P(g, x - 1, 6, 8, 10, '#f6f6f2'); P(g, x, 16, 3, 10, '#f6f6f2'); P(g, x + 4, 16, 3, 10, '#f6f6f2'); P(g, x - 1, 6, 8, 1, '#e8c040'); for (let i = 0; i < 3; i++) P(g, x + 1 + i * 2, 10, 1, 1, '#e8c040'); P(g, x, 24, 3, 2, '#e8c040'); P(g, x + 4, 24, 3, 2, '#e8c040'); } }, true],
  goldrec: [16, 16, (g) => { P(g, 1, 1, 14, 14, '#1e1222'); P(g, 1, 1, 14, 1, '#c8a030'); disc(g, 8, 7.5, 5, '#e8c040'); disc(g, 8, 7.5, 3.5, '#c8a030'); disc(g, 8, 7.5, 1, '#e23a2e'); P(g, 5, 4, 2, 1, '#fff0a0'); P(g, 3, 13, 10, 1, '#f4f4f4'); }, true],
  sofa: [32, 20, (g) => { P(g, 0, 4, 32, 14, '#e8c040'); P(g, 0, 4, 32, 3, '#fff0a0'); P(g, 2, 9, 13, 6, '#f6d860'); P(g, 17, 9, 13, 6, '#f6d860'); P(g, 0, 7, 3, 11, '#c8a030'); P(g, 29, 7, 3, 11, '#c8a030'); P(g, 1, 18, 2, 2, '#3a2a1a'); P(g, 29, 18, 2, 2, '#3a2a1a'); P(g, 8, 6, 5, 4, '#a8202e'); }, true],
  rider: [16, 22, (g) => { P(g, 1, 8, 14, 3, '#8a5a30'); P(g, 1, 8, 14, 1, '#b07a44'); P(g, 2, 11, 2, 10, '#6a4422'); P(g, 12, 11, 2, 10, '#6a4422'); P(g, 4, 4, 7, 5, '#ffffff'); P(g, 5, 5, 5, 1, '#8a8a92'); P(g, 5, 7, 4, 1, '#8a8a92'); disc(g, 12, 6, 1.5, '#f2c230'); P(g, 11, 4, 2, 1, '#8a6a10'); }, true],
  cutout: [16, 34, (g) => { P(g, 5, 28, 6, 2, '#8a6a3a'); P(g, 4, 10, 8, 18, '#f6f6f2'); P(g, 4, 10, 8, 1, '#e8c040'); P(g, 6, 14, 4, 1, '#e8c040'); disc(g, 8, 6, 4, '#e8b45a'); P(g, 4, 1, 8, 3, '#15151d'); P(g, 5, 5, 6, 1, '#1a1a24'); P(g, 6, 8, 4, 1, '#8a3a1a'); P(g, 3, 12, 1, 8, '#d8943a'); P(g, 12, 12, 1, 8, '#d8943a'); }, true],
  capsule: [18, 26, (g) => { g.translate(1, 1); P(g, 1, 13, 14, 11, '#2e6ad8'); P(g, 1, 13, 14, 1, '#6a9aff'); disc(g, 8, 17, 2.5, '#f4f4f4'); P(g, 7, 16, 2, 2, '#c8c8d0'); P(g, 5, 21, 6, 2, '#2a2a2a'); P(g, 12, 15, 2, 1, '#f2c230'); disc(g, 8, 7, 6.5, '#d8f0ff');
    for (const [x, y, c] of [[5, 9, '#ff6fb0'], [9, 10, '#ffd23f'], [11, 7, '#5ee07a'], [6, 5, '#3ac0ff'], [8, 7, '#e8c040'], [4, 8, '#ff8a2a']]) { disc(g, x, y, 1.6, c); P(g, x - 1, y, 2, 1, '#fff'); } g.globalAlpha = 0.6; P(g, 4, 3, 2, 3, '#fff'); g.globalAlpha = 1; P(g, 3, 0, 10, 2, '#2e6ad8'); }, true],
  pa: [16, 24, (g) => { P(g, 4, 12, 8, 12, '#2e7d3b'); P(g, 4, 12, 8, 1, '#4aa858'); P(g, 7, 4, 2, 8, '#6a6f78'); oval(g, 8, 4, 2, 2.5, '#2a2a32'); P(g, 7, 3, 1, 2, '#8a8a92'); P(g, 3, 22, 10, 2, '#1e4a26'); disc(g, 8, 17, 2, '#f2c230'); }, true],
  stagedoor: [16, 24, (g) => { P(g, 0, 0, 16, 24, '#3a2440'); P(g, 2, 2, 12, 22, '#5a3a62'); P(g, 2, 2, 12, 1, '#7a5a82'); P(g, 11, 13, 2, 2, '#f2c230'); P(g, 7, 5, 2, 5, '#f2c230'); P(g, 5, 6, 6, 2, '#f2c230'); P(g, 6, 10, 1, 1, '#f2c230'); P(g, 9, 10, 1, 1, '#f2c230'); P(g, 0, 22, 16, 2, '#1e1222'); }, true],
  todd: [10, 7, (g) => { P(g, 2, 3, 6, 2, '#c8302a'); P(g, 1, 2, 2, 2, '#e8402a'); P(g, 7, 2, 2, 2, '#e8402a'); P(g, 6, 3, 1, 1, '#1a1a1a'); P(g, 3, 1, 1, 2, '#c8302a'); P(g, 5, 5, 1, 1, '#c8302a'); P(g, 3, 0, 4, 1, '#2a3a8a'); }, true],
});
