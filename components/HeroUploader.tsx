import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';

interface HeroUploaderProps {
  onImageSelect: (file: File) => void;
  isAnalyzing: boolean;
}

const HeroUploader: React.FC<HeroUploaderProps> = ({ onImageSelect, isAnalyzing }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onImageSelect(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="relative overflow-hidden bg-white border-b border-stone-200">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1491147334573-44cbb4602074?q=80&w=2500&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
      
      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold text-stone-900 tracking-tight">
            Discover the name of your <span className="text-emerald-600">plant</span>.
          </h1>
          <p className="text-lg text-stone-600 max-w-xl mx-auto">
            Upload a photo to instantly identify plants, get care tips, and learn fascinating facts using advanced AI.
          </p>

          <div 
            className={`mt-10 max-w-xl mx-auto border-2 border-dashed rounded-2xl p-8 transition-all duration-200 cursor-pointer bg-white/80 backdrop-blur-sm
              ${dragActive ? 'border-emerald-500 bg-emerald-50/50' : 'border-stone-300 hover:border-emerald-400 hover:bg-white'}
              ${isAnalyzing ? 'opacity-50 pointer-events-none' : ''}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={onButtonClick}
          >
            <input 
              ref={inputRef}
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleChange}
            />
            
            <div className="flex flex-col items-center justify-center space-y-4">
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
                  <p className="text-stone-600 font-medium">Analyzing your plant...</p>
                </>
              ) : (
                <>
                  <div className="p-4 bg-emerald-100 rounded-full">
                    <Upload className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-stone-900 font-semibold">Click to upload or drag and drop</p>
                    <p className="text-sm text-stone-500">SVG, PNG, JPG or GIF (max 10MB)</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroUploader;