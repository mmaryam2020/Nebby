
import React from 'react';

interface ProtocolCardProps {
    title: string;
    icon: string;
    color: 'blue' | 'indigo';
    items: string[];
}

const RoutineItem: React.FC<{ text: string; color: string }> = ({ text, color }) => {
    const [isDone, setIsDone] = React.useState(false);

    return (
        <div
            className={`flex items-center gap-3 py-0.5 group cursor-pointer ${isDone ? 'opacity-30' : ''}`}
            onClick={() => setIsDone(!isDone)}
        >
            <div className={`w-3.5 h-3.5 rounded border border-white/20 group-hover:border-${color}-400 transition-colors flex items-center justify-center shrink-0`}>
                {isDone && <span className="material-symbols-outlined text-[10px] text-white">check</span>}
            </div>
            <span className="text-xs font-medium text-slate-300">{text}</span>
        </div>
    );
};


export const ProtocolCard: React.FC<ProtocolCardProps> = ({ title, icon, color, items }) => {
    const borderColor = color === 'blue' ? 'border-l-blue-400' : 'border-l-indigo-500';
    const textColor = color === 'blue' ? 'text-blue-200' : 'text-indigo-300';

    return (
        <div className={`glass-card rounded-2xl p-3 border-l-2 ${borderColor}`}>
            <div className="flex justify-between items-center mb-2">
                <h3 className={`text-[10px] font-bold ${textColor} flex items-center gap-1.5 uppercase tracking-widest`}>
                    <span className="material-symbols-outlined text-base">{icon}</span>
                    {title}
                </h3>
            </div>
            <div className="space-y-1.5">
                {items.map((item, index) => (
                    <RoutineItem key={index} text={item} color={color} />
                ))}
            </div>
        </div>
    );
};
