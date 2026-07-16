import * as Phaser from "phaser";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }

  preload() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    this.load.image('bg1', '/backgrounds/Escenario_UTP1.jpeg');
    this.load.image('bg2', '/backgrounds/Escenario_UTP2.jpeg');
    this.load.image('bg3', '/backgrounds/Escenario_UTP3.jpeg');

    this.load.audio('bg_music', '/Audio/background_music.mp3');
    this.load.audio('boss_music', '/Audio/boss_music.mp3');
    this.load.audio('sfx_j', '/Audio/j_key.mp3');
    this.load.audio('sfx_k', '/Audio/k_key.mp3');
    this.load.audio('sfx_damage', '/Audio/taking_damage.mp3');
    this.load.audio('sfx_arrow', '/Audio/flecha.mp3');
    
    this.load.spritesheet('profe_idle', '/assets/characters/SpritesProfe/Profe-Idle.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('profe_walk', '/assets/characters/SpritesProfe/Profe-Walk.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('profe_punch', '/assets/characters/SpritesProfe/Profe-Punch1.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('profe_kick', '/assets/characters/SpritesProfe/Profe-Kick1.png', { frameWidth: 32, frameHeight: 32 });
    g.fillStyle(0x38bdf8, 1); g.fillRect(0, 0, 4, 4); g.generateTexture('charge_particle', 4, 4); g.clear();
    g.fillStyle(0xffffff, 0.7); g.fillRect(0, 0, 60, 8); g.generateTexture('white_glow', 60, 8); g.clear();

    g.fillStyle(0x888888, 1); g.fillCircle(30, 30, 30); g.generateTexture('enemy', 60, 60); g.clear();
    g.fillStyle(0x888888, 1); g.fillCircle(30, 30, 30); g.fillStyle(0xff0000, 1); g.fillCircle(30, 30, 15); g.generateTexture('enemy_atk', 60, 60); g.clear();
    g.fillStyle(0x888888, 1); g.fillCircle(30, 30, 30); g.fillStyle(0xffff00, 1); g.fillCircle(30, 30, 15); g.generateTexture('enemy_atk_fast', 60, 60); g.clear();
    g.fillStyle(0xfacc15, 1); g.fillRect(10, 20, 30, 20); g.fillTriangle(40, 10, 40, 50, 60, 30); g.generateTexture('arrow', 70, 60); g.clear();
    g.fillStyle(0x38bdf8, 0.4); g.lineStyle(2, 0x38bdf8, 1); g.fillCircle(40, 40, 40); g.strokeCircle(40, 40, 40); g.generateTexture('shield', 80, 80); g.clear();

    //  Texturas del Boss
    g.fillStyle(0x4c1d95, 1); g.fillRect(0,0,100,160); g.generateTexture('boss_idle', 100,160); g.clear();
    g.fillStyle(0x4c1d95, 1); g.fillRect(0,0,100,160); g.fillStyle(0x000000, 1); g.fillRect(40,140,20,20); g.generateTexture('boss_walk_1', 100,160); g.clear();
    g.fillStyle(0x4c1d95, 1); g.fillRect(0,0,100,160); g.fillStyle(0x000000, 1); g.fillRect(20,140,20,20); g.generateTexture('boss_walk_2', 100,160); g.clear();
    g.fillStyle(0x4c1d95, 1); g.fillRect(0,0,100,160); g.fillStyle(0x000000, 1); g.fillRect(60,140,20,20); g.generateTexture('boss_walk_3', 100,160); g.clear();
    g.fillStyle(0x4c1d95, 1); g.fillRect(0,0,100,160); g.fillStyle(0xfacc15, 1); g.fillRect(-20,20,40,20); g.fillRect(80,20,40,20); g.generateTexture('boss_atk', 140,160); g.clear();
    
    //  Texturas de la Lluvia de Billetes
    g.fillStyle(0x22c55e, 1); g.fillRect(0,0,30,15); g.generateTexture('billete', 30,15); g.clear();
    g.fillStyle(0xff0000, 0.3); g.fillEllipse(50,25,100,50); g.generateTexture('aoe_warning', 100,50); g.clear();
  }

  create() {
    // Animación de caminata del jefe
    this.anims.create({
        key: 'boss_walk_anim',
        frames: [ { key: 'boss_walk_1' }, { key: 'boss_walk_2' }, { key: 'boss_walk_3' } ],
        frameRate: 6, repeat: -1
    });

    this.add.image(0, 720, 'bg1').setOrigin(0, 1).setDepth(-10);
    
    // bg2 y bg3 empiezan en los múltiplos de 1536 y los forzamos a medir lo mismo
    this.add.image(1536, 720, 'bg2').setOrigin(0, 1).setDepth(-10).setDisplaySize(1536, 1024);
    this.add.image(3072, 720, 'bg3').setOrigin(0, 1).setDepth(-10).setDisplaySize(1536, 1024);

    this.anims.create({ key: 'anim_idle', frames: this.anims.generateFrameNumbers('profe_idle'), frameRate: 8, repeat: -1 });
    this.anims.create({ key: 'anim_walk', frames: this.anims.generateFrameNumbers('profe_walk'), frameRate: 10, repeat: -1 });
    // repeat: 0 para que el golpe/patada se reproduzca una sola vez
    this.anims.create({ key: 'anim_punch', frames: this.anims.generateFrameNumbers('profe_punch'), frameRate: 15, repeat: 0 });
    this.anims.create({ key: 'anim_kick', frames: this.anims.generateFrameNumbers('profe_kick'), frameRate: 15, repeat: 0 });

    const slots = this.registry.get('slots');
    const socket = this.registry.get('socket');
    const myUserId = this.registry.get('myId'); 
    this.unlockedSkills = this.registry.get('unlockedSkills') || [];

    this.isHost = slots[0]?.id === myUserId;
    this.players = [];     
    this.remotePlayers = {}; 
    this.myPlayer = null;  
    
    this.isAttacking = false; this.attackCooldown = false; this.isStunned = false; 
    this.isLocked = false; this.isGameOver = false; 
    
    this.lastDir = { x: 1, y: 0 }; 
    this.isDashing = false; this.isCharging = false; this.chargeTime = 0;

    this.enemies = [];     
    this.shieldGraphics = {};
    
    //  Contador de Emboscadas
    this.ambushCount = 0; 

    this.enemiesKilledCount = 0; 
    this.bossKilled = false;

    this.nextAmbushX = 1000; 
    this.totalEnemiesToSpawn = 0;
    this.spawnedEnemiesCount = 0;
    this.goArrow = null;

    this.events.once('shutdown', () => {
        if(socket) {
            socket.off("game:player_moved"); socket.off("game:player_attacked"); socket.off("game:ambush_triggered");
            socket.off("game:enemy_spawned"); socket.off("game:enemy_took_damage"); socket.off("game:enemy_attacked");
            socket.off("game:player_took_damage"); socket.off("game:ambush_cleared"); socket.off("game:player_shielded");
            socket.off("game:boss_aoe"); socket.off("game:you_win"); // Nuevos
        }
    });

    slots.forEach((playerData, index) => {
      if (playerData) {
        const playerSprite = this.add.sprite(200 + (index * 100), 550, 'profe_idle');
        playerSprite.play('anim_idle');
        
        playerSprite.setScale(2.5);
        playerSprite.id = playerData.id; playerSprite.hp = 100; playerSprite.mp = 100; 
        playerSprite.isShielded = false; playerSprite.isDead = false;
        playerSprite.originalTint = 0xffffff;
        this.physics.add.existing(playerSprite);
        
        if (playerData.id === myUserId) this.myPlayer = playerSprite;
        else this.remotePlayers[playerData.id] = playerSprite;

        const shieldSprite = this.add.sprite(playerSprite.x, playerSprite.y, 'shield');
        shieldSprite.setVisible(false); shieldSprite.setDepth(10);
        this.shieldGraphics[playerData.id] = shieldSprite;

        this.add.text(playerSprite.x - 30, playerSprite.y - 70, playerData.username, { fontFamily: 'sans-serif', fontSize: '14px', fill: '#fff' });
        this.players.push(playerSprite);
      }
    });

    this.scene.launch("UIScene", { slots: slots });

    this.chargeEmitter = this.add.particles(0, 0, 'charge_particle', {
        speed: { min: -40, max: -80 },
        angle: { min: 220, max: 320 },
        scale: { start: 1.5, end: 0 },
        lifespan: 500,
        blendMode: 'ADD',
        emitting: false 
    });
    // Profundidad -1 para que se renderice DETRÁS del jugador
    this.chargeEmitter.setDepth(-1);

    this.bgMusic = this.sound.add('bg_music', { volume: 0.3, loop: true });
    this.bossMusic = this.sound.add('boss_music', { volume: 0.4, loop: true });

    if (!this.bgMusic.isPlaying) {
        this.bgMusic.play();
    }

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W, down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A, right: Phaser.Input.Keyboard.KeyCodes.D,
        j: Phaser.Input.Keyboard.KeyCodes.J, k: Phaser.Input.Keyboard.KeyCodes.K,
        l: Phaser.Input.Keyboard.KeyCodes.L, shift: Phaser.Input.Keyboard.KeyCodes.SHIFT 
    });

    if(socket) {
        socket.on("game:player_moved", (data) => {
            const remoteSprite = this.remotePlayers[data.userId];
            if (remoteSprite) { remoteSprite.x = data.x; remoteSprite.y = data.y; }
        });
        
        socket.on("game:player_attacked", (data) => {
            const remoteSprite = this.remotePlayers[data.userId];
            if (remoteSprite) {
                // Si la animación es un ataque, podemos asegurarnos de la dirección
                remoteSprite.play(data.anim, true);
            }
        });
        socket.on("game:ambush_triggered", (data) => this.lockCamera(data.lockX));
        // Escuchar el nombre correcto del evento
        socket.on("game:spawn_enemy", (data) => {
            if(data.isBoss) this.createBoss(data.id, data.x, data.y);
            else this.createEnemy(data.id, data.x, data.y, data.offsetX, data.offsetY);
        });
        socket.on("game:enemy_took_damage", (data) => this.damageEnemy(data.enemyId, data.amount || 1));
        socket.on("game:enemy_attacked", (data) => {
            const enemy = this.enemies.find(e => e.id === data.enemyId);
            if (enemy && enemy.activeStatus && !enemy.isBoss) {
                if (data.phase === 'WINDUP') enemy.setTexture(data.type === 'FAST' ? 'enemy_atk_fast' : 'enemy_atk');
                else if (data.phase === 'ATTACK') {
                    this.tweens.add({ targets: enemy, x: data.targetX, y: data.targetY, duration: 100, onComplete: () => { if (enemy.activeStatus) enemy.setTexture('enemy'); } });
                }
            }
        });
        socket.on("game:player_took_damage", (data) => this.damagePlayer(data.userId, data.amount, data.stunDuration));
        socket.on("game:ambush_cleared", () => this.clearAmbush());
        socket.on("game:player_shielded", (data) => {
            const remoteSprite = this.remotePlayers[data.userId];
            const shieldSprite = this.shieldGraphics[data.userId];
            if (remoteSprite && shieldSprite) {
                remoteSprite.isShielded = true; shieldSprite.setVisible(true);
                this.time.delayedCall(2000, () => { remoteSprite.isShielded = false; shieldSprite.setVisible(false); });
            }
        });

        //  Recibir ataque de billetes y chequear daño
        socket.on("game:boss_aoe", (data) => {
            data.spots.forEach(spot => {
                const warning = this.add.sprite(spot.x, spot.y, 'aoe_warning').setDepth(0);
                this.tweens.add({ targets: warning, alpha: 0.2, duration: 200, yoyo: true, repeat: 5 });

                const billete = this.add.sprite(spot.x, spot.y - 600, 'billete').setDepth(15);
                this.tweens.add({
                    targets: billete, y: spot.y, duration: 1200, ease: 'Quad.easeIn',
                    onComplete: () => {
                        warning.destroy(); billete.destroy();
                        if (this.isHost) {
                            this.players.forEach(p => {
                                if (!p.isDead && Phaser.Math.Distance.Between(p.x, p.y, spot.x, spot.y) < 60) {
                                    this.damagePlayer(p.id, 25, 800); // 💸 Daño Masivo
                                    socket.emit("game:player_hit", { userId: p.id, amount: 25, stunDuration: 800 });
                                }
                            });
                        }
                    }
                });
            });
        });
        // Los clientes actualizan la posición de los enemigos
        socket.on("game:enemies_sync", (enemiesData) => {
            if (this.isHost) return; // El Host no necesita esto
            enemiesData.forEach(data => {
                const enemy = this.enemies.find(e => e.id === data.id);
                if (enemy) {
                    enemy.x = data.x;
                    enemy.y = data.y;
                }
            });
        });

        //  Victoria Global
        socket.on("game:you_win", () => this.triggerWin());
    }

    this.cameraTarget = this.add.zone(0, 0, 1, 1);
    this.cameras.main.startFollow(this.cameraTarget, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, 4608, 720); // <--- Nuevo límite total
  }

    triggerWin() {
      if (this.isGameOver) return;
      this.isGameOver = true;
      
      const xpEarned = (this.enemiesKilledCount * 15) + (this.bossKilled ? 300 : 0);
      
      const setGameWin = this.registry.get('setGameWin');
      if (setGameWin) this.time.delayedCall(1500, () => setGameWin(xpEarned));
    }

    triggerGameOver() {
        if (this.isGameOver) return;
        this.isGameOver = true;
        const xpEarned = (this.enemiesKilledCount * 15) + (this.bossKilled ? 300 : 0);
        const setGameOver = this.registry.get('setGameOver');
        if (setGameOver) this.time.delayedCall(1000, () => setGameOver(xpEarned));
    }

  damagePlayer(userId, amount, stunDuration = 0) {
      const pSprite = this.players.find(p => p.id === userId);
      if (!pSprite || pSprite.isDead || pSprite.isShielded) return;

      if (userId === this.registry.get('myId')) {
          this.sound.play('sfx_damage', { volume: 0.9 });
      }

      pSprite.hp -= amount;
      if (pSprite.hp <= 0) {
          pSprite.hp = 0; pSprite.isDead = true; pSprite.setTint(0x333333);
          this.tweens.add({ targets: pSprite, angle: 90, y: pSprite.y + 20, duration: 300 });
      } else {
          pSprite.setTint(0xff0000);
          this.time.delayedCall(150, () => { if (!pSprite.isDead) pSprite.setTint(pSprite.originalTint); });
      }
      this.events.emit("update_hp", { userId: userId, hpPercent: pSprite.hp / 100 });

      if (userId === this.registry.get('myId') && !pSprite.isDead) {
          this.isStunned = true; pSprite.setAlpha(0.5); 
          this.time.delayedCall(stunDuration, () => { if (!pSprite.isDead) { this.isStunned = false; pSprite.setAlpha(1); } });
      }
  }

  lockCamera(lockX) { this.isLocked = true; this.cameras.main.setBounds(lockX, 0, 1280, 720); }

  startAmbush() {
      const lockX = this.cameras.main.scrollX;
      this.lockCamera(lockX);
      this.registry.get('socket').emit("game:trigger_ambush", { lockX });

      this.ambushCount++;

        if (this.ambushCount === 4) {
          if (this.goArrow) { this.goArrow.destroy(); this.goArrow = null; }
          const bossId = 'boss_' + Date.now();
          this.createBoss(bossId, lockX + 1000, 550);
            this.registry.get('socket').emit("game:spawn_enemy", { id: bossId, x: lockX + 1000, y: 550, isBoss: true });
          return;
        }

      // EMBOSCADA NORMAL
      this.totalEnemiesToSpawn = 4 + ((this.players.length - 1) * 3);
      this.spawnedEnemiesCount = 0;
      if (this.goArrow) { this.goArrow.destroy(); this.goArrow = null; }

      this.time.addEvent({
          delay: 1000, repeat: this.totalEnemiesToSpawn - 1,
          callback: () => {
              this.spawnedEnemiesCount++;
              const spawnLeft = Math.random() > 0.5;
              const spawnX = spawnLeft ? lockX - 80 : lockX + 1280 + 80;
              const spawnY = Phaser.Math.Between(420, 680);
              const enemyId = 'enemy_' + Date.now() + Math.random();
              const offsetX = (Math.random() * 40 + 60) * (spawnLeft ? -1 : 1); 
              const offsetY = (Math.random() * 60) - 30; 
              this.createEnemy(enemyId, spawnX, spawnY, offsetX, offsetY);
              this.registry.get('socket').emit("game:spawn_enemy", { id: enemyId, x: spawnX, y: spawnY, offsetX, offsetY });
          }
      });
  }

    clearAmbush() {
      this.isLocked = false;
      this.cameras.main.setBounds(0, 0, 3840, 720); 
      this.nextAmbushX = this.cameraTarget.x + 1200;
      const camX = this.cameras.main.scrollX;
      
        this.goArrow = this.add.sprite(camX + 1150, 550, 'arrow');
      this.tweens.add({ targets: this.goArrow, x: this.goArrow.x + 20, duration: 400, yoyo: true, repeat: -1 });
      this.sound.play('sfx_arrow', { volume: 0.8 });

      // Mecánica de Revivir Compañeros Caídos
      this.players.forEach(p => {
          if (p.isDead) {
              p.isDead = false;
              p.hp = 50; // Le devolvemos el 50% de la vida
              
              // Le quitamos el color gris de muerto y le devolvemos su color original
              p.setTint(p.originalTint); 
              
              // Animación para que se levante del suelo
              this.tweens.add({ 
                  targets: p, 
                  angle: 0,         // Vuelve a estar derecho (había rotado 90 grados al morir)
                  y: p.y - 20,      // Lo subimos los 20 píxeles que bajó al caer
                  duration: 500, 
                  ease: 'Bounce.easeOut' 
              });

              // Actualizamos la barra de vida en la UI para todos
              this.events.emit("update_hp", { userId: p.id, hpPercent: 0.5 });
          }
        });
    }

  createEnemy(id, x, y, offsetX, offsetY) {
      const enemy = this.add.sprite(x, y, 'enemy');
      enemy.id = id; enemy.hp = 8; enemy.activeStatus = true; enemy.speed = 1.0; 
      enemy.offsetX = offsetX; enemy.offsetY = offsetY; enemy.state = 'CHASE'; 
      enemy.stateTimer = this.time.now + Phaser.Math.Between(500, 1000); enemy.wanderTarget = null; enemy.hurtTimer = 0;
      enemy.attackType = 'HEAVY'; enemy.isBoss = false;
      this.enemies.push(enemy);
  }

  //  Función para crear al Boss
  createBoss(id, x, y) {
      const boss = this.add.sprite(x, y, 'boss_idle');

      if (this.bgMusic && this.bgMusic.isPlaying) {
          this.bgMusic.stop(); // Detenemos la música normal
      }
      if (this.bossMusic && !this.bossMusic.isPlaying) {
          this.bossMusic.play(); // Iniciamos la del Boss
      }

      boss.id = id; 
      boss.setScale(1.5);
      boss.hp = 15 + (this.players.length * 5); // Mucha Vida!
      boss.activeStatus = true; 
      boss.isBoss = true;
      boss.state = 'MOVE';
      boss.stateTimer = this.time.now + 2000;
      boss.summonTimer = this.time.now + 10000; // Invoca cada 5s
      boss.hurtTimer = 0;
      boss.play('boss_walk_anim');
      this.enemies.push(boss);
  }

  damageEnemy(enemyId, amount = 1) {
      const enemy = this.enemies.find(e => e.id === enemyId);
      if (!enemy || !enemy.activeStatus) return;

      enemy.hp -= amount; 
      enemy.state = 'HURT'; enemy.hurtTimer = this.time.now + 150; 
      
      if(!enemy.isBoss) enemy.setTexture('enemy');
      
      enemy.x += (enemy.offsetX > 0 ? 15 : -15); 
      enemy.setTint(0xff0000);
      
      if (enemy.hp <= 0) {
          enemy.activeStatus = false;

          if (enemy.isBoss) this.bossKilled = true;
          else this.enemiesKilledCount++;

          // 🔥 SI MUERE EL JEFE: VICTORIA INMEDIATA
          if (enemy.isBoss) {
              enemy.setTint(0x000000);
              this.tweens.add({
                  targets: enemy, scaleX: 0, scaleY: 0, angle: 180, duration: 1500,
                  onComplete: () => {
                      enemy.destroy();
                      if (this.isHost) {
                          this.registry.get('socket').emit('game:trigger_win');
                          this.triggerWin();
                      }
                  }
              });
              return; // Salimos para no detonar lógica normal de enemigos
          }

          this.tweens.add({
              targets: enemy, scaleX: 0, scaleY: 0, duration: 200,
              onComplete: () => {
                  enemy.destroy();
                  if (this.isHost && this.isLocked && this.spawnedEnemiesCount === this.totalEnemiesToSpawn && this.ambushCount < 4) {
                      const allDead = this.enemies.every(e => !e.activeStatus || e.isBoss);
                      if (allDead) { this.clearAmbush(); this.registry.get('socket').emit("game:ambush_cleared"); }
                  }
              }
          });
      } else {
          this.time.delayedCall(150, () => { 
              if (enemy.activeStatus) {
                  enemy.clearTint();
                  if(enemy.isBoss && enemy.state === 'MOVE') enemy.play('boss_walk_anim');
              }
          });
      }
  }

  update() {

    if (this.players.length > 0 && this.players.every(p => p.isDead) && !this.isGameOver) {
        this.triggerGameOver();
    }
    const socket = this.registry.get('socket');
    const myUserId = this.registry.get('myId');
    const camX = this.cameras.main.scrollX;

    if (this.isHost && !this.isLocked && this.cameraTarget.x > this.nextAmbushX) this.startAmbush();

    this.players.forEach(p => {
        if (this.shieldGraphics[p.id]) { this.shieldGraphics[p.id].x = p.x; this.shieldGraphics[p.id].y = p.y; }
    });

    if (this.myPlayer && !this.myPlayer.isDead) {

      // Regeneración de Magia (MP)
      if (this.myPlayer.mp < 100) {
          this.myPlayer.mp += 0.2; 
          if (this.myPlayer.mp > 100) this.myPlayer.mp = 100;
          this.events.emit("update_mp", { userId: myUserId, mpPercent: this.myPlayer.mp / 100 });
      }
      
      // Escudo con 'L'
      if (Phaser.Input.Keyboard.JustDown(this.wasd.l) && this.myPlayer.mp >= 70 && !this.myPlayer.isShielded && !this.isStunned) {
          this.myPlayer.mp -= 70;
          this.events.emit("update_mp", { userId: myUserId, mpPercent: this.myPlayer.mp / 100 });
          this.myPlayer.isShielded = true;
          if (this.shieldGraphics[myUserId]) this.shieldGraphics[myUserId].setVisible(true);
          socket.emit("game:player_shield", { userId: myUserId });

          this.enemies.forEach(enemy => {
              if (enemy.activeStatus && Phaser.Math.Distance.Between(this.myPlayer.x, this.myPlayer.y, enemy.x, enemy.y) < 140) {
                  const angle = Phaser.Math.Angle.Between(this.myPlayer.x, this.myPlayer.y, enemy.x, enemy.y);
                  this.tweens.add({ targets: enemy, x: enemy.x + Math.cos(angle) * 100, y: enemy.y + Math.sin(angle) * 100, duration: 200, ease: 'Power2' });
                  enemy.state = 'HURT'; enemy.hurtTimer = this.time.now + 800; 
                  if(!enemy.isBoss) enemy.setTexture('enemy');
              }
          });
          this.time.delayedCall(2000, () => { this.myPlayer.isShielded = false; if (this.shieldGraphics[myUserId]) this.shieldGraphics[myUserId].setVisible(false); });
      }

      // [DASH MASTERY] con Shift
      if (Phaser.Input.Keyboard.JustDown(this.wasd.shift) && this.unlockedSkills.includes('DASH') && this.myPlayer.mp >= 20 && !this.isDashing && !this.isAttacking && !this.isStunned && !this.isCharging) {
          this.myPlayer.mp -= 20;
          this.events.emit("update_mp", { userId: myUserId, mpPercent: this.myPlayer.mp / 100 });
          this.isDashing = true; this.myPlayer.setAlpha(0.6);
          
          // DASH
          this.myPlayer.stop(); // Detenemos animaciones
          this.myPlayer.setTexture('profe_walk', 5); // Frame 5 es el último frame del sprite de correr

          this.enemies.forEach(e => e.hitByDash = false);

          const targetX = this.myPlayer.x + (this.lastDir.x * 200); 
          const targetY = this.myPlayer.y + (this.lastDir.y * 200);

          this.tweens.add({
              targets: this.myPlayer,
              x: Phaser.Math.Clamp(targetX, this.isLocked ? camX + 30 : 30, this.isLocked ? camX + 1250 : 4570), 
              y: Phaser.Math.Clamp(targetY, 420, 680), 
              duration: 250, ease: 'Cubic.out',
              onUpdate: () => {
                  this.enemies.forEach(enemy => {
                      if (enemy.activeStatus && !enemy.hitByDash && Phaser.Math.Distance.Between(this.myPlayer.x, this.myPlayer.y, enemy.x, enemy.y) < 60) {
                          enemy.hitByDash = true; 
                          this.damageEnemy(enemy.id, 1);
                          socket.emit("game:enemy_hit", { enemyId: enemy.id, amount: 1 });
                      }
                  });
                  socket.emit("game:move", { userId: myUserId, x: this.myPlayer.x, y: this.myPlayer.y });
              },
              onComplete: () => { 
                  this.isDashing = false; 
                  this.myPlayer.setAlpha(1); 
                  this.myPlayer.play('anim_idle'); 
              }
          });
      }

      let attacked = false; let animName = ''; let damageToDeal = 1;

      if (!this.isAttacking && !this.attackCooldown && !this.isStunned && !this.isDashing) {
          
          // 1. MANTENER PRESIONADA LA J
          if (this.unlockedSkills.includes('HEAVY') && this.wasd.j.isDown) {
              if (!this.isCharging) { 
                  this.isCharging = true; 
                  this.chargeTime = this.time.now; 
                  this.chargeReadyEffect = false; 
                  
                  this.myPlayer.stop();
                  this.myPlayer.setTexture('profe_punch', 0);
                  
                  this.chargeEmitter.startFollow(this.myPlayer, 0, 60); 
                  this.chargeEmitter.start();
              }

              // Efecto visual cuando la carga supera los 500ms
              if (this.time.now - this.chargeTime > 500 && !this.chargeReadyEffect) {
                  this.chargeReadyEffect = true;
                  this.myPlayer.setTint(0xffaa00); 

                  const glow = this.add.sprite(this.myPlayer.x, this.myPlayer.y + 30, 'white_glow').setDepth(25);
                  glow.setBlendMode(Phaser.BlendModes.ADD);
                  
                  this.tweens.add({
                      targets: glow,
                      y: this.myPlayer.y - 30, 
                      alpha: 0,
                      duration: 350,
                      ease: 'Sine.easeOut',
                      onComplete: () => glow.destroy()
                  });
              }
          }

          // 2. SOLTAR LA J
          if (this.isCharging && Phaser.Input.Keyboard.JustUp(this.wasd.j)) {
              this.isCharging = false; 
              this.chargeEmitter.stop(); 
              this.myPlayer.setTint(this.myPlayer.originalTint); 
              
              attacked = true; 
              animName = 'anim_punch'; 
              
              if (this.time.now - this.chargeTime > 500) damageToDeal = 3; 
          }

          // 3. ATAQUES NORMALES
          if (!this.isCharging) {
              if (Phaser.Input.Keyboard.JustDown(this.wasd.k)) { animName = 'anim_kick'; attacked = true; } 
              else if (!this.unlockedSkills.includes('HEAVY') && Phaser.Input.Keyboard.JustDown(this.wasd.j)) { animName = 'anim_punch'; attacked = true; }
          }

          // 4. EJECUCIÓN DEL ATAQUE
          if (attacked) {
              this.isAttacking = true; this.attackCooldown = true;
              
              this.myPlayer.play(animName); 
              socket.emit("game:attack", { userId: myUserId, anim: animName });

              if (animName === 'anim_punch') {
                  this.sound.play('sfx_j', { volume: 0.8 });
              } else if (animName === 'anim_kick') {
                  this.sound.play('sfx_k', { volume: 0.8 });
              }

              this.enemies.forEach(enemy => {
                  const isFacingRight = this.lastDir.x >= 0;
                  const isFacingEnemy = isFacingRight ? (enemy.x > this.myPlayer.x - 20) : (enemy.x < this.myPlayer.x + 20);

                  if (enemy.activeStatus && isFacingEnemy && Phaser.Math.Distance.Between(this.myPlayer.x, this.myPlayer.y, enemy.x, enemy.y) < (enemy.isBoss ? 120 : 100)) {
                      this.damageEnemy(enemy.id, damageToDeal); 
                      socket.emit("game:enemy_hit", { enemyId: enemy.id, amount: damageToDeal }); 
                  }
              });

              this.time.delayedCall(300, () => {
                  this.isAttacking = false; 
                  if(!this.isDashing) this.myPlayer.play('anim_idle'); 
                  socket.emit("game:attack", { userId: myUserId, anim: 'anim_idle' });
              });
              this.time.delayedCall(500, () => { this.attackCooldown = false; });
          }
      }
      
    if (!this.isAttacking && !this.isStunned && !this.isDashing && !this.isCharging) {
        const speed = 3.5; let moved = false; let dx = 0; let dy = 0;

        if (this.cursors.left.isDown || this.wasd.left.isDown) { this.myPlayer.x -= speed; moved = true; dx = -1; } 
        else if (this.cursors.right.isDown || this.wasd.right.isDown) { this.myPlayer.x += speed; moved = true; dx = 1; }
        
        if (this.cursors.up.isDown || this.wasd.up.isDown) { this.myPlayer.y -= speed; moved = true; dy = -1; } 
        else if (this.cursors.down.isDown || this.wasd.down.isDown) { this.myPlayer.y += speed; moved = true; dy = 1; }

        this.myPlayer.y = Phaser.Math.Clamp(this.myPlayer.y, 420, 680);

        if (dx !== 0 || dy !== 0) {
            this.lastDir = { x: dx, y: dy }; 
            this.myPlayer.setFlipX(dx < 0); 
            this.myPlayer.play('anim_walk', true);
            socket.emit("game:move", { userId: myUserId, x: this.myPlayer.x, y: this.myPlayer.y }); 
        } else if (!moved) {
            this.myPlayer.play('anim_idle', true);
        }
      }
      
      if (this.goArrow && this.myPlayer.x > this.goArrow.x - 200) { this.goArrow.destroy(); this.goArrow = null; }
    }

    if (!this.isLocked && this.players.length > 0) {
      let sumX = 0; let aliveCount = 0;
      this.players.forEach(p => { if(!p.isDead) { sumX += p.x; aliveCount++; } });
      if (aliveCount > 0) { this.cameraTarget.x = sumX / aliveCount; this.cameraTarget.y = 360; }
    }

    // =====================================
    // INTELIGENCIA ARTIFICIAL (HOST ONLY)
    // =====================================
    if(this.isHost) {
        this.enemies.forEach(enemy => {
            if (!enemy.activeStatus) return;

            // INTELIGENCIA DEL JEFE
            if (enemy.isBoss) {
                if (this.time.now > enemy.summonTimer) {
                    enemy.summonTimer = this.time.now + 5000;
                    const eId = 'enemy_' + Date.now();
                    const sX = enemy.x + Phaser.Math.Between(-100, 100);
                    const sY = Phaser.Math.Between(420, 680);
                    this.createEnemy(eId, sX, sY, (Math.random() * 40 + 60), (Math.random() * 60) - 30);
                    socket.emit("game:spawn_enemy", { id: eId, x: sX, y: sY, offsetX: enemy.offsetX, offsetY: enemy.offsetY });
                }

                if (enemy.state === 'HURT') {
                    if (this.time.now > enemy.hurtTimer) {
                        enemy.state = 'MOVE';
                        enemy.stateTimer = this.time.now + 1000;
                        enemy.play('boss_walk_anim');
                    }
                    return; 
                }

                if (this.time.now > enemy.stateTimer) {
                    if (enemy.state === 'MOVE') {
                        enemy.state = 'ATTACK';
                        enemy.stateTimer = this.time.now + 3000; 
                        enemy.stop(); 
                        enemy.setTexture('boss_atk');
                        
                        const spots = [];
                        this.players.forEach(p => {
                            if (!p.isDead) {
                                spots.push({ x: p.x, y: p.y }); 
                                spots.push({ x: p.x + Phaser.Math.Between(-120, 120), y: p.y + Phaser.Math.Between(-60, 60) }); 
                            }
                        });
                        
                        if (spots.length > 0) socket.emit("game:boss_aoe", { spots });

                    } else {
                        enemy.state = 'MOVE';
                        enemy.stateTimer = this.time.now + Phaser.Math.Between(2000, 4000);
                        enemy.play('boss_walk_anim');
                        enemy.wanderTarget = {
                            x: Phaser.Math.Clamp(enemy.x + Phaser.Math.Between(-300, 300), camX + 50, camX + 1200),
                            y: Phaser.Math.Between(420, 680)
                        };
                    }
                }

                if (enemy.state === 'MOVE' && enemy.wanderTarget) {
                    const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, enemy.wanderTarget.x, enemy.wanderTarget.y);
                    if (dist > 15) {
                        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, enemy.wanderTarget.x, enemy.wanderTarget.y);
                        enemy.x += Math.cos(angle) * 0.7;
                        enemy.y += Math.sin(angle) * 0.7;
                    }
                }
                return;
            }

            // 🔥 INTELIGENCIA DE ENEMIGOS NORMALES
            if (enemy.state === 'HURT') {
                if (this.time.now > enemy.hurtTimer) { enemy.state = 'CHASE'; enemy.stateTimer = this.time.now + 4000; }
                return; 
            }

            if (this.time.now > enemy.stateTimer && (enemy.state === 'CHASE' || enemy.state === 'WANDER')) {
                if (enemy.state === 'CHASE') { enemy.state = 'WANDER'; enemy.stateTimer = this.time.now + Phaser.Math.Between(2000, 4500); enemy.wanderTarget = null; } 
                else if (enemy.state === 'WANDER') { enemy.state = 'CHASE'; enemy.stateTimer = this.time.now + Phaser.Math.Between(3000, 6000); }
            }

            let closestPlayer = null; let minDistance = Infinity;
            this.players.forEach(player => {
                if (player.isDead) return; 
                let dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, player.x, player.y);
                if (dist < minDistance) { minDistance = dist; closestPlayer = player; }
            });

            if (closestPlayer) {
                const targetX = closestPlayer.x + enemy.offsetX; const targetY = closestPlayer.y + enemy.offsetY;
                const distToTarget = Phaser.Math.Distance.Between(enemy.x, enemy.y, targetX, targetY);

                if (enemy.state === 'WINDUP') {
                    if (this.time.now > enemy.stateTimer) enemy.state = 'ATTACK';
                } 
                else if (enemy.state === 'ATTACK') {
                    const distToPlayer = Phaser.Math.Distance.Between(enemy.x, enemy.y, closestPlayer.x, closestPlayer.y);
                    
                    if (distToPlayer < 75) {
                        const damageAmt = enemy.attackType === 'FAST' ? 5 : 15;
                        const stunTime = enemy.attackType === 'FAST' ? 300 : 800;
                        this.damagePlayer(closestPlayer.id, damageAmt, stunTime);
                        socket.emit("game:player_hit", { userId: closestPlayer.id, amount: damageAmt, stunDuration: stunTime });
                    }
                    
                    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, closestPlayer.x, closestPlayer.y);
                    const lungeX = enemy.x + Math.cos(angle) * 20; const lungeY = enemy.y + Math.sin(angle) * 20;

                    this.tweens.add({ targets: enemy, x: lungeX, y: lungeY, duration: 100, onComplete: () => { if (enemy.activeStatus) enemy.setTexture('enemy'); } });
                    socket.emit("game:enemy_attack", { enemyId: enemy.id, type: enemy.attackType, phase: 'ATTACK', targetX: lungeX, targetY: lungeY });
                    
                    enemy.state = 'RECOVER'; enemy.stateTimer = this.time.now + (enemy.attackType === 'FAST' ? 600 : 1200);
                } 
                else if (enemy.state === 'RECOVER') {
                    if (this.time.now > enemy.stateTimer) { enemy.state = 'WANDER'; enemy.stateTimer = this.time.now + Phaser.Math.Between(1500, 3000); enemy.wanderTarget = null; }
                } 
                else if (enemy.state === 'CHASE') {
                    const distToPlayer = Phaser.Math.Distance.Between(enemy.x, enemy.y, closestPlayer.x, closestPlayer.y);
                    
                    if (distToPlayer < 65) {
                        enemy.state = 'WINDUP'; enemy.attackType = Math.random() > 0.5 ? 'FAST' : 'HEAVY';
                        enemy.stateTimer = this.time.now + (enemy.attackType === 'FAST' ? 0 : 350);
                        enemy.setTexture(enemy.attackType === 'FAST' ? 'enemy_atk_fast' : 'enemy_atk');
                        socket.emit("game:enemy_attack", { enemyId: enemy.id, type: enemy.attackType, phase: 'WINDUP' });
                    }
                    else if (distToTarget > 15) {
                        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, targetX, targetY);
                        enemy.x += Math.cos(angle) * enemy.speed; enemy.y += Math.sin(angle) * enemy.speed;
                    }
                } 
                else if (enemy.state === 'WANDER') {
                    if (!enemy.wanderTarget) { enemy.wanderTarget = { x: Phaser.Math.Between(camX + 50, camX + 1230), y: Phaser.Math.Between(500, 710) }; }
                    const distToWander = Phaser.Math.Distance.Between(enemy.x, enemy.y, enemy.wanderTarget.x, enemy.wanderTarget.y);
                    if (distToWander < 10) enemy.wanderTarget = null;
                    else {
                        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, enemy.wanderTarget.x, enemy.wanderTarget.y);
                        enemy.x += Math.cos(angle) * (enemy.speed * 0.6); enemy.y += Math.sin(angle) * (enemy.speed * 0.6);
                    }
                }
            }
        });
        const syncData = this.enemies.filter(e => e.activeStatus).map(e => ({ id: e.id, x: e.x, y: e.y }));
        if (syncData.length > 0) {
            socket.emit("game:enemies_sync", syncData);
        }
    }
  }
}