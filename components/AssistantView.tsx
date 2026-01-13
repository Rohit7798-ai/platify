
import React, { useState, useRef, useEffect } from 'react';
import { askBotanist } from '../services/geminiService';
import { ChatMessage } from '../types';

// Utility to compress image inside the component to avoid prop drilling from App
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
         const MAX_WIDTH = 800; 
         let width = img.width;
         let height = img.height;

         if (width > MAX_WIDTH) {
           height *= MAX_WIDTH / width;
           width = MAX_WIDTH;
         }

         const canvas = document.createElement('canvas');
         canvas.width = width;
         canvas.height = height;
         const ctx = canvas.getContext('2d');
         if (ctx) {
             ctx.drawImage(img, 0, 0, width, height);
             resolve(canvas.toDataURL('image/jpeg', 0.7));
         } else {
             reject(new Error("Canvas context failed"));
         }
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const AssistantView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      text: "Hi there! I'm Flora, your personal AI Botanist. 🌿\n\nI can help you with watering schedules, pest control, plant identification, or general gardening tips. What's on your mind today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const suggestedChips = [
    "Why are my leaves yellow?",
    "How often should I water?",
    "Treat spider mites",
    "Best low-light plants"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, selectedImage]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const compressed = await compressImage(e.target.files[0]);
        setSelectedImage(compressed);
      } catch (err) {
        console.error("Image processing error", err);
        alert("Failed to process image. Please try another one.");
      }
    }
  };

  const handleSend = async (text: string = inputText) => {
    // Allow sending if there is text OR an image
    if (!text.trim() && !selectedImage) return;

    const currentImage = selectedImage;
    const currentText = text;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: currentText,
      image: currentImage || undefined,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setSelectedImage(null);
    setIsTyping(true);

    try {
      const responseText = await askBotanist(currentText, currentImage || undefined);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting to the network right now. Please try asking again.",
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center bg-background-light/95 dark:bg-background-dark/95 px-4 py-3 justify-between backdrop-blur-md border-b border-black/5 dark:border-white/5 shadow-sm">
        <div className="w-8"></div>
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold leading-tight text-center font-display text-text-primary dark:text-white flex items-center gap-2">
            AI Assistant
          </h2>
          <span className="text-[10px] text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Online
          </span>
        </div>
        <div className="flex w-8 items-center justify-end">
          <button 
             onClick={() => setMessages([messages[0]])} 
             className="flex items-center justify-center size-8 rounded-full text-text-secondary dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
             title="Clear Chat"
          >
            <span className="material-symbols-outlined text-lg">refresh</span>
          </button>
        </div>
      </div>

      <main className="flex-grow px-4 pt-4 flex flex-col gap-4">
        {/* Messages List */}
        <div className="flex flex-col gap-4 min-h-[50vh]">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] rounded-2xl p-4 shadow-sm text-sm leading-relaxed whitespace-pre-wrap animate-spring-in ${
                  msg.sender === 'user' 
                    ? 'bg-forest dark:bg-green-600 text-white rounded-tr-sm' 
                    : msg.isError 
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 border border-red-100 dark:border-red-900/50 rounded-tl-sm'
                      : 'bg-white dark:bg-zinc-800 text-text-primary dark:text-gray-200 border border-gray-100 dark:border-zinc-700 rounded-tl-sm'
                }`}
              >
                {msg.sender === 'bot' && (
                   <div className="flex items-center gap-2 mb-2 pb-2 border-b border-black/5 dark:border-white/5">
                      <div className="size-5 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                         <span className="material-symbols-outlined text-[12px] text-green-600 dark:text-green-400">smart_toy</span>
                      </div>
                      <span className="text-xs font-bold text-green-700 dark:text-green-400">Flora</span>
                   </div>
                )}
                
                {msg.image && (
                   <div className="mb-3 rounded-lg overflow-hidden border border-black/10 dark:border-white/10">
                      <img src={msg.image} alt="Uploaded" className="max-w-full h-auto object-cover max-h-60 w-full" />
                   </div>
                )}

                {msg.text}
                
                <div className={`text-[10px] mt-2 text-right opacity-60 ${msg.sender === 'user' ? 'text-white' : 'text-text-secondary'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex w-full justify-start">
              <div className="bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl rounded-tl-sm p-4 shadow-sm">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips (Only show if few messages) */}
        {messages.length < 3 && (
           <div className="flex flex-wrap gap-2 justify-center mt-4">
              {suggestedChips.map((chip, idx) => (
                 <button
                   key={idx}
                   onClick={() => handleSend(chip)}
                   className="px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 text-green-700 dark:text-green-300 rounded-full text-xs font-medium hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                 >
                   {chip}
                 </button>
              ))}
           </div>
        )}
      </main>

      {/* Input Area */}
      <div className="fixed bottom-[4.5rem] left-0 right-0 p-4 z-20">
         {/* Gradient Background for Input Area */}
         <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background-light dark:from-background-dark via-background-light dark:via-background-dark to-transparent -z-10"></div>
         
         <div className="max-w-3xl mx-auto flex flex-col gap-2">
            
            {/* Image Preview */}
            {selectedImage && (
              <div className="self-start relative bg-white dark:bg-zinc-800 p-2 rounded-xl shadow-lg border border-gray-100 dark:border-zinc-700 animate-spring-in">
                 <img src={selectedImage} alt="Preview" className="h-20 w-auto rounded-lg object-cover" />
                 <button 
                   onClick={() => setSelectedImage(null)}
                   className="absolute -top-2 -right-2 size-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                 >
                   <span className="material-symbols-outlined text-sm">close</span>
                 </button>
              </div>
            )}

            <div className="flex items-end gap-2 bg-white dark:bg-zinc-800 p-2 rounded-3xl shadow-lg border border-gray-100 dark:border-zinc-700 ring-1 ring-black/5">
                <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="p-3 text-text-secondary dark:text-gray-400 hover:text-forest dark:hover:text-sage transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-white/5"
                   title="Add Photo"
                >
                   <span className="material-symbols-outlined">add_photo_alternate</span>
                </button>
                <input 
                   ref={fileInputRef}
                   type="file"
                   accept="image/*"
                   className="hidden"
                   onChange={handleFileSelect}
                />

                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={selectedImage ? "Ask about this image..." : "Ask about plant care..."}
                  rows={1}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-text-primary dark:text-white placeholder-gray-400 resize-none py-3 max-h-32 min-h-[44px]"
                  style={{ height: 'auto', minHeight: '44px' }}
                />
                
                <button 
                  onClick={() => handleSend()}
                  disabled={(!inputText.trim() && !selectedImage) || isTyping}
                  className="p-3 bg-forest dark:bg-green-600 text-white rounded-full shadow-md hover:bg-emerald-700 dark:hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center"
                >
                   <span className="material-symbols-outlined filled-icon">send</span>
                </button>
             </div>
         </div>
      </div>
    </div>
  );
};

export default AssistantView;
