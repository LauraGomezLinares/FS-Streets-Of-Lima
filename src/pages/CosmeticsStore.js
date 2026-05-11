import React from 'react';
import { motion } from 'framer-motion';

import ImagenFrancoVidal from '../assets/Imagen_FrancoVidal.png';
import ImagenManuelEspinozaVasquez from '../assets/Imagen_ManuelEspinozaVasquez.png';
import ImagenViringoMascota from '../assets/Imagen_ViringoMascota.png';
import ImagenBrilloInka from '../assets/Imagen_BrilloInka.png';
import ImagenMochilaRappi from '../assets/Imagen_MochilaRappi.png';
import ImagenEfectoGaa from '../assets/Imagen_EfectoGaa.png';

const COSMETICS = [
    { id: 1, name: "Skin: Alcalde Franco Vidal", price: 45, category: "Skin", rarity: "Legendary", image: ImagenFrancoVidal },
    { id: 2, name: "Skin: Ing. Manuel Espinoza", price: 50, category: "Skin", rarity: "Legendary", image: ImagenManuelEspinozaVasquez },
    { id: 3, name: "Mascota: Viringo Fighter", price: 40, category: "Mascota", rarity: "Legendary", image: ImagenViringoMascota },
    { id: 4, name: "Aura: Brillo Inkaico", price: 30, category: "Efecto", rarity: "Epic", image: ImagenBrilloInka },
    { id: 5, name: "Accesorio: Mochila de Rappi", price: 20, category: "Equipo", rarity: "Rare", image: ImagenMochilaRappi },
    { id: 6, name: "Efecto K.O: ¡GAAAA!", price: 20, category: "Efecto", rarity: "Rare", image: ImagenEfectoGaa },
];

function CosmeticsStore() {
    return (
        <div className="min-h-screen bg-black text-white p-8 font-sans">
            <header className="mb-12 pb-6">
                <h1 className="text-4xl font-bold tracking-tighter uppercase italic text-yellow-400">
                    Tienda de Cosméticos
                </h1>
                <p className="text-gray-400 mt-2 tracking-widest text-xs uppercase">
                    Personaliza tu estilo en las calles de la capital
                </p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {COSMETICS.map((item) => (
                    <motion.div 
                        key={item.id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-zinc-900 border border-zinc-800 p-4 rounded-sm relative overflow-hidden group hover:border-yellow-400 transition-colors flex flex-col"
                    >
                        <div className="aspect-video bg-transparent mb-4 flex items-center justify-center border border-zinc-700 overflow-hidden relative rounded-sm">
                           {item.image ? (
                               <img 
                                   src={item.image} 
                                   alt={item.name} 
                                   className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                               />
                           ) : (
                               <span className="text-zinc-600 font-bold uppercase text-[10px] tracking-[0.2em]">Asset_Missing</span>
                           )}
                           
                           <div className={`absolute top-0 left-0 w-1 h-full z-10 ${
                               item.rarity === 'Legendary' ? 'bg-orange-500' : 
                               item.rarity === 'Epic' ? 'bg-purple-500' : 'bg-blue-500'
                           }`} />
                        </div>

                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="text-[10px] uppercase text-yellow-500 font-bold tracking-widest mb-1">
                                    {item.category}
                                </p>
                                <h2 className="text-lg font-bold leading-none mb-1 text-white">{item.name}</h2>
                            </div>
                            <span className="text-[10px] bg-zinc-800 px-2 py-1 rounded text-zinc-400 uppercase font-medium">
                                {item.rarity}
                            </span>
                        </div>

                        <div className="flex-grow"></div>

                        <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-4">
                            <div className="flex items-center gap-1">
                                <span className="text-yellow-400 font-bold text-sm">S/</span>
                                <span className="text-2xl font-black tracking-tighter text-white">{item.price}</span>
                            </div>
                            <button className="bg-yellow-400 text-black px-5 py-2.5 text-xs font-black uppercase rounded-sm hover:bg-white transition-all active:scale-95 shadow-md">
                                Comprar
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export default CosmeticsStore;