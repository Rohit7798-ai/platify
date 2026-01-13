
import React, { useState } from 'react';

interface Guide {
  id: number;
  title: string;
  category: string;
  readTime: string;
  image: string;
  description: string;
  content?: string; // Extended content for the detail view
}

const guides: Guide[] = [
  {
    id: 1,
    title: "Watering 101: The Basics",
    category: "Beginner",
    readTime: "3 min",
    image: "https://images.unsplash.com/photo-1520302665767-e32d904677f9?q=80&w=1000&auto=format&fit=crop",
    description: "Learn the golden rules of watering to keep your plants happy and hydrated without drowning them.",
    content: "Watering is the most common way houseplant parents accidentally kill their plants. The golden rule is to check the soil moisture before watering. Stick your finger about an inch into the soil; if it feels dry, it's time to water. If it's damp, check back in a few days. Remember, it's always better to underwater than to overwater. Signs of overwatering include yellowing leaves and mushy stems, while underwatering often shows as drooping or crispy brown edges."
  },
  {
    id: 2,
    title: "Repotting Guide",
    category: "Maintenance",
    readTime: "5 min",
    image: "https://images.unsplash.com/photo-1463320898484-cdee8141c787?q=80&w=1000&auto=format&fit=crop",
    description: "Signs your plant needs a new home and a step-by-step guide on how to move it safely.",
    content: "Repotting doesn't always mean changing the planter size; sometimes it just means refreshing the soil. However, if you see roots growing out of the drainage holes or the water sits on top of the soil without draining, it's time to size up. Choose a pot that is only 1-2 inches larger in diameter than the current one. Gently loosen the root ball, place it in the new pot with fresh potting mix, and water thoroughly to help the plant settle."
  },
  {
    id: 3,
    title: "Common Pests & Solutions",
    category: "Health",
    readTime: "4 min",
    image: "https://images.unsplash.com/photo-1599598425947-d35241fa75a2?q=80&w=1000&auto=format&fit=crop",
    description: "Identify and treat common houseplant enemies like spider mites, aphids, and mealybugs.",
    content: "Pests are a natural part of keeping plants. Spider mites look like tiny moving dots and leave fine webs. Mealybugs look like white cottony fluff. Scale insects appear as hard brown bumps. For most pests, wiping leaves with a mixture of water and mild dish soap or using Neem oil is effective. Isolate the infected plant immediately to prevent the spread to your other green friends."
  },
  {
    id: 4,
    title: "Light Requirements Decoded",
    category: "Beginner",
    readTime: "3 min",
    image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1000&auto=format&fit=crop",
    description: "Direct, indirect, low light? We break down what these terms actually mean for your leafy friends.",
    content: "Lighting can be confusing. 'Bright, indirect light' usually means close to a window but not in the direct path of the sunbeams—think of the light filtered through a sheer curtain. 'Low light' doesn't mean no light; it means further away from windows or in north-facing rooms. 'Direct light' is intense sun hitting the leaves directly, which cacti and succulents love but can burn tropical plants."
  },
   {
    id: 5,
    title: "Fertilizing Fundamentals",
    category: "Maintenance",
    readTime: "4 min",
    image: "https://images.unsplash.com/photo-1612361666872-132d43d1a884?q=80&w=1000&auto=format&fit=crop",
    description: "When and how to feed your plants to boost growth and vibrant foliage.",
    content: "Plants need food too! The three main nutrients are Nitrogen (N) for leaves, Phosphorus (P) for roots/flowers, and Potassium (K) for overall health. Liquid fertilizers are easiest to control. Dilute them to half-strength to avoid 'fertilizer burn'. Generally, fertilize only during the growing season (spring and summer) and stop during fall and winter when most plants go dormant."
  }
];

