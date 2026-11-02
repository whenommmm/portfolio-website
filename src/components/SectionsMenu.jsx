import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { SECTIONS } from '../sections';

// Same face as the in-game block labels (declared in index.css), at the
// 2× size it's drawn crisply at.
const PIXEL_FONT = { fontFamily: '"Jersey 10", monospace', fontSize: '20px', lineHeight: 1 };

// ── In-game Sections menu ─────────────────────────────────────────────────────
//
// Sits next to the mute button on the game screen. It's the way in for anyone
// who can't, or doesn't want to, platform up to a block — touch devices have
// no movement controls at all.
export default function SectionsMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);

  // Close on any press outside the menu
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="relative"
      // The knight's controls listen on window; keep Space/arrows pressed in
      // the menu from also making it jump or run
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === 'Escape' && open) {
          setOpen(false);
          buttonRef.current?.focus();
        }
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="sections-menu"
        className="h-10 px-3 retro-btn bg-[#282828] hover:bg-[#383838] text-white flex items-center gap-2 cursor-pointer"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
        <span style={PIXEL_FONT}>SECTIONS</span>
      </button>

      {open && (
        <nav
          id="sections-menu"
          aria-label="Sections"
          className="absolute right-0 top-full mt-3 w-56 border-[3px] border-black bg-[#0a0e24] shadow-[3px_3px_0_#000]"
        >
          <ul className="py-1">
            {SECTIONS.map((s) => (
              <li key={s.path}>
                <Link
                  to={s.path}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center gap-3 px-4 outline-none hover:bg-[#ffb84d]/10 focus-visible:bg-[#ffb84d]/15"
                  style={PIXEL_FONT}
                >
                  <span className="text-[#ffb84d]/55">{s.index}</span>
                  <span className="text-[#ffe5b3]">{s.label.toUpperCase()}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
