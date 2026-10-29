// ===== CONFIG: change these two lines to rename the store =====
const CONFIG = {
  storeName: "Jungle John's",
  ownerName: "Jungle John",
  cashierName: "Dolores",
};

const T = 16;            // tile size in art pixels
const MW = 78, MH = 66;  // map size in tiles
const OPEN_MIN = 8 * 60, CLOSE_MIN = 22 * 60; // 8am - 10pm
const DAY_START = 6 * 60;
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// crate types. cost = wholesale per crate, units = stock added
const CRATES = {
  produce:   { name: 'Produce',     units: 20, color: '#5aa83c' },
  intl:      { name: 'International', units: 20, color: '#d9572b' },
  seafood:   { name: 'Seafood',     units: 18, color: '#3b8fc4' },
  meat:      { name: 'Meat',        units: 18, color: '#b8303a' },
  bakery:    { name: 'Bakery',      units: 20, color: '#c98a3e' },
  deli:      { name: 'Deli',        units: 20, color: '#d46a7a' },
  cheese:    { name: 'Cheese',      units: 20, color: '#f2c230' },
  wine:      { name: 'Wine',        units: 20, color: '#7a2038' },
  liquor:    { name: 'Liquor & Cigars', units: 16, color: '#8a5a2b' },
  beer:      { name: 'Beer',        units: 22, color: '#e0a020' },
  grocery:   { name: 'Grocery',     units: 24, color: '#3d6fd1' },
  dairy:     { name: 'Frozen & Dairy', units: 22, color: '#9ad0f0' },
  candy:     { name: 'Candy',       units: 22, color: '#e85aa8' },
  natural:   { name: 'Natural',     units: 20, color: '#7fb04a' },
  health:    { name: 'Health & Beauty', units: 20, color: '#8a6ad8' },
  hotsauce:  { name: 'Hot Sauce',   units: 22, color: '#e23a1e' },
  housewares:{ name: 'Cookware & Pets', units: 18, color: '#6b7a8a' },
  toys:      { name: 'Toys',        units: 18, color: '#f08030', lock: 'toys' },
  capsules:  { name: 'Gacha Capsules', units: 30, color: '#ff6fb0', lock: 'gacha' },
  cards:     { name: 'Card Packs',  units: 24, color: '#4a5ad8', lock: 'cards' },
  viral:     { name: 'Viral Stuff', units: 20, color: '#25f4ee', lock: 'tiktok' },
};

