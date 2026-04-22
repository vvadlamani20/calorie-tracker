// Add-food overlay: pick from library, or jump to New Food editor

function AddFoodOverlay({ open, library, onClose, onPick, onNewFood, tokens }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 80,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      animation: 'bauhausFade 160ms linear',
    }}>
      <div
        onClick={onClose}
        style={{ flex: 1, cursor: 'pointer' }}
      />
      <div style={{
        background: tokens.bg, borderTop: `3px solid ${tokens.ink}`,
        maxHeight: '72%', overflow: 'auto',
        animation: 'bauhausSlideUp 180ms linear',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', borderBottom: `3px solid ${tokens.ink}`,
          background: tokens.yellow,
        }}>
          <div>
            <div style={{
              fontFamily: MONO_FONT, fontSize: 10, fontWeight: 700,
              letterSpacing: 2.5, color: tokens.ink,
            }}>FROM LIBRARY</div>
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

        {library.length === 0 ? (
          <div style={{
            padding: '32px 20px', textAlign: 'center',
          }}>
            <div style={{
              fontFamily: DISPLAY_FONT, fontSize: 18,
              color: tokens.ink, letterSpacing: 0.4, marginBottom: 8,
            }}>EMPTY LIBRARY</div>
            <div style={{
              fontFamily: MONO_FONT, fontSize: 11,
              color: tokens.muted, letterSpacing: 1.5, lineHeight: 1.6,
              marginBottom: 20,
            }}>SEARCH USDA OR OPEN FOOD FACTS<br/>TO BUILD YOUR LIBRARY</div>
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
      </div>
    </div>
  );
}

Object.assign(window, { AddFoodOverlay });
