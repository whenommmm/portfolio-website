import React, { useEffect, useRef } from 'react';
import { startPhaserGame } from './PhaserGame';
import { Volume2, VolumeX } from 'lucide-react';

export default function GameContainer({ isMuted, toggleMute }) {
  const gameRef = useRef(null);

  useEffect(() => {
    // Prevent double instantiation during development Hot Module Reloading
    if (!gameRef.current) {
      gameRef.current = startPhaserGame('phaser-game');
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#111] p-2 sm:p-4">
      <div 
        id="phaser-game" 
        className="w-full max-h-full aspect-[16/9] relative flex items-center justify-center"
      >
        {/* Mute Controls Overlay - aligned with Phaser canvas bounds inside the bezel */}
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={toggleMute}
            className="p-2 retro-btn bg-[#282828] hover:bg-[#383838] text-white flex items-center justify-center cursor-pointer"
            title={isMuted ? "Unmute sounds" : "Mute sounds"}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
