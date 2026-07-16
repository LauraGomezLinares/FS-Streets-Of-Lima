import React from 'react';
import { motion } from 'framer-motion';

const SUNNY_PACKS = [
    { id: 1, amount: 1000, price: "9.99", name: "POCKET SUNNYS", bonus: null, glow: "hover:shadow-[0_0_20px_rgba(255,220,50,0.2)]", image: "/sunnys1.png" },
    { id: 2, amount: 2800, price: "24.99", name: "STASH SUNNYS", bonus: "+300 BONUS", glow: "hover:shadow-[0_0_30px_rgba(255,220,50,0.4)]", image: "/sunnys2.png" },
    { id: 3, amount: 5000, price: "39.99", name: "VAULT SUNNYS", bonus: "+1000 BONUS", glow: "hover:shadow-[0_0_40px_rgba(255,220,50,0.6)]", image: "/sunnys3.png" },
    { id: 4, amount: 13500, price: "99.99", name: "TREASURE SUNNYS", bonus: "BEST VALUE", glow: "hover:shadow-[0_0_60px_rgba(255,220,50,0.8)]", isPopular: true, image: "/sunnys4.png" },
];

function PremiumStore() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-sans overflow-hidden relative">

            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,220,50,0.05)_0%,transparent_70%)] pointer-events-none" />
            <div className="absolute top-[-200px] right-[-100px] w-[500px] h-[500px] bg-yellow-500/10 blur-[160px] rounded-full pointer-events-none" />

            {/* Cabecera */}
            <header className="relative z-10 mb-16 mt-8 text-center flex flex-col items-center">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-dogica uppercase text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.4)] mb-4"
                >
                    SUNNYS STORE
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-zinc-400 tracking-[0.2em] text-xs font-dogica uppercase"
                >
                    GET PREMIUM CURRENCY FOR EXCLUSIVE ITEMS
                </motion.p>
            </header>

            {/* Grid de 4 Pilares */}
            <div className="relative z-10 max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                {SUNNY_PACKS.map((pack, index) => (
                    <motion.div
                        key={pack.id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.15, type: "spring", stiffness: 100 }}
                        whileHover={{ y: -10 }}
                        className={`relative flex flex-col bg-[#111] border rounded-xl overflow-hidden transition-all duration-300 ${pack.glow} ${pack.isPopular ? 'border-yellow-400' : 'border-zinc-800'}`}
                    >
                        {pack.isPopular && (
                            <div className="absolute top-0 left-0 right-0 bg-yellow-400 text-black text-center text-[9px] font-dogica py-1.5 tracking-widest z-20">
                                MOST POPULAR
                            </div>
                        )}

                        <div className={`pt-10 pb-6 text-center ${pack.isPopular ? 'bg-gradient-to-b from-yellow-400/10 to-transparent' : ''}`}>
                            <h2 className="text-3xl font-black text-white tracking-tighter drop-shadow-md">
                                {pack.amount.toLocaleString()}
                            </h2>
                            <p className="text-yellow-400 text-[10px] font-dogica mt-2">SUNNYS</p>
                        </div>

                        {/* IMAGEN */}
                        <div className="h-[180px] w-full bg-zinc-900 border-y border-zinc-800 flex flex-col items-center justify-center relative group p-4">
                            {pack.image ? (
                                <img src={pack.image} alt={pack.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                            ) : (
                                <span className="text-zinc-700 font-dogica text-[8px] uppercase tracking-widest">
                                    [ ASSET_TIER_{pack.id} ]
                                </span>
                            )}
                        </div>

                        {/* Abajo: Precio y Bonus */}
                        <div className="p-6 flex flex-col flex-grow justify-end">
                            {pack.bonus ? (
                                <div className="text-center mb-4 text-[10px] text-green-400 font-dogica tracking-widest">
                                    {pack.bonus}
                                </div>
                            ) : (
                                <div className="mb-4 h-[14px]"></div>
                            )}

                            <button className={`w-full py-4 rounded font-dogica text-[11px] tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 ${pack.isPopular ? 'bg-yellow-400 text-black hover:bg-white shadow-[0_0_20px_rgba(255,220,50,0.3)]' : 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700'}`}>
                                <span>$</span>{pack.price}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

        </div>
    );
}

export default PremiumStore;