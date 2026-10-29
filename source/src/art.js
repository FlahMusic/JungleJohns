// ===== pixel art: everything is drawn at 1x into small canvases, then scaled =====
function cv(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function mkRng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function P(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(x, y, w, h); }
function disc(g, cx, cy, r, c) { g.fillStyle = c; for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) { const dx = x + 0.5 - cx, dy = y + 0.5 - cy; if (dx * dx + dy * dy <= r * r) g.fillRect(x, y, 1, 1); } }
function oval(g, cx, cy, rx, ry, c) { g.fillStyle = c; for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) { const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry; if (dx * dx + dy * dy <= 1) g.fillRect(x, y, 1, 1); } }
function hex2rgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
function shade(h, amt) { const [r, g, b] = hex2rgb(h); const f = v => Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt))); return '#' + [f(r), f(g), f(b)].map(v => v.toString(16).padStart(2, '0')).join(''); }
const OL = '#2a1d22';
// add 1px outline around opaque pixels
function outline(c, col = OL) {
  const g = c.getContext('2d'), w = c.width, h = c.height, d = g.getImageData(0, 0, w, h), a = d.data;
  const [r, gg, b] = hex2rgb(col); const op = i => a[i * 4 + 3] > 100; const mark = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (op(i)) continue; if ((x > 0 && op(i - 1)) || (x < w - 1 && op(i + 1)) || (y > 0 && op(i - w)) || (y < h - 1 && op(i + w))) mark.push(i); }
  mark.forEach(i => { a[i * 4] = r; a[i * 4 + 1] = gg; a[i * 4 + 2] = b; a[i * 4 + 3] = 255; });
  g.putImageData(d, 0, 0); return c;
}
function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }

// ===================== FLOORS (16x16, drawn into ground canvas) =====================
// SNES-style: every tile is bevelled (light top-left edge, dark bottom-right), texture comes from ordered dither
// and a few placed details, never per-pixel random static. light comes from the top left everywhere.
function bevel(g, x, y, w, h, c, hi = 0.16, lo = -0.13) { P(g, x, y, w, h, c); P(g, x, y, w, 1, shade(c, hi)); P(g, x, y, 1, h, shade(c, hi)); P(g, x, y + h - 1, w, 1, shade(c, lo)); P(g, x + w - 1, y, 1, h, shade(c, lo)); }
function dither(g, x0, y0, c, gap = 4, off = 0) { for (let y = 1; y < 15; y += 2) for (let x = ((y >> 1) * 2 + off) % gap + 1; x < 15; x += gap) P(g, x0 + x, y0 + y, 1, 1, c); }
function speck(g, x0, y0, r, n, cols) { for (let i = 0; i < n; i++) P(g, x0 + 2 + Math.floor(r() * 12), y0 + 2 + Math.floor(r() * 12), 1, 1, pick(r, cols)); }
function checker(g, x0, y0, a, b, sz) { for (let y = 0; y < 16; y += sz) for (let x = 0; x < 16; x += sz) { const c = ((x + y) / sz) % 2 ? b : a; bevel(g, x0 + x, y0 + y, sz, sz, c, 0.1, -0.12); } }
function tiles(g, x0, y0, a, b, grout, sz, r) { for (let y = 0; y < 16; y += sz) for (let x = 0; x < 16; x += sz) { const c = r() < 0.5 ? a : b; bevel(g, x0 + x + 1, y0 + y + 1, sz - 1, sz - 1, c); P(g, x0 + x, y0 + y, sz, 1, grout); P(g, x0 + x, y0 + y, 1, sz, grout); } }
function planks(g, x0, y0, a, b, seam, tx, ty) {
  for (let row = 0; row < 4; row++) {
    const c = (row + tx) % 2 ? a : b, off = ((ty * 4 + row) * 7 + tx * 5) % 16, yy = y0 + row * 4;
    P(g, x0, yy, 16, 4, c); P(g, x0, yy, 16, 1, shade(c, 0.14)); P(g, x0, yy + 3, 16, 1, seam); P(g, x0 + off, yy, 1, 3, seam); P(g, x0 + off + 1, yy, 1, 3, shade(c, 0.2));
    P(g, x0 + (off + 6) % 13, yy + 1, 4, 1, shade(c, -0.07)); P(g, x0 + (off + 11) % 14, yy + 2, 2, 1, shade(c, -0.07)); // grain
  }
}
function carpet(g, x, y, base, a, b) { P(g, x, y, 16, 16, base); dither(g, x, y, a, 2, 0); for (let i = 0; i < 16; i += 4) P(g, x + i, y + ((i * 3) % 16), 1, 1, b); }
const FLOOR = {
  lino(g, x, y, r) { // big vinyl squares, the odd blue one, a polish glint now and then
    const blue = r() < 0.08; bevel(g, x, y, 16, 16, blue ? '#cfe0ea' : '#ece6d4', 0.35, -0.08); dither(g, x, y, blue ? '#c4d6e2' : '#e3dcc7', 6);
    if (r() < 0.18) { P(g, x + 3, y + 3, 3, 1, '#fbf8ee'); P(g, x + 3, y + 4, 1, 1, '#fbf8ee'); }
  },
  lino2(g, x, y, r) { const lav = r() < 0.1; bevel(g, x, y, 16, 16, lav ? '#d9cdea' : '#e4eaf0', 0.35, -0.08); dither(g, x, y, lav ? '#cfc2e2' : '#d9e0e8', 6); },
  terra(g, x, y, r) { tiles(g, x, y, '#c8754e', '#bd6a45', '#93492f', 8, r); },
  terra2(g, x, y, r) { tiles(g, x, y, '#c7925f', '#bb8756', '#8e5f37', 8, r); P(g, x + 7, y + 7, 2, 2, '#2e7d6b'); P(g, x + 7, y + 7, 1, 1, '#4aa08a'); },
  orange(g, x, y, r) { tiles(g, x, y, '#e2a456', '#d9994d', '#a96d2c', 8, r); },
  sand(g, x, y, r) { tiles(g, x, y, '#dcc38d', '#d3b880', '#a88b55', 8, r); },
  redcheck(g, x, y) { checker(g, x, y, '#c63b2e', '#ecdfca', 8); },
  pink(g, x, y, r) { // candy floor: placed sprinkles, one of four layouts
    bevel(g, x, y, 16, 16, '#f4c9d8', 0.3, -0.08); const L = [[[3, 4], [10, 2], [6, 11], [12, 9]], [[2, 9], [8, 5], [13, 12], [5, 2]], [[4, 13], [11, 6], [7, 8], [2, 3]], [[9, 11], [3, 7], [12, 3], [6, 4]]][Math.floor(r() * 4)];
    L.forEach(([a, b], i) => { const c = ['#6fc6e8', '#ffe066', '#9be37a', '#ff7aa8'][i]; if (i % 2) P(g, x + a, y + b, 2, 1, c); else P(g, x + a, y + b, 1, 2, c); });
  },
  darkwood(g, x, y, r, tx, ty) { planks(g, x, y, '#634029', '#58381f', '#3a2314', tx, ty); },
  wood(g, x, y, r, tx, ty) { planks(g, x, y, '#b98a55', '#ad7e4a', '#7a542f', tx, ty); },
  coolblue(g, x, y, r) { bevel(g, x, y, 16, 16, '#9db3c0', 0.18, -0.12); dither(g, x, y, '#a8bdc9', 4); if (r() < 0.2) P(g, x + 4, y + 4, 5, 1, '#b8cbd6'); },
  cheesecheck(g, x, y) { checker(g, x, y, '#f2e7c9', '#34343c', 8); },
  tatami(g, x, y) { P(g, x, y, 16, 16, '#cfc483'); for (let i = 1; i < 16; i += 2) P(g, x, y + i, 16, 1, '#c2b673'); P(g, x, y + 1, 16, 1, '#ddd398'); P(g, x, y, 16, 1, '#4a5a3a'); P(g, x, y, 1, 16, '#4a5a3a'); },
  bluetile(g, x, y, r) { tiles(g, x, y, '#94c4d6', '#86b9cc', '#6898ab', 4, r); },
  warm(g, x, y, r) { tiles(g, x, y, '#ebcb9f', '#e2bf90', '#b8915f', 8, r); },
  redtile(g, x, y, r) { tiles(g, x, y, '#c76c5c', '#bb6152', '#8e3f34', 8, r); },
  sage(g, x, y, r) { tiles(g, x, y, '#adc493', '#a2ba88', '#7c9563', 8, r); },
  neon(g, x, y) { P(g, x, y, 16, 16, '#1b1a26'); dither(g, x, y, '#24223a', 4); P(g, x, y, 16, 1, '#ff2d6f'); P(g, x, y, 1, 16, '#25d4ee'); P(g, x + 1, y + 1, 15, 1, '#3a1a2e'); },
  ice(g, x, y, r) { tiles(g, x, y, '#d9f0f8', '#cde8f3', '#a9d2e3', 8, r); if (r() < 0.3) { const a = 3 + Math.floor(r() * 3) * 4; P(g, x + a, y + a, 1, 1, '#ffffff'); P(g, x + a + 1, y + a - 1, 1, 1, '#ffffff'); } },
  kids(g, x, y, r) { carpet(g, x, y, '#3f6fd0', '#3a66c4', '#5a86e0'); const c = pick(r, ['#ffd23f', '#ff6b6b', '#5ee07a', '#ffffff']); P(g, x + 7, y + 6, 1, 3, c); P(g, x + 6, y + 7, 3, 1, c); },
  kids2(g, x, y, r) { P(g, x, y, 16, 16, '#ff9cc6'); dither(g, x, y, '#f590bc', 4); disc(g, x + 4, y + 4, 1.6, '#fff3a8'); disc(g, x + 12, y + 12, 1.6, '#9ff0ff'); P(g, x + 3, y + 3, 1, 1, '#ffffff'); P(g, x + 11, y + 11, 1, 1, '#ffffff'); },
  bluecarpet(g, x, y, r) { carpet(g, x, y, '#2f4c9e', '#2a4590', '#3a5ab0'); },
  concrete(g, x, y, r, tx, ty) { // stock room: sealed slabs, joints every 2 tiles, the odd crack
    P(g, x, y, 16, 16, '#a9a69c'); dither(g, x, y, '#a09d93', 3); dither(g, x, y, '#b3b0a6', 5, 2);
    if (tx % 2 === 0) P(g, x, y, 1, 16, '#8f8c83'); if (ty % 2 === 0) P(g, x, y, 16, 1, '#8f8c83');
    if (r() < 0.12) { P(g, x + 3, y + 9, 4, 1, '#87847b'); P(g, x + 7, y + 10, 3, 1, '#87847b'); P(g, x + 10, y + 11, 2, 1, '#87847b'); }
  },
  plywood(g, x, y, r, tx, ty) { planks(g, x, y, '#d2b07a', '#c9a66f', '#a5834f', tx, ty); },
  asphalt(g, x, y, r) { // fine aggregate in an ordered pattern, gravel clumps and the odd crack
    P(g, x, y, 16, 16, '#4c4c54'); dither(g, x, y, '#55555d', 3); dither(g, x, y, '#45454c', 5, 1);
    for (let i = 0; i < 2; i++) { const a = 2 + Math.floor(r() * 11), b = 2 + Math.floor(r() * 11); P(g, x + a, y + b, 2, 1, '#62626b'); P(g, x + a, y + b + 1, 1, 1, '#3e3e45'); }
    if (r() < 0.06) { const a = 2 + Math.floor(r() * 6); for (let i = 0; i < 6; i++) P(g, x + a + i, y + 4 + i + (i > 2 ? 1 : 0), 1, 1, '#38383e'); }
  },
  sidewalk(g, x, y, r) { bevel(g, x, y, 16, 16, '#d3cebf', 0.3, -0.16); dither(g, x, y, '#cac5b5', 4); if (r() < 0.15) P(g, x + 4 + Math.floor(r() * 8), y + 5 + Math.floor(r() * 6), 1, 1, '#a9a394'); },
  grass(g, x, y, r) { // two-tone dither + placed tufts (dark blade, light tip), a few flowers
    P(g, x, y, 16, 16, '#5fae47'); dither(g, x, y, '#58a442', 4); dither(g, x, y, '#66b84e', 6, 3);
    for (let i = 0; i < 3; i++) { const a = 1 + Math.floor(r() * 12), b = 2 + Math.floor(r() * 11); P(g, x + a, y + b, 1, 2, '#3f8a34'); P(g, x + a + 2, y + b, 1, 2, '#3f8a34'); P(g, x + a + 1, y + b + 1, 1, 1, '#3f8a34'); P(g, x + a, y + b - 1, 1, 1, '#7cc45e'); P(g, x + a + 2, y + b - 1, 1, 1, '#7cc45e'); }
    if (r() < 0.07) { const a = 3 + Math.floor(r() * 10), b = 3 + Math.floor(r() * 10); const c = pick(r, ['#fff', '#ffe14d', '#ff8fb1']); P(g, x + a, y + b, 1, 1, c); P(g, x + a - 1, y + b, 1, 1, c); P(g, x + a + 1, y + b, 1, 1, c); P(g, x + a, y + b - 1, 1, 1, c); P(g, x + a, y + b + 1, 1, 1, c); P(g, x + a, y + b, 1, 1, '#ffd23f'); P(g, x + a, y + b + 2, 1, 1, '#3f8a34'); }
  },
  road(g, x, y, r) { P(g, x, y, 16, 16, '#3d3d44'); dither(g, x, y, '#45454d', 3); dither(g, x, y, '#36363c', 5, 2); },
};

