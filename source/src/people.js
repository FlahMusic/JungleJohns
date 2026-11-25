// ===== people: everyone in the store is somebody =====
// every shopper gets a persona (name, attitude, how much patience they have, what they'll overshare). regulars come back
// on different days in different clothes and their lives move on between visits. talk to someone too much and they get
// irritated, then storm off or shove you. shoppers talk, bicker and bump carts with each other.

// ---------- portraits (32x32, drawn from the same look as the walking sprite) ----------
function portraitSprite(o, expr) {
  return spr(`face_${o.key}_${expr || 'n'}`, 32, 32, g => {
    const sk = o.skin, sd = shade(sk, -0.18), hair = o.hair, shirt = o.shirt;
    // shoulders + shirt
    P(g, 3, 25, 26, 7, shirt); P(g, 3, 25, 26, 1, shade(shirt, 0.25)); P(g, 25, 26, 4, 6, shade(shirt, -0.2));
    if (o.pattern === 'stripe') { P(g, 3, 27, 26, 1, o.pc); P(g, 3, 30, 26, 1, o.pc); }
    if (o.pattern === 'logo') { P(g, 19, 28, 3, 3, o.pc); }
    if (o.pattern === 'flowers') for (const [x, y] of [[6, 27], [22, 29], [11, 30]]) { P(g, x, y, 1, 1, '#ff8fc0'); P(g, x + 1, y, 1, 1, '#fff6a0'); }
    if (o.apron) P(g, 9, 26, 14, 6, o.apron);
    P(g, 13, 22, 6, 4, sd); P(g, 13, 23, 6, 2, sk);
    // head
    [[4, 8], [2, 12], [1, 14], [1, 14], [0, 16], [0, 16], [0, 16], [0, 16], [0, 16], [0, 16], [0, 16], [1, 14], [1, 14], [2, 12], [3, 10], [5, 6]].forEach(([ox, w], i) => P(g, 8 + ox, 6 + i, w, 1, sk));
    P(g, 22, 9, 2, 10, sd); P(g, 7, 12, 1, 4, sk); P(g, 24, 12, 1, 4, sd); // ears
    const mad = expr === 'mad' || expr === 'fume', happy = expr === 'happy';
    // brows + eyes
    const bc = o.old ? '#d0d0d8' : shade(hair, -0.1);
    if (mad) { P(g, 10, 11, 4, 1, bc); P(g, 12, 10, 2, 1, bc); P(g, 18, 11, 4, 1, bc); P(g, 18, 10, 2, 1, bc); } else { P(g, 10, 10, 4, 1, bc); P(g, 18, 10, 4, 1, bc); }
    if (happy) { P(g, 11, 13, 3, 1, '#2a1b1b'); P(g, 18, 13, 3, 1, '#2a1b1b'); } else { P(g, 11, 12, 3, 3, '#2a1b1b'); P(g, 18, 12, 3, 3, '#2a1b1b'); P(g, 11, 12, 1, 1, '#ffffff'); P(g, 18, 12, 1, 1, '#ffffff'); }
    P(g, 15, 15, 2, 2, sd); P(g, 9, 16, 2, 1, '#f0a0a0'); P(g, 21, 16, 2, 1, '#f0a0a0');
    if (o.old) { P(g, 9, 15, 2, 1, sd); P(g, 21, 15, 2, 1, sd); }
    // mouth
    if (happy) { P(g, 13, 18, 6, 1, '#8a3a2a'); P(g, 12, 17, 1, 1, '#8a3a2a'); P(g, 19, 17, 1, 1, '#8a3a2a'); P(g, 14, 19, 4, 1, '#c85a4a'); }
    else if (mad) { P(g, 13, 19, 6, 1, '#8a3a2a'); P(g, 12, 20, 1, 1, '#8a3a2a'); P(g, 19, 20, 1, 1, '#8a3a2a'); if (expr === 'fume') { P(g, 25, 4, 2, 2, '#ffffff'); P(g, 27, 2, 2, 2, '#e8e8f0'); P(g, 9, 16, 3, 1, '#ff6a5a'); P(g, 20, 16, 3, 1, '#ff6a5a'); } }
    else P(g, 13, 18, 6, 1, '#8a3a2a');
    // beard
    if (o.beard) { const b = shade(hair, -0.05); P(g, 8, 15, 2, 4, b); P(g, 22, 15, 2, 4, b); P(g, 9, 18, 14, 2, b); P(g, 10, 20, 12, 2, b); P(g, 12, 22, 8, 1, b); P(g, 13, 18, 6, 1, happy ? '#c85a4a' : '#6a3a3a'); }
    // hair / hats
    const st = o.style, hl = shade(hair, 0.3);
    const top = () => { P(g, 9, 3, 14, 3, hair); P(g, 7, 5, 18, 3, hair); P(g, 11, 3, 6, 1, hl); };
    if (st === 'cap') { const c = o.hat; P(g, 8, 3, 16, 5, c); P(g, 6, 7, 20, 2, shade(c, -0.3)); P(g, 10, 3, 5, 1, shade(c, 0.35)); P(g, 7, 9, 2, 4, hair); P(g, 23, 9, 2, 4, hair); }
    else if (st === 'beanie') { const c = o.hat; P(g, 7, 2, 18, 7, c); P(g, 7, 8, 18, 2, shade(c, -0.3)); for (let x = 9; x < 24; x += 3) P(g, x, 4, 1, 4, shade(c, -0.15)); disc(g, 16, 1, 2, '#f4f4f0'); }
    else if (st === 'propeller') { P(g, 7, 3, 9, 6, '#e23a2e'); P(g, 16, 3, 9, 6, '#2e7de2'); P(g, 15, 0, 2, 3, '#6a6f78'); P(g, 9, 0, 14, 1, '#f2c230'); }
    else if (st === 'sunhat') { P(g, 9, 0, 14, 5, '#f0e2b0'); P(g, 9, 4, 14, 1, '#d8342a'); P(g, 2, 6, 28, 3, '#e8d8a0'); P(g, 2, 6, 28, 1, '#f8ecc0'); }
    else if (st === 'bald') { P(g, 7, 9, 2, 5, hair); P(g, 23, 9, 2, 5, hair); P(g, 12, 6, 4, 1, shade(sk, 0.3)); }
    else { top(); P(g, 7, 8, 2, 6, hair); P(g, 23, 8, 2, 6, hair);
      if (st === 'long') { P(g, 5, 8, 4, 16, hair); P(g, 23, 8, 4, 16, hair); }
      if (st === 'bun') disc(g, 16, 1, 3, hair);
      if (st === 'pony') { P(g, 25, 7, 3, 9, hair); }
      if (st === 'curly') { for (let x = 7; x < 26; x += 3) disc(g, x, 4, 2, hair); P(g, 5, 7, 3, 8, hair); P(g, 24, 7, 3, 8, hair); } }
    if (o.glasses) { const f = o.glasses, sun = f === '#1a1a24'; P(g, 9, 11, 6, 1, f); P(g, 17, 11, 6, 1, f); P(g, 9, 11, 1, 5, f); P(g, 14, 11, 1, 5, f); P(g, 17, 11, 1, 5, f); P(g, 22, 11, 1, 5, f); P(g, 9, 15, 6, 1, f); P(g, 17, 15, 6, 1, f); P(g, 15, 12, 2, 1, f);
      if (sun) { P(g, 10, 12, 4, 3, '#1a1a24'); P(g, 18, 12, 4, 3, '#1a1a24'); P(g, 10, 12, 1, 1, '#6a8aff'); } }
    if (o.costume === 'jogger') P(g, 7, 7, 18, 2, '#e23a2e');
    if (o.costume === 'banana') { for (let y = 0; y < 32; y++) { const w = Math.round(13 - Math.abs(y - 16) * 0.35); P(g, 16 - w - 3, y, 4, 1, '#f6d83a'); P(g, 16 + w - 1, y, 4, 1, '#dcae1c'); } P(g, 6, 0, 20, 5, '#f6d83a'); P(g, 15, -2, 2, 4, '#6a4a1a'); }
    if (o.parrot) { P(g, 24, 18, 6, 6, '#2fa84f'); P(g, 25, 16, 4, 3, '#2fa84f'); P(g, 28, 17, 2, 2, '#f2c230'); P(g, 26, 17, 1, 1, '#1a1a1a'); P(g, 24, 22, 2, 4, '#d8342a'); }
  }, true);
}
// characters that are props (Elvis, Corn, Butter, Todd...) get their sprite framed into a portrait
function propPortrait(name, frame, sx, sy, sw, sh) {
  return spr(`face_prop_${name}_${frame}_${sx}_${sy}`, 32, 32, g => { const s = propSprite(name, frame); if (s) { g.imageSmoothingEnabled = false; g.drawImage(s, sx, sy, sw, sh, 0, 0, 32, 32); } });
}
const PROP_FACES = { 'Elvis (from somewhere)': ['elvis', 0, 5, 0, 24, 24], 'Corn': ['corn', 0, 1, 1, 16, 16], 'Butter': ['corn', 0, 18, 4, 16, 16], 'Todd': ['todd', 0, 0, 0, 10, 7], 'Captain Todd': ['todd', 0, 0, 0, 10, 7], 'The Hippo': ['pond', 0, 26, 12, 22, 16] };

