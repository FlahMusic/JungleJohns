// ===== 3x5 pixel font so world text sits on the same pixel grid as the art =====
const GLYPH = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101', I: '111010010010111',
  J: '001001001101010', K: '101101110101101', L: '100100100100111', M: '1000111011101011000110001', N: '10011101101110011001', O: '010101101101010', P: '110101110100100', Q: '010101101110011', R: '110101110101101',
  S: '011100010001110', T: '111010010010010', U: '101101101101111', V: '101101101101010', W: '1000110001101011101110001', X: '101101010101101', Y: '101101010010010', Z: '111001010100111',
  0: '111101101101111', 1: '010110010010111', 2: '110001010100111', 3: '110001010001110', 4: '101101111001001', 5: '111100110001110', 6: '011100111101111', 7: '111001010010010', 8: '111101111101111', 9: '111101111001110',
  ' ': '000000000000000', '.': '000000000000010', ',': '000000000010100', ':': '000010000010000', '!': '010010010000010', '?': '110001010000010', "'": '010010000000000', '&': '010101010101011', '-': '000000111000000',
  '+': '000010111010000', '$': '011110010011110', '/': '001001010100100', '%': '101001010100101', '(': '010100100100010', ')': '010001001001010', '#': '101111101111101',
};
function glyphW(ch) { const g = GLYPH[ch] || GLYPH['?']; return g.length / 5; }
function pxTextW(s) { s = s.toUpperCase(); let w = 0; for (const ch of s) w += glyphW(ch) + 1; return Math.max(0, w - 1); }
function pxText(g, s, x, y, col) { s = s.toUpperCase(); g.fillStyle = col; for (const ch of s) { const gl = GLYPH[ch] || GLYPH['?'], w = gl.length / 5; for (let r = 0; r < 5; r++) for (let c = 0; c < w; c++) if (gl[r * w + c] === '1') g.fillRect(x + c, y + r, 1, 1); x += w + 1; } }
// a painted hanging sign, pixel art
function signSprite(text, style) {
  return spr('sign_' + style + '_' + text, pxTextW(text) + 12, 15, g => {
    const w = pxTextW(text) + 12;
    const [bd, face, hi, txt] = { open: ['#1d4a26', '#2e7d3b', '#4aa858', '#ffe14d'], low: ['#6a1a14', '#b0301e', '#e05a3a', '#ffffff'], dark: ['#26262c', '#3c3c46', '#5a5a66', '#f2f2f2'], locked: ['#5a4020', '#8a6a3a', '#b08c56', '#fff4d6'] }[style];
    P(g, 3, 0, 1, 3, '#6a6f78'); P(g, w - 4, 0, 1, 3, '#6a6f78');
    P(g, 0, 3, w, 12, '#2a1d22'); P(g, 1, 4, w - 2, 10, bd); P(g, 1, 4, w - 2, 9, face); P(g, 1, 4, w - 2, 1, hi); P(g, 2, 5, 1, 1, '#f2c81c'); P(g, w - 3, 5, 1, 1, '#f2c81c');
    pxText(g, text, 6, 8, '#2a1d22'); pxText(g, text, 6, 7, txt);
  });
}
function tagSprite(text) { return spr('tag_' + text, pxTextW(text) + 4, 8, g => { const w = pxTextW(text) + 4; P(g, 0, 0, w, 8, '#2a1d22'); P(g, 1, 1, w - 2, 6, '#3a2e30'); pxText(g, text, 2, 1, '#fff4d6'); }); }
function floatSprite(text, col) { return spr('fl_' + col + text, pxTextW(text) + 2, 7, g => { pxText(g, text, 1, 2, '#2a1d22'); pxText(g, text, 2, 1, '#2a1d22'); pxText(g, text, 1, 1, col); }); }

