
import React, { useMemo } from 'react';
import { CompletedTask } from '../types';

interface StarMapViewProps {
    completedTasks: CompletedTask[];
}

const getStarStyle = (star: CompletedTask) => {
    let color = '#a78bfa'; // Quiet Nebula purple
    if (star.type === 'supernova') {
        color = '#fcd34d'; // Supernova yellow
    } else if (star.type === 'default') {
        color = 'rgba(255, 255, 255, 0.4)'; // Faint white for default
    }

    return {
        left: `${star.x}%`,
        top: `${star.y}%`,
        '--star-color': color,
    } as React.CSSProperties;
};

export const StarMapView: React.FC<StarMapViewProps> = ({ completedTasks }) => {
    // Group tasks by expeditionId to form constellations
    const constellations = useMemo(() => {
        const groups: Record<number, CompletedTask[]> = {};
        completedTasks.forEach(task => {
            if (task.expeditionId) {
                if (!groups[task.expeditionId]) {
                    groups[task.expeditionId] = [];
                }
                groups[task.expeditionId].push(task);
            }
        });
        // Only form constellations if there are at least 2 stars
        return Object.values(groups).filter(group => group.length > 1);
    }, [completedTasks]);

    return (
        <div className="stardust-entry">
             <div className="text-center mb-6">
                 <h1 className="text-2xl font-bold tracking-tight">Nebula Graph</h1>
                 <p className="text-sm text-slate-400">Stars align as you complete expeditions.</p>
            </div>
            <div className="glass-card rounded-3xl w-full aspect-square relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-slate-900/50"></div>
                
                {/* Constellation Layer - Behind Stars */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="constellationGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                            <stop offset="50%" stopColor="rgba(255,255,255,0.4)" />
                            <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
                        </linearGradient>
                    </defs>
                    {constellations.map((group, i) => {
                         const points = group.map(star => `${star.x},${star.y}`).join(' ');
                         return (
                            <polyline 
                                key={`constellation-${i}`} 
                                points={points} 
                                fill="none" 
                                stroke="rgba(255, 255, 255, 0.2)" 
                                strokeWidth="0.4" 
                                strokeDasharray="1 1"
                                strokeLinecap="round"
                                className="animate-pulse"
                            />
                         );
                    })}
                </svg>

                {completedTasks.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-slate-500 text-xs uppercase tracking-widest">Complete tasks to create stars</p>
                    </div>
                )}
                {completedTasks.map((star, index) => (
                    <div
                        key={star.id}
                        className={`star ${star.type === 'default' ? 'star-default' : ''} z-10`}
                        title={star.expeditionTitle ? `Constellation: ${star.expeditionTitle}` : 'Lone Star'}
                        style={{
                            ...getStarStyle(star),
                            animationDelay: `${index * 0.1}s`,
                        }}
                    ></div>
                ))}
            </div>
        </div>
    );
};
