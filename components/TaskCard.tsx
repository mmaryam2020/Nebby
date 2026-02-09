
import React, { useState } from 'react';
import { Task } from '../types';

interface EnergyDisplayProps {
    level: number;
}

const EnergyDisplay: React.FC<EnergyDisplayProps> = ({ level }) => (
    <div className="flex items-center gap-1" title={`Thruster Output: ${level}/5`}>
        {Array.from({ length: 5 }).map((_, i) => (
            <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${i < level ? 'bg-purple-400' : 'bg-white/10'}`}
            ></div>
        ))}
    </div>
);

interface TaskCardProps {
    task: Task;
    onComplete: (id: number) => void;
    onDelegate: (id: number) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete, onDelegate }) => {
    const [isCompleting, setIsCompleting] = useState(false);

    const handleComplete = () => {
        setIsCompleting(true);
        onComplete(task.id);
    };

    const handleDelegate = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card's onClick from firing
        onDelegate(task.id);
    };

    const icon = task.type === 'quietNebula' ? 'shield' : 'rocket_launch';

    return (
        <div
            className={`glass-card p-3 rounded-2xl flex flex-col gap-2 stardust-entry cursor-pointer active:scale-95 transition-transform ${isCompleting ? 'blackhole-effect' : ''}`}
            onClick={handleComplete}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-purple-400 shrink-0">
                        <span className="material-symbols-outlined text-lg">{icon}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-100">{task.text}</span>
                </div>
                <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0"></div>
            </div>
            <div className="flex justify-between items-center pl-11">
                {task.energyLevel && <EnergyDisplay level={task.energyLevel} />}
                <button
                    onClick={handleDelegate}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:bg-white/10 hover:text-white transition-colors"
                    title="Delegate to Cargo Hold"
                >
                    <span className="material-symbols-outlined text-base">move_down</span>
                </button>
            </div>
        </div>
    );
};
