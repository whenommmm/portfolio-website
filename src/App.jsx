import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import GameContainer from './game/GameContainer';
import { EventBus } from './game/EventBus';
import { Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';

// Pages
import AboutPage from './pages/AboutPage';
import ProjectsPage from './pages/ProjectsPage';
import ExperiencePage from './pages/ExperiencePage';
import ResumePage from './pages/ResumePage';
import ContactPage from './pages/ContactPage';

// Global HUD
import CinematicHUD from './components/CinematicHUD';

// ── Block type → route mapping ────────────────────────────────────────────────
const BLOCK_ROUTES = {
  intro:      '/about',
  projects:   '/projects',
  experience: '/experience',
  resume:     '/resume',
  contact:    '/contact',
};

// ── Homepage (game wrapper) ───────────────────────────────────────────────────
function HomePage() {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  // Listen for navigate-to events emitted by Phaser blocks
  useEffect(() => {
    const unsub = EventBus.on('navigate-to', ({ route }) => {
      navigate(route);
    });
    return () => unsub();
  }, [navigate]);

  // ESC to close welcome
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && showWelcome) closeWelcome();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showWelcome]);

  const closeWelcome = () => {
    setShowWelcome(false);
    EventBus.emit('close-modal');
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      EventBus.emit('toggle-mute', next);
      return next;
    });
  };

  return (
    <div className="w-full h-screen overflow-hidden select-none relative" style={{ background: '#111' }}>
      <main className="w-full h-full relative">
        <GameContainer isMuted={isMuted} toggleMute={toggleMute} />

        {/* Welcome / Tutorial modal */}
        {showWelcome && (
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm z-30 flex items-center justify-center p-4"
            onClick={closeWelcome}
          >
            <div
              className="w-full max-w-[640px] bg-[#f4f1ec] border-4 border-[#5c94fc] retro-border p-5 md:p-6 relative flex flex-col"
              style={{ animation: 'fade-in 0.15s ease-out' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-md md:text-lg font-bold font-pressstart text-zinc-800 mb-4 pr-8">
                WELCOME TO MY PORTFOLIO!
              </h2>

              <div className="flex-1 text-zinc-800 mt-2 space-y-4 font-sans">
                <div className="border-b-2 border-dashed border-zinc-400 pb-3 text-center">
                  <h3 className="text-lg font-bold text-[#5c94fc] font-pressstart">Vansh Srivastava</h3>
                </div>
                <div className="space-y-3 leading-relaxed text-sm">
                  <p className="text-center font-bold text-zinc-800 text-sm my-2">
                    "Let your platforming skills decide my hiring fate"
                  </p>
                  <div className="bg-zinc-200/80 p-3 retro-border border-zinc-800 text-zinc-800 font-mono text-xs space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-zinc-800 text-white px-2 py-0.5 rounded text-[10px]">A / D</span> or
                      <span className="bg-zinc-800 text-white px-2 py-0.5 rounded text-[10px]">← / →</span>
                      <span>Move Left / Right</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-zinc-800 text-white px-2 py-0.5 rounded text-[10px]">W</span> or
                      <span className="bg-zinc-800 text-white px-2 py-0.5 rounded text-[10px]">Space</span> or
                      <span className="bg-zinc-800 text-white px-2 py-0.5 rounded text-[10px]">↑</span>
                      <span>Jump</span>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-zinc-700 font-pressstart text-center pt-2 animate-pulse">
                    Bump blocks from below to explore sections!
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t-2 border-zinc-300 pt-3 flex justify-end items-center">
                <button
                  onClick={closeWelcome}
                  className="retro-btn bg-zinc-300 hover:bg-zinc-400 text-zinc-800 px-3 py-1 font-bold text-xs"
                >
                  PLAY!
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      {/* CinematicHUD appears on all non-home routes */}
      <CinematicHUD />

      <Routes>
        <Route path="/"           element={<HomePage />} />
        <Route path="/about"      element={<AboutPage />} />
        <Route path="/projects"   element={<ProjectsPage />} />
        <Route path="/experience" element={<ExperiencePage />} />
        <Route path="/resume"     element={<ResumePage />} />
        <Route path="/contact"    element={<ContactPage />} />
      </Routes>
    </>
  );
}
