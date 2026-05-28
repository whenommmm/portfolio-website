import { useLocation, useNavigate } from 'react-router-dom';

const ROUTES = [
  { path: '/about',      label: 'About',      index: '01' },
  { path: '/projects',   label: 'Projects',   index: '02' },
  { path: '/experience', label: 'Experience', index: '03' },
  { path: '/resume',     label: 'Resume',     index: '04' },
  { path: '/contact',    label: 'Contact',    index: '05' },
];

// ── Joystick / game-return icon ───────────────────────────────────────────────
function GameIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
      {/* D-pad cross */}
      <rect x="5" y="1" width="3" height="11" rx="1" fill="currentColor" opacity="0.7" />
      <rect x="1" y="5" width="11" height="3" rx="1" fill="currentColor" opacity="0.7" />
      {/* Center dot */}
      <circle cx="6.5" cy="6.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

export default function CinematicHUD() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  // Hidden on homepage — game is full-screen immersive
  if (isHome) return null;

  const current = ROUTES.find((r) => location.pathname === r.path);

  return (
    <nav
      aria-label="Site navigation"
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        // Multi-layer atmosphere: deep navy fade + edge vignette
        background:
          'linear-gradient(180deg, oklch(0.09 0.04 265 / 0.97) 0%, oklch(0.09 0.04 265 / 0.85) 60%, transparent 100%)',
        backdropFilter: 'blur(20px) saturate(140%)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
      }}
    >
      {/* ── Hairline border with amber glow pulse ─────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, oklch(0.82 0.16 65 / 0.25) 30%, oklch(0.82 0.16 65 / 0.45) 50%, oklch(0.82 0.16 65 / 0.25) 70%, transparent 100%)',
        }}
      />
      {/* Soft glow bloom below the border */}
      <div
        className="absolute -bottom-3 left-1/4 right-1/4 h-3 blur-md"
        style={{ background: 'oklch(0.82 0.16 65 / 0.08)' }}
      />

      {/* ── Inner layout ─────────────────────────────────────────────────────── */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 sm:py-4">

        {/* ── LEFT: Identity ─────────────────────────────────────────────────── */}
        <button
          onClick={() => navigate('/')}
          className="group flex shrink-0 items-center gap-3"
          aria-label="Go to homepage"
        >
          {/* Monogram glyph */}
          <span
            className="relative grid h-9 w-9 place-items-center rounded-lg font-mono text-sm font-bold transition-all duration-400"
            style={{
              color: 'oklch(0.88 0.14 72)',
              border: '1px solid oklch(0.82 0.16 65 / 0.35)',
              background: 'oklch(0.82 0.16 65 / 0.08)',
              boxShadow: '0 0 18px oklch(0.82 0.16 65 / 0.22), inset 0 1px 0 oklch(1 0 0 / 0.08)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                '0 0 30px oklch(0.82 0.16 65 / 0.45), inset 0 1px 0 oklch(1 0 0 / 0.12)';
              e.currentTarget.style.borderColor = 'oklch(0.82 0.16 65 / 0.6)';
              e.currentTarget.style.background = 'oklch(0.82 0.16 65 / 0.14)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow =
                '0 0 18px oklch(0.82 0.16 65 / 0.22), inset 0 1px 0 oklch(1 0 0 / 0.08)';
              e.currentTarget.style.borderColor = 'oklch(0.82 0.16 65 / 0.35)';
              e.currentTarget.style.background = 'oklch(0.82 0.16 65 / 0.08)';
            }}
          >
            V
          </span>
          {/* Wordmark */}
          <span
            className="hidden font-mono text-xs tracking-[0.25em] transition-colors duration-300 sm:block"
            style={{ color: 'oklch(0.97 0.005 240 / 0.55)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'oklch(0.97 0.005 240 / 0.9)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'oklch(0.97 0.005 240 / 0.55)'; }}
          >
            vansh.dev
          </span>
        </button>

        {/* ── CENTER: Route links ─────────────────────────────────────────────── */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-0.5 rounded-full px-2 py-1.5"
          style={{
            background: 'oklch(0.97 0.005 240 / 0.04)',
            border: '1px solid oklch(0.97 0.005 240 / 0.07)',
          }}
        >
          {ROUTES.map((r) => {
            const isActive = location.pathname === r.path;
            return (
              <button
                key={r.path}
                onClick={() => navigate(r.path)}
                aria-current={isActive ? 'page' : undefined}
                className="group relative flex flex-col items-center rounded-full px-3 py-1.5 transition-all duration-300 sm:px-4"
                style={{
                  background: isActive ? 'oklch(0.82 0.16 65 / 0.12)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'oklch(0.97 0.005 240 / 0.06)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                {/* Index number — visible only on larger screens */}
                <span
                  className="hidden font-mono text-[8px] tracking-[0.25em] transition-colors duration-300 sm:block"
                  style={{
                    color: isActive
                      ? 'oklch(0.82 0.16 65 / 0.9)'
                      : 'oklch(0.97 0.005 240 / 0.25)',
                  }}
                >
                  {r.index}
                </span>

                {/* Route label */}
                <span
                  className="font-mono text-[10px] tracking-[0.18em] uppercase transition-all duration-300 sm:text-[11px]"
                  style={{
                    color: isActive
                      ? 'oklch(0.88 0.14 72)'
                      : 'oklch(0.97 0.005 240 / 0.55)',
                    textShadow: isActive
                      ? '0 0 20px oklch(0.82 0.16 65 / 0.6)'
                      : 'none',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {r.label}
                </span>

                {/* Active underline glow indicator */}
                <span
                  className="mt-0.5 block rounded-full transition-all duration-400"
                  style={{
                    height: '2px',
                    width: isActive ? '100%' : '0%',
                    background:
                      'linear-gradient(90deg, transparent, oklch(0.82 0.16 65), transparent)',
                    boxShadow: isActive ? '0 0 8px oklch(0.82 0.16 65 / 0.8)' : 'none',
                    opacity: isActive ? 1 : 0,
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* ── RIGHT: Back to game ─────────────────────────────────────────────── */}
        <button
          onClick={() => navigate('/')}
          className="group flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 transition-all duration-300 sm:px-4"
          aria-label="Return to game homepage"
          style={{
            border: '1px solid oklch(0.82 0.16 65 / 0.25)',
            background: 'oklch(0.82 0.16 65 / 0.06)',
            color: 'oklch(0.88 0.14 72 / 0.8)',
            boxShadow: '0 0 14px oklch(0.82 0.16 65 / 0.08)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'oklch(0.82 0.16 65 / 0.55)';
            e.currentTarget.style.background = 'oklch(0.82 0.16 65 / 0.13)';
            e.currentTarget.style.color = 'oklch(0.88 0.14 72)';
            e.currentTarget.style.boxShadow = '0 0 24px oklch(0.82 0.16 65 / 0.25)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'oklch(0.82 0.16 65 / 0.25)';
            e.currentTarget.style.background = 'oklch(0.82 0.16 65 / 0.06)';
            e.currentTarget.style.color = 'oklch(0.88 0.14 72 / 0.8)';
            e.currentTarget.style.boxShadow = '0 0 14px oklch(0.82 0.16 65 / 0.08)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <GameIcon />
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase sm:text-[11px]">
            <span className="hidden sm:inline">Play</span>
            <span className="hidden sm:inline text-[oklch(0.88_0.14_72/0.45)] mx-1.5">/</span>
            <span className="hidden sm:inline">Home</span>
            <span className="sm:hidden">←</span>
          </span>
        </button>
      </div>
    </nav>
  );
}
