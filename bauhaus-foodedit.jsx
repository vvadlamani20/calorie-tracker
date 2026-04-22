// FoodEditor — Bauhaus modal for creating or editing a food.
// Includes USDA + Nutritionix search to autofill macros, plus manual fields.

const COMMON_EMOJIS = ['🥣','☕','🥚','🍌','🍗','🍚','🥦','🥛','🌰','🍎','🐟','🥑','🍞','🍫','🍺','🥗','🍕','🍝','🍔','🌮','🍜','🍱','🥪','🍳','🧀','🥜','🥕','🥔','🍅','🥒','🍇','🍓','🥭','🍊','🥥','🍯','🍪','🍩','🍰','🥖','🥯','🧈','🍖','🥩','🍤','🦐','🍣','🌶️','🧄','🧅','🍵','🥤','🧃','🍷','🥃','🍹'];

function parseNum(s) {
  const n = parseFloat(String(s).replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function FoodEditor({ open, initial, onClose, onSave, onDelete, tokens, apiKeys }) {
  const [emoji, setEmoji] = React.useState('🍽️');
  const [name, setName] = React.useState('');
  const [serving, setServing] = React.useState('100 g');
  const [kcal, setKcal] = React.useState('');
  const [p, setP] = React.useState('');
  const [c, setC] = React.useState('');
  const [f, setF] = React.useState('');
  const [emojiPickerOpen, setEmojiPickerOpen] = React.useState(false);

  // Search state
  const [query, setQuery] = React.useState('');
  const [searching, setSearching] = React.useState(false);
  const [results, setResults] = React.useState([]);
  const [searchErr, setSearchErr] = React.useState('');

  React.useEffect(() => {
    if (!open) return;
    setEmoji(initial?.emoji || '🍽️');
    setName(initial?.name || '');
    setServing(initial?.serving || '100 g');
    setKcal(initial?.kcal != null ? String(initial.kcal) : '');
    setP(initial?.p != null ? String(initial.p) : '');
    setC(initial?.c != null ? String(initial.c) : '');
    setF(initial?.f != null ? String(initial.f) : '');
    setQuery('');
    setResults([]);
    setSearchErr('');
    setEmojiPickerOpen(false);
  }, [open, initial]);

  if (!open) return null;

  const runSearch = async () => {
    if (!query.trim()) return;
    setSearching(true); setSearchErr('');
    try {
      const { results, errors } = await searchFoods(query, apiKeys);
      setResults(results);
      if (errors.length && results.length === 0) setSearchErr(errors.join(' · '));
    } catch (e) {
      setSearchErr(e.message || 'search failed');
    } finally {
      setSearching(false);
    }
  };

  const pickResult = (r) => {
    setName(r.brand ? `${r.name} (${r.brand.toUpperCase()})` : r.name);
    setServing(r.serving);
    setKcal(String(r.kcal));
    setP(String(r.p));
    setC(String(r.c));
    setF(String(r.f));
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    onSave({
      id: initial?.id || newFoodId(),
      emoji: emoji || '🍽️',
      name: trimmedName.toUpperCase(),
      serving: serving.trim() || '1 SERVING',
      kcal: Math.max(0, Math.round(parseNum(kcal))),
      p: Math.max(0, Math.round(parseNum(p) * 10) / 10),
      c: Math.max(0, Math.round(parseNum(c) * 10) / 10),
      f: Math.max(0, Math.round(parseNum(f) * 10) / 10),
    });
  };

  // Open Food Facts works without any keys, so search is always enabled.
  // USDA / Nutritionix join in if keys are present.
  const haveKeys = true;
  const sources = [];
  sources.push('OFF');
  if (apiKeys.usda) sources.push('USDA');
  if (apiKeys.nxId && apiKeys.nxKey) sources.push('NX');

  const inputStyle = {
    width: '100%', height: 40,
    background: tokens.bg, color: tokens.ink,
    border: `2px solid ${tokens.ink}`,
    fontFamily: MONO_FONT, fontSize: 13, fontWeight: 700,
    letterSpacing: 1, padding: '0 10px',
    outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle = {
    fontFamily: MONO_FONT, fontSize: 10, fontWeight: 700,
    letterSpacing: 2, color: tokens.muted,
    display: 'block', marginBottom: 4,
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 90,
      background: 'rgba(0,0,0,0.55)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      animation: 'bauhausFade 160ms linear',
    }}>
      <div onClick={onClose} style={{ flex: 1, cursor: 'pointer' }} />
      <div style={{
        background: tokens.bg, borderTop: `3px solid ${tokens.ink}`,
        maxHeight: '92%', overflow: 'auto',
        animation: 'bauhausSlideUp 180ms linear',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 20px', borderBottom: `3px solid ${tokens.ink}`,
          background: tokens.yellow, position: 'sticky', top: 0, zIndex: 5,
        }}>
          <div>
            <div style={{
              fontFamily: MONO_FONT, fontSize: 10, fontWeight: 700,
              letterSpacing: 2.5, color: tokens.ink,
            }}>{initial ? 'EDIT' : 'NEW'}</div>
            <div style={{
              fontFamily: DISPLAY_FONT, fontSize: 22,
              color: tokens.ink, letterSpacing: 0.4, marginTop: 2,
            }}>FOOD</div>
          </div>
          <button onClick={onClose} style={{
            width: 36, height: 36, background: tokens.ink, color: tokens.bg,
            border: 'none', cursor: 'pointer', padding: 0,
            fontFamily: DISPLAY_FONT, fontSize: 18,
          }}>×</button>
        </div>

        {/* Search */}
        <div style={{ padding: '16px 20px 8px' }}>
          <label style={labelStyle}>SEARCH · {sources.join(' + ')}</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') runSearch(); }}
              placeholder="e.g. greek yogurt, 1 cup oats"
              style={inputStyle}
            />
            <button
              onClick={runSearch}
              disabled={!haveKeys || searching}
              style={{
                height: 40, padding: '0 14px',
                background: tokens.red, color: '#fff',
                border: `2px solid ${tokens.ink}`,
                fontFamily: MONO_FONT, fontSize: 11, fontWeight: 700,
                letterSpacing: 2, cursor: 'pointer',
                opacity: haveKeys && !searching ? 1 : 0.5,
              }}>{searching ? '…' : 'GO'}</button>
          </div>
          {searchErr && (
            <div style={{
              fontFamily: MONO_FONT, fontSize: 10, color: tokens.red,
              marginTop: 6, letterSpacing: 1,
            }}>{searchErr}</div>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div style={{
            margin: '0 20px 12px',
            border: `2px solid ${tokens.ink}`,
            maxHeight: 220, overflow: 'auto',
          }}>
            {results.map((r, i) => (
              <div
                key={r.source + '_' + r.externalId + '_' + i}
                onClick={() => pickResult(r)}
                style={{
                  padding: '10px 12px',
                  borderBottom: i < results.length - 1 ? `1px solid ${tokens.ink}33` : 'none',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}
              >
                <div style={{
                  fontFamily: MONO_FONT, fontSize: 9, fontWeight: 700,
                  letterSpacing: 1.5, color: r.source === 'USDA' ? '#fff' : tokens.ink,
                  background: r.source === 'USDA' ? tokens.blue
                            : r.source === 'OFF'  ? tokens.yellow
                            :                       tokens.red,
                  padding: '3px 6px',
                  flexShrink: 0,
                }}>{r.source === 'OFF' ? 'OFF' : r.source === 'USDA' ? 'USDA' : 'NX'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: DISPLAY_FONT, fontSize: 12, color: tokens.ink,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{r.name}{r.brand ? ` · ${r.brand}` : ''}</div>
                  <div style={{
                    fontFamily: MONO_FONT, fontSize: 10, color: tokens.muted,
                    marginTop: 2, letterSpacing: 1,
                  }}>{r.serving} · {r.kcal} kcal · P{r.p} C{r.c} F{r.f}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Manual fields */}
        <div style={{ padding: '4px 20px 16px' }}>
          {/* Emoji + name */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <div>
              <label style={labelStyle}>ICON</label>
              <button
                onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
                style={{
                  width: 56, height: 40, fontSize: 24,
                  background: tokens.bg, border: `2px solid ${tokens.ink}`,
                  cursor: 'pointer', padding: 0,
                }}
              >{emoji}</button>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>NAME</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="EGG WHITES"
                style={inputStyle}
              />
            </div>
          </div>

          {emojiPickerOpen && (
            <div style={{
              border: `2px solid ${tokens.ink}`, padding: 8, marginBottom: 12,
              display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4,
              maxHeight: 160, overflow: 'auto',
            }}>
              {COMMON_EMOJIS.map((em) => (
                <button
                  key={em}
                  onClick={() => { setEmoji(em); setEmojiPickerOpen(false); }}
                  style={{
                    fontSize: 20, padding: 4, cursor: 'pointer',
                    background: em === emoji ? tokens.yellow : tokens.bg,
                    border: 'none',
                  }}
                >{em}</button>
              ))}
            </div>
          )}

          {/* Serving */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>SERVING</label>
            <input
              value={serving}
              onChange={(e) => setServing(e.target.value)}
              placeholder="100 g"
              style={inputStyle}
            />
          </div>

          {/* Macros grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div>
              <label style={labelStyle}>KCAL</label>
              <input value={kcal} onChange={(e) => setKcal(e.target.value)} inputMode="numeric" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>PROTEIN G</label>
              <input value={p} onChange={(e) => setP(e.target.value)} inputMode="decimal" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>CARBS G</label>
              <input value={c} onChange={(e) => setC(e.target.value)} inputMode="decimal" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>FAT G</label>
              <input value={f} onChange={(e) => setF(e.target.value)} inputMode="decimal" style={inputStyle} />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            {initial && onDelete && (
              <button
                onClick={() => { if (confirm('Delete this food?')) onDelete(initial.id); }}
                style={{
                  flex: 1, height: 52,
                  background: tokens.bg, color: tokens.red,
                  border: `3px solid ${tokens.red}`,
                  fontFamily: MONO_FONT, fontSize: 12, fontWeight: 700,
                  letterSpacing: 2.5, cursor: 'pointer', padding: 0,
                }}>DELETE</button>
            )}
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              style={{
                flex: 2, height: 52,
                background: tokens.red, color: '#fff',
                border: `3px solid ${tokens.ink}`,
                fontFamily: MONO_FONT, fontSize: 13, fontWeight: 700,
                letterSpacing: 2.5, cursor: name.trim() ? 'pointer' : 'not-allowed',
                opacity: name.trim() ? 1 : 0.5, padding: 0,
              }}>{initial ? 'SAVE' : 'ADD FOOD'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Settings sheet for API keys ---------------------------------------
function SettingsSheet({ open, onClose, apiKeys, setApiKeys, tokens }) {
  const [usda, setUsda] = React.useState(apiKeys.usda || '');
  const [nxId, setNxId] = React.useState(apiKeys.nxId || '');
  const [nxKey, setNxKey] = React.useState(apiKeys.nxKey || '');

  React.useEffect(() => {
    if (open) {
      setUsda(apiKeys.usda || '');
      setNxId(apiKeys.nxId || '');
      setNxKey(apiKeys.nxKey || '');
    }
  }, [open]);

  if (!open) return null;

  const save = () => {
    setApiKeys({ usda: usda.trim(), nxId: nxId.trim(), nxKey: nxKey.trim() });
    onClose();
  };

  const inputStyle = {
    width: '100%', height: 40,
    background: tokens.bg, color: tokens.ink,
    border: `2px solid ${tokens.ink}`,
    fontFamily: MONO_FONT, fontSize: 12,
    letterSpacing: 1, padding: '0 10px',
    outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle = {
    fontFamily: MONO_FONT, fontSize: 10, fontWeight: 700,
    letterSpacing: 2, color: tokens.muted,
    display: 'block', marginBottom: 4,
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 95,
      background: 'rgba(0,0,0,0.55)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      animation: 'bauhausFade 160ms linear',
    }}>
      <div onClick={onClose} style={{ flex: 1, cursor: 'pointer' }} />
      <div style={{
        background: tokens.bg, borderTop: `3px solid ${tokens.ink}`,
        maxHeight: '85%', overflow: 'auto',
        animation: 'bauhausSlideUp 180ms linear',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 20px', borderBottom: `3px solid ${tokens.ink}`,
          background: tokens.blue, color: '#fff',
        }}>
          <div>
            <div style={{
              fontFamily: MONO_FONT, fontSize: 10, fontWeight: 700,
              letterSpacing: 2.5,
            }}>CONFIGURE</div>
            <div style={{
              fontFamily: DISPLAY_FONT, fontSize: 22, letterSpacing: 0.4, marginTop: 2,
            }}>API KEYS</div>
          </div>
          <button onClick={onClose} style={{
            width: 36, height: 36, background: tokens.ink, color: tokens.bg,
            border: 'none', cursor: 'pointer', padding: 0,
            fontFamily: DISPLAY_FONT, fontSize: 18,
          }}>×</button>
        </div>

        <div style={{ padding: '16px 20px' }}>
          <div style={{
            fontFamily: MONO_FONT, fontSize: 10, color: tokens.muted,
            letterSpacing: 1.5, lineHeight: 1.6, marginBottom: 16,
          }}>
            STORED ON THIS DEVICE ONLY · NEVER SENT TO ANYONE BUT THE NUTRITION APIS THEMSELVES
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>USDA FOODDATA CENTRAL KEY</label>
            <input value={usda} onChange={(e) => setUsda(e.target.value)} placeholder="…" style={inputStyle} />
            <div style={{
              fontFamily: MONO_FONT, fontSize: 9, color: tokens.muted,
              letterSpacing: 1, marginTop: 4,
            }}>SIGN UP: fdc.nal.usda.gov/api-key-signup.html</div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>NUTRITIONIX APP ID</label>
            <input value={nxId} onChange={(e) => setNxId(e.target.value)} placeholder="…" style={inputStyle} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>NUTRITIONIX APP KEY</label>
            <input value={nxKey} onChange={(e) => setNxKey(e.target.value)} placeholder="…" style={inputStyle} />
            <div style={{
              fontFamily: MONO_FONT, fontSize: 9, color: tokens.muted,
              letterSpacing: 1, marginTop: 4,
            }}>SIGN UP: developer.nutritionix.com/signup</div>
          </div>

          <button
            onClick={save}
            style={{
              width: '100%', height: 52,
              background: tokens.red, color: '#fff',
              border: `3px solid ${tokens.ink}`,
              fontFamily: MONO_FONT, fontSize: 13, fontWeight: 700,
              letterSpacing: 2.5, cursor: 'pointer', padding: 0, marginTop: 8,
            }}>SAVE</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { FoodEditor, SettingsSheet });
