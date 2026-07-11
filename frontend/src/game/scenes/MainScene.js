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

    // Textura del Enemigo
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
        const playerSprite = this.add.sprite(200 + (index * 100), 450, 'idle');
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

    // Lanzar la Interfaz de Barras de Vida en paralelo
    this.scene.launch("UIScene", { slots: slots });

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W, down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A, right: Phaser.Input.Keyboard.KeyCodes.D,
        j: Phaser.Input.Keyboard.KeyCodes.J, k: Phaser.Input.Keyboard.KeyCodes.K
    });

    // sockets
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

    // 🔥 Recibir enemigo y sus "Flancos" calculados por el Host
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

  // Funciones de emboscada y enemigos

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
              const spawnY = Phaser.Math.Between(350, 650);
              const enemyId = 'enemy_' + Date.now() + Math.random();

              // Le asignamos a qué lado del jugador va a pararse este enemigo
              // Entre 60 y 100 píxeles a la izquierda o a la derecha
              const offsetX = (Math.random() * 40 + 60) * (spawnLeft ? -1 : 1); 
              const offsetY = (Math.random() * 60) - 30; // Un poco arriba o abajo para que no formen línea recta

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
      
      // MÁQUINA DE ESTADOS Y VELOCIDAD
      enemy.speed = 1.0; // Movimiento más lento
      enemy.state = 'CHASE'; // CHASE, WANDER, HURT
      enemy.offsetX = offsetX;
      enemy.offsetY = offsetY;
      enemy.hurtTimer = 0;
      enemy.wanderAngle = Math.random() * Math.PI * 2; // Inicia en un ángulo aleatorio

      this.enemies.push(enemy);
  }

  damageEnemy(enemyId) {
      const enemy = this.enemies.find(e => e.id === enemyId);
      if (!enemy || !enemy.activeStatus) return;

      enemy.hp -= 1;
      
      // Estado herido y aturdido
      enemy.state = 'HURT';
      enemy.hurtTimer = this.time.now + 600; // 600 milisegundos de aturdimiento
      
      // Retroceso sutil para dar impacto al golpe
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

  // BUCLE
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
              // Aumentamos el rango a 100px para que los alcances mientras merodean a los lados
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

        if (this.isLocked) {
            const camX = this.cameras.main.scrollX;
            this.myPlayer.x = Phaser.Math.Clamp(this.myPlayer.x, camX + 30, camX + 1250);
            this.myPlayer.y = Phaser.Math.Clamp(this.myPlayer.y, 350, 680); 
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

    // IA ENEMIGOS
    this.enemies.forEach(enemy => {
        if (!enemy.activeStatus) return;

        // ESTADO: HERIDO Y ATURDIDO
        if (enemy.state === 'HURT') {
            if (this.time.now > enemy.hurtTimer) {
                enemy.state = 'CHASE'; // Recupera el sentido
            }
            return; // No camina mientras está aturdido
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
            // El objetivo no es el centro del jugador, sino su "Flanco"
            const targetX = closestPlayer.x + enemy.offsetX;
            const targetY = closestPlayer.y + enemy.offsetY;

            const distToTarget = Phaser.Math.Distance.Between(enemy.x, enemy.y, targetX, targetY);

            // ESTADO: PERSEGUIR HASTA POSICIÓN
            if (distToTarget > 40) {
                enemy.state = 'CHASE';
                const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, targetX, targetY);
                enemy.x += Math.cos(angle) * enemy.speed;
                enemy.y += Math.sin(angle) * enemy.speed;
            } 
            // ESTADO: MERODEAR ALREDEDOR
            else {
                enemy.state = 'WANDER';
                enemy.wanderAngle += 0.02; // Gira lentamente
                // Simula que caminan dando pequeñas vueltas mientras esperan su turno
                enemy.x += Math.cos(enemy.wanderAngle) * (enemy.speed * 0.4);
                enemy.y += Math.sin(enemy.wanderAngle) * (enemy.speed * 0.4);
            }
        }
    });
  }
}