import React, { useEffect, useState, useMemo, useRef } from 'react';
import { fetchGitHubStats } from '../services/githubService';
import { GitHubStats } from '../types';
import { Github, Star, GitCommit, Book, Calendar, Flame, Activity } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface Props {
  username: string;
}

// --- 1. Tooltip Component ---
const ChartTooltip = ({ x, y, value, label, visible }: { x: number, y: number, value: number, label: string, visible: boolean }) => {
    return (
        <div 
            className={`
                fixed z-50 pointer-events-none transition-opacity duration-200 ease-out
                ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
            `}
            style={{ 
                left: x, 
                top: y - 10,
                transform: `translate(-50%, -100%) ${visible ? 'translateY(0)' : 'translateY(8px)'}`
            }}
        >
            <div className="bg-black/80 dark:bg-white/90 backdrop-blur-md text-white dark:text-black text-xs px-3 py-2 rounded-lg shadow-xl border border-white/10 flex flex-col items-center min-w-[80px]">
                <span className="font-bold text-lg leading-none mb-1">{value}</span>
                <span className="text-[10px] opacity-70 uppercase tracking-wide">{label}</span>
                {/* Arrow */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-black/80 dark:border-t-white/90"></div>
            </div>
        </div>
    );
};

// --- 2. Interactive Bar Chart (Apple Health Style) ---
const InteractiveActivityChart: React.FC<{ contributionMap: Record<string, number> }> = ({ contributionMap }) => {
    // Show last 30 days
    const data = useMemo(() => {
        const days = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const count = contributionMap[dateStr] || 0;
            days.push({
                date: d,
                dateStr,
                label: d.toLocaleDateString('en-US', { weekday: 'short' }), // Mon, Tue
                fullDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), // Jan 12
                count
            });
        }
        return days;
    }, [contributionMap]);

    const maxVal = Math.max(...data.map(d => d.count), 5); // Minimum scale of 5
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div 
            className="h-48 w-full flex flex-col justify-end relative group/chart cursor-crosshair select-none"
            ref={containerRef}
            onMouseLeave={() => setHoverIndex(null)}
        >
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                {[1, 0.5, 0].map((t, i) => (
                     <div key={i} className="border-t border-dashed border-gray-400 w-full h-0 relative">
                        {i < 2 && <span className="absolute -top-3 right-0 text-[9px] text-gray-500">{Math.round(maxVal * t)}</span>}
                     </div>
                ))}
            </div>

            <div className="flex items-end justify-between h-full gap-1 pt-4 pb-6 relative z-10">
                {data.map((day, i) => {
                    const height = Math.max((day.count / maxVal) * 100, 4); // Min height 4%
                    const isHovered = hoverIndex === i;
                    const isDimmed = hoverIndex !== null && hoverIndex !== i;

                    return (
                        <div 
                            key={i}
                            className="flex-1 h-full flex items-end justify-center relative group/bar"
                            onMouseEnter={(e) => {
                                setHoverIndex(i);
                                const rect = e.currentTarget.getBoundingClientRect();
                                setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
                            }}
                        >
                            <div 
                                className={`
                                    w-full max-w-[12px] min-w-[4px] rounded-t-sm md:rounded-t-md transition-all duration-300 ease-out relative
                                    ${isHovered ? 'bg-blue-500 scale-y-110 shadow-[0_0_15px_rgba(59,130,246,0.5)] z-20' : 'bg-gray-300 dark:bg-gray-700'}
                                    ${isDimmed ? 'opacity-30' : 'opacity-100'}
                                    ${day.count > 0 && !isHovered && !isDimmed ? 'bg-blue-400/80 dark:bg-blue-600/80' : ''}
                                `}
                                style={{ height: `${height}%` }}
                            />
                            
                            {/* X Axis Label (Every 5th day) */}
                            {i % 5 === 0 && (
                                <div className="absolute -bottom-6 text-[9px] font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                    {day.fullDate}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {/* Render Tooltip via Portal or Fixed Position */}
            <ChartTooltip 
                x={tooltipPos.x} 
                y={tooltipPos.y} 
                value={hoverIndex !== null ? data[hoverIndex].count : 0} 
                label={hoverIndex !== null ? data[hoverIndex].fullDate : ''} 
                visible={hoverIndex !== null} 
            />
        </div>
    );
};

// --- 3. Improved Heatmap (The Grid) ---
const ContributionGraph: React.FC<{ contributionMap: Record<string, number> }> = ({ contributionMap }) => {
    const [hoveredData, setHoveredData] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

    // Generate last 365 days
    const weeks = useMemo(() => {
        const totalDays = 364;
        const today = new Date();
        const weeksArray = [];
        let currentWeek = [];

        for (let i = totalDays; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const count = contributionMap[dateStr] || 0;
            
            let level = 0;
            if (count > 0) level = 1;
            if (count > 3) level = 2;
            if (count > 6) level = 3;
            if (count > 10) level = 4;

            currentWeek.push({ date: dateStr, count, level });

            if (d.getDay() === 6 || i === 0) {
                if (weeksArray.length === 0 && currentWeek.length < 7) {
                     const fill = 7 - currentWeek.length;
                     for(let k=0; k<fill; k++) currentWeek.unshift(null);
                }
                weeksArray.push(currentWeek);
                currentWeek = [];
            }
        }
        return weeksArray;
    }, [contributionMap]);

    return (
        <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
            <div className="min-w-[600px] flex flex-col gap-2">
                <div className="flex gap-[3px]">
                    {weeks.map((week, wIndex) => (
                        <div key={wIndex} className="flex flex-col gap-[3px]">
                            {week.map((day, dIndex) => {
                                if (!day) return <div key={dIndex} className="w-2.5 h-2.5" />;
                                return (
                                    <div
                                        key={day.date}
                                        onMouseEnter={(e) => {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            setHoveredData({
                                                date: day.date,
                                                count: day.count,
                                                x: rect.left + rect.width / 2,
                                                y: rect.top
                                            });
                                        }}
                                        onMouseLeave={() => setHoveredData(null)}
                                        className={`
                                            w-2.5 h-2.5 rounded-[2px] transition-all duration-200 cursor-none hover:scale-125 hover:z-10
                                            ${day.level === 0 ? 'bg-black/5 dark:bg-white/5' : ''}
                                            ${day.level === 1 ? 'bg-blue-200 dark:bg-blue-900/60' : ''}
                                            ${day.level === 2 ? 'bg-blue-300 dark:bg-blue-700' : ''}
                                            ${day.level === 3 ? 'bg-blue-500 dark:bg-blue-500' : ''}
                                            ${day.level === 4 ? 'bg-blue-600 dark:bg-blue-400 shadow-[0_0_5px_currentColor]' : ''}
                                        `}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Heatmap Tooltip */}
            <ChartTooltip 
                x={hoveredData?.x || 0} 
                y={hoveredData?.y || 0} 
                value={hoveredData?.count || 0} 
                label={hoveredData ? new Date(hoveredData.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''} 
                visible={!!hoveredData} 
            />
        </div>
    );
};

const GitHubStatsSection: React.FC<Props> = ({ username }) => {
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!username) return;
      const data = await fetchGitHubStats(username);
      setStats(data);
      setLoading(false);
    };
    loadStats();
  }, [username]);

  if (loading || !stats) return null;

  return (
    <div className="w-full py-8">
      <ScrollReveal width="100%">
          <div className="glass-panel text-card-foreground rounded-[2.5rem] p-6 md:p-10 shadow-sm relative overflow-hidden group border border-white/40 dark:border-white/10">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 bg-black dark:bg-white text-white dark:text-black rounded-2xl shadow-xl transform transition-transform group-hover:rotate-12">
                        <Github size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold leading-none tracking-tight">Code Activity</h3>
                        <p className="text-sm text-muted-foreground mt-1">Real-time GitHub Analysis</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                
                {/* 1. Key Metrics Cards */}
                <div className="lg:col-span-1 grid grid-cols-2 gap-4">
                     <div className="bg-white/60 dark:bg-white/5 p-5 rounded-3xl border border-white/40 dark:border-white/5 backdrop-blur-md flex flex-col justify-between h-32 magnetic hover:scale-105 transition-transform duration-300">
                        <div className="text-muted-foreground"><Book size={18} /></div>
                        <div>
                            <div className="text-2xl font-bold">{stats.repos}</div>
                            <div className="text-[10px] uppercase tracking-wider font-semibold opacity-60">Repositories</div>
                        </div>
                    </div>
                    <div className="bg-white/60 dark:bg-white/5 p-5 rounded-3xl border border-white/40 dark:border-white/5 backdrop-blur-md flex flex-col justify-between h-32 magnetic hover:scale-105 transition-transform duration-300">
                        <div className="text-yellow-500"><Star size={18} /></div>
                        <div>
                            <div className="text-2xl font-bold">{stats.totalStars}</div>
                            <div className="text-[10px] uppercase tracking-wider font-semibold opacity-60">Total Stars</div>
                        </div>
                    </div>
                    <div className="bg-white/60 dark:bg-white/5 p-5 rounded-3xl border border-white/40 dark:border-white/5 backdrop-blur-md flex flex-col justify-between h-32 magnetic hover:scale-105 transition-transform duration-300">
                        <div className="text-blue-500"><GitCommit size={18} /></div>
                        <div>
                            <div className="text-2xl font-bold">{stats.totalCommits}</div>
                            <div className="text-[10px] uppercase tracking-wider font-semibold opacity-60">Total Commits</div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-5 rounded-3xl border border-blue-400/50 backdrop-blur-md flex flex-col justify-between h-32 magnetic shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform duration-300">
                        <div><Flame size={18} /></div>
                        <div>
                            <div className="text-2xl font-bold">Active</div>
                            <div className="text-[10px] uppercase tracking-wider font-semibold opacity-80">Current Streak</div>
                        </div>
                    </div>
                </div>

                {/* 2. Charts Area */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Interactive 30 Day Activity Chart */}
                    <div className="bg-white/40 dark:bg-black/20 rounded-3xl p-6 border border-white/30 dark:border-white/5 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                <Activity size={12} /> Last 30 Days
                            </div>
                            <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">Daily Volume</span>
                        </div>
                        
                        <InteractiveActivityChart contributionMap={stats.contributionMap} />
                    </div>

                    {/* Heatmap */}
                    <div className="bg-white/40 dark:bg-black/20 rounded-3xl p-6 border border-white/30 dark:border-white/5 overflow-hidden backdrop-blur-sm">
                         <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            <Calendar size={12} /> Yearly Contributions
                        </div>
                        <ContributionGraph contributionMap={stats.contributionMap} />
                    </div>
                </div>
            </div>

          </div>
      </ScrollReveal>
    </div>
  );
};

export default GitHubStatsSection;