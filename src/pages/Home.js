import wasd from '../assets/wasd-teclas.png';
import teclas from '../assets/moveteclas-img-pls.png';
import combatetecla from '../assets/tecla-combate-img.png';
import tecla1 from '../assets/tecla1-img.png';
import tecla2 from '../assets/tecla2-img.png';
import tecla3 from '../assets/tecla3-img.png';
import tecla4 from '../assets/tecla4-img.png';
import CardGame from '../components/CardGame';

function Home() {
    return (
        <div className="background relative flex flex-col min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0a] text-white font-dogica">
            

            <div className="absolute inset-0 pointer-events-none">
                <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `
                    linear-gradient(rgba(255,220,50,0.04) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,220,50,0.04) 1px, transparent 1px)
                    `,
                    backgroundSize: "48px 48px",
                }}
                />
                <div className="absolute bottom-[-120px] left-1/2 h-[300px] w-[600px] -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(255,220,50,0.08)_0%,transparent_70%)]" />
            </div>


            
            <div className="msg text-center p-4">
                <h1 className="text-white font-karmaticarcade text-7xl p-4">help!</h1>
            </div>
            

            {/* cardgame aun */}
            <CardGame></CardGame>

            <hr className="my-8 h-px border-8 "></hr>

            <div className="comojugar grid grid-cols-2 gap-3 gap-x-9 p-5 ">

                <div className="how-to-play rounded-none col-span-2 text-3xl p-4 shadow-pixelart">
                    <p>Como Jugar</p>
                </div>

                <div className="movement rounded-none text-lg flex items-center gap-5 p-4 shadow-pixelart">
                    <p className='p-4'>Movimiento</p>
                    <div className='flex items-center p-4 gap-4'>
                        <img src={wasd} alt="wasdcontrols" className='w-[90px] h-[90px]'/> /
                        <img src={teclas} alt='movecontrols' className='w-[90px] h-[90px]'></img>
                    </div>
                </div>

                <div className="attack  rounded-none text-lg flex items-center gap-5 p-4 shadow-pixelart">
                    <p className='p-4'>Ataque</p>
                    <div className='flex items-center p-4'>
                        <img src={combatetecla} alt='attackcontrols' className='w-[90px] h-[90px]'></img>
                    </div>
                    
                </div>

                <div className="special-attack  rounded-none text-lg flex items-center gap-5 p-4 shadow-pixelart">
                    <p className='p-4'>Ataque Especial</p>
                    <div className='flex items-center p-4'>
                        <img src={combatetecla} alt='specialattackcontrols' className='w-[90px] h-[90px]'></img>
                    </div>
                </div>

                <div className="items  rounded-none text-lg flex items-center gap-5 p-4 shadow-pixelart ">
                    <p className='p-4'>Items</p>
                    <div className='flex items-center justify-evenly p-4 gap-2'>
                        <img src={tecla1} alt='item1' className='w-[80px] h-[80px]'></img>
                        <img src={tecla2} alt='item2' className='w-[80px] h-[80px]'></img>
                        <img src={tecla3} alt='item3' className='w-[80px] h-[80px]'></img>
                        <img src={tecla4} alt='item4' className='w-[80px] h-[80px]'></img>
                    </div>
                </div>

            </div>
        </div>
        
    );
}

export default Home