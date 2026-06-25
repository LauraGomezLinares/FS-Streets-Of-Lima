import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext"; 

export default function AdminDashboard() {
  const { token } = useAuth(); 
  const API_URL = "http://localhost:4000";

  const [usersList, setUsersList] = useState([]);
  const [stats, setStats] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setError("");
    try {
      const usersRes = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usersData = await usersRes.json();

      const statsRes = await fetch(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statsData = await statsRes.json();

      if (!usersRes.ok || !statsRes.ok) {
        throw new Error("ACCESS_DENIED: INVALID_CREDENTIALS");
      }

      setUsersList(usersData);
      setStats(statsData);
    } catch (err) {
      setError(err.message || "CONNECTION_ERROR");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token, fetchData]);

  const handleBanToggle = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}/ban`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "ERROR_CHANGING_USER_STATUS");
        return;
      }

      fetchData();
    } catch (err) {
      console.error("Failed to toggle ban status:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-dogica p-8 flex items-center justify-center text-xs tracking-widest">
        &gt; CONNECTING_TO_SERVER...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-red-500 font-dogica p-8 flex flex-col items-center justify-center gap-4 text-xs tracking-widest">
        <div>⚠ ERROR: {error}</div>
        <button onClick={fetchData} className="border border-red-500 bg-red-950/20 px-4 py-2 hover:bg-red-500 hover:text-black transition-colors">
          RETRY_CONNECTION
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-500 font-dogica p-8 relative overflow-hidden flex flex-col items-center">
      
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-50 opacity-50" />
      
      <div className="relative z-10 w-full max-w-5xl mt-10">
        
        <header className="mb-10 border-b-2 border-green-500/50 pb-4 flex justify-between items-end">
          <div>
            <motion.h1 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
              className="text-3xl tracking-widest drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]"
            >
              SYS.ADMIN_TERMINAL_
            </motion.h1>
            <p className="text-[10px] text-green-700 mt-2 tracking-[0.3em]">UNAUTHORIZED ACCESS IS STRICTLY PROHIBITED</p>
          </div>
          <div className="text-right text-[10px] text-green-400">
            STATUS: <span className="text-white">ONLINE</span> <br/>
            BANNED: <span className="text-red-500">{stats?.totalBanned || 0}</span> <br/>
            REGISTERED USERS: <span className="text-white">{usersList.length}</span>
          </div>
        </header>

        <div className="bg-green-950/20 border border-green-900 p-6 rounded mb-8">
          <h2 className="text-sm mb-6 text-green-400 tracking-widest">&gt; USER_DATABASE_QUERY:</h2>
          
          <div className="grid grid-cols-4 gap-4 border-b border-green-900 pb-2 text-[10px] text-green-600 tracking-widest mb-4">
            <div>USERNAME</div>
            <div>EMAIL</div>
            <div>STATUS</div>
            <div className="text-right">ACTION</div>
          </div>

          <div className="flex flex-col gap-4">
            {usersList.length > 0 ? (
              usersList.map((u, i) => (
                <div key={u.id || i} className="grid grid-cols-4 gap-4 items-center bg-green-900/10 p-3 border border-green-900/50 hover:bg-green-900/30 transition-colors">
                  <div className="text-xs text-green-300">{u.username}</div>
                  <div className="text-[9px] text-green-500 truncate">{u.email}</div>
                  
                  <div className={`text-[9px] ${u.isBanned ? "text-red-500" : "text-yellow-500"}`}>
                    {u.isBanned ? "SUSPENDED_PLAYER" : "ACTIVE_PLAYER"}
                  </div>

                  <div className="text-right">
                    <button 
                      onClick={() => handleBanToggle(u.id)}
                      disabled={u.role === "ADMIN"} 
                      className={`border px-3 py-1 text-[8px] transition-colors ${
                        u.role === "ADMIN"
                          ? "border-zinc-800 text-zinc-600 cursor-not-allowed bg-transparent"
                          : u.isBanned
                          ? "bg-green-900/50 text-green-400 border-green-700 hover:bg-green-400 hover:text-black"
                          : "bg-red-900/50 text-red-500 border-red-900 hover:bg-red-500 hover:text-black"
                      }`}
                    >
                      {u.isBanned ? "UNBAN" : "BAN"}
                    </button>
                  </div> {/* 👈 Corregido a div limpio aquí */}
                </div>
              ))
            ) : (
              <div className="text-xs text-green-700 text-center py-10">NO USERS FOUND IN DATABASE.</div>
            )}
          </div>
        </div>

        {stats?.recentLogins && (
          <div className="bg-green-950/20 border border-green-900 p-6 rounded">
            <h2 className="text-sm mb-6 text-green-400 tracking-widest">&gt; SECURITY_AUDIT_LOGS:</h2>
            <div className="flex flex-col gap-3 font-mono text-[9px] text-green-600">
              {stats.recentLogins.map((log) => (
                <div key={log.id} className="flex justify-between items-center bg-green-950/10 border border-green-900/30 p-2 hover:bg-green-900/20 transition-colors">
                  <div>
                    <span className="text-green-300 font-semibold">&gt;&gt; USER_LOGIN:</span>{" "}
                    <span className="text-white">{log.user?.username || "UNKNOWN"}</span>{" "}
                    <span className="text-green-700">({log.user?.email})</span>
                  </div>
                  <div className="text-green-500 font-sans">
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}