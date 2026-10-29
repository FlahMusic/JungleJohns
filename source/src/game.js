// ===== core game =====
const ST = {}; // saved state
const RT = { custs: [], cars: [], spills: [], staff: [], parts: [], floats: [], toasts: [], time: 0, spawnAcc: 0, paused: true, sleeping: false, menu: null, dialog: null, hintDone: {}, nextId: 1, rnd: Math.random, seen: {} };
const PL = { x: 0, y: 0, vx: 0, vy: 0, dir: 'down', frame: 0, anim: 0, tool: 0, carry: [], bumpT: 0, escort: null, onCash: null };

function newState() {
  Object.assign(ST, {
    v: 1, day: 1, minute: DAY_START, money: 1500, rep: 35, energy: 100, ups: {}, stock: {},
    totals: { served: 0, helped: 0, sales: 0, best: 0, upgrades: 0 }, goals: {}, settings: { clean: false, speed: 1, music: true, sfx: true },
    tut: 0, weather: 'sunny', cheeseTemp: 36, tanks: [0, 0, 0, 0], anims: {},
  });
  DEPTS.forEach(d => { if (d.max) ST.stock[d.id] = Math.round(d.max * 0.85); });
  ST.stock.toys = ST.stock.gacha = ST.stock.cards = ST.stock.tiktok = ST.stock.sushi = 0;
}
function fmtMoney(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
function stars() { return Math.max(1, Math.min(5, Math.ceil(ST.rep / 20))); }
function fmtTime(m) { m = ((m % 1440) + 1440) % 1440; let h = Math.floor(m / 60), mm = Math.floor(m % 60); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return `${h}:${String(mm).padStart(2, '0')} ${ap}`; }
function weekday(day = ST.day) { return WORKDAYS[(day - 1) % 5]; } // a work week: Mon-Fri, then the next week
const MAX_CUSTS = 70;
function eventToday(day = ST.day) { const c = ((day - 1) % 28) + 1; return EVENTS.find(e => e.day === c || e.day + 1 === c) || null; }
function isOpen() { return ST.phase === 'day'; }
function typo(s) { return String(s).replace(/(^|[\s(\[{])"/g, '$1\u201c').replace(/"/g, '\u201d').replace(/'/g, '\u2019'); }
function say(s) { s = s.replace(/\{store\}/g, CONFIG.storeName).replace(/\{owner\}/g, CONFIG.ownerName); if (ST.settings && ST.settings.clean) CLEAN.forEach(([a, b]) => s = s.replace(a, b)); return typo(s); }
const BAGS = {};
function line(cat) { // shuffle bag: no repeats until the pool runs out
  let b = BAGS[cat]; if (!b || !b.length) { b = BAGS[cat] = LINES[cat].map((_, i) => i).sort(() => Math.random() - 0.5); }
  return LINES[cat][b.pop()];
}
function toast(text, kind = '') { RT.toasts.push({ text: say(text), kind, t: 5 }); if (RT.toasts.length > 5) RT.toasts.shift(); }
function floatText(x, y, text, col = '#ffe14d') { RT.floats.push({ x, y, text, col, t: 1.4 }); }
function addMoney(n, x, y) { ST.money += n; if (x !== undefined && n !== 0) floatText(x, y, (n > 0 ? '+' : '') + fmtMoney(n), n > 0 ? '#7dff7a' : '#ff6a5a'); }
function addRep(n) { ST.rep = Math.max(0, Math.min(100, ST.rep + n)); RT.day.repDelta += n; }
function crateCost(type) { const ds = DEPTS.filter(d => d.crate === type); const p = ds.reduce((a, d) => a + d.price, 0) / Math.max(1, ds.length); return Math.round(CRATES[type].units * p * 0.5); }
function carryCap() { return ST.ups.pallet ? 3 : ST.ups.dolly ? 2 : 1; }
function maxSpeed() { return 72 * (ST.ups.skates3 ? 1.6 : ST.ups.skates2 ? 1.3 : 1); }
const WALK_SPEED = 44; // skates off (R)
function toggleSkates() { PL.walk = !PL.walk; PL.vx = PL.vy = 0; }
function deptOpen(d) { return d && (!d.lock || ST.ups[d.lock]); }
function fill(id) { const d = DEPT[id]; return d && d.max ? (ST.stock[id] || 0) / d.max : 1; }

// ---------- day setup ----------
function startDay() {
  RT.day = { sales: 0, tips: 0, wholesale: 0, wages: 0, extra: 0, quest: 0, questsDone: 0, served: 0, helped: 0, lostGaveUp: 0, emptyHits: {}, repDelta: 0, moods: [], emptyDuringFest: false };
  // no clock pressure: it stays daytime until the day's goal is made and you close up
  ST.phase = 'day'; ST.minute = 9 * 60; RT.dayT = 0; RT.goalHit = false; RT.evT = 0; RT.chatT = 4; RT.nightT = 0; ST.energy = ST.energyMaxNext || 100; ST.energyMaxNext = 100;
  ST.tanks = [0, 0, 0, 0]; ST.fedToday = false; ST.cheeseTemp = 36; ST.snacks = 0; ST.hype = false; ST.filmed = false; ST.tourney = false;
  const r = Math.random(); ST.weather = r < 0.68 ? 'sunny' : r < 0.84 ? 'cloudy' : 'rain';
  RT.custs = []; RT.cars = []; RT.spills = []; RT.parts = []; RT.spawnAcc = 0; PL.carry = []; PL.escort = null; RT.lastHour = 6;
  W.parking.forEach(p => p.car = null); W.lanes.forEach(l => { l.queue = []; l.progress = 0; }); W.stools.forEach(s => s.cust = null);
  PL.x = W.spots.start[0] * T; PL.y = W.spots.start[1] * T; PL.vx = PL.vy = 0; PL.dir = 'down';
  Object.keys(ANIMS).forEach(k => { ST.anims[k] = ST.anims[k] || { broken: false, fix: 0 }; ST.anims[k].fix = 0; });
  ST.monorailBroken = false;
  setupStaff(); buildQuests();
  // the store opens with people already shopping, somewhere different every day
  for (let i = 0; i < 14; i++) spawnInside();
}
function setupStaff() {
  RT.staff = [];
  const names = [CONFIG.cashierName, 'Gary', 'Marcus', 'Bev', 'Tyler'], ups = ['', '', 'cashier1', 'cashier2', 'cashier3'];
  W.lanes.forEach(l => l.staff = null);
  ups.forEach((u, i) => { if (!u || ST.ups[u]) { const l = W.lanes[i]; const look = randomLook(mkRng(i * 911 + 7), i === 0 ? 'old' : 'adult'); look.shirt = '#2e7d3b'; look.key = 'cashier' + i; const s = { kind: 'cashier', name: names[i], look, x: (l.cash[0] + 0.5) * T, y: (l.cash[1] + 0.7) * T, dir: 'side', flip: false, lane: l }; l.staff = s; RT.staff.push(s); } });
  const walker = (kind, name, shirt, i) => { const look = randomLook(mkRng(kind.length * 33 + i), 'adult'); look.shirt = shirt; look.key = 'st_' + kind + i; RT.staff.push({ kind, name, look, x: (W.spots.stockDoor[0] + i) * T, y: W.spots.stockDoor[1] * T, dir: 'down', state: 'idle', timer: 3 + i * 20, carry: null, path: null }); };
  if (ST.ups.stocker) walker('stocker', 'Ray', '#3d6fd1', 0);
  if (ST.ups.stocker2) walker('stocker', 'Nina', '#3d6fd1', 1);
  if (ST.ups.janitor) walker('janitor', 'Big Lou', '#6a8a3a', 0);
  if (ST.ups.tech) walker('tech', 'the tech', '#f07a22', 0);
}

// ---------- customers ----------
function pickList(type, family) {
  const ev = eventToday(); const pool = DEPTS.filter(d => d.max && deptOpen(d)); const list = []; const n = type === 'old' ? 1 + Math.floor(Math.random() * 2) : 2 + Math.floor(Math.random() * 2);
  for (let i = 0; i < n; i++) { let tot = 0; const ws = pool.map(d => { let w = d.pop * (ev && ev.boost[d.id] ? ev.boost[d.id] : 1); if (family && ['candy', 'toys', 'gacha'].includes(d.id)) w *= 3; if (list.includes(d.id)) w = 0; tot += w; return w; }); let r = Math.random() * tot; for (let k = 0; k < pool.length; k++) { r -= ws[k]; if (r <= 0) { list.push(pool[k].id); break; } } }
  return list;
}
function spawnCustomer(forced, withKid) {
  const free = W.parking.filter(p => !p.car); if (!free.length) return;
  const side = Math.random() < 0.25; let spots = free.filter(p => !!p.side === side); if (!spots.length) spots = free;
  const sp = spots[Math.floor(Math.random() * spots.length)];
  const rr = Math.random(); const type = forced || (rr < 0.17 ? 'old' : 'adult'); const family = withKid || (type === 'adult' && Math.random() < 0.3);
  const car = { x: sp.x * T + 8, y: sp.y * T + 13, col: pick(Math.random, CAR_COLS), slot: sp, t: 0, leaving: false, enter: 1 }; sp.car = car; RT.cars.push(car);
  const c = mkCust(type, car, sp.side ? 'side' : 'main'); c.list = pickList(type, family);
  if (family) { const k = mkCust('kid', car, c.door); k.parent = c; k.state = 'tag'; c.kid = k; k.x = c.x - 6; }
  return c;
}
function spawnInside() { // a shopper already in the store: parked car outside, standing in a random department
  const c = spawnCustomer(); if (!c) return; c.car.enter = 0;
  const zs = DEPTS.filter(d => d.max && deptOpen(d)).map(d => d.id), t = randomZoneTile(zs); if (!t) return;
  c.x = (t[0] + 0.5) * T; c.y = (t[1] + 0.7) * T; c.path = null; if (c.kid) { c.kid.x = c.x - 6; c.kid.y = c.y; } nextTask(c);
}
function mkCust(type, car, door) {
  const look = randomLook(Math.random, type); const c = { id: RT.nextId++, type, look, x: car.x, y: car.y + 10, dir: 'down', frame: 0, anim: 0, state: 'toStore', path: null, pi: 0, mood: 62 + Math.random() * 10, items: 0, spend: 0, list: [], car, door, bubble: null, lostDone: false, wait: 0, timer: 0, speed: type === 'old' ? 36 : type === 'kid' ? 56 : 46 + Math.random() * 10, seen: {}, hist: [] };
  RT.custs.push(c); const tgt = door === 'side' ? W.spots.sideDoorIn : W.spots.mainDoorIn; goTo(c, tgt[0], tgt[1]); return c;
}
function goTo(e, tx, ty) { const p = findPath(e.x / T, e.y / T - 0.2, tx, ty); e.path = p; e.pi = 1; e.goal = [tx, ty]; if (!p) { e.path = [[Math.floor(tx), Math.floor(ty)]]; e.pi = 0; } return !!p; }
function stepPath(e, dt, spd) {
  if (!e.path || e.pi >= e.path.length) return true;
  const last = e.pi === e.path.length - 1; const n = e.path[e.pi]; let tx = (n[0] + 0.5) * T, ty = (n[1] + 0.7) * T;
  if (last && e.goal) { tx = e.goal[0] * T; ty = e.goal[1] * T; if (Math.floor(e.goal[0]) === e.goal[0]) tx += 8; if (Math.floor(e.goal[1]) === e.goal[1]) ty += 11; }
  const dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy);
  if (d < 1.5) { e.x = tx; e.y = ty; e.pi++; return e.pi >= e.path.length; }
  const s = Math.min(d, spd * dt); e.x += dx / d * s; e.y += dy / d * s; e.anim += s;
  e.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  e.frame = Math.floor(e.anim / 5) % 4; return false;
}
function bubble(c, text, t = 3.5, kind = 'say') { c.bubble = { text: say(text), t, kind }; }
function custTile(c) { return [Math.floor(c.x / T), Math.floor((c.y - 3) / T)]; }
function nextTask(c) {
  if (!isOpen()) { c.list = []; c.hold = null; }
  if (c.hold) { if (c.hold.state === 'active' || c.hold.state === 'offer') { if (goLoiter(c, c.holdZones)) return; } c.hold = null; }
  if (c.kid && !c.sawElvis && Math.random() < 0.6 && W.spots.elvis) { c.sawElvis = true; c.state = 'walk'; c.then = 'elvis'; goTo(c, W.spots.elvis[0] + (Math.random() - 0.5) * 2, W.spots.elvis[1] + Math.random()); return; }
  if (c.type !== 'kid' && !c.tasted && isOpen() && RT.dayT > 30 && Math.random() < 0.14) { c.tasted = true; const s = W.stools.find(s => !s.cust); if (s) { s.cust = c; c.stool = s; c.state = 'walk'; c.then = 'sit'; goTo(c, s.x + 0.5, s.y + 0.75); return; } }
  if (c.list.length) {
    const id = c.list.shift(); c.cur = id; const fr = W.fronts[id]; if (!fr || !fr.length) return nextTask(c);
    if (!c.lostDone && c.type !== 'kid' && Math.random() < 0.12) { makeLost(c, id); return; }
    // sometimes people just drift around a department for a bit first
    if (!c.wandered && Math.random() < 0.18) { c.wandered = true; c.list.unshift(id); if (goLoiter(c, [id])) return; c.list.shift(); }
    const f = fr[Math.floor(Math.random() * fr.length)]; c.state = 'walk'; c.then = 'browse'; c.front = f; goTo(c, f[0] + 0.5, f[1] + 0.75); return;
  }
  if (c.items > 0) { c.state = 'toLane'; joinLane(c); return; }
  leaveStore(c);
}
function makeLost(c, id) {
  id = id || c.list.shift() || c.cur; if (!id || !DEPT[id]) return; c.cur = id; c.lostDone = true; c.state = 'lost'; c.timer = 40; c.path = null;
  c.lostItem = pick(Math.random, DEPT[id].items || [DEPT[id].name]); bubble(c, '?', 999, 'q');
}
function laneOpen(l) { return !!l.staff || (PL.onCash === l); }
function joinLane(c) {
  const open = W.lanes.filter(l => laneOpen(l) && l.queue.length < l.q.length + 2); if (!open.length) { c.state = 'waitLane'; c.timer = 2; return; }
  open.sort((a, b) => a.queue.length - b.queue.length); const l = open[0]; l.queue.push(c); c.lane = l; c.state = 'queue'; c.wait = 0; c.scanned = 0; queueMove(l);
}
function queueMove(l) { l.queue.forEach((c, i) => { const q = l.q[Math.min(i, l.q.length - 1)]; c.qi = i; if (!c.qgoal || c.qgoal[0] !== q[0] || c.qgoal[1] !== q[1]) { c.qgoal = q; goTo(c, q[0] + 0.5, q[1] + 0.7 - (i >= l.q.length ? 0.35 : 0)); } }); }
function leaveStore(c) {
  c.state = 'leaving'; const out = c.items > 0 ? W.spots.exitIn : c.door === 'side' ? W.spots.sideDoorIn : W.spots.mainDoorIn; c.state = 'walk'; c.then = 'exit'; goTo(c, out[0], out[1]);
  if (c.stool) { c.stool.cust = null; c.stool = null; }
}
function finishCust(c) {
  const m = c.mood; RT.day.moods.push(m); addRep((m - 55) / 100 * 0.55);
  const i1 = RT.custs.indexOf(c); if (i1 >= 0) RT.custs.splice(i1, 1); if (c.kid) { const i2 = RT.custs.indexOf(c.kid); if (i2 >= 0) RT.custs.splice(i2, 1); }
  c.car.leaving = true; c.car.t = 0;
}
function moodHit(c, n, why) { c.mood = Math.max(0, Math.min(100, c.mood + n)); if (c.kid) c.kid.mood = c.mood; }

function updateCust(c, dt) {
  if (c.bubble) { c.bubble.t -= dt; if (c.bubble.t <= 0) c.bubble = null; }
  if (c.state === 'tag') { // kid follows parent
    const p = c.parent; if (!p) return; const h = p.hist; const tgt = h.length > 10 ? h[h.length - 10] : [p.x - 8, p.y];
    const dx = tgt[0] - c.x, dy = tgt[1] - c.y, d = Math.hypot(dx, dy); if (d > 1) { const s = Math.min(d, Math.max(30, d * 3) * dt); c.x += dx / d * s; c.y += dy / d * s; c.anim += s; c.frame = Math.floor(c.anim / 4) % 4; c.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); } else c.frame = 0;
    if (p.state === 'gone') c.state = 'gone'; return;
  }
  c.hist.push([c.x, c.y]); if (c.hist.length > 30) c.hist.shift();
  const spd = c.speed * (c.state === 'follow' ? 1.6 : 1);
  switch (c.state) {
    case 'toStore': if (stepPath(c, dt, spd)) nextTask(c); break;
    case 'walk': if (stepPath(c, dt, spd)) arrive(c); break;
    case 'browse': c.timer -= dt; c.frame = 0; if (c.timer <= 0) buy(c); break;
    case 'lost': c.timer -= dt; c.frame = 0; c.dir = 'down'; if (c.timer <= 0) { bubble(c, 'forget it. i\'ll find it myself.', 3); moodHit(c, -10); RT.day.lostGaveUp++; c.state = 'walk'; c.then = 'browse'; const f = pick(Math.random, W.fronts[c.cur]); c.front = f; goTo(c, f[0] + 0.5, f[1] + 0.75); } break;
    case 'follow': {
      const d = DEPT[c.cur]; const dx = PL.x - c.x, dy = PL.y - c.y, dist = Math.hypot(dx, dy);
      if (dist > 20) { if (!c.path || c.pi >= c.path.length || (c.repath -= dt) <= 0) { c.repath = 0.6; goTo(c, PL.x / T, PL.y / T); } stepPath(c, dt, spd); } else c.frame = 0;
      c.timer -= dt; const [tx, ty] = custTile(c); const zi = inb(tx, ty) ? W.zone[idx(tx, ty)] : -1;
      if (zi >= 0 && DEPTS[zi].id === c.cur) { // made it
        PL.escort = null; const tip = 5 + Math.round(Math.random() * 12 + (c.type === 'old' ? 6 : 0)); addMoney(tip, c.x, c.y - 26); RT.day.tips += tip; RT.day.helped++; ST.totals.helped++; moodHit(c, 22); sfx('good'); questEvent('help');
        bubble(c, line('thanks'), 4); hint('helped'); const f = pick(Math.random, W.fronts[c.cur]); c.state = 'walk'; c.then = 'browse'; c.front = f; goTo(c, f[0] + 0.5, f[1] + 0.75);
      } else if (c.timer <= 0) { PL.escort = null; bubble(c, 'ok i\'m on my own. thanks for nothing.', 3); moodHit(c, -12); c.state = 'walk'; c.then = 'browse'; const f = pick(Math.random, W.fronts[c.cur]); c.front = f; goTo(c, f[0] + 0.5, f[1] + 0.75); }
      break;
    }
    case 'sit': {
      c.timer -= dt; c.dir = 'up'; c.frame = 0;
      if (c.poured) { if (c.timer <= 0) { c.stool.cust = null; c.stool = null; nextTask(c); } }
      else if (c.timer <= 0) { moodHit(c, -8); bubble(c, 'nobody\'s pouring. cool.', 3); c.stool.cust = null; c.stool = null; nextTask(c); }
      break;
    }
    case 'queue': {
      if (stepPath(c, dt, spd)) { c.frame = 0; c.dir = c.qi === 0 ? 'left' : 'up'; } c.wait += dt; const l = c.lane;
      if (c.wait > 25) { moodHit(c, -0.4 * dt); if (!c.qComplained && c.wait > 32) { c.qComplained = true; bubble(c, line('queue'), 3.5, 'mad'); } }
      if (!laneOpen(l)) { c.closedT = (c.closedT || 0) + dt; if (c.closedT > 5) { l.queue.splice(l.queue.indexOf(c), 1); queueMove(l); c.closedT = 0; joinLane(c); } } else c.closedT = 0;
      break;
    }
    case 'waitLane': c.timer -= dt; if (c.timer <= 0) joinLane(c); break;
    case 'elvis': c.timer -= dt; c.dir = 'up'; c.frame = 0; if (c.timer <= 0) nextTask(c); break;
    case 'loiter': { // hanging around a department: look about, mutter, drift to another spot
      c.timer -= dt; c.frame = 0; if ((c.lookT = (c.lookT || 0) - dt) <= 0) { c.lookT = 1 + Math.random() * 2; c.dir = pick(Math.random, ['down', 'left', 'right', 'up', 'down']); }
      if (c.timer <= 0) nextTask(c); break;
    }
    case 'exitOut': if (stepPath(c, dt, spd)) { c.state = 'gone'; finishCust(c); } break;
  }
  // passing hazards
  const [tx, ty] = custTile(c);
  for (const s of RT.spills) if (!c.seen['s' + s.id] && Math.abs(s.x - tx) <= 1 && Math.abs(s.y - ty) <= 1) { c.seen['s' + s.id] = 1; moodHit(c, -6); if (Math.random() < 0.4) bubble(c, line('spill'), 3, 'mad'); }
  if (inb(tx, ty)) { const zi = W.zone[idx(tx, ty)]; if (zi >= 0) { const did = DEPTS[zi].id; for (const k in ANIMS) if (ANIMS[k].dept === did && ST.anims[k] && ST.anims[k].broken && !c.seen['a' + k]) { c.seen['a' + k] = 1; moodHit(c, -4); if (Math.random() < 0.35) bubble(c, line('broken').replace('{anim}', ANIMS[k].name), 3, 'mad'); } if (did === 'cheese' && ST.cheeseTemp > 45 && !c.seen.hot) { c.seen.hot = 1; moodHit(c, -5); if (Math.random() < 0.5) bubble(c, 'is the big cheese... sweating?', 3, 'mad'); } } }
}
function arrive(c) {
  const t = c.then;
  if (t === 'browse') { c.state = 'browse'; c.timer = 1.8 + Math.random() * 2.2; if (c.front) { const o = c.front[2]; c.dir = o.y < c.front[1] ? 'up' : o.y > c.front[1] ? 'down' : o.x > c.front[0] ? 'right' : 'left'; } }
  else if (t === 'sit') { c.state = 'sit'; c.timer = 32; c.poured = false; bubble(c, Math.random() < 0.4 ? line('tasting') : '', 999, 'wine'); }
  else if (t === 'elvis') { c.state = 'elvis'; c.timer = 3 + Math.random() * 3; if (c.kid) { c.kid.mood = Math.min(100, c.kid.mood + 8); } if (!ST.anims.elvis.broken) { moodHit(c, 6); if (Math.random() < 0.4) bubble(c.kid || c, line('elvis'), 3); } }
  else if (t === 'loiter') { c.state = 'loiter'; c.timer = 2.5 + Math.random() * 4; }
  else if (t === 'exit') { c.state = 'exitOut'; const car = c.car; goTo(c, car.x / T, car.y / T + 0.2); if (Math.random() < 0.3) bubble(c, c.mood > 70 ? line('leaveHappy') : c.mood < 40 ? line('leaveMad') : 'later.', 3, c.mood < 40 ? 'mad' : 'say'); }
  else nextTask(c);
}
function buy(c) {
  const d = DEPT[c.cur]; const have = ST.stock[d.id] || 0;
  if (have >= 1) {
    const n = Math.min(have, Math.random() < 0.3 ? 2 : 1); ST.stock[d.id] = have - n; c.items += n;
    const mult = d.id === 'wine' && ST.ups.cellar ? 1.3 : 1; c.spend += n * d.price * mult * (0.8 + Math.random() * 0.4); moodHit(c, 3); c.look.basket = true;
    if (Math.random() < 0.012 * (d.id === 'produce' || d.id === 'grocery' || d.id === 'frozen' ? 1.8 : 1)) makeSpill(c);
    if (c.kid && Math.random() < 0.25) { const beg = ['candy', 'toys', 'gacha'].filter(x => deptOpen(DEPT[x]) && !c.list.includes(x)); if (beg.length) { c.list.push(pick(Math.random, beg)); bubble(c.kid, pick(Math.random, ['can we go to the candy part', 'pleeeease', 'i was good though']), 2.5); } }
  } else { moodHit(c, -12); RT.day.emptyHits[d.id] = (RT.day.emptyHits[d.id] || 0) + 1; bubble(c, line('empty').replace('{dept}', d.name.replace('International: ', '').toLowerCase()), 3.5, 'mad'); hint('empty'); }
  nextTask(c);
}
function makeSpill(c, kind) {
  if (RT.spills.length >= 10) return; const [tx, ty] = custTile(c); const opts = [[tx, ty], [tx + 1, ty], [tx - 1, ty], [tx, ty + 1]].filter(([x, y]) => inb(x, y) && !W.solid[idx(x, y)] && !W.outdoor[idx(x, y)] && !RT.spills.find(s => s.x === x && s.y === y));
  if (!opts.length) return; const [x, y] = opts[0]; RT.spills.push({ id: RT.nextId++, x, y, kind: kind || pick(Math.random, ['milk', 'salsa', 'pickle', 'grape']), hp: 3 }); hint('spill');
}

// ---------- registers ----------
function updateLanes(dt) {
  W.lanes.forEach(l => {
    const c = l.queue[0]; if (!c || c.qi !== 0 || (c.path && c.pi < c.path.length)) return;
    if (l.staff) { l.progress += dt / 0.55; }
    if (l.progress >= 1) { l.progress -= 1; c.scanned++; if (l.staff && Math.random() < 0.5 && onScreen(c.x, c.y)) sfx('scan'); }
    if (c.scanned >= c.items) { pay(c, l); }
  });
}
function pay(c, l) {
  const amt = Math.round(c.spend * 100) / 100; ST.money += amt; RT.day.sales += amt; ST.totals.sales += amt; RT.day.served++; ST.totals.served++; floatText(c.x, c.y - 28, '+' + fmtMoney(amt), '#7dff7a'); if (onScreen(c.x, c.y)) sfx('cash');
  l.queue.shift(); l.progress = 0; queueMove(l); c.lane = null; leaveStore(c);
}
function playerScan() {
  const l = PL.onCash; if (!l) return false; const c = l.queue[0];
  if (!c || c.qi !== 0 || (c.path && c.pi < c.path.length)) { flash('nobody at your register yet'); return true; }
  c.scanned++; sfx('scan'); questEvent('scan'); ST.energy = Math.max(0, ST.energy - 0.25); if (c.scanned >= c.items) { pay(c, l); moodHit(c, 4); } return true;
}

// ---------- the running day (untimed) ----------
function hourCurve(h) { return h < 9 ? 0.5 : h < 11 ? 0.8 : h < 14 ? 1.3 : h < 16 ? 0.9 : h < 19 ? 1.4 : h < 21 ? 1.0 : 0.5; }
function custPerMin() { // new arrivals per real minute
  const ev = eventToday(); const dayMul = weekday() === 'Fri' ? 1.2 : 1;
  return 9 * (0.5 + ST.rep / 100) * dayMul * (ev ? ev.crowd : 1) * (ST.ups.billboard ? 1.2 : 1) * (ST.ups.parking ? 1.15 : 1) * (ST.weather === 'rain' ? 0.8 : 1) * (ST.hype ? 1.3 : 1) * (ST.ups.monorail && (dayMul > 1.1 || ev) ? 1.1 : 1);
}
function minPerSec() { return 2; } // staff pacing
function updateDay(dt) {
  if (ST.phase === 'night') return updateNight(dt);
  RT.dayT += dt;
  RT.spawnAcc += dt * custPerMin() / 60; while (RT.spawnAcc >= 1) { RT.spawnAcc--; if (RT.custs.length < MAX_CUSTS) spawnCustomer(); }
  // cheese cooler drifts warmer
  ST.cheeseTemp += dt * 0.06; if (ST.cheeseTemp > 45) { if (!RT.cheeseAlarm) { RT.cheeseAlarm = true; toast('The Big Cheese cooler is too warm. Go check it.', 'warn'); sfx('alarm'); } addRep(-dt * 0.02); } else RT.cheeseAlarm = false;
  if (eventToday()) { const empty = DEPTS.some(d => d.max && deptOpen(d) && ST.stock[d.id] <= 0); if (empty) RT.day.emptyDuringFest = true; }
  RT.evT += dt; if (RT.evT >= 40) { RT.evT = 0; storeTick(); }
  questCrowd(dt); questTrouble(dt); checkDayGoal();
  // somebody on screen says something now and then
  if ((RT.chatT -= dt) <= 0) { RT.chatT = 5 + Math.random() * 6; const cs = RT.custs.filter(c => !c.bubble && c.state !== 'lost' && onScreen(c.x, c.y)); if (cs.length) { const c = pick(Math.random, cs); bubble(c, c.type === 'kid' ? line('kid') : Math.random() < 0.5 ? pick(Math.random, CHATTER) : line(c.type === 'old' ? 'old' : 'adult'), 4); } }
}
function storeTick() { // every 40 s: things break, rain drips in, Elvis sings, monorail riders pay
  for (const k in ANIMS) { if (!W.anims[k]) continue; const a = ST.anims[k]; if (!a.broken && Math.random() < 0.045) { a.broken = true; a.fix = 0; toast(`${ANIMS[k].name[0].toUpperCase() + ANIMS[k].name.slice(1)} broke down. Bring the wrench.`, 'warn'); sfx('alarm'); hint('broken'); } }
  if (!ST.anims.elvis.broken && W.anims.elvis) startElvis(false);
  if (ST.weather === 'rain' && Math.random() < 0.6) { const x = 58 + Math.floor(Math.random() * 4), y = 44 + Math.floor(Math.random() * 2); if (!RT.spills.find(s => s.x === x && s.y === y) && !W.solid[idx(x, y)]) RT.spills.push({ id: RT.nextId++, x, y, kind: 'water', hp: 2 }); }
  if (ST.ups.monorail && !ST.monorailBroken && (weekday() === 'Fri' || eventToday())) { const riders = 8 + Math.floor(Math.random() * 10); RT.day.extra += riders * 3; ST.money += riders * 3; addRep(0.4); }
}
function startElvis(byPlayer) {
  if (RT.elvisT > 0) return false; RT.elvisT = 9; if (onScreen(W.spots.elvis[0] * T, W.spots.elvis[1] * T) || byPlayer) sfx('elvis');
  RT.custs.forEach(c => { const d = Math.hypot(c.x / T - W.spots.elvis[0], c.y / T - W.spots.elvis[1]); if (d < 7) { moodHit(c, c.type === 'kid' ? 10 : 5); } });
  if (byPlayer) questEvent('elvis'); return true;
}
// ---------- staff AI ----------
function updateStaff(dt) {
  RT.staff.forEach(s => {
    if (s.kind === 'cashier') { s.anim = (s.anim || 0) + dt; s.dir = 'right'; s.frame = 0; return; }
    if (s.state === 'walk') { if (stepPath(s, dt, 46)) s.onArrive && s.onArrive(); return; }
    if (s.state === 'work') { s.timer -= dt; s.frame = 0; if (s.timer <= 0) { s.state = 'idle'; s.timer = 1; s.done && s.done(); } return; }
    s.timer -= dt * minPerSec(); s.frame = 0; if (s.timer > 0) return;
    if (s.kind === 'stocker') {
      if (!isOpen() && ST.minute > CLOSE_MIN) { s.timer = 999; return; }
      const cands = DEPTS.filter(d => d.max && d.crate && deptOpen(d) && fill(d.id) < 0.7 && !RT.staff.some(o => o !== s && o.target === d.id)).sort((a, b) => fill(a.id) - fill(b.id));
      if (!cands.length) { s.timer = 20; return; }
      const d = cands[0]; s.target = d.id; const pal = W.pallets.find(p => p.crate === d.crate); if (!pal) { s.timer = 20; return; }
      s.state = 'walk'; goTo(s, pal.x + 0.5, pal.y + 1.75);
      s.onArrive = () => { const cost = crateCost(d.crate); if (ST.money < cost) { s.state = 'idle'; s.timer = 30; s.target = null; return; } ST.money -= cost; RT.day.wholesale += cost; s.carry = d.crate; const f = pick(Math.random, W.fronts[d.id]); s.state = 'walk'; goTo(s, f[0] + 0.5, f[1] + 0.75); s.onArrive = () => { s.state = 'work'; s.timer = 1.2; s.done = () => { ST.stock[d.id] = Math.min(d.max, ST.stock[d.id] + CRATES[d.crate].units); s.carry = null; s.target = null; s.timer = 75; }; }; };
    } else if (s.kind === 'janitor') {
      const free = RT.spills.filter(p => !RT.staff.some(o => o.target === p)); if (!free.length) { s.timer = 6; return; }
      free.sort((a, b) => Math.hypot(a.x * T - s.x, a.y * T - s.y) - Math.hypot(b.x * T - s.x, b.y * T - s.y)); const sp = free[0]; s.target = sp; s.state = 'walk'; goTo(s, sp.x + 0.5, sp.y + 0.75);
      s.onArrive = () => { s.state = 'work'; s.timer = 2.2; s.done = () => { const i = RT.spills.indexOf(sp); if (i >= 0) RT.spills.splice(i, 1); s.target = null; s.timer = 10; }; };
    } else if (s.kind === 'tech') {
      const k = Object.keys(ANIMS).find(k => W.anims[k] && ST.anims[k].broken); if (!k) { s.timer = 10; return; }
      const o = W.objs.find(o => o.anim === k); const f = [o.x + 0.5, o.y + o.h + 0.75]; s.state = 'walk'; goTo(s, f[0], f[1]);
      s.onArrive = () => { s.state = 'work'; s.timer = 3.5; s.done = () => { ST.anims[k].broken = false; ST.anims[k].fix = 0; s.timer = 20; }; };
    }
  });
}

// ---------- cars ----------
function updateCars(dt) {
  for (let i = RT.cars.length - 1; i >= 0; i--) { const c = RT.cars[i]; if (c.enter > 0) c.enter = Math.max(0, c.enter - dt * 1.5); if (c.leaving) { c.t += dt; if (c.t > 0.9) { c.slot.car = null; RT.cars.splice(i, 1); } } }
}

// ---------- player ----------
const KEYS = {};
function playerFacing() {
  const d = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] }[PL.dir];
  const fx = PL.x + d[0] * 12, fy = PL.y - 5 + d[1] * 12; return { tx: Math.floor(fx / T), ty: Math.floor(fy / T), px: fx, py: fy };
}
function updatePlayer(dt) {
  if (RT.dialog || RT.menu || RT.sleeping) { PL.vx *= 0.8; PL.vy *= 0.8; return; }
  let ix = 0, iy = 0; if (KEYS.ArrowLeft || KEYS.KeyA) ix--; if (KEYS.ArrowRight || KEYS.KeyD) ix++; if (KEYS.ArrowUp || KEYS.KeyW) iy--; if (KEYS.ArrowDown || KEYS.KeyS) iy++;
  PL.input = !!(ix || iy);
  if (ix || iy) { hint('moved'); const l = Math.hypot(ix, iy); ix /= l; iy /= l; PL.dir = Math.abs(ix) > Math.abs(iy) ? (ix > 0 ? 'right' : 'left') : (iy > 0 ? 'down' : 'up'); }
  const tired = ST.energy <= 0 ? 0.55 : 1;
  if (PL.walk) { // skates off: walk, no glide, stop dead
    const ws = WALK_SPEED * tired; PL.vx = ix * ws; PL.vy = iy * ws; PL.braking = false; PL.lean = 0; PL.stride = (PL.stride || 0) + dt;
  } else {
    // roller skates: push strides, carve turns, coast, T-stop to reverse
    const ms = maxSpeed() * tired * (PL.carry.length ? 0.9 : 1);
    let sp = Math.hypot(PL.vx, PL.vy); const brake = KEYS.ShiftLeft || KEYS.ShiftRight; PL.braking = false; PL.lean = 0;
    const SK = { period: 0.34, kick: 26, push: 110, turn: 4.5, coast: 1.6, brakeK: 7 };
    if (ix || iy) {
      if (sp > 14) {
        const va = Math.atan2(PL.vy, PL.vx), ia = Math.atan2(iy, ix); let da = ia - va; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
        if (Math.abs(da) > 2.2) { const k = Math.exp(-SK.brakeK * dt); PL.vx *= k; PL.vy *= k; PL.braking = true; } // pushing the other way = T-stop first
        else { const na = va + Math.max(-SK.turn * dt, Math.min(SK.turn * dt, da)); PL.vx = Math.cos(na) * sp; PL.vy = Math.sin(na) * sp; PL.lean = Math.sign(da) * Math.min(1, Math.abs(da)); }
      }
      PL.stride = (PL.stride || 0) + dt;
      if (PL.stride >= SK.period) { PL.stride -= SK.period; PL.side = !PL.side; sp = Math.hypot(PL.vx, PL.vy); if (sp < ms && !PL.braking) { const b = Math.min(SK.kick, ms - sp); PL.vx += ix * b; PL.vy += iy * b; } }
      if (!PL.braking) { PL.vx += ix * SK.push * dt; PL.vy += iy * SK.push * dt; }
    } else { PL.stride = SK.period * 0.6; const k = Math.exp(-(Math.hypot(PL.vx, PL.vy) < 10 ? 7 : SK.coast) * dt); PL.vx *= k; PL.vy *= k; }
    if (brake) { const k = Math.exp(-SK.brakeK * dt); PL.vx *= k; PL.vy *= k; PL.braking = true; }
    sp = Math.hypot(PL.vx, PL.vy); if (sp > ms) { const k = Math.max(ms / sp, Math.exp(-3 * dt)); PL.vx *= k; PL.vy *= k; }
    if (PL.braking && sp > 30 && Math.random() < 0.6) RT.parts.push({ x: PL.x + (Math.random() - 0.5) * 8, y: PL.y - 1, vx: (Math.random() - 0.5) * 40, vy: -20 - Math.random() * 20, t: 0.3, c: Math.random() < 0.5 ? '#ffd23f' : '#ff8a2a' });
    PL.period = SK.period;
  }
  moveAxis(PL.vx * dt, 0); moveAxis(0, PL.vy * dt);
  const s2 = Math.hypot(PL.vx, PL.vy); PL.anim += s2 * dt; PL.frame = 0; PL.bumpT -= dt;
  // standing on a register cashier spot?
  const tx = Math.floor(PL.x / T), ty = Math.floor((PL.y - 3) / T); PL.onCash = W.lanes.find(l => !l.staff && l.cash[0] === tx && l.cash[1] === ty) || null;
  if (PL.onCash) hint('cash');
}
function hitAt(x, y) { const hw = 4.5, hh = 3; for (const [px, py] of [[x - hw, y - hh], [x + hw, y - hh], [x - hw, y], [x + hw, y]]) { const tx = Math.floor(px / T), ty = Math.floor(py / T); if (isSolid(tx, ty)) return true; } return false; }
function moveAxis(dx, dy) {
  if (!dx && !dy) return; const steps = Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 2); const sx = dx / steps, sy = dy / steps;
  for (let i = 0; i < steps; i++) { if (hitAt(PL.x + sx, PL.y + sy)) { const v = Math.abs(dx ? PL.vx : PL.vy); if (v > 45 && PL.bumpT <= 0) { sfx('bump'); PL.bumpT = 0.3; } if (dx) PL.vx *= -0.25; else PL.vy *= -0.25; return; } PL.x += sx; PL.y += sy; }
}
let flashMsg = null; function flash(t) { flashMsg = { text: say(t), t: 2.2 }; }

// what's in front of the player + what Space would do
function targetInfo() {
  const f = playerFacing(); const tool = TOOLS[PL.tool].id;
  const gv = ST.phase === 'day' && giverNear(f); if (gv && !PL.onCash) { const m = giverMarker(gv); return { act: 'giver', g: gv, label: `Space: talk to ${gv.gv.name}` + (m === '?' ? ' (job done!)' : m === '!' ? ' (has a job)' : '') }; }
  // customers first
  let best = null, bd = 14;
  for (const c of RT.custs) { const d = Math.hypot(c.x - f.px, c.y - 4 - f.py); if (d < bd) { bd = d; best = c; } }
  for (const s of RT.staff) { const d = Math.hypot(s.x - f.px, s.y - 4 - f.py); if (d < bd) { bd = d; best = s; } }
  const o = inb(f.tx, f.ty) ? W.objAt.get(idx(f.tx, f.ty)) : null;
  const spill = RT.spills.find(s => (s.x === f.tx && s.y === f.ty) || (s.x === Math.floor(PL.x / T) && s.y === Math.floor((PL.y - 3) / T)));
  if (PL.onCash && tool === 'hands') { const c = PL.onCash.queue[0]; return { act: 'scan', label: c && c.qi === 0 ? `Space: scan item (${c.scanned}/${c.items})` : 'Waiting for a customer' }; }
  if (tool === 'mop' && spill) return { act: 'mop', spill, label: 'Space: mop the spill' };
  if (best && best.kind) return { act: 'talkStaff', s: best, label: `Space: talk to ${best.name}` };
  if (best && (tool === 'hands' || best.state === 'lost')) {
    if (best.state === 'lost') return { act: 'help', c: best, label: 'Space: help this lost customer' };
    if (best.state === 'sit' && !best.poured) return { act: 'pour', c: best, label: 'Space: pour a tasting ($5)' };
    const sq = tool === 'hands' && sampleQuestFor(best); if (sq) return { act: 'sample', c: best, q: sq, label: sq.def.type === 'talk' ? `Space: ask about sandwiches (${sq.got}/${sq.n})` : `Space: give a ${sq.def.item} (${sq.got}/${sq.n})` };
    return { act: 'talk', c: best, label: 'Space: talk' };
  }
  if (best && best.kind) return { act: 'talkStaff', s: best, label: `Space: talk to ${best.name}` };
  if (!o) return spill && tool !== 'mop' ? { label: 'Spill here. Switch to the mop (2).' } : null;
  const dept = o.dept ? DEPT[o.dept] : null;
  if (o.type === 'pallet') { const cost = crateCost(o.crate); if (tool !== 'hands') return { label: 'Switch to hands (1) to grab crates' }; if (PL.carry.length && PL.carry[PL.carry.length - 1] === o.crate) return { act: 'return', o, label: `Space: put back ${CRATES[o.crate].name} crate (refund)` }; if (PL.carry.length >= carryCap()) return { label: `Hands full (${carryCap()} max)` }; return { act: 'grab', o, label: `Space: grab ${CRATES[o.crate].name} crate (${fmtMoney(cost)})` }; }
  if (dept && dept.max) {
    const lbl = `${dept.name}: ${ST.stock[dept.id]}/${dept.max}`;
    if (PL.carry.length) { const i = PL.carry.indexOf(dept.crate); if (i >= 0) return { act: 'stock', o, dept, i, label: `Space: restock ${dept.name} (${ST.stock[dept.id]}/${dept.max})` }; return { label: `${lbl}. Needs a ${CRATES[dept.crate].name} crate.` }; }
    if (o.type === 'tank') { if (tool === 'food') return { act: 'feed', o, label: ST.fedToday ? 'Fish are full' : 'Space: feed the tanks' }; return { label: ST.fedToday ? 'Live tanks (fed)' : 'Live tanks are hungry. Fish food is tool 4.' }; }
    if (o.type === 'bigcheese') return cheeseInfo(tool);
    if (o.anim && ST.anims[o.anim] && ST.anims[o.anim].broken) return animInfo(o, tool);
    return { label: lbl + (ST.stock[dept.id] < dept.max * 0.3 ? ` - low! grab a ${CRATES[dept.crate].name} crate` : '') };
  }
  if (o.type === 'tank') { if (tool === 'food') return { act: 'feed', o, label: ST.fedToday ? 'Fish are full' : 'Space: feed the tanks' }; return { label: ST.fedToday ? 'Live tanks (fed)' : 'Live tanks are hungry. Fish food is tool 4.' }; }
  if (o.type === 'bigcheese') return cheeseInfo(tool);
  if (o.anim) return animInfo(o, tool);
  if (o.type === 'desk') return { act: 'computer', label: 'Space: use the computer (catalog)' };
  if (o.type === 'couch') return { act: 'sleep', label: RT.goalHit ? 'Space: close up for the night' : `Couch. Make ${fmtMoney(goalLeft())} more before closing up` };
  if (o.type === 'fridge') return { act: 'snack', label: ST.snacks >= 3 ? 'Snacks are gone for today' : 'Space: eat a snack (+energy)' };
  if (o.type === 'ringlight') return { act: 'film', label: ST.filmed ? 'Already posted today' : 'Space: film a TikTok (crowd boost)' };
  if (o.type === 'cardtable') return { act: 'tourney', label: weekday() !== 'Fri' ? 'Tournaments are on Fridays' : ST.tourney ? 'Tournament done today' : 'Space: run the card tournament' };
  if (o.type === 'register') return { label: 'Stand on the left side of a register to work it' };
  return null;
}
function cheeseInfo(tool) { return { act: 'cheese', label: `Big Cheese cooler: ${Math.round(ST.cheeseTemp)}°F. Space: crank the cold` + (ST.cheeseTemp > 45 ? ' NOW' : '') }; }
function animInfo(o, tool) { const a = ST.anims[o.anim]; const nm = ANIMS[o.anim].name; if (!a.broken) { if (o.anim === 'elvis') return { act: 'elvis', label: 'Space: make Elvis sing' }; return { label: nm[0].toUpperCase() + nm.slice(1) }; } if (tool !== 'wrench') return { label: `${nm} is broken. Wrench is tool 3.` }; return { act: 'fix', o, label: `Space: fix ${nm} (${a.fix}/4)` }; }

function doAction() {
  if (RT.dialog) { advanceDialog(); return; }
  if (RT.menu || RT.sleeping) return;
  const t = targetInfo(); if (!t || !t.act) { if (t && t.label) flash(t.label); return; }
  const cost = (n) => { ST.energy = Math.max(0, ST.energy - n); if (ST.energy === 0 && !RT.tiredWarned) { RT.tiredWarned = true; toast('You\'re out of energy. Eat a snack in the stock room or sleep.', 'warn'); } };
  switch (t.act) {
    case 'scan': playerScan(); break;
    case 'grab': { const c = crateCost(t.o.crate); if (ST.money < c) { sfx('err'); flash('Not enough money for that crate'); return; } ST.money -= c; RT.day.wholesale += c; PL.carry.push(t.o.crate); sfx('pick'); cost(1.5); floatText(PL.x, PL.y - 30, '-' + fmtMoney(c), '#ff8a7a'); hint('grabbed'); break; }
    case 'return': { const c = crateCost(t.o.crate); PL.carry.pop(); ST.money += c; RT.day.wholesale -= c; sfx('pick'); break; }
    case 'stock': { const d = t.dept; PL.carry.splice(t.i, 1); ST.stock[d.id] = Math.min(d.max, ST.stock[d.id] + CRATES[d.crate].units); sfx('stock'); cost(1.5); questEvent('stock', d.id); sparkle(t.o.x * T + 8, t.o.y * T); floatText(PL.x, PL.y - 30, d.name + ' restocked', '#9fe8ff'); hint('stocked'); break; }
    case 'mop': { t.spill.hp -= ST.ups.mop2 ? 3 : 1; sfx('mop'); cost(1); if (t.spill.hp <= 0) { RT.spills.splice(RT.spills.indexOf(t.spill), 1); sparkle(t.spill.x * T + 8, t.spill.y * T + 8); questEvent('mop'); } break; }
    case 'fix': { const a = ST.anims[t.o.anim]; a.fix++; sfx('clank'); cost(2); RT.parts.push({ x: t.o.x * T + 10, y: t.o.y * T, vx: (Math.random() - 0.5) * 40, vy: -40, t: 0.4, c: '#ffe14d' }); if (a.fix >= 4) { a.broken = false; a.fix = 0; sfx('good'); toast(`Fixed ${ANIMS[t.o.anim].name}.`); addRep(0.5); questEvent('fix'); } break; }
    case 'feed': { if (ST.fedToday) return; ST.fedToday = true; sfx('feed'); cost(1); questEvent('feed'); W.tanks.forEach(o => sparkle(o.x * T + 8, o.y * T + 4)); toast('Tanks fed. Happy fish.'); break; }
    case 'cheese': { const warm = ST.cheeseTemp > 37; ST.cheeseTemp = 34; sfx('good'); cost(1); toast('Big Cheese cooler back to 34°F.'); if (warm) questEvent('cool'); else flash('Already cold. Give it a minute to warm up.'); break; }
    case 'elvis': { if (!startElvis(true)) flash('He\'s catching his breath'); break; }
    case 'help': { const c = t.c; c.state = 'follow'; c.timer = 60; c.path = null; c.repath = 0; c.bubble = null; PL.escort = c; sfx('talk'); showDialog('Customer', line('lost').replace('{item}', c.lostItem), null, `They want ${c.lostItem}. Lead them to ${DEPT[c.cur].name}.`); break; }
    case 'pour': { const c = t.c; c.poured = true; c.timer = 5; c.bubble = null; moodHit(c, 12); addMoney(5, c.x, c.y - 28); RT.day.extra += 5; sfx('pour'); cost(0.5); bubble(c, line('poured'), 3); questEvent('pour'); if (Math.random() < 0.6) c.list.unshift(Math.random() < 0.6 ? 'wine' : 'beer'); break; }
    case 'talk': { const c = t.c; sfx('talk'); const cat = c.type === 'kid' ? 'kid' : c.type === 'old' ? 'old' : 'adult'; bubble(c, line(cat), 4); if (!c.talked) { c.talked = true; moodHit(c, 3); } break; }
    case 'talkStaff': { sfx('talk'); showDialog(t.s.name, staffLine(t.s)); break; }
    case 'giver': talkGiver(t.g); break;
    case 'sample': giveSample(t.c, t.q); cost(0.5); break;
    case 'computer': openMenu('catalog'); break;
    case 'sleep': trySleep(); break;
    case 'snack': { if (ST.snacks >= 3) return; ST.snacks++; const n = ST.ups.coffee ? 40 : 20; ST.energy = Math.min(100, ST.energy + n); sfx('good'); toast(`Snack. +${n} energy.`); break; }
    case 'film': { if (ST.filmed) return; ST.filmed = true; ST.hype = true; addRep(1); cost(5); sfx('good'); toast('Video posted. It\'s doing numbers. More customers today.'); break; }
    case 'tourney': { if (weekday() !== 'Fri' || ST.tourney) return; ST.tourney = true; addMoney(400, PL.x, PL.y - 30); RT.day.extra += 400; addRep(1); for (let i = 0; i < 6; i++) spawnCustomer('adult'); sfx('good'); toast('Card tournament ran. +$400 in entry fees.'); break; }
  }
}
function staffLine(s) {
  const L = {
    cashier: ['lines are getting long, boss. hop on a register if you want. stand on the left side.', 'someone tried to pay in canadian money again.', 'i\'ve been at this register since the fruit stand days. don\'t ask.'],
    stocker: ['i grab whatever aisle\'s emptiest. you pay for the crates though.', 'produce goes fast. like, weirdly fast.'],
    janitor: ['you spill it, i mop it. that\'s the circle of life.', 'pickle jars. always pickle jars.'],
    tech: ['that lion\'s older than both of us. he\'s fine. mostly.', 'if the swing breaks again i\'m quitting. kidding.'],
  };
  return pick(Math.random, L[s.kind] || ['hey boss.']);
}
function sparkle(x, y) { for (let i = 0; i < 10; i++) RT.parts.push({ x, y, vx: (Math.random() - 0.5) * 60, vy: -Math.random() * 50, t: 0.6, c: pick(Math.random, ['#fff6a0', '#9ff0ff', '#ffffff']) }); }
function trySleep() { closeUp(); }

// ---------- end of day ----------
function endDay() {
  RT.sleeping = false; const d = RT.day; let wages = 0; UPGRADES.forEach(u => { if (ST.ups[u.id] && u.wage) wages += u.wage; }); wages += 180; d.wages = wages; ST.money -= wages;
  if (d.sales > ST.totals.best) ST.totals.best = d.sales;
  if (eventToday() && !d.emptyDuringFest) ST.goals.festOk = true;
  checkGoals();
  ST.weekEarned = (weekday() === 'Mon' ? 0 : ST.weekEarned || 0) + earnedToday();
  RT.report = { ...d, day: ST.day, wd: weekday(), week: weekNo(), goal: dayGoal(), earned: earnedToday(), weekEarned: ST.weekEarned, weekDone: weekday() === 'Fri', stars: stars(), quests: (RT.quests || []).map(q => ({ who: q.g.gv.name, text: questGoalText(q), done: q.state === 'done', reward: q.reward })) };
  ST.day++; save(); openMenu('report');
}
function checkGoals() {
  const done = (id, cond) => { if (!ST.goals[id] && cond) { ST.goals[id] = true; const g = GOALS.find(g => g.id === id); ST.money += g.reward; toast(`Goal done: ${g.text}. +${fmtMoney(g.reward)}`, 'good'); sfx('good'); if (id === 'stars5') RT.legend = true; } };
  done('stars3', stars() >= 3); done('serve500', ST.totals.served >= 500); done('help25', ST.totals.helped >= 25); done('up3', ST.totals.upgrades >= 3);
  done('day5k', RT.day && RT.day.sales >= 5000); done('fest', ST.goals.festOk); done('monorail', ST.ups.monorail); done('stars5', stars() >= 5);
}
function buyUpgrade(id) {
  const u = UPG[id]; if (ST.ups[id] || ST.money < u.cost || stars() < u.stars || (u.req && !ST.ups[u.req])) return false;
  ST.money -= u.cost; ST.ups[id] = true; ST.totals.upgrades++; sfx('good');
  if (u.cat === 'area' || id === 'billboard' || id === 'parking') { rebuild(); const d = DEPTS.find(d => d.lock === id); if (d) ST.stock[d.id] = Math.round(d.max * 0.6); }
  if (u.cat === 'staff') setupStaff();
  if (id === 'drone') addRep(5); if (id === 'cellar') addRep(3);
  checkGoals(); save(); return true;
}
function rebuild() { // keep people, rebuild map
  const lanesQ = W.lanes.map(l => l.queue); const stoolC = W.stools.map(s => s.cust);
  buildWorld(ST.ups); W.lanes.forEach((l, i) => { l.queue = lanesQ[i] || []; }); W.stools.forEach((s, i) => { s.cust = stoolC[i] || null; if (s.cust) s.cust.stool = s; });
  RT.custs.forEach(c => { if (c.lane) c.lane = W.lanes[c.lane.i]; if (c.state === 'walk' || c.state === 'toStore' || c.state === 'exitOut') goTo(c, c.goal[0], c.goal[1]); });
  setupStaff();
}

// ---------- tutorial hints ----------
const IS_TOUCH = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
const HINTS = [
  ['moved', IS_TOUCH ? 'Drag the stick to skate. You glide, so ease off early.' : 'WASD or arrows to skate. You glide, so ease off early. Shift brakes.'],
  ['grabbed', 'Shelves empty as people shop. Go in the Stock Room, face a pallet and press Space (A) to grab a crate.'],
  ['stocked', 'Skate the crate to the aisle it belongs to, face the shelf and press Space.'],
  ['helped', 'People with a blue ? are lost. Talk to them and they follow you. Skate them to the right aisle for a tip.'],
  ['quest', 'Staff with a yellow ! have a job for you. Skate over and press Space. Jobs pay and count toward today\'s goal.'],
];
function hint(id) { RT.hintDone[id] = true; if (HINTS[ST.tut] && HINTS[ST.tut][0] === id) { ST.tut++; } }
function currentHint() {
  if (ST.day > 3) return null; if (HINTS[ST.tut]) return HINTS[ST.tut][1];
  if (RT.quests && RT.quests.some(q => q.state === 'ready') && !RT.seen.turnin) return 'A job is done. Follow the yellow arrow to the yellow ? and press Space to get paid.';
  if (RT.spills.length && !RT.seen.mop) return 'Spill! Press 2 (or TOOL) for the mop, skate over it and press Space.';
  if (Object.keys(ANIMS).some(k => ST.anims[k] && ST.anims[k].broken) && !RT.seen.wrench) return 'A display broke. Press 3 (or TOOL) for the wrench, face it and press Space a few times.';
  if (W.lanes.some(l => l.queue.length > 3) && !RT.seen.cash) return 'Lines are long. Stand on the left side of an empty register and mash Space to scan.';
  if (ST.money > 3000 && !RT.seen.cat) return 'You can afford upgrades. Use the computer in the Stock Room.';
  if (RT.goalHit && !RT.seen.bed) return 'Goal made! Click Close up by the clock when you\'re ready for tomorrow.';
  return null;
}
function onScreen(x, y) { return x > R.cx - 32 && x < R.cx + R.vw + 32 && y > R.cy - 32 && y < R.cy + R.vh + 48; }

// ---------- main update ----------
function update(dt) {
  if (RT.paused) return;
  if (RT.dialog || (RT.menu && RT.menu !== 'map')) { updateUI(dt); return; }
  const sub = 1;
  for (let i = 0; i < sub; i++) {
    updateDay(dt); if (RT.menu === 'report') break; updatePlayer(dt);
    for (let k = RT.custs.length - 1; k >= 0; k--) { const c = RT.custs[k]; if (c) updateCust(c, dt); }
    updateLanes(dt); updateStaff(dt); updateCars(dt);
    if (RT.elvisT > 0) { RT.elvisT -= dt; if (Math.random() < dt * 4) RT.parts.push({ x: W.spots.elvis[0] * T + (Math.random() - 0.5) * 20, y: (W.spots.elvis[1] - 3) * T, vx: (Math.random() - 0.5) * 20, vy: -25, t: 1.4, note: true, c: pick(Math.random, ['#ffe14d', '#ff8fc0', '#9ff0ff']) }); }
  }
  if (PL.escort && !RT.custs.includes(PL.escort)) PL.escort = null;
  if (PL.onCash) RT.seen.cash = true; if (TOOLS[PL.tool].id === 'mop') RT.seen.mop = true; if (TOOLS[PL.tool].id === 'wrench') RT.seen.wrench = true; if (ST.fedToday) RT.seen.fish = true;
  RT.parts = RT.parts.filter(p => { p.t -= dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.conf) p.vx += Math.sin(p.t * 6) * 30 * dt; else if (!p.note) p.vy += 120 * dt; return p.t > 0; });
  RT.floats = RT.floats.filter(f => { f.t -= dt; f.y -= 18 * dt; return f.t > 0; });
  RT.toasts = RT.toasts.filter(t => (t.t -= dt) > 0); if (flashMsg) { flashMsg.t -= dt; if (flashMsg.t <= 0) flashMsg = null; }
  if (RT.legend) { RT.legend = false; showDialog(CONFIG.cashierName, `five stars. people drive in from three states now. you're a jungle legend, boss. the store's yours to keep growing. go nuts.`); }
  checkGoals(); updateUI(dt);
}

// ---------- save / load ----------
const SAVE_KEY = 'jungle-store-save-v1';
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(ST)); } catch (e) { } }
function load() { try { const s = localStorage.getItem(SAVE_KEY); if (!s) return false; const o = JSON.parse(s); if (!o || o.v !== 1) return false; newState(); Object.assign(ST, o); return true; } catch (e) { return false; } }
function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }
