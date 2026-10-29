// ===== renderer =====
const R = { cv: null, g: null, SC: 3, vw: 0, vh: 0, cx: 0, cy: 0, dpr: 1, t: 0, night: null };
Object.assign(PROPS, {
  giraffe: [34, 50, (g) => {
    g.translate(1, 1);
    P(g, 15, 34, 2, 14, '#5a5f68');
    disc(g, 16, 17, 15, '#2a1d22'); disc(g, 16, 17, 14, '#f29a3a'); disc(g, 16, 17, 12, '#f6b25a');
    P(g, 13, 14, 6, 15, '#f2c838'); for (const [x, y] of [[14, 18], [16, 22], [14, 25], [17, 16]]) P(g, x, y, 2, 2, '#a8641a');
    oval(g, 18, 10, 6, 4, '#f2c838'); oval(g, 23, 12, 3, 2.4, '#e8b080'); P(g, 24, 11, 1, 1, '#2a1d22'); P(g, 17, 8, 2, 2, '#2a1d22'); P(g, 17, 8, 1, 1, '#fff');
    P(g, 14, 3, 1, 4, '#a8641a'); P(g, 17, 2, 1, 5, '#a8641a'); disc(g, 14.5, 3, 1.2, '#7a4a12'); disc(g, 17.5, 2, 1.2, '#7a4a12'); oval(g, 12, 8, 2.5, 1.3, '#e8b030');
    P(g, 19, 11, 2, 2, '#a8641a'); P(g, 15, 10, 1, 1, '#a8641a');
  }, true],
  rhino: [34, 36, (g) => {
    g.translate(1, 1);
    disc(g, 16, 14, 13, '#2a1d22'); disc(g, 16, 14, 12, '#2e9a3e'); disc(g, 16, 14, 10, '#5ac05a');
    oval(g, 15, 16, 9, 5, '#9aa3ad'); oval(g, 21, 17, 5, 4, '#b8c0ca'); P(g, 24, 9, 2, 6, '#e8e0d0'); P(g, 25, 7, 1, 3, '#e8e0d0'); P(g, 20, 11, 1, 3, '#e8e0d0');
    P(g, 12, 13, 2, 2, '#2a1d22'); oval(g, 9, 11, 2, 2.5, '#9aa3ad'); P(g, 9, 11, 1, 2, '#d8a0a0'); P(g, 22, 19, 3, 1, '#6a737e');
    P(g, 15, 27, 2, 8, '#5a5f68');
  }, true],
  billboard: [50, 44, (g) => {
    g.translate(1, 1); P(g, 8, 26, 3, 16, '#6a5a4a'); P(g, 38, 26, 3, 16, '#6a5a4a'); P(g, 0, 2, 48, 26, '#f2c81c'); P(g, 2, 4, 44, 22, '#2e7d3b'); P(g, 2, 4, 44, 2, '#3a9a4a');
    disc(g, 39, 15, 6, '#f6b25a'); P(g, 37, 10, 3, 10, '#f2c838'); P(g, 36, 9, 5, 3, '#f2c838');
  }, true],
  corral: [42, 20, (g) => {
    for (let i = 0; i < 3; i++) { const x = i * 10; P(g, x + 4, 3, 13, 8, '#c8ccd2'); for (let k = 5; k < 17; k += 2) P(g, x + k, 4, 1, 6, '#8a929e'); P(g, x + 15, 1, 3, 2, '#d8342a'); disc(g, x + 6, 13, 1.3, '#2a2a2a'); disc(g, x + 14, 13, 1.3, '#2a2a2a'); }
    P(g, 0, 16, 42, 2, '#9aa3ad'); P(g, 0, 2, 2, 16, '#9aa3ad'); P(g, 40, 2, 2, 16, '#9aa3ad');
  }, true],
  pond: [82, 52, (g, f) => {
    g.translate(1, 1);
    oval(g, 40, 26, 39, 21, '#7a7f88'); oval(g, 40, 26, 36, 18, '#2f86b8'); oval(g, 40, 22, 30, 12, '#4aa0d0');
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; P(g, 40 + Math.cos(a + f) * 24, 26 + Math.sin(a + f) * 11, 3, 1, '#9ad8f0'); }
    for (const [x, y] of [[4, 24], [8, 36], [72, 18], [76, 30], [20, 44], [60, 44]]) { oval(g, x, y, 4, 3, '#8a8f98'); P(g, x - 2, y - 2, 3, 1, '#aab0b8'); }
    for (const [x, y] of [[24, 30], [52, 20], [58, 32]]) { oval(g, x, y, 3.5, 2, '#3aa83a'); P(g, x, y - 1, 1, 1, '#2a7a2a'); }
    disc(g, 59, 31, 1.2, '#ff8fb1');
    // hippo animatronic
    const hy = f ? 0 : 1; oval(g, 34, 22 + hy, 9, 5, '#8a7a9a'); oval(g, 41, 21 + hy, 6, 4.5, '#9a8aaa'); P(g, 30, 16 + hy, 2, 2, '#8a7a9a'); P(g, 37, 16 + hy, 2, 2, '#8a7a9a');
    P(g, 31, 19 + hy, 2, 2, '#fff'); P(g, 36, 19 + hy, 2, 2, '#fff'); P(g, 32, 20 + hy, 1, 1, '#1a1a1a'); P(g, 37, 20 + hy, 1, 1, '#1a1a1a'); P(g, 42, 20 + hy, 1, 1, '#4a3a5a'); P(g, 45, 20 + hy, 1, 1, '#4a3a5a');
    // reeds + palm
    for (const x of [6, 10, 70, 74]) { P(g, x, 6, 1, 14, '#3a8a3a'); oval(g, x, 6, 1, 3, '#7a4a22'); }
    P(g, 64, 0, 2, 20, '#7a5a3a'); for (let a = 0; a < 5; a++) { const ang = -2.6 + a * 0.55; for (let k = 0; k < 10; k++) P(g, 65 + Math.cos(ang) * k, 1 + Math.sin(ang) * k * 0.6 + k * 0.15, 2, 1, '#3aa848'); }
  }, true],
});


