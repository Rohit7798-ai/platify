
import React, { useRef, useEffect, useState } from 'react';

interface CameraViewProps {
  onCapture: (imageSrc: string, mode: 'identify' | 'diagnose') => void;
  onClose: () => void;
  onUpload: (file: File) => void;
  initialMode?: 'identify' | 'diagnose';
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onClose, onUpload, initialMode = 'identify' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);

  const [mode, setMode] = useState<'identify' | 'diagnose'>(initialMode);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [flashOn, setFlashOn] = useState(false);

  // Theme colors based on mode
  const themeColor = mode === 'identify' ? '#4ade80' : '#f59e0b'; // green-400 : amber-500
  const themeTailwind = mode === 'identify' ? 'green-500' : 'amber-500';

  // Dedicated function to completely stop and release camera
  const stopCamera = () => {
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      activeStreamRef.current = null;
    }

    if (videoRef.current) {
      if (videoRef.current.srcObject) {
        const currentStream = videoRef.current.srcObject as MediaStream;
        currentStream.getTracks().forEach(track => {
          track.stop();
          track.enabled = false;
        });
      }
      videoRef.current.srcObject = null;
      videoRef.current.pause();
      videoRef.current.load();
    }
  };

  useEffect(() => {
    let isMounted = true;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        if (!isMounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        activeStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error("Error accessing camera:", err);
        setError("Could not access camera. Please check permissions.");
        setIsLoading(false);
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && !isCapturing) {
      setIsCapturing(true);
      const video = videoRef.current;
      const canvas = canvasRef.current;

      const MAX_WIDTH = 1080;
      let width = video.videoWidth;
      let height = video.videoHeight;

      if (width > MAX_WIDTH) {
        height = height * (MAX_WIDTH / width);
        width = MAX_WIDTH;
      }

      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, width, height);
        const imageSrc = canvas.toDataURL('image/jpeg', 0.8);

        // Stop camera immediately after capture to turn off light
        stopCamera();

        setTimeout(() => {
          onCapture(imageSrc, mode);
          setIsCapturing(false);
        }, 150);
      }
    }
  };

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  const handleVideoLoaded = () => {
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black overflow-hidden font-sans select-none">

      {/* 1. Camera Feed */}
      <div className="absolute inset-0 z-0">
        {error ? (
          <div className="flex h-full flex-col items-center justify-center bg-zinc-900 px-8 text-center text-white">
            <div className="mb-6 rounded-full bg-red-500/10 p-6 ring-1 ring-red-500/20">
              <span className="material-symbols-outlined text-5xl text-red-500">error</span>
            </div>
            <h3 className="mb-3 text-xl font-bold">Camera Access Error</h3>
            <p className="mb-8 text-zinc-400 leading-relaxed">{error}</p>
            <button
              onClick={onClose}
              className="rounded-2xl bg-white px-8 py-3.5 text-sm font-bold text-black transition-transform active:scale-95"
            >
              Go Back
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onLoadedData={handleVideoLoaded}
              className={`h-full w-full object-cover transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            />
            <canvas ref={canvasRef} className="hidden" />
          </>
        )}
      </div>

      {/* 2. Loading State */}
      {isLoading && !error && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950">
          <div className="relative mb-8 h-20 w-20">
            <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-white/5 border-t-green-500"></div>
            <div className="flex h-full w-full items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-white/50">videocam</span>
            </div>
          </div>
          <p className="animate-pulse text-lg font-medium tracking-wide text-white/80">Waking up camera...</p>
        </div>
      )}

      {/* 3. High-Tech Overlay Layer */}
      {!isLoading && !error && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          {/* Main Cutout Overlay - Semi-transparent background with a hole */}
          <div className="absolute inset-0 bg-black/50" style={{
            maskImage: 'linear-gradient(#fff, #fff), linear-gradient(#fff, #fff)',
            WebkitMaskImage: 'linear-gradient(#fff, #fff), linear-gradient(#fff, #fff)',
            maskComposite: 'exclude',
            WebkitMaskComposite: 'xor',
            maskPosition: 'center',
            maskRepeat: 'no-repeat',
            // Define the size of the hole
            maskSize: '100% 100%, 75vw 75vw',
            maxWidth: '100% 100%, 320px 320px',
          }}></div>

          {/* Simple semi-transparent overlay fallback if mask-composite fails or is tricky */}
          <div className="absolute inset-0 flex flex-col">
            <div className="flex-1 bg-black/40"></div>
            <div className="flex">
              <div className="flex-1 bg-black/40"></div>
              <div className="w-[75vw] aspect-square max-w-[320px] bg-transparent rounded-[32px] ring-[1000px] ring-black/40"></div>
              <div className="flex-1 bg-black/40"></div>
            </div>
            <div className="flex-1 bg-black/40"></div>
          </div>

          {/* Scanning Frame / Brackets */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative flex items-center justify-center w-[75vw] aspect-square max-w-[320px]">

              {/* Animated Scan Line */}
              <div className="scan-line absolute inset-x-0 z-20 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_15px_rgba(255,255,255,0.8)] opacity-60"></div>

              {/* Corner Brackets */}
              <div className="absolute top-0 left-0 h-10 w-10 border-l-[3px] border-t-[3px] rounded-tl-2xl" style={{ borderColor: themeColor }}></div>
              <div className="absolute top-0 right-0 h-10 w-10 border-r-[3px] border-t-[3px] rounded-tr-2xl" style={{ borderColor: themeColor }}></div>
              <div className="absolute bottom-0 left-0 h-10 w-10 border-l-[3px] border-b-[3px] rounded-bl-2xl" style={{ borderColor: themeColor }}></div>
              <div className="absolute bottom-0 right-0 h-10 w-10 border-r-[3px] border-b-[3px] rounded-br-2xl" style={{ borderColor: themeColor }}></div>

              {/* Focus Points (Small circles) */}
              <div className="absolute top-1/2 left-0 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-white/40"></div>
              <div className="absolute top-1/2 right-0 translate-x-1/2 h-1.5 w-1.5 rounded-full bg-white/40"></div>
              <div className="absolute top-0 left-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-white/40"></div>
              <div className="absolute bottom-0 left-1/2 translate-y-1/2 h-1.5 w-1.5 rounded-full bg-white/40"></div>

              {/* Central Cross */}
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <div className="h-6 w-[1px] bg-white"></div>
                <div className="absolute h-[1px] w-6 bg-white"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Controls Layer */}
      <div className={`relative z-20 flex h-full flex-col justify-between transition-all duration-700 ${isLoading || error ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>

        {/* Top Bar */}
        <div className="flex items-center justify-between p-6 pt-12">
          <button
            onClick={onClose}
            className="group flex h-12 w-12 items-center justify-center rounded-2xl bg-black/30 text-white backdrop-blur-xl transition-all active:scale-90"
          >
            <span className="material-symbols-outlined text-2xl transition-transform group-hover:rotate-90">close</span>
          </button>

          <button
            onClick={() => setFlashOn(!flashOn)}
            className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all active:scale-90 ${flashOn ? 'bg-yellow-400 text-black' : 'bg-black/30 text-white backdrop-blur-xl'}`}
          >
            <span className={`material-symbols-outlined text-2xl ${flashOn ? 'fill-1' : ''}`}>
              {flashOn ? 'flash_on' : 'flash_off'}
            </span>
          </button>
        </div>

        {/* Center Guidance (Instruction text moved here) */}
        <div className="flex flex-col items-center gap-2 -mt-20">
          <p className="text-sm font-medium tracking-wide text-white/90 drop-shadow-md">
            {mode === 'identify' ? "Center plant in the lens" : "Scan affected leaves or stems"}
          </p>
          <div className="h-1 w-6 rounded-full bg-white/20"></div>
        </div>

        {/* Bottom Controls Panel - Refined discrete panel */}
        <div className="mx-6 mb-12 overflow-hidden rounded-[32px] bg-zinc-950/40 p-1 ring-1 ring-white/10 backdrop-blur-2xl">
          <div className="flex flex-col items-center gap-6 p-5">

            {/* Mode Switcher (Positioned above scan button) */}
            <div className="relative flex w-full max-w-[240px] items-center rounded-[20px] bg-white/5 p-1 ring-1 ring-white/5">
              <div
                className={`absolute h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-[16px] bg-white shadow-lg transition-all duration-300 ease-out ${mode === 'identify' ? 'translate-x-0' : 'translate-x-full'}`}
              ></div>

              <button
                onClick={() => setMode('identify')}
                className={`relative z-10 flex-1 py-1.5 text-[10px] font-bold leading-none tracking-[2px] transition-colors duration-300 ${mode === 'identify' ? 'text-forest' : 'text-white/40'}`}
              >
                IDENTIFY
              </button>
              <button
                onClick={() => setMode('diagnose')}
                className={`relative z-10 flex-1 py-1.5 text-[10px] font-bold leading-none tracking-[2px] transition-colors duration-300 ${mode === 'diagnose' ? 'text-amber-600' : 'text-white/40'}`}
              >
                DIAGNOSE
              </button>
            </div>

            {/* Action Row */}
            <div className="flex w-full items-center justify-between px-2">
              <button
                onClick={handleGalleryClick}
                className="group flex h-12 w-12 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 transition-all active:scale-90"
              >
                <span className="material-symbols-outlined text-xl text-white group-hover:scale-110">photo_library</span>
              </button>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />

              <div className="relative">
                <div className={`absolute -inset-3 rounded-full border border-white/10 ${isCapturing ? '' : 'animate-pulse scale-110'}`}></div>
                <button
                  onClick={handleCapture}
                  disabled={isCapturing}
                  className={`relative flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-white bg-transparent p-1 transition-all active:scale-95 ${isCapturing ? 'opacity-50' : ''}`}
                >
                  <div className={`h-full w-full rounded-full transition-all duration-300 ${isCapturing ? 'scale-0' : 'scale-100'}`} style={{ backgroundColor: themeColor }}>
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="material-symbols-outlined text-3xl text-white drop-shadow-sm">
                        {mode === 'identify' ? 'search' : 'medical_services'}
                      </span>
                    </div>
                  </div>
                </button>
              </div>

              <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 transition-all active:scale-90">
                <span className="material-symbols-outlined text-xl text-white">help_outline</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Shutter Animation Overlay */}
      {isCapturing && (
        <div className="absolute inset-0 z-[100] bg-white animate-shutter"></div>
      )}

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { top: 100%; opacity: 0; }
        }
        .scan-line {
          animation: scan 3s ease-in-out infinite;
        }
        @keyframes shutter {
          0% { opacity: 0; }
          50% { opacity: 0.8; }
          100% { opacity: 0; }
        }
        .animate-shutter {
          animation: shutter 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CameraView;