// ---------- names, attitudes, oversharing ----------
const FIRST_NAMES = ['Barb', 'Steve', 'Tammy', 'Doug', 'Keisha', 'Raj', 'Brenda', 'Luis', 'Megan', 'Ron', 'Jolene', 'Tyrone', 'Ashley', 'Gene', 'Mei', 'Darnell', 'Patty', 'Kyle', 'Nadia', 'Hal', 'Crystal', 'Omar', 'Debbie', 'Travis', 'Yolanda', 'Chet', 'Priscilla', 'Bo', 'Wendy', 'Marco', 'Gloria', 'Trent', 'Ingrid', 'Duane', 'Fatima', 'Lyle'];
// patience = how many times you can talk to them before they snap. line pools per attitude: hi (first time), more (second), annoyed, snap.
const ATTITUDES = {
  chatty:   { patience: 6, hi: ['oh hi! okay so. funny you should ask.', 'you work here? perfect. i have to tell somebody this.', 'hiii. okay don\'t judge me but.'], more: ['anyway that\'s my whole life. what\'s yours like?', 'sorry, i talk when i\'m nervous. and when i\'m not nervous.', 'oh and ANOTHER thing.'] },
  grumpy:   { patience: 2, hi: ['what.', 'make it quick, skates.', 'i\'m not here to make friends.'], more: ['still here?', 'i said what i said.', 'you\'re blocking the pickles.'] },
  sweet:    { patience: 7, hi: ['oh, aren\'t you a dear.', 'hello sweetheart! you look busy.', 'well hello there, roller man.'], more: ['you remind me of my nephew. he also never sits down.', 'have you eaten today? you should eat.', 'i\'ll let you get back to it, hon. or not! i\'m fine either way.'] },
  rushed:   { patience: 1, hi: ['can\'t talk, double parked.', 'sorry, i have nine minutes to live my life.', 'no time. love the skates. bye.'], more: ['still can\'t talk.', 'i\'m LITERALLY leaving.'] },
  anxious:  { patience: 4, hi: ['oh! sorry. am i in the way? i\'m always in the way.', 'is it okay that i\'m here? like in general?', 'hi. sorry. hi.'], more: ['i\'ve walked past the tahini four times. i can\'t commit.', 'do you think the lion is mad at me.'] },
  showoff:  { patience: 3, hi: ['you probably recognize me.', 'nice skates. i used to compete. regionals.', 'don\'t mind me, just carb loading.'], more: ['i could do your job. faster. backwards.', 'feel this arm. no don\'t. but you could.'] },
  conspiracy: { patience: 6, hi: ['don\'t look at the cameras. act natural.', 'you ever notice the lion never blinks?', 'keep your voice down. they\'re listening. the produce.'], more: ['the monorail doesn\'t go anywhere. ask yourself why.', 'seventy thousand products. who counted? WHO COUNTED.', 'the big cheese is hollow. i\'m just saying what i heard.'] },
  oblivious: { patience: 8, hi: ['oh hey. is this the bank?', 'hello! where am i.', 'nice place. i came in for a haircut.'], more: ['i think i parked in a different state.', 'do you guys sell stamps. or boats. either.'] },
  influencer: { patience: 3, hi: ['omg can you be in my video? say "jungle vibes".', 'hold on i\'m live. say hi to 14 people.', 'okay act natural. no, more natural.'], more: ['the lighting in the cheese shop is SO good.', 'can you skate past me again but slower and sadder?'] },
  tired:    { patience: 3, hi: ['i haven\'t slept since 2019.', 'hi. i have four kids. two of them are here. somewhere.', 'is it still tuesday?'], more: ['i\'m going to sit in the beer cave and just breathe.', 'if you see a kid in a dinosaur costume, he\'s mine. probably.'] },
};
const ANNOYED = ['okay...', 'is there something you need?', 'you\'re still here.', 'buddy. i\'m shopping.', 'do you talk to everybody this much?', 'i\'m gonna need you to skate along now.', 'we\'ve covered this.', 'you got a quota or something?', 'i feel like you\'re testing me.', 'personal space, skates.'];
const FUMING = ['STOP. TALKING. TO ME.', 'i will call your manager. oh wait.', 'i swear to god, roller boy.', 'one more word and i\'m leaving a review.', 'BACK. OFF.', 'i\'m about to lose it in the produce section.'];
const STORM = ['that\'s IT. i\'m leaving. i\'m buying my groceries at a NORMAL store.', 'forget it. FORGET IT. i\'m out.', 'i didn\'t even want this cart!', 'you\'ve ruined pickles for me. goodbye.'];
const SHOVE = ['GET. OUT. OF MY. FACE.', 'MOVE.', 'personal SPACE!', 'shoo! SHOO!'];
const COLD = ['no.', '...', 'we\'re done.', 'don\'t.', 'nope.'];
// random oversharing, the stuff strangers tell grocery store employees
const OVERSHARE = [
  'my husband thinks i\'m at pilates. i am at the cheese shop. this is my pilates.',
  'i just got dumped over text. so i\'m buying a cake. a whole one. for me.',
  'i named my roomba kevin and now i feel bad when it bumps into stuff.',
  'my mother-in-law is coming and i\'m buying ingredients to cook "from scratch". i\'m buying a rotisserie chicken and lying.',
  'i got a tattoo of my ex\'s name. i\'m here for a lot of ice cream and a plan.',
  'my kid told his teacher i\'m a "professional napper". i\'m an accountant. he\'s not wrong though.',
  'i\'ve been on hold with the cable company for two hours. i\'m on hold right now. this is my life now.',
  'my dog ate a whole stick of butter yesterday and he\'s never been happier.',
  'my wife and i are doing a no-spending month. this is day three. don\'t tell her.',
  'i\'m 41 and i still don\'t know what a parsnip is for.',
  'i\'m hosting book club and nobody read the book. so the cheese has to be really good.',
  'i accidentally replied-all to the whole company with a picture of my foot. so. personal day.',
  'my cat has a better skincare routine than me. i\'m buying her salmon.',
  'my neighbor has a pickleball court. the noise. the NOISE. i\'m stress shopping.',
  'i lost a bet and have to eat the hottest sauce you sell on camera. i\'m saying goodbye to my tongue.',
  'my grandpa\'s 90th is today and all he wants is "the weird soda from germany". so here i am.',
  'i tried to make sourdough during the pandemic. we don\'t talk about what happened to the starter.',
  'i\'m on a first date right now. she\'s in the wine aisle. i panicked and came over here.',
  'my therapist says i should "do something just for me". so. i\'m smelling candles.',
  'my car makes a noise like a duck when i turn left. so i only turn right now. took me 40 minutes to get here.',
  'i\'m a vegetarian but the jerky guy is very persuasive.',
  'my teenager won\'t talk to me unless i bring home those mexican cokes. it\'s the only currency.',
  'i got married last weekend. i\'m still finding rice in places.',
  'i\'m a dentist. i\'m buying four pounds of candy. we don\'t have to discuss it.',
  'my goldfish is turning nine. nine. that\'s not normal. i\'m getting him the good flakes.',
  'i quit my job this morning. i don\'t have a plan. i have a cart.',
  'my brother owes me $40 and i saw him in produce. i\'m tailing him.',
  'i drove two hours for a cheese i saw on tiktok. it better change my life.',
  'my wife\'s pregnant and she wants pickles dipped in ice cream. at 2 am. so i\'m stocking up.',
  'my bird learned to say "where\'s my money". i don\'t know who taught him.',
];

