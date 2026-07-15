import * as Phaser from "phaser";

export default class UIScene extends Phaser.Scene {
  constructor() {
    super("UIScene");
  }

  create(data) {
    const slots = data.slots;
    this.playerBars = {};

    slots.forEach((player, index) => {
      if (player) {
        const baseX = 30 + (index * 260);
        const baseY = 20;

        // DIBUJAR LA CAJA DEL AVATAR (Arcade Pixel Style)
        const avatarGraphics = this.add.graphics();
        avatarGraphics.fillStyle(0x0a0a0a, 1); // Fondo muy oscuro
        avatarGraphics.fillRect(baseX, baseY, 60, 60);
        avatarGraphics.lineStyle(4, 0x3f3f46, 1); // Borde zinc-700
        avatarGraphics.strokeRect(baseX, baseY, 60, 60);

        // TEXTO DEL NOMBRE
        this.add.text(baseX + 75, baseY, player.username.toUpperCase(), {
          fontFamily: '"dogica", monospace',
          fontSize: '10px',
          fill: '#facc15', // yellow-400
          resolution: 2 // Para que el texto pequeño no se vea borroso
        });

        // BARRA DE VIDA 
        const hpBg = this.add.graphics();
        hpBg.fillStyle(0x27272a, 1); // zinc-800
        hpBg.fillRect(baseX + 75, baseY + 20, 140, 12);
        
        const hpFill = this.add.graphics();
        hpFill.fillStyle(0x22c55e, 1); // green-500
        hpFill.fillRect(baseX + 75, baseY + 20, 140, 12);

        // BARRA DE ENERGÍA/MANÁ
        const mpBg = this.add.graphics();
        mpBg.fillStyle(0x27272a, 1);
        mpBg.fillRect(baseX + 75, baseY + 38, 140, 10);

        const mpFill = this.add.graphics();
        mpFill.fillStyle(0x38bdf8, 1); // sky-400
        mpFill.fillRect(baseX + 75, baseY + 38, 140, 10);

        // Guardamos las referencias para actualizarlas cuando recibas daño
        this.playerBars[player.id] = { hpFill, baseX, baseY };
      }
    });

    // ESCUCHAR EL EVENTO DE DAÑO DESDE LA MAINSCENE
    const mainScene = this.scene.get("MainScene");
    mainScene.events.on("update_hp", ({ userId, hpPercent }) => {
        if (this.playerBars[userId]) {
            const { hpFill, baseX, baseY } = this.playerBars[userId];
            
            // Redibujamos la barra con el nuevo ancho (evitando que baje de 0)
            const newWidth = Math.max(0, 140 * hpPercent);
            
            hpFill.clear();
            hpFill.fillStyle(0x22c55e, 1);
            hpFill.fillRect(baseX + 75, baseY + 20, newWidth, 12);
        }
    });
  }
}