// departments. kind decides layout + art. price = avg item price.
// labels: aisle sign text per shelf row segment.
// layout follows the Fairfield floor plan, with a few Eastgate-only spots added (deals / scratch & dent, honey hive)
const DEPTS = [
  // north-west: the original international block
  { id: 'europe', sign: 'Europe', name: 'International: Europe', x: 7, y: 11, w: 8, h: 8, floor: 'terra2', layout: 'rows', art: 'europe', price: 7, crate: 'intl', pop: 0.9, max: 30,
    labels: [['Ireland'], ['Great Britain']], items: ['irish butter', 'beans for toast', 'proper tea', 'digestive biscuits'], sub: 'Sherwood Forest' },
  { id: 'asia', sign: 'Asia', name: 'International: Asia', x: 15, y: 11, w: 5, h: 8, floor: 'terra', layout: 'rows', art: 'asia', price: 6, crate: 'intl', pop: 1.0, max: 30,
    labels: [['Ramen World'], ['China']], items: ['ramen', 'gochujang', 'rice crackers', 'fish sauce', 'basmati rice'] },
  { id: 'deck', sign: 'Deck', name: 'Observation Deck', x: 20, y: 11, w: 3, h: 4, floor: 'wood', layout: 'deck', price: 0, crate: null, pop: 0, max: 0 },
  { id: 'livefish', sign: 'Live Fish', name: 'Live Fish Harvest', x: 20, y: 15, w: 3, h: 4, floor: 'bluetile', layout: 'tanks', price: 0, crate: null, pop: 0, max: 0 },
  { id: 'intlproduce', sign: 'Intl Produce', signY: 9, name: 'Intl Produce', x: 23, y: 11, w: 2, h: 12, floor: 'wood', layout: 'binscol', art: 'produce', price: 3, crate: 'produce', pop: 0.6, max: 30,
    items: ['plantains', 'bitter melon', 'fresh lemongrass'] },
  { id: 'americas', sign: 'Americas', name: 'International: Americas', x: 2, y: 16, w: 5, h: 17, floor: 'orange', layout: 'rows', art: 'americas', price: 5, crate: 'intl', pop: 1.0, max: 40,
    labels: [['Nepal'], ['Hispanic'], ['South America'], ['Canada & Caribbean'], ['Africa & Kosher']], items: ['masa', 'yerba mate', 'ketchup chips', 'jerk seasoning', 'fufu flour', 'matzo'] },
  { id: 'gigante', name: 'Mercado Grande', x: 7, y: 19, w: 5, h: 5, floor: 'orange', layout: 'rows', art: 'americas', price: 5, crate: 'intl', pop: 0.7, max: 20,
    items: ['dried chiles', 'mexican coke', 'queso fresco'] },
  { id: 'hotsauce', name: 'Hot Sauce', x: 12, y: 19, w: 11, h: 5, floor: 'redcheck', layout: 'hot', art: 'hotsauce', price: 8, crate: 'hotsauce', pop: 0.9, max: 40,
    labels: [['Vietnam / Cajun / Philippines / Japan']], items: ['the hottest sauce you got', 'ghost pepper sauce', 'a sauce that won\'t kill me'] },
  { id: 'intl', name: 'International', x: 7, y: 24, w: 11, h: 9, floor: 'sand', layout: 'rows', art: 'mideast', price: 6, crate: 'intl', pop: 1.0, max: 40,
    labels: [['East Europe', 'Coffee'], ['Germany', 'Specialty Soda'], ['Middle East', 'Turkey']], items: ['pierogi', 'german mustard', 'tahini', 'turkish delight', 'weird soda'], sub: '70,000 products from 75 countries' },
  { id: 'seafood', name: 'Seafood', x: 18, y: 24, w: 7, h: 6, floor: 'bluetile', layout: 'seafood', art: 'fish', price: 14, crate: 'seafood', pop: 0.8, max: 30,
    items: ['salmon', 'shrimp', 'a whole weird fish', 'crab legs'] },
  { id: 'honey', name: 'Honey & Maple Syrup', x: 18, y: 30, w: 7, h: 3, floor: 'sage', layout: 'rows', art: 'natural', price: 9, crate: 'natural', pop: 0.5, max: 20,
    items: ['raw honey', 'maple syrup'] },
  // middle
  { id: 'produce', name: 'Produce', x: 25, y: 22, w: 11, h: 8, floor: 'wood', layout: 'bins', art: 'produce', price: 3, crate: 'produce', pop: 1.4, max: 60,
    items: ['dragon fruit', 'the spiky fruit', 'fresh basil', 'bananas', 'a decent avocado'], sub: 'Over an acre of produce' },
  { id: 'natural', name: 'Natural Foods', x: 25, y: 30, w: 11, h: 3, floor: 'sage', layout: 'rows', art: 'natural', price: 8, crate: 'natural', pop: 0.7, max: 30,
    items: ['protein powder', 'oat milk', 'kombucha'] },
  { id: 'bakery', name: 'Bakery', x: 36, y: 21, w: 7, h: 4, floor: 'warm', layout: 'counter', art: 'bakery', price: 6, crate: 'bakery', pop: 0.9, max: 30,
    items: ['sourdough', 'a birthday cake', 'croissants'], sub: 'We still bake from scratch' },
  { id: 'meat', name: 'Meat', x: 36, y: 25, w: 7, h: 8, floor: 'redtile', layout: 'counter', art: 'meat', price: 15, crate: 'meat', pop: 0.9, max: 30,
    labels: [['Exotic Meats']], items: ['ribeye', 'ground beef', 'alligator meat', 'kangaroo steak'], sub: 'Prime steaks & exotic meats' },
  // the wing: wine, liquor, beer, candy
  { id: 'wine', name: 'Wine', x: 43, y: 3, w: 8, h: 6, floor: 'darkwood', layout: 'rows', art: 'wine', price: 18, crate: 'wine', pop: 0.9, max: 40,
    labels: [['Reds / Whites'], ['Bubbly / Imports']], items: ['a dry red', 'some cheap bubbly', 'ohio wine', 'a pinot'], sub: 'Over 15,000 wines' },
  { id: 'liquor', name: 'State Liquor', x: 51, y: 3, w: 5, h: 4, floor: 'darkwood', layout: 'rows', art: 'liquor', price: 26, crate: 'liquor', pop: 0.45, max: 20,
    items: ['bourbon', 'tequila', 'the good vodka'] },
  { id: 'cigars', name: 'Cigars', x: 51, y: 7, w: 5, h: 4, floor: 'darkwood', layout: 'rows', art: 'cigars', price: 12, crate: 'liquor', pop: 0.3, max: 15,
    items: ['a cigar'], sub: 'World class humidor' },
  { id: 'tasting', name: 'Tasting Bar', x: 43, y: 9, w: 8, h: 3, floor: 'wood', layout: 'bar', art: 'bar', price: 0, crate: null, pop: 0, max: 0 },
  { id: 'beer', name: 'Beer', x: 43, y: 12, w: 8, h: 7, floor: 'coolblue', layout: 'rows', art: 'beer', price: 11, crate: 'beer', pop: 1.0, max: 40,
    labels: [['Beer Cave'], ['Craft']], items: ['an ipa', 'german lager', 'a sour beer', 'cheap beer'], sub: 'Over 4,000 beers' },
  { id: 'candy', name: 'Candy', x: 43, y: 19, w: 9, h: 5, floor: 'pink', layout: 'candy', art: 'candy', price: 4, crate: 'candy', pop: 1.1, max: 40,
    items: ['sour belts', 'british chocolate', 'circus peanuts', 'gummy worms'], sub: 'See Elvis, the singing lion' },
  { id: 'grocery', name: 'Grocery', x: 43, y: 24, w: 13, h: 9, floor: 'lino', layout: 'rows', art: 'grocery', price: 4, crate: 'grocery', pop: 1.5, max: 60,
    labels: [['Cereal', 'Snacks'], ['Canned', 'Pasta'], ['Cleaning', 'Paper']], items: ['laundry detergent', 'cereal', 'paper towels', 'canned soup', 'chips'], sub: 'Your local favorites' },
  { id: 'toys', name: 'Toys', x: 43, y: 33, w: 6, h: 3, floor: 'kids', layout: 'rows', art: 'toys', price: 14, crate: 'toys', pop: 0.7, max: 20, lock: 'toys',
    items: ['a plush thing', 'a yo-yo'] },
  { id: 'health', name: 'Health & Beauty', x: 49, y: 33, w: 7, h: 3, floor: 'lino2', layout: 'rows', art: 'health', price: 7, crate: 'health', pop: 0.8, max: 30,
    items: ['shampoo', 'toothpaste', 'ibuprofen'] },
  // east side
  { id: 'cheese', name: 'Cheese Shop', x: 52, y: 13, w: 7, h: 8, floor: 'cheesecheck', layout: 'cheese', art: 'cheesecase', price: 9, crate: 'cheese', pop: 1.0, max: 40,
    items: ['gouda', 'a stinky french one', 'aged cheddar', 'brie'], sub: '1,400 meats & cheeses from 32 countries' },
  { id: 'tenants', name: 'Coffee Bar', x: 59, y: 13, w: 4, h: 6, floor: 'darkwood', layout: 'tenant', price: 0, crate: null, pop: 0, max: 0 },
  { id: 'deli', name: 'Deli', x: 53, y: 21, w: 9, h: 3, floor: 'cheesecheck', layout: 'counter', art: 'deli', price: 8, crate: 'deli', pop: 1.0, max: 40,
    items: ['sliced turkey', 'mortadella', 'olives', 'a sub'], sub: 'A slice above the rest' },
  { id: 'sushi', name: 'Sushi', x: 56, y: 25, w: 4, h: 6, floor: 'tatami', layout: 'counter', art: 'sushi', price: 12, crate: 'seafood', pop: 0.8, max: 25, lock: 'sushi',
    items: ['a spicy tuna roll', 'sushi'] },
  { id: 'deals', name: 'Deals', x: 60, y: 25, w: 3, h: 6, floor: 'lino', layout: 'vcol', art: 'grocery', price: 3, crate: 'grocery', pop: 0.6, max: 20,
    items: ['dented cans', 'cheap cereal'], sub: 'Scratch & dent' },
  { id: 'pets', name: 'Pets', x: 63, y: 25, w: 8, h: 6, floor: 'lino', layout: 'rows', art: 'pets', price: 9, crate: 'housewares', pop: 0.6, max: 30,
    items: ['dog food', 'a squeaky toy', 'cat litter'], sub: 'Amazing pet toy selection' },
  { id: 'cookware', name: 'Cookware', x: 56, y: 31, w: 15, h: 5, floor: 'lino', layout: 'rows', art: 'cookware', price: 16, crate: 'housewares', pop: 0.5, max: 30,
    items: ['a wok', 'a cast iron pan', 'a garlic press'], sub: 'Inspire your inner chef' },
  // south-west
  { id: 'eurosouth', sign: 'Mediterranean', name: 'International: Mediterranean', x: 2, y: 33, w: 9, h: 6, floor: 'terra', layout: 'rows', art: 'europe', price: 7, crate: 'intl', pop: 0.9, max: 30,
    labels: [['Greece / France'], ['Italy / Spain']], items: ['feta', 'imported pasta', 'olive oil', 'french butter cookies'] },
  { id: 'tiktok', name: 'TikTok Shop', x: 11, y: 33, w: 4, h: 6, floor: 'neon', layout: 'rows', art: 'viral', price: 15, crate: 'viral', pop: 0.9, max: 20, lock: 'tiktok',
    items: ['that viral tumbler', 'the led thing from my feed'] },
  { id: 'herb', name: 'Herb \'N Jungle', x: 15, y: 33, w: 6, h: 6, floor: 'sage', layout: 'rows', art: 'natural', price: 8, crate: 'natural', pop: 0.6, max: 30,
    labels: [['Supplements'], ['Gluten Free']], items: ['turmeric pills', 'gluten free bread', 'elderberry gummies'] },
  { id: 'frozen', name: 'Frozen & Dairy', x: 21, y: 33, w: 9, h: 13, floor: 'ice', layout: 'freezers', art: 'frozen', price: 5, crate: 'dairy', pop: 1.2, max: 50,
    items: ['milk', 'eggs', 'craft ice cream', 'frozen pizza', 'butter'], sub: 'Craft ice cream & pizzas galore' },
  { id: 'registers', name: 'Registers', x: 30, y: 36, w: 15, h: 10, floor: 'lino', layout: 'registers', art: 'reg', price: 0, crate: null, pop: 0, max: 0 },
  { id: 'custserv', name: 'Customer Service', x: 34, y: 42, w: 5, h: 3, floor: 'lino', layout: 'desk', art: 'desk', price: 0, crate: null, pop: 0, max: 0 },
  // toys & collectibles corner (upgrades)
  { id: 'cards', name: 'Card Shop', x: 62, y: 40, w: 4, h: 6, floor: 'bluecarpet', layout: 'cards', art: 'cards', price: 10, crate: 'cards', pop: 0.6, max: 25, lock: 'cards',
    items: ['booster packs', 'card sleeves'] },
  { id: 'gacha', name: 'Gachapon', x: 66, y: 40, w: 5, h: 6, floor: 'kids2', layout: 'gacha', art: 'gacha', price: 3, crate: 'capsules', pop: 0.8, max: 40, lock: 'gacha',
    items: ['capsule toys'] },
];
const DEPT = {}; DEPTS.forEach(d => DEPT[d.id] = d);

