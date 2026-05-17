import { useState, useRef, useEffect, useCallback } from "react";

// svg icons
const CheckIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);
const ChevronRight = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);
const ChevronLeft = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
);
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

// NUEVO: Ícono Placeholder genérico
const PlaceholderIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
);

// componente de notificación individual
const ToastNotification = ({ id, text, onRemove }) => {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setIsLeaving(true), 4500);
    const removeTimer = setTimeout(() => onRemove(id), 5000);
    return () => { clearTimeout(exitTimer); clearTimeout(removeTimer); };
  }, [id, onRemove]);

  const handleManualClose = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(id), 500);
  };

  return (
    <div 
      className={`pointer-events-auto flex w-64 items-center gap-4 rounded-lg border border-zinc-700 bg-[#1e1e1e] p-4 shadow-[0_4px_25px_rgba(0,0,0,0.5)] transition-all duration-500
        ${isLeaving ? '-translate-x-12 opacity-0' : 'animate-in slide-in-from-right-8 fade-in'}
      `}
    >
      {/* placeholder img */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-zinc-700 text-zinc-400">
        <PlaceholderIcon />
      </div>
      <div className="flex flex-col flex-1">
        <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">¡Reclamado!</span>
        <span className="text-sm text-zinc-200">+{text}</span>
      </div>
      <button onClick={handleManualClose} className="text-zinc-500 hover:text-white transition-colors">
        <CloseIcon />
      </button>
    </div>
  );
};

