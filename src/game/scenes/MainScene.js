import Phaser from 'phaser';
import { EventBus } from '../EventBus';

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
  }

  init() {
    // Set up standard responsive scaling
    this.scale.setGameSize(1024, 576);
  }

  preload() {
    // We draw textures programmatically in create, so no external assets need to be preloaded.
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

    // 3. Create Sky and Scenery
    this.add.image(512, 288, 'sky_bg');
    this.add.image(512, 288, 'sky_glow');
    this.add.image(512, 288, 'grid_bg');

    // Add some pixel background stars
    this.bgStars = this.add.group();
    for (let i = 0; i < 12; i++) {
      const x = Phaser.Math.Between(10, 1014);
      const y = Phaser.Math.Between(10, 180);
      const star = this.add.image(x, y, 'star')
        .setScale(Phaser.Math.FloatBetween(0.4, 0.8))
        .setAlpha(Phaser.Math.FloatBetween(0.2, 0.6));
      // Twinkle properties
      star.setData('twinkleSpeed', Phaser.Math.FloatBetween(0.008, 0.025));
      star.setData('direction', Math.random() > 0.5 ? 1 : -1);
      this.bgStars.add(star);
    }
    
    // Add some pixel clouds
    this.clouds = this.add.group();
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(50, 950);
      const y = Phaser.Math.Between(40, 150);
      const cloud = this.add.image(x, y, 'cloud')
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

    // Create Ground Floor (Bricks)
    // Screen width 1024: 32 columns of 32x32 tiles
    for (let x = 16; x < 1024; x += 32) {
      this.platforms.create(x, 528, 'brick'); // Ground Level 1 (Top Layer)
      this.platforms.create(x, 560, 'brick'); // Ground Level 2
      this.platforms.create(x, 592, 'brick'); // Ground Level 3
      this.platforms.create(x, 624, 'brick'); // Ground Level 4
    }

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
        fontFamily: '"Press Start 2P"',
        fontSize: '8px',
        color: '#ffe5b3', // Warm premium amber-white
        stroke: '#050816', // Deep navy stroke
        strokeThickness: 3
      }).setOrigin(0.5);
    });

    // 6. Create Player
    this.player = this.physics.add.sprite(100, 400, 'player', 0);
    this.player.setCollideWorldBounds(true);
    this.player.setGravityY(1000);
    this.player.setOrigin(0.5, 1);
    this.player.setSize(20, 32); // Align bounding box to new 32px height to fix floating
    this.player.setDepth(101); // Ensure player renders above vignette for maximum readability

    // 6.5. Create Cinematic Vignette Layer
    this.add.image(512, 288, 'vignette').setDepth(100);

    // Create player animations
    this.anims.create({
      key: 'idle',
      frames: [{ key: 'player', frame: 0 }]
    });

    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('player', { start: 1, end: 2 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'jump',
      frames: [{ key: 'player', frame: 3 }]
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
    // Cloud drift
    this.clouds.getChildren().forEach((cloud) => {
      cloud.x += cloud.getData('speed');
      if (cloud.x > 1050) {
        cloud.x = -50;
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
        this.player.anims.play('walk', true);
      }
    } else if (this.keysPressed.right) {
      this.player.setVelocityX(speed);
      this.player.setFlipX(false);
      if (this.player.body.touching.down) {
        this.player.anims.play('walk', true);
      }
    } else {
      this.player.setVelocityX(0);
      if (this.player.body.touching.down) {
        this.player.anims.play('idle');
      }
    }

    // Jumping Controls (Up / W / Space)
    if (this.keysPressed.up && this.player.body.touching.down) {
      this.player.setVelocityY(-750);
      this.playSynthSound('jump');
      this.keysPressed.up = false; // Reset to prevent consecutive automatic jumps
    }

    // Jump Animation
    if (!this.player.body.touching.down) {
      this.player.anims.play('jump');
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
    const star = this.add.image(x, y, 'star').setScale(1.5);
    star.setTint(0xffbb44); // Warm amber yellow star!
    
    // Float upward, spin, fade out, then destroy
    this.tweens.add({
      targets: star,
      y: y - 70,
      scaleX: 2.2,
      scaleY: 2.2,
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
      'R': '#D82800', // Red cap/shirt
      'B': '#002288', // Blue overalls
      'S': '#FCD8A8', // Peach skin
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

    // 4. STAR TEXTURE (32x32)
    const starArt = [
      "......GG......",
      ".....GYYG.....",
      ".....GYYG.....",
      "GGGGGGYYGGGGGG",
      "GYYYYYYYYYYYYG",
      ".GYYYYYYYYYYG.",
      "..GYYYYYYYYG..",
      "...GYYYYYYG...",
      "...GYYYYYYG...",
      "..GYYGGYYYG..",
      ".GYYG..GYYYG.",
      "GGGG....GGGG.."
    ];
    this.drawScaledTexture('star', starArt, colors, 2);

    // 5. CLOUD TEXTURE (128x64)
    const cloudCanvas = this.textures.createCanvas('cloud', 64, 32);
    const ctx = cloudCanvas.context;
    ctx.fillStyle = '#ffffff';
    // Draw simple rounded retro cloud shape
    ctx.beginPath();
    ctx.arc(16, 20, 10, 0, Math.PI * 2);
    ctx.arc(32, 14, 13, 0, Math.PI * 2);
    ctx.arc(48, 20, 10, 0, Math.PI * 2);
    ctx.rect(16, 12, 32, 14);
    ctx.fill();
    cloudCanvas.refresh();

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

    // 7. PLAYER SPRITESHEET (128x32)
    // 4 frames: [0: Idle, 1: Walk1, 2: Walk2, 3: Jump]
    const pWidth = 16 * 2; // 32
    const pHeight = 16 * 2; // 32
    const playerCanvas = this.textures.createCanvas('player_canvas', pWidth * 4, pHeight);
    const pCtx = playerCanvas.context;

    const frames = [
      // Frame 0: Idle
      [
        ".....RRRRRR.....",
        "....RRRRRRRRR...",
        "....DDDSSDS.....",
        "...DSDSSSDSS....",
        "...DSDSSDDSSSD..",
        "...DDSSSDDDSS...",
        ".....SSSSSSS....",
        "....RRBBRRBR....",
        "...RRRBBBRRBR...",
        "..RRRRBBBBBRRR..",
        "..SSSRBBYBBRSS..",
        "..WWWRBBBBBRWW..",
        "....BBBB.BBBB...",
        "....BBBB.BBBB...",
        "....DDDD.DDDD...",
        "....DDDD.DDDD..."
      ],
      // Frame 1: Walk 1
      [
        ".....RRRRRR.....",
        "....RRRRRRRRR...",
        "....DDDSSDS.....",
        "...DSDSSSDSS....",
        "...DSDSSDDSSSD..",
        "...DDSSSDDDSS...",
        ".....SSSSSSS....",
        "....RRBBRRBR....",
        "...RRRBBBRRBR...",
        "..RRRRBBBBBRRR..",
        "..SSSRBBYBBRSS..",
        "..WWWRBBBBBRWW..",
        "....BBBB.BBBB...",
        "....BBBBBBBBB...",
        "....DDDD..DDD...",
        "....DD......D..."
      ],
      // Frame 2: Walk 2
      [
        ".....RRRRRR.....",
        "....RRRRRRRRR...",
        "....DDDSSDS.....",
        "...DSDSSSDSS....",
        "...DSDSSDDSSSD..",
        "...DDSSSDDDSS...",
        ".....SSSSSSS....",
        "....RRBBRRBR....",
        "...RRRBBBRRBR...",
        "..RRRRBBBBBRRR..",
        "..SSSRBBYBBRSS..",
        "..WWWRBBBBBRWW..",
        "....BBBB.BBBB...",
        "....BBBBBBBBB...",
        ".....DDD.DDDD...",
        ".....D....DDD..."
      ],
      // Frame 3: Jump
      [
        ".....RRRRRR.....",
        "....RRRRRRRRR...",
        "....DDDSSDS.....",
        "...DSDSSSDSS....",
        "...DSDSSDDSSSD..",
        "...DDSSSDDDSS...",
        ".....SSSSSSS....",
        "....RRBBRRBR....",
        "...RRRBBBRRBR...",
        "..RRRRBBBBBRRR..",
        "..SSSRBBYBBRSS..",
        "..WWWRBBBBBRWW..",
        "....BBBBBBBBB...",
        "....BBBB.BBBB...",
        "....DDD...DDD...",
        "....DD.....DD..."
      ]
    ];

    frames.forEach((frame, fIndex) => {
      const startX = fIndex * pWidth;
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const char = frame[y][x];
          const color = colors[char];
          if (color) {
            pCtx.fillStyle = color;
            pCtx.fillRect(startX + x * 2, y * 2, 2, 2);
          }
        }
      }
    });

    playerCanvas.refresh();

    // Register canvas as Spritesheet
    this.textures.addSpriteSheet('player', this.textures.get('player_canvas').getSourceImage(), {
      frameWidth: pWidth,
      frameHeight: pHeight
    });

    // 8. SKY BG GRADIENT (1024x576)
    const skyBgCanvas = this.textures.createCanvas('sky_bg', 1024, 576);
    const sCtx = skyBgCanvas.context;
    const sGrad = sCtx.createLinearGradient(0, 0, 0, 576);
    sGrad.addColorStop(0, '#050816');
    sGrad.addColorStop(0.5, '#0a0e24');
    sGrad.addColorStop(1, '#050816');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 1024, 576);
    skyBgCanvas.refresh();

    // 9. SKY GLOW (1024x576)
    const skyGlowCanvas = this.textures.createCanvas('sky_glow', 1024, 576);
    const sgCtx = skyGlowCanvas.context;
    
    // Top-center amber crown glow
    const amberGrad = sgCtx.createRadialGradient(512, -80, 50, 512, -80, 500);
    amberGrad.addColorStop(0, 'rgba(255, 184, 77, 0.18)');
    amberGrad.addColorStop(1, 'rgba(255, 184, 77, 0)');
    sgCtx.fillStyle = amberGrad;
    sgCtx.beginPath();
    sgCtx.arc(512, -80, 550, 0, Math.PI * 2);
    sgCtx.fill();

    // Bottom-left cyan bloom
    const cyanGrad = sgCtx.createRadialGradient(0, 576, 30, 0, 576, 400);
    cyanGrad.addColorStop(0, 'rgba(93, 169, 255, 0.14)');
    cyanGrad.addColorStop(1, 'rgba(93, 169, 255, 0)');
    sgCtx.fillStyle = cyanGrad;
    sgCtx.beginPath();
    sgCtx.arc(0, 576, 450, 0, Math.PI * 2);
    sgCtx.fill();

    // Top-right peach glow
    const peachGrad = sgCtx.createRadialGradient(1024, 50, 20, 1024, 50, 350);
    peachGrad.addColorStop(0, 'rgba(255, 154, 108, 0.1)');
    peachGrad.addColorStop(1, 'rgba(255, 154, 108, 0)');
    sgCtx.fillStyle = peachGrad;
    sgCtx.beginPath();
    sgCtx.arc(1024, 50, 400, 0, Math.PI * 2);
    sgCtx.fill();
    
    skyGlowCanvas.refresh();

    // 10. GRID SYSTEM WITH RADIAL MASK (1024x576)
    const gridCanvas = this.textures.createCanvas('grid_bg', 1024, 576);
    const gdCtx = gridCanvas.context;
    gdCtx.strokeStyle = 'rgba(224, 231, 255, 0.07)';
    gdCtx.lineWidth = 1;
    const gridSize = 64;
    for (let x = 0; x < 1024; x += gridSize) {
      gdCtx.beginPath();
      gdCtx.moveTo(x, 0);
      gdCtx.lineTo(x, 576);
      gdCtx.stroke();
    }
    for (let y = 0; y < 576; y += gridSize) {
      gdCtx.beginPath();
      gdCtx.moveTo(0, y);
      gdCtx.lineTo(1024, y);
      gdCtx.stroke();
    }
    // Radial mask
    gdCtx.globalCompositeOperation = 'destination-in';
    const maskGrad = gdCtx.createRadialGradient(512, 230, 80, 512, 230, 450);
    maskGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
    maskGrad.addColorStop(0.3, 'rgba(0, 0, 0, 0.8)');
    maskGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    gdCtx.fillStyle = maskGrad;
    gdCtx.beginPath();
    gdCtx.arc(512, 230, 500, 0, Math.PI * 2);
    gdCtx.fill();
    
    gridCanvas.refresh();

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

    // 12. VIGNETTE OVERLAY (1024x576)
    const vignetteCanvas = this.textures.createCanvas('vignette', 1024, 576);
    const vCtx = vignetteCanvas.context;
    const vGrad = vCtx.createRadialGradient(512, 288, 260, 512, 288, 620);
    vGrad.addColorStop(0, 'rgba(5, 8, 22, 0)');
    vGrad.addColorStop(0.6, 'rgba(5, 8, 22, 0.25)');
    vGrad.addColorStop(1, 'rgba(5, 8, 22, 0.82)');
    vCtx.fillStyle = vGrad;
    vCtx.fillRect(0, 0, 1024, 576);
    vignetteCanvas.refresh();
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