// animatronics / displays that can break
const ANIMS = {
  elvis:   { name: 'Elvis the lion', dept: 'candy' },
  robin:   { name: 'Robin Hood', dept: 'europe' },
  corn:    { name: 'Corn & Butter', dept: 'health' },
  swing:   { name: 'the soup can swing', dept: 'grocery' },
  firetruck: { name: 'the hot sauce fire truck', dept: 'hotsauce' },
  minnow:  { name: 'the S.S. Minnow boat', dept: 'seafood' },
  jungle:  { name: 'the jungle scene', dept: null },
};

// upgrades: cat = area | staff | gear | promo
const UPGRADES = [
  { id: 'toys', cat: 'area', name: 'Toy Aisle', cost: 3500, desc: 'Toys next to grocery. Kids drag parents in.', stars: 1 },
  { id: 'gacha', cat: 'area', name: 'Gachapon Corner', cost: 4500, desc: 'Capsule machines. Refill them with capsule crates.', stars: 2 },
  { id: 'tiktok', cat: 'area', name: 'TikTok Shop', cost: 5000, desc: 'Viral junk. Film a video once a day for a crowd boost.', stars: 2 },
  { id: 'cards', cat: 'area', name: 'Card Shop', cost: 6000, desc: 'Card packs. Run a tournament every Saturday.', stars: 2 },
  { id: 'sushi', cat: 'area', name: 'Sushi Bar', cost: 7500, desc: 'Sushi counter next to the deli. Uses seafood crates.', stars: 3 },
  { id: 'drone', cat: 'promo', name: 'Hot Sauce Drone', cost: 2500, desc: 'A drone flies a giant hot sauce bottle over the aisle. Rep up.', stars: 1 },
  { id: 'monorail', cat: 'promo', name: 'Fix the Monorail', cost: 12000, desc: 'Rides on weekends and fest days. Money and rep.', stars: 3 },
  { id: 'cellar', cat: 'promo', name: 'Reserve Cellar', cost: 8000, desc: 'Fancy wine room. Wine sells for 30% more.', stars: 3 },
  { id: 'billboard', cat: 'promo', name: 'Dixie Hwy Billboard', cost: 3000, desc: '+20% customers.', stars: 1 },
  { id: 'parking', cat: 'promo', name: 'Bigger Parking Lot', cost: 6000, desc: '+15% customers.', stars: 2 },
  { id: 'cashier1', cat: 'staff', name: 'Hire Cashier: Marcus', cost: 800, wage: 110, desc: 'Opens register 3.', stars: 1 },
  { id: 'cashier2', cat: 'staff', name: 'Hire Cashier: Bev', cost: 1200, wage: 110, desc: 'Opens register 4.', stars: 2, req: 'cashier1' },
  { id: 'cashier3', cat: 'staff', name: 'Hire Cashier: Tyler', cost: 1800, wage: 120, desc: 'Opens register 5.', stars: 3, req: 'cashier2' },
  { id: 'stocker', cat: 'staff', name: 'Hire Stocker: Ray', cost: 1500, wage: 150, desc: 'Restocks the emptiest aisle on his own. Pays wholesale.', stars: 1 },
  { id: 'stocker2', cat: 'staff', name: 'Hire Stocker: Nina', cost: 3000, wage: 160, desc: 'A second stocker.', stars: 3, req: 'stocker' },
  { id: 'janitor', cat: 'staff', name: 'Hire Janitor: Big Lou', cost: 1000, wage: 100, desc: 'Mops spills on his own.', stars: 1 },
  { id: 'tech', cat: 'staff', name: 'Hire Animatronic Tech', cost: 2000, wage: 130, desc: 'Fixes broken displays on his own.', stars: 2 },
  { id: 'skates2', cat: 'gear', name: 'Pro Skates', cost: 1200, desc: 'Skate 30% faster.', stars: 1 },
  { id: 'skates3', cat: 'gear', name: 'Rocket Skates', cost: 4000, desc: 'Skate 60% faster. Brakes not included.', stars: 2, req: 'skates2' },
  { id: 'dolly', cat: 'gear', name: 'Hand Truck', cost: 2000, desc: 'Carry 2 crates.', stars: 1 },
  { id: 'pallet', cat: 'gear', name: 'Pallet Jack', cost: 5000, desc: 'Carry 3 crates.', stars: 2, req: 'dolly' },
  { id: 'mop2', cat: 'gear', name: 'Power Mop', cost: 900, desc: 'Clean a spill in one swipe.', stars: 1 },
  { id: 'coffee', cat: 'gear', name: 'Break Room Espresso', cost: 1500, desc: 'Break room snacks restore twice the energy.', stars: 1 },
];
const UPG = {}; UPGRADES.forEach(u => UPG[u.id] = u);

