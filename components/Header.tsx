import React from 'react';
import { Leaf } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-stone-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <Leaf className="w-6 h-6 text-emerald-600" />
          </div>
          <span className="text-xl font-bold text-stone-800 tracking-tight">Plantify</span>
        </div>
        <nav>
          <a
            href="#"
            className="text-sm font-medium text-stone-600 hover:text-emerald-600 transition-colors"
          >
            About
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;