// ---------- the regulars: they come back, in different clothes, and their stories move on each day you talk ----------
const REGULARS = [
  { id: 'carol', name: 'Carol', type: 'old', look: { skin: '#f6d3b3', hair: '#e8e8f0', style: 'curly', glasses: '#c0392b' }, att: 'chatty', patience: 6, foe: 'linda',
    story: ['linda next door moved her bird feeder six inches onto my property line. six inches. i measured.', 'i put up a bigger bird feeder. now we have a pigeon problem. worth it.', 'linda called the HOA on my wind chimes. so i bought more wind chimes.', 'linda\'s cat got stuck in my tree and i had to call the fire department. she brought me a pie. i don\'t trust the pie.', 'the pie was good. i hate that the pie was good.', 'we split a bag of birdseed at costco. this proves nothing.', 'linda\'s in the hospital, just a hip thing. i\'m bringing her cheese. don\'t make it a whole thing.', 'linda\'s home. we watched jeopardy. she cheats. she looks at her phone.', 'we took down both bird feeders and put up one big one. in the middle. on the line.', 'linda and i are taking a cruise. if she drowns it was an accident.'] },
  { id: 'linda', name: 'Linda', type: 'old', look: { skin: '#e9b48a', hair: '#d8d8d8', style: 'bun' }, att: 'sweet', patience: 5, foe: 'carol',
    story: ['carol next door is measuring my bird feeder with a tape measure. at night. with a headlamp.', 'carol bought a bird feeder the size of a car. the birds are confused.', 'six wind chimes, honey. SIX. it sounds like a haunted department store.', 'i made carol a pie to say thank you. she looked at it like it was a bomb.', 'carol said my pie was "fine". that\'s carol for "best pie of my life".', 'carol and i split birdseed. don\'t read into it.', 'i broke my hip and carol brought me cheese. cried a little. the cheese was very good.', 'carol cheats at jeopardy. she shouts answers before the question.', 'we\'re sharing a bird feeder now. we fight about the birds instead.', 'carol and i are going on a cruise. i packed a life jacket. for me.'] },
  { id: 'mike', name: 'Big Mike', type: 'adult', look: { skin: '#d09a6c', hair: '#1a1a1a', style: 'bald', beard: true }, att: 'showoff', patience: 3,
    story: ['i\'m training for the county hot dog eating contest. sixty-three dogs. that\'s the record. i\'m at forty.', 'i ate 52 last night. my body is a temple. a temple of hot dogs.', 'my doctor said "please stop". i said "i\'m so close".', 'my training partner quit. he said he "saw god" at dog 48. weak.', 'contest is saturday. i\'m buying buns in bulk. don\'t look at me.', 'i lost. to a 19-year-old named spoon. SPOON. he\'s 130 pounds.', 'i\'m taking a break from hot dogs. i\'m doing pickles now. competitive pickles.', 'i found out spoon trains here. in YOUR store. at the food court.', 'spoon and i got lunch. turns out he\'s a nice kid. i hate it.', 'spoon\'s my training partner now. we\'re going to the state finals. together. as brothers.'] },
  { id: 'priya', name: 'Dr. Priya', type: 'adult', look: { skin: '#a86f45', hair: '#2a1a12', style: 'pony' }, att: 'rushed', patience: 2,
    story: ['er doctor. hour 31 of a 36. i\'m buying coffee beans to eat. raw.', 'today a guy came in with a jar of pickles stuck on his hand. he bought the pickles here. not your fault. kind of your fault.', 'i have four minutes. i need cheese and a reason to live. cheese first.', 'a kid swallowed a gachapon toy. it\'s fine. it was a tiny penguin. he named it.', 'day off. i\'m going to sleep in the car after this. don\'t knock.', 'somebody came in with a hot sauce burn. "the reaper". tell dave i said hi.', 'i delivered a baby in a parking lot. not yours. a different parking lot.', 'i got a fish tank to relax. now i worry about the fish.', 'the fish are fine. i\'m fine. everybody\'s fine.', 'i\'m taking a vacation. a real one. i\'ll be back for the cheese.'] },
  { id: 'kevin', name: 'Kevin', type: 'adult', look: { skin: '#f2c9a0', hair: '#b04020', style: 'cap', hat: '#2a2a2a', glasses: '#2a2a2a' }, att: 'conspiracy', patience: 6,
    story: ['the big cheese. hollow. i heard it. there\'s something UNDER it.', 'pigeons aren\'t real. no, wait, those are real. i meant the penguins.', 'there\'s a guy in a suit walking around taking pictures of the exits. i\'m not the only one who saw it.', 'i\'ve been mapping the store. there are more restrooms than there should be.', 'the monorail moved one inch overnight. ONE INCH. who\'s driving it?', 'the suit guy. i followed him to the parking lot. he drives a car with no bumper stickers. you know what that means.', 'something\'s going on in the stock room at night. lights. noises. cheese smell. well, the cheese smell is always there.', 'i put a camera in my hat. please act normal.', 'i was right. i was RIGHT. about something. i forget what. but i was right.', 'i\'m starting a podcast about this store. episode one: the lion knows.'] },
  { id: 'tiffani', name: 'Tiffani', type: 'adult', look: { skin: '#f6d3b3', hair: '#d8b050', style: 'long', glasses: '#1a1a24' }, att: 'influencer', patience: 3,
    story: ['i\'m doing a "day in the life of a grocery store" series. you\'re in it. you\'re the main character now.', 'my video of the lion got 40,000 views. the comments are all "is that elvis". yes. obviously.', 'i\'m doing a cheese tier list. i put brie in C tier. i got death threats.', 'the cheese community forgave me. i moved brie to B.', 'i\'m getting sponsored by a hot sauce. it\'s dave\'s. dave doesn\'t know.', 'dave knows. dave is mad. dave wants a percentage.', 'my followers want to see you fall on your skates. please consider it.', 'my mom found my account. she\'s my top commenter now. it\'s humiliating.', 'i hit 100k followers! i\'m celebrating with sushi and a nervous breakdown.', 'i\'m taking a social media break. starting tomorrow. after this video.'] },
  { id: 'walt', name: 'Walt', type: 'old', look: { skin: '#f0c49a', hair: '#b8b8b8', style: 'bald', beard: true }, att: 'grumpy', patience: 2,
    story: ['prices. PRICES. in my day bread was a nickel.', 'your music\'s too loud. what is that, an accordion? ...it\'s okay. leave it.', 'my wife used to make a strudel. i\'m trying. it\'s a disaster. don\'t tell anyone.', 'the strudel was less of a disaster. the dog ate it. the dog\'s a critic.', 'she shopped here every friday for thirty years. i come on fridays now.', 'i found her recipe card in the cookbook. her handwriting. anyway. where\'s the flour.', 'i made the strudel. it was good. i cried into it a little. salt helps.', 'i brought a strudel for the bakery lady. rosa. she said it was "almost as good as mine". high praise.', 'rosa and i are trading recipes. it\'s not a date. it\'s a recipe exchange.', 'okay it\'s a date. don\'t make it a whole thing. where are the flowers.'] },
  { id: 'brayden', name: 'Brayden', type: 'adult', look: { skin: '#e9b48a', hair: '#5a3418', style: 'short' }, att: 'showoff', patience: 4, tank: true,
    story: ['bro. forty cans of tuna. bulking season. tuna is my brother.', 'my girlfriend says i have to eat a vegetable. i\'m looking at a carrot. it\'s looking at me.', 'i ate the carrot. bro. it was crunchy. nobody told me.', 'i\'m trying broccoli. it\'s a tree, bro. i\'m eating a TREE.', 'i made a salad. on purpose. i\'m changing as a person.', 'my gym bros found out about the salad. i told them it was protein salad. there\'s no protein in it.', 'i\'m at the farmer\'s market part of the store. produce. i know words now. "arugula".', 'my girlfriend proposed. to me. in the produce section. i said yes, bro.', 'we\'re doing a vegetable-themed wedding. the cake\'s a cabbage. i\'m crying.', 'bro. i\'m a vegetarian now. i\'m still buying the tuna for my cat.'] },
  { id: 'agnes', name: 'Sister Agnes', type: 'old', look: { skin: '#f6d3b3', hair: '#2a2a2a', style: 'cap', hat: '#1a1a24' }, att: 'sweet', patience: 8,
    story: ['bless you, dear. i\'m buying scratch-offs at the service desk. for the church. mostly.', 'won $50! the lord provides. the lord also takes. i bought 30 more.', 'the bishop doesn\'t need to know about the scratch-offs, dear.', 'we\'re having a bingo night. i run the bingo. i run it with an iron fist.', 'someone cheated at bingo. it was me. i was testing them.', 'i\'m buying wine for communion. and some for agnes. that\'s me.', 'i won $500. i\'m buying the convent a new roof. and a hot tub. it\'s a therapy tub.', 'the hot tub is a hit. sister margaret won\'t get out.', 'i\'m teaching a class on poker. it\'s called "faith-based probability".', 'pray for me, dear. i\'m going to vegas. for a retreat. a poker retreat.'] },
  { id: 'dale', name: 'Dale', type: 'adult', look: { skin: '#7a4a2a', hair: '#1a1a1a', style: 'short', glasses: '#2a2a2a' }, att: 'tired', patience: 3,
    story: ['four kids. twins are three. they bit each other in the car. i\'m buying juice boxes and a nap.', 'one of the twins learned the word "no". that\'s all he says now. to everything. including cake.', 'my oldest is doing a science fair project on whether the lion is real. i said yes. now i\'m in too deep.', 'i slept four hours last night. in a row. i\'m a new man. a new, tired man.', 'the twins drew on the dog. with sharpie. the dog loves it. he looks like a tiger now.', 'science fair\'s tomorrow. we built a lion out of a mop. it\'s terrifying.', 'we won second place. first place was a kid who built a volcano that actually erupted. on the judges.', 'my wife and i went on a date. we fell asleep at the movie. best date ever.', 'the baby said "dada". the baby also calls the vacuum "dada". i\'ll take it.', 'family photo day. everybody\'s wearing matching shirts. i look like a crayon.'] },
  { id: 'fernando', name: 'Fernando', type: 'adult', look: { skin: '#d09a6c', hair: '#2a1a12', style: 'curly' }, att: 'chatty', patience: 5,
    story: ['i\'m proposing to my girlfriend. at the big cheese. she loves cheese. this is going to be perfect.', 'i bought the ring. it\'s in my sock. i keep checking my sock. people are staring.', 'i need gus to help. gus said "absolutely not". gus said "fine".', 'practice run went bad. i dropped the ring in the pickle barrel. gus fished it out. he didn\'t even flinch.', 'she\'s coming friday. i\'m sweating through my shirt and it\'s tuesday.', 'SHE SAID YES. at the big cheese. gus cried. i cried. a stranger cried.', 'we\'re planning the wedding. she wants a cheese tower. i want a cheese tower. this is love.', 'her mom wants a "normal" cake. we\'re compromising. it\'s a cheesecake.', 'the wedding is in the food court. we booked all six stalls. the taqueria\'s catering.', 'i\'m a married man. i\'m buying cheese for TWO now.'] },
  { id: 'rhonda', name: 'Rhonda', type: 'adult', look: { skin: '#f2c9a0', hair: '#8a5a2a', style: 'long', glasses: '#8a5a2a' }, att: 'grumpy', patience: 3, tote: '#2e7d3b',
    story: ['i have 312 coupons. this is a binder. it\'s alphabetized. don\'t touch it.', 'i got $90 of groceries for $4.12. i\'m a god. a coupon god.', 'the register girl rolled her eyes at my coupons. i rolled mine back. we\'re at war.', 'i found an expired coupon in my binder. i\'ve never felt so betrayed.', 'my husband used a coupon without telling me. we\'re in counseling.', 'i\'m teaching a couponing class at the library. three people came. one was asleep.', 'i got the deals section guy to cry. in a good way. we hugged.', 'my binder\'s on its third edition. it has tabs now. COLOR tabs.', 'they\'re putting my picture up in the deals aisle. "customer of the month". finally, respect.', 'i\'m retiring from couponing. just kidding. i\'m buying a second binder.'] },
  { id: 'zeke', name: 'Zeke', type: 'adult', look: { skin: '#a86f45', hair: '#3a2a2a', style: 'beanie', hat: '#f2b51c', beard: true }, att: 'oblivious', patience: 8,
    story: ['just got back from six months on a crab boat. what year is it. don\'t answer that.', 'land is weird, man. it doesn\'t move. i keep leaning.', 'i tried to pay with crab. the register said no.', 'i\'m looking for an apartment. do you guys rent apartments? the restroom\'s really nice.', 'i got a job! i\'m a cart guy. here. working with dustin. he talks to the carts.', 'dustin taught me the cart train. you link them. it\'s like a snake. a metal snake.', 'i fell asleep in the cart corral. somebody pushed me to the entrance. that\'s on me.', 'i bought a goldfish. his name is captain. he\'s seen more of the world than me now.', 'i\'m going back to the boat next month. i\'m gonna miss the carts.', 'i stayed. the carts need me, man.'] },
  { id: 'pam', name: 'Pam', type: 'old', look: { skin: '#e9b48a', hair: '#f0f0f0', style: 'short', parrot: true }, att: 'sweet', patience: 6,
    story: ['this is gerald. no, a different gerald. he\'s a parrot. he says rude things. i\'m so sorry in advance.', 'gerald said "nice skates, loser". he likes you. he says that to people he likes.', 'gerald learned the store jingle. he sings it at 4 am. i live alone. i hear it in my dreams.', 'gerald bit the cheese man. gus forgave him. gerald did not forgive gus.', 'gerald has a girlfriend. she\'s a mirror. i don\'t have the heart to tell him.', 'gerald said "help, they\'re holding me hostage" in the deli. sal called the police. a whole thing.', 'gerald and the raccoon in your dumpster are friends now. they just stare at each other.', 'gerald is 41. he\'s going to outlive me. he\'s getting the house.', 'gerald learned "thank you very much" from the lion. now he does an elvis bit. it\'s good.', 'gerald and i are doing a talent show. he sings. i hold him. it\'s a partnership.'] },
];
const REG = {}; REGULARS.forEach(r => REG[r.id] = r);
// small talk between two shoppers that pass each other. [first person, second person]
const CONVOS = [
  ['excuse me, is that the last tahini?', 'it is. and i\'m not giving it up.'], ['love your bag.', 'thanks, it was a free bag. i\'ve had it for nine years.'], ['do you know where the honey is?', 'follow the bees.'],
  ['is your kid okay? he\'s licking the freezer.', 'he\'s fine. he does that.'], ['sorry, my cart has a mind of its own.', 'mine too. it keeps going to the wine.'], ['have you tried the durian?', 'once. never again. i can still taste it.'],
  ['i think we went to high school together.', 'oh no. oh no, we did.'], ['nice sweater.', 'it was my dad\'s. he\'s alive, i just took it.'], ['you look like you know about wine.', 'i know nothing. i pick by the label animal.'],
  ['is the lion supposed to be wearing sunglasses?', 'he\'s a professional.'], ['did you see a guy in a banana suit?', 'every time i come here, yes.'], ['which line is fastest?', 'whichever one you\'re not in.'],
  ['how do you pick a melon?', 'i knock and wait for one to answer.'], ['excuse me, that\'s my cart.', 'oh. mine has the same wobbly wheel. they all do.'], ['i\'m so lost.', 'me too. let\'s be lost together.'],
  ['this place is huge.', 'i came in for milk in 2019. i\'m still looking.'], ['are those good?', 'no idea. i buy everything with a cartoon on it.'], ['can i squeeze past?', 'only if you compliment my cheese choices.'],
];
const ARGUE = [['you took my parking spot.', 'there were forty spots!'], ['that\'s MY cart.', 'yours has a sticker? show me the sticker.'], ['you cut the line.', 'i was here in spirit.'],
  ['you hit my ankle with your cart.', 'your ankle was in my lane.'], ['were you going to buy that last cake?', 'i am now.'], ['stop following me.', 'we\'re going the same way! it\'s one aisle!']];
