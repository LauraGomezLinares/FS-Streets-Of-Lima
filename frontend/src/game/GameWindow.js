import { useEffect, useRef } from "react";
import * as Phaser from "phaser";
import { useLobby } from "../../context/LobbyContext";
import { useAuth } from "../../context/AuthContext";
import MainScene from "./scenes/MainScene";

export default function GameWindow() {
  const gameRef = useRef(null);
  const { slots } = useLobby(); // Array con los jugadores [Nat, Prueba67, null, null]
  const { socket } = useAuth(); // Para emitir golpes y movimientos

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 1280,
      height: 720,
      parent: gameRef.current,
      pixelArt: true, // Para que el pixel art no se vea borroso
      backgroundColor: '#0a0a0a',
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 0 }, 
          debug: true
        }
      },
      scene: [MainScene]
    };

    const game = new Phaser.Game(config);

    // Pasamos los datos de React al motor del juego
    game.registry.set('slots', slots);
    game.registry.set('socket', socket);

    // Destruye el juego limpiamente si sales de la página
    return () => {
      game.destroy(true);
    };
  }, [slots, socket]);

  return (
    <div className="w-full flex justify-center py-10">
        {/* El div donde Phaser inyectará el juego */}
        <div ref={gameRef} className="border-4 border-zinc-800 shadow-[0_0_30px_rgba(250,204,21,0.2)]" />
    </div>
  );
}