// ===================== shelf items (tiny, ~4x6) =====================
const IT = {
  box(g, x, y, c) { P(g, x, y, 4, 6, c); P(g, x, y, 4, 1, shade(c, 0.35)); P(g, x, y + 2, 4, 2, '#fff4d6'); P(g, x + 1, y + 2, 2, 1, shade(c, -0.3)); P(g, x + 3, y, 1, 6, shade(c, -0.25)); },
  can(g, x, y, c) { P(g, x, y + 2, 4, 4, c); P(g, x, y + 2, 4, 1, '#d8d8de'); P(g, x, y + 3, 4, 2, '#f3ead4'); P(g, x + 1, y + 3, 2, 1, c); P(g, x, y + 3, 1, 2, '#ffffff'); },
  jug(g, x, y, c, cap) { P(g, x, y + 1, 4, 5, c); P(g, x + 1, y, 2, 1, cap); P(g, x + 3, y + 1, 1, 2, shade(c, -0.3)); P(g, x, y + 3, 3, 2, '#ffffff'); P(g, x + 1, y + 3, 1, 2, cap); P(g, x, y + 1, 1, 2, shade(c, 0.3)); },
  bottle(g, x, y, c, cap) { P(g, x + 1, y, 2, 2, cap); P(g, x, y + 2, 4, 4, c); P(g, x, y + 3, 4, 2, '#f6eed6'); P(g, x + 1, y + 3, 2, 1, cap); P(g, x, y + 2, 1, 1, shade(c, 0.4)); },
  jar(g, x, y, c, lid) { P(g, x, y + 1, 4, 1, lid); P(g, x, y + 2, 4, 4, c); P(g, x, y + 3, 4, 2, '#f8f0da'); P(g, x, y + 2, 1, 3, shade(c, 0.4)); },
  bag(g, x, y, c) { P(g, x, y + 1, 4, 5, c); P(g, x, y + 1, 4, 1, shade(c, 0.4)); P(g, x + 1, y + 3, 2, 2, '#ffe680'); P(g, x, y + 5, 4, 1, shade(c, -0.3)); },
  pack(g, x, y, c) { P(g, x, y + 3, 4, 3, c); P(g, x, y, 4, 3, shade(c, 0.15)); P(g, x + 1, y + 1, 2, 1, '#fff'); P(g, x + 1, y + 4, 2, 1, '#ffe040'); P(g, x, y + 3, 4, 1, shade(c, -0.35)); },
  sack(g, x, y, c) { P(g, x, y + 1, 4, 5, '#ece0c2'); P(g, x, y + 3, 4, 1, c); P(g, x + 1, y, 2, 1, '#d2c3a0'); },
  tin(g, x, y, c) { P(g, x, y + 2, 4, 4, c); P(g, x, y + 2, 4, 1, '#e8c860'); P(g, x, y + 5, 4, 1, '#e8c860'); P(g, x + 1, y + 3, 2, 1, '#fff'); },
  pill(g, x, y, c) { P(g, x, y + 2, 3, 4, '#f4f4f0'); P(g, x, y + 1, 3, 1, c); P(g, x, y + 3, 3, 1, c); },
  shampoo(g, x, y, c) { P(g, x + 1, y, 1, 1, '#333'); P(g, x, y + 1, 3, 5, c); P(g, x, y + 3, 3, 1, '#fff'); P(g, x, y + 1, 1, 4, shade(c, 0.35)); },
  tall(g, x, y, c, cap) { P(g, x + 1, y, 1, 2, cap); P(g, x, y + 2, 3, 5, c); P(g, x, y + 4, 3, 1, '#f3e6c0'); P(g, x, y + 2, 1, 2, shade(c, 0.4)); },
  wine(g, x, y, c, cap) { P(g, x, y, 2, 2, cap); P(g, x, y + 2, 2, 5, c); P(g, x, y + 4, 2, 1, '#efe3c2'); P(g, x, y + 2, 1, 1, shade(c, 0.4)); },
  sauce(g, x, y, c, cap) { P(g, x, y, 2, 1, cap); P(g, x, y + 1, 2, 4, c); P(g, x, y + 2, 2, 1, '#fff2c8'); },
  pan(g, x, y) { disc(g, x + 2, y + 3, 2, '#3a3a42'); P(g, x + 1, y + 2, 1, 1, '#6a6a76'); P(g, x + 2, y, 1, 2, '#7a5a3a'); },
  pot(g, x, y, c) { P(g, x, y + 2, 4, 4, c); P(g, x - 0, y + 1, 4, 1, shade(c, 0.3)); P(g, x + 1, y, 2, 1, '#222'); P(g, x, y + 2, 1, 4, shade(c, 0.4)); },
  plush(g, x, y, c) { disc(g, x + 2, y + 3.5, 2.2, c); P(g, x, y + 1, 1, 1, c); P(g, x + 3, y + 1, 1, 1, c); P(g, x + 1, y + 3, 1, 1, '#222'); P(g, x + 3, y + 3, 1, 1, '#222'); },
  toybox(g, x, y, c) { P(g, x, y, 4, 6, c); P(g, x + 1, y + 1, 2, 3, '#bfe8ff'); P(g, x + 1, y + 2, 2, 1, pick(Math.random, ['#ff4040', '#40c040', '#ffd040'])); },
  cardpack(g, x, y, c) { P(g, x, y + 1, 3, 5, c); P(g, x, y + 1, 3, 1, '#e8e8f0'); P(g, x + 1, y + 3, 1, 1, '#fff6a0'); P(g, x + 2, y + 2, 1, 3, shade(c, 0.4)); },
  tumbler(g, x, y, c) { P(g, x + 2, y, 1, 2, '#fff'); P(g, x, y + 1, 4, 5, c); P(g, x, y + 1, 4, 1, '#e0e0e0'); P(g, x + 1, y + 5, 2, 1, shade(c, -0.3)); P(g, x, y + 2, 1, 3, shade(c, 0.4)); },
  cigar(g, x, y) { P(g, x, y + 3, 4, 3, '#8a5528'); P(g, x, y + 3, 4, 1, '#c99a5a'); P(g, x + 1, y + 4, 2, 1, '#e8d090'); P(g, x, y, 4, 3, '#6e4220'); P(g, x, y, 4, 1, '#a87440'); },
  milk(g, x, y, c) { P(g, x, y + 1, 4, 5, '#f8f8f4'); P(g, x + 1, y, 2, 1, c); P(g, x, y + 3, 4, 1, c); P(g, x + 3, y + 1, 1, 2, '#d6d6d0'); },
  eggs(g, x, y) { P(g, x, y + 3, 4, 3, '#d8c49a'); P(g, x, y + 2, 1, 1, '#f6ead0'); P(g, x + 2, y + 2, 1, 1, '#f6ead0'); P(g, x, y + 4, 4, 1, '#b8a070'); },
  kibble(g, x, y, c) { P(g, x, y, 4, 6, c); P(g, x, y, 4, 1, shade(c, 0.4)); P(g, x + 1, y + 2, 2, 2, '#f2e0b0'); P(g, x + 1, y + 2, 1, 1, '#5a3a20'); },
};
const PAL = {
  bright: ['#e23a2e', '#2e7de2', '#f2b51c', '#2fa84f', '#e8549a', '#8a52d8', '#f07a22', '#1fb8b8'],
  earth: ['#c0392b', '#d35400', '#8e5a2a', '#27ae60', '#a83250', '#d4a017', '#2c6e49'],
};
// draw one item for an art category into slot (x,y) with rng r
function drawItem(g, art, x, y, r) {
  const b = pick(r, PAL.bright), e = pick(r, PAL.earth);
  switch (art) {
    case 'grocery': { const k = r(); if (k < 0.25) IT.box(g, x, y, b); else if (k < 0.45) IT.can(g, x, y, e); else if (k < 0.65) IT.jug(g, x, y, pick(r, ['#2e6ee2', '#f07a22', '#1fb8b8', '#8a52d8']), pick(r, ['#ff9a1f', '#2e6ee2', '#fff'])); else if (k < 0.85) IT.bag(g, x, y, b); else IT.box(g, x, y, '#f4f4f4'); break; }
    case 'asia': { const k = r(); if (k < 0.3) IT.pack(g, x, y, pick(r, ['#e23a2e', '#f2b51c', '#e8549a', '#2e7de2'])); else if (k < 0.5) IT.bottle(g, x, y, '#3a1e10', '#e23a2e'); else if (k < 0.7) IT.sack(g, x, y, '#e23a2e'); else IT.jar(g, x, y, '#c0392b', '#2fa84f'); break; }
    case 'europe': { const k = r(); if (k < 0.3) IT.box(g, x, y, pick(r, ['#2e5fb8', '#c0392b', '#2fa84f'])); else if (k < 0.55) IT.tin(g, x, y, pick(r, ['#1f5e3a', '#8a1f2a', '#1f3a6e'])); else if (k < 0.75) IT.bottle(g, x, y, '#6b7a1f', '#2fa84f'); else IT.jar(g, x, y, '#e0b030', '#2e5fb8'); break; }
    case 'americas': { const k = r(); if (k < 0.3) IT.jar(g, x, y, '#c0392b', '#f2b51c'); else if (k < 0.5) IT.bag(g, x, y, pick(r, ['#2fa84f', '#f2b51c', '#d35400'])); else if (k < 0.7) IT.can(g, x, y, '#d35400'); else IT.bottle(g, x, y, '#8e2a1a', '#fff'); break; }
    case 'mideast': { const k = r(); if (k < 0.35) IT.tin(g, x, y, pick(r, ['#2c6e49', '#a83250', '#1f3a6e'])); else if (k < 0.65) IT.jar(g, x, y, '#c9a66b', '#a83250'); else IT.box(g, x, y, '#2c6e49'); break; }
    case 'hotsauce': { for (let i = 0; i < 2; i++) IT.sauce(g, x + i * 2, y + 1, pick(r, ['#d42a1a', '#ff7a1a', '#3aa83a', '#f2c21c', '#8a1a12']), pick(r, ['#222', '#fff', '#2a8a2a'])); break; }
    case 'wine': IT.wine(g, x, y, pick(r, ['#2c4a28', '#5a1626', '#3a2a18', '#c8b458', '#d0b07a']), pick(r, ['#8a1a2a', '#c8a030', '#1a1a1a', '#e0e0e0'])); break;
    case 'liquor': IT.tall(g, x, y, pick(r, ['#b5651d', '#d9a441', '#e6e6dc', '#7a3a12', '#3a6a3a']), pick(r, ['#222', '#c8a030', '#7a1a1a'])); break;
    case 'cigars': IT.cigar(g, x, y); break;
    case 'health': { const k = r(); if (k < 0.4) IT.shampoo(g, x, y, pick(r, ['#ff8fc0', '#5ab8ff', '#9be37a', '#b28cff', '#fff'])); else if (k < 0.7) IT.pill(g, x, y, pick(r, ['#e23a2e', '#2e7de2', '#2fa84f'])); else IT.box(g, x, y, pick(r, ['#e8f0ff', '#2e7de2', '#fff'])); break; }
    case 'natural': { const k = r(); if (k < 0.35) IT.jar(g, x, y, '#e8a820', '#3a2a10'); else if (k < 0.55) IT.jug(g, x, y, '#b5651d', '#7a3a12'); else if (k < 0.8) IT.pill(g, x, y, '#2fa84f'); else IT.bag(g, x, y, '#7fb04a'); break; }
    case 'pets': { const k = r(); if (k < 0.55) IT.kibble(g, x, y, pick(r, ['#c0392b', '#2e7de2', '#2fa84f', '#d4a017'])); else IT.can(g, x, y, '#8a52d8'); break; }
    case 'cookware': { const k = r(); if (k < 0.5) IT.pan(g, x, y); else IT.pot(g, x, y, pick(r, ['#c0392b', '#2e7de2', '#9a9aa4', '#f07a22'])); break; }
    case 'toys': { const k = r(); if (k < 0.5) IT.toybox(g, x, y, b); else IT.plush(g, x, y, pick(r, ['#c89a6a', '#ff9cc6', '#9ad0ff', '#ffe066'])); break; }
    case 'cards': IT.cardpack(g, x, y, pick(r, ['#e23a2e', '#2e7de2', '#8a52d8', '#2fa84f', '#f2b51c'])); break;
    case 'viral': { const k = r(); if (k < 0.6) IT.tumbler(g, x, y, pick(r, ['#ff8fc0', '#25d4ee', '#b28cff', '#f2f2f2', '#9be37a'])); else IT.box(g, x, y, '#1b1a26'); break; }
    default: IT.box(g, x, y, b);
  }
}

