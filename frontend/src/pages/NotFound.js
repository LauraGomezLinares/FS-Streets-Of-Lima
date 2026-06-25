import { Link } from "react-router-dom";
import yapesito from "../assets/yapesitoproy.png"

export default function NotFound(){
    return(
        <div className="min-h-screen bg-black overflow-hidden relative text-white ">
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute inset-0"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,220,50,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,220,50,0.04) 1px, transparent 1px)`,
                        backgroundSize: "48px 48px",
                    }}
                />
                <div className="absolute bottom-[-120px] left-1/2 h-[300px] w-[600px] -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(255,220,50,0.08)_0%,transparent_70%)]" />
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center text-center px-8 min-h-screen">

                <img src={yapesito} alt="yapesito?" className="w-[425px] object-contain mb-2"
                     style={{ imageRendering: 'pixelated'}}></img>
                    
                <h1 className="font-dogica text-zinc-400 text-2xl tracking-widest my-3">ERROR 404 - PAGE NOT FOUND.</h1>

                <p className="font-dogica text-zinc-500 text-[15px] leading-relaxed max-w-[360px] mb-10">Most likely due to insufficient funds.</p>

                <h1 className="font-dogica text-yellow-400 text-3xl uppercase mt-4 mb-4 drop-shadow-[0_0_45px_rgba(250,204,21,0.75)]">YAPESITO?</h1>

                <p className="font-dogica text-zinc-600 text-[9px] leading-loose max-w-[400px] mb-10">
                    It's for a good cause. If you're not comfortable, you can always go back to the{' '}
                    <Link to="/" className="text-yellow-400 hover:text-white transition-colors underline underline-offset-4">
                        HOME
                    </Link> page, if you want. 
                </p>
            </div>
        </div>
    );
}