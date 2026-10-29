// ===== audio: all sounds generated, no files =====
const AU = { ctx: null, master: null, music: null, musicOn: true, sfxOn: true, timer: null, step: 0 };
function auInit() {
  if (AU.ctx) return; try { AU.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
  AU.master = AU.ctx.createGain(); AU.master.gain.value = 0.5; AU.master.connect(AU.ctx.destination);
  AU.music = AU.ctx.createGain(); AU.music.gain.value = 0.14; AU.music.connect(AU.master);
}
function tone(freq, dur, type = 'square', vol = 0.15, when = 0, dest, slide) {
  if (!AU.ctx) return; const t = AU.ctx.currentTime + when; const o = AU.ctx.createOscillator(), g = AU.ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur); o.connect(g); g.connect(dest || AU.master); o.start(t); o.stop(t + dur + 0.02);
}
function noise(dur, vol = 0.1, when = 0) {
  if (!AU.ctx) return; const t = AU.ctx.currentTime + when; const b = AU.ctx.createBuffer(1, Math.floor(AU.ctx.sampleRate * dur), AU.ctx.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const s = AU.ctx.createBufferSource(), g = AU.ctx.createGain(); s.buffer = b; g.gain.value = vol; s.connect(g); g.connect(AU.master); s.start(t);
}
const SFX = {
  pick() { tone(440, 0.07, 'square', 0.1); tone(660, 0.08, 'square', 0.1, 0.06); },
  stock() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.09, 'square', 0.09, i * 0.05)); },
  cash() { tone(1318, 0.08, 'square', 0.08); tone(1760, 0.2, 'square', 0.08, 0.07); },
  scan() { tone(1500, 0.05, 'square', 0.06); },
  mop() { noise(0.12, 0.08); },
  clank() { tone(220, 0.08, 'triangle', 0.18); tone(180, 0.1, 'square', 0.06, 0.03); },
  bump() { tone(120, 0.08, 'triangle', 0.2, 0, null, 70); },
  err() { tone(180, 0.15, 'square', 0.08); tone(140, 0.2, 'square', 0.08, 0.1); },
  talk() { tone(500 + Math.random() * 300, 0.03, 'square', 0.04); },
  feed() { [300, 380, 460].forEach((f, i) => tone(f, 0.06, 'triangle', 0.12, i * 0.04)); },
  alarm() { tone(880, 0.15, 'square', 0.07); tone(660, 0.15, 'square', 0.07, 0.17); },
  good() { [392, 523, 659, 784].forEach((f, i) => tone(f, 0.12, 'triangle', 0.14, i * 0.08)); },
  elvis() { const m = [196, 247, 294, 330, 294, 247, 294, 392, 370, 330, 294, 247]; m.forEach((f, i) => { tone(f, 0.22, 'square', 0.07, i * 0.25); tone(f / 2, 0.22, 'triangle', 0.12, i * 0.25); }); },
  pour() { noise(0.3, 0.04); tone(900, 0.25, 'sine', 0.05, 0, null, 500); },
};
function sfx(n) { if (!AU.sfxOn || !AU.ctx) return; try { if (AU.started && AU.musicOn && MUSIC.sting(n === 'cash' ? 'cash' : n)) return; if (SFX[n]) SFX[n](); } catch (e) { } }
function musicStart() {
  if (!AU.ctx || AU.started) return; AU.started = true; AU.music.gain.value = 1; MUSIC.init(AU.ctx, AU.music); MUSIC.setVolume(0.55); MUSIC.start();
}
// which song each department plays (music.js SONGS); anything not listed plays 'market'.
// three key families: middle = C, west international wing = G, north-east wine/cheese wing = F (when the day is in C).
// tests/mzone.py checks every pair of departments you can walk between is at most one note apart.
const ZONE_SONG = {
  produce: 'fresh', natural: 'fresh', bakery: 'counter', meat: 'counter', frozen: 'frozen', candy: 'candy', toys: 'candy', gacha: 'candy', cards: 'candy',
  europe: 'europe', eurosouth: 'europe', intlproduce: 'europe', deck: 'europe', asia: 'asia', livefish: 'asia', americas: 'americas', gigante: 'americas',
  hotsauce: 'hot', intl: 'souk', seafood: 'harbor', honey: 'herb', herb: 'herb', tiktok: 'viral',
  wine: 'lounge', liquor: 'lounge', cigars: 'lounge', tasting: 'lounge', cheese: 'bistro', tenants: 'bistro', deli: 'bistro', beer: 'beerhall', sushi: 'sushi',
};
const zoneSong = id => ZONE_SONG[id] || 'market';
function musicTick() { // pick the song from where you are; music.js gets there on the beat
  if (!AU.started) return; AU.music.gain.value = AU.musicOn && !document.hidden ? 1 : 0;
  let s = 'market'; const moods = [];
  if (RT.menu === 'title') s = 'title';
  else if (RT.menu && !['map', 'quests', 'goal'].includes(RT.menu)) s = 'menu';
  else if (RT.sleeping) s = 'sleep';
  else {
    const m = ST.minute, tx = Math.floor(PL.x / T), ty = Math.floor((PL.y - 3) / T), zi = inb(tx, ty) ? W.zone[idx(tx, ty)] : -1, dz = zi >= 0 ? DEPTS[zi].id : null;
    const outdoor = inb(tx, ty) && W.outdoor[idx(tx, ty)], stock = tx >= W.stockRect[0] && tx <= W.stockRect[2] && ty >= W.stockRect[1] && ty <= W.stockRect[3];
    // a department takes over after ~1.2 s inside it, so skating past a corner can't flip the song.
    // the open floor between departments keeps the last one. walking in from another place picks it up at once.
    const wasStore = MUSIC.SONGS[AU.sit] && MUSIC.SONGS[AU.sit].place === 'store';
    if (dz && dz !== AU.cand) { AU.cand = dz; AU.candN = 0; } else if (dz) AU.candN++;
    if (dz && (AU.candN >= 3 || !wasStore || !AU.zone)) AU.zone = zoneSong(dz);
    if (m >= CLOSE_MIN || m < DAY_START + 30) s = 'night';
    else if (stock) s = 'stock';
    else if (outdoor) s = ST.weather === 'rain' ? 'rain' : 'outside';
    else s = AU.zone || 'market';
    if (RT.dayT < 40) moods.push('morning'); // the store just opened
    if (ST.weather === 'rain') moods.push('rain');
    if (eventToday()) moods.push('fest');
    if (RT.custs.length > 30) moods.push('busy');
    if (PL.onCash) moods.push('checkout');
  }
  MUSIC.set(s, moods); AU.sit = s;
}
