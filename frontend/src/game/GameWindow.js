import { useEffect, useRef, useState } from "react";
import * as Phaser from "phaser"; 
import { useLobby } from "../context/LobbyContext";
import { useAuth } from "../context/AuthContext";
import MainScene from "./scenes/MainScene";
import UIScene from "./scenes/UIScene";

// RECIBIMOS ONLEAVE DESDE EL LOBBY
export default function GameWindow({ onLeave }) {
  const gameRef = useRef(null);
  const { slots } = useLobby(); 
  const { socket, user } = useAuth(); 

  // ESTADOS PARA EL GAME OVER Y VOTACIONES
  const [isGameOver, setIsGameOver] = useState(false);
  const [votes, setVotes] = useState([]);

  // Variables útiles para saber cuántos somos y si soy el host
  const activePlayersCount = slots.filter(p => p !== null).length;
  const isHost = slots[0]?.id === user?.id;

  useEffect(() => {
    const config = {
      type: Phaser.AUTO, width: 1280, height: 720,
      parent: gameRef.current, pixelArt: true, backgroundColor: '#0a0a0a',
      physics: { default: "arcade", arcade: { gravity: { y: 0 }, debug: true } },
      scene: [MainScene, UIScene]
    };

    const game = new Phaser.Game(config);

    game.registry.set('slots', slots);
    game.registry.set('socket', socket);
    if (user && user.id) game.registry.set('myId', user.id); 
    
    // PASAMOS LA FUNCIÓN A PHASER: Así Phaser puede activar el Game Over en React
    game.registry.set('setGameOver', setIsGameOver); 

    // FUNCIONES DE REINICIO POR RED
    const handleVote = (data) => setVotes(prev => [...new Set([...prev, data.userId])]);
    
    const handleRestart = () => {
        setIsGameOver(false);
        setVotes([]);
        // Reiniciamos ambas escenas de Phaser desde cero
        const mainScene = game.scene.getScene('MainScene');
        if (mainScene) mainScene.scene.restart();
        const uiScene = game.scene.getScene('UIScene');
        if (uiScene) uiScene.scene.restart();
    };

    if (socket) {
        socket.on("game:vote_restart", handleVote);
        socket.on("game:do_restart", handleRestart);
    }

    return () => {
      if (socket) {
          socket.off("game:vote_restart", handleVote);
          socket.off("game:do_restart", handleRestart);
      }
      game.destroy(true);
    };
  }, [slots, socket, user]); 

  // INTERACCIONES DE BOTONES
  const handleVoteClick = () => {
      if (socket) socket.emit("game:vote_restart", { userId: user.id });
      setVotes(prev => [...new Set([...prev, user.id])]); 
  };

  const handleForceRestart = () => {
      if (socket) socket.emit("game:do_restart"); // Avisa a los amigos
      
      // Me reinicio a mí mismo localmente también
      setIsGameOver(false);
      setVotes([]);
      const game = gameRef.current.querySelector('canvas')?.parentElement?.__Phaser; // Hack de seguridad
      if(game) { }
  };

  const handleReturnLobby = () => {
      if (socket) socket.emit("game:return_lobby");
      onLeave(); // Salgo yo localmente
  };

  const hasVoted = votes.includes(user?.id);
  const allVoted = votes.length >= activePlayersCount;

  return (
    <div className="relative w-full flex justify-center py-10 font-dogica">
        <div ref={gameRef} className="border-4 border-zinc-800 shadow-[0_0_30px_rgba(250,204,21,0.2)]" />
        
        {/* PANTALLA DE GAME OVER */}
        {isGameOver && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="flex flex-col items-center p-12 bg-[#111] border-2 border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.5)] rounded text-center">
                    
                    <h2 className="text-5xl text-red-500 mb-8 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)] tracking-widest">
                        GAME OVER
                    </h2>
                    
                    {/* SI ESTÁS JUGANDO SOLO */}
                    {activePlayersCount === 1 ? (
                        <button onClick={handleForceRestart} className="bg-yellow-400 hover:bg-yellow-300 text-black px-10 py-4 mb-6 rounded text-sm transition-all shadow-[0_0_15px_rgba(250,204,21,0.4)]">
                            REINICIAR
                        </button>
                    ) : (
                    /* SI ESTÁS EN MULTIJUGADOR */
                        <div className="flex flex-col items-center mb-6 w-full">
                            {isHost && allVoted ? (
                                <button onClick={handleForceRestart} className="bg-yellow-400 hover:bg-yellow-300 text-black px-10 py-4 rounded text-sm transition-all animate-pulse shadow-[0_0_15px_rgba(250,204,21,0.6)]">
                                    [ REINICIAR EQUIPO ]
                                </button>
                            ) : (
                                <button 
                                    onClick={handleVoteClick} 
                                    disabled={hasVoted}
                                    className={`px-10 py-4 rounded text-xs transition-all tracking-widest ${
                                        hasVoted ? 'bg-green-600 text-black shadow-[0_0_15px_rgba(22,163,74,0.5)]' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-600'
                                    }`}
                                >
                                    {hasVoted ? 'VOTO REGISTRADO' : 'VOTAR REINICIO'}
                                </button>
                            )}
                            <span className="text-[10px] text-zinc-500 mt-4 tracking-widest">
                                {votes.length} / {activePlayersCount} VOTOS
                            </span>
                        </div>
                    )}

                    <button onClick={handleReturnLobby} className="text-zinc-500 hover:text-white text-[10px] border border-zinc-800 hover:border-zinc-500 px-6 py-3 rounded transition-all mt-4 tracking-widest uppercase">
                        VOLVER AL LOBBY
                    </button>
                </div>
            </div>
        )}
    </div>
  );
}