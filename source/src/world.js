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

// building footprint, traced from the Eastgate map (tiles, inclusive): main hall, the east block (world foods, hot sauce,
// international), the card-shop strip, the wine wing, State Liquor, the food court along the front, the Foodie Entrance
// vestibule, and the stock room out back.
const FOOT = [[28, 15, 86, 51], [87, 11, 108, 44], [87, 45, 94, 51], [8, 31, 27, 51], [1, 45, 7, 51], [28, 52, 61, 58], [76, 52, 86, 57], [34, 8, 50, 13]];
const STOCK = [34, 8, 50, 13];
function buildWorld(ups) {
  W.ground = new Array(MW * MH).fill('grass'); W.solid.fill(0); W.cost.fill(1); W.zone.fill(-1); W.wall.fill(0); W.outdoor.fill(1);
  W.objs = []; W.objAt = new Map(); W.fronts = {}; W.lanes = []; W.stools = []; W.pallets = []; W.parking = []; W.signs = []; W.labels = []; W.tanks = []; W.anims = {}; W.spots = {}; W.stockRect = STOCK;
  W.chairs = []; W.stalls = []; W.doors = []; W.corrals = [];
  const G = (x, y, k) => { if (inb(x, y)) W.ground[idx(x, y)] = k; };
  const rect = (x0, y0, x1, y1, k) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) G(x, y, k); };
  const wall = (x, y) => { if (!inb(x, y)) return; W.wall[idx(x, y)] = 1; W.solid[idx(x, y)] = 1; W.outdoor[idx(x, y)] = 0; G(x, y, 'wall'); };
  // outdoors: the back dock, the wine-entrance lot (north-west), the plaza + main lot out front, the road
  rect(30, 1, 56, 6, 'asphalt'); rect(1, 19, 26, 28, 'asphalt'); rect(1, 29, 27, 29, 'sidewalk');
  rect(1, 60, SW - 2, 61, 'sidewalk'); rect(62, 59, 98, 59, 'sidewalk'); rect(1, 62, SW - 2, 74, 'asphalt'); rect(0, 75, SW - 1, 75, 'sidewalk'); rect(0, 76, SW - 1, 78, 'road');
  rect(109, 10, 110, 61, 'sidewalk');
  // building: interior = union of FOOT, walls = the ring around it
  const inside = new Uint8Array(MW * MH); FOOT.forEach(([a, b, c, d]) => { for (let y = b; y <= d; y++) for (let x = a; x <= c; x++) inside[idx(x, y)] = 1; });
  for (let y = 0; y < MH; y++) for (let x = 0; x < SW; x++) { if (inside[idx(x, y)]) { G(x, y, 'lino'); W.outdoor[idx(x, y)] = 0; continue; } let near = false; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (inb(x + dx, y + dy) && inside[idx(x + dx, y + dy)]) near = true; if (near) wall(x, y); }
  const door = (x, y, k = 'mat') => { W.wall[idx(x, y)] = 0; W.solid[idx(x, y)] = 0; G(x, y, k); W.doors.push([x, y, k]); };
  door(82, 58); door(83, 58); door(72, 52); door(73, 52); door(16, 30); door(17, 30); door(42, 14, 'concrete'); door(43, 14, 'concrete');
  W.spots.mainDoorIn = [82.9, 57]; W.spots.exitIn = [72.9, 51]; W.spots.sideDoorIn = [16.9, 31.2]; W.spots.stockDoor = [42.5, 15.6];
  W.spots.skate = [38, 44.6]; W.spots.cartBay = [84.5, 56.7]; // where carts come back in, by the Foodie Entrance // a long clear straight (the walkway along the front shops), for the skate test
  // dept floors + layouts + displays
  DEPTS.forEach((d, i) => {
    const open = deptUnlocked(d, ups);
    for (let y = d.y; y < d.y + d.h; y++) for (let x = d.x; x < d.x + d.w; x++) { if (W.wall[idx(x, y)]) continue; G(x, y, open ? d.floor : 'plywood'); W.zone[idx(x, y)] = i; }
    if (!open) { W.signs.push({ text: 'Soon: ' + d.name, x: d.x + d.w / 2, y: d.y + d.h / 2, small: true, locked: true }); return; }
    layoutDept(d, i); placeProps(d);
    if (d.id !== 'registers' && d.id !== 'custserv') W.signs.push({ text: d.sign || d.name, x: d.x + d.w / 2, y: d.y + (d.signY || 0.2) });
  });
  W.signs.push({ text: 'Registers', x: 73.5, y: 43.4 }); W.signs.push({ text: 'Customer Service', x: 78, y: 52.6, small: true });
  // quick trips: the express register by the wine entrance. 5 items or less, out the wine door after.
  { const ry = 32, rx = 19; addObj({ type: 'register', x: rx, y: ry, lane: 5 }); addObj({ type: 'belt', x: rx, y: ry + 1, lane: 5 });
    W.lanes.push({ i: 5, quick: true, cash: [rx - 1, ry], reg: [rx, ry], pay: [rx + 1, ry], queue: [], q: [0, 1, 2, 3, 4].map(k => [rx + 1, ry + k]), staff: null, progress: 0 });
    W.signs.push({ text: 'Quick Trips', x: rx + 0.5, y: 31.3, small: true }); W.labels.push({ text: '5 items or less', x: rx + 0.5, y: ry + 2.1 }); }
  // stock room out back
  rect(STOCK[0], STOCK[1], STOCK[2], STOCK[3], 'concrete');
  const crateOrder = Object.keys(CRATES).filter(k => !CRATES[k].lock || ups[CRATES[k].lock]);
  const pslots = []; for (let x = 35; x <= 49; x++) pslots.push([x, 9]); for (let x = 35; x <= 40; x++) pslots.push([x, 11]);
  crateOrder.forEach((k, i) => { const [x, y] = pslots[i]; W.pallets.push(addObj({ type: 'pallet', crate: k, x, y })); });
  addObj({ type: 'fridge', x: 45, y: 12 }); addObj({ type: 'plant', x: 46, y: 12 }); addObj({ type: 'desk', x: 47, y: 12 }); addObj({ type: 'couch', x: 48, y: 13, w: 2 });
  W.spots.bed = [48.9, 12.5]; W.spots.start = [44.5, 12.6];
  W.signs.push({ text: 'Stock Room', x: 42, y: 7.4, dark: true });
  // the famous restrooms: porta-potty doors, nice inside (north by Seafood, east by the theater, west by the wine)
  for (const [x, y] of [[71, 15], [72, 15], [89, 35], [90, 35], [11, 44], [12, 44]]) addObj({ type: 'restroom', x, y });
  W.labels.push({ text: 'Restrooms', x: 72, y: 16.3 }); W.labels.push({ text: 'Restrooms', x: 90, y: 36.3 }); W.labels.push({ text: 'Restrooms', x: 12, y: 45.3 });
  const freeAt = (x, y) => inb(x, y) && !W.solid[idx(x, y)] && !W.objAt.get(idx(x, y));
  [[29, 15], [56, 21], [86, 15], [76, 56], [86, 53], [8, 31], [27, 31], [87, 23], [33, 44], [65, 43], [75, 37], [45, 43]].forEach(([x, y]) => { if (freeAt(x, y)) addObj({ type: 'plant', x, y }); });
  [[28, 53], [61, 53], [45, 52], [86, 52], [21, 44], [60, 44], [94, 34], [32, 20]].forEach(([x, y]) => { if (freeAt(x, y)) addObj({ type: 'trash', x, y }); });
  for (const [x, y] of [[34, 24], [42, 24]]) if (freeAt(x, y)) addObj({ type: 'penguin', x, y });
  // out front: the parked monorail on its platform, the jungle scene with the hippo, giraffe and elephant
  addObj({ type: 'mstairs', x: 63, y: 59 }); W.spots.monorail = [61, 77, 60.6];
  addObj({ type: 'pond', x: 88, y: 54, w: 5, h: 3, anim: 'jungle' }); W.anims.jungle = true; W.signs.push({ text: 'Jungle Scene', x: 90.5, y: 53.3, small: true });
  addObj({ type: 'giraffe', x: 94, y: 54, solid: false }); addObj({ type: 'elephant', x: 93, y: 57 });
  addObj({ type: 'rhino', x: 20, y: 27, solid: false });
  W.labels.push({ text: 'Foodie Entrance', x: 83, y: 59.4 }); W.labels.push({ text: 'Exit', x: 73, y: 53.4 }); W.labels.push({ text: 'Wine Entrance', x: 17, y: 29.4 });
  // parking: the main lot out front (crosswalks to the doors), the wine lot round the side
  for (const ry of [63, 67, 71]) for (let x = 2; x <= 109; x++) { if ((x >= 71 && x <= 74) || (x >= 81 && x <= 84)) continue; W.parking.push({ x, y: ry, car: null }); }
  if (ups.parking) for (let x = 2; x <= 109; x += 1) { if ((x >= 71 && x <= 74) || (x >= 81 && x <= 84)) continue; W.parking.push({ x, y: 73, car: null }); }
  for (const ry of [20, 24]) for (let x = 3; x <= 25; x += 2) W.parking.push({ x, y: ry, car: null, side: true });
  for (let y = 62; y <= 74; y++) for (const x of [72, 73, 82, 83]) G(x, y, 'cross');
  [[1, 66], [1, 70], [110, 66], [110, 70], [30, 74], [60, 74], [95, 74], [20, 62], [50, 62], [100, 62]].forEach(([x, y]) => { if (freeAt(x, y)) addObj({ type: 'lamp', x, y }); });
  [[2, 2], [10, 3], [18, 2], [26, 4], [60, 2], [68, 4], [76, 2], [84, 3], [94, 4], [104, 3], [2, 14], [10, 12], [20, 9], [3, 36], [2, 56], [110, 4], [100, 58]].forEach(([x, y]) => { if (freeAt(x, y)) addObj({ type: 'tree', x, y, solid: false }); });
  if (ups.billboard) addObj({ type: 'billboard', x: 30, y: 76, solid: false });
  for (const [x, y] of [[40, 66], [96, 70], [6, 22]]) { W.corrals.push(addObj({ type: 'corral', x, y })); }
  W.lanes.forEach(l => { W.cost[idx(l.cash[0], l.cash[1])] = 30; });
  W.stools.forEach(s => { W.cost[idx(s.x, s.y)] = 12; });
  buildFun(); placeGivers();
  computeFronts(); renderGround();
}
// extra displays on a department: [type, dx, dy, w, h, extra]. 'anim:NAME' is an animatronic that can break.
function placeProps(d) {
  for (const [type, dx, dy, w = 1, h = 1, extra] of d.props || []) {
    const x = d.x + dx, y = d.y + dy; for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) removeAt(xx, yy);
    if (type.startsWith('anim:')) { const name = type.slice(5); addObj({ type: 'anim', name, anim: name, x, y, w, h, dept: d.id }); W.anims[name] = true; }
    else addObj(Object.assign({ type, x, y, w, h }, type === 'hangcar' ? { solid: false } : {}, extra || {}));
  }
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
      if (d.id === 'honey') { removeAt(x1, y0); addObj({ type: 'hive', x: x1, y: y0 }); }
      if (d.id === 'tiktok') { removeAt(x0, y0); addObj({ type: 'ringlight', x: x0, y: y0, dept: d.id }); W.spots.ringlight = [x0, y0]; }
      break;
    }
    case 'hot': { // a wall of fire, the fire truck parked in the middle, more sauce rows under it
      for (let x = x0; x <= x1; x++) addObj({ type: 'shelf', art: 'hotsauce', dept: d.id, x, y: y0, seed: x * 3 });
      const cx = Math.floor(d.x + d.w / 2) - 1; anim('firetruck', cx, y0 + 3, 2);
      for (let ty = y0 + 6; ty <= y1; ty += 3) for (let x = x0; x <= x1; x++) if (x !== cx && x !== cx + 1) addObj({ type: 'shelf', art: ty % 2 ? 'hotsauce' : 'americas', dept: d.id, x, y: ty, seed: x * 11 + ty });
      if (d.labels) W.labels.push({ text: d.labels[0][0], x: (x0 + x1 + 1) / 2, y: y0 + 1.05 });
      break;
    }
    case 'candy': {
      for (let x = x0; x <= x1; x++) addObj({ type: 'candy', dept: d.id, x, y: y0, seed: x });
      const cx = Math.floor(d.x + d.w / 2) - 1; removeAt(cx, y0); removeAt(cx + 1, y0); addObj({ type: 'anim', name: 'elvis', anim: 'elvis', x: cx, y: y0, w: 2, h: 2, dept: d.id }); W.anims.elvis = true; W.spots.elvis = [cx + 1, y0 + 2.6];
      for (const tx of [cx - 1, cx + 2]) { removeAt(tx, y0); addObj({ type: 'tower', x: tx, y: y0 }); } // the candy castle's towers either side of the stage
      break;
    }
    case 'bar': {
      for (let x = d.x + 2; x <= d.x + d.w - 3; x++) { addObj({ type: 'bar', x, y: y0, frame: d.art === 'tiki' ? 3 : x % 3 }); const s = { x, y: y0 + 1, cust: null }; W.stools.push(s); addObj({ type: 'stool', x, y: y0 + 1, solid: false, stool: s }); }
      break;
    }
    case 'cheese': {
      const cx = Math.floor(d.x + d.w / 2) - 1; addObj({ type: 'bigcheese', x: cx, y: y0, w: 2, h: 2, dept: d.id }); W.spots.bigcheese = [cx + 1, y0 + 2.5];
      for (let x = x0; x <= x1; x++) if (x < cx || x > cx + 1) addObj({ type: 'case', art: 'cheesecase', dept: d.id, x, y: y0, seed: x });
      for (let x = x0; x <= x1; x++) addObj({ type: 'shelf', art: 'europe', dept: d.id, x, y: y0 + 4, seed: x * 5 });
      W.labels.push({ text: 'Butter Bar', x: x0 + 0.5, y: y0 + 1.05 });
      for (const px of [x0, x0 + 1, x1 - 1, x1]) addObj({ type: 'pickles', x: px, y: y0 + 2, seed: px }); // the big pickle barrels on the way to the Big Cheese
      W.labels.push({ text: 'Pickles', x: x0 + 1, y: y0 + 3.05 });
      break;
    }
    case 'counter': {
      for (let x = x0; x <= x1; x++) addObj({ type: 'case', art: d.art, dept: d.id, x, y: y0, seed: x });
      for (let x = x0; x <= x1; x++) W.solid[idx(x, d.y)] = 1;
      addObj({ type: 'staff', x: Math.floor((x0 + x1) / 2), y: d.y, solid: true, look: staffLook(d.id) });
      if (y0 + 3 <= y1) { if (d.id === 'meat') for (let x = x0; x <= x1; x++) addObj({ type: 'freezer', dept: d.id, x, y: y0 + 3, seed: x });
        else if (d.id === 'bakery' || d.id === 'deli') for (let x = x0 + 1; x <= x1 - 1; x++) addObj({ type: 'case', art: d.art, dept: d.id, x, y: y0 + 3, seed: x + 7 }); } // a second island of cases
      if (d.labels) W.labels.push({ text: d.labels[0][0], x: (x0 + x1 + 1) / 2, y: y0 + 4.05 });
      break;
    }
    case 'seafood': {
      for (let x = x0; x <= x1; x++) addObj({ type: 'case', art: 'fish', dept: d.id, x, y: y0, seed: x });
      for (let x = x0; x <= x1; x++) W.solid[idx(x, d.y)] = 1;
      addObj({ type: 'staff', x: x0 + 2, y: d.y, solid: true, look: staffLook('seafood') });
      addObj({ type: 'anim', name: 'minnow', anim: 'minnow', x: x0 + 1, y: y0 + 3, w: 2, dept: d.id }); W.anims.minnow = true;
      for (let x = x1 - 2; x <= x1; x++) { const t = addObj({ type: 'tank', kind: x % 2 ? 'lobster' : 'fish', x, y: y0 + 3, dept: d.id }); W.tanks.push(t); } // the live tanks
      break;
    }
    case 'tanks': {
      for (let x = d.x; x < d.x + d.w; x++) { const t = addObj({ type: 'tank', kind: x % 2 ? 'lobster' : 'fish', x, y: y0, dept: d.id }); W.tanks.push(t); }
      break;
    }
    case 'coolwall': { for (let y = d.y; y < d.y + d.h; y++) addObj({ type: 'cooler', art: 'dairy', dept: d.id, x: d.x, y, seed: y * 5 }); break; } // a wall of coolers
    case 'hrow': { for (let x = d.x; x < d.x + d.w; x++) addObj({ type: 'shelf', art: d.art, dept: d.id, x, y: d.y, seed: x * 9 }); break; }
    case 'binsrow': { for (let x = x0; x <= x1; x++) addObj({ type: 'bin', dept: d.id, x, y: d.y + 1, seed: x * 7 + 3 }); break; }
    case 'olive': { // hot meals case along the top, the olive bar island below
      for (let x = x0; x <= x1; x++) addObj({ type: 'case', art: 'deli', dept: d.id, x, y: y0, seed: x + 3 });
      for (let x = x0 + 1; x <= x1 - 1; x++) addObj({ type: 'case', art: 'olive', dept: d.id, x, y: y0 + 2, seed: x }); break; }
    case 'theater': { // The Jungle John's Story: a screen and two rows of seats with an aisle
      addObj({ type: 'screen', x: x0, y: d.y, w: d.w - 2, h: 1 }); const aisle = Math.floor((x0 + x1) / 2) + 1;
      for (const ty of [y0 + 1, y0 + 2]) for (let x = x0; x <= x1; x++) if (x !== aisle) addObj({ type: 'seat', x, y: ty, solid: false }); break; }
    case 'jxc': { addObj({ type: 'stage', x: x0, y: d.y, w: d.w - 2, h: 1 }); for (let x = x0; x <= x1; x += 2) addObj({ type: 'chair', x, y: y0 + 1, solid: false }); break; }
    case 'foodcourt': { // stalls along the back wall (a cook behind each), tables with chairs in the middle
      const kinds = [['tacos', 'Taqueria'], ['pizza', 'Pizzeria'], ['noodles', 'Noodle Bar'], ['froyo', 'Froyo'], ['pretzels', 'Pretzel Haus'], ['tikka', 'Tikka Stand']];
      kinds.forEach(([kind, name], k) => { const sx = d.x + 1 + k * 5, sy = d.y + d.h - 2; addObj({ type: 'foodstall', kind, frame: k, x: sx, y: sy, w: 3, h: 1 }); for (let x = sx; x < sx + 3; x++) W.solid[idx(x, sy + 1)] = 1;
        const cook = addObj({ type: 'staff', x: sx + 1, y: sy + 1, solid: true, look: staffLook('stall_' + kind) }); cook.cook = kind;
        W.stalls.push({ kind, name, x: sx, y: sy, front: [sx + 1, sy - 1], cook }); W.labels.push({ text: name, x: sx + 1.5, y: sy - 1.45 }); });
      for (let x = d.x + 2; x + 1 < d.x + d.w - 1; x += 4) { addObj({ type: 'table', x, y: d.y + 2, w: 2, h: 1 }); for (const cx of [x - 1, x + 2]) { const c = { x: cx, y: d.y + 2, cust: null }; W.chairs.push(c); addObj({ type: 'chair', x: cx, y: d.y + 2, solid: false, chair: c }); } }
      break; }
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
        addObj({ type: 'register', x: rx, y: ry, lane: i2 }); addObj({ type: 'belt', x: rx, y: ry + 1, lane: i2 });
        W.lanes.push({ i: i2, cash: [cx, ry], reg: [rx, ry], pay: [qx, ry], queue: [], q: [0, 1, 2, 3, 4].map(k => [qx, ry - k]), staff: null, progress: 0 });
        W.spots.drone = [80, 16]; // the hot sauce drone flies over Grocery, like the map shows
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
// quest givers: tag the clerk already behind a counter, or stand a new one at `at` (or the nearest free tile in the area)
function placeGivers() {
  W.givers = [];
  for (const gv of GIVERS) {
    const d = DEPT[gv.dept]; if (!d || d.lock) continue; // giver areas are never locked areas
    let o = W.objs.find(o => o.type === 'staff' && W.zone[idx(o.x, o.y)] === DEPTS.indexOf(d));
    if (!o) {
      const di = DEPTS.indexOf(d), free = (x, y) => inb(x, y) && W.zone[idx(x, y)] === di && !W.solid[idx(x, y)] && !W.objAt.get(idx(x, y));
      let at = gv.at; if (!at || !free(at[0], at[1])) { at = null; let bd = 1e9; for (let y = d.y; y < d.y + d.h; y++) for (let x = d.x; x < d.x + d.w; x++) if (free(x, y)) { const dd = Math.hypot(x - (gv.at ? gv.at[0] : d.x), y - (gv.at ? gv.at[1] : d.y)); if (dd < bd) { bd = dd; at = [x, y]; } } }
      if (!at) continue; const look = staffLook(gv.id); look.shirt = gv.shirt || look.shirt; look.apron = gv.apron || look.apron;
      o = addObj({ type: 'staff', x: at[0], y: at[1], solid: true, look });
    }
    o.giver = gv; W.givers.push({ gv, o, px: o.x * T + 8, py: o.y * T + 12 });
  }
}
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
  // metal transition strips where two indoor floors meet (dark seam + light lip, lit from the top left)
  const flr = (x, y) => inb(x, y) && !W.outdoor[idx(x, y)] && !W.wall[idx(x, y)] ? W.ground[idx(x, y)] : null;
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const k = flr(x, y); if (!k || k === 'mat') continue; const px = x * T, py = y * T, rt = flr(x + 1, y), dn = flr(x, y + 1);
    if (rt && rt !== k && rt !== 'mat') { P(g, px + 15, py, 1, 16, '#7d7564'); P(g, px + 16, py, 1, 16, '#d6cfbc'); }
    if (dn && dn !== k && dn !== 'mat') { P(g, px, py + 15, 16, 1, '#7d7564'); P(g, px, py + 16, 16, 1, '#d6cfbc'); }
  }
  // parking lines
  W.parking.forEach(p => { const px = p.x * T, py = p.y * T; if (p.side) { P(g, px, py - 1, 16, 1, '#ece8dc'); } else { P(g, px, py, 1, 26, '#ece8dc'); P(g, px + 15, py, 1, 26, '#ece8dc'); } });
  // road dashes + curb
  for (let x = 0; x < SW * T; x += 24) P(g, x, 63 * T + 7, 12, 2, '#f2c81c');
  P(g, 0, 62 * T, SW * T, 2, '#9a978d');
  // walls
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    if (!W.wall[idx(x, y)]) continue; const px = x * T, py = y * T; const below = inb(x, y + 1) && !W.wall[idx(x, y + 1)];
    if (x >= SW) { const st = ROOMWALL[W.wallStyle && W.wallStyle.get(idx(x, y))]; if (!st) P(g, px, py, 16, 16, '#07070c'); else if (below) st.face(g, px, py, x, y); else P(g, px, py, 16, 16, st.top); continue; } // walk-in rooms
    const S = W.stockRect, stock = (x >= S[0] - 1 && x <= S[2] + 1 && y >= S[1] - 1 && y <= S[3] + 1) && !(inb(x, y + 1) && W.outdoor[idx(x, y + 1)]);
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
  (W.doors || []).forEach(([x, y, k]) => { if (k === 'mat') P(g, x * T, y * T, T, 3, '#f2c81c'); });
  // shadows under walls on floor
  for (let y = 0; y < MH - 1; y++) for (let x = 0; x < MW; x++) if (W.wall[idx(x, y)] && !W.wall[idx(x, y + 1)] && !W.outdoor[idx(x, y + 1)]) { g.globalAlpha = 0.18; P(g, x * T, (y + 1) * T, 16, 3, '#000'); g.globalAlpha = 1; }
}
