// Bauhaus design tokens + shared primitives

const BAUHAUS_LIGHT = {
  bg: '#F5F0E8',
  paper: '#EDE6D6',
  ink: '#111111',
  red: '#E63219',
  blue: '#1A3EDB',
  yellow: '#F5C800',
  white: '#FFFFFF',
  muted: '#8A8277',
  rule: '#111111',
};

const BAUHAUS_DARK = {
  bg: '#141210',
  paper: '#1F1C19',
  ink: '#F5F0E8',
  red: '#FF3B22',
  blue: '#3A5DFF',
  yellow: '#FFD400',
  white: '#F5F0E8',
  muted: '#6F6A63',
  rule: '#F5F0E8',
};

function useBauhaus(dark) {
  return dark ? BAUHAUS_DARK : BAUHAUS_LIGHT;
}

// Fonts — load at top level in host HTML via <link>. Here we just name them.
const DISPLAY_FONT = `'Archivo Black', 'Impact', sans-serif`;
const NUM_FONT = `'Bebas Neue', 'Archivo Black', 'Impact', sans-serif`;
const MONO_FONT = `'JetBrains Mono', 'IBM Plex Mono', 'DM Mono', ui-monospace, monospace`;

// --- Count-up hook ------------------------------------------------
function useCountUp(target, duration = 300) {
  const [val, setVal] = React.useState(target);
  const prevRef = React.useRef(target);
  const rafRef = React.useRef(null);
  React.useEffect(() => {
    const from = prevRef.current;
    const to = target;
    if (from === to) return;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      setVal(Math.round(from + (to - from) * p));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else prevRef.current = to;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);
  return val;
}

// --- Swipe-to-delete row wrapper ---------------------------------
function SwipeRow({ onDelete, children, tokens, height = 76 }) {
  const [dx, setDx] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const [removing, setRemoving] = React.useState(false);
  const startX = React.useRef(null);
  const MAX = 104;

  const onDown = (e) => {
    startX.current = (e.touches ? e.touches[0].clientX : e.clientX);
  };
  const onMove = (e) => {
    if (startX.current == null) return;
    const x = (e.touches ? e.touches[0].clientX : e.clientX);
    const d = Math.max(-MAX, Math.min(0, x - startX.current + (open ? -MAX : 0)));
    setDx(d);
  };
  const onUp = () => {
    if (startX.current == null) return;
    startX.current = null;
    const shouldOpen = dx < -MAX / 2;
    setOpen(shouldOpen);
    setDx(shouldOpen ? -MAX : 0);
  };

  const confirmDelete = () => {
    setRemoving(true);
    setTimeout(() => onDelete && onDelete(), 140);
  };

  return (
    <div style={{
      position: 'relative',
      height: removing ? 0 : height,
      overflow: 'hidden',
      transition: 'height 140ms linear',
      borderBottom: `2px solid ${tokens.ink}`,
      background: tokens.bg,
    }}>
      {/* Delete block */}
      <div
        onClick={confirmDelete}
        style={{
          position: 'absolute', right: 0, top: 0, bottom: 0,
          width: MAX, background: tokens.red,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: MONO_FONT, fontSize: 13, fontWeight: 700,
          letterSpacing: 1.5, color: '#fff', cursor: 'pointer',
        }}
      >DELETE</div>
      {/* Foreground row */}
      <div
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
        onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
        style={{
          position: 'absolute', inset: 0,
          transform: `translateX(${dx}px)`,
          transition: startX.current == null ? 'transform 140ms linear' : 'none',
          background: tokens.bg,
          cursor: 'grab',
          userSelect: 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// --- Bauhaus stepper ---------------------------------------------
// Step is 0.25 below 2x (so 0.25/0.5/0.75/1/1.25…), 1 at 2x and above.
// Long-press cycles faster.
function formatQty(v) {
  if (v >= 1 && Number.isInteger(v)) return String(v);
  // strip trailing zeros
  return String(Math.round(v * 100) / 100).replace(/\.?0+$/, '');
}
function stepFor(v, dir) {
  // dir = +1 or -1
  if (dir > 0) return v < 2 ? 0.25 : 1;
  return v <= 2 ? 0.25 : 1;
}
function Stepper({ value, onChange, tokens, min = 0 }) {
  const btn = {
    width: 32, height: 32,
    border: `2px solid ${tokens.ink}`,
    background: tokens.bg, color: tokens.ink,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', padding: 0,
    fontFamily: DISPLAY_FONT, fontSize: 20, lineHeight: 1,
    touchAction: 'manipulation',
  };
  const dec = (e) => {
    e.stopPropagation();
    const next = Math.max(min, Math.round((value - stepFor(value, -1)) * 100) / 100);
    onChange(next);
  };
  const inc = (e) => {
    e.stopPropagation();
    const next = Math.round((value + stepFor(value, +1)) * 100) / 100;
    onChange(next);
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      <button style={btn} onClick={dec}>
        <div style={{ width: 14, height: 3, background: tokens.ink }} />
      </button>
      <div style={{
        minWidth: 52, height: 32,
        borderTop: `2px solid ${tokens.ink}`,
        borderBottom: `2px solid ${tokens.ink}`,
        background: tokens.ink, color: tokens.bg,
        fontFamily: MONO_FONT, fontSize: 13, fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        letterSpacing: 0.5, padding: '0 6px',
        fontFeatureSettings: '"tnum" 1',
      }}>×{formatQty(value)}</div>
      <button style={btn} onClick={inc}>
        <div style={{ position: 'relative', width: 14, height: 14 }}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 3, background: tokens.ink, transform: 'translateY(-50%)' }} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 3, background: tokens.ink, transform: 'translateX(-50%)' }} />
        </div>
      </button>
    </div>
  );
}

Object.assign(window, {
  BAUHAUS_LIGHT, BAUHAUS_DARK, useBauhaus,
  DISPLAY_FONT, NUM_FONT, MONO_FONT,
  useCountUp, SwipeRow, Stepper,
});
