// ===== story: the main quest that runs across two work weeks, the Big Cheese heist, and favors =====
// a quest line is a list of chapters; a chapter is a morning huddle, steps (talk / inspect / mop / fix / goal / chase /
// inspection / stakeout / pa / goto) and gossip the workers trade while it's going on. the main line moves one chapter a
// day at most; anything unfinished carries over to tomorrow.

// ---------- the people the story brings in ----------
const SNPC_LOOKS = {
  chad: { skin: '#f2c9a0', hair: '#3a2a1a', style: 'short', shirt: '#26304e', pants: '#26304e', shoes: '#1a1a1a', pattern: 'logo', pc: '#c8282a', key: 'snpc_chad' },
  brent: { skin: '#e9b48a', hair: '#d8b050', style: 'cap', hat: '#3d6fd1', shirt: '#3d6fd1', pants: '#3a3a42', shoes: '#f4f4f4', key: 'snpc_brent' },
  pruitt: { skin: '#a86f45', hair: '#2a1a12', style: 'bun', shirt: '#f4f4f4', pants: '#4a4f58', shoes: '#2a2a2a', glasses: '#2a2a2a', tote: '#8a5a2a', key: 'snpc_pruitt' },
  moose: { skin: '#f0c49a', hair: '#8a5a2a', style: 'beanie', hat: '#2e7d3b', shirt: '#a82a2a', pattern: 'stripe', pc: '#2a2a2a', pants: '#4a6a8a', shoes: '#7a4a22', beard: true, key: 'snpc_moose' },
  hood: { skin: '#e9b48a', hair: '#1e1e24', style: 'beanie', hat: '#1e1e24', shirt: '#1e1e24', pants: '#1e1e24', shoes: '#1e1e24', key: 'snpc_hood' },
};
const SNPC_NAMES = { chad: 'Chad Sterling', brent: 'Brent', pruitt: 'Inspector Pruitt', moose: 'Moose LaRue', hood: 'The Hooded Figure' };
function storyFace(name) { const id = Object.keys(SNPC_NAMES).find(k => SNPC_NAMES[k] === name); return id ? { look: SNPC_LOOKS[id] } : null; }