Object.assign(PROPS, {
  corn: [36, 28, (g, f) => {
    g.translate(1, 2); const b = f ? -1 : 0;
    oval(g, 9, 10 + b, 4.5, 8.5, '#f2c81c'); for (let y = 3; y < 18; y += 2) for (let x = 6; x < 13; x += 2) P(g, x + (y % 4 ? 1 : 0), y + b, 1, 1, '#d8a810');
    P(g, 3, 12 + b, 3, 9, '#5ab83a'); P(g, 12, 12 + b, 3, 9, '#5ab83a'); P(g, 7, 7 + b, 1, 2, '#1a1a1a'); P(g, 10, 7 + b, 1, 2, '#1a1a1a'); P(g, 7, 11 + b, 4, 1, '#8a3a1a'); P(g, 8, 12 + b, 2, 1, '#e86a6a');
    P(g, 7, 20, 1, 3, '#2a2a2a'); P(g, 10, 20, 1, 3, '#2a2a2a');
    const c = f ? 0 : -1; P(g, 20, 9 + c, 11, 9, '#f8e070'); P(g, 20, 9 + c, 11, 2, '#fff6b0'); P(g, 20, 9 + c, 3, 9, '#f0d050'); P(g, 23, 12 + c, 1, 2, '#1a1a1a'); P(g, 27, 12 + c, 1, 2, '#1a1a1a'); P(g, 24, 15 + c, 3, 1, '#8a3a1a');
    P(g, 19, 6 + c, 13, 3, '#e8e8f0'); P(g, 19, 6 + c, 13, 1, '#ffffff'); P(g, 22, 18, 1, 4, '#2a2a2a'); P(g, 28, 18, 1, 4, '#2a2a2a'); P(g, 17, 12 + c, 3, 1, '#f8e070'); P(g, 31, 11 + c, 3, 1, '#f8e070');
  }, true],
  robin: [36, 36, (g, f) => {
    g.translate(1, 1);
    P(g, 3, 4, 5, 30, '#6a4424'); P(g, 4, 4, 1, 30, '#8a5a30'); for (const [x, y, r, c] of [[6, 6, 7, '#2e7a32'], [3, 12, 5, '#3a9a3e'], [10, 3, 5, '#4ab04a']]) disc(g, x, y, r, c);
    P(g, 17, 22, 3, 10, '#3a5a22'); P(g, 22, 22, 3, 10, '#3a5a22'); P(g, 16, 31, 4, 2, '#5a3a1a'); P(g, 22, 31, 4, 2, '#5a3a1a');
    P(g, 15, 12, 12, 11, '#3a8a32'); P(g, 15, 19, 12, 2, '#6a4424'); P(g, 15, 12, 12, 1, '#5ab048');
    disc(g, 21, 8, 4, '#f2c49a'); P(g, 19, 7, 1, 1, '#1a1a1a'); P(g, 22, 7, 1, 1, '#1a1a1a'); P(g, 19, 10, 4, 1, '#8a4a2a');
    P(g, 16, 3, 10, 3, '#3a8a32'); P(g, 24, 1, 5, 2, '#3a8a32'); P(g, 27, 0, 1, 4, '#e23a2e'); P(g, 28, -1, 1, 3, '#e23a2e');
    const a = f ? 2 : 0; P(g, 27, 12 - a, 6, 2, '#3a8a32'); P(g, 31, 6 - a, 1, 14, '#8a5a30'); P(g, 32, 5 - a, 1, 1, '#8a5a30'); P(g, 32, 20 - a, 1, 1, '#8a5a30'); P(g, 30, 7 - a, 1, 12, '#e8e8e0');
    P(g, 11, 13, 4, 2, '#3a8a32'); P(g, 9, 13, 2, 2, '#f2c49a');
  }, true],
  penguin: [16, 22, (g) => { oval(g, 8, 12, 5, 8, '#1e1e28'); oval(g, 8, 13, 3.4, 6, '#f6f6f2'); disc(g, 8, 5, 3.5, '#1e1e28'); P(g, 6, 4, 1, 1, '#fff'); P(g, 9, 4, 1, 1, '#fff'); P(g, 7, 6, 2, 1, '#f2a020'); P(g, 5, 19, 2, 1, '#f2a020'); P(g, 9, 19, 2, 1, '#f2a020'); }, true],
  hive: [16, 24, (g, f) => { P(g, 7, 0, 2, 5, '#6a5a3a'); oval(g, 8, 13, 6, 9, '#c8a060'); for (let y = 6; y < 22; y += 3) P(g, 3, y, 10, 1, '#a8804a'); disc(g, 8, 18, 1.5, '#3a2a1a'); P(g, 12, 6, 2, 1, '#1a1a1a'); P(g, 12, 6, 1, 1, '#f2c230'); P(g, 2, 12, 2, 1, '#1a1a1a'); P(g, 3, 12, 1, 1, '#f2c230'); }, true],
  elephant: [34, 28, (g) => { g.translate(1, 1); oval(g, 16, 13, 12, 8, '#9aa3ad'); disc(g, 6, 8, 6, '#a8b0ba'); oval(g, 9, 8, 3, 5, '#8a929e'); P(g, 1, 10, 3, 10, '#a8b0ba'); P(g, 0, 19, 3, 2, '#a8b0ba'); P(g, 4, 9, 1, 1, '#1a1a1a'); P(g, 3, 13, 2, 3, '#fff6e0'); for (const x of [7, 12, 20, 25]) P(g, x, 19, 4, 6, '#8a929e'); P(g, 28, 10, 2, 6, '#8a929e'); }, true],
  deck: [48, 52, (g) => { P(g, 0, 20, 48, 30, '#7a5a3a'); P(g, 0, 20, 48, 3, '#a8804a'); for (let i = 0; i < 6; i++) P(g, 4 + i * 6, 26 + i * 4, 10, 2, '#c89a5a'); P(g, 0, 4, 2, 18, '#5a3a1a'); P(g, 46, 4, 2, 18, '#5a3a1a'); P(g, 0, 4, 48, 2, '#5a3a1a'); for (let x = 4; x < 46; x += 4) P(g, x, 6, 1, 14, '#6a4a2a'); P(g, 2, 0, 44, 4, '#2e7d3b'); P(g, 2, 0, 44, 1, '#4aa858'); }, true],
  restroom: [16, 26, (g) => {
    P(g, 1, 2, 14, 24, '#2e6ad8'); P(g, 0, 0, 16, 3, '#1e4aa8'); P(g, 1, 0, 14, 1, '#4a8ae8'); P(g, 3, 5, 10, 18, '#3a7ae8'); P(g, 3, 5, 1, 18, '#5a9af0');
    P(g, 5, 7, 6, 2, '#f4f4f0'); P(g, 6, 7, 2, 2, '#e23a2e'); P(g, 11, 14, 2, 3, '#c8c8d0'); P(g, 1, 3, 14, 1, '#1a3a8a'); for (let x = 4; x < 12; x += 2) P(g, x, 1, 1, 1, '#0e2a6a');
  }, true],
});

