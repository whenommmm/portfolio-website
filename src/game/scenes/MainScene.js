import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import knightSheetUrl from '../../assets/sprites/knight.png';
import cloudsSheetUrl from '../../assets/sprites/clouds.png';
import starSheetUrl   from '../../assets/sprites/star.png';
import musicUrl       from '../../assets/audio/time-for-adventure.mp3';
import { loadMuted } from '../audioPrefs';
import { getTheme } from '../../theme';

// The level (platforms, blocks, player spawn) is authored in a fixed
// 1024×576 coordinate space. The actual game size follows the window's aspect
// ratio (see PhaserGame.js); layoutViewport() centers the level inside it and
// extends the sky and ground into whatever extra space there is.
export const LEVEL = { width: 1024, height: 576 };

// star.png — 13-frame 32×32 twinkle animation in a single row.
const STAR_FRAME   = { width: 32, height: 32 };
const STAR_TWINKLE = { start: 0, end: 12 };

// Question-block titles are drawn in Tiny5 (Google Fonts, loaded in
// index.html), a blocky font on a 5px pixel grid: at 15px every one of its
// pixels is exactly 3 game pixels (see pixelLabel()).
const LABEL_FONT = { family: 'Tiny5', size: '15px', gap: 1, scale: 1 };
const LABEL_COLOR = { normal: 0xffe5b3, hover: 0xffffff }; // warm amber-white, as tints on white lettering

// Question-block tints. The block textures carry their own colours, so at rest
// they're dimmed a touch, leaving room to brighten to full while a mouse hovers
// (a spent block still opens its page, so it brightens too).
const BLOCK_TINT = { live: 0xe4e4e4, liveHover: 0xffffff, hit: 0xd0d0d0, hitHover: 0xffffff };
const BLOCK_HOVER_LIFT = 4; // px the block and its label rise while hovered

