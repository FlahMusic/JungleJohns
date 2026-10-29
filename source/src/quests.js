// ===== quests: the day's money goal (main quest) + one side quest per area giver =====
function weekNo(day = ST.day) { return Math.floor((day - 1) / 5) + 1; }
function dayGoal(day = ST.day) { return Math.round(WEEK_GOALS[(day - 1) % 5] * (1 + 0.3 * (weekNo(day) - 1)) / 100) * 100; }
function earnedToday() { const d = RT.day; return d ? d.sales + d.tips + d.extra + d.quest : 0; }
function goalLeft() { return Math.max(0, dayGoal() - earnedToday()); }

// today's quests: one per giver whose area is open
function buildQuests() {
  const wd = (ST.day - 1) % 5, k = 1 + 0.2 * (weekNo() - 1), money = 1 + 0.3 * (weekNo() - 1);
  RT.quests = W.givers.map(g => {
    const def = QUESTS[g.gv.id][wd]; const n = def.type === 'feed' ? 1 : Math.round(def.n * k);
    return { key: g.gv.id + ST.day, g, def, n, got: 0, reward: Math.round(def.reward * money / 10) * 10, state: 'offer' };
  });
}
const questOf = g => RT.quests && RT.quests.find(q => q.g === g);
const deptName = id => DEPT[id] ? DEPT[id].name.replace('International: ', '') : id;
function questWhere(q) { const z = q.def.zones || (q.def.dept ? [q.def.dept] : null); return z ? z.map(deptName).join(', ') : q.def.type === 'scan' ? 'Registers' : q.def.type === 'pour' ? 'Tasting Bar' : 'anywhere'; }
function questGoalText(q) { // plain words for the log
  const d = q.def, n = q.n;
  return { sample: `Give a ${d.item} to ${n} ${d.kids ? 'kids' : 'customers'} in ${questWhere(q)}.`, talk: `Ask ${n} customers in ${questWhere(q)} about sandwiches.`, stock: `Restock ${deptName(d.dept)} ${n} times.`,
    help: `Walk ${n} lost customers (blue ?) to their aisle.`, mop: `Mop ${n} spills.`, fix: `Fix ${n} broken displays.`, pour: `Pour ${n} tastings at the Tasting Bar.`, feed: 'Feed the live tanks in Seafood (tool 4).',
    cool: `Crank the Big Cheese cooler ${n} times.`, elvis: `Make Elvis sing ${n} times (Candy).`, scan: `Scan ${n} items at a register.` }[d.type];
}

// the giver in reach of where the player is facing (counter clerks stand one tile behind their case)
function giverNear(f) { let best = null, bd = 26; for (const g of W.givers || []) { const d = Math.hypot(g.px - f.px, g.py - 6 - f.py); if (d < bd) { bd = d; best = g; } } return best; }
function talkGiver(g) {
  const q = questOf(g); sfx('talk'); if (!q) return showDialog(g.gv.name, pick(Math.random, GIVER_IDLE));
  if (q.state === 'offer') showDialog(g.gv.name, q.def.ask, null, `${questGoalText(q)} Reward ${fmtMoney(q.reward)}.`, [['Accept', () => acceptQuest(q)], ['Not now', () => { }]]);
  else if (q.state === 'active') showDialog(g.gv.name, q.def.nag, null, `${questGoalText(q)} ${q.got}/${q.n}.`);
  else if (q.state === 'ready') turnIn(q);
  else showDialog(g.gv.name, pick(Math.random, GIVER_IDLE));
}
function acceptQuest(q) {
  q.state = 'active'; sfx('pick'); hint('quest'); toast(`New job from ${q.g.gv.name}: ${questGoalText(q)}`, 'good');
  if (q.def.type === 'feed') ST.fedToday = false; // hungry again
  if (q.def.type === 'cool') ST.cheeseTemp = Math.max(ST.cheeseTemp, 41);
}
function turnIn(q) {
  q.state = 'done'; RT.seen.turnin = true; addMoney(q.reward, q.g.px, q.g.py - 30); RT.day.quest += q.reward; RT.day.questsDone = (RT.day.questsDone || 0) + 1; addRep(1);
  sparkle(q.g.px, q.g.py - 20); sfx('good'); showDialog(q.g.gv.name, q.def.done, null, `+${fmtMoney(q.reward)}`);
}
// progress from anything the player does. type + optional dept/info
function questEvent(type, dept) {
  for (const q of RT.quests || []) {
    if (q.state !== 'active' || q.def.type !== type) continue;
    if (type === 'stock' && q.def.dept !== dept) continue;
    q.got = Math.min(q.n, q.got + 1);
    if (q.got >= q.n) { q.state = 'ready'; toast(`${q.g.gv.name}'s job is done. Go see ${q.g.gv.name} for your reward.`, 'good'); sfx('good'); }
  }
}

