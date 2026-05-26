import React, { useRef, useEffect } from 'react';
import { PlantItem } from '../types';
import { useRecentScans } from '../src/hooks/usePlantify';

interface HomeViewProps {
  onScanClick: () => void;
  onUploadClick: (file: File) => void;
  onRecentPlantClick: (plant: PlantItem) => void;
  onViewAllClick: () => void;
  onDiagnoseClick: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({
  onScanClick,
  onUploadClick,
  onRecentPlantClick,
  onViewAllClick,
  onDiagnoseClick
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: recentScansData } = useRecentScans();

  const scanHistory: PlantItem[] = (recentScansData as any as PlantItem[]) || [];

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadClick(e.target.files[0]);
    }
  };

  // Use scan history if available, otherwise empty
  const displayRecentScans = scanHistory.slice(0, 8);
  const totalScansThisWeek = scanHistory.length; // Simplified for this demo

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-warm-white dark:bg-background-dark pb-28">

      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-sage/20 to-transparent -z-10 pointer-events-none"></div>
      <div className="fixed -top-20 -right-20 w-64 h-64 bg-forest/5 rounded-full blur-3xl -z-10"></div>

      {/* Header */}
      <div className="flex items-center justify-between p-6 pt-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-forest dark:text-white">
            Hello, Explorer <span className="inline-block animate-wave origin-bottom-right">🌿</span>
          </h1>
          <p className="text-text-secondary dark:text-gray-400 text-sm font-medium">Ready to find some plants?</p>
        </div>
        <div className="size-10 rounded-full bg-white dark:bg-white/10 shadow-subtle flex items-center justify-center">
          <span className="material-symbols-outlined text-forest dark:text-sage">notifications</span>
        </div>
      </div>

      <div className="px-6 flex flex-col gap-6">

        {/* Main Hero Card */}
        <div className="relative w-full rounded-3xl overflow-hidden shadow-modern dark:shadow-none min-h-[300px] flex flex-col justify-end group transition-transform duration-500 hover:scale-[1.01]">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1592150621744-aca64f48394a?q=80&w=1000&auto=format&fit=crop")' }}>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

          {/* Glassmorphic Content Area */}
          <div className="relative z-10 p-6 backdrop-blur-[2px] bg-white/10 border-t border-white/20">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase mb-2 border border-white/10">
                AI Scanner
              </span>
              <h2 className="font-display text-2xl font-bold text-white leading-tight mb-1">
                Identify a new plant
              </h2>
              <p className="text-gray-200 text-sm font-medium leading-relaxed max-w-[90%]">
                AI-powered plant identification in seconds. Just point and scan.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onScanClick}
                className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-forest to-emerald-600 flex items-center justify-center gap-2 text-white shadow-lg shadow-forest/30 transition-all active:scale-95 hover:shadow-xl hover:brightness-110 relative overflow-hidden group/btn"
              >
                {/* Viewfinder Hint Effect */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-10"></div>
                <span className="material-symbols-outlined relative z-10 text-xl">photo_camera</span>
                <span className="font-bold relative z-10 text-sm">Scan Plant</span>
              </button>

              <button
                onClick={handleUploadClick}
                className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all active:scale-95"
                title="Upload Photo"
              >
                <span className="material-symbols-outlined text-xl">upload_file</span>
              </button>
            </div>
          </div>
        </div>

        {/* Plant Doctor Card */}
        <div
          onClick={onDiagnoseClick}
          className="relative overflow-hidden rounded-2xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 p-5 flex items-center justify-between cursor-pointer active:scale-95 transition-all shadow-subtle dark:shadow-none group"
        >
          <div className="absolute -right-4 -bottom-4 size-24 rounded-full bg-orange-100 dark:bg-orange-800/20 group-hover:scale-110 transition-transform"></div>
          <div className="flex flex-col gap-1 relative z-10">
            <h3 className="font-display font-bold text-text-primary dark:text-white text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-500">stethoscope</span>
              Plant Doctor
            </h3>
            <p className="text-xs text-text-secondary dark:text-gray-400 max-w-[200px]">
              Upload a photo of a sick plant to detect diseases and get treatment advice.
            </p>
          </div>
          <div className="size-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-orange-500 shadow-sm relative z-10 group-hover:bg-orange-500 group-hover:text-white transition-colors">
            <span className="material-symbols-outlined">arrow_forward</span>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />

        {/* Stats Teaser */}
        <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-subtle dark:shadow-subtle-dark border border-sage/20 flex items-center gap-4">
          <div className="size-12 rounded-full bg-sage/20 flex items-center justify-center text-forest dark:text-sage">
            <span className="material-symbols-outlined">emoji_events</span>
          </div>
          <div className="flex-1">
            <p className="text-text-primary dark:text-white font-semibold text-sm">Weekly Progress</p>
            <p className="text-text-secondary dark:text-gray-400 text-xs">You've identified <span className="text-forest dark:text-sage font-bold">{totalScansThisWeek} plants</span> so far! 🌿</p>
          </div>
        </div>

        {/* Recent Scans Carousel */}
        {displayRecentScans.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-text-primary dark:text-white">Recent Scans</h3>
              <button
                onClick={onViewAllClick}
                className="text-xs font-semibold text-forest dark:text-sage hover:underline"
              >
                View History
              </button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
              {displayRecentScans.map((plant) => (
                <div
                  key={plant.id}
                  onClick={() => onRecentPlantClick(plant)}
                  className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group active:scale-95 transition-transform"
                >
                  <div className="size-20 rounded-full p-1 border-2 border-sage/30 bg-white dark:bg-white/5 shadow-sm group-hover:border-forest transition-colors overflow-hidden">
                    <img src={plant.image} alt={plant.name} className="w-full h-full object-cover rounded-full" />
                  </div>
                  <span className="text-xs font-medium text-text-primary dark:text-white group-hover:text-forest dark:group-hover:text-sage transition-colors truncate w-20 text-center">{plant.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default HomeView;