// Background music: "Time for Adventure" from the Brackeys platformer pack
// (CC0), re-encoded at 96 kbps. It's 15 bars at 90 bpm, exactly 40s; the file
// runs ~46ms longer (encoder padding, which decoders trim differently), so the
// loop is pinned to the last 40s of whatever decodes to keep it on the beat.
// Quiet enough to sit under the jump/bump sounds.
const MUSIC = { volume: 0.18, loopLength: 40, fadeIn: 2.5, fadeOut: 0.5 };

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
    this.isPaused = true; // Paused until the title screen is dismissed (close-modal)
    // Block type → route mapping
    this.blockRoutes = {
      intro:      '/about',
      projects:   '/projects',
      experience: '/experience',
      resume:     '/resume',
      contact:    '/contact',
    };
    this.audioCtx = null;
    // Music plays only once the title is dismissed (musicOn), and goes quiet
    // while a portfolio page covers the game (offscreen) or the tab is hidden
    this.musicGain = null;
    this.musicSource = null;
    this.musicOn = false;
    this.offscreen = false;
    this.tabHidden = false;
    this.pendingSection = null; // delayed navigation from a block, see openBlockSection()
    this.viewportTextureVersion = 0;
    this.groundBricks = [];
    this.theme = getTheme(); // 'day' or 'night', see src/theme.js
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

    // Start downloading the music now so it's ready when the title screen is
    // dismissed; decoding has to wait for the AudioContext (first input)
    this.musicData = fetch(musicUrl).then((r) => r.arrayBuffer()).catch(() => null);

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
    this.spreadClouds();

    // The sun, shown by day in place of the stars
    this.sun = this.add.image(0, 0, 'sun').setDepth(-1);
    this.placeSun();
    this.createWildlife();
    this.applySceneryTheme();

    // Add some pixel bushes/scenery at fixed coordinates on the ground
    const bushPositions = [80, 330, 512, 700, 850];
    bushPositions.forEach(x => {
      this.add.image(x, 512, 'bush').setScale(2).setOrigin(0.5, 1);
    });

    // 4. Create Physics Groups
    this.platforms = this.physics.add.staticGroup();
    this.blocks = this.physics.add.staticGroup();

    // Create Ground Floor (tread plates) — spans the visible width and depth,
    // rebuilt by layoutViewport() whenever the game is resized.
    this.buildGround();

    // Create Separate Floating Platforms (using 32x32 tread plates)
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
      this.platforms.create(p.x, p.y, 'plate');
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
      block.setData('hovered', false);
      block.setOrigin(0.5);
      block.setTint(this.blockTint(block));

      // Label Text above block
      const label = this.add.image(data.x, data.y - 32, this.pixelLabel(data.label)).setScale(LABEL_FONT.scale).setTint(LABEL_COLOR.normal);
      block.setData('labelText', label);

      // Tap/click opens the section too, so the portfolio is reachable without
      // a keyboard. The target is a 96×96 zone taking in the block and label,
      // since a 32px block is tiny on a phone screen. It's a separate object
      // that stays put while the block bounces or lifts on hover, so the target
      // never slides out from under a still cursor.
      const hitZone = this.add.zone(data.x, data.y - 16, 96, 96)
        .setInteractive({ useHandCursor: true });
      // pointerup, not pointerdown: navigating mid-tap would let the touch's
      // follow-up click land on whatever the new page draws under the finger
      hitZone.on('pointerup', () => this.handleBlockTap(block));
      // Hover is for mice only: touch has no hover, and a tap would leave the
      // block lifted when the player comes back from the page
      hitZone.on('pointerover', (pointer) => {
        if (!pointer.wasTouch) this.setBlockHover(block, true);
      });
      hitZone.on('pointerout', () => this.setBlockHover(block, false));
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

      this.musicOn = true;
      this.startMusic();
    };
    EventBus.on('close-modal', closeModalListener);

    // Listen for returning from a portfolio page → resume gameplay seamlessly
    // (game-resumed is emitted by PersistentGame in App.jsx when isVisible → true)
    const gameResumedListener = () => {
      // Clear any stuck key state from before navigation
      this.keysPressed.left = false;
      this.keysPressed.right = false;
      this.keysPressed.up = false;
      // isPaused is deliberately left alone: only dismissing the title screen
      // unpauses. A visitor who lands on a page first and then comes home
      // still gets the title, and the knight must not move behind it.
      // Re-zero velocity so the player isn't sliding on return
      if (this.player) {
        this.player.setVelocityX(0);
        this.player.setTint(0xffffff);
      }
      // Refocus canvas so keyboard events are captured immediately
      if (this.game && this.game.canvas) {
        setTimeout(() => this.game.canvas.focus(), 50);
      }

      this.offscreen = false;
      this.updateMusic();
    };
    EventBus.on('game-resumed', gameResumedListener);

    // A portfolio page now covers the game: let the music fall quiet
    const gameHiddenListener = () => {
      this.offscreen = true;
      this.updateMusic();
    };
    EventBus.on('game-hidden', gameHiddenListener);

    // Same when the browser tab is hidden (Phaser sleeps the game loop, but
    // the AudioContext would keep playing)
    const onTabHidden = () => { this.tabHidden = true; this.updateMusic(); };
    const onTabVisible = () => { this.tabHidden = false; this.updateMusic(); };
    this.game.events.on(Phaser.Core.Events.HIDDEN, onTabHidden);
    this.game.events.on(Phaser.Core.Events.VISIBLE, onTabVisible);

    // Listen for mute toggle from React controls (mutes music and sounds; the
    // initial value is the player's remembered choice, as App.jsx shows it)
    EventBus.clear('toggle-mute');
    this.isMuted = loadMuted();
    const muteListener = (muted) => {
      this.isMuted = muted;
      this.updateMusic();
    };
    EventBus.on('toggle-mute', muteListener);

    // Day/night switch (src/theme.js): repaint the sky and scenery in place,
    // so the knight, spent blocks and music carry on untouched
    const themeListener = (theme) => {
      this.theme = theme;
      this.refreshSky();
      this.applySceneryTheme();
    };
    EventBus.on('theme-change', themeListener);

    const cleanup = () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.layoutViewport, this);
      window.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('keyup', this.handleKeyUp);
      window.removeEventListener('keydown', audioInitHandler);
      window.removeEventListener('pointerdown', audioInitHandler);
      EventBus.off('close-modal', closeModalListener);
      EventBus.off('game-resumed', gameResumedListener);
      EventBus.off('game-hidden', gameHiddenListener);
      EventBus.off('toggle-mute', muteListener);
      EventBus.off('theme-change', themeListener);
      this.game.events.off(Phaser.Core.Events.HIDDEN, onTabHidden);
      this.game.events.off(Phaser.Core.Events.VISIBLE, onTabVisible);
      // Without this a restarted scene (e.g. on hot reload) would play over the old music
      this.musicSource?.stop();
      this.audioCtx?.close();
    };

    this.events.once('shutdown', cleanup);
    this.events.once('destroy', cleanup);

  }

  update(time, delta) {
    this.updateWildlife(time, delta);

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

      // Music runs through its own gain so it can fade without touching SFX
      this.musicGain = this.audioCtx.createGain();
      this.musicGain.gain.value = 0;
      this.musicGain.connect(this.audioCtx.destination);
      this.musicBuffer = this.musicData
        .then((data) => data && this.audioCtx.decodeAudioData(data))
        .catch(() => null);
      this.startMusic();
    }
  }

  /** Start the looping track once there's a context, a decoded track and a dismissed title. */
  startMusic() {
    if (!this.musicOn || !this.audioCtx || this.musicSource) return;
    this.musicBuffer.then((buffer) => {
      if (!buffer || this.musicSource) return;
      const source = this.audioCtx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      // Exactly one 40s loop, ending where the decoded audio ends (see MUSIC)
      source.loopEnd = buffer.duration;
      source.loopStart = Math.max(0, buffer.duration - MUSIC.loopLength);
      source.connect(this.musicGain);
      source.start();
      this.musicSource = source;
      this.updateMusic();
    });
  }

  /** Fade the music toward whatever it should be now: on, or silent while muted, covered or in a hidden tab. */
  updateMusic() {
    if (!this.musicGain) return;
    const audible = this.musicOn && !this.isMuted && !this.offscreen && !this.tabHidden;
    if (audible && this.audioCtx.state === 'suspended') this.audioCtx.resume();

    const now = this.audioCtx.currentTime;
    const gain = this.musicGain.gain;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(gain.value, now);
    gain.linearRampToValueAtTime(
      audible ? MUSIC.volume : 0,
      now + (audible ? MUSIC.fadeIn : MUSIC.fadeOut)
    );
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
      this.bumpBlock(block);
    }
  }

  /** Tapped or clicked: same as a bump, except a spent block still opens its section. */
  handleBlockTap(block) {
    if (block.getData('isHit')) {
      this.bounceBlock(block);
      this.openBlockSection(block);
    } else {
      this.bumpBlock(block);
    }
  }

  bumpBlock(block) {
    const isAlreadyHit = block.getData('isHit');

    // Perform bounce tween regardless
    this.bounceBlock(block);

    if (!isAlreadyHit) {
      block.setData('isHit', true);
      block.setTexture('hit_block');
      block.setTint(this.blockTint(block)); // dark deactivated slate
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
            block.setData('glow', null);
          }
        });
      }

      // Spawn a floating retro star
      this.spawnStar(block.x, block.y - 16);

      this.openBlockSection(block);
    }
  }

  /**
   * Navigate to the block's route after a short beat. Only one at a time: a
   * second tap inside the delay would queue another timer, which the scene
   * pause on navigation freezes until the player comes back, and then it
   * fires and sends them straight back to the page.
   */
  openBlockSection(block) {
    if (this.pendingSection) return;
    this.pendingSection = this.time.delayedCall(200, () => {
      this.pendingSection = null;
      const route = this.blockRoutes[block.getData('type')];
      if (route) {
        EventBus.emit('navigate-to', { route });
      }
    });
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
        block.y = this.blockRestY(block);
      }
    });
  }

  blockTint(block) {
    const hovered = block.getData('hovered');
    return block.getData('isHit')
      ? (hovered ? BLOCK_TINT.hitHover : BLOCK_TINT.hit)
      : (hovered ? BLOCK_TINT.liveHover : BLOCK_TINT.live);
  }

  /** Where the block sits at rest: its spot in the level, raised while hovered. */
  blockRestY(block) {
    return block.getData('originalY') - (block.getData('hovered') ? BLOCK_HOVER_LIFT : 0);
  }

  /** Mouse hover: lift the block and its label, brighten both, and let the glow add light. */
  setBlockHover(block, hovered) {
    if (block.getData('hovered') === hovered) return;
    block.setData('hovered', hovered);
    block.setTint(this.blockTint(block));

    const label = block.getData('labelText');
    label.setTint(hovered ? LABEL_COLOR.hover : LABEL_COLOR.normal);

    // Cuts a bump bounce short only if the cursor leaves mid-bounce
    this.tweens.killTweensOf([block, label]);
    const lift = { duration: 120, ease: 'Quad.easeOut' };
    this.tweens.add({ targets: block, y: this.blockRestY(block), ...lift });
    this.tweens.add({ targets: label, y: this.blockRestY(block) - 32, ...lift });

    // Additive blending brightens the glow without fighting its pulse tween
    const glow = block.getData('glow');
    if (glow) glow.setBlendMode(hovered ? Phaser.BlendModes.ADD : Phaser.BlendModes.NORMAL);
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
    // Each texture has its own palette; characters missing from it ('.', ' ') stay transparent.

    // 1. GROUND PLATE (32x32) — dark gunmetal tread plate: bevelled edge and
    //    raised diagonal grips. It carries its own night-dark colours, so it
    //    isn't tinted, and its cool grey sets off the warm bronze blocks.
    const plateColors = {
      'K': '#13161d', // Outline
      'H': '#8d96a5', // Bevel highlight (top/left)
      'M': '#535b6a', // Plate
      'S': '#353b47', // Bevel shadow (bottom/right)
      'T': '#9ea7b6', // Grip highlight
      't': '#2c313b'  // Grip shadow
    };
    const plateArt = [
      "KKKKKKKKKKKKKKKK",
      "KHHHHHHHHHHHHHSK",
      "KHMMMMMMMMMMMMSK",
      "KHMTtMMMMMTtMMSK",
      "KHMMTtMMMMMTtMSK",
      "KHMMMMMMMMMMMMSK",
      "KHMMMMMMMMMMMMSK",
      "KHMMMMTtMMMMMMSK",
      "KHMMMMMTtMMMMMSK",
      "KHMMMMMMMMMMMMSK",
      "KHMMMMMMMMMMMMSK",
      "KHMTtMMMMMTtMMSK",
      "KHMMTtMMMMMTtMSK",
      "KHMMMMMMMMMMMMSK",
      "KSSSSSSSSSSSSSSK",
      "KKKKKKKKKKKKKKKK"
    ];
    this.drawScaledTexture('plate', plateArt, plateColors, 2);

    // 2. QUESTION BLOCK (32x32) — a bronze lantern: riveted, bevelled frame
    //    around a warm inset with a glowing, centered "?". Has its own palette.
    const blockColors = {
      'K': '#120a06', // Outline
      'H': '#f6cf86', // Frame highlight (top/left)
      'B': '#c98a3c', // Frame bronze
      'D': '#7a4519', // Frame shadow (bottom/right)
      'R': '#fff3d1', // Rivets
      'I': '#3a1d0b', // Inset
      'i': '#24110a', // Inset shadow (top/left)
      'j': '#5a2c10', // Inset lit edge (bottom/right)
      'Y': '#fff4cc'  // Glowing "?"
    };
    const questionArt = [
      "KKKKKKKKKKKKKKKK",
      "KHHHHHHHHHHHHHBK",
      "KHRBBBBBBBBBBRDK",
      "KHBiiiiiiiiiiBDK",
      "KHBiIIYYYYIIjBDK",
      "KHBiIYYIIYYIjBDK",
      "KHBiIIIIIYYIjBDK",
      "KHBiIIIIYYIIjBDK",
      "KHBiIIIYYIIIjBDK",
      "KHBiIIIYYIIIjBDK",
      "KHBiIIIIIIIIjBDK",
      "KHBiIIIYYIIIjBDK",
      "KHBijjjjjjjjjBDK",
      "KHRBBBBBBBBBBRDK",
      "KBDDDDDDDDDDDDDK",
      "KKKKKKKKKKKKKKKK"
    ];
    this.drawScaledTexture('question_block', questionArt, blockColors, 2);

    // 3. HIT BLOCK (32x32) — the same lantern gone cold: grey bronze, the "?"
    //    burnt down to a ghost so it still reads as the same, spent block
    const spentBlockColors = {
      'K': '#0d0b0a', // Outline
      'H': '#8a7a66', // Frame highlight
      'B': '#5e5145', // Frame
      'D': '#3a2f25', // Frame shadow
      'R': '#a89a88', // Rivets
      'I': '#1a1512', // Inset
      'i': '#120e0c', // Inset shadow
      'j': '#2a221c', // Inset lit edge
      'g': '#2e2620'  // Ghost "?"
    };
    const hitArt = [
      "KKKKKKKKKKKKKKKK",
      "KHHHHHHHHHHHHHBK",
      "KHRBBBBBBBBBBRDK",
      "KHBiiiiiiiiiiBDK",
      "KHBiIIggggIIjBDK",
      "KHBiIggIIggIjBDK",
      "KHBiIIIIIggIjBDK",
      "KHBiIIIIggIIjBDK",
      "KHBiIIIggIIIjBDK",
      "KHBiIIIggIIIjBDK",
      "KHBiIIIIIIIIjBDK",
      "KHBiIIIggIIIjBDK",
      "KHBijjjjjjjjjBDK",
      "KHRBBBBBBBBBBRDK",
      "KBDDDDDDDDDDDDDK",
      "KKKKKKKKKKKKKKKK"
    ];
    this.drawScaledTexture('hit_block', hitArt, spentBlockColors, 2);

    // 6. BUSH SCENERY TEXTURE (64x48) — deep night greens of its own, so it isn't tinted
    const bushColors = {
      'E': '#2f5547', // Leaves
      'L': '#1c3631'  // Leaf shadow
    };
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
    this.drawScaledTexture('bush', bushArt, bushColors, 3);

    // 7. SUN (80x80) — shown by day: yellow core, orange rim, a pale highlight and a ring of rays
    const sunColors = {
      'Y': '#ffd84a', // Core
      'O': '#f2a33a', // Rim
      'L': '#fff3b0', // Highlight
      'R': '#ffc94d'  // Rays
    };
    const sunArt = [
      "......R..R......",
      "...R........R...",
      "......OOOO......",
      "....OOYYYYOO....",
      "...OYYLLYYYYO...",
      "R..OYLLYYYYYO..R",
      "..OYYLYYYYYYYO..",
      "..OYYYYYYYYYYO..",
      "..OYYYYYYYYYYO..",
      "..OYYYYYYYYYYO..",
      "R..OYYYYYYYYO..R",
      "...OYYYYYYYYO...",
      "....OOYYYYOO....",
      "......OOOO......",
      "...R........R...",
      "......R..R......"
    ];
    this.drawScaledTexture('sun', sunArt, sunColors, 5);

    // 8. BIRD (14x8, three wing positions) — a distant gull by day: wings up, level, down
    const birdColors = { 'X': '#34466b' };
    [
      ["X.....X", ".X...X.", "..XXX..", "...X..."],
      [".......", "XX...XX", "..XXX..", "...X..."],
      [".......", "..XXX..", ".X.X.X.", "X.....X"],
    ].forEach((art, i) => this.drawScaledTexture(`bird_${i}`, art, birdColors, 2));

    // 9. FIREFLY (10x10) — a bright speck in a soft yellow-green halo, by night
    const fireflyColors = { 'W': '#fbffd6', 'G': 'rgba(214, 255, 120, 0.8)', 'g': 'rgba(214, 255, 120, 0.22)' };
    this.drawScaledTexture('firefly', [".ggg.", "gGGGg", "gGWGg", "gGGGg", ".ggg."], fireflyColors, 2);

    // (Sky gradient, sky glow and vignette are viewport-sized and live in
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
   * camera, widen the physics bounds, regenerate the sky/vignette at full
   * size and extend the ground plates. Runs once from create() and again on
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

    this.refreshSky();
    this.placeSun();
    if (this.clouds) this.spreadClouds();
    if (this.fireflies) this.spreadFireflies();
    if (this.platforms) this.buildGround();
  }

  /**
   * Spread the clouds evenly across the visible sky: one per slot (about one
   * per 240px of width) with a little jitter. Their drift speeds are close, so
   * they stay spread out as they wrap around.
   */
  spreadClouds() {
    const count = Math.max(4, Math.round(this.view.width / 240));
    while (this.clouds.getLength() < count) {
      const frame = Phaser.Utils.Array.GetRandom(CLOUD_FRAMES).name;
      // Colour and opacity follow the theme, see applySceneryTheme()
      const cloud = this.add.image(0, 0, 'clouds', frame).setScale(2);
      cloud.setData('speed', Phaser.Math.FloatBetween(0.12, 0.22));
      this.clouds.add(cloud);
    }
    const slot = this.view.width / this.clouds.getLength();
    this.clouds.getChildren().forEach((cloud, i) => {
      cloud.x = this.view.left + slot * (i + 0.5 + Phaser.Math.FloatBetween(-0.3, 0.3));
      cloud.y = Phaser.Math.Between(this.view.top + 40, 170);
    });
    if (this.sun) this.applySceneryTheme(); // new clouds take on the current theme
  }

  /** Redraw the sky, its glow and the vignette for the current size and theme. */
  refreshSky() {
    const cx = LEVEL.width / 2;
    const cy = LEVEL.height / 2;

    // Fresh textures under versioned keys so we can swap safely, then drop the old ones
    const prev = this.viewportTextureVersion;
    const next = ++this.viewportTextureVersion;
    const keys = this.generateViewportTextures(this.view.width, this.view.height, next);

    if (!this.skyBg) {
      this.skyBg    = this.add.image(cx, cy, keys.sky).setDepth(-3);
      this.skyGlow  = this.add.image(cx, cy, keys.glow).setDepth(-2);
      this.vignette = this.add.image(cx, cy, keys.vignette).setDepth(100);
    } else {
      this.skyBg.setTexture(keys.sky);
      this.skyGlow.setTexture(keys.glow);
      this.vignette.setTexture(keys.vignette);
      ['sky_bg', 'sky_glow', 'vignette'].forEach((k) => {
        const old = `${k}_${prev}`;
        if (this.textures.exists(old)) this.textures.remove(old);
      });
    }
  }

  /**
   * Where the sun sits: near the top-right of the visible sky, kept below the
   * HUD buttons (about 80 screen px tall), which on a small screen cover more
   * of the sky in game units.
   */
  sunPosition() {
    const screenScale = this.scale.displaySize.width / this.view.width;
    return { x: this.view.right - 150, y: this.view.top + Math.max(130, 80 / screenScale + 45) };
  }

  placeSun() {
    const { x, y } = this.sunPosition();
    this.sun?.setPosition(x, y);
  }

  /** Night: twinkling stars and faint moonlit clouds. Day: the sun and white clouds. */
  applySceneryTheme() {
    const day = this.theme === 'day';
    this.bgStars.setVisible(!day);
    this.clouds.getChildren().forEach((cloud) => cloud.setAlpha(day ? 0.95 : 0.25).setTint(day ? 0xffffff : 0x4a5d8a));
    this.sun.setVisible(day);
    this.flocks.forEach((flock) => flock.birds.forEach((bird) => bird.sprite.setVisible(day)));
    this.fireflies.forEach((fly) => fly.sprite.setVisible(!day));
  }

  // ── Wildlife: birds by day, fireflies by night ─────────────────────────────

  createWildlife() {
    this.flocks = [];
    this.fireflies = [];
    this.nextFlockAt = 0;
    this.spawnFlock(true); // one already on its way across when the game opens
    this.spreadFireflies();
  }

  /**
   * A small flock of gulls in a loose V, crossing the sky from one side to the
   * other. `midway` starts it part of the way across instead of off-screen.
   */
  spawnFlock(midway = false) {
    const dir = Math.random() < 0.5 ? 1 : -1;
    const size = Phaser.Math.Between(2, 5);
    const scale = Phaser.Math.FloatBetween(0.8, 1.5); // nearer flocks are bigger and quicker
    const start = dir > 0 ? this.view.left - 40 : this.view.right + 40;
    const flock = {
      dir,
      speed: 34 * scale + Phaser.Math.FloatBetween(0, 12), // px per second
      x: midway ? Phaser.Math.Between(this.view.left + 80, this.view.right - 80) : start,
      y: Phaser.Math.Between(this.view.top + 50, 210),
      drift: Phaser.Math.FloatBetween(-3, 3), // slow climb or descent
      birds: [],
    };
    for (let i = 0; i < size; i++) {
      // The leader, then pairs trailing behind on alternate sides
      const rank = Math.ceil(i / 2);
      const side = i % 2 ? 1 : -1;
      flock.birds.push({
        sprite: this.add.image(0, 0, 'bird_1').setScale(scale).setAlpha(0.85).setVisible(this.theme === 'day'),
        back: rank * (15 + Math.random() * 5) * scale,
        up: rank * side * (9 + Math.random() * 4) * scale,
        beat: Phaser.Math.FloatBetween(0, 1),          // where it is in its wingbeat
        tempo: Phaser.Math.FloatBetween(2.6, 3.4),     // wingbeats per second
        glideAt: Phaser.Math.FloatBetween(1.5, 5),     // seconds until it next holds its wings out
        gliding: 0,
        bob: Phaser.Math.FloatBetween(0, 6.28),
      });
    }
    this.flocks.push(flock);
  }

  /** Fireflies scattered low over the ground, most of them near the bushes. */
  spreadFireflies() {
    const count = Math.max(10, Math.round(this.view.width / 85));
    while (this.fireflies.length < count) {
      this.fireflies.push({
        sprite: this.add.image(0, 0, 'firefly').setDepth(50).setBlendMode(Phaser.BlendModes.ADD).setVisible(this.theme !== 'day'),
        phase: Phaser.Math.FloatBetween(0, 6.28),
        wander: Phaser.Math.FloatBetween(0.25, 0.6),   // how fast it meanders
        reach: Phaser.Math.FloatBetween(14, 34),       // how far from home
        blink: Phaser.Math.FloatBetween(0.5, 1.1),     // glows per second, roughly
        size: Phaser.Math.FloatBetween(0.6, 1),
        fleeX: 0,
        fleeY: 0,
      });
    }
    const slot = this.view.width / this.fireflies.length;
    this.fireflies.forEach((fly, i) => {
      fly.homeX = this.view.left + slot * (i + 0.5 + Phaser.Math.FloatBetween(-0.45, 0.45));
      fly.homeY = Phaser.Math.Between(405, 495); // the ground's surface is at 512
    });
  }

  updateWildlife(time, delta) {
    const dt = Math.min(delta, 50) / 1000;
    const t = time / 1000;

    if (this.theme === 'day') {
      // A new flock sets out every so often, with never more than two in the sky
      if (!this.nextFlockAt) this.nextFlockAt = time + Phaser.Math.Between(5000, 9000);
      if (time > this.nextFlockAt && this.flocks.length < 2) {
        this.spawnFlock();
        this.nextFlockAt = time + Phaser.Math.Between(8000, 15000);
      }
      this.flocks = this.flocks.filter((flock) => {
        flock.x += flock.dir * flock.speed * dt;
        flock.y += flock.drift * dt;
        const gone = flock.dir > 0 ? flock.x > this.view.right + 160 : flock.x < this.view.left - 160;
        flock.birds.forEach((bird) => {
          // Flap, flap, flap, then hold the wings out and glide for a moment
          bird.glideAt -= dt;
          if (bird.glideAt < 0) {
            bird.gliding = Phaser.Math.FloatBetween(0.5, 1.2);
            bird.glideAt = bird.gliding + Phaser.Math.FloatBetween(2, 6);
          }
          bird.gliding = Math.max(0, bird.gliding - dt);
          if (!bird.gliding) bird.beat = (bird.beat + bird.tempo * dt) % 1;
          const frame = bird.gliding ? 1 : [0, 1, 2, 1][Math.floor(bird.beat * 4)];
          bird.sprite.setTexture(`bird_${frame}`);
          bird.sprite.setPosition(
            flock.x - flock.dir * bird.back,
            // Rises on the downstroke, sinks a little while gliding
            flock.y + bird.up + Math.sin(t * 1.3 + bird.bob) * 2.5 + (bird.gliding ? 1.5 : 0),
          );
          if (gone) bird.sprite.destroy();
        });
        return !gone;
      });
      return;
    }

    this.fireflies.forEach((fly) => {
      // Meanders round its home spot on two slow, unrelated swings
      let x = fly.homeX + Math.sin(t * fly.wander + fly.phase) * fly.reach + Math.sin(t * fly.wander * 2.7 + fly.phase * 3) * 6;
      let y = fly.homeY + Math.cos(t * fly.wander * 0.8 + fly.phase * 2) * fly.reach * 0.45 + Math.sin(t * fly.wander * 3.1 + fly.phase) * 4;
      // It darts away from the knight when he comes close, then drifts back
      if (this.player) {
        const dx = x + fly.fleeX - this.player.x;
        const dy = y + fly.fleeY - (this.player.y - 10);
        const near = Math.hypot(dx, dy);
        if (near < 70 && near > 0.01) {
          const push = (70 - near) * 9 * dt;
          fly.fleeX += (dx / near) * push;
          fly.fleeY += (dy / near) * push - 14 * dt; // and up, out of reach
        }
      }
      fly.fleeX *= 1 - Math.min(1, 1.2 * dt);
      fly.fleeY *= 1 - Math.min(1, 1.2 * dt);
      x += fly.fleeX;
      y = Math.min(504, y + fly.fleeY);
      // Glows in slow pulses with dark gaps between, brighter when startled
      const glow = Math.max(0, Math.sin(t * fly.blink * 2.2 + fly.phase * 5)) ** 1.6;
      const startled = Math.min(1, Math.hypot(fly.fleeX, fly.fleeY) / 25);
      fly.sprite.setPosition(x, y).setAlpha(Math.min(1, 0.12 + 0.88 * Math.max(glow, startled))).setScale(fly.size * (0.8 + 0.35 * glow));
    });
  }

  /** Tread-plate floor covering the visible width and everything below the level's ground line. */
  buildGround() {
    this.groundBricks.forEach((b) => b.destroy());
    this.groundBricks = [];

    const tile = 32;
    const groundTop = 528;                        // level's top ground row (center y)
    const firstCol = Math.floor((this.view.left - 16) / tile) * tile + 16;
    for (let x = firstCol; x - 16 < this.view.right; x += tile) {
      for (let y = groundTop; y - 16 < this.view.bottom; y += tile) {
        this.groundBricks.push(this.platforms.create(x, y, 'plate'));
      }
    }
  }

  /**
   * Draw the sky gradient, ambient glows and vignette on canvases of the given
   * size, for the current theme. All positions are expressed in level
   * coordinates and offset so the artwork stays anchored to the level, not the
   * viewport.
   */
  generateViewportTextures(W, H, version) {
    const ox = (W - LEVEL.width) / 2;   // level origin inside the canvas
    const oy = (H - LEVEL.height) / 2;
    const keys = {
      sky:      `sky_bg_${version}`,
      glow:     `sky_glow_${version}`,
      vignette: `vignette_${version}`,
    };

    // SKY BG GRADIENT
    const skyBgCanvas = this.textures.createCanvas(keys.sky, W, H);
    const sCtx = skyBgCanvas.context;
    const sGrad = sCtx.createLinearGradient(0, 0, 0, H);
    const day = this.theme === 'day';
    const sky = day ? ['#4fa3e6', '#8cc8f2', '#d9eefb'] : ['#050816', '#0a0e24', '#050816'];
    sGrad.addColorStop(0, sky[0]);
    sGrad.addColorStop(0.5, sky[1]);
    sGrad.addColorStop(1, sky[2]);
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
    if (day) {
      const sun = this.sunPosition();
      glow(sun.x, sun.y, 20, 430, '255, 238, 180', 0.55); // sunlight around the sun
    } else {
      glow(512,  -80, 50, 500, '255, 184, 77',  0.18); // top-center amber crown
      glow(0,    576, 30, 400, '93, 169, 255',  0.14); // bottom-left cyan bloom
      glow(1024,  50, 20, 350, '255, 154, 108', 0.10); // top-right peach glow
    }
    skyGlowCanvas.refresh();

    // VIGNETTE OVERLAY — beyond the outer radius the last stop continues, so
    // the extended area is uniformly dark (barely there by day)
    const vignetteCanvas = this.textures.createCanvas(keys.vignette, W, H);
    const vCtx = vignetteCanvas.context;
    const vGrad = vCtx.createRadialGradient(512 + ox, 288 + oy, 260, 512 + ox, 288 + oy, 620);
    const shade = day ? ['30, 80, 130', 0.05, 0.16] : ['5, 8, 22', 0.25, 0.82];
    vGrad.addColorStop(0, `rgba(${shade[0]}, 0)`);
    vGrad.addColorStop(0.6, `rgba(${shade[0]}, ${shade[1]})`);
    vGrad.addColorStop(1, `rgba(${shade[0]}, ${shade[2]})`);
    vCtx.fillStyle = vGrad;
    vCtx.fillRect(0, 0, W, H);
    vignetteCanvas.refresh();

    return keys;
  }

  /**
   * A block's title as hard-edged pixel lettering: white letters with a navy
   * outline, every pixel fully one or the other. Phaser's own text has soft
   * edges, which smear when the small game canvas is scaled up to the screen.
   * Returns the texture key; the colour comes from tinting the image.
   */
  pixelLabel(text) {
    const key = `label-${text}`;
    if (this.textures.exists(key)) return key;
    const font = `${LABEL_FONT.size} "${LABEL_FONT.family}"`;
    const probe = document.createElement('canvas').getContext('2d');
    probe.font = font;
    const outline = 2;
    const { gap } = LABEL_FONT; // extra px between letters
    const even = (n) => Math.ceil(n / 2) * 2; // so the centred image sits on whole pixels
    // Each letter's left edge, on whole pixels
    const starts = [];
    let pen = 0;
    for (const letter of text) {
      starts.push(pen);
      pen += Math.round(probe.measureText(letter).width) + gap;
    }
    const width = even(pen - gap + outline * 2 + 2);
    const height = even(parseInt(LABEL_FONT.size, 10) + outline * 2 + 4);
    const canvas = this.textures.createCanvas(key, width, height);
    const ctx = canvas.context;
    ctx.font = font;
    ctx.textBaseline = 'middle';
    const x = outline + 1, y = height / 2 + 1;
    // The outline: the word stamped in navy all round where the letters will go
    ctx.fillStyle = '#050816';
    const write = (dx, dy) => [...text].forEach((letter, i) => ctx.fillText(letter, x + starts[i] + dx, y + dy));
    for (let dx = -outline; dx <= outline; dx++) {
      for (let dy = -outline; dy <= outline; dy++) write(dx, dy);
    }
    ctx.fillStyle = '#ffffff';
    write(0, 0);
    // Snap every pixel to solid white, solid navy or nothing
    const image = ctx.getImageData(0, 0, width, height);
    const px = image.data;
    for (let i = 0; i < px.length; i += 4) {
      if (px[i + 3] < 120) { px[i + 3] = 0; continue; }
      const white = px[i] + px[i + 1] + px[i + 2] > 380;
      px[i] = white ? 255 : 5; px[i + 1] = white ? 255 : 8; px[i + 2] = white ? 255 : 22; px[i + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
    canvas.refresh();
    return key;
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