// ---------- the main story: The Buyout ----------
// huddle: [speaker, line] said in the break room in the morning. steps: what you have to do today.
// gossip: little exchanges workers have about it during the day ({a}/{b} = their names).
const MAIN = [
  { title: 'The Suit', huddle: [['Dolores', 'morning boss. weird thing. a man in a suit was in the lot at 6am taking pictures of our dumpster.'], ['Gus', 'i\'d take pictures of our dumpster. it\'s a beautiful dumpster.'], ['Deb', 'he had a lanyard. VALUMAX. that\'s the big-box chain that eats stores like ours.'], ['Dolores', 'if you see him, find out what he wants. and make today\'s money. that\'s the main thing.']],
    steps: [{ t: 'npc', npc: 'chad', zones: ['produce', 'bakery', 'deli'], say: 'well hello. chad sterling, valumax regional acquisitions. this store is... a LOT. we\'d like to make you an offer. a generous one. we\'d keep the name. probably. we\'d lose the lion.', after: 'chad hands you a business card. it\'s made of metal. it\'s heavier than it needs to be.', text: 'Find the man in the suit and talk to him' },
      { t: 'talk', who: 'Deb', say: 'valumax? they bought the store in dayton. now it\'s all beige. the cereal\'s beige. hon, you can\'t sell to those people.', text: 'Tell Deb at Customer Service about the offer' },
      { t: 'goal', text: 'Make today\'s money goal' }],
    gossip: [[['a', 'did you see the suit guy?'], ['b', 'he asked me how much the lion weighs. why would he need that?']], [['a', 'valumax wants to buy us.'], ['b', 'over my dead body. well. over somebody\'s.']]],
    tease: 'Overheard in the break room: "the freezer alarm went off at 3am. nobody was here."' },
  { title: 'Meltdown', huddle: [['Gus', 'boss. somebody left every freezer in Frozen wide open last night. it\'s an ice cream lake in there.'], ['Hank', 'i slipped on a rocky road. i\'m fine. my dignity isn\'t.'], ['Dolores', 'also, say hi to brent. new seasonal stocker. sweet kid. very polite. too polite? no, just polite.'], ['Brent', 'hi everybody! happy to be here! i love freezers. i mean, groceries. i love groceries.']],
    steps: [{ t: 'mop', n: 3, zone: 'frozen', kind: 'froyo', text: 'Mop up the melted ice cream in Frozen' },
      { t: 'inspect', clue: 'pen', zone: 'frozen', say: 'one freezer door was propped open with something. a pen. a fancy one. it says VALUMAX on the side.', text: 'Look at the freezer that was propped open (the sparkle in Frozen)' },
      { t: 'npc', npc: 'brent', zones: ['frozen', 'dairy', 'produce'], say: 'oh no, the freezers?! that\'s so weird. who would do that? not me. i was asleep. at home. in bed. sleeping. why are you looking at me like that?', text: 'Ask the new guy, Brent, if he saw anything' }],
    gossip: [[['a', 'a valumax pen? in OUR freezer?'], ['b', 'that suit guy was here yesterday. coincidence? no. the answer is no.']], [['a', 'the new kid brent is so nice.'], ['b', 'too nice. nobody\'s that nice at 7am.']]],
    tease: 'Overheard in the break room: "elvis didn\'t sing his closing song last night. he ALWAYS sings his closing song."' },
  { title: 'The Lion Sleeps', huddle: [['Trixie', 'BOSS. elvis is broken. somebody cut his wires. HIS WIRES.'], ['Gus', 'first the freezers, now the lion. this is a campaign.'], ['Hank', 'i saw a flashlight in candy at 2am. i was here late, uh, stacking melons. thought it was the lion\'s ghost.'], ['Dolores', 'fix him, then let\'s find out who did this.']],
    steps: [{ t: 'fix', anim: 'elvis', text: 'Fix Elvis (wrench, tool 3)' },
      { t: 'inspect', clue: 'cutters', zone: 'candy', say: 'the wires were cut clean. somebody brought cutters. there\'s a scuff on the floor. a skate wheel? no. a dolly wheel. a stocker\'s dolly.', text: 'Look around Elvis\'s stage (the sparkle in Candy)' },
      { t: 'talk', who: 'Trixie', say: 'a dolly? only stockers use dollies. and dustin. and dustin\'s been with the carts all week. he talks to them. they\'d tell me.', text: 'Tell Trixie what you found' },
      { t: 'goal', text: 'Make today\'s money goal' }],
    gossip: [[['a', 'somebody cut the lion\'s wires.'], ['b', 'who hurts a lion? a singing one?']], [['a', 'it was a dolly scuff. a STOCKER dolly.'], ['b', 'we have like three stockers. and one\'s brand new.']]],
    tease: 'Overheard in the break room: "there\'s an inspection coming. surprise inspection. but somebody already knows about it."' },
  { title: 'The Inspector', huddle: [['Deb', 'hon, a health inspector called. she\'s coming TODAY. surprise inspection. except it\'s not a surprise because she called.'], ['Gus', 'surprise inspections don\'t call. somebody sent her. somebody in a suit.'], ['Dolores', 'she\'ll check three things: no messes on the floor, the big cheese cold, and no empty aisles. keep it tight, boss.']],
    steps: [{ t: 'npc', npc: 'pruitt', zones: ['registers'], say: 'inspector pruitt, county health. i received a "concerned tip" about this establishment. i\'ll be looking around. floors. the big cheese. the shelves. carry on.', text: 'Meet the inspector by the registers' },
      { t: 'inspection', secs: 150, text: 'Pass the inspection: no spills, Big Cheese 40°F or under, no empty aisles' },
      { t: 'npc', npc: 'pruitt', zones: ['registers', 'cheese'], say: 'well. this store is... weirdly clean. the cheese is cold. the lion is, i assume, legal. you pass. between you and me, the "tip" came from an email with a valumax signature. sloppy.', text: 'Get the inspector\'s verdict' }],
    gossip: [[['a', 'did we pass?'], ['b', 'we passed. she smelled the big cheese. she said "hm". good "hm".']], [['a', 'valumax called the inspector on us.'], ['b', 'that\'s low. that\'s parking-lot low.']]],
    tease: 'Overheard in the break room: "the suit\'s coming back friday. with a bigger number."' },
  { title: 'Final Offer', huddle: [['Dolores', 'it\'s friday. the suit\'s back. he\'s in the cheese shop. he\'s been there since we opened. just. standing.'], ['Gus', 'he\'s standing too close to the big cheese. i don\'t like it.'], ['Philippe', 'he asked me for "the cheapest wine you have, for a celebration". he is celebrating early. how rude.']],
    steps: [{ t: 'npc', npc: 'chad', zones: ['cheese'], say: 'friday! big day. here\'s the new number. it has a lot of zeroes. sign it and you can retire on a beach. don\'t sign it and... well. things keep breaking, don\'t they? stores are fragile.', after: 'you hand the paper back unsigned. chad smiles like a shark at a buffet.', text: 'Talk to Chad in the Cheese Shop' },
      { t: 'inspect', clue: 'note', zone: 'stock', say: 'on the stock room desk: a note in block letters. "SELL. OR THE CHEESE GETS IT." somebody got in here. somebody with keys.', text: 'Check the stock room (the sparkle by the desk)' },
      { t: 'goal', text: 'Make Friday\'s money goal' }],
    gossip: [[['a', 'he threatened the CHEESE?'], ['b', 'the cheese did nothing to anybody.']], [['a', 'whoever left that note has keys.'], ['b', 'so it\'s one of us. great. love that.']]],
    tease: 'Overheard in the break room: "deb says the security cameras recorded everything. if somebody can work the VCR."' },
  { title: 'The Tape', huddle: [['Deb', 'week two, hon. i dug out the security tapes. the system is from 1998. it has a VCR. i don\'t know how to work a VCR.'], ['Dolores', 'i know how to work a VCR. i\'m not touching it. it\'s the boss\'s job.'], ['Gary', '...'], ['Dolores', 'gary\'s been quiet all morning. quieter than usual. which is a lot of quiet.']],
    steps: [{ t: 'talk', who: 'Deb', say: 'the monitor\'s on the stock room desk. press play. if it eats the tape, we never speak of it.', text: 'Get the security tape from Deb' },
      { t: 'inspect', clue: 'tape', zone: 'stock', say: 'grainy footage, 2:14 am: a figure in a hoodie pushing a stocker\'s dolly toward the freezers. and, at 6am in the lot: gary. talking to the suit.', text: 'Watch the tape on the stock room desk' },
      { t: 'talk', who: 'Gary', say: '...okay. yes. i talked to him. he offered me a manager job at valumax. i said no. i swear i said no. i just... thought about it for a second. i\'m sorry, boss.', text: 'Ask Gary about the parking lot' },
      { t: 'goal', text: 'Make today\'s money goal' }],
    gossip: [[['a', 'gary met the suit?'], ['b', 'gary says he said no. gary can\'t lie, his ears go red.']], [['a', 'a guy in a hoodie with a dolly.'], ['b', 'that narrows it down to every stocker in ohio.']]],
    tease: 'Overheard in the break room: "gary says the guy chad pays isn\'t him. it\'s somebody new."' },
  { title: 'Three Clues', huddle: [['Gary', 'boss. i heard chad on the phone in the lot. "my guy has keys. he\'s new. nobody suspects him." that\'s all i got.'], ['Hank', 'somebody new. with keys. hmm. HMM.'], ['Brent', 'that\'s so scary! i\'m gonna go stock something. far away. bye!'], ['Dolores', 'whoever it is leaves stuff behind. look around the store. trash, the deals rack, the beer cave.']],
    steps: [{ t: 'inspect', clue: 'receipt', zone: 'foodcourt', say: 'a receipt in the food court trash: VALUMAX GAS STATION, 1:48 am. 1 energy drink, 1 pair of wire cutters.', text: 'Search the food court (the sparkle)' },
      { t: 'inspect', clue: 'keys', zone: 'deals', say: 'tucked behind the dented cans: a key-cutting receipt. "3 copies, STOCK ROOM". paid in cash. signed with a little smiley face.', text: 'Search the Deals rack (the sparkle)' },
      { t: 'inspect', clue: 'badge', zone: 'beer', say: 'on the floor of the beer cave, half under a cooler: a name badge. SEASONAL STOCKER. the name\'s scratched off. but there\'s a smiley face drawn on it.', text: 'Search the beer cave (the sparkle)' },
      { t: 'goal', text: 'Make today\'s money goal' }],
    gossip: [[['a', 'a smiley face. on everything.'], ['b', 'who draws a smiley face on a crime?']], [['a', 'seasonal badge. we have ONE seasonal guy.'], ['b', 'don\'t say it. don\'t say it out loud yet.']]],
    tease: 'Overheard in the break room: "dolores wants to stake out the store tonight. she brought snacks. a LOT of snacks."' },
  { title: 'Stakeout', huddle: [['Dolores', 'tonight we stay late. you hide, the store goes dark, and we see who shows up.'], ['Gus', 'i\'ll stay too. if anybody touches the big cheese i will simply scream.'], ['Trixie', 'can i bring elvis? he\'s a good lookout. he never blinks.']],
    steps: [{ t: 'goal', text: 'Make today\'s money goal' },
      { t: 'stakeout', text: 'Close up, hide in the store, and catch whoever shows up' },
      { t: 'inspect', clue: 'hoodie', zone: 'cheese', say: 'he got away. but he dropped his hood on the way out. inside the hood: a stocker\'s cap. blue. a little smiley face on the brim.', text: 'Look at what he dropped (the sparkle in the Cheese Shop)' }],
    gossip: [[['a', 'are we really staking out the store?'], ['b', 'dolores bought night vision goggles. from the toy aisle. they\'re pink.']], [['a', 'i hope it\'s nobody we like.'], ['b', 'it\'s always somebody you like. that\'s how it works.']]],
    tease: 'Overheard in the break room: "brent didn\'t clock out last night. but he clocked in this morning. smiling."' },
  { title: 'Brent', huddle: [['Gus', 'a blue cap with a smiley face. we all know whose cap that is.'], ['Dolores', 'brent\'s on the floor right now. stocking. smiling. talk to him, boss. carefully.'], ['Hank', 'if he runs, he runs fast. i\'ve seen him chase a rolling melon.']],
    steps: [{ t: 'npc', npc: 'brent', zones: ['grocery', 'snacks', 'natural'], say: 'oh hey boss! is that... my cap? i can explain. no i can\'t. BYE.', text: 'Confront Brent' },
      { t: 'chase', npc: 'brent', text: 'Catch Brent!' },
      { t: 'npc', npc: 'brent', zones: [], say: 'okay okay okay. chad\'s my uncle. he said if i "made the store look bad" he\'d give me a car. i didn\'t even want a car. i wanted him to like me. tomorrow\'s the festival. he\'s bringing a bus of fake inspectors and a fake recall notice for the big cheese. i\'m so sorry.', text: 'Hear Brent out' },
      { t: 'talk', who: 'Dolores', say: 'so it\'s the festival. fine. let him come. we\'ll have the busiest day this store\'s ever had, and when he shows up, you get on the PA and tell everybody the truth. brent too.', text: 'Tell Dolores' }],
    gossip: [[['a', 'BRENT?'], ['b', 'the nice ones. it\'s always the nice ones.']], [['a', 'chad\'s his UNCLE.'], ['b', 'imagine thanksgiving at that house.']]],
    tease: 'Overheard in the break room: "tomorrow\'s the festival. tomorrow we finish this."' },
  { title: 'Showdown', huddle: [['Dolores', 'festival day. the biggest crowd of the year. chad\'s coming. let\'s have the best day this store\'s ever had.'], ['Brent', 'i\'ll tell everyone the truth. on the mic. if my voice cracks, ignore it.'], ['Gus', 'the big cheese is ready. i talked to it. it\'s ready.'], ['Trixie', 'elvis is ready too! i gave him extra honey!']],
    steps: [{ t: 'goal', text: 'Make the festival money goal' },
      { t: 'npc', npc: 'chad', zones: ['registers', 'custserv'], say: 'big crowd! perfect. my "inspectors" are in the lot with the "recall notice". sign now, and i\'ll tell them to go home. last chance, champ.', text: 'Face Chad by the entrance' },
      { t: 'pa', text: 'Get on the PA at Customer Service and tell everyone the truth' }],
    gossip: [[['a', 'it\'s happening.'], ['b', 'i\'ve never been this excited at work. i\'m usually just tired at work.']]],
    ending: [['Chad Sterling', 'you can\'t PROVE— ...they\'re booing me. why is everyone booing me. is that lion booing me?'], ['Brent', 'sorry, uncle chad. i like it here.'], ['Chad Sterling', 'this isn\'t over! ...it\'s pretty over. valumax is going to be so mad at me.'], ['Dolores', 'and STAY out. boss. you did it. the store\'s ours.'], ['Gus', 'the big cheese is crying. i\'m crying. we\'re all crying.'], ['Dolores', 'brent stays, by the way. on probation. with a smaller dolly.']],
    tease: 'Overheard in the break room: "best festival ever. somebody should make a game about this place."' },
];
// ---------- side quest: the Big Cheese heist (starts when you mess with the Big Cheese) ----------
const HEIST = { title: 'The Big Cheese Heist', huddle: [['Gus', 'BOSS. THE BIG CHEESE. IT\'S GONE. the case is EMPTY. 800 pounds of cheese, gone, overnight.'], ['Hank', 'who steals 800 pounds of cheese? HOW do you steal 800 pounds of cheese?'], ['Gus', 'there\'s a trail. crumbs. follow the crumbs, boss.']],
  steps: [{ t: 'inspect', clue: 'crumb1', zone: 'cheese', say: 'a crumb trail. aged cheddar. somebody\'s been nibbling while they rolled it. it heads out of the cheese shop.', text: 'Follow the crumbs (sparkle in the Cheese Shop)' },
    { t: 'inspect', clue: 'crumb2', zone: 'cookware', say: 'more crumbs, and wide dolly tracks. a big dolly. a cheese-sized dolly. heading for the food court.', text: 'Follow the crumbs (sparkle by Cookware)' },
    { t: 'inspect', clue: 'crumb3', zone: 'foodcourt', say: 'a flyer on a table: "CHEESE WHEEL COLLECTORS SOCIETY. annual swap meet. bring your best wheel." someone circled "best wheel" three times.', text: 'Follow the crumbs (sparkle in the food court)' },
    { t: 'npc', npc: 'moose', zones: ['foodcourt'], say: 'name\'s moose. moose larue. i collect wheels. this one\'s the crown jewel. finders keepers, skates. ...you want it back? catch me first!', text: 'Find the cheese collector in the food court' },
    { t: 'chase', npc: 'moose', text: 'Catch Moose LaRue!' },
    { t: 'talk', who: 'Gus', say: 'YOU FOUND IT. it\'s back in the case. it\'s cold. it\'s home. i\'m not crying. it\'s the cooler. it makes my eyes wet. here, take this. take ALL of this.', reward: 750, text: 'Bring the news to Gus' }],
  gossip: [[['a', 'somebody stole the big cheese.'], ['b', 'that cheese is older than me. it has a birthday.']]] };