// ---- handing out samples / asking questions ----
function custZone(c) { const [tx, ty] = custTile(c); const zi = inb(tx, ty) ? W.zone[idx(tx, ty)] : -1; return zi >= 0 ? DEPTS[zi].id : null; }
function canSample(c, q) {
  if (q.state !== 'active' || !['sample', 'talk'].includes(q.def.type) || (c.sampled && c.sampled[q.key])) return false;
  if (q.def.kids ? c.type !== 'kid' : c.type === 'kid') return false;
  if (['follow', 'exitOut', 'lost'].includes(c.state) || c.then === 'exit') return false;
  return q.def.zones.includes(custZone(c));
}
function sampleQuestFor(c) { return (RT.quests || []).find(q => canSample(c, q)) || null; }
function giveSample(c, q) {
  c.sampled = c.sampled || {}; c.sampled[q.key] = 1; moodHit(c, 6); bubble(c, pick(Math.random, SAMPLE_LINES[q.def.lines] || ['thanks!']), 3.5);
  floatText(c.x, c.y - 30, `${q.got + 1}/${q.n}`, '#ffe14d'); sfx('pick'); RT.parts.push({ x: c.x, y: c.y - 30, vx: 0, vy: -18, t: 0.9, note: true, c: '#ff8fc0' });
  const who = c.parent || c; if (who.hold === q) who.hold = null; // let them go shop
  if (q.def.buy && who.list && DEPT[q.def.buy] && deptOpen(DEPT[q.def.buy]) && !who.list.includes(q.def.buy) && Math.random() < 0.7) who.list.unshift(q.def.buy);
  questEvent(q.def.type);
}

