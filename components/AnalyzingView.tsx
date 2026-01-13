import React, { useState, useEffect } from 'react';

const loadingMessages = [
  "Scanning leaf patterns...",
  "Analyzing structure...",
  "Searching botanical database...",
  "Identifying species...",
  "Gathering care tips..."
];

interface AnalyzingViewProps {
  imageUrl?: string | null;
}

const AnalyzingView: React.FC<AnalyzingViewProps> = ({ imageUrl }) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative mx-auto flex h-full min-h-screen w-full items-center justify-center bg-black overflow-hidden font-sans">

      {/* Background Image (Captured Image) */}
      {imageUrl && (
        <div className="absolute inset-0 z-0">
          <img
            src={imageUrl}
            alt="Captured plant"
            className="h-full w-full object-cover opacity-40 blur-xl scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60"></div>
        </div>
      )}

      {/* Glassmorphism Card */}
      <div className="relative z-10 flex w-full max-w-sm animate-spring-in flex-col items-center gap-8 rounded-[40px] bg-white/10 dark:bg-black/20 p-10 shadow-2xl backdrop-blur-2xl mx-6 border border-white/20">

        {/* Animated Icon Container */}
        <div className="relative flex items-center justify-center">
          {/* Pulsing Outer Rings */}
          <div className="absolute size-32 rounded-full border border-green-500/30 animate-[ping_2s_infinite]"></div>
          <div className="absolute size-24 rounded-full border border-green-400/20 animate-[ping_3s_infinite]"></div>

          <div className="relative size-20 rounded-full bg-gradient-to-tr from-green-500/20 to-emerald-500/10 flex items-center justify-center shadow-lg ring-1 ring-green-500/40">
            <span className="material-symbols-outlined text-4xl text-green-400 animate-pulse">
              local_florist
            </span>
          </div>

          {/* Orbiting element */}
          <div className="absolute size-28 animate-[spin_4s_linear_infinite]">
            <div className="h-3 w-3 rounded-full bg-green-400 shadow-[0_0_12px_#4ade80]"></div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 w-full">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Analyzing Plant
            </h2>
            <p className="text-green-400/90 font-medium tracking-wide text-sm h-6 transition-all duration-500">
              {loadingMessages[messageIndex]}
            </p>
          </div>

          {/* Custom Progress Bar */}
          <div className="w-full space-y-3">
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10 ring-1 ring-white/5">
              <div className="absolute h-full w-2/3 animate-sweep-fast rounded-full bg-gradient-to-r from-transparent via-green-400 to-transparent shadow-[0_0_15px_rgba(74,222,128,0.5)]"></div>
            </div>
            <div className="flex justify-between px-1">
              <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase">Deep Scanning</span>
              <span className="text-[10px] font-bold text-green-400/60 tracking-widest uppercase">AI Engine</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes sweep-fast {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(150%); }
        }
        .animate-sweep-fast {
          animation: sweep-fast 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AnalyzingView;