// ===== world: tiles, objects, pathfinding =====
const W = {
  ground: [], solid: new Uint8Array(MW * MH), cost: new Uint8Array(MW * MH), zone: new Int16Array(MW * MH), wall: new Uint8Array(MW * MH),
  objs: [], objAt: new Map(), fronts: {}, lanes: [], stools: [], pallets: [], spots: {}, parking: [], groundCanvas: null, signs: [], labels: [],
  tanks: [], anims: {}, outdoor: new Uint8Array(MW * MH),
};
const idx = (x, y) => y * MW + x;
const inb = (x, y) => x >= 0 && y >= 0 && x < MW && y < MH;
function isSolid(x, y) { return !inb(x, y) || W.solid[idx(x, y)] === 1; }

function addObj(o) { // o: {type, x, y, w=1, h=1, solid=true, ...}
  o.w = o.w || 1; o.h = o.h || 1; if (o.solid === undefined) o.solid = true;
  W.objs.push(o);
  for (let yy = o.y; yy < o.y + o.h; yy++) for (let xx = o.x; xx < o.x + o.w; xx++) { W.objAt.set(idx(xx, yy), o); if (o.solid) W.solid[idx(xx, yy)] = 1; }
  return o;
}
function deptUnlocked(d, ups) { return !d.lock || ups[d.lock]; }

