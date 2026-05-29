import { useLocation, useNavigate } from 'react-router-dom';

// ── Route metadata ────────────────────────────────────────────────────────────
const ROUTES = [
  { path: '/about',      label: 'About',      index: '01', codename: 'BIO' },
  { path: '/projects',   label: 'Projects',   index: '02', codename: 'LAB' },
  { path: '/experience', label: 'Experience', index: '03', codename: 'LOG' },
  { path: '/resume',     label: 'Resume',     index: '04', codename: 'FILE' },
  { path: '/contact',    label: 'Contact',    index: '05', codename: 'COMM' },
];

// ── D-pad / return-to-game icon ───────────────────────────────────────────────
function DpadIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <rect x="4.5" y="0.5" width="3" height="11" rx="0.8" fill="currentColor" opacity="0.65" />
      <rect x="0.5" y="4.5" width="11" height="3" rx="0.8" fill="currentColor" opacity="0.65" />
      <circle cx="6" cy="6" r="1.6" fill="currentColor" />
    </svg>
  );
}

// ── Pulsing signal dot ────────────────────────────────────────────────────────
function SignalDot() {
  return (
    <span className="relative flex h-[7px] w-[7px] shrink-0">
      <span
        className="absolute inline-flex h-full w-full rounded-full animate-ping"
        style={{ background: 'oklch(0.82 0.16 65 / 0.4)' }}
      />
      <span
        className="relative inline-flex h-[7px] w-[7px] rounded-full"
        style={{
          background: 'oklch(0.82 0.16 65)',
          boxShadow: '0 0 8px oklch(0.82 0.16 65 / 0.8)',
        }}
      />
    </span>
  );
}

// ── Progress pip strip (read-only — shows position, not links) ────────────────
function ProgressPips({ currentIndex }) {
  return (
    <div className="flex items-center gap-[5px]">
      {ROUTES.map((r, i) => {
        const isPast    = i < currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <span
            key={r.path}
            className="block rounded-full transition-all duration-500"
            style={{
              width:   isCurrent ? '18px' : '5px',
              height:  '3px',
              background: isCurrent
                ? 'oklch(0.82 0.16 65)'
                : isPast
                  ? 'oklch(0.82 0.16 65 / 0.40)'
                  : 'oklch(0.97 0.005 240 / 0.15)',
              boxShadow: isCurrent ? '0 0 8px oklch(0.82 0.16 65 / 0.7)' : 'none',
            }}
          />
        );
      })}
    </div>
  );
}