// ===================== cached sprite builder =====================
const SPR = {};
function spr(key, w, h, fn, ol) { if (SPR[key]) return SPR[key]; const c = cv(w, h); fn(c.getContext('2d'), c); if (ol) outline(c, ol === true ? OL : ol); SPR[key] = c; return c; }

// shelf (16x24 incl. 8px overhang) for item categories
const SHELF_STYLE = {
  grocery: ['#9aa3ad', '#59606a'], asia: ['#b8452b', '#6a2a1a'], europe: ['#8a6a44', '#4a3826'], americas: ['#d07a2a', '#6a3a12'], mideast: ['#5a7a5a', '#2e402e'],
  hotsauce: ['#3a3a42', '#1e1e24'], wine: ['#5a3420', '#2e1a10'], liquor: ['#5a3420', '#2e1a10'], cigars: ['#6a3e1e', '#3a2010'], health: ['#c9d4e4', '#7a8aa4'],
  natural: ['#8aa86a', '#4a6a34'], pets: ['#9aa3ad', '#59606a'], cookware: ['#9aa3ad', '#4e545e'], toys: ['#f0a030', '#8a4a10'], cards: ['#3a4aa8', '#1e2a6a'], viral: ['#2a2a38', '#121218'],
};
function shelfSprite(art, seed, fill) {
  const lv = Math.round(fill * 6), sv = seed % 6;
  return spr(`sh_${art}_${sv}_${lv}`, 16, 24, g => {
    const [frame, back] = SHELF_STYLE[art] || SHELF_STYLE.grocery;
    const r = mkRng(sv * 977 + art.length * 31);
    P(g, 0, 0, 16, 24, frame); P(g, 1, 2, 14, 21, back);
    P(g, 0, 0, 16, 2, shade(frame, 0.3)); P(g, 0, 0, 16, 1, shade(frame, 0.5));
    // tiers
    const wineish = art === 'wine' || art === 'hotsauce';
    const tiers = [2, 9, 16]; const tierH = 6;
    tiers.forEach(ty => { P(g, 1, ty + tierH, 14, 1, shade(frame, -0.2)); P(g, 1, ty + tierH, 14, 1, shade(frame, 0.15)); });
    const slots = []; tiers.forEach(ty => { if (wineish) { for (let i = 0; i < 5; i++) slots.push([1 + i * 3, ty]); } else { [1, 6, 11].forEach(sx => slots.push([sx, ty])); } });
    const order = slots.map((s, i) => [r(), i]).sort((a, b) => a[0] - b[0]).map(a => a[1]);
    const show = Math.round(slots.length * lv / 6); const shown = new Set(order.slice(0, show));
    slots.forEach((s, i) => { const tier = tiers.indexOf(s[1]); const ir = mkRng(sv * 131 + tier * 17 + art.length * 7); if (shown.has(i)) { if (wineish) { if (art === 'wine') IT.wine(g, s[0], s[1] - 1, pick(ir, ['#2c4a28', '#5a1626', '#3a2a18', '#c8b458', '#6a1a30']), pick(ir, ['#8a1a2a', '#c8a030', '#1a1a1a', '#e0e0e0'])); else IT.sauce(g, s[0], s[1] + 1, pick(ir, ['#d42a1a', '#ff7a1a', '#3aa83a', '#f2c21c', '#8a1a12']), pick(ir, ['#222', '#fff', '#2a8a2a'])); } else drawItem(g, art, s[0], s[1], ir); } });
    // price strips
    tiers.forEach(ty => { P(g, 1, ty + tierH, 14, 1, shade(frame, 0.25)); (wineish ? [2, 8, 13] : [2, 7, 12]).forEach(x => P(g, x, ty + tierH, 2, 1, '#f4f0e0')); });
    P(g, 0, 22, 16, 2, shade(frame, -0.35)); P(g, 0, 2, 1, 21, shade(frame, -0.15)); P(g, 15, 2, 1, 21, shade(frame, -0.3));
    if (lv === 0) { P(g, 5, 10, 6, 3, '#fff'); P(g, 6, 11, 4, 1, '#e23a2e'); }
  });
}
// beer cooler
function coolerSprite(seed, fill, kind) {
  const lv = Math.round(fill * 6), sv = seed % 4;
  return spr(`cool_${kind}_${sv}_${lv}`, 16, 24, g => {
    const r = mkRng(sv * 71 + 5);
    P(g, 0, 0, 16, 24, '#c9ced6'); P(g, 0, 0, 16, 3, kind === 'beer' ? '#e0a020' : '#5aaee0'); P(g, 2, 1, 12, 1, '#fff6c8');
    P(g, 1, 3, 14, 19, '#294a5e');
    const rows = [4, 10, 16]; const slots = []; rows.forEach(y => [2, 6, 10].forEach(x => slots.push([x, y])));
    const order = slots.map((s, i) => [r(), i]).sort((a, b) => a[0] - b[0]).map(a => a[1]); const show = new Set(order.slice(0, Math.round(slots.length * lv / 6)));
    slots.forEach((s, i) => { if (!show.has(i)) return; const ir = mkRng(sv * 33 + i); const [x, y] = s;
      if (kind === 'beer') { const c = pick(ir, ['#e8b020', '#2e7de2', '#2fa84f', '#c0392b', '#f4f4f4', '#1a1a1a']); if (ir() < 0.5) { P(g, x, y + 1, 4, 4, c); P(g, x, y + 1, 4, 1, '#ddd'); P(g, x + 1, y + 2, 2, 2, '#fff'); } else { for (let k = 0; k < 2; k++) { P(g, x + k * 2, y + 1, 2, 4, '#7a4a12'); P(g, x + k * 2, y, 1, 1, '#c8a030'); } } }
      else { const k = ir(); if (k < 0.4) IT.milk(g, x, y - 1, pick(ir, ['#e23a2e', '#2e7de2', '#2fa84f'])); else if (k < 0.7) IT.eggs(g, x, y - 1); else { P(g, x, y + 2, 4, 3, '#f6e07a'); P(g, x, y + 2, 4, 1, '#fff6c0'); } } });
    rows.forEach(y => P(g, 1, y + 5, 14, 1, '#9aa8b4'));
    g.globalAlpha = 0.35; P(g, 1, 3, 14, 19, '#bfe8ff'); g.globalAlpha = 0.6; for (let i = 0; i < 6; i++) P(g, 3 + i, 16 - i * 2, 1, 2, '#ffffff'); g.globalAlpha = 1;
    P(g, 13, 9, 1, 6, '#6a7280'); P(g, 0, 22, 16, 2, '#8a929e');
  });
}
// chest freezer (top-down, 16x20)
function freezerSprite(seed, fill) {
  const lv = Math.round(fill * 6), sv = seed % 4;
  return spr(`frz_${sv}_${lv}`, 16, 20, g => {
    const r = mkRng(sv * 19 + 3);
    P(g, 0, 0, 16, 20, '#e9eef2'); P(g, 0, 16, 16, 4, '#c6ccd4'); P(g, 1, 17, 14, 1, '#2e7de2');
    P(g, 1, 1, 14, 14, '#2a5a7a');
    const slots = []; [2, 8].forEach(y => [2, 6, 10].forEach(x => slots.push([x, y])));
    const order = slots.map((s, i) => [r(), i]).sort((a, b) => a[0] - b[0]).map(a => a[1]); const show = new Set(order.slice(0, Math.round(slots.length * lv / 6)));
    slots.forEach((s, i) => { if (!show.has(i)) return; const ir = mkRng(sv * 9 + i * 5); const [x, y] = s; if (ir() < 0.5) { disc(g, x + 2, y + 2.5, 2, pick(ir, ['#f8d0e0', '#fff4d0', '#6a3a20', '#c8f0c0'])); P(g, x + 1, y + 1, 1, 1, '#fff'); } else { P(g, x, y, 4, 5, pick(ir, ['#e23a2e', '#2e7de2', '#f2b51c'])); P(g, x + 1, y + 1, 2, 2, '#ffd890'); P(g, x + 1, y + 1, 1, 1, '#c0392b'); } });
    g.globalAlpha = 0.3; P(g, 1, 1, 14, 14, '#dff4ff'); g.globalAlpha = 0.7; P(g, 2, 2, 5, 1, '#fff'); P(g, 2, 3, 1, 3, '#fff'); g.globalAlpha = 1;
    P(g, 7, 1, 2, 14, '#c6ccd4');
  });
}
// produce bin (16x20, crate front 4px)
const PRODUCE_TYPES = ['apple', 'orange', 'banana', 'lettuce', 'grape', 'melon', 'pineapple', 'pepper', 'lemon', 'eggplant', 'carrot', 'potato', 'dragon'];
function drawProduce(g, type, x, y, r) {
  switch (type) {
    case 'apple': disc(g, x + 1.5, y + 1.5, 1.6, '#d6282a'); P(g, x + 1, y, 1, 1, '#ff8a80'); P(g, x + 1, y - 1, 1, 1, '#5a3a1a'); break;
    case 'orange': disc(g, x + 1.5, y + 1.5, 1.7, '#f28a1a'); P(g, x + 1, y + 1, 1, 1, '#ffc080'); break;
    case 'lemon': oval(g, x + 1.5, y + 1.5, 1.9, 1.3, '#f6dc2a'); P(g, x + 1, y + 1, 1, 1, '#fff6a0'); break;
    case 'banana': P(g, x, y + 1, 4, 1, '#f2d22a'); P(g, x + 3, y, 1, 1, '#f2d22a'); P(g, x, y + 2, 3, 1, '#d8b218'); P(g, x - 1, y + 1, 1, 1, '#5a4a12'); break;
    case 'lettuce': disc(g, x + 1.5, y + 1.5, 2, '#5cba3c'); P(g, x + 1, y + 1, 1, 2, '#a8e070'); P(g, x, y, 1, 1, '#3a8a2a'); break;
    case 'grape': [[0, 0], [2, 0], [1, 1], [3, 1], [0, 2], [2, 2], [1, 3]].forEach(([a, b]) => { P(g, x + a, y + b, 1, 1, '#7a2a8a'); }); P(g, x + 1, y + 1, 1, 1, '#b070c0'); break;
    case 'melon': oval(g, x + 2, y + 1.5, 2.6, 2, '#2e8a2e'); P(g, x, y + 1, 4, 1, '#6ac04a'); P(g, x + 1, y + 2, 3, 1, '#6ac04a'); break;
    case 'pineapple': oval(g, x + 1.5, y + 2, 1.6, 2, '#d8a020'); P(g, x + 1, y + 1, 1, 1, '#8a6010'); P(g, x, y - 1, 1, 1, '#2e8a2e'); P(g, x + 2, y - 1, 1, 1, '#2e8a2e'); P(g, x + 1, y - 2, 1, 2, '#3aa83a'); break;
    case 'pepper': { const c = pick(r, ['#e22a1a', '#f2c21c', '#3aa83a', '#f07a1a']); P(g, x, y + 1, 3, 2, c); P(g, x + 1, y, 1, 1, '#2a7a2a'); P(g, x, y + 1, 1, 1, shade(c, 0.5)); break; }
    case 'eggplant': oval(g, x + 1.5, y + 2, 1.4, 2, '#4a1a5a'); P(g, x + 1, y, 1, 1, '#3a8a2a'); P(g, x, y + 1, 1, 1, '#8a4aa0'); break;
    case 'carrot': P(g, x, y + 1, 3, 1, '#f07a1a'); P(g, x + 1, y + 2, 2, 1, '#e06a10'); P(g, x - 1, y, 1, 2, '#3aa83a'); break;
    case 'potato': oval(g, x + 1.5, y + 1.5, 1.9, 1.4, '#b88a52'); P(g, x + 1, y + 1, 1, 1, '#8a6232'); break;
    case 'dragon': oval(g, x + 1.5, y + 1.5, 1.8, 1.8, '#e8307a'); P(g, x, y, 1, 1, '#4ac04a'); P(g, x + 3, y + 2, 1, 1, '#4ac04a'); break;
  }
}
function binSprite(seed, fill) {
  const lv = Math.round(fill * 5), type = PRODUCE_TYPES[seed % PRODUCE_TYPES.length];
  return spr(`bin_${type}_${lv}`, 16, 20, g => {
    const r = mkRng(seed * 7 + 11);
    P(g, 0, 0, 16, 16, '#8a5a30'); P(g, 1, 1, 14, 14, '#3a2414'); P(g, 2, 2, 12, 12, '#4a2e18');
    const pts = []; for (let row = 0; row < 4; row++) for (let k = 0; k < 4; k++) pts.push([2 + k * 3 + (row % 2 ? 1 : 0), 2 + row * 3]);
    const n = [0, 4, 7, 10, 13, 16][lv]; const order = pts.map((p, i) => [p[1] * 10 - (i % 4 === 1 || i % 4 === 2 ? 5 : 0) + r(), i]).sort((a2, b2) => b2[0] - a2[0]);
    const keep = new Set(order.slice(0, n).map(o => o[1]));
    pts.forEach((p, i) => { if (keep.has(i)) drawProduce(g, type, p[0], p[1], r); });
    if (lv >= 4) { g.globalAlpha = 0.18; P(g, 3, 2, 10, 4, '#ffffff'); g.globalAlpha = 1; }
    P(g, 0, 0, 16, 1, '#b07a44'); P(g, 0, 15, 16, 5, '#a8743e'); P(g, 0, 15, 16, 1, '#c89458'); P(g, 0, 17, 16, 1, '#7a4e26');
    P(g, 1, 16, 1, 3, '#7a4e26'); P(g, 14, 16, 1, 3, '#7a4e26');
    P(g, 5, 16, 6, 3, '#2a2a2a'); P(g, 6, 17, 4, 1, '#f4f4f4');
  });
}
// counter case (16x24)
const CASE_STYLE = { deli: '#8a2a3a', bakery: '#e8cfa0', meat: '#a82a2a', fish: '#2e6a9a', cheesecase: '#c89a3a', sushi: '#3a2a20' };
function caseSprite(art, seed, fill) {
  const lv = Math.round(fill * 4), sv = seed % 4;
  return spr(`case_${art}_${sv}_${lv}`, 16, 24, g => {
    const r = mkRng(sv * 53 + art.length);
    const base = CASE_STYLE[art] || '#888';
    P(g, 0, 2, 16, 13, '#dff2f6'); P(g, 1, 5, 14, 9, art === 'fish' ? '#eef6fa' : '#f6f2ea');
    if (art === 'fish') for (let i = 0; i < 14; i += 2) P(g, 1 + i, 12, 1, 1, '#c8e0ea');
    const slots = [[1, 6], [5, 6], [9, 6], [12, 6], [3, 9], [8, 9], [11, 9]].slice(0, 7);
    const show = Math.round(slots.length * lv / 4);
    slots.forEach((s, i) => { if (i >= show) return; const [x, y] = s;
      switch (art) {
        case 'deli': if (r() < 0.5) { disc(g, x + 1.5, y + 1.5, 1.8, '#b03040'); P(g, x + 1, y + 1, 1, 1, '#f0b0b8'); } else { P(g, x, y, 4, 3, '#f0a0a8'); P(g, x, y, 4, 1, '#f8d0d4'); } break;
        case 'bakery': if (r() < 0.5) { oval(g, x + 1.5, y + 1.5, 2, 1.4, '#b87a3a'); P(g, x + 1, y + 1, 2, 1, '#e8b070'); } else { P(g, x, y, 3, 3, '#f8b8d0'); P(g, x, y, 3, 1, '#fff'); P(g, x + 1, y - 1, 1, 1, '#e23a2e'); } break;
        case 'meat': P(g, x, y, 4, 3, '#c83a3a'); P(g, x + 1, y + 1, 2, 1, '#f0d0d0'); P(g, x, y + 2, 1, 1, '#f8e8e8'); break;
        case 'fish': P(g, x, y + 1, 3, 2, '#a8b8c8'); P(g, x + 3, y, 1, 1, '#8898a8'); P(g, x + 3, y + 3, 1, 1, '#8898a8'); P(g, x, y + 1, 1, 1, '#222'); if (r() < 0.3) { P(g, x, y + 1, 3, 2, '#f08a6a'); } break;
        case 'cheesecase': if (r() < 0.5) { P(g, x, y + 1, 4, 2, '#f6d040'); P(g, x + 1, y, 3, 1, '#f6d040'); P(g, x + 2, y + 1, 1, 1, '#d8a820'); } else { oval(g, x + 1.5, y + 1.5, 2, 1.5, '#e8a030'); P(g, x, y + 1, 4, 1, '#f6d070'); } break;
        case 'sushi': disc(g, x + 1.5, y + 1.5, 1.6, '#1a1a1a'); P(g, x + 1, y + 1, 1, 1, '#ffffff'); P(g, x + 2, y + 1, 1, 1, '#f06a5a'); break;
      } });
    g.globalAlpha = 0.12; P(g, 0, 2, 16, 13, '#bfe8ff'); g.globalAlpha = 0.9; P(g, 2, 3, 6, 1, '#ffffff'); P(g, 1, 4, 1, 2, '#ffffff'); g.globalAlpha = 1;
    P(g, 0, 0, 16, 2, '#c6ccd4'); P(g, 0, 0, 16, 1, '#e6ebf0');
    P(g, 0, 15, 16, 9, base); P(g, 0, 15, 16, 1, shade(base, 0.3)); P(g, 0, 18, 16, 1, '#f4f0e0'); P(g, 0, 22, 16, 2, shade(base, -0.4));
  });
}
// candy bulk bin
function candySprite(seed, fill) {
  const lv = Math.round(fill * 5), sv = seed % 4;
  return spr(`candy_${sv}_${lv}`, 16, 24, g => {
    const r = mkRng(sv * 41 + 2);
    P(g, 0, 0, 16, 24, '#f6f0f6'); P(g, 0, 0, 16, 2, '#e85aa8');
    for (let b = 0; b < 2; b++) for (let c = 0; c < 2; c++) {
      const bx = 1 + c * 7, by = 3 + b * 9; P(g, bx, by, 7, 8, '#e8e0e8');
      const col = pick(r, ['#ff3a6a', '#3ac0ff', '#ffd23f', '#5ee07a', '#b070ff', '#ff8a2a']); const col2 = pick(r, ['#ffffff', '#ff3a6a', '#3ac0ff', '#ffd23f']);
      const n = Math.round(lv * 4); for (let i = 0; i < n * 3; i++) { const yy = by + 7 - Math.floor(i / 6); P(g, bx + 1 + (i * 3) % 5, yy, 1, 1, i % 3 ? col : col2); }
      g.globalAlpha = 0.4; P(g, bx, by, 7, 8, '#ffffff'); g.globalAlpha = 1; P(g, bx, by, 7, 1, '#c8b8c8'); P(g, bx + 1, by + 1, 1, 3, '#ffffff');
    }
    P(g, 0, 21, 16, 3, '#c83a88');
  });
}
// pallet with crate stack (16x24)
function crateIcon(g, type, x, y) {
  const c = CRATES[type] ? CRATES[type].color : '#888';
  switch (type) {
    case 'produce': disc(g, x + 3, y + 3.5, 2.5, '#d6282a'); P(g, x + 3, y, 1, 2, '#3aa83a'); break;
    case 'intl': disc(g, x + 3, y + 3, 2.7, '#3a8ad8'); P(g, x + 1, y + 2, 2, 2, '#3aa83a'); P(g, x + 4, y + 3, 1, 2, '#3aa83a'); break;
    case 'seafood': P(g, x, y + 2, 4, 2, '#5a9ac8'); P(g, x + 4, y + 1, 2, 4, '#5a9ac8'); P(g, x + 1, y + 2, 1, 1, '#fff'); break;
    case 'meat': oval(g, x + 3, y + 3, 2.8, 2, '#c83a3a'); P(g, x + 2, y + 2, 2, 1, '#f8d8d8'); break;
    case 'bakery': oval(g, x + 3, y + 3, 3, 1.8, '#c08040'); P(g, x + 2, y + 2, 1, 1, '#f0c080'); P(g, x + 4, y + 2, 1, 1, '#f0c080'); break;
    case 'deli': disc(g, x + 3, y + 3, 2.6, '#b03040'); P(g, x + 2, y + 2, 1, 1, '#f8c0c8'); P(g, x + 4, y + 4, 1, 1, '#f8c0c8'); break;
    case 'cheese': P(g, x, y + 2, 6, 3, '#f6d040'); P(g, x + 2, y + 1, 4, 1, '#f6d040'); P(g, x + 2, y + 3, 1, 1, '#d8a820'); break;
    case 'wine': case 'liquor': P(g, x + 2, y, 2, 2, '#333'); P(g, x + 1, y + 2, 4, 4, type === 'wine' ? '#6a1a30' : '#b5651d'); P(g, x + 1, y + 3, 4, 1, '#f0e0c0'); break;
    case 'beer': P(g, x + 1, y + 1, 4, 5, '#f0b020'); P(g, x + 1, y + 1, 4, 1, '#fff'); P(g, x + 5, y + 2, 1, 2, '#ccc'); break;
    case 'grocery': P(g, x + 1, y + 1, 4, 5, '#c0392b'); P(g, x + 1, y + 1, 4, 1, '#ddd'); P(g, x + 1, y + 3, 4, 1, '#fff'); break;
    case 'dairy': P(g, x + 1, y + 1, 4, 5, '#fff'); P(g, x + 2, y, 2, 1, '#2e7de2'); P(g, x + 1, y + 3, 4, 1, '#2e7de2'); break;
    case 'candy': disc(g, x + 3, y + 2.5, 2.2, '#ff3a8a'); P(g, x + 3, y + 4, 1, 2, '#fff'); P(g, x + 2, y + 2, 1, 1, '#fff'); break;
    case 'natural': P(g, x + 1, y + 2, 4, 3, '#5ab83a'); P(g, x + 2, y + 1, 2, 1, '#5ab83a'); P(g, x + 3, y + 2, 1, 3, '#2e7a2a'); break;
    case 'health': P(g, x + 2, y, 2, 6, '#e23a2e'); P(g, x, y + 2, 6, 2, '#e23a2e'); break;
    case 'hotsauce': P(g, x + 1, y + 1, 4, 2, '#e22a1a'); P(g, x + 4, y + 2, 2, 3, '#e22a1a'); P(g, x, y, 2, 1, '#3aa83a'); break;
    case 'housewares': disc(g, x + 2.5, y + 3, 2.2, '#3a3a42'); P(g, x + 4, y + 2, 2, 1, '#8a5a30'); break;
    case 'toys': P(g, x + 2, y, 2, 6, '#ffd23f'); P(g, x, y + 2, 6, 2, '#ffd23f'); P(g, x + 1, y + 1, 4, 4, '#ffd23f'); break;
    case 'capsules': disc(g, x + 3, y + 3, 2.6, '#ff6fb0'); P(g, x, y + 3, 6, 3, '#fff'); P(g, x + 1, y + 5, 4, 1, '#fff'); break;
    case 'cards': P(g, x + 1, y, 4, 6, '#4a5ad8'); P(g, x + 2, y + 1, 2, 4, '#e8e8ff'); break;
    case 'viral': P(g, x + 1, y, 4, 6, '#1a1a1a'); P(g, x + 2, y + 1, 2, 3, '#25f4ee'); P(g, x + 3, y + 2, 1, 1, '#ff2d6f'); break;
    default: P(g, x, y, 6, 6, c);
  }
}
function crateSprite(type) {
  return spr('crate_' + type, 14, 12, g => {
    P(g, 0, 1, 14, 11, '#c9a064'); P(g, 0, 0, 14, 2, '#e0bb80'); P(g, 6, 0, 2, 12, '#a88048');
    P(g, 2, 4, 10, 7, '#f6efe0'); P(g, 2, 4, 10, 1, CRATES[type].color); crateIcon(g, type, 4, 5); P(g, 0, 11, 14, 1, '#8a6434');
  }, true);
}
function palletSprite(type) {
  return spr('pallet_' + type, 16, 24, g => {
    const c = CRATES[type].color;
    P(g, 1, 20, 14, 4, '#9a7444'); P(g, 1, 20, 14, 1, '#c09a60'); P(g, 3, 22, 2, 2, '#3a2a1a'); P(g, 11, 22, 2, 2, '#3a2a1a');
    P(g, 1, 4, 14, 16, '#c9a064'); P(g, 1, 4, 14, 1, '#e8c890'); P(g, 1, 11, 14, 1, '#a88048'); P(g, 7, 4, 1, 16, '#a88048');
    P(g, 2, 12, 12, 7, '#f8f2e6'); P(g, 2, 12, 12, 2, c); crateIcon(g, type, 5, 13);
    P(g, 3, 0, 10, 4, shade(c, 0.1)); P(g, 3, 0, 10, 1, shade(c, 0.4));
  }, true);
}

