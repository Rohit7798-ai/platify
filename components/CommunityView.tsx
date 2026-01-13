
import React from 'react';
import { CommunityPost } from '../types';

const mockPosts: CommunityPost[] = [
  {
    id: '1',
    user: 'Sarah Green',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=1000&auto=format&fit=crop',
    caption: 'My Aloe Vera is finally flowering! 🌸 Has anyone else seen this happen indoors?',
    likes: 124,
    comments: 18,
    timeAgo: '2h ago',
    tags: ['Succulents', 'IndoorGarden']
  },
  {
    id: '2',
    user: 'Mike Botanist',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    image: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?q=80&w=1000&auto=format&fit=crop',
    caption: 'Pro tip: Group your tropical plants together to increase humidity levels naturally. 🌿💧',
    likes: 89,
    comments: 5,
    timeAgo: '5h ago',
    tags: ['Tips', 'Tropicals']
  }
];

const CommunityView: React.FC = () => {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center bg-background-light/95 dark:bg-background-dark/95 px-4 py-3 justify-between backdrop-blur-md border-b border-black/5 dark:border-white/5">
        <h2 className="text-xl font-semibold leading-tight flex-1 font-display text-text-primary dark:text-white">Community</h2>
        <button className="size-9 rounded-full bg-forest dark:bg-green-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform">
           <span className="material-symbols-outlined text-lg">add</span>
        </button>
      </div>

      <main className="flex-grow px-4 pt-4 flex flex-col gap-6 animate-spring-in">
        
        {/* Topics */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
           {['Trending', 'Help Needed', 'Showcase', 'Tips', 'Events'].map(topic => (
              <button key={topic} className="px-4 py-1.5 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-medium whitespace-nowrap text-text-secondary dark:text-gray-300">
                 {topic}
              </button>
           ))}
        </div>

        {/* Posts Feed */}
        <div className="flex flex-col gap-6">
           {mockPosts.map(post => (
              <div key={post.id} className="bg-white dark:bg-zinc-800 rounded-2xl shadow-subtle dark:shadow-subtle-dark overflow-hidden border border-gray-100 dark:border-zinc-700">
                 
                 {/* Post Header */}
                 <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <img src={post.userAvatar} className="size-10 rounded-full bg-gray-100" />
                       <div>
                          <p className="font-bold text-sm text-text-primary dark:text-white">{post.user}</p>
                          <p className="text-xs text-text-secondary dark:text-gray-500">{post.timeAgo}</p>
                       </div>
                    </div>
                    <button className="text-gray-400">
                       <span className="material-symbols-outlined">more_horiz</span>
                    </button>
                 </div>

                 {/* Post Image */}
                 <img src={post.image} className="w-full aspect-[4/3] object-cover" />

                 {/* Post Actions */}
                 <div className="px-4 py-3 flex items-center gap-4">
                    <button className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors">
                       <span className="material-symbols-outlined">favorite</span>
                       <span className="text-sm font-semibold">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors">
                       <span className="material-symbols-outlined">chat_bubble</span>
                       <span className="text-sm font-semibold">{post.comments}</span>
                    </button>
                    <button className="flex items-center gap-1 text-gray-600 dark:text-gray-300 ml-auto">
                       <span className="material-symbols-outlined">share</span>
                    </button>
                 </div>

                 {/* Caption */}
                 <div className="px-4 pb-4">
                    <p className="text-sm text-text-primary dark:text-gray-200">
                       <span className="font-bold mr-2">{post.user}</span>
                       {post.caption}
                    </p>
                    <div className="flex gap-2 mt-2">
                       {post.tags.map(tag => (
                          <span key={tag} className="text-xs text-forest dark:text-sage font-medium">#{tag}</span>
                       ))}
                    </div>
                 </div>
              </div>
           ))}
        </div>
        
        {/* End of feed */}
        <div className="text-center py-6 text-gray-400 text-sm">
           <p>You're all caught up! 🌱</p>
        </div>

      </main>
    </div>
  );
};

export default CommunityView;
