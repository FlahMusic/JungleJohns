// ===== DOM UI =====
const $ = (s) => document.querySelector(s);
const UI = { cache: {} };
function setText(id, v) { if (UI.cache[id] === v) return; UI.cache[id] = v; const el = document.getElementById(id); if (el) el.innerHTML = v; }
function iconURL(c) { return c.toDataURL(); }

function initUI() {
  const tb = $('#tools'); TOOLS.forEach((t, i) => { const d = document.createElement('div'); d.className = 'tool'; d.id = 'tool' + i; d.innerHTML = `<img src="${iconURL(toolIcon(t.id))}"><span class="k">${t.key}</span>`; d.title = t.hint; d.onclick = () => { PL.tool = i; }; tb.appendChild(d); });
}
function updateUI(dt) {
  if (!RT.day) return;
  const ev = eventToday();
  setText('h-day', `${weekday()}, Day ${ST.day}`);
  setText('h-time', fmtTime(ST.minute));
  setText('h-wx', (ST.weather === 'rain' ? 'Rain' : ST.weather === 'cloudy' ? 'Cloudy' : 'Sunny') + (isOpen() ? '' : ST.minute < OPEN_MIN ? ', opens 8 AM' : ', closed'));
  setText('h-ev', ev ? typo(ev.name) : '');
  setText('h-money', fmtMoney(ST.money));
  const st = stars(); setText('h-stars', '★'.repeat(st) + '<span class="dim">' + '★'.repeat(5 - st) + '</span>');
  const e = $('#h-energy i'); if (e) { e.style.width = Math.round(ST.energy) + '%'; e.style.background = ST.energy < 25 ? '#ff5a4a' : '#7dd35a'; }
  TOOLS.forEach((t, i) => { const el = document.getElementById('tool' + i); if (el) el.classList.toggle('on', PL.tool === i); });
  setText('h-tool', TOOLS[PL.tool].name + (PL.walk ? '<br><small>walking (R for skates)</small>' : '') + (PL.carry.length ? `<br><small>carrying ${PL.carry.map(k => CRATES[k].name).join(', ')}</small>` : ''));
  // prompt
  let p = ''; if (flashMsg) p = flashMsg.text; else if (RT.target && RT.target.label) p = typo(RT.target.label); const hint = currentHint();
  setText('prompt', p ? `<b>${p}</b>` : ''); $('#prompt').style.display = p ? 'block' : 'none';
  setText('hint', hint ? typo(hint) : ''); $('#hint').style.display = hint && !RT.menu ? 'block' : 'none';
  // problems
  const pr = [];
  const empty = DEPTS.filter(d => d.max && deptOpen(d) && fill(d.id) < 0.15).map(d => d.name.replace('International: ', ''));
  if (empty.length) pr.push(`<span class="bad">Empty:</span> ${empty.slice(0, 4).join(', ')}${empty.length > 4 ? ` +${empty.length - 4}` : ''}`);
  const low = DEPTS.filter(d => d.max && deptOpen(d) && fill(d.id) >= 0.15 && fill(d.id) < 0.35).map(d => d.name.replace('International: ', ''));
  if (low.length) pr.push(`<span class="warn">Low:</span> ${low.slice(0, 3).join(', ')}${low.length > 3 ? ` +${low.length - 3}` : ''}`);
  if (RT.spills.length) pr.push(`<span class="warn">Spills:</span> ${RT.spills.length}`);
  const br = Object.keys(ANIMS).filter(k => W.anims[k] && ST.anims[k] && ST.anims[k].broken).map(k => ANIMS[k].name); if (br.length) pr.push(`<span class="warn">Broken:</span> ${br.join(', ')}`);
  if (ST.cheeseTemp > 42) pr.push(`<span class="${ST.cheeseTemp > 45 ? 'bad' : 'warn'}">Big Cheese:</span> ${Math.round(ST.cheeseTemp)}°F`);
  if (!ST.fedToday && ST.minute < 12 * 60) pr.push(`<span class="warn">Fish:</span> feed before noon`);
  const lost = RT.custs.filter(c => c.state === 'lost').length; if (lost) pr.push(`<span class="q">Lost:</span> ${lost} customer${lost > 1 ? 's' : ''}`);
  const longQ = W.lanes.reduce((a, l) => Math.max(a, l.queue.length), 0); if (longQ >= 4) pr.push(`<span class="warn">Line:</span> ${longQ} deep`);
  const wait = RT.custs.filter(c => c.state === 'sit' && !c.poured).length; if (wait) pr.push(`<span class="q">Tasting bar:</span> ${wait} waiting`);
  setText('problems', pr.map(x => `<div>${x}</div>`).join('')); $('#problems').style.display = pr.length ? 'block' : 'none';
  // toasts
  setText('toasts', RT.toasts.map(t => `<div class="toast ${t.kind}">${t.text}</div>`).join(''));
  // dialog typewriter
  if (RT.dialog) { const d = RT.dialog; if (d.shown < d.text.length) { const before = Math.floor(d.shown); d.shown = Math.min(d.text.length, d.shown + dt * 70); if (Math.floor(d.shown) > before && Math.floor(d.shown) % 3 === 0) sfx('talk'); } setText('dl-text', d.text.slice(0, Math.floor(d.shown)) + (d.shown >= d.text.length && d.sub ? `<div class="dsub">${d.sub}</div>` : '')); $('#dl-more').style.visibility = d.shown >= d.text.length && !d.choices ? 'visible' : 'hidden'; $('#dl-choices').style.display = d.shown >= d.text.length && d.choices ? 'flex' : 'none'; }
}