// ---------- state ----------
function S() { if (!ST.story) ST.story = { ch: 0, step: 0, dayStarted: 0, done: false }; if (!ST.heist) ST.heist = { state: 'off', step: 0, day: 0 }; return ST.story; }
function mainChapter() { const s = S(); return s.done ? null : MAIN[s.ch]; }
function activeLines() { // [line id, chapter, step index] for everything running today
  const out = [], s = S(), h = ST.heist; const c = mainChapter(); if (c && s.dayStarted === ST.day) out.push(['main', c, s.step]);
  if (h.state === 'missing') out.push(['heist', HEIST, h.step]); return out;
}
function curStep(line) { if (line === 'main') { const c = mainChapter(); return c && S().dayStarted === ST.day ? c.steps[S().step] : null; } if (line === 'heist' && ST.heist.state === 'missing') return HEIST.steps[ST.heist.step]; return null; }
// called from startDay: today's chapter begins (the huddle plays once the day is on screen), the heist moves on
function storyStartDay() {
  const s = S(), h = ST.heist; RT.snpcs = []; RT.clues = []; RT.storyBits = { insp: null, chase: null };
  if (!s.done && s.dayStarted !== ST.day) { if (s.dayStarted && s.step >= MAIN[s.ch].steps.length) { s.ch++; s.step = 0; } if (s.ch >= MAIN.length) s.done = true; else { s.dayStarted = ST.day; RT.huddle = 'main'; } }
  if (h.state === 'hint' && ST.day > h.day) { h.state = 'missing'; h.step = 0; RT.huddleHeist = true; }
  for (const [line] of activeLines()) setupStep(line);
}
function chapterDone(line) { if (line === 'main') return S().step >= MAIN[S().ch].steps.length; return ST.heist.state === 'done'; }
function advance(line) {
  if (line === 'main') { const s = S(); s.step++; const c = MAIN[s.ch]; if (s.step >= c.steps.length) { toast(`Chapter ${s.ch + 1} done: ${c.title}.`, 'good'); MUSIC.sting('good'); if (c.ending) playScene(c.ending, () => { s.done = true; toast('The store is yours. Thanks for playing the story. The store keeps going.', 'good'); }); if (s.ch === MAIN.length - 1 && !c.ending) s.done = true; } else setupStep('main'); }
  else { const h = ST.heist; h.step++; if (h.step >= HEIST.steps.length) { h.state = 'done'; toast('Side quest done: The Big Cheese Heist.', 'good'); } else setupStep('heist'); }
  sfx('good'); saveMid();
}
// ---------- the pieces each step needs in the world ----------
function zoneSpot(zone) { // a floor tile in the zone you can stand next to (clues can't hide between shelves)
  if (zone === 'stock') { const S2 = W.stockRect; return [S2[0] + 12, S2[3] - 1]; }
  const ok = ([x, y]) => [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => inb(x + dx, y + dy) && !W.solid[idx(x + dx, y + dy)] && !W.outdoor[idx(x + dx, y + dy)]);
  const c = zoneTiles(zone).filter(ok); return c.length ? pick(Math.random, c) : randomZoneTile([zone]);
}
function setupStep(line) {
  const st = curStep(line); if (!st) return;
  if (st.t === 'npc' || st.t === 'chase') spawnSnpc(st.npc, st.zones || []);
  if (st.t === 'inspect' && !RT.clues.find(c => c.clue === st.clue)) { let t = zoneSpot(st.zone); if (st.clue === 'note' || st.clue === 'tape') t = [47, 11]; if (t) RT.clues.push({ clue: st.clue, line, x: t[0], y: t[1] }); }
  if (st.t === 'mop') { RT.storyMop = 0; for (let i = 0; i < st.n; i++) { const t = randomZoneTile([st.zone]); if (t && !RT.spills.find(s => s.x === t[0] && s.y === t[1])) RT.spills.push({ id: RT.nextId++, x: t[0], y: t[1], kind: st.kind, hp: 2, story: true }); } }
  if (st.t === 'fix' && ST.anims[st.anim]) { ST.anims[st.anim].broken = true; ST.anims[st.anim].fix = 0; }
  if (st.t === 'inspection') RT.storyBits.insp = { t: st.secs };
}
function spawnSnpc(id, zones) {
  if (RT.snpcs.find(n => n.id === id)) return; const t = zones.length ? randomZoneTile(zones) : [Math.floor(PL.x / T), Math.floor(PL.y / T) + 1]; if (!t) return;
  RT.snpcs.push({ id, name: SNPC_NAMES[id], look: SNPC_LOOKS[id], x: (t[0] + 0.5) * T, y: (t[1] + 0.7) * T, dir: 'down', frame: 0, anim: 0, path: null, pi: 0, state: 'idle', timer: 3, zones });
}
// ---------- talking: story lines get first say with anyone they involve ----------
function storyTalk(name) {
  for (const [line] of activeLines()) { const st = curStep(line); if (st && st.t === 'talk' && st.who === name) { showDialog(name, st.say, () => { if (st.reward) { addMoney(st.reward, PL.x, PL.y - 30); RT.day.quest += st.reward; } advance(line); }, st.reward ? `+${fmtMoney(st.reward)}` : null); return true; } }
  return false;
}
function talkSnpc(n) {
  sfx('talk'); for (const [line] of activeLines()) { const st = curStep(line);
    if (st && st.t === 'npc' && st.npc === n.id) { showDialog(n.name, st.say, () => { if (st.after) showDialog(n.name, st.after, () => advance(line)); else advance(line); if (n.id === 'moose' || (n.id === 'brent' && /BYE/.test(st.say))) { n.state = 'flee'; } }); return; } }
  showDialog(n.name, { chad: 'i\'m not here. i\'m a customer. i\'m customering.', brent: 'just stocking! lots to stock! busy busy!', pruitt: 'i\'m working. please don\'t skate near my clipboard.', moose: 'you\'ll never catch me, skates.', hood: '...' }[n.id] || '...');
}
// ---------- every frame ----------
function updateStory(dt) {
  if (!RT.snpcs) return; S();
  if (RT.huddle && !RT.dialog && !RT.menu && RT.dayT > 0.3) { const c = MAIN[S().ch]; RT.huddle = null; playScene([[`Chapter ${S().ch + 1}: ${c.title}`, `${weekday()} morning. the crew huddles up in the stock room before the doors open.`]].concat(c.huddle), () => { if (RT.huddleHeist) { RT.huddleHeist = false; playScene(HEIST.huddle); } }); }
  else if (RT.huddleHeist && !RT.huddle && !RT.dialog && !RT.menu && RT.dayT > 0.3 && !mainChapter()) { RT.huddleHeist = false; playScene(HEIST.huddle); }
  for (const n of RT.snpcs) updateSnpc(n, dt);
  for (const [line] of activeLines()) { const st = curStep(line); if (!st) continue;
    if ((st.t === 'npc' || st.t === 'chase') && !RT.snpcs.find(n => n.id === st.npc)) spawnSnpc(st.npc, st.zones || ['registers']); // whoever the step needs is always somewhere
    if (st.t === 'goal' && earnedToday() >= dayGoal()) advance(line);
    else if (st.t === 'mop' && !RT.spills.some(s => s.story)) advance(line);
    else if (st.t === 'fix' && ST.anims[st.anim] && !ST.anims[st.anim].broken) advance(line);
    else if (st.t === 'chase') { const n = RT.snpcs.find(n => n.id === st.npc); if (n && Math.hypot(n.x - PL.x, n.y - PL.y) < 18) { n.state = 'caught'; n.timer = 999; floatText(n.x, n.y - 30, 'GOTCHA', '#ffe14d'); sfx('good'); if (line === 'heist') { const g = W.objs.find(o => o.type === 'bigcheese'); if (g) g.hidden = false; ST.heist.cheeseBack = true; showDialog(n.name, 'fine! FINE. take your wheel. it\'s too heavy anyway. my back is ruined.', () => { RT.snpcs = RT.snpcs.filter(x => x !== n); advance(line); }); } else advance(line); } }
    else if (st.t === 'inspection') { const ins = RT.storyBits.insp; if (ins) { ins.t -= dt; const ok = !RT.spills.length && ST.cheeseTemp <= 40 && !DEPTS.some(d => d.max && deptOpen(d) && fill(d.id) < 0.15);
        if (ok && ins.t < st.secs - 20) { RT.storyBits.insp = null; advance(line); } else if (ins.t <= 0) { ins.t = 120; toast('Inspector Pruitt: "i\'ll take another lap. you have two more minutes."', 'warn'); } } }
    else if (st.t === 'stakeout' && RT.stakeout === 'done') { RT.stakeout = null; advance(line); }
  }
  if (RT.stakeout === 'on') updateStakeout(dt);
}
function updateSnpc(n, dt) {
  if (n.state === 'caught') { n.frame = 0; return; }
  if (n.state === 'flee') { // run from the boss toward a far tile, re-pick when close or arrived
    const sp = (PL.walk ? 50 : maxSpeed()) * 0.82; if (!n.path || n.pi >= n.path.length || (n.repick = (n.repick || 0) - dt) <= 0) { n.repick = 2.5; let best = null, bd = -1; for (let k = 0; k < 14; k++) { const zs = DEPTS.filter(d => d.max && deptOpen(d)).map(d => d.id), t = randomZoneTile([pick(Math.random, zs)]); if (!t) continue; const d = Math.hypot(t[0] * T - PL.x, t[1] * T - PL.y); if (d > bd) { bd = d; best = t; } } if (best) goTo(n, best[0] + 0.5, best[1] + 0.7); }
    stepPath(n, dt, sp); if (Math.random() < dt * 0.6) bubble(n, pick(Math.random, ['nope!', 'can\'t catch me!', 'NOT TODAY', 'excuse me! sorry! excuse me!']), 1.2); if (n.bubble) { n.bubble.t -= dt; if (n.bubble.t <= 0) n.bubble = null; } return; }
  if (n.bubble) { n.bubble.t -= dt; if (n.bubble.t <= 0) n.bubble = null; }
  if (n.state === 'walk') { if (stepPath(n, dt, 40)) { n.state = 'idle'; n.timer = 3 + Math.random() * 4; } return; }
  n.timer -= dt; n.frame = 0; if (n.timer > 0) return; if (n.zones.length) { const t = randomZoneTile(n.zones); if (t) { n.state = 'walk'; goTo(n, t[0] + 0.5, t[1] + 0.7); } } else n.timer = 5;
}
function snpcNear(px, py, r) { let best = null, bd = r; for (const n of RT.snpcs || []) { const d = Math.hypot(n.x - px, n.y - 4 - py); if (d < bd) { bd = d; best = n; } } return best; }
function clueAt(tx, ty) { return (RT.clues || []).find(c => c.x === tx && c.y === ty) || null; }
function inspectClue(c) {
  RT.clues = RT.clues.filter(x => x !== c); const st = curStep(c.line); sparkle(c.x * T + 8, c.y * T + 8);
  if (st && st.t === 'inspect' && st.clue === c.clue) showDialog('Clue', st.say, () => advance(c.line)); else showDialog('Clue', 'nothing new here.');
}
// a short scene: lines in order, each with the speaker's portrait
function playScene(lines, done) { const go = i => { if (i >= lines.length) return done && done(); const [who, text] = lines[i]; showDialog(who, text, () => go(i + 1)); }; go(0); }