// ---- keeping the right crowd in each quest zone ----
function zoneTiles(id) { // walkable floor in a department, cached per world build
  if (W.ztCache !== W.groundCanvas) { W.ztCache = W.groundCanvas; W.zt = {}; }
  if (!W.zt[id]) { const i = DEPTS.findIndex(d => d.id === id), out = []; if (i >= 0) for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) { const k = idx(x, y); if (W.zone[k] === i && !W.solid[k] && !W.objAt.get(k) && W.cost[k] < 10) out.push([x, y]); } W.zt[id] = out; }
  return W.zt[id];
}
function randomZoneTile(zones) { const open = zones.filter(z => DEPT[z] && deptOpen(DEPT[z]) && zoneTiles(z).length); if (!open.length) return null; return pick(Math.random, zoneTiles(pick(Math.random, open))); }
function goLoiter(c, zones) { const t = randomZoneTile(zones); if (!t) return false; c.state = 'walk'; c.then = 'loiter'; goTo(c, t[0] + 0.3 + Math.random() * 0.4, t[1] + 0.6 + Math.random() * 0.2); return true; }
const FREE_STATES = ['walk', 'browse', 'toStore', 'loiter', 'elvis', 'waitLane'];
function isFree(c) { return c.type !== 'kid' && !c.hold && FREE_STATES.includes(c.state) && c.then !== 'exit' && c.then !== 'sit' && !c.lane; }
// every second: each quest that needs people in a zone keeps enough of them there (up to 10 for an accepted job,
// a few for one on offer so the zone looks alive). they come from the crowd first, then from new arrivals.
function questCrowd(dt) {
  RT.crowdT = (RT.crowdT || 0) - dt; if (RT.crowdT > 0 || ST.phase !== 'day') return; RT.crowdT = 1;
  for (const q of RT.quests || []) {
    const t = q.def.type; if (q.state === 'done' || q.state === 'ready') continue;
    if (t === 'pour') { if (q.state === 'active') seatTasters(q); continue; }
    if (t === 'elvis' && q.state === 'active') { keepKids(q, ['candy'], 3); continue; }
    if (t !== 'sample' && t !== 'talk') continue;
    const want = q.state === 'active' ? Math.min(q.n - q.got, 10) : 3;
    if (q.def.kids) { keepKids(q, q.def.zones, want); continue; }
    let have = RT.custs.filter(c => c.type !== 'kid' && !(c.sampled && c.sampled[q.key]) && (c.hold === q || q.def.zones.includes(custZone(c)))).length;
    if (have >= want) continue;
    const z = DEPT[q.def.zones[0]], zx = (z.x + z.w / 2) * T, zy = (z.y + z.h / 2) * T;
    const cands = RT.custs.filter(c => isFree(c) && !(c.sampled && c.sampled[q.key])).sort((a, b) => Math.hypot(a.x - zx, a.y - zy) - Math.hypot(b.x - zx, b.y - zy));
    while (have < want && cands.length) { const c = cands.shift(); c.hold = q; c.holdZones = q.def.zones; goLoiter(c, q.def.zones); have++; }
    for (let i = 0; i < Math.min(want - have, 2) && RT.custs.length < MAX_CUSTS; i++) { const c = spawnCustomer(); if (c) { c.hold = q; c.holdZones = q.def.zones; } }
  }
}
function keepKids(q, zones, want) { // families: hold the parent, the kid tags along
  const kids = RT.custs.filter(c => c.type === 'kid' && c.parent && !(c.sampled && c.sampled[q.key]));
  let have = kids.filter(k => k.parent.hold === q || zones.includes(custZone(k))).length; if (have >= want) return;
  const z = DEPT[zones[0]], zx = (z.x + z.w / 2) * T, zy = (z.y + z.h / 2) * T;
  const cands = kids.map(k => k.parent).filter(p => isFree(p)).sort((a, b) => Math.hypot(a.x - zx, a.y - zy) - Math.hypot(b.x - zx, b.y - zy));
  while (have < want && cands.length) { const p = cands.shift(); p.hold = q; p.holdZones = zones; goLoiter(p, zones); have++; }
  for (let i = 0; i < Math.min(want - have, 2) && RT.custs.length < MAX_CUSTS; i++) { const p = spawnCustomer('adult', true); if (p) { p.hold = q; p.holdZones = zones; } }
}
function seatTasters(q) { // keep the tasting stools filled while the pour job is on
  const free = W.stools.filter(s => !s.cust); if (!free.length) return;
  const cands = RT.custs.filter(c => isFree(c)).sort((a, b) => Math.hypot(a.x - free[0].x * T, a.y - free[0].y * T) - Math.hypot(b.x - free[0].x * T, b.y - free[0].y * T));
  for (const s of free) { let c = cands.shift(); if (!c) { if (RT.custs.length >= MAX_CUSTS) return; c = spawnCustomer(); if (!c) return; } s.cust = c; c.stool = s; c.tasted = true; c.state = 'walk'; c.then = 'sit'; goTo(c, s.x + 0.5, s.y + 0.75); }
}
// quests that need something broken or spilled get it
function questTrouble(dt) {
  RT.troubleT = (RT.troubleT || 0) - dt; if (RT.troubleT > 0 || ST.phase !== 'day') return; RT.troubleT = 6;
  for (const q of RT.quests || []) {
    if (q.state !== 'active') continue; const left = q.n - q.got;
    if (q.def.type === 'mop' && RT.spills.length < Math.min(left, 3)) { const c = pick(Math.random, RT.custs.filter(c => c.type !== 'kid' && !custOutside(c))); if (c) makeSpill(c); }
    if (q.def.type === 'fix') { const ks = Object.keys(ANIMS).filter(k => W.anims[k] && ST.anims[k]); if (!ks.some(k => ST.anims[k].broken)) { const k = pick(Math.random, ks); if (k) { ST.anims[k].broken = true; ST.anims[k].fix = 0; toast(`${ANIMS[k].name[0].toUpperCase() + ANIMS[k].name.slice(1)} broke down. Bring the wrench.`, 'warn'); } } }
    if (q.def.type === 'help' && !RT.custs.some(c => c.state === 'lost')) { const c = pick(Math.random, RT.custs.filter(c => c.type !== 'kid' && c.state === 'browse' && c.list.length)); if (c) makeLost(c); }
  }
}
function custOutside(c) { const [tx, ty] = custTile(c); return !inb(tx, ty) || W.outdoor[idx(tx, ty)]; }

