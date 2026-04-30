import { useEffect, useState } from "react";

interface Props {
  onFinish: () => void;
}

export default function MenuSplash({ onFinish }: Props) {
  // Stages: 0: Init, 1: Intro, 2: Reveal, 3: Cinematic Exit
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const tIntro = setTimeout(() => setStage(1), 100);
    const tReveal = setTimeout(() => setStage(2), 1400); 
    const tExit = setTimeout(() => setStage(3), 4500); 
    const tFinish = setTimeout(() => onFinish(), 5800); 

    return () => {
      clearTimeout(tIntro);
      clearTimeout(tReveal);
      clearTimeout(tExit);
      clearTimeout(tFinish);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-white transition-all duration-[1800ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
        stage === 3 ? "opacity-0 scale-95 blur-md pointer-events-none" : "opacity-100 scale-100 blur-0"
      }`}
    >
      {/* 1. PREMIUM AMBIENCE (Mesh Gradient) */}
      <div className="absolute inset-0 z-0">
        <div 
          className={`absolute rounded-full transition-opacity duration-[3000ms] ${stage >= 1 ? 'opacity-100' : 'opacity-0'}`} 
          style={{
            width: '100vw', height: '100vw',
            background: 'radial-gradient(circle, rgba(235,245,255,0.6) 0%, rgba(255,255,255,0) 70%)',
            animation: 'float-slow 20s ease-in-out infinite',
            top: '-20%', left: '-10%'
          }}
        />
      </div>

      {/* 2. MAIN CONTENT */}
      <div className="z-10 flex flex-col items-center">
        
        {/* UNIQUE ICON: Intersecting Architectural Frames */}
        <div
          className={`relative w-24 h-24 flex items-center justify-center mb-16 transition-all duration-[2000ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
            stage >= 1 ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 rotate-12"
          }`}
        >
          {/* Vertical Frame */}
          <div className="absolute w-12 h-20 border-[1px] border-blue-600/30 animate-[frame-breathe_4s_ease-in-out_infinite]" />
          
          {/* Horizontal Frame */}
          <div className="absolute w-20 h-12 border-[1px] border-blue-400/40 animate-[frame-breathe_4s_ease-in-out_infinite_reverse]" />
          
          {/* Central Point */}
          <div className="w-1.5 h-1.5 bg-blue-600 rotate-45 shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
        </div>

        {/* TEXT SECTION: Optimized for Kannada Script */}
        <div className="relative overflow-hidden h-[140px] flex items-center justify-center px-10">
          <h1
            className={`text-7xl md:text-9xl font-black transition-all duration-[2000ms] cubic-bezier(0.16, 1, 0.3, 1) ${
              stage >= 2 ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
            }`}
            style={{ 
              lineHeight: '1.4',
              paddingBottom: '20px' 
            }}
          >
             <span className="bg-clip-text text-transparent bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900">
                ಸ್ವಾಗತ
             </span>
          </h1>
          
          {/* Elegant Shine Polish */}
          <div 
            className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full ${
              stage >= 2 ? "animate-[shine-polish_3s_ease-in-out_infinite_delay-1000ms]" : ""
            }`}
          />
        </div>

        {/* SUBTITLE: Signature Label */}
        <div className="overflow-hidden">
            <p
              className={`mt-2 text-slate-400 text-[10px] tracking-[1em] uppercase font-bold transition-all duration-[2000ms] ${
                stage >= 2 ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
              }`}
              style={{ transitionDelay: '2000ms' }}
            >
              Exclusive Dining
            </p>
        </div>
      </div>

      {/* 3. REFINED PROGRESS INDICATOR */}
      <div className="absolute bottom-24 flex flex-col items-center gap-4">
        <div className="w-48 h-[1px] bg-slate-100 relative overflow-hidden">
            <div
              className={`h-full bg-blue-600 transition-all ease-in-out ${
                stage >= 1 ? "w-full" : "w-0"
              }`}
              style={{ transitionDuration: '4500ms' }}
            />
        </div>
      </div>

      <style>{`
        @keyframes frame-breathe {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes shine-polish {
          0% { transform: translateX(-150%) skewX(-30deg); }
          40%, 100% { transform: translateX(150%) skewX(-30deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(2%, 5%); }
        }
      `}</style>
    </div>
  );
}