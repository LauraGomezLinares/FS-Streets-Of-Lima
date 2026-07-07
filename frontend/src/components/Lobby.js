import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLobby } from '../context/LobbyContext'; 
import GameWindow from '../game/GameWindow';
import logoStreet from '../assets/Logo_StreetsOfLima.png';
import faceSprite from '../assets/FaceSprite.png';
import idleGif from '../assets/PlaceholderPersonajeIdle.gif';

export default function Lobby() {
    const { user, triggerToast, setIsProfileOpen } = useAuth();
    const { slots } = useLobby(); 
    const [isSkillTreeOpen, setIsSkillTreeOpen] = useState(false);

    const [isPlaying, setIsPlaying] = useState(false);

    // Funciones bloqueadas para invitados
    const handleProtectedAction = (action) => {
        if (!user) {
            triggerToast("LOG IN TO UNLOCK THIS FEATURE!");
            return;
        }
        if (action === "skills") setIsSkillTreeOpen(!isSkillTreeOpen);
        if (action === "invite") setIsProfileOpen(true); 

        if (action === "play") setIsPlaying(true);
    };

    if (isPlaying) {
        return (
            <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
                {/* Botón para salir del juego y volver al lobby */}
                <button 
                    onClick={() => setIsPlaying(false)}
                    className="absolute top-6 left-6 text-red-500 font-dogica border border-red-500 bg-black/50 px-4 py-2 hover:bg-red-500 hover:text-black z-50 transition-all text-xs"
                >
                    &lt; LEAVE GAME
                </button>
                <GameWindow />
            </div>
        );
    }

    return (
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-8 mb-16">
            
            <div className="col-span-1 bg-[#111] border border-zinc-800 rounded p-4 shadow-2xl flex flex-col h-[500px]">
                <h2 className="text-yellow-400 text-sm mb-4 text-center tracking-widest border-b border-zinc-800 pb-2">GLOBAL RANKING</h2>
                <div className="flex flex-col gap-3 overflow-y-auto pr-2">
                    <div className="flex items-center justify-between bg-[#1a1a1a] p-2 rounded border border-yellow-500/30">
                        <div className="flex items-center gap-2">
                            <span className="text-yellow-500 text-xs">#1</span>
                            <img src={faceSprite} alt="face" className="w-6 h-6 rendering-pixelated bg-zinc-800 rounded border border-zinc-600" />
                            <span className="text-[9px] text-white">GSon</span>
                        </div>
                        <span className="text-[9px] text-zinc-400">9999 pts</span>
                    </div>
                    <div className="flex items-center justify-between bg-[#1a1a1a] p-2 rounded border border-zinc-800">
                        <div className="flex items-center gap-2">
                            <span className="text-zinc-400 text-xs">#2</span>
                            <img src={faceSprite} alt="face" className="w-6 h-6 rendering-pixelated bg-zinc-800 rounded border border-zinc-600" />
                            <span className="text-[9px] text-zinc-300">Natalia</span>
                        </div>
                        <span className="text-[9px] text-zinc-500">8500 pts</span>
                    </div>
                    <div className="flex items-center justify-between bg-[#1a1a1a] p-2 rounded border border-zinc-800">
                        <div className="flex items-center gap-2">
                            <span className="text-zinc-400 text-xs">#3</span>
                            <img src={faceSprite} alt="face" className="w-6 h-6 rendering-pixelated bg-zinc-800 rounded border border-zinc-600" />
                            <span className="text-[9px] text-zinc-300">CEGGAX</span>
                        </div>
                        <span className="text-[9px] text-zinc-500">7200 pts</span>
                    </div>
                </div>
            </div>

            <div className="col-span-1 lg:col-span-2 flex flex-col items-center justify-center">
                <img src={logoStreet} alt="Streets of Lima" className="w-full max-w-[350px] object-contain mb-8 filter drop-shadow-[0_0_15px_rgba(255,220,50,0.2)]" />
                
                <div className="mb-6 w-full max-w-[300px]">
                    {!user ? (
                        <input 
                            type="text" 
                            placeholder="ENTER GUEST NAME" 
                            maxLength={10}
                            className="w-full bg-[#111] border-b-2 border-zinc-700 px-4 py-3 text-center text-xs text-white outline-none focus:border-yellow-400 uppercase tracking-widest font-sans"
                        />
                    ) : (
                        <div className="text-center text-yellow-300 text-xl tracking-widest uppercase">
                            {user.username}
                        </div>
                    )}
                </div>

                <div className="flex gap-4 mb-10">
                    {slots.map((player, index) => {
                        if (player) {
                            return (
                                /* SLOT OCUPADO */
                                <div key={index} className="w-16 h-16 md:w-20 md:h-20 bg-zinc-800 border-2 border-yellow-400 rounded flex items-center justify-center relative shadow-[0_0_15px_rgba(255,220,50,0.3)]">
                                    <img src={faceSprite} alt={player.username} className="w-full h-full object-cover rendering-pixelated" />
                                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[8px] px-1 rounded">P{index + 1}</div>
                                    <div className="absolute -bottom-5 text-[8px] text-yellow-400 tracking-widest uppercase truncate w-full text-center">{player.username}</div>
                                </div>
                            );
                        } else {
                            return (
                                /* SLOT VACÍO */
                                <button 
                                    key={index}
                                    onClick={() => handleProtectedAction("invite")}
                                    className="w-16 h-16 md:w-20 md:h-20 bg-[#111] border-2 border-dashed border-zinc-700 hover:border-zinc-500 rounded flex items-center justify-center text-zinc-600 hover:text-white transition-colors relative group"
                                >
                                    <span className="text-2xl group-hover:scale-125 transition-transform">+</span>
                                    <div className="absolute -top-2 -right-2 bg-zinc-800 text-zinc-500 text-[8px] px-1 rounded border border-zinc-700">P{index + 1}</div>
                                </button>
                            );
                        }
                    })}
                </div>

                <button onClick={() => handleProtectedAction("play")} 
                className="bg-yellow-400 hover:bg-yellow-300 text-black px-12 py-4 text-xl tracking-[0.2em] rounded transition-all active:scale-95 shadow-[0_0_20px_rgba(255,220,50,0.4)]">
                PLAY
                </button>
            </div>

            <div className="col-span-1 flex flex-col items-center justify-start pt-4">
                <div className="mb-3 text-center z-20">
                    <span className="text-[11px] text-zinc-300 tracking-widest uppercase bg-[#111] border border-zinc-700 px-4 py-1.5 rounded-full shadow-md">
                        {user ? "ROLDAN" : "GUEST CHAR"}
                    </span>
                </div>

                <div className="w-full max-w-[250px] aspect-[3/4] bg-[#111] border border-zinc-800 rounded relative mb-4 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,220,50,0.15)_0%,transparent_60%)] z-0" />
                    <img src={idleGif} alt="Idle Character" className="relative z-10 w-full h-full object-contain rendering-pixelated filter drop-shadow-[0_0_15px_rgba(255,220,50,0.3)]" />
                </div>

                <div className="w-full max-w-[250px]">
                    <button 
                        onClick={() => handleProtectedAction("skills")}
                        className="w-full bg-zinc-900 border border-zinc-700 hover:border-yellow-400 text-zinc-300 text-[10px] py-3 tracking-widest transition-colors flex justify-between px-4 items-center rounded"
                    >
                        <span>SKILL TREE</span>
                        <span className="text-yellow-400">{isSkillTreeOpen ? "▼" : "▶"}</span>
                    </button>

                    {isSkillTreeOpen && user && (
                        <div className="w-full bg-[#111] border border-zinc-800 border-t-0 p-3 rounded-b flex flex-col gap-2">
                            <div className="text-[8px] text-zinc-500 tracking-widest mb-1">AVAILABLE POINTS: 3</div>
                            <button className="bg-zinc-800 border border-zinc-600 text-[9px] p-2 hover:border-yellow-400 text-left">[+] DASH MASTERY</button>
                            <button className="bg-zinc-800 border border-zinc-600 text-[9px] p-2 hover:border-yellow-400 text-left">[+] HEAVY PUNCH</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}