// ---- markers + the arrow to a finished job ----
function giverMarker(g) { const q = questOf(g); if (!q || ST.phase !== 'day') return null; return q.state === 'offer' ? '!' : q.state === 'active' ? 'grey?' : q.state === 'ready' ? '?' : null; }
function readyGiverTarget() { // nearest giver waiting to pay you
  let best = null, bd = 1e9; for (const q of RT.quests || []) { if (q.state !== 'ready') continue; const d = Math.hypot(q.g.px - PL.x, q.g.py - PL.y); if (d < bd) { bd = d; best = q.g; } } return best;
}

// ---- the day's goal, and closing up ----
function checkDayGoal() {
  if (RT.goalHit || ST.phase !== 'day' || earnedToday() < dayGoal()) return;
  RT.goalHit = true; MUSIC.sting('good'); sfx('good'); confetti(); openMenu('goal');
}
function confetti() { for (let i = 0; i < 90; i++) RT.parts.push({ x: R.cx + Math.random() * R.vw, y: R.cy - 10 - Math.random() * 60, vx: (Math.random() - 0.5) * 50, vy: 20 + Math.random() * 40, t: 2.5 + Math.random(), c: pick(Math.random, ['#ffe14d', '#ff8fc0', '#9ff0ff', '#7dff7a', '#ff8a2a']), conf: true }); }
function closeUp() { // sunset, the store empties, then the day's report
  if (ST.phase !== 'day') return;
  if (!RT.goalHit) { flash(`Make ${fmtMoney(goalLeft())} more before closing up`); sfx('err'); return; }
  ST.phase = 'night'; RT.nightT = 0; RT.seen.bed = true; closeMenu(); PL.escort = null; RT.custs.forEach(c => { if (c.list) c.list = []; c.hold = null; });
  W.stools.forEach(s => { if (s.cust) { s.cust.poured = true; s.cust.timer = 0; } });
  toast('Closing up. Nice work today.', 'good');
}
function updateNight(dt) {
  RT.nightT += dt; ST.minute = 17 * 60 + Math.min(1, RT.nightT / 2.5) * (5 * 60 + 15); // sun goes down
  if (RT.nightT > 3.5 && !RT.menu && !RT.dialog) endDay();
}

// ---- quest log ----
function questLogHTML() {
  const goal = dayGoal(), e = earnedToday(), pct = Math.min(100, Math.round(e / goal * 100));
  const row = (q, mark) => `<div class="qrow"><span class="qm ${mark}">${mark === 'ready' ? '?' : mark === 'grey' ? '?' : mark === 'offer' ? '!' : '✔'}</span><div><b>${typo(q.g.gv.name)}</b> <span class="dim">· ${deptName(q.g.gv.dept)}</span><br>${typo(questGoalText(q))}${q.state === 'active' ? ` <b class="money">${q.got}/${q.n}</b>` : ''}<br><span class="dim">${q.state === 'ready' ? 'Done. Go back for your reward:' : q.state === 'offer' ? `Talk to ${q.g.gv.name} to take it. Reward` : q.state === 'done' ? 'Paid' : 'Reward'} ${fmtMoney(q.reward)}</span></div></div>`;
  const group = (title, st, mark) => { const qs = (RT.quests || []).filter(q => q.state === st); return qs.length ? `<h3>${title}</h3>${qs.map(q => row(q, mark)).join('')}` : ''; };
  return `<h2>Quest log</h2>
  <h3>Today's goal · ${weekday()}, week ${weekNo()}</h3><div>Make ${fmtMoney(goal)} today. <b class="money">${fmtMoney(e)}</b> so far.</div><div class="qbar"><i style="width:${pct}%"></i></div>
  ${RT.goalHit ? '<p>Goal made. Close up any time with the button by the clock.</p>' : '<p class="dim">Everything you earn counts: sales, tips, tastings and job rewards.</p>'}
  ${group('Ready to turn in', 'ready', 'ready')}${group('In progress', 'active', 'grey')}${group('Jobs on offer', 'offer', 'offer')}${group('Done today', 'done', 'done')}
  <h3>Jungle goals</h3><div class="tasks">${GOALS.map(g => `<div class="${ST.goals[g.id] ? 'ok' : ''}">${ST.goals[g.id] ? '✔' : '•'} ${typo(g.text)} <span class="dim">${fmtMoney(g.reward)}</span></div>`).join('')}</div>
  <div class="row"><button id="m-close">Close</button></div>`;
}
