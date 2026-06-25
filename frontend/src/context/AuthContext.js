import { createContext, useContext, useState, useEffect } from "react"; 
import { io } from "socket.io-client"; 

const AuthContext = createContext();
const SESSION_KEY = "sol_user";
const TOKEN_KEY = "sol_token";
const API_URL = "https://streets-of-lima-backend.onrender.com";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem(SESSION_KEY)) || null);
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || null);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const triggerToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000); 
  };

  // CONEXIÓN WEBOCKETS (ESCUCHA DE BANEO EN TIEMPO REAL)
  useEffect(() => {
    // Si no hay un usuario autenticado con ID, no abrimos conexión de sockets
    if (!user || !user.id) return;

    // Conectamos con el backend pasando el token por seguridad
    const socket = io(API_URL, {
      auth: { token }
    });

    // Nos unimos a una sala única basada en el ID del usuario
    socket.emit("join:room", user.id);

    // Escuchamos si un administrador emite la orden de baneo para nuestra cuenta
    socket.on("account:banned", () => {
      // Baneo detectado: Cerramos la sesión del jugador de inmediato
      setUser(null);
      setToken(null);
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(TOKEN_KEY);
      
      // Bloqueamos la pantalla con un mensaje crítico del sistema
      alert("❌ TERMINAL_NOTICE: Your account has been suspended by an administrator for breaking community guidelines.");
    });

    // Desconectamos el socket de forma limpia si el usuario se desloguea o cierra la app
    return () => {
      socket.disconnect();
    };
  }, [user, token]); // Se dispara cada vez que el estado del usuario o su token cambien

  // 1. PASO 1 DEL LOGIN: Dispara el envío de OTP a través del backend
  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Credenciales incorrectas.");
      }

      // Retornamos el userId para que el formulario de React sepa qué ID mandar en el OTP
      return { success: true, userId: data.userId };
    } catch (error) {
      triggerToast(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 2. PASO 2 DEL LOGIN: Verifica el código OTP recibido por correo
  const verifyOtp = async ({ userId, code }) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, code }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Código OTP inválido.");
      }

      // El backend nos devuelve el token y los datos del usuario logueado
      const sessionUser = data.user;
      const sessionToken = data.token;

      setUser(sessionUser);
      setToken(sessionToken);

      // Guardamos tanto la sesión como la "llave" JWT
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      localStorage.setItem(TOKEN_KEY, sessionToken);

      setLoginModalOpen(false); // Cerramos el modal de login/otp
      triggerToast(`¡Bienvenido de vuelta, ${sessionUser.username}! 🎮`);
      return { success: true };
    } catch (error) {
      triggerToast(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 3. REGISTRO REAL: Registra al usuario en la base de datos de Neon
  const register = async ({ email, username, password }) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error en el registro.");
      }

      triggerToast("¡Registro exitoso! Revisa tu correo para tu código de activación.");
      // Devolvemos el userId porque el registro también dispara un OTP para activar la cuenta
      return { success: true, userId: data.userId };
    } catch (error) {
      triggerToast(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 4. LOGOUT REAL: Limpia el estado y los almacenamientos locales
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
    triggerToast("Sesión cerrada.");
  };

  return (
    <AuthContext.Provider value={{ 
      user, token, loading, login, verifyOtp, register, logout, 
      isLoginModalOpen, setLoginModalOpen, 
      isProfileOpen, setIsProfileOpen,
      toastMessage, triggerToast 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);