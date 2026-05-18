import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import ImagenFrancoVidal from '../assets/Imagen_FrancoVidal.png';
import ImagenManuelEspinozaVasquez from '../assets/Imagen_ManuelEspinozaVasquez.png';
import ImagenCobradorCombi from '../assets/Imagen_CobradorCombi.png';
import ImagenPolloPiosChicken from '../assets/Imagen_PolloPiosChicken.png';

const CHARACTERS = [
  {
    id: 1,
    name: "Franco Vidal",
    rarity: "Legendary",
    price: 45,
    image: ImagenFrancoVidal,
    featured: true,
    gradient: "from-yellow-300 via-yellow-500 to-yellow-900",
    rarityColor: "text-yellow-300",
    border: "border-yellow-400",
    glow: "shadow-[0_0_45px_rgba(250,204,21,0.35)]",
  },
  {
    id: 2,
    name: "Cobrador de Combi",
    rarity: "Rare",
    price: 25,
    image: ImagenCobradorCombi,
    featured: false,
    gradient: "from-blue-400 via-blue-700 to-black",
    rarityColor: "text-blue-300",
    border: "border-blue-500",
    glow: "shadow-[0_0_35px_rgba(59,130,246,0.25)]",
  },
  {
    id: 3,
    name: "Pollo de Pios Chicken",
    rarity: "Epic",
    price: 35,
    image: ImagenPolloPiosChicken,
    featured: false,
    gradient: "from-purple-500 via-fuchsia-700 to-black",
    rarityColor: "text-fuchsia-300",
    border: "border-fuchsia-500",
    glow: "shadow-[0_0_35px_rgba(217,70,239,0.25)]",
  },
  {
    id: 4,
    name: "Ing. Manuel Espinoza Vasquez",
    rarity: "Legendary",
    price: 50,
    image: ImagenManuelEspinozaVasquez,
    featured: true,
    gradient: "from-yellow-200 via-yellow-500 to-yellow-950",
    rarityColor: "text-yellow-300",
    border: "border-yellow-400",
    glow: "shadow-[0_0_45px_rgba(250,204,21,0.35)]",
  },
];

