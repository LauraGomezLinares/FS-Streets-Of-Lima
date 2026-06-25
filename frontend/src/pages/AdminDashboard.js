import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("sol_users")) || [];
    setUsersList(users);
  }, []);

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
            REGISTERED USERS: <span className="text-white">{usersList.length}</span>
          </div>
        </header>

        <div className="bg-green-950/20 border border-green-900 p-6 rounded">
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
                <div key={i} className="grid grid-cols-4 gap-4 items-center bg-green-900/10 p-3 border border-green-900/50 hover:bg-green-900/30 transition-colors">
                  <div className="text-xs text-green-300">{u.username}</div>
                  <div className="text-[9px] text-green-500 truncate">{u.email}</div>
                  <div className="text-[9px] text-yellow-500">ACTIVE_PLAYER</div>
                  <div className="text-right">
                    <button className="bg-red-900/50 text-red-500 border border-red-900 px-3 py-1 text-[8px] hover:bg-red-500 hover:text-black transition-colors">
                      BAN
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-green-700 text-center py-10">NO USERS FOUND IN DATABASE.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}