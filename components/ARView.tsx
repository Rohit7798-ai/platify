
import React, { useRef, useEffect, useState } from 'react';

interface ARViewProps {
  onBack: () => void;
}

const ARView: React.FC<ARViewProps> = ({ onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [plantPosition, setPlantPosition] = useState({ x: 50, y: 50 }); // percentages
  const [plantScale, setPlantScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  // Selected plant to place (mock list)
  const plants = [
    { name: 'Monstera', img: 'https://pngimg.com/d/monstera_PNG11.png' },
    { name: 'Snake Plant', img: 'https://purepng.com/public/uploads/large/purepng.com-snake-plantnature-plant-green-snake-plant-961524674516t545t.png' },
    { name: 'Fiddle Leaf', img: 'https://pngimg.com/d/fiddle_leaf_fig_PNG16.png' }
  ];
  const [selectedPlant, setSelectedPlant] = useState(plants[0]);

  // Use ref to track stream for reliable cleanup
  const streamRef = useRef<MediaStream | null>(null);

  // Dedicated function to completely stop and release camera
  const stopCamera = () => {
    // Stop all tracks from the stream ref
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      streamRef.current = null;
    }

    // Also clear and stop any stream attached to video element
    if (videoRef.current && videoRef.current.srcObject) {
      const videoStream = videoRef.current.srcObject as MediaStream;
      videoStream.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      videoRef.current.srcObject = null;
      videoRef.current.load(); // Force video element to release resources
    }
  };

  useEffect(() => {
    let isMounted = true;

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });

        // If component unmounted while waiting for camera, stop immediately
        if (!isMounted) {
          mediaStream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        if (isMounted) console.error("AR Camera Error:", err);
      }
    };
    startCamera();

    // Cleanup: immediately stop camera on unmount
    return () => {
      isMounted = false;
      stopCamera();
    };
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const x = (touch.clientX / window.innerWidth) * 100;
    const y = (touch.clientY / window.innerHeight) * 100;
    setPlantPosition({ x, y });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Camera Layer */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* AR Overlay Layer */}
      <div
        className="absolute inset-0 z-10 overflow-hidden"
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setIsDragging(false)}
      >
        <img
          src={selectedPlant.img}
          alt="AR Plant"
          className="absolute origin-bottom transition-transform duration-75 drop-shadow-2xl"
          style={{
            left: `${plantPosition.x}%`,
            top: `${plantPosition.y}%`,
            transform: `translate(-50%, -100%) scale(${plantScale})`,
            width: '200px',
            filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))'
          }}
          onTouchStart={() => setIsDragging(true)}
        />

        {/* Helper Text */}
        {!isDragging && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-white/80 bg-black/40 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm animate-pulse">
            Drag to move • Pinch to resize
          </div>
        )}
      </div>

      {/* UI Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-20">
        <button onClick={onBack} className="size-10 rounded-full bg-black/40 text-white backdrop-blur-md flex items-center justify-center">
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold border border-white/10">
          AR Placement
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 z-20 bg-gradient-to-t from-black/80 to-transparent pt-20">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide max-w-[70%]">
            {plants.map((p, i) => (
              <button
                key={i}
                onClick={() => setSelectedPlant(p)}
                className={`size-14 rounded-xl border-2 overflow-hidden bg-white/10 backdrop-blur-md shrink-0 ${selectedPlant.name === p.name ? 'border-green-500' : 'border-white/20'}`}
              >
                <img src={p.img} className="w-full h-full object-contain" />
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <button onClick={() => setPlantScale(s => Math.min(s + 0.1, 2))} className="size-10 rounded-full bg-white/20 text-white flex items-center justify-center">
              <span className="material-symbols-outlined">add</span>
            </button>
            <button onClick={() => setPlantScale(s => Math.max(s - 0.1, 0.5))} className="size-10 rounded-full bg-white/20 text-white flex items-center justify-center">
              <span className="material-symbols-outlined">remove</span>
            </button>
          </div>
        </div>
        <p className="text-center text-white/60 text-xs">Visualize how this plant fits in your space.</p>
      </div>
    </div>
  );
};

export default ARView;