// ---------- the stakeout: after closing on chapter 8, the store goes dark and someone shows up ----------
function stakeoutStep() { const st = curStep('main'); return st && st.t === 'stakeout'; }
function startStakeout() {
  RT.stakeout = 'on'; RT.stakeT = 40; ST.minute = 23 * 60; RT.custs = []; const S2 = W.stockRect; PL.x = (S2[0] + 8.5) * T; PL.y = (S2[3] + 3.7) * T; PL.dir = 'down';
  RT.snpcs = RT.snpcs.filter(n => n.id !== 'hood'); spawnSnpc('hood', ['cheese']); const h = RT.snpcs.find(n => n.id === 'hood'); if (h) h.state = 'idle';
  playScene([['Dolores', '(whispering) okay. lights off. he\'ll go for the big cheese. when you see him, GO.'], ['Gus', '(whispering) if he touches it i\'m screaming.']]);
}
function updateStakeout(dt) {
  RT.stakeT -= dt; const h = RT.snpcs.find(n => n.id === 'hood');
  if (h && h.state !== 'flee' && Math.hypot(h.x - PL.x, h.y - PL.y) < 6 * T) { h.state = 'flee'; bubble(h, '!!!', 1.5); }
  if (h && h.state === 'flee' && Math.hypot(h.x - PL.x, h.y - PL.y) < 18) { RT.snpcs = RT.snpcs.filter(n => n !== h); RT.stakeout = 'over'; showDialog('The Hooded Figure', '(he wriggles out of his hoodie and bolts out the exit, leaving it in your hands)', () => { RT.stakeout = 'done'; }); return; }
  if (RT.stakeT <= 0) { RT.snpcs = RT.snpcs.filter(n => n !== h); RT.stakeout = 'over'; showDialog('Dolores', 'he\'s out the exit! too fast. but look, he dropped something by the cheese.', () => { RT.stakeout = 'done'; }); }
}

