import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useIdentifyPlantBase64, useDiagnosePlantBase64 } from '../src/hooks/usePlantify';
import { plantsApi } from '../src/api/plants.api';
import { scansApi } from '../src/api/scans.api';
import { useAuth } from '../src/store/useAuthStore';

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

const AnalyzingView: React.FC<AnalyzingViewProps> = ({ imageUrl: propImageUrl }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [streamingMessage, setStreamingMessage] = useState('Initializing scan...');
  const [progress, setProgress] = useState(10);
  const hasTriggered = useRef(false);

  const state = location.state as { imageUrl?: string; mode?: 'identify' | 'diagnose' | 'both' } || {};
  const imageUrl = propImageUrl || state.imageUrl;
  const mode = state.mode || 'both';

  useEffect(() => {
    if (imageUrl && !hasTriggered.current && user) {
      hasTriggered.current = true;
      
      const performScan = async () => {
        try {
          await plantsApi.scanStream(
            imageUrl,
            async (event) => {
              if (event.type === 'status') {
                setStreamingMessage(event.message || 'Processing...');
                setProgress((prev) => Math.min(prev + 15, 80));
              } else if (event.type === 'result') {
                setProgress(100);
                const plantData = event.data;
                
                // Save to Backend DB
                try {
                  await scansApi.save({
                    name: plantData.commonName || 'Unknown Plant',
                    scientificName: plantData.scientificName || '',
                    imageUrl: imageUrl,
                    type: mode,
                    data: plantData
                  });
                } catch (dbError) {
                  console.error("Error saving scan:", dbError);
                }

                // Navigate to result with a slight delay for smooth transition
                setTimeout(() => {
                  navigate('/result', { state: { data: plantData, imageUrl } });
                }, 400);
              } else if (event.type === 'error') {
                throw new Error(event.message || 'Scan failed');
              }
            },
            mode
          );
        } catch (err) {
          console.error("Scan error:", err);
          alert("Failed to analyze image. Please try again.");
          navigate('/scan');
        }
      };
      performScan();
    }
  }, [imageUrl, mode, navigate, user]);

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
              {streamingMessage}
            </p>
          </div>

          {/* Custom Progress Bar */}
          <div className="w-full space-y-3">
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10 ring-1 ring-white/5">
              <div 
                className="absolute h-full transition-all duration-1000 ease-out rounded-full bg-gradient-to-r from-green-600 via-green-400 to-emerald-400 shadow-[0_0_15px_rgba(74,222,128,0.5)]"
                style={{ width: `${progress}%` }}
              ></div>
              <div className="absolute h-full w-20 animate-sweep-fast bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            </div>
            <div className="flex justify-between px-1">
              <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase">Deep Scanning</span>
              <span className="text-[10px] font-bold text-green-400/60 tracking-widest uppercase">{progress}% Complete</span>
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