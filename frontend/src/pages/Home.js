import Lobby from '../components/Lobby';
import wasd from '../assets/wasd-teclas.png';
import teclas from '../assets/moveteclas-img-pls.png';
import combatetecla from '../assets/tecla-combate-img.png';
import tecla1 from '../assets/tecla1-img.png';
import tecla2 from '../assets/tecla2-img.png';
import tecla3 from '../assets/tecla3-img.png';
import tecla4 from '../assets/tecla4-img.png';

function Home() {
    return (
        <div className="background relative flex flex-col items-center w-full bg-[#0a0a0a] text-white font-dogica pt-8 min-h-[90vh]">            
            
            {/* FONDO ANIMADO / DEGRADADO */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,220,50,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,220,50,0.04) 1px, transparent 1px)`,
                        backgroundSize: "48px 48px",
                    }}
                />
                <div className="absolute bottom-[-120px] left-1/2 h-[300px] w-[600px] -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(255,220,50,0.08)_0%,transparent_70%)]" />
            </div>

            {/* VISTA MOBILE/TABLET */}
            <div className="relative z-10 flex lg:hidden flex-col items-center justify-center text-center px-6 min-h-[60vh]">
                <div className="w-24 h-24 mb-6 border-4 border-yellow-400 rounded-full flex items-center justify-center bg-black shadow-[0_0_30px_rgba(255,220,50,0.5)] text-yellow-400 text-5xl">
                    !
                </div>
                <h1 className="text-xl md:text-2xl text-yellow-400 tracking-widest mb-4 leading-relaxed">
                    PC EXCLUSIVE
                </h1>
                <p className="text-[10px] md:text-xs text-zinc-400 leading-loose max-w-[300px]">
                    THIS GAME REQUIRES A KEYBOARD AND MOUSE. <br/><br/>
                    <span className="text-white">PLEASE SWITCH TO A DESKTOP DEVICE TO ENTER THE LOBBY.</span>
                </p>
                <p className="mt-12 text-[8px] text-zinc-600 tracking-widest">
                    ( YOU CAN STILL BROWSE THE SHOP )
                </p>
            </div>

            {/* VISTA DESKTOP */}
            <div className="hidden lg:block w-full">
                
                <Lobby />

                <hr className="w-full border-zinc-800 my-8"></hr>

                {/* TUTORIAL / HOW TO PLAY */}
                <div className="relative z-10 w-full max-w-[1000px] mx-auto p-5 mb-12">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl text-yellow-400 tracking-widest shadow-pixelart inline-block px-6 py-2 border border-yellow-400/30 bg-yellow-400/10">
                            HOW TO PLAY
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#111] border border-zinc-800 rounded text-sm flex flex-col items-center p-6 shadow-2xl hover:border-zinc-600 transition-colors">
                            <p className="mb-4 tracking-widest text-zinc-400">MOVEMENT</p>
                            <div className="flex items-center gap-6">
                                <img src={wasd} alt="wasd controls" className="w-[70px] h-[70px] rendering-pixelated" />
                                <span className="text-zinc-600 text-xl">OR</span>
                                <img src={teclas} alt="arrow controls" className="w-[70px] h-[70px] rendering-pixelated" />
                            </div>
                        </div>

                        <div className="bg-[#111] border border-zinc-800 rounded text-sm flex flex-col items-center p-6 shadow-2xl hover:border-zinc-600 transition-colors">
                            <p className="mb-4 tracking-widest text-zinc-400">BASIC ATTACK</p>
                            <img src={combatetecla} alt="attack controls" className="w-[70px] h-[70px] rendering-pixelated" />
                        </div>

                        <div className="bg-[#111] border border-zinc-800 rounded text-sm flex flex-col items-center p-6 shadow-2xl hover:border-zinc-600 transition-colors">
                            <p className="mb-4 tracking-widest text-zinc-400">SPECIAL ATTACK</p>
                            <img src={combatetecla} alt="special attack controls" className="w-[70px] h-[70px] rendering-pixelated filter hue-rotate-90" />
                        </div>

                        <div className="bg-[#111] border border-zinc-800 rounded text-sm flex flex-col items-center p-6 shadow-2xl hover:border-zinc-600 transition-colors">
                            <p className="mb-4 tracking-widest text-zinc-400">USE ITEMS</p>
                            <div className="flex items-center gap-4">
                                <img src={tecla1} alt="item 1" className="w-[50px] h-[50px] rendering-pixelated" />
                                <img src={tecla2} alt="item 2" className="w-[50px] h-[50px] rendering-pixelated" />
                                <img src={tecla3} alt="item 3" className="w-[50px] h-[50px] rendering-pixelated" />
                                <img src={tecla4} alt="item 4" className="w-[50px] h-[50px] rendering-pixelated" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;