// ===================== characters =====================
// o: {skin, hair, style, shirt, pants, shoes, kid, old, jim, hat}
function personSprite(o, dir, frame, carry) {
  const key = `p_${o.key}_${dir}_${frame}_${carry ? 1 : 0}`;
  return spr(key, 18, 26, g => {
    g.translate(1, 1);
    const kid = o.kid, tH = kid ? 4 : 7, lH = kid ? 3 : 4;
    const footY = 22, legY = footY - lH, torsoY = legY - tH, headY = torsoY - 10;
    const skin = o.skin, hair = o.hair, sd = shade(skin, -0.18);
    // legs
    const lp = o.jim && !o.shorts ? o.pants : o.pants;
    const legCol = o.jim ? skin : lp;
    if (dir === 'side') {
      const f = frame === 1 ? 1 : frame === 2 ? -1 : 0;
      P(g, 6 - f, legY, 3, lH, shade(legCol, -0.15)); P(g, 7 + f, legY, 3, lH, legCol);
      if (o.jim) { P(g, 6, legY, 4, 1, o.pants); }
      const sh = o.jim ? '#f4f4f4' : o.shoes;
      P(g, 6 - f, footY, 4, 1, shade(sh, -0.2)); P(g, 7 + f, footY, 4, 1, sh);
      if (o.jim) { P(g, 6 - f, footY + 1, 1, 1, '#ff7a1a'); P(g, 9 - f, footY + 1, 1, 1, '#ff7a1a'); P(g, 7 + f, footY + 1, 1, 1, '#ff7a1a'); P(g, 10 + f, footY + 1, 1, 1, '#ff7a1a'); }
      else P(g, 7 + f, footY + 1, 4, 1, shade(sh, -0.4));
    } else {
      const a = frame === 1 ? 1 : 0, b = frame === 2 ? 1 : 0;
      P(g, 4, legY, 3, lH - a, legCol); P(g, 9, legY, 3, lH - b, legCol);
      if (o.jim) { P(g, 4, legY, 8, 2, o.pants); }
      const sh = o.jim ? '#f4f4f4' : o.shoes;
      P(g, 4, footY - a, 3, 1 + a, sh); P(g, 9, footY - b, 3, 1 + b, sh);
      if (o.jim) { P(g, 4, footY + 1, 1, 1, '#ff7a1a'); P(g, 6, footY + 1, 1, 1, '#ff7a1a'); P(g, 9, footY + 1, 1, 1, '#ff7a1a'); P(g, 11, footY + 1, 1, 1, '#ff7a1a'); }
      else { P(g, 4, footY + 1 - a, 3, 1, shade(sh, -0.4)); P(g, 9, footY + 1 - b, 3, 1, shade(sh, -0.4)); }
    }
    // torso
    const sc = o.shirt;
    if (dir === 'side') {
      P(g, 5, torsoY, 6, tH, sc); P(g, 5, torsoY, 6, 1, shade(sc, 0.25)); P(g, 5, torsoY + tH - 1, 6, 1, shade(sc, -0.25));
      if (o.jim) { P(g, 8, torsoY + 2, 2, 2, shade(sc, -0.2)); P(g, 5, torsoY, 6, 1, '#d8342a'); }
      if (carry) { P(g, 8, torsoY - 4, 2, 5, sc); P(g, 8, torsoY - 5, 2, 1, skin); }
      else { const f = frame === 1 ? 1 : frame === 2 ? -1 : 0; P(g, 7 + f, torsoY + 1, 2, tH - 2, shade(sc, -0.12)); P(g, 7 + f, torsoY + tH - 1, 2, 2, skin); }
    } else {
      P(g, 4, torsoY, 8, tH, sc); P(g, 4, torsoY, 8, 1, shade(sc, 0.25)); P(g, 4, torsoY + tH - 1, 8, 1, shade(sc, -0.25));
      if (dir === 'down') { P(g, 7, torsoY, 2, 1, skin); if (o.jim) { P(g, 6, torsoY, 4, 1, '#d8342a'); P(g, 7, torsoY + 1, 2, 1, '#d8342a'); P(g, 5, torsoY + 2, 2, 2, shade(sc, -0.2)); P(g, 9, torsoY + 2, 2, 2, shade(sc, -0.2)); P(g, 8, torsoY + 1, 1, tH - 2, shade(sc, -0.3)); } }
      if (o.apron) { P(g, 5, torsoY + 1, 6, tH, o.apron); }
      P(g, 11, torsoY + 1, 1, tH - 1, shade(sc, -0.28)); P(g, 4, torsoY + 1, 1, tH - 2, shade(sc, 0.12)); if (!o.jim) { P(g, 6, legY, 1, lH - 1, shade(legCol, -0.25)); P(g, 11, legY, 1, lH - 1, shade(legCol, -0.25)); }
      if (carry) { P(g, 2, torsoY - 4, 2, 6, sc); P(g, 12, torsoY - 4, 2, 6, sc); P(g, 2, torsoY - 5, 2, 1, skin); P(g, 12, torsoY - 5, 2, 1, skin); }
      else { const a = frame === 1 ? 1 : 0, b = frame === 2 ? 1 : 0; P(g, 3, torsoY + 1 + a, 1, tH - 2, shade(sc, -0.12)); P(g, 12, torsoY + 1 + b, 1, tH - 2, shade(sc, -0.12)); P(g, 3, torsoY + tH - 1 + a, 1, 2, skin); P(g, 12, torsoY + tH - 1 + b, 1, 2, skin); }
      if (o.basket && dir === 'down' && !carry) { P(g, 12, torsoY + tH, 3, 3, '#d8342a'); P(g, 12, torsoY + tH - 1, 1, 1, '#d8342a'); P(g, 14, torsoY + tH - 1, 1, 1, '#d8342a'); P(g, 13, torsoY + tH, 1, 1, '#f2c230'); }
    }
    // head
    const hy = headY;
    const rows = [[2, 6], [1, 8], [0, 10], [0, 10], [0, 10], [0, 10], [0, 10], [0, 10], [1, 8], [2, 6]];
    rows.forEach(([o2, w], i) => P(g, 3 + o2, hy + i, w, 1, skin));
    P(g, 3, hy + 6, 10, 1, skin);
    P(g, 12, hy + 2, 1, 6, sd); P(g, 11, hy + 8, 1, 1, sd);
    if (dir === 'down') {
      P(g, 5, hy + 5, 1, 2, '#2a1b1b'); P(g, 4, hy + 4, 2, 1, sd); P(g, 10, hy + 4, 2, 1, sd); P(g, 10, hy + 5, 1, 2, '#2a1b1b'); P(g, 5, hy + 5, 1, 1, '#4a3a4a');
      P(g, 7, hy + 8, 2, 1, sd); P(g, 4, hy + 7, 1, 1, '#f0a0a0'); P(g, 11, hy + 7, 1, 1, '#f0a0a0');
      if (o.old) { P(g, 4, hy + 4, 3, 1, '#8a8a9a'); P(g, 9, hy + 4, 3, 1, '#8a8a9a'); P(g, 7, hy + 5, 2, 1, '#8a8a9a'); }
    } else if (dir === 'side') { P(g, 10, hy + 5, 1, 2, '#2a1b1b'); P(g, 13, hy + 6, 1, 1, skin); P(g, 10, hy + 8, 2, 1, sd); P(g, 6, hy + 5, 1, 2, sd); }
    // hair / hats
    const st = o.style;
    if (o.jim) {
      const hat = '#d8c078', hd = '#b49a58';
      if (dir === 'down' || dir === 'up') { P(g, 4, hy - 2, 8, 1, hat); P(g, 3, hy - 1, 10, 3, hat); P(g, 4, hy - 2, 4, 1, shade(hat, 0.3)); P(g, 3, hy + 2, 10, 1, '#7a4a22'); P(g, 1, hy + 3, 14, 1, hd); P(g, 1, hy + 3, 14, 1, hat); P(g, 1, hy + 4, 14, 1, hd); }
      else { P(g, 4, hy - 2, 8, 1, hat); P(g, 3, hy - 1, 10, 3, hat); P(g, 3, hy + 2, 10, 1, '#7a4a22'); P(g, 1, hy + 3, 15, 1, hat); P(g, 1, hy + 4, 15, 1, hd); }
      if (dir === 'down') { P(g, 5, hy + 8, 6, 1, '#6a3a1a'); P(g, 4, hy + 9, 2, 1, '#6a3a1a'); P(g, 10, hy + 9, 2, 1, '#6a3a1a'); }
      if (dir === 'up') { P(g, 3, hy + 5, 10, 3, '#5a3a22'); }
      if (dir === 'side') { P(g, 3, hy + 5, 4, 3, '#5a3a22'); P(g, 9, hy + 8, 4, 1, '#6a3a1a'); }
    } else if (st === 'cap') {
      const c = o.hat; P(g, 3, hy, 10, 3, c); P(g, 4, hy - 1, 8, 1, c); P(g, 5, hy - 1, 3, 1, shade(c, 0.35));
      if (dir === 'down') P(g, 3, hy + 3, 10, 1, shade(c, -0.3)); else if (dir === 'side') P(g, 10, hy + 3, 5, 1, shade(c, -0.3)); else P(g, 3, hy + 3, 10, 3, hair);
      if (dir === 'side') P(g, 3, hy + 3, 3, 4, hair);
    } else if (st !== 'bald') {
      const hl = shade(hair, 0.3);
      P(g, 4, hy - 1, 8, 1, hair); P(g, 3, hy, 10, 3, hair); P(g, 5, hy, 4, 1, hl);
      if (dir === 'down') { P(g, 3, hy + 3, 2, 3, hair); P(g, 11, hy + 3, 2, 3, hair); P(g, 5, hy + 3, 3, 1, hair); }
      if (dir === 'up') { P(g, 3, hy + 3, 10, 6, hair); P(g, 4, hy + 9, 8, 1, hair); }
      if (dir === 'side') { P(g, 3, hy + 3, 5, 5, hair); P(g, 4, hy + 8, 3, 1, hair); P(g, 10, hy + 3, 3, 1, hair); }
      if (st === 'long') { if (dir === 'down') { P(g, 2, hy + 3, 2, 8, hair); P(g, 12, hy + 3, 2, 8, hair); } if (dir === 'up') P(g, 3, hy + 9, 10, 4, hair); if (dir === 'side') P(g, 3, hy + 8, 4, 5, hair); }
      if (st === 'bun') { disc(g, 8, hy - 2, 2.2, hair); }
      if (st === 'pony') { if (dir === 'side') { P(g, 1, hy + 3, 2, 6, hair); } if (dir === 'up') P(g, 7, hy + 9, 2, 4, hair); }
      if (st === 'curly') { [3, 6, 9, 12].forEach(x => P(g, x - 1, hy - 2, 2, 1, hair)); P(g, 2, hy + 1, 1, 4, hair); P(g, 13, hy + 1, 1, 4, hair); }
    } else { if (dir !== 'side') { P(g, 3, hy + 3, 1, 3, hair); P(g, 12, hy + 3, 1, 3, hair); } else P(g, 3, hy + 3, 3, 3, hair); if (dir === 'up') P(g, 3, hy + 4, 10, 3, hair); }
  }, true);
}
const SKINS = ['#f6d3b3', '#e9b48a', '#d09a6c', '#a86f45', '#7a4a2a', '#5a3620', '#f2c9a0'];
const HAIRS = ['#2a1a12', '#5a3418', '#8a5a2a', '#d8b050', '#1a1a1a', '#b04020', '#3a2a2a'];
const SHIRTS = ['#d8342a', '#2e7de2', '#2fa84f', '#f2b51c', '#8a52d8', '#e8549a', '#1fb8b8', '#f4f4f4', '#3a3a48', '#f07a22', '#6a8a3a', '#9a2a5a'];
const PANTS = ['#2a3a6a', '#3a3a42', '#6a5a4a', '#2a2a2a', '#4a6a8a', '#7a3a3a', '#c8b890'];
let personKey = 0;
function randomLook(r, type) {
  const o = { skin: pick(r, SKINS), hair: pick(r, HAIRS), shirt: pick(r, SHIRTS), pants: pick(r, PANTS), shoes: pick(r, ['#2a2a2a', '#f4f4f4', '#7a4a22', '#c0392b', '#2e7de2']) };
  o.style = pick(r, ['short', 'short', 'long', 'cap', 'pony', 'curly', 'bun', 'bald']);
  if (o.style === 'cap') o.hat = pick(r, ['#c0392b', '#2e7de2', '#2a2a2a', '#2fa84f', '#f2b51c']);
  if (type === 'kid') { o.kid = true; if (o.style === 'bald') o.style = 'short'; }
  if (type === 'old') { o.old = true; o.hair = pick(r, ['#d8d8d8', '#b8b8b8', '#f0f0f0']); if (o.style === 'cap' || o.style === 'pony') o.style = 'short'; }
  o.key = (personKey++) % 400; return o;
}
const JIM_LOOK = { key: 'jim', jim: true, skin: '#f0c49a', hair: '#5a3a22', shirt: '#9aa35a', pants: '#a8875a', shoes: '#fff' };

