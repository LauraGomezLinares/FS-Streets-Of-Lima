import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginModal() {
  const { isLoginModalOpen, setLoginModalOpen, login, register } = useAuth();
  const [tab, setTab] = useState("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ username: "", email: "", password: "", confirm: "" });

  if (!isLoginModalOpen) return null; 

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!loginForm.email || !loginForm.password) return setError("Fill all fields.");
    
    setLoading(true);
    try {
      login({ email: loginForm.email, password: loginForm.password });
    } catch (err) {
      setError("Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (!registerForm.username || !registerForm.email || !registerForm.password || !registerForm.confirm) 
      return setError("Fill all fields.");
    if (registerForm.password !== registerForm.confirm) 
      return setError("Passwords do not match.");
    if (registerForm.password.length < 6) 
      return setError("Password must be at least 6 characters.");
    
    setLoading(true);
    try {
      register({ email: registerForm.email, username: registerForm.username, password: registerForm.password });
    } catch (err) {
      setError("Email already registered.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 font-dogica transition-opacity">
      <div className="relative w-full max-w-[420px] rounded border border-zinc-800 bg-[#111] p-7 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        
        {}
        <button 
          onClick={() => setLoginModalOpen(false)}
          className="absolute top-4 right-5 text-zinc-500 hover:text-red-500 transition-colors text-lg"
        >
          X
        </button>

        {/* Tabs */}
        <div className="mb-6 flex border-b border-zinc-800 mt-2">
          <button
            onClick={() => { setTab("login"); setError(""); }}
            className={`flex-1 border-b-2 pb-3 text-[11px] uppercase tracking-[1px] transition ${tab === "login" ? "border-yellow-300 text-yellow-300" : "border-transparent text-zinc-600 hover:text-zinc-400"}`}
          >
            LOG IN
          </button>
          <button
            onClick={() => { setTab("register"); setError(""); }}
            className={`flex-1 border-b-2 pb-3 text-[11px] uppercase tracking-[1px] transition ${tab === "register" ? "border-yellow-300 text-yellow-300" : "border-transparent text-zinc-600 hover:text-zinc-400"}`}
          >
            REGISTER
          </button>
        </div>

        {/* Error Mgs */}
        {error && (
          <div className="mb-4 rounded border border-red-900/50 bg-red-900/20 px-3 py-2 text-[9px] tracking-widest text-red-400">
            ⚠ {error}
          </div>
        )}

        {/* LOGIN FORM */}
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
              {loading ? "LOADING..." : "ENTER GAME →"}
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
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

      </div>
    </div>
  );
}