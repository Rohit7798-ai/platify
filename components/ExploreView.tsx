import React, { useState, useEffect } from 'react';
import ToolsView from './ToolsView';
import ARView from './ARView';
import ConsultView from './ConsultView';
import { PlantItem } from '../types';
import { useRecentScans } from '../src/hooks/usePlantify';

interface ExploreViewProps {
   onPlantClick?: (plant: PlantItem) => void;
}

const ExploreView: React.FC<ExploreViewProps> = ({ onPlantClick }) => {
   const [view, setView] = useState<'main' | 'tools' | 'ar' | 'consult'>('main');
   const [searchTerm, setSearchTerm] = useState('');
   
   const { data: recentScansData } = useRecentScans();

   const scanHistory: PlantItem[] = (recentScansData as any as PlantItem[]) || [];

   const categories = [
      { name: 'Indoor', icon: 'potted_plant', color: 'bg-green-100 text-green-700' },
      { name: 'Outdoor', icon: 'park', color: 'bg-blue-100 text-blue-700' },
      { name: 'Pet Safe', icon: 'pets', color: 'bg-orange-100 text-orange-700' },
      { name: 'Air Pure', icon: 'air', color: 'bg-purple-100 text-purple-700' },
      { name: 'Succulent', icon: 'spa', color: 'bg-teal-100 text-teal-700' },
      { name: 'Flowers', icon: 'local_florist', color: 'bg-pink-100 text-pink-700' },
   ];

   const staticDatabase = [
      { id: 'db1', name: 'Aloe Vera', type: 'Succulent', img: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=300&q=80' },
      { id: 'db2', name: 'Peace Lily', type: 'Indoor', img: 'https://images.unsplash.com/photo-1713539768904-22a1950e194d?w=300&q=80' },
      { id: 'db3', name: 'Spider Plant', type: 'Pet Safe', img: 'https://images.unsplash.com/photo-1706544376082-1cbfbdcc2fec?w=300&q=80' },
      { id: 'db4', name: 'Rubber Plant', type: 'Indoor', img: 'https://images.unsplash.com/photo-1632207691143-643e2a9a9361?w=300&q=80' },
   ];

   const historyDisplayItems = scanHistory.map(p => ({
      id: p.id,
      name: p.name,
      type: 'Scanned',
      img: p.image,
      isHistory: true,
      original: p
   }));

   const combinedDatabase = [...historyDisplayItems, ...staticDatabase];

   const filteredPlants = combinedDatabase.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

   if (view === 'tools') return <div className="min-h-screen relative pb-20"><button onClick={() => setView('main')} className="absolute top-4 left-4 z-20 p-2 rounded-full bg-white/20 backdrop-blur-md shadow-md"><span className="material-symbols-outlined">arrow_back</span></button><ToolsView /></div>;
   if (view === 'ar') return <ARView onBack={() => setView('main')} />;
   if (view === 'consult') return <ConsultView onBack={() => setView('main')} />;

   return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark pb-28">
         {/* Header */}
         <div className="sticky top-0 z-10 flex flex-col bg-background-light/95 dark:bg-background-dark/95 px-4 pt-4 pb-2 backdrop-blur-md border-b border-black/5 dark:border-white/5 shadow-sm">
            <h2 className="text-xl font-semibold font-display text-text-primary dark:text-white mb-3">Explore</h2>

            {/* Search Bar */}
            <div className="relative w-full">
               <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
               <input
                  type="text"
                  placeholder="Search plants, care tips..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 outline-none focus:border-forest text-sm shadow-sm"
               />
            </div>
         </div>

         <main className="flex-grow px-4 pt-4 flex flex-col gap-6 animate-fade-in">

            {/* Feature Cards */}
            <div className="grid grid-cols-2 gap-3">
               <div onClick={() => setView('ar')} className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg cursor-pointer active:scale-95 transition-transform relative overflow-hidden">
                  <span className="material-symbols-outlined text-3xl mb-1">view_in_ar</span>
                  <h3 className="font-bold">AR Place</h3>
                  <p className="text-xs opacity-80">Visualize in space</p>
                  <div className="absolute -right-4 -bottom-4 size-20 bg-white/10 rounded-full blur-xl"></div>
               </div>
               <div onClick={() => setView('consult')} className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 text-white shadow-lg cursor-pointer active:scale-95 transition-transform relative overflow-hidden">
                  <span className="material-symbols-outlined text-3xl mb-1">support_agent</span>
                  <h3 className="font-bold">Expert Help</h3>
                  <p className="text-xs opacity-80">Ask a botanist</p>
                  <div className="absolute -right-4 -bottom-4 size-20 bg-white/10 rounded-full blur-xl"></div>
               </div>
               <div onClick={() => setView('tools')} className="col-span-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-4 flex items-center justify-between shadow-subtle cursor-pointer active:scale-95 transition-transform">
                  <div className="flex items-center gap-3">
                     <div className="size-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                        <span className="material-symbols-outlined">home_repair_service</span>
                     </div>
                     <div>
                        <h3 className="font-bold text-text-primary dark:text-white">Care Tools</h3>
                        <p className="text-xs text-text-secondary dark:text-gray-400">Water Calculator, Light Meter</p>
                     </div>
                  </div>
                  <span className="material-symbols-outlined text-gray-400">chevron_right</span>
               </div>
            </div>

            {/* Categories */}
            <div>
               <h3 className="font-bold text-text-primary dark:text-white mb-3">Browse by Category</h3>
               <div className="grid grid-cols-3 gap-3">
                  {categories.map((cat) => (
                     <div key={cat.name} className={`rounded-xl p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105 ${cat.name === 'Indoor' ? 'dark:bg-green-900/20' : 'dark:bg-zinc-800'} bg-white shadow-sm border border-gray-100 dark:border-zinc-700`}>
                        <div className={`p-2 rounded-full ${cat.color} bg-opacity-20`}>
                           <span className="material-symbols-outlined text-xl">{cat.icon}</span>
                        </div>
                        <span className="text-xs font-medium text-text-primary dark:text-gray-300">{cat.name}</span>
                     </div>
                  ))}
               </div>
            </div>

            {/* Database List */}
            <div>
               <h3 className="font-bold text-text-primary dark:text-white mb-3">Plant Database</h3>
               <div className="grid grid-cols-2 gap-4">
                  {filteredPlants.map((plant: any) => (
                     <div
                        key={plant.id}
                        onClick={() => plant.isHistory && onPlantClick && onPlantClick(plant.original)}
                        className="group relative bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-subtle dark:shadow-subtle-dark border border-gray-100 dark:border-zinc-700 cursor-pointer hover:shadow-xl transition-all duration-300 active:scale-[0.98]"
                     >
                        <div className="aspect-square bg-gray-100 overflow-hidden">
                           <img src={plant.img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />

                           {/* History Badge */}
                           {plant.isHistory && (
                              <div className="absolute top-2 left-2 z-10 bg-forest/80 backdrop-blur-md text-[10px] font-bold text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                 <span className="material-symbols-outlined !text-[12px]">camera</span>
                                 MY SCAN
                              </div>
                           )}
                        </div>
                        <div className="p-3">
                           <h4 className="font-bold text-sm text-text-primary dark:text-white truncate">{plant.name}</h4>
                           <p className="text-[10px] font-medium text-text-secondary dark:text-gray-400 uppercase tracking-wider">{plant.type}</p>
                        </div>

                        {plant.isHistory && (
                           <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="material-symbols-outlined text-forest text-lg">arrow_forward</span>
                           </div>
                        )}
                     </div>
                  ))}
               </div>
               {!navigator.onLine && (
                  <p className="text-center text-xs text-orange-500 mt-4 bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg">
                     Offline Mode: Showing cached database
                  </p>
               )}
            </div>

         </main>
      </div>
   );
};

export default ExploreView;
