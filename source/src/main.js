// ===== main =====
function beginGame(cont) {
  auInit(); musicStart();
  if (!(cont && load())) { newState(); try { localStorage.removeItem(SAVE_KEY); } catch (e) { } }
  AU.musicOn = ST.settings.music; AU.sfxOn = ST.settings.sfx;
  buildWorld(ST.ups); buildNight(); startDay(); MUSIC.setDay(ST.day); RT.menu = null; document.body.classList.remove('inmenu'); $('#menu').style.display = 'none'; RT.paused = false; $('#hud').style.display = 'block';
  if (!cont || ST.day === 1) showDialog(CONFIG.cashierName, `morning boss. doors open at 8. people are gonna clean out the shelves, get lost, spill pickles and break the lion. keep 'em happy and we make money. you've got skates, a mop, a wrench and fish food. go get 'em.`, null, 'Tip: the stock room is behind the bakery. Your office couch in there ends the day.');
  else toast(`Welcome back. ${weekday()}, Day ${ST.day}.`);
}
const VK = { x: 0, y: 0 };
function bindInput() {
  addEventListener('keydown', e => {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) e.preventDefault();
    if (e.repeat && (e.code === 'Space' || e.code === 'KeyE')) { if (PL.onCash) return; return; }
    KEYS[e.code] = true;
    if (RT.menu === 'title') { if (e.code === 'Enter' || e.code === 'Space') { const b = document.querySelector('#menu .buy'); if (b) b.click(); } return; }
    if (RT.dialog) { if (e.code === 'Space' || e.code === 'KeyE' || e.code === 'Enter') advanceDialog(); if (RT.dialog && RT.dialog.choices && (e.code === 'ArrowLeft' || e.code === 'ArrowRight' || e.code === 'KeyA' || e.code === 'KeyD')) { const n = RT.dialog.choices.length; RT.dialog.sel = (RT.dialog.sel + (e.code.endsWith('Left') || e.code === 'KeyA' ? n - 1 : 1)) % n; [...$('#dl-choices').children].forEach((b, i) => b.classList.toggle('sel', i === RT.dialog.sel)); } return; }
    if (e.code === 'Escape') { if (RT.menu === 'report') return; if (RT.menu) closeMenu(); else openMenu('pause'); return; }
    if (e.code === 'KeyM') { if (RT.menu === 'map') closeMenu(); else if (!RT.menu) openMenu('map'); return; }
    if (e.code === 'KeyJ') { if (RT.menu === 'journal') closeMenu(); else if (!RT.menu) openMenu('journal'); return; }
    if (RT.menu) { if ((e.code === 'Enter' || e.code === 'Space') && RT.menu === 'report') { const b = document.getElementById('m-next'); if (b) b.click(); } return; }
    if (e.code === 'Space' || e.code === 'KeyE' || e.code === 'Enter') doAction();
    if (e.code >= 'Digit1' && e.code <= 'Digit4') PL.tool = +e.code.slice(5) - 1;
    if (e.code === 'KeyQ' || e.code === 'Tab') PL.tool = (PL.tool + 1) % TOOLS.length;
    if (e.code === 'KeyR') toggleSkates();
  });
  addEventListener('keyup', e => { KEYS[e.code] = false; });
  addEventListener('blur', () => { for (const k in KEYS) KEYS[k] = false; });
  addEventListener('resize', resize);
  // touch
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    $('#touch').style.display = 'block'; const pad = $('#t-pad'), knob = $('#t-knob'); let id = null, ox = 0, oy = 0;
    const setK = () => { KEYS.KeyA = VK.x < -0.35; KEYS.KeyD = VK.x > 0.35; KEYS.KeyW = VK.y < -0.35; KEYS.KeyS = VK.y > 0.35; };
    pad.addEventListener('pointerdown', e => { id = e.pointerId; const r = pad.getBoundingClientRect(); ox = r.left + r.width / 2; oy = r.top + r.height / 2; pad.setPointerCapture(id); });
    pad.addEventListener('pointermove', e => { if (e.pointerId !== id) return; const dx = e.clientX - ox, dy = e.clientY - oy, d = Math.min(50, Math.hypot(dx, dy)), a = Math.atan2(dy, dx); VK.x = Math.cos(a) * d / 50; VK.y = Math.sin(a) * d / 50; knob.style.transform = `translate(${VK.x * 40}px,${VK.y * 40}px)`; setK(); });
    const up = () => { id = null; VK.x = VK.y = 0; knob.style.transform = ''; setK(); }; pad.addEventListener('pointerup', up); pad.addEventListener('pointercancel', up);
    $('#t-a').addEventListener('pointerdown', e => { e.preventDefault(); if (RT.dialog) advanceDialog(); else if (!RT.menu) doAction(); });
    $('#t-tool').addEventListener('pointerdown', e => { e.preventDefault(); PL.tool = (PL.tool + 1) % TOOLS.length; });
    $('#t-skate').addEventListener('pointerdown', e => { e.preventDefault(); if (!RT.menu && !RT.dialog) { toggleSkates(); $('#t-skate').textContent = PL.walk ? 'SKATE' : 'WALK'; } });
    $('#t-menu').addEventListener('pointerdown', e => { e.preventDefault(); if (RT.menu && RT.menu !== 'report' && RT.menu !== 'title') closeMenu(); else if (!RT.menu) openMenu('pause'); });
  }
  $('#dialog').addEventListener('click', () => { if (RT.dialog && !RT.dialog.choices) advanceDialog(); });
}
let lastT = 0;
function frame(t) {
  const dt = Math.min(0.05, (t - lastT) / 1000 || 0.016); lastT = t;
  if (RT.menu === 'title') { PL.x = (36 + Math.sin(t / 9000) * 22) * T; PL.y = (26 + Math.sin(t / 6000) * 12) * T; R.t += 0; }
  else update(dt);
  if ((R.mt = (R.mt || 0) + dt) > 0.4) { R.mt = 0; musicTick(); }
  render(); requestAnimationFrame(frame);
}
function boot() {
  R.cv = $('#game'); R.g = R.cv.getContext('2d'); resize();
  newState(); buildWorld({}); buildNight(); RT.day = null; initUI(); bindInput();
  openMenu('title'); requestAnimationFrame(frame);
  const wake = () => { auInit(); musicStart(); removeEventListener('pointerdown', wake); removeEventListener('keydown', wake); }; addEventListener('pointerdown', wake); addEventListener('keydown', wake);
}
window.__game = { ST, RT, PL, W, DEPT, update, render, doAction, startDay, beginGame, buyUpgrade, findPath, targetInfo, openMenu, closeMenu, endDay, fill };
document.fonts && document.fonts.ready ? document.fonts.ready.then(boot) : boot();