// building footprint, traced from the Fairfield map (tiles, inclusive)
const FOOT = [[7, 11, 24, 15], [2, 16, 24, 38], [21, 33, 29, 45], [25, 21, 43, 45], [26, 13, 41, 19], [43, 3, 55, 45], [56, 13, 70, 45]];
const STOCK = [26, 13, 41, 19];
function buildWorld(ups) {
  W.ground = new Array(MW * MH).fill('grass'); W.solid.fill(0); W.cost.fill(1); W.zone.fill(-1); W.wall.fill(0); W.outdoor.fill(1);
  W.objs = []; W.objAt = new Map(); W.fronts = {}; W.lanes = []; W.stools = []; W.pallets = []; W.parking = []; W.signs = []; W.labels = []; W.tanks = []; W.anims = {}; W.spots = {}; W.stockRect = STOCK;
  const G = (x, y, k) => { if (inb(x, y)) W.ground[idx(x, y)] = k; };
  const rect = (x0, y0, x1, y1, k) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) G(x, y, k); };
  const wall = (x, y) => { if (!inb(x, y)) return; W.wall[idx(x, y)] = 1; W.solid[idx(x, y)] = 1; W.outdoor[idx(x, y)] = 0; G(x, y, 'wall'); };
  // outdoors
  rect(0, 62, MW - 1, 64, 'road'); rect(0, 47, MW - 1, 48, 'sidewalk'); rect(2, 49, 75, 61, 'asphalt');
  rect(56, 2, 77, 10, 'asphalt'); rect(56, 11, 72, 11, 'sidewalk'); rect(72, 11, 73, 46, 'sidewalk');
  // building: interior = union of FOOT, walls = the ring around it
  const inside = new Uint8Array(MW * MH); FOOT.forEach(([a, b, c, d]) => { for (let y = b; y <= d; y++) for (let x = a; x <= c; x++) inside[idx(x, y)] = 1; });
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) { if (inside[idx(x, y)]) { G(x, y, 'lino'); W.outdoor[idx(x, y)] = 0; continue; } let near = false; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (inb(x + dx, y + dy) && inside[idx(x + dx, y + dy)]) near = true; if (near) wall(x, y); }
  // stock room walls (it touches the store on two sides)
  for (let y = 12; y <= 20; y++) { wall(25, y); wall(42, y); } for (let x = 25; x <= 42; x++) wall(x, 20);
  const door = (x, y, k = 'mat') => { W.wall[idx(x, y)] = 0; W.solid[idx(x, y)] = 0; G(x, y, k); };
  door(59, 46); door(60, 46); door(45, 46); door(46, 46); door(57, 12); door(58, 12); door(33, 20, 'concrete'); door(34, 20, 'concrete');
  W.spots.mainDoorIn = [59.9, 45]; W.spots.exitIn = [45.9, 45]; W.spots.sideDoorIn = [57.9, 13.2]; W.spots.stockDoor = [33.5, 21.6];
  // dept floors + layouts
  DEPTS.forEach((d, i) => {
    const open = deptUnlocked(d, ups);
    for (let y = d.y; y < d.y + d.h; y++) for (let x = d.x; x < d.x + d.w; x++) { if (W.wall[idx(x, y)]) continue; G(x, y, open ? d.floor : 'plywood'); W.zone[idx(x, y)] = i; }
    if (!open) { W.signs.push({ text: 'Soon: ' + d.name, x: d.x + d.w / 2, y: d.y + d.h / 2, small: true, locked: true }); return; }
    layoutDept(d, i);
    if (d.id !== 'registers' && d.id !== 'custserv') W.signs.push({ text: d.sign || d.name, x: d.x + d.w / 2, y: d.y + (d.signY || 0.2) });
  });
  W.signs.push({ text: 'Registers', x: 37.5, y: 36.1 }); W.signs.push({ text: 'Customer Service', x: 36.5, y: 44.6, small: true });
  // stock room
  rect(26, 13, 41, 19, 'concrete');
  const crateOrder = Object.keys(CRATES).filter(k => !CRATES[k].lock || ups[CRATES[k].lock]);
  const pslots = []; for (let x = 27; x <= 40; x++) if (x !== 33 && x !== 34) pslots.push([x, 14]); for (let x = 27; x <= 32; x++) pslots.push([x, 17]); for (let x = 35; x <= 37; x++) pslots.push([x, 17]);
  crateOrder.forEach((k, i) => { const [x, y] = pslots[i]; W.pallets.push(addObj({ type: 'pallet', crate: k, x, y })); });
  addObj({ type: 'fridge', x: 38, y: 17 }); addObj({ type: 'plant', x: 39, y: 17 }); addObj({ type: 'desk', x: 40, y: 17 }); addObj({ type: 'couch', x: 39, y: 19, w: 2 });
  W.spots.bed = [39.9, 18.5]; W.spots.start = [37.5, 18.6];
  W.signs.push({ text: 'Stock Room', x: 33.5, y: 12.4, dark: true });
  // the famous restrooms: porta-potty doors, nice inside
  addObj({ type: 'restroom', x: 30, y: 44 }); addObj({ type: 'restroom', x: 31, y: 44 }); addObj({ type: 'restroom', x: 2, y: 37 }); addObj({ type: 'restroom', x: 3, y: 37 });
  W.labels.push({ text: 'Restrooms', x: 31, y: 45.3 });
  [[2, 16], [7, 11], [24, 33], [55, 3], [70, 13], [56, 45], [57, 45], [61, 36], [70, 36], [42, 33]].forEach(([x, y]) => { if (!W.solid[idx(x, y)] && !W.objAt.get(idx(x, y))) addObj({ type: 'plant', x, y }); });
  [[29, 33], [62, 45], [51, 12]].forEach(([x, y]) => { if (!W.solid[idx(x, y)]) addObj({ type: 'trash', x, y }); });
  addObj({ type: 'penguin', x: 21, y: 45 }); addObj({ type: 'penguin', x: 29, y: 45 });
  // jungle scene by the exit
  addObj({ type: 'pond', x: 49, y: 38, w: 5, h: 3, anim: 'jungle' }); W.anims.jungle = true; W.signs.push({ text: 'Jungle Scene', x: 51.5, y: 37.3, small: true });
  W.labels.push({ text: 'Entrance', x: 60, y: 47.4 }); W.labels.push({ text: 'Exit', x: 46, y: 47.4 }); W.labels.push({ text: 'Quick trips', x: 58, y: 11.4 });
  // parking
  for (const ry of [50, 54, 58]) for (let x = 4; x <= 73; x++) { if ((x >= 44 && x <= 47) || (x >= 58 && x <= 61)) continue; W.parking.push({ x, y: ry, car: null }); }
  for (let x = 58; x <= 76; x += 2) W.parking.push({ x, y: 4, car: null, side: true });
  if (ups.parking) for (let x = 59; x <= 75; x += 2) W.parking.push({ x, y: 7, car: null, side: true });
  for (let y = 49; y <= 61; y++) for (const x of [44, 45, 46, 47, 58, 59, 60, 61]) G(x, y, 'cross');
  [[2, 52], [2, 57], [76, 52], [76, 57], [20, 61], [52, 61], [0, 47], [77, 47], [77, 20], [77, 34], [5, 41], [14, 42]].forEach(([x, y]) => { if (inb(x, y) && !W.solid[idx(x, y)]) addObj({ type: y >= 49 && y <= 61 ? 'lamp' : 'tree', x, y }); });
  for (let x = 2; x < 55; x += 8) addObj({ type: 'tree', x, y: x < 25 ? 3 : 2, solid: false });
  addObj({ type: 'tree', x: 3, y: 9, solid: false }); addObj({ type: 'tree', x: 30, y: 7, solid: false }); addObj({ type: 'tree', x: 37, y: 9, solid: false });
  addObj({ type: 'giraffe', x: 62, y: 47, solid: false }); addObj({ type: 'elephant', x: 64, y: 47 });
  addObj({ type: 'rhino', x: 59, y: 9, solid: false }); W.labels.push({ text: 'Event Center', x: 47, y: 2.6 });
  if (ups.billboard) addObj({ type: 'billboard', x: 60, y: 63, solid: false });
  addObj({ type: 'corral', x: 40, y: 52 }); addObj({ type: 'corral', x: 50, y: 56 });
  W.lanes.forEach(l => { W.cost[idx(l.cash[0], l.cash[1])] = 30; });
  W.stools.forEach(s => { W.cost[idx(s.x, s.y)] = 12; });
  computeFronts(); renderGround();
}

