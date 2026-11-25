// ===== life: the store going about its day without you =====
// the food court (order, sit, eat, leave a mess), shopping carts (taken at the door, abandoned in the lot, wrangled back
// by Dustin), the always-on crew (Kayla buses the food court, Dustin does carts), and workers chatting with each other.

// ---------- the food court ----------
const STALL_FOOD = { tacos: ['tacos', 7], pizza: ['a slice', 5], noodles: ['noodles', 9], froyo: ['froyo', 6], pretzels: ['a pretzel', 5], tikka: ['tikka masala', 10] };
const ORDER_UP = ['order up!', 'number 47!', 'here you go, hon.', 'enjoy!', 'careful, it\'s hot.', 'that\'s a lot of cheese. respect.'];
const EATING = ['this is the best part of my day.', 'mmm.', 'don\'t talk to me, i\'m eating.', 'i deserve this.', 'i said i\'d only get a small. i lied.', 'oh that\'s good.', 'this is my lunch break. it\'s 4pm. don\'t ask.', 'they forgot my sauce. it\'s fine. it\'s FINE.'];
const FOOD_SPILL = { tacos: 'salsa', pizza: 'pizza', noodles: 'noodles', froyo: 'froyo', pretzels: 'soda', tikka: 'salsa' };
function goEat(c) { // after shopping, a bite at the food court (once)
  const st = pick(Math.random, W.stalls || []); if (!st) return false; c.ate = true; c.stall = st; c.state = 'walk'; c.then = 'order'; goTo(c, st.front[0] + 0.5, st.front[1] + 0.75); return true;
}
function arriveFood(c) {
  if (c.then === 'order') { c.state = 'order'; c.timer = 2.5 + Math.random() * 2; c.dir = 'down'; return true; }
  if (c.then === 'eat') { c.state = 'eat'; c.timer = 9 + Math.random() * 8; c.dir = c.chair && c.chair.x % 4 === 1 ? 'right' : 'left'; return true; }
  return false;
}
function updateFood(c, dt) {
  if (c.state === 'order') { c.timer -= dt; c.frame = 0; if (c.timer > 0) return true;
    const [what, price] = STALL_FOOD[c.stall.kind] || ['food', 6]; if (c.stall.cook) sayStaff(c.stall.cook, pick(Math.random, ORDER_UP));
    addMoney(price, c.x, c.y - 26); RT.day.extra += price; c.tray = c.stall.kind; moodHit(c, 4);
    const ch = (W.chairs || []).filter(h => !h.cust).sort((a, b) => Math.hypot(a.x * T - c.x, a.y * T - c.y) - Math.hypot(b.x * T - c.x, b.y * T - c.y))[0];
    if (ch) { ch.cust = c; c.chair = ch; c.state = 'walk'; c.then = 'eat'; goTo(c, ch.x + 0.5, ch.y + 0.75); } else { c.tray = null; nextTask(c); } return true; }
  if (c.state === 'eat') { c.timer -= dt; c.frame = 0;
    if (!c.bubble && Math.random() < dt * 0.15) bubble(c, Math.random() < 0.5 ? pick(Math.random, EATING) : (c.p && c.p.topic) || pick(Math.random, EATING), 3.5);
    if (c.timer <= 0) { const ch = c.chair; if (ch) ch.cust = null; c.chair = null;
      if (Math.random() < 0.3) { const k = FOOD_SPILL[c.tray] || 'soda'; if (!RT.spills.find(s => s.x === ch.x && s.y === ch.y)) RT.spills.push({ id: RT.nextId++, x: ch.x, y: ch.y, kind: k, hp: 2 }); if (Math.random() < 0.5) bubble(c, pick(Math.random, ['oops.', 'somebody\'ll get that.', 'that was like that when i got here.']), 2.5); }
      c.tray = null; nextTask(c); } return true; }
  return false;
}

