import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import knightSheetUrl from '../../assets/sprites/knight.png';
import cloudsSheetUrl from '../../assets/sprites/clouds.png';
import starSheetUrl   from '../../assets/sprites/star.png';

// The level (platforms, blocks, player spawn) is authored in a fixed
// 1024×576 coordinate space. The actual game size follows the window's aspect
// ratio (see PhaserGame.js); layoutViewport() centers the level inside it and
// extends the sky and ground into whatever extra space there is.
export const LEVEL = { width: 1024, height: 576 };

// star.png — 13-frame 32×32 twinkle animation in a single row.
const STAR_FRAME   = { width: 32, height: 32 };
const STAR_TWINKLE = { start: 0, end: 12 };

// Font for the labels above the question blocks. Declared via @font-face in
// index.css (Jersey 10, OFL). It is drawn on a 10px pixel grid, so we render
// at an exact 2× for crisp pixels.
const LABEL_FONT = { family: 'Jersey 10', size: '20px' };

/**
 * Loader file that resolves once a CSS-declared web font is usable, so Phaser
 * Text created in create() can't fall back to a system font. Times out
 * gracefully — a missing font should never block the game from booting.
 */
class WebFontFile extends Phaser.Loader.File {
  constructor(loader, family, timeoutMs = 3000) {
    super(loader, { type: 'webfont', key: `webfont-${family}`, url: family });
    this.family = family;
    this.timeoutMs = timeoutMs;
  }

  load() {
    const done = (ok) => this.loader.nextFile(this, ok);
    if (!document.fonts?.load) { done(true); return; }
    const timeout = new Promise((resolve) => setTimeout(resolve, this.timeoutMs));
    Promise.race([document.fonts.load(`16px "${this.family}"`), timeout])
      .then(() => done(true), () => done(true));
  }
}

// knight.png (Brackeys platformer pack, CC0) — 8×8 grid of 32×32 cells.
// Animation labels are baked into the sheet as pixels in their own cells,
// so we only ever reference the idle and run frame ranges below.
const KNIGHT_FRAME = { width: 32, height: 32 };
const KNIGHT_IDLE  = { start: 0,  end: 3  }; // row 0
const KNIGHT_RUN   = { start: 16, end: 31 }; // rows 2–3
// Knight body occupies x 9–21, y 10–27 inside its cell (13×18, feet on row 27).
const KNIGHT_BODY  = { width: 13, height: 18, offsetX: 9, offsetY: 10 };

// clouds.png — four flat-bottomed clouds stacked in 16px rows (last row is 15px).
const CLOUD_FRAMES = [
  { name: 'cloud_0', x: 32, y: 0,  w: 48, h: 16 },
  { name: 'cloud_1', x: 0,  y: 16, w: 48, h: 16 },
  { name: 'cloud_2', x: 0,  y: 32, w: 80, h: 16 },
  { name: 'cloud_3', x: 0,  y: 48, w: 48, h: 15 },
];

