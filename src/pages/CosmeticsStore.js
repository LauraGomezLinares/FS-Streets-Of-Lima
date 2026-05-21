import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SkeletonLoader from '../components/SkeletonLoaderCard';
import SkeletonLoaderChara from '../components/SkeletonLoaderChara';

import CharactersCardStore from '../components/CharacterCardStore';

function CosmeticsStore() {
  //test para componente reutilizable y skeleton loader
  const [Characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const skeletonNrocuadros = 4;

  const [selectedCharacter, setSelectedCharacter] = useState(null);

  //test
  useEffect(() => {
    const fetchCharacters = async () => {
      try{
        const rpta = await fetch('/Characters.json');
        const data = await rpta.json();

        setCharacters(data);
        //setSelectedCharacter(data?.[0] ?? null); //si es q hay chara se agarra el primero sino null
      }catch (error){
        console.log("Error lol: ", error);
      } finally{
        //setLoading(false);
      }
    };
    fetchCharacters();
  }, [])

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
          <h1 className=" font-['Press_Start_2P'] text-4xl lg:text-5xl uppercase text-yellow-400 leading-tight
            drop-shadow-[0_0_15px_rgba(250,204,21,0.35)] ">
            STREET MARKET
          </h1>
          <p className=" mt-5 text-zinc-500 uppercase  tracking-[0.35em]  text-[10px] font-['Press_Start_2P']">
            SELECT YOUR FIGHTER
          </p>

        </div>
        <div className="grid lg:grid-cols-[980px_1fr] gap-8 items-start">
          <div className="grid grid-cols-2 gap-6">
            {loading ? (
              [...Array(skeletonNrocuadros)].map((_, i) => <SkeletonLoader key={i}/>)
              
            ) : (
              Characters.map((character, index) => (
                <CharactersCardStore
                  key={character.id}
                  character={character}
                  index={index}
                  isSelected={selectedCharacter?.id === character.id}
                  onSelect={setSelectedCharacter}
                />
              ))
            )}
          </div>

          <div className=" relative min-h-[760px] flex items-center justify-center">
            <motion.div animate={{scale: [1, 1.08, 1],  opacity: [0.25, 0.4, 0.25],}} transition={{ duration: 4,
                repeat: Infinity, }} className="absolute  w-[500px]  h-[500px] rounded-full bg-yellow-400/20 blur-[120px] "/>

            {selectedCharacter ? (
              <AnimatePresence mode="wait">
                <motion.div key={selectedCharacter.id} initial={{opacity: 0, x: 60, scale: 0.92, }} animate={{ opacity: 1,
                    x: 0, scale: 1, }} exit={{ opacity: 0,scale: 0.92, }} transition={{duration: 0.35, }}
                  className="relative flex flex-col items-center justify-center" >

                  <motion.img src={selectedCharacter.image} alt={selectedCharacter.name}  animate={{ y: [0, -14, 0], }}
                    transition={{ duration: 4, repeat: Infinity, }} style={{imageRendering: 'pixelated', 
                      filter: 'contrast(1.05) saturate(1.05)' }} className=" h-[700px] max-w-[100%] object-contain
                      relative z-10 drop-shadow-[0_0_40px_rgba(250,204,21,0.25)] "/>

                  <div className=" absolute bottom-[35px] w-[260px] h-[28px]  bg-black/50  blur-2xl  rounded-full " />
                  <div className=" absolute  -bottom-[95px] bg-black/65  border border-zinc-800  backdrop-blur-xl  rounded-2xl
                    px-5 py-4  w-[320px]  z-20 shadow-2xl">
                    <p className={` uppercase text-[8px] tracking-[0.3em] mb-3 font-['Press_Start_2P'] 
                      ${selectedCharacter.rarityColor}  `}>
                      {selectedCharacter.rarity}
                    </p>
                    <h2 className="  text-[18px] uppercase font-['Press_Start_2P']  leading-[1.5] mb-5 ">
                      {selectedCharacter.name}
                    </h2>
                    <button className=" font-['Press_Start_2P'] bg-yellow-400 hover:bg-white text-black uppercase
                      w-full py-4 rounded-xl text-[9px] transition-all active:scale-95 shadow-[0_0_30px_rgba(250,204,21,0.35)]">
                      Buy
                    </button>
                  </div>

                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="relative flex items-center justify-center text-white text-sm">
                <SkeletonLoaderChara></SkeletonLoaderChara>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default CosmeticsStore;