import { useEffect, useRef } from "react";
import * as Phaser from "phaser"; 
import { useLobby } from "../../context/LobbyContext";
import { useAuth } from "../../context/AuthContext";
import MainScene from "./scenes/MainScene";

export default function GameWindow() {
  const gameRef = useRef(null);
  const { slots } = useLobby(); 
  const { socket, user } = useAuth(); 

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 1280,
      height: 720,
      parent: gameRef.current,
      pixelArt: true, 
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

    game.registry.set('slots', slots);
    game.registry.set('socket', socket);
    
    // 🔥 Añadimos validación por seguridad
    if (user && user.id) {
        game.registry.set('myId', user.id); 
    }

    return () => {
      game.destroy(true);
    };
  }, [slots, socket, user]);

  return (
    <div className="w-full flex justify-center py-10">
        <div ref={gameRef} className="border-4 border-zinc-800 shadow-[0_0_30px_rgba(250,204,21,0.2)]" />
    </div>
  );
}