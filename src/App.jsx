import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import GameContainer from './game/GameContainer';
import { EventBus } from './game/EventBus';
import { loadMuted, saveMuted } from './game/audioPrefs';

// Pages
import AboutPage from './pages/AboutPage';
import ProjectsPage from './pages/ProjectsPage';
import ExperiencePage from './pages/ExperiencePage';
import ResumePage from './pages/ResumePage';
import ContactPage from './pages/ContactPage';

import { SECTIONS } from './sections';

// ── Persistent Game Layer ─────────────────────────────────────────────────────
function PersistentGame({ isVisible }) {
  // Mutes music and sound effects; remembered across visits
  const [isMuted, setIsMuted] = useState(loadMuted);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      EventBus.emit('toggle-mute', next);
      saveMuted(next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (isVisible) {
      const canvas = document.querySelector('#phaser-game canvas');
      if (canvas) setTimeout(() => canvas.focus(), 80);
      EventBus.emit('game-resumed');
    } else {
      EventBus.emit('game-hidden');
    }
  }, [isVisible]);

  return (
    <div
      aria-hidden={!isVisible}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: isVisible ? 1 : -1,
        visibility: isVisible ? 'visible' : 'hidden',
        pointerEvents: isVisible ? 'auto' : 'none',
        background: '#050816', // matches the game sky's edge color

      }}
    >
      <GameContainer isMuted={isMuted} toggleMute={toggleMute} />
    </div>
  );
}

// ── Title Screen ──────────────────────────────────────────────────────────────
//
// Shown over the game on the first visit, laid out like an indie game's
// poster: the name huge in moonlight silver, a pixel crescent moon, and credits
// in the bottom corners. Enter, Space or a click fades it out and the game
// starts.

// The same moonlight gradient as the Contact page title
const MOONLIGHT = 'linear-gradient(135deg, oklch(0.97 0.005 250) 0%, oklch(0.80 0.03 250) 50%, oklch(0.60 0.035 255) 100%)';
const SILVER = '#c9d1e0';
const PALE = '#eef1f7';

// Square pixel stars: [top %, left %, size px, colour, opacity]
const TITLE_STARS = [
  [8, 14, 4, PALE, 0.7], [18, 32, 6, SILVER, 0.8], [11, 58, 4, PALE, 0.4], [26, 72, 4, PALE, 0.6],
  [6, 68, 4, SILVER, 0.9], [24, 72, 6, PALE, 0.75], [34, 86, 4, PALE, 0.5], [42, 78, 4, SILVER, 0.6],
  [14, 92, 4, PALE, 0.4], [52, 4, 4, PALE, 0.3], [64, 48, 6, SILVER, 0.5], [78, 28, 4, PALE, 0.4],
  [85, 55, 4, PALE, 0.5], [68, 64, 4, SILVER, 0.7], [92, 56, 4, PALE, 0.3],
];
// Plus-shaped sparkles: [top %, left %, colour, opacity]
const TITLE_SPARKLES = [[22, 45, PALE, 0.75], [48, 89, SILVER, 0.8]];

// Pixel crescent moon on a 16×16 grid: cream body, soft yellow shading, gold flecks.
// Each rect is [x, y, width, height = 1].
const MOON = [
  ['#fff4cc', [[6, 1, 3], [4, 2, 5], [3, 3, 5], [2, 4, 5], [2, 5, 4], [1, 6, 4], [1, 7, 4],
               [1, 8, 4], [1, 9, 4], [2, 10, 4], [2, 11, 5], [3, 12, 5], [4, 13, 5], [6, 14, 3]]],
  ['#f2d98f', [[5, 3, 2], [4, 4, 2], [3, 5, 2], [2, 6, 2], [2, 7, 2], [2, 8, 2], [2, 9, 2],
               [3, 10, 2], [4, 11, 2], [5, 12, 2]]],
  ['#dcb862', [[2, 7, 1, 2], [3, 4, 1], [3, 11, 1]]],
];

