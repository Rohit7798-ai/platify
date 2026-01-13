
import React from 'react';

interface BottomNavProps {
  activeTab: 'home' | 'explore' | 'community' | 'assistant' | 'profile';
  onTabChange: (tab: 'home' | 'explore' | 'community' | 'assistant' | 'profile') => void;
  onScanClick: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, onScanClick }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="absolute inset-0 top-10 bg-gradient-to-t from-white via-white/90 to-transparent dark:from-black dark:via-black/90 pointer-events-none h-full"></div>

      <div className="relative mx-auto max-w-lg px-4 pb-6 pt-2">
        <div className="relative flex h-16 items-center justify-between rounded-3xl bg-white dark:bg-zinc-800 shadow-modern dark:shadow-modern-dark ring-1 ring-black/5 dark:ring-white/10 px-2">
            
            <button 
              onClick={() => onTabChange('home')}
              className={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${activeTab === 'home' ? 'text-forest dark:text-sage' : 'text-gray-400'}`}
            >
              <span className={`material-symbols-outlined ${activeTab === 'home' ? 'filled-icon' : ''}`}>center_focus_strong</span>
              <span className="text-[10px] font-bold">Home</span>
            </button>

            <button 
              onClick={() => onTabChange('explore')}
              className={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${activeTab === 'explore' ? 'text-forest dark:text-sage' : 'text-gray-400'}`}
            >
              <span className={`material-symbols-outlined ${activeTab === 'explore' ? 'filled-icon' : ''}`}>explore</span>
              <span className="text-[10px] font-bold">Explore</span>
            </button>

             <button 
              onClick={() => onTabChange('community')}
              className={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${activeTab === 'community' ? 'text-forest dark:text-sage' : 'text-gray-400'}`}
            >
              <span className={`material-symbols-outlined ${activeTab === 'community' ? 'filled-icon' : ''}`}>groups</span>
              <span className="text-[10px] font-bold">Community</span>
            </button>

            <button 
               onClick={() => onTabChange('assistant')}
               className={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${activeTab === 'assistant' ? 'text-forest dark:text-sage' : 'text-gray-400'}`}
            >
              <span className={`material-symbols-outlined ${activeTab === 'assistant' ? 'filled-icon' : ''}`}>smart_toy</span>
              <span className="text-[10px] font-bold">AI Help</span>
            </button>

            <button 
               onClick={() => onTabChange('profile')}
               className={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${activeTab === 'profile' ? 'text-forest dark:text-sage' : 'text-gray-400'}`}
            >
              <span className={`material-symbols-outlined ${activeTab === 'profile' ? 'filled-icon' : ''}`}>person</span>
              <span className="text-[10px] font-bold">Profile</span>
            </button>

        </div>
      </div>
      
      <style>{`
        .filled-icon {
          font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
    </div>
  );
};

export default BottomNav;
