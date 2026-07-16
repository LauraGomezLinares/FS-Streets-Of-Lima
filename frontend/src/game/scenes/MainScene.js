import * as Phaser from "phaser";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }

  preload() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    
    g.fillStyle(0xffffff, 1); g.fillRect(0, 0, 60, 100); g.generateTexture('idle', 60, 100); g.clear();
    g.fillStyle(0xffffff, 1); g.fillTriangle(30, 0, 0, 100, 60, 100); g.generateTexture('atk_j', 60, 100); g.clear();
    g.fillStyle(0xffffff, 1); g.fillTriangle(0, 0, 60, 0, 30, 100); g.generateTexture('atk_k', 60, 100); g.clear();
    g.fillStyle(0x888888, 1); g.fillCircle(30, 30, 30); g.generateTexture('enemy', 60, 60); g.clear();
    g.fillStyle(0x888888, 1); g.fillCircle(30, 30, 30); g.fillStyle(0xff0000, 1); g.fillCircle(30, 30, 15); g.generateTexture('enemy_atk', 60, 60); g.clear();
    g.fillStyle(0x888888, 1); g.fillCircle(30, 30, 30); g.fillStyle(0xffff00, 1); g.fillCircle(30, 30, 15); g.generateTexture('enemy_atk_fast', 60, 60); g.clear();
    g.fillStyle(0xfacc15, 1); g.fillRect(10, 20, 30, 20); g.fillTriangle(40, 10, 40, 50, 60, 30); g.generateTexture('arrow', 70, 60); g.clear();
    g.fillStyle(0x38bdf8, 0.4); g.lineStyle(2, 0x38bdf8, 1); g.fillCircle(40, 40, 40); g.strokeCircle(40, 40, 40); g.generateTexture('shield', 80, 80); g.clear();
  }

  create() {
    const slots = this.registry.get('slots');
    const socket = this.registry.get('socket');
    const myUserId = this.registry.get('myId'); 
    
    //Leemos los poderes de la base de datos
    this.unlockedSkills = this.registry.get('unlockedSkills') || [];

    this.isHost = slots[0]?.id === myUserId;
    this.players = [];     
    this.remotePlayers = {}; 
    this.myPlayer = null;  
    
    // ESTADOS PARA EL NUEVO SISTEMA DE COMBATE
    this.isAttacking = false; 
    this.attackCooldown = false; 
    this.isStunned = false; 
    this.isLocked = false; 
    this.isGameOver = false; 
    
    this.lastDir = { x: 1, y: 0 }; // Recuerda a dónde miras para el Dash
    this.isDashing = false;
    this.isCharging = false;
    this.chargeTime = 0;

    this.enemies = [];     
    this.shieldGraphics = {};
    
    this.nextAmbushX = 1000; 
    this.totalEnemiesToSpawn = 0;
    this.spawnedEnemiesCount = 0;
    this.goArrow = null;

    this.events.once('shutdown', () => {
        if(socket) {
            socket.off("game:player_moved"); socket.off("game:player_attacked"); socket.off("game:ambush_triggered");
            socket.off("game:enemy_spawned"); socket.off("game:enemy_took_damage"); socket.off("game:enemy_attacked");
            socket.off("game:player_took_damage"); socket.off("game:ambush_cleared"); socket.off("game:player_shielded");
        }
    });

    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];

    slots.forEach((playerData, index) => {
      if (playerData) {
        const playerSprite = this.add.sprite(200 + (index * 100), 300, 'idle');
        
        playerSprite.id = playerData.id;
        playerSprite.hp = 100; 
        playerSprite.mp = 100; 
        playerSprite.isShielded = false;
        playerSprite.isDead = false;
        playerSprite.originalTint = colors[index]; 
        
        playerSprite.setTint(playerSprite.originalTint); 
        this.physics.add.existing(playerSprite);
        
        if (playerData.id === myUserId) {
          this.myPlayer = playerSprite;
        } else {
          this.remotePlayers[playerData.id] = playerSprite;
        }

        const shieldSprite = this.add.sprite(playerSprite.x, playerSprite.y, 'shield');
        shieldSprite.setVisible(false); shieldSprite.setDepth(10);
        this.shieldGraphics[playerData.id] = shieldSprite;

        this.add.text(playerSprite.x - 30, playerSprite.y - 70, playerData.username, { fontFamily: 'sans-serif', fontSize: '14px', fill: '#fff' });
        this.players.push(playerSprite);
      }
    });

    this.scene.launch("UIScene", { slots: slots });

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W, down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A, right: Phaser.Input.Keyboard.KeyCodes.D,
        j: Phaser.Input.Keyboard.KeyCodes.J, k: Phaser.Input.Keyboard.KeyCodes.K,
        l: Phaser.Input.Keyboard.KeyCodes.L,
        shift: Phaser.Input.Keyboard.KeyCodes.SHIFT // 🔥 Habilitamos el SHIFT
    });

    if(socket) {
        socket.on("game:player_moved", (data) => {
            const remoteSprite = this.remotePlayers[data.userId];
            if (remoteSprite) { remoteSprite.x = data.x; remoteSprite.y = data.y; }
        });
        socket.on("game:player_attacked", (data) => {
            const remoteSprite = this.remotePlayers[data.userId];
            if (remoteSprite) remoteSprite.setTexture(data.texture);
        });
        socket.on("game:ambush_triggered", (data) => this.lockCamera(data.lockX));
        socket.on("game:enemy_spawned", (data) => this.createEnemy(data.id, data.x, data.y, data.offsetX, data.offsetY));
        socket.on("game:enemy_took_damage", (data) => this.damageEnemy(data.enemyId, data.amount || 1));
        socket.on("game:enemy_attacked", (data) => {
            const enemy = this.enemies.find(e => e.id === data.enemyId);
            if (enemy && enemy.activeStatus) {
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
    }

    this.cameraTarget = this.add.zone(0, 0, 1, 1);
    this.cameras.main.startFollow(this.cameraTarget, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, 3000, 720);
  }

  damagePlayer(userId, amount, stunDuration = 0) {
      const pSprite = this.players.find(p => p.id === userId);
      if (!pSprite || pSprite.isDead || pSprite.isShielded) return;

      pSprite.hp -= amount;
      if (pSprite.hp <= 0) {
          pSprite.hp = 0; pSprite.isDead = true; pSprite.setTint(0x333333);
          this.tweens.add({ targets: pSprite, angle: 90, y: pSprite.y + 20, duration: 300 });
      } else {
          pSprite.setTint(0xff0000);
          this.time.delayedCall(150, () => { if (!pSprite.isDead) pSprite.setTint(pSprite.originalTint); });
      }
      this.events.emit("update_hp", { userId: userId, hpPercent: pSprite.hp / 100 });

      if (this.players.every(p => p.isDead) && !this.isGameOver) {
          this.isGameOver = true;
          const setGameOver = this.registry.get('setGameOver');
          if (setGameOver) this.time.delayedCall(1000, () => setGameOver(true));
      }

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
      this.totalEnemiesToSpawn = 5 + ((this.players.length - 1) * 3);
      this.spawnedEnemiesCount = 0;
      if (this.goArrow) { this.goArrow.destroy(); this.goArrow = null; }

      this.time.addEvent({
          delay: 1000, repeat: this.totalEnemiesToSpawn - 1,
          callback: () => {
              this.spawnedEnemiesCount++;
              const spawnLeft = Math.random() > 0.5;
              const spawnX = spawnLeft ? lockX - 80 : lockX + 1280 + 80;
              const spawnY = Phaser.Math.Between(150, 680);
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
      this.cameras.main.setBounds(0, 0, 3000, 720);

      this.nextAmbushX = this.cameraTarget.x + 1200;
      const camX = this.cameras.main.scrollX;
      this.goArrow = this.add.sprite(camX + 1150, 360, 'arrow');
      
      this.tweens.add({ targets: this.goArrow, x: this.goArrow.x + 20, duration: 400, yoyo: true, repeat: -1 });
  }

  createEnemy(id, x, y, offsetX, offsetY) {
      const enemy = this.add.sprite(x, y, 'enemy');
      enemy.id = id; enemy.hp = 8; enemy.activeStatus = true; enemy.speed = 1.0; 
      enemy.offsetX = offsetX; enemy.offsetY = offsetY; enemy.state = 'CHASE'; 
      enemy.stateTimer = this.time.now + Phaser.Math.Between(500, 1000); enemy.wanderTarget = null; enemy.hurtTimer = 0;
      enemy.attackType = 'HEAVY';
      this.enemies.push(enemy);
  }

  // Ahora recibe el daño variable del Heavy Punch
  damageEnemy(enemyId, amount = 1) {
      const enemy = this.enemies.find(e => e.id === enemyId);
      if (!enemy || !enemy.activeStatus) return;

      enemy.hp -= amount; 
      enemy.state = 'HURT'; enemy.hurtTimer = this.time.now + 150; enemy.setTexture('enemy');
      enemy.x += (enemy.offsetX > 0 ? 15 : -15); 
      enemy.setTint(0xff0000);
      
      if (enemy.hp <= 0) {
          enemy.activeStatus = false;
          this.tweens.add({
              targets: enemy, scaleX: 0, scaleY: 0, duration: 200,
              onComplete: () => {
                  enemy.destroy();
                  if (this.isHost && this.isLocked && this.spawnedEnemiesCount === this.totalEnemiesToSpawn) {
                      const allDead = this.enemies.every(e => !e.activeStatus);
                      if (allDead) { this.clearAmbush(); this.registry.get('socket').emit("game:ambush_cleared"); }
                  }
              }
          });
      } else {
          this.time.delayedCall(150, () => { if (enemy.activeStatus) enemy.clearTint(); });
      }
  }

  update() {
    const socket = this.registry.get('socket');
    const myUserId = this.registry.get('myId');

    if (this.isHost && !this.isLocked && this.cameraTarget.x > this.nextAmbushX) this.startAmbush();

    this.players.forEach(p => {
        if (this.shieldGraphics[p.id]) { this.shieldGraphics[p.id].x = p.x; this.shieldGraphics[p.id].y = p.y; }
    });

    if (this.myPlayer && !this.myPlayer.isDead) {
      const camX = this.cameras.main.scrollX;

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
                  enemy.state = 'HURT'; enemy.hurtTimer = this.time.now + 800; enemy.setTexture('enemy');
              }
          });
          this.time.delayedCall(2000, () => { this.myPlayer.isShielded = false; if (this.shieldGraphics[myUserId]) this.shieldGraphics[myUserId].setVisible(false); });
      }

      // [DASH MASTERY] con Shift
      if (Phaser.Input.Keyboard.JustDown(this.wasd.shift) && this.unlockedSkills.includes('DASH') && this.myPlayer.mp >= 20 && !this.isDashing && !this.isAttacking && !this.isStunned && !this.isCharging) {
          this.myPlayer.mp -= 20;
          this.events.emit("update_mp", { userId: myUserId, mpPercent: this.myPlayer.mp / 100 });
          this.isDashing = true;
          this.myPlayer.setAlpha(0.6);

          this.enemies.forEach(e => e.hitByDash = false); // Resetea a quién ha golpeado este dash

          const targetX = this.myPlayer.x + (this.lastDir.x * 200); 
          const targetY = this.myPlayer.y + (this.lastDir.y * 200);

          this.tweens.add({
              targets: this.myPlayer,
              x: Phaser.Math.Clamp(targetX, this.isLocked ? camX + 30 : 30, this.isLocked ? camX + 1250 : 2970),
              y: Phaser.Math.Clamp(targetY, 150, 680),
              duration: 250,
              ease: 'Cubic.out',
              onUpdate: () => {
                  this.enemies.forEach(enemy => {
                      if (enemy.activeStatus && !enemy.hitByDash && Phaser.Math.Distance.Between(this.myPlayer.x, this.myPlayer.y, enemy.x, enemy.y) < 60) {
                          enemy.hitByDash = true; // Solo lo golpea 1 vez por dash
                          this.damageEnemy(enemy.id, 1);
                          socket.emit("game:enemy_hit", { enemyId: enemy.id, amount: 1 });
                      }
                  });
                  socket.emit("game:move", { userId: myUserId, x: this.myPlayer.x, y: this.myPlayer.y });
              },
              onComplete: () => {
                  this.isDashing = false;
                  this.myPlayer.setAlpha(1);
              }
          });
      }

      // SISTEMA DE ATAQUE CARGADO (HEAVY PUNCH)
      let attacked = false;
      let textureName = '';
      let damageToDeal = 1;

      if (!this.isAttacking && !this.attackCooldown && !this.isStunned && !this.isDashing) {
          
          // CARGA DEL HEAVY PUNCH
          if (this.unlockedSkills.includes('HEAVY') && this.wasd.j.isDown) {
              if (!this.isCharging) {
                  this.isCharging = true;
                  this.chargeTime = this.time.now;
              }
              // Efecto visual al cargar
              if (this.time.now - this.chargeTime > 500) this.myPlayer.setTint(0xff5500); // Cargado al máximo! (Naranja)
              else this.myPlayer.setTint(0xffffaa); // Cargando... (Amarillo)
          }

          // SOLTAR EL HEAVY PUNCH
          if (this.isCharging && Phaser.Input.Keyboard.JustUp(this.wasd.j)) {
              this.isCharging = false;
              this.myPlayer.setTint(this.myPlayer.originalTint);
              attacked = true; textureName = 'atk_j';

              // Si mantuviste más de medio segundo, hace 3 de daño
              if (this.time.now - this.chargeTime > 500) damageToDeal = 3; 
          }

          // ATAQUE RÁPIDO CON LA 'K' (o con la J si no tiene Heavy comprado)
          if (!this.isCharging) {
              if (Phaser.Input.Keyboard.JustDown(this.wasd.k)) {
                  textureName = 'atk_k'; attacked = true;
              } else if (!this.unlockedSkills.includes('HEAVY') && Phaser.Input.Keyboard.JustDown(this.wasd.j)) {
                  textureName = 'atk_j'; attacked = true;
              }
          }

          // EJECUCIÓN DEL GOLPE (Rápido o Cargado)
          if (attacked) {
              this.isAttacking = true; this.attackCooldown = true;
              this.myPlayer.setTexture(textureName); 
              socket.emit("game:attack", { userId: myUserId, texture: textureName });

              this.enemies.forEach(enemy => {
                  if (enemy.activeStatus && Phaser.Math.Distance.Between(this.myPlayer.x, this.myPlayer.y, enemy.x, enemy.y) < 100) {
                      this.damageEnemy(enemy.id, damageToDeal); 
                      socket.emit("game:enemy_hit", { enemyId: enemy.id, amount: damageToDeal }); 
                  }
              });

              this.time.delayedCall(300, () => {
                  this.isAttacking = false; this.myPlayer.setTexture('idle'); 
                  socket.emit("game:attack", { userId: myUserId, texture: 'idle' });
              });
              this.time.delayedCall(500, () => { this.attackCooldown = false; });
          }
      }

      //  MOVIMIENTO TÁCTICO
      if (!this.isAttacking && !this.isStunned && !this.isDashing && !this.isCharging) {
        const speed = 3.5; 
        let moved = false;
        let dx = 0; let dy = 0;

        if (this.cursors.left.isDown || this.wasd.left.isDown) { this.myPlayer.x -= speed; moved = true; dx = -1; } 
        else if (this.cursors.right.isDown || this.wasd.right.isDown) { this.myPlayer.x += speed; moved = true; dx = 1; }

        if (this.cursors.up.isDown || this.wasd.up.isDown) { this.myPlayer.y -= speed; moved = true; dy = -1; } 
        else if (this.cursors.down.isDown || this.wasd.down.isDown) { this.myPlayer.y += speed; moved = true; dy = 1; }

        if (dx !== 0 || dy !== 0) this.lastDir = { x: dx, y: dy }; // Memoria para saber a dónde dashear

        this.myPlayer.y = Phaser.Math.Clamp(this.myPlayer.y, 150, 680); 

        if (this.isLocked) this.myPlayer.x = Phaser.Math.Clamp(this.myPlayer.x, camX + 30, camX + 1250);
        else this.myPlayer.x = Phaser.Math.Clamp(this.myPlayer.x, 30, 2970); 

        if (moved) socket.emit("game:move", { userId: myUserId, x: this.myPlayer.x, y: this.myPlayer.y });
      }
      
      if (this.goArrow && this.myPlayer.x > this.goArrow.x - 200) { this.goArrow.destroy(); this.goArrow = null; }
    }

    if (!this.isLocked && this.players.length > 0) {
      let sumX = 0; let aliveCount = 0;
      this.players.forEach(p => { if(!p.isDead) { sumX += p.x; aliveCount++; } });
      if (aliveCount > 0) { this.cameraTarget.x = sumX / aliveCount; this.cameraTarget.y = 360; }
    }

    // INTELIGENCIA ARTIFICIAL DE ENEMIGOS
    const camX = this.cameras.main.scrollX;

    this.enemies.forEach(enemy => {
        if (!enemy.activeStatus) return;

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
                    this.registry.get('socket').emit("game:player_hit", { userId: closestPlayer.id, amount: damageAmt, stunDuration: stunTime });
                }
                
                const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, closestPlayer.x, closestPlayer.y);
                const lungeX = enemy.x + Math.cos(angle) * 20; const lungeY = enemy.y + Math.sin(angle) * 20;

                this.tweens.add({ targets: enemy, x: lungeX, y: lungeY, duration: 100, onComplete: () => { if (enemy.activeStatus) enemy.setTexture('enemy'); } });
                this.registry.get('socket').emit("game:enemy_attack", { enemyId: enemy.id, type: enemy.attackType, phase: 'ATTACK', targetX: lungeX, targetY: lungeY });
                
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
                    this.registry.get('socket').emit("game:enemy_attack", { enemyId: enemy.id, type: enemy.attackType, phase: 'WINDUP' });
                }
                else if (distToTarget > 15) {
                    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, targetX, targetY);
                    enemy.x += Math.cos(angle) * enemy.speed; enemy.y += Math.sin(angle) * enemy.speed;
                }
            } 
            else if (enemy.state === 'WANDER') {
                if (!enemy.wanderTarget) { enemy.wanderTarget = { x: Phaser.Math.Between(camX + 50, camX + 1230), y: Phaser.Math.Between(150, 680) }; }
                const distToWander = Phaser.Math.Distance.Between(enemy.x, enemy.y, enemy.wanderTarget.x, enemy.wanderTarget.y);
                if (distToWander < 10) enemy.wanderTarget = null;
                else {
                    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, enemy.wanderTarget.x, enemy.wanderTarget.y);
                    enemy.x += Math.cos(angle) * (enemy.speed * 0.6); enemy.y += Math.sin(angle) * (enemy.speed * 0.6);
                }
            }
        }
    });
  }
}