// main comp
export default function BattlePass() {
  const [level, setLevel] = useState(4);
  const [xp, setXp] = useState(450);
  
  const [claimedFree, setClaimedFree] = useState([]);
  const [popups, setPopups] = useState([]);

  const xpNeeded = 1000;
  const totalLevels = 20;

  // Scroll horizontal
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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

  const handleAddXp = () => {
    if (level >= totalLevels) return;
    const newXp = xp + 250;
    if (newXp >= xpNeeded) {
      setLevel((prev) => prev + 1);
      setXp(newXp - xpNeeded);
    } else {
      setXp(newXp);
    }
  };

  const handleBuyLevel = () => {
    if (level < totalLevels) setLevel((prev) => prev + 1);
  };

  const handleClaim = (lvl, rewardText) => {
    if (claimedFree.includes(lvl)) return;
    setClaimedFree(prev => [...prev, lvl]);

    const newPopup = { id: Date.now() + Math.random(), text: rewardText };
    setPopups(prev => [...prev, newPopup]);
  };

  const removePopup = useCallback((id) => {
    setPopups(prev => prev.filter(p => p.id !== id));
  }, []);

  const progressPercentage = Math.min((xp / xpNeeded) * 100, 100);

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center pt-10 font-sans text-white">
      
      {/* notificaciones stacked */}
      <div className="pointer-events-none fixed right-6 top-6 z-50 flex flex-col gap-3">
        {popups.map(popup => (
          <ToastNotification 
            key={popup.id} 
            id={popup.id} 
            text={popup.text} 
            onRemove={removePopup} 
          />
        ))}
      </div>

      <div className="w-full max-w-5xl px-4">
        
        {/* barra superior */}
        <div className="mb-6 flex w-full items-center justify-between rounded-[24px] bg-[#2a2826] p-2 shadow-lg">
          <div className="flex items-center gap-4 border-r border-zinc-600 px-6 py-2">
            <span className="text-xl tracking-wide text-zinc-300 font-serif">BP Level</span>
            <span className="text-4xl font-serif text-white">{level}</span>
          </div>
          <div className="flex flex-1 flex-col justify-center px-8">
            <div className="mb-1 flex gap-2 text-sm font-medium font-dogica">
              <span className="text-[#d4af37]">XP</span>
              <span className="text-zinc-300 text-xs">{xp}/{xpNeeded}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#404040]">
              <div className="h-full bg-[#e5c158] transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }} />
            </div>
          </div>
          <button onClick={handleBuyLevel} disabled={level >= totalLevels} className="rounded-xl bg-[#bda054] px-6 py-4 font-dogica text-xs font-bold text-black transition hover:bg-[#d4b768] active:scale-95 disabled:opacity-50">
            Comprar nivel
          </button>
        </div>

        {/* cuadricula del pase */}
        <div className="relative flex w-full overflow-hidden rounded-2xl bg-[#222] shadow-2xl border border-zinc-800">
          
          <div className="relative z-30 flex w-16 shrink-0 flex-col bg-[#2b2826] shadow-[4px_0_15px_rgba(0,0,0,0.5)]">
            <div className="h-12 w-full border-b border-zinc-700/50 bg-[#333]"></div>
            <div className="flex h-44 flex-1 items-center justify-center border-b-[6px] border-[#1a1a1a]">
              <span className="text-sm font-dogica tracking-widest text-white" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Free</span>
            </div>
            <div className="flex h-44 flex-1 items-center justify-center">
              <span className="text-sm font-dogica tracking-widest text-white" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Premium</span>
            </div>
          </div>

          <div className="relative flex flex-1 overflow-hidden">
            {canScrollLeft && <button onClick={() => scrollByAmount(-300)} className="absolute left-0 top-0 bottom-0 z-20 flex w-16 items-center justify-center bg-gradient-to-r from-black/90 to-transparent transition-opacity hover:opacity-80"><ChevronLeft /></button>}
            {canScrollRight && (
              <>
                <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-24 bg-gradient-to-l from-black/80 to-transparent"></div>
                <button onClick={() => scrollByAmount(300)} className="absolute right-0 top-0 bottom-0 z-20 flex w-16 items-center justify-center transition-transform hover:scale-110"><ChevronRight /></button>
              </>
            )}

            <div ref={scrollContainerRef} onScroll={checkScroll} className="flex w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex min-w-max">
                {Array.from({ length: totalLevels }).map((_, i) => {
                  const currentLvl = i + 1;
                  const isUnlocked = currentLvl <= level;
                  
                  // alternar texto siendo par o impar para simular diferentes recompensas
                  const isEvenLevel = currentLvl % 2 === 0;
                  const rewardText = isEvenLevel ? '1x HP bottle' : '2x boost';

                  const isFreeClaimed = claimedFree.includes(currentLvl);
                  const canClaimFree = isUnlocked && !isFreeClaimed;

                  return (
                    <div key={currentLvl} className="flex w-32 flex-col border-r border-zinc-700/30">
                      
                      <div className="flex h-12 w-full items-center justify-center border-b border-zinc-700/50 bg-[#3a3a3a]">
                        <span className="text-sm font-dogica text-white">{currentLvl}</span>
                      </div>

                      {/* fila free */}
                      <div className="flex h-44 flex-col items-center justify-center border-b-[6px] border-[#1a1a1a] bg-[#b5b5b5]">
                        <div className="relative">
                          {canClaimFree && (
                            <div className="absolute -inset-2 animate-pulse rounded-xl bg-[#915ab5] blur-lg opacity-75"></div>
                          )}
                          
                          <div 
                            onClick={() => canClaimFree && handleClaim(currentLvl, rewardText)}
                            className={`relative z-10 flex h-24 w-20 flex-col overflow-hidden rounded-xl transition-all duration-300
                              ${!isUnlocked ? 'bg-[#8b5aab]/40 grayscale' : ''} 
                              ${canClaimFree ? 'bg-[#8b5aab] cursor-pointer hover:scale-105' : ''}
                              ${isFreeClaimed ? 'bg-[#808080]' : ''}
                            `}
                          >
                            <div className="flex flex-1 items-center justify-center text-zinc-300">
                              {isFreeClaimed ? <CheckIcon /> : <PlaceholderIcon />}
                            </div>
                            <div className={`py-1 text-center text-[10px] ${isFreeClaimed ? 'bg-[#333333] text-zinc-400' : 'bg-[#3b2345] text-zinc-300'}`}>
                              {rewardText}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* fila premium */}
                      <div className="flex h-44 flex-col items-center justify-center bg-[#b89851]">
                        <div className="relative">
                          {isUnlocked && (
                            <div className="absolute -inset-2 animate-pulse rounded-xl bg-[#f7d377] blur-lg opacity-60"></div>
                          )}

                          <div className={`relative z-10 flex h-24 w-20 flex-col overflow-hidden rounded-xl transition-all duration-300
                            ${!isUnlocked ? 'bg-[#f7d377]/40 grayscale' : 'bg-[#f7d377]'}
                          `}>
                            <div className="absolute right-1 top-1 text-black/60">
                              <LockIcon />
                            </div>
                            <div className="flex flex-1 items-center justify-center text-black/30">
                              <PlaceholderIcon />
                            </div>
                            <div className="bg-[#382b12] py-1 text-center text-[10px] text-[#f7d377]">
                              3x boost
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      </div>

      <button onClick={handleAddXp} className="mt-12 rounded-full border border-zinc-600 px-6 py-2 text-sm text-zinc-400 transition hover:bg-white hover:text-black">
        [Dev] Simular ganar +250 XP
      </button>

    </div>
  );
}