function resize() {
  R.dpr = Math.min(2, window.devicePixelRatio || 1);
  R.cv.width = Math.floor(innerWidth * R.dpr); R.cv.height = Math.floor(innerHeight * R.dpr);
  R.SC = Math.max(2, Math.min(7, Math.floor(Math.min(R.cv.width / (16 * (R.cv.width < R.cv.height ? 12 : 24)), R.cv.height / (16 * 14)))));
  R.vw = R.cv.width / R.SC; R.vh = R.cv.height / R.SC;
}
function buildNight() {
  const c = cv(MW * T, MH * T), g = c.getContext('2d'); g.fillStyle = '#0a1030';
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) if (W.outdoor[idx(x, y)]) g.fillRect(x * T, y * T, T, T);
  R.night = c;
}
const FRAMEMAP = [0, 1, 0, 2];
function drawSpr(s, x, y, flip) {
  if (!s) return; const g = R.g, SC = R.SC; const dx = Math.round((x - R.cx) * SC), dy = Math.round((y - R.cy) * SC);
  if (flip) { g.save(); g.translate(dx + s.width * SC, dy); g.scale(-1, 1); g.drawImage(s, 0, 0, s.width * SC, s.height * SC); g.restore(); }
  else g.drawImage(s, dx, dy, s.width * SC, s.height * SC);
}
function sx(x) { return (x - R.cx) * R.SC; } function sy(y) { return (y - R.cy) * R.SC; }
function shadow(x, y, w = 6) { const g = R.g; g.globalAlpha = 0.22; g.fillStyle = '#000'; g.beginPath(); g.ellipse(sx(x), sy(y), w * R.SC, 2 * R.SC, 0, 0, 6.283); g.fill(); g.globalAlpha = 1; }
function drawPerson(e, look, carryList) {
  const dk = e.dir === 'left' || e.dir === 'right' ? 'side' : e.dir; const fr = FRAMEMAP[e.frame || 0] || 0;
  shadow(e.x, e.y + 0.5, look.kid ? 5 : 6);
  drawSpr(personSprite(look, dk, fr, carryList && carryList.length), e.x - 9, e.y - 24, e.dir === 'left');
  if (carryList) carryList.forEach((k, i) => drawSpr(crateSprite(k), e.x - 7, e.y - 34 - i * 8));
}

