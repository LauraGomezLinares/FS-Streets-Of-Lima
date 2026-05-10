import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

// Clave donde guardamos los usuarios registrados
const USERS_KEY = "sol_users";
const SESSION_KEY = "sol_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem(SESSION_KEY)) || null
  );

  // Obtener todos los usuarios registrados
  const getUsers = () =>
    JSON.parse(localStorage.getItem(USERS_KEY)) || [];

  // LOGIN — verifica que el usuario exista y la contraseña coincida
  const login = ({ email, password }) => {
    const users = getUsers();
    const found = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!found) {
      throw new Error("Credenciales incorrectas.");
    }

    const session = { email: found.email, username: found.username };
    setUser(session);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  };

  // REGISTER — verifica que el email no esté ya registrado
  const register = ({ email, username, password }) => {
    const users = getUsers();
    const exists = users.find((u) => u.email === email);

    if (exists) {
      throw new Error("Este correo ya está registrado.");
    }

    const newUser = { email, username, password };
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));

    const session = { email, username };
    setUser(session);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  };

  // LOGOUT
  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);