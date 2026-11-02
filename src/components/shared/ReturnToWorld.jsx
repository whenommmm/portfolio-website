import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// ── Return to World ──────────────────────────────────────────────────────────
// Closing button on every section page, back to the game. Same pill language
// as the pages' own buttons, pitched as a clear secondary action so it never
// outweighs a page's primary one (e.g. Download Resume): a solid amber outline
// with a filled arrow chip, filling in amber on hover.
export function ReturnToWorld({ className = 'pb-20' }) {
  const navigate = useNavigate();
  return (
    <footer className={`relative z-10 flex justify-center px-6 ${className}`}>
      <button
        type="button"
        onClick={() => navigate('/')}
        className="group inline-flex items-center gap-3 rounded-full border-[1.5px] border-amber-glow py-1.5 pl-1.5 pr-6 text-[15px] font-medium tracking-tight text-[oklch(0.9_0.12_75)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-glow hover:text-[oklch(0.18_0.04_50)] hover:shadow-[0_14px_34px_-14px_oklch(0.82_0.16_65/0.75)] active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-glow"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-glow text-[oklch(0.18_0.04_50)] transition-colors duration-300 group-hover:bg-[oklch(0.18_0.04_50)] group-hover:text-amber-glow">
          <ArrowLeft size={16} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
        </span>
        Return to World
      </button>
    </footer>
  );
}
