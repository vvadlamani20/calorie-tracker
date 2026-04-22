// My Foods + Default Day (segmented)

function SegmentedControl({ tabs, active, onChange, tokens }) {
  return (
    <div style={{
      display: 'flex', border: `3px solid ${tokens.ink}`,
      margin: '0 20px',
    }}>
      {tabs.map((t, i) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          style={{
            flex: 1, height: 44,
            background: active === t ? tokens.ink : tokens.bg,
            color: active === t ? tokens.bg : tokens.ink,
            border: 'none',
            borderRight: i < tabs.length - 1 ? `3px solid ${tokens.ink}` : 'none',
            fontFamily: MONO_FONT, fontSize: 12, fontWeight: 700,
            letterSpacing: 2, cursor: 'pointer', padding: 0,
          }}
        >{t}</button>
      ))}
    </div>
  );
}

function MyFoodsList({ library, tokens, onEditFood }) {
  return (
    <div>
      <div style={{
        padding: '18px 20px 10px',
        fontFamily: MONO_FONT, fontSize: 11, fontWeight: 700,
        letterSpacing: 2.5, color: tokens.ink,
        display: 'flex', justifyContent: 'space-between',
      }}>
        <span>— LIBRARY</span>
        <span style={{ color: tokens.muted }}>{library.length} ITEMS</span>
      </div>
      <div style={{ borderTop: `2px solid ${tokens.ink}` }} />
      {library.length === 0 && (
        <div style={{
          margin: '20px',
          border: `3px solid ${tokens.ink}`, padding: '28px 20px',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: DISPLAY_FONT, fontSize: 18,
            color: tokens.ink, letterSpacing: 0.4, marginBottom: 8,
          }}>NO FOODS YET</div>
          <div style={{
            fontFamily: MONO_FONT, fontSize: 11,
            color: tokens.muted, letterSpacing: 1.5, lineHeight: 1.6,
          }}>TAP NEW FOOD BELOW TO SEARCH<br/>USDA · OPEN FOOD FACTS</div>
        </div>
      )}
      {library.map((f) => (
        <div
          key={f.id}
          onClick={() => onEditFood(f)}
          style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 20px',
            borderBottom: `2px solid ${tokens.ink}`,
            background: tokens.bg, cursor: 'pointer',
          }}>
          <div style={{ fontSize: 26, width: 30 }}>{f.emoji}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: DISPLAY_FONT, fontSize: 14,
              color: tokens.ink, letterSpacing: 0.3,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{f.name}</div>
            <div style={{
              fontFamily: MONO_FONT, fontSize: 10, fontWeight: 700,
              letterSpacing: 1.5, color: tokens.muted, marginTop: 4,
            }}>{f.serving} · P{f.p} C{f.c} F{f.f}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontFamily: NUM_FONT, fontSize: 26, lineHeight: 1,
              color: tokens.ink, letterSpacing: 0.5,
              fontFeatureSettings: '"tnum" 1',
            }}>{f.kcal}</div>
            <div style={{
              fontFamily: MONO_FONT, fontSize: 9, fontWeight: 700,
              letterSpacing: 1.5, color: tokens.muted, marginTop: 2,
            }}>KCAL</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DefaultDayList({ library, defaultDay, setDefaultDay, tokens, showBanner }) {
  const totals = sumDay(library, defaultDay);
  const updateQty = (i, qty) => {
    if (qty <= 0) { removeAt(i); return; }
    const next = defaultDay.slice();
    next[i] = { ...next[i], qty };
    setDefaultDay(next);
    showBanner();
  };
  const removeAt = (i) => {
    const next = defaultDay.slice();
    next.splice(i, 1);
    setDefaultDay(next);
    showBanner();
  };
  return (
    <div>
      {/* Summary strip */}
      <div style={{
        margin: '16px 20px 0', background: tokens.yellow,
        border: `3px solid ${tokens.ink}`,
        padding: '12px 16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{
            fontFamily: MONO_FONT, fontSize: 10, fontWeight: 700,
            letterSpacing: 2.5, color: tokens.ink,
          }}>TEMPLATE TOTAL</div>
          <div style={{
            fontFamily: NUM_FONT, fontSize: 32,
            color: tokens.ink, letterSpacing: 0.5, marginTop: 2,
            fontFeatureSettings: '"tnum" 1',
          }}>{totals.kcal.toLocaleString()} KCAL</div>
        </div>
        <div style={{
          fontFamily: MONO_FONT, fontSize: 10, fontWeight: 700,
          letterSpacing: 1.5, color: tokens.ink,
          textAlign: 'right', lineHeight: 1.6,
        }}>
          P {totals.p}G<br/>
          C {totals.c}G<br/>
          F {totals.f}G
        </div>
      </div>

      <div style={{
        padding: '18px 20px 10px',
        fontFamily: MONO_FONT, fontSize: 11, fontWeight: 700,
        letterSpacing: 2.5, color: tokens.ink,
      }}>— EVERY MORNING</div>
      <div style={{ borderTop: `2px solid ${tokens.ink}` }} />
      {defaultDay.length === 0 && (
        <div style={{
          padding: '28px 20px', textAlign: 'center',
          fontFamily: MONO_FONT, fontSize: 11,
          color: tokens.muted, letterSpacing: 1.5, lineHeight: 1.6,
        }}>NO TEMPLATE YET</div>
      )}
      {defaultDay.map((e, i) => {
        const f = getFood(library, e.foodId);
        if (!f) return null;
        return (
          <SwipeRow
            key={e.foodId + '_' + i}
            onDelete={() => removeAt(i)}
            tokens={tokens}
            height={72}
          >
            <div style={{
              display: 'flex', alignItems: 'center',
              padding: '12px 20px', gap: 14, height: '100%', boxSizing: 'border-box',
            }}>
              <div style={{ fontSize: 24, width: 28 }}>{f.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: DISPLAY_FONT, fontSize: 13,
                  color: tokens.ink, letterSpacing: 0.3,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{f.name}</div>
                <div style={{ marginTop: 5 }}>
                  <Stepper value={e.qty} onChange={(q) => updateQty(i, q)} tokens={tokens} />
                </div>
              </div>
              <div style={{
                fontFamily: NUM_FONT, fontSize: 22,
                color: tokens.ink, letterSpacing: 0.5,
                fontFeatureSettings: '"tnum" 1',
              }}>{f.kcal * e.qty}</div>
            </div>
          </SwipeRow>
        );
      })}
    </div>
  );
}

function SettingsButton({ tokens, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Settings"
      style={{
        width: 44, height: 44,
        background: tokens.bg, border: `3px solid ${tokens.ink}`,
        cursor: 'pointer', padding: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: MONO_FONT, fontSize: 18, fontWeight: 700, color: tokens.ink,
      }}
    >⚙</button>
  );
}

function MyFoodsScreen({ library, defaultDay, setDefaultDay, tokens, dark, setDark, onNewFood, onEditFood, onOpenSettings }) {
  const [tab, setTab] = React.useState('MY FOODS');
  const [banner, setBanner] = React.useState(false);
  const [pickOpen, setPickOpen] = React.useState(false);
  const showBanner = () => {
    setBanner(true);
    setTimeout(() => setBanner(false), 2000);
  };
  const addToDefault = (food) => {
    setDefaultDay([...defaultDay, { foodId: food.id, qty: 1 }]);
    showBanner();
  };
  return (
    <div style={{ background: tokens.bg, minHeight: '100%', paddingBottom: 24, position: 'relative' }}>
      <div style={{
        padding: 'calc(env(safe-area-inset-top, 0px) + 14px) 20px 12px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      }}>
        <div>
          <div style={{
            fontFamily: MONO_FONT, fontSize: 11, fontWeight: 700,
            letterSpacing: 2.5, color: tokens.muted,
          }}>CONFIGURE</div>
          <div style={{
            fontFamily: DISPLAY_FONT, fontSize: 36,
            color: tokens.ink, letterSpacing: 0.5, marginTop: 2,
          }}>FOODS</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <SettingsButton tokens={tokens} onClick={onOpenSettings} />
          <DarkToggle dark={dark} setDark={setDark} tokens={tokens} />
        </div>
      </div>
      <div style={{ height: 3, background: tokens.ink, marginBottom: 16 }} />

      <SegmentedControl
        tabs={['MY FOODS', 'DEFAULT DAY']}
        active={tab} onChange={setTab} tokens={tokens}
      />

      {tab === 'MY FOODS'
        ? <MyFoodsList library={library} tokens={tokens} onEditFood={onEditFood} />
        : <DefaultDayList library={library} defaultDay={defaultDay} setDefaultDay={setDefaultDay} tokens={tokens} showBanner={showBanner} />}

      {/* CTA */}
      <div style={{ padding: 20 }}>
        <button
          onClick={tab === 'MY FOODS' ? onNewFood : () => setPickOpen(true)}
          disabled={tab === 'DEFAULT DAY' && library.length === 0}
          style={{
            width: '100%', height: 56,
            background: tab === 'DEFAULT DAY' && library.length === 0 ? tokens.muted : tokens.red,
            color: '#fff',
            border: `3px solid ${tokens.ink}`,
            fontFamily: MONO_FONT, fontSize: 14, fontWeight: 700,
            letterSpacing: 2.5, cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            opacity: tab === 'DEFAULT DAY' && library.length === 0 ? 0.6 : 1,
          }}>
          <div style={{ position: 'relative', width: 16, height: 16 }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 3, background: '#fff', transform: 'translateY(-50%)' }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 3, background: '#fff', transform: 'translateX(-50%)' }} />
          </div>
          {tab === 'MY FOODS' ? 'NEW FOOD' : 'ADD TO DEFAULT'}
        </button>
      </div>

      <AddFoodOverlay
        open={pickOpen}
        library={library}
        onClose={() => setPickOpen(false)}
        onPick={addToDefault}
        onNewFood={() => { setPickOpen(false); onNewFood(); }}
        tokens={tokens}
      />

      {/* Banner */}
      <div style={{
        position: 'absolute', top: banner ? 44 : -60, left: 0, right: 0,
        background: tokens.ink, color: tokens.bg,
        padding: '14px 20px',
        fontFamily: MONO_FONT, fontSize: 12, fontWeight: 700,
        letterSpacing: 2.5, textAlign: 'center',
        transition: 'top 200ms linear', zIndex: 30,
      }}>▲ DEFAULT DAY UPDATED</div>
    </div>
  );
}

Object.assign(window, { MyFoodsScreen });
