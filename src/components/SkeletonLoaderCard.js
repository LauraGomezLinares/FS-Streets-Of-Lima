export default function SkeletonLoaderCard(){
    return(
        <div className="relative overflow-hidden rounded-[30px] border-2 border-zinc-800 h-[420px] bg-zinc-950">
      
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r 
                from-transparent via-white/[0.04] to-transparent" />
            
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-black" />

            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[65%] h-[35%] rounded-2xl bg-zinc-800 animate-pulse" />
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 
                to-transparent">
                
                <div className="h-[10px] w-[45%] rounded-full bg-zinc-700 animate-pulse mb-3" />
                
                <div className="h-[20px] w-[75%] rounded-lg bg-zinc-700 animate-pulse mb-5" />

                <div className="flex items-center gap-3">
                    <div className="h-[22px] w-[20px] rounded bg-zinc-700 animate-pulse" />
                    <div className="h-[28px] w-[60px] rounded bg-zinc-700 animate-pulse" />
                </div>
                

            </div>
        </div>

    );
}