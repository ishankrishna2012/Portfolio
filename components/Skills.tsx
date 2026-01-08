import React from 'react';
import { Skill } from '../types';
import ScrollReveal from './ScrollReveal';

interface Props {
  skills: Skill[];
  t: any;
}

const Skills: React.FC<Props> = ({ skills, t }) => {
  // Sort skills by proficiency
  const sortedSkills = [...skills].sort((a, b) => b.level - a.level);

  return (
    <section id="skills" className="py-32 px-6 md:px-12 bg-secondary/20 relative transition-colors duration-300 scroll-mt-32">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal width="100%">
            <h2 className="text-4xl font-bold text-foreground mb-16 text-center tracking-tight">{t.header}</h2>
        </ScrollReveal>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-10">
          {sortedSkills.map((skill, index) => (
            <ScrollReveal key={skill.name} delay={index * 0.1} width="100%">
                <div className="group">
                  <div className="flex justify-between items-end mb-3">
                    <span className="font-semibold text-foreground text-lg">{skill.name}</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{skill.category}</span>
                  </div>
                  
                  {/* Shadcn-esque Progress Bar */}
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-1000 ease-out group-hover:bg-primary/80 relative overflow-hidden"
                      style={{ width: `${skill.level}%` }}
                    >
                        {/* Shimmer effect */}
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                    </div>
                  </div>
                </div>
            </ScrollReveal>
          ))}
        </div>

        <div className="mt-20">
             <ScrollReveal width="100%" delay={0.4}>
                 <p className="text-center text-muted-foreground text-sm mb-6 uppercase tracking-widest font-medium">{t.sub}</p>
                 <div className="flex flex-wrap justify-center gap-3">
                   {['HTML5', 'CSS3', 'PostgreSQL', 'npm', 'Git', 'Firebase', 'Vercel', 'Figma'].map((tech, i) => (
                     <span key={tech} className="px-5 py-2.5 bg-card text-card-foreground border border-border rounded-full text-sm font-medium hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-default">
                       {tech}
                     </span>
                   ))}
                 </div>
             </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default Skills;