// ---------- shopping carts ----------
// people with a real list push a cart. at the car they leave it in the lot, like people do. Dustin brings them back.
function cartFor(c) { return c.type === 'adult' && c.list && c.list.length >= 2 && Math.random() < 0.7; }
function abandonCart(c) {
  if (!c.cart) return; c.cart = false; RT.carts = RT.carts || []; RT.carts.push({ id: RT.nextId++, x: c.car.x + (Math.random() < 0.5 ? -14 : 14), y: c.car.y + 6 });
  if (RT.carts.length > 30) RT.carts.shift();
}
function looseCartNear(px, py, r) { let best = null, bd = r; for (const k of RT.carts || []) { const d = Math.hypot(k.x - px, k.y - py); if (d < bd) { bd = d; best = k; } } return best; }
function cartBay() { return W.spots.cartBay; }

// ---------- the crew that's always on: Kayla (food court) and Dustin (carts) ----------
function crewSetup() {
  const mk = (kind, name, shirt, x, y, seed) => { const look = randomLook(mkRng(seed), 'adult'); look.shirt = shirt; look.key = 'crew_' + kind; look.pattern = 'logo'; look.pc = '#f2c81c'; look.tote = null; RT.staff.push({ kind, name, look, x: x * T, y: y * T, dir: 'down', state: 'idle', timer: 2, carry: null, path: null, train: 0 }); };
  mk('busser', 'Kayla', '#2e7d3b', 45, 53.7, 4411); mk('carts', 'Dustin', '#f07a22', 84, 56.7, 9001);
}
function updateCrew(s, dt) { // returns true if it handled this staff member
  if (s.kind === 'busser') {
    if (s.state === 'walk') { if (stepPath(s, dt, 44)) s.onArrive && s.onArrive(); return true; }
    if (s.state === 'work') { s.timer -= dt; s.frame = 0; if (s.timer <= 0) { s.state = 'idle'; s.timer = 2; s.done && s.done(); } return true; }
    s.timer -= dt; if (s.timer > 0) return true;
    const fc = DEPTS.findIndex(d => d.id === 'foodcourt'); const sp = RT.spills.find(p => inb(p.x, p.y) && W.zone[idx(p.x, p.y)] === fc && !RT.staff.some(o => o.target === p));
    if (!sp) { s.timer = 4; if (Math.random() < 0.3) { const t = randomZoneTile(['foodcourt']); if (t) { s.state = 'walk'; goTo(s, t[0] + 0.5, t[1] + 0.7); s.onArrive = () => { s.state = 'idle'; s.timer = 3; }; } } return true; }
    s.target = sp; s.state = 'walk'; goTo(s, sp.x + 0.5, sp.y + 0.75);
    s.onArrive = () => { s.state = 'work'; s.timer = 2.4; if (Math.random() < 0.4) sayStaff(s, pick(Math.random, ['every. single. day.', 'who eats noodles like that', 'i went to college for this. okay i didn\'t.', 'got it, got it.'])); s.done = () => { const i = RT.spills.indexOf(sp); if (i >= 0) RT.spills.splice(i, 1); s.target = null; s.timer = 3; }; };
    return true;
  }
  if (s.kind === 'carts') {
    if (s.state === 'walk') { if (stepPath(s, dt, 40)) s.onArrive && s.onArrive(); return true; }
    s.timer -= dt; s.frame = 0; if (s.timer > 0) return true;
    const loose = (RT.carts || []).filter(k => !k.claimed);
    if (s.train && (s.train >= 5 || !loose.length)) { const b = cartBay(); s.state = 'walk'; goTo(s, b[0], b[1]); s.onArrive = () => { s.state = 'idle'; s.timer = 3; RT.cartsIn = (RT.cartsIn || 0) + s.train; s.train = 0; if (Math.random() < 0.5) sayStaff(s, pick(Math.random, ['and that\'s the train, folks.', 'choo choo.', 'my calves are enormous now.'])); }; return true; }
    if (!loose.length) { s.timer = 5; return true; }
    loose.sort((a, b) => Math.hypot(a.x - s.x, a.y - s.y) - Math.hypot(b.x - s.x, b.y - s.y)); const k = loose[0]; k.claimed = true;
    s.state = 'walk'; goTo(s, k.x / T, k.y / T); s.onArrive = () => { const i = RT.carts.indexOf(k); if (i >= 0) { RT.carts.splice(i, 1); s.train++; } s.state = 'idle'; s.timer = 0.5; };
    return true;
  }
  return false;
}

