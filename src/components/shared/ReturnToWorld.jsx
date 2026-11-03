import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// The project cards' amber accent (accentMap.amber in ProjectsPage)
const AMBER = '#FFB84D';

// ── Return to World ──────────────────────────────────────────────────────────
// Closing link on every section page, back to the game. A compact version of
// the Projects page's game cards, so it reads as part of the page: the same
// glass shell, hover lift, amber border and glow, a gridded preview pane
// (shrunk to a tile holding the arrow), and the mono label + gradient title.
export function ReturnToWorld({ className = 'pb-20' }) {
  const navigate = useNavigate();
  return (
    <footer className={`relative z-10 flex justify-center px-6 ${className}`}>
      <button
        type="button"
        onClick={() => navigate('/')}
        className="group relative flex w-full max-w-sm items-stretch overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] text-left backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-[#FFB84D]/40 hover:shadow-[0_0_80px_-10px_rgba(255,184,77,0.55)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FFB84D]"
      >
        {/* Hover wash and corner glow, as on the cards */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: `linear-gradient(135deg, ${AMBER}22, transparent 40%, ${AMBER}11 100%)` }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full blur-3xl opacity-60 transition-opacity duration-700 group-hover:opacity-100"
          style={{ background: `radial-gradient(circle, ${AMBER}40 0%, transparent 70%)` }}
        />

        {/* Preview pane */}
        <span aria-hidden className="relative grid w-20 shrink-0 place-items-center overflow-hidden border-r border-white/[0.06]">
          <span
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${AMBER}25 0%, transparent 60%), radial-gradient(circle at 80% 20%, ${AMBER}30, transparent 50%)` }}
          />
          <span
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `linear-gradient(to right, ${AMBER}30 1px, transparent 1px), linear-gradient(to bottom, ${AMBER}30 1px, transparent 1px)`,
              backgroundSize: '12px 12px',
              maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
            }}
          />
          <ArrowLeft className="relative h-5 w-5 transition-transform duration-500 group-hover:-translate-x-1" style={{ color: AMBER }} />
        </span>

        <span className="relative flex-1 px-5 py-4">
          <span aria-hidden className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: AMBER }} />
            Back to the game
          </span>
          <span
            className="mt-1.5 block font-display text-xl font-semibold tracking-tight text-gradient-card-amber sm:text-2xl"
            style={{ filter: `drop-shadow(0 0 24px ${AMBER}30)`, letterSpacing: '-0.01em' }}
          >
            Return to World
          </span>
        </span>
      </button>
    </footer>
  );
}
