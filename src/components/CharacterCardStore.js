import React from "react";
import { motion } from "framer-motion";

function CharactersCardStore({ character, index, isSelected, onSelect }) {
  

  return (
    <motion.div onClick={() => onSelect(character)} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }} whileHover={{ scale: 1.02 }} className={`relative overflow-hidden cursor-pointer 
      rounded-[30px] border-2 h-[420px] ${character.border} ${character.glow} transition-all duration-300 group`}>

      <div className={`absolute inset-0 bg-gradient-to-b ${character.gradient}`} />

      <div className=" absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent "/>

      <div className=" absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-white/[0.03] "/>
      {character.featured && (
        <div className=" absolute top-5 left-5  bg-yellow-400  text-black  font-['Press_Start_2P']  uppercase  text-[9px]  px-4 py-3  
          rounded-full z-30 tracking-wider shadow-lg " > FEATURED </div>
      )}
      <motion.img src={character.image} alt={character.name} animate={{ y: [-4, 4, -4], }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", }}
        style={{ imageRendering: "pixelated", filter: "contrast(1.05) saturate(1.05)", }}
        className="  absolute inset-0  m-auto  h-[72%]  w-[88%] object-contain z-20 pointer-events-none transition-transform duration-300 group-hover:scale-105
         drop-shadow-[0_0_18px_rgba(0,0,0,0.5)] " />
      <div className=" absolute bottom-0 left-0 right-0 z-30  p-6 bg-gradient-to-t from-black via-black/90  to-transparent ">

        <p className={` uppercase text-[9px] mb-3  tracking-[0.25em] font-['Press_Start_2P']  ${character.rarityColor}`} >
          {character.rarity}
        </p>

        <h2 className=" uppercase  leading-[1.45]  text-white  font-['Press_Start_2P'] text-[18px] drop-shadow-lg  ">
          {character.name}
        </h2>

        <div className=" mt-5  flex items-center gap-3 font-['Press_Start_2P'] " >
          <span className=" text-yellow-400 text-[16px]  ">
            S/
          </span>

          <span className=" text-white  text-[24px] ">
            {character.price}
          </span>

        </div>

      </div>

      {isSelected && (
        <>
          <motion.div layoutId="activeCard" className=" absolute inset-0 border-[4px] border-white rounded-[30px]  z-40 " />
          <div className=" absolute inset-0 bg-white/5 z-30"/>
        </>
      )}
    </motion.div>
  );
}

export default CharactersCardStore;
