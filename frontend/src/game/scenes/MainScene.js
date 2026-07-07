import * as Phaser from "phaser";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }

  create() {
    const slots = this.registry.get('slots');
    const socket = this.registry.get('socket');
    const myUserId = this.registry.get('myId'); 

    this.players = [];     // Para la cámara
    this.remotePlayers = {}; // Diccionario para actualizar rápido a los amigos
    this.myPlayer = null;  // Referencia a MI personaje local

    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];

    slots.forEach((playerData, index) => {
      if (playerData) {
        const playerSprite = this.add.rectangle(200 + (index * 100), 400, 60, 100, colors[index]);
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
    });

    // SISTEMA DE ENTRADA (Teclado)
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D
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

    // CÁMARA MIDPOINT
    this.cameraTarget = this.add.zone(0, 0, 1, 1);
    this.cameras.main.startFollow(this.cameraTarget, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, 3000, 720);
  }

  update() {
    const socket = this.registry.get('socket');
    const myUserId = this.registry.get('myId');

    // MOVER PERSONAJE
    if (this.myPlayer) {
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

      // Avisar si realmente nos movimos para no saturar la red
      if (moved) {
          socket.emit("game:move", { 
              userId: myUserId, 
              x: this.myPlayer.x, 
              y: this.myPlayer.y 
          });
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