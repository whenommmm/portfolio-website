import Phaser from 'phaser';
import MainScene from './scenes/MainScene';

const config = {
  type: Phaser.AUTO,
  width: 1024,
  height: 576,
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
  return new Phaser.Game({
    ...config,
    parent: parentId
  });
};
