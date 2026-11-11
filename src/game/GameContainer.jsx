import { useEffect, useRef } from 'react';
import { startPhaserGame } from './PhaserGame';
import { EventBus } from './EventBus';
import { Volume2, VolumeX } from 'lucide-react';
import SectionsMenu from '../components/SectionsMenu';

export default function GameContainer({ isMuted, toggleMute }) {
  const gameRef = useRef(null);

  useEffect(() => {
    // Create the Phaser instance exactly once.
    // GameContainer is now always-mounted (never unmounted by routing),
    // so this cleanup intentionally does NOT call game.destroy().
    // The game persists for the entire session — state is never lost.
    if (!gameRef.current) {
      gameRef.current = startPhaserGame('phaser-game');
    }

    // Pause/resume scene physics + input when the game canvas is
    // hidden (player is on a portfolio page) to save CPU cycles.
    const onHidden = () => {
      if (gameRef.current) {
        gameRef.current.scene.scenes.forEach((scene) => {
          if (scene.scene.isActive()) {
            scene.scene.pause();
          }
        });
      }
    };

    const onResumed = () => {
      if (gameRef.current) {
        gameRef.current.scene.scenes.forEach((scene) => {
          if (scene.scene.isPaused()) {
            scene.scene.resume();
          }
        });
      }
    };

    const unsubHidden = EventBus.on('game-hidden', onHidden);
    const unsubResumed = EventBus.on('game-resumed', onResumed);

    // The day/night switch snapshots the screen right after the theme changes,
    // while the browser holds back animation frames, so draw one frame on
    // demand to get the new sky into that snapshot (see themeTransition.js)
    const unsubRender = EventBus.on('render-now', () => {
      gameRef.current?.step(performance.now(), 0);
    });

    // No game.destroy() on unmount — persistence is the entire point.
    return () => {
      unsubHidden();
      unsubResumed();
      unsubRender();
    };
  }, []);

  // Full-viewport host: the game's aspect is matched to this box (see
  // PhaserGame.js), so the canvas fills it edge to edge. The background matches
  // the sky's edge colour, day or night, in case FIT ever has to letterbox.
  return (
    <div className="w-full h-full bg-[var(--game-edge)]">
      <div
        id="phaser-game"
        className="relative w-full h-full overflow-hidden"
      >
        {/* Sections menu + mute controls overlay (the theme toggle takes the corner, see ThemeToggle) */}
        <div className="absolute top-4 right-16 z-10 flex items-start gap-2">
          <SectionsMenu />
          <button
            onClick={toggleMute}
            className="p-2 retro-btn bg-[#282828] hover:bg-[#383838] text-white flex items-center justify-center cursor-pointer"
            title={isMuted ? 'Unmute music and sounds' : 'Mute music and sounds'}
            aria-label="Mute music and sounds"
            aria-pressed={isMuted}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