const KID_RUN = ['WEEEEE', 'CANDY CANDY CANDY', 'you can\'t catch me!', 'i\'m a dinosaur!', 'look, a penguin!'];
const PARENT_CALL = ['GET BACK HERE.', 'i\'m counting to three!', 'we talked about running!', 'that is NOT the way to the car.', 'please. i\'m begging.'];

// ---------- giving people a persona ----------
function regularsToday() { // which regulars come in today: about half, different each day, rolled once per day
  if (RT.regDay === ST.day) return RT.regToday; const r = mkRng(ST.day * 977 + 3); RT.regDay = ST.day;
  RT.regToday = REGULARS.filter(() => r() < 0.55).map(x => x.id); RT.regUsed = {}; return RT.regToday;
}
function makePersona(c) {
  const today = regularsToday();
  if (c.type !== 'kid' && Math.random() < 0.3) { // a regular walks in (each at most once a day)
    const avail = today.filter(id => !RT.regUsed[id] && REG[id].type === c.type); if (avail.length) { const id = pick(Math.random, avail); RT.regUsed[id] = 1; dressRegular(c, REG[id]); return; }
  }
  const att = c.type === 'kid' ? 'chatty' : pick(Math.random, Object.keys(ATTITUDES)), A = ATTITUDES[att];
  c.p = { name: c.type === 'kid' ? pick(Math.random, ['Tyler', 'Ava', 'Jayden', 'Mia', 'Noah', 'Zoe', 'Liam', 'Ellie']) : pick(Math.random, FIRST_NAMES), att, patience: A.patience + Math.floor(Math.random() * 2), talks: 0, irk: 0, topic: pick(Math.random, OVERSHARE) };
}
function dressRegular(c, R) { // same face, different clothes every day
  const r = mkRng(R.id.length * 131 + ST.day * 7919), L = randomLook(r, R.type);
  Object.assign(L, { skin: R.look.skin, hair: R.look.hair, style: R.look.style, hat: R.look.hat || L.hat, glasses: R.look.glasses || null, beard: !!R.look.beard, parrot: !!R.look.parrot, costume: null, key: 'reg_' + R.id + '_' + ST.day });
  if (R.tote) L.tote = R.tote; c.look = L; c.p = { name: R.name, reg: R.id, att: R.att, patience: R.patience, talks: 0, irk: 0 };
}
function personaName(c) { return c.p ? c.p.name : 'Shopper'; }
function faceOf(c, expr) { return { look: c.look, expr }; }

