import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import AdminModal from './components/AdminModal';
import LiquidCursor from './components/LiquidCursor';
import LoadingScreen from './components/LoadingScreen';
import DynamicIsland from './components/DynamicIsland';
import LiquidEther from './components/LiquidEther';
import ScrollReveal from './components/ScrollReveal';
import { getContent, getProjects, getSkills, updateContent } from './services/contentService';
import { ContentData, Project, Skill } from './types';
import { Mail, Instagram } from 'lucide-react';

const LinkedInIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 ${className}`}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 21.227.792 22 1.771 22h20.451C23.2 22 24 21.227 24 20.271V1.729C24 .774 23.2 0 22.225 0z"/>
  </svg>
);

// --- TRANSLATIONS DICTIONARY ---
export const translations: Record<string, any> = {
  en: {
    hero: { news: "Latest Space News", loading: "Receiving Transmission...", explore: "Explore Projects" },
    about: { header: "The Developer", age: "Years Old", coding: "Years Coding", live: "Live Projects" },
    skills: { header: "Technical Arsenal", sub: "Additional Technologies" },
    projects: { archive: "The Archive", header: "Selected Works.", view: "View" },
    footer: { text: "Let's build something together.", crafted: "Crafted with" }
  },
  es: {
    hero: { news: "Últimas Noticias Espaciales", loading: "Recibiendo Transmisión...", explore: "Explorar Proyectos" },
    about: { header: "El Desarrollador", age: "Años", coding: "Años Programando", live: "Proyectos en Vivo" },
    skills: { header: "Arsenal Técnico", sub: "Tecnologías Adicionales" },
    projects: { archive: "El Archivo", header: "Trabajos Seleccionados.", view: "Ver" },
    footer: { text: "Construyamos algo juntos.", crafted: "Hecho con" }
  },
  fr: {
    hero: { news: "Dernières Actualités Spatiales", loading: "Réception de la Transmission...", explore: "Explorer les Projets" },
    about: { header: "Le Développeur", age: "Ans", coding: "Années de Code", live: "Projets en Direct" },
    skills: { header: "Arsenal Technique", sub: "Technologies Supplémentaires" },
    projects: { archive: "L'Archive", header: "Travaux Sélectionnés.", view: "Voir" },
    footer: { text: "Construisons quelque chose ensemble.", crafted: "Conçu avec" }
  },
  de: {
    hero: { news: "Neueste Weltraumnachrichten", loading: "Übertragung empfangen...", explore: "Projekte Erkunden" },
    about: { header: "Der Entwickler", age: "Jahre alt", coding: "Jahre Programmieren", live: "Live-Projekte" },
    skills: { header: "Technisches Arsenal", sub: "Zusätzliche Technologien" },
    projects: { archive: "Das Archiv", header: "Ausgewählte Arbeiten.", view: "Ansehen" },
    footer: { text: "Lass uns etwas zusammen bauen.", crafted: "Erstellt mit" }
  },
  jp: {
    hero: { news: "最新の宇宙ニュース", loading: "送信を受信中...", explore: "プロジェクトを探索" },
    about: { header: "開発者", age: "歳", coding: "コーディング歴（年）", live: "ライブプロジェクト" },
    skills: { header: "技術的武器庫", sub: "その他の技術" },
    projects: { archive: "アーカイブ", header: "厳選された作品。", view: "見る" },
    footer: { text: "一緒に何かを作りましょう。", crafted: "で作られた" }
  },
  cn: {
    hero: { news: "最新太空新闻", loading: "接收传输中...", explore: "探索项目" },
    about: { header: "开发者", age: "岁", coding: "编程年限", live: "实时项目" },
    skills: { header: "技术库", sub: "其他技术" },
    projects: { archive: "归档", header: "精选作品。", view: "查看" },
    footer: { text: "让我们一起构建。", crafted: "制作于" }
  }
};

const App: React.FC = () => {
  const [content, setContent] = useState<ContentData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isGlassMode, setIsGlassMode] = useState(true);
  
  // Language State
  const [language, setLanguage] = useState('en');
  
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        setIsDark(true);
        document.documentElement.classList.add('dark');
      } else {
        setIsDark(false);
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.warn("Theme initialization failed", e);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const c = await getContent();
        const p = await getProjects();
        const s = await getSkills();
        setContent(c);
        setProjects(p);
        setSkills(s);
        setDataLoaded(true);
      } catch (err) {
        console.error("Failed to load content:", err);
      }
    };
    init();
  }, []);

  const handleContentUpdate = async (key: keyof ContentData, val: string) => {
    if (!content) return;
    const newContent = { ...content, [key]: val };
    setContent(newContent);
    await updateContent({ [key]: val });
  };

  useEffect(() => {
    const root = document.getElementById('root');
    if (isGlassMode) {
      root?.classList.add('liquid-glass-active');
    } else {
      root?.classList.remove('liquid-glass-active');
    }
  }, [isGlassMode]);

  const t = translations[language];

  return (
    <div className={`
        bg-transparent min-h-screen font-sans selection:bg-blue-100/50 dark:selection:bg-blue-900/50 
        relative z-10 text-apple-dark dark:text-gray-100 cursor-none overflow-x-hidden
        ${isGlassMode ? 'glass-mode-enabled' : ''}
    `}>
      
      <style>{`
        .glass-panel {
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(40px) saturate(180%);
            -webkit-backdrop-filter: blur(40px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.4);
            box-shadow: 
                0 20px 40px rgba(0,0,0,0.05),
                inset 0 0 0 1px rgba(255,255,255,0.2);
        }
        
        .dark .glass-panel {
            background: rgba(20, 20, 20, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }

        .glass-mode-enabled .card, 
        .glass-mode-enabled .project-card,
        .glass-mode-enabled section#about,
        .glass-mode-enabled section#skills {
            background: rgba(255, 255, 255, 0.15) !important;
            backdrop-filter: blur(30px) !important;
            border: 1px solid rgba(255, 255, 255, 0.3) !important;
            border-radius: 2rem !important;
            margin-left: 1rem;
            margin-right: 1rem;
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
        }

        .dark .glass-mode-enabled .card,
        .dark .glass-mode-enabled .project-card,
        .dark .glass-mode-enabled section#about,
        .dark .glass-mode-enabled section#skills {
            background: rgba(0, 0, 0, 0.3) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .glass-mode-enabled #home h1 {
            text-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
      `}</style>

      {/* NEW BACKGROUND: Liquid Ether */}
      <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none transition-opacity duration-1000" style={{ opacity: isGlassMode ? 1 : 0 }}>
         <LiquidEther isDark={isDark} />
      </div>

      <div 
        className="fixed inset-0 bg-gray-50 dark:bg-black transition-opacity duration-1000 -z-[51]"
        style={{ opacity: isGlassMode ? 0 : 1 }}
      ></div>

      {!isUnlocked && (
        <LoadingScreen 
            isReady={dataLoaded} 
            onUnlock={() => setIsUnlocked(true)} 
        />
      )}

      <LiquidCursor isLoading={!isUnlocked} />

      <DynamicIsland 
         isDark={isDark} 
         toggleTheme={toggleTheme} 
         isAdmin={isAdmin}
         setIsAdmin={setIsAdmin}
         openAdminModal={() => setIsModalOpen(true)}
         isGlassMode={isGlassMode}
         setIsGlassMode={setIsGlassMode}
         language={language}
         setLanguage={setLanguage}
      />

      <main className={`w-full transition-all duration-1000 ${isUnlocked ? 'opacity-100 filter-none' : 'opacity-0 filter blur-xl'}`}>
        {content && (
            <>
                <Hero 
                    content={content} 
                    isAdmin={isAdmin} 
                    onUpdate={handleContentUpdate}
                    isGlassMode={isGlassMode}
                    t={t.hero}
                />
                <About content={content} isAdmin={isAdmin} onUpdate={handleContentUpdate} t={t.about} />
                <Skills skills={skills} t={t.skills} />
                <Projects projects={projects} content={content} t={t.projects} />
            </>
        )}
      </main>

      {/* Footer */}
      {content && isUnlocked && (
          <footer className={`bg-white/50 dark:bg-gray-950/50 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 py-20 px-6 pb-32 ${isGlassMode ? '!bg-transparent !border-0 glass-panel !m-4 !mb-24 !rounded-[2rem]' : ''}`}>
            <ScrollReveal width="100%">
                <div className="max-w-4xl mx-auto flex flex-col items-center">
                  <h2 className="text-2xl font-semibold mb-8 text-gray-900 dark:text-white tracking-tight text-center">{t.footer.text}</h2>
                  
                  <div className="flex gap-4 mb-12">
                    <a href={`mailto:${content.email}`} className="magnetic p-4 rounded-full bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group">
                      <Mail size={24} className="text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
                    </a>
                    {content.linkedinUrl && (
                      <a href={content.linkedinUrl} target="_blank" rel="noopener noreferrer" className="magnetic p-4 rounded-full bg-gray-50 dark:bg-gray-900 hover:bg-[#0077b5]/10 transition-all duration-300 group">
                        <LinkedInIcon className="text-gray-600 dark:text-gray-400 group-hover:text-[#0077b5] w-6 h-6 transition-colors" />
                      </a>
                    )}
                    {content.instagramUrl && (
                      <a href={content.instagramUrl} target="_blank" rel="noopener noreferrer" className="magnetic p-4 rounded-full bg-gray-50 dark:bg-gray-900 hover:bg-pink-500/10 transition-all duration-300 group">
                        <Instagram className="text-gray-600 dark:text-gray-400 group-hover:text-pink-500 w-6 h-6 transition-colors" />
                      </a>
                    )}
                  </div>

                  <p className="text-sm text-gray-400 font-medium">
                    &copy; {new Date().getFullYear()} Ishan Krishna Verma. {t.footer.crafted} <span className="text-red-400">♥</span> in Dubai.
                  </p>
                </div>
            </ScrollReveal>
          </footer>
      )}

      <AdminModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onLoginSuccess={() => setIsAdmin(true)} 
      />
    </div>
  );
};

export default App;