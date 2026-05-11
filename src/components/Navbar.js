import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import faceSprite from "../assets/FaceSprite.png"; 

export default function Navbar() {
  const { user, setLoginModalOpen, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "HOME" },
    { to: "/cosmetics_store", label: "SHOP" },
    { to: "/battle_pass", label: "COMBO PASS" },
    { to: "/premium_store", label: "SUNNYS" },
    
  ];

  return (
    <nav className="relative z-40 flex items-center justify-end bg-[#0a0a0a] border-b border-zinc-800 p-4 h-[70px] font-dogica">
      
      {/* SECCIÓN CENTRAL: Enlaces */}
      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 text-xs text-zinc-400">
        {navLinks.map((link, index) => (
          <div key={link.to} className="flex items-center">
            <Link
              to={link.to}
              className="hover:text-yellow-300 transition-colors uppercase tracking-widest"
            >
              {link.label}
            </Link>
            {index < navLinks.length - 1 && (
              <span className="ml-8 text-zinc-700">|</span>
            )}
          </div>
        ))}
      </div>

      {/* SECCIÓN DERECHA: Autenticación / Perfil */}
      <div className="flex items-center flex-shrink-0">
        {!user ? (
          <button 
            onClick={() => setLoginModalOpen(true)}
            className="text-[10px] text-zinc-300 hover:text-yellow-300 transition-all tracking-widest uppercase border border-zinc-700 hover:border-yellow-300 px-4 py-2 rounded bg-zinc-900/50"
          >
            LOG IN
          </button>
        ) : (
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)} 
              className="w-12 h-12 border-2 border-zinc-600 hover:border-yellow-300 transition-colors bg-zinc-800 rounded overflow-hidden"
            >
              <img 
                src={faceSprite} 
                alt="Avatar" 
                className="w-full h-full object-cover scale-150 rendering-pixelated" 
              />
            </button>

           
            {isProfileOpen && (
              <div className="absolute top-16 right-0 w-[22vw] min-w-[320px] bg-[#111] border border-zinc-800 rounded shadow-2xl p-6 font-dogica z-50">
                
                {/* Cabecera */}
                <div className="flex items-center gap-4 mb-5">
                    <img src={faceSprite} alt="Avatar" className="w-16 h-16 border-2 border-zinc-700 rounded rendering-pixelated bg-zinc-800 aspect-square object-cover" />
                    <div>
                        <div className="text-yellow-300 text-sm md:text-base">{user.username}</div>
                        <div className="text-zinc-500 text-[10px] mt-2 tracking-widest">Level 15 | 120 Hrs</div>
                    </div>
                </div>
                
                {/* Personaje */}
                <div className="flex items-center gap-3 mb-4 bg-[#1a1a1a] p-2 rounded border border-zinc-800/50">
                    <img src={faceSprite} alt="Fav Char" className="w-10 h-10 border border-zinc-700 rounded rendering-pixelated bg-zinc-800 aspect-square object-cover" />
                    <div className="text-zinc-400 text-[10px]">
                      Fav Char: <br/><span className="text-white text-xs">Roldan</span>
                    </div>
                </div>
                
                <hr className="border-zinc-800 my-5" />
                
                {/* YOUR FRIENDS */}
                <div className="text-zinc-500 text-[10px] mb-3 tracking-widest">YOUR FRIENDS</div>
                <div className="flex items-center justify-between bg-[#1a1a1a] p-2 rounded mb-4 border border-zinc-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-800 border border-zinc-700 rounded overflow-hidden aspect-square">
                         <img src={faceSprite} alt="Amigo" className="w-full h-full object-cover rendering-pixelated opacity-50" />
                    </div>
                    <span className="text-[10px] text-zinc-300 tracking-widest">Natalia</span>
                  </div>
                  <button className="text-green-500 hover:text-green-300 hover:scale-125 transition-all text-xl leading-none mb-1">+</button>
                </div>

                {/* ADD FRIEND */}
                <div className="text-zinc-500 text-[10px] mb-2 tracking-widest">ADD FRIEND</div>
                <div className="flex items-center gap-2 mb-4">
                  <input 
                    type="text" 
                    maxLength={10}
                    placeholder="USERNAME" 
                    className="flex-1 bg-[#0a0a0a] border border-zinc-700 rounded px-3 py-2 text-[10px] text-white outline-none focus:border-yellow-300 uppercase tracking-widest font-sans"
                  />
                  <button className="bg-yellow-400 hover:bg-yellow-300 text-black px-3 py-2 rounded text-[10px] font-bold transition-colors">
                    &gt;
                  </button>
                </div>

                {/* FRIEND REQUESTS */}
                <div className="text-zinc-500 text-[10px] mb-2 tracking-widest">REQUESTS</div>
                <div className="flex items-center justify-between bg-[#0a0a0a] p-2 rounded mb-5 border border-zinc-800/50">
                  <span className="text-[9px] text-zinc-400 tracking-widest">GSon</span>
                  <div className="flex gap-3">
                    <button className="text-green-500 hover:text-green-400 hover:scale-125 transition-transform text-xs">✔</button>
                    <button className="text-red-500 hover:text-red-400 hover:scale-125 transition-transform text-xs">✖</button>
                  </div>
                </div>

                {/* Salir */}
                <button 
                  onClick={() => { logout(); setIsProfileOpen(false); }} 
                  className="w-full bg-red-900/20 text-red-500 border border-red-900/50 py-3 text-[10px] tracking-widest hover:bg-red-900/40 hover:border-red-500 transition-all rounded"
                >
                  LOG OUT
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}