function TitleScreen({ onDismiss }) {
  const [fading, setFading] = useState(false);

  const dismiss = useCallback(() => {
    if (fading) return;
    setFading(true);
    // Let the CSS fade-out animation play (600ms), then unmount
    setTimeout(onDismiss, 600);
  }, [fading, onDismiss]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ') dismiss();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dismiss]);

  const nameLine = { backgroundImage: MOONLIGHT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' };

  return (
    <div
      onClick={dismiss}
      className="fixed inset-0 z-[200] flex cursor-default select-none flex-col justify-between overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 85% 15%, #0e1538 0%, #060a1e 50%, #030612 100%)',
        animation: fading ? 'title-fade-out 0.6s ease-in forwards' : undefined,
      }}
    >
      {/* Stars */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {TITLE_STARS.map(([top, left, size, color, opacity]) => (
          <span
            key={`${top}-${left}`}
            className="absolute"
            style={{ top: `${top}%`, left: `${left}%`, width: size, height: size, background: color, opacity }}
          />
        ))}
        {TITLE_SPARKLES.map(([top, left, color, opacity]) => (
          <span key={`${top}-${left}`} className="absolute h-3 w-3" style={{ top: `${top}%`, left: `${left}%`, opacity }}>
            <span className="absolute left-0 top-1 h-1 w-3" style={{ background: color }} />
            <span className="absolute left-1 top-0 h-3 w-1" style={{ background: color }} />
          </span>
        ))}
      </div>

      {/* Moon (the wrapper animates, so the animation's filter doesn't replace the moon's glow) */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-6 top-6 md:right-16 md:top-14 lg:right-24 lg:top-16"
        style={{ animation: 'title-rise 1s 0.35s ease-out both' }}
      >
        <svg
          viewBox="0 0 16 16"
          className="h-16 w-16 md:h-32 md:w-32 lg:h-40 lg:w-40"
          style={{ shapeRendering: 'crispEdges', filter: 'drop-shadow(0 0 24px rgba(255, 226, 150, 0.26))' }}
        >
          {MOON.flatMap(([fill, rects]) =>
            rects.map(([x, y, w, h = 1]) => <rect key={`${fill}${x},${y}`} x={x} y={y} width={w} height={h} fill={fill} />),
          )}
        </svg>
      </div>

      {/* Name */}
      <h1
        className="relative whitespace-nowrap px-8 pt-28 font-display font-bold uppercase leading-[0.86] tracking-[-0.03em] md:px-16 md:pt-20 lg:px-20 lg:pt-24"
        style={{ fontSize: 'clamp(2.75rem, 14vw, 16.5rem)', animation: 'title-rise 1s 0.15s ease-out both' }}
      >
        <span className="block pr-[0.05em]" style={nameLine}>Vansh</span>
        <span className="-mt-[0.04em] block pr-[0.05em]" style={nameLine}>Srivastava</span>
      </h1>

      {/* Credits (left) and the prompt with controls (right) */}
      <div
        className="relative flex flex-col justify-between gap-8 px-8 pb-10 font-mono md:flex-row md:items-end md:px-16 md:pb-14 lg:px-20 lg:pb-16"
        style={{ animation: 'title-rise 1s 0.6s ease-out both' }}
      >
        <div className="text-[12px] leading-relaxed tracking-[0.22em] md:text-[13px]">
          <p className="mb-1 font-medium" style={{ color: SILVER }}>GAME DESIGNER</p>
          <p className="mb-2" style={{ color: PALE, opacity: 0.8 }}>A PLAYABLE PORTFOLIO</p>
          <p className="tracking-[0.14em]" style={{ color: PALE, opacity: 0.5 }}>
            “Let your platforming skills decide my hiring fate”
          </p>
        </div>
        <div className="max-w-md md:text-right">
          <span
            className="inline-flex items-center gap-1.5 text-sm font-medium tracking-[0.2em] md:text-base"
            style={{ color: SILVER, animation: 'press-key-breathe 2.4s ease-in-out infinite' }}
          >
            PRESS ENTER <span className="text-xs">▸</span>
          </span>
          <p className="mt-0.5 text-[12px] tracking-[0.15em]" style={{ color: PALE, opacity: 0.5 }}>(or click anywhere)</p>
          <p className="mt-4 text-[12px] leading-normal tracking-[0.12em]" style={{ color: PALE, opacity: 0.45 }}>
            A D / ← → move · W / Space / ↑ jump · bump blocks from below to open sections
          </p>
        </div>
      </div>
    </div>
  );
}

// WelcomeModal removed — controls are now part of the TitleScreen.

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';
  const accent = SECTIONS.find((s) => s.path === location.pathname)?.accent;

  // Title screen is shown once — Enter dismisses it and starts the game directly
  const [showTitle, setShowTitle] = useState(true);

  // Wire Phaser → React Router navigation — never unmounts
  useEffect(() => {
    const unsub = EventBus.on('navigate-to', ({ route }) => {
      navigate(route);
    });
    return () => unsub();
  }, [navigate]);

  // Title screen dismissed → game starts immediately, no second modal
  const dismissTitle = useCallback(() => {
    setShowTitle(false);
    EventBus.emit('close-modal');
  }, []);

  return (
    <>
      {/* Always-mounted Phaser — hidden but alive on portfolio pages */}
      <PersistentGame isVisible={isHome} />

      {/* Title screen — shown once, Enter → immediate gameplay */}
      {isHome && showTitle && <TitleScreen onDismiss={dismissTitle} />}

      {/* Portfolio pages render as overlays above the hidden game, in their section's accent colour */}
      <div className="contents" data-accent={accent}>
        <Routes>
          <Route path="/"           element={null} />
          <Route path="/about"      element={<AboutPage />} />
          <Route path="/projects"   element={<ProjectsPage />} />
          <Route path="/experience" element={<ExperiencePage />} />
          <Route path="/resume"     element={<ResumePage />} />
          <Route path="/contact"    element={<ContactPage />} />
          {/* Unknown paths go back to the game instead of a blank page */}
          <Route path="*"           element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}
