import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

// ÍCONOS SVG
const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);
const ChevronRight = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);
const ChevronLeft = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
);
const PlaceholderIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
);

// STACKED NOTIFICATIONS COMPONENT
const ToastNotification = ({ id, title, text, onRemove }) => {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setIsLeaving(true), 4000);
    const removeTimer = setTimeout(() => onRemove(id), 4500);
    return () => { clearTimeout(exitTimer); clearTimeout(removeTimer); };
  }, [id, onRemove]);

  return (
    <div className={`pointer-events-auto flex w-64 items-center gap-4 border border-zinc-800 bg-[#111] p-4 shadow-2xl transition-all duration-300
      ${isLeaving ? 'translate-x-12 opacity-0' : 'translate-x-0 opacity-100'}
    `}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center text-yellow-400">
        {title === 'XP OBTENIDA' ? <span className="text-xl font-bold">+</span> : <CheckIcon />}
      </div>
      <div className="flex flex-col flex-1">
        <span className="text-[10px] font-bold text-yellow-400 tracking-widest uppercase">{title}</span>
        <span className="text-[9px] text-zinc-300 uppercase">{text}</span>
      </div>
      <button onClick={() => { setIsLeaving(true); setTimeout(() => onRemove(id), 300); }} className="text-zinc-600 hover:text-white">
        ✕
      </button>
    </div>
  );
};

const API_URL = "https://fs-streets-of-lima-backend.onrender.com";