function drawBoss() {
  const s = Math.hypot(PL.vx, PL.vy); let pose = 'idle';
  if (PL.walk) { if (s > 6) pose = Math.floor((PL.stride || 0) / 0.2) % 2 ? 'walkL' : 'walkR'; }
  else if (s > 6) { if (PL.braking) pose = 'brake'; else if (PL.input) { const ph = (PL.stride || 0) / (PL.period || 0.34); pose = ph < 0.45 ? (PL.side ? 'pushL' : 'pushR') : 'glide'; } else pose = 'glide'; }
  const dk = PL.dir === 'left' || PL.dir === 'right' ? 'side' : PL.dir; const wf = Math.floor(PL.anim / 3) % 2;
  shadow(PL.x, PL.y + 0.5, 6);
  drawSpr(bossSprite(dk, pose, PL.carry.length > 0, PL.walk ? 0 : wf, PL.walk), PL.x - 10 + (dk !== 'side' ? Math.round(PL.lean || 0) : 0), PL.y - 28, PL.dir === 'left');
  PL.carry.forEach((k, i) => drawSpr(crateSprite(k), PL.x - 7, PL.y - 36 - i * 8));
  if (s > 55 && Math.random() < 0.35) RT.parts.push({ x: PL.x - PL.vx * 0.06 + (Math.random() - 0.5) * 6, y: PL.y - 1, vx: -PL.vx * 0.2, vy: -6, t: 0.35, c: '#ffffff', dust: true });
}
function objDraw(o) {
  const x = o.x * T, y = o.y * T, t = R.t; const bot = (s) => drawSpr(s, x + (o.w * T - s.width) / 2, (o.y + o.h) * T - s.height + 1);
  switch (o.type) {
    case 'shelf': return drawSpr(shelfSprite(o.art, o.seed, fill(o.dept)), x, y - 8);
    case 'cooler': return drawSpr(coolerSprite(o.seed, fill(o.dept), o.art === 'dairy' ? 'dairy' : 'beer'), x, y - 8);
    case 'freezer': return drawSpr(freezerSprite(o.seed, fill(o.dept)), x, y - 4);
    case 'bin': return drawSpr(binSprite(o.seed, fill(o.dept)), x, y - 4);
    case 'case': return drawSpr(caseSprite(o.art, o.seed, fill(o.dept)), x, y - 8);
    case 'candy': return drawSpr(candySprite(o.seed, fill(o.dept)), x, y - 8);
    case 'gacha': return bot(propSprite('gacha', 0));
    case 'tank': return drawSpr(tankSprite(o.kind, Math.floor(t * 2 + o.x) % 3, !ST.fedToday && RT.dayT > 60), x, y - 8);
    case 'pallet': return drawSpr(palletSprite(o.crate), x - 1, y - 8 - 1);
    case 'staff': { const bob = o.giver && Math.sin(R.t * 2 + o.x) > 0.7 ? -1 : 0; drawPerson({ x: x + 8, y: y + 12 + bob, dir: 'down', frame: 0 }, o.look); return; } // givers shift their weight now and then
    case 'bar': return bot(propSprite('bar', o.frame || 0));
    case 'stool': return drawSpr(propSprite('stool', 0), x, y);
    case 'bigcheese': { bot(propSprite('bigcheese', 0)); const hot = Math.max(0, Math.min(1, (ST.cheeseTemp - 30) / 20)); const g = R.g; g.fillStyle = hot > 0.75 ? '#ff3a2a' : '#e23a2e'; const bh = 13 * hot; g.fillRect(sx(x + 29 + 1), sy(y + 32 - 10 - bh - 4), R.SC, bh * R.SC); if (ST.cheeseTemp > 45 && Math.floor(t * 4) % 2) { g.fillStyle = 'rgba(255,60,40,0.18)'; g.fillRect(sx(x), sy(y - 8), 32 * R.SC, 40 * R.SC); } return; }
    case 'anim': {
      const a = ST.anims[o.anim]; const broken = a && a.broken; let f = 0;
      if (o.anim === 'elvis') f = RT.elvisT > 0 ? Math.floor(t * 6) % 2 : 0; else if (o.anim === 'swing') f = broken ? 0 : Math.floor(t * 1.5) % 2; else f = broken ? 0 : Math.floor(t * 2) % 2;
      const s = propSprite(o.name, f); const dy = o.anim === 'elvis' && RT.elvisT > 0 ? -Math.abs(Math.sin(t * 10)) * 1.5 : 0;
      drawSpr(s, x + (o.w * T - s.width) / 2, (o.y + o.h) * T - s.height + 1 + dy);
      if (broken) { if (Math.random() < 0.15) RT.parts.push({ x: x + o.w * 8 + (Math.random() - 0.5) * 12, y: y - 4, vx: (Math.random() - 0.5) * 20, vy: -30, t: 0.5, c: Math.random() < 0.5 ? '#ffe14d' : '#8a8a8a', smoke: true }); }
      return;
    }
    case 'pond': { const s = propSprite('pond', Math.floor(t * 1.2) % 2); drawSpr(s, x - 1, y - 6); if (ST.anims.jungle && ST.anims.jungle.broken && Math.random() < 0.15) RT.parts.push({ x: x + 36, y: y + 10, vx: 0, vy: -20, t: 0.6, c: '#8a8a8a', smoke: true }); return; }
    case 'lamp': return drawSpr(propSprite('lamp', ST.minute > 19 * 60 || ST.minute < 7 * 60 ? 1 : 0), x, y - 24);
    case 'tree': return drawSpr(propSprite('bigtree', 0), x - 12, y - 36);
    case 'giraffe': return drawSpr(propSprite('giraffe', 0), x - 1, y - 34);
    case 'rhino': return drawSpr(propSprite('rhino', 0), x - 1, y - 20);
    case 'billboard': return drawSpr(propSprite('billboard', 0), x - 1, y - 30);
    case 'corral': return drawSpr(propSprite('corral', 0), x - 12, y);
    case 'couch': return drawSpr(propSprite('couch', 0), x, y - 4);
    case 'racecar': return drawSpr(propSprite('racecar', 0), x - 1, y);
    case 'deck': return drawSpr(propSprite('deck', 0), x - 1, y - 4);
    case 'elephant': return drawSpr(propSprite('elephant', 0), x - 9, y - 10);
    case 'penguin': return drawSpr(propSprite('penguin', 0), x, y - 6);
    case 'hive': return drawSpr(propSprite('hive', Math.floor(R.t * 3) % 2), x, y - 8);
    default: { const s = propSprite(o.type, o.type === 'ringlight' ? Math.floor(t * 3) % 2 : 0); if (s) bot(s); }
  }
}
function objBase(o) { return (o.y + o.h) * T + (o.type === 'tree' || o.type === 'lamp' ? 0 : 0); }

