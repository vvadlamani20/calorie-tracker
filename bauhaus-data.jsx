// Seed data + state for the Bauhaus calorie tracker

const FOOD_LIB = [
  // (Emojis are the only humanizing visual element.)
  { id: 'oats',     emoji: '🥣', name: 'OATMEAL + BERRIES', kcal: 310, p: 9,  c: 54, f: 6,  serving: '1 BOWL' },
  { id: 'coffee',   emoji: '☕', name: 'FLAT WHITE',        kcal: 120, p: 7,  c: 11, f: 5,  serving: '1 CUP' },
  { id: 'eggs',     emoji: '🥚', name: 'EGGS, SCRAMBLED',   kcal: 210, p: 18, c: 2,  f: 14, serving: '2 EGGS' },
  { id: 'banana',   emoji: '🍌', name: 'BANANA',            kcal: 105, p: 1,  c: 27, f: 0,  serving: '1 MEDIUM' },
  { id: 'chicken',  emoji: '🍗', name: 'GRILLED CHICKEN',   kcal: 285, p: 44, c: 0,  f: 12, serving: '150 G' },
  { id: 'rice',     emoji: '🍚', name: 'BROWN RICE',        kcal: 220, p: 5,  c: 46, f: 2,  serving: '1 CUP' },
  { id: 'broc',     emoji: '🥦', name: 'BROCCOLI',          kcal: 55,  p: 4,  c: 11, f: 1,  serving: '1 CUP' },
  { id: 'yogurt',   emoji: '🥛', name: 'GREEK YOGURT',      kcal: 150, p: 17, c: 9,  f: 5,  serving: '200 G' },
  { id: 'almond',   emoji: '🌰', name: 'ALMONDS',           kcal: 165, p: 6,  c: 6,  f: 14, serving: '28 G' },
  { id: 'apple',    emoji: '🍎', name: 'APPLE',             kcal: 95,  p: 0,  c: 25, f: 0,  serving: '1 MEDIUM' },
  { id: 'salmon',   emoji: '🐟', name: 'SALMON FILLET',     kcal: 340, p: 34, c: 0,  f: 22, serving: '150 G' },
  { id: 'avocado',  emoji: '🥑', name: 'AVOCADO',           kcal: 160, p: 2,  c: 9,  f: 15, serving: '½ FRUIT' },
  { id: 'toast',    emoji: '🍞', name: 'SOURDOUGH TOAST',   kcal: 140, p: 5,  c: 26, f: 2,  serving: '1 SLICE' },
  { id: 'choc',     emoji: '🍫', name: 'DARK CHOCOLATE',    kcal: 170, p: 2,  c: 13, f: 12, serving: '30 G' },
  { id: 'beer',     emoji: '🍺', name: 'IPA',               kcal: 210, p: 2,  c: 16, f: 0,  serving: '1 PINT' },
];

// Default Day — realistic balanced day
const DEFAULT_DAY = [
  { foodId: 'oats',    qty: 1 },
  { foodId: 'coffee',  qty: 2 },
  { foodId: 'eggs',    qty: 1 },
  { foodId: 'chicken', qty: 1 },
  { foodId: 'rice',    qty: 1 },
  { foodId: 'broc',    qty: 1 },
  { foodId: 'yogurt',  qty: 1 },
  { foodId: 'almond',  qty: 1 },
];

// History — 6 previous days with plausible variation
const HISTORY = [
  { date: '2026-04-20', label: 'APR 20', entries: [
    { foodId: 'oats', qty: 1 }, { foodId: 'coffee', qty: 2 }, { foodId: 'chicken', qty: 1 },
    { foodId: 'rice', qty: 1 }, { foodId: 'broc', qty: 1 }, { foodId: 'almond', qty: 1 },
    { foodId: 'apple', qty: 1 },
  ]},
  { date: '2026-04-19', label: 'APR 19', entries: [
    { foodId: 'eggs', qty: 1 }, { foodId: 'toast', qty: 2 }, { foodId: 'avocado', qty: 1 },
    { foodId: 'salmon', qty: 1 }, { foodId: 'rice', qty: 1 }, { foodId: 'beer', qty: 1 },
  ]},
  { date: '2026-04-18', label: 'APR 18', entries: [
    { foodId: 'oats', qty: 1 }, { foodId: 'coffee', qty: 1 }, { foodId: 'chicken', qty: 1 },
    { foodId: 'rice', qty: 1 }, { foodId: 'broc', qty: 2 }, { foodId: 'yogurt', qty: 1 },
    { foodId: 'choc', qty: 1 },
  ]},
  { date: '2026-04-17', label: 'APR 17', entries: [
    { foodId: 'oats', qty: 1 }, { foodId: 'coffee', qty: 2 }, { foodId: 'eggs', qty: 1 },
    { foodId: 'chicken', qty: 1 }, { foodId: 'rice', qty: 1 }, { foodId: 'almond', qty: 1 },
    { foodId: 'banana', qty: 1 },
  ]},
  { date: '2026-04-16', label: 'APR 16', entries: [
    { foodId: 'toast', qty: 2 }, { foodId: 'eggs', qty: 1 }, { foodId: 'avocado', qty: 1 },
    { foodId: 'yogurt', qty: 1 }, { foodId: 'chicken', qty: 1 }, { foodId: 'broc', qty: 1 },
  ]},
  { date: '2026-04-15', label: 'APR 15', entries: [
    { foodId: 'oats', qty: 1 }, { foodId: 'coffee', qty: 2 }, { foodId: 'salmon', qty: 1 },
    { foodId: 'rice', qty: 1 }, { foodId: 'broc', qty: 1 }, { foodId: 'apple', qty: 1 },
  ]},
];

function getFood(id) { return FOOD_LIB.find(f => f.id === id); }

function sumDay(entries) {
  return entries.reduce((acc, e) => {
    const f = getFood(e.foodId);
    if (!f) return acc;
    acc.kcal += f.kcal * e.qty;
    acc.p    += f.p    * e.qty;
    acc.c    += f.c    * e.qty;
    acc.f    += f.f    * e.qty;
    return acc;
  }, { kcal: 0, p: 0, c: 0, f: 0 });
}

Object.assign(window, { FOOD_LIB, DEFAULT_DAY, HISTORY, getFood, sumDay });
