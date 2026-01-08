import React, { useRef, useState, useEffect } from 'react';
import { ContentData } from '../types';
import EditableText from './EditableText';
import ScrollReveal from './ScrollReveal';
import { RefreshCw, UploadCloud } from 'lucide-react';

interface Props {
  content: ContentData;
  isAdmin: boolean;
  onUpdate: (key: keyof ContentData, val: string) => Promise<void>;
  isGlassMode: boolean;
  t: any;
}

const Hero: React.FC<Props> = ({ content, isAdmin, onUpdate, isGlassMode, t }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFetchingNews, setIsFetchingNews] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Scroll effect handler
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image file too large. Please select an image under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          onUpdate('heroImage', reader.result as string);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchNews = async () => {
    setIsFetchingNews(true);
    try {
        const response = await fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=1');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            const headline = data.results[0].title;
            await onUpdate('heroTagline', headline);
        } else {
            alert('No news found right now.');
        }
    } catch (error) {
        console.error('Failed to fetch news:', error);
        alert('Could not fetch the latest headlines. Please try again.');
    } finally {
        setIsFetchingNews(false);
    }
  };

  const handleScrollToProjects = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const projectsSection = document.getElementById('projects');
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Calculate Scroll Effects
  const scrollThreshold = 300; 
  const effectiveScroll = Math.max(0, scrollY - scrollThreshold);
  
  const textScale = Math.max(0.9, 1 - effectiveScroll / 1200); 
  const textOpacity = Math.max(0, 1 - effectiveScroll / 600); 
  const textBlur = Math.min(10, effectiveScroll / 60); 
  const textTranslate = effectiveScroll * 0.3;

  const imageOpacity = Math.max(0, 1 - scrollY / 900);
  const imageTranslate = scrollY * 0.15;

  return (
    <section 
        id="home" 
        className={`min-h-screen flex flex-col justify-center items-center px-6 relative overflow-visible pt-24 pb-12 transition-all duration-700
            ${isGlassMode ? 'glass-panel rounded-[3rem] mx-4 md:mx-12 my-4' : ''}
        `}
    >
      <style>{`
        @keyframes liquid-morph {
          0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
          100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
        }
        .liquid-shape {
          animation: liquid-morph 8s ease-in-out infinite;
        }
      `}</style>
      
      <div className="text-center max-w-5xl z-10 flex flex-col items-center gap-10 mt-4 perspective-container relative">
        
        {/* Profile Image - Liquid Blob Shape */}
        <ScrollReveal width="fit-content">
            <div 
              className={`
                 relative group cursor-default w-64 h-64 md:w-80 md:h-80 flex items-center justify-center 
                 liquid-shape overflow-hidden shadow-2xl transition-all duration-500
                 ${isGlassMode 
                    ? 'ring-8 ring-white/10 bg-white/5 backdrop-blur-md shadow-[0_0_40px_rgba(255,255,255,0.1)]' 
                    : 'ring-4 ring-white/20 dark:ring-white/10'
                 }
              `}
              style={{
                transform: `translateY(${imageTranslate}px)`, 
                opacity: imageOpacity
              }}
            >
                <img 
                  src={content.heroImage || ''} 
                  alt="Ishan Krishna Verma" 
                  className={`
                      w-full h-full object-cover relative z-10 transition-transform duration-500
                      ${isGlassMode ? 'scale-110 opacity-90' : 'scale-110 hover:scale-125'}
                  `}
                />

                 {/* Edit Overlay (Admin) */}
                 {isAdmin && (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <UploadCloud size={32} className="text-white mb-2" />
                    <span className="text-white text-xs font-bold tracking-widest uppercase">Upload Photo</span>
                  </div>
                )}
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            </div>
        </ScrollReveal>

        {/* Text Content */}
        <div 
            className="space-y-6 flex flex-col items-center relative will-change-transform"
            style={{
                transform: `translateY(${textTranslate}px) scale(${textScale})`,
                opacity: textOpacity,
                filter: `blur(${textBlur}px)`,
                pointerEvents: textOpacity < 0.5 ? 'none' : 'auto'
            }}
        >
          <ScrollReveal delay={0.2} width="100%">
             <div className="inline-block px-5 py-2 rounded-full bg-secondary/50 backdrop-blur-md text-xs md:text-sm font-bold text-primary uppercase tracking-[0.25em] border border-border shadow-lg">
                Ishan Krishna Verma
             </div>
          </ScrollReveal>
          
          <ScrollReveal delay={0.4} width="100%">
              <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-foreground leading-[1.1] md:leading-[1] max-w-4xl mx-auto drop-shadow-sm min-h-[1.1em] text-balance">
                 <EditableText
                    value={content.heroTagline}
                    isAdmin={isAdmin}
                    multiline
                    useTypewriter={true}
                    contentKey="heroTagline"
                    onSave={(val) => onUpdate('heroTagline', val)}
                    className="block text-transparent bg-clip-text bg-gradient-to-b from-foreground via-foreground/90 to-foreground/60 pb-2"
                 />
              </h1>
          </ScrollReveal>

          {/* Fetch News Button */}
          <ScrollReveal delay={0.5}>
            <button 
                onClick={fetchNews}
                disabled={isFetchingNews}
                className={`mt-4 flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-white rounded-full transition-all duration-300 disabled:opacity-50 border border-transparent
                   ${isGlassMode ? 'bg-white/10 hover:bg-white/20 border-white/10 shadow-lg' : 'bg-secondary/30 hover:bg-black/80 dark:hover:bg-white/20'}
                `}
            >
                <RefreshCw size={14} className={isFetchingNews ? "animate-spin" : ""} />
                {isFetchingNews ? t.loading : t.news}
            </button>
          </ScrollReveal>
        </div>
        
        <ScrollReveal delay={0.6}>
           <a 
             href="#projects" 
             onClick={handleScrollToProjects}
             className="group relative inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium overflow-hidden transition-all hover:scale-105 hover:shadow-lg mt-8 shadow-blue-500/20"
           >
             <span className="relative flex items-center gap-2">
               {t.explore} <span className="group-hover:translate-x-1 transition-transform">→</span>
             </span>
           </a>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Hero;