// COMPONENTE PRINCIPAL
export default function BattlePass() {
  // 🔥 NUEVO: Traemos 'setUser' para sincronizar con el Navbar
  const { user, setUser, token, triggerToast } = useAuth();
  
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [claimedFree, setClaimedFree] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🔥 NUEVO: Estados para notificaciones Stacked
  const [popups, setPopups] = useState([]);

  const xpNeeded = 1000;
  const totalLevels = 20;

  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const getAuthHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  }), [token]);

  // Función auxiliar para actualizar el Navbar global
  const updateGlobalUserLevel = useCallback((newLevel) => {
    if (user && user.battlePass?.level !== newLevel) {
      const updatedUser = { ...user, battlePass: { ...user.battlePass, level: newLevel } };
      setUser(updatedUser);
      localStorage.setItem("sol_user", JSON.stringify(updatedUser)); // Guarda para recargas
    }
  }, [user, setUser]);

  const removePopup = useCallback((id) => {
    setPopups(prev => prev.filter(p => p.id !== id));
  }, []);

  useEffect(() => {
    if (!token) return;
    const fetchProgress = async () => {
      try {
        const res = await fetch(`${API_URL}/battlepass`, { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          setLevel(data.level);
          setXp(data.xp);
          setClaimedFree(data.claimedLevels || []);
          updateGlobalUserLevel(data.level); // Sincroniza al cargar
        }
      } catch (error) {
        console.error("Error al cargar pase:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProgress();
  }, [token, getAuthHeaders, updateGlobalUserLevel]);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scrollByAmount = (amount) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const handleClaim = async (lvlToClaim, rewardText) => {
    if (!user) return triggerToast("DEBES INICIAR SESIÓN PARA RECLAMAR.");
    if (claimedFree.includes(lvlToClaim) || lvlToClaim > level) return;

    try {
      const res = await fetch(`${API_URL}/battlepass/claim`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ levelToClaim: lvlToClaim })
      });
      
    if (res.ok) {
        const data = await res.json();
        setClaimedFree(data.claimedLevels);
        
        // ACTUALIZAR EL USUARIO GLOBAL
        if (data.updatedUser) {
            const newUserObj = { ...user, ...data.updatedUser };
            setUser(newUserObj);
            localStorage.setItem("sol_user", JSON.stringify(newUserObj));
        }

        setPopups(prev => [...prev, { id: Date.now() + Math.random(), title: "RECLAMADO", text: rewardText }]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddXp = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/battlepass/dev-xp`, {
        method: "POST",
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setLevel(data.level);
        setXp(data.xp);
        updateGlobalUserLevel(data.level); // 🔥 Sincroniza Navbar en vivo al subir de nivel

        // 🔥 Lanza notificación Stacked
        setPopups(prev => [...prev, { id: Date.now() + Math.random(), title: "XP OBTENIDA", text: "250 XP" }]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const progressPercentage = Math.min((xp / xpNeeded) * 100, 100);

  if (isLoading) {
    return <div className="min-h-screen bg-[#0a0a0a] text-yellow-400 font-dogica flex items-center justify-center">CARGANDO PASE...</div>;
  }

  return (
    <div className="relative flex min-h-[90vh] w-full flex-col items-center pt-10 pb-20 bg-[#0a0a0a] font-dogica text-white uppercase tracking-widest overflow-hidden">
      
      {/* 🔥 CONTENEDOR DE NOTIFICACIONES STACKED */}
      <div className="pointer-events-none fixed right-6 top-[100px] z-[100] flex flex-col gap-3">
        {popups.map(popup => (
          <ToastNotification 
            key={popup.id} 
            id={popup.id} 
            title={popup.title}
            text={popup.text} 
            onRemove={removePopup} 
          />
        ))}
      </div>

      <div className="w-full max-w-5xl px-4 z-10">
        
        {/* BARRA SUPERIOR */}
        <div className="mb-8 flex flex-col lg:flex-row w-full items-center justify-between border border-zinc-800 bg-[#111] p-5 shadow-2xl gap-6">
          <div className="flex items-center gap-6 px-4">
            <span className="text-[10px] text-zinc-400">COMBO PASS<br/><span className="text-white text-sm">LEVEL</span></span>
            <span className="text-5xl text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">{level}</span>
          </div>
          
          <div className="flex flex-1 flex-col w-full px-4">
            <div className="mb-3 flex justify-between text-[10px]">
              <span className="text-yellow-400">EXPERIENCE</span>
              <span className="text-zinc-400">{xp} / {xpNeeded} XP</span>
            </div>
            <div className="h-4 w-full border border-zinc-800 bg-[#0a0a0a] p-[2px]">
              <div className="h-full bg-yellow-400 transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }} />
            </div>
          </div>
          
          <button className="whitespace-nowrap border-2 border-yellow-400 bg-yellow-400/10 px-6 py-4 text-[10px] text-yellow-400 transition-all hover:bg-yellow-400 hover:text-black hover:shadow-[0_0_15px_rgba(250,204,21,0.5)]">
            [ COMPRAR NIVEL ]
          </button>
        </div>

        {/* CUADRÍCULA DEL PASE */}
        <div className="relative flex w-full border border-zinc-800 bg-[#111] shadow-2xl">
          <div className="relative z-30 flex w-16 shrink-0 flex-col bg-[#0a0a0a] border-r border-zinc-800">
            <div className="h-12 w-full border-b border-zinc-800"></div>
            <div className="flex h-40 flex-1 items-center justify-center border-b border-zinc-800">
              <span className="text-[10px] text-zinc-500" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>FREE ROW</span>
            </div>
            <div className="flex h-40 flex-1 items-center justify-center">
              <span className="text-[10px] text-yellow-600" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>PREMIUM</span>
            </div>
          </div>

          <div className="relative flex flex-1 overflow-hidden">
            {canScrollLeft && (
              <button onClick={() => scrollByAmount(-300)} className="absolute left-0 top-0 bottom-0 z-20 flex w-12 items-center justify-center bg-gradient-to-r from-[#111] to-transparent text-yellow-400 hover:text-white transition-colors">
                <ChevronLeft />
              </button>
            )}
            {canScrollRight && (
              <button onClick={() => scrollByAmount(300)} className="absolute right-0 top-0 bottom-0 z-20 flex w-12 items-center justify-center bg-gradient-to-l from-[#111] to-transparent text-yellow-400 hover:text-white transition-colors">
                <ChevronRight />
              </button>
            )}

            <div ref={scrollContainerRef} onScroll={checkScroll} className="flex w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex min-w-max">
                {Array.from({ length: totalLevels }).map((_, i) => {
                  const currentLvl = i + 1;
                  const isUnlocked = currentLvl <= level;
                  const isFreeClaimed = claimedFree.includes(currentLvl);
                  const canClaimFree = isUnlocked && !isFreeClaimed;

                  let rewardText = "+1 SKILL PT";
                  if ([5, 10, 15].includes(currentLvl)) rewardText = "+15% XP (2H)";
                  else if (currentLvl === 20) rewardText = "+20% XP (2H)";
                  else if ([3, 6, 9, 12].includes(currentLvl)) rewardText = "100 SUNNYS";
                  else if ([14, 16, 19].includes(currentLvl)) rewardText = "150 SUNNYS";
                  else if (currentLvl === 18) rewardText = "CUY AVATAR";

                  return (
                    <div key={currentLvl} className="flex w-32 flex-col border-r border-zinc-800 bg-[#0a0a0a]">
                      
                      <div className={`flex h-12 w-full items-center justify-center border-b border-zinc-800 ${isUnlocked ? 'bg-yellow-400/10 text-yellow-400' : 'bg-[#111] text-zinc-600'}`}>
                        <span className="text-[10px]">LVL {currentLvl}</span>
                      </div>

                      <div className="flex h-40 flex-col items-center justify-center border-b border-zinc-800 p-3">
                        <div 
                          onClick={() => canClaimFree && handleClaim(currentLvl, rewardText)}
                          className={`flex h-full w-full flex-col border p-2 transition-all duration-300 items-center justify-center text-center
                            ${!isUnlocked ? 'border-zinc-800 bg-[#0a0a0a] text-zinc-700' : ''} 
                            ${canClaimFree ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400 cursor-pointer hover:bg-yellow-400 hover:text-black shadow-[0_0_15px_rgba(250,204,21,0.3)]' : ''}
                            ${isFreeClaimed ? 'border-green-500/50 bg-green-500/10 text-green-500' : ''}
                          `}
                        >
                          <div className="mb-2">
                            {isFreeClaimed ? <CheckIcon /> : <PlaceholderIcon />}
                          </div>
                          <span className="text-[7px] leading-tight">{rewardText}</span>
                        </div>
                      </div>

                      <div className="flex h-40 flex-col items-center justify-center p-3 bg-[#111]">
                        <div className={`flex h-full w-full flex-col border border-zinc-800 bg-[#0a0a0a] p-2 items-center justify-center text-center opacity-40`}>
                          <div className="absolute right-3 top-3 text-zinc-600">
                            <LockIcon />
                          </div>
                          <div className="mb-2 text-yellow-700">
                            <PlaceholderIcon />
                          </div>
                          <span className="text-[7px] text-yellow-700">PREMIUM ITEM</span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <button onClick={handleAddXp} className="border border-zinc-700 px-6 py-3 text-[10px] text-zinc-400 transition-colors hover:border-yellow-400 hover:text-yellow-400 hover:bg-yellow-400/10">
            [ DEV: SIMULAR +250 XP ]
          </button>
        </div>

      </div>
    </div>
  );
}