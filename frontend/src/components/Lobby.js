import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLobby } from '../context/LobbyContext'; 
import GameWindow from '../game/GameWindow';
import logoStreet from '../assets/Logo_StreetsOfLima.png';
import faceSprite from '../assets/FaceSprite.png';
import idleGif from '../assets/PlaceholderPersonajeIdle.gif';

export default function Lobby() {
    const { user, socket, token, setUser, triggerToast, setIsProfileOpen } = useAuth();
    const { slots } = useLobby(); 
    const [isSkillTreeOpen, setIsSkillTreeOpen] = useState(false);

    const [isPlaying, setIsPlaying] = useState(false);
    const [amIReady, setAmIReady] = useState(false);

    //  Estado del ranking global
    const [leaderboard, setLeaderboard] = useState([]);

    const isHost = slots[0]?.id === user?.id;
    const guests = slots.filter(s => s && !s.isHost);
    const allReady = guests.length > 0 ? guests.every(s => s.isReady) : true;

    //  Efecto para cargar el Leaderboard al entrar al Lobby
    useEffect(() => {
        // Cargar el Ranking Global
        fetch("https://fs-streets-of-lima-backend.onrender.com/auth/leaderboard")
            .then(res => res.json())
            .then(data => setLeaderboard(data))
            .catch(err => console.error("Error cargando ranking:", err));

        // Refrescar tu perfil en silencio para igualar las horas del Ranking
        if (token) {
            fetch("https://fs-streets-of-lima-backend.onrender.com/auth/me", {
                headers: { "Authorization": `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => {
                if (!data.error) {
                    setUser(data);
                    localStorage.setItem("sol_user", JSON.stringify(data));
                }
            })
            .catch(err => console.error("Error actualizando perfil:", err));
        }
    }, [token, setUser]);

    //  Convertidor de segundos a Horas y Minutos
    const formatTime = (seconds) => {
        if (!seconds) return "0h 0m";
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    useEffect(() => {
        if (!socket) return;
        const handleStart = () => setIsPlaying(true);
        const handleReturn = () => setIsPlaying(false); // Función para salir
        
        socket.on("lobby:game_started", handleStart);
        socket.on("game:return_lobby", handleReturn);   // Escuchar al servidor
        
        return () => {
            socket.off("lobby:game_started", handleStart);
            socket.off("game:return_lobby", handleReturn);
        };
    }, [socket]);

    const handleProtectedAction = (action) => {
        if (!user) return triggerToast("LOG IN TO UNLOCK THIS FEATURE!");
        if (action === "skills") setIsSkillTreeOpen(!isSkillTreeOpen);
        if (action === "invite") setIsProfileOpen(true); 
    };

    // Función para comprar habilidades
    const handleBuySkill = async (skillId, cost) => {
        if (!user) return triggerToast("DEBES INICIAR SESIÓN");
        if (user.skillPoints < cost) return triggerToast("PUNTOS INSUFICIENTES");

        try {
            const res = await fetch(`https://fs-streets-of-lima-backend.onrender.com/auth/buy-skill`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ skillId, cost })
            });
            if (res.ok) {
                const updatedUser = await res.json();
                setUser({ ...user, ...updatedUser }); // Actualiza todo el entorno visual
                localStorage.setItem("sol_user", JSON.stringify({ ...user, ...updatedUser }));
                triggerToast("¡HABILIDAD DESBLOQUEADA!");
            } else {
                const err = await res.json();
                triggerToast(err.error);
            }
        } catch (e) { console.error(e); }
    };

    // Para saber fácilmente si ya las compramos:
    const hasDash = user?.unlockedSkills?.includes('DASH');
    const hasHeavy = user?.unlockedSkills?.includes('HEAVY');

    const handleMainButton = () => {
        if (!user) return triggerToast("LOG IN TO PLAY!");

        if (isHost) {
            if (allReady) {
                socket.emit("lobby:start_game"); // Dá la orden a todos
            } else {
                triggerToast("ESPERANDO A QUE TODOS ESTÉN LISTOS");
            }
        } else {
            // Si soy un amigo, me pongo ready o cancelo el ready
            const newStatus = !amIReady;
            setAmIReady(newStatus);
            socket.emit("lobby:ready", { isReady: newStatus });
        }
    };

    if (isPlaying) {
        return (
            <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
                <button 
                    onClick={() => setIsPlaying(false)}
                    className="absolute top-6 left-6 text-red-500 font-dogica border border-red-500 bg-black/50 px-4 py-2 hover:bg-red-500 hover:text-black z-50 transition-all text-[10px] tracking-widest"
                >
                    &lt; LEAVE GAME
                </button>
                <GameWindow onLeave={() => setIsPlaying(false)} />
            </div>
        );
    }

    return (
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-8 mb-16">
            
            <div className="col-span-1 bg-[#111] border border-zinc-800 rounded p-4 shadow-2xl flex flex-col h-[500px]">
                <h2 className="text-yellow-400 text-sm mb-4 text-center tracking-widest border-b border-zinc-800 pb-2">GLOBAL RANKING</h2>
                
                {/*  GLOBAL RANKING DINÁMICO */}
                <div className="flex flex-col gap-3 overflow-y-auto pr-2">
                    {leaderboard.length === 0 ? (
                        <div className="text-[10px] text-zinc-500 text-center tracking-widest py-4">CARGANDO...</div>
                    ) : (
                        leaderboard.map((player, index) => (
                            <div 
                                key={player.id} 
                                className={`flex items-center justify-between bg-[#1a1a1a] p-2 rounded border ${index === 0 ? 'border-yellow-500/30' : 'border-zinc-800'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className={`${index === 0 ? 'text-yellow-500' : 'text-zinc-400'} text-xs`}>
                                        #{index + 1}
                                    </span>
                                    <img src={faceSprite} alt="face" className="w-6 h-6 rendering-pixelated bg-zinc-800 rounded border border-zinc-600" />
                                    <span className={`text-[9px] ${index === 0 ? 'text-white' : 'text-zinc-300'}`}>
                                        {player.username}
                                    </span>
                                </div>
                                <span className={`text-[9px] ${index === 0 ? 'text-zinc-400' : 'text-zinc-500'} lowercase`}>
                                    {formatTime(player.totalPlaySeconds)}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="col-span-1 lg:col-span-2 flex flex-col items-center justify-center">
                <img src={logoStreet} alt="Streets of Lima" className="w-full max-w-[350px] object-contain mb-8 filter drop-shadow-[0_0_15px_rgba(255,220,50,0.2)]" />
                
                <div className="mb-6 w-full max-w-[300px]">
                    {!user ? (
                        <input type="text" placeholder="ENTER GUEST NAME" maxLength={10} className="w-full bg-[#111] border-b-2 border-zinc-700 px-4 py-3 text-center text-xs text-white outline-none focus:border-yellow-400 uppercase tracking-widest font-sans" />
                    ) : (
                        <div className="text-center text-yellow-300 text-xl tracking-widest uppercase">{user.username}</div>
                    )}
                </div>

                <div className="flex gap-4 mb-10">
                    {slots.map((player, index) => {
                        if (player) {
                            return (
                                <div key={index} className="w-16 h-16 md:w-20 md:h-20 bg-zinc-800 border-2 border-yellow-400 rounded flex items-center justify-center relative shadow-[0_0_15px_rgba(255,220,50,0.3)]">
                                    <img src={faceSprite} alt={player.username} className="w-full h-full object-cover rendering-pixelated" />
                                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[8px] px-1 rounded">P{index + 1}</div>
                                    <div className="absolute -bottom-5 text-[8px] text-yellow-400 tracking-widest uppercase truncate w-full text-center">{player.username}</div>
                                    
                                    {/*  EL CHECK DE READY VERDE */}
                                    {player.isReady && (
                                        <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center border-2 border-[#111] shadow-[0_0_10px_rgba(34,197,94,0.6)]">
                                            <span className="text-black text-[10px] font-bold">✔</span>
                                        </div>
                                    )}
                                </div>
                            );
                        } else {
                            return (
                                <button key={index} onClick={() => handleProtectedAction("invite")} className="w-16 h-16 md:w-20 md:h-20 bg-[#111] border-2 border-dashed border-zinc-700 hover:border-zinc-500 rounded flex items-center justify-center text-zinc-600 hover:text-white transition-colors relative group">
                                    <span className="text-2xl group-hover:scale-125 transition-transform">+</span>
                                    <div className="absolute -top-2 -right-2 bg-zinc-800 text-zinc-500 text-[8px] px-1 rounded border border-zinc-700">P{index + 1}</div>
                                </button>
                            );
                        }
                    })}
                </div>
                <button 
                    onClick={handleMainButton}
                    className={`px-12 py-4 text-xl tracking-[0.2em] rounded transition-all ${
                        isHost 
                        ? (allReady ? "bg-yellow-400 hover:bg-yellow-300 text-black active:scale-95 shadow-[0_0_20px_rgba(255,220,50,0.4)]" : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700")
                        : (amIReady ? "bg-green-500 hover:bg-green-400 text-black active:scale-95 shadow-[0_0_20px_rgba(34,197,94,0.4)]" : "bg-yellow-400 hover:bg-yellow-300 text-black active:scale-95 shadow-[0_0_20px_rgba(255,220,50,0.4)]")
                    }`}
                >
                    {isHost ? "PLAY" : (amIReady ? "CANCEL READY" : "READY")}
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

                <div className="w-full mt-6 bg-[#111] border border-zinc-800 p-4">
                    <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => handleProtectedAction("skills")}>
                        <span className="text-zinc-300 text-xs tracking-widest">SKILL TREE</span>
                        <span className="text-yellow-400">▼</span>
                    </div>

                    {isSkillTreeOpen && (
                        <div className="flex flex-col gap-3"> 
                            
                            <div className="text-[10px] text-zinc-500 mb-2">
                                AVAILABLE POINTS: {user?.skillPoints || 0}
                            </div>
                            
                            <button 
                                onClick={() => !hasDash && handleBuySkill('DASH', 1)}
                                className={`py-3 text-[10px] tracking-widest text-left px-4 transition-colors border ${hasDash ? 'bg-yellow-400/20 border-yellow-400 text-yellow-400 cursor-default' : 'bg-zinc-900 border-zinc-700 hover:border-yellow-400 text-zinc-400 hover:text-yellow-400 cursor-pointer'}`}
                            >
                                {hasDash ? '[✔] DASH MASTERY' : '[1 PT] DASH MASTERY'}
                            </button>

                            <button 
                                onClick={() => !hasHeavy && handleBuySkill('HEAVY', 3)}
                                className={`py-3 text-[10px] tracking-widest text-left px-4 transition-colors border ${hasHeavy ? 'bg-yellow-400/20 border-yellow-400 text-yellow-400 cursor-default' : 'bg-zinc-900 border-zinc-700 hover:border-yellow-400 text-zinc-400 hover:text-yellow-400 cursor-pointer'}`}
                            >
                                {hasHeavy ? '[✔] HEAVY PUNCH' : '[3 PT] HEAVY PUNCH'}
                            </button>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}