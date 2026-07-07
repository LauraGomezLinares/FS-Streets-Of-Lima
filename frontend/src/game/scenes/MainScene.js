import * as Phaser from "phaser";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }

  create() {
    // Extraemos quiénes están en el Lobby desde el registry
    const slots = this.registry.get('slots');
    
    // Lista para guardar los cuerpos de los jugadores
    this.players = [];

    // Colores temporales de prueba para diferenciar a P1, P2, P3 y P4
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];

    // Hacer aparecer solo a los jugadores que existan en el Lobby
    slots.forEach((playerData, index) => {
      if (playerData) {
        // Luego cambiaremos esto por el sprite real del jugador, pero por ahora es un rectángulo de color
        const playerSprite = this.add.rectangle(200 + (index * 100), 400, 60, 100, colors[index]);
        this.physics.add.existing(playerSprite);
        
        // Etiqueta temporal con el nombre flotando arriba
        this.add.text(playerSprite.x - 30, playerSprite.y - 70, playerData.username, { 
            fontFamily: 'sans-serif', fontSize: '14px', fill: '#fff' 
        });

        this.players.push(playerSprite);
      }
    });

    // Midpoint Camera
    // Creamos un objetivo invisible de 1x1 píxel
    this.cameraTarget = this.add.zone(0, 0, 1, 1);
    
    // Le decimos a la cámara que siga al punto invisible con un poco de suavidad (0.1)
    this.cameras.main.startFollow(this.cameraTarget, true, 0.1, 0.1);
    
    // Establecemos el límite total de este nivel (Ej: 3000 píxeles de largo)
    this.cameras.main.setBounds(0, 0, 3000, 720);
  }

  update() {
    // Si hay jugadores en la sala, calculamos su punto medio constantemente
    if (this.players.length > 0) {
      let sumX = 0;

      this.players.forEach(player => {
        sumX += player.x;
      });

      const midX = sumX / this.players.length;

      // Desplazamos el punto invisible hacia ese centro.
      this.cameraTarget.x = midX;
      
      // Mantenemos la Y bloqueada en el centro (360) para que la cámara no se vuelva loca subiendo y bajando cuando los jugadores salten.
      this.cameraTarget.y = 360; 
    }
  }
}