// ===== the boss: original design, built for skating =====
// pose: idle | glide | pushL | pushR | brake | walkL | walkR. dir: down | up | side. shoes: skates off
const BOSS = { skin: '#f2c49a', hair: '#3a2414', shirt: '#2e9a4a', leaf: '#f2d23a', shorts: '#2a4a8a', boot: '#f6f6f2', stripe: '#e2342a', wheel: '#ffb21c', pad: '#e2342a', sole: '#3a3a40' };
function bossSprite(dir, pose, carry, wheelF, shoes) {
  return spr(`boss_${dir}_${pose}_${carry ? 1 : 0}_${wheelF}_${shoes ? 1 : 0}`, 20, 31, g => {
    g.translate(2, 4); const B = BOSS, sk = B.skin, sd = shade(sk, -0.18);
    const crouch = pose === 'glide' || pose === 'brake' ? 1 : 0; const lean = dir === 'side' && pose !== 'idle' && !shoes ? 1 : 0;
    const wcol = wheelF ? B.wheel : shade(B.wheel, -0.25);
    const skate = shoes ? (x, y, w) => { P(g, x, y, w, 2, B.boot); P(g, x, y + 1, w, 1, B.stripe); P(g, x, y + 2, w, 1, B.sole); }
      : (x, y, w) => { P(g, x, y, w, 2, B.boot); P(g, x, y + 1, w, 1, B.stripe); P(g, x, y + 2, 1, 1, wcol); P(g, x + w - 1, y + 2, 1, 1, wcol); if (w > 3) P(g, x + 1, y + 2, w - 2, 1, '#6a6f78'); };
    // legs + skates (or sneakers)
    if (pose === 'walkL' || pose === 'walkR') {
      const L = pose === 'walkL';
      if (dir === 'side') { if (L) { P(g, 3, 17, 3, 3, B.shorts); P(g, 3, 20, 3, 1, B.pad); skate(2, 21, 4); P(g, 8, 17, 3, 3, B.shorts); P(g, 8, 20, 3, 1, B.pad); skate(8, 21, 4); } else { P(g, 5, 17, 5, 3, B.shorts); P(g, 6, 20, 3, 1, B.pad); skate(5, 21, 5); } }
      else { const l = L ? 1 : 0, r = 1 - l; P(g, 4, 17, 3, 3 - l, B.shorts); P(g, 4, 20 - l, 3, 1, B.pad); skate(3, 21 - l, 4); P(g, 9, 17, 3, 3 - r, B.shorts); P(g, 9, 20 - r, 3, 1, B.pad); skate(9, 21 - r, 4); }
    }
    else if (pose === 'brake') { if (dir === 'side') { P(g, 2, 18, 4, 3, B.shorts); P(g, 1, 20, 3, 1, B.pad); skate(-2, 21, 6); P(g, 8, 18, 3, 3, B.shorts); P(g, 8, 20, 3, 1, B.pad); skate(8, 21, 3); } else { P(g, 4, 18, 3, 3, B.shorts); P(g, 9, 18, 3, 3, B.shorts); P(g, 4, 20, 3, 1, B.pad); P(g, 9, 20, 3, 1, B.pad); skate(2, 21, 5); skate(10, 21, 3); } }
    else if (dir === 'side') {
      if (pose === 'pushL' || pose === 'pushR') { P(g, 3, 17, 3, 3, B.shorts); P(g, 2, 19, 2, 2, sk); P(g, 1, 20, 2, 1, B.pad); skate(-1, 21, 5); P(g, 7, 17, 3, 4, B.shorts); P(g, 8, 20, 2, 1, B.pad); P(g, 8, 21, 2, 1, sk); skate(7, 21, 5); }
      else { P(g, 5, 17 + crouch, 5, 3, B.shorts); P(g, 6, 20, 3, 1, B.pad); skate(4, 21, 7); }
    } else {
      if (pose === 'pushL') { P(g, 2, 17, 3, 3, B.shorts); P(g, 1, 20, 3, 1, B.pad); skate(-1, 21, 4); P(g, 9, 17, 3, 4, B.shorts); P(g, 9, 20, 3, 1, B.pad); skate(9, 21, 3); }
      else if (pose === 'pushR') { P(g, 4, 17, 3, 4, B.shorts); P(g, 4, 20, 3, 1, B.pad); skate(4, 21, 3); P(g, 11, 17, 3, 3, B.shorts); P(g, 12, 20, 3, 1, B.pad); skate(13, 21, 4); }
      else { P(g, 4, 17 + crouch, 3, 3, B.shorts); P(g, 9, 17 + crouch, 3, 3, B.shorts); P(g, 4, 20, 3, 1, B.pad); P(g, 9, 20, 3, 1, B.pad); skate(3, 21, 4); skate(9, 21, 4); }
    }
    // torso: palm-print shirt
    const ty = 9 + crouch, tx = 3 + lean;
    P(g, tx, ty, 10, 8, B.shirt); P(g, tx, ty, 10, 1, shade(B.shirt, 0.3)); P(g, tx, ty + 7, 10, 1, shade(B.shirt, -0.3));
    for (const [a, b] of [[1, 2], [6, 1], [3, 5], [8, 4], [7, 6]]) { P(g, tx + a, ty + b, 1, 1, B.leaf); P(g, tx + a + 1, ty + b, 1, 1, shade(B.leaf, -0.25)); }
    if (dir === 'down') { P(g, tx + 4, ty, 2, 2, sk); P(g, tx + 6, ty + 2, 2, 2, '#fff'); P(g, tx + 6, ty + 2, 2, 1, '#e2342a'); }
    // arms: out for balance when gliding, swinging when pushing, up when carrying
    if (carry) { if (dir === 'side') { P(g, tx + 5, ty - 5, 2, 6, B.shirt); P(g, tx + 5, ty - 6, 2, 1, sk); } else { P(g, tx - 2, ty - 5, 2, 7, B.shirt); P(g, tx + 10, ty - 5, 2, 7, B.shirt); P(g, tx - 2, ty - 6, 2, 1, sk); P(g, tx + 10, ty - 6, 2, 1, sk); } }
    else if (dir === 'side') { const sw = pose === 'pushL' ? -2 : pose === 'pushR' || pose === 'walkL' ? 2 : 0; P(g, tx + 4 + sw, ty + 1, 2, 5, shade(B.shirt, -0.12)); P(g, tx + 4 + sw, ty + 6, 2, 2, sk); }
    else if (pose === 'glide' || pose === 'brake') { P(g, tx - 3, ty + 1, 3, 2, B.shirt); P(g, tx - 5, ty + 1, 2, 2, sk); P(g, tx + 10, ty + 1, 3, 2, B.shirt); P(g, tx + 13, ty + 1, 2, 2, sk); }
    else { const a = pose === 'pushL' || pose === 'walkR' ? 1 : 0, b = pose === 'pushR' || pose === 'walkL' ? 1 : 0; P(g, tx - 1, ty + 1 + a, 1, 5, shade(B.shirt, -0.12)); P(g, tx + 10, ty + 1 + b, 1, 5, shade(B.shirt, -0.12)); P(g, tx - 1, ty + 6 + a, 1, 2, sk); P(g, tx + 10, ty + 6 + b, 1, 2, sk); P(g, tx - 1, ty + 5 + a, 1, 1, '#f2d23a'); P(g, tx + 10, ty + 5 + b, 1, 1, '#f2d23a'); }
    // head
    const hy = crouch, hx = 3 + lean;
    [[2, 6], [1, 8], [0, 10], [0, 10], [0, 10], [0, 10], [0, 10], [1, 8], [2, 6]].forEach(([o, w], i) => P(g, hx + o, hy + i, w, 1, sk));
    if (dir === 'down') {
      P(g, hx + 2, hy + 4, 2, 2, '#2a1b1b'); P(g, hx + 6, hy + 4, 2, 2, '#2a1b1b'); P(g, hx + 2, hy + 4, 1, 1, '#fff'); P(g, hx + 6, hy + 4, 1, 1, '#fff');
      P(g, hx + 3, hy + 7, 4, 1, '#8a3a2a'); P(g, hx + 2, hy + 6, 1, 1, '#8a3a2a'); P(g, hx + 7, hy + 6, 1, 1, '#8a3a2a'); P(g, hx + 1, hy + 6, 1, 1, '#f0a0a0'); P(g, hx + 8, hy + 6, 1, 1, '#f0a0a0');
    } else if (dir === 'side') { P(g, hx + 7, hy + 4, 2, 2, '#2a1b1b'); P(g, hx + 7, hy + 4, 1, 1, '#fff'); P(g, hx + 7, hy + 7, 2, 1, '#8a3a2a'); P(g, hx + 10, hy + 5, 1, 1, sk); P(g, hx + 3, hy + 4, 2, 2, sd); }
    // hair: big curly top, sweatband
    const H = B.hair, hl = shade(H, 0.25);
    if (dir === 'down') { P(g, hx, hy - 2, 10, 3, H); P(g, hx + 1, hy - 3, 8, 1, H); P(g, hx - 1, hy - 1, 1, 4, H); P(g, hx + 10, hy - 1, 1, 4, H); P(g, hx + 2, hy - 3, 2, 1, hl); P(g, hx + 6, hy - 2, 2, 1, hl); P(g, hx, hy + 1, 10, 2, '#f6f6f2'); P(g, hx, hy + 2, 10, 1, '#e2342a'); }
    else if (dir === 'up') { P(g, hx - 1, hy - 2, 12, 8, H); P(g, hx + 1, hy - 3, 8, 1, H); P(g, hx, hy + 6, 10, 2, H); P(g, hx + 3, hy - 2, 3, 1, hl); P(g, hx - 1, hy + 1, 12, 2, '#f6f6f2'); P(g, hx - 1, hy + 2, 12, 1, '#e2342a'); }
    else { P(g, hx - 1, hy - 2, 9, 3, H); P(g, hx, hy - 3, 7, 1, H); P(g, hx - 1, hy + 1, 4, 6, H); P(g, hx + 2, hy - 3, 2, 1, hl); P(g, hx, hy + 1, 10, 2, '#f6f6f2'); P(g, hx, hy + 2, 10, 1, '#e2342a'); }
  }, true);
}