function render() {
  const g = R.g, SC = R.SC; R.t += 1 / 60;
  let cx = PL.x - R.vw / 2, cy = PL.y - 8 - R.vh / 2;
  cx = Math.max(0, Math.min(MW * T - R.vw, cx)); cy = Math.max(0, Math.min(MH * T - R.vh, cy));
  if (R.vw > MW * T) cx = (MW * T - R.vw) / 2; if (R.vh > MH * T) cy = (MH * T - R.vh) / 2;
  R.cx = Math.round(cx * SC) / SC; R.cy = Math.round(cy * SC) / SC;
  g.imageSmoothingEnabled = false; g.fillStyle = '#2a4a2a'; g.fillRect(0, 0, R.cv.width, R.cv.height);
  g.drawImage(W.groundCanvas, R.cx, R.cy, R.vw, R.vh, 0, 0, R.cv.width, R.cv.height);
  // spills (flat)
  RT.spills.forEach(s => drawSpr(spillSprite(s.kind), s.x * T, s.y * T));
  RT.spills.filter(s => s.kind === 'water').forEach(s => drawSpr(propSprite('wetsign', 0), s.x * T + 8, s.y * T - 10));
  // contact shadows under everything solid
  g.fillStyle = 'rgba(20,12,16,0.2)';
  for (const o of W.objs) { if (!o.solid || ['tree', 'lamp', 'staff', 'giraffe', 'rhino', 'billboard'].includes(o.type)) continue; const x0 = (o.x * T - R.cx) * SC, y0 = ((o.y + o.h) * T - R.cy) * SC; if (x0 < -80 || x0 > R.cv.width + 40 || y0 < -20 || y0 > R.cv.height + 40) continue; g.fillRect(x0 + SC, y0, (o.w * T) * SC, 3 * SC); g.fillRect(x0 + o.w * T * SC, y0 - 6 * SC, 2 * SC, 9 * SC); }
  // y-sorted drawables
  const L = R.cx - 48, Rr = R.cx + R.vw + 48, Tp = R.cy - 16, B = R.cy + R.vh + 64; const list = [];
  for (const o of W.objs) { const ox = o.x * T, oy = o.y * T; if (ox + o.w * T < L - 40 || ox > Rr || oy + o.h * T < Tp || oy - 48 > B) continue; list.push([objBase(o), 0, o]); }
  for (const c of RT.cars) { if (c.x < L || c.x > Rr || c.y < Tp || c.y > B + 20) continue; list.push([c.y + 12, 1, c]); }
  for (const c of RT.custs) { if (c.x < L || c.x > Rr || c.y < Tp || c.y > B) continue; list.push([c.y, 2, c]); }
  for (const s of RT.staff) { if (s.kind === 'cashier' || (s.x > L && s.x < Rr && s.y > Tp && s.y < B)) list.push([s.y, 3, s]); }
  if (!RT.sleeping && RT.menu !== 'title') list.push([PL.y, 4, PL]);
  list.sort((a, b) => a[0] - b[0]);
  for (const [, k, e] of list) {
    if (k === 0) objDraw(e);
    else if (k === 1) { const off = e.leaving ? e.t * 30 : e.enter * 28; g.globalAlpha = e.leaving ? Math.max(0, 1 - e.t) : 1 - e.enter * 0.8; drawSpr(carSprite(e.col), e.x - 9, e.y - 13 + off); g.globalAlpha = 1; }
    else if (k === 2) drawPerson(e, e.look);
    else if (k === 3) drawPerson(e, e.look, e.carry ? [e.carry] : null);
    else if (k === 4) drawBoss();
  }
  if (RT.sleeping) { drawSpr(bossSprite('down', 'idle', false, 0), PL.x - 10, PL.y - 28); }
  // drone + monorail (above everything)
  if (ST.ups.drone && W.spots.drone) drawSpr(propSprite('drone', Math.floor(R.t * 12) % 2), W.spots.drone[0] * T - 15 + Math.sin(R.t * 0.8) * 10, W.spots.drone[1] * T - 26 + Math.sin(R.t * 2) * 3);
  drawMonorail();
  // particles
  RT.parts.forEach(p => { g.globalAlpha = Math.min(1, p.t * 2); g.fillStyle = p.c; if (p.note) { g.font = `${SC * 8}px sans-serif`; g.fillText('♪', sx(p.x), sy(p.y)); } else { const s = p.smoke || p.dust ? 2 : 1; if (p.dust) g.globalAlpha = Math.min(0.5, p.t * 1.4); g.fillRect(sx(p.x), sy(p.y), s * SC, s * SC); } g.globalAlpha = 1; });
  // lighting
  const m = ST.minute % 1440; let dark = 0; if (m >= 18 * 60) dark = Math.min(0.62, (m - 18 * 60) / 120 * 0.62); else if (m < 7 * 60) dark = 0.62 * Math.max(0, 1 - (m - 5 * 60) / 120); if (m < 5 * 60) dark = 0.62;
  if (ST.weather === 'rain') dark = Math.max(dark, 0.28); else if (ST.weather === 'cloudy') dark = Math.max(dark, 0.12);
  if (dark > 0) { g.globalAlpha = dark; g.drawImage(R.night, R.cx, R.cy, R.vw, R.vh, 0, 0, R.cv.width, R.cv.height); g.globalAlpha = 1; if (dark > 0.3) lampGlow(dark); }
  if (ST.minute >= CLOSE_MIN || ST.minute < OPEN_MIN - 60) { g.fillStyle = 'rgba(10,16,48,0.22)'; g.fillRect(0, 0, R.cv.width, R.cv.height); }
  if (ST.weather === 'rain') drawRain();
  if (RT.sleeping) { g.fillStyle = 'rgba(5,8,25,0.55)'; g.fillRect(0, 0, R.cv.width, R.cv.height); g.fillStyle = '#fff'; g.font = `${SC * 10}px "Press Start 2P", monospace`; g.textAlign = 'center'; g.fillText('z z z', R.cv.width / 2, R.cv.height / 2); g.font = `${SC * 7}px VT323, monospace`; g.fillText('the store runs without you till close', R.cv.width / 2, R.cv.height / 2 + SC * 14); g.textAlign = 'left'; }
  drawOverlay();
}
function lampGlow(dark) {
  const g = R.g; g.globalCompositeOperation = 'lighter';
  for (const o of W.objs) { if (o.type !== 'lamp') continue; const x = sx(o.x * T + 8), y = sy(o.y * T - 16); if (x < -200 || y < -200 || x > R.cv.width + 200 || y > R.cv.height + 200) continue; const rg = g.createRadialGradient(x, y + 30 * R.SC, 4, x, y + 30 * R.SC, 46 * R.SC); rg.addColorStop(0, `rgba(255,220,140,${dark * 0.5})`); rg.addColorStop(1, 'rgba(255,220,140,0)'); g.fillStyle = rg; g.fillRect(x - 50 * R.SC, y - 20 * R.SC, 100 * R.SC, 100 * R.SC); }
  g.globalCompositeOperation = 'source-over';
}
function drawRain() {
  const g = R.g; g.strokeStyle = 'rgba(180,210,255,0.55)'; g.lineWidth = Math.max(1, R.SC / 2); g.beginPath();
  for (let i = 0; i < 160; i++) { const rx = (i * 97.3 + R.t * 40) % R.vw, ry = (i * 53.1 + R.t * 260) % R.vh; const wx = R.cx + rx, wy = R.cy + ry; const tx = Math.floor(wx / T), ty = Math.floor(wy / T); if (!inb(tx, ty) || !W.outdoor[idx(tx, ty)]) continue; g.moveTo(rx * R.SC, ry * R.SC); g.lineTo((rx - 2) * R.SC, (ry + 6) * R.SC); }
  g.stroke();
}
// monorail: runs north-south along the east side, station by the quick-trip door
function drawMonorail() {
  const g = R.g, SC = R.SC, x = 74.5 * T, y1 = 3 * T, y2 = 46 * T;
  if (sx(x) < -60 || sx(x) > R.cv.width + 60) return;
  g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(sx(x + 10), sy(y1), 4 * SC, (y2 - y1) * SC);
  g.fillStyle = '#6a6f78'; for (let y = y1 + 8; y <= y2; y += 6 * T) g.fillRect(sx(x - 1), sy(y), 3 * SC, 10 * SC);
  g.fillStyle = '#8a8f98'; g.fillRect(sx(x - 3), sy(y1), 6 * SC, (y2 - y1) * SC); g.fillStyle = '#b8bec8'; g.fillRect(sx(x - 3), sy(y1), SC, (y2 - y1) * SC);
  g.fillStyle = '#9aa3ad'; g.fillRect(sx(x - 14), sy(7 * T), 28 * SC, 3 * T * SC); g.fillStyle = '#c8ccd2'; g.fillRect(sx(x - 14), sy(7 * T), 28 * SC, 2 * SC);
  const running = ST.ups.monorail && isOpen() && (['Sat', 'Sun'].includes(weekday()) || eventToday());
  const k = running ? (1 - Math.cos(R.t / 9)) / 2 : 0; const py = (8.5 + k * 34) * T;
  const s = propSprite('monorail', 0); g.save(); g.translate(sx(x), sy(py)); g.rotate(Math.PI / 2); g.drawImage(s, -25 * SC, -11 * SC, s.width * SC, s.height * SC); g.restore();
  if (!ST.ups.monorail) label(sx(x), sy(6 * T), 'Monorail: out of order', '#f2c81c', '#2a1d22', 5.5);
}
// ---------- hi-res overlay ----------
function label(x, y, text, fg, bg, size, font) {
  const g = R.g, SC = R.SC; g.font = `${Math.round(size * SC)}px ${font || 'VT323'}, monospace`; const w = g.measureText(text).width + SC * 4, h = size * SC * 1.05;
  g.fillStyle = bg; g.fillRect(Math.round(x - w / 2), Math.round(y - h / 2), Math.round(w), Math.round(h)); g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, x, y + SC * 0.3); g.textAlign = 'left'; g.textBaseline = 'alphabetic'; return w;
}
function drawOverlay() {
  const g = R.g, SC = R.SC;
  // dept signs: pixel art, same grid as the world
  for (const s of W.signs) {
    const d = DEPTS.find(d => d.name === s.text); const low = d && d.max && deptOpen(d) && fill(d.id) < 0.15;
    const sp = signSprite(typo(s.text).replace(/\u2019/g, "'"), s.locked ? 'locked' : low ? 'low' : s.dark ? 'dark' : 'open');
    const x = s.x * T - sp.width / 2, y = s.y * T - 9; if (sx(x) > R.cv.width || sx(x + sp.width) < 0 || sy(y) > R.cv.height || sy(y + 15) < 0) continue;
    drawSpr(sp, Math.round(x), Math.round(y));
  }
  // aisle labels (only when near)
  for (const l of W.labels) { if (Math.abs(l.x * T - PL.x) > 14 * T || Math.abs(l.y * T - PL.y) > 9 * T) continue; const sp = tagSprite(l.text); drawSpr(sp, Math.round(l.x * T - sp.width / 2), Math.round(l.y * T - 4)); }
  // target highlight
  if (!RT.dialog && !RT.menu && !RT.sleeping) {
    const t = targetInfo(); RT.target = t; const f = playerFacing();
    if (t && t.act) { let hx, hy, hw = T, hh = T; if (t.c) { hx = t.c.x - 8; hy = t.c.y - 22; hh = 22; } else if (t.spill) { hx = t.spill.x * T; hy = t.spill.y * T; } else if (t.act === 'scan') { hx = null; } else { hx = f.tx * T; hy = f.ty * T; }
      if (hx !== null && hx !== undefined) { const p = (Math.sin(R.t * 8) + 1) * 0.5 * SC; g.strokeStyle = '#ffe14d'; g.lineWidth = SC; const X = sx(hx) - p, Y = sy(hy) - p, Wd = hw * SC + 2 * p, Hd = hh * SC + 2 * p, k = 4 * SC;
        g.beginPath(); g.moveTo(X, Y + k); g.lineTo(X, Y); g.lineTo(X + k, Y); g.moveTo(X + Wd - k, Y); g.lineTo(X + Wd, Y); g.lineTo(X + Wd, Y + k); g.moveTo(X + Wd, Y + Hd - k); g.lineTo(X + Wd, Y + Hd); g.lineTo(X + Wd - k, Y + Hd); g.moveTo(X + k, Y + Hd); g.lineTo(X, Y + Hd); g.lineTo(X, Y + Hd - k); g.stroke(); }
    }
  } else RT.target = null;
  // escort arrow
  if (PL.escort) { const d = DEPT[PL.escort.cur]; const tx = (d.x + d.w / 2) * T, ty = (d.y + d.h / 2) * T; const a = Math.atan2(ty - PL.y, tx - PL.x); const x = sx(PL.x) + Math.cos(a) * 26 * SC, y = sy(PL.y - 12) + Math.sin(a) * 26 * SC;
    g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = '#ffe14d'; g.strokeStyle = '#2a1d22'; g.lineWidth = SC; g.beginPath(); g.moveTo(7 * SC, 0); g.lineTo(-4 * SC, -5 * SC); g.lineTo(-4 * SC, 5 * SC); g.closePath(); g.fill(); g.stroke(); g.restore();
    label(sx(PL.x), sy(PL.y - 46), 'to ' + d.name, '#2a1d22', '#ffe14d', 5); }
  // quest givers: yellow ! = job on offer, grey ? = job under way, yellow ? = job done, come get paid
  for (const gv of W.givers || []) { const m = giverMarker(gv); if (!m) continue; const x = sx(gv.px), y = sy(gv.py - 30); if (x < -40 || x > R.cv.width + 40 || y < -40 || y > R.cv.height + 40) continue; questMark(x, y, m); }
  // arrow at the screen edge toward a finished job
  const rg = readyGiverTarget(); if (rg && !RT.menu) { const x = sx(rg.px), y = sy(rg.py - 20), m = 30 * SC, W2 = R.cv.width, H2 = R.cv.height;
    if (x < m || x > W2 - m || y < m || y > H2 - m) { const cx = W2 / 2, cy = H2 / 2, a = Math.atan2(y - cy, x - cx), k = Math.min((W2 / 2 - m) / Math.abs(Math.cos(a) || 1e-6), (H2 / 2 - m) / Math.abs(Math.sin(a) || 1e-6)), ax = cx + Math.cos(a) * k, ay = cy + Math.sin(a) * k, pulse = 1 + Math.sin(R.t * 6) * 0.12;
      g.save(); g.translate(ax, ay); g.rotate(a); g.scale(pulse, pulse); g.fillStyle = '#ffe14d'; g.strokeStyle = '#2a1d22'; g.lineWidth = 1.5 * SC; g.beginPath(); g.moveTo(11 * SC, 0); g.lineTo(-6 * SC, -8 * SC); g.lineTo(-2 * SC, 0); g.lineTo(-6 * SC, 8 * SC); g.closePath(); g.fill(); g.stroke(); g.restore();
      questMark(ax - Math.cos(a) * 16 * SC, ay - Math.sin(a) * 16 * SC + 6 * SC, '?'); } }
  // bubbles
  for (const c of RT.custs) { if (!c.bubble) continue; const x = sx(c.x), y = sy(c.y - 30); if (x < -100 || x > R.cv.width + 100 || y < -50 || y > R.cv.height + 50) continue; drawBubble(x, y, c.bubble); }
  // floats
  RT.floats.forEach(f => { g.globalAlpha = Math.min(1, f.t * 1.5); const sp = floatSprite(f.text.replace(/,/g, ''), f.col); drawSpr(sp, Math.round(f.x - sp.width / 2), Math.round(f.y)); g.globalAlpha = 1; });
  // lane queues: progress pips over head customer
  W.lanes.forEach(l => { const c = l.queue[0]; if (!c || c.qi !== 0 || c.items <= 0 || (c.path && c.pi < c.path.length)) return; const x = sx(c.x), y = sy(c.y - 30); if (c.bubble) return; g.fillStyle = 'rgba(42,29,34,0.8)'; g.fillRect(x - 10 * SC, y - 2 * SC, 20 * SC, 3 * SC); g.fillStyle = '#7dff7a'; g.fillRect(x - 10 * SC, y - 2 * SC, 20 * SC * Math.min(1, c.scanned / c.items), 3 * SC); });
}
function questMark(x, y, m) { // chunky pixel ! or ? with an ink outline, bobbing
  const g = R.g, SC = R.SC, bob = Math.round(Math.sin(R.t * 5) * 1.5) * SC, col = m === 'grey?' ? '#b9c0c8' : '#ffe14d', ch = m === '!' ? '!' : '?';
  g.font = `${Math.round(11 * SC)}px "Press Start 2P", monospace`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round';
  g.lineWidth = 3 * SC; g.strokeStyle = '#2a1d22'; g.strokeText(ch, x, y + bob); g.fillStyle = col; g.fillText(ch, x, y + bob);
  g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(x - 2 * SC, y - 9 * SC + bob, SC, 3 * SC); g.textAlign = 'left';
}
function drawBubble(x, y, b) {
  const g = R.g, SC = R.SC;
  if (b.kind === 'q') { const bob = Math.sin(R.t * 6) * SC; g.fillStyle = '#2a1d22'; g.fillRect(x - 5 * SC, y - 10 * SC + bob, 10 * SC, 11 * SC); g.fillStyle = '#7fd4ff'; g.fillRect(x - 4 * SC, y - 9 * SC + bob, 8 * SC, 9 * SC); g.fillStyle = '#2a1d22'; g.font = `${Math.round(6 * SC)}px "Press Start 2P", monospace`; g.textAlign = 'center'; g.fillText('?', x + SC * 0.5, y - 1.5 * SC + bob); g.textAlign = 'left'; return; }
  let text = b.text; if (b.kind === 'wine' && !text) { g.font = `${Math.round(8 * SC)}px sans-serif`; g.textAlign = 'center'; g.fillText('🍷', x, y); g.textAlign = 'left'; return; }
  g.font = `${Math.round(5.5 * SC)}px VT323, monospace`; const maxW = 74 * SC; const words = text.split(' '); const lines = []; let cur = '';
  for (const w of words) { const t2 = cur ? cur + ' ' + w : w; if (g.measureText(t2).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t2; } if (cur) lines.push(cur);
  const lh = 5.2 * SC, bw = Math.max(...lines.map(l => g.measureText(l).width)) + 6 * SC, bh = lines.length * lh + 4 * SC; const bx = Math.round(x - bw / 2), by = Math.round(y - bh - 3 * SC);
  g.fillStyle = '#2a1d22'; g.fillRect(bx - SC, by - SC, bw + 2 * SC, bh + 2 * SC); g.fillStyle = b.kind === 'mad' ? '#ffe0da' : b.kind === 'wine' ? '#f4e6ff' : '#ffffff'; g.fillRect(bx, by, bw, bh);
  g.fillStyle = '#2a1d22'; g.fillRect(x - SC, by + bh + SC, 3 * SC, 2 * SC); g.fillStyle = b.kind === 'mad' ? '#ffe0da' : '#fff'; g.fillRect(x - SC + SC, by + bh, SC, SC * 2);
  g.fillStyle = b.kind === 'mad' ? '#a82a20' : '#2a1d22'; lines.forEach((l, i) => g.fillText(l, bx + 3 * SC, by + 2 * SC + (i + 0.8) * lh));
}
