
import React, { useState, useRef, useEffect } from 'react';

const ToolsView: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'calculator' | 'lightmeter'>('calculator');

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center bg-background-light/95 dark:bg-background-dark/95 px-4 py-3 justify-between backdrop-blur-md border-b border-black/5 dark:border-white/5 shadow-sm">
        <div className="w-8"></div>
        <h2 className="text-xl font-semibold leading-tight text-center font-display text-text-primary dark:text-white">
          Smart Care Tools
        </h2>
        <div className="w-8"></div>
      </div>

      <div className="px-4 py-4">
        {/* Tool Switcher */}
        <div className="flex p-1 bg-gray-200 dark:bg-zinc-800 rounded-xl mb-6">
          <button
            onClick={() => setActiveTool('calculator')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTool === 'calculator' ? 'bg-white dark:bg-zinc-700 shadow-sm text-forest dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
          >
            Water Calculator
          </button>
          <button
            onClick={() => setActiveTool('lightmeter')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTool === 'lightmeter' ? 'bg-white dark:bg-zinc-700 shadow-sm text-forest dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
          >
            Light Meter
          </button>
        </div>

        {activeTool === 'calculator' ? <WaterCalculator /> : <LightMeter />}
      </div>
    </div>
  );
};

const WaterCalculator: React.FC = () => {
  const [plantType, setPlantType] = useState('tropical');
  const [potSize, setPotSize] = useState('6');
  const [season, setSeason] = useState('summer');
  const [result, setResult] = useState<{ freq: string, amount: string } | null>(null);

  const calculate = () => {
    // Basic heuristic logic
    let baseDays = 7;
    let amountMl = 250;

    // Adjust for plant type
    if (plantType === 'succulent') { baseDays = 14; amountMl = 100; }
    if (plantType === 'tropical') { baseDays = 7; amountMl = 300; }
    if (plantType === 'fern') { baseDays = 4; amountMl = 200; }

    // Adjust for pot size
    const size = parseInt(potSize);
    if (size > 8) { baseDays += 2; amountMl *= 1.5; }
    if (size < 5) { baseDays -= 2; amountMl *= 0.7; }

    // Adjust for season
    if (season === 'winter') { baseDays *= 1.5; amountMl *= 0.8; }
    if (season === 'summer') { baseDays *= 0.8; }

    setResult({
      freq: `Every ${Math.round(baseDays)} days`,
      amount: `${Math.round(amountMl)} ml (${(amountMl / 240).toFixed(1)} cups)`
    });
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-subtle dark:shadow-subtle-dark border border-gray-100 dark:border-zinc-700 animate-spring-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
          <span className="material-symbols-outlined">water_drop</span>
        </div>
        <div>
          <h3 className="font-bold text-lg text-text-primary dark:text-white">Hydration Planner</h3>
          <p className="text-xs text-text-secondary dark:text-gray-400">Custom watering schedule</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-text-primary dark:text-gray-200 block mb-2">Plant Type</label>
          <select
            value={plantType}
            onChange={(e) => setPlantType(e.target.value)}
            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-text-primary dark:text-white outline-none focus:border-forest"
          >
            <option value="tropical">Tropical (Monstera, Pothos)</option>
            <option value="succulent">Succulent/Cactus</option>
            <option value="fern">Fern/Calathea</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold text-text-primary dark:text-gray-200 block mb-2">Pot Size (Diameter)</label>
          <div className="flex gap-2">
            {['4', '6', '8', '10', '12'].map(size => (
              <button
                key={size}
                onClick={() => setPotSize(size)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border ${potSize === size ? 'bg-forest text-white border-forest' : 'bg-transparent border-gray-200 dark:border-zinc-700 text-gray-500'}`}
              >
                {size}"
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-text-primary dark:text-gray-200 block mb-2">Current Season</label>
          <select
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-text-primary dark:text-white outline-none focus:border-forest"
          >
            <option value="spring">Spring</option>
            <option value="summer">Summer</option>
            <option value="fall">Fall</option>
            <option value="winter">Winter</option>
          </select>
        </div>

        <button
          onClick={calculate}
          className="w-full py-4 bg-forest dark:bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-forest/20 active:scale-95 transition-transform mt-4"
        >
          Calculate Schedule
        </button>

        {result && (
          <div className="mt-6 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 animate-fade-in text-center">
            <p className="text-sm text-blue-800 dark:text-blue-200 font-semibold mb-1">Recommended Routine</p>
            <div className="flex items-center justify-center gap-8 mt-2">
              <div>
                <p className="text-xs text-blue-600 dark:text-blue-300 uppercase tracking-wide">Frequency</p>
                <p className="text-xl font-bold text-blue-900 dark:text-white">{result.freq}</p>
              </div>
              <div className="w-px h-10 bg-blue-200 dark:bg-blue-700"></div>
              <div>
                <p className="text-xs text-blue-600 dark:text-blue-300 uppercase tracking-wide">Amount</p>
                <p className="text-xl font-bold text-blue-900 dark:text-white">{result.amount}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const LightMeter: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lightLevel, setLightLevel] = useState(0); // 0-255
  const [reading, setReading] = useState<'Low' | 'Medium' | 'Bright' | 'Direct Sun'>('Low');

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
    let interval: any;
    let isMounted = true;

    if (isScanning) {
      const startCamera = async () => {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });

          // If component unmounted or scanning stopped while waiting, stop immediately
          if (!isMounted || !isScanning) {
            mediaStream.getTracks().forEach(track => track.stop());
            return;
          }

          streamRef.current = mediaStream;
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        } catch (err) {
          if (isMounted) {
            console.error("Camera error", err);
            alert("Camera access required for light meter.");
            setIsScanning(false);
          }
        }
      };

      startCamera();

      // Analyze brightness loop
      interval = setInterval(() => {
        if (videoRef.current && canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, 50, 50); // Small sample
            const imageData = ctx.getImageData(0, 0, 50, 50);
            const data = imageData.data;
            let totalBrightness = 0;

            // Calculate average luminance
            for (let i = 0; i < data.length; i += 4) {
              totalBrightness += (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
            }
            const avg = totalBrightness / (data.length / 4);
            if (isMounted) {
              setLightLevel(avg);

              // Map to categories (Heuristic)
              if (avg < 50) setReading('Low');
              else if (avg < 120) setReading('Medium');
              else if (avg < 200) setReading('Bright');
              else setReading('Direct Sun');
            }
          }
        }
      }, 500);
    } else {
      // Scanning stopped, ensure camera is released
      stopCamera();
    }

    return () => {
      isMounted = false;
      clearInterval(interval);
      stopCamera();
    };
  }, [isScanning]);

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-subtle dark:shadow-subtle-dark border border-gray-100 dark:border-zinc-700 animate-spring-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-yellow-600 dark:text-yellow-400">
          <span className="material-symbols-outlined">light_mode</span>
        </div>
        <div>
          <h3 className="font-bold text-lg text-text-primary dark:text-white">Smart Light Meter</h3>
          <p className="text-xs text-text-secondary dark:text-gray-400">Use camera to measure ambient light</p>
        </div>
      </div>

      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden mb-6 flex items-center justify-center">
        {!isScanning ? (
          <div className="text-center p-6">
            <span className="material-symbols-outlined text-4xl text-gray-500 mb-2">linked_camera</span>
            <p className="text-gray-400 text-sm">Tap Start to analyze light</p>
          </div>
        ) : (
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover opacity-50" />
        )}

        <canvas ref={canvasRef} width="50" height="50" className="hidden" />

        {/* Gauge Overlay */}
        {isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <div className="text-4xl font-bold text-white drop-shadow-md mb-2">{reading}</div>
            <div className="w-48 h-3 bg-gray-700/50 rounded-full backdrop-blur-sm border border-white/20">
              <div
                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-yellow-600 to-yellow-300"
                style={{ width: `${(lightLevel / 255) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => setIsScanning(!isScanning)}
        className={`w-full py-4 font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${isScanning ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'}`}
      >
        <span className="material-symbols-outlined">{isScanning ? 'stop_circle' : 'play_circle'}</span>
        {isScanning ? 'Stop Meter' : 'Start Meter'}
      </button>

      <div className="mt-4 p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-xl text-xs text-gray-500 dark:text-gray-400">
        <p className="mb-1 font-semibold">Tips:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Point camera at the spot where the plant sits.</li>
          <li>Do not point directly at the sun.</li>
          <li>Low Light: Good for Snake Plant, Pothos.</li>
          <li>Bright Light: Good for Fiddle Leaf, Succulents.</li>
        </ul>
      </div>
    </div>
  );
};

export default ToolsView;