const GuidesView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);

  const filteredGuides = selectedCategory === 'All' 
    ? guides 
    : guides.filter(guide => guide.category === selectedCategory);

  const categories = ['All', 'Beginner', 'Maintenance', 'Health', 'Styling'];

  const handleGuideClick = (guide: Guide) => {
    setSelectedGuide(guide);
  };

  const closeGuide = () => {
    setSelectedGuide(null);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark pb-28">
      {/* Header */}
       <div className="sticky top-0 z-10 flex items-center bg-background-light/80 dark:bg-background-dark/80 px-4 py-3 justify-between backdrop-blur-md border-b border-black/5 dark:border-white/5">
        <div className="w-10"></div>
        <h2 className="text-xl font-semibold leading-tight flex-1 text-center font-display text-text-primary dark:text-white">Plant Guides</h2>
        <div className="flex w-10 items-center justify-end">
             <button className="flex items-center justify-center size-10 rounded-full text-text-primary dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined">search</span>
          </button>
        </div>
      </div>

      <main className="flex-grow px-5 pt-4 flex flex-col gap-6 animate-spring-in">
        {/* Featured Guide */}
        <div 
          onClick={() => handleGuideClick({
            id: 99,
            title: "Mastering the Art of Propagation",
            category: "Advanced",
            readTime: "6 min",
            image: "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?q=80&w=1000&auto=format&fit=crop",
            description: "Multiply your collection for free! Learn the easiest methods to propagate your favorite houseplants.",
            content: "Propagation is magical. The easiest method for many vines like Pothos is water propagation. Snip a stem just below a 'node' (the brown bump where leaves grow). Place the cutting in a jar of water, ensuring the node is submerged but leaves are dry. Change water weekly. In a few weeks, roots will appear! Once roots are 2 inches long, transfer to soil."
          })}
          className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-lg group cursor-pointer"
        >
           <img src="https://images.unsplash.com/photo-1463936575829-25148e1db1b8?q=80&w=1000&auto=format&fit=crop" loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Featured" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5 flex flex-col justify-end text-white">
              <span className="bg-green-500 w-fit text-white text-[10px] font-bold px-2 py-1 rounded-md mb-2 tracking-wider uppercase">Featured Guide</span>
              <h3 className="text-xl font-bold font-display leading-tight mb-1">Mastering the Art of Propagation</h3>
              <p className="text-sm text-gray-200 line-clamp-2">Multiply your collection for free! Learn the easiest methods to propagate your favorite houseplants.</p>
           </div>
        </div>

        {/* Categories Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-5 px-5">
            {categories.map((cat, i) => (
                <button 
                  key={i} 
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                    selectedCategory === cat 
                      ? 'bg-text-primary text-white dark:bg-white dark:text-black shadow-md' 
                      : 'bg-white dark:bg-white/5 text-text-secondary dark:text-gray-400 border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/10'
                  }`}
                >
                    {cat}
                </button>
            ))}
        </div>

        {/* Guides List */}
        <div className="flex flex-col gap-4">
            <h3 className="font-display font-semibold text-lg text-text-primary dark:text-white">
              {selectedCategory === 'All' ? 'Latest Articles' : `${selectedCategory} Articles`}
            </h3>
            
            {filteredGuides.length > 0 ? (
              filteredGuides.map(guide => (
                  <div 
                    key={guide.id} 
                    onClick={() => handleGuideClick(guide)}
                    className="flex gap-4 p-3 bg-white dark:bg-white/5 rounded-xl shadow-subtle dark:shadow-subtle-dark cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
                  >
                      <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-200">
                          <img src={guide.image} loading="lazy" alt={guide.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      </div>
                      <div className="flex flex-col justify-between py-1 flex-1">
                          <div>
                              <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-[10px] font-bold tracking-wider uppercase ${
                                    guide.category === 'Beginner' ? 'text-blue-500' :
                                    guide.category === 'Health' ? 'text-red-500' :
                                    guide.category === 'Maintenance' ? 'text-orange-500' :
                                    'text-green-500'
                                  }`}>{guide.category}</span>
                                  <span className="text-[10px] text-text-secondary dark:text-gray-500 flex items-center gap-1">
                                      <span className="w-0.5 h-0.5 rounded-full bg-gray-400"></span>
                                      {guide.readTime}
                                  </span>
                              </div>
                              <h4 className="font-display font-semibold text-text-primary dark:text-white leading-tight line-clamp-2 mb-1">{guide.title}</h4>
                          </div>
                          <p className="text-xs text-text-secondary dark:text-gray-400 line-clamp-2">{guide.description}</p>
                      </div>
                  </div>
              ))
            ) : (
              <div className="text-center py-10 opacity-60">
                <span className="material-symbols-outlined text-4xl mb-2 text-text-secondary">menu_book</span>
                <p className="text-sm">No articles found in this category.</p>
              </div>
            )}
        </div>
      </main>

      {/* Article Detail Modal */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={closeGuide}></div>
          <div className="relative w-full h-[90vh] sm:h-auto sm:max-h-[85vh] max-w-lg overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl animate-spring-in scrollbar-hide">
            
            {/* Modal Image */}
            <div className="relative h-64 w-full">
              <img src={selectedGuide.image} className="w-full h-full object-cover" alt={selectedGuide.title} />
              <button 
                onClick={closeGuide}
                className="absolute top-4 right-4 size-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                 <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-white mb-2 ${
                    selectedGuide.category === 'Beginner' ? 'bg-blue-500' :
                    selectedGuide.category === 'Health' ? 'bg-red-500' :
                    selectedGuide.category === 'Maintenance' ? 'bg-orange-500' :
                    'bg-green-500'
                  }`}>
                   {selectedGuide.category}
                 </span>
                 <h2 className="text-2xl font-bold font-display text-white leading-tight">{selectedGuide.title}</h2>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="flex items-center gap-4 text-sm text-text-secondary dark:text-gray-400 mb-6 border-b border-gray-100 dark:border-white/10 pb-4">
                 <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-lg">schedule</span>
                    {selectedGuide.readTime} read
                 </div>
                 <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-lg">person</span>
                    Botany Team
                 </div>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <p className="text-lg font-medium text-text-primary dark:text-white mb-4 leading-relaxed">
                  {selectedGuide.description}
                </p>
                <p className="text-text-secondary dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {selectedGuide.content || "Full article content would go here. This includes detailed steps, expert tips, and specific instructions tailored to the topic. For example, if this is a watering guide, we would discuss checking soil moisture, understanding drainage, and spotting signs of overwatering."}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/10">
                <h4 className="font-semibold text-text-primary dark:text-white mb-3">Was this helpful?</h4>
                <div className="flex gap-3">
                  <button className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 flex items-center justify-center gap-2 text-text-primary dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <span className="material-symbols-outlined text-green-500">thumb_up</span>
                    Yes
                  </button>
                  <button className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 flex items-center justify-center gap-2 text-text-primary dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <span className="material-symbols-outlined">thumb_down</span>
                    No
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default GuidesView;
