import React, { useRef, useEffect } from 'react';
import { Project, ContentData } from '../types';
import GitHubStatsSection from './GitHubStats';
import { ArrowUpRight, FolderGit2 } from 'lucide-react';

interface Props {
  projects: Project[];
  content: ContentData;
  t: any;
}

const Projects: React.FC<Props> = ({ projects, content, t }) => {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Mouse Move Handler for Spotlight Effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    cardRefs.current.forEach((card) => {
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Update CSS variables for the spotlight effect
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  };

  // 3D Scroll Effect Logic
  useEffect(() => {
    const handleScroll = () => {
      const center = window.innerHeight / 2;
      
      cardRefs.current.forEach((ref) => {
        if (!ref) return;
        
        const rect = ref.getBoundingClientRect();
        const cardCenter = rect.top + rect.height / 2;
        const dist = cardCenter - center;
        const absDist = Math.abs(dist);
        
        // Calculate 3D values
        const normalizedDist = Math.min(absDist / (window.innerHeight * 0.8), 1);
        
        // Rotation & Depth
        const rotateX = (dist / center) * 15; 
        const translateZ = -350 * normalizedDist; 
        const translateY = dist * 0.05;
        const scale = 1 - (normalizedDist * 0.08);
        const opacity = 1 - Math.pow(normalizedDist, 4); 

        ref.style.transform = `perspective(1200px) translate3d(0, ${translateY}px, ${translateZ}px) rotateX(${-rotateX}deg) scale(${scale})`;
        ref.style.opacity = `${opacity}`;
        ref.style.filter = `brightness(${1 - normalizedDist * 0.3})`;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); 

    return () => window.removeEventListener('scroll', handleScroll);
  }, [projects]);

  return (
    <div className="relative bg-white dark:bg-black transition-colors duration-500">
      <section id="projects" className="py-32 px-6 md:px-12 relative z-10 scroll-mt-32 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          
          <div className="mb-20 text-center md:text-left">
            <h2 className="text-sm font-bold text-blue-600 dark:text-blue-500 uppercase tracking-widest mb-3">{t.archive}</h2>
            <h3 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white tracking-tight">{t.header}</h3>
          </div>

          <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 perspective-container group/grid" 
            style={{ perspective: '1200px' }}
          >
             {projects.map((project, index) => {
               return (
                 <div 
                    key={project.id}
                    ref={el => { cardRefs.current[index] = el; }}
                    className="project-card will-change-transform transition-transform duration-100 ease-linear transform-style-3d relative rounded-[2.5rem]"
                    style={{
                      // Default variables to prevent errors before JS execution
                      '--mouse-x': '0px',
                      '--mouse-y': '0px',
                    } as React.CSSProperties}
                 >
                   <a
                     href={project.githubLink}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="block relative h-[400px] md:h-[450px] w-full rounded-[2.5rem] group overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-900/10"
                   >
                     {/* --- SPOTLIGHT EFFECT LAYERS --- */}
                     
                     {/* 1. Border Glow Layer (Behind content, visible via inset padding or transparency) */}
                     {/* We use an absolute div that acts as the border source. */}
                     <div 
                       className="absolute inset-0 rounded-[2.5rem] z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                       style={{
                         background: `radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(59, 130, 246, 0.4), transparent 40%)` // Blue glow in dark/light
                       }}
                     />
                     {/* Dark Mode distinct border color override */}
                     <div 
                        className="absolute inset-0 rounded-[2.5rem] z-0 opacity-0 group-hover:dark:opacity-100 transition-opacity duration-500 hidden dark:block"
                        style={{
                            background: `radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(255, 255, 255, 0.3), transparent 40%)`
                        }}
                     />


                     {/* 2. Main Background (Inset by 1px to create the border effect) */}
                     <div className="absolute inset-[1px] bg-gray-50 dark:bg-[#0a0a0a] rounded-[2.4rem] z-10 transition-colors duration-500" />
                     
                     {/* 3. Inner Spotlight Shine (Surface reflection) */}
                     <div 
                       className="absolute inset-[1px] rounded-[2.4rem] z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                       style={{
                         background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(59, 130, 246, 0.05), transparent 40%)` // Subtle blue tint
                       }}
                     />
                     <div 
                       className="absolute inset-[1px] rounded-[2.4rem] z-20 opacity-0 group-hover:dark:opacity-100 transition-opacity duration-500 pointer-events-none hidden dark:block"
                       style={{
                         background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255, 255, 255, 0.05), transparent 40%)` // White tint in dark mode
                       }}
                     />

                     {/* --- CARD CONTENT --- */}
                     <div className="relative z-30 p-8 md:p-10 flex flex-col h-full">
                        
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                           <div className="p-4 rounded-2xl bg-white dark:bg-white/10 shadow-sm border border-gray-100 dark:border-white/5 text-gray-900 dark:text-white">
                              <FolderGit2 size={24} />
                           </div>
                           <div className="px-4 py-1.5 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/5 text-xs font-semibold text-gray-600 dark:text-gray-300">
                              {project.techStack[0]}
                           </div>
                        </div>

                        {/* Body */}
                        <div className="mt-auto">
                          <h4 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 group-hover:translate-x-1 transition-transform duration-300">
                            {project.title}
                          </h4>
                          <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed mb-8 line-clamp-3">
                            {project.description}
                          </p>
                          
                          {/* Footer */}
                          <div className="flex items-center justify-between border-t border-gray-200/50 dark:border-white/10 pt-6">
                             <div className="flex flex-wrap gap-2">
                                {project.techStack.slice(0, 3).map(t => (
                                  <span key={t} className="text-xs font-medium text-gray-400 dark:text-gray-500 px-2 py-1 rounded-md bg-gray-100 dark:bg-white/5">
                                    #{t}
                                  </span>
                                ))}
                             </div>
                             <span className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                {t.view} <ArrowUpRight size={16} />
                             </span>
                          </div>
                        </div>
                     </div>
                   </a>
                 </div>
               );
             })}
          </div>

        </div>
      </section>

      {/* GitHub Stats Stats Section */}
      <section className="bg-white dark:bg-black py-24 px-6 border-t border-gray-100 dark:border-gray-900/50 relative z-20 transition-colors duration-500">
          <div className="max-w-5xl mx-auto">
             <GitHubStatsSection username={content.githubUsername} />
          </div>
      </section>
    </div>
  );
};

export default Projects;