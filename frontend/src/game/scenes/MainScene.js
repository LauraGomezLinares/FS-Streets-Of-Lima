import * as Phaser from "phaser";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }

  preload() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, 60, 100);
    g.generateTexture('idle', 60, 100);
    g.clear();

    g.fillStyle(0xffffff, 1);
    g.fillTriangle(30, 0, 0, 100, 60, 100);
    g.generateTexture('atk_j', 60, 100);
    g.clear();

    g.fillStyle(0xffffff, 1);
    g.fillTriangle(0, 0, 60, 0, 30, 100);
    g.generateTexture('atk_k', 60, 100);
    g.clear();

    g.fillStyle(0x888888, 1);
    g.fillCircle(30, 30, 30);
    g.generateTexture('enemy', 60, 60);
    g.clear();

    g.fillStyle(0x888888, 1);
    g.fillCircle(30, 30, 30);
    g.fillStyle(0xff0000, 1);
    g.fillCircle(30, 30, 15); 
    g.generateTexture('enemy_atk', 60, 60);
    g.clear();

    g.fillStyle(0x888888, 1);
    g.fillCircle(30, 30, 30);
    g.fillStyle(0xffff00, 1);
    g.fillCircle(30, 30, 15); 
    g.generateTexture('enemy_atk_fast', 60, 60);
    g.clear();
  }

  create() {
    const slots = this.registry.get('slots');
    const socket = this.registry.get('socket');
    const myUserId = this.registry.get('myId'); 

    this.isHost = slots[0]?.id === myUserId;

    this.players = [];     
    this.remotePlayers = {}; 
    this.myPlayer = null;  
    
    this.isAttacking = false; 
    this.isStunned = false; 
    
    this.isLocked = false; 
    this.enemies = [];     

    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];

    slots.forEach((playerData, index) => {
      if (playerData) {
        const playerSprite = this.add.sprite(200 + (index * 100), 300, 'idle');
        
        playerSprite.id = playerData.id;
        playerSprite.hp = 100; 
        playerSprite.originalTint = colors[index]; 
        
        playerSprite.setTint(playerSprite.originalTint); 
        this.physics.add.existing(playerSprite);
        
        if (playerData.id === myUserId) {
          this.myPlayer = playerSprite;
        } else {
          this.remotePlayers[playerData.id] = playerSprite;
        }

        this.add.text(playerSprite.x - 30, playerSprite.y - 70, playerData.username, { 
            fontFamily: 'sans-serif', fontSize: '14px', fill: '#fff' 
        });

        this.players.push(playerSprite);
      }
    });

    this.scene.launch("UIScene", { slots: slots });

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W, down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A, right: Phaser.Input.Keyboard.KeyCodes.D,
        j: Phaser.Input.Keyboard.KeyCodes.J, k: Phaser.Input.Keyboard.KeyCodes.K
    });

    // ESCUCHADORES DE RED
    socket.on("game:player_moved", (data) => {
        const remoteSprite = this.remotePlayers[data.userId];
        if (remoteSprite) { remoteSprite.x = data.x; remoteSprite.y = data.y; }
    });

    socket.on("game:player_attacked", (data) => {
        const remoteSprite = this.remotePlayers[data.userId];
        if (remoteSprite) remoteSprite.setTexture(data.texture);
    });

    socket.on("game:ambush_triggered", (data) => {
        this.lockCamera(data.lockX);
    });

    socket.on("game:enemy_spawned", (data) => {
        this.createEnemy(data.id, data.x, data.y, data.offsetX, data.offsetY);
    });

    socket.on("game:enemy_took_damage", (data) => {
        this.damageEnemy(data.enemyId);
    });

    //  Manejador de Fases Visuales para el Cliente
    socket.on("game:enemy_attacked", (data) => {
        const enemy = this.enemies.find(e => e.id === data.enemyId);
        if (enemy && enemy.activeStatus) {
            
            // FASE 1: Se prendió el núcleo (Cargando)
            if (data.phase === 'WINDUP') {
                const texture = data.type === 'FAST' ? 'enemy_atk_fast' : 'enemy_atk';
                enemy.setTexture(texture);
            } 
            // FASE 2: Soltó el golpe (La embestida)
            else if (data.phase === 'ATTACK') {
                this.tweens.add({
                    targets: enemy,
                    x: data.targetX,
                    y: data.targetY,
                    duration: 100, // Salto súper rápido
                    onComplete: () => {
                        // Al terminar el golpe, apaga la luz
                        if (enemy.activeStatus) enemy.setTexture('enemy');
                    }
                });
            }
        }
    });

    socket.on("game:player_took_damage", (data) => {
        this.damagePlayer(data.userId, data.amount, data.stunDuration);
    });

    this.cameraTarget = this.add.zone(0, 0, 1, 1);
    this.cameras.main.startFollow(this.cameraTarget, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, 3000, 720);
  }

  // SISTEMAS DE DAÑO
  
  damagePlayer(userId, amount, stunDuration = 0) {
      const pSprite = this.players.find(p => p.id === userId);
      if (!pSprite) return;

      pSprite.hp -= amount;
      if (pSprite.hp < 0) pSprite.hp = 0;

      pSprite.setTint(0xff0000);
      this.time.delayedCall(150, () => {
          pSprite.setTint(pSprite.originalTint);
      });

      this.events.emit("update_hp", { userId: userId, hpPercent: pSprite.hp / 100 });

      if (userId === this.registry.get('myId')) {
          this.isStunned = true;
          pSprite.setAlpha(0.5); 
          
          this.time.delayedCall(stunDuration, () => {
              this.isStunned = false;
              pSprite.setAlpha(1); 
          });
      }
  }

  lockCamera(lockX) {
      this.isLocked = true;
      this.cameras.main.setBounds(lockX, 0, 1280, 720);
  }

  startAmbush() {
      const lockX = this.cameras.main.scrollX;
      this.lockCamera(lockX);
      this.registry.get('socket').emit("game:trigger_ambush", { lockX });

      const enemiesToSpawn = 4 + ((this.players.length - 1) * 3);

      this.time.addEvent({
          delay: 1000,
          repeat: enemiesToSpawn - 1,
          callback: () => {
              const spawnLeft = Math.random() > 0.5;
              const spawnX = spawnLeft ? lockX - 80 : lockX + 1280 + 80;
              const spawnY = Phaser.Math.Between(150, 680);
              const enemyId = 'enemy_' + Date.now() + Math.random();

              const offsetX = (Math.random() * 40 + 60) * (spawnLeft ? -1 : 1); 
              const offsetY = (Math.random() * 60) - 30; 

              this.createEnemy(enemyId, spawnX, spawnY, offsetX, offsetY);
              
              this.registry.get('socket').emit("game:spawn_enemy", { 
                  id: enemyId, x: spawnX, y: spawnY, offsetX, offsetY 
              });
          }
      });
  }

  createEnemy(id, x, y, offsetX, offsetY) {
      const enemy = this.add.sprite(x, y, 'enemy');
      enemy.id = id;
      enemy.hp = 8; 
      enemy.activeStatus = true;
      
      enemy.speed = 1.0; 
      enemy.offsetX = offsetX;
      enemy.offsetY = offsetY;
      
      enemy.state = 'CHASE'; 
      enemy.stateTimer = this.time.now + Phaser.Math.Between(3000, 5000); 
      enemy.wanderTarget = null;
      enemy.hurtTimer = 0;
      
      enemy.attackType = 'HEAVY';

      this.enemies.push(enemy);
  }

  damageEnemy(enemyId) {
      const enemy = this.enemies.find(e => e.id === enemyId);
      if (!enemy || !enemy.activeStatus) return;

      enemy.hp -= 1;
      
      enemy.state = 'HURT';
      enemy.hurtTimer = this.time.now + 600; 
      
      // Si lo golpeas mientras cargaba un ataque, la luz se apaga y se cancela
      enemy.setTexture('enemy');
      
      enemy.x += (enemy.offsetX > 0 ? 15 : -15); 

      enemy.setTint(0xff0000);
      this.time.delayedCall(150, () => {
          if (enemy.activeStatus) enemy.clearTint();
      });

      if (enemy.hp <= 0) {
          enemy.activeStatus = false;
          this.tweens.add({
              targets: enemy, scaleX: 0, scaleY: 0, duration: 200,
              onComplete: () => enemy.destroy()
          });
      }
  }

  update() {
    const socket = this.registry.get('socket');
    const myUserId = this.registry.get('myId');

    if (this.isHost && !this.isLocked && this.cameraTarget.x > 1000) {
        this.startAmbush();
    }

    if (this.myPlayer) {
      if (!this.isAttacking && !this.isStunned) {
        let attacked = false;
        let textureName = '';

        if (Phaser.Input.Keyboard.JustDown(this.wasd.j)) { textureName = 'atk_j'; attacked = true; } 
        else if (Phaser.Input.Keyboard.JustDown(this.wasd.k)) { textureName = 'atk_k'; attacked = true; }

        if (attacked) {
          this.isAttacking = true; 
          this.myPlayer.setTexture(textureName); 
          socket.emit("game:attack", { userId: myUserId, texture: textureName });

          this.enemies.forEach(enemy => {
              if (enemy.activeStatus && Phaser.Math.Distance.Between(this.myPlayer.x, this.myPlayer.y, enemy.x, enemy.y) < 100) {
                  this.damageEnemy(enemy.id); 
                  socket.emit("game:enemy_hit", { enemyId: enemy.id }); 
              }
          });

          this.time.delayedCall(300, () => {
            this.isAttacking = false;
            this.myPlayer.setTexture('idle'); 
            socket.emit("game:attack", { userId: myUserId, texture: 'idle' });
          });
        }
      }

      if (!this.isAttacking && !this.isStunned) {
        const speed = 5;
        let moved = false;

        if (this.cursors.left.isDown || this.wasd.left.isDown) { this.myPlayer.x -= speed; moved = true; } 
        else if (this.cursors.right.isDown || this.wasd.right.isDown) { this.myPlayer.x += speed; moved = true; }

        if (this.cursors.up.isDown || this.wasd.up.isDown) { this.myPlayer.y -= speed; moved = true; } 
        else if (this.cursors.down.isDown || this.wasd.down.isDown) { this.myPlayer.y += speed; moved = true; }

        this.myPlayer.y = Phaser.Math.Clamp(this.myPlayer.y, 150, 680); 

        if (this.isLocked) {
            const camX = this.cameras.main.scrollX;
            this.myPlayer.x = Phaser.Math.Clamp(this.myPlayer.x, camX + 30, camX + 1250);
        } else {
            this.myPlayer.x = Phaser.Math.Clamp(this.myPlayer.x, 30, 2970); 
        }

        if (moved) {
            socket.emit("game:move", { userId: myUserId, x: this.myPlayer.x, y: this.myPlayer.y });
        }
      }
    }

    if (!this.isLocked && this.players.length > 0) {
      let sumX = 0;
      this.players.forEach(p => { sumX += p.x; });
      this.cameraTarget.x = sumX / this.players.length;
      this.cameraTarget.y = 360; 
    }

    // IA ENEMIES
    const camX = this.cameras.main.scrollX;

    this.enemies.forEach(enemy => {
        if (!enemy.activeStatus) return;

        if (enemy.state === 'HURT') {
            if (this.time.now > enemy.hurtTimer) {
                enemy.state = 'CHASE'; 
                enemy.stateTimer = this.time.now + 4000; 
            }
            return; 
        }

        // RELOJ DE ESTADOS DE NAVEGACIÓN
        if (this.time.now > enemy.stateTimer && (enemy.state === 'CHASE' || enemy.state === 'WANDER')) {
            if (enemy.state === 'CHASE') {
                enemy.state = 'WANDER';
                enemy.stateTimer = this.time.now + Phaser.Math.Between(2000, 4500); 
                enemy.wanderTarget = null;
            } else if (enemy.state === 'WANDER') {
                enemy.state = 'CHASE';
                enemy.stateTimer = this.time.now + Phaser.Math.Between(3000, 6000); 
            }
        }

        let closestPlayer = null;
        let minDistance = Infinity;

        this.players.forEach(player => {
            let dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, player.x, player.y);
            if (dist < minDistance) {
                minDistance = dist;
                closestPlayer = player;
            }
        });

        if (closestPlayer) {
            const targetX = closestPlayer.x + enemy.offsetX;
            const targetY = closestPlayer.y + enemy.offsetY;
            const distToTarget = Phaser.Math.Distance.Between(enemy.x, enemy.y, targetX, targetY);

            // PREPARA EL GOLPE (WINDUP)
            if (enemy.state === 'WINDUP') {
                if (this.time.now > enemy.stateTimer) {
                    enemy.state = 'ATTACK';
                }
            } 
            // SUELTA EL GOLPE
            else if (enemy.state === 'ATTACK') {
                const distToPlayer = Phaser.Math.Distance.Between(enemy.x, enemy.y, closestPlayer.x, closestPlayer.y);
                
                // Si el jugador no esquivó a tiempo (Radio ampliado a 75), recibe daño
                if (distToPlayer < 75) {
                    const damageAmt = enemy.attackType === 'FAST' ? 5 : 15;
                    const stunTime = enemy.attackType === 'FAST' ? 300 : 800;

                    this.damagePlayer(closestPlayer.id, damageAmt, stunTime);
                    this.registry.get('socket').emit("game:player_hit", { 
                        userId: closestPlayer.id, amount: damageAmt, stunDuration: stunTime 
                    });
                }
                
                // Embestida visual (Lunge) hacia la última posición del jugador
                const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, closestPlayer.x, closestPlayer.y);
                const lungeX = enemy.x + Math.cos(angle) * 20;
                const lungeY = enemy.y + Math.sin(angle) * 20;

                this.tweens.add({
                    targets: enemy,
                    x: lungeX, y: lungeY,
                    duration: 100,
                    onComplete: () => {
                        if (enemy.activeStatus) enemy.setTexture('enemy');
                    }
                });
                
                // Avisa a todos que suelten el golpe
                this.registry.get('socket').emit("game:enemy_attack", { 
                    enemyId: enemy.id, type: enemy.attackType, phase: 'ATTACK', targetX: lungeX, targetY: lungeY
                });
                
                enemy.state = 'RECOVER';
                enemy.stateTimer = this.time.now + (enemy.attackType === 'FAST' ? 600 : 1200);
            } 
            // RECUPERACIÓN Y REUBICACIÓN
            else if (enemy.state === 'RECOVER') {
                if (this.time.now > enemy.stateTimer) {
                    // Terminó el ataque y su descanso: Obligamos a que se mueva a un flanco o busque otro ángulo
                    enemy.state = 'WANDER'; 
                    enemy.stateTimer = this.time.now + Phaser.Math.Between(1500, 3000);
                    enemy.wanderTarget = null;
                }
            } 
            // PERSECUCIÓN
            else if (enemy.state === 'CHASE') {
                const distToPlayer = Phaser.Math.Distance.Between(enemy.x, enemy.y, closestPlayer.x, closestPlayer.y);
                
                // Si entra en rango, empieza a preparar el ataque
                if (distToPlayer < 65) {
                    enemy.state = 'WINDUP';
                    enemy.attackType = Math.random() > 0.5 ? 'FAST' : 'HEAVY';
                    
                    const reactionTime = enemy.attackType === 'FAST' ? 300 : 700;
                    enemy.stateTimer = this.time.now + reactionTime;
                    
                    // Host prende la luz
                    enemy.setTexture(enemy.attackType === 'FAST' ? 'enemy_atk_fast' : 'enemy_atk');
                    
                    // Avisa a los clientes que se PRENDIÓ LA LUZ
                    this.registry.get('socket').emit("game:enemy_attack", { 
                        enemyId: enemy.id, type: enemy.attackType, phase: 'WINDUP'
                    });
                }
                else if (distToTarget > 15) {
                    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, targetX, targetY);
                    enemy.x += Math.cos(angle) * enemy.speed;
                    enemy.y += Math.sin(angle) * enemy.speed;
                }
            } 
            //  MERODEO
            else if (enemy.state === 'WANDER') {
                if (!enemy.wanderTarget) {
                    enemy.wanderTarget = {
                        x: Phaser.Math.Between(camX + 50, camX + 1230),
                        y: Phaser.Math.Between(150, 680)
                    };
                }

                const distToWander = Phaser.Math.Distance.Between(enemy.x, enemy.y, enemy.wanderTarget.x, enemy.wanderTarget.y);
                
                if (distToWander < 10) {
                    enemy.wanderTarget = null;
                } else {
                    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, enemy.wanderTarget.x, enemy.wanderTarget.y);
                    enemy.x += Math.cos(angle) * (enemy.speed * 0.6); 
                    enemy.y += Math.sin(angle) * (enemy.speed * 0.6);
                }
            }
        }
    });
  }
}