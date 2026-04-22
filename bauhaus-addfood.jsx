// Add-food overlay: pick from library, voice-log a meal, or create new.

function MicButton({ state, onClick, tokens }) {
  // state: 'idle' | 'listening' | 'thinking'
  const bg = state === 'listening' ? tokens.red
           : state === 'thinking'  ? tokens.muted
           :                         tokens.ink;
  const label = state === 'listening' ? 'TAP TO STOP'
              : state === 'thinking'  ? 'PARSING…'
              :                         'TAP TO SPEAK';
  return (
    <button
      onClick={onClick}
      disabled={state === 'thinking'}
      style={{
        width: '100%', height: 56,
        background: bg, color: '#fff',
        border: `3px solid ${tokens.ink}`,
        fontFamily: MONO_FONT, fontSize: 13, fontWeight: 700,
        letterSpacing: 2.5, cursor: 'pointer', padding: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        animation: state === 'listening' ? 'bauhausPulse 1.2s infinite' : 'none',
      }}>
      {/* mic glyph */}
      <div style={{ position: 'relative', width: 16, height: 18 }}>
        <div style={{
          position: 'absolute', left: 3, top: 0, width: 10, height: 12,
          background: '#fff', borderRadius: 5,
        }} />
        <div style={{
          position: 'absolute', left: 7, bottom: 0, width: 2, height: 6, background: '#fff',
        }} />
      </div>
      {label}
    </button>
  );
}

function VoicePanel({ apiKeys, library, tokens, onResolved, onError, onCancel }) {
  const [state, setState] = React.useState('idle'); // idle | listening | thinking
  const [transcript, setTranscript] = React.useState('');
  const [errMsg, setErrMsg] = React.useState('');
  const recRef = React.useRef(null);

  const stop = () => {
    if (recRef.current) { try { recRef.current.stop(); } catch {} }
  };

  const handleFinal = async (finalText) => {
    if (!finalText) { setState('idle'); return; }
    setState('thinking');
    try {
      const parsed = await parseMealWithClaude(finalText, apiKeys.anthropic);
      const resolved = await resolveItems(parsed, library, apiKeys);
      onResolved(resolved, finalText);
    } catch (e) {
      setErrMsg(e.message || 'parse failed');
      setState('idle');
    }
  };

  const start = () => {
    setErrMsg('');
    setTranscript('');
    if (!speechAvailable()) {
      setErrMsg('Speech recognition unsupported on this browser.');
      return;
    }
    setState('listening');
    recRef.current = startVoiceCapture({
      onPartial: setTranscript,
      onFinal: handleFinal,
      onError: (msg) => {
        setErrMsg(msg === 'not-allowed'
          ? 'Mic blocked. Settings → Safari → Microphone → Allow.'
          : `Mic: ${msg}`);
        setState('idle');
      },
    });
  };

  return (
    <div style={{
      padding: '14px 20px',
      borderBottom: `2px solid ${tokens.ink}`,
      background: tokens.bg,
    }}>
      <MicButton
        state={state}
        onClick={state === 'listening' ? stop : start}
        tokens={tokens}
      />
      {(transcript || state === 'listening') && (
        <div style={{
          marginTop: 10, padding: 10,
          border: `2px solid ${tokens.ink}`,
          fontFamily: MONO_FONT, fontSize: 12, color: tokens.ink,
          letterSpacing: 0.5, lineHeight: 1.5, minHeight: 36,
        }}>
          {transcript || (state === 'listening' ? 'LISTENING…' : '')}
        </div>
      )}
      {!apiKeys.anthropic && state === 'idle' && (
        <div style={{
          marginTop: 8, fontFamily: MONO_FONT, fontSize: 9,
          color: tokens.muted, letterSpacing: 1.5, lineHeight: 1.5,
        }}>NO ANTHROPIC KEY · USING NAIVE COMMA SPLIT</div>
      )}
      {errMsg && (
        <div style={{
          marginTop: 8, fontFamily: MONO_FONT, fontSize: 10,
          color: tokens.red, letterSpacing: 1, lineHeight: 1.5,
        }}>{errMsg}</div>
      )}
    </div>
  );
}

