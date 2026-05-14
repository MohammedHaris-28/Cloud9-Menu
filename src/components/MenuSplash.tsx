import { useEffect, useState } from "react";
import { UtensilsCrossed } from "lucide-react";

interface Props {
  onFinish: () => void;
  // Ensure the prop matches exactly what your data source provides
  restaurant?: {
    name?: string;
    logo?: string;
  } | null;
}

export default function MenuSplash({ onFinish, restaurant }: Props) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Stage 1: Fade in the UI
    const tIntro = setTimeout(() => setStage(1), 100);
    
    // Stage 2: Start the exit transition (Total 3 seconds)
    const tExit = setTimeout(() => setStage(2), 2700); 
    
    // Stage 3: Complete and unmount
    const tFinish = setTimeout(() => onFinish(), 3400); 

    return () => {
      clearTimeout(tIntro);
      clearTimeout(tExit);
      clearTimeout(tFinish);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] h-screen w-full flex flex-col items-center justify-center bg-white transition-all duration-[800ms] ease-in-out ${
        stage === 2 ? "opacity-0 scale-105 blur-md" : "opacity-100"
      }`}
    >
      {/* Soft Background Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,244,245,0.8)_0%,rgba(255,255,255,1)_100%)]" />

      <div className="relative z-10 flex flex-col items-center px-8">
        
        {/* LOGO CONTAINER */}
        <div
          className={`w-24 h-24 mb-10 transition-all duration-1000 ease-out ${
            stage >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="w-full h-full rounded-[2.5rem] bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-zinc-100 flex items-center justify-center p-5 relative">
            {restaurant?.logo ? (
              <img
                src={restaurant.logo}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            ) : (
              <UtensilsCrossed className="w-10 h-10 text-zinc-300" />
            )}
            
            {/* Spinning ambient border */}
            <div className="absolute -inset-1 border border-zinc-50 rounded-[2.7rem] animate-[spin_8s_linear_infinite]" />
          </div>
        </div>

        {/* BRANDING TEXT */}
        <div className="flex flex-col items-center space-y-3">
          <p className={`text-zinc-400 text-[10px] font-black uppercase tracking-[0.4em] transition-all duration-700 delay-300 ${
            stage >= 1 ? "opacity-100" : "opacity-0"
          }`}>
            Welcome to
          </p>
          
          <h1 className={`text-3xl md:text-5xl font-black text-zinc-900 tracking-tight transition-all duration-1000 delay-500 text-center ${
            stage >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            {/* Fallback to "Our Restaurant" if the name hasn't loaded yet */}
            {restaurant?.name || "Our Restaurant"}
          </h1>
        </div>

        {/* SLIM PROGRESS INDICATOR */}
        <div className="mt-12 w-40 h-[1.5px] bg-zinc-100 relative overflow-hidden rounded-full">
          <div 
            className="absolute inset-y-0 left-0 bg-zinc-900 transition-all ease-linear"
            style={{ 
                width: stage >= 1 ? '100%' : '0%',
                transitionDuration: '2600ms' 
            }}
          />
        </div>
      </div>

      {/* SIGNATURE FOOTER */}
      <div className={`absolute bottom-12 transition-all duration-1000 delay-1000 ${
        stage >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-zinc-400 font-bold tracking-[0.25em] uppercase">
            Powered by <span className="text-zinc-900 font-black">#2Code</span>
          </span>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}