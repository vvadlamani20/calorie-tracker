// Seeds — empty. The user owns their library.
// Library shape: { id, emoji, name, serving, kcal, p, c, f }
//   - `serving` is a free-text label (e.g. "100 g", "1 cup", "1 piece")
//   - kcal/p/c/f are values FOR ONE serving (not per 100g)
//   - quantity in entries is a multiplier (×1, ×2, …)
const FOOD_LIB = [];
const DEFAULT_DAY = [];
const HISTORY = [];

function getFood(library, id) {
  return (library || []).find(f => f.id === id);
}

function sumDay(library, entries) {
  const s = (entries || []).reduce((acc, e) => {
    const f = getFood(library, e.foodId);
    if (!f) return acc;
    acc.kcal += (f.kcal || 0) * e.qty;
    acc.p    += (f.p    || 0) * e.qty;
    acc.c    += (f.c    || 0) * e.qty;
    acc.f    += (f.f    || 0) * e.qty;
    return acc;
  }, { kcal: 0, p: 0, c: 0, f: 0 });
  // Fractional quantities (e.g. ×0.5) make these floats; round for display.
  return {
    kcal: Math.round(s.kcal),
    p: Math.round(s.p),
    c: Math.round(s.c),
    f: Math.round(s.f),
  };
}

function newFoodId() {
  return 'f_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

Object.assign(window, { FOOD_LIB, DEFAULT_DAY, HISTORY, getFood, sumDay, newFoodId });
