import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!loginForm.email || !loginForm.password) {
      setError("Completa todos los campos.");
      return;
    }
    setLoading(true);
    try {
      // ✅ FIX: se pasa password para que AuthContext pueda validar
      login({ email: loginForm.email, password: loginForm.password });
      navigate("/");
    } catch (err) {
      setError(err.message || "Credenciales incorrectas.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (!registerForm.username || !registerForm.email || !registerForm.password || !registerForm.confirm) {
      setError("Completa todos los campos.");
      return;
    }
    if (registerForm.password !== registerForm.confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (registerForm.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setLoading(true);
    try {
      // ✅ FIX: se pasa password para que AuthContext pueda guardarla
      register({
        email: registerForm.email,
        username: registerForm.username,
        password: registerForm.password,
      });
      navigate("/");
    } catch (err) {
      setError(err.message || "Error al crear la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0a] font-sans">

      {/* Fondo */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,220,50,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,220,50,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute bottom-[-120px] left-1/2 h-[300px] w-[600px] -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(255,220,50,0.08)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 flex w-full max-w-[420px] flex-col items-center gap-8 p-6">

        {/* Branding */}
        <div className="text-center">
          <h1 className="mb-2 text-7xl leading-[0.9] tracking-[4px] text-white">
            STREETS<br />OF LIMA
          </h1>
        </div>

        {/* Card */}
        <div className="w-full rounded border border-zinc-800 bg-[#111] p-7">

          {/* Tabs */}
          <div className="mb-6 flex border-b border-zinc-800">
            <button
              onClick={() => { setTab("login"); setError(""); }}
              className={`flex-1 border-b-2 pb-3 text-[13px] font-medium uppercase tracking-[1px] transition
                ${tab === "login" ? "border-yellow-300 text-yellow-300" : "border-transparent text-zinc-600"}`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => { setTab("register"); setError(""); }}
              className={`flex-1 border-b-2 pb-3 text-[13px] font-medium uppercase tracking-[1px] transition
                ${tab === "register" ? "border-yellow-300 text-yellow-300" : "border-transparent text-zinc-600"}`}
            >
              Registrarse
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="mb-4 rounded border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              ⚠ {error}
            </p>
          )}

          {/* LOGIN */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium uppercase tracking-[2px] text-zinc-500">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  placeholder="jugador@ejemplo.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="rounded border border-zinc-800 bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-300"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium uppercase tracking-[2px] text-zinc-500">
                  Contraseña
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="rounded border border-zinc-800 bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-300"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-2 rounded bg-yellow-300 px-4 py-3 text-lg tracking-[2px] text-black transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Entrando..." : "ENTRAR AL JUEGO →"}
              </button>
            </form>
          )}

          {/* REGISTER */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium uppercase tracking-[2px] text-zinc-500">
                  Nombre de usuario
                </label>
                <input
                  type="text"
                  placeholder="NombreDeJugador"
                  value={registerForm.username}
                  onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                  className="rounded border border-zinc-800 bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-300"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium uppercase tracking-[2px] text-zinc-500">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  placeholder="jugador@ejemplo.com"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  className="rounded border border-zinc-800 bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-300"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium uppercase tracking-[2px] text-zinc-500">
                  Contraseña
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  className="rounded border border-zinc-800 bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-300"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium uppercase tracking-[2px] text-zinc-500">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={registerForm.confirm}
                  onChange={(e) => setRegisterForm({ ...registerForm, confirm: e.target.value })}
                  className="rounded border border-zinc-800 bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-300"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-2 rounded bg-yellow-300 px-4 py-3 text-lg tracking-[2px] text-black transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Creando cuenta..." : "CREAR CUENTA →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}