// ===================== props =====================
function propSprite(name, frame = 0) {
  const k = name + '_' + frame;
  if (SPR[k]) return SPR[k];
  const f = PROPS[name]; if (!f) return null;
  const [w, h, fn, ol] = f; return spr(k, w, h, (g, c) => fn(g, frame, c), ol);
}
const PROPS = {
  elvis: [34, 42, (g, f) => {
    g.translate(1, 1);
    P(g, 0, 29, 32, 11, '#6a3a1e'); P(g, 0, 28, 32, 2, '#a86a3a'); P(g, 0, 30, 32, 2, '#c8282a'); for (let i = 2; i < 32; i += 4) P(g, i, 34, 2, 2, f ? '#fff6a0' : '#ffd23f');
    // legs (white jumpsuit flares)
    P(g, 11, 21, 4, 7, '#f6f6f2'); P(g, 17, 21, 4, 7, '#f6f6f2'); P(g, 10, 26, 5, 2, '#f6f6f2'); P(g, 17, 26, 5, 2, '#f6f6f2'); P(g, 11, 23, 1, 4, '#e8c040'); P(g, 20, 23, 1, 4, '#e8c040');
    // torso
    P(g, 10, 12, 12, 10, '#f6f6f2'); P(g, 10, 19, 12, 2, '#e8c040'); for (let i = 0; i < 4; i++) P(g, 12 + i * 2, 15, 1, 1, '#e8c040');
    P(g, 9, 10, 3, 4, '#f6f6f2'); P(g, 20, 10, 3, 4, '#f6f6f2'); P(g, 9, 10, 3, 1, '#e8c040'); P(g, 20, 10, 3, 1, '#e8c040');
    // guitar
    oval(g, 19, 18, 5, 3.6, '#a8541e'); oval(g, 19, 18, 3.5, 2.3, '#c8743a'); disc(g, 19, 18, 1.1, '#3a1a0a');
    for (let i = 0; i < 8; i++) P(g, 23 + i, 16 - Math.floor(i * 0.8), 2, 1, '#d8b070'); P(g, 30, 9, 2, 2, '#3a2a1a');
    // arms (fur)
    P(g, 8, 14, 3, 5, '#d8943a'); P(g, 15, 17, 3, 2, '#d8943a'); P(g, 22, 13, 3, 4, '#d8943a');
    // mane + face
    disc(g, 16, 7, 8.5, '#b8641a'); for (let a = 0; a < 12; a++) { const x = 16 + Math.cos(a / 12 * 6.283) * 8.5, y = 7 + Math.sin(a / 12 * 6.283) * 8.5; disc(g, x, y, 1.4, '#9a4e12'); }
    disc(g, 16, 8, 5.5, '#e8b45a'); oval(g, 16, 10.5, 3.2, 2, '#f8e0b0'); P(g, 15, 9, 3, 1, '#3a1a12'); P(g, 16, 10, 1, 1, '#3a1a12'); P(g, 14, 12, 5, 1, '#8a3a1a');
    // shades
    P(g, 11, 6, 4, 2, '#1a1a24'); P(g, 17, 6, 4, 2, '#1a1a24'); P(g, 15, 6, 2, 1, '#1a1a24'); P(g, 12, 6, 1, 1, '#6a8aff'); P(g, 18, 6, 1, 1, '#6a8aff');
    // pompadour + sideburns
    oval(g, 16, 0.5, 6.5, 3, '#15151d'); oval(g, 13, -0.5, 3, 2, '#2a2a3a'); P(g, 11, 2, 2, 6, '#15151d'); P(g, 19, 2, 2, 6, '#15151d'); P(g, 13, -1, 3, 1, '#4a5aa0');
  }, true],
  bigcheese: [34, 42, (g, f) => {
    g.translate(1, 1);
    P(g, 0, 26, 32, 14, '#7a4a24'); P(g, 0, 26, 32, 2, '#a8703a'); P(g, 2, 30, 28, 7, '#5a3418'); P(g, 4, 32, 24, 3, '#f2c230');
    P(g, 0, 2, 32, 25, '#cfe6ee'); P(g, 1, 3, 30, 23, '#e8f4f8');
    oval(g, 15, 21, 12, 3.5, '#d89a18'); P(g, 3, 12, 24, 9, '#f0b828'); oval(g, 15, 12, 12, 4, '#f8d860');
    P(g, 3, 13, 24, 1, '#d89a18'); P(g, 15, 9, 12, 4, '#f8d860');
    // wedge cut
    P(g, 18, 8, 9, 13, '#f8e070'); for (const [x, y] of [[20, 11], [24, 14], [21, 17], [25, 18], [19, 15]]) disc(g, x, y, 1, '#d8a828');
    P(g, 18, 8, 1, 13, '#c88a18');
    for (const [x, y] of [[7, 15], [11, 18], [14, 14]]) disc(g, x, y, 0.9, '#d89a18');
    g.globalAlpha = 0.5; P(g, 2, 4, 2, 10, '#fff'); P(g, 5, 4, 1, 6, '#fff'); g.globalAlpha = 1;
    P(g, 0, 0, 32, 3, '#c6ccd4'); P(g, 0, 0, 32, 1, '#eef2f6');
    P(g, 28, 6, 3, 16, '#ffffff'); P(g, 29, 7, 1, 14, '#e8e8e8');
  }, true],
  firetruck: [34, 26, (g, f) => {
    g.translate(1, 1);
    P(g, 1, 8, 30, 11, '#d42a20'); P(g, 1, 8, 30, 2, '#f05a40'); P(g, 22, 4, 9, 6, '#d42a20'); P(g, 24, 5, 5, 3, '#9ad8f0'); P(g, 1, 14, 30, 1, '#f2f2f2');
    for (let i = 3; i < 22; i += 3) P(g, i, 5, 1, 3, '#c8c8d0'); P(g, 2, 5, 20, 1, '#e8e8f0'); P(g, 2, 7, 20, 1, '#e8e8f0');
    P(g, 23, 3, 2, 1, f ? '#3a8aff' : '#ff3a3a'); P(g, 27, 3, 2, 1, f ? '#ff3a3a' : '#3a8aff');
    disc(g, 7, 19, 3, '#1e1e24'); disc(g, 24, 19, 3, '#1e1e24'); disc(g, 7, 19, 1.2, '#9a9aa4'); disc(g, 24, 19, 1.2, '#9a9aa4');
    P(g, 6, 10, 10, 3, '#f2c230'); P(g, 8, 9, 2, 1, '#3aa83a'); P(g, 30, 12, 2, 2, '#fff6a0');
  }, true],
  minnow: [34, 26, (g, f) => {
    g.translate(1, 1);
    P(g, 0, 18, 32, 6, '#3a8ac8'); for (let i = 0; i < 32; i += 4) P(g, i + (f ? 2 : 0), 19, 2, 1, '#8ad0f0');
    g.fillStyle = '#f4f4f0'; for (let y = 11; y < 19; y++) { const inset = Math.floor((y - 11) * 0.6); g.fillRect(2 + inset, y, 28 - inset * 2, 1); }
    P(g, 2, 11, 28, 1, '#fff'); P(g, 3, 14, 26, 2, '#2e5fb8');
    P(g, 9, 5, 12, 6, '#f4f4f0'); P(g, 9, 5, 12, 1, '#d8d8d0'); P(g, 11, 7, 2, 2, '#5ab0e0'); P(g, 15, 7, 2, 2, '#5ab0e0'); P(g, 19, 7, 1, 2, '#5ab0e0');
    P(g, 14, 0, 1, 5, '#7a5a3a'); P(g, 15, 0, 4, 2, '#e23a2e');
  }, true],
  swing: [18, 34, (g, f) => {
    g.translate(1, 1);
    P(g, 1, 2, 1, 30, '#9aa3ad'); P(g, 14, 2, 1, 30, '#9aa3ad'); P(g, 0, 1, 16, 2, '#b8c0ca');
    const sx = f ? 2 : -1;
    P(g, 4 + sx, 3, 1, 14, '#6a5a4a'); P(g, 11 + sx, 3, 1, 14, '#6a5a4a'); P(g, 3 + sx, 17, 10, 2, '#7a4a22');
    P(g, 4 + sx, 7, 8, 10, '#d8342a'); P(g, 4 + sx, 11, 8, 3, '#f4f4f0'); P(g, 4 + sx, 7, 8, 1, '#c8c8d0');
    P(g, 6 + sx, 9, 1, 1, '#1a1a1a'); P(g, 9 + sx, 9, 1, 1, '#1a1a1a'); P(g, 7 + sx, 10, 2, 1, '#1a1a1a');
    P(g, 2 + sx, 10, 2, 1, '#d8342a'); P(g, 12 + sx, 10, 2, 1, '#d8342a'); P(g, 5 + sx, 19, 2, 3, '#d8342a'); P(g, 9 + sx, 19, 2, 3, '#d8342a');
    P(g, 0, 30, 16, 2, '#7a7f88');
  }, true],
  corn: [18, 26, (g) => {
    g.translate(1, 1);
    oval(g, 8, 10, 4.5, 8.5, '#f2c81c'); for (let y = 3; y < 18; y += 2) for (let x = 5; x < 12; x += 2) P(g, x + (y % 4 ? 1 : 0), y, 1, 1, '#d8a810');
    P(g, 2, 12, 3, 9, '#5ab83a'); P(g, 11, 12, 3, 9, '#5ab83a'); P(g, 3, 13, 1, 7, '#3a8a2a'); P(g, 12, 13, 1, 7, '#3a8a2a');
    P(g, 6, 7, 1, 2, '#1a1a1a'); P(g, 9, 7, 1, 2, '#1a1a1a'); P(g, 6, 11, 4, 1, '#8a3a1a'); P(g, 7, 12, 2, 1, '#e86a6a');
    P(g, 6, 20, 1, 3, '#2a2a2a'); P(g, 9, 20, 1, 3, '#2a2a2a'); P(g, 5, 22, 2, 1, '#2a2a2a'); P(g, 9, 22, 2, 1, '#2a2a2a');
  }, true],
  racecar: [34, 18, (g) => {
    g.translate(1, 1);
    P(g, 2, 5, 28, 7, '#2e5fd8'); P(g, 8, 2, 12, 4, '#2e5fd8'); P(g, 10, 3, 8, 2, '#9ad8f0'); P(g, 2, 5, 28, 1, '#6a9aff'); P(g, 0, 4, 3, 3, '#2a2a2a');
    P(g, 13, 7, 6, 4, '#f4f4f4'); P(g, 15, 8, 2, 2, '#d8342a'); P(g, 2, 9, 28, 1, '#d8342a');
    disc(g, 7, 12, 2.6, '#1a1a1a'); disc(g, 25, 12, 2.6, '#1a1a1a'); disc(g, 7, 12, 1, '#aaa'); disc(g, 25, 12, 1, '#aaa');
  }, true],
  gacha: [18, 26, (g, f) => {
    g.translate(1, 1);
    P(g, 1, 13, 14, 11, '#e2342a'); P(g, 1, 13, 14, 1, '#ff6a5a'); disc(g, 8, 17, 2.5, '#f4f4f4'); P(g, 7, 16, 2, 2, '#c8c8d0'); P(g, 5, 21, 6, 2, '#2a2a2a'); P(g, 12, 15, 2, 1, '#2a2a2a');
    disc(g, 8, 7, 6.5, '#d8f0ff');
    for (const [x, y, c] of [[5, 9, '#ff6fb0'], [9, 10, '#ffd23f'], [11, 7, '#5ee07a'], [6, 5, '#3ac0ff'], [8, 7, '#b070ff'], [4, 8, '#ff8a2a'], [10, 4, '#ff3a3a']]) { disc(g, x, y, 1.6, c); P(g, x - 1, y, 2, 1, '#fff'); }
    g.globalAlpha = 0.6; P(g, 4, 3, 2, 3, '#fff'); g.globalAlpha = 1; P(g, 3, 0, 10, 2, '#e2342a');
  }, true],
  ringlight: [18, 26, (g, f) => {
    g.translate(1, 1);
    P(g, 7, 12, 2, 10, '#2a2a2a'); P(g, 3, 21, 10, 1, '#2a2a2a'); P(g, 3, 22, 1, 2, '#2a2a2a'); P(g, 12, 22, 1, 2, '#2a2a2a');
    disc(g, 8, 6, 6, f ? '#ffffff' : '#f0f6ff'); disc(g, 8, 6, 4, '#1b1a26'); P(g, 6, 3, 4, 6, '#2a2a2a'); P(g, 7, 4, 2, 4, '#25d4ee'); P(g, 8, 5, 1, 1, '#ff2d6f');
  }, true],
  cardtable: [18, 18, (g) => {
    g.translate(1, 1);
    P(g, 0, 2, 16, 10, '#6a4a2a'); P(g, 1, 3, 14, 8, '#2a7a4a'); P(g, 2, 4, 3, 4, '#f4f4f4'); P(g, 6, 5, 3, 4, '#e23a2e'); P(g, 11, 4, 3, 4, '#2e7de2'); P(g, 2, 12, 2, 4, '#4a3018'); P(g, 12, 12, 2, 4, '#4a3018');
  }, true],
  register: [16, 24, (g, f) => {
    P(g, 0, 10, 16, 14, '#9aa3ad'); P(g, 0, 10, 16, 2, '#c9d0d8'); P(g, 1, 12, 14, 3, '#1e1e24'); for (let i = 1; i < 15; i += 3) P(g, i, 13, 1, 1, '#4a4a54');
    P(g, 2, 2, 9, 8, '#e8e0c8'); P(g, 3, 3, 5, 3, '#2a5a3a'); P(g, 4, 4, 2, 1, '#7aff9a'); P(g, 3, 7, 7, 2, '#c8c0a8'); P(g, 9, 3, 1, 2, '#8a8a94');
    P(g, 12, 4, 3, 6, '#f2c230'); P(g, 12, 4, 3, 1, '#e23a2e');
    P(g, 1, 16, 14, 6, '#e23a2e'); for (let i = 2; i < 14; i += 3) { P(g, i, 17, 2, 2, pick(mkRng(i), ['#ffd23f', '#3ac0ff', '#5ee07a'])); P(g, i, 20, 2, 1, '#fff'); }
    P(g, 0, 22, 16, 2, '#6a737e');
  }, true],
  counter: [16, 24, (g) => { P(g, 0, 10, 16, 14, '#b88a55'); P(g, 0, 10, 16, 2, '#d8aa75'); P(g, 0, 14, 16, 1, '#8a5a30'); P(g, 0, 22, 16, 2, '#6a4422'); }, true],
  bar: [16, 24, (g, f) => {
    P(g, 0, 8, 16, 16, '#7a4a28'); P(g, 0, 8, 16, 3, '#a8703a'); P(g, 0, 8, 16, 1, '#c8904a'); for (let i = 1; i < 16; i += 5) P(g, i, 13, 3, 9, '#6a3e20');
    P(g, 0, 22, 16, 2, '#4a2a14');
    if (f === 1) { P(g, 3, 2, 1, 6, '#c8c8d0'); P(g, 8, 2, 1, 6, '#c8c8d0'); P(g, 12, 2, 1, 6, '#c8c8d0'); P(g, 2, 1, 3, 2, '#f2c230'); P(g, 7, 1, 3, 2, '#e23a2e'); P(g, 11, 1, 3, 2, '#2e7de2'); }
    else { P(g, 4, 4, 3, 2, '#f4f4f4'); P(g, 5, 6, 1, 2, '#e8e8e8'); P(g, 4, 4, 3, 1, '#7a1a30'); P(g, 10, 3, 2, 5, '#2c4a28'); P(g, 10, 2, 2, 1, '#8a1a2a'); }
  }, true],
  stool: [16, 16, (g) => { P(g, 7, 7, 2, 8, '#b8c0ca'); P(g, 4, 14, 8, 1, '#b8c0ca'); oval(g, 8, 6, 5, 3, '#c8282a'); oval(g, 8, 5, 4, 2, '#e84a4a'); }, true],
  infodesk: [16, 24, (g) => { P(g, 0, 10, 16, 14, '#2e7d3b'); P(g, 0, 10, 16, 2, '#4aa858'); P(g, 0, 22, 16, 2, '#1e4a26'); disc(g, 8, 17, 4, '#f2c230'); P(g, 7, 14, 2, 1, '#2e7d3b'); P(g, 7, 16, 2, 4, '#2e7d3b'); P(g, 6, 16, 1, 1, '#2e7d3b'); P(g, 6, 19, 4, 1, '#2e7d3b'); }, true],
  desk: [16, 24, (g) => { P(g, 0, 12, 16, 12, '#8a5a30'); P(g, 0, 12, 16, 2, '#b07a44'); P(g, 2, 0, 12, 11, '#d8d0b8'); P(g, 3, 1, 10, 8, '#1a2a3a'); P(g, 4, 2, 8, 6, '#2a6a8a'); P(g, 5, 3, 3, 1, '#9af0ff'); P(g, 5, 5, 5, 1, '#9af0ff'); P(g, 6, 11, 4, 1, '#a8a090'); P(g, 1, 16, 14, 1, '#6a4422'); }, true],
  couch: [32, 20, (g) => { P(g, 0, 4, 32, 14, '#8a3a4a'); P(g, 0, 4, 32, 3, '#a84a5a'); P(g, 2, 9, 13, 6, '#b45a6a'); P(g, 17, 9, 13, 6, '#b45a6a'); P(g, 0, 7, 3, 11, '#7a2a3a'); P(g, 29, 7, 3, 11, '#7a2a3a'); P(g, 1, 18, 2, 2, '#3a2a1a'); P(g, 29, 18, 2, 2, '#3a2a1a'); P(g, 20, 6, 6, 4, '#f2c230'); }, true],
  fridge: [16, 24, (g) => { P(g, 1, 0, 14, 24, '#f0f0ec'); P(g, 1, 9, 14, 1, '#c8c8c4'); P(g, 12, 3, 1, 4, '#9a9aa4'); P(g, 12, 12, 1, 6, '#9a9aa4'); P(g, 3, 13, 4, 3, '#f2c230'); P(g, 4, 2, 3, 3, '#e23a2e'); }, true],
  plant: [16, 26, (g) => { P(g, 4, 18, 8, 7, '#b8642a'); P(g, 3, 18, 10, 2, '#d8844a'); for (const [x, y, rx, ry, c] of [[8, 9, 3, 7, '#2e8a3a'], [4, 11, 3.5, 4, '#3aa848'], [12, 11, 3.5, 4, '#3aa848'], [6, 5, 3, 3.5, '#4ac05a'], [11, 6, 3, 3, '#2e8a3a']]) oval(g, x, y, rx, ry, c); P(g, 8, 4, 1, 14, '#1e6a2a'); }, true],
  bigtree: [40, 52, (g) => { P(g, 17, 34, 6, 16, '#7a4a24'); P(g, 15, 46, 10, 4, '#6a3a1a'); for (const [x, y, r, c] of [[20, 20, 15, '#2e7a32'], [11, 24, 9, '#2e7a32'], [29, 24, 9, '#2e7a32'], [16, 14, 9, '#3a9a3e'], [26, 15, 8, '#3a9a3e'], [20, 9, 7, '#4ab04a'], [12, 19, 4, '#5ac05a'], [24, 10, 3, '#6ad06a']]) disc(g, x, y, r, c); }, true],
  lamp: [16, 40, (g, f) => { P(g, 7, 6, 2, 34, '#5a5f68'); P(g, 3, 37, 10, 3, '#4a4f58'); P(g, 3, 2, 10, 4, '#3a3f48'); P(g, 4, 6, 8, 1, f ? '#fff6a0' : '#c8c8b0'); }, true],
  cart: [16, 16, (g) => { P(g, 2, 3, 11, 7, '#c8ccd2'); for (let i = 3; i < 13; i += 2) P(g, i, 4, 1, 5, '#8a929e'); P(g, 2, 3, 11, 1, '#e8ecf0'); P(g, 12, 1, 3, 2, '#d8342a'); P(g, 3, 10, 9, 1, '#8a929e'); disc(g, 4, 13, 1.3, '#2a2a2a'); disc(g, 11, 13, 1.3, '#2a2a2a'); }, true],
  restroom: [16, 24, (g) => { P(g, 2, 0, 12, 24, '#3a6ab8'); P(g, 3, 1, 10, 22, '#4a7ac8'); P(g, 12, 12, 1, 3, '#f2c230'); P(g, 4, 3, 8, 9, '#f4f4f0'); disc(g, 6, 5, 1.1, '#3a6ab8'); P(g, 5, 7, 2, 4, '#3a6ab8'); disc(g, 10, 5, 1.1, '#3a6ab8'); P(g, 9, 7, 2, 2, '#3a6ab8'); P(g, 8, 9, 4, 2, '#3a6ab8'); }, true],
  trash: [16, 18, (g) => { P(g, 4, 4, 8, 13, '#2e7d3b'); P(g, 3, 3, 10, 2, '#1e5a2a'); for (let i = 5; i < 12; i += 2) P(g, i, 6, 1, 10, '#256a32'); }, true],
  wetsign: [16, 22, (g) => { g.fillStyle = '#f2c81c'; for (let y = 2; y < 20; y++) { const w = 2 + Math.floor((y - 2) * 0.5); g.fillRect(8 - w, y, w * 2, 1); } P(g, 7, 8, 2, 6, '#1a1a1a'); P(g, 7, 15, 2, 2, '#1a1a1a'); P(g, 3, 20, 10, 1, '#d8a810'); }, true],
  drone: [30, 30, (g, f) => {
    g.translate(1, 1);
    P(g, 6, 3, 16, 3, '#3a3a42'); P(g, 12, 2, 4, 5, '#2a2a32'); for (const x of [4, 22]) { P(g, x, 1, 2, 3, '#5a5a64'); P(g, x - 3 + (f ? 1 : 0), 0, 8, 1, '#c8c8d0'); }
    P(g, 13, 7, 1, 4, '#8a8a94');
    P(g, 9, 11, 10, 14, '#e22a1a'); P(g, 11, 9, 6, 2, '#e22a1a'); P(g, 12, 7, 4, 2, '#2a8a2a'); P(g, 9, 15, 10, 5, '#fff2c8'); P(g, 11, 16, 6, 3, '#e22a1a'); P(g, 9, 11, 2, 12, '#ff6a4a');
  }, true],
  monorail: [50, 22, (g) => {
    g.translate(1, 1);
    P(g, 2, 4, 44, 13, '#f2d21c'); P(g, 0, 7, 3, 9, '#f2d21c'); P(g, 45, 7, 3, 9, '#f2d21c'); P(g, 2, 4, 44, 2, '#fff07a');
    for (let i = 5; i < 44; i += 6) P(g, i, 7, 4, 4, '#2a3a4a'); P(g, 2, 13, 44, 2, '#1a1a1a'); P(g, 0, 16, 48, 2, '#a8a030');
  }, true],
  dock: [16, 24, (g) => { P(g, 0, 0, 16, 24, '#6a6f78'); P(g, 1, 1, 14, 22, '#8a909a'); for (let i = 3; i < 23; i += 3) P(g, 1, i, 14, 1, '#7a808a'); P(g, 6, 18, 4, 2, '#f2c230'); }, true],
};
// car top-down 16x24
function carSprite(col) {
  return spr('car_' + col, 16, 26, g => {
    g.translate(1, 1);
    P(g, 1, 2, 12, 20, col); P(g, 2, 1, 10, 1, col); P(g, 2, 22, 10, 1, col); P(g, 1, 2, 2, 20, shade(col, 0.2));
    P(g, 2, 6, 10, 4, '#2a3a5a'); P(g, 3, 6, 3, 1, '#6a8aba'); P(g, 2, 10, 10, 6, shade(col, 0.12)); P(g, 2, 16, 10, 3, '#2a3a5a');
    P(g, 2, 1, 2, 1, '#fff6a0'); P(g, 10, 1, 2, 1, '#fff6a0'); P(g, 2, 22, 2, 1, '#e23a2a'); P(g, 10, 22, 2, 1, '#e23a2a');
    P(g, 0, 4, 1, 3, '#1a1a1a'); P(g, 13, 4, 1, 3, '#1a1a1a'); P(g, 0, 16, 1, 3, '#1a1a1a'); P(g, 13, 16, 1, 3, '#1a1a1a');
  }, true);
}
const CAR_COLS = ['#d8342a', '#2e6ad8', '#e8e8e8', '#2a2a2a', '#2fa84f', '#f2b51c', '#8a52d8', '#9aa3ad', '#7a3a1a'];
// fish tank 16x24, animated frames
function tankSprite(kind, frame, hungry) {
  return spr(`tank_${kind}_${frame}_${hungry ? 1 : 0}`, 16, 24, g => {
    P(g, 0, 17, 16, 7, '#2a2a32'); P(g, 0, 17, 16, 1, '#4a4a54');
    P(g, 0, 1, 16, 16, '#c8d0d8'); P(g, 1, 2, 14, 14, hungry ? '#4a7a6a' : '#2f86b8'); P(g, 1, 2, 14, 3, hungry ? '#5a8a7a' : '#4aa0d0');
    P(g, 1, 14, 14, 2, '#d8c088'); P(g, 3, 9, 1, 5, '#2e9a3a'); P(g, 12, 8, 1, 6, '#2e9a3a'); P(g, 4, 10, 1, 3, '#3ab84a');
    const t = frame;
    if (kind === 'lobster') { const x = 4 + (t % 2) * 2; P(g, x, 12, 6, 2, '#c8302a'); P(g, x - 1, 11, 2, 2, '#e8402a'); P(g, x + 6, 11, 2, 1, '#e8402a'); P(g, x + 5, 12, 1, 1, '#1a1a1a'); }
    else { const x1 = 3 + t * 3, x2 = 11 - t * 2; P(g, x1, 6, 4, 2, '#f2a020'); P(g, x1 - 1, 6, 1, 2, '#e88a10'); P(g, x1 + 3, 6, 1, 1, '#1a1a1a'); P(g, x2, 10, 3, 2, '#e8e8f0'); P(g, x2 + 3, 10, 1, 2, '#c8c8d0'); P(g, x2, 10, 1, 1, '#1a1a1a'); }
    P(g, 6 + t, 4 + ((t * 3) % 6), 1, 1, '#d8f4ff'); P(g, 9 - t, 8 - t, 1, 1, '#d8f4ff');
    g.globalAlpha = 0.5; P(g, 2, 3, 1, 8, '#fff'); g.globalAlpha = 1; P(g, 0, 0, 16, 2, '#9aa3ad');
  }, true);
}
// spills
function spillSprite(kind) {
  return spr('spill_' + kind, 16, 16, g => {
    const c = { milk: '#f6f6f0', salsa: '#c8301e', pickle: '#7aa83a', grape: '#7a2a8a', water: '#9ad0f0' }[kind];
    oval(g, 8, 9, 6.5, 4, c); oval(g, 4, 11, 2.5, 2, c); oval(g, 12, 7, 2.5, 2, c); P(g, 6, 7, 3, 1, shade(c, 0.5));
    if (kind === 'salsa') { P(g, 7, 9, 1, 1, '#2a8a2a'); P(g, 10, 10, 1, 1, '#f2e0a0'); }
    if (kind === 'pickle') { P(g, 5, 8, 2, 1, '#e8f4f8'); P(g, 11, 10, 1, 2, '#e8f4f8'); P(g, 8, 10, 3, 1, '#4a7a2a'); }
    if (kind === 'milk') { P(g, 11, 4, 3, 4, '#fff'); P(g, 11, 4, 3, 1, '#2e7de2'); }
  });
}
// tool icons (16x16)
function toolIcon(id) {
  return spr('tool_' + id, 18, 18, g => {
    g.translate(1, 1);
    // 3 tones per material (light, base, shade) + outline, lit from the top left like the rest of the game
    if (id === 'hands') { // work glove
      const w = '#fbfbf5', ws = '#cfcfc4', wh = '#ffffff', r = '#d8342a', rd = '#9a2018', rh = '#f2604e';
      [[4, 3], [6, 1], [8, 1], [10, 2]].forEach(([x, y]) => { P(g, x, y, 2, 8 - y, w); P(g, x + 1, y + 1, 1, 7 - y, ws); P(g, x, y, 1, 1, wh); });
      P(g, 4, 7, 8, 6, w); P(g, 11, 7, 1, 6, ws); P(g, 4, 12, 8, 1, ws); P(g, 5, 8, 2, 2, wh); P(g, 5, 7, 6, 1, ws);
      P(g, 1, 8, 3, 3, w); P(g, 1, 8, 2, 1, wh); P(g, 2, 10, 2, 1, ws);
      P(g, 3, 13, 10, 3, r); P(g, 3, 13, 10, 1, rh); P(g, 3, 15, 10, 1, rd); P(g, 12, 13, 1, 3, rd);
    }
    if (id === 'mop') {
      P(g, 9, 0, 2, 9, '#c89a5a'); P(g, 9, 0, 1, 9, '#e2b97c'); P(g, 10, 0, 1, 9, '#93683a');
      P(g, 5, 8, 10, 2, '#9aa3ad'); P(g, 5, 8, 10, 1, '#d4dae0'); P(g, 5, 9, 10, 1, '#6a7280');
      for (let i = 0; i < 5; i++) { const x = 5 + i * 2, h = i % 2 ? 4 : 5; P(g, x, 10, 2, h, '#ece6d0'); P(g, x + 1, 10, 1, h, '#bfb8a0'); }
      P(g, 2, 12, 1, 2, '#7cc4f0'); P(g, 2, 12, 1, 1, '#d8f0ff'); // a drip
    }
    if (id === 'wrench') {
      const b = '#a8b0ba', hi = '#e4e9ee', lo = '#6a7280';
      disc(g, 3.5, 12.5, 2.8, b); P(g, 2, 10, 2, 1, hi); P(g, 1, 11, 1, 2, hi);
      for (let i = 0; i < 7; i++) { P(g, 4 + i, 10 - i, 2, 2, b); P(g, 4 + i, 10 - i, 1, 1, hi); P(g, 5 + i, 11 - i, 1, 1, lo); }
      disc(g, 12.5, 3.5, 3.3, b); P(g, 10, 1, 2, 1, hi); P(g, 9, 2, 1, 2, hi); P(g, 14, 4, 1, 2, lo); P(g, 12, 6, 2, 1, lo);
      g.clearRect(12, -1, 3, 4); disc(g, 3.5, 12.5, 1, '#3a3f48');
    }
    if (id === 'food') { // fish food tin
      P(g, 3, 4, 10, 11, '#f2c230'); P(g, 3, 4, 2, 11, '#f8dc70'); P(g, 11, 4, 2, 11, '#c8981c'); P(g, 3, 14, 10, 1, '#9a7414');
      P(g, 3, 2, 10, 3, '#e8e8f0'); P(g, 3, 2, 10, 1, '#ffffff'); P(g, 3, 4, 10, 1, '#b8bcc8');
      P(g, 3, 7, 10, 6, '#2e7de2'); P(g, 3, 7, 2, 6, '#5a9cf0'); P(g, 11, 7, 2, 6, '#1f5aae');
      P(g, 5, 9, 4, 2, '#ff8a2a'); P(g, 5, 9, 3, 1, '#ffb060'); P(g, 9, 8, 1, 4, '#ff8a2a'); P(g, 10, 8, 1, 1, '#ff8a2a'); P(g, 10, 11, 1, 1, '#ff8a2a'); P(g, 6, 9, 1, 1, '#1a1a1a');
    }
  }, true);
}