// ---------- favors: a shopper asks you to fetch something from an aisle ----------
const FAVOR_ASK = ['hey, could you grab me {item} from {dept}? my knees don\'t do aisles anymore.', 'i\'m holding my spot in line. can you get me {item}? it\'s in {dept}. i think.', 'my kid hid somewhere and i can\'t leave this spot. could you get {item} from {dept}?', 'i forgot {item}. it\'s in {dept}. i\'ll tip. i\'m a good tipper. ask anybody.'];
const FAVOR_THANKS = ['you\'re an angel on wheels.', 'perfect! here, for your trouble.', 'oh you got the good one. here.', 'you didn\'t have to do that. but you did. here.'];
function maybeFavor(dt) {
  if (RT.favor || ST.phase !== 'day' || (RT.favorT = (RT.favorT ?? 30) - dt) > 0) return; RT.favorT = 50 + Math.random() * 40;
  const c = pick(Math.random, RT.custs.filter(c => c.type !== 'kid' && c.state === 'browse' && !custOutside(c) && c.list.length)); if (!c) return;
  const d = DEPT[pick(Math.random, DEPTS.filter(d => d.max && deptOpen(d) && d.items && d.id !== c.cur).map(d => d.id))]; if (!d) return;
  c.state = 'favor'; c.timer = 150; c.path = null; c.favor = { dept: d.id, item: pick(Math.random, d.items), state: 'ask' }; bubble(c, '!', 999, 'favor');
}
function talkFavor(c) {
  const f = c.favor, name = personaName(c);
  if (f.state === 'ask') { f.state = 'fetch'; RT.favor = c; return showDialog(name, pick(Math.random, FAVOR_ASK).replace('{item}', f.item).replace('{dept}', DEPT[f.dept].name.replace('International: ', '')), null, `Go to ${DEPT[f.dept].name}, face a shelf there and press Space to take ${f.item}.`, null, faceOf(c, 'n')); }
  if (f.state === 'got') { const tip = 6 + Math.round(Math.random() * 10); addMoney(tip, c.x, c.y - 26); RT.day.tips += tip; moodHit(c, 20); RT.favor = null; c.favor = null; c.bubble = null; PL.item = null; c.state = 'walk'; nextTask(c); questEvent('help'); return showDialog(name, pick(Math.random, FAVOR_THANKS), null, `+${fmtMoney(tip)}`, null, faceOf(c, 'happy')); }
  showDialog(name, `${f.item}. from ${DEPT[f.dept].name.replace('International: ', '').toLowerCase()}. please.`, null, null, null, faceOf(c, 'n'));
}
function updateFavorCust(c, dt) { c.frame = 0; c.timer -= dt; if (c.timer <= 0) { if (RT.favor === c) { RT.favor = null; PL.item = null; } c.favor = null; c.bubble = null; bubble(c, 'forget it. i\'ll get it myself.', 3, 'mad'); moodHit(c, -6); c.state = 'walk'; nextTask(c); } }
// ---------- aisles: Space on a shelf tells you what's there (and lets you pick an item for a favor) ----------
const AISLE_JOKES = ['a jar with no english on it. it\'s winking at you.', 'a can you\'re pretty sure is from 2014.', 'something labelled "spicy" that\'s labelled "spicy" four times.', 'a box with a cartoon animal that looks nervous.', 'the exact thing someone asked you for last tuesday.', 'a family-size bag that no family needs.'];
function shelfInfo(o, dept) {
  if (RT.favor && RT.favor.favor && RT.favor.favor.state === 'fetch' && RT.favor.favor.dept === dept.id) return { act: 'pickitem', o, dept, label: `Space: take ${RT.favor.favor.item} for ${personaName(RT.favor)}` };
  return { act: 'browse', o, dept, label: `${dept.name}: ${ST.stock[dept.id]}/${dept.max}. Space: look at the shelf` };
}
function browseShelf(t) {
  const d = t.dept, lab = (W.labels.find(l => Math.abs(l.y - (t.o.y + 1.05)) < 0.1 && Math.abs(l.x - t.o.x) < 6) || {}).text;
  flash(`${lab || d.name.replace('International: ', '')}: ${(d.items || []).slice(0, 3).join(', ')}... and ${pick(Math.random, AISLE_JOKES)}`);
}
function pickItem(t) { const c = RT.favor; if (!c || !c.favor) return; c.favor.state = 'got'; PL.item = c.favor.item; sfx('pick'); toast(`Got ${c.favor.item}. Bring it to ${personaName(c)}.`, 'good'); }

