export default function SkeletonLoaderChara(){
    return(
        <div className="relative min-h-[760px] flex items-center justify-center">

      <div className="absolute w-[600px] h-[600px] rounded-full bg-yellow-400/10 blur-[120px] animate-pulse" />

      <div className="relative overflow-hidden rounded-[30px] border-2 border-zinc-800 w-[320px] h-[700px] bg-zinc-950 z-10">

        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r
            from-transparent via-white/[0.04] to-transparent" />

        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-black" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[80%] h-[80%] rounded-2xl bg-zinc-800 animate-pulse" />
        </div>

        

      </div>
    </div>
    );
}