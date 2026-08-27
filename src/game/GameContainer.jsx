import { useEffect, useRef } from 'react';
import { startPhaserGame } from './PhaserGame';
import { EventBus } from './EventBus';
import { Volume2, VolumeX } from 'lucide-react';

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

    // No game.destroy() on unmount — persistence is the entire point.
    return () => {
      unsubHidden();
      unsubResumed();
    };
  }, []);

  // Full-viewport host: the game's aspect is matched to this box (see
  // PhaserGame.js), so the canvas fills it edge to edge. The navy matches the
  // sky's edge color in case FIT ever has to letterbox.
  return (
    <div className="w-full h-full bg-[#050816]">
      <div
        id="phaser-game"
        className="relative w-full h-full overflow-hidden"
      >
        {/* Mute Controls Overlay */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={toggleMute}
            className="p-2 retro-btn bg-[#282828] hover:bg-[#383838] text-white flex items-center justify-center cursor-pointer"
            title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