export default class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    this.isPaused = true; // Start paused for the welcome tutorial popup
    // Block type → route mapping
    this.blockRoutes = {
      intro:      '/about',
      projects:   '/projects',
      experience: '/experience',
      resume:     '/resume',
      contact:    '/contact',
    };
    this.audioCtx = null;
    this.viewportTextureVersion = 0;
    this.groundBricks = [];
  }

  preload() {
    // Player, clouds and stars come from PNG assets; everything else is still
    // drawn programmatically in generatePixelArtTextures().
    this.load.spritesheet('player', knightSheetUrl, {
      frameWidth: KNIGHT_FRAME.width,
      frameHeight: KNIGHT_FRAME.height,
    });
    this.load.image('clouds', cloudsSheetUrl);
    this.load.spritesheet('star', starSheetUrl, {
      frameWidth: STAR_FRAME.width,
      frameHeight: STAR_FRAME.height,
    });
    this.load.addFile(new WebFontFile(this.load, LABEL_FONT.family));
  }

  create() {
    // 1. Initialize Web Audio Context on first player input
    const audioInitHandler = () => {
      this.initAudio();
      window.removeEventListener('keydown', audioInitHandler);
      window.removeEventListener('pointerdown', audioInitHandler);
    };
    window.addEventListener('keydown', audioInitHandler);
    window.addEventListener('pointerdown', audioInitHandler);

    // 2. Generate Textures Programmatically
    this.generatePixelArtTextures();

    // 3. Create Sky and Scenery — sized to the viewport, level kept centered.
    // Re-runs automatically when the game is resized to follow the window.
    this.layoutViewport();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.layoutViewport, this);

    // Twinkle animation shared by the background stars and the block-hit star
    this.anims.create({
      key: 'star-twinkle',
      frames: this.anims.generateFrameNumbers('star', STAR_TWINKLE),
      frameRate: 10,
      repeat: -1
    });

    // Add some pixel background stars across the visible sky
    this.bgStars = this.add.group();
    for (let i = 0; i < 12; i++) {
      const x = Phaser.Math.Between(this.view.left + 10, this.view.right - 10);
      const y = Phaser.Math.Between(this.view.top + 10, 180);
      const star = this.add.sprite(x, y, 'star', 0)
        .setScale(Phaser.Math.FloatBetween(0.5, 1.0))
        .setAlpha(Phaser.Math.FloatBetween(0.2, 0.6));
      // Random start frame so the stars don't twinkle in lockstep
      star.anims.play({ key: 'star-twinkle', startFrame: Phaser.Math.Between(STAR_TWINKLE.start, STAR_TWINKLE.end) });
      // Alpha-pulse properties (layered on top of the frame animation)
      star.setData('twinkleSpeed', Phaser.Math.FloatBetween(0.008, 0.025));
      star.setData('direction', Math.random() > 0.5 ? 1 : -1);
      this.bgStars.add(star);
    }

    // Add some pixel clouds — register the four cloud shapes as named frames
    // on the tileset, then pick one at random per cloud.
    const cloudTexture = this.textures.get('clouds');
    CLOUD_FRAMES.forEach((f) => {
      if (!cloudTexture.has(f.name)) cloudTexture.add(f.name, 0, f.x, f.y, f.w, f.h);
    });
    this.clouds = this.add.group();
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(this.view.left + 50, this.view.right - 50);
      const y = Phaser.Math.Between(this.view.top + 40, 150);
      const frame = Phaser.Utils.Array.GetRandom(CLOUD_FRAMES).name;
      const cloud = this.add.image(x, y, 'clouds', frame)
        .setScale(2)
        .setAlpha(0.25) // moonlit faded clouds
        .setTint(0x4a5d8a); // night slate-blue
      // Custom property for slow drift
      cloud.setData('speed', Phaser.Math.FloatBetween(0.1, 0.4));
      this.clouds.add(cloud);
    }

    // Add some pixel bushes/scenery at fixed coordinates on the ground
    const bushPositions = [80, 330, 512, 700, 850];
    bushPositions.forEach(x => {
      const bush = this.add.image(x, 512, 'bush').setScale(2).setOrigin(0.5, 1);
      bush.setTint(0x385850); // deep night-green
    });

    // 4. Create Physics Groups
    this.platforms = this.physics.add.staticGroup();
    this.blocks = this.physics.add.staticGroup();

    // Create Ground Floor (Bricks) — spans the visible width and depth,
    // rebuilt by layoutViewport() whenever the game is resized.
    this.buildGround();

    // Create Separate Floating Platforms (using 32x32 brick tiles)
    const platformData = [
      // Platform 1 (Stepping stone lower left)
      { x: 136, y: 440 }, { x: 168, y: 440 },
      // Platform 2 (ABOUT ME)
      { x: 256, y: 350 }, { x: 288, y: 350 }, { x: 320, y: 350 },
      // Platform 3 (Stepping stone center-left)
      { x: 366, y: 250 }, { x: 398, y: 250 },
      // Platform 4 (PROJECTS)
      { x: 466, y: 380 }, { x: 498, y: 380 }, { x: 530, y: 380 },
      // Platform 5 (Stepping stone high center)
      { x: 496, y: 160 }, { x: 528, y: 160 }, { x: 560, y: 160 },
      // Platform 6 (EXPERIENCE)
      { x: 626, y: 260 }, { x: 658, y: 260 }, { x: 690, y: 260 },
      // Platform 8 (RESUME)
      { x: 776, y: 410 }, { x: 808, y: 410 },
      // Platform 9 (Stepping stone right)
      { x: 856, y: 300 }, { x: 888, y: 300 },
      // Platform 10 (CONTACT)
      { x: 736, y: 190 }, { x: 768, y: 190 }, { x: 800, y: 190 }
    ];
    platformData.forEach(p => {
      this.platforms.create(p.x, p.y, 'brick');
    });

    // Apply night tint to all platform bricks
    this.platforms.getChildren().forEach(p => {
      p.setTint(0x7788aa); // slate-blue night tint
    });

    // 5. Setup Question Blocks (Intro, Projects, Experience, Resume, Contact) at scattered heights
    const blockData = [
      { x: 288, y: 230, type: 'intro', label: 'ABOUT ME' },
      { x: 498, y: 260, type: 'projects', label: 'PROJECTS' },
      { x: 658, y: 140, type: 'experience', label: 'EXPERIENCE' },
      { x: 792, y: 290, type: 'resume', label: 'RESUME' },
      { x: 768, y: 80, type: 'contact', label: 'CONTACT' }
    ];

    blockData.forEach((data) => {
      // Add a soft glow behind the block
      const glow = this.add.image(data.x, data.y, 'block_glow').setScale(1.8).setAlpha(0.75);
      this.tweens.add({
        targets: glow,
        scaleX: 2.3,
        scaleY: 2.3,
        alpha: 0.35,
        duration: 1500 + Math.random() * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      const block = this.blocks.create(data.x, data.y, 'question_block');
      block.setData('type', data.type);
      block.setData('label', data.label);
      block.setData('isHit', false);
      block.setData('originalY', data.y);
      block.setData('glow', glow); // store reference to glow
      block.setOrigin(0.5);
      block.setTint(0xffddaa); // Warm amber tint

      // Label Text above block
      this.add.text(data.x, data.y - 32, data.label, {
        fontFamily: `"${LABEL_FONT.family}"`,
        fontSize: LABEL_FONT.size,
        color: '#ffe5b3', // Warm premium amber-white
        stroke: '#050816', // Deep navy stroke
        strokeThickness: 3
      }).setOrigin(0.5);
    });

    // 6. Create Player
    this.player = this.physics.add.sprite(100, 400, 'player', KNIGHT_IDLE.start);
    this.player.setCollideWorldBounds(true);
    this.player.setGravityY(1000);
    this.player.setOrigin(0.5, 1);
    // Knight is ~13×18px inside a 32×32 cell; 2× scale ≈ 26×36 on screen,
    // matching the size of the previous 32px sprite.
    this.player.setScale(2);
    // Hug the hitbox to the knight (values are in unscaled texture pixels).
    // Body bottom lands on cell row 28 so the feet sit flush on the floor;
    // the 4 transparent rows below hang harmlessly under the ground.
    this.player.setSize(KNIGHT_BODY.width, KNIGHT_BODY.height);
    this.player.setOffset(KNIGHT_BODY.offsetX, KNIGHT_BODY.offsetY);
    this.player.setDepth(101); // Ensure player renders above vignette (depth 100, see layoutViewport)

    // Create player animations (idle + run only; the sheet has no jump pose,
    // so airborne holds the first idle frame)
    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('player', KNIGHT_IDLE),
      frameRate: 6,
      repeat: -1
    });

    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('player', KNIGHT_RUN),
      frameRate: 16,
      repeat: -1
    });

    this.anims.create({
      key: 'airborne',
      frames: [{ key: 'player', frame: KNIGHT_IDLE.start }]
    });

    // 7. Add Collisions
    this.physics.add.collider(this.player, this.platforms);
    
    // Custom block bump overlap/collision check
    this.physics.add.collider(this.player, this.blocks, this.handleBlockCollision, null, this);

    // 8. Custom Window-based Keyboard Controls to avoid focus/stuck key issues
    this.keysPressed = {
      left: false,
      right: false,
      up: false
    };

    this.handleKeyDown = (e) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      if (key === 'a' || key === 'arrowleft') {
        this.keysPressed.left = true;
      } else if (key === 'd' || key === 'arrowright') {
        this.keysPressed.right = true;
      }
      if (key === 'w' || key === 'arrowup' || key === ' ') {
        this.keysPressed.up = true;
      }
    };

    this.handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (key === 'a' || key === 'arrowleft') {
        this.keysPressed.left = false;
      } else if (key === 'd' || key === 'arrowright') {
        this.keysPressed.right = false;
      }
      if (key === 'w' || key === 'arrowup' || key === ' ') {
        this.keysPressed.up = false;
      }
    };

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    // 9. Listen for close-modal (welcome modal close) to resume game
    EventBus.clear('close-modal');
    const closeModalListener = () => {
      this.isPaused = false;
      this.player.setTint(0xffffff);
      this.keysPressed.left = false;
      this.keysPressed.right = false;
      this.keysPressed.up = false;

      if (this.game && this.game.canvas) {
        this.game.canvas.focus();
      }
    };
    EventBus.on('close-modal', closeModalListener);

    // Listen for returning from a portfolio page → resume gameplay seamlessly
    // (game-resumed is emitted by PersistentGame in App.jsx when isVisible → true)
    const gameResumedListener = () => {
      // Clear any stuck key state from before navigation
      this.keysPressed.left = false;
      this.keysPressed.right = false;
      this.keysPressed.up = false;
      // Unpause the scene input (isPaused was never set on navigation,
      // but ensure it's cleared in case of any edge case)
      this.isPaused = false;
      // Re-zero velocity so the player isn't sliding on return
      if (this.player) {
        this.player.setVelocityX(0);
        this.player.setTint(0xffffff);
      }
      // Refocus canvas so keyboard events are captured immediately
      if (this.game && this.game.canvas) {
        setTimeout(() => this.game.canvas.focus(), 50);
      }
    };
    EventBus.on('game-resumed', gameResumedListener);

    // Listen for mute toggle from React controls
    EventBus.clear('toggle-mute');
    this.isMuted = false;
    const muteListener = (muted) => {
      this.isMuted = muted;
    };
    EventBus.on('toggle-mute', muteListener);

    const cleanup = () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.layoutViewport, this);
      window.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('keyup', this.handleKeyUp);
      window.removeEventListener('keydown', audioInitHandler);
      window.removeEventListener('pointerdown', audioInitHandler);
      EventBus.off('close-modal', closeModalListener);
      EventBus.off('game-resumed', gameResumedListener);
      EventBus.off('toggle-mute', muteListener);
    };

    this.events.once('shutdown', cleanup);
    this.events.once('destroy', cleanup);

  }

  update() {
    // Cloud drift — wrap around the visible viewport edges
    this.clouds.getChildren().forEach((cloud) => {
      cloud.x += cloud.getData('speed');
      if (cloud.x > this.view.right + 90) {
        cloud.x = this.view.left - 90;
      }
    });

    // Star twinkling
    if (this.bgStars) {
      this.bgStars.getChildren().forEach((star) => {
        let alpha = star.alpha;
        const speed = star.getData('twinkleSpeed');
        const dir = star.getData('direction');
        alpha += speed * dir;
        if (alpha >= 0.85) {
          star.setData('direction', -1);
          alpha = 0.85;
        } else if (alpha <= 0.15) {
          star.setData('direction', 1);
          alpha = 0.15;
        }
        star.setAlpha(alpha);
      });
    }

    if (this.isPaused) {
      // Freeze player input/physics
      this.player.setVelocityX(0);
      this.player.anims.play('idle', true);
      return;
    }

    // Movement Controls
    const speed = 350;
    if (this.keysPressed.left) {
      this.player.setVelocityX(-speed);
      this.player.setFlipX(true);
      if (this.player.body.touching.down) {
        this.player.anims.play('run', true);
      }
    } else if (this.keysPressed.right) {
      this.player.setVelocityX(speed);
      this.player.setFlipX(false);
      if (this.player.body.touching.down) {
        this.player.anims.play('run', true);
      }
    } else {
      this.player.setVelocityX(0);
      if (this.player.body.touching.down) {
        this.player.anims.play('idle', true);
      }
    }

    // Jumping Controls (Up / W / Space)
    if (this.keysPressed.up && this.player.body.touching.down) {
      this.player.setVelocityY(-750);
      this.playSynthSound('jump');
      this.keysPressed.up = false; // Reset to prevent consecutive automatic jumps
    }

    // Airborne — hold the first idle frame (no jump pose in the sheet)
    if (!this.player.body.touching.down) {
      this.player.anims.play('airborne', true);
    }
  }

  initAudio() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playSynthSound(type) {
    if (this.isMuted) return;
    if (!this.audioCtx) return;
    
    // Resume context if suspended (browser security)
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      
      const now = this.audioCtx.currentTime;

      if (type === 'jump') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(580, now + 0.16);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
        osc.start();
        osc.stop(now + 0.16);
      } else if (type === 'bump') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(987.77, now); // B5 note
        osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6 note
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.setValueAtTime(0.08, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start();
        osc.stop(now + 0.3);
      }
    } catch (err) {
      console.warn("Synth audio error:", err);
    }
  }

  handleBlockCollision(player, block) {
    // Ensure collision comes from BELOW the block (player hitting it with their head)
    if (player.body.touching.up && block.body.touching.down) {
      const isAlreadyHit = block.getData('isHit');
      
      // Perform bounce tween regardless
      this.bounceBlock(block);

      if (!isAlreadyHit) {
        block.setData('isHit', true);
        block.setTexture('hit_block');
        block.setTint(0x667788); // Dark deactivated slate tint
        this.playSynthSound('bump');

        // Fade out and destroy the glow behind the block
        const glow = block.getData('glow');
        if (glow) {
          this.tweens.killTweensOf(glow);
          this.tweens.add({
            targets: glow,
            alpha: 0,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Quad.easeOut',
            onComplete: () => {
              glow.destroy();
            }
          });
        }

        // Spawn a floating retro star
        this.spawnStar(block.x, block.y - 16);

        // Navigate to the corresponding route
        this.time.delayedCall(200, () => {
          const blockType = block.getData('type');
          const route = this.blockRoutes[blockType];
          if (route) {
            EventBus.emit('navigate-to', { route });
          }
        });
      }
    }
  }

  bounceBlock(block) {
    const originalY = block.getData('originalY');
    
    // Clear any active tweens on this block
    this.tweens.killTweensOf(block);

    this.tweens.add({
      targets: block,
      y: originalY - 12,
      duration: 80,
      yoyo: true,
      ease: 'Quad.easeOut',
      onComplete: () => {
        block.y = originalY;
      }
    });
  }

  spawnStar(x, y) {
    const star = this.add.sprite(x, y, 'star', 0).setScale(2);
    star.setTint(0xffbb44); // Warm amber yellow star!
    star.anims.play({ key: 'star-twinkle', frameRate: 24 });

    // Float upward, spin, fade out, then destroy
    this.tweens.add({
      targets: star,
      y: y - 70,
      scaleX: 2.8,
      scaleY: 2.8,
      angle: 180,
      alpha: 0,
      duration: 450,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        star.destroy();
      }
    });
  }



  generatePixelArtTextures() {
    const colors = {
      '.': null,
      'D': '#8C5200', // Dark hair/brown shadow
      'W': '#FFFFFF', // White
      'Y': '#FFE018', // Yellow
      'O': '#F87800', // Light Orange / Brown highlight
      'G': '#000000', // Black
      'K': '#404040', // Dark Gray
      'H': '#909090', // Light Gray
      'E': '#00A800', // Green bush highlight
      'L': '#005800'  // Green bush dark shadow
    };

    // 1. BRICK TEXTURE (32x32)
    const brickArt = [
      "DDDDDDDDDDDDDDDD",
      "DOOOOOOOOOOOOOGD",
      "DODDDDDODDDDDOGD",
      "DODDDDDODDDDDOGD",
      "DOGGGGGOGGGGGOGD",
      "DODDDDDODDDDDOGD",
      "DOOOOOOODOOOOOOGD",
      "DDDDDODDDDDODDDD",
      "OOOODODDDDDODDDD",
      "DDDDDOGGGGGOGGGG",
      "DOOOOOOODOOOOOOGD",
      "DODDDDDODDDDDOGD",
      "DODDDDDODDDDDOGD",
      "DOGGGGGOGGGGGOGD",
      "DGGGGGGGGGGGGGGG",
      "DDDDDDDDDDDDDDDD"
    ];
    this.drawScaledTexture('brick', brickArt, colors, 2);

    // 2. QUESTION BLOCK (32x32)
    const questionArt = [
      "GGGGGGGGGGGGGGGG",
      "GYYYYYYYYYYYYYOG",
      "GYWWWWWWWWWWWYOG",
      "GYWYYYYYYYYYWYOG",
      "GYWYGGGGGYYYWYOG",
      "GYWYGYYYGYYYWYOG",
      "GYWYYYYYGYYYWYOG",
      "GYWYYYGGYYYWYOG ",
      "GYWYYYGYYYYWYOG",
      "GYWYYYYYYYYYWYOG",
      "GYWYYYGYYYYWYOG",
      "GYWYYYYYYYYYWYOG",
      "GYWWWWWWWWWWWYOG",
      "GYOOOOOOOOOOOYOG",
      "GOGGGGGGGGGGGGOG",
      "GGGGGGGGGGGGGGGG"
    ];
    this.drawScaledTexture('question_block', questionArt, colors, 2);

    // 3. HIT BLOCK (32x32)
    const hitArt = [
      "GGGGGGGGGGGGGGGG",
      "GKKKKKKKKKKKKKHG",
      "GKHHHHHHHHHHHKHG",
      "GKHGGGGGGGGGHKHG",
      "GKHGGGGGGGGGHKHG",
      "GKHGGGGGGGGGHKHG",
      "GKHGGGGGGGGGHKHG",
      "GKHGGGGGGGGGHKHG",
      "GKHGGGGGGGGGHKHG",
      "GKHGGGGGGGGGHKHG",
      "GKHGGGGGGGGGHKHG",
      "GKHGGGGGGGGGHKHG",
      "GKHGGGGGGGGGHKHG",
      "GKHHHHHHHHHHHKHG",
      "GKKKKKKKKKKKKKHG",
      "GGGGGGGGGGGGGGGG"
    ];
    this.drawScaledTexture('hit_block', hitArt, colors, 2);

    // 6. BUSH SCENERY TEXTURE (64x48)
    const bushArt = [
      "......EEEE......",
      "....EEEEEEEE....",
      "..EEEEEEEEEEEE..",
      ".EEEEEEEEEEEEEE.",
      "EEEEEEEEEEEEEEEE",
      "EELELEEELELEEEEE",
      "EEL L EE L LE EE",
      "EEL L EE L LE EE"
    ];
    this.drawScaledTexture('bush', bushArt, colors, 3);

    // (Sky gradient, sky glow, grid and vignette are viewport-sized and live in
    //  generateViewportTextures(), since they depend on the current game size.)

    // 11. BLOCK GLOW (64x64)
    const blockGlowCanvas = this.textures.createCanvas('block_glow', 64, 64);
    const bgCtx = blockGlowCanvas.context;
    const bgGrad = bgCtx.createRadialGradient(32, 32, 2, 32, 32, 32);
    bgGrad.addColorStop(0, 'rgba(255, 184, 77, 0.28)');
    bgGrad.addColorStop(1, 'rgba(255, 184, 77, 0)');
    bgCtx.fillStyle = bgGrad;
    bgCtx.beginPath();
    bgCtx.arc(32, 32, 32, 0, Math.PI * 2);
    bgCtx.fill();
    blockGlowCanvas.refresh();
  }

  // ── Viewport-dependent layout ───────────────────────────────────────────────

  /**
   * Fit the scene to the current game size: center the 1024×576 level with the
   * camera, widen the physics bounds, regenerate the sky/grid/vignette at full
   * size and extend the ground bricks. Runs once from create() and again on
   * every Scale RESIZE (PhaserGame.js keeps the game's aspect equal to the
   * window's, so this is what removes the letterbox bars).
   */
  layoutViewport() {
    const W = this.scale.gameSize.width;
    const H = this.scale.gameSize.height;
    const cx = LEVEL.width / 2;
    const cy = LEVEL.height / 2;

    // Visible world rect, in level coordinates (may extend into negatives)
    this.view = {
      width: W,
      height: H,
      left:   cx - W / 2,
      right:  cx + W / 2,
      top:    cy - H / 2,
      bottom: cy + H / 2,
    };

    this.cameras.main.setScroll(this.view.left, this.view.top);
    this.physics.world.setBounds(this.view.left, this.view.top, W, H);

    // Fresh textures under versioned keys so we can swap safely, then drop the old ones
    const prev = this.viewportTextureVersion;
    const next = ++this.viewportTextureVersion;
    const keys = this.generateViewportTextures(W, H, next);

    if (!this.skyBg) {
      this.skyBg    = this.add.image(cx, cy, keys.sky).setDepth(-3);
      this.skyGlow  = this.add.image(cx, cy, keys.glow).setDepth(-2);
      this.gridBg   = this.add.image(cx, cy, keys.grid).setDepth(-1);
      this.vignette = this.add.image(cx, cy, keys.vignette).setDepth(100);
    } else {
      this.skyBg.setTexture(keys.sky);
      this.skyGlow.setTexture(keys.glow);
      this.gridBg.setTexture(keys.grid);
      this.vignette.setTexture(keys.vignette);
      ['sky_bg', 'sky_glow', 'grid_bg', 'vignette'].forEach((k) => {
        const old = `${k}_${prev}`;
        if (this.textures.exists(old)) this.textures.remove(old);
      });
    }

    if (this.platforms) this.buildGround();
  }

  /** Brick floor covering the visible width and everything below the level's ground line. */
  buildGround() {
    this.groundBricks.forEach((b) => b.destroy());
    this.groundBricks = [];

    const tile = 32;
    const groundTop = 528;                        // level's top ground row (center y)
    const firstCol = Math.floor((this.view.left - 16) / tile) * tile + 16;
    for (let x = firstCol; x - 16 < this.view.right; x += tile) {
      for (let y = groundTop; y - 16 < this.view.bottom; y += tile) {
        const brick = this.platforms.create(x, y, 'brick');
        brick.setTint(0x7788aa); // slate-blue night tint
        this.groundBricks.push(brick);
      }
    }
  }

  /**
   * Draw the sky gradient, ambient glows, masked grid and vignette on canvases
   * of the given size. All positions are expressed in level coordinates and
   * offset so the artwork stays anchored to the level, not the viewport.
   */
  generateViewportTextures(W, H, version) {
    const ox = (W - LEVEL.width) / 2;   // level origin inside the canvas
    const oy = (H - LEVEL.height) / 2;
    const keys = {
      sky:      `sky_bg_${version}`,
      glow:     `sky_glow_${version}`,
      grid:     `grid_bg_${version}`,
      vignette: `vignette_${version}`,
    };

    // SKY BG GRADIENT
    const skyBgCanvas = this.textures.createCanvas(keys.sky, W, H);
    const sCtx = skyBgCanvas.context;
    const sGrad = sCtx.createLinearGradient(0, 0, 0, H);
    sGrad.addColorStop(0, '#050816');
    sGrad.addColorStop(0.5, '#0a0e24');
    sGrad.addColorStop(1, '#050816');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, W, H);
    skyBgCanvas.refresh();

    // SKY GLOW
    const skyGlowCanvas = this.textures.createCanvas(keys.glow, W, H);
    const sgCtx = skyGlowCanvas.context;
    const glow = (x, y, r0, r1, rgb, a) => {
      const g = sgCtx.createRadialGradient(x + ox, y + oy, r0, x + ox, y + oy, r1);
      g.addColorStop(0, `rgba(${rgb}, ${a})`);
      g.addColorStop(1, `rgba(${rgb}, 0)`);
      sgCtx.fillStyle = g;
      sgCtx.beginPath();
      sgCtx.arc(x + ox, y + oy, r1 + 50, 0, Math.PI * 2);
      sgCtx.fill();
    };
    glow(512,  -80, 50, 500, '255, 184, 77',  0.18); // top-center amber crown
    glow(0,    576, 30, 400, '93, 169, 255',  0.14); // bottom-left cyan bloom
    glow(1024,  50, 20, 350, '255, 154, 108', 0.10); // top-right peach glow
    skyGlowCanvas.refresh();

    // GRID WITH RADIAL MASK — lines aligned to the level's 64px grid
    const gridCanvas = this.textures.createCanvas(keys.grid, W, H);
    const gdCtx = gridCanvas.context;
    gdCtx.strokeStyle = 'rgba(224, 231, 255, 0.07)';
    gdCtx.lineWidth = 1;
    const gridSize = 64;
    for (let x = ox % gridSize; x < W; x += gridSize) {
      gdCtx.beginPath();
      gdCtx.moveTo(x, 0);
      gdCtx.lineTo(x, H);
      gdCtx.stroke();
    }
    for (let y = oy % gridSize; y < H; y += gridSize) {
      gdCtx.beginPath();
      gdCtx.moveTo(0, y);
      gdCtx.lineTo(W, y);
      gdCtx.stroke();
    }
    gdCtx.globalCompositeOperation = 'destination-in';
    const maskGrad = gdCtx.createRadialGradient(512 + ox, 230 + oy, 80, 512 + ox, 230 + oy, 450);
    maskGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
    maskGrad.addColorStop(0.3, 'rgba(0, 0, 0, 0.8)');
    maskGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    gdCtx.fillStyle = maskGrad;
    gdCtx.beginPath();
    gdCtx.arc(512 + ox, 230 + oy, 500, 0, Math.PI * 2);
    gdCtx.fill();
    gridCanvas.refresh();

    // VIGNETTE OVERLAY — beyond the outer radius the last stop continues, so
    // the extended area is uniformly dark
    const vignetteCanvas = this.textures.createCanvas(keys.vignette, W, H);
    const vCtx = vignetteCanvas.context;
    const vGrad = vCtx.createRadialGradient(512 + ox, 288 + oy, 260, 512 + ox, 288 + oy, 620);
    vGrad.addColorStop(0, 'rgba(5, 8, 22, 0)');
    vGrad.addColorStop(0.6, 'rgba(5, 8, 22, 0.25)');
    vGrad.addColorStop(1, 'rgba(5, 8, 22, 0.82)');
    vCtx.fillStyle = vGrad;
    vCtx.fillRect(0, 0, W, H);
    vignetteCanvas.refresh();

    return keys;
  }

  drawScaledTexture(key, data, colors, scale = 2) {
    const height = data.length;
    const width = data[0].length;
    const canvas = this.textures.createCanvas(key, width * scale, height * scale);
    const ctx = canvas.context;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const char = data[y][x];
        const color = colors[char];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
    }
    canvas.refresh();
  }
}