// ── Main HUD ─────────────────────────────────────────────────────────────────
export default function CinematicHUD() {
  const location = useLocation();
  const navigate  = useNavigate();
  const isHome    = location.pathname === '/';

  // Hidden on homepage — game canvas is full-screen and immersive
  if (isHome) return null;

  const currentIdx  = ROUTES.findIndex((r) => location.pathname === r.path);
  const current     = ROUTES[currentIdx] ?? null;

  // Hide top return button on all portfolio pages — each has its own bottom return block
  const hideTopReturn = location.pathname !== '/';

  return (
    <header
      role="banner"
      aria-label="Game HUD"
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background:
          'linear-gradient(180deg, oklch(0.09 0.04 265 / 0.96) 0%, oklch(0.09 0.04 265 / 0.80) 65%, transparent 100%)',
        backdropFilter: 'blur(18px) saturate(130%)',
        WebkitBackdropFilter: 'blur(18px) saturate(130%)',
      }}
    >
      {/* ── Bottom hairline glow ───────────────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, oklch(0.82 0.16 65 / 0.18) 25%, oklch(0.82 0.16 65 / 0.35) 50%, oklch(0.82 0.16 65 / 0.18) 75%, transparent 100%)',
        }}
      />

      {/* ── Inner row ─────────────────────────────────────────────────────── */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8 sm:py-3.5">

        {/* ── LEFT: Identity mark ─────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center gap-3">
          {/* Monogram */}
          <span
            className="grid h-8 w-8 place-items-center rounded-md font-mono text-sm font-bold"
            style={{
              color: 'oklch(0.88 0.14 72)',
              border: '1px solid oklch(0.82 0.16 65 / 0.30)',
              background: 'oklch(0.82 0.16 65 / 0.07)',
              boxShadow: '0 0 14px oklch(0.82 0.16 65 / 0.18)',
            }}
          >
            V
          </span>

          {/* Wordmark + build tag */}
          <div className="hidden flex-col sm:flex">
            <span
              className="font-mono text-[10px] tracking-[0.28em] leading-none"
              style={{ color: 'oklch(0.97 0.005 240 / 0.50)' }}
            >
              vansh.dev
            </span>
            <span
              className="mt-0.5 font-mono text-[8px] tracking-[0.22em] leading-none"
              style={{ color: 'oklch(0.82 0.16 65 / 0.40)' }}
            >
              PORTFOLIO OS v1.0
            </span>
          </div>
        </div>

        {/* ── CENTER: Read-only section status ────────────────────────────── */}
        {current ? (
          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
            {/* Section codename + index */}
            <div className="flex items-center gap-2">
              <SignalDot />
              <span
                className="font-mono text-[9px] tracking-[0.35em] uppercase"
                style={{ color: 'oklch(0.82 0.16 65 / 0.55)' }}
              >
                {current.index}
              </span>
              <span
                className="font-mono text-[11px] tracking-[0.20em] uppercase font-semibold"
                style={{
                  color: 'oklch(0.88 0.14 72)',
                  textShadow: '0 0 16px oklch(0.82 0.16 65 / 0.50)',
                }}
              >
                {current.codename}
              </span>
              <span
                className="font-mono text-[9px] tracking-[0.35em]"
                style={{ color: 'oklch(0.97 0.005 240 / 0.25)' }}
              >
                /{current.label.toUpperCase()}
              </span>
            </div>

            {/* Progress pips — decorative, non-interactive */}
            <ProgressPips currentIndex={currentIdx} />
          </div>
        ) : null}

        {/* ── RIGHT: Return-to-game control ───────────────────────────────── */}
        {hideTopReturn ? (
          /* Spacer to keep layout balanced when button is hidden */
          <div className="w-[72px] shrink-0" aria-hidden />
        ) : (
          <button
            onClick={() => navigate('/')}
            className="group flex shrink-0 items-center gap-2 rounded-md px-3 py-2 transition-all duration-300"
            aria-label="Return to the game world"
            style={{
              border:     '1px solid oklch(0.82 0.16 65 / 0.22)',
              background: 'oklch(0.82 0.16 65 / 0.05)',
              color:      'oklch(0.88 0.14 72 / 0.75)',
              boxShadow:  '0 0 12px oklch(0.82 0.16 65 / 0.06)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'oklch(0.82 0.16 65 / 0.50)';
              e.currentTarget.style.background  = 'oklch(0.82 0.16 65 / 0.11)';
              e.currentTarget.style.color       = 'oklch(0.88 0.14 72)';
              e.currentTarget.style.boxShadow   = '0 0 22px oklch(0.82 0.16 65 / 0.22)';
              e.currentTarget.style.transform   = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'oklch(0.82 0.16 65 / 0.22)';
              e.currentTarget.style.background  = 'oklch(0.82 0.16 65 / 0.05)';
              e.currentTarget.style.color       = 'oklch(0.88 0.14 72 / 0.75)';
              e.currentTarget.style.boxShadow   = '0 0 12px oklch(0.82 0.16 65 / 0.06)';
              e.currentTarget.style.transform   = 'translateY(0)';
            }}
          >
            <DpadIcon />
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase">
              <span className="hidden sm:inline">Return</span>
              <span className="sm:hidden">←</span>
            </span>
          </button>
        )}
      </div>
    </header>
  );
}
