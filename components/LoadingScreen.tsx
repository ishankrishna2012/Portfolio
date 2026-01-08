import React, { useEffect, useState, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

interface Props {
  onUnlock: () => void;
  isReady: boolean;
}

const GREETINGS = [
  "Hello",        // English
  "Hola",         // Spanish
  "Bonjour",      // French
  "Guten Tag",    // German
  "Ciao",         // Italian
  "Olá",          // Portuguese
  "Namaste",      // Hindi
  "Salam",        // Urdu/Arabic
  "Konnichiwa",   // Japanese
  "Nǐ hǎo",       // Chinese
  "Anyoung",      // Korean
  "Privet",       // Russian
  "Marhaba",      // Arabic
  "Merhaba",      // Turkish
  "Hej",          // Swedish
  "Hallo",        // Dutch
  "Sawasdee",     // Thai
  "Xin Chào"      // Vietnamese
];

const LoadingScreen: React.FC<Props> = ({ onUnlock, isReady }) => {
  const [progress, setProgress] = useState(0);
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  
  // Spotlight Ref
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Greeting Animation Loop
  useEffect(() => {
    if (showButton) return;
    
    const interval = setInterval(() => {
      setGreetingIndex((prev) => (prev + 1) % GREETINGS.length);
    }, 1200); // Slowed down from 250ms to 1200ms
    
    return () => clearInterval(interval);
  }, [showButton]);

  // Loading Progress
  useEffect(() => {
    if (!isReady) {
      const interval = setInterval(() => {
        setProgress(p => (p < 90 ? p + Math.random() * 5 : p));
      }, 100);
      return () => clearInterval(interval);
    } else {
      setProgress(100);
      setTimeout(() => setShowButton(true), 1200); 
    }
  }, [isReady]);

  const handleEnter = () => {
    setIsExiting(true);
    setTimeout(onUnlock, 1000); 
  };

  // Mouse move for spotlight
  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`fixed inset-0 z-[100] bg-black text-white flex flex-col items-center justify-center transition-all duration-1000 cubic-bezier(0.7, 0, 0.3, 1) ${isExiting ? 'translate-y-[-100%]' : 'translate-y-0'}`}
      style={{ cursor: 'none' }} // Ensure system cursor is hidden
    >
      <div className={`transition-opacity duration-500 flex flex-col items-center gap-12 relative z-10 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
        
        {/* Apple Style Greeting with Flashlight Effect */}
        <div className="h-32 flex items-center justify-center overflow-visible relative group">
             {/* Base Text (Dim) */}
             <h1 className="text-6xl md:text-9xl font-bold tracking-tighter text-white/20 select-none transition-all duration-300">
                 {showButton ? "Welcome." : GREETINGS[greetingIndex]}
             </h1>

             {/* Spotlight Text (Lit up based on mouse) */}
             <h1 
                className="absolute inset-0 text-6xl md:text-9xl font-bold tracking-tighter text-white select-none pointer-events-none transition-all duration-300"
                style={{
                    maskImage: `radial-gradient(200px circle at ${mousePos.x}px ${mousePos.y - (window.innerHeight/2) + 64}px, white, transparent)`,
                    WebkitMaskImage: `radial-gradient(200px circle at ${mousePos.x}px ${mousePos.y - (window.innerHeight/2) + 64}px, white, transparent)`
                }}
             >
                 {showButton ? "Welcome." : GREETINGS[greetingIndex]}
             </h1>
        </div>

        {/* Interactive Enter Button */}
        <div className="h-20 flex items-center justify-center w-full relative">
            {!showButton ? (
                <div className="w-64 h-1 bg-gray-900 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-white shadow-[0_0_10px_white] transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            ) : (
                <button 
                    onClick={handleEnter}
                    className="magnetic group relative flex items-center gap-4 px-10 py-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-md transition-all duration-500 hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 overflow-hidden"
                >
                    <span className="relative z-10 text-lg font-medium tracking-widest uppercase">Enter Portfolio</span>
                    <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                    
                    {/* Button internal glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]" />
                </button>
            )}
        </div>
        
      </div>

      {/* Footer info */}
      <div className="absolute bottom-8 text-xs text-gray-600 font-medium tracking-[0.3em] uppercase opacity-50">
        DPS Dubai Student
      </div>
    </div>
  );
};

export default LoadingScreen;