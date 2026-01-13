
import React, { useState } from 'react';

interface ConsultViewProps {
  onBack: () => void;
}

const ConsultView: React.FC<ConsultViewProps> = ({ onBack }) => {
  const [query, setQuery] = useState('');

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
       <div className="sticky top-0 z-10 flex items-center bg-white/90 dark:bg-zinc-900/90 px-4 py-3 justify-between backdrop-blur-md border-b border-gray-200 dark:border-white/10">
        <button onClick={onBack} className="size-10 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 text-text-primary dark:text-white">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold text-text-primary dark:text-white">Expert Consultation</h2>
        <div className="w-10"></div>
      </div>

      <div className="p-6 flex flex-col gap-6 animate-spring-in">
         {/* Expert Profile */}
         <div className="flex items-center gap-4 bg-gradient-to-r from-forest to-emerald-700 p-6 rounded-2xl text-white shadow-lg">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=DrGreen" className="size-16 rounded-full border-2 border-white/50 bg-white/10" />
            <div>
               <h3 className="font-bold text-lg">Dr. Olivia Green</h3>
               <p className="text-white/80 text-sm">Certified Botanist • PhD</p>
               <div className="flex items-center gap-1 mt-1 text-xs bg-white/20 w-fit px-2 py-0.5 rounded-full">
                  <span className="size-2 rounded-full bg-green-400"></span> Available
               </div>
            </div>
         </div>

         <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30 text-amber-900 dark:text-amber-100 text-sm">
            <p><strong>Note:</strong> Expert responses typically take 24-48 hours. Premium members get priority response times.</p>
         </div>

         <div className="flex flex-col gap-2">
            <label className="font-semibold text-text-primary dark:text-white">Describe your issue</label>
            <textarea 
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               className="w-full h-32 p-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-text-primary dark:text-white focus:ring-2 focus:ring-forest outline-none resize-none"
               placeholder="My Monstera has brown spots on the stems..."
            ></textarea>
         </div>

         <div className="flex flex-col gap-2">
             <label className="font-semibold text-text-primary dark:text-white">Attachments</label>
             <div className="grid grid-cols-3 gap-2">
                <button className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-zinc-600 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                   <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
                   <span className="text-xs">Add Photo</span>
                </button>
             </div>
         </div>

         <button className="mt-auto w-full py-4 bg-forest dark:bg-green-600 text-white font-bold rounded-xl shadow-lg hover:brightness-110 transition-all">
            Submit Request ($4.99)
         </button>
      </div>
    </div>
  );
};

export default ConsultView;