function CosmeticsStore() {
  const [selectedCharacter, setSelectedCharacter] = useState(CHARACTERS[0]);

  return (
    <div
      className="min-h-screen bg-black overflow-hidden relative text-white"
      style={{
        imageRendering: 'pixelated'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-950 to-yellow-950/20" />
      <div className="absolute top-[-200px] left-[-100px] w-[500px] h-[500px] bg-yellow-500/10 blur-[160px] rounded-full" />
      <div className="absolute bottom-[-250px] right-[-100px] w-[500px] h-[500px] bg-orange-500/10 blur-[160px] rounded-full" />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '66px 66px',
        }}
      />
      <div className="relative z-10 px-8 py-8">
        <div className="mb-10">
          <h1 className="
            font-['Press_Start_2P']
            text-4xl lg:text-5xl
            uppercase
            text-yellow-400
            leading-tight
            drop-shadow-[0_0_15px_rgba(250,204,21,0.35)]
          ">
            STREET MARKET
          </h1>
          <p className="
            mt-5
            text-zinc-500
            uppercase
            tracking-[0.35em]
            text-[10px]
            font-['Press_Start_2P']
          ">
            SELECT YOUR FIGHTER
          </p>

        </div>
        <div className="grid lg:grid-cols-[980px_1fr] gap-8 items-start">
          <div className="grid grid-cols-2 gap-6">
            {CHARACTERS.map((character, index) => {
              const isSelected = selectedCharacter.id === character.id;

              return (
                <motion.div
                  key={character.id}
                  onClick={() => setSelectedCharacter(character)}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{
                    scale: 1.02,
                  }}
                  className={`
                    relative overflow-hidden cursor-pointer
                    rounded-[30px]
                    border-2
                    h-[420px]
                    ${character.border}
                    ${character.glow}
                    transition-all duration-300
                    group
                  `}
                >
                  <div className={`
                    absolute inset-0
                    bg-gradient-to-b ${character.gradient}
                  `} />
                  <div className="
                    absolute inset-0
                    bg-gradient-to-t
                    from-black
                    via-black/20
                    to-transparent
                  " />
                  <div className="
                    absolute inset-0
                    opacity-0
                    group-hover:opacity-100
                    transition-all duration-500
                    bg-white/[0.03]
                  " />
                  {character.featured && (
                    <div className="
                      absolute top-5 left-5
                      bg-yellow-400
                      text-black
                      font-['Press_Start_2P']
                      uppercase
                      text-[9px]
                      px-4 py-3
                      rounded-full
                      z-30
                      tracking-wider
                      shadow-lg
                    ">
                      FEATURED
                    </div>
                  )}
                  <motion.img
                    src={character.image}
                    alt={character.name}
                    animate={{
                      y: [-4, 4, -4],
                    }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{
                      imageRendering: 'pixelated',
                      filter: 'contrast(1.05) saturate(1.05)'
                    }}
                    className="
                      absolute
                      inset-0
                      m-auto
                      h-[72%]
                      w-[88%]
                      object-contain
                      z-20
                      pointer-events-none
                      transition-transform duration-300
                      group-hover:scale-105
                      drop-shadow-[0_0_18px_rgba(0,0,0,0.5)]
                    "
                  />
                  <div className="
                    absolute bottom-0 left-0 right-0
                    z-30
                    p-6
                    bg-gradient-to-t
                    from-black
                    via-black/90
                    to-transparent
                  ">
                    <p className={`
                      uppercase
                      text-[9px]
                      mb-3
                      tracking-[0.25em]
                      font-['Press_Start_2P']
                      ${character.rarityColor}
                    `}>
                      {character.rarity}
                    </p>
                    <h2 className="
                      uppercase
                      leading-[1.45]
                      text-white
                      font-['Press_Start_2P']
                      text-[18px]
                      drop-shadow-lg
                    ">
                      {character.name}
                    </h2>
                    <div className="
                      mt-5
                      flex items-center gap-3
                      font-['Press_Start_2P']
                    ">
                      <span className="
                        text-yellow-400
                        text-[16px]
                      ">
                        S/
                      </span>
                      <span className="
                        text-white
                        text-[24px]
                      ">
                        {character.price}
                      </span>

                    </div>
                  </div>

                  {isSelected && (
                    <>
                      <motion.div
                        layoutId="activeCard"
                        className="
                          absolute inset-0
                          border-[4px]
                          border-white
                          rounded-[30px]
                          z-40
                        "
                      />
                      <div className="
                        absolute inset-0
                        bg-white/5
                        z-30
                      " />
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="
            relative
            min-h-[760px]
            flex items-center justify-center
          ">
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                opacity: [0.25, 0.4, 0.25],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
              className="
                absolute
                w-[500px]
                h-[500px]
                rounded-full
                bg-yellow-400/20
                blur-[120px]
              "
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCharacter.id}
                initial={{
                  opacity: 0,
                  x: 60,
                  scale: 0.92,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.92,
                }}
                transition={{
                  duration: 0.35,
                }}
                className="relative flex flex-col items-center justify-center"
              >
                <motion.img
                  src={selectedCharacter.image}
                  alt={selectedCharacter.name}
                  animate={{
                    y: [0, -14, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                  }}
                  style={{
                    imageRendering: 'pixelated',
                    filter: 'contrast(1.05) saturate(1.05)'
                  }}
                  className="
                    h-[700px]
                    max-w-[100%]
                    object-contain
                    relative z-10
                    drop-shadow-[0_0_40px_rgba(250,204,21,0.25)]
                  "
                />
                <div className="
                  absolute bottom-[35px]
                  w-[260px]
                  h-[28px]
                  bg-black/50
                  blur-2xl
                  rounded-full
                " />
                <div className="
                  absolute
                  -bottom-[95px]
                  bg-black/65
                  border border-zinc-800
                  backdrop-blur-xl
                  rounded-2xl
                  px-5 py-4
                  w-[320px]
                  z-20
                  shadow-2xl
                ">
                  <p className={`
                    uppercase
                    text-[8px]
                    tracking-[0.3em]
                    mb-3
                    font-['Press_Start_2P']
                    ${selectedCharacter.rarityColor}
                  `}>
                    {selectedCharacter.rarity}
                  </p>
                  <h2 className="
                    text-[18px]
                    uppercase
                    font-['Press_Start_2P']
                    leading-[1.5]
                    mb-5
                  ">
                    {selectedCharacter.name}
                  </h2>
                  <button className="
                    font-['Press_Start_2P']
                    bg-yellow-400
                    hover:bg-white
                    text-black
                    uppercase
                    w-full
                    py-4
                    rounded-xl
                    text-[9px]
                    transition-all
                    active:scale-95
                    shadow-[0_0_30px_rgba(250,204,21,0.35)]
                  ">
                    Buy
                  </button>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
export default CosmeticsStore;