function shelfRows(d, i, art, kind) {
  const x0 = d.x + 1, x1 = d.x + d.w - 2; let row = 0;
  for (let ty = d.y + 1; ty <= d.y + d.h - 2; ty += 3, row++) {
    const wd = x1 - x0 + 1; const gap = wd >= 11 ? Math.floor(x0 + wd / 2) - 1 : -99;
    for (let x = x0; x <= x1; x++) { if (x === gap || x === gap + 1) continue; addObj({ type: kind || 'shelf', art, dept: d.id, x, y: ty, seed: (x * 7 + ty * 13) }); }
    const labs = d.labels && d.labels[row];
    if (labs) { if (labs.length === 2 && gap > 0) { W.labels.push({ text: labs[0], x: (x0 + gap) / 2, y: ty + 1.05 }); W.labels.push({ text: labs[1], x: (gap + 2 + x1 + 1) / 2, y: ty + 1.05 }); } else W.labels.push({ text: labs.join(' / '), x: (x0 + x1 + 1) / 2, y: ty + 1.05 }); }
  }
}
function layoutDept(d, i) {
  const x0 = d.x + 1, x1 = d.x + d.w - 2, y0 = d.y + 1, y1 = d.y + d.h - 2;
  const anim = (name, x, y, w = 1, h = 1) => { removeAt(x, y); if (w > 1) removeAt(x + 1, y); addObj({ type: 'anim', name, anim: name, x, y, w, h, dept: d.id }); W.anims[name] = true; };
  switch (d.layout) {
    case 'rows': {
      if (d.art === 'beer') shelfRows(d, i, 'beer', 'cooler'); else shelfRows(d, i, d.art);
      if (d.id === 'grocery') anim('swing', 48, 26);
      if (d.id === 'pets') { removeAt(x1 - 1, y0); removeAt(x1, y0); addObj({ type: 'racecar', x: x1 - 1, y: y0, w: 2 }); }
      if (d.id === 'health') anim('corn', x1 - 1, y0, 2);
      if (d.id === 'europe') anim('robin', x0 + 1, y0 + 4, 2, 1);
      if (d.id === 'honey') { removeAt(x1, y0); addObj({ type: 'hive', x: x1, y: y0 }); }
      if (d.id === 'tiktok') { removeAt(x0, y0); addObj({ type: 'ringlight', x: x0, y: y0, dept: d.id }); W.spots.ringlight = [x0, y0]; }
      break;
    }
    case 'hot': {
      for (let x = x0; x <= x1; x++) addObj({ type: 'shelf', art: 'hotsauce', dept: d.id, x, y: y0, seed: x * 3 });
      const cx = Math.floor(d.x + d.w / 2) - 1; anim('firetruck', cx, y0 + 2, 2); W.spots.drone = [cx + 1, y0 + 0.5];
      for (let x = x0; x <= x0 + 2; x++) addObj({ type: 'shelf', art: 'asia', dept: d.id, x, y: y0 + 2, seed: x * 11 });
      for (let x = x1 - 2; x <= x1; x++) addObj({ type: 'shelf', art: 'americas', dept: d.id, x, y: y0 + 2, seed: x * 13 });
      break;
    }
    case 'candy': {
      for (let x = x0; x <= x1; x++) addObj({ type: 'candy', dept: d.id, x, y: y0, seed: x });
      const cx = Math.floor(d.x + d.w / 2) - 1; removeAt(cx, y0); removeAt(cx + 1, y0); addObj({ type: 'anim', name: 'elvis', anim: 'elvis', x: cx, y: y0, w: 2, h: 2, dept: d.id }); W.anims.elvis = true; W.spots.elvis = [cx + 1, y0 + 2.6];
      break;
    }
    case 'bar': {
      for (let x = d.x + 2; x <= d.x + d.w - 3; x++) { addObj({ type: 'bar', x, y: y0, frame: x % 3 === 0 ? 1 : 0 }); const s = { x, y: y0 + 1, cust: null }; W.stools.push(s); addObj({ type: 'stool', x, y: y0 + 1, solid: false, stool: s }); }
      break;
    }
    case 'cheese': {
      const cx = Math.floor(d.x + d.w / 2) - 1; addObj({ type: 'bigcheese', x: cx, y: y0, w: 2, h: 2, dept: d.id }); W.spots.bigcheese = [cx + 1, y0 + 2.5];
      for (let x = x0; x <= x1; x++) if (x < cx || x > cx + 1) addObj({ type: 'case', art: 'cheesecase', dept: d.id, x, y: y0, seed: x });
      for (let x = x0; x <= x1; x++) addObj({ type: 'shelf', art: 'europe', dept: d.id, x, y: y0 + 4, seed: x * 5 });
      W.labels.push({ text: 'Butter Bar', x: x0 + 0.5, y: y0 + 1.05 });
      break;
    }
    case 'counter': {
      for (let x = x0; x <= x1; x++) addObj({ type: 'case', art: d.art, dept: d.id, x, y: y0, seed: x });
      for (let x = x0; x <= x1; x++) W.solid[idx(x, d.y)] = 1;
      addObj({ type: 'staff', x: Math.floor((x0 + x1) / 2), y: d.y, solid: true, look: staffLook(d.id) });
      if (y0 + 3 <= y1) { if (d.id === 'meat') for (let x = x0; x <= x1; x++) addObj({ type: 'freezer', dept: d.id, x, y: y0 + 3, seed: x }); }
      if (d.labels) W.labels.push({ text: d.labels[0][0], x: (x0 + x1 + 1) / 2, y: y0 + 4.05 });
      break;
    }
    case 'seafood': {
      for (let x = x0; x <= x1; x++) addObj({ type: 'case', art: 'fish', dept: d.id, x, y: y0, seed: x });
      for (let x = x0; x <= x1; x++) W.solid[idx(x, d.y)] = 1;
      addObj({ type: 'staff', x: x0 + 2, y: d.y, solid: true, look: staffLook('seafood') });
      addObj({ type: 'anim', name: 'minnow', anim: 'minnow', x: x0 + 1, y: y0 + 3, w: 2, dept: d.id }); W.anims.minnow = true;
      break;
    }
    case 'tanks': {
      for (let x = d.x; x < d.x + d.w; x++) { const t = addObj({ type: 'tank', kind: x % 2 ? 'lobster' : 'fish', x, y: y0, dept: d.id }); W.tanks.push(t); }
      break;
    }
    case 'deck': { addObj({ type: 'deck', x: d.x, y: d.y, w: 3, h: 3 }); break; }
    case 'tenant': { addObj({ type: 'counter', x: x0, y: y0 }); addObj({ type: 'counter', x: x0 + 1, y: y0 }); addObj({ type: 'staff', x: x0, y: d.y, solid: true, look: staffLook('coffee') }); W.labels.push({ text: 'Sub Counter', x: x0 + 1, y: y0 + 3 }); addObj({ type: 'counter', x: x0, y: y0 + 3 }); addObj({ type: 'counter', x: x0 + 1, y: y0 + 3 }); break; }
    case 'binscol': { for (let y = d.y + 1; y <= d.y + d.h - 2; y++) if (y !== d.y + 4 && y !== d.y + 8) addObj({ type: 'bin', dept: d.id, x: d.x, y, seed: y * 3 + 1 }); break; }
    case 'vcol': { for (let y = y0; y <= y1; y++) addObj({ type: 'shelf', art: d.art, dept: d.id, x: x0, y, seed: y * 17 }); break; }
    case 'bins': {
      for (let by = y0; by + 1 <= y1; by += 4) for (let bx = x0; bx + 1 <= x1; bx += 4) for (let k = 0; k < 4; k++) addObj({ type: 'bin', dept: d.id, x: bx + (k % 2), y: by + Math.floor(k / 2), seed: bx * 3 + by * 5 + Math.floor(k / 2) });
      break;
    }
    case 'freezers': {
      const names = ['Ice Cream', 'Pizza & Meals', 'Milk & Eggs', 'Butter & Cheese']; let row = 0;
      for (let ty = y0; ty <= y1; ty += 3, row++) { for (let x = x0; x <= x1; x++) { if (row >= 2) addObj({ type: 'cooler', art: 'dairy', dept: d.id, x, y: ty, seed: x + row }); else addObj({ type: 'freezer', dept: d.id, x, y: ty, seed: x + row * 9 }); } W.labels.push({ text: names[row] || 'Frozen', x: (x0 + x1 + 1) / 2, y: ty + 1.05 }); }
      break;
    }
    case 'desk': {
      for (let x = x0; x <= x0 + 2; x++) addObj({ type: 'infodesk', x, y: y0 });
      addObj({ type: 'staff', x: x0 + 1, y: d.y, solid: true, look: staffLook('custserv') });
      break;
    }
    case 'registers': {
      const ry = d.y + 4;
      for (let i2 = 0; i2 < 5; i2++) {
        const cx = d.x + i2 * 3, rx = cx + 1, qx = cx + 2;
        addObj({ type: 'register', x: rx, y: ry, lane: i2 }); addObj({ type: 'counter', x: rx, y: ry + 1 });
        W.lanes.push({ i: i2, cash: [cx, ry], reg: [rx, ry], pay: [qx, ry], queue: [], q: [0, 1, 2, 3, 4].map(k => [qx, ry - k]), staff: null, progress: 0 });
      }
      break;
    }
    case 'gacha': {
      for (let x = x0; x <= x1; x++) addObj({ type: 'gacha', dept: d.id, x, y: y0, seed: x });
      for (let x = x0; x <= x1; x++) addObj({ type: 'gacha', dept: d.id, x, y: y0 + 3, seed: x + 3 });
      break;
    }
    case 'cards': {
      for (let x = x0; x <= x1; x++) addObj({ type: 'shelf', art: 'cards', dept: d.id, x, y: y0, seed: x });
      addObj({ type: 'cardtable', x: x0, y: y0 + 3, dept: d.id }); W.spots.cardtable = [x0 + 0.5, y0 + 2.5];
      break;
    }
  }
}
function removeAt(x, y) { const o = W.objAt.get(idx(x, y)); if (!o) return; W.objs.splice(W.objs.indexOf(o), 1); for (let yy = o.y; yy < o.y + o.h; yy++) for (let xx = o.x; xx < o.x + o.w; xx++) { W.objAt.delete(idx(xx, yy)); W.solid[idx(xx, yy)] = W.wall[idx(xx, yy)]; } }
function staffLook(id) { const r = mkRng(id.length * 97 + id.charCodeAt(0)); const o = randomLook(r, 'adult'); o.shirt = '#f4f4f4'; o.apron = { deli: '#8a2a3a', meat: '#a82a2a', bakery: '#e8cfa0', seafood: '#2e6a9a', sushi: '#3a2a20', custserv: null }[id] || null; if (id === 'custserv') o.shirt = '#2e7d3b'; if (id === 'bakery') { o.style = 'cap'; o.hat = '#f4f4f4'; } o.key = 'staff_' + id; return o; }

// customer-reachable tiles touching each dept's stock objects
function computeFronts() {
  const stockTypes = new Set(['shelf', 'cooler', 'freezer', 'bin', 'case', 'candy', 'gacha']);
  W.objs.forEach(o => {
    if (!stockTypes.has(o.type) || !o.dept) return;
    const f = W.fronts[o.dept] || (W.fronts[o.dept] = []);
    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) { const x = o.x + dx, y = o.y + dy; if (inb(x, y) && !W.solid[idx(x, y)] && !W.outdoor[idx(x, y)]) f.push([x, y, o]); }
  });
}

// ---------- A* ----------
const AS = { g: new Float32Array(MW * MH), from: new Int32Array(MW * MH), seen: new Uint32Array(MW * MH), closed: new Uint32Array(MW * MH), stamp: 1 };
function findPath(sx, sy, tx, ty) {
  sx = Math.floor(sx); sy = Math.floor(sy); tx = Math.floor(tx); ty = Math.floor(ty);
  if (!inb(sx, sy) || !inb(tx, ty)) return null;
  const st = ++AS.stamp; const start = idx(sx, sy), goal = idx(tx, ty);
  if (W.solid[goal]) return null;
  const heap = [], hf = []; const push = (n, f) => { heap.push(n); hf.push(f); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (hf[p] <= hf[i]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; [hf[p], hf[i]] = [hf[i], hf[p]]; i = p; } };
  const pop = () => { const top = heap[0]; const ln = heap.pop(), lf = hf.pop(); if (heap.length) { heap[0] = ln; hf[0] = lf; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && hf[l] < hf[m]) m = l; if (r < heap.length && hf[r] < hf[m]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; [hf[m], hf[i]] = [hf[i], hf[m]]; i = m; } } return top; };
  AS.g[start] = 0; AS.seen[start] = st; AS.from[start] = -1; push(start, 0); let it = 0;
  while (heap.length && it++ < 20000) {
    const cur = pop(); if (AS.closed[cur] === st) continue; AS.closed[cur] = st;
    if (cur === goal) { const path = []; let n = cur; while (n !== -1) { path.push([n % MW, Math.floor(n / MW)]); n = AS.from[n]; } return path.reverse(); }
    const cx = cur % MW, cy = Math.floor(cur / MW);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = cx + dx, ny = cy + dy; if (!inb(nx, ny)) continue; const n = idx(nx, ny); if (W.solid[n] && n !== goal) continue;
      const ng = AS.g[cur] + (n === goal ? 1 : W.cost[n]); if (AS.seen[n] === st && ng >= AS.g[n]) continue;
      AS.seen[n] = st; AS.g[n] = ng; AS.from[n] = cur; push(n, ng + Math.abs(nx - tx) + Math.abs(ny - ty));
    }
  }
  return null;
}

