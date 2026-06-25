import { createContext, useContext, useState } from "react";

const AuthContext = createContext();
const USERS_KEY = "sol_users";
const SESSION_KEY = "sol_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem(SESSION_KEY)) || null);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false); 
  const [toastMessage, setToastMessage] = useState(null);

  // Función para disparar el mensaje borroso en el centro
  const triggerToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000); 
  };

  const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY)) || [];

  const login = ({ email, password }) => {
    const users = getUsers();
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) throw new Error("Credenciales incorrectas.");
    
    const session = { email: found.email, username: found.username };
    setUser(session);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setLoginModalOpen(false); // Cierra el modal al loguearse
  };

  const register = ({ email, username, password }) => { 
    const users = getUsers();
    const exists = users.find((u) => u.email === email);
    if (exists) throw new Error("Este correo ya está registrado.");

    const newUser = { email, username, password };
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
    const session = { email, username };
    setUser(session);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setLoginModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ 
      user, login, register, logout, 
      isLoginModalOpen, setLoginModalOpen, 
      isProfileOpen, setIsProfileOpen,
      toastMessage, triggerToast 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);