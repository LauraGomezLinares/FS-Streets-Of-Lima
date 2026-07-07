import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import faceSprite from "../assets/FaceSprite.png"; 
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
const { 
  user, token, setLoginModalOpen, logout, isProfileOpen, setIsProfileOpen, 
  socket, incomingInvite, setIncomingInvite
} = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Estados para el sistema de Amigos
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [friendsList, setFriendsList] = useState([]);

  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [notification, setNotification] = useState(null);

  const handleInviteToLobby = (friend) => {
    if (socket) {
      socket.emit("lobby:invite:send", {
        targetUserId: friend.id
      });
      setNotification({ type: "success", message: `INVITACIÓN ENVIADA A ${friend.username}` });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleRespondToInvite = (accepted) => {
  if (socket && incomingInvite) {
    socket.emit("lobby:invite:respond", {
      senderId: incomingInvite.senderId,
      targetUsername: user.username,
      accepted: accepted
    });

    if (accepted) {
      // AQUI ES DONDE NOS UNIREMOS AL LOBBY COMO P2
      console.log(`¡Uniendo al lobby de ${incomingInvite.senderUsername} como P2!`);
    }

    setIncomingInvite(null); // Cerramos el pop-up
  }
  };

  useEffect(() => {
    let interval = null;
    let secondsAccumulated = 0; // Guardamos registro local temporal
    
    if (user) {
      interval = setInterval(() => {
        setSessionSeconds((prev) => {
          const newSeconds = prev + 1;
          secondsAccumulated++;

          // Guardado de seguridad cada 5 minutos
          if (secondsAccumulated >= 300) {
            fetch(`${API_URL}/auth/save-playtime`, {
              method: "POST",
              headers: getAuthHeaders(),
              body: JSON.stringify({ secondsToAdd: secondsAccumulated })
            }).catch(err => console.error("Fallo al sincronizar tiempo:", err));
            
            secondsAccumulated = 0; // Reiniciamos el acumulador local tras guardar
          }

          return newSeconds;
        });
      }, 1000);
    } else {
      setSessionSeconds(0);
      if (interval) clearInterval(interval);
    }

    // Cleanup: Intentar guardar los segundos sobrantes si el jugador cierra la página o se desloguea
    return () => {
      if (interval) clearInterval(interval);
      if (secondsAccumulated > 0) {
        // Usamos keepalive para que la petición no se cancele al cerrar la pestaña
        fetch(`${API_URL}/auth/save-playtime`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ secondsToAdd: secondsAccumulated }),
          keepalive: true 
        }).catch(err => console.error("Fallo al guardar al salir:", err));
      }
    };
  }, [user]); // eslint-disable-line

  const userLevel = user?.battlePass?.level || 1;

  const baseTotalSeconds = user?.totalPlaySeconds || 0; 
  const totalCombinedSeconds = baseTotalSeconds + sessionSeconds;
  const displayHours = Math.floor(totalCombinedSeconds / 3600);
  const displayMinutes = Math.floor((totalCombinedSeconds % 3600) / 60);

  // URL base de tu backend
  const API_URL = "https://fs-streets-of-lima-backend.onrender.com";

  // Helper para enviar el token JWT en cada petición
  const getAuthHeaders = () => {
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  };

  const fetchPendingRequests = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/friends/requests`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setPendingRequests(data);
      }
    } catch (error) {
      console.error("Error obteniendo solicitudes:", error);
    }
  }, [API_URL]);

  const fetchFriends = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/friends`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setFriendsList(data);
      }
    } catch (error) {
      console.error("Error obteniendo amigos:", error);
    }
  }, [API_URL]);

  // Cargar datos al abrir el menú de perfil
  useEffect(() => {
    if (isProfileOpen && user) {
      fetchPendingRequests();
      fetchFriends();
    }
  }, [isProfileOpen, user, fetchPendingRequests, fetchFriends]);

  const handleSearchUser = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const res = await fetch(`${API_URL}/friends/search?q=${searchQuery}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error("Error buscando usuarios:", error);
    }
  };

  const handleSendRequest = async (targetUserId) => {
    try {
      const res = await fetch(`${API_URL}/friends/request`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ targetUserId }),
      });
      
      if (res.ok) {
        setSearchQuery(""); 
        setSearchResults([]);
        // Reemplazamos el alert() por nuestro nuevo Pop-up de éxito
        setNotification({ type: "success", message: "SOLICITUD ENVIADA" });
        setTimeout(() => setNotification(null), 3000); // Desaparece en 3 segundos
      } else {
        const errorData = await res.json();
        // Reemplazamos el alert() por nuestro Pop-up de error
        setNotification({ type: "error", message: errorData.error || "ERROR AL ENVIAR" });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error("Error enviando solicitud:", error);
    }
  };

  const handleRespondRequest = async (friendshipId, status) => {
    try {
      const res = await fetch(`${API_URL}/friends/${friendshipId}/respond`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        // Remover localmente para actualizar la UI sin recargar
        setPendingRequests(prev => prev.filter(req => req.id !== friendshipId));
        if (status === 'ACCEPTED') {
          fetchFriends(); // Recargar lista de amigos
        }
      }
    } catch (error) {
      console.error("Error respondiendo solicitud:", error);
    }
  };

  const navLinks = [
    { to: "/", label: "HOME" },
    { to: "/cosmetics_store", label: "SHOP" },
    { to: "/battle_pass", label: "COMBO PASS" },
    { to: "/premium_store", label: "SUNNYS" },
  ];

  return (
    <nav className="relative z-40 flex items-center justify-between lg:justify-end bg-[#0a0a0a] border-b border-zinc-800 p-4 h-[70px] font-dogica">
      
      <button 
        className="lg:hidden text-zinc-400 hover:text-yellow-400 p-2"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="absolute top-[70px] left-0 w-full bg-[#111] border-b border-zinc-800 z-50 flex flex-col items-center py-4 lg:hidden shadow-2xl"
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-4 text-xs text-zinc-400 hover:text-yellow-300 hover:bg-zinc-900 transition-colors uppercase tracking-widest"
              >
                {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 text-xs text-zinc-400">
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

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, x: 20 }} 
                  animate={{ opacity: 1, scale: 1, x: 0 }} 
                  exit={{ opacity: 0, scale: 0.95, x: 20 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute top-16 right-0 w-[85vw] max-w-[320px] lg:w-[22vw] lg:min-w-[320px] bg-[#111] border border-zinc-800 rounded shadow-2xl p-6 font-dogica z-50 origin-top-right"
                >
                  {/* Cabecera */}
                  <div className="flex items-center gap-4 mb-5">
                      <img src={faceSprite} alt="Avatar" className="w-16 h-16 border-2 border-zinc-700 rounded rendering-pixelated bg-zinc-800 aspect-square object-cover" />
                      <div>
                          <div className="text-yellow-300 text-sm md:text-base">{user.username}</div>
                          <div className="text-zinc-500 text-[10px] mt-2 tracking-widest uppercase">
                            Level {userLevel} | {displayHours} Hrs
                          </div>
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
                  
                  {/* YOUR FRIENDS DINÁMICO */}
                  <div className="text-zinc-500 text-[10px] mb-3 tracking-widest">YOUR FRIENDS</div>
                  {friendsList.length === 0 ? (
                    <div className="text-[9px] text-zinc-600 mb-4 italic">No tienes amigos agregados aún.</div>
                  ) : (
                    friendsList.map((friendship) => (
                      <div key={friendship.id} className="flex items-center justify-between bg-[#1a1a1a] p-2 rounded mb-4 border border-zinc-800/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-zinc-800 border border-zinc-700 rounded overflow-hidden aspect-square">
                              <img src={friendship.friend.imageUrl || faceSprite} alt="Amigo" className="w-full h-full object-cover rendering-pixelated opacity-50" />
                          </div>
                          <span className="text-[10px] text-zinc-300 tracking-widest">{friendship.friend.username}</span>
                        </div>
                        <button 
                          onClick={() => handleInviteToLobby(friendship.friend)} 
                          className="text-green-500 hover:text-green-300 hover:scale-125 transition-all text-xl leading-none mb-1"
                        >
                          +
                        </button>
                      </div>
                    ))
                  )}

                  {/* ADD FRIEND (Buscador) */}
                  <div className="text-zinc-500 text-[10px] mb-2 tracking-widest">ADD FRIEND</div>
                  <form onSubmit={handleSearchUser} className="flex items-center gap-2 mb-4">
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      maxLength={15}
                      placeholder="USERNAME" 
                      className="flex-1 bg-[#0a0a0a] border border-zinc-700 rounded px-3 py-2 text-[10px] text-white outline-none focus:border-yellow-300 uppercase tracking-widest font-sans"
                    />
                    <button type="submit" className="bg-yellow-400 hover:bg-yellow-300 text-black px-3 py-2 rounded text-[10px] font-bold transition-colors">
                      &gt;
                    </button>
                  </form>

                  {/* RESULTADOS DE BÚSQUEDA */}
                  {searchResults.length > 0 && (
                    <div className="mb-4 flex flex-col gap-2">
                      {searchResults.map((resUser) => (
                        <div key={resUser.id} className="flex items-center justify-between bg-[#0a0a0a] p-2 border border-yellow-900/50 rounded">
                           <span className="text-[9px] text-yellow-300 tracking-widest">{resUser.username}</span>
                           <button 
                             onClick={() => handleSendRequest(resUser.id)} 
                             className="text-xs bg-yellow-900/40 hover:bg-yellow-400 hover:text-black text-yellow-500 px-2 py-1 rounded transition-all"
                           >
                             ADD
                           </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* FRIEND REQUESTS DINÁMICO */}
                  <div className="text-zinc-500 text-[10px] mb-2 tracking-widest">REQUESTS</div>
                  <div className="flex flex-col gap-2 mb-5">
                    {pendingRequests.length === 0 ? (
                      <div className="text-[9px] text-zinc-600 py-2 italic">NO PENDING REQUESTS</div>
                    ) : (
                      pendingRequests.map((req) => (
                        <div key={req.id} className="flex items-center justify-between bg-[#0a0a0a] p-2 rounded border border-zinc-800/50">
                          <span className="text-[9px] text-zinc-400 tracking-widest">{req.user.username}</span>
                          <div className="flex gap-3">
                            <button 
                              onClick={() => handleRespondRequest(req.id, 'ACCEPTED')}
                              className="text-green-500 hover:text-green-400 hover:scale-125 transition-transform text-xs"
                            >✔</button>
                            <button 
                              onClick={() => handleRespondRequest(req.id, 'REJECTED')}
                              className="text-red-500 hover:text-red-400 hover:scale-125 transition-transform text-xs"
                            >✖</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* BOTÓN DE ADMIN */}
                  {user.email === "admin@streetsoflima.com" && (
                    <Link 
                      to="/admin" 
                      onClick={() => setIsProfileOpen(false)}
                      className="w-full flex items-center justify-center bg-green-900/30 text-green-400 border border-green-900/50 py-3 mb-2 text-[10px] tracking-widest hover:bg-green-500 hover:text-black transition-all rounded"
                    >
                      [ SYSTEM ADMIN ]
                    </Link>
                  )}

                  <button 
                    onClick={() => { logout(); setIsProfileOpen(false); }} 
                    className="w-full bg-red-900/20 text-red-500 border border-red-900/50 py-3 text-[10px] tracking-widest hover:bg-red-900/40 hover:border-red-500 transition-all rounded"
                  >
                    LOG OUT
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, x: 50 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: 50 }}
            className={`fixed top-[90px] right-4 lg:right-10 z-50 px-5 py-4 bg-[#0a0a0a] border-l-4 shadow-2xl flex items-center gap-3 ${
              notification.type === 'success' ? 'border-yellow-400' : 'border-red-500'
            }`}
          >
            <span className={`text-base ${notification.type === 'success' ? 'text-yellow-400' : 'text-red-500'}`}>
              {notification.type === 'success' ? '✔' : '✖'}
            </span>
            <span className="text-white text-[10px] tracking-widest uppercase font-dogica mt-0.5">
              {notification.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {incomingInvite && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-[90px] right-4 lg:right-10 z-[60] p-4 bg-[#111] border-2 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)] flex flex-col items-center gap-3 w-[260px]"
          >
            <div className="text-white text-[10px] tracking-widest uppercase text-center font-dogica leading-relaxed">
              <span className="text-yellow-400">{incomingInvite.senderUsername}</span> TE HA INVITADO A UN LOBBY
            </div>
            <div className="flex gap-4 mt-2 w-full">
              <button 
                onClick={() => handleRespondToInvite(true)}
                className="flex-1 bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500 hover:text-black py-2 text-[10px] transition-all"
              >
                ACEPTAR
              </button>
              <button 
                onClick={() => handleRespondToInvite(false)}
                className="flex-1 bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-black py-2 text-[10px] transition-all"
              >
                RECHAZAR
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}