// ---------- pre-render ground layer ----------
function renderGround() {
  const c = W.groundCanvas || (W.groundCanvas = cv(MW * T, MH * T)); const g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height);
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const k = W.ground[idx(x, y)], r = mkRng(x * 7919 + y * 104729), px = x * T, py = y * T;
    if (k === 'wall') continue;
    if (k === 'mat') { FLOOR.lino(g, px, py, r); P(g, px + 1, py + 2, 14, 12, '#2e3a2e'); for (let i = 0; i < 12; i += 2) P(g, px + 2, py + 3 + i, 12, 1, '#3e4a3e'); continue; }
    if (k === 'cross') { FLOOR.asphalt(g, px, py, r); if (y % 2 === 0) for (let i = 1; i < 16; i += 4) P(g, px + i, py + 2, 2, 12, '#ece8dc'); continue; }
    (FLOOR[k] || FLOOR.lino)(g, px, py, r, x, y);
    if (k === 'plywood') { if ((x + y) % 2 === 0) P(g, px, py + 7, 16, 2, '#f2c81c'); }
  }
  // parking lines
  W.parking.forEach(p => { const px = p.x * T, py = p.y * T; if (p.side) { P(g, px, py - 1, 16, 1, '#ece8dc'); } else { P(g, px, py, 1, 26, '#ece8dc'); P(g, px + 15, py, 1, 26, '#ece8dc'); } });
  // road dashes + curb
  for (let x = 0; x < MW * T; x += 24) P(g, x, 63 * T + 7, 12, 2, '#f2c81c');
  P(g, 0, 62 * T, MW * T, 2, '#9a978d');
  // walls
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    if (!W.wall[idx(x, y)]) continue; const px = x * T, py = y * T; const below = inb(x, y + 1) && !W.wall[idx(x, y + 1)];
    const stock = (x >= 25 && x <= 42 && y <= 20 && y >= 12) && !(inb(x, y + 1) && W.outdoor[idx(x, y + 1)]);
    if (below) {
      if (W.outdoor[idx(x, y + 1)]) { // storefront
        P(g, px, py, 16, 16, '#ead9a8'); P(g, px, py, 16, 3, '#2e7d3b'); P(g, px, py + 3, 16, 1, '#f2c81c'); P(g, px, py + 14, 16, 2, '#8a7a5a');
        if (x % 4 !== 0) { P(g, px + 1, py + 5, 14, 8, '#3a5a72'); P(g, px + 2, py + 6, 4, 1, '#8ab4d0'); P(g, px + 1, py + 9, 14, 1, '#c8c0a0'); }
      } else if (stock) { P(g, px, py, 16, 16, '#8a8a92'); P(g, px, py, 16, 2, '#5a5a62'); for (let i = 4; i < 16; i += 4) P(g, px, py + i, 16, 1, '#7a7a82'); P(g, px, py + 10, 16, 2, '#f2c81c'); }
      else { // jungle mural
        P(g, px, py, 16, 16, '#3a8a4a'); P(g, px, py, 16, 2, '#1e4a26'); P(g, px, py + 13, 16, 3, '#6a4a2a'); P(g, px, py + 13, 16, 1, '#8a6a3a');
        const r = mkRng(x * 31 + y); for (let i = 0; i < 3; i++) { const lx = Math.floor(r() * 12), ly = 3 + Math.floor(r() * 8); oval(g, px + lx + 2, py + ly + 1, 2.5, 1.4, pick(r, ['#5ab85a', '#2e6a32', '#7ad07a'])); }
        if (x % 3 === 0) { P(g, px + 7, py + 2, 1, 6, '#2e6a32'); disc(g, px + 7, py + 8, 1.2, '#e8546a'); }
      }
    } else { P(g, px, py, 16, 16, stock ? '#4a4a52' : '#24402a'); P(g, px, py, 16, 1, stock ? '#5a5a62' : '#2e5236'); }
  }
  P(g, 58 * T, 46 * T, 4 * T, 3, '#f2c81c'); P(g, 44 * T, 46 * T, 4 * T, 3, '#f2c81c');
  // shadows under walls on floor
  for (let y = 0; y < MH - 1; y++) for (let x = 0; x < MW; x++) if (W.wall[idx(x, y)] && !W.wall[idx(x, y + 1)] && !W.outdoor[idx(x, y + 1)]) { g.globalAlpha = 0.18; P(g, x * T, (y + 1) * T, 16, 3, '#000'); g.globalAlpha = 1; }
}
