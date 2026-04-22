// Today screen — Bauhaus poster header + food list

function MacroSquare({ label, value, color, tokens }) {
  const v = useCountUp(value);
  // Dark ink on yellow, white on red/blue
  const textColor = color === tokens.yellow ? tokens.ink : '#fff';
  return (
    <div style={{
      flex: 1,
      aspectRatio: '1 / 1',
      background: color,
      display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between',
      padding: 12, boxSizing: 'border-box',
      color: textColor,
    }}>
      <div style={{
        fontFamily: NUM_FONT, fontSize: 44, lineHeight: 0.9,
        letterSpacing: 0.5,
      }}>{v}<span style={{ fontSize: 18, marginLeft: 2 }}>G</span></div>
      <div style={{
        fontFamily: MONO_FONT, fontSize: 10, fontWeight: 700,
        letterSpacing: 2,
      }}>{label}</div>
    </div>
  );
}

function TodayHeader({ totals, tokens }) {
  const kcal = useCountUp(totals.kcal);
  return (
    <div style={{ background: tokens.red, color: '#fff', position: 'relative' }}>
      <div style={{ padding: '24px 20px 20px' }}>
        <div style={{
          fontFamily: MONO_FONT, fontSize: 11, fontWeight: 700,
          letterSpacing: 2.5, opacity: 0.9,
        }}>KCAL TODAY</div>
        <div style={{
          fontFamily: NUM_FONT, fontSize: 108, lineHeight: 0.9,
          letterSpacing: -1, marginTop: 4,
          fontFeatureSettings: '"tnum" 1',
        }}>
          {kcal.toLocaleString()}
        </div>
        <div style={{
          fontFamily: MONO_FONT, fontSize: 10,
          letterSpacing: 2, opacity: 0.85, marginTop: 6,
        }}>
          GOAL 2,200 · {Math.round((kcal / 2200) * 100)}%
        </div>
      </div>
      {/* thick black bottom rule */}
      <div style={{ height: 3, background: tokens.ink }} />
      {/* Macro squares — flush, thick rules between */}
      <div style={{ display: 'flex', background: tokens.ink, gap: 3, borderBottom: `3px solid ${tokens.ink}` }}>
        <MacroSquare label="PROTEIN G" value={totals.p} color={tokens.red} tokens={tokens} />
        <MacroSquare label="CARBS G"   value={totals.c} color={tokens.blue} tokens={tokens} />
        <MacroSquare label="FAT G"     value={totals.f} color={tokens.yellow} tokens={tokens} />
      </div>
    </div>
  );
}

function FoodRow({ entry, onQty, tokens, index, animate }) {
  const food = getFood(entry.foodId);
  if (!food) return null;
  const total = food.kcal * entry.qty;
  const [shown, setShown] = React.useState(!animate);
  React.useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => setShown(true), 80 + index * 120);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: '14px 20px', gap: 14,
      height: '100%', boxSizing: 'border-box',
      transform: shown ? 'translateX(0)' : 'translateX(-120%)',
      opacity: shown ? 1 : 0,
      transition: 'transform 220ms linear, opacity 220ms linear',
    }}>
      <div style={{ fontSize: 26, lineHeight: 1, width: 30 }}>{food.emoji}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: DISPLAY_FONT, fontSize: 14,
          color: tokens.ink, letterSpacing: 0.3,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{food.name}</div>
        <div style={{ marginTop: 6 }}>
          <Stepper value={entry.qty} onChange={(q) => onQty(q)} tokens={tokens} />
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{
          fontFamily: NUM_FONT, fontSize: 28, lineHeight: 1,
          color: tokens.ink, letterSpacing: 0.5,
          fontFeatureSettings: '"tnum" 1',
        }}>{total}</div>
        <div style={{
          fontFamily: MONO_FONT, fontSize: 9, fontWeight: 700,
          letterSpacing: 1.5, color: tokens.muted, marginTop: 2,
        }}>KCAL</div>
      </div>
    </div>
  );
}

function formatTodayDate(d = new Date()) {
  const wk = ['SUN','MON','TUE','WED','THU','FRI','SAT'][d.getDay()];
  const mo = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][d.getMonth()];
  return `${wk} · ${mo} ${d.getDate()} · ${d.getFullYear()}`;
}

function TodayScreen({ entries, setEntries, tokens, dark, setDark, onAdd }) {
  const totals = sumDay(entries);
  const updateQty = (i, qty) => {
    if (qty <= 0) { removeAt(i); return; }
    const next = entries.slice();
    next[i] = { ...next[i], qty };
    setEntries(next);
  };
  const removeAt = (i) => {
    const next = entries.slice();
    next.splice(i, 1);
    setEntries(next);
  };
  return (
    <div style={{ background: tokens.bg, minHeight: '100%', paddingBottom: 24 }}>
      {/* Top: date label above poster */}
      <div style={{
        padding: 'calc(env(safe-area-inset-top, 0px) + 14px) 20px 10px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: tokens.bg,
      }}>
        <div style={{
          fontFamily: MONO_FONT, fontSize: 11, fontWeight: 700,
          letterSpacing: 2.5, color: tokens.ink,
        }}>{formatTodayDate()}</div>
        <DarkToggle dark={dark} setDark={setDark} tokens={tokens} />
      </div>
      {/* thick black rule */}
      <div style={{ height: 3, background: tokens.ink }} />

      <TodayHeader totals={totals} tokens={tokens} />

      {/* Section label */}
      <div style={{
        padding: '16px 20px 10px',
        fontFamily: MONO_FONT, fontSize: 11, fontWeight: 700,
        letterSpacing: 2.5, color: tokens.ink,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span>— TODAY'S LOG</span>
        <span style={{ color: tokens.muted, fontSize: 9, letterSpacing: 2 }}>SWIPE ← DELETE</span>
      </div>
      <div style={{ borderTop: `2px solid ${tokens.ink}` }} />

      {/* Rows */}
      {entries.map((e, i) => (
        <SwipeRow
          key={e.foodId + '_' + i}
          onDelete={() => removeAt(i)}
          tokens={tokens}
          height={76}
        >
          <FoodRow entry={e} onQty={(q) => updateQty(i, q)} tokens={tokens} index={i} animate />
        </SwipeRow>
      ))}

      {/* Empty state */}
      {entries.length === 0 && (
        <div style={{
          padding: '40px 20px',
          fontFamily: MONO_FONT, fontSize: 12, letterSpacing: 2,
          color: tokens.muted, textAlign: 'center',
        }}>
          NO ENTRIES · TAP + BELOW
        </div>
      )}

      {/* Add food button */}
      <div style={{ padding: 20 }}>
        <button
          onClick={onAdd}
          style={{
            width: '100%', height: 56,
            background: tokens.red, color: '#fff',
            border: `3px solid ${tokens.ink}`,
            fontFamily: MONO_FONT, fontSize: 14, fontWeight: 700,
            letterSpacing: 2.5, cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          }}
        >
          <div style={{ position: 'relative', width: 16, height: 16 }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 3, background: '#fff', transform: 'translateY(-50%)' }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 3, background: '#fff', transform: 'translateX(-50%)' }} />
          </div>
          ADD FOOD
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { TodayScreen });
