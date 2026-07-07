import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const LobbyContext = createContext();

export function LobbyProvider({ children }) {
  const { user, socket } = useAuth();
  
  // El estado de los 4 espacios: [P1, P2, P3, P4]
  const [slots, setSlots] = useState([null, null, null, null]);

  // Al iniciar sesión, tú automáticamente eres el líder de tu lobby (P1)
  useEffect(() => {
    if (user) {
      setSlots([
        { id: user.id, username: user.username, isHost: true },
        null, null, null
      ]);
    } else {
      setSlots([null, null, null, null]);
    }
  }, [user]);

  // Escuchar cuando el amigo ACEPTA tu invitación
  useEffect(() => {
    if (!socket) return;

    const handleInviteResponse = ({ targetId, targetUsername, accepted }) => {
      if (accepted) {
        // Buscamos la primera cajita vacía y lo metemos ahí
        setSlots((prev) => {
          const newSlots = [...prev];
          const emptyIndex = newSlots.findIndex(s => s === null);
          if (emptyIndex !== -1) {
            newSlots[emptyIndex] = { id: targetId, username: targetUsername, isHost: false };
          }
          return newSlots;
        });
      }
    };

    socket.on("lobby:invite:response", handleInviteResponse);
    return () => socket.off("lobby:invite:response", handleInviteResponse);
  }, [socket]);

  return (
    <LobbyContext.Provider value={{ slots, setSlots }}>
      {children}
    </LobbyContext.Provider>
  );
}

export const useLobby = () => useContext(LobbyContext);