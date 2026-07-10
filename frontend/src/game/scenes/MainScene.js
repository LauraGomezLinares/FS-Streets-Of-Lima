import * as Phaser from "phaser";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }

  // Placeholder para la precarga de assets y animaciones de ataques
  preload() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Textura Base (Rectángulo)
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, 60, 100);
    g.generateTexture('idle', 60, 100);
    g.clear();

    // Textura Ataque J (Triángulo Normal)
    g.fillStyle(0xffffff, 1);
    g.fillTriangle(30, 0, 0, 100, 60, 100);
    g.generateTexture('atk_j', 60, 100);
    g.clear();

    // Textura Ataque K (Triángulo invertido)
    g.fillStyle(0xffffff, 1);
    g.fillTriangle(0, 0, 60, 0, 30, 100);
    g.generateTexture('atk_k', 60, 100);
    g.clear();
  }

  create() {
    const slots = this.registry.get('slots');
    const socket = this.registry.get('socket');
    const myUserId = this.registry.get('myId'); 

    this.players = [];     // Para la cámara
    this.remotePlayers = {}; // Diccionario para actualizar rápido a los amigos
    this.myPlayer = null;  // Referencia a MI personaje local

    this.isAttacking = false;

    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];

    slots.forEach((playerData, index) => {
      if (playerData) {
        const playerSprite = this.add.sprite(200 + (index * 100), 400, 'idle');
        playerSprite.setTint(colors[index]);
        this.physics.add.existing(playerSprite);
        
        // Comparamos si este slot soy YO aka P1
        if (playerData.id === myUserId) {
          this.myPlayer = playerSprite;
        } else {
          // Si es un amigo, lo guardamos en un diccionario usando su ID
          this.remotePlayers[playerData.id] = playerSprite;
        }

        this.add.text(playerSprite.x - 30, playerSprite.y - 70, playerData.username, { 
            fontFamily: 'sans-serif', fontSize: '14px', fill: '#fff' 
        });

        this.players.push(playerSprite);
      }
      this.scene.launch("UIScene", { slots: slots });
    });

    // SISTEMA DE ENTRADA (Teclado)
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
        j: Phaser.Input.Keyboard.KeyCodes.J,
        k: Phaser.Input.Keyboard.KeyCodes.K
    });

    // ESCUCHAR AL SERVIDOR: Cuando un amigo se mueve
    socket.on("game:player_moved", (data) => {
        // data trae: { userId, x, y }
        const remoteSprite = this.remotePlayers[data.userId];
        if (remoteSprite) {
            // Actualizamos la posición del amigo en nuestra pantalla
            remoteSprite.x = data.x;
            remoteSprite.y = data.y;
        }
    });

    socket.on("game:player_attacked", (data) => {
        const remoteSprite = this.remotePlayers[data.userId];
        if (remoteSprite) {
            remoteSprite.setTexture(data.texture);
        }
    });

    // CÁMARA MIDPOINT
    this.cameraTarget = this.add.zone(0, 0, 1, 1);
    this.cameras.main.startFollow(this.cameraTarget, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, 3000, 720);
  }

update() {
    const socket = this.registry.get('socket');
    const myUserId = this.registry.get('myId');

    if (this.myPlayer) {
      if (!this.isAttacking) {
        let attacked = false;
        let textureName = '';

        if (Phaser.Input.Keyboard.JustDown(this.wasd.j)) {
          textureName = 'atk_j';
          attacked = true;
        } else if (Phaser.Input.Keyboard.JustDown(this.wasd.k)) {
          textureName = 'atk_k';
          attacked = true;
        }

        if (attacked) {
          this.isAttacking = true; // Bloquea el movimiento
          this.myPlayer.setTexture(textureName); // Cambia la imagen al triángulo
          
          // Avisa al servidor
          socket.emit("game:attack", { userId: myUserId, texture: textureName });

          // El ataque dura 300 milisegundos
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

        if (this.cursors.left.isDown || this.wasd.left.isDown) {
          this.myPlayer.x -= speed;
          moved = true;
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
          this.myPlayer.x += speed;
          moved = true;
        }

        if (this.cursors.up.isDown || this.wasd.up.isDown) {
          this.myPlayer.y -= speed;
          moved = true;
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
          this.myPlayer.y += speed;
          moved = true;
        }

        if (moved) {
            socket.emit("game:move", { 
                userId: myUserId, 
                x: this.myPlayer.x, 
                y: this.myPlayer.y 
            });
        }
      }
    }

    // ACTUALIZAR CÁMARA COMPARTIDA
    if (this.players.length > 0) {
      let sumX = 0;
      this.players.forEach(player => { sumX += player.x; });
      this.cameraTarget.x = sumX / this.players.length;
      this.cameraTarget.y = 360; 
    }
  }
}