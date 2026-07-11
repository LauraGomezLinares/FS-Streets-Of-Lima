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
    this.isLocked = false; 
    this.enemies = [];     

    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];

    slots.forEach((playerData, index) => {
      if (playerData) {
        // Hacemos que nazcan un poco más arriba (Y: 300)
        const playerSprite = this.add.sprite(200 + (index * 100), 300, 'idle');
        playerSprite.setTint(colors[index]); 
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

    this.cameraTarget = this.add.zone(0, 0, 1, 1);
    this.cameras.main.startFollow(this.cameraTarget, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, 3000, 720);
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
              
              // 🔥 NUEVO: Los enemigos nacen en todo el rango del suelo (150 a 680)
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
      
      // 🔥 NUEVO: Reloj interno para IA
      enemy.state = 'CHASE'; 
      enemy.stateTimer = this.time.now + Phaser.Math.Between(3000, 5000); // 3 a 5 segs iniciales
      enemy.wanderTarget = null;
      enemy.hurtTimer = 0;

      this.enemies.push(enemy);
  }

  damageEnemy(enemyId) {
      const enemy = this.enemies.find(e => e.id === enemyId);
      if (!enemy || !enemy.activeStatus) return;

      enemy.hp -= 1;
      
      enemy.state = 'HURT';
      enemy.hurtTimer = this.time.now + 600; 
      
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
      
      if (!this.isAttacking) {
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

      if (!this.isAttacking) {
        const speed = 5;
        let moved = false;

        if (this.cursors.left.isDown || this.wasd.left.isDown) { this.myPlayer.x -= speed; moved = true; } 
        else if (this.cursors.right.isDown || this.wasd.right.isDown) { this.myPlayer.x += speed; moved = true; }

        if (this.cursors.up.isDown || this.wasd.up.isDown) { this.myPlayer.y -= speed; moved = true; } 
        else if (this.cursors.down.isDown || this.wasd.down.isDown) { this.myPlayer.y += speed; moved = true; }

        // LIMITES DE MOVIMIENTO DEL JUGADOR
        
        // El Eje Y (Arriba y Abajo) está SIEMPRE bloqueado, dejando espacio a la interfaz arriba
        this.myPlayer.y = Phaser.Math.Clamp(this.myPlayer.y, 150, 680); 

        // El Eje X (Izquierda y Derecha) se adapta dependiendo de si hay emboscada
        if (this.isLocked) {
            const camX = this.cameras.main.scrollX;
            this.myPlayer.x = Phaser.Math.Clamp(this.myPlayer.x, camX + 30, camX + 1250);
        } else {
            this.myPlayer.x = Phaser.Math.Clamp(this.myPlayer.x, 30, 2970); // Todo el nivel
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

    // IA Enemigos
    const camX = this.cameras.main.scrollX;

    this.enemies.forEach(enemy => {
        if (!enemy.activeStatus) return;

        // HERIDO Y ATURDIDO
        if (enemy.state === 'HURT') {
            if (this.time.now > enemy.hurtTimer) {
                // Al recuperarse, vuelve directo a perseguir para contraatacar
                enemy.state = 'CHASE'; 
                enemy.stateTimer = this.time.now + 4000; 
            }
            return; 
        }

        // RELOJ DE CAMBIO DE ESTADOS
        if (this.time.now > enemy.stateTimer) {
            if (enemy.state === 'CHASE') {
                enemy.state = 'WANDER';
                enemy.stateTimer = this.time.now + Phaser.Math.Between(2000, 4500); // Merodea entre 2 y 4.5 segs
                enemy.wanderTarget = null; // Fuerza a escoger un nuevo punto de merodeo
            } else if (enemy.state === 'WANDER') {
                enemy.state = 'CHASE';
                enemy.stateTimer = this.time.now + Phaser.Math.Between(3000, 6000); // Persigue entre 3 y 6 segs
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
            
            // PERSEGUIR
            if (enemy.state === 'CHASE') {
                const targetX = closestPlayer.x + enemy.offsetX;
                const targetY = closestPlayer.y + enemy.offsetY;

                // Si no ha llegado a su flanco, camina hacia él
                if (Phaser.Math.Distance.Between(enemy.x, enemy.y, targetX, targetY) > 15) {
                    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, targetX, targetY);
                    enemy.x += Math.cos(angle) * enemy.speed;
                    enemy.y += Math.sin(angle) * enemy.speed;
                }
            } 
            
            // MERODEAR ALEATORIAMENTE POR LA PANTALLA
            else if (enemy.state === 'WANDER') {
                
                // Si no tiene a dónde ir, escoge un punto al azar en la pantalla visible
                if (!enemy.wanderTarget) {
                    enemy.wanderTarget = {
                        x: Phaser.Math.Between(camX + 50, camX + 1230),
                        y: Phaser.Math.Between(150, 680) // Mismos límites de los jugadores
                    };
                }

                const distToWander = Phaser.Math.Distance.Between(enemy.x, enemy.y, enemy.wanderTarget.x, enemy.wanderTarget.y);
                
                // Si ya llegó a su punto falso, lo borra para que el próximo frame busque uno nuevo
                if (distToWander < 10) {
                    enemy.wanderTarget = null;
                } else {
                    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, enemy.wanderTarget.x, enemy.wanderTarget.y);
                    enemy.x += Math.cos(angle) * (enemy.speed * 0.6); // Merodean un poco más lento
                    enemy.y += Math.sin(angle) * (enemy.speed * 0.6);
                }
            }
        }
    });
  }
}