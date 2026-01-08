import React, { useState } from 'react';
import { Home, User, Code, Cpu, Moon, Sun, Settings, LogOut, Check } from 'lucide-react';

interface Props {
  isDark: boolean;
  toggleTheme: () => void;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  openAdminModal: () => void;
  isGlassMode: boolean;
  setIsGlassMode: (val: boolean) => void;
  language: string;
  setLanguage: (lang: string) => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'jp', label: '日本語' },
  { code: 'cn', label: '中文' }
];

const DynamicIsland: React.FC<Props> = ({ isDark, toggleTheme, isAdmin, setIsAdmin, openAdminModal, language, setLanguage }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Shake effect when interacting
  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 300);
  };

  const handleLangSelect = (code: string) => {
    setLanguage(code);
    setShowLangMenu(false);
  };

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div 
        className={`inverse-cursor-zone pointer-events-auto bg-black/90 dark:bg-white/90 backdrop-blur-2xl text-white dark:text-black shadow-2xl overflow-visible relative
          ${isShaking ? 'animate-[shake_0.3s_ease-in-out]' : ''}
          transition-[width,height,border-radius,transform] duration-500 cubic-bezier(0.25, 0.8, 0.25, 1)
        `}
        style={{
            // Accurate sizes for expanding effect
            width: isExpanded ? '540px' : '120px', 
            height: isExpanded ? '80px' : '6px', // Smaller height in idle state (home indicator style)
            borderRadius: isExpanded ? '40px' : '100px',
            willChange: 'width, height, border-radius',
            marginTop: isExpanded ? '0px' : '10px' // Slight offset adjustment for indicator look from top
        }}
        onMouseEnter={() => {
            setIsExpanded(true);
            triggerShake();
        }}
        onMouseLeave={() => {
            setIsExpanded(false);
            setShowLangMenu(false);
        }}
      >
        <div className="relative w-full h-full flex items-center justify-center">
            
            {/* Idle State: Simple Home Indicator Pill */}
            <div 
                className="absolute inset-0 flex items-center justify-center transition-all duration-300 delay-100"
                style={{ opacity: isExpanded ? 0 : 1 }}
            >
                {/* Visual indicator bar is the container itself in this mode, simplified */}
            </div>

            {/* Expanded State: Controls */}
            <div 
                className="w-full h-full flex items-center justify-between px-6 transition-all duration-300 delay-75"
                style={{ 
                    opacity: isExpanded ? 1 : 0, 
                    transform: isExpanded ? 'scale(1)' : 'scale(0.9)',
                    pointerEvents: isExpanded ? 'auto' : 'none'
                }}
            >
                
                {/* Left: Navigation */}
                <div className="flex items-center gap-1">
                    {[
                        { icon: Home, href: "#home" },
                        { icon: User, href: "#about" },
                        { icon: Cpu, href: "#skills" },
                        { icon: Code, href: "#projects" }
                    ].map((item, i) => (
                        <a 
                            key={i} 
                            href={item.href} 
                            className="p-2.5 rounded-full hover:bg-white/20 dark:hover:bg-black/10 transition-colors group"
                        >
                            <item.icon size={20} className="group-hover:scale-110 transition-transform" />
                        </a>
                    ))}
                </div>

                <div className="w-px h-8 bg-white/10 dark:bg-black/10 mx-2" />

                {/* Right: Actions */}
                <div className="flex items-center gap-3 relative">
                    <button 
                        onClick={() => setShowLangMenu(!showLangMenu)}
                        className={`flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/20 dark:hover:bg-black/10 transition-colors ${showLangMenu ? 'bg-white/20 dark:bg-black/10' : ''}`}
                        title="Change Language"
                    >
                        <span className="text-[10px] font-bold tracking-wider">{language.toUpperCase()}</span>
                    </button>

                    {/* Language Dropdown (Opens Downwards now) */}
                    <div 
                        className={`absolute top-full right-16 mt-4 w-32 bg-black/90 dark:bg-white/90 backdrop-blur-xl border border-white/10 dark:border-black/10 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 origin-top-right
                            ${showLangMenu && isExpanded ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
                        `}
                    >
                        <div className="py-2">
                            {SUPPORTED_LANGUAGES.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLangSelect(lang.code)}
                                    className="w-full px-4 py-2 text-left text-xs font-medium hover:bg-white/10 dark:hover:bg-black/10 flex items-center justify-between group text-white dark:text-black"
                                >
                                    <span>{lang.label}</span>
                                    {language === lang.code && <Check size={10} className="text-blue-500" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={toggleTheme} 
                        className="p-2 rounded-full hover:bg-yellow-400/20 dark:hover:bg-yellow-600/20 hover:text-yellow-300 dark:hover:text-yellow-600 transition-colors"
                    >
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    
                    {isAdmin ? (
                        <button onClick={() => setIsAdmin(false)} className="p-2 rounded-full hover:bg-red-500/20 text-red-400 transition-colors">
                            <LogOut size={20} />
                        </button>
                    ) : (
                         <button onClick={openAdminModal} className="p-2 rounded-full hover:bg-white/20 dark:hover:bg-black/10 transition-colors">
                            <Settings size={20} />
                        </button>
                    )}
                </div>

            </div>
        </div>
      </div>
      
      {/* Keyframes for Shake */}
      <style>{`
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-2px) rotate(-1deg); }
            75% { transform: translateX(2px) rotate(1deg); }
        }
      `}</style>
    </div>
  );
};

export default DynamicIsland;