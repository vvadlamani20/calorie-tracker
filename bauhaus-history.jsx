// History screen — proportional segmented macro bars

function MacroBar({ macros, tokens }) {
  // convert g to kcal-ish for proportional display
  const pk = macros.p * 4;
  const ck = macros.c * 4;
  const fk = macros.f * 9;
  const total = pk + ck + fk || 1;
  const segs = [
    { w: (pk / total) * 100, c: tokens.red },
    { w: (ck / total) * 100, c: tokens.blue },
    { w: (fk / total) * 100, c: tokens.yellow },
  ];
  return (
    <div style={{
      display: 'flex', height: 20, width: '100%',
      border: `2px solid ${tokens.ink}`,
    }}>
      {segs.map((s, i) => (
        <div key={i} style={{
          width: `${s.w}%`, background: s.c,
          borderRight: i < 2 ? `2px solid ${tokens.ink}` : 'none',
        }} />
      ))}
    </div>
  );
}

function HistoryCard({ day, tokens, open, onToggle }) {
  const totals = sumDay(day.entries);
  return (
    <div style={{
      border: `3px solid ${tokens.ink}`,
      background: tokens.bg,
      marginBottom: 16,
    }}>
      <div
        onClick={onToggle}
        style={{
          padding: '16px 18px',
          display: 'flex', flexDirection: 'column', gap: 12,
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontFamily: MONO_FONT, fontSize: 11, fontWeight: 700,
              letterSpacing: 2.5, color: tokens.muted, lineHeight: 1.2,
            }}>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()}</div>
            <div style={{
              fontFamily: NUM_FONT, fontSize: 40, lineHeight: 1.1,
              color: tokens.ink, letterSpacing: 0.5, marginTop: 4,
              paddingBottom: 4,
            }}>{day.label}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontFamily: NUM_FONT, fontSize: 44, lineHeight: 1.1,
              color: tokens.ink, letterSpacing: 0.5,
              fontFeatureSettings: '"tnum" 1',
              paddingBottom: 4,
            }}>{totals.kcal.toLocaleString()}</div>
            <div style={{
              fontFamily: MONO_FONT, fontSize: 10, fontWeight: 700,
              letterSpacing: 2, color: tokens.muted,
            }}>KCAL</div>
          </div>
        </div>
        <MacroBar macros={totals} tokens={tokens} />
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontFamily: MONO_FONT, fontSize: 10, fontWeight: 700,
          letterSpacing: 1.5, color: tokens.ink,
        }}>
          <span>P {totals.p}G</span>
          <span>C {totals.c}G</span>
          <span>F {totals.f}G</span>
          <span style={{ color: tokens.muted }}>{open ? '▲' : '▼'} {day.entries.length}</span>
        </div>
      </div>
      {open && (
        <div style={{ borderTop: `2px solid ${tokens.ink}` }}>
          {day.entries.map((e, i) => {
            const f = getFood(e.foodId);
            if (!f) return null;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 18px',
                borderBottom: i < day.entries.length - 1 ? `1px solid ${tokens.ink}22` : 'none',
              }}>
                <div style={{ fontSize: 20, width: 24 }}>{f.emoji}</div>
                <div style={{
                  flex: 1, fontFamily: DISPLAY_FONT, fontSize: 12,
                  color: tokens.ink, letterSpacing: 0.3,
                }}>{f.name}</div>
                <div style={{
                  fontFamily: MONO_FONT, fontSize: 11, fontWeight: 700,
                  letterSpacing: 1, color: tokens.muted, width: 28,
                }}>×{e.qty}</div>
                <div style={{
                  fontFamily: NUM_FONT, fontSize: 20,
                  color: tokens.ink, width: 50, textAlign: 'right',
                  fontFeatureSettings: '"tnum" 1',
                }}>{f.kcal * e.qty}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function HistoryScreen({ tokens, dark, setDark }) {
  const [openIdx, setOpenIdx] = React.useState(0);
  return (
    <div style={{ background: tokens.bg, minHeight: '100%', paddingBottom: 24 }}>
      <div style={{
        padding: 'calc(env(safe-area-inset-top, 0px) + 14px) 20px 12px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      }}>
        <div>
          <div style={{
            fontFamily: MONO_FONT, fontSize: 11, fontWeight: 700,
            letterSpacing: 2.5, color: tokens.muted,
          }}>LOG · 7 DAYS</div>
          <div style={{
            fontFamily: DISPLAY_FONT, fontSize: 36,
            color: tokens.ink, letterSpacing: 0.5, marginTop: 2,
          }}>HISTORY</div>
        </div>
        <DarkToggle dark={dark} setDark={setDark} tokens={tokens} />
      </div>
      <div style={{ height: 3, background: tokens.ink, marginBottom: 20 }} />

      {/* Weekly average strip */}
      <div style={{
        margin: '0 20px 24px', background: tokens.ink, color: tokens.bg,
        padding: '12px 16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{
          fontFamily: MONO_FONT, fontSize: 10, fontWeight: 700,
          letterSpacing: 2.5,
        }}>7-DAY AVG</div>
        <div style={{
          fontFamily: NUM_FONT, fontSize: 32, letterSpacing: 0.5,
          fontFeatureSettings: '"tnum" 1',
        }}>{Math.round(HISTORY.reduce((a, d) => a + sumDay(d.entries).kcal, 0) / HISTORY.length).toLocaleString()}</div>
        <div style={{
          fontFamily: MONO_FONT, fontSize: 10, fontWeight: 700,
          letterSpacing: 2, opacity: 0.7,
        }}>KCAL/DAY</div>
      </div>

      <div style={{ padding: '0 20px' }}>
        {HISTORY.map((d, i) => (
          <HistoryCard
            key={d.date} day={d} tokens={tokens}
            open={openIdx === i}
            onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
          />
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { HistoryScreen });