function ConfirmList({ items, setItems, tokens, onAddAll, onCancel, onCreateMissing }) {
  const updateQty = (i, qty) => {
    const next = items.slice();
    if (qty <= 0) { next.splice(i, 1); }
    else { next[i] = { ...next[i], qty }; }
    setItems(next);
  };
  const drop = (i) => {
    const next = items.slice();
    next.splice(i, 1);
    setItems(next);
  };
  const resolvedCount = items.filter(it => it.food).length;
  const totalKcal = items.reduce((s, it) => s + (it.food ? Math.round(it.food.kcal * it.qty) : 0), 0);

  return (
    <div>
      <div style={{
        padding: '14px 20px', borderBottom: `3px solid ${tokens.ink}`,
        background: tokens.blue, color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{
            fontFamily: MONO_FONT, fontSize: 10, fontWeight: 700, letterSpacing: 2.5,
          }}>VOICE LOG</div>
          <div style={{
            fontFamily: DISPLAY_FONT, fontSize: 22, letterSpacing: 0.4, marginTop: 2,
          }}>{resolvedCount} ITEMS · {totalKcal} KCAL</div>
        </div>
        <button onClick={onCancel} style={{
          width: 36, height: 36, background: tokens.ink, color: tokens.bg,
          border: 'none', cursor: 'pointer', padding: 0,
          fontFamily: DISPLAY_FONT, fontSize: 18,
        }}>×</button>
      </div>
      {items.length === 0 && (
        <div style={{
          padding: '32px 20px', textAlign: 'center',
          fontFamily: MONO_FONT, fontSize: 11,
          color: tokens.muted, letterSpacing: 1.5, lineHeight: 1.6,
        }}>NOTHING RECOGNIZED · TRY AGAIN</div>
      )}
      {items.map((it, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 20px',
          borderBottom: `2px solid ${tokens.ink}`,
          background: it.food ? tokens.bg : tokens.yellow,
        }}>
          <div style={{ fontSize: 22, width: 28 }}>{it.food ? it.food.emoji : '?'}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: DISPLAY_FONT, fontSize: 13,
              color: tokens.ink, letterSpacing: 0.3,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{it.food ? it.food.name : it.spokenName.toUpperCase()}</div>
            {it.food ? (
              <div style={{ marginTop: 5 }}>
                <Stepper value={it.qty} onChange={(q) => updateQty(i, q)} tokens={tokens} />
              </div>
            ) : (
              <button
                onClick={() => onCreateMissing(it.spokenName, i)}
                style={{
                  marginTop: 4,
                  background: tokens.ink, color: tokens.bg,
                  border: 'none', cursor: 'pointer',
                  fontFamily: MONO_FONT, fontSize: 10, fontWeight: 700,
                  letterSpacing: 1.5, padding: '4px 10px',
                }}>+ CREATE</button>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            {it.food && (
              <div style={{
                fontFamily: NUM_FONT, fontSize: 22,
                color: tokens.ink, letterSpacing: 0.5,
                fontFeatureSettings: '"tnum" 1',
              }}>{Math.round(it.food.kcal * it.qty)}</div>
            )}
            <button
              onClick={() => drop(i)}
              style={{
                background: 'transparent', border: 'none',
                cursor: 'pointer', padding: 0, marginTop: 2,
                fontFamily: MONO_FONT, fontSize: 10, fontWeight: 700,
                letterSpacing: 1, color: tokens.muted,
              }}>REMOVE</button>
          </div>
        </div>
      ))}
      <div style={{ padding: 16 }}>
        <button
          onClick={onAddAll}
          disabled={resolvedCount === 0}
          style={{
            width: '100%', height: 56,
            background: resolvedCount === 0 ? tokens.muted : tokens.red,
            color: '#fff',
            border: `3px solid ${tokens.ink}`,
            fontFamily: MONO_FONT, fontSize: 14, fontWeight: 700,
            letterSpacing: 2.5, cursor: resolvedCount === 0 ? 'not-allowed' : 'pointer',
            padding: 0, opacity: resolvedCount === 0 ? 0.6 : 1,
          }}>+ ADD ALL ({resolvedCount})</button>
      </div>
    </div>
  );
}

function AddFoodOverlay({ open, library, apiKeys, onClose, onPick, onPickMany, onNewFood, onCreateMissing, tokens }) {
  const [items, setItems] = React.useState(null); // null = picker mode; array = confirm mode

  React.useEffect(() => {
    if (!open) setItems(null);
  }, [open]);

  if (!open) return null;

  const inConfirm = items !== null;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 80,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      animation: 'bauhausFade 160ms linear',
    }}>
      <div onClick={onClose} style={{ flex: 1, cursor: 'pointer' }} />
      <div style={{
        background: tokens.bg, borderTop: `3px solid ${tokens.ink}`,
        maxHeight: '82%', overflow: 'auto',
        animation: 'bauhausSlideUp 180ms linear',
      }}>
        {inConfirm ? (
          <ConfirmList
            items={items}
            setItems={setItems}
            tokens={tokens}
            onCancel={() => setItems(null)}
            onAddAll={() => {
              const resolved = items.filter(it => it.food).map(it => ({ food: it.food, qty: it.qty }));
              onPickMany(resolved);
              onClose();
            }}
            onCreateMissing={(name) => onCreateMissing(name)}
          />
        ) : (
          <>
            {/* Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 20px', borderBottom: `3px solid ${tokens.ink}`,
              background: tokens.yellow,
            }}>
              <div>
                <div style={{
                  fontFamily: MONO_FONT, fontSize: 10, fontWeight: 700,
                  letterSpacing: 2.5, color: tokens.ink,
                }}>FROM LIBRARY OR VOICE</div>
                <div style={{
                  fontFamily: DISPLAY_FONT, fontSize: 24,
                  color: tokens.ink, letterSpacing: 0.4, marginTop: 2,
                }}>ADD FOOD</div>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 36, height: 36,
                  background: tokens.ink, color: tokens.bg,
                  border: 'none', cursor: 'pointer', padding: 0,
                  fontFamily: DISPLAY_FONT, fontSize: 18,
                }}>×</button>
            </div>

            {speechAvailable() && (
              <VoicePanel
                apiKeys={apiKeys}
                library={library}
                tokens={tokens}
                onResolved={(resolved) => setItems(resolved)}
              />
            )}

            {library.length === 0 ? (
              <div style={{ padding: '24px 20px', textAlign: 'center' }}>
                <div style={{
                  fontFamily: DISPLAY_FONT, fontSize: 16,
                  color: tokens.ink, letterSpacing: 0.4, marginBottom: 8,
                }}>EMPTY LIBRARY</div>
                <div style={{
                  fontFamily: MONO_FONT, fontSize: 11,
                  color: tokens.muted, letterSpacing: 1.5, lineHeight: 1.6,
                  marginBottom: 20,
                }}>SPEAK A MEAL ABOVE OR ADD ONE BELOW</div>
                <button
                  onClick={onNewFood}
                  style={{
                    width: '100%', height: 52,
                    background: tokens.red, color: '#fff',
                    border: `3px solid ${tokens.ink}`,
                    fontFamily: MONO_FONT, fontSize: 13, fontWeight: 700,
                    letterSpacing: 2.5, cursor: 'pointer', padding: 0,
                  }}>+ NEW FOOD</button>
              </div>
            ) : (
              <>
                {library.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => { onPick(f); onClose(); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '12px 20px',
                      borderBottom: `2px solid ${tokens.ink}`,
                      cursor: 'pointer', background: tokens.bg,
                    }}
                  >
                    <div style={{ fontSize: 24, width: 28 }}>{f.emoji}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: DISPLAY_FONT, fontSize: 13,
                        color: tokens.ink, letterSpacing: 0.3,
                      }}>{f.name}</div>
                      <div style={{
                        fontFamily: MONO_FONT, fontSize: 10, fontWeight: 700,
                        letterSpacing: 1.5, color: tokens.muted, marginTop: 3,
                      }}>{f.serving}</div>
                    </div>
                    <div style={{
                      fontFamily: NUM_FONT, fontSize: 22,
                      color: tokens.ink, letterSpacing: 0.5,
                      fontFeatureSettings: '"tnum" 1',
                    }}>{f.kcal}</div>
                  </div>
                ))}
                <div style={{ padding: 16 }}>
                  <button
                    onClick={onNewFood}
                    style={{
                      width: '100%', height: 48,
                      background: tokens.bg, color: tokens.ink,
                      border: `3px solid ${tokens.ink}`,
                      fontFamily: MONO_FONT, fontSize: 12, fontWeight: 700,
                      letterSpacing: 2.5, cursor: 'pointer', padding: 0,
                    }}>+ NEW FOOD</button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { AddFoodOverlay });
