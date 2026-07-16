import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginModal() {
  // Traemos los métodos y el estado global 'pendingUserId' desde tu AuthContext
  const { isLoginModalOpen, setLoginModalOpen, login, register, verifyOtp, resendOtp, pendingUserId } = useAuth();
  
  const [tab, setTab] = useState("login");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [otpCode, setOtpCode] = useState("");

  // Estado local de respaldo para capturar el ID si el contexto requiere persistencia manual inmediata
  const [localUserId, setLocalUserId] = useState(null);

  const resetState = () => {
    setError("");
    setInfo("");
    setOtpCode("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    resetState();
    if (!loginForm.email || !loginForm.password) return setError("Fill all fields.");

    setLoading(true);
    try {
      // Al hacer login, el backend retorna { success: true, userId: data.userId }
      const res = await login({ email: loginForm.email, password: loginForm.password });

      console.log("Respuesta del servidor:", res);
      if (res && res.userId) {
        setLocalUserId(res.userId);
      }
      setInfo("Te enviamos un código a tu correo. Ingrésalo abajo.");
    } catch (err) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!otpCode) return setError("Ingresa el código.");

    // Tomamos el ID disponible (sea el global de tu contexto o el local capturado)
    const activeUserId = pendingUserId || localUserId;

    if (!activeUserId) {
      return setError("Error de sesión: ID de usuario no encontrado. Intenta logearte otra vez.");
    }

    setLoading(true);
    try {
      // 🚀 SOLUCIÓN CLAVE: Ahora enviamos el objeto esperado { userId, code } al AuthContext
      await verifyOtp({ userId: activeUserId, code: otpCode });
      
      // Si todo sale bien, AuthContext actualiza los estados de sesión y cierra el modal automáticamente.
      resetState();
    } catch (err) {
      setError(err.message || "Código incorrecto.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await resendOtp();
      setInfo("Te enviamos un nuevo código.");
    } catch (err) {
      setError(err.message || "No se pudo reenviar el código.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    resetState();
    
    if (!registerForm.username || !registerForm.email || !registerForm.password || !registerForm.confirm)
      return setError("Fill all fields.");
    if (registerForm.password !== registerForm.confirm)
      return setError("Passwords do not match.");
    if (registerForm.password.length < 6)
      return setError("Password must be at least 6 characters.");

    setLoading(true);
    try {
      // Al registrar, también capturamos el userId devuelto para la activación por OTP
      const res = await register({ 
        email: registerForm.email, 
        username: registerForm.username, 
        password: registerForm.password 
      });
      if (res && res.userId) {
        setLocalUserId(res.userId);
      }
      setInfo("¡Registro exitoso! Te enviamos un código de activación a tu correo.");
    } catch (err) {
      setError(err.message || "Email already registered.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setLoginModalOpen(false);
    resetState();
  };

  return (
    <AnimatePresence>
      {isLoginModalOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 font-dogica"
        >
          <motion.div
            initial={{ scale: 0.9, y: -40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 40 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="relative w-full max-w-[420px] rounded border border-zinc-800 bg-[#111] p-7 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-5 text-zinc-500 hover:text-red-500 transition-colors text-lg"
            >
              X
            </button>

            {/* Condición de vista basada en si hay un inicio de sesión esperando OTP */}
            {(pendingUserId || localUserId) ? (
              <>
                <div className="mb-6 text-center mt-2">
                  <h2 className="text-yellow-300 text-sm uppercase tracking-widest">Verifica tu identidad</h2>
                  <p className="text-zinc-500 text-[10px] mt-2">Ingresa el código de 6 dígitos que enviamos a tu correo.</p>
                </div>

                {error && (
                  <div className="mb-4 rounded border border-red-900/50 bg-red-900/20 px-3 py-2 text-[9px] tracking-widest text-red-400">
                    ⚠ {error}
                  </div>
                )}
                
                {info && !error && (
                  <div className="mb-4 rounded border border-green-900/50 bg-green-900/20 px-3 py-2 text-[9px] tracking-widest text-green-400">
                    {info}
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase tracking-[2px] text-zinc-500">Código OTP</label>
                    <input
                      type="text" maxLength={6} placeholder="123456" value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      className="rounded border border-zinc-800 bg-[#0a0a0a] px-4 py-3 text-center text-lg tracking-[6px] text-white outline-none transition focus:border-yellow-300 font-sans"
                    />
                  </div>
     
                  <button type="submit" disabled={loading} className="mt-2 rounded bg-yellow-400 px-4 py-3 text-[10px] tracking-[2px] text-black transition hover:bg-yellow-300 active:scale-[0.98]">
                    {loading ? "VERIFICANDO..." : "VERIFICAR →"}
                  </button>
                  <button type="button" onClick={handleResend} className="text-[9px] text-zinc-500 hover:text-yellow-300 transition-colors tracking-widest">
                    Reenviar código
                  </button>
                </form>
              </>
            ) : (
              <>
                {/* Tabs */}
                <div className="mb-6 flex border-b border-zinc-800 mt-2">
                  <button
                    onClick={() => { setTab("login"); resetState(); }}
                    className={`flex-1 border-b-2 pb-3 text-[11px] uppercase tracking-[1px] transition ${tab === "login" ? "border-yellow-300 text-yellow-300" : "border-transparent text-zinc-600 hover:text-zinc-400"}`}
                  >
                    LOG IN
                  </button>
                  <button
                    onClick={() => { setTab("register"); resetState(); }}
                    className={`flex-1 border-b-2 pb-3 text-[11px] uppercase tracking-[1px] transition ${tab === "register" ? "border-yellow-300 text-yellow-300" : "border-transparent text-zinc-600 hover:text-zinc-400"}`}
                  >
                    REGISTER
                  </button>
                </div>

                {error && (
                  <div className="mb-4 rounded border border-red-900/50 bg-red-900/20 px-3 py-2 text-[9px] tracking-widest text-red-400">
                    ⚠ {error}
                  </div>
                )}

                {tab === "login" && (
                  <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] uppercase tracking-[2px] text-zinc-500">Email</label>
                      <input
                        type="email" placeholder="player@example.com" value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        className="rounded border border-zinc-800 bg-[#0a0a0a] px-4 py-3 text-xs text-white outline-none transition focus:border-yellow-300 font-sans"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] uppercase tracking-[2px] text-zinc-500">Password</label>
                      <input
                        type="password" placeholder="••••••••" value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        className="rounded border border-zinc-800 bg-[#0a0a0a] px-4 py-3 text-xs text-white outline-none transition focus:border-yellow-300 font-sans"
                      />
                    </div>
                    <button type="submit" disabled={loading} className="mt-4 rounded bg-yellow-400 px-4 py-3 text-[10px] tracking-[2px] text-black transition hover:bg-yellow-300 active:scale-[0.98]">
                      {loading ? "ENVIANDO CÓDIGO..." : "ENTER GAME →"}
                    </button>
                  </form>
                )}

                {tab === "register" && (
                  <form onSubmit={handleRegister} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] uppercase tracking-[2px] text-zinc-500">Username</label>
                      <input
                        type="text" placeholder="PlayerName" value={registerForm.username}
                        onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                        className="rounded border border-zinc-800 bg-[#0a0a0a] px-4 py-3 text-xs text-white outline-none transition focus:border-yellow-300 font-sans"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] uppercase tracking-[2px] text-zinc-500">Email</label>
                      <input
                        type="email" placeholder="player@example.com" value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        className="rounded border border-zinc-800 bg-[#0a0a0a] px-4 py-3 text-xs text-white outline-none transition focus:border-yellow-300 font-sans"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] uppercase tracking-[2px] text-zinc-500">Password</label>
                      <input
                        type="password" placeholder="••••••••" value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        className="rounded border border-zinc-800 bg-[#0a0a0a] px-4 py-3 text-xs text-white outline-none transition focus:border-yellow-300 font-sans"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] uppercase tracking-[2px] text-zinc-500">Confirm Password</label>
                      <input
                        type="password" placeholder="••••••••" value={registerForm.confirm}
                        onChange={(e) => setRegisterForm({ ...registerForm, confirm: e.target.value })}
                        className="rounded border border-zinc-800 bg-[#0a0a0a] px-4 py-3 text-xs text-white outline-none transition focus:border-yellow-300 font-sans"
                      />
                    </div>
                    <button type="submit" disabled={loading} className="mt-4 rounded bg-yellow-400 px-4 py-3 text-[10px] tracking-[2px] text-black transition hover:bg-yellow-300 active:scale-[0.98]">
                      {loading ? "LOADING..." : "CREATE ACCOUNT →"}
                    </button>
                  </form>
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}