// fests. offset = day in 28-day cycle (1-based)
const EVENTS = [
  { day: 6, name: 'Big Cheese Festival', boost: { cheese: 3, wine: 1.5, deli: 1.5 }, crowd: 1.6 },
  { day: 13, name: 'Weekend of Fire', boost: { hotsauce: 3, meat: 1.5 }, crowd: 1.6 },
  { day: 20, name: 'Craft Beer Festival', boost: { beer: 3, deli: 1.4 }, crowd: 1.6 },
  { day: 27, name: 'Wine Festival', boost: { wine: 3, cheese: 1.6 }, crowd: 1.6 },
];

const GOALS = [
  { id: 'stars3', text: 'Reach 3 stars', reward: 1500 },
  { id: 'serve500', text: 'Serve 500 customers', reward: 1000 },
  { id: 'help25', text: 'Help 25 lost customers', reward: 1000 },
  { id: 'up3', text: 'Buy 3 upgrades', reward: 1500 },
  { id: 'day5k', text: 'Make $5,000 in sales in one day', reward: 2000 },
  { id: 'fest', text: 'Survive a festival with no empty aisles', reward: 2500 },
  { id: 'monorail', text: 'Get the monorail running', reward: 3000 },
  { id: 'stars5', text: 'Reach 5 stars and become a Jungle Legend', reward: 10000 },
];

// ===== customer dialogue. {item} {store} {owner} get filled in =====
const LINES = {
  adult: [
    "this place is a theme park that also sells eggs. i respect it.",
    "i came in for milk forty minutes ago. i think i live here now.",
    "nice skates. very professional. very insurable.",
    "my wife sent me for one thing and i lost it somewhere near the hot sauce.",
    "who needs 15,000 wines? me. unfortunately me.",
    "i've been to six countries today and i haven't left ohio.",
    "is it normal for a grocery store to have a boat?",
    "i don't need anything. i just come here to feel something.",
    "you guys sell durian? like legally?",
    "i parked so far out i saw a deer.",
    "the lion looked at me. i'm not crazy. he looked at me.",
    "honestly the bathrooms here are a destination.",
    "i'm on a diet but the bakery doesn't know that.",
    "every time i come here i spend $80 on sauces i'm scared of.",
    "my kid thinks you're a real jungle guy. don't ruin it.",
    "what's the wifi password. kidding. sort of.",
    "i got lost in the international section and learned some german.",
    "do you ever sleep or do you just skate in circles forever?",
    "this is the only place i trust to have tamarind and laundry soap.",
    "i drove an hour for a specific cheese. no regrets. some regrets.",
    "you look tired. you should sit in the beer cave for a minute.",
    "i saw a guy buy nine pounds of shrimp at 10am. living the dream.",
    "my therapist said i need a hobby. so, this.",
    "the monorail was the best day of my life and that's kind of sad.",
    "i'm not buying anything. i'm just smelling the bread.",
    "is the produce section bigger than my house? genuinely asking.",
    "you're the boss? the skates threw me off.",
    "i have $30 and a dream.",
    "i only came for the free samples. i'm being honest with you.",
    "they should make a game about this place.",
    "i came for one onion. i'm leaving with a wok and a feeling.",
    "the cheese guy gave me a sample and now we're basically engaged.",
    "this is the third time i've walked past the boat. i'm not lost. i'm browsing.",
    "how is there a whole aisle for ireland. what do they eat. butter?",
    "i told my wife i'd be twenty minutes. that was a lie and we both knew it.",
    "you look like a park ranger who got really into retail.",
    "i'm buying hot sauce for a guy i don't even like. that's friendship.",
    "do the fish have names? that one looks like a todd.",
    "i saw a man hug the big cheese. no judgment. i get it.",
    "every aisle smells like a different vacation.",
  ],
  kid: [
    "is the lion real?",
    "can i live in the candy part?",
    "my mom said if i'm good i get a gacha. i've been good for 4 minutes.",
    "why do you have skates? can i have skates?",
    "the fish in the tank looked at me funny.",
    "is that cheese bigger than a car?",
    "i want the blue candy. not that blue. the other blue.",
    "are you the jungle guy? where's your monkey?",
    "the soup can on the swing is my best friend.",
    "my dad is in the beer part. he said 'five minutes' an hour ago.",
    "i touched a lobster. it was crunchy.",
    "when i grow up i'm gonna work at the register and press all the buttons.",
  ],
  old: [
    "back in my day this was a fruit stand. still had better peaches.",
    "i come every tuesday. the sample lady knows my name.",
    "these prices. in my day bread was a nickel and you had to fight a bear for it.",
    "young man, where do you keep the prunes. asking for my whole body.",
    "i don't understand the monorail but i support it.",
    "my grandson put me on the tiktok. now people recognize me at the deli.",
    "the lion sings better than my late husband. god rest him.",
    "i've been shopping here longer than you've been alive, roller boy.",
    "they moved the canned peaches again. i'm writing a letter.",
    "i like the music in here. very loud. very good for my ears.",
  ],
  lost: [
    "hey. where the hell do you keep the {item}?",
    "i've been looking for {item} for twenty minutes. help me.",
    "ok i give up. {item}. where.",
    "my GPS stopped working in here. {item}?",
    "do you even sell {item} or am i losing my mind",
    "i need {item} before my wife finds out i forgot it.",
    "excuse me skate guy. {item}?",
    "i followed the signs and now i'm in kosher. i need {item}.",
    "please. {item}. i have a family.",
    "i asked the lion and he just sang at me. {item}?",
    "this store is a maze and i'm the rat. {item}, please.",
    "quick, before my parking meter runs out. {item}.",
  ],
  thanks: [
    "you're a hero. a weird hero on wheels, but a hero.",
    "thank you. i'm naming my next dog after you.",
    "wow. ok. five stars. here's a little something.",
    "i'd be dead in the cereal aisle without you.",
    "that was faster than asking my husband.",
    "you skate like a man with a purpose. thanks.",
    "perfect. now i only need the other 40 things on my list.",
    "beautiful. i'm telling everyone at work about this.",
    "god bless you and your weird little skates.",
    "great. that's exactly where i'd never look.",
  ],
  empty: [
    "the {dept} shelf is empty. great. love that for me.",
    "nothing in {dept}? did a bus of people just leave?",
    "i drove here for {dept} and it's picked clean. cool.",
    "empty shelf in {dept}. i'm gonna tell yelp.",
    "who ate all the {dept}. be honest.",
    "{dept} is bare. is this a test?",
  ],
  spill: [
    "somebody dropped something gross back there. just saying.",
    "i almost ate it on that spill. you got a mop?",
    "there's a puddle in aisle whatever. it's sticky. it's personal.",
    "careful, there's a mess back there. my shoe's gone.",
  ],
  queue: [
    "i've aged in this line.",
    "can we get another register open? i have ice cream.",
    "this line is longer than the monorail.",
    "i'm starting to make friends in this line. not good.",
    "my cart and i are going to retire here.",
    "come on man, it's two items.",
  ],
  tasting: [
    "just a small pour. a medium small pour. ok fill it.",
    "i'm here for the tasting bar. the groceries are an excuse.",
    "what's good today? don't say water.",
    "i'll have whatever makes the cheese taste better.",
  ],
  poured: [
    "that's the stuff. that's the good stuff.",
    "ok i'm buying a case. maybe two.",
    "you pour like a professional. scary.",
    "mmm. tastes like the inside of an expensive barrel.",
  ],
  broken: [
    "the {anim} is busted. kids are crying. well, one kid. me.",
    "uh, the {anim} is smoking. is that part of the show?",
    "the {anim} stopped moving. did it die?",
  ],
  elvis: [
    "he still sings. what a legend.",
    "best show in ohio and it's free.",
    "thank you. thank you very much. -the lion, probably",
  ],
  leaveHappy: [
    "best grocery trip of my life. i need to get out more.",
    "see you next week. probably tomorrow.",
    "my trunk is full of weird sauce. perfect day.",
  ],
  leaveMad: [
    "worst trip. i'm going to a normal store like a normal person.",
    "never again. see you saturday.",
    "i'm leaving a two star review and the two stars are for the lion.",
  ],
};
// clean mode swaps
const CLEAN = [[/\bthe hell\b/g, 'the heck'], [/\bhell\b/g, 'heck'], [/\bdamn\b/g, 'dang'], [/\bshit\b/g, 'crap'], [/\bgod bless\b/g, 'bless'], [/\bass\b/g, 'butt']];