// ---------- what the quest log + markers show ----------
function storyTarget() { // where the main / heist step wants you: [px, py] or null
  for (const [line] of activeLines()) { const st = curStep(line); if (!st) continue;
    if (st.t === 'talk') { const g = (W.givers || []).find(g => g.gv.name === st.who); if (g) return [g.px, g.py]; const s = RT.staff.find(s => s.name === st.who); if (s) return [s.x, s.y]; }
    if (st.t === 'npc' || st.t === 'chase') { const n = (RT.snpcs || []).find(n => n.id === st.npc); if (n) return [n.x, n.y]; }
    if (st.t === 'inspect') { const c = (RT.clues || []).find(c => c.clue === st.clue); if (c) return [c.x * T + 8, c.y * T + 12]; }
    if (st.t === 'pa') return [80 * T + 8, 54 * T + 12];
    if (st.t === 'stakeout' && RT.goalHit) { const b = W.spots.bed; return [b[0] * T, b[1] * T]; }
  }
  if (RT.favor && RT.favor.favor && RT.favor.favor.state === 'got') return [RT.favor.x, RT.favor.y];
  return null;
}
function storyLogHTML() {
  const s = S(), h = ST.heist, c = mainChapter(); let out = '';
  if (c) { const st = s.dayStarted === ST.day ? c.steps[s.step] : null; out += `<h3>Main story · Chapter ${s.ch + 1} of ${MAIN.length}: ${typo(c.title)}</h3><div>${st ? typo(st.text) + (st.t === 'inspection' && RT.storyBits.insp ? ` <b class="money">${Math.ceil(RT.storyBits.insp.t)}s</b>` : '') : 'Next chapter starts tomorrow morning.'}</div>`; }
  else out += `<h3>Main story</h3><div>The Buyout is over. The store is yours.</div>`;
  if (h.state === 'missing') out += `<h3>Side quest: ${HEIST.title}</h3><div>${typo(HEIST.steps[h.step].text)}</div>`;
  if (RT.favor && RT.favor.favor) out += `<h3>Favor for ${typo(personaName(RT.favor))}</h3><div>${RT.favor.favor.state === 'got' ? `Bring ${RT.favor.favor.item} back.` : `Get ${RT.favor.favor.item} from ${DEPT[RT.favor.favor.dept].name}.`}</div>`;
  return out;
}
function storyGossip(a, b) { if (Math.random() < 0.45) return null; const pools = []; const c = mainChapter(); if (c && S().dayStarted === ST.day) pools.push(...c.gossip); if (ST.heist.state === 'missing') pools.push(...HEIST.gossip); return pools.length ? pick(Math.random, pools) : null; }
function drawStory() { // story people, clue sparkles, the purple star over where the story wants you
  const g = R.g, SC = R.SC;
  for (const c of RT.clues || []) { const x = c.x * T + 8, y = c.y * T + 8; if (!onScreen(x, y)) continue; for (let i = 0; i < 2; i++) if (Math.random() < 0.3) RT.parts.push({ x: x + (Math.random() - 0.5) * 12, y: y + (Math.random() - 0.5) * 8, vx: 0, vy: -14, t: 0.5, c: pick(Math.random, ['#e0b0ff', '#ffffff', '#ffe14d']) }); }
  const tg = storyTarget(); if (!tg || RT.menu || RT.dialog) return; const x = sx(tg[0]), y = sy(tg[1] - 34), m = 30 * SC;
  if (x > m && x < R.cv.width - m && y > m && y < R.cv.height - m) { questMarkStar(x, y); return; }
  const cx = R.cv.width / 2, cy = R.cv.height / 2, a = Math.atan2(y - cy, x - cx), k = Math.min((R.cv.width / 2 - m) / Math.abs(Math.cos(a) || 1e-6), (R.cv.height / 2 - m) / Math.abs(Math.sin(a) || 1e-6));
  g.save(); g.translate(cx + Math.cos(a) * k, cy + Math.sin(a) * k); g.rotate(a); g.fillStyle = '#c890ff'; g.strokeStyle = '#2a1d22'; g.lineWidth = 1.5 * SC; g.beginPath(); g.moveTo(11 * SC, 0); g.lineTo(-6 * SC, -8 * SC); g.lineTo(-2 * SC, 0); g.lineTo(-6 * SC, 8 * SC); g.closePath(); g.fill(); g.stroke(); g.restore();
}
function questMarkStar(x, y) { const g = R.g, SC = R.SC, bob = Math.round(Math.sin(R.t * 5) * 1.5) * SC; g.font = `${Math.round(11 * SC)}px "Press Start 2P", monospace`; g.textAlign = 'center'; g.lineWidth = 3 * SC; g.strokeStyle = '#2a1d22'; g.strokeText('*', x, y + bob + 4 * SC); g.fillStyle = '#c890ff'; g.fillText('*', x, y + bob + 4 * SC); g.textAlign = 'left'; }
