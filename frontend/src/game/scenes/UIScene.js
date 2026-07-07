import * as Phaser from "phaser";

export default class UIScene extends Phaser.Scene {
  constructor() {
    super("UIScene");
  }

  create(data) {
    // Recibimos los slots (jugadores) desde la MainScene
    const slots = data.slots;
    
    // Diccionario para guardar las barras y poder actualizarlas luego al recibir daño
    this.playerBars = {};

    slots.forEach((player, index) => {
      if (player) {
        // Espaciamos cada UI horizontalmente
        const baseX = 30 + (index * 250);
        const baseY = 20;

        // DIBUJAR LA CAJA DEL AVATAR
        const avatarGraphics = this.add.graphics();
        avatarGraphics.lineStyle(6, 0x000000, 1); // Borde negro grueso (6px)
        avatarGraphics.fillStyle(0xffffff, 1);   // Fondo blanco
        avatarGraphics.fillRoundedRect(baseX, baseY, 60, 60, 12);
        avatarGraphics.strokeRoundedRect(baseX, baseY, 60, 60, 12);

        // EL NOMBRE DEL JUGADOR
        this.add.text(baseX + 80, baseY, player.username, {
          fontFamily: 'sans-serif', // poner fuente después
          fontSize: '18px',
          fontStyle: 'italic',
          color: '#000000',
          stroke: '#ffffff',
          strokeThickness: 2
        });

        // BARRA DE VIDA (Verde Limón)
        // Fondo oscuro de la barra
        const hpBg = this.add.graphics();
        hpBg.fillStyle(0x333333, 1);
        hpBg.fillRoundedRect(baseX + 80, baseY + 28, 140, 12, 6);
        
        // Relleno Verde
        const hpFill = this.add.graphics();
        hpFill.fillStyle(0xbedb39, 1); // Código de color verde de tu imagen
        hpFill.fillRoundedRect(baseX + 80, baseY + 28, 140, 12, 6);

        // BARRA DE ENERGÍA (Celeste)
        // Fondo oscuro
        const mpBg = this.add.graphics();
        mpBg.fillStyle(0x333333, 1);
        mpBg.fillRoundedRect(baseX + 80, baseY + 48, 140, 10, 5);

        // Relleno Celeste
        const mpFill = this.add.graphics();
        mpFill.fillStyle(0x8ee0f0, 1); // Código de color celeste de tu imagen
        mpFill.fillRoundedRect(baseX + 80, baseY + 48, 140, 10, 5);

        // Guardamos las referencias por si necesitamos bajar la vida luego
        this.playerBars[player.id] = { hpFill, mpFill };
      }
    });

    // ESCUCHAR DAÑO
    // Cuando la MainScene grite "daño", la interfaz lo escuchará y achicará la barra
    const mainScene = this.scene.get("MainScene");
    mainScene.events.on("update_hp", ({ userId, hpPercent }) => {
        if (this.playerBars[userId]) {
            // Escalamos el gráfico en el eje X (de 0 a 1)
            this.playerBars[userId].hpFill.scaleX = hpPercent;
        }
    });
  }
}