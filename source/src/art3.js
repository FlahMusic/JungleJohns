// ===== art for the Eastgate layout: displays, food court, theater (same pixel rules: lit from the top left, 1px ink outline) =====
FLOOR.foodtile = (g, x, y, r, tx, ty) => { checker(g, x, y, (tx + ty) % 2 ? '#e9dcc0' : '#f3ead6', (tx + ty) % 2 ? '#d9c9a8' : '#e7dcc2', 8); if (r() < 0.06) P(g, x + 5, y + 9, 2, 1, '#c8b890'); };
CASE_STYLE.olive = '#4a6a34';
const barBase = PROPS.bar[2], carBase = PROPS.racecar[2], cheeseBase = PROPS.bigcheese[2];
Object.assign(PROPS, {
  bigcheese: [34, 42, (g, f, c) => { if (f !== 1) return cheeseBase(g, 0, c); g.translate(1, 1); P(g, 0, 26, 32, 14, '#7a4a24'); P(g, 0, 26, 32, 2, '#a8703a'); P(g, 0, 2, 32, 25, '#cfe6ee'); P(g, 1, 3, 30, 23, '#e8f4f8'); P(g, 0, 0, 32, 3, '#c6ccd4'); P(g, 8, 10, 16, 9, '#ffffff'); P(g, 8, 10, 16, 2, '#e23a2e'); pxText(g, 'GONE', 10, 13, '#2a1d22'); for (const [x, y] of [[6, 22], [20, 23], [25, 21]]) P(g, x, y, 1, 1, '#f2c230'); }, true],
  // the tasting bar's 4th look: bamboo front + coconut drinks with umbrellas (the Tiki Bar)
  bar: [16, 24, (g, f, c) => { if (f !== 3) return barBase(g, f, c);
    P(g, 0, 8, 16, 4, '#c8a050'); P(g, 0, 8, 16, 1, '#f0d080'); P(g, 0, 11, 16, 1, '#7a5a20'); P(g, 0, 12, 16, 10, '#a8803a');
    for (let x = 1; x < 16; x += 3) { P(g, x, 12, 2, 10, '#c8a050'); P(g, x, 12, 1, 10, '#e0c070'); P(g, x, 16, 2, 1, '#7a5a20'); }
    P(g, 0, 22, 16, 2, '#5a3a14'); disc(g, 5, 5, 2.5, '#7a4a22'); P(g, 4, 3, 2, 1, '#f4ead0'); P(g, 6, 0, 1, 4, '#3aa83a'); P(g, 4, 0, 5, 1, '#ff6fb0');
    disc(g, 11, 5, 2.5, '#7a4a22'); P(g, 10, 3, 2, 1, '#f4ead0'); P(g, 12, 1, 1, 3, '#ffd23f'); P(g, 10, 1, 4, 1, '#3ac0ff'); }, true],
  racecar: [34, 18, (g, f, c) => { carBase(g, f, c); if (f === 1) { const d = g.getImageData(0, 0, 34, 18), a = d.data; for (let i = 0; i < a.length; i += 4) if (a[i] === 0x2e && a[i + 1] === 0x5f && a[i + 2] === 0xd8) { a[i] = 0xf2; a[i + 1] = 0xc2; a[i + 2] = 0x1c; } else if (a[i] === 0x6a && a[i + 1] === 0x9a && a[i + 2] === 0xff) { a[i] = 0xff; a[i + 1] = 0xe6; a[i + 2] = 0x7a; } g.putImageData(d, 0, 0); } }, true],
  tower: [16, 40, (g) => { // a candy castle tower: striped wall, a pointy red roof, a pennant
    P(g, 2, 16, 12, 24, '#f4f0f6'); for (let y = 18; y < 38; y += 4) P(g, 2, y, 12, 2, '#3a6ad8'); P(g, 2, 16, 12, 1, '#ffffff'); P(g, 12, 16, 2, 24, '#c8c0d0');
    for (let x = 2; x < 14; x += 3) P(g, x, 13, 2, 3, '#f4f0f6'); P(g, 6, 26, 4, 5, '#2a1d22'); P(g, 7, 27, 2, 4, '#5a3a62');
    for (let y = 0; y < 13; y++) { const w = Math.max(1, Math.round(y * 0.9)); P(g, 8 - w, y + 1, w * 2, 1, y % 3 === 0 ? '#ff6a5a' : '#d8342a'); } P(g, 8, -1, 1, 3, '#6a6f78'); P(g, 9, -1, 4, 2, '#ffd23f'); }, true],
  pickles: [16, 22, (g, f, c) => { // a wooden barrel of big pickles in brine
    P(g, 2, 6, 12, 15, '#9a6a30'); P(g, 2, 6, 2, 15, '#b8843e'); P(g, 12, 6, 2, 15, '#7a4e20'); for (const y of [8, 13, 18]) P(g, 2, y, 12, 1, '#5a5f68');
    oval(g, 8, 6, 6, 2.5, '#6a8a3a'); oval(g, 8, 6, 5, 1.8, '#8ab048'); for (const [x, y] of [[5, 3], [9, 2], [7, 4], [11, 4]]) { P(g, x, y, 2, 4, '#4a7a2a'); P(g, x, y, 1, 3, '#7aa848'); } }, true],
  screen: [64, 24, (g) => { // the little theater: curtains, a lit screen with a palm tree on it
    P(g, 0, 0, 64, 22, '#5a1626'); P(g, 6, 2, 52, 18, '#e8f0f8'); P(g, 7, 3, 50, 16, '#bfe0ec'); P(g, 30, 8, 2, 10, '#7a5a3a'); for (let a = 0; a < 5; a++) { const ang = -2.6 + a * 0.55; for (let k = 0; k < 8; k++) P(g, 31 + Math.cos(ang) * k, 8 + Math.sin(ang) * k * 0.6, 2, 1, '#3aa848'); }
    P(g, 7, 15, 50, 4, '#f2c230'); for (let x = 0; x < 6; x += 2) { P(g, x, 0, 2, 22, '#7a2036'); P(g, 58 + x, 0, 2, 22, '#7a2036'); } P(g, 0, 0, 64, 2, '#c8a030'); P(g, 0, 22, 64, 2, '#3a0e18'); }, true],
  seat: [16, 16, (g) => { P(g, 3, 4, 10, 6, '#a8202e'); P(g, 3, 4, 10, 1, '#d8384a'); P(g, 3, 10, 10, 3, '#8a1826'); P(g, 3, 13, 2, 2, '#3a3a42'); P(g, 11, 13, 2, 2, '#3a3a42'); }, true],
  stage: [80, 18, (g) => { P(g, 0, 6, 80, 12, '#5a3a1a'); P(g, 0, 6, 80, 2, '#8a6a3a'); for (let x = 4; x < 80; x += 10) disc(g, x, 4, 1.5, '#fff6a0'); P(g, 34, 0, 12, 6, '#2e3a8a'); P(g, 36, 1, 8, 3, '#ffd23f'); }, true],
  chair: [16, 16, (g) => { P(g, 4, 3, 8, 3, '#e8e0d0'); P(g, 4, 3, 8, 1, '#ffffff'); P(g, 4, 7, 8, 3, '#d8d0c0'); P(g, 4, 10, 1, 4, '#8a8f98'); P(g, 11, 10, 1, 4, '#8a8f98'); }, true],
  table: [32, 18, (g) => { P(g, 1, 4, 30, 7, '#c8ccd2'); P(g, 1, 4, 30, 1, '#eef2f6'); P(g, 1, 10, 30, 1, '#8a929e'); P(g, 14, 11, 4, 6, '#6a6f78'); P(g, 9, 16, 14, 1, '#4a4f58'); P(g, 6, 6, 3, 2, '#ffffff'); P(g, 22, 6, 4, 2, '#e23a2e'); }, true],
  foodstall: [48, 34, (g, f) => { // a food court stand: a striped awning in its own colours, a sign, a counter
    const [c1, c2, food] = [['#e23a2e', '#ffd23f', '#f2a020'], ['#2fa84f', '#f4f4f0', '#d8342a'], ['#2a2a32', '#e23a2e', '#f6e0a0'], ['#ff8fc0', '#9ff0ff', '#ffffff'], ['#8a5a2a', '#f2c230', '#c8803a'], ['#f07a22', '#2e7d3b', '#e8a030']][f % 6];
    P(g, 0, 0, 48, 8, c1); for (let x = 0; x < 48; x += 8) P(g, x, 0, 4, 8, c2); P(g, 0, 8, 48, 2, shade(c1, -0.35)); for (let x = 2; x < 48; x += 4) P(g, x, 10, 2, 2, c1);
    P(g, 2, 12, 2, 10, '#8a8f98'); P(g, 44, 12, 2, 10, '#8a8f98'); P(g, 0, 22, 48, 12, '#c8b890'); P(g, 0, 22, 48, 2, '#ece0c0'); P(g, 0, 32, 48, 2, '#8a7a5a');
    for (let i = 0; i < 4; i++) { const x = 6 + i * 10; disc(g, x + 2, 20, 2.5, '#f4f4f0'); oval(g, x + 2, 19, 2, 1.2, food); } P(g, 6, 26, 36, 4, shade(c1, 0.2)); P(g, 6, 26, 36, 1, shade(c1, 0.5)); }, true],
  ship: [50, 42, (g) => { // a pirate ship display over the Cajun aisle
    g.translate(1, 1); P(g, 23, 2, 2, 26, '#6a4422'); P(g, 11, 6, 2, 22, '#6a4422'); P(g, 34, 8, 2, 20, '#6a4422');
    for (const [x, y, w, h] of [[14, 4, 20, 9], [16, 14, 16, 8], [4, 8, 14, 8], [4, 18, 12, 6], [27, 10, 14, 8], [29, 19, 11, 6]]) { P(g, x, y, w, h, '#f4ead0'); P(g, x, y, w, 1, '#ffffff'); P(g, x + w - 1, y, 1, h, '#d8ccb0'); }
    P(g, 22, 0, 6, 3, '#1a1a1a'); P(g, 24, 1, 2, 1, '#f4f4f4'); g.fillStyle = '#8a5a2a'; for (let y = 27; y < 38; y++) { const inset = Math.floor((y - 27) * 0.7); g.fillRect(inset + (y < 30 ? 0 : 2), y, 48 - inset * 2 - (y < 30 ? 0 : 4), 1); }
    P(g, 0, 27, 48, 2, '#b07a44'); P(g, 0, 31, 48, 1, '#5a3a14'); for (let x = 8; x < 40; x += 7) disc(g, x, 33, 1.3, '#1a1a1a'); }, true],
  vwbus: [50, 36, (g) => { // a hippie van: Natural Foods
    g.translate(1, 1); P(g, 2, 4, 44, 22, '#f4f0e6'); P(g, 2, 16, 44, 10, '#3ac0b0'); P(g, 2, 4, 44, 2, '#ffffff'); P(g, 0, 8, 3, 16, '#e8e0d0');
    for (let x = 6; x < 40; x += 9) P(g, x, 7, 7, 6, '#7ab8d8'); P(g, 41, 7, 4, 6, '#7ab8d8'); disc(g, 8, 18, 3, '#ffffff'); disc(g, 8, 18, 1.8, '#ff6fb0');
    for (const [x, c] of [[16, '#ffd23f'], [24, '#ff6a5a'], [32, '#b070ff']]) { disc(g, x, 21, 2.5, c); P(g, x - 1, 20, 2, 1, '#ffffff'); }
    disc(g, 10, 28, 4, '#2a2a2a'); disc(g, 38, 28, 4, '#2a2a2a'); disc(g, 10, 28, 1.6, '#c8c8d0'); disc(g, 38, 28, 1.6, '#c8c8d0'); }, true],
  tuktuk: [34, 28, (g) => { // a yellow auto-rickshaw: India
    g.translate(1, 1); P(g, 4, 2, 24, 4, '#2a2a2a'); P(g, 4, 6, 2, 12, '#2a2a2a'); P(g, 26, 6, 2, 12, '#2a2a2a'); P(g, 6, 8, 20, 10, '#f2c81c'); P(g, 6, 8, 20, 2, '#fff07a');
    P(g, 8, 10, 7, 6, '#3a3a42'); P(g, 17, 10, 7, 6, '#3a3a42'); P(g, 0, 14, 6, 6, '#f2c81c'); P(g, 0, 18, 32, 3, '#2e7d3b'); disc(g, 4, 22, 3, '#1a1a1a'); disc(g, 26, 22, 3, '#1a1a1a'); disc(g, 4, 22, 1.2, '#aaa'); disc(g, 26, 22, 1.2, '#aaa'); }, true],
  tikihead: [16, 32, (g) => { // a carved tiki head with a grin
    P(g, 2, 2, 12, 28, '#8a5a2a'); P(g, 2, 2, 2, 28, '#a8743e'); P(g, 12, 2, 2, 28, '#6a4018'); for (let x = 2; x < 14; x += 3) P(g, x, 0, 2, 3, ['#3aa83a', '#ff6a5a', '#ffd23f', '#3ac0ff'][x % 4]);
    P(g, 4, 8, 3, 3, '#ffffff'); P(g, 9, 8, 3, 3, '#ffffff'); P(g, 5, 9, 1, 1, '#1a1a1a'); P(g, 10, 9, 1, 1, '#1a1a1a'); P(g, 7, 12, 2, 4, '#6a4018');
    P(g, 4, 18, 8, 4, '#2a1a10'); for (let x = 5; x < 12; x += 2) P(g, x, 18, 1, 2, '#ffffff'); P(g, 3, 26, 10, 2, '#6a4018'); }, true],
  tray: [10, 8, (g) => { P(g, 0, 3, 10, 4, '#c8302a'); P(g, 0, 3, 10, 1, '#e85a4a'); disc(g, 3, 3, 2, '#f2d880'); P(g, 6, 0, 2, 4, '#f4f4f4'); P(g, 6, 0, 2, 1, '#e23a2e'); }, true],
  mstairs: [16, 30, (g) => { // the stairs up to the monorail platform
    P(g, 2, 0, 2, 30, '#6a6f78'); P(g, 12, 0, 2, 30, '#6a6f78'); for (let y = 4; y < 30; y += 4) { P(g, 3, y, 10, 2, '#9aa3ad'); P(g, 3, y, 10, 1, '#c8ccd2'); } P(g, 0, 0, 16, 2, '#f2c81c'); }, true],
});
