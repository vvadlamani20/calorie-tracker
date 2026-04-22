// External-API food search: USDA FoodData Central + Nutritionix.
// Each search function returns Promise<Array<NormalizedFoodResult>> where
// NormalizedFoodResult = { source, externalId, name, brand, serving, kcal, p, c, f }.
// `serving` is a human-readable label; kcal/p/c/f are FOR THAT SERVING.

// --- USDA FoodData Central -----------------------------------------------
// Docs: https://fdc.nal.usda.gov/api-guide.html
// Per-100g values are the standard for Foundation/SR Legacy. Branded foods
// expose a per-serving record with servingSize/servingSizeUnit.
async function searchUSDA(query, apiKey) {
  if (!apiKey) return [];
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(apiKey)}&query=${encodeURIComponent(query)}&pageSize=10`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`USDA ${res.status}`);
  const data = await res.json();
  return (data.foods || []).map(normalizeUSDAFood).filter(Boolean);
}

function nutrientValue(food, names) {
  // FDC nutrient names vary slightly; match by includes
  for (const n of (food.foodNutrients || [])) {
    const nm = (n.nutrientName || '').toLowerCase();
    if (names.some(x => nm.includes(x))) {
      return n.value || 0;
    }
  }
  return 0;
}

function normalizeUSDAFood(food) {
  const kcal = nutrientValue(food, ['energy']);
  const p    = nutrientValue(food, ['protein']);
  const c    = nutrientValue(food, ['carbohydrate']);
  const f    = nutrientValue(food, ['total lipid', 'fat,']);
  // Foundation/SR foods are per 100g. Branded foods have servingSize.
  let serving = '100 g';
  let scale = 1;
  if (food.servingSize && food.servingSizeUnit) {
    serving = `${food.servingSize} ${String(food.servingSizeUnit).toLowerCase()}`;
    // Branded values are already per-serving; do NOT scale.
    scale = 1;
  }
  return {
    source: 'USDA',
    externalId: String(food.fdcId),
    name: (food.description || '').toUpperCase(),
    brand: food.brandOwner || food.brandName || '',
    serving,
    kcal: Math.round(kcal * scale),
    p: Math.round(p * scale * 10) / 10,
    c: Math.round(c * scale * 10) / 10,
    f: Math.round(f * scale * 10) / 10,
  };
}

// --- Nutritionix ---------------------------------------------------------
// Docs: https://docs.x.nutritionix.com/
// /v2/search/instant gives suggestions; we then resolve each common item via
// /v2/natural/nutrients to get full macros for "1 serving".
async function searchNutritionix(query, appId, appKey) {
  if (!appId || !appKey) return [];
  const headers = {
    'x-app-id': appId,
    'x-app-key': appKey,
    'Content-Type': 'application/json',
  };
  // Use the natural-language endpoint directly with the user's query —
  // returns rich per-serving data in one call.
  const res = await fetch('https://trackapi.nutritionix.com/v2/natural/nutrients', {
    method: 'POST',
    headers,
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    if (res.status === 404 || res.status === 400) return []; // no parse
    throw new Error(`Nutritionix ${res.status}`);
  }
  const data = await res.json();
  return (data.foods || []).map(normalizeNutritionixFood);
}

function normalizeNutritionixFood(food) {
  const qty = food.serving_qty || 1;
  const unit = food.serving_unit || 'serving';
  const grams = food.serving_weight_grams;
  const serving = grams
    ? `${qty} ${unit} (${grams} g)`
    : `${qty} ${unit}`;
  return {
    source: 'Nutritionix',
    externalId: food.nix_item_id || food.tag_id || food.food_name,
    name: (food.food_name || '').toUpperCase(),
    brand: food.brand_name || '',
    serving,
    kcal: Math.round(food.nf_calories || 0),
    p: Math.round((food.nf_protein || 0) * 10) / 10,
    c: Math.round((food.nf_total_carbohydrate || 0) * 10) / 10,
    f: Math.round((food.nf_total_fat || 0) * 10) / 10,
  };
}

// --- Open Food Facts (free, no API key) ---------------------------------
// Crowd-sourced; great for branded/packaged items, weak for raw foods.
// Docs: https://wiki.openfoodfacts.org/API
async function searchOFF(query) {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=8&fields=code,product_name,brands,nutriments,serving_size,serving_quantity`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`OFF ${res.status}`);
  const data = await res.json();
  return (data.products || []).map(normalizeOFFProduct).filter(Boolean);
}

function normalizeOFFProduct(p) {
  const name = (p.product_name || '').trim();
  if (!name) return null;
  const n = p.nutriments || {};
  // Per-100g values are most reliable; per-serving exists if serving_quantity is set
  const useServing = p.serving_quantity && n['energy-kcal_serving'];
  const kcal = useServing ? n['energy-kcal_serving'] : n['energy-kcal_100g'];
  const prot = useServing ? n.proteins_serving : n.proteins_100g;
  const carb = useServing ? n.carbohydrates_serving : n.carbohydrates_100g;
  const fat  = useServing ? n.fat_serving : n.fat_100g;
  if (kcal == null) return null;
  const serving = useServing
    ? (p.serving_size || `${p.serving_quantity} g`)
    : '100 g';
  return {
    source: 'OFF',
    externalId: p.code || name,
    name: name.toUpperCase(),
    brand: (p.brands || '').split(',')[0].trim(),
    serving,
    kcal: Math.round(kcal),
    p: Math.round((prot || 0) * 10) / 10,
    c: Math.round((carb || 0) * 10) / 10,
    f: Math.round((fat  || 0) * 10) / 10,
  };
}

// --- Combined search -----------------------------------------------------
async function searchFoods(query, keys) {
  const trimmed = (query || '').trim();
  if (trimmed.length < 2) return { results: [], errors: [] };
  const tasks = [
    searchUSDA(trimmed, keys.usda).catch(e => ({ __err: 'USDA', e })),
    searchNutritionix(trimmed, keys.nxId, keys.nxKey).catch(e => ({ __err: 'Nutritionix', e })),
    searchOFF(trimmed).catch(e => ({ __err: 'OpenFoodFacts', e })),
  ];
  const settled = await Promise.all(tasks);
  const errors = [];
  const results = [];
  for (const r of settled) {
    if (r && r.__err) { errors.push(`${r.__err}: ${r.e.message}`); continue; }
    results.push(...(r || []));
  }
  return { results, errors };
}

function searchAvailable(keys) {
  // OFF needs no keys, so search is always available
  return true;
}

Object.assign(window, { searchFoods, searchUSDA, searchNutritionix, searchOFF, searchAvailable });