// ---------- talking to a shopper: a real exchange, then patience runs out ----------
function talkCustomer(c) {
  if (!c.p) makePersona(c); const p = c.p, A = ATTITUDES[p.att] || ATTITUDES.chatty; sfx('talk');
  if (p.cold > 0) { bubble(c, pick(Math.random, COLD), 2.5, 'mad'); return; }
  p.talks++; p.irk += 1; const n = p.talks, name = personaName(c) + (p.reg ? ' · regular' : '');
  if (c.type === 'kid' && n <= 2) return showDialog(personaName(c), line('kid'), null, null, null, faceOf(c, 'happy'));
  if (c.look.costume) { if (c.look.costume === 'banana') foundSecret('banana'); return showDialog(name, pick(Math.random, COSTUME_LINES[c.look.costume]), null, null, null, faceOf(c, 'happy')); }
  if (n === 1) { // the first thing they tell you: a regular's story so far, or whatever's on a stranger's mind
    if (p.reg) { const f = F(); f.met = f.met || {}; const R = REG[p.reg], seen = f.met[p.reg] || { n: 0, day: 0 }; if (seen.day !== ST.day) { seen.n++; seen.day = ST.day; f.met[p.reg] = seen; }
      moodHit(c, 4); return showDialog(name, R.story[Math.min(R.story.length - 1, seen.n - 1)], null, seen.n === 1 ? 'A regular. Talk to them on other days to hear how it goes.' : null, null, faceOf(c, 'happy')); }
    moodHit(c, 3); return showDialog(name, pick(Math.random, A.hi) + ' ' + p.topic, null, null, null, faceOf(c, 'happy'));
  }
  if (p.irk <= Math.ceil(p.patience * 0.5)) return showDialog(name, pick(Math.random, A.more), null, null, null, faceOf(c, 'n'));
  if (p.irk <= p.patience) { moodHit(c, -4); bubble(c, pick(Math.random, ANNOYED), 3, 'mad'); return; }
  if (p.irk === p.patience + 1) { moodHit(c, -8); bubble(c, pick(Math.random, FUMING), 3, 'mad'); showDialog(name, pick(Math.random, FUMING), null, 'They\'re about to snap. Maybe give them some space.', null, faceOf(c, 'fume')); return; }
  // they snap: a shove, or they storm out
  p.cold = 30; RT.day.snaps = (RT.day.snaps || 0) + 1; addRep(-0.4);
  if (Math.random() < 0.5 && c.type !== 'old') { const dx = PL.x - c.x, dy = PL.y - c.y, d = Math.hypot(dx, dy) || 1; PL.vx = dx / d * 190; PL.vy = dy / d * 190; PL.spinT = 0.4; sfx('bump'); bubble(c, pick(Math.random, SHOVE), 3, 'mad'); floatText(PL.x, PL.y - 34, 'SHOVED', '#ff6a5a'); RT.custs.forEach(o => { if (o !== c && !o.bubble && Math.hypot(o.x - c.x, o.y - c.y) < 4 * T && Math.random() < 0.5) bubble(o, pick(Math.random, ['oh snap', 'WORLDSTAR', 'did he just', 'yikes', 'not in the cheese shop!']), 2.5); }); }
  else { bubble(c, pick(Math.random, STORM), 3.5, 'mad'); moodHit(c, -40); c.list = []; c.hold = null; if (c.lane) { const l = c.lane; l.queue.splice(l.queue.indexOf(c), 1); queueMove(l); c.lane = null; } c.items = 0; leaveStore(c); c.stormed = true; }
}
function updatePeople(dt) { // patience comes back slowly; cold shoulders wear off
  RT.peopleT = (RT.peopleT || 0) - dt; if (RT.peopleT > 0) return; RT.peopleT = 1;
  for (const c of RT.custs) { if (!c.p) continue; if (c.p.cold > 0) c.p.cold--; if ((c.p.calm = (c.p.calm || 0) + 1) >= 20) { c.p.calm = 0; if (c.p.irk > 0 && !c.p.cold) c.p.irk--; } }
  shopperMeet(); kidsRunOff();
}
// ---------- shoppers with each other ----------
const freeish = c => ['walk', 'browse', 'loiter'].includes(c.state) && c.then !== 'exit' && !c.bubble && c.type !== 'kid';
function shopperMeet() {
  if ((RT.meetT = (RT.meetT || 0) - 1) > 0) return; RT.meetT = 2 + Math.floor(Math.random() * 3);
  const cs = RT.custs.filter(c => freeish(c) && !custOutside(c));
  for (let i = 0; i < cs.length; i++) for (let j = i + 1; j < cs.length; j++) {
    const a = cs[i], b = cs[j]; if (Math.hypot(a.x - b.x, a.y - b.y) > 22 || (a.metId === b.id)) continue;
    a.metId = b.id; b.metId = a.id; if (!a.p) makePersona(a); if (!b.p) makePersona(b);
    const ra = a.p.reg && REG[a.p.reg], rb = b.p.reg && REG[b.p.reg];
    let pair;
    if (ra && rb && (ra.foe === rb.id)) pair = [`${rb.name}.`, `${ra.name}.`]; // carol and linda
    else if (ra && rb) pair = [`${rb.name}! how\'s it going?`, `${ra.name}! don\'t ask.`];
    else if ((a.p.att === 'grumpy' || b.p.att === 'grumpy' || a.p.att === 'rushed') && Math.random() < 0.6) { pair = pick(Math.random, ARGUE); moodHit(a, -3); moodHit(b, -3);
      if (Math.random() < 0.25) { makeSpill(a, pick(Math.random, ['milk', 'salsa', 'pickle', 'grape'])); a.y -= 3; b.y += 3; } }
    else pair = pick(Math.random, CONVOS);
    bubble(a, pair[0], 3.2); RT.later = RT.later || []; RT.later.push({ t: 1.6, c: b, text: pair[1] }); return;
  }
}
function kidsRunOff() { // now and then a kid bolts for candy and a parent yells
  if (Math.random() > 0.04) return; const k = pick(Math.random, RT.custs.filter(c => c.type === 'kid' && c.state === 'tag' && c.parent && !custOutside(c.parent))); if (!k) return;
  const t = randomZoneTile(['candy', 'toys', 'gacha', 'frozen']); if (!t) return;
  k.state = 'run'; k.runT = 6 + Math.random() * 4; goTo(k, t[0] + 0.5, t[1] + 0.7); bubble(k, pick(Math.random, KID_RUN), 2.5); RT.later = RT.later || []; RT.later.push({ t: 1.2, c: k.parent, text: pick(Math.random, PARENT_CALL), kind: 'mad' });
}
function updateLater(dt) { // lines that come a beat after another
  if (!RT.later) return; for (const l of RT.later) { l.t -= dt; if (l.t <= 0 && RT.custs.includes(l.c)) bubble(l.c, l.text, 3.2, l.kind || 'say'); } RT.later = RT.later.filter(l => l.t > 0);
}
