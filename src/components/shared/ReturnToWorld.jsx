import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { card } from '../../accent';

// ── Return to World ──────────────────────────────────────────────────────────
// Closing link on every section page, back to the game. A compact version of
// the Projects page's game cards, so it reads as part of the page: the same
// glass shell, hover lift, accent border and glow, a gridded preview pane
// (shrunk to a tile holding the arrow), and the mono label + gradient title.
export function ReturnToWorld({ className = 'pb-20' }) {
  const navigate = useNavigate();
  return (
    <footer className={`relative z-10 flex justify-center px-6 ${className}`}>
      <button
        type="button"
        onClick={() => navigate('/')}
        className="group relative flex w-full max-w-sm items-stretch overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] text-left backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-[color:color-mix(in_oklab,var(--accent-card)_40%,transparent)] hover:shadow-[0_0_80px_-10px_color-mix(in_oklab,var(--accent-card)_55%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--accent-card)]"
      >
        {/* Hover wash and corner glow, as on the cards */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: `linear-gradient(135deg, ${card(13)}, transparent 40%, ${card(7)} 100%)` }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full blur-3xl opacity-60 transition-opacity duration-700 group-hover:opacity-100"
          style={{ background: `radial-gradient(circle, ${card(25)} 0%, transparent 70%)` }}
        />

        {/* Preview pane */}
        <span aria-hidden className="relative grid w-20 shrink-0 place-items-center overflow-hidden border-r border-white/[0.06]">
          <span
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${card(15)} 0%, transparent 60%), radial-gradient(circle at 80% 20%, ${card(19)}, transparent 50%)` }}
          />
          <span
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `linear-gradient(to right, ${card(19)} 1px, transparent 1px), linear-gradient(to bottom, ${card(19)} 1px, transparent 1px)`,
              backgroundSize: '12px 12px',
              maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
            }}
          />
          <ArrowLeft className="relative h-5 w-5 transition-transform duration-500 group-hover:-translate-x-1" style={{ color: card() }} />
        </span>

        <span className="relative flex-1 px-5 py-4">
          <span aria-hidden className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: card() }} />
            Back to the game
          </span>
          <span
            className="mt-1.5 block font-display text-xl font-semibold tracking-tight text-gradient-card-accent sm:text-2xl"
            style={{ filter: `drop-shadow(0 0 24px ${card(19)})`, letterSpacing: '-0.01em' }}
          >
            Return to World
          </span>
        </span>
      </button>
    </footer>
  );
}
