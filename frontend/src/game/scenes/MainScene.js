import * as Phaser from "phaser";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }

  preload() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Texturas de Roldan (Tus placeholders actuales)
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

    // 🔥 NUEVO: Textura del Enemigo (Círculo Gris)
    g.fillStyle(0x888888, 1);
    g.fillCircle(30, 30, 30);
    g.generateTexture('enemy', 60, 60);
    g.clear();
  }

  create() {
    const slots = this.registry.get('slots');
    const socket = this.registry.get('socket');
    const myUserId = this.registry.get('myId'); 

    // 🔥 ¿Soy yo el Jugador 1? (El líder de la sala)
    this.isHost = slots[0]?.id === myUserId;

    this.players = [];     
    this.remotePlayers = {}; 
    this.myPlayer = null;  
    
    // Estados del Juego
    this.isAttacking = false; 
    this.isLocked = false; // ¿Está la cámara bloqueada por emboscada?
    this.enemies = [];     // Lista de enemigos vivos

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

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W, down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A, right: Phaser.Input.Keyboard.KeyCodes.D,
        j: Phaser.Input.Keyboard.KeyCodes.J, k: Phaser.Input.Keyboard.KeyCodes.K
    });

    // Sockets
    socket.on("game:player_moved", (data) => {
        const remoteSprite = this.remotePlayers[data.userId];
        if (remoteSprite) { remoteSprite.x = data.x; remoteSprite.y = data.y; }
    });

    socket.on("game:player_attacked", (data) => {
        const remoteSprite = this.remotePlayers[data.userId];
        if (remoteSprite) remoteSprite.setTexture(data.texture);
    });

    // Recibir bloqueo de cámara
    socket.on("game:ambush_triggered", (data) => {
        this.lockCamera(data.lockX);
    });

    // Recibir aparición de un enemigo
    socket.on("game:enemy_spawned", (data) => {
        this.createEnemy(data.id, data.x, data.y);
    });

    // Recibir golpe a un enemigo
    socket.on("game:enemy_took_damage", (data) => {
        this.damageEnemy(data.enemyId);
    });

    // Cámara Inicial
    this.cameraTarget = this.add.zone(0, 0, 1, 1);
    this.cameras.main.startFollow(this.cameraTarget, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, 3000, 720);
  }

  // Emboscada y enemigos
  
  lockCamera(lockX) {
      this.isLocked = true;
      // Bloqueamos la cámara exactamente donde está
      this.cameras.main.setBounds(lockX, 0, 1280, 720);
  }

  startAmbush() {
      const lockX = this.cameras.main.scrollX;
      this.lockCamera(lockX);
      this.registry.get('socket').emit("game:trigger_ambush", { lockX });

      // Matemáticas de enemigos (4 base + 3 por cada extra)
      const enemiesToSpawn = 4 + ((this.players.length - 1) * 3);

      // Temporizador que se repite 1 vez por segundo
      this.time.addEvent({
          delay: 1000,
          repeat: enemiesToSpawn - 1,
          callback: () => {
              // Decide si aparece a la izquierda o la derecha (fuera de la pantalla)
              const spawnLeft = Math.random() > 0.5;
              const spawnX = spawnLeft ? lockX - 80 : lockX + 1280 + 80;
              const spawnY = Phaser.Math.Between(350, 650);
              const enemyId = 'enemy_' + Date.now() + Math.random();

              this.createEnemy(enemyId, spawnX, spawnY);
              
              // El P1 le avisa al resto de la sala que nació un enemigo
              this.registry.get('socket').emit("game:spawn_enemy", { id: enemyId, x: spawnX, y: spawnY });
          }
      });
  }

  createEnemy(id, x, y) {
      const enemy = this.add.sprite(x, y, 'enemy');
      enemy.id = id;
      enemy.hp = 8; // 8 golpes de vida
      enemy.activeStatus = true;
      this.enemies.push(enemy);
  }

  damageEnemy(enemyId) {
      const enemy = this.enemies.find(e => e.id === enemyId);
      if (!enemy || !enemy.activeStatus) return;

      enemy.hp -= 1;
      
      // Flash Rojo
      enemy.setTint(0xff0000);
      this.time.delayedCall(150, () => {
          if (enemy.activeStatus) enemy.clearTint();
      });

      // Muerte
      if (enemy.hp <= 0) {
          enemy.activeStatus = false;
          // Animación de desaparición
          this.tweens.add({
              targets: enemy, scaleX: 0, scaleY: 0, duration: 200,
              onComplete: () => enemy.destroy()
          });
      }
  }

  // Bucle de actualización del juego
  update() {
    const socket = this.registry.get('socket');
    const myUserId = this.registry.get('myId');

    // 1. EL P1 REVISA EL BLOQUEO (Trigger en X = 1000)
    if (this.isHost && !this.isLocked && this.cameraTarget.x > 1000) {
        this.startAmbush();
    }

    if (this.myPlayer) {
      
      // La lógica de ataque solo se ejecuta si no estamos atacando actualmente
      if (!this.isAttacking) {
        let attacked = false;
        let textureName = '';

        if (Phaser.Input.Keyboard.JustDown(this.wasd.j)) { textureName = 'atk_j'; attacked = true; } 
        else if (Phaser.Input.Keyboard.JustDown(this.wasd.k)) { textureName = 'atk_k'; attacked = true; }

        if (attacked) {
          this.isAttacking = true; 
          this.myPlayer.setTexture(textureName); 
          socket.emit("game:attack", { userId: myUserId, texture: textureName });

          // Detectar colisiones con enemigos cercanos (distancia < 80)
          this.enemies.forEach(enemy => {
              if (enemy.activeStatus && Phaser.Math.Distance.Between(this.myPlayer.x, this.myPlayer.y, enemy.x, enemy.y) < 80) {
                  this.damageEnemy(enemy.id); // Aplica daño local
                  socket.emit("game:enemy_hit", { enemyId: enemy.id }); // Avisa a los demás
              }
          });

          this.time.delayedCall(300, () => {
            this.isAttacking = false;
            this.myPlayer.setTexture('idle'); 
            socket.emit("game:attack", { userId: myUserId, texture: 'idle' });
          });
        }
      }

      // Movimiento del juego
      if (!this.isAttacking) {
        const speed = 5;
        let moved = false;

        if (this.cursors.left.isDown || this.wasd.left.isDown) { this.myPlayer.x -= speed; moved = true; } 
        else if (this.cursors.right.isDown || this.wasd.right.isDown) { this.myPlayer.x += speed; moved = true; }

        if (this.cursors.up.isDown || this.wasd.up.isDown) { this.myPlayer.y -= speed; moved = true; } 
        else if (this.cursors.down.isDown || this.wasd.down.isDown) { this.myPlayer.y += speed; moved = true; }

        // Limitar movimiento a la pantalla si la cámara está bloqueada (emboscada)
        if (this.isLocked) {
            // No dejamos que se salga del recuadro visible de la cámara
            const camX = this.cameras.main.scrollX;
            this.myPlayer.x = Phaser.Math.Clamp(this.myPlayer.x, camX + 30, camX + 1250);
            this.myPlayer.y = Phaser.Math.Clamp(this.myPlayer.y, 350, 680); // Límite del "suelo"
        }

        if (moved) {
            socket.emit("game:move", { userId: myUserId, x: this.myPlayer.x, y: this.myPlayer.y });
        }
      }
    }

    // ACTUALIZAR CÁMARA (Solo si no está bloqueada)
    if (!this.isLocked && this.players.length > 0) {
      let sumX = 0;
      this.players.forEach(p => { sumX += p.x; });
      this.cameraTarget.x = sumX / this.players.length;
      this.cameraTarget.y = 360; 
    }

    // IA de enemigos: Cada enemigo activo busca al jugador más cercano y se mueve hacia él
    this.enemies.forEach(enemy => {
        if (enemy.activeStatus) {
            let closestPlayer = null;
            let minDistance = Infinity;

            // Busca qué jugador está más cerca
            this.players.forEach(player => {
                let dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, player.x, player.y);
                if (dist < minDistance) {
                    minDistance = dist;
                    closestPlayer = player;
                }
            });

            // Camina hacia ese jugador
            if (closestPlayer) {
                const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, closestPlayer.x, closestPlayer.y);
                const enemySpeed = 1.5; // Velocidad de los círculos
                enemy.x += Math.cos(angle) * enemySpeed;
                enemy.y += Math.sin(angle) * enemySpeed;
            }
        }
    });
  }
}