// tool definitions
const TOOLS = [
  { id: 'hands', name: 'Hands', key: '1', hint: 'Carry crates, talk, pour, work registers' },
  { id: 'mop', name: 'Mop', key: '2', hint: 'Clean spills' },
  { id: 'wrench', name: 'Wrench', key: '3', hint: 'Fix broken displays' },
  { id: 'food', name: 'Fish Food', key: '4', hint: 'Feed the live tanks' },
];

// ===== the work week: main quest = earn the day's goal (all money in: sales, tips, tastings, quest rewards) =====
const WORKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const WEEK_GOALS = [2000, 2600, 3300, 4100, 5000]; // week 2+ asks 30% more each week

// quest givers, one per main area. counter clerks already stand behind their cases; the rest stand at `at`
const GIVERS = [
  { id: 'gus', name: 'Gus', dept: 'cheese', at: [53, 13], shirt: '#f4f4f4', apron: '#e8c23a' },
  { id: 'rosa', name: 'Rosa', dept: 'bakery' },
  { id: 'sal', name: 'Sal', dept: 'deli' },
  { id: 'marlene', name: 'Marlene', dept: 'seafood' },
  { id: 'philippe', name: 'Philippe', dept: 'tasting', at: [47, 9], shirt: '#1e1e24', apron: '#5a1626' },
  { id: 'hank', name: 'Hank', dept: 'produce', at: [34, 24], shirt: '#2e7d3b', apron: '#6a4a2a' },
  { id: 'trixie', name: 'Trixie', dept: 'candy', at: [50, 22], shirt: '#ff8fc0', apron: '#6fc6e8' },
  { id: 'dave', name: 'Diablo Dave', dept: 'hotsauce', at: [22, 19], shirt: '#1e1e24', apron: '#d42a1a' },
  { id: 'deb', name: 'Deb', dept: 'custserv' },
];
// one quest per giver per weekday (Mon..Fri). types: sample/talk (hand out to customers in `zones`), stock (restock `dept`),
// help (walk lost customers), mop, fix (broken displays), pour (tastings), feed (fish tanks), cool (Big Cheese), elvis (for kids), scan (register items)
const QUESTS = {
  gus: [
    { type: 'sample', n: 10, item: 'cheese sample', lines: 'cheese', zones: ['cheese'], buy: 'cheese', reward: 300, title: 'Hand out cheese samples in the Cheese Shop',
      ask: "boss. the big cheese has no fans today. i cut ten cubes of cheddar. hand them out to people in the cheese shop before i eat them out of grief.", nag: "the cubes are sweating. people. cheese. go.", done: "ten converts. the big cheese is pleased. here, take this before the cheese changes its mind." },
    { type: 'cool', n: 3, reward: 260, title: 'Crank the Big Cheese cooler 3 times', ask: "the big cheese cooler is held together with tape and prayer. crank it cold three times today and i will love you forever. or until friday.", nag: "it's warming up. i can hear it warming up.", done: "34 degrees. you hear that? that's the sound of nobody getting sued." },
    { type: 'stock', n: 2, dept: 'cheese', reward: 300, title: 'Restock the Cheese Shop twice', ask: "we're out of half the cheese. bring me two crates from the stock room. the cheese crates. not the beer crates. we talked about this.", nag: "the shelves are naked. it's indecent.", done: "full shelves. now this is a cheese shop and not a crime scene." },
    { type: 'sample', n: 12, item: 'stinky cheese', lines: 'stinky', zones: ['cheese', 'deli'], buy: 'cheese', reward: 420, title: 'Hand out stinky cheese in Cheese + Deli',
      ask: "today we hand out the limburger. twelve people. cheese shop or deli. hold your breath and smile. it's character building.", nag: "the stink is not going away on its own. hand it out.", done: "twelve brave souls. three cried. that's a good day for limburger." },
    { type: 'sample', n: 12, item: 'aged gouda', lines: 'gouda', zones: ['cheese', 'tasting', 'wine'], buy: 'wine', reward: 520, title: 'Hand out aged gouda in Cheese, Wine + Tasting',
      ask: "friday. the good stuff. eight-year gouda. twelve samples. cheese shop, wine aisle or the tasting bar. people who drink wine pretend to know cheese. let them.", nag: "the gouda is aging while you stand there. which is fine. but go.", done: "beautiful. the wine snobs said 'nutty' nine times. that's a record." },
  ],
  rosa: [
    { type: 'sample', n: 8, item: 'warm cookie', lines: 'cookie', zones: ['bakery', 'meat', 'produce'], buy: 'bakery', reward: 260, title: 'Hand out warm cookies near the Bakery',
      ask: "mijo! i made too many cookies. hand eight out near the bakery. if anyone says they're on a diet, give them two.", nag: "the cookies are getting cold. a cold cookie is a sad cookie.", done: "everybody happy? everybody happy. here. and take a cookie, you're too skinny for skates." },
    { type: 'stock', n: 2, dept: 'bakery', reward: 280, title: 'Restock the Bakery twice', ask: "the bread shelf is empty and a man just asked me if we sell 'flour, but cooked'. two bakery crates, please.", nag: "still empty. a lady is crying by the bagels.", done: "full! now go sit down, you look like you skated here from cincinnati." },
    { type: 'sample', n: 10, item: 'day-old donut', lines: 'donut', zones: ['bakery', 'produce', 'natural'], buy: 'bakery', reward: 340, title: 'Get rid of day-old donuts near Bakery + Produce',
      ask: "these donuts are from yesterday. they're fine. they're FINE. ten people. bakery, produce, natural foods. don't say 'yesterday'.", nag: "say 'vintage'. people like 'vintage'.", done: "all gone! nobody died! i love this job." },
    { type: 'help', n: 2, reward: 360, title: 'Walk 2 lost customers to their aisle', ask: "my husband came in for one onion in 1998 and i still haven't seen him. help two lost people today. for him.", nag: "people are wandering. like ghosts. with carts.", done: "two found! not my husband, but it's a start." },
    { type: 'sample', n: 12, item: 'birthday cake', lines: 'cake', zones: ['bakery', 'meat', 'produce', 'candy'], buy: 'bakery', reward: 500, title: 'Hand out birthday cake near Bakery, Meat, Produce + Candy',
      ask: "somebody ordered a birthday cake and never picked it up. so today it's everybody's birthday. twelve slices. bakery, meat, produce, candy.", nag: "sing if you have to. i won't tell.", done: "twelve birthdays in one day. this store is magic, mijo." },
  ],
  sal: [
    { type: 'talk', n: 6, item: 'sandwich survey', lines: 'survey', zones: ['deli', 'grocery', 'cheese'], reward: 260, title: 'Ask 6 customers about sandwiches (Deli, Grocery, Cheese)',
      ask: "corporate wants a 'sandwich survey'. ask six people near the deli what they want on a sandwich. write nothing down. i'll remember.", nag: "six opinions. everybody's got one.", done: "six answers. four said 'meat'. one said 'more meat'. one said 'jesus'. we'll use that." },
    { type: 'sample', n: 8, item: 'pickle spear', lines: 'pickle', zones: ['deli', 'cheese', 'grocery'], buy: 'deli', reward: 300, title: 'Hand out pickle spears in Deli, Cheese + Grocery',
      ask: "pickle spears. eight of them. deli, cheese, grocery. if they don't like pickles, they're not my people.", nag: "the pickles are judging you. i can tell.", done: "eight pickles, eight smiles. one guy asked for the juice. respect." },
    { type: 'stock', n: 2, dept: 'deli', reward: 300, title: 'Restock the Deli twice', ask: "i'm slicing air over here. two deli crates. move.", nag: "the slicer is just spinning. it's lonely.", done: "now we're cooking. well, slicing. same thing." },
    { type: 'mop', n: 3, reward: 340, title: 'Mop 3 spills', ask: "somebody dropped a pickle jar and the juice is ON THE MOVE. mop three spills before it reaches the wine.", nag: "i can smell the brine from here.", done: "clean floors. my mother would weep. she hated this floor." },
    { type: 'sample', n: 12, item: 'meatball', lines: 'meatball', zones: ['deli', 'grocery', 'cheese', 'meat'], buy: 'deli', reward: 520, title: 'Hand out meatballs in Deli, Grocery, Cheese + Meat',
      ask: "friday meatballs. my nonna's recipe. twelve people. if anyone says 'pretty good' you take it back.", nag: "they're getting cold. nonna is watching.", done: "nonna would be proud. or she'd find something wrong. either way. here." },
  ],
  marlene: [
    { type: 'feed', n: 1, reward: 220, title: 'Feed the live tanks', ask: "honey, the lobsters are staring at me like i owe them money. feed the tanks. fish food is tool 4.", nag: "they're still staring.", done: "look at them. happy as clams. which, legally, they are not." },
    { type: 'sample', n: 8, item: 'shrimp cocktail', lines: 'shrimp', zones: ['seafood', 'livefish', 'honey', 'intl'], buy: 'seafood', reward: 300, title: 'Hand out shrimp near Seafood',
      ask: "shrimp cocktail samples. eight of 'em. seafood or nearby. keep them cold and keep them moving.", nag: "warm shrimp is a lawsuit, hon.", done: "eight people, zero lawsuits. that's a great day in seafood." },
    { type: 'stock', n: 2, dept: 'seafood', reward: 300, title: 'Restock Seafood twice', ask: "the fish case is looking thin. two seafood crates. the ice is melting into my shoes.", nag: "my shoes are full of ice water. hurry.", done: "beautiful. the case looks like a postcard again." },
    { type: 'mop', n: 3, reward: 340, title: 'Mop 3 spills', ask: "the ice machine leaked and now it's a slip-and-slide. three spills. mop. go.", nag: "somebody's gonna eat it. hard.", done: "dry floors! nobody broke a hip! today is a good day." },
    { type: 'fix', n: 2, reward: 460, title: 'Fix 2 broken displays', ask: "everything that moves in this store is breaking today. fix two of them. wrench is tool 3.", nag: "something's still broken. i can hear it not moving.", done: "you're handy. you married? kidding. mostly." },
  ],
  philippe: [
    { type: 'pour', n: 3, reward: 260, title: 'Pour 3 tastings at the Tasting Bar', ask: "ah. you. pour three tastings at the bar. small pours. we are not a frat house.", nag: "the guests are thirsty and i am judgmental.", done: "three pours. acceptable. you swirl like a raccoon, but acceptable." },
    { type: 'pour', n: 5, reward: 340, title: 'Pour 5 tastings at the Tasting Bar', ask: "today we pour five. a man asked for 'the red one'. i need to lie down. you pour.", nag: "five pours. it is not complicated.", done: "five. you're improving. you only spilled on one rich person." },
    { type: 'stock', n: 2, dept: 'wine', reward: 320, title: 'Restock Wine twice', ask: "the wine wall has holes. holes, in my wall. two wine crates, please.", nag: "the holes are still there. mocking me.", done: "whole again. like a symphony. a symphony of grapes." },
    { type: 'sample', n: 8, item: 'fancy cracker', lines: 'cracker', zones: ['wine', 'tasting', 'liquor', 'cigars'], buy: 'wine', reward: 360, title: 'Hand out fancy crackers in Wine, Liquor + Cigars',
      ask: "fancy crackers. eight. wine, liquor, cigars. it is a cracker that costs four dollars. hand it over like it is a diamond.", nag: "diamond energy. go.", done: "eight people now think they have taste. this is how we sell wine." },
    { type: 'pour', n: 8, reward: 520, title: 'Pour 8 tastings at the Tasting Bar', ask: "friday. everyone wants to forget their week. eight pours. i believe in you. a little.", nag: "more pours. less standing.", done: "eight. magnifique. take this and do not tell anyone i was nice to you." },
  ],
  hank: [
    { type: 'stock', n: 2, dept: 'produce', reward: 260, title: 'Restock Produce twice', ask: "produce is getting picked clean, chief. two produce crates. the bananas don't stock themselves. i've asked.", nag: "a lady is squeezing the last avocado like it owes her money.", done: "now that's a fruit stand. 1971 vibes. love it." },
    { type: 'help', n: 2, reward: 300, title: 'Walk 2 lost customers to their aisle', ask: "folks keep asking me where stuff is and i only know fruit. help two lost people for me.", nag: "another one just asked me where the 'normal milk' is. help.", done: "two found. you're a human map, chief." },
    { type: 'sample', n: 10, item: 'mystery fruit', lines: 'durian', zones: ['produce', 'intlproduce', 'natural'], buy: 'produce', reward: 380, title: 'Hand out mystery fruit in Produce + Natural Foods',
      ask: "it's durian. don't tell them it's durian. ten samples. produce, intl produce, natural foods. say 'mystery fruit' and run.", nag: "the smell is getting out. we're running out of time.", done: "ten people tried durian. two liked it. that's a historic ratio." },
    { type: 'stock', n: 3, dept: 'produce', reward: 400, title: 'Restock Produce 3 times', ask: "big shipment day. three produce crates. lift with your legs, chief.", nag: "the bins are hungry.", done: "three crates. you're stronger than you look. no offense." },
    { type: 'sample', n: 12, item: 'dragon fruit', lines: 'dragonfruit', zones: ['produce', 'intlproduce', 'natural', 'honey'], buy: 'produce', reward: 500, title: 'Hand out dragon fruit in Produce, Natural + Honey',
      ask: "dragon fruit friday. twelve samples. it looks like a pokemon and tastes like a pear that went to college.", nag: "the dragons await.", done: "twelve! the dragons are proud. so am i, chief." },
  ],
  trixie: [
    { type: 'sample', n: 5, item: 'lollipop', lines: 'lollipop', zones: ['candy', 'toys', 'grocery', 'bakery'], kids: true, buy: 'candy', reward: 260, title: 'Give lollipops to 5 kids near Candy',
      ask: "omg hi!! give lollipops to five kids around candy. kids only. adults will ask. adults cannot have one. it's the law. my law.", nag: "the kids are vibrating. find them.", done: "five sugar-blasted children!! their parents hate us. perfect." },
    { type: 'elvis', n: 3, reward: 280, title: 'Make Elvis sing 3 times', ask: "the kids want elvis. make him sing three times. he's the lion. don't ask. nobody knows.", nag: "elvis has left the building. please bring him back.", done: "three songs!! one kid cried. happy tears. probably." },
    { type: 'stock', n: 2, dept: 'candy', reward: 300, title: 'Restock Candy twice', ask: "we're OUT of the sour stuff and a kid bit a display. two candy crates. please. for safety.", nag: "the kid is eyeing another display.", done: "restocked!! the biting has stopped. for now." },
    { type: 'sample', n: 6, item: 'lollipop', lines: 'lollipop', zones: ['candy', 'toys', 'grocery', 'bakery', 'health'], kids: true, buy: 'candy', reward: 380, title: 'Give lollipops to 6 kids near Candy',
      ask: "lollipop day part two!! six kids. it's the sour apple ones. they make your face do a thing.", nag: "six faces must do the thing.", done: "six faces did the thing!! you're my favorite boss. you're my only boss but still." },
    { type: 'elvis', n: 5, reward: 460, title: 'Make Elvis sing 5 times', ask: "friday concert!! five elvis songs. he gets a little hoarse but he's a professional.", nag: "the crowd wants more!!", done: "five!! elvis needs a nap. so do i. so do you, honestly." },
  ],
  dave: [
    { type: 'sample', n: 8, item: 'mild hot sauce', lines: 'mild', zones: ['hotsauce', 'americas', 'gigante', 'intl'], buy: 'hotsauce', reward: 280, title: 'Hand out mild hot sauce near Hot Sauce',
      ask: "my friend. today we start gentle. 'mild'. eight samples. hot sauce, americas, mercado. watch their faces. 'mild' is a lie i tell for fun.", nag: "they're waiting to suffer. go.", done: "eight people. four said 'that's not mild'. correct. it's not." },
    { type: 'sample', n: 10, item: 'ghost pepper sauce', lines: 'ghost', zones: ['hotsauce', 'americas', 'gigante', 'intl', 'asia'], buy: 'hotsauce', reward: 380, title: 'Hand out ghost pepper sauce near Hot Sauce',
      ask: "ghost pepper. ten brave people. hot sauce or the international aisles. have milk nearby. i don't. you should.", nag: "the ghosts are restless.", done: "ten souls touched by the ghost. one guy saw his ancestors. good reviews." },
    { type: 'stock', n: 2, dept: 'hotsauce', reward: 300, title: 'Restock Hot Sauce twice', ask: "my wall of fire is down to embers. two hot sauce crates, my friend.", nag: "embers. only embers.", done: "the wall burns again. you are a true friend of the pepper." },
    { type: 'help', n: 3, reward: 420, title: 'Walk 3 lost customers to their aisle', ask: "three people wandered in here looking for 'normal ketchup' and now they're scared. help three lost people find their way.", nag: "they keep coming. they keep being lost.", done: "three saved. they will never come back to my aisle. that's fine." },
    { type: 'sample', n: 12, item: 'the reaper', lines: 'reaper', zones: ['hotsauce', 'americas', 'gigante', 'intl', 'asia', 'seafood'], buy: 'hotsauce', reward: 560, title: 'Hand out The Reaper near Hot Sauce + Intl',
      ask: "friday. the reaper. twelve people. i've signed nothing and neither have you. hand it out and walk away fast.", nag: "the reaper is patient. the customers are not.", done: "twelve. three of them are still sweating in the parking lot. legends." },
  ],
  deb: [
    { type: 'scan', n: 15, reward: 260, title: 'Scan 15 items at a register', ask: "hon, the lines are backing up. hop on a register and scan fifteen items. stand on the left side. mash the button.", nag: "the line's out to the jungle scene, hon.", done: "fifteen! you're a natural. a natural on skates, which is weird, but a natural." },
    { type: 'help', n: 2, reward: 300, title: 'Walk 2 lost customers to their aisle', ask: "i've had six people at my desk asking where things are. help two lost folks so i can drink my coffee.", nag: "my coffee is cold, hon.", done: "two found. coffee's still cold but my heart is warm." },
    { type: 'scan', n: 25, reward: 360, title: 'Scan 25 items at a register', ask: "wednesday rush. twenty-five items at a register. dolores is on her third break. don't tell her i said that.", nag: "beep beep, hon. beep beep.", done: "twenty-five! dolores is back and she's jealous." },
    { type: 'mop', n: 4, reward: 400, title: 'Mop 4 spills', ask: "somebody ran a cart full of salsa into the soup can swing. four spills. i've seen things today, hon.", nag: "it's spreading, hon.", done: "clean! i'm putting you up for employee of the month. you're the boss, so you'll win." },
    { type: 'scan', n: 40, reward: 560, title: 'Scan 40 items at a register', ask: "friday payday crowd. forty items. you can do it. i believe in you more than i believe in the copier.", nag: "keep beeping, hon!", done: "forty! you're a legend. go home. well. after the store closes. you live here, right?" },
  ],
};
// what customers say when handed a sample (one pool per quest `lines`)
const SAMPLE_LINES = {
  cheese: ["oh that's a cheese. that's a real cheese.", "i'll take four pounds. don't ask questions.", "free cheese is the best cheese.", "this cheddar has more personality than my husband.", "i came for paper towels. i'm leaving with cheese."],
  stinky: ["oh no. oh no. why is it good though", "that smells like a gym bag and tastes like heaven.", "my eyes are watering but my mouth is happy.", "is this cheese legal in other states?", "i'm gonna need a minute. and a mint."],
  gouda: ["notes of... caramel? i don't know. i'm saying caramel.", "nutty. very nutty. like my uncle.", "eight years old? it's more mature than me.", "this pairs with wine. i'm pairing it with more wine.", "oh that's fancy. i feel fancy."],
  cookie: ["is this chocolate chip? marry me. not you. the cookie.", "i'm on a diet. was. was on a diet.", "warm cookie in a grocery store. this is heaven.", "my grandma made these. better. don't tell rosa.", "i'll take a dozen and a nap."],
  donut: ["this donut has seen things. still good.", "vintage donut. i get it. i love it.", "a little chewy. like me.", "free donut? i'd eat it off the floor. not literally.", "that's yesterday's donut and today's happiness."],
  cake: ["it's my birthday? sure. it's my birthday.", "happy birthday to me, a stranger in aisle seven.", "frosting. on a weekday. living the dream.", "this is the best cake i've ever gotten for free.", "do i have to sing? i'm not singing."],
  survey: ["turkey, swiss, regret.", "honestly? more pickles. always more pickles.", "a sandwich is just a hot dog with ambition.", "whatever's free.", "meat. then more meat. then bread, if there's room.", "peanut butter and sauerkraut. don't knock it."],
  pickle: ["crunchy. sour. perfect. like my ex.", "can i have the juice? is that weird? i want the juice.", "pickles are just cucumbers that went through something.", "that's a good pickle. a very good pickle.", "i'd fight someone for another one."],
  meatball: ["tell nonna i love her.", "that's a meatball. that's a capital M meatball.", "pretty g-- AMAZING. it's amazing.", "i'm gonna think about this meatball at work.", "i'd like to be buried with these."],
  shrimp: ["cold shrimp, warm heart.", "cocktail sauce has horseradish? my sinuses are open.", "fancy. i feel like i'm on a boat.", "that boat over there? that's my boat now.", "i'll take five pounds and a lemon."],
  cracker: ["four dollars? for a cracker? it IS good though.", "this cracker went to private school.", "crisp. elegant. i don't deserve it.", "i'm gonna need a wine to go with this cracker.", "is there gold in it? it tastes like there's gold in it."],
  durian: ["what. what IS that. what is HAPPENING.", "it smells like feet and tastes like custard. i'm confused.", "is this fruit or a dare?", "i hate it. give me another one.", "my whole family is going to smell this on me."],
  dragonfruit: ["it looks like a pokemon!", "tastes like a kiwi in a costume.", "dragon fruit. i feel powerful.", "pretty. like a fruit at a fashion show.", "my kids are gonna lose their minds."],
  lollipop: ["LOLLIPOP!!!", "is it sour? IT'S SOUR. i love it.", "i'm gonna save it. no i'm not.", "mom! MOM! the skate guy gave me candy!", "my face is doing a thing!!", "this is the best day of my life."],
  mild: ["MILD?! that's not mild!", "ok... ok... ok that's a lot.", "i can feel my ears.", "mild for who?! for a dragon?", "i'm fine. i'm fine. is there milk."],
  ghost: ["i see... i see my grandma.", "AAAAAAAAAAAH.", "why did i say yes. why do i always say yes.", "my lips are gone. i had lips.", "this is my villain origin story."],
  reaper: ["i've made a terrible mistake.", "tell my wife... tell her it was worth it.", "i can taste colors.", "the reaper came. the reaper won.", "i need to lie down in the frozen section."],
};
// what a giver says once today's job is done
const GIVER_IDLE = ["thanks again, boss.", "you're all set here. go help someone else.", "come back tomorrow, i'll have something.", "i'm good. go. skate. be free."];
// random chatter people say while hanging around
const CHATTER = ["i'm just looking. i've been just looking for an hour.", "is it me or is that lion staring?", "i love this place. i'm scared of this place.", "i should've made a list.", "how is there a boat in here?", "my cart has a wobbly wheel. like my life.", "do they sell normal stuff? like, normal milk?", "i parked by the elephant. i think.", "smells like cheese and adventure.", "i came for one thing. i have nine things.", "is that guy on skates the manager?", "honey, which way is out?", "this is my third lap. i'm not lost. i'm exercising."];
