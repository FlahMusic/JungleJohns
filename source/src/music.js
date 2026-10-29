// ===== situational music: lifted from Slimehedron (c) FlahMusic; same owner, so it's under this game's LICENSE.txt =====
// Reused from Slimehedron: the rep()/bars() step format, the kit patterns, KITVOICE roles, the padKeeps()
// "simple <-> complex" thinning rule, KITFEEL humanize amounts, CHORD_FN.major chord odds, the one-fifth
// key journey, and the pluck() voice design. Drum patterns in pop/bossa/jazz were derived from
// casio-music-data (Nicholas Opuni) and muted.io; see Slimehedron's THIRD-PARTY.md for credit.
const MUSIC = (() => {
  const rep = (base, n) => { const o = []; for (let b = 0; b < n; b++) for (const s of base) o.push(s + 16 * b); return o; };
  const bars = (...b) => { const o = []; b.forEach((st, i) => st.forEach(x => o.push(x + 16 * i))); return o; };
  const KITS = {
    chip: { K: rep([0, 8], 4), s: rep([4, 12], 4), h: rep([0, 2, 4, 6, 8, 10, 12, 14], 4) },
    bossa: { K: rep([0, 6, 8, 14], 4), h: rep([0, 2, 4, 6, 8, 10, 12, 14], 4), cl: rep([0, 3, 6, 10, 13], 4) },
    pop: { K: rep([0, 6, 10], 4), s: bars([4, 12], [4, 12], [4, 12], [4, 10, 12]), h: bars([0, 2, 4, 6, 8, 10, 12, 14], [0, 2, 4, 6, 8, 10, 12, 15], [0, 2, 4, 6, 8, 10, 12, 14], [0, 2, 4, 6, 8, 10, 12]) },
    march: { K: rep([0, 8], 4), s: rep([4, 6, 12, 14, 15], 4), h: rep([0, 4, 8, 12], 4) },
    conga: { K: rep([0, 8], 4), r: rep([4, 12], 4), c: rep([2, 7, 11], 4), C: rep([3, 6, 14], 4) },
    samba: { K: rep([0, 8], 4), c: rep([2, 6, 10, 14], 4), C: rep([3, 7, 11, 15], 4), r: rep([0, 3, 6, 10, 12], 4), h: rep([0, 2, 4, 6, 8, 10, 12, 14], 4) },
    jazz: { y: rep([0, 4, 6, 8, 12, 14], 4), h: rep([4, 12], 4), K: bars([0], [], [0], [10]), s: bars([], [14], [6], [10, 14]) },
  };
  const KITVOICE = { chip: { lo: 'K', mid: 's', hi: 'h' }, bossa: { lo: 'K', mid: 'r', hi: 'h' }, pop: { lo: 'K', mid: 's', hi: 'h' }, march: { lo: 'K', mid: 's', hi: 'h' }, conga: { lo: 'K', mid: 'C', hi: 'h' }, samba: { lo: 'K', mid: 'r', hi: 'h' }, jazz: { lo: 'K', mid: 's', hi: 'y' } };
  const FEEL = { pop: { dyn: .35, time: .25, sw16: 0, sw8: 0 }, bossa: { dyn: .5, time: .45, sw16: .18, sw8: 0 }, jazz: { dyn: .6, time: .5, sw8: .85, sw16: 0 } };
  const CHORD_NEXT = { use: [1, 0.6, 0.3, 1, 1, 0.85, 0.08], next: { 1: { 4: 1.8 }, 2: { 3: 1.7, 5: 1.7 }, 3: { 0: 1.3, 4: 1.4 }, 4: { 0: 1.8, 5: 1.3 }, 5: { 3: 1.4, 1: 1.3 } } };
  const SCALES = { major: [0, 2, 4, 5, 7, 9, 11], lydian: [0, 2, 4, 6, 7, 9, 11], dorian: [0, 2, 3, 5, 7, 9, 10], mixolydian: [0, 2, 4, 5, 7, 9, 10], minor: [0, 2, 3, 5, 7, 8, 10] };
  const PENT = [0, 1, 2, 4, 5]; // scale degrees of the major pentatonic inside a 7-note major scale
  // situations = bundles of knobs. tempos, meters, modes and the accordion/tuba/flute palette come from
  // measuring 11 Harvest Moon (SNES) fan MIDI transcriptions: 95-180 bpm, mostly major, waltzes in 3/4,
  // fall/winter in minor, 5-10 lead notes a bar, 4-10 voices. key: semitones from the day's root.
  const SIT = {
    title:    { kit: 'bossa', bpm: 120, meter: 4, key: 0, scale: 'major', lead: 'accordion', bassV: 'tuba', dens: 3, x: 0.25, drums: 0.5, comp: 0, pad: 0.6, bass: 1 },
    prep:     { kit: null, bpm: 108, meter: 3, key: 0, scale: 'major', lead: 'flute', bassV: 'tuba', dens: 2, x: 0, drums: 0, comp: 0, pad: 0.7, bass: 1 },
    day:      { kit: 'pop', bpm: 120, meter: 4, key: 0, scale: 'major', lead: 'accordion', bassV: 'tuba', dens: 3, x: 0.28, drums: 0.5, comp: 4, pad: 0.5, bass: 1 },
    busy:     { kit: 'pop', bpm: 126, meter: 4, key: 0, scale: 'major', lead: 'accordion', bassV: 'tuba', dens: 4, x: 0.4, drums: 0.6, comp: 2, pad: 0.5, bass: 1 },
    lounge:   { kit: 'jazz', bpm: 96, meter: 4, key: 2, scale: 'dorian', lead: 'flute', bassV: 'pluck', dens: 2, x: 0.3, drums: 0.45, comp: 4, pad: 0.7, bass: 1 },
    candy:    { kit: 'chip', bpm: 132, meter: 4, key: 7, scale: 'major', lead: 'square', bassV: 'tuba', dens: 4, x: 0.35, drums: 0.5, comp: 2, pad: 0.4, bass: 1 },
    checkout: { kit: 'chip', bpm: 120, meter: 4, key: 7, scale: 'mixolydian', lead: 'pluck', bassV: 'tuba', dens: 3, x: 0.3, drums: 0.5, comp: 2, pad: 0.5, bass: 1 },
    stock:    { kit: 'march', bpm: 110, meter: 4, key: 0, scale: 'major', lead: 'pluck', bassV: 'tuba', dens: 2, x: 0.12, drums: 0.4, comp: 0, pad: 0.5, bass: 1 },
    outside:  { kit: 'conga', bpm: 116, meter: 4, key: 5, scale: 'major', lead: 'flute', bassV: 'tuba', dens: 3, x: 0.3, drums: 0.5, comp: 0, pad: 0.6, bass: 1 },
    rain:     { kit: null, bpm: 92, meter: 3, key: -3, scale: 'minor', lead: 'flute', bassV: 'pluck', dens: 2, x: 0, drums: 0, comp: 0, pad: 0.9, bass: 1 },
    fest:     { kit: 'samba', bpm: 132, meter: 4, key: 0, scale: 'major', lead: 'accordion', bassV: 'tuba', dens: 5, x: 0.45, drums: 0.6, comp: 2, pad: 0.5, bass: 1 },
    night:    { kit: null, bpm: 80, meter: 3, key: 5, scale: 'lydian', lead: 'flute', bassV: 'pluck', dens: 1, x: 0, drums: 0, comp: 0, pad: 0.8, bass: 0.7 },
    menu:     { kit: null, bpm: 100, meter: 4, key: 0, scale: 'major', lead: null, bassV: 'pluck', dens: 0, x: 0, drums: 0, comp: 0, pad: 0.7, bass: 1 },
    sleep:    { kit: null, bpm: 70, meter: 3, key: 5, scale: 'lydian', lead: 'flute', bassV: null, dens: 0.5, x: 0, drums: 0, comp: 0, pad: 0.6, bass: 0 },
  };
  const M = { ctx: null, out: null, bus: null, echo: null, running: false, cur: 'title', want: 'title', p: SIT.title, root: 57, step: 0, next: 0, chord: 0, timer: null, voices: [], log: null, vol: 0.5, noise: null, lastMel: 0 };

  function init(ctx, dest) {
    M.ctx = ctx; M.out = ctx.createGain(); M.out.gain.value = M.vol;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 6000; lp.Q.value = 0.5; // soft SNES-ish top end
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.attack.value = 0.005; comp.release.value = 0.2;
    M.bus = ctx.createGain(); M.bus.gain.value = 0.8; M.bus.connect(lp); lp.connect(comp); comp.connect(M.out); M.out.connect(dest);
    // echo on the melody, darker each repeat
    const d = ctx.createDelay(1.5), fb = ctx.createGain(), elp = ctx.createBiquadFilter(), wet = ctx.createGain(); elp.type = 'lowpass'; elp.frequency.value = 2200; fb.gain.value = 0.32; wet.gain.value = 0.35;
    M.echo = ctx.createGain(); M.echo.connect(d); d.connect(elp); elp.connect(fb); fb.connect(d); elp.connect(wet); wet.connect(M.bus); M.delay = d;
    const b = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate), a = b.getChannelData(0); for (let i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1; M.noise = b;
    setTempo();
  }
  const sd = () => 60 / M.p.bpm / 4; // one 16th in seconds
  function setTempo() { M.delay.delayTime.value = Math.min(1.4, sd() * 6); }
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  function scale() { return SCALES[M.p.scale] || SCALES.major; }
  function degNote(deg, oct) { const s = scale(), n = s.length; const o = Math.floor(deg / n); return M.root + (M.p.key || 0) + 12 * (oct + o) + s[((deg % n) + n) % n]; }
  // 8 voice cap: drums and tones share it, like the real chip
  function grab(t, dur, lim = 6) { M.voices = M.voices.filter(e => e > t); if (M.voices.length >= lim) return false; M.voices.push(t + dur); if (M.log) M.log.maxV = Math.max(M.log.maxV, M.voices.length); return true; }
  function note(kind, t, dur) { if (M.log) { M.log.n++; M.log.kinds[kind] = (M.log.kinds[kind] || 0) + 1; } }

  // ---- voices ----
  function tone(m, t, dur, vel, type, dest, att = 0.01, filt, lim) {
    if (!grab(t, dur, lim)) return; const c = M.ctx, o = c.createOscillator(), g = c.createGain(), lp = c.createBiquadFilter();
    o.type = type; o.frequency.value = mtof(m); lp.type = 'lowpass'; lp.frequency.value = filt || Math.min(9000, mtof(m) * 6);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel, t + att); g.gain.exponentialRampToValueAtTime(0.0005, t + dur);
    o.connect(lp); lp.connect(g); g.connect(dest || M.bus); o.start(t); o.stop(t + dur + 0.05);
  }
  function pluck(m, t, vel) { // Slimehedron's comp voice: triangle body + a whisper of square, pitch-tracked filter that closes fast
    if (!grab(t, 0.3)) return; const c = M.ctx, o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain(), lp = c.createBiquadFilter(), f0 = mtof(m);
    o.type = 'triangle'; o2.type = 'square'; o2.detune.value = 6; o.frequency.value = o2.frequency.value = f0; const g2 = c.createGain(); g2.gain.value = 0.12;
    lp.type = 'lowpass'; lp.frequency.setValueAtTime(Math.max(1400, Math.min(9000, f0 * 8 * (0.55 + 0.75 * vel))), t); lp.frequency.exponentialRampToValueAtTime(Math.max(420, f0 * 1.6), t + 0.25);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.09 * vel, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0005, t + 0.3);
    o.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(g); g.connect(M.bus); o.start(t); o2.start(t); o.stop(t + 0.35); o2.stop(t + 0.35);
  }
  function lead(kind, m, t, dur, vel) { // the palette measured in those MIDIs: accordion (GM 21), flute/piccolo (72), pizz pluck (45), plus chip square
    if (kind === 'pluck') return pluck(m, t, vel);
    if (!grab(t, dur, 8)) return; const c = M.ctx, g = c.createGain(), lp = c.createBiquadFilter(), f0 = mtof(m); lp.type = 'lowpass';
    const oscs = []; const add = (type, det, lvl) => { const o = c.createOscillator(), og = c.createGain(); o.type = type; o.frequency.value = f0; o.detune.value = det; og.gain.value = lvl; o.connect(og); og.connect(lp); oscs.push(o); return o; };
    let att = 0.015, rel = dur;
    if (kind === 'accordion') { add('square', -7, 0.5); add('square', 7, 0.5); add('sawtooth', 0, 0.25); lp.frequency.value = Math.min(3400, f0 * 4); att = 0.03; }
    else if (kind === 'flute') { add('sine', 0, 1); add('triangle', 0, 0.3); lp.frequency.value = 5000; att = 0.05; }
    else { add('square', 0, 1); lp.frequency.value = 4200; att = 0.004; }
    const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = kind === 'flute' ? 5 : 5.8; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(kind === 'square' ? 0 : 7, t + 0.18); lfo.connect(lg); oscs.forEach(o => lg.connect(o.detune));
    const peak = vel * (kind === 'accordion' ? 0.06 : kind === 'flute' ? 0.1 : 0.05);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + att); g.gain.setValueAtTime(peak * 0.85, t + Math.max(att, rel - 0.06)); g.gain.exponentialRampToValueAtTime(0.0005, t + rel + 0.12);
    lp.connect(g); g.connect(M.bus); const ge = c.createGain(); ge.gain.value = 0.5; g.connect(ge); ge.connect(M.echo);
    oscs.forEach(o => { o.start(t); o.stop(t + rel + 0.15); }); lfo.start(t); lfo.stop(t + rel + 0.15);
  }
  function tuba(m, t, dur, vel) { if (!grab(t, dur)) return; const c = M.ctx, o = c.createOscillator(), lp = c.createBiquadFilter(), g = c.createGain(); o.type = 'sawtooth'; o.frequency.value = mtof(m); lp.type = 'lowpass'; lp.frequency.setValueAtTime(700, t); lp.frequency.exponentialRampToValueAtTime(320, t + dur); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.14 * vel, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0005, t + dur); o.connect(lp); lp.connect(g); g.connect(M.bus); o.start(t); o.stop(t + dur + 0.05); }
  function noiseHit(t, type, f, q, lvl, dur) { if (!grab(t, dur)) return; const c = M.ctx, s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(); s.buffer = M.noise; fl.type = type; fl.frequency.value = f; fl.Q.value = q; g.gain.setValueAtTime(lvl, t); g.gain.exponentialRampToValueAtTime(0.0005, t + dur); s.connect(fl); fl.connect(g); g.connect(M.bus); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02); }
  function drum(v, t, a) { // trimmed versions of Slimehedron's dHit voices
    const c = M.ctx, lvl = a * M.p.drums; t = Math.max(c.currentTime, t);
    if (v === 'K') { if (!grab(t, 0.3)) return; const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.1); g.gain.setValueAtTime(0.7 * lvl, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.28); o.connect(g); g.connect(M.bus); o.start(t); o.stop(t + 0.3); }
    else if (v === 's') { noiseHit(t, 'bandpass', 1900, 1.1, 0.28 * lvl, 0.12); tone(46, t, 0.08, 0.12 * lvl, 'triangle'); }
    else if (v === 'h') noiseHit(t, 'highpass', 8000, 0.7, 0.09 * lvl, 0.03);
    else if (v === 'y') noiseHit(t, 'highpass', 6000, 0.5, 0.07 * lvl, 0.25);
    else if (v === 'r') noiseHit(t, 'bandpass', 2100, 2.4, 0.22 * lvl, 0.028);
    else if (v === 'cl') { if (!grab(t, 0.06)) return; const o = c.createOscillator(), g = c.createGain(); o.type = 'triangle'; o.frequency.value = 2500; g.gain.setValueAtTime(0.16 * lvl, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.05); o.connect(g); g.connect(M.bus); o.start(t); o.stop(t + 0.07); }
    else if (v === 'c' || v === 'C') { if (!grab(t, 0.2)) return; const o = c.createOscillator(), g = c.createGain(), f0 = v === 'C' ? 300 : 210; o.type = 'triangle'; o.frequency.setValueAtTime(f0 * 1.18, t); o.frequency.exponentialRampToValueAtTime(f0 * 0.68, t + 0.1); g.gain.setValueAtTime(0.4 * lvl, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.17); o.connect(g); g.connect(M.bus); o.start(t); o.stop(t + 0.2); }
    note('drum');
  }
  // padKeeps from Slimehedron: below 0.5, thin from the outside in; kick on 1&3 and the backbeat always survive
  function keeps(v, inBar) {
    const x = M.p.x; if (x >= 0.5) return true; const keep = x * 2, vm = KITVOICE[M.p.kit] || {};
    if (v === vm.lo && (inBar === 0 || inBar === 8)) return true;
    if (v === vm.mid && (inBar === 4 || inBar === 12)) return true;
    if (v === vm.hi) return (inBar % 4 === 0) || keep > 0.45;
    return keep > 0.3;
  }
  // ---- chord brain (CHORD_FN.major odds) ----
  function nextChord() {
    const cur = M.chord, bias = CHORD_NEXT.next[cur] || {}; let tot = 0; const w = CHORD_NEXT.use.map((u, d) => { const v = d === cur ? 0 : u * (bias[d] || 1); tot += v; return v; });
    let r = Math.random() * tot; for (let d = 0; d < 7; d++) { r -= w[d]; if (r <= 0) return d; } return 0;
  }
  // ---- the conductor: one grid, scheduled ahead ----
  function newMotif() { // a 2-bar rhythm + contour; replayed with variations so it evolves but stays a tune
    const P = M.p, len = P.meter * 4 * 2, n = Math.max(1, Math.round(P.dens * 2)); const grid = []; for (let k = 0; k < len; k += 2) grid.push(k);
    const pos = grid.sort(() => Math.random() - 0.5).slice(0, Math.min(grid.length, n)).sort((a2, b2) => a2 - b2); if (!pos.includes(0) && Math.random() < 0.7) pos[0] = 0;
    const steps = pos.map(() => [-2, -1, -1, 1, 1, 2, 0][Math.floor(Math.random() * 7)]); M.motif = { pos, steps, len };
  }
  function stepAt(i, t) {
    if (M.barLen === undefined || i >= M.barStart + M.barLen || i < M.barStart) { // a bar line
      M.barStart = i; M.bar = (M.bar || 0) + 1;
      if (M.want !== M.cur) { M.cur = M.want; M.p = SIT[M.cur]; setTempo(); M.motif = null; M.bar = 0; } // changes land on the bar line only
      M.barLen = M.p.meter * 4; const slow = M.p.bpm < 95 || M.p.meter === 3;
      if (M.bar % 2 === 0 || slow) M.chord = M.bar % 8 === 0 ? 0 : nextChord();
      if (!M.motif || M.bar % 8 === 0) newMotif();
    }
    const P = M.p, inBar = i - M.barStart, bar = M.bar, sixteenth = sd(), ch = M.chord, beat = 4, bl = M.barLen;
    const feel = FEEL[P.kit] || FEEL.pop; let tt = t; if (feel.sw8 && inBar % 4 === 2) tt += feel.sw8 * 0.667 * sixteenth; if (feel.sw16 && inBar % 2 === 1) tt += feel.sw16 * 0.333 * sixteenth;
    const slow = P.bpm < 95 || P.meter === 3;
    if (inBar === 0 && P.pad > 0 && (bar % 2 === 0 || slow)) { const len = sixteenth * bl * (slow ? 1 : 2) - 0.05; [0, 2, 4].forEach((k, j) => tone(degNote(ch + k, 0), t, len, 0.04 * P.pad, j ? 'sine' : 'triangle', null, 0.4, 1800)); note('pad'); }
    // bass: oom-pah. 4/4 = root on 1, fifth on 3. 3/4 = root on 1, chord stabs on 2 and 3 (waltz)
    if (P.bass > 0 && P.bassV) {
      const hit = (deg, len) => { const m = degNote(ch + deg, -2); if (P.bassV === 'tuba') tuba(m, t, len, P.bass); else tone(m, t, len, 0.16 * P.bass, 'triangle', null, 0.008, 900); note('bass'); };
      if (P.meter === 4 && (inBar === 0 || inBar === 8)) hit(inBar === 8 ? 4 : 0, sixteenth * 3);
      if (P.meter === 3) { if (inBar === 0) hit(0, sixteenth * 3); else if ((inBar === 4 || inBar === 8) && P.comp !== -1) { [2, 4].forEach(k => pluck(degNote(ch + k, 0), tt, 0.45)); note('comp'); } }
    }
    if (P.comp > 0 && P.meter === 4 && bar % P.comp === P.comp - 1 && (inBar === 6 || inBar === 14)) { [0, 2, 4].forEach(k => pluck(degNote(ch + k, 0), tt, 0.7)); note('comp'); }
    // drums (4/4 kits), or a soft waltz tick in 3/4
    if (P.kit && P.drums > 0) {
      if (P.meter === 4) { const kit = KITS[P.kit], pos = (bar % 4) * 16 + inBar; for (const v in kit) if (kit[v].includes(pos) && keeps(v, inBar)) { const hum = 1 + (Math.random() - 0.5) * (feel.dyn || 0.3) * 0.6; drum(v, tt + (Math.random() - 0.5) * (feel.time || 0.2) * 0.008, (inBar % 4 === 0 ? 1 : 0.75) * hum); } }
      else { if (inBar === 0) drum('K', tt, 0.8); else if (inBar % 4 === 0) drum('h', tt, 0.7); }
    }
    // lead: the motif, played over 2 bars, re-fitted to the current chord, rested every 4th pair of bars
    if (P.lead && M.motif && Math.floor(bar / 2) % 4 !== 3) {
      const mo = M.motif, local = (bar % 2) * bl + inBar, k = mo.pos.indexOf(local);
      if (k >= 0) {
        let d = M.lastMel === undefined ? ch + 4 : M.lastMel; d += mo.steps[k] + (bar % 8 >= 4 && k === mo.pos.length - 1 ? 1 : 0);
        if (local % beat === 0) { const tones = [ch, ch + 2, ch + 4, ch + 7]; d = tones.reduce((a2, b2) => Math.abs(b2 - d) < Math.abs(a2 - d) ? b2 : a2); } // on the beat: land on a chord tone
        d = Math.max(-1, Math.min(10, d)); M.lastMel = d;
        const nxt = mo.pos[k + 1] !== undefined ? mo.pos[k + 1] : mo.len; const len = Math.min(sixteenth * (nxt - local), sixteenth * 6);
        lead(P.lead, degNote(d, 1), tt, Math.max(len - 0.02, 0.08), 0.9); note('mel');
      }
    }
  }
  function scheduleUntil(tEnd) { while (M.next < tEnd) { stepAt(M.step, M.next); M.step++; M.next += sd(); } }
  function tick() {
    if (!M.running) return; const now = M.ctx.currentTime;
    if (M.next < now - 0.05) { M.barLen = undefined; M.next = now + 0.05; } // tab was hidden: rejoin on a fresh bar, no burst
    scheduleUntil(now + 0.15);
  }
  return {
    SIT, M,
    init, scheduleUntil,
    start() { if (!M.ctx || M.running) return; M.running = true; M.step = 0; M.next = M.ctx.currentTime + 0.1; M.timer = setInterval(tick, 25); },
    stop() { M.running = false; clearInterval(M.timer); },
    setSituation(n) { if (SIT[n]) M.want = n; },
    setDay(day) { let r = 57 + ((day - 1) * 7) % 12; while (r > 62) r -= 12; while (r < 52) r += 12; M.root = r; }, // one fifth further round the circle each day
    setVolume(v) { M.vol = v; if (M.out) M.out.gain.value = v; },
    sting(name) { // short cue on the next 16th, in key
      if (!M.ctx || !M.running) return false; const t = Math.max(M.ctx.currentTime + 0.01, M.next), s = sd(), c = M.chord;
      const seq = { cash: [4, 7, 9], stock: [0, 2, 4, 7], pick: [2, 4], good: [0, 2, 4, 7, 9], feed: [4, 2, 4], help: [7, 9, 11] }[name]; if (!seq) return false;
      seq.forEach((d, k) => tone(degNote(c + d, 1), t + k * s * 0.5, 0.18, 0.09, 'square', M.bus, 0.004, 3200, 8)); return true;
    },
  };
})();
