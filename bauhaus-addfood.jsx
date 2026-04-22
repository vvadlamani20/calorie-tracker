// Add-food overlay: Bauhaus modal with grid of food library items

function AddFoodOverlay({ open, onClose, onPick, tokens }) {
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
            }}>OFF-TEMPLATE</div>
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
        {FOOD_LIB.map((f, i) => (
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
      </div>
    </div>
  );
}

Object.assign(window, { AddFoodOverlay });