// ---------- dialog ----------
function showDialog(name, text, cb, sub, choices) {
  RT.dialog = { name, text: say(text), shown: 0, cb, sub: sub ? typo(sub) : sub, choices, sel: 0 };
  $('#dialog').style.display = 'block'; setText('dl-name', name); UI.cache['dl-text'] = null;
  const ch = $('#dl-choices'); ch.innerHTML = ''; if (choices) choices.forEach(([lbl, fn], i) => { const b = document.createElement('button'); b.textContent = lbl; b.onclick = () => { closeDialog(); fn(); }; ch.appendChild(b); });
}
function advanceDialog() {
  const d = RT.dialog; if (!d) return; if (d.shown < d.text.length) { d.shown = d.text.length; return; }
  if (d.choices) { const b = $('#dl-choices').children[d.sel]; if (b) b.click(); return; }
  closeDialog(); if (d.cb) d.cb();
}
function closeDialog() { RT.dialog = null; $('#dialog').style.display = 'none'; }

// ---------- menus ----------
function openMenu(kind) {
  RT.menu = kind; document.body.classList.add('inmenu'); const m = $('#menu'); m.style.display = 'flex'; m.className = 'menu ' + kind; const box = $('#menu-box');
  if (kind === 'catalog') { RT.seen.cat = true; box.innerHTML = catalogHTML(); }
  if (kind === 'report') box.innerHTML = reportHTML();
  if (kind === 'journal') box.innerHTML = journalHTML();
  if (kind === 'pause') box.innerHTML = pauseHTML();
  if (kind === 'map') { box.innerHTML = `<h2>Store map</h2><canvas id="mapc"></canvas><p class="small">Yellow ? = lost customer. Red = spill. Orange = broken display. Red sign = empty aisle. <b>M</b> or <b>Esc</b> to close.</p>`; drawMap(); }
  if (kind === 'title') box.innerHTML = titleHTML();
  bindMenu();
}
function closeMenu() { if (RT.menu === 'report' || RT.menu === 'title') return; RT.menu = null; document.body.classList.remove('inmenu'); $('#menu').style.display = 'none'; }
function bindMenu() {
  document.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => { if (buyUpgrade(b.dataset.buy)) { toast(`Bought: ${UPG[b.dataset.buy].name}`, 'good'); } else sfx('err'); $('#menu-box').innerHTML = catalogHTML(); bindMenu(); });
  document.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { UI.tab = b.dataset.tab; $('#menu-box').innerHTML = catalogHTML(); bindMenu(); });
  const on = (id, fn) => { const el = document.getElementById(id); if (el) el.onclick = fn; };
  on('m-close', () => { if (RT.menu === 'catalog' && UI.fromReport) { UI.fromReport = false; openMenu('report'); return; } closeMenu(); });
  on('m-next', () => { MUSIC.setDay(ST.day + 0); RT.menu = null; document.body.classList.remove('inmenu'); $('#menu').style.display = 'none'; startDay(); save(); toast(`${weekday()}, Day ${ST.day}. Store opens at 8 AM.`); const ev = eventToday(); if (ev) toast(`Today: ${ev.name}! Expect a crowd.`, 'good'); });
  on('m-cat', () => { UI.fromReport = true; openMenu('catalog'); });
  on('m-resume', () => closeMenu()); on('m-journal', () => openMenu('journal')); on('m-map', () => openMenu('map'));
  on('m-quit', () => { save(); location.reload(); });
  on('s-clean', () => { ST.settings.clean = !ST.settings.clean; openMenu('pause'); });
  on('s-speed', () => { ST.settings.speed = (ST.settings.speed + 1) % 3; openMenu('pause'); });
  on('s-music', () => { ST.settings.music = !ST.settings.music; AU.musicOn = ST.settings.music; openMenu('pause'); });
  on('s-sfx', () => { ST.settings.sfx = !ST.settings.sfx; AU.sfxOn = ST.settings.sfx; openMenu('pause'); });
  on('t-new', () => { if (hasSave() && !UI.confirmNew) { UI.confirmNew = true; $('#t-new').textContent = 'Erase save and start over?'; return; } beginGame(false); });
  on('t-cont', () => beginGame(true));
}
function catalogHTML() {
  const tab = UI.tab || 'area'; const cats = [['area', 'New areas'], ['staff', 'Staff'], ['gear', 'Gear'], ['promo', 'Promo & fixes']];
  const items = UPGRADES.filter(u => u.cat === tab).map(u => {
    const own = ST.ups[u.id]; const needStars = stars() < u.stars; const needReq = u.req && !ST.ups[u.req]; const broke = ST.money < u.cost;
    let btn = own ? '<button disabled>Owned</button>' : needReq ? `<button disabled>Needs ${UPG[u.req].name}</button>` : needStars ? `<button disabled>Needs ${'★'.repeat(u.stars)}</button>` : broke ? `<button disabled>${fmtMoney(u.cost)}</button>` : `<button data-buy="${u.id}" class="buy">Buy ${fmtMoney(u.cost)}</button>`;
    return `<div class="card ${own ? 'own' : ''}"><div class="cn">${typo(u.name)}</div><div class="cd">${typo(u.desc)}${u.wage ? ` Wage ${fmtMoney(u.wage)}/day.` : ''}</div>${btn}</div>`;
  }).join('');
  return `<h2>Catalog</h2><div class="sub">You have <b class="money">${fmtMoney(ST.money)}</b> and ${'★'.repeat(stars())} rep</div>
  <div class="tabs">${cats.map(([k, n]) => `<button data-tab="${k}" class="${k === tab ? 'on' : ''}">${n}</button>`).join('')}</div><div class="cards">${items}</div>
  <div class="row"><button id="m-close">Done</button></div>`;
}
function reportHTML() {
  const r = RT.report; const net = r.sales + r.tips + r.extra + r.bonus - r.wholesale - r.wages; const avg = r.moods.length ? r.moods.reduce((a, b) => a + b, 0) / r.moods.length : 0;
  const empt = Object.entries(r.emptyHits).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => `${DEPT[k].name.replace('International: ', '')} (${v})`).join(', ');
  const ev = eventToday(); const moodWord = avg > 72 ? 'happy' : avg > 58 ? 'fine' : avg > 45 ? 'grumpy' : 'furious';
  return `<h2>${r.wd}, Day ${r.day} is done</h2>
  <table class="rep">
  <tr><td>Register sales</td><td>${fmtMoney(r.sales)}</td></tr>
  <tr><td>Tips</td><td>${fmtMoney(r.tips)}</td></tr>
  <tr><td>Tastings, rides & other</td><td>${fmtMoney(r.extra)}</td></tr>
  <tr><td>Task bonus</td><td>${fmtMoney(r.bonus)}</td></tr>
  <tr><td>Crates bought</td><td class="neg">-${fmtMoney(r.wholesale)}</td></tr>
  <tr><td>Wages</td><td class="neg">-${fmtMoney(r.wages)}</td></tr>
  <tr class="tot"><td>Net today</td><td class="${net < 0 ? 'neg' : 'pos'}">${net < 0 ? '-' : ''}${fmtMoney(Math.abs(net))}</td></tr>
  </table>
  <p>${r.served} customers paid. Mood: <b>${moodWord}</b>. ${r.helped} lost people helped.${empt ? ` Empty shelves hit: ${empt}.` : ''}</p>
  <div class="tasks">${r.tasks.map(t => `<div class="${t.done ? 'ok' : 'no'}">${t.done ? '✔' : '✘'} ${typo(t.text)}</div>`).join('')}</div>
  <p>Rep ${r.repDelta >= 0 ? 'up' : 'down'} ${Math.abs(r.repDelta).toFixed(1)}. You're at <span class="stars">${'★'.repeat(stars())}</span>. Cash: <b class="money">${fmtMoney(ST.money)}</b></p>
  <p class="small">Tomorrow: ${weekday()}, Day ${ST.day}${ev ? `. <b>${ev.name}</b>` : ''}. Saved.</p>
  <div class="row"><button id="m-cat">Catalog</button><button id="m-next" class="buy">Start Day ${ST.day}</button></div>`;
}
function journalHTML() {
  return `<h2>Journal</h2><h3>Today</h3><div class="tasks">${ST.tasks.map(t => { let s = t.done ? '✔' : t.fail ? '✘' : '•'; let x = ''; if (t.id === 'help') x = ` (${RT.day.helped}/${t.need})`; if (t.id === 'sales') x = ` (${fmtMoney(RT.day.sales)})`; return `<div class="${t.done ? 'ok' : t.fail ? 'no' : ''}">${s} ${typo(t.text)}${x}</div>`; }).join('')}</div>
  <h3>Jungle goals</h3><div class="tasks">${GOALS.map(g => `<div class="${ST.goals[g.id] ? 'ok' : ''}">${ST.goals[g.id] ? '✔' : '•'} ${typo(g.text)} <span class="dim">${fmtMoney(g.reward)}</span></div>`).join('')}</div>
  <p class="small">${ST.totals.served} customers served. ${ST.totals.helped} helped. Best day ${fmtMoney(ST.totals.best)}.</p>
  <div class="row"><button id="m-close">Close</button></div>`;
}
function pauseHTML() {
  const sp = ['Slow', 'Normal', 'Fast'][ST.settings.speed];
  return `<h2>Paused</h2><div class="col">
  <button id="m-resume" class="buy">Resume</button><button id="m-journal">Journal (J)</button><button id="m-map">Map (M)</button>
  <button id="s-speed">Day speed: ${sp}</button><button id="s-clean">Swearing: ${ST.settings.clean ? 'off (clean mode)' : 'on'}</button>
  <button id="s-music">Music: ${ST.settings.music ? 'on' : 'off'}</button><button id="s-sfx">Sound: ${ST.settings.sfx ? 'on' : 'off'}</button>
  <button id="m-quit">Save and quit</button></div>
  <p class="small">Move: WASD / arrows. Brake: Shift. Use / talk: Space or E. Tools: 1-4 or Q. Map: M. Journal: J.</p>`;
}
function wizHatSprite() { // original pixel wizard hat for the title
  return spr('wizhat', 40, 46, g => {
    g.translate(2, 2);
    for (let y = 0; y <= 31; y++) { const w = Math.round(2 + y * 0.8), cx = 18 + (y < 10 ? (10 - y) * 0.7 : 0) - (31 - y) * 0.05, x0 = Math.round(cx - w / 2);
      P(g, x0, y, w, 1, '#2a4ab8'); P(g, x0, y, Math.max(1, Math.round(w * 0.3)), 1, '#3e66e0'); P(g, x0 + w - Math.max(1, Math.round(w * 0.22)), y, Math.max(1, Math.round(w * 0.22)), 1, '#1c2f86'); }
    const star = (x, y, c) => [[2, 0], [1, 1], [2, 1], [3, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [1, 3], [3, 3], [0, 4], [4, 4]].forEach(([a, b]) => P(g, x + a, y + b, 1, 1, c));
    [[14, 12], [20, 18], [10, 23], [22, 26], [16, 6]].forEach(([x, y]) => star(x, y, '#ffd84a'));
    P(g, 12, 16, 1, 1, '#ffd84a'); P(g, 25, 21, 1, 1, '#ffd84a'); P(g, 8, 28, 1, 1, '#ffd84a'); P(g, 19, 10, 1, 1, '#fff6c0');
    P(g, 3, 31, 31, 4, '#f2c230'); P(g, 3, 31, 31, 1, '#fff0a0'); P(g, 3, 34, 31, 1, '#b8900a');
    for (let x = 4; x < 34; x += 2) { P(g, x, 35, 1, 4, '#f2c230'); P(g, x, 38, 1, 1, '#b8900a'); }
    star(23, -2, '#ffd84a');
  }, true);
}
function titleHTML() {
  const g = wizHatSprite(); const gi = `<img class="tgir" src="${g.toDataURL()}">`;
  return `${gi}<h1>${typo(CONFIG.storeName)}</h1><div class="tsub">International Market</div>
  <p class="tblurb">You run the wildest grocery store in Ohio. On roller skates. Keep the shelves full, the fish fed, the Big Cheese cold and the lion singing.</p>
  <div class="col tbtn">${hasSave() ? '<button id="t-cont" class="buy">Continue</button>' : ''}<button id="t-new" class="${hasSave() ? '' : 'buy'}">New game</button></div>
  <p class="small">WASD / arrows to skate. R takes skates off to walk. Space to do stuff. 1-4 swap tools. M for the map. Esc pauses.</p>`;
}
function drawMap() {
  const c = $('#mapc'); const maxW = Math.min(innerWidth - 80, 1100), maxH = innerHeight - 200; const sc = Math.min(maxW / (MW * T), maxH / (MH * T)); c.width = MW * T * sc; c.height = MH * T * sc;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = true; g.drawImage(W.groundCanvas, 0, 0, c.width, c.height);
  g.fillStyle = 'rgba(30,30,40,0.55)'; W.objs.forEach(o => { if (['tree', 'lamp', 'giraffe', 'rhino', 'billboard'].includes(o.type)) return; g.fillRect(o.x * T * sc, o.y * T * sc, o.w * T * sc, o.h * T * sc); });
  g.textAlign = 'center'; g.textBaseline = 'middle';
  DEPTS.forEach(d => { const open = deptOpen(d); const low = d.max && open && fill(d.id) < 0.15; const x = (d.x + d.w / 2) * T * sc, y = (d.y + d.h / 2) * T * sc; g.font = `${Math.max(10, 13 * sc * 1.6)}px VT323, monospace`; const nm = d.name.replace('International: ', ''); const w = g.measureText(nm).width + 8; g.fillStyle = !open ? 'rgba(120,90,50,0.9)' : low ? 'rgba(168,42,32,0.95)' : 'rgba(31,106,48,0.92)'; g.fillRect(x - w / 2, y - 9, w, 18); g.fillStyle = '#ffe14d'; g.fillText(nm, x, y + 1);
    if (d.max && open) { g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(x - 16, y + 10, 32, 4); g.fillStyle = fill(d.id) < 0.35 ? '#ff5a4a' : '#7dd35a'; g.fillRect(x - 16, y + 10, 32 * fill(d.id), 4); } });
  g.font = `${Math.max(10, 13 * sc * 1.6)}px VT323, monospace`; g.fillStyle = '#fff'; g.fillText('Stock Room', 33.5 * T * sc, 16 * T * sc);
  RT.spills.forEach(s => { g.fillStyle = '#ff3a2a'; g.beginPath(); g.arc((s.x + 0.5) * T * sc, (s.y + 0.5) * T * sc, 5, 0, 6.3); g.fill(); });
  Object.keys(ANIMS).forEach(k => { if (!ST.anims[k] || !ST.anims[k].broken) return; const o = W.objs.find(o => o.anim === k); if (!o) return; g.fillStyle = '#ff9a1a'; g.fillRect((o.x + o.w / 2) * T * sc - 6, o.y * T * sc - 6, 12, 12); });
  RT.custs.forEach(cu => { if (cu.state !== 'lost') return; g.fillStyle = '#ffe14d'; g.font = 'bold 18px sans-serif'; g.fillText('?', cu.x * sc, (cu.y - 8) * sc); });
  g.fillStyle = '#fff'; g.strokeStyle = '#000'; g.lineWidth = 2; g.beginPath(); g.arc(PL.x * sc, (PL.y - 4) * sc, 6, 0, 6.3); g.fill(); g.stroke(); g.fillStyle = '#d8342a'; g.beginPath(); g.arc(PL.x * sc, (PL.y - 4) * sc, 3, 0, 6.3); g.fill();
}
