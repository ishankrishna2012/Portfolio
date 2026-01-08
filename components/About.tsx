import React from 'react';
import { ContentData } from '../types';
import EditableText from './EditableText';
import ScrollReveal from './ScrollReveal';

interface Props {
  content: ContentData;
  isAdmin: boolean;
  onUpdate: (key: keyof ContentData, val: string) => Promise<void>;
  t: any;
}

const About: React.FC<Props> = ({ content, isAdmin, onUpdate, t }) => {
  return (
    <section id="about" className="py-24 px-6 md:px-12 bg-background transition-colors duration-300 border-t border-border scroll-mt-32">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
           <h2 className="text-sm font-semibold text-primary/60 tracking-wider uppercase mb-8">{t.header}</h2>
        </ScrollReveal>
        
        <ScrollReveal delay={0.1}>
            <div className="text-xl md:text-3xl text-muted-foreground leading-relaxed font-light mb-16">
              <EditableText
                value={content.aboutText}
                isAdmin={isAdmin}
                multiline
                contentKey="aboutText"
                onSave={(val) => onUpdate('aboutText', val)}
                label="About Biography"
              />
            </div>
        </ScrollReveal>
        
        {/* Unified Statistics Pill */}
        <div className="mt-8">
             <ScrollReveal delay={0.2} width="100%">
               <div className="bg-card text-card-foreground rounded-[2rem] border border-border shadow-lg flex flex-col md:flex-row md:items-stretch divide-y md:divide-y-0 md:divide-x divide-border overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
                 {[
                   { val: 'DPS', label: 'Delhi Private School' },
                   { val: '13', label: t.age },
                   { val: '3+', label: t.coding },
                   { val: '10+', label: t.live }
                 ].map((stat, i) => (
                   <div key={i} className="flex-1 py-8 px-4 flex flex-col items-center justify-center hover:bg-secondary/40 transition-colors duration-300 group cursor-default relative overflow-hidden">
                     {/* Hover Highlight Effect */}
                     <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-500" />
                     
                     <span className="relative z-10 block text-3xl md:text-4xl font-bold mb-2 group-hover:scale-105 group-hover:text-foreground transition-all duration-300">{stat.val}</span>
                     <span className="relative z-10 text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-70 group-hover:opacity-100 transition-opacity">{stat.label}</span>
                   </div>
                 ))}
               </div>
             </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default About;