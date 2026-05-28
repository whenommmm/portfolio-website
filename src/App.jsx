import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import GameContainer from './game/GameContainer';
import { EventBus } from './game/EventBus';

// Pages
import AboutPage from './pages/AboutPage';
import ProjectsPage from './pages/ProjectsPage';
import ExperiencePage from './pages/ExperiencePage';
import ResumePage from './pages/ResumePage';
import ContactPage from './pages/ContactPage';

// Global HUD
import CinematicHUD from './components/CinematicHUD';

// ── Persistent Game Layer ─────────────────────────────────────────────────────
function PersistentGame({ isVisible }) {
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      EventBus.emit('toggle-mute', next);
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
        background: '#111',
      }}
    >
      <GameContainer isMuted={isMuted} toggleMute={toggleMute} />
    </div>
  );
}

// ── Cinematic Title Screen ────────────────────────────────────────────────────
//
// Full-screen game boot experience shown once on first visit.
// Pressing Enter (or clicking anywhere) dismisses it with a fade,
// then the tutorial WelcomeModal appears.
//
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

  // Scanline star particles (static for perf, no deps)
  const particles = useRef(
    Array.from({ length: 40 }, (_, i) => ({
      x: ((i * 9301 + 49297) % 233280) / 233280 * 100,
      y: ((i * 4096 + 12345) % 233280) / 233280 * 100,
      size: 1 + (i % 3) * 0.5,
      dur:  4 + (i % 6),
      del:  (i % 8) * 0.5,
    }))
  ).current;

  return (
    <div
      onClick={dismiss}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        cursor: 'default',
        animation: fading ? 'title-fade-out 0.6s ease-in forwards' : undefined,
      }}
    >
      {/* ── 1. Deep navy base ─────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(160deg, oklch(0.08 0.04 270) 0%, oklch(0.11 0.04 265) 50%, oklch(0.07 0.03 268) 100%)',
        }}
      />

      {/* ── 2. Fine grid overlay ──────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(oklch(0.88 0.04 230) 1px, transparent 1px), linear-gradient(90deg, oklch(0.88 0.04 230) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          opacity: 0.05,
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 10%, transparent 75%)',
        }}
      />

      {/* ── 3. Scanline texture ───────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, oklch(0 0 0 / 0.08) 3px, oklch(0 0 0 / 0.08) 4px)',
          animation: 'scanline-drift 8s linear infinite',
          pointerEvents: 'none',
        }}
      />

      {/* ── 4. Amber crown glow ───────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(closest-side, oklch(0.82 0.16 65 / 0.18), transparent)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      {/* ── 5. Star particles ─────────────────────────────────────────────── */}
      {particles.map((p, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            background: 'oklch(0.96 0.02 85)',
            boxShadow: '0 0 5px oklch(0.82 0.16 65 / 0.6)',
            animation: `twinkle ${p.dur}s ${p.del}s ease-in-out infinite`,
          }}
        />
      ))}

      {/* ── 6. HUD corner accents ─────────────────────────────────────────── */}
      {/* Top-left */}
      <div style={{ position: 'absolute', top: 24, left: 28, pointerEvents: 'none' }}>
        <div style={{ width: 28, height: 28, borderTop: '1px solid oklch(0.82 0.16 65 / 0.35)', borderLeft: '1px solid oklch(0.82 0.16 65 / 0.35)' }} />
      </div>
      {/* Top-right */}
      <div style={{ position: 'absolute', top: 24, right: 28, pointerEvents: 'none' }}>
        <div style={{ width: 28, height: 28, borderTop: '1px solid oklch(0.82 0.16 65 / 0.35)', borderRight: '1px solid oklch(0.82 0.16 65 / 0.35)' }} />
      </div>
      {/* Bottom-left */}
      <div style={{ position: 'absolute', bottom: 24, left: 28, pointerEvents: 'none' }}>
        <div style={{ width: 28, height: 28, borderBottom: '1px solid oklch(0.82 0.16 65 / 0.35)', borderLeft: '1px solid oklch(0.82 0.16 65 / 0.35)' }} />
      </div>
      {/* Bottom-right */}
      <div style={{ position: 'absolute', bottom: 24, right: 28, pointerEvents: 'none' }}>
        <div style={{ width: 28, height: 28, borderBottom: '1px solid oklch(0.82 0.16 65 / 0.35)', borderRight: '1px solid oklch(0.82 0.16 65 / 0.35)' }} />
      </div>

      {/* ── 7. Main content — upper zone ──────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 24px 180px',   // bottom padding reserves room for lower panel
          textAlign: 'center',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        {/* System tag */}
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: '9px',
            letterSpacing: '0.38em',
            color: 'oklch(0.82 0.16 65 / 0.45)',
            textTransform: 'uppercase',
            marginBottom: '28px',
            animation: 'title-rise 1s 0.2s ease-out both',
          }}
        >
          PORTFOLIO OS v1.0 · 2026
        </div>

        {/* Main title */}
        <h1
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 'clamp(20px, 3.8vw, 42px)',
            fontWeight: 700,
            lineHeight: 1.35,
            letterSpacing: '0.04em',
            color: 'oklch(0.95 0.01 80)',
            textShadow: '0 0 40px oklch(0.82 0.16 65 / 0.35), 0 2px 0 oklch(0.30 0.08 268)',
            margin: 0,
            animation: 'title-rise 1s 0.4s ease-out both',
          }}
        >
          VANSH
          <br />
          SRIVASTAVA
        </h1>

        {/* Subtitle flanked by amber rules */}
        <div
          style={{
            marginTop: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            animation: 'title-rise 1s 0.6s ease-out both',
          }}
        >
          <div style={{ height: '1px', width: '36px', background: 'oklch(0.82 0.16 65 / 0.28)' }} />
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '10px',
              letterSpacing: '0.32em',
              color: 'oklch(0.75 0.01 240 / 0.55)',
              textTransform: 'uppercase',
            }}
          >
            Game Developer · Interactive Portfolio
          </span>
          <div style={{ height: '1px', width: '36px', background: 'oklch(0.82 0.16 65 / 0.28)' }} />
        </div>

        {/* Press Enter prompt */}
        <div
          style={{
            marginTop: '52px',
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 'clamp(9px, 1.3vw, 12px)',
            letterSpacing: '0.18em',
            color: 'oklch(0.88 0.14 72)',
            textTransform: 'uppercase',
            animation: 'press-key-breathe 1.8s 1.2s ease-in-out infinite, title-rise 1s 0.85s ease-out both',
          }}
        >
          Press Enter to Play
        </div>

        {/* Click fallback hint */}
        <div
          style={{
            marginTop: '12px',
            fontFamily: 'monospace',
            fontSize: '8px',
            letterSpacing: '0.25em',
            color: 'oklch(0.97 0.005 240 / 0.18)',
            textTransform: 'uppercase',
            animation: 'title-rise 1s 1.05s ease-out both',
          }}
        >
          or click anywhere
        </div>
      </div>

      {/* ── 8. Lower intel panel ──────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingBottom: '28px',
          gap: 0,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {/* Tagline — personality line from old popup, now cinematic */}
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: '10px',
            letterSpacing: '0.18em',
            color: 'oklch(0.97 0.005 240 / 0.30)',
            fontStyle: 'italic',
            textAlign: 'center',
            marginBottom: '18px',
            animation: 'title-rise 1s 1.1s ease-out both',
          }}
        >
          "Let your platforming skills decide my hiring fate"
        </div>

        {/* Amber divider with center glow */}
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, oklch(0.82 0.16 65 / 0.25) 30%, oklch(0.82 0.16 65 / 0.45) 50%, oklch(0.82 0.16 65 / 0.25) 70%, transparent 100%)',
            marginBottom: '18px',
            animation: 'title-rise 1s 1.2s ease-out both',
          }}
        />

        {/* CONTROLS label */}
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: '8px',
            letterSpacing: '0.40em',
            color: 'oklch(0.82 0.16 65 / 0.35)',
            textTransform: 'uppercase',
            marginBottom: '14px',
            animation: 'title-rise 1s 1.3s ease-out both',
          }}
        >
          ── CONTROLS ──
        </div>

        {/* Control rows */}
        {[
          {
            keys: ['A', 'D', '←', '→'],
            sep: '·',
            action: 'MOVE',
            delay: '1.35s',
          },
          {
            keys: ['W', 'SPC', '↑'],
            sep: '·',
            action: 'JUMP',
            delay: '1.45s',
          },
        ].map(({ keys, sep, action, delay }) => (
          <div
            key={action}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '8px',
              animation: `title-rise 1s ${delay} ease-out both`,
            }}
          >
            {/* Key-cap indicators */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', minWidth: '160px' }}>
              {keys.map((k, i) => (
                <React.Fragment key={k}>
                  {i > 0 && i === Math.floor(keys.length / 2) && (
                    <span style={{ fontFamily: 'monospace', fontSize: '8px', color: 'oklch(0.82 0.16 65 / 0.25)', margin: '0 2px' }}>{sep}</span>
                  )}
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '8px',
                      letterSpacing: '0.05em',
                      color: 'oklch(0.88 0.14 72 / 0.80)',
                      border: '1px solid oklch(0.82 0.16 65 / 0.30)',
                      background: 'oklch(0.82 0.16 65 / 0.06)',
                      borderRadius: '3px',
                      padding: '2px 5px',
                      lineHeight: 1.4,
                      boxShadow: '0 1px 0 oklch(0.82 0.16 65 / 0.20), inset 0 1px 0 oklch(1 0 0 / 0.06)',
                    }}
                  >
                    {k}
                  </span>
                </React.Fragment>
              ))}
            </div>

            {/* Amber arrow */}
            <span style={{ color: 'oklch(0.82 0.16 65 / 0.40)', fontSize: '9px' }}>▸</span>

            {/* Action label */}
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '9px',
                letterSpacing: '0.22em',
                color: 'oklch(0.97 0.005 240 / 0.38)',
                textTransform: 'uppercase',
                minWidth: '60px',
              }}
            >
              {action}
            </span>
          </div>
        ))}

        {/* Explore instruction */}
        <div
          style={{
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'title-rise 1s 1.55s ease-out both',
          }}
        >
          <div style={{ height: '1px', width: '24px', background: 'oklch(0.82 0.16 65 / 0.15)' }} />
          <span
            style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '7px',
              letterSpacing: '0.12em',
              color: 'oklch(0.82 0.16 65 / 0.45)',
              textTransform: 'uppercase',
            }}
          >
            Bump blocks from below to explore sections
          </span>
          <div style={{ height: '1px', width: '24px', background: 'oklch(0.82 0.16 65 / 0.15)' }} />
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

      {/* CinematicHUD — hidden on "/" by its own isHome check */}
      <CinematicHUD />

      {/* Portfolio pages render as overlays above the hidden game */}
      <Routes>
        <Route path="/"           element={null} />
        <Route path="/about"      element={<AboutPage />} />
        <Route path="/projects"   element={<ProjectsPage />} />
        <Route path="/experience" element={<ExperiencePage />} />
        <Route path="/resume"     element={<ResumePage />} />
        <Route path="/contact"    element={<ContactPage />} />
      </Routes>
    </>
  );
}
