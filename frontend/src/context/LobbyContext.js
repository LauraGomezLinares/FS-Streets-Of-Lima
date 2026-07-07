import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const LobbyContext = createContext();

export function LobbyProvider({ children }) {
  const { user, socket, triggerToast } = useAuth(); // Importamos triggerToast para los mensajes
  
  const [slots, setSlots] = useState([null, null, null, null]);

  // Al iniciar sesión, tú automáticamente eres el líder
  useEffect(() => {
    if (user) {
      setSlots([{ id: user.id, username: user.username, isHost: true }, null, null, null]);
    } else {
      setSlots([null, null, null, null]);
    }
  }, [user]);

  // Escuchar eventos del Lobby (Aceptaciones y Desconexiones)
  useEffect(() => {
    if (!socket) return;

    // Cuando alguien acepta tu invitación
    const handleInviteResponse = ({ targetId, targetUsername, accepted }) => {
      if (accepted) {
        setSlots((prev) => {
          // Si ya está en las cajas, no lo duplicamos
          if (prev.some(p => p?.id === targetId)) return prev;

          const newSlots = [...prev];
          const emptyIndex = newSlots.findIndex(s => s === null);
          if (emptyIndex !== -1) {
            newSlots[emptyIndex] = { id: targetId, username: targetUsername, isHost: false };
          }
          return newSlots;
        });
      }
    };

    // Cuando alguien cierra la página o hace Log Out
    const handleMemberLeft = ({ userId, username, isHost }) => {
      if (isHost) {
        // Si el que cerró la página era el líder (P1), el lobby se destruye
        triggerToast(`El líder de la sala se desconectó. Volviendo a tu sala en solitario.`);
        if (user) {
          setSlots([{ id: user.id, username: user.username, isHost: true }, null, null, null]);
        }
      } else {
        // Si el que cerró la página era un amigo (P2, P3), lo borramos de la caja
        triggerToast(`[${username}] salió de la sala.`);
        setSlots(prev => prev.map(player => (player?.id === userId ? null : player)));
      }
    };

    socket.on("lobby:invite:response", handleInviteResponse);
    socket.on("lobby:member_left", handleMemberLeft);

    return () => {
      socket.off("lobby:invite:response", handleInviteResponse);
      socket.off("lobby:member_left", handleMemberLeft);
    };
  }, [socket, user, triggerToast]);

  return (
    <LobbyContext.Provider value={{ slots, setSlots }}>
      {children}
    </LobbyContext.Provider>
  );
}

export const useLobby = () => useContext(LobbyContext);