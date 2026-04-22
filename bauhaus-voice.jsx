// Voice-to-log: mic → transcript → Claude parse → resolve to library/USDA/OFF.

// --- Speech recognition (Web Speech API) -------------------------------
function speechAvailable() {
  return typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

function startVoiceCapture({ onPartial, onFinal, onError, onEnd }) {
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Ctor) { onError && onError('SpeechRecognition unsupported'); return null; }
  const rec = new Ctor();
  rec.lang = 'en-US';
  rec.continuous = true;
  rec.interimResults = true;
  let finalText = '';
  rec.onresult = (e) => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript;
      if (e.results[i].isFinal) finalText += t;
      else interim += t;
    }
    onPartial && onPartial((finalText + ' ' + interim).trim());
  };
  rec.onerror = (e) => { onError && onError(e.error || 'recognition error'); };
  rec.onend = () => {
    onFinal && onFinal(finalText.trim());
    onEnd && onEnd();
  };
  try { rec.start(); } catch (e) { onError && onError(e.message); return null; }
  return rec;
}

// --- Naive comma/and split (used as fallback) -------------------------
function naiveSplit(transcript) {
  const cleaned = transcript
    .toLowerCase()
    .replace(/^\s*(i (had|ate|just had|just ate)|today i had|for (breakfast|lunch|dinner|snack))\s+/i, '')
    .replace(/\.+$/, '');
  return cleaned
    .split(/,| and /i)
    .map(s => s.trim())
    .filter(Boolean)
    .map(name => ({ name, qty: 1, unit: '' }));
}

// --- Claude meal parser -----------------------------------------------
const PARSER_SYSTEM = `You convert a spoken meal description into a strict JSON array.
Output ONLY valid JSON — no prose, no markdown fences.
Each item: {"name": <food name, lowercase, generic>, "qty": <number>, "unit": <short unit or "">}.
Examples:
"two eggs, half a cup of oats and a banana" =>
[{"name":"egg","qty":2,"unit":"egg"},{"name":"rolled oats","qty":0.5,"unit":"cup"},{"name":"banana","qty":1,"unit":"medium"}]
"a protein shake with whey and some almonds" =>
[{"name":"whey protein shake","qty":1,"unit":"scoop"},{"name":"almonds","qty":1,"unit":"handful"}]
If input is empty or has no foods, output [].`;

async function parseMealWithClaude(transcript, anthropicKey) {
  if (!anthropicKey) return naiveSplit(transcript);
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 400,
        system: PARSER_SYSTEM,
        messages: [{ role: 'user', content: transcript }],
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Claude ${res.status}: ${t.slice(0, 200)}`);
    }
    const data = await res.json();
    const text = (data.content || []).map(b => b.text || '').join('').trim();
    // Strip code fences if model added them despite instructions
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return naiveSplit(transcript);
    return parsed
      .filter(x => x && typeof x.name === 'string')
      .map(x => ({
        name: String(x.name).trim(),
        qty: Number.isFinite(+x.qty) && +x.qty > 0 ? +x.qty : 1,
        unit: String(x.unit || '').trim(),
      }));
  } catch (e) {
    console.warn('Claude parse failed, falling back to naive split:', e.message);
    return naiveSplit(transcript);
  }
}

// --- Resolve parsed items to actual foods -----------------------------
function findInLibrary(library, name) {
  const q = name.toLowerCase();
  // exact word/substring match in either direction
  return library.find(f => {
    const n = f.name.toLowerCase();
    return n === q || n.includes(q) || q.includes(n);
  });
}

function unitMultiplier(parsed, foodServing) {
  // If the parsed unit appears in the food's serving label, trust the qty.
  // Otherwise default to 1 (user adjusts via stepper).
  if (!parsed.unit) return parsed.qty || 1;
  const u = parsed.unit.toLowerCase();
  const s = (foodServing || '').toLowerCase();
  if (s.includes(u)) return parsed.qty || 1;
  // Common synonyms
  const syn = {
    g: ['gram', 'grams'], gram: ['g'], cup: ['cups'], scoop: ['scoops'],
    egg: ['eggs'], slice: ['slices'], piece: ['pieces'], tbsp: ['tablespoon'],
    tsp: ['teaspoon'], oz: ['ounce', 'ounces'],
  };
  const candidates = [u, ...(syn[u] || [])];
  if (candidates.some(c => s.includes(c))) return parsed.qty || 1;
  return 1;
}

async function resolveItems(parsedItems, library, apiKeys) {
  const out = [];
  for (const item of parsedItems) {
    const libHit = findInLibrary(library, item.name);
    if (libHit) {
      out.push({
        food: libHit,
        qty: unitMultiplier(item, libHit.serving),
        spokenName: item.name,
        status: 'matched_library',
      });
      continue;
    }
    try {
      const { results } = await searchFoods(item.name, apiKeys);
      const top = results[0];
      if (top) {
        const food = {
          id: newFoodId(),
          emoji: '🍽️',
          name: top.name,
          serving: top.serving,
          kcal: top.kcal,
          p: top.p, c: top.c, f: top.f,
        };
        out.push({
          food,
          qty: unitMultiplier(item, food.serving),
          spokenName: item.name,
          status: 'matched_search',
          source: top.source,
        });
      } else {
        out.push({ food: null, qty: 1, spokenName: item.name, status: 'unresolved' });
      }
    } catch (e) {
      out.push({ food: null, qty: 1, spokenName: item.name, status: 'unresolved' });
    }
  }
  return out;
}

Object.assign(window, {
  speechAvailable, startVoiceCapture,
  parseMealWithClaude, resolveItems, naiveSplit,
});