// ---------- workers talk to each other ----------
// a bubble over a worker who isn't a walking shopper (givers, counter clerks, cooks, cashiers, crew)
function sayStaff(e, text, t = 3.5) { e.bubble = { text: say(text), t, kind: 'say' }; RT.staffTalk = RT.staffTalk || []; if (!RT.staffTalk.includes(e)) RT.staffTalk.push(e); }
function speakerPos(e) { return e.o ? [e.o.x * T + 8, e.o.y * T + 12] : e.type === 'staff' ? [e.x * T + 8, e.y * T + 12 - (e.cook ? 11 : 0)] : [e.x, e.y]; }
const WORKER_MOODS = ['hyped', 'tired', 'grumpy', 'gossipy', 'zen'];
function workerMood(name) { const r = mkRng(name.length * 31 + name.charCodeAt(0) * 7 + ST.day * 101); return pick(r, WORKER_MOODS); }
const MOOD_IDLE = {
  hyped: ['let\'s GO, boss. big day. i can feel it.', 'i had three espressos. i can hear colors.', 'i love this job. don\'t quote me.'],
  tired: ['i\'m awake. technically.', 'if i sit down i will die. so i won\'t.', 'my feet filed a complaint.'],
  grumpy: ['don\'t start with me today.', 'somebody parked in my spot. i know who. i\'m watching.', 'i\'m fine. i\'m FINE.'],
  gossipy: ['did you hear about sal and the pickle guy? no? never mind. okay fine.', 'i\'m not saying anything. but deb took a two hour lunch.', 'someone\'s been eating the samples in the stock room. i have theories.'],
  zen: ['the cheese will be fine. everything will be fine.', 'i\'ve accepted the lion. the lion has accepted me.', 'breathe in. smell the bread. breathe out.'],
};
// little two- and three-line exchanges between whoever's near each other ({a} and {b} get their names)
const STAFF_CHAT = [
  [['a', 'who keeps eating my yogurt in the break room fridge?'], ['b', 'it had your name on it. i thought it was a suggestion.']],
  [['a', 'the boss is on skates again.'], ['b', 'the boss is always on skates.'], ['a', 'i know. i\'m just saying it out loud so it\'s real.']],
  [['a', 'did you see the guy in the banana suit?'], ['b', 'he comes every week. his name\'s todd. no, the other todd.']],
  [['a', 'my feet hurt.'], ['b', 'everybody\'s feet hurt. it\'s a grocery store. it\'s the law.']],
  [['a', 'i think the lion winked at me.'], ['b', 'he does that to the new people. you\'re new to him.']],
  [['a', 'what are you doing for lunch?'], ['b', 'pickle from the barrel. same as always.'], ['a', 'that\'s not lunch.'], ['b', 'agree to disagree.']],
  [['a', 'somebody asked me where the "normal food" is.'], ['b', 'what\'d you say?'], ['a', 'i pointed at everything.']],
  [['a', 'the monorail moved again last night.'], ['b', 'it doesn\'t move. it\'s parked.'], ['a', 'that\'s what it WANTS you to think.']],
  [['a', '{b}, you got a second?'], ['b', 'for you? half a second.']],
  [['a', 'i dreamed about cheese again.'], ['b', 'good dream or the bad one?'], ['a', 'the one where it\'s chasing me.']],
  [['a', 'a lady tried to return a half-eaten cake.'], ['b', 'did you take it?'], ['a', 'i ate the other half. problem solved.']],
  [['a', 'you smell like the fish counter.'], ['b', 'i work the fish counter.'], ['a', 'right. carry on.']],
];
const PAIR_CHAT = { // specific people have specific things to fight about
  'Rosa|Sal': [['a', 'sal, your nonna\'s meatballs need more garlic.'], ['b', 'rosa, i will throw this provolone.']],
  'Gus|Philippe': [['b', 'a cheese like that deserves a pinot.'], ['a', 'a cheese like that deserves to be left ALONE, philippe.']],
  'Hank|Trixie': [['a', 'kids should eat more fruit.'], ['b', 'candy has fruit in it. it says so on the bag.'], ['a', 'that\'s a lie and you know it.']],
  'Diablo Dave|Marlene': [['a', 'ever put reaper sauce on shrimp?'], ['b', 'once. i saw my late husband. he was disappointed in me.']],
  'Deb|Dolores': [['b', 'deb, you took my stapler.'], ['a', 'it was a team stapler, dolores.'], ['b', 'it has my NAME on it.']],
  'Dustin|Kayla': [['a', 'i got nine carts in one train today.'], ['b', 'that\'s not a flex, dustin.'], ['a', 'it\'s a little bit of a flex.']],
};
function speakers() { // everyone on staff who could talk: name + an entity to put the bubble on
  const out = [];
  for (const g of W.givers || []) out.push({ name: g.gv.name, e: g.o });
  for (const s of RT.staff) if (s.name) out.push({ name: s.name, e: s });
  return out;
}
function updateStaffTalk(dt) {
  for (const e of RT.staffTalk || []) if (e.bubble) { e.bubble.t -= dt; if (e.bubble.t <= 0) e.bubble = null; }
  RT.staffTalk = (RT.staffTalk || []).filter(e => e.bubble);
  if (RT.chatQ && RT.chatQ.length) { const q = RT.chatQ[0]; q.t -= dt; if (q.t <= 0) { sayStaff(q.e, q.text, 3.4); RT.chatQ.shift(); if (RT.chatQ[0]) RT.chatQ[0].t = 2.3; } return; }
  if ((RT.staffChatT = (RT.staffChatT ?? 12) - dt) > 0 || ST.phase !== 'day') return; RT.staffChatT = 18 + Math.random() * 20;
  const sp = speakers(), pos = s => speakerPos(s.e), near = sp.filter(s => { const [x, y] = pos(s); return onScreen(x, y); });
  for (let i = 0; i < near.length; i++) for (let j = i + 1; j < near.length; j++) {
    const a = near[i], b = near[j], [ax, ay] = pos(a), [bx, by] = pos(b); if (Math.hypot(ax - bx, ay - by) > 12 * T) continue;
    const key1 = a.name + '|' + b.name, key2 = b.name + '|' + a.name; let lines = PAIR_CHAT[key1] || (PAIR_CHAT[key2] && PAIR_CHAT[key2].map(([w, t]) => [w === 'a' ? 'b' : 'a', t]));
    if (!lines && typeof storyGossip === 'function') lines = storyGossip(a.name, b.name);
    if (!lines) lines = bagPick('staff', STAFF_CHAT);
    RT.chatQ = lines.map(([w, t], k) => ({ e: w === 'a' ? a.e : b.e, text: t.replace('{a}', a.name.toLowerCase()).replace('{b}', b.name.toLowerCase()), t: k ? 2.3 : 0 }));
    return;
  }
}
function drawStaffBubbles() { for (const e of RT.staffTalk || []) { if (!e.bubble) continue; const [x, y] = speakerPos(e); if (onScreen(x, y)) drawBubble(sx(x), sy(y - 30), e.bubble); } }
function drawCarts() { // loose carts in the lot, the one a shopper is pushing, Dustin's train, the boss's
  const s = propSprite('cart', 0);
  for (const k of RT.carts || []) if (onScreen(k.x, k.y)) drawSpr(s, k.x - 8, k.y - 12);
  const b = cartBay(), n = Math.min(6, 2 + Math.floor((RT.cartsIn || 0) / 3)); for (let i = 0; i < n; i++) drawSpr(s, (b[0] + 1.2) * T - 8 + (i % 2) * 3, (b[1] - 1.6) * T + Math.floor(i / 2) * 5); // the cart bay fills up
}
