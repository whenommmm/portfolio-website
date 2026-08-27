import Phaser from 'phaser';
import MainScene, { LEVEL } from './scenes/MainScene';

// The level is authored on a fixed 1024×576 canvas, but the *game* size is
// chosen to match the window's aspect ratio so the canvas fills the viewport
// with no letterbox bars. MainScene.layoutViewport() centers the level inside
// it and extends the sky/ground into the extra space.
//
// Beyond these aspect ratios (very tall phones, ultra-wide monitors) we stop
// growing the world and let Scale.FIT letterbox on the navy page background,
// which matches the sky's edge color so the bars are effectively invisible.
const MIN_ASPECT = 0.45; // ~9:20 phones in portrait
const MAX_ASPECT = 3.6;  // 32:9 super-ultrawide

/** Smallest even-sized game canvas with the viewport's aspect that contains the level. */
export function computeGameSize(viewportWidth, viewportHeight) {
  const aspect = Phaser.Math.Clamp(viewportWidth / Math.max(1, viewportHeight), MIN_ASPECT, MAX_ASPECT);
  const levelAspect = LEVEL.width / LEVEL.height;
  const even = (n) => Math.round(n / 2) * 2;   // keep the level's center on a whole pixel
  return aspect >= levelAspect
    ? { width: even(LEVEL.height * aspect), height: LEVEL.height }
    : { width: LEVEL.width, height: even(LEVEL.width / aspect) };
}

const baseConfig = {
  type: Phaser.AUTO,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
      debug: false
    }
  },
  pixelArt: true, // Essential for crisp, retro pixel rendering
  audio: {
    noAudio: true // Bypass Phaser's audio manager to prevent closed AudioContext HMR warnings
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [MainScene]
};

export const startPhaserGame = (parentId) => {
  const parent = document.getElementById(parentId);
  const measure = () => computeGameSize(
    parent?.clientWidth  || window.innerWidth,
    parent?.clientHeight || window.innerHeight,
  );

  const game = new Phaser.Game({ ...baseConfig, parent: parentId, ...measure() });

  // Keep the game's aspect locked to the viewport so FIT never has to letterbox.
  // The game lives for the whole session (see GameContainer), so this listener
  // is intentionally never removed.
  let raf = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const { width, height } = measure();
      const current = game.scale.gameSize;
      if (width !== current.width || height !== current.height) {
        // setGameSize (not resize): only it updates the FIT display aspect ratio.
        game.scale.setGameSize(width, height);
